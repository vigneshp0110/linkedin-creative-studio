// One-time script to generate angle-level implications for all campaign theme KBs.
// Run: node scripts/generate-implications.js
// Output: implications/{campaign-theme-id}.json

const fs = require('fs')
const path = require('path')

// Load .env.local so ANTHROPIC_API_KEY is available without exporting it manually
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim()
  }
}

const Anthropic = require('@anthropic-ai/sdk').default

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CAMPAIGN_THEMES = [
  { id: 'xactly-displacement',     file: 'xactly-displacement.md',     label: 'Xactly Displacement' },
  { id: 'spreadsheet-displacement', file: 'spreadsheet-displacement.md', label: 'Spreadsheet Displacement' },
  { id: 'mid-year-comp-change',     file: 'mid-year-comp-change.md',     label: 'Mid-Year Comp Change' },
]

// ── KB parser (mirrors lib/kb-parser.ts logic) ────────────────────────────────

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function parseKBFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  const campaigns = []
  let currentCampaign = null
  let currentTheme = null
  let currentAngle = null
  let angleCounter = 0
  let skipSection = false

  const flushAngle = () => {
    if (currentAngle && currentTheme) { currentTheme.angles.push(currentAngle); currentAngle = null }
  }
  const flushTheme = () => {
    flushAngle()
    if (currentTheme && currentCampaign) { currentCampaign.themes.push(currentTheme); currentTheme = null }
  }
  const flushCampaign = () => {
    flushTheme()
    if (currentCampaign) { campaigns.push(currentCampaign); currentCampaign = null }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd()

    if (/^## (Quick Reference|Table of Contents)/.test(line)) { skipSection = true; continue }
    if (line.startsWith('## ') && !/^## (Quick Reference|Table of Contents)/.test(line)) skipSection = false
    if (skipSection) continue

    if (line.startsWith('## ')) {
      flushCampaign()
      const name = line.slice(3).trim().replace(/×/g, 'x').replace(/_/g, ' ')
      currentCampaign = { id: slug(name), name, themes: [] }
      angleCounter = 0
      continue
    }

    if (!currentCampaign) continue

    if (line.startsWith('### ')) {
      flushTheme()
      const raw = line.slice(4).trim()
      const nameMatch = raw.match(/^Theme \d+:\s*(.+)$/)
      const name = nameMatch ? nameMatch[1].trim() : raw
      let totalFrequency = 0
      const nextLine = lines[i + 1] ?? ''
      const freqMatch = nextLine.match(/\*\*Total frequency:\s*(\d+)/)
      if (freqMatch) totalFrequency = parseInt(freqMatch[1])
      currentTheme = { id: slug(name), name, totalFrequency, angles: [] }
      angleCounter = 0
      continue
    }

    if (!currentTheme) continue

    const angleMatch = line.match(/^\d+\.\s+\*\*\[Freq:\s*(\d+)\]\*\*\s+(.+)$/)
    if (angleMatch) {
      flushAngle()
      angleCounter++
      currentAngle = { id: `angle-${angleCounter}`, description: angleMatch[2].trim(), frequency: parseInt(angleMatch[1]) }
      continue
    }

    if (currentAngle) {
      const quoteMatch = line.match(/^>\s*\*"(.+)"\*/)
      if (quoteMatch) currentAngle.quote = quoteMatch[1]
    }
  }

  flushCampaign()
  return campaigns
}

// ── Implication generation prompt ─────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a SPIN selling expert and senior B2B copywriter for Everstage — an AI-powered sales commission management platform.

Your job: given a specific pain angle from a Gong transcript analysis, generate exactly 2-3 SPIN implications for that angle.

SPIN IMPLICATION DEFINITION:
A SPIN implication is NOT the surface pain — it's what that pain COSTS the person in terms of control, credibility, career, or sense of identity. It operates at the identity level.

Pain (weak): "Mid-year comp changes are hard to manage"
Implication (strong): "The system is supposed to be yours to run. Right now, it runs you."

Each implication has:
- label: 2–5 words, naming the type of cost (e.g. "Loss of Control", "Scapegoat Risk", "Blind-Side Risk")
- expansion: 1–2 sentences, identity-level — what this pain makes the person feel about themselves, their role, or their credibility. Use "you" language. Be specific, not generic. Max 30 words.

QUALITY EXAMPLES (from validated Gong research):
- label: "Loss of Control" | expansion: "The system is supposed to be yours to run. Right now, it runs you."
- label: "Scapegoat Risk" | expansion: "When a number is wrong and there's no audit trail, you own the error. There's no proof of what the plan originally said."
- label: "Credibility at Risk" | expansion: "Every downstream error traces back to your team. You become the bottleneck everyone blames when comp goes wrong."
- label: "Blind-Side Risk" | expansion: "By the time the exposure surfaces at close, it's a problem you're explaining — not preventing."
- label: "Invisible Labor" | expansion: "No credit when it works. Full blame when it doesn't."
- label: "Every Period Close Has an Asterisk" | expansion: "You can never fully close a period. Every month-end has an open question attached to it."
- label: "Defending Decisions You Didn't Make" | expansion: "The comp leader becomes the face of a business decision they had no control over."
- label: "You're the Bottleneck" | expansion: "When the process can't handle change, everything routes through you. One error away from a rep disputing their pay."

RULES:
- Generate exactly 2 or 3 implications per angle (2 if the angle is narrow, 3 if it has multiple consequence layers)
- Each implication must be distinct — no two should hit the same emotional note
- Prefer identity-level language over operational language
- If a buyer verbatim is provided, ground at least one implication in its specific language
- No filler words, no generic B2B-speak

OUTPUT: raw JSON array only — no markdown, no explanation:
[{"id":"slug-id","label":"Label Text","expansion":"Expansion sentence here."}]`

async function generateImplicationsForAngle(campaignLabel, comboName, themeName, angle) {
  const userPrompt = `Generate SPIN implications for this specific ad angle:

CAMPAIGN: ${campaignLabel}
PERSONA / COMBO: ${comboName}
PAIN THEME: ${themeName}
ANGLE (Freq: ${angle.frequency}): ${angle.description}${angle.quote ? `\nBUYER VERBATIM: "${angle.quote}"` : ''}

Generate ${angle.frequency >= 10 ? 3 : 2} implications that capture what this specific pain costs this specific persona.`

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = msg.content[0].type === 'text' ? msg.content[0].text : '[]'
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error(`No JSON array in response for angle: ${angle.description.slice(0, 50)}`)
  return JSON.parse(match[0])
}

// ── Concurrency helper ────────────────────────────────────────────────────────

async function pLimit(tasks, concurrency) {
  const results = []
  let i = 0
  async function worker() {
    while (i < tasks.length) {
      const idx = i++
      results[idx] = await tasks[idx]()
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, worker)
  await Promise.all(workers)
  return results
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const kbDir = path.join(process.cwd(), 'kb')
  const implDir = path.join(process.cwd(), 'implications')
  fs.mkdirSync(implDir, { recursive: true })

  for (const theme of CAMPAIGN_THEMES) {
    const kbPath = path.join(kbDir, theme.file)
    if (!fs.existsSync(kbPath)) {
      console.log(`⚠  Skipping ${theme.id} — KB file not found`)
      continue
    }

    console.log(`\n📂 ${theme.label}`)
    const campaigns = parseKBFile(kbPath)

    // Collect all (combo, theme, angle) tuples
    const tasks = []
    for (const combo of campaigns) {
      for (const painTheme of combo.themes) {
        for (const angle of painTheme.angles) {
          tasks.push({ combo, painTheme, angle })
        }
      }
    }
    console.log(`   ${tasks.length} angles to process`)

    // Build nested output: comboId → themeId → angleId → implications[]
    const output = {}

    const taskFns = tasks.map(({ combo, painTheme, angle }) => async () => {
      const key = `${combo.id}/${painTheme.id}/${angle.id}`
      process.stdout.write(`   [${angle.frequency}] ${angle.description.slice(0, 60)}…`)
      try {
        const impls = await generateImplicationsForAngle(theme.label, combo.name, painTheme.name, angle)
        if (!output[combo.id]) output[combo.id] = {}
        if (!output[combo.id][painTheme.id]) output[combo.id][painTheme.id] = {}
        output[combo.id][painTheme.id][angle.id] = impls
        process.stdout.write(` ✓ (${impls.length} implications)\n`)
      } catch (err) {
        process.stdout.write(` ✗ ${err.message}\n`)
        output[combo.id] = output[combo.id] ?? {}
        output[combo.id][painTheme.id] = output[combo.id][painTheme.id] ?? {}
        output[combo.id][painTheme.id][angle.id] = []
      }
    })

    // 4 concurrent requests — respectful of rate limits
    await pLimit(taskFns, 4)

    const outPath = path.join(implDir, `${theme.id}.json`)
    fs.writeFileSync(outPath, JSON.stringify(output, null, 2))
    console.log(`   ✅ Saved → implications/${theme.id}.json`)
  }

  console.log('\n🎉 Done — all implications generated and saved.')
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
