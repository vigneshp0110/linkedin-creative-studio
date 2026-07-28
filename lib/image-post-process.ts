import * as fs from 'fs'
import * as path from 'path'
import sharp from 'sharp'

// LinkedIn ad specs
const DIMENSIONS = {
  square:    { width: 1080, height: 1080 },
  landscape: { width: 1200, height: 627  },
} as const

// Logo occupies ~12% of the shorter canvas edge, 24px margin all around
const LOGO_TARGET_WIDTH = 130
const LOGO_MARGIN = 24

/**
 * Takes a raw PNG buffer from GPT-Image-2, resizes it to the exact LinkedIn
 * ad dimension for the given format, then composites the Everstage logo at
 * the top-left corner. Returns a base64 data-URI string.
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
  let composite: Buffer | null = null
  try {
    composite = await sharp(fs.readFileSync(logoPath))
      .resize(LOGO_TARGET_WIDTH, null, { fit: 'inside', withoutEnlargement: false })
      .png()
      .toBuffer()
  } catch (e) {
    console.error('[post-process] logo load failed:', e)
  }

  if (!composite) {
    // No logo available — return the resized image as-is
    return `data:image/png;base64,${resized.toString('base64')}`
  }

  // Step 3: composite logo at top-left
  const final = await sharp(resized)
    .composite([{ input: composite, top: LOGO_MARGIN, left: LOGO_MARGIN }])
    .png()
    .toBuffer()

  return `data:image/png;base64,${final.toString('base64')}`
}
