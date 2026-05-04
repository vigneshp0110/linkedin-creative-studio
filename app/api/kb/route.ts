import { NextRequest, NextResponse } from 'next/server'
import { parseVertical } from '@/lib/kb-parser'

export async function GET(req: NextRequest) {
  const verticalId = req.nextUrl.searchParams.get('vertical')
  if (!verticalId) {
    return NextResponse.json({ error: 'vertical param required' }, { status: 400 })
  }

  const vertical = parseVertical(verticalId)
  if (!vertical) {
    return NextResponse.json({ error: 'Vertical not found' }, { status: 404 })
  }

  return NextResponse.json(vertical)
}
