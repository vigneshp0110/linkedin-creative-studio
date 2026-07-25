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

async function loadLogo(
  toFile: (source: unknown, name: string, options: { type: string }) => Promise<unknown>
): Promise<unknown | null> {
  const logoPath = path.join(process.cwd(), 'public/logos/logo-new.png')

  try {
    const logoBuf = fs.readFileSync(logoPath)
    const squareBuf = await sharp(logoBuf)
      .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()
    const file = await toFile(squareBuf, 'logo.png', { type: 'image/png' })
    console.log('[generate] logo ready')
    return file
  } catch (err) {
    console.error('[generate] logo prep failed, will use images.generate fallback:', err)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const [{ default: OpenAI, toFile }, { default: Anthropic }] = await Promise.all([
      import('openai'),
      import('@anthropic-ai/sdk'),
    ])
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const body: GenerateRequest = await req.json()

    // Parallelize logo loading and copy generation — saves 2-5s
    const copyPromise: Promise<AdCopy> = body.providedCopy
      ? Promise.resolve(body.providedCopy)
      : anthropic.messages
          .create({
            model: 'claude-sonnet-4-6',
            max_tokens: 1024,
            system: buildCopySystemPrompt(),
            messages: [{ role: 'user', content: buildCopyUserPrompt(body) }],
          })
          .then((msg) => {
            const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
            const match = text.match(/\{[\s\S]*\}/)
            return match ? JSON.parse(match[0]) : {}
          })

    const logoPromise = loadLogo(toFile as Parameters<typeof loadLogo>[0])

    const [copy, logoFile] = await Promise.all([copyPromise, logoPromise])

    // --- Image generation ---
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
      const res = (await openai.images.generate({
        model: 'gpt-image-2',
        prompt,
        n: 1,
        size,
      } as Parameters<typeof openai.images.generate>[0])) as ImagesResponse
      console.log('[generate] images.generate succeeded for size', size)
      return res
    }

    const imageFormat = body.imageFormat ?? 'square'
    const toDataUrl = (b64: string | null | undefined) =>
      b64 ? `data:image/png;base64,${b64}` : null

    let squareImage: string | null = null
    let landscapeImage: string | null = null

    if (imageFormat === 'square') {
      const res = await generateImage(buildImagePrompt(body, copy, 'square'), '1024x1024')
      squareImage = toDataUrl(res.data?.[0]?.b64_json)
    } else {
      const res = await generateImage(buildImagePrompt(body, copy, 'landscape'), '1536x1024')
      landscapeImage = toDataUrl(res.data?.[0]?.b64_json)
    }

    return NextResponse.json({ copy, squareImage, landscapeImage })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : undefined
    console.error('[generate] unhandled error:', message, stack)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
