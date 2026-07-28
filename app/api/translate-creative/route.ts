export const dynamic = 'force-dynamic'
export const maxDuration = 120

import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import sharp from 'sharp'
import type { ImagesResponse } from 'openai/resources/images'
import { postProcessImage } from '@/lib/image-post-process'

export async function POST(req: NextRequest) {
  const [{ default: OpenAI, toFile }, { default: Anthropic }] = await Promise.all([
    import('openai'),
    import('@anthropic-ai/sdk'),
  ])
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const formData = await req.formData()
  const imageFile = formData.get('image') as File
  const format = (formData.get('format') as string) || 'square'

  const imageBytes = await imageFile.arrayBuffer()
  const imageBase64 = Buffer.from(imageBytes).toString('base64')
  const mediaType = (imageFile.type || 'image/png') as 'image/png' | 'image/jpeg'

  // Step 1: Claude vision analyses the old creative
  const analysisMsg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `You are a creative analyst specialising in B2B brand translation for Everstage.

Analyse the LinkedIn ad image and extract all copy and layout intent. Then choose the best new Everstage brand motif.

Available motifs:
- floating-bars: Thin horizontal brand-colour bars scattered over a full-bleed photo
- e-grid: Two-column staggered checkerboard of brand-colour blocks on deep eggplant (#2D1022)
- photo-split: 2×2 quadrants alternating photo and flat brand-colour blocks
- headshot-color: Centred portrait on a solid brand colour background with scattered cream bars
- type-scenery: Oversized text filling the canvas with a photo layered in front
- color-list: Multi-colour text lines on deep eggplant (each line in a different brand colour)
- gradient-bg: Single brand gradient background with bold centred type

Brand colours: deep eggplant #2D1022 · cream #F5F0E8 · teal #1BA894 · periwinkle #6B70D9 · orange #E8893B · tan #B8764A · hot pink #D63865
Typography: FK Roman (serif headlines) · Roobert (sans-serif body/CTA)

Return raw JSON only — no markdown fences:
{
  "headline": "exact headline text from the image",
  "subheadline": "exact subheadline/body text from the image",
  "cta": "exact CTA button text",
  "intent": "1-sentence description of the ad's core message and target audience",
  "motif": "chosen motif key",
  "brandDirection": "2-3 sentence detailed layout description using new Everstage brand — specific colours with hex codes, typography treatment, logo placement, CTA treatment",
  "chatIntro": "2-3 sentence friendly message to the user: what you found in their old creative and what new brand direction you applied — conversational, not robotic"
}`,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
        { type: 'text', text: 'Analyse this LinkedIn ad and return the translation JSON.' },
      ],
    }],
  })

  const analysisText = analysisMsg.content[0].type === 'text' ? analysisMsg.content[0].text : '{}'
  const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
  let analysis: Record<string, string> = {}
  try { analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {} } catch { /* ignore */ }

  // Step 2: Load logo
  let logoFile: Awaited<ReturnType<typeof toFile>> | null = null
  try {
    const logoBuf = fs.readFileSync(path.join(process.cwd(), 'public/logos/logo-new.png'))
    const squareBuf = await sharp(logoBuf)
      .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png().toBuffer()
    logoFile = await toFile(squareBuf, 'logo.png', { type: 'image/png' })
  } catch (e) {
    console.error('[translate-creative] logo prep failed:', e)
  }

  const size = format === 'landscape' ? '1536x1024' : '1024x1024'
  const formatLabel = format === 'landscape' ? 'Landscape (1.5:1), 1536×1024px' : 'Square (1:1), 1024×1024px'

  const imagePrompt = `Translate a LinkedIn ad to the new Everstage brand design system.

AD FORMAT: ${formatLabel}

EXACT COPY TO RENDER (preserve precisely as written):
Headline: "${analysis.headline || ''}"
Subheadline: "${analysis.subheadline || ''}"
CTA Button: "${analysis.cta || ''}"

CORE MESSAGE: ${analysis.intent || ''}

NEW BRAND DIRECTION — apply this exactly:
${analysis.brandDirection || ''}

BRAND REQUIREMENTS:
- LOGO: The input image contains the official Everstage logo (colourful stacked-bar E icon + "Everstage" wordmark in Roobert). Reproduce it exactly — do not substitute. White wordmark + coloured icon on dark zones; dark maroon (#3D1935) wordmark on light zones.
- Brand colours: deep eggplant #2D1022 · cream #F5F0E8 · teal #1BA894 · periwinkle #6B70D9 · orange #E8893B · tan #B8764A · hot pink #D63865
- Headlines in FK Roman serif; body/CTA in Roobert sans-serif
- CTA button: orange (#E8893B) background, dark maroon Roobert text
- Do NOT reproduce old brand colours, old layout, or old logo treatment
- Render all copy text crisply and legibly — high contrast against background
- Modern, bold, editorial enterprise B2B aesthetic
- No competitor logos or brand names`

  let rawB64: string | null = null
  try {
    if (logoFile) {
      const res = await (openai.images.edit({
        model: 'gpt-image-2', image: logoFile, prompt: imagePrompt, n: 1, size,
      } as Parameters<typeof openai.images.edit>[0]) as Promise<ImagesResponse>)
      rawB64 = res.data?.[0]?.b64_json ?? null
    }
    if (!rawB64) {
      const res = await (openai.images.generate({
        model: 'gpt-image-2', prompt: imagePrompt, n: 1, size,
      } as Parameters<typeof openai.images.generate>[0]) as unknown as ImagesResponse)
      rawB64 = res.data?.[0]?.b64_json ?? null
    }
  } catch (e) {
    console.error('[translate-creative] image generation failed:', e)
    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 })
  }

  if (!rawB64) return NextResponse.json({ error: 'No image returned' }, { status: 500 })

  const newImage = await postProcessImage(
    Buffer.from(rawB64, 'base64'),
    format === 'landscape' ? 'landscape' : 'square',
  )

  return NextResponse.json({
    image: newImage,
    analysis: {
      headline: analysis.headline ?? '',
      subheadline: analysis.subheadline ?? '',
      cta: analysis.cta ?? '',
      intent: analysis.intent ?? '',
    },
    direction: analysis.brandDirection ?? '',
    chatIntro: analysis.chatIntro ?? "I've translated your creative to the new Everstage brand. What would you like to refine?",
  })
}
