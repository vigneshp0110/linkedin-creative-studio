export const dynamic = 'force-dynamic'
export const maxDuration = 120

import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import sharp from 'sharp'
import type { ImagesResponse } from 'openai/resources/images'
import { BrandTheme } from '@/lib/types'
import {
  buildEducationalDirectionsSystemPrompt,
  buildEducationalDirectionsUserPrompt,
  buildEducationalImagePrompt,
} from '@/lib/prompt-builder'

export async function POST(req: NextRequest) {
  const [{ default: OpenAI, toFile }, { default: Anthropic }] = await Promise.all([
    import('openai'),
    import('@anthropic-ai/sdk'),
  ])
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const body = await req.json()
  const { guideTitle, bodyCopy, cta, format = 'square', visualDirections } = body
  const brandTheme: BrandTheme = body.brandTheme ?? 'classic'
  const isNewBrand = brandTheme === 'new'
  const logoFileName = isNewBrand ? 'logo-new.png' : 'logo-full.png'

  let logoUploadable: Awaited<ReturnType<typeof toFile>> | null = null
  try {
    const logoPath = path.join(process.cwd(), 'public/logos', logoFileName)
    const logoBuf = fs.readFileSync(logoPath)
    const squareBuf = await sharp(logoBuf)
      .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()
    logoUploadable = await toFile(squareBuf, 'logo.png', { type: 'image/png' })
    console.log('[educational] logo ready:', logoFileName)
  } catch (e) {
    console.error('[educational] logo prep failed, will use images.generate:', e)
  }

  async function generateImage(prompt: string, size: '1024x1024' | '1536x1024'): Promise<string | null> {
    try {
      if (logoUploadable) {
        const res = await (openai.images.edit({
          model: 'gpt-image-2',
          image: logoUploadable,
          prompt,
          n: 1,
          size,
        } as Parameters<typeof openai.images.edit>[0]) as Promise<ImagesResponse>)
        return res.data?.[0]?.b64_json ? `data:image/png;base64,${res.data[0].b64_json}` : null
      }
    } catch (e) {
      console.error('[educational] images.edit failed, falling back:', e)
    }
    const res = await openai.images.generate({
      model: 'gpt-image-2',
      prompt,
      n: 1,
      size,
    } as Parameters<typeof openai.images.generate>[0]) as ImagesResponse
    return res.data?.[0]?.b64_json ? `data:image/png;base64,${res.data[0].b64_json}` : null
  }

  if (format === 'landscape' && visualDirections?.length) {
    const images = await Promise.all(
      visualDirections.map((dir: { id: string; name: string; description: string }) =>
        generateImage(
          buildEducationalImagePrompt({ guideTitle, bodyCopy, cta }, dir, 'landscape', brandTheme),
          '1536x1024'
        ).then(image => ({ id: dir.id, image }))
      )
    )
    return NextResponse.json({ images })
  }

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: buildEducationalDirectionsSystemPrompt(brandTheme),
    messages: [{ role: 'user', content: buildEducationalDirectionsUserPrompt({ guideTitle, bodyCopy, cta }) }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  const rawDirs: { name: string; description: string }[] = jsonMatch ? JSON.parse(jsonMatch[0]) : []
  const dirs = rawDirs.slice(0, 3).map((d, i) => ({ id: `var-${Date.now()}-${i}`, name: d.name, description: d.description }))

  const images = await Promise.all(
    dirs.map(dir =>
      generateImage(
        buildEducationalImagePrompt({ guideTitle, bodyCopy, cta }, dir, 'square', brandTheme),
        '1024x1024'
      ).then(image => ({
        id: dir.id,
        name: dir.name,
        visualDirection: dir.description,
        image,
      }))
    )
  )

  return NextResponse.json({ variations: images })
}
