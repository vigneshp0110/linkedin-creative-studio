export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import OpenAI, { toFile } from 'openai'
import type { ImagesResponse } from 'openai/resources/images'
import Anthropic from '@anthropic-ai/sdk'
import {
  buildBadgeDirectionsSystemPrompt,
  buildBadgeDirectionsUserPrompt,
  buildBadgeImagePrompt,
  buildTestimonialDirectionsSystemPrompt,
  buildTestimonialDirectionsUserPrompt,
  buildTestimonialImagePrompt,
} from '@/lib/prompt-builder'

export const maxDuration = 120

async function fileToUploadable(file: File, name: string) {
  const buf = Buffer.from(await file.arrayBuffer())
  return toFile(buf, name, { type: file.type || 'image/png' })
}

function parseDirections(text: string): { name: string; description: string }[] {
  const match = text.match(/\[[\s\S]*\]/)
  return match ? JSON.parse(match[0]) : []
}

async function generateImages(
  openai: OpenAI,
  uploadableImages: Awaited<ReturnType<typeof fileToUploadable>>[],
  prompts: string[],
  size: '1024x1024' | '1536x1024'
): Promise<ImagesResponse[]> {
  return Promise.all(
    prompts.map(async prompt => {
      const result = await openai.images.edit({
        model: 'gpt-image-2',
        image: uploadableImages.length === 1 ? uploadableImages[0] : (uploadableImages as unknown as Parameters<typeof openai.images.edit>[0]['image']),
        prompt,
        n: 1,
        size,
      } as Parameters<typeof openai.images.edit>[0])
      return result as ImagesResponse
    })
  )
}

export async function POST(req: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const formData = await req.formData()
  const type = formData.get('type') as 'badges' | 'testimonial'
  const format = (formData.get('format') as 'square' | 'landscape') ?? 'square'
  const isLandscape = format === 'landscape'
  const size = isLandscape ? '1536x1024' : '1024x1024'

  if (type === 'badges') {
    const tagline = formData.get('tagline') as string
    const cta = formData.get('cta') as string
    const badgeFiles = formData.getAll('badges') as File[]
    const badgeCount = badgeFiles.length

    const uploadables = await Promise.all(
      badgeFiles.map((f, i) => fileToUploadable(f, `badge-${i}.png`))
    )

    if (isLandscape) {
      const rawDirs = JSON.parse(formData.get('visualDirections') as string) as { id: string; name: string; description: string }[]
      const results = await generateImages(openai, 
        uploadables,
        rawDirs.map(d => buildBadgeImagePrompt({ tagline, cta, badgeCount }, d, 'landscape')),
        size
      )
      return NextResponse.json({
        images: rawDirs.map((d, i) => ({
          id: d.id,
          image: results[i].data?.[0]?.b64_json ? `data:image/png;base64,${results[i].data![0].b64_json}` : null,
        })),
      })
    }

    // Generate fresh directions via Claude
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: buildBadgeDirectionsSystemPrompt(),
      messages: [{ role: 'user', content: buildBadgeDirectionsUserPrompt({ tagline, cta, badgeCount }) }],
    })
    const rawDirs = parseDirections(msg.content[0].type === 'text' ? msg.content[0].text : '[]')
    const dirs = rawDirs.slice(0, 3).map((d, i) => ({ id: `var-${Date.now()}-${i}`, ...d }))

    const results = await generateImages(openai, 
      uploadables,
      dirs.map(d => buildBadgeImagePrompt({ tagline, cta, badgeCount }, d, 'square')),
      size
    )

    return NextResponse.json({
      variations: dirs.map((d, i) => ({
        id: d.id,
        name: d.name,
        visualDirection: d.description,
        image: results[i].data?.[0]?.b64_json ? `data:image/png;base64,${results[i].data![0].b64_json}` : null,
      })),
    })
  }

  if (type === 'testimonial') {
    const quote = formData.get('quote') as string
    const name = formData.get('name') as string
    const title = formData.get('title') as string
    const company = formData.get('company') as string
    const cta = formData.get('cta') as string
    const headshotFile = formData.get('headshot') as File
    const logoFile = formData.get('companyLogo') as File | null
    const hasLogo = !!logoFile

    const uploadables = [
      await fileToUploadable(headshotFile, 'headshot.png'),
      ...(logoFile ? [await fileToUploadable(logoFile, 'logo.png')] : []),
    ]

    if (isLandscape) {
      const rawDirs = JSON.parse(formData.get('visualDirections') as string) as { id: string; name: string; description: string }[]
      const results = await generateImages(openai, 
        uploadables,
        rawDirs.map(d => buildTestimonialImagePrompt({ quote, name, title, company, cta, hasLogo }, d, 'landscape')),
        size
      )
      return NextResponse.json({
        images: rawDirs.map((d, i) => ({
          id: d.id,
          image: results[i].data?.[0]?.b64_json ? `data:image/png;base64,${results[i].data![0].b64_json}` : null,
        })),
      })
    }

    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: buildTestimonialDirectionsSystemPrompt(),
      messages: [{ role: 'user', content: buildTestimonialDirectionsUserPrompt({ name, title, company, quote, cta, hasLogo }) }],
    })
    const rawDirs = parseDirections(msg.content[0].type === 'text' ? msg.content[0].text : '[]')
    const dirs = rawDirs.slice(0, 3).map((d, i) => ({ id: `var-${Date.now()}-${i}`, ...d }))

    const results = await generateImages(openai, 
      uploadables,
      dirs.map(d => buildTestimonialImagePrompt({ quote, name, title, company, cta, hasLogo }, d, 'square')),
      size
    )

    return NextResponse.json({
      variations: dirs.map((d, i) => ({
        id: d.id,
        name: d.name,
        visualDirection: d.description,
        image: results[i].data?.[0]?.b64_json ? `data:image/png;base64,${results[i].data![0].b64_json}` : null,
      })),
    })
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}
