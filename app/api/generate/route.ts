export const dynamic = 'force-dynamic'
export const maxDuration = 120

import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import {
  buildCopySystemPrompt,
  buildCopyUserPrompt,
  buildImagePrompt,
} from '@/lib/prompt-builder'
import type { ImagesResponse } from 'openai/resources/images'
import { AdCopy, GenerateRequest } from '@/lib/types'

export async function POST(req: NextRequest) {
  const [{ default: OpenAI, toFile }, { default: Anthropic }] = await Promise.all([
    import('openai'),
    import('@anthropic-ai/sdk'),
  ])
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  // Load the Everstage logo to pass as a reference image
  const logoPath = path.join(process.cwd(), 'public/logos/logo-full.png')
  const logoBuf = fs.readFileSync(logoPath)
  const logoFile = await toFile(logoBuf, 'logo.png', { type: 'image/png' })

  const body: GenerateRequest = await req.json()

  let copy: AdCopy
  if (body.providedCopy) {
    // Skip Claude — use the caller-supplied copy directly
    copy = body.providedCopy
  } else {
    const copyMessage = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: buildCopySystemPrompt(),
      messages: [{ role: 'user', content: buildCopyUserPrompt(body) }],
    })
    const copyText = copyMessage.content[0].type === 'text' ? copyMessage.content[0].text : ''
    const copyJsonMatch = copyText.match(/\{[\s\S]*\}/)
    copy = copyJsonMatch ? JSON.parse(copyJsonMatch[0]) : {}
  }

  const [squareRes, landscapeRes] = await Promise.all([
    openai.images.edit({
      model: 'gpt-image-2',
      image: logoFile,
      prompt: buildImagePrompt(body, copy, 'square'),
      n: 1,
      size: '1024x1024',
    } as Parameters<typeof openai.images.edit>[0]) as Promise<ImagesResponse>,
    openai.images.edit({
      model: 'gpt-image-2',
      image: logoFile,
      prompt: buildImagePrompt(body, copy, 'landscape'),
      n: 1,
      size: '1536x1024',
    } as Parameters<typeof openai.images.edit>[0]) as Promise<ImagesResponse>,
  ])

  const toDataUrl = (b64: string | null | undefined) =>
    b64 ? `data:image/png;base64,${b64}` : null

  return NextResponse.json({
    copy,
    squareImage: toDataUrl(squareRes.data?.[0]?.b64_json),
    landscapeImage: toDataUrl(landscapeRes.data?.[0]?.b64_json),
  })
}
