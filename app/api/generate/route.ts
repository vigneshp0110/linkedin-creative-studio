import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import {
  buildCopySystemPrompt,
  buildCopyUserPrompt,
  buildImagePrompt,
} from '@/lib/prompt-builder'
import { AdCopy, GenerateRequest } from '@/lib/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const body: GenerateRequest = await req.json()

  // Step 1: Generate ad copy via Claude Sonnet 4.6
  const copyMessage = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: buildCopySystemPrompt(),
    messages: [
      { role: 'user', content: buildCopyUserPrompt(body) },
    ],
  })

  const copyText = copyMessage.content[0].type === 'text' ? copyMessage.content[0].text : ''
  const copyJsonMatch = copyText.match(/\{[\s\S]*\}/)
  const copy: AdCopy = copyJsonMatch ? JSON.parse(copyJsonMatch[0]) : {}

  // Step 2: Generate square + landscape images in parallel via gpt-image-2
  const [squareRes, landscapeRes] = await Promise.all([
    openai.images.generate({
      model: 'gpt-image-2',
      prompt: buildImagePrompt(body, copy, 'square'),
      n: 1,
      size: '1024x1024',
    }),
    openai.images.generate({
      model: 'gpt-image-2',
      prompt: buildImagePrompt(body, copy, 'landscape'),
      n: 1,
      size: '1536x1024',
    }),
  ])

  const toDataUrl = (b64: string | null | undefined) =>
    b64 ? `data:image/png;base64,${b64}` : null

  const squareB64 = squareRes.data?.[0]?.b64_json
  const landscapeB64 = landscapeRes.data?.[0]?.b64_json

  return NextResponse.json({
    copy,
    squareImage: toDataUrl(squareB64),
    landscapeImage: toDataUrl(landscapeB64),
  })
}
