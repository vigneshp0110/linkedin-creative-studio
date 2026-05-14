import { AdCopy, BrandTheme, GenerateRequest, LayoutTemplate, CreativeConcept } from './types'

const BRAND_BRIEF = `
BRAND: Everstage — AI-powered sales commission management and incentive compensation platform for B2B SaaS and enterprise companies. Replaces spreadsheets with automated, auditable commission calculations.

BRAND VOICE: Confident, pain-first, direct. Speaks the buyer's language — no jargon, no fluff. Empathetic to ops/finance pain, authoritative on outcomes.

BRAND COLORS:
- Deep navy: #0A1628 (primary background)
- Royal blue: #1B3FCC (secondary / highlight)
- Gold/amber: #F5A623 (emphasis text, CTA buttons)
- Lime green: #B8F060 (stat callouts)
- White: #FFFFFF (primary text on dark)
- Teal: #4DC8B4 (decorative accents)

LOGO: "everstage" wordmark with a circular icon — white version for dark backgrounds, navy for light.
`.trim()

const NEW_BRAND_BRIEF = `
BRAND: Everstage — AI-powered sales commission management and incentive compensation platform for B2B SaaS and enterprise companies.

BRAND VOICE: Confident, pain-first, direct. Speaks the buyer's language — no jargon, no fluff.

NEW BRAND AESTHETIC: Bold geometric color-block grid. The canvas is divided into rectangular zones, each filled with a flat brand color — no gradients, no white space. Vibrant, modern, editorial.

NEW BRAND COLORS:
- Eggplant/maroon: #3D1935 (primary dark)
- Hot pink/magenta: #CF3070
- Periwinkle blue: #5465D4
- Teal/emerald: #1BA894
- Warm orange: #E8893B
- Warm tan/brown: #B8764A
- Peach/cream: #F5CEB0
- Dark maroon text: #2D1B30

LOGO: Colorful stacked-bar "E" icon (multi-colored horizontal bars in pink, teal, blue, orange) + "Everstage" wordmark in dark maroon. Use full-color version on light/pastel blocks. White wordmark version on dark/eggplant blocks.
`.trim()

export function buildCopySystemPrompt(): string {
  return `You are a senior B2B LinkedIn ad copywriter for Everstage.

${BRAND_BRIEF}

WRITING RULES:
- Lead with the buyer's pain — name it specifically before hinting at the fix
- Use plain, direct language the buyer already uses about their own problem
- No filler words ("unlock", "seamless", "leverage", "revolutionize")
- Avoid mentioning Everstage by name in the body — let the logo do that
- Every word must earn its place

OUTPUT FORMAT — return raw JSON only, no markdown fences, no explanation:
{
  "headline": "max 7 words, bold, Title Case, pain-first or provocation",
  "subheadline": "max 12 words, agitate the pain or hint at the relief",
  "body": ["max 6 words each", "2-3 bullets max", "concrete and specific"],
  "cta": "3-4 words, action verb first"
}`
}

export function buildCopyUserPrompt(req: GenerateRequest): string {
  const conceptLines = req.concept
    ? `SELECTED CONCEPT HOOK: "${req.concept.hook}"
CTA DIRECTION: ${req.concept.ctaDirection}
NARRATIVE: ${req.concept.narrativeStructure}

The copy must match the tone and angle of the selected concept above. The hook is the creative direction — let it shape the headline and body.`
    : ''

  const customContextLine = req.customContext?.trim()
    ? `\nMARKETER CONTEXT (use this language and framing directly in the copy where relevant):\n${req.customContext.trim()}`
    : ''

  return `Generate LinkedIn ad copy for this campaign:

VERTICAL: ${req.verticalLabel}
CAMPAIGN / AUDIENCE: ${req.campaignName}
PAIN THEME: ${req.themeName}
SPECIFIC ANGLE (Freq: ${req.angle.frequency}): ${req.angle.description}
${req.angle.quote ? `BUYER VERBATIM: "${req.angle.quote}"` : ''}
${conceptLines}${customContextLine}
If a buyer verbatim is provided, borrow their exact phrasing where it fits naturally.`
}

const NEW_LAYOUT_VISUALS: Record<LayoutTemplate, { name: string; squareVisual: string; landscapeVisual: string }> = {
  statement: {
    name: 'Statement',
    squareVisual: `LAYOUT (Square 1:1): Bold geometric color-block grid. No white space — every zone filled with a flat brand color. Left 60% column: eggplant (#3D1935) background — top-left: Everstage colorful logo (multicolor icon + white "Everstage" wordmark). Below logo: large bold white headline text with one key phrase in hot pink (#CF3070). White subheadline below. 2-3 bullet lines in peach/cream (#F5CEB0) text. Near bottom: CTA button in warm orange (#E8893B) with dark maroon text. Right 40%: split into 2-3 stacked color blocks — top block teal (#1BA894), middle block periwinkle (#5465D4), bottom block warm tan (#B8764A). Each block solid flat color, no text. Geometric dividing lines are crisp and clean. Modern, vibrant, editorial B2B aesthetic.`,
    landscapeVisual: `LAYOUT (Landscape 1.5:1): Bold geometric color-block grid. Left 55%: eggplant (#3D1935) — top-left: Everstage colorful logo (multicolor icon + white wordmark). Below: large bold white headline with key phrase in hot pink (#CF3070). White subheadline. 2-3 bullet lines in peach (#F5CEB0). CTA button in orange (#E8893B) with dark maroon text. Right 45%: 3 stacked flat color blocks — teal (#1BA894) top, periwinkle (#5465D4) middle, warm tan (#B8764A) bottom. Clean geometric grid, no gradients, no white space.`,
  },
  'pain-story': {
    name: 'Pain Story',
    squareVisual: `LAYOUT (Square 1:1): Geometric color-block layout. Top 65%: large eggplant (#3D1935) zone — top-left Everstage colorful logo (white wordmark). Bold white headline below with key pain words in hot pink (#CF3070). Center-right: semi-transparent notification UI cards (Slack/email style) with commission error alerts cascading down, tinted in brand colors. Bottom 35%: split horizontally — left half warm tan (#B8764A) with 2 bullet lines in dark maroon text; right half hot pink (#CF3070) with CTA button in white. Crisp geometric divisions, flat colors, modern.`,
    landscapeVisual: `LAYOUT (Landscape 1.5:1): Left 45%: eggplant (#3D1935) — top-left Everstage colorful logo (white wordmark). Bold white headline, pain words in hot pink (#CF3070). 2-3 bullet lines in peach. Center: notification UI cards cascading commission errors. Right 55%: top half teal (#1BA894), bottom half orange (#E8893B). CTA button in white on the orange block. Flat colors, geometric grid.`,
  },
  'data-card': {
    name: 'Data Card',
    squareVisual: `LAYOUT (Square 1:1): Color-block grid on peach/cream (#F5CEB0) base. Top-left: Everstage colorful logo (dark maroon wordmark on light background). Large bold dark maroon (#2D1B30) headline, key stat word in periwinkle (#5465D4). Center: oversized stat number in hot pink (#CF3070) — bold, dominant. Right column: stacked flat color block (teal #1BA894) with white bullet points. Bottom: eggplant (#3D1935) strip with report/whitepaper mockup featuring Everstage branding. Clean, editorial, data-forward.`,
    landscapeVisual: `LAYOUT (Landscape 1.5:1): Peach (#F5CEB0) base. Top-left: Everstage colorful logo (dark maroon). Bold dark maroon headline, stat in periwinkle. Large hot pink stat number center-left. Right: teal (#1BA894) block with white bullets. Bottom strip: eggplant (#3D1935) with report mockup. Flat geometric color zones.`,
  },
  testimonial: {
    name: 'Testimonial',
    squareVisual: `LAYOUT (Square 1:1): Color-block geometric grid. Full top strip: periwinkle (#5465D4) — Everstage colorful logo centered (white wordmark). Main zone: large peach/cream (#F5CEB0) block (80% of canvas) with bold dark maroon (#2D1B30) serif quote text. Key phrase highlighted with hot pink (#CF3070) underline. Horizontal divider. Below: left — circular headshot photo with eggplant (#3D1935) border; right — bold dark maroon name, maroon subtitle, company logo. Bottom strip: eggplant (#3D1935) with CTA in orange (#E8893B). Clean, editorial.`,
    landscapeVisual: `LAYOUT (Landscape 1.5:1): Top strip: periwinkle (#5465D4) — Everstage colorful logo centered (white wordmark). Wide peach (#F5CEB0) zone with bold dark maroon quote. Key phrase in hot pink underline. Headshot left, name/title/company logo right. Bottom strip: eggplant (#3D1935) with CTA in orange. Flat, geometric.`,
  },
}

const LAYOUT_VISUALS: Record<LayoutTemplate, { name: string; squareVisual: string; landscapeVisual: string }> = {
  statement: {
    name: 'Statement',
    squareVisual: `LAYOUT (Square 1:1): Deep navy (#0A1628) background fills the entire image. Top-left: Everstage "everstage" wordmark logo in white — small, clean. Below logo, left 60% of image: Large bold white headline text with key word/phrase rendered in gold (#F5A623). Medium-weight white subheadline below. 2-3 bullet points with short text below that. Right 40%: A polished 3D isometric illustration of a clean commission dashboard — glowing blue metrics, revenue charts, green check marks — floating on a dark surface, conveying precision and automation. Decorative dark blue circular blob shapes in top-right and bottom-left corners. Small 4-pointed white sparkle star accents scattered. High contrast, premium B2B aesthetic.`,
    landscapeVisual: `LAYOUT (Landscape 1.5:1 wider format): Deep navy (#0A1628) background. Top-left: Everstage "everstage" wordmark logo in white — small, clean. Below logo, left 55% of image: Large bold white headline text with key word/phrase in gold (#F5A623). Subheadline below in white. 2-3 bullet points below that. Right 45%: 3D isometric commission dashboard illustration with glowing metrics and clean data viz. Decorative circular blobs in corners, sparkle accents. Premium B2B SaaS aesthetic.`,
  },
  'pain-story': {
    name: 'Pain Story',
    squareVisual: `LAYOUT (Square 1:1): Two-tone vertical layout. Top 60%: Dark charcoal (#1A1A1A) background — top-left: Everstage "everstage" logo in white, small. Below logo: large bold white headline text with key words in gold/amber (#F5A623), dramatic and punchy. Center-right: Realistic photo of a stressed, focused ops manager or finance director at a cluttered desk — laptop open, papers stacked, looking overwhelmed. Top-right: Semi-transparent notification UI cards (simulating Slack/email alerts) with red badges showing commission errors and discrepancies cascading down. Middle-right: A sticky note reading "CHECK AGAIN." Bottom 25%: Light cream (#F5F5E8) strip with 2-3 concise bullet points in amber text (matching the body copy). Very bottom: Full-width dark navy bar with a gold/amber rounded CTA button right-aligned.`,
    landscapeVisual: `LAYOUT (Landscape 1.5:1): Two-tone horizontal layout. Main dark charcoal (#1A1A1A) background, upper 65%. Top-left: Everstage "everstage" logo in white, small. Below logo: bold large white headline with amber accent words — stacked dramatically. Below: 2-3 bullet points in gold text. Center: Stressed ops/finance professional photo at desk, overwhelmed. Right: Notification cards (Slack, Email) cascading with commission errors. Bottom 20%: Cream strip with solution bullets in amber. Very bottom: Full-width dark navy CTA bar, gold button right.`,
  },
  'data-card': {
    name: 'Data Card',
    squareVisual: `LAYOUT (Square 1:1): Light cream (#F5F0D0) gradient to white background. Top-left: Everstage "everstage" logo in dark navy. Large bold italic serif typeface headline in dark navy (#0A1628), key phrase highlighted in royal blue (#1B3FCC). Below headline: subheadline in dark gray. Center-right: A large lime green (#B8F060) oversized number or stat. Right column: Short white-background card with 2-3 bullet points or data findings. Bottom half: Tilted whitepaper or report mockup with "everstage" branding on the cover, sitting on a surface. Bottom: Layered teal/aqua organic wave shapes. Clean, airy, thought-leadership aesthetic.`,
    landscapeVisual: `LAYOUT (Landscape 1.5:1): Light cream (#F5F0D0) to white gradient. Top-left: Everstage logo in dark navy. Large bold italic serif headline in dark navy, key word in royal blue. Subheadline below. Left-center: Large lime green stat number. Right: Report/whitepaper mockup tilted, with Everstage branding. Bottom: Teal wave shapes. Clean and professional.`,
  },
  testimonial: {
    name: 'Testimonial',
    squareVisual: `LAYOUT (Square 1:1): Cobalt/royal blue (#1B3FCC) background fills the image. Top-center: Everstage "everstage" logo in white. Large centered white rounded-corner card (80% width, 72% height) with soft drop shadow on the blue background. Inside the card: Large serif quote text in dark navy — 2-3 key words highlighted in royal blue (#1B3FCC) with a slight underline. Horizontal thin divider line. Below divider: Left side has a square headshot photo (rounded corners) of a professional person. Right of photo: Person's name in bold dark navy, job title below in gray, company logo below. Card has a subtle teal/purple gradient glow on its bottom edge.`,
    landscapeVisual: `LAYOUT (Landscape 1.5:1): Royal blue (#1B3FCC) background. Everstage logo top-center in white. Centered white rounded card (85% width, 70% height) with soft shadow. Inside: Large serif quote in dark navy, key phrase in blue. Horizontal divider. Below: headshot left, name + title + company logo right. Subtle gradient on card bottom edge.`,
  },
}

export function buildImagePrompt(req: GenerateRequest, copy: AdCopy, format: 'square' | 'landscape'): string {
  const isNew = req.brandTheme === 'new'
  const formatLabel = format === 'square' ? 'Square (1:1), 1024×1024px' : 'Landscape (1.5:1), 1536×1024px'
  const formatNote = format === 'square'
    ? 'Adapt the layout described below to a square (1:1) composition.'
    : 'Adapt the layout described below to a landscape (1.5:1 wider) composition.'

  const bodyText = copy.body.map(b => `• ${b}`).join('\n')
  const conceptHook = req.concept?.hook ? `CONCEPT HOOK: "${req.concept.hook}"` : ''
  const layouts = isNew ? NEW_LAYOUT_VISUALS : LAYOUT_VISUALS
  const visualDirection = req.concept?.visualDirection
    ?? layouts[req.layout][format === 'square' ? 'squareVisual' : 'landscapeVisual']

  const brandRequirements = isNew
    ? `BRAND REQUIREMENTS (NEW BRAND):
- Bold geometric color-block grid — no white space, every zone filled with a flat brand color
- LOGO: The input image contains the official Everstage logo. Reproduce it exactly — do not draw a substitute. Use the full-color version (multicolor icon + dark maroon wordmark) on light/pastel blocks; white wordmark version on dark/eggplant blocks. Place top-left unless the visual direction specifies otherwise.
- Do NOT render any product description, category label, or marketing tagline as text — only render the exact copy listed above
- New brand colors: eggplant #3D1935 · hot pink #CF3070 · periwinkle #5465D4 · teal #1BA894 · orange #E8893B · tan #B8764A · peach #F5CEB0
- CTA button in warm orange (#E8893B) with dark maroon (#2D1B30) text
- Text crisp and legible — dark maroon on light blocks, white on dark blocks
- Modern, vibrant, editorial enterprise aesthetic — bold flat colors, no gradients
- No competitor brand names or logos`
    : `BRAND REQUIREMENTS:
- Deep navy (#0A1628) or dark background unless the visual direction specifies otherwise
- LOGO: The input image contains the official Everstage logo (circular icon + "everstage" wordmark). You MUST reproduce this exact logo on the creative — do not draw a substitute. On dark backgrounds render it in white; on light backgrounds render it in navy. Place it top-left unless the visual direction specifies otherwise. Keep proportions intact.
- Do NOT render any product description, category label, or marketing tagline as text on the image — only render the exact copy listed in the EXACT COPY section above
- Brand colors: navy #0A1628, royal blue #1B3FCC, gold #F5A623, lime green #B8F060, teal #4DC8B4
- CTA button in gold (#F5A623) with dark text
- Text must be crisp, legible, and high-contrast against its background
- Premium enterprise B2B aesthetic — not startup-casual, not generic
- No competitor brand names or logos
- Photorealistic where photography is specified; flat/3D illustration where specified`

  return `Create a professional LinkedIn single image advertisement for Everstage — an AI-powered sales commission management platform for B2B enterprise companies.

AD FORMAT: ${formatLabel}
${formatNote}

TARGET AUDIENCE: ${req.campaignName} at ${req.verticalLabel} companies
PAIN THEME: ${req.themeName}
${conceptHook}

EXACT COPY TO RENDER ON THE IMAGE (render precisely as written):
Headline: "${copy.headline}"
Subheadline: "${copy.subheadline}"
Body:
${bodyText}
CTA Button: "${copy.cta}"

VISUAL DIRECTION (follow this closely):
${visualDirection}

${brandRequirements}`
}

// ─── Creative Concept Generation ────────────────────────────────────────────

const FEW_SHOT_ANGLE = `Ops admin spends hours each week manually verifying commission accuracy line by line → direct time cost with no leverage and no scalability as headcount grows`

const FEW_SHOT_CONCEPTS = `
CONCEPT 1 — "The Time Sink" (Quantified Pain)
Format Tag: Quantified Pain
Personality Tag: Sharp Expert
Hook: "10+ hours/week… just checking commissions?"
Visual Direction: Left side: oversized bold "10+ HOURS / WEEK" in gold. Right side: ops person buried in spreadsheets at a desk. Overlay: ticking clock icon with a red glow.
Emotional Register: Frustration → Self-diagnosis. The specific number makes readers instantly calculate their own time lost.
Narrative Structure: Specific number → Universal pain. Leads with the quantified cost, lands on the universal experience.
CTA Direction: See how it works
Scroll Stopper: The specific number forces immediate self-diagnosis — "wait, is that me?"

CONCEPT 2 — "This Shouldn't Exist"
Format Tag: Fake Artifact
Personality Tag: Witty Colleague
Hook: "Why does this role even exist?"
Visual Direction: Screenshot-style fake job posting: title "Commission Accuracy Checker", responsibilities listed as "Review 1,000+ rows manually every month." Slightly absurdist, clinical tone.
Emotional Register: Embarrassment → Provocation. Challenges the reader to question whether this is a legitimate use of ops headcount.
Narrative Structure: Provocative claim → Implied indictment. The job description speaks for itself.
CTA Direction: See if you qualify
Scroll Stopper: The fake job posting format is unexpected — pattern interrupt that makes people read more carefully.

CONCEPT 3 — "Before vs. After" Split
Format Tag: Before / After
Personality Tag: Pragmatic Challenger
Hook: "Before: spreadsheets. After: autopilot."
Visual Direction: Clean split screen. Left half: messy Excel with highlighted errors, red cells, timestamps. Right half: clean Everstage dashboard with green checkmarks, automated status indicators.
Emotional Register: Relief. The transformation is immediately visible without reading a word.
Narrative Structure: Before/After. Pure visual contrast does the persuasion.
CTA Direction: See the difference
Scroll Stopper: Transformation visuals — the contrast is processed in under a second.

CONCEPT 4 — "The Hidden Cost"
Format Tag: Reframe
Personality Tag: Straight Talker
Hook: "The real cost isn't the errors."
Visual Direction: Minimalist dark background. Three bullet lines stacking down: "Time wasted." "Delayed payouts." "Ops burnout." Each line appears with an icon. Final line in gold: "It's the hours spent preventing them."
Emotional Register: Realization. Pattern interrupt — flips what the reader expected to be the point.
Narrative Structure: Reframe → Deeper truth. Acknowledges the obvious cost (errors) then surfaces the hidden one (time).
CTA Direction: Calculate your real cost
Scroll Stopper: "The real cost isn't the errors" is a genuine pattern interrupt — it contradicts the assumed framing.

CONCEPT 5 — "The Scaling Problem"
Format Tag: Data Visualization
Personality Tag: Pragmatic Challenger
Hook: "Headcount grows. So does the problem."
Visual Direction: Two simple line graphs side by side. Left: "Team size" going up cleanly. Right: "Manual verification hours" going up faster, steeper — diverging upward. Minimal, data-viz style.
Emotional Register: Dread / Urgency. Leaders see this as a structural problem, not a temporary one.
Narrative Structure: Visual metaphor of exponential growth → implied breaking point.
CTA Direction: See how teams scale commission ops
Scroll Stopper: The diverging graphs make the problem feel inevitable — not just current pain, future catastrophe.

CONCEPT 6 — "The Relatable Ops Moment"
Format Tag: Relatable Moment
Personality Tag: Empathetic Partner
Hook: "End of month = commission chaos"
Visual Direction: Calendar with the 31st circled in red, "EOM" scrawled on it. Cascading Slack and email notification cards exploding to the right — commission errors, exceptions, "can you check this?" threads. Chaotic, busy layout.
Emotional Register: Extreme relatability → shared exhaustion. Anyone who lives this moment will stop scrolling.
Narrative Structure: Relatable moment trigger. No argument needed — the image is the proof.
CTA Direction: There's a better way
Scroll Stopper: Every ops person has this exact calendar moment burned into memory.

CONCEPT 7 — "The Blunt Truth"
Format Tag: Contrarian Statement
Personality Tag: Straight Talker
Hook: "Spreadsheets aren't a system."
Visual Direction: Giant spreadsheet screenshot fills the frame — hundreds of rows, dozens of columns, a few cells with red error triangles. Bold white overlay text on top: "Spreadsheets aren't a system."
Emotional Register: Mild shame → Clarity. The reader knows this is true but hasn't said it out loud yet.
Narrative Structure: Strong opinionated stance → implicit challenge to disagree.
CTA Direction: See what a real system looks like
Scroll Stopper: The declarative "aren't a system" is a claim people either strongly agree or bristle at — both drive engagement.

CONCEPT 8 — "Ops Burnout" Emotional Play
Format Tag: Emotional Play
Personality Tag: Empathetic Partner
Hook: "No one signed up for this part of the job."
Visual Direction: Muted, slightly desaturated photo of an ops professional — tired expression, stack of papers, late-hour desk light. Quiet, human, not dramatic. Text is secondary.
Emotional Register: Empathy → Validation. Acknowledges the human cost before going anywhere near the product.
Narrative Structure: Empathy → Resolution. Leads with "I see you" before offering the way out.
CTA Direction: Reclaim your time
Scroll Stopper: The emotional honesty is rare in B2B ads — it stops people because it feels like it's talking to them, not at them.

CONCEPT 9 — "The Math Problem"
Format Tag: Abstract Metaphor
Personality Tag: Sharp Expert
Hook: "1,000 rows × human error = risk"
Visual Direction: Equation-style typographic layout on dark background. "1,000 ROWS" + "HUMAN ERROR" = "RISK" — each element bold, equation sign in gold. Red error symbols scattered as texture.
Emotional Register: Logic → Low-grade anxiety. Appeals to the analytical ops brain — makes the risk feel calculated and undeniable.
Narrative Structure: Simple equation → inescapable conclusion.
CTA Direction: Eliminate the variable
Scroll Stopper: The equation framing is instantly processable — it makes an abstract risk feel concrete.

CONCEPT 10 — "Future vs. Present"
Format Tag: Time-Bound Urgency
Personality Tag: Witty Colleague
Hook: "Still doing this in 2026?"
Visual Direction: Split frame. Left: grainy, slightly vintage-filter spreadsheet. Right: clean, modern Everstage UI. Left labeled "Today" in a worn typeface. Right labeled "Where your team should be."
Emotional Register: Urgency + Mild embarrassment. Time-based framing makes the current state feel overdue for a change.
Narrative Structure: Present state (outdated) → Future state (available now). The year in the hook makes the gap feel impossible to ignore.
CTA Direction: Make the move
Scroll Stopper: "Still doing this in 2026?" is a self-assessment prompt — people read it and immediately answer themselves.
`.trim()

export function buildConceptsSystemPrompt(): string {
  return `You are a senior B2B creative strategist for Everstage, an AI-powered sales commission management platform.

${BRAND_BRIEF}

Your job: given one ad angle from a campaign brief, generate exactly 10 distinct creative concepts for a LinkedIn single image ad.

QUALITY REFERENCE — here is one angle with 10 concepts generated for it. Use these as your benchmark for specificity, variety, and quality. You may use visual formats from this reference or invent entirely new ones — always choose the format that best serves the specific angle, persona, and emotional truth of the pain:

REFERENCE ANGLE: ${FEW_SHOT_ANGLE}

REFERENCE CONCEPTS:
${FEW_SHOT_CONCEPTS}

OUTPUT RULES:
- Generate exactly 10 concepts
- Each concept must use a meaningfully different visual format or narrative angle — no two should feel interchangeable
- Across the 10 concepts, cover a wide spread of format tags — do not repeat the same tag more than once
- Valid format tags (use these exactly, or invent a new one if the concept is genuinely novel): Quantified Pain · Before / After · Contrarian Statement · Relatable Moment · Data Visualization · Emotional Play · Abstract Metaphor · Reframe · Fake Artifact · Time-Bound Urgency · Meme Template · Knowledge Gap · Named Entity · Original Composition · Question Hook · Copy-Paste Action
- Across the 10 concepts, cover all 5 personality traits — valid values: Sharp Expert · Straight Talker · Empathetic Partner · Witty Colleague · Pragmatic Challenger. Each trait should appear at least once; aim for 2 each across 10 concepts
- The hook is a plain-language creative direction, not final copy
- Visual Direction must be specific enough to brief a designer or image model — not vague
- Keep every field tight — one or two sentences max per field

Return a raw JSON array of exactly 10 objects — no markdown fences, no explanation, just the array:
[
  {
    "conceptNumber": number (1-10),
    "formatTag": string,
    "personalityTag": string,
    "hook": string,
    "visualDirection": string,
    "emotionalRegister": string,
    "narrativeStructure": string,
    "ctaDirection": string,
    "scrollStopper": string
  }
]`
}

const INTENT_BRIEFS: Record<string, string> = {
  awareness: `CAMPAIGN INTENT: Awareness
The reader may not yet know they have this problem — or hasn't named it. Do not pitch, do not ask for a click, do not reference Everstage directly. The sole job is to make them stop, feel recognised, and think "that's exactly me." Prioritise concepts that name the pain precisely, create a moment of self-diagnosis, or reframe something they've accepted as normal. Emotional resonance beats logic here.`,

  consideration: `CAMPAIGN INTENT: Consideration
The reader knows the problem exists but hasn't committed to solving it yet — or is evaluating options. Concepts should introduce doubt about their current approach, surface the hidden cost of inaction, or show what a better state looks like. Comparisons, reframes, and before/after structures work well here. Light credibility signals are appropriate — data, named pain, implied proof.`,

  conversion: `CAMPAIGN INTENT: Conversion
The reader is close to acting. Concepts should reduce friction, create urgency, and make the next step feel low-risk and obvious. Specific proof, concrete outcomes, and direct CTAs outperform emotional plays here. Every concept should have a clear ask and a reason to act now rather than later.`,
}

export function buildConceptsUserPrompt(req: { verticalLabel: string; campaignName: string; themeName: string; angle: { description: string; frequency: number; quote?: string }; implication?: { label: string; expansion: string }; intent?: string; customContext?: string }): string {
  const intentBlock = req.intent && INTENT_BRIEFS[req.intent]
    ? `\n${INTENT_BRIEFS[req.intent]}`
    : ''

  const implicationBlock = req.implication
    ? `\nSELECTED IMPLICATION — this is the emotional core the marketer has validated. Every concept must be anchored to this identity-level truth:
"${req.implication.label}": ${req.implication.expansion}`
    : ''

  const customContextBlock = req.customContext?.trim()
    ? `\nMARKETER CONTEXT (treat this as primary creative direction — honour the specific language, claims, or framing provided here):
${req.customContext.trim()}`
    : ''

  return `Generate 10 creative concepts for this ad angle:

VERTICAL: ${req.verticalLabel}
CAMPAIGN / AUDIENCE: ${req.campaignName}
PAIN THEME: ${req.themeName}
ANGLE (Freq: ${req.angle.frequency}): ${req.angle.description}
${req.angle.quote ? `BUYER VERBATIM: "${req.angle.quote}"` : ''}${intentBlock}${implicationBlock}${customContextBlock}

The buyer verbatim (if provided) reflects how this person actually talks about this pain — concepts that borrow that language will resonate harder. The selected implication (if provided) is the validated emotional truth this persona feels — let it shape the hook, tone, and narrative of every concept.${req.customContext?.trim() ? ' The marketer context above takes priority — integrate it directly into the concepts.' : ''}`
}

export function buildRefinedImagePrompt(
  req: GenerateRequest,
  copy: AdCopy,
  format: 'square' | 'landscape',
  changeHistory: string[]
): string {
  const base = buildImagePrompt(req, copy, format)
  if (changeHistory.length === 0) return base
  return `${base}

REQUESTED CHANGES — apply these modifications to the design described above. Preserve all other visual elements, copy, brand colors, and layout exactly as specified. Only change what is listed here:
${changeHistory.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
}

// ─── Educational Asset Generation ────────────────────────────────────────────

export function buildEducationalDirectionsSystemPrompt(): string {
  return `You are a senior B2B creative strategist for Everstage, an AI-powered sales commission management platform.

${BRAND_BRIEF}

Your job: given a thought leadership report or guide being promoted, generate exactly 3 distinctly different visual directions for a LinkedIn single image ad.

Each direction must differ meaningfully in:
- Color palette (use Everstage brand colors but in different combinations and ratios)
- Layout composition (where headline, report mockup, and supporting elements sit)
- Mood/aesthetic (e.g. dark premium vs editorial light vs bold energetic vs minimalist typographic)
- Visual element treatment (3D report mockup vs flat cover vs typographic dominant vs photography)

Return raw JSON only — no markdown fences, no explanation:
[
  {
    "name": "2-4 word name for this direction",
    "description": "Detailed visual direction brief, 4-6 sentences. Must be specific enough to brief an image generation model: state the background color(s), layout composition, where the report mockup sits, typography treatment, decorative elements, and where the Everstage logo and CTA button appear."
  }
]`
}

export function buildEducationalDirectionsUserPrompt(req: { guideTitle: string; bodyCopy: string; cta: string }): string {
  return `Generate 3 distinct visual directions for a LinkedIn ad promoting this asset:

REPORT/GUIDE TITLE: "${req.guideTitle}"
KEY MESSAGE / BODY COPY: "${req.bodyCopy}"
CTA: "${req.cta}"

Make the three directions genuinely different — a reader should be able to tell them apart at a glance.`
}

export function buildEducationalImagePrompt(
  req: { guideTitle: string; bodyCopy: string; cta: string },
  direction: { name: string; description: string },
  format: 'square' | 'landscape'
): string {
  const formatLabel = format === 'square' ? 'Square (1:1), 1024×1024px' : 'Landscape (1.5:1), 1536×1024px'
  const formatNote = format === 'square'
    ? 'Adapt the layout to a square (1:1) composition.'
    : 'Adapt the layout to a landscape (1.5:1 wider) composition.'

  return `Create a professional LinkedIn single image advertisement for Everstage promoting a thought leadership report/guide.

AD FORMAT: ${formatLabel}
${formatNote}

ASSET BEING PROMOTED: "${req.guideTitle}"
KEY MESSAGE: "${req.bodyCopy}"
CTA: "${req.cta}"

VISUAL DIRECTION — ${direction.name}:
${direction.description}

CRITICAL REQUIREMENTS:
- The report/guide title "${req.guideTitle}" must appear prominently on the image as rendered text
- A professional report/guide cover mockup with "everstage" branding on the cover should be featured
- "everstage" wordmark logo must appear separately as well — white on dark backgrounds, navy on light
- CTA button labeled exactly "${req.cta}" must be prominent
- Brand colors available: navy #0A1628, royal blue #1B3FCC, gold #F5A623, lime green #B8F060, teal #4DC8B4
- Premium enterprise B2B aesthetic — not startup-casual
- All text rendered crisply and legibly
- No competitor logos or brand names`
}

// ─── Social Proof: Review Badges ─────────────────────────────────────────────

export function buildBadgeDirectionsSystemPrompt(): string {
  return `You are a senior B2B creative strategist for Everstage, an AI-powered sales commission management platform.

${BRAND_BRIEF}

Your job: given a set of customer review badges (e.g. G2, Capterra) being featured in a LinkedIn ad, generate exactly 3 distinctly different visual directions.

Each direction must differ in:
- Color palette and background treatment (use Everstage brand colors differently each time)
- Badge placement and prominence (hero of the image vs balanced with copy vs clustered with supporting elements)
- Copy and layout composition (where headline, badges, and CTA sit relative to each other)
- Overall aesthetic mood (prestigious/dark, clean/light, bold/energetic)

The image generation model will receive the actual badge image(s) as visual input alongside your direction — so describe the overall ad layout and treatment, not the badge content itself.

Return raw JSON only — no markdown fences, no explanation:
[
  {
    "name": "2-4 word name for this direction",
    "description": "4-6 sentences. Describe: background color and treatment, where the badge(s) are placed and how large, the headline/tagline treatment, supporting copy layout, where the Everstage logo and CTA button appear, any decorative elements."
  }
]`
}

export function buildBadgeDirectionsUserPrompt(req: { tagline: string; cta: string; badgeCount: number }): string {
  return `Generate 3 distinct visual directions for a LinkedIn ad featuring ${req.badgeCount} review badge${req.badgeCount > 1 ? 's' : ''}.

TAGLINE: "${req.tagline}"
CTA: "${req.cta}"
BADGE COUNT: ${req.badgeCount} badge${req.badgeCount > 1 ? 's — all must be visible and legible in each variation' : ''}

Make the three directions look genuinely different from each other at a glance.`
}

export function buildBadgeImagePrompt(
  req: { tagline: string; cta: string; badgeCount: number },
  direction: { name: string; description: string },
  format: 'square' | 'landscape'
): string {
  const formatLabel = format === 'square' ? 'Square (1:1), 1024×1024px' : 'Landscape (1.5:1), 1536×1024px'
  const formatNote = format === 'square'
    ? 'Adapt the layout to a square (1:1) composition.'
    : 'Adapt the layout to a landscape (1.5:1 wider) composition.'

  return `Create a professional LinkedIn single image advertisement for Everstage, an AI-powered sales commission management platform, showcasing customer review achievements.

AD FORMAT: ${formatLabel}
${formatNote}

The uploaded image${req.badgeCount > 1 ? 's show' : ' shows'} the actual review badge${req.badgeCount > 1 ? 's' : ''} to feature — preserve and display ${req.badgeCount > 1 ? 'all of them' : 'it'} accurately and legibly. Do not modify or stylize the badge artwork.

TAGLINE: "${req.tagline}"
CTA: "${req.cta}"

VISUAL DIRECTION — ${direction.name}:
${direction.description}

CRITICAL REQUIREMENTS:
- Badge${req.badgeCount > 1 ? 's' : ''} from the uploaded image${req.badgeCount > 1 ? 's' : ''} must be prominently displayed and fully legible
- "everstage" wordmark logo must appear — white on dark backgrounds, navy on light
- CTA button labeled exactly "${req.cta}" must be prominent
- Brand colors: navy #0A1628, royal blue #1B3FCC, gold #F5A623, lime green #B8F060, teal #4DC8B4
- Premium enterprise B2B aesthetic
- No competitor logos or brand names`
}

// ─── Social Proof: Testimonials ───────────────────────────────────────────────

export function buildTestimonialDirectionsSystemPrompt(): string {
  return `You are a senior B2B creative strategist for Everstage, an AI-powered sales commission management platform.

${BRAND_BRIEF}

Your job: given a customer testimonial, generate exactly 3 distinctly different visual directions for a LinkedIn single image ad.

The image generation model will receive the person's actual headshot photo (and optionally their company logo) as visual inputs — so your directions must specify how the photo is integrated into the layout. Do not describe the person's appearance; describe where and how the photo is used compositionally.

Each direction must differ in:
- How the headshot is framed and positioned (circular crop, full-height panel, blurred background, small card inset, etc.)
- Color palette (use Everstage brand colors but in different combinations)
- Quote treatment and typography (large serif centered, left-aligned bold, highlighted key phrase, etc.)
- Overall layout and mood

Return raw JSON only — no markdown fences, no explanation:
[
  {
    "name": "2-4 word name for this direction",
    "description": "4-6 sentences. Describe: background, how/where the headshot photo appears, quote typography and placement, name/title/company treatment, company logo placement (if provided), Everstage logo placement, CTA treatment, decorative elements."
  }
]`
}

export function buildTestimonialDirectionsUserPrompt(req: { name: string; title: string; company: string; quote: string; cta: string; hasLogo: boolean }): string {
  return `Generate 3 distinct visual directions for a LinkedIn testimonial ad.

PERSON: ${req.name}, ${req.title} at ${req.company}
QUOTE: "${req.quote}"
CTA: "${req.cta}"
COMPANY LOGO PROVIDED: ${req.hasLogo ? 'Yes — incorporate it in each direction' : 'No'}

Make the three directions look meaningfully different — different photo treatments, different color palettes, different quote presentations.`
}

export function buildTestimonialImagePrompt(
  req: { quote: string; name: string; title: string; company: string; cta: string; hasLogo: boolean },
  direction: { name: string; description: string },
  format: 'square' | 'landscape'
): string {
  const formatLabel = format === 'square' ? 'Square (1:1), 1024×1024px' : 'Landscape (1.5:1), 1536×1024px'
  const formatNote = format === 'square'
    ? 'Adapt the layout to a square (1:1) composition.'
    : 'Adapt the layout to a landscape (1.5:1 wider) composition.'

  return `Create a professional LinkedIn customer testimonial advertisement for Everstage, an AI-powered sales commission management platform.

AD FORMAT: ${formatLabel}
${formatNote}

The uploaded image${req.hasLogo ? 's include' : ' is'} the customer's actual headshot photo${req.hasLogo ? ' and their company logo' : ''} — use ${req.hasLogo ? 'them' : 'it'} exactly as provided. Do not substitute a different person's face or modify the logo.

TESTIMONIAL QUOTE: "${req.quote}"
PERSON: ${req.name}
TITLE: ${req.title}
COMPANY: ${req.company}
CTA: "${req.cta}"

VISUAL DIRECTION — ${direction.name}:
${direction.description}

CRITICAL REQUIREMENTS:
- Use the uploaded headshot — render this person's actual face accurately in the layout
${req.hasLogo ? '- Incorporate the uploaded company logo accurately — do not redraw or stylize it' : ''}
- Render the quote, name, title, and company exactly as written above
- "everstage" wordmark logo must appear separately — white on dark, navy on light
- CTA button labeled exactly "${req.cta}"
- Brand colors: navy #0A1628, royal blue #1B3FCC, gold #F5A623, lime green #B8F060, teal #4DC8B4
- Premium enterprise B2B aesthetic
- No competitor logos`
}
