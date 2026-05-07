import { NextRequest, NextResponse } from 'next/server'
import { parseCampaignTheme, parseVertical } from '@/lib/kb-parser'

export async function GET(req: NextRequest) {
  const verticalId = req.nextUrl.searchParams.get('vertical')
  const campaignThemeId = req.nextUrl.searchParams.get('campaignTheme')

  if (campaignThemeId) {
    const theme = parseCampaignTheme(campaignThemeId)
    if (!theme) return NextResponse.json({ error: 'Campaign theme not found' }, { status: 404 })
    return NextResponse.json(theme)
  }

  if (!verticalId) {
    return NextResponse.json({ error: 'vertical or campaignTheme param required' }, { status: 400 })
  }

  const vertical = parseVertical(verticalId)
  if (!vertical) {
    return NextResponse.json({ error: 'Vertical not found' }, { status: 404 })
  }

  return NextResponse.json(vertical)
}
