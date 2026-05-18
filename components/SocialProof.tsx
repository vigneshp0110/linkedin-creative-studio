'use client'

import { useState, useRef } from 'react'
import { BrandTheme, EducationalVariation } from '@/lib/types'

// ─── Shared sub-components ────────────────────────────────────────────────────

function FileUploadBox({
  label,
  hint,
  files,
  multiple,
  onChange,
}: {
  label: string
  hint?: string
  files: File[]
  multiple?: boolean
  onChange: (files: File[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    onChange(selected)
    // reset input so same file can be re-selected
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-widest text-white/35">{label}</label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`flex min-h-[38px] w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition ${
          files.length > 0
            ? 'border-[#F5A623]/40 bg-[#F5A623]/6 text-white'
            : 'border-dashed border-white/15 text-white/30 hover:border-white/30 hover:text-white/50'
        }`}
      >
        <span className="text-base leading-none">{files.length > 0 ? '✓' : '↑'}</span>
        <span className="truncate">
          {files.length === 0
            ? hint ?? 'Click to upload'
            : files.length === 1
            ? files[0].name
            : `${files.length} files selected`}
        </span>
        {files.length > 0 && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onChange([]) }}
            className="ml-auto shrink-0 text-white/30 hover:text-white/60"
          >
            ×
          </button>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}

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
    a.download = `everstage-social-proof-${format}-${index + 1}.png`
    a.click()
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#0A1628] p-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Variation {index + 1}</span>
          {variation?.name && <p className="mt-0.5 text-sm font-semibold text-white">{variation.name}</p>}
        </div>
        {isLoadingSquare && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-[#F5A623]" />}
      </div>

      {/* Square */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-widest text-white/25">Square (1:1)</span>
          {variation?.squareImage && (
            <button onClick={() => download(variation.squareImage!, 'square')} className="flex items-center gap-1 rounded border border-white/10 px-2 py-0.5 text-[10px] text-white/50 transition hover:border-[#F5A623]/40 hover:text-[#F5A623]">↓ Download</button>
          )}
        </div>
        <div className="relative aspect-square overflow-hidden rounded-xl border border-white/8 bg-[#0D1E38]">
          {isLoadingSquare && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-[#F5A623]" />
              <span className="text-[10px] text-white/25">Generating…</span>
            </div>
          )}
          {variation?.squareImage && !isLoadingSquare && <img src={variation.squareImage} alt="" className="h-full w-full object-cover" />}
          {!variation?.squareImage && !isLoadingSquare && <div className="absolute inset-0 flex items-center justify-center"><span className="text-xs text-white/10">Square</span></div>}
        </div>
      </div>

      {/* Landscape — only after triggered */}
      {(variation?.landscapeImage || isLoadingLandscape) && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-widest text-white/25">Landscape (1.5:1)</span>
            {variation?.landscapeImage && (
              <button onClick={() => download(variation.landscapeImage!, 'landscape')} className="flex items-center gap-1 rounded border border-white/10 px-2 py-0.5 text-[10px] text-white/50 transition hover:border-[#F5A623]/40 hover:text-[#F5A623]">↓ Download</button>
            )}
          </div>
          <div className="relative aspect-[3/2] overflow-hidden rounded-xl border border-white/8 bg-[#0D1E38]">
            {isLoadingLandscape && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-[#F5A623]" />
                <span className="text-[10px] text-white/25">Generating…</span>
              </div>
            )}
            {variation?.landscapeImage && !isLoadingLandscape && <img src={variation.landscapeImage} alt="" className="h-full w-full object-cover" />}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Badges form ──────────────────────────────────────────────────────────────

function BadgesForm({ onGenerate, isGenerating, hasSquares }: { onGenerate: (fd: FormData) => void; isGenerating: boolean; hasSquares: boolean }) {
  const [badgeFiles, setBadgeFiles] = useState<File[]>([])
  const [tagline, setTagline] = useState('')
  const [cta, setCta] = useState('')

  const canGenerate = badgeFiles.length > 0 && tagline.trim() && cta.trim()

  const handleGenerate = () => {
    if (!canGenerate) return
    const fd = new FormData()
    fd.append('type', 'badges')
    fd.append('tagline', tagline)
    fd.append('cta', cta)
    badgeFiles.forEach(f => fd.append('badges', f))
    onGenerate(fd)
  }

  return (
    <div className="flex items-end gap-3">
      <div className="w-56 shrink-0">
        <FileUploadBox label="Review Badges" hint="Upload badge image(s)" files={badgeFiles} multiple onChange={setBadgeFiles} />
      </div>
      <div className="flex-1 flex flex-col gap-1">
        <label className="text-[10px] font-semibold uppercase tracking-widest text-white/35">Tagline</label>
        <input
          type="text"
          value={tagline}
          onChange={e => setTagline(e.target.value)}
          placeholder='e.g. "Rated #1 by Sales Teams on G2"'
          className="w-full rounded-lg border border-white/10 bg-[#0D1E38] px-3 py-2 text-sm text-white placeholder-white/20 outline-none transition focus:border-[#F5A623]/60 focus:ring-1 focus:ring-[#F5A623]/30"
        />
      </div>
      <div className="w-44 shrink-0 flex flex-col gap-1">
        <label className="text-[10px] font-semibold uppercase tracking-widest text-white/35">CTA</label>
        <input
          type="text"
          value={cta}
          onChange={e => setCta(e.target.value)}
          placeholder="e.g. See Why"
          className="w-full rounded-lg border border-white/10 bg-[#0D1E38] px-3 py-2 text-sm text-white placeholder-white/20 outline-none transition focus:border-[#F5A623]/60 focus:ring-1 focus:ring-[#F5A623]/30"
        />
      </div>
      <button
        onClick={handleGenerate}
        disabled={!canGenerate || isGenerating}
        className="flex shrink-0 items-center gap-2 rounded-xl bg-[#F5A623] px-5 py-2 text-sm font-bold text-[#0A1628] transition hover:bg-[#f0a020] disabled:cursor-not-allowed disabled:opacity-30"
      >
        {isGenerating ? (
          <><span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0A1628]/20 border-t-[#0A1628]" />Generating…</>
        ) : hasSquares ? '↺ Regenerate' : '⚡ Generate'}
      </button>
    </div>
  )
}

// ─── Testimonial form ─────────────────────────────────────────────────────────

function TestimonialForm({ onGenerate, isGenerating, hasSquares }: { onGenerate: (fd: FormData) => void; isGenerating: boolean; hasSquares: boolean }) {
  const [headshot, setHeadshot] = useState<File[]>([])
  const [companyLogo, setCompanyLogo] = useState<File[]>([])
  const [quote, setQuote] = useState('')
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [cta, setCta] = useState('')

  const canGenerate = headshot.length > 0 && quote.trim() && name.trim() && title.trim() && company.trim() && cta.trim()

  const handleGenerate = () => {
    if (!canGenerate) return
    const fd = new FormData()
    fd.append('type', 'testimonial')
    fd.append('quote', quote)
    fd.append('name', name)
    fd.append('title', title)
    fd.append('company', company)
    fd.append('cta', cta)
    fd.append('headshot', headshot[0])
    if (companyLogo.length > 0) fd.append('companyLogo', companyLogo[0])
    onGenerate(fd)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: uploads + person fields */}
      <div className="flex items-end gap-3">
        <div className="w-44 shrink-0">
          <FileUploadBox label="Headshot" hint="Upload photo" files={headshot} onChange={setHeadshot} />
        </div>
        <div className="w-44 shrink-0">
          <FileUploadBox label="Company Logo (optional)" hint="Upload logo" files={companyLogo} onChange={setCompanyLogo} />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-white/35">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sarah Chen" className="w-full rounded-lg border border-white/10 bg-[#0D1E38] px-3 py-2 text-sm text-white placeholder-white/20 outline-none transition focus:border-[#F5A623]/60 focus:ring-1 focus:ring-[#F5A623]/30" />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-white/35">Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Head of Sales Ops" className="w-full rounded-lg border border-white/10 bg-[#0D1E38] px-3 py-2 text-sm text-white placeholder-white/20 outline-none transition focus:border-[#F5A623]/60 focus:ring-1 focus:ring-[#F5A623]/30" />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-white/35">Company</label>
          <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Acme Corp" className="w-full rounded-lg border border-white/10 bg-[#0D1E38] px-3 py-2 text-sm text-white placeholder-white/20 outline-none transition focus:border-[#F5A623]/60 focus:ring-1 focus:ring-[#F5A623]/30" />
        </div>
        <div className="w-40 shrink-0 flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-white/35">CTA</label>
          <input type="text" value={cta} onChange={e => setCta(e.target.value)} placeholder="e.g. See the Story" className="w-full rounded-lg border border-white/10 bg-[#0D1E38] px-3 py-2 text-sm text-white placeholder-white/20 outline-none transition focus:border-[#F5A623]/60 focus:ring-1 focus:ring-[#F5A623]/30" />
        </div>
      </div>

      {/* Row 2: quote + generate */}
      <div className="flex items-end gap-3">
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-white/35">Quote</label>
          <input type="text" value={quote} onChange={e => setQuote(e.target.value)} placeholder='e.g. "Everstage cut our commission disputes by 80%. Reps trust their numbers now."' className="w-full rounded-lg border border-white/10 bg-[#0D1E38] px-3 py-2 text-sm text-white placeholder-white/20 outline-none transition focus:border-[#F5A623]/60 focus:ring-1 focus:ring-[#F5A623]/30" />
        </div>
        <button
          onClick={handleGenerate}
          disabled={!canGenerate || isGenerating}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-[#F5A623] px-5 py-2 text-sm font-bold text-[#0A1628] transition hover:bg-[#f0a020] disabled:cursor-not-allowed disabled:opacity-30"
        >
          {isGenerating ? (
            <><span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0A1628]/20 border-t-[#0A1628]" />Generating…</>
          ) : hasSquares ? '↺ Regenerate' : '⚡ Generate'}
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SocialProof({ brandTheme }: { brandTheme: BrandTheme }) {
  const [subTab, setSubTab] = useState<'badges' | 'testimonial'>('badges')

  const [variations, setVariations] = useState<(EducationalVariation | null)[]>([null, null, null])
  const [isGeneratingSquare, setIsGeneratingSquare] = useState(false)
  const [isGeneratingLandscape, setIsGeneratingLandscape] = useState(false)
  const [hasSquares, setHasSquares] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Keep the last FormData for landscape reuse (minus format field)
  const lastFormDataRef = useRef<FormData | null>(null)

  const onSubTabChange = (tab: 'badges' | 'testimonial') => {
    setSubTab(tab)
    setVariations([null, null, null])
    setHasSquares(false)
    setError(null)
    lastFormDataRef.current = null
  }

  const generateSquare = async (fd: FormData) => {
    setIsGeneratingSquare(true)
    setVariations([null, null, null])
    setHasSquares(false)
    setError(null)
    fd.set('format', 'square')
    fd.set('brandTheme', brandTheme)
    lastFormDataRef.current = fd

    try {
      const res = await fetch('/api/social-proof', { method: 'POST', body: fd })
      if (!res.ok) throw new Error(`Failed: ${res.status}`)
      const data = await res.json()
      const vars: EducationalVariation[] = (data.variations ?? []).map((v: { id: string; name: string; visualDirection: string; image: string | null }) => ({
        id: v.id,
        name: v.name,
        visualDirection: v.visualDirection,
        squareImage: v.image,
        landscapeImage: null,
      }))
      while (vars.length < 3) vars.push({ id: `var-pad-${vars.length}`, name: '', visualDirection: '', squareImage: null, landscapeImage: null })
      setVariations(vars)
      setHasSquares(true)
    } catch {
      setError('Generation failed. Please try again.')
    } finally {
      setIsGeneratingSquare(false)
    }
  }

  const generateLandscape = async () => {
    if (!lastFormDataRef.current) return
    setIsGeneratingLandscape(true)
    setError(null)

    const fd = lastFormDataRef.current
    fd.set('format', 'landscape')
    fd.set('brandTheme', brandTheme)
    fd.set('visualDirections', JSON.stringify(
      variations.filter(Boolean).map(v => ({ id: v!.id, name: v!.name, description: v!.visualDirection }))
    ))

    try {
      const res = await fetch('/api/social-proof', { method: 'POST', body: fd })
      if (!res.ok) throw new Error(`Failed: ${res.status}`)
      const data = await res.json()
      const imageMap: Record<string, string> = {}
      for (const item of (data.images ?? [])) imageMap[item.id] = item.image
      setVariations(prev => prev.map(v => v ? { ...v, landscapeImage: imageMap[v.id] ?? null } : null))
    } catch {
      setError('Landscape generation failed. Please try again.')
    } finally {
      setIsGeneratingLandscape(false)
    }
  }

  const canGenerateLandscape = hasSquares && !isGeneratingLandscape && !isGeneratingSquare

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Top bar */}
      <div className="border-b border-white/5 bg-[#0A1628]">
        <div className="flex flex-col gap-3 px-5 py-4">
          {/* Sub-tab switcher */}
          <div className="flex gap-1 rounded-lg border border-white/8 bg-[#070E1A] p-1 w-fit">
            {(['badges', 'testimonial'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => onSubTabChange(tab)}
                className={`rounded-md px-4 py-1.5 text-xs font-medium transition ${
                  subTab === tab
                    ? 'bg-[#F5A623] text-[#0A1628]'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {tab === 'badges' ? 'Review Badges' : 'Customer Testimonials'}
              </button>
            ))}
          </div>

          {/* Form */}
          {subTab === 'badges' && <BadgesForm onGenerate={generateSquare} isGenerating={isGeneratingSquare} hasSquares={hasSquares} />}
          {subTab === 'testimonial' && <TestimonialForm onGenerate={generateSquare} isGenerating={isGeneratingSquare} hasSquares={hasSquares} />}
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</div>
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
              {subTab === 'badges'
                ? 'Upload your review badges, add a tagline and CTA —\nthen click Generate'
                : 'Upload a headshot, fill in the testimonial details —\nthen click Generate'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
