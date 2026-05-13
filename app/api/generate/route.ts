export const dynamic = 'force-dynamic'
export const maxDuration = 120

import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import sharp from 'sharp'
import {
  buildCopySystemPrompt,
  buildCopyUserPrompt,
  buildImagePrompt,
} from '@/lib/prompt-builder'
import type { ImagesResponse } from 'openai/resources/images'
import { AdCopy, GenerateRequest } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const [{ default: OpenAI, toFile }, { default: Anthropic }] = await Promise.all([
      import('openai'),
      import('@anthropic-ai/sdk'),
    ])
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    // Attempt to load the Everstage logo and pad to 1024×1024 square for images.edit.
    // If anything fails (file not found, sharp error, API rejection) we fall back to images.generate.
    let logoFile: Awaited<ReturnType<typeof toFile>> | null = null
    try {
      const logoPath = path.join(process.cwd(), 'public/logos/logo-full.png')
      const logoBuf = fs.readFileSync(logoPath)
      console.log('[generate] logo loaded from disk, size:', logoBuf.length)
      const squareLogoBuf = await sharp(logoBuf)
        .resize(1024, 1024, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer()
      console.log('[generate] logo padded to square, size:', squareLogoBuf.length)
      logoFile = await toFile(squareLogoBuf, 'logo.png', { type: 'image/png' })
      console.log('[generate] logo converted to uploadable file')
    } catch (logoErr) {
      console.error('[generate] logo prep failed, will use images.generate fallback:', logoErr)
    }

    const body: GenerateRequest = await req.json()

    // --- Copy generation ---
    let copy: AdCopy
    if (body.providedCopy) {
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

    // --- Image generation ---
    // Use images.edit (with logo reference) when available; fall back to images.generate
    async function generateImage(
      prompt: string,
      size: '1024x1024' | '1536x1024'
    ): Promise<ImagesResponse> {
      if (logoFile) {
        try {
          const res = await (openai.images.edit({
            model: 'gpt-image-2',
            image: logoFile,
            prompt,
            n: 1,
            size,
          } as Parameters<typeof openai.images.edit>[0]) as Promise<ImagesResponse>)
          console.log('[generate] images.edit succeeded for size', size)
          return res
        } catch (editErr) {
          console.error('[generate] images.edit failed, falling back to images.generate:', editErr)
        }
      }
      // Fallback: generate without logo reference
      const res = await openai.images.generate({
        model: 'gpt-image-2',
        prompt,
        n: 1,
        size,
        response_format: 'b64_json',
      } as Parameters<typeof openai.images.generate>[0]) as ImagesResponse
      console.log('[generate] images.generate succeeded for size', size)
      return res
    }

    const [squareRes, landscapeRes] = await Promise.all([
      generateImage(buildImagePrompt(body, copy, 'square'), '1024x1024'),
      generateImage(buildImagePrompt(body, copy, 'landscape'), '1536x1024'),
    ])

    const toDataUrl = (b64: string | null | undefined) =>
      b64 ? `data:image/png;base64,${b64}` : null

    return NextResponse.json({
      copy,
      squareImage: toDataUrl(squareRes.data?.[0]?.b64_json),
      landscapeImage: toDataUrl(landscapeRes.data?.[0]?.b64_json),
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : undefined
    console.error('[generate] unhandled error:', message, stack)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
