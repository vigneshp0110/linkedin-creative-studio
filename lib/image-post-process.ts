import * as fs from 'fs'
import * as path from 'path'
import sharp from 'sharp'

// LinkedIn ad specs
const DIMENSIONS = {
  square:    { width: 1080, height: 1080 },
  landscape: { width: 1200, height: 627  },
} as const

const LOGO_TARGET_WIDTH = 210  // ~19% of 1080 — visible but not dominant
const LOGO_MARGIN = 28         // px from top-left corner to logo
const LOGO_PAD = 14            // padding inside the contrast backdrop

/**
 * Takes a raw PNG buffer from GPT-Image-2, resizes it to the exact LinkedIn
 * ad dimension for the given format, then composites the Everstage logo at
 * the top-left corner with a translucent backdrop so it reads clearly on any
 * background colour.
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

  // Step 2: load and size the logo
  const logoPath = path.join(process.cwd(), 'public/logos/logo-new.png')
  let logoBuf: Buffer | null = null
  try {
    logoBuf = await sharp(fs.readFileSync(logoPath))
      .resize(LOGO_TARGET_WIDTH, null, { fit: 'inside', withoutEnlargement: false })
      .png()
      .toBuffer()
  } catch (e) {
    console.error('[post-process] logo load failed:', e)
  }

  if (!logoBuf) {
    return `data:image/png;base64,${resized.toString('base64')}`
  }

  // Step 3: build a semi-transparent dark backdrop so wordmark contrasts
  // on any generated background (dark eggplant at ~65% opacity)
  const meta = await sharp(logoBuf).metadata()
  const lw = meta.width ?? LOGO_TARGET_WIDTH
  const lh = meta.height ?? 50

  const backdrop = await sharp({
    create: {
      width:    lw + LOGO_PAD * 2,
      height:   lh + LOGO_PAD * 2,
      channels: 4,
      background: { r: 26, g: 13, b: 23, alpha: 170 }, // #1A0D17 @ ~67%
    },
  })
    .png()
    .toBuffer()

  // Step 4: composite backdrop then logo at top-left
  const final = await sharp(resized)
    .composite([
      { input: backdrop, top: LOGO_MARGIN - LOGO_PAD, left: LOGO_MARGIN - LOGO_PAD },
      { input: logoBuf,  top: LOGO_MARGIN,             left: LOGO_MARGIN },
    ])
    .png()
    .toBuffer()

  return `data:image/png;base64,${final.toString('base64')}`
}
