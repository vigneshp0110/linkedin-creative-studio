export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import {
  buildCopySystemPrompt,
  buildCopyUserPrompt,
  buildImagePrompt,
} from '@/lib/prompt-builder'
import { AdCopy, GenerateRequest } from '@/lib/types'

export async function POST(req: NextRequest) {
  const [{ default: OpenAI }, { default: Anthropic }] = await Promise.all([
    import('openai'),
    import('@anthropic-ai/sdk'),
  ])
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const body: GenerateRequest = await req.json()

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

  return NextResponse.json({
    copy,
    squareImage: toDataUrl(squareRes.data?.[0]?.b64_json),
    landscapeImage: toDataUrl(landscapeRes.data?.[0]?.b64_json),
  })
}
