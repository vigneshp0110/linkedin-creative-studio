import * as fs from 'fs'
import * as path from 'path'
import { Implication } from './types'

// nested: comboId → themeId → angleId → Implication[]
type ImplicationsMap = Record<string, Record<string, Record<string, Implication[]>>>

const IMPLICATIONS_CONFIG: Record<string, string> = {
  'xactly-displacement':     'xactly-displacement.json',
  'spreadsheet-displacement': 'spreadsheet-displacement.json',
  'mid-year-comp-change':    'mid-year-comp-change.json',
}

function loadMap(campaignThemeId: string): ImplicationsMap | null {
  const file = IMPLICATIONS_CONFIG[campaignThemeId]
  if (!file) return null
  const filePath = path.join(process.cwd(), 'implications', file)
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as ImplicationsMap
  } catch {
    return null
  }
}

export function getImplications(
  campaignThemeId: string,
  personaGroupId: string,
  themeId: string,
  angleId: string
): Implication[] {
  const map = loadMap(campaignThemeId)
  if (!map) return []
  return map[personaGroupId]?.[themeId]?.[angleId] ?? []
}

export function hasImplicationsForCampaign(campaignThemeId: string): boolean {
  return campaignThemeId in IMPLICATIONS_CONFIG
}
