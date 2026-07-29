import * as fs from 'fs'
import * as path from 'path'
import sharp from 'sharp'

// LinkedIn ad specs
const DIMENSIONS = {
  square:    { width: 1080, height: 1080 },
  landscape: { width: 1200, height: 627  },
} as const

const LOGO_TARGET_WIDTH = 210  // ~19% of 1080
const LOGO_MARGIN = 28
const LOGO_PAD = 14

/**
 * Recolours dark, low-saturation pixels (the "Everstage" wordmark) to white
 * while leaving the colourful E-icon bar pixels untouched.
 */
async function makeWordmarkWhite(logoBuf: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(logoBuf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const px = new Uint8Array(data.buffer)
  const { width, height, channels } = info  // channels === 4

  for (let i = 0; i < width * height * channels; i += channels) {
    const a = px[i + 3]
    if (a < 10) continue  // transparent — skip

    const r = px[i], g = px[i + 1], b = px[i + 2]
    const maxCh = Math.max(r, g, b)
    const minCh = Math.min(r, g, b)
    const chroma = maxCh - minCh        // 0 = greyscale, high = vivid colour
    const brightness = (r + g + b) / 3

    // E-icon bars are vivid (chroma > 60).
    // Wordmark is dark + desaturated (dark maroon ≈ chroma < 50, brightness < 120).
    if (chroma < 50 && brightness < 130) {
      px[i] = 255; px[i + 1] = 255; px[i + 2] = 255
    }
  }

  return sharp(Buffer.from(px.buffer), {
    raw: { width, height, channels },
  }).png().toBuffer()
}

/**
 * Takes a raw PNG buffer from GPT-Image-2, resizes it to the exact LinkedIn
 * ad dimension for the given format, then composites the Everstage logo at
 * the top-left corner with a translucent backdrop and a white wordmark.
 */
export async function postProcessImage(
  rawBuffer: Buffer,
  format: 'square' | 'landscape',
): Promise<string> {
  const { width, height } = DIMENSIONS[format] ?? DIMENSIONS.square

  // Step 1: resize/crop to exact LinkedIn dimensions
  const resized = await sharp(rawBuffer)
    .resize(width, height, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer()

  // Step 2: load, resize, and whiten the wordmark
  const logoPath = path.join(process.cwd(), 'public/logos/logo-new.png')
  let logoBuf: Buffer | null = null
  try {
    const raw = await sharp(fs.readFileSync(logoPath))
      .resize(LOGO_TARGET_WIDTH, null, { fit: 'inside', withoutEnlargement: false })
      .png()
      .toBuffer()
    logoBuf = await makeWordmarkWhite(raw)
  } catch (e) {
    console.error('[post-process] logo prep failed:', e)
  }

  if (!logoBuf) {
    return `data:image/png;base64,${resized.toString('base64')}`
  }

  // Step 3: build a semi-transparent dark backdrop for contrast
  const meta = await sharp(logoBuf).metadata()
  const lw = meta.width ?? LOGO_TARGET_WIDTH
  const lh = meta.height ?? 50

  const backdrop = await sharp({
    create: {
      width:    lw + LOGO_PAD * 2,
      height:   lh + LOGO_PAD * 2,
      channels: 4,
      background: { r: 26, g: 13, b: 23, alpha: 170 },
    },
  }).png().toBuffer()

  // Step 4: composite backdrop then logo
  const final = await sharp(resized)
    .composite([
      { input: backdrop, top: LOGO_MARGIN - LOGO_PAD, left: LOGO_MARGIN - LOGO_PAD },
      { input: logoBuf,  top: LOGO_MARGIN,             left: LOGO_MARGIN },
    ])
    .png()
    .toBuffer()

  return `data:image/png;base64,${final.toString('base64')}`
}
