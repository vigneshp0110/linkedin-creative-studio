export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getImplications } from '@/lib/implications-loader'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const campaignThemeId = searchParams.get('campaignTheme') ?? ''
  const personaGroupId  = searchParams.get('personaGroup')  ?? ''
  const themeId         = searchParams.get('theme')         ?? ''
  const angleId         = searchParams.get('angle')         ?? ''

  if (!campaignThemeId || !personaGroupId || !themeId || !angleId) {
    return NextResponse.json({ implications: [] })
  }

  const implications = getImplications(campaignThemeId, personaGroupId, themeId, angleId)
  return NextResponse.json({ implications })
}
