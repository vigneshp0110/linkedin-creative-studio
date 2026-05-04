export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { buildConceptsSystemPrompt, buildConceptsUserPrompt } from '@/lib/prompt-builder'
import { CreativeConcept } from '@/lib/types'

export async function POST(req: NextRequest) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const body = await req.json()

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: buildConceptsSystemPrompt(),
    messages: [
      { role: 'user', content: buildConceptsUserPrompt(body) },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  const raw: Omit<CreativeConcept, 'id'>[] = jsonMatch ? JSON.parse(jsonMatch[0]) : []

  const concepts: CreativeConcept[] = raw.map((c, i) => ({
    ...c,
    id: `concept-${i + 1}`,
    conceptNumber: c.conceptNumber ?? i + 1,
  }))

  return NextResponse.json({ concepts })
}
