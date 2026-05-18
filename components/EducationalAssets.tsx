'use client'

import { useState } from 'react'
import { BrandTheme, EducationalVariation } from '@/lib/types'

function VariationCard({
  variation,
  index,
  isLoadingSquare,
  isLoadingLandscape,
}: {
  variation: EducationalVariation | null
  index: number
  isLoadingSquare: boolean
  isLoadingLandscape: boolean
}) {
  const download = (src: string, format: string) => {
    const a = document.createElement('a')
    a.href = src
    a.download = `everstage-educational-${format}-${index + 1}.png`
    a.click()
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#0A1628] p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Variation {index + 1}
          </span>
          {variation?.name && (
            <p className="mt-0.5 text-sm font-semibold text-white">{variation.name}</p>
          )}
        </div>
        {(isLoadingSquare) && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-[#F5A623]" />
        )}
      </div>

      {/* Square image */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-widest text-white/25">Square (1:1)</span>
          {variation?.squareImage && (
            <button
              onClick={() => download(variation.squareImage!, 'square')}
              className="flex items-center gap-1 rounded border border-white/10 px-2 py-0.5 text-[10px] text-white/50 transition hover:border-[#F5A623]/40 hover:text-[#F5A623]"
            >
              ↓ Download
            </button>
          )}
        </div>
        <div className="relative aspect-square overflow-hidden rounded-xl border border-white/8 bg-[#0D1E38]">
          {isLoadingSquare && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-[#F5A623]" />
              <span className="text-[10px] text-white/25">Generating…</span>
            </div>
          )}
          {variation?.squareImage && !isLoadingSquare && (
            <img src={variation.squareImage} alt={`Variation ${index + 1} square`} className="h-full w-full object-cover" />
          )}
          {!variation?.squareImage && !isLoadingSquare && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-white/10">Square</span>
            </div>
          )}
        </div>
      </div>

      {/* Landscape image — only shown once triggered */}
      {(variation?.landscapeImage || isLoadingLandscape) && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-widest text-white/25">Landscape (1.5:1)</span>
            {variation?.landscapeImage && (
              <button
                onClick={() => download(variation.landscapeImage!, 'landscape')}
                className="flex items-center gap-1 rounded border border-white/10 px-2 py-0.5 text-[10px] text-white/50 transition hover:border-[#F5A623]/40 hover:text-[#F5A623]"
              >
                ↓ Download
              </button>
            )}
          </div>
          <div className="relative aspect-[3/2] overflow-hidden rounded-xl border border-white/8 bg-[#0D1E38]">
            {isLoadingLandscape && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-[#F5A623]" />
                <span className="text-[10px] text-white/25">Generating…</span>
              </div>
            )}
            {variation?.landscapeImage && !isLoadingLandscape && (
              <img src={variation.landscapeImage} alt={`Variation ${index + 1} landscape`} className="h-full w-full object-cover" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function EducationalAssets({ brandTheme }: { brandTheme: BrandTheme }) {
  const [guideTitle, setGuideTitle] = useState('')
  const [bodyCopy, setBodyCopy] = useState('')
  const [cta, setCta] = useState('')

  const [variations, setVariations] = useState<(EducationalVariation | null)[]>([null, null, null])
  const [isGeneratingSquare, setIsGeneratingSquare] = useState(false)
  const [isGeneratingLandscape, setIsGeneratingLandscape] = useState(false)
  const [hasSquares, setHasSquares] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canGenerate = !!(guideTitle.trim() && bodyCopy.trim() && cta.trim() && !isGeneratingSquare)
  const canGenerateLandscape = hasSquares && !isGeneratingLandscape && !isGeneratingSquare

  const generateSquare = async () => {
    if (!canGenerate) return
    setIsGeneratingSquare(true)
    setVariations([null, null, null])
    setHasSquares(false)
    setError(null)

    try {
      const res = await fetch('/api/educational', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideTitle, bodyCopy, cta, format: 'square', brandTheme }),
      })
      if (!res.ok) throw new Error(`Failed: ${res.status}`)
      const data = await res.json()
      const vars: EducationalVariation[] = (data.variations ?? []).map((v: { id: string; name: string; visualDirection: string; image: string | null }) => ({
        id: v.id,
        name: v.name,
        visualDirection: v.visualDirection,
        squareImage: v.image,
        landscapeImage: null,
      }))
      // Pad to 3 if needed
      while (vars.length < 3) vars.push({ id: `var-${vars.length}`, name: '', visualDirection: '', squareImage: null, landscapeImage: null })
      setVariations(vars)
      setHasSquares(true)
    } catch {
      setError('Generation failed. Please try again.')
    } finally {
      setIsGeneratingSquare(false)
    }
  }

  const generateLandscape = async () => {
    if (!canGenerateLandscape) return
    setIsGeneratingLandscape(true)
    setError(null)

    const dirs = variations
      .filter(Boolean)
      .map(v => ({ id: v!.id, name: v!.name, description: v!.visualDirection }))

    try {
      const res = await fetch('/api/educational', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideTitle, bodyCopy, cta, format: 'landscape', visualDirections: dirs, brandTheme }),
      })
      if (!res.ok) throw new Error(`Failed: ${res.status}`)
      const data = await res.json()
      const imageMap: Record<string, string> = {}
      for (const item of (data.images ?? [])) {
        imageMap[item.id] = item.image
      }
      setVariations(prev => prev.map(v => v ? { ...v, landscapeImage: imageMap[v.id] ?? null } : null))
    } catch {
      setError('Landscape generation failed. Please try again.')
    } finally {
      setIsGeneratingLandscape(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Top bar */}
      <div className="border-b border-white/5 bg-[#0A1628]">
        <div className="flex flex-col gap-3 px-5 py-4">
          <div className="flex items-end gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-white/35">
                Guide / Report Title
              </label>
              <input
                type="text"
                value={guideTitle}
                onChange={e => setGuideTitle(e.target.value)}
                placeholder="e.g. The 2025 Sales Commission Benchmark Report"
                className="w-full rounded-lg border border-white/10 bg-[#0D1E38] px-3 py-2 text-sm text-white placeholder-white/20 outline-none transition focus:border-[#F5A623]/60 focus:ring-1 focus:ring-[#F5A623]/30"
              />
            </div>
            <div className="w-72 flex-shrink-0 flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-white/35">
                Key Insight / Body Copy
              </label>
              <input
                type="text"
                value={bodyCopy}
                onChange={e => setBodyCopy(e.target.value)}
                placeholder="e.g. 73% of reps don't know their real-time earnings"
                className="w-full rounded-lg border border-white/10 bg-[#0D1E38] px-3 py-2 text-sm text-white placeholder-white/20 outline-none transition focus:border-[#F5A623]/60 focus:ring-1 focus:ring-[#F5A623]/30"
              />
            </div>
            <div className="w-44 flex-shrink-0 flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-white/35">
                CTA
              </label>
              <input
                type="text"
                value={cta}
                onChange={e => setCta(e.target.value)}
                placeholder="e.g. Download the Report"
                className="w-full rounded-lg border border-white/10 bg-[#0D1E38] px-3 py-2 text-sm text-white placeholder-white/20 outline-none transition focus:border-[#F5A623]/60 focus:ring-1 focus:ring-[#F5A623]/30"
              />
            </div>
            <button
              onClick={generateSquare}
              disabled={!canGenerate}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-[#F5A623] px-5 py-2 text-sm font-bold text-[#0A1628] transition hover:bg-[#f0a020] disabled:cursor-not-allowed disabled:opacity-30"
            >
              {isGeneratingSquare ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0A1628]/20 border-t-[#0A1628]" />
                  Generating…
                </>
              ) : hasSquares ? (
                '↺ Regenerate'
              ) : (
                '⚡ Generate Variations'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* 3 variation cards */}
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map(i => (
            <VariationCard
              key={i}
              index={i}
              variation={variations[i]}
              isLoadingSquare={isGeneratingSquare}
              isLoadingLandscape={isGeneratingLandscape}
            />
          ))}
        </div>

        {/* Generate Landscape CTA */}
        {canGenerateLandscape && (
          <div className="flex justify-center pt-2">
            <button
              onClick={generateLandscape}
              className="flex items-center gap-2 rounded-xl border border-white/15 px-6 py-2.5 text-sm font-medium text-white/60 transition hover:border-[#F5A623]/40 hover:text-[#F5A623]"
            >
              Generate Landscape Versions →
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isGeneratingSquare && !hasSquares && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-20 text-center">
            <div className="text-3xl opacity-10">◻</div>
            <p className="text-xs text-white/20">
              Enter your guide title, key insight, and CTA —<br />
              then click Generate Variations
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
