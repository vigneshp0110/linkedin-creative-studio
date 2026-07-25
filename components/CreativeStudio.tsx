'use client'

import { useState, useCallback } from 'react'
import { AdCopy, Angle, Campaign, CreativeConcept, IllustrationMode, Theme } from '@/lib/types'

interface Result {
  copy: AdCopy
  squareImage: string
  landscapeImage: string
}

// ─── Shared Select component ─────────────────────────────────────────────────

function Select({
  label,
  value,
  onChange,
  options,
  disabled,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-widest text-white/35">
        {label}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="rounded-lg border border-white/10 bg-[#0D1E38] px-3 py-2 text-sm text-white outline-none transition focus:border-[#F5A623]/60 focus:ring-1 focus:ring-[#F5A623]/30 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// ─── Concept card ─────────────────────────────────────────────────────────────

function ConceptCard({
  concept,
  selected,
  onSelect,
}: {
  concept: CreativeConcept
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-xl border p-4 text-left transition ${
        selected
          ? 'border-[#F5A623]/60 bg-[#F5A623]/6 ring-1 ring-[#F5A623]/20'
          : 'border-white/8 hover:border-white/20 hover:bg-white/2'
      }`}
    >
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <span
          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
            selected ? 'bg-[#F5A623] text-[#0A1628]' : 'bg-white/8 text-white/40'
          }`}
        >
          {concept.conceptNumber}
        </span>
        {selected && (
          <span className="shrink-0 rounded-full bg-[#F5A623]/15 px-2 py-0.5 text-[10px] font-semibold text-[#F5A623]">
            Selected
          </span>
        )}
      </div>

      <p className={`mb-3 text-sm font-semibold leading-snug ${selected ? 'text-white' : 'text-white/80'}`}>
        "{concept.hook}"
      </p>

      <div className="space-y-1.5 text-[11px]">
        <Row label="Visual" value={concept.visualDirection} highlight={selected} />
        <Row label="Feel" value={concept.emotionalRegister} highlight={selected} />
        <Row label="Story" value={concept.narrativeStructure} highlight={selected} />
        <Row label="CTA" value={concept.ctaDirection} highlight={selected} />
        <Row label="Stopper" value={concept.scrollStopper} highlight={selected} />
      </div>
    </button>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight: boolean }) {
  return (
    <div className="flex gap-2">
      <span className={`w-12 shrink-0 font-semibold uppercase tracking-wide ${highlight ? 'text-white/40' : 'text-white/25'}`}>
        {label}
      </span>
      <span className={highlight ? 'text-white/70' : 'text-white/45'}>{value}</span>
    </div>
  )
}

// ─── Image preview card ───────────────────────────────────────────────────────

function ImageCard({
  label,
  format,
  src,
  isLoading,
}: {
  label: string
  format: string
  src: string | null
  isLoading: boolean
}) {
  const download = () => {
    if (!src) return
    const a = document.createElement('a')
    a.href = src
    a.download = `everstage-${format}-creative.png`
    a.click()
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-white/40">{label}</span>
        {src && (
          <button
            onClick={download}
            className="flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1 text-[11px] font-medium text-white/60 transition hover:border-[#F5A623]/40 hover:text-[#F5A623]"
          >
            ↓ Download
          </button>
        )}
      </div>
      <div
        className={`relative overflow-hidden rounded-xl border border-white/8 bg-[#0D1E38] ${
          format === 'square' ? 'aspect-square' : 'aspect-[3/2]'
        }`}
      >
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-[#F5A623]" />
            <span className="text-xs text-white/30">Generating…</span>
          </div>
        )}
        {src && !isLoading && (
          <img src={src} alt={label} className="h-full w-full object-cover" />
        )}
        {!src && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-white/15">{label}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CreativeStudio({
  verticals,

  illustrationMode = 'with',
}: {
  verticals: { id: string; label: string }[]

  illustrationMode?: IllustrationMode
}) {
  // Campaign selections
  const [verticalId, setVerticalId] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [themeId, setThemeId] = useState('')
  const [angleId, setAngleId] = useState('')

  // Fetched KB data
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoadingKB, setIsLoadingKB] = useState(false)

  // Concept generation
  const [concepts, setConcepts] = useState<CreativeConcept[]>([])
  const [isLoadingConcepts, setIsLoadingConcepts] = useState(false)
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null)
  const [conceptError, setConceptError] = useState<string | null>(null)

  // Creative generation
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingLandscape, setIsGeneratingLandscape] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)

  // Creative panel visibility
  const [isCreativePanelOpen, setIsCreativePanelOpen] = useState(false)

  // Angle row expanded
  const [isAnglesExpanded, setIsAnglesExpanded] = useState(false)

  // Derived
  const selectedCampaign = campaigns.find(c => c.id === campaignId) ?? null
  const themes: Theme[] = selectedCampaign?.themes ?? []
  const selectedTheme = themes.find(t => t.id === themeId) ?? null
  const angles: Angle[] = selectedTheme?.angles ?? []
  const selectedAngle = angles.find(a => a.id === angleId) ?? null
  const selectedVertical = verticals.find(v => v.id === verticalId) ?? null
  const selectedConcept = concepts.find(c => c.id === selectedConceptId) ?? null

  const onVerticalChange = useCallback(async (id: string) => {
    setVerticalId(id)
    setCampaignId('')
    setThemeId('')
    setAngleId('')
    setCampaigns([])
    setConcepts([])
    setSelectedConceptId(null)
    setResult(null)
    setIsCreativePanelOpen(false)
    if (!id) return
    setIsLoadingKB(true)
    try {
      const res = await fetch(`/api/kb?vertical=${id}`)
      const data = await res.json()
      setCampaigns(data.campaigns ?? [])
    } catch {
      // silent
    } finally {
      setIsLoadingKB(false)
    }
  }, [])

  const onCampaignChange = (id: string) => {
    setCampaignId(id)
    setThemeId('')
    setAngleId('')
    setConcepts([])
    setSelectedConceptId(null)
    setResult(null)
    setIsCreativePanelOpen(false)
  }

  const onThemeChange = (id: string) => {
    setThemeId(id)
    setAngleId('')
    setConcepts([])
    setSelectedConceptId(null)
    setResult(null)
    setIsCreativePanelOpen(false)
  }

  const onAngleChange = (id: string) => {
    setAngleId(id)
    setConcepts([])
    setSelectedConceptId(null)
    setResult(null)
    setIsCreativePanelOpen(false)
  }

  const generateConcepts = async () => {
    if (!selectedVertical || !selectedCampaign || !selectedTheme || !selectedAngle) return
    setIsLoadingConcepts(true)
    setConcepts([])
    setSelectedConceptId(null)
    setResult(null)
    setConceptError(null)
    setIsCreativePanelOpen(false)

    try {
      const res = await fetch('/api/concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verticalLabel: selectedVertical.label,
          campaignName: selectedCampaign.name,
          themeName: selectedTheme.name,
          angle: selectedAngle,
        }),
      })
      if (!res.ok) throw new Error(`Failed: ${res.status}`)
      const data = await res.json()
      setConcepts(data.concepts ?? [])
    } catch {
      setConceptError('Failed to generate concepts. Please try again.')
    } finally {
      setIsLoadingConcepts(false)
    }
  }

  const generateCreative = async () => {
    if (!selectedVertical || !selectedCampaign || !selectedTheme || !selectedAngle || !selectedConcept) return
    setIsGenerating(true)
    setResult(null)
    setGenerateError(null)
    setIsCreativePanelOpen(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verticalLabel: selectedVertical.label,
          campaignName: selectedCampaign.name,
          themeName: selectedTheme.name,
          angle: selectedAngle,
          concept: selectedConcept,
          layout: 'statement',

          illustrationMode,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? `Failed: ${res.status}`)
      }
      const data = await res.json()
      setResult(data)
    } catch (e: unknown) {
      setGenerateError(e instanceof Error ? e.message : 'Generation failed.')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateLandscape = async () => {
    if (!selectedVertical || !selectedCampaign || !selectedTheme || !selectedAngle || !selectedConcept || !result) return
    setIsGeneratingLandscape(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verticalLabel: selectedVertical.label,
          campaignName: selectedCampaign.name,
          themeName: selectedTheme.name,
          angle: selectedAngle,
          concept: selectedConcept,
          layout: 'statement',
          providedCopy: result.copy,

          illustrationMode,
          imageFormat: 'landscape',
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? `Failed: ${res.status}`)
      }
      const data = await res.json()
      setResult(prev => prev ? { ...prev, landscapeImage: data.landscapeImage } : prev)
    } catch (e: unknown) {
      setGenerateError(e instanceof Error ? e.message : 'Landscape generation failed.')
    } finally {
      setIsGeneratingLandscape(false)
    }
  }

  const canGenerateConcepts = !!(selectedAngle && !isLoadingConcepts)
  const canGenerateCreative = !!(selectedConcept && !isGenerating)
  const hasCreative = !!(result || isGenerating || generateError)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">

      {/* ── Top bar: Campaign selection ── */}
      <div className="border-b border-white/5 bg-[#0A1628]">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-5 py-4">

          {/* Row 1: dropdowns + generate button */}
          <div className="flex items-end gap-3">
            <div className="w-52">
              <Select
                label="Vertical"
                value={verticalId}
                onChange={onVerticalChange}
                placeholder="Select vertical…"
                options={verticals.map(v => ({ value: v.id, label: v.label }))}
              />
            </div>
            <div className="w-64">
              <Select
                label="Campaign"
                value={campaignId}
                onChange={onCampaignChange}
                placeholder={isLoadingKB ? 'Loading…' : 'Select campaign…'}
                disabled={!verticalId || isLoadingKB}
                options={campaigns.map(c => ({ value: c.id, label: c.name }))}
              />
            </div>
            <div className="w-64">
              <Select
                label="Theme"
                value={themeId}
                onChange={onThemeChange}
                placeholder="Select theme…"
                disabled={!campaignId}
                options={themes.map(t => ({
                  value: t.id,
                  label: `${t.name} (${t.totalFrequency})`,
                }))}
              />
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Generate Concepts */}
            <button
              onClick={generateConcepts}
              disabled={!canGenerateConcepts}
              className="flex items-center gap-2 rounded-xl bg-[#F5A623] px-5 py-2 text-sm font-bold text-[#0A1628] transition hover:bg-[#f0a020] disabled:cursor-not-allowed disabled:opacity-30"
            >
              {isLoadingConcepts ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0A1628]/20 border-t-[#0A1628]" />
                  Generating…
                </>
              ) : (
                '⚡ Generate Concepts'
              )}
            </button>
          </div>

          {/* Row 2: Angle chips (only when theme is selected) */}
          {selectedTheme && angles.length > 0 && (
            <div className="flex items-start gap-3">
              <span className="mt-2 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-white/35">
                Angle
              </span>

              {/* Collapsed: horizontal scroll row */}
              {!isAnglesExpanded && (
                <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
                  {angles.map(angle => (
                    <button
                      key={angle.id}
                      onClick={() => onAngleChange(angle.id)}
                      className={`flex shrink-0 max-w-[240px] items-start gap-2 rounded-lg border px-3 py-2 text-left text-xs transition ${
                        angleId === angle.id
                          ? 'border-[#F5A623]/50 bg-[#F5A623]/8 text-white'
                          : 'border-white/8 text-white/50 hover:border-white/18 hover:text-white/75'
                      }`}
                    >
                      <span className={`mt-0.5 shrink-0 rounded px-1 py-0.5 text-[10px] font-bold ${
                        angleId === angle.id ? 'bg-[#F5A623] text-[#0A1628]' : 'bg-white/8 text-[#F5A623]'
                      }`}>
                        {angle.frequency}
                      </span>
                      <span className="line-clamp-2 leading-relaxed">{angle.description}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Expanded: wrapped grid with full text */}
              {isAnglesExpanded && (
                <div className="grid flex-1 grid-cols-3 gap-2 xl:grid-cols-4">
                  {angles.map(angle => (
                    <button
                      key={angle.id}
                      onClick={() => onAngleChange(angle.id)}
                      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-left text-xs transition ${
                        angleId === angle.id
                          ? 'border-[#F5A623]/50 bg-[#F5A623]/8 text-white'
                          : 'border-white/8 text-white/50 hover:border-white/18 hover:text-white/75'
                      }`}
                    >
                      <span className={`mt-0.5 shrink-0 rounded px-1 py-0.5 text-[10px] font-bold ${
                        angleId === angle.id ? 'bg-[#F5A623] text-[#0A1628]' : 'bg-white/8 text-[#F5A623]'
                      }`}>
                        {angle.frequency}
                      </span>
                      <span className="leading-relaxed">{angle.description}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Toggle button */}
              <button
                onClick={() => setIsAnglesExpanded(v => !v)}
                title={isAnglesExpanded ? 'Collapse angles' : 'Expand angles'}
                className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 text-white/40 transition hover:border-white/25 hover:text-white/70"
              >
                {isAnglesExpanded ? '∧' : '∨'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Main area: Concepts + Creative ── */}
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 gap-4 p-5">

        {/* ── Concepts panel ── */}
        <section className="flex min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-white/8 bg-[#0A1628] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Creative Concepts</h2>
              <p className="mt-0.5 text-[11px] text-white/35">
                {concepts.length > 0
                  ? `${concepts.length} concepts — pick one to generate`
                  : 'Select an angle and generate concepts'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {hasCreative && !isCreativePanelOpen && (
                <button
                  onClick={() => setIsCreativePanelOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white/60 transition hover:border-[#F5A623]/40 hover:text-[#F5A623]"
                >
                  Creative →
                </button>
              )}
              {selectedConcept && (
                <button
                  onClick={generateCreative}
                  disabled={!canGenerateCreative}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#F5A623] px-3 py-1.5 text-xs font-bold text-[#0A1628] transition hover:bg-[#f0a020] disabled:opacity-40"
                >
                  {isGenerating ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#0A1628]/20 border-t-[#0A1628]" />
                      Generating…
                    </>
                  ) : (
                    '→ Generate Creative'
                  )}
                </button>
              )}
            </div>
          </div>

          {conceptError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {conceptError}
            </div>
          )}

          {/* Loading skeletons */}
          {isLoadingConcepts && (
            <div className="grid grid-cols-2 gap-2 overflow-y-auto">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-xl bg-white/4" />
              ))}
            </div>
          )}

          {/* Concept cards */}
          {!isLoadingConcepts && concepts.length > 0 && (
            <div
              className={`grid gap-2 overflow-y-auto pr-1 transition-all duration-300 ${
                isCreativePanelOpen ? 'grid-cols-1' : 'grid-cols-2'
              }`}
              style={{ maxHeight: 'calc(100vh - 300px)' }}
            >
              {concepts.map(concept => (
                <ConceptCard
                  key={concept.id}
                  concept={concept}
                  selected={selectedConceptId === concept.id}
                  onSelect={() => {
                    setSelectedConceptId(concept.id)
                    setResult(null)
                    setGenerateError(null)
                  }}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoadingConcepts && concepts.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
              <div className="text-3xl opacity-10">◻</div>
              <p className="text-xs text-white/20">
                Select a vertical, campaign, theme, and angle —<br />
                then click Generate Concepts
              </p>
            </div>
          )}
        </section>

        {/* ── Creative panel (slides in from right) ── */}
        <div
          className="shrink-0 overflow-hidden transition-all duration-300 ease-in-out"
          style={{ width: isCreativePanelOpen ? '560px' : '0px' }}
        >
          <main className="flex h-full w-[560px] flex-col gap-4 rounded-2xl border border-white/8 bg-[#0A1628] p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Creative</h2>
                <p className="mt-0.5 text-[11px] text-white/35">
                  {result ? 'Square + Landscape' : 'Generating…'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {result && !isGenerating && (
                  <button
                    onClick={generateCreative}
                    className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1 text-xs font-medium text-white/60 transition hover:border-[#F5A623]/40 hover:text-[#F5A623]"
                  >
                    ↻ Regenerate
                  </button>
                )}
                <button
                  onClick={() => setIsCreativePanelOpen(false)}
                  title="Close panel"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-white/40 transition hover:border-white/25 hover:text-white/70"
                >
                  ›
                </button>
              </div>
            </div>

            {generateError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {generateError}
              </div>
            )}

            {/* Copy block */}
            {(result?.copy || isGenerating) && (
              <div className="rounded-xl border border-white/8 bg-[#070E1A] p-4">
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/30">
                  Ad Copy
                </p>
                {result?.copy ? (
                  <div className="grid grid-cols-2 gap-x-5 gap-y-2.5 text-xs">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-white/25">Headline</span>
                      <p className="mt-0.5 font-semibold text-white">{result.copy.headline}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-white/25">Subheadline</span>
                      <p className="mt-0.5 text-white/75">{result.copy.subheadline}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-white/25">Body</span>
                      <ul className="mt-0.5 space-y-0.5 text-white/65">
                        {result.copy.body.map((b, i) => <li key={i}>• {b}</li>)}
                      </ul>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-white/25">CTA</span>
                      <p className="mt-0.5 inline-block rounded-md bg-[#F5A623] px-2.5 py-1 text-[11px] font-bold text-[#0A1628]">
                        {result.copy.cta}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-12 animate-pulse rounded-lg bg-white/4" />
                )}
              </div>
            )}

            {/* Images */}
            <div className="flex flex-col gap-4 overflow-y-auto">
              <ImageCard label="Square (1:1)" format="square" src={result?.squareImage ?? null} isLoading={isGenerating} />

              {result?.landscapeImage || isGeneratingLandscape ? (
                <ImageCard label="Landscape (1.5:1)" format="landscape" src={result?.landscapeImage ?? null} isLoading={isGeneratingLandscape} />
              ) : result?.squareImage ? (
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Landscape (1.5:1)</span>
                  <button
                    onClick={generateLandscape}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/8 bg-[#0D1E38] py-6 text-xs font-medium text-white/40 transition hover:border-[#F5A623]/30 hover:text-[#F5A623]"
                  >
                    <span>↳ Generate Landscape</span>
                  </button>
                </div>
              ) : null}
            </div>

            {!result && !isGenerating && !generateError && (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
                <div className="text-3xl opacity-10">◻</div>
                <p className="text-xs text-white/20">
                  Pick a concept from the panel on the left,<br />
                  then click Generate Creative
                </p>
              </div>
            )}
          </main>
        </div>

      </div>
    </div>
  )
}
