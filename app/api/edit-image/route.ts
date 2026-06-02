export const dynamic = 'force-dynamic'
export const maxDuration = 120

import { NextRequest, NextResponse } from 'next/server'
import type { ImagesResponse } from 'openai/resources/images'

export async function POST(req: NextRequest) {
  try {
    const { default: OpenAI, toFile } = await import('openai')
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const formData = await req.formData()

    // The image to edit — either the original upload or the most recent generated image (base64)
    const imageFile = formData.get('image') as File | null
    const imageBase64 = formData.get('imageBase64') as string | null
    const changeRequest = formData.get('changeRequest') as string
    const changeHistory = JSON.parse((formData.get('changeHistory') as string) ?? '[]') as string[]
    const format = (formData.get('format') as 'square' | 'landscape') ?? 'square'

    if (!changeRequest?.trim()) {
      return NextResponse.json({ error: 'No change request provided' }, { status: 400 })
    }

    // Prepare the source image as an uploadable
    let uploadable: Awaited<ReturnType<typeof toFile>>

    if (imageBase64) {
      // Strip the data URL prefix if present
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
      const buf = Buffer.from(base64Data, 'base64')
      uploadable = await toFile(buf, 'image.png', { type: 'image/png' })
    } else if (imageFile) {
      const buf = Buffer.from(await imageFile.arrayBuffer())
      uploadable = await toFile(buf, imageFile.name || 'image.png', { type: imageFile.type || 'image/png' })
    } else {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Build the edit prompt — describe what to keep and what to change
    const historyLines = changeHistory.length > 0
      ? `\n\nPREVIOUS CHANGES ALREADY APPLIED (these are baked in — preserve them):\n${changeHistory.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
      : ''

    const prompt = `You are editing a LinkedIn advertisement image. Apply ONLY the requested change below — preserve everything else in the image exactly as it appears (layout, colors, logo, typography style, copy, and all visual elements not mentioned in the change request).${historyLines}

CHANGE TO APPLY NOW:
${changeRequest.trim()}

Important: Do not alter anything not explicitly mentioned in the change request. The result must still look like a professional LinkedIn B2B advertisement.`

    const size = format === 'landscape' ? '1536x1024' : '1024x1024'

    const res = await (openai.images.edit({
      model: 'gpt-image-2',
      image: uploadable,
      prompt,
      n: 1,
      size,
    } as Parameters<typeof openai.images.edit>[0]) as Promise<ImagesResponse>)

    const b64 = res.data?.[0]?.b64_json
    if (!b64) {
      return NextResponse.json({ error: 'No image returned from model' }, { status: 500 })
    }

    return NextResponse.json({ image: `data:image/png;base64,${b64}` })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[edit-image] error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
