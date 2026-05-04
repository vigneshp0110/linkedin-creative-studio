export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import {
  buildEducationalDirectionsSystemPrompt,
  buildEducationalDirectionsUserPrompt,
  buildEducationalImagePrompt,
} from '@/lib/prompt-builder'

export async function POST(req: NextRequest) {
  const [{ default: OpenAI }, { default: Anthropic }] = await Promise.all([
    import('openai'),
    import('@anthropic-ai/sdk'),
  ])
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const body = await req.json()
  const { guideTitle, bodyCopy, cta, format = 'square', visualDirections } = body

  if (format === 'landscape' && visualDirections?.length) {
    const images = await Promise.all(
      visualDirections.map((dir: { id: string; name: string; description: string }) =>
        openai.images.generate({
          model: 'gpt-image-2',
          prompt: buildEducationalImagePrompt({ guideTitle, bodyCopy, cta }, dir, 'landscape'),
          n: 1,
          size: '1536x1024',
        }).then(res => ({
          id: dir.id,
          image: res.data?.[0]?.b64_json ? `data:image/png;base64,${res.data[0].b64_json}` : null,
        }))
      )
    )
    return NextResponse.json({ images })
  }

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: buildEducationalDirectionsSystemPrompt(),
    messages: [{ role: 'user', content: buildEducationalDirectionsUserPrompt({ guideTitle, bodyCopy, cta }) }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  const rawDirs: { name: string; description: string }[] = jsonMatch ? JSON.parse(jsonMatch[0]) : []
  const dirs = rawDirs.slice(0, 3).map((d, i) => ({ id: `var-${Date.now()}-${i}`, name: d.name, description: d.description }))

  const images = await Promise.all(
    dirs.map(dir =>
      openai.images.generate({
        model: 'gpt-image-2',
        prompt: buildEducationalImagePrompt({ guideTitle, bodyCopy, cta }, dir, 'square'),
        n: 1,
        size: '1024x1024',
      }).then(res => ({
        id: dir.id,
        name: dir.name,
        visualDirection: dir.description,
        image: res.data?.[0]?.b64_json ? `data:image/png;base64,${res.data[0].b64_json}` : null,
      }))
    )
  )

  return NextResponse.json({ variations: images })
}
