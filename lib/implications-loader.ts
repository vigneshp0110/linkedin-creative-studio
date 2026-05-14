import * as fs from 'fs'
import * as path from 'path'
import { Implication } from './types'

type ImplicationsMap = Record<string, Implication[]>

const IMPLICATIONS_CONFIG: Record<string, string> = {
  'mid-year-comp-change': 'mid-year-comp-change.json',
  // add more campaign themes here as implications are authored
}

export function getImplications(campaignThemeId: string, personaGroupId: string): Implication[] {
  const file = IMPLICATIONS_CONFIG[campaignThemeId]
  if (!file) return []
  const filePath = path.join(process.cwd(), 'implications', file)
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const map = JSON.parse(content) as ImplicationsMap
    return map[personaGroupId] ?? []
  } catch {
    return []
  }
}

export function hasImplications(campaignThemeId: string): boolean {
  return campaignThemeId in IMPLICATIONS_CONFIG
}
