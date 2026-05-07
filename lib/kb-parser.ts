import * as fs from 'fs'
import * as path from 'path'
import { Angle, Campaign, KBVertical, Theme } from './types'

const CAMPAIGN_THEME_KB_CONFIG = [
  { id: 'xactly-displacement', file: 'xactly-displacement.md', label: 'Xactly Displacement' },
  { id: 'spreadsheet-displacement', file: 'spreadsheet-displacement.md', label: 'Spreadsheet Displacement' },
  { id: 'mid-year-comp-change', file: 'mid-year-comp-change.md', label: 'Mid-Year Comp Change' },
  { id: 'ai-native-build-vs-buy', file: 'ai-native-build-vs-buy.md', label: 'AI Native: Build vs Buy' },
]

const KB_CONFIG = [
  { id: 'software', file: 'software.md', label: 'Software' },
  { id: 'it-services', file: 'it-services.md', label: 'IT Services' },
  { id: 'staffing', file: 'staffing.md', label: 'Staffing' },
  { id: 'finserv-banking', file: 'finserv-banking.md', label: 'FinServ — Banking' },
  { id: 'finserv-insurance', file: 'finserv-insurance.md', label: 'FinServ — Insurance' },
  { id: 'finserv-accounting', file: 'finserv-accounting.md', label: 'FinServ — Accounting' },
  { id: 'finserv-other', file: 'finserv-other.md', label: 'FinServ — Other' },
  { id: 'finserv-overall', file: 'finserv-overall.md', label: 'FinServ — Overall' },
  { id: 'mfg-chemical', file: 'mfg-chemical.md', label: 'Manufacturing — Chemical' },
  { id: 'mfg-electrical', file: 'mfg-electrical.md', label: 'Manufacturing — Computers & Electronics' },
  { id: 'mfg-machinery', file: 'mfg-machinery.md', label: 'Manufacturing — Machinery' },
  { id: 'mfg-medical', file: 'mfg-medical.md', label: 'Manufacturing — Medical' },
  { id: 'mfg-wholesale', file: 'mfg-wholesale.md', label: 'Manufacturing — Wholesale' },
  { id: 'mfg-overall', file: 'mfg-overall.md', label: 'Manufacturing — Overall' },
]

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function parseKBFile(filePath: string, verticalId: string, verticalLabel: string): KBVertical {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  const campaigns: Campaign[] = []
  let currentCampaign: Campaign | null = null
  let currentTheme: Theme | null = null
  let currentAngle: Angle | null = null
  let angleCounter = 0
  let skipSection = false

  const flushAngle = () => {
    if (currentAngle && currentTheme) {
      currentTheme.angles.push(currentAngle)
      currentAngle = null
    }
  }
  const flushTheme = () => {
    flushAngle()
    if (currentTheme && currentCampaign) {
      currentCampaign.themes.push(currentTheme)
      currentTheme = null
    }
  }
  const flushCampaign = () => {
    flushTheme()
    if (currentCampaign) {
      campaigns.push(currentCampaign)
      currentCampaign = null
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd()

    // Skip Quick Reference and Table of Contents sections
    if (/^## (Quick Reference|Table of Contents)/.test(line)) {
      skipSection = true
      continue
    }

    // A substantive ## heading ends the skip
    if (line.startsWith('## ') && !/^## (Quick Reference|Table of Contents)/.test(line)) {
      skipSection = false
    }

    if (skipSection) continue

    // Campaign header (##)
    if (line.startsWith('## ')) {
      flushCampaign()
      // Normalize: × → x, _ → space
      const name = line.slice(3).trim().replace(/×/g, 'x').replace(/_/g, ' ')
      currentCampaign = { id: slug(name), name, themes: [] }
      angleCounter = 0
      continue
    }

    if (!currentCampaign) continue

    // Theme header (###)
    if (line.startsWith('### ')) {
      flushTheme()
      const raw = line.slice(4).trim()
      // Strip "Theme N: " prefix
      const nameMatch = raw.match(/^Theme \d+:\s*(.+)$/)
      const name = nameMatch ? nameMatch[1].trim() : raw
      // Peek ahead for frequency
      let totalFrequency = 0
      const nextLine = lines[i + 1] ?? ''
      const freqMatch = nextLine.match(/\*\*Total frequency:\s*(\d+)/)
      if (freqMatch) totalFrequency = parseInt(freqMatch[1])
      currentTheme = { id: slug(name), name, totalFrequency, angles: [] }
      angleCounter = 0
      continue
    }

    if (!currentTheme) continue

    // Angle item: "1. **[Freq: N]** description → consequence"
    const angleMatch = line.match(/^\d+\.\s+\*\*\[Freq:\s*(\d+)\]\*\*\s+(.+)$/)
    if (angleMatch) {
      flushAngle()
      angleCounter++
      currentAngle = {
        id: `angle-${angleCounter}`,
        description: angleMatch[2].trim(),
        frequency: parseInt(angleMatch[1]),
      }
      continue
    }

    // Quote line: "> *"..."*"
    if (currentAngle) {
      const quoteMatch = line.match(/^>\s*\*"(.+)"\*/)
      if (quoteMatch) {
        currentAngle.quote = quoteMatch[1]
      }
    }
  }

  flushCampaign()

  return { id: verticalId, label: verticalLabel, campaigns }
}

export function parseAllKBs(): KBVertical[] {
  const kbDir = path.join(process.cwd(), 'kb')
  return KB_CONFIG.map(({ id, file, label }) => {
    try {
      return parseKBFile(path.join(kbDir, file), id, label)
    } catch {
      return { id, label, campaigns: [] }
    }
  }).filter(v => v.campaigns.length > 0)
}

export function parseVertical(verticalId: string): KBVertical | null {
  const config = KB_CONFIG.find(k => k.id === verticalId)
  if (!config) return null
  const kbDir = path.join(process.cwd(), 'kb')
  try {
    return parseKBFile(path.join(kbDir, config.file), config.id, config.label)
  } catch {
    return null
  }
}

export function getVerticalList(): { id: string; label: string }[] {
  return KB_CONFIG.map(({ id, label }) => ({ id, label }))
}

export function getCampaignThemeList(): { id: string; label: string; available: boolean }[] {
  const kbDir = path.join(process.cwd(), 'kb')
  return CAMPAIGN_THEME_KB_CONFIG.map(({ id, label, file }) => ({
    id,
    label,
    available: fs.existsSync(path.join(kbDir, file)),
  }))
}

export function parseCampaignTheme(themeId: string): KBVertical | null {
  const config = CAMPAIGN_THEME_KB_CONFIG.find(k => k.id === themeId)
  if (!config) return null
  const kbDir = path.join(process.cwd(), 'kb')
  try {
    return parseKBFile(path.join(kbDir, config.file), config.id, config.label)
  } catch {
    return null
  }
}
