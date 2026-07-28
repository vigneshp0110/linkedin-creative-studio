export const dynamic = 'force-dynamic'
export const maxDuration = 120

import { NextRequest, NextResponse } from 'next/server'
import type { ImagesResponse } from 'openai/resources/images'
import { postProcessImage } from '@/lib/image-post-process'

export async function POST(req: NextRequest) {
  const [{ default: OpenAI, toFile }, { default: Anthropic }] = await Promise.all([
    import('openai'),
    import('@anthropic-ai/sdk'),
  ])
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const body = await req.json()
  const { currentImageBase64, userMessage, extractedCopy, brandDirection, chatHistory, format } = body

  // Step 1: Claude interprets the request in brand context and writes an edit prompt
  const systemPrompt = `You are a brand consultant helping refine an Everstage LinkedIn ad that has already been translated to the new brand design system.

CURRENT BRAND DIRECTION APPLIED:
${brandDirection || 'Not specified'}

CURRENT COPY ON THE AD:
Headline: "${extractedCopy?.headline || ''}"
Subheadline: "${extractedCopy?.subheadline || ''}"
CTA: "${extractedCopy?.cta || ''}"

EVERSTAGE BRAND SYSTEM:
Colours: deep eggplant #2D1022 · cream #F5F0E8 · teal #1BA894 · periwinkle #6B70D9 · orange #E8893B · tan #B8764A · hot pink #D63865
Visual motifs: floating-bars (thin coloured bars over photo) · e-grid (staggered 2-col checkerboard) · photo-split (2×2 photo+colour) · headshot-color (portrait on solid colour) · type-scenery (oversized type, photo in front) · color-list (multicolour lines on eggplant) · gradient-bg (single gradient fill)
Typography: FK Roman (serif headlines) · Roobert (sans-serif body/CTA)
Logo: colourful stacked-bar E icon + "Everstage" wordmark — white on dark, dark maroon on light

Your job:
1. Understand what the user wants to change (visual style, colours, motif, copy, layout, mood)
2. Generate a precise GPT-Image-2 edit prompt that applies the change within the Everstage brand system
3. Write a short, friendly 1-2 sentence response telling the user what you're applying

Return raw JSON only:
{
  "editPrompt": "Full detailed image generation prompt applying the user's request within the Everstage brand. Include: which motif to use, specific brand colours with hex codes, typography treatment, exact copy to render, CTA treatment. IMPORTANT: do NOT instruct the model to render any logo or wordmark — the logo is composited separately. Also instruct it to keep the top-left corner (200×80px) clear of all elements. Be specific and complete.",
  "assistantMessage": "Short friendly message (1-2 sentences) telling the user what change you're making and why it fits the brand."
}`

  const historyMessages = (chatHistory || []).slice(-6).map((m: { role: string; content: string }) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  const claudeMsg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      ...historyMessages,
      { role: 'user', content: userMessage },
    ],
  })

  const claudeText = claudeMsg.content[0].type === 'text' ? claudeMsg.content[0].text : '{}'
  const jsonMatch = claudeText.match(/\{[\s\S]*\}/)
  let parsed: { editPrompt?: string; assistantMessage?: string } = {}
  try { parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {} } catch { /* ignore */ }

  const editPrompt = parsed.editPrompt || userMessage
  const assistantMessage = parsed.assistantMessage || 'Applied your change — let me know if you want anything else.'

  // Step 2: Convert current image base64 to a file for GPT-Image-2 edit
  const base64Data = currentImageBase64.replace(/^data:image\/\w+;base64,/, '')
  const imageBuffer = Buffer.from(base64Data, 'base64')
  const imageFile = await toFile(imageBuffer, 'current.png', { type: 'image/png' })

  const fmt: 'square' | 'landscape' = format === 'landscape' ? 'landscape' : 'square'
  const size = fmt === 'landscape' ? '1536x1024' : '1024x1024'

  let rawB64: string | null = null
  try {
    const res = await (openai.images.edit({
      model: 'gpt-image-2',
      image: imageFile,
      prompt: editPrompt,
      n: 1,
      size,
    } as Parameters<typeof openai.images.edit>[0]) as Promise<ImagesResponse>)
    rawB64 = res.data?.[0]?.b64_json ?? null
  } catch (e) {
    console.error('[translate-chat] image edit failed:', e)
    return NextResponse.json({ assistantMessage: "Sorry, image generation failed. Try a different request.", image: null })
  }

  const newImage = rawB64
    ? await postProcessImage(Buffer.from(rawB64, 'base64'), fmt)
    : null

  return NextResponse.json({ image: newImage, assistantMessage })
}
