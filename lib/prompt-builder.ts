import { AdCopy, IllustrationMode, GenerateRequest, LayoutTemplate, CreativeConcept } from './types'

const BRAND_BRIEF = `
BRAND: Everstage — AI-powered sales commission management and incentive compensation platform for B2B SaaS and enterprise companies. Replaces spreadsheets with automated, auditable commission calculations.

BRAND VOICE: Confident, pain-first, direct. Speaks the buyer's language — no jargon, no fluff. Empathetic to ops/finance pain, authoritative on outcomes.

BRAND AESTHETIC: Bold, editorial, and geometric. The visual identity is built around the "E-bar" motif — horizontal rectangular bars stacked in two staggered columns, mirroring the logo icon. This motif appears at many scales: as the logo itself, as a two-column checkerboard of brand-color blocks across a canvas, or as thin floating accent bars scattered across a photo. Compositions use flat solid color panels, or occasionally one of the brand gradients. Authentic photography is used where it adds human warmth — overlaid with floating colored bars, placed in grid quadrants alongside color blocks, or set as full-bleed backgrounds.

BRAND COLORS (flat):
- Deep eggplant: #2D1022 (the darkest background — richer and deeper than typical maroon)
- Mid maroon: #3D1935 (logo wordmark and text on light backgrounds)
- Cream: #F5F0E8 (primary light background)
- Teal: #1BA894
- Periwinkle: #6B70D9
- Orange: #E8893B
- Tan/brown: #B8764A
- Hot pink: #D63865

BRAND GRADIENTS (used for backgrounds and accent blocks — each is a smooth radial or linear blend):
- Warm tan gradient: #E8B88A → #C17A5A (golden to warm rose-tan)
- Amber gradient: #F4A830 → #E8893B (bright yellow-orange to warm orange)
- Teal gradient: #4DD4C0 → #1BA894 (sky-cyan to teal)
- Periwinkle gradient: #8899F8 → #6B70D9 (lavender-blue to periwinkle)
- Pink gradient: #F06090 → #D63865 (bubblegum to hot pink)
- Dark gradient: #2D1022 → #7A2020 (eggplant to rust-maroon — used on LinkedIn banners)

TYPOGRAPHY:
- Headlines: FK Roman — elegant editorial serif, warm and confident; used large and dominant on any colored background
- Body / CTA: Roobert — clean geometric sans-serif; used for subheads, labels, and CTAs

LOGO: The "E" icon = 5 horizontal bars in two staggered columns: tan (top, short), orange (full-width), teal (long), periwinkle (short), hot pink (long) — the bars alternate left/right offset like steps. Paired with "Everstage" wordmark in Roobert. On dark/eggplant: white wordmark + colored icon. On light/cream: dark maroon (#3D1935) wordmark + colored icon.

CORE VISUAL MOTIFS (use these as the building blocks — mix freely):
1. E-GRID / STAGGERED BARS: Two columns of rectangular blocks alternating filled/empty in brand colors against a contrasting background (e.g. periwinkle + eggplant, orange + eggplant, hot pink + eggplant). Blocks stagger left-right like the logo — this is the signature brand pattern.
2. FLOATING BAR OVERLAY: Thin horizontal bars in brand colors (teal, orange, periwinkle, hot pink, tan) scattered at different lengths and positions over a photo or dark background. The bars float freely — not aligned to a grid — creating texture and energy.
3. PHOTO + COLOR SPLIT GRID: The canvas is divided into quadrants — some show authentic photography, others are flat brand-color blocks. Creates a rhythm of image and color.
4. HEADSHOT ON SOLID COLOR: A centered headshot/portrait on a flat brand color background (teal, orange, periwinkle), with small cream or white bars scattered lightly around it.
5. BOLD TYPE AS SCENERY: Oversized Roobert or FK Roman text fills most of the canvas, with a person or product photo layered on top or in front of the type.
6. MULTI-COLOR TEXT LIST: On a dark eggplant background, each line of text is rendered in a different brand color using Roobert Bold — creates a vibrant, energetic look.
7. GRADIENT BACKGROUND: A single brand gradient fills the entire canvas, with centered text and optional subtle grid overlay.

PHOTOGRAPHY: Authentic, real people — sales, finance, and ops professionals in real settings. Warm natural light. Not stiff or posed. A slight warm-to-cool color cast is acceptable (the brand tints photos with gradient overlays).
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

// ─── Layout Visual Directions (new brand only) ───────────────────────────────

const LAYOUT_VISUALS: Record<LayoutTemplate, { name: string; squareVisual: string; landscapeVisual: string }> = {
  statement: {
    name: 'Statement',
    squareVisual: `LAYOUT (Square 1:1): Full-bleed authentic photo of a confident sales or finance professional fills the canvas — warm natural light, real setting. Over the photo, scatter 6–8 thin horizontal bars in brand colors (teal #1BA894, orange #E8893B, periwinkle #6B70D9, hot pink #D63865, tan #B8764A) at varying lengths and heights — floating freely, not aligned. Top-left: Everstage linear logo (white wordmark + colored E icon). Bottom: deep eggplant (#2D1022) strip ~25% height — FK Roman large white serif headline, key phrase bold. Below headline: Roobert white subheadline, smaller. Bottom-right: orange (#E8893B) rounded CTA button, dark maroon Roobert text.`,
    landscapeVisual: `LAYOUT (Landscape 1.5:1): Full-bleed authentic photo of a confident professional, warm light. Scattered thin brand-color bars (teal, orange, periwinkle, hot pink, tan) float over the photo at different heights and widths. Top-left: Everstage linear logo (white). Bottom strip: deep eggplant (#2D1022) ~20% height — FK Roman large white serif headline, Roobert white subheadline. Bottom-right: orange (#E8893B) CTA button, dark maroon text.`,
  },
  'pain-story': {
    name: 'Pain Story',
    squareVisual: `LAYOUT (Square 1:1): 2×2 photo-and-color split grid. Top-left quadrant: flat teal (#1BA894) block. Top-right quadrant: authentic photo of an ops/finance professional — real desk setting, slightly stressed energy. Bottom-left quadrant: authentic photo or warm orange (#E8893B) block. Bottom-right quadrant: deep eggplant (#2D1022) — Everstage linear logo (white wordmark) top-right of this panel, FK Roman white headline, hot pink (#D63865) accent on key phrase, Roobert white subheadline, orange CTA button. Crisp quadrant edges, no gradients.`,
    landscapeVisual: `LAYOUT (Landscape 1.5:1): Left 55%: authentic photo of stressed professional at desk. Right 45%: deep eggplant (#2D1022) panel — Everstage linear logo (white) top-right, FK Roman large white headline with hot pink key phrase, Roobert white subheadline, orange (#E8893B) CTA button bottom. Small teal accent bar at top of right panel.`,
  },
  'data-card': {
    name: 'Data Card',
    squareVisual: `LAYOUT (Square 1:1): E-grid / staggered bars pattern — two columns of large rectangular blocks alternating filled/empty against deep eggplant (#2D1022) background, like a vertical checkerboard with offset rows. Block colors: tan (#B8764A), orange (#E8893B), teal (#1BA894), periwinkle (#6B70D9), hot pink (#D63865) — one color per row. Blocks stagger left-right column, wider on one side. Left zone (over the clear eggplant space): FK Roman oversized white serif headline, oversized stat or key number in hot pink (#D63865), Roobert white subheadline. Top-left: Everstage linear logo (white wordmark + colored icon). Bottom-right: orange CTA button.`,
    landscapeVisual: `LAYOUT (Landscape 1.5:1): Left 40%: E-grid staggered bars — color blocks (teal, orange, tan, periwinkle, hot pink) alternating with eggplant gaps in two offset columns. Right 60%: deep eggplant (#2D1022) — FK Roman very large white serif headline dominating, oversized hot pink stat number. Everstage linear logo top-right (white). Orange CTA button bottom-right.`,
  },
  testimonial: {
    name: 'Testimonial',
    squareVisual: `LAYOUT (Square 1:1): Top strip: full-width periwinkle (#6B70D9) ~15% height — Everstage linear logo left-aligned (white wordmark + colored icon). Center zone: cream (#F5F0E8) background ~55% height — FK Roman large dark maroon serif quote centered, key phrase underlined in hot pink (#D63865). Thin horizontal divider. Below divider in same cream zone: headshot photo left (circular crop, eggplant-colored ring border), right: FK Roman bold dark maroon name, Roobert dark maroon title and company. Bottom strip: deep eggplant (#2D1022) ~20% — orange (#E8893B) CTA button centered, dark maroon text.`,
    landscapeVisual: `LAYOUT (Landscape 1.5:1): Left panel (40%): headshot photo fills the panel, teal (#1BA894) or periwinkle tint overlay, scattered cream bars as accent. Right panel (60%): cream (#F5F0E8) background — Everstage linear logo top-right (dark maroon). FK Roman large dark maroon quote, hot pink underline on key phrase. Roobert name, title, company below divider. Bottom strip: eggplant (#2D1022), orange CTA.`,
  },
}

const TEXT_ONLY_VISUAL: Record<'square' | 'landscape', string> = {
  square: `LAYOUT (Square 1:1): Pure typographic composition — no photography, no illustration. Deep eggplant (#2D1022) background. Scatter 5–7 thin horizontal floating bars near the top and bottom edges in brand colors (teal, orange, periwinkle, hot pink, tan) at varying lengths — like the logo bars floating free of the grid. Top-left: Everstage linear logo (white wordmark + colored icon). Vertically centered: FK Roman oversized white serif headline dominating two-thirds of the canvas. Key phrase rendered in hot pink (#D63865). Below headline: Roobert white subheadline, regular weight, noticeably smaller. Bottom-right: orange (#E8893B) rounded CTA button, dark maroon Roobert text. The typography IS the design — nothing else.`,
  landscape: `LAYOUT (Landscape 1.5:1): Pure typographic composition — no photography. Deep eggplant (#2D1022) background. Thin floating brand-color bars (teal, orange, periwinkle) scattered near edges. Top-left: Everstage linear logo (white wordmark + colored icon). Center-left: FK Roman massive white serif headline spanning ~60% of canvas — key phrase in hot pink (#D63865). Below: Roobert white subheadline, regular weight. Bottom-right: orange (#E8893B) CTA button, dark maroon text. Clean, confident, type-led.`,
}

export function buildImagePrompt(req: GenerateRequest, copy: AdCopy, format: 'square' | 'landscape'): string {
  const textOnly = req.illustrationMode === 'without'
  const formatLabel = format === 'square' ? 'Square (1:1), 1024×1024px' : 'Landscape (1.5:1), 1536×1024px'
  const formatNote = format === 'square'
    ? 'Adapt the layout described below to a square (1:1) composition.'
    : 'Adapt the layout described below to a landscape (1.5:1 wider) composition.'

  const conceptHook = req.concept?.hook ? `CONCEPT HOOK: "${req.concept.hook}"` : ''
  const visualDirection = textOnly
    ? TEXT_ONLY_VISUAL[format]
    : (req.concept?.visualDirection ?? LAYOUT_VISUALS[req.layout][format === 'square' ? 'squareVisual' : 'landscapeVisual'])

  return `Create a professional LinkedIn single image advertisement for Everstage — an AI-powered sales commission management platform for B2B enterprise companies.

AD FORMAT: ${formatLabel}
${formatNote}

TARGET AUDIENCE: ${req.campaignName} at ${req.verticalLabel} companies
PAIN THEME: ${req.themeName}
${conceptHook}

EXACT COPY TO RENDER ON THE IMAGE (render precisely as written):
Headline: "${copy.headline}"
Subheadline: "${copy.subheadline}"
CTA Button: "${copy.cta}"

VISUAL DIRECTION (follow this closely):
${visualDirection}

BRAND REQUIREMENTS:
- LOGO: The input image contains the official Everstage logo (colorful stacked-bar E icon + "Everstage" wordmark in Roobert). Reproduce it exactly — do not redraw or substitute. Full-color icon + dark maroon wordmark on light/cream zones; white wordmark + colored icon on dark/eggplant zones. Place top-left or top-right per the visual direction.
- Brand colors: deep eggplant #2D1022 · cream #F5F0E8 · teal #1BA894 · periwinkle #6B70D9 · orange #E8893B · tan #B8764A · hot pink #D63865 · mid maroon #3D1935
- Visual motifs: floating thin horizontal bars in brand colors, E-grid staggered two-column checkerboard, photo-and-color split quadrants — use whichever the visual direction calls for
- Headlines in FK Roman serif — white on dark zones, dark maroon on cream zones
- Body/CTA in Roobert sans-serif
- CTA button: orange (#E8893B) background with dark maroon Roobert text
- Text crisp and legible — high contrast against its background
- Authentic photography where specified: real people, warm natural light, candid not posed
- Modern, bold, editorial enterprise aesthetic
- No competitor brand names or logos
- Do NOT render any product description, category label, or tagline — only the exact copy listed above`
}

// ─── Creative Concept Generation ────────────────────────────────────────────

const FEW_SHOT_ANGLE = `Ops admin spends hours each week manually verifying commission accuracy line by line → direct time cost with no leverage and no scalability as headcount grows`

const FEW_SHOT_CONCEPTS = `
CONCEPT 1 — "The Time Sink" (Quantified Pain)
Format Tag: Quantified Pain
Personality Tag: Sharp Expert
Hook: "10+ hours/week… just checking commissions?"
Visual Direction: Deep eggplant (#2D1022) background. Floating thin brand-color bars (teal, orange, periwinkle, hot pink) scattered across canvas at different lengths — the logo bars untethered. FK Roman oversized white headline centered: "10+ HOURS / WEEK" with "10+" in hot pink (#D63865). Below: Roobert white subheadline. Top-left: Everstage linear logo (white). Bottom-right: orange CTA button.
Emotional Register: Frustration → Self-diagnosis. The specific number makes readers instantly calculate their own time lost.
Narrative Structure: Specific number → Universal pain. Leads with the quantified cost, lands on the universal experience.
CTA Direction: See how it works
Scroll Stopper: The specific number forces immediate self-diagnosis — "wait, is that me?"

CONCEPT 2 — "This Shouldn't Exist"
Format Tag: Fake Artifact
Personality Tag: Witty Colleague
Hook: "Why does this role even exist?"
Visual Direction: Cream (#F5F0E8) background. Center: a clean screenshot-style fake job posting card with a thin tan border — title "Commission Accuracy Checker", responsibilities "Review 1,000+ rows manually every month." FK Roman dark maroon title, Roobert dark maroon body. Top-left: Everstage linear logo (dark maroon). Bottom strip: eggplant (#2D1022) with orange CTA button.
Emotional Register: Embarrassment → Provocation. Challenges the reader to question whether this is a legitimate use of ops headcount.
Narrative Structure: Provocative claim → Implied indictment. The job description speaks for itself.
CTA Direction: See if you qualify
Scroll Stopper: The fake job posting format is unexpected — pattern interrupt that makes people read more carefully.

CONCEPT 3 — "Before vs. After" Split
Format Tag: Before / After
Personality Tag: Pragmatic Challenger
Hook: "Before: spreadsheets. After: autopilot."
Visual Direction: Clean 2×2 grid split. Top-left: tan (#B8764A) block with Roobert label "Before" in dark maroon. Bottom-left: warm beige/cream with a messy spreadsheet visual — red error cells visible. Top-right: teal (#1BA894) block with Roobert label "After" in white. Bottom-right: deep eggplant with clean Everstage UI and orange CTA button. Everstage logo top-right (white on the eggplant side).
Emotional Register: Relief. The transformation is immediately visible without reading a word.
Narrative Structure: Before/After. Pure visual contrast does the persuasion.
CTA Direction: See the difference
Scroll Stopper: Transformation visuals — the contrast is processed in under a second.

CONCEPT 4 — "The Hidden Cost"
Format Tag: Reframe
Personality Tag: Straight Talker
Hook: "The real cost isn't the errors."
Visual Direction: Multi-color text list on eggplant (#2D1022). FK Roman large — each stacked line in a different brand color: "Time wasted." (teal), "Delayed payouts." (orange), "Ops burnout." (periwinkle), then hot pink (#D63865): "It's the hours spent preventing them." Everstage linear logo top-left (white). Orange CTA button bottom-right. No other elements — type as architecture.
Emotional Register: Realization. Pattern interrupt — flips what the reader expected to be the point.
Narrative Structure: Reframe → Deeper truth. Acknowledges the obvious cost (errors) then surfaces the hidden one (time).
CTA Direction: Calculate your real cost
Scroll Stopper: "The real cost isn't the errors" is a genuine pattern interrupt — it contradicts the assumed framing.

CONCEPT 5 — "The Scaling Problem"
Format Tag: Data Visualization
Personality Tag: Pragmatic Challenger
Hook: "Headcount grows. So does the problem."
Visual Direction: Periwinkle gradient background (#8899F8 → #6B70D9). Two simple line graphs side by side — left: "Team size" going up steadily; right: "Manual hours" going up steeper. Graph lines in white, axis labels in cream. FK Roman white headline above. Bottom strip: deep eggplant with Everstage logo (white) and orange CTA.
Emotional Register: Dread / Urgency. Leaders see this as a structural problem, not a temporary one.
Narrative Structure: Visual metaphor of exponential growth → implied breaking point.
CTA Direction: See how teams scale commission ops
Scroll Stopper: The diverging graphs make the problem feel inevitable — not just current pain, future catastrophe.

CONCEPT 6 — "The Relatable Ops Moment"
Format Tag: Relatable Moment
Personality Tag: Empathetic Partner
Hook: "End of month = commission chaos"
Visual Direction: Full-bleed authentic photo of ops professional looking stressed at laptop — warm desk light, human and overwhelmed. Floating thin bars in teal, orange, and hot pink scattered over the photo. Top-left: Everstage linear logo (white). Bottom strip: deep eggplant (#2D1022) — FK Roman white headline "End of month = commission chaos", key word in hot pink. Orange CTA bottom-right.
Emotional Register: Extreme relatability → shared exhaustion. Anyone who lives this moment will stop scrolling.
Narrative Structure: Relatable moment trigger. No argument needed — the image is the proof.
CTA Direction: There's a better way
Scroll Stopper: Every ops person has this exact calendar moment burned into memory.

CONCEPT 7 — "The Blunt Truth"
Format Tag: Contrarian Statement
Personality Tag: Straight Talker
Hook: "Spreadsheets aren't a system."
Visual Direction: E-grid staggered bars filling right 40% of canvas — alternating eggplant and periwinkle (#6B70D9) blocks in two offset columns. Left 60%: deep eggplant (#2D1022) — FK Roman massive white headline "Spreadsheets aren't a system." "aren't" underlined in hot pink. Roobert white subline below. Everstage logo top-left (white). Orange CTA bottom-right.
Emotional Register: Mild shame → Clarity. The reader knows this is true but hasn't said it out loud yet.
Narrative Structure: Strong opinionated stance → implicit challenge to disagree.
CTA Direction: See what a real system looks like
Scroll Stopper: The declarative "aren't a system" is a claim people either strongly agree or bristle at — both drive engagement.

CONCEPT 8 — "Ops Burnout" Emotional Play
Format Tag: Emotional Play
Personality Tag: Empathetic Partner
Hook: "No one signed up for this part of the job."
Visual Direction: Headshot-on-color treatment — teal (#1BA894) background fills the canvas. Centered photo of an ops professional, slightly tired expression, warm and human. Small cream-colored thin bars scattered lightly around the photo. FK Roman large white headline at bottom. Everstage linear logo top-left (white). Orange CTA button bottom-right.
Emotional Register: Empathy → Validation. Acknowledges the human cost before going anywhere near the product.
Narrative Structure: Empathy → Resolution. Leads with "I see you" before offering the way out.
CTA Direction: Reclaim your time
Scroll Stopper: The emotional honesty is rare in B2B ads — it stops people because it feels like it's talking to them, not at them.

CONCEPT 9 — "The Math Problem"
Format Tag: Abstract Metaphor
Personality Tag: Sharp Expert
Hook: "1,000 rows × human error = risk"
Visual Direction: Deep eggplant (#2D1022) background. FK Roman equation-style layout: "1,000 ROWS" (white, large) × "HUMAN ERROR" (white) = "RISK" (hot pink #D63865, largest of all) — stacked vertically, each element on its own line, dominating the canvas. Thin teal bar at very top. Everstage linear logo top-left (white). Orange CTA button bottom-right.
Emotional Register: Logic → Low-grade anxiety. Appeals to the analytical ops brain — makes the risk feel calculated and undeniable.
Narrative Structure: Simple equation → inescapable conclusion.
CTA Direction: Eliminate the variable
Scroll Stopper: The equation framing is instantly processable — it makes an abstract risk feel concrete.

CONCEPT 10 — "Future vs. Present"
Format Tag: Time-Bound Urgency
Personality Tag: Witty Colleague
Hook: "Still doing this in 2026?"
Visual Direction: Bold type on gradient treatment — amber gradient background (#F4A830 → #E8893B). Oversized dark maroon Roobert text fills the bottom two-thirds: "still" and the question mark massive, year in the middle. A walking/moving professional photo is layered in front of the type, like they're stepping into the future. Everstage linear logo top-left (dark maroon). Eggplant bottom-left strip with orange CTA.
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
- Visual Direction must describe the layout using Everstage brand motifs — choose the one that best serves the hook: floating bar overlay on photo, E-grid staggered checkerboard, photo+color split grid, headshot on solid color, bold type as scenery, multi-color text list on eggplant, or gradient background. Specify brand colors (with hex codes), typography (FK Roman vs Roobert), logo placement, and CTA treatment. Vary the motif across concepts.
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
- Which brand colors dominate each panel zone (eggplant, cream, teal, periwinkle, orange, tan, hot pink)
- Layout composition — where the report mockup, headline, and logo sit across the grid panels
- Mood: dark premium (eggplant-dominant) vs. editorial light (cream-dominant) vs. bold energetic (accent-color-dominant)
- Logo appears in top-right corner in every direction

Return raw JSON only — no markdown fences, no explanation:
[
  {
    "name": "2-4 word name for this direction",
    "description": "Detailed visual direction brief, 4-6 sentences. State which brand color fills each panel zone, where the report mockup sits, typography treatment (FK Roman headline, Roobert CTA), and where the Everstage logo appears."
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
  format: 'square' | 'landscape',
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
- A professional report/guide cover mockup featuring Everstage branding should be visible
- The input image contains the official Everstage logo (colorful stacked-bar E icon + "Everstage" wordmark). Reproduce it exactly in the top-right corner — colored icon + dark maroon wordmark on light/cream panels; white wordmark on dark/eggplant panels
- CTA button labeled exactly "${req.cta}" must be prominent — orange (#E8893B) with dark maroon text
- Brand colors: eggplant #3D1935 · cream #F5F0E8 · teal #1BA894 · periwinkle #5465D4 · orange #E8893B · tan #B8764A · hot pink #CF3070
- Headlines in FK Roman serif; body/CTA in Roobert sans-serif
- Grid-panel layout — flat solid colors, no gradients
- Premium enterprise B2B aesthetic
- All text rendered crisply and legibly
- No competitor logos or brand names
- Do NOT render any additional text beyond what is specified above`
}

// ─── Social Proof: Review Badges ─────────────────────────────────────────────

export function buildBadgeDirectionsSystemPrompt(): string {
  return `You are a senior B2B creative strategist for Everstage, an AI-powered sales commission management platform.

${BRAND_BRIEF}

Your job: given a set of customer review badges (e.g. G2, Capterra) being featured in a LinkedIn ad, generate exactly 3 distinctly different visual directions.

Each direction must differ in:
- Which brand color panels dominate (vary across eggplant, cream, teal, periwinkle, orange, tan)
- Badge placement — hero of the image vs. balanced with headline vs. clustered with supporting elements
- Copy and layout composition — where headline, badges, and CTA sit across the grid panels
- Logo: Everstage logo appears in top-right corner — specify its panel color and version (white vs. dark maroon wordmark)

The image generation model will receive the actual badge image(s) as visual input alongside your direction — describe the overall ad layout and panel treatment, not the badge content.

Return raw JSON only — no markdown fences, no explanation:
[
  {
    "name": "2-4 word name for this direction",
    "description": "4-6 sentences. Describe: which brand colors fill each panel zone, where the badge(s) sit and at what scale, headline/tagline treatment (FK Roman vs Roobert), where the Everstage logo and CTA button appear, any accent elements."
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
  format: 'square' | 'landscape',
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
- Badge${req.badgeCount > 1 ? 's' : ''} from the uploaded image${req.badgeCount > 1 ? 's' : ''} must be prominently displayed and fully legible — do not obscure or crop them
- The input image contains the official Everstage logo (colorful stacked-bar E icon + "Everstage" wordmark). Reproduce it exactly in the top-right corner — colored icon + dark maroon wordmark on light panels; white wordmark on dark/eggplant panels
- Tagline "${req.tagline}" must appear clearly rendered as text in FK Roman serif
- CTA button labeled exactly "${req.cta}" — orange (#E8893B) with dark maroon Roobert text
- Brand colors: eggplant #3D1935 · cream #F5F0E8 · teal #1BA894 · periwinkle #5465D4 · orange #E8893B · tan #B8764A · hot pink #CF3070
- Grid-panel layout — flat solid colors, no gradients
- Premium enterprise B2B aesthetic
- No competitor logos or brand names
- Do NOT render any additional text, product descriptions, or slogans beyond the tagline and CTA`
}

// ─── Social Proof: Testimonials ───────────────────────────────────────────────

export function buildTestimonialDirectionsSystemPrompt(): string {
  return `You are a senior B2B creative strategist for Everstage, an AI-powered sales commission management platform.

${BRAND_BRIEF}

Your job: given a customer testimonial, generate exactly 3 distinctly different visual directions for a LinkedIn single image ad.

The image generation model will receive the person's actual headshot photo (and optionally their company logo) as visual inputs — so your directions must specify how the photo is integrated into the grid panel layout. Do not describe the person's appearance; describe where and how the photo panel sits compositionally.

Each direction must differ in:
- How the headshot panel is positioned and sized (full-height left panel, top-center panel, circular inset in a color zone, etc.)
- Which brand colors fill each zone (vary across eggplant, cream, teal, periwinkle, orange, tan)
- Quote treatment — FK Roman large centered, left-aligned, key phrase with hot pink underline, etc.
- Logo appears in top-right corner in every direction — specify the panel color and wordmark version

Return raw JSON only — no markdown fences, no explanation:
[
  {
    "name": "2-4 word name for this direction",
    "description": "4-6 sentences. Describe: which brand colors fill each panel zone, how/where the headshot photo panel sits, quote typography placement (FK Roman), name/title/company treatment, company logo placement, Everstage logo placement, CTA treatment."
  }
]`
}

export function buildTestimonialDirectionsUserPrompt(req: { name: string; title: string; company: string; quote: string; cta: string; hasLogo: boolean }): string {
  return `Generate 3 distinct visual directions for a LinkedIn testimonial ad.

PERSON: ${req.name}, ${req.title} at ${req.company}
QUOTE: "${req.quote}"
CTA: "${req.cta}"
COMPANY LOGO PROVIDED: ${req.hasLogo ? 'Yes — incorporate it in each direction' : 'No'}

Make the three directions look meaningfully different — different photo panel treatments, different color palettes, different quote presentations.`
}

export function buildTestimonialImagePrompt(
  req: { quote: string; name: string; title: string; company: string; cta: string; hasLogo: boolean },
  direction: { name: string; description: string },
  format: 'square' | 'landscape',
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
- The input image contains the official Everstage logo (colorful stacked-bar E icon + "Everstage" wordmark). Reproduce it exactly in the top-right corner — colored icon + dark maroon wordmark on light panels; white wordmark on eggplant panels
- Render the quote in FK Roman serif — dark maroon on cream/light panels, white on dark panels
- Key phrase within the quote should have a hot pink (#CF3070) underline or highlight
- Render name, title, and company exactly as written above in Roobert sans-serif
${req.hasLogo ? '- Company logo should be small and clean beside the name/title' : ''}
- CTA button: orange (#E8893B) with dark maroon Roobert text
- Brand colors: eggplant #3D1935 · cream #F5F0E8 · teal #1BA894 · periwinkle #5465D4 · orange #E8893B · tan #B8764A · hot pink #CF3070
- Grid-panel layout — flat solid colors, no gradients
- Premium enterprise B2B aesthetic
- No competitor logos
- Do NOT render any additional text or slogans beyond what is specified above`
}
