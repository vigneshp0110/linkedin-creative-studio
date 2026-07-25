export const dynamic = 'force-dynamic'
export const maxDuration = 120

import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import sharp from 'sharp'
import { buildRefinedImagePrompt } from '@/lib/prompt-builder'
import type { ImagesResponse } from 'openai/resources/images'
import { AdCopy, GenerateRequest } from '@/lib/types'

interface RefineBody extends GenerateRequest {
  copy: AdCopy
  changeHistory: string[]
}

export async function POST(req: NextRequest) {
  try {
    const { default: OpenAI, toFile } = await import('openai')
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    // Load + pad logo
    let logoFile: Awaited<ReturnType<typeof toFile>> | null = null
    try {
      const logoPath = path.join(process.cwd(), 'public/logos/logo-new.png')
      const logoBuf = fs.readFileSync(logoPath)
      const squareLogoBuf = await sharp(logoBuf)
        .resize(1024, 1024, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer()
      logoFile = await toFile(squareLogoBuf, 'logo.png', { type: 'image/png' })
      console.log('[refine] logo ready')
    } catch (logoErr) {
      console.error('[refine] logo prep failed, falling back to images.generate:', logoErr)
    }

    const body: RefineBody = await req.json()
    const { copy, changeHistory, ...generateReq } = body

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
          console.log('[refine] images.edit succeeded for', size)
          return res
        } catch (editErr) {
          console.error('[refine] images.edit failed, falling back:', editErr)
        }
      }
      const res = await openai.images.generate({
        model: 'gpt-image-2',
        prompt,
        n: 1,
        size,
      } as Parameters<typeof openai.images.generate>[0]) as ImagesResponse
      console.log('[refine] images.generate succeeded for', size)
      return res
    }

    const imageFormat = (generateReq as GenerateRequest).imageFormat ?? 'square'
    const toDataUrl = (b64: string | null | undefined) =>
      b64 ? `data:image/png;base64,${b64}` : null

    let squareImage: string | null = null
    let landscapeImage: string | null = null

    if (imageFormat === 'square') {
      const res = await generateImage(
        buildRefinedImagePrompt(generateReq as GenerateRequest, copy, 'square', changeHistory),
        '1024x1024'
      )
      squareImage = toDataUrl(res.data?.[0]?.b64_json)
    } else {
      const res = await generateImage(
        buildRefinedImagePrompt(generateReq as GenerateRequest, copy, 'landscape', changeHistory),
        '1536x1024'
      )
      landscapeImage = toDataUrl(res.data?.[0]?.b64_json)
    }

    return NextResponse.json({ squareImage, landscapeImage })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[refine] unhandled error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
