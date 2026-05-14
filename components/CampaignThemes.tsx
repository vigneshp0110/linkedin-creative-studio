'use client'

import { useState, useCallback } from 'react'
import { AdCopy, Angle, Campaign, CreativeConcept, Implication, Theme } from '@/lib/types'

interface Result {
  copy: AdCopy
  squareImage: string
  landscapeImage: string
}

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

function ImplicationCard({
  implication,
  selected,
  onSelect,
}: {
  implication: Implication
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex w-56 shrink-0 flex-col gap-2 rounded-xl border p-3.5 text-left transition ${
        selected
          ? 'border-[#F5A623]/60 bg-[#F5A623]/8 ring-1 ring-[#F5A623]/20'
          : 'border-white/8 hover:border-white/20 hover:bg-white/2'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`text-xs font-bold leading-snug ${selected ? 'text-white' : 'text-white/70'}`}>
          {implication.label}
        </span>
        {selected && (
          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#F5A623]" />
        )}
      </div>
      <p className={`text-[11px] leading-relaxed ${selected ? 'text-white/70' : 'text-white/35'}`}>
        {implication.expansion}
      </p>
    </button>
  )
}

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
        <div className="flex items-center gap-1.5">
          <span
            className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
              selected ? 'bg-[#F5A623] text-[#0A1628]' : 'bg-white/8 text-white/40'
            }`}
          >
            {concept.conceptNumber}
          </span>
          {concept.formatTag && (
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
              selected ? 'bg-white/10 text-white/70' : 'bg-white/5 text-white/30'
            }`}>
              {concept.formatTag}
            </span>
          )}
        </div>
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

export default function CampaignThemes({
  campaignThemes,
}: {
  campaignThemes: { id: string; label: string; available: boolean }[]
}) {
  const [campaignThemeId, setCampaignThemeId] = useState('')
  const [personaGroupId, setPersonaGroupId] = useState('')
  const [themeId, setThemeId] = useState('')
  const [angleId, setAngleId] = useState('')
  const [customContext, setCustomContext] = useState('')

  const [personaGroups, setPersonaGroups] = useState<Campaign[]>([])
  const [isLoadingKB, setIsLoadingKB] = useState(false)

  // Implication step — loaded after angle is picked
  const [implications, setImplications] = useState<Implication[]>([])
  const [selectedImplicationId, setSelectedImplicationId] = useState<string | null>(null)
  const [isLoadingImplications, setIsLoadingImplications] = useState(false)

  const [concepts, setConcepts] = useState<CreativeConcept[]>([])
  const [isLoadingConcepts, setIsLoadingConcepts] = useState(false)
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null)
  const [conceptError, setConceptError] = useState<string | null>(null)

  // "Use my own concept" mode
  const [useOwnConcept, setUseOwnConcept] = useState(false)
  const [ownConceptText, setOwnConceptText] = useState('')

  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)

  // Inline copy editing
  const [editedCopy, setEditedCopy] = useState<AdCopy | null>(null)
  const [isCopyEditing, setIsCopyEditing] = useState(false)
  const [isReRendering, setIsReRendering] = useState(false)

  const [isCreativePanelOpen, setIsCreativePanelOpen] = useState(false)
  const [isAnglesExpanded, setIsAnglesExpanded] = useState(false)

  const selectedCampaignTheme = campaignThemes.find(t => t.id === campaignThemeId) ?? null
  const selectedPersonaGroup = personaGroups.find(p => p.id === personaGroupId) ?? null
  const themes: Theme[] = selectedPersonaGroup?.themes ?? []
  const selectedTheme = themes.find(t => t.id === themeId) ?? null
  const angles: Angle[] = selectedTheme?.angles ?? []
  const selectedAngle = angles.find(a => a.id === angleId) ?? null
  const selectedConcept = concepts.find(c => c.id === selectedConceptId) ?? null
  const selectedImplication = implications.find(i => i.id === selectedImplicationId) ?? null
  const hasImplications = implications.length > 0

  const onCampaignThemeChange = useCallback(async (id: string) => {
    setCampaignThemeId(id)
    setPersonaGroupId('')
    setThemeId('')
    setAngleId('')
    setPersonaGroups([])
    setImplications([])
    setSelectedImplicationId(null)
    setConcepts([])
    setSelectedConceptId(null)
    setResult(null)
    setIsCreativePanelOpen(false)
    if (!id) return
    setIsLoadingKB(true)
    try {
      const res = await fetch(`/api/kb?campaignTheme=${id}`)
      const data = await res.json()
      setPersonaGroups(data.campaigns ?? [])
    } catch {
      // silent
    } finally {
      setIsLoadingKB(false)
    }
  }, [])

  const onPersonaGroupChange = (id: string) => {
    setPersonaGroupId(id)
    setThemeId('')
    setAngleId('')
    setImplications([])
    setSelectedImplicationId(null)
    setConcepts([])
    setSelectedConceptId(null)
    setResult(null)
    setIsCreativePanelOpen(false)
  }

  const onThemeChange = (id: string) => {
    setThemeId(id)
    setAngleId('')
    setImplications([])
    setSelectedImplicationId(null)
    setConcepts([])
    setSelectedConceptId(null)
    setResult(null)
    setIsCreativePanelOpen(false)
  }

  const onAngleChange = useCallback(async (id: string) => {
    setAngleId(id)
    setImplications([])
    setSelectedImplicationId(null)
    setConcepts([])
    setSelectedConceptId(null)
    setResult(null)
    setIsCreativePanelOpen(false)
    if (!id || !campaignThemeId || !personaGroupId || !themeId) return
    setIsLoadingImplications(true)
    try {
      const res = await fetch(
        `/api/implications?campaignTheme=${campaignThemeId}&personaGroup=${personaGroupId}&theme=${themeId}&angle=${id}`
      )
      const data = await res.json()
      setImplications(data.implications ?? [])
    } catch {
      // silent — no implications is fine, concepts still generate
    } finally {
      setIsLoadingImplications(false)
    }
  }, [campaignThemeId, personaGroupId, themeId])

  const onImplicationSelect = (id: string) => {
    setSelectedImplicationId(id)
    setConcepts([])
    setSelectedConceptId(null)
    setResult(null)
    setIsCreativePanelOpen(false)
  }

  const generateConcepts = async () => {
    if (!selectedCampaignTheme || !selectedPersonaGroup || !selectedTheme || !selectedAngle) return
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
          verticalLabel: selectedCampaignTheme.label,
          campaignName: selectedPersonaGroup.name,
          themeName: selectedTheme.name,
          angle: selectedAngle,
          implication: selectedImplication ?? undefined,
          customContext: customContext.trim() || undefined,
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

  const buildConceptForGenerate = (): CreativeConcept | undefined => {
    if (useOwnConcept) {
      if (!ownConceptText.trim()) return undefined
      return {
        id: 'custom',
        conceptNumber: 0,
        formatTag: 'Original Composition',
        hook: ownConceptText,
        visualDirection: ownConceptText,
        emotionalRegister: '',
        narrativeStructure: '',
        ctaDirection: '',
        scrollStopper: '',
      }
    }
    return selectedConcept ?? undefined
  }

  const generateCreative = async () => {
    const concept = buildConceptForGenerate()
    if (!selectedCampaignTheme || !selectedPersonaGroup || !selectedTheme || !selectedAngle || !concept) return
    setIsGenerating(true)
    setResult(null)
    setEditedCopy(null)
    setIsCopyEditing(false)
    setGenerateError(null)
    setIsCreativePanelOpen(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verticalLabel: selectedCampaignTheme.label,
          campaignName: selectedPersonaGroup.name,
          themeName: selectedTheme.name,
          angle: selectedAngle,
          concept,
          implication: selectedImplication ?? undefined,
          layout: 'statement',
          customContext: customContext.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? `Failed: ${res.status}`)
      }
      const data = await res.json()
      setResult(data)
      setEditedCopy(data.copy)
    } catch (e: unknown) {
      setGenerateError(e instanceof Error ? e.message : 'Generation failed.')
    } finally {
      setIsGenerating(false)
    }
  }

  const reRenderCreative = async () => {
    const concept = buildConceptForGenerate()
    if (!selectedCampaignTheme || !selectedPersonaGroup || !selectedTheme || !selectedAngle || !concept || !editedCopy) return
    setIsReRendering(true)
    setGenerateError(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verticalLabel: selectedCampaignTheme.label,
          campaignName: selectedPersonaGroup.name,
          themeName: selectedTheme.name,
          angle: selectedAngle,
          concept,
          implication: selectedImplication ?? undefined,
          layout: 'statement',
          providedCopy: editedCopy,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? `Failed: ${res.status}`)
      }
      const data = await res.json()
      setResult({ ...data, copy: editedCopy })
      setIsCopyEditing(false)
    } catch (e: unknown) {
      setGenerateError(e instanceof Error ? e.message : 'Re-render failed.')
    } finally {
      setIsReRendering(false)
    }
  }

  const canGenerateConcepts = !!(selectedAngle && !isLoadingConcepts && !useOwnConcept)
  const canGenerateCreative = !!((useOwnConcept ? ownConceptText.trim() : selectedConcept) && !isGenerating && !isReRendering)
  const hasCreative = !!(result || isGenerating || generateError)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">

      {/* ── Top bar ── */}
      <div className="border-b border-white/5 bg-[#0A1628]">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-5 py-4">

          {/* Row 1: dropdowns + generate button */}
          <div className="flex items-end gap-3">
            {/* Campaign Theme */}
            <div className="w-56">
              <Select
                label="Campaign Theme"
                value={campaignThemeId}
                onChange={onCampaignThemeChange}
                placeholder="Select theme…"
                options={campaignThemes.map(t => ({
                  value: t.id,
                  label: t.available ? t.label : `${t.label} — Coming Soon`,
                }))}
              />
            </div>

            {/* Persona Group */}
            <div className="w-64">
              <Select
                label="Persona Group"
                value={personaGroupId}
                onChange={onPersonaGroupChange}
                placeholder={isLoadingKB ? 'Loading…' : 'Select persona group…'}
                disabled={!campaignThemeId || isLoadingKB}
                options={personaGroups.map(p => ({ value: p.id, label: p.name }))}
              />
            </div>

            {/* Theme */}
            <div className="w-64">
              <Select
                label="Theme"
                value={themeId}
                onChange={onThemeChange}
                placeholder="Select theme…"
                disabled={!personaGroupId}
                options={themes.map(t => ({
                  value: t.id,
                  label: `${t.name} (${t.totalFrequency})`,
                }))}
              />
            </div>

            <div className="flex-1" />

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

          {/* Row 2: Custom context */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-white/35">
              Your Copy / Context
              <span className="ml-2 font-normal normal-case tracking-normal text-white/20">optional — paste talking points, custom copy, or extra direction</span>
            </label>
            <textarea
              value={customContext}
              onChange={e => setCustomContext(e.target.value)}
              rows={3}
              placeholder="e.g. Highlight that Everstage pays reps in real-time, not end of quarter. Target CFOs who just came out of a painful comp audit."
              className="w-full resize-none rounded-lg border border-white/10 bg-[#070E1A] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none transition focus:border-[#F5A623]/50 focus:ring-1 focus:ring-[#F5A623]/20"
            />
          </div>

          {/* Row 4: Angle chips */}
          {selectedTheme && angles.length > 0 && (
            <div className="flex items-start gap-3">
              <span className="mt-2 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-white/35">
                Angle
              </span>

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

              <button
                onClick={() => setIsAnglesExpanded(v => !v)}
                title={isAnglesExpanded ? 'Collapse angles' : 'Expand angles'}
                className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 text-white/40 transition hover:border-white/25 hover:text-white/70"
              >
                {isAnglesExpanded ? '∧' : '∨'}
              </button>
            </div>
          )}

          {/* Row 5: Implication cards — appear after angle is selected */}
          {angleId && (isLoadingImplications || implications.length > 0) && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/35">
                  Implication
                </span>
                <span className="text-[10px] text-white/20">
                  — pick the emotional truth this angle hits for this persona
                </span>
              </div>
              {isLoadingImplications ? (
                <div className="flex gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-24 w-56 animate-pulse rounded-xl bg-white/4" />
                  ))}
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {implications.map(impl => (
                    <ImplicationCard
                      key={impl.id}
                      implication={impl}
                      selected={selectedImplicationId === impl.id}
                      onSelect={() => onImplicationSelect(impl.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 gap-4 p-5">

        {/* Concepts panel */}
        <section className="flex min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-white/8 bg-[#0A1628] p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-white">Creative Concepts</h2>
              <p className="mt-0.5 text-[11px] text-white/35">
                {useOwnConcept
                  ? 'Describe your concept — image generates directly from it'
                  : concepts.length > 0
                    ? `${concepts.length} concepts — pick one to generate`
                    : 'Select an angle and generate concepts'}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {/* Toggle: Claude concepts vs own concept */}
              <div className="flex rounded-lg border border-white/10 p-0.5">
                <button
                  onClick={() => setUseOwnConcept(false)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                    !useOwnConcept
                      ? 'bg-white/10 text-white'
                      : 'text-white/35 hover:text-white/60'
                  }`}
                >
                  ⚡ Claude
                </button>
                <button
                  onClick={() => setUseOwnConcept(true)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                    useOwnConcept
                      ? 'bg-[#F5A623]/15 text-[#F5A623]'
                      : 'text-white/35 hover:text-white/60'
                  }`}
                >
                  ✎ My Concept
                </button>
              </div>

              {hasCreative && !isCreativePanelOpen && (
                <button
                  onClick={() => setIsCreativePanelOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white/60 transition hover:border-[#F5A623]/40 hover:text-[#F5A623]"
                >
                  Creative →
                </button>
              )}
              {(selectedConcept || (useOwnConcept && ownConceptText.trim())) && (
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

          {/* Selected implication badge */}
          {selectedImplication && (
            <div className="flex items-start gap-2 rounded-lg border border-[#F5A623]/20 bg-[#F5A623]/5 px-3 py-2">
              <span className="mt-0.5 shrink-0 text-[10px] font-bold uppercase tracking-widest text-[#F5A623]/70">
                Implication
              </span>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-white">{selectedImplication.label} —</span>
                <span className="ml-1 text-xs text-white/50">{selectedImplication.expansion}</span>
              </div>
            </div>
          )}

          {conceptError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {conceptError}
            </div>
          )}

          {/* Own concept mode */}
          {useOwnConcept && (
            <div className="flex flex-1 flex-col gap-3">
              <textarea
                value={ownConceptText}
                onChange={e => setOwnConceptText(e.target.value)}
                rows={8}
                placeholder={`Describe your creative concept in as much detail as you want.\n\ne.g. Dark navy background. Bold white stat "73% of reps don't trust their commission statement" in the centre — the number huge, in gold. Below: one line subhead. Bottom left: Everstage logo. CTA button bottom right: "See why".`}
                className="w-full flex-1 resize-none rounded-xl border border-white/10 bg-[#070E1A] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-[#F5A623]/50 focus:ring-1 focus:ring-[#F5A623]/20"
              />
              <button
                onClick={generateCreative}
                disabled={!canGenerateCreative}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5A623] py-2.5 text-sm font-bold text-[#0A1628] transition hover:bg-[#f0a020] disabled:cursor-not-allowed disabled:opacity-30"
              >
                {isGenerating ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0A1628]/20 border-t-[#0A1628]" />
                    Generating…
                  </>
                ) : (
                  '→ Generate Creative from My Concept'
                )}
              </button>
            </div>
          )}

          {/* Claude-generated concepts */}
          {!useOwnConcept && (
            <>
              {isLoadingConcepts && (
                <div className="grid grid-cols-2 gap-2 overflow-y-auto">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-48 animate-pulse rounded-xl bg-white/4" />
                  ))}
                </div>
              )}

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
                        setEditedCopy(null)
                        setIsCopyEditing(false)
                        setGenerateError(null)
                      }}
                    />
                  ))}
                </div>
              )}

              {!isLoadingConcepts && concepts.length === 0 && (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
                  <div className="text-3xl opacity-10">◻</div>
                  <p className="text-xs text-white/20">
                      Select a campaign theme, persona group, theme, and angle —
                    <br />
                    then pick an implication and click Generate Concepts
                  </p>
                </div>
              )}
            </>
          )}
        </section>

        {/* Creative panel */}
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
                {result && !isGenerating && !isReRendering && !isCopyEditing && (
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

            {(result?.copy || isGenerating) && (
              <div className={`rounded-xl border bg-[#070E1A] p-4 transition ${isCopyEditing ? 'border-[#F5A623]/30' : 'border-white/8'}`}>
                <div className="mb-2.5 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">
                    Ad Copy
                  </p>
                  {result?.copy && (
                    <button
                      onClick={() => setIsCopyEditing(v => !v)}
                      className={`text-[11px] font-medium transition ${isCopyEditing ? 'text-[#F5A623]' : 'text-white/35 hover:text-white/70'}`}
                    >
                      {isCopyEditing ? '✓ Done editing' : '✎ Edit copy'}
                    </button>
                  )}
                </div>
                {result?.copy && editedCopy ? (
                  <div className="grid grid-cols-2 gap-x-5 gap-y-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-white/25">Headline</span>
                      {isCopyEditing ? (
                        <input
                          value={editedCopy.headline}
                          onChange={e => setEditedCopy(c => c ? { ...c, headline: e.target.value } : c)}
                          className="mt-1 w-full rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs font-semibold text-white outline-none focus:border-[#F5A623]/50"
                        />
                      ) : (
                        <p className="mt-0.5 font-semibold text-white">{editedCopy.headline}</p>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-white/25">Subheadline</span>
                      {isCopyEditing ? (
                        <input
                          value={editedCopy.subheadline}
                          onChange={e => setEditedCopy(c => c ? { ...c, subheadline: e.target.value } : c)}
                          className="mt-1 w-full rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs text-white/80 outline-none focus:border-[#F5A623]/50"
                        />
                      ) : (
                        <p className="mt-0.5 text-white/75">{editedCopy.subheadline}</p>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-white/25">Body</span>
                      {isCopyEditing ? (
                        <textarea
                          value={editedCopy.body.join('\n')}
                          onChange={e => setEditedCopy(c => c ? { ...c, body: e.target.value.split('\n').filter(Boolean) } : c)}
                          rows={3}
                          className="mt-1 w-full resize-none rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs text-white/70 outline-none focus:border-[#F5A623]/50"
                        />
                      ) : (
                        <ul className="mt-0.5 space-y-0.5 text-white/65">
                          {editedCopy.body.map((b, i) => <li key={i}>• {b}</li>)}
                        </ul>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-white/25">CTA</span>
                      {isCopyEditing ? (
                        <input
                          value={editedCopy.cta}
                          onChange={e => setEditedCopy(c => c ? { ...c, cta: e.target.value } : c)}
                          className="mt-1 w-full rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs font-bold text-[#F5A623] outline-none focus:border-[#F5A623]/50"
                        />
                      ) : (
                        <p className="mt-0.5 inline-block rounded-md bg-[#F5A623] px-2.5 py-1 text-[11px] font-bold text-[#0A1628]">
                          {editedCopy.cta}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-12 animate-pulse rounded-lg bg-white/4" />
                )}
                {isCopyEditing && (
                  <button
                    onClick={reRenderCreative}
                    disabled={isReRendering}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#F5A623] py-2 text-xs font-bold text-[#0A1628] transition hover:bg-[#f0a020] disabled:opacity-50"
                  >
                    {isReRendering ? (
                      <>
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#0A1628]/20 border-t-[#0A1628]" />
                        Re-rendering…
                      </>
                    ) : (
                      '↺ Re-render image with edited copy'
                    )}
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-col gap-4 overflow-y-auto">
              <ImageCard label="Square (1:1)" format="square" src={result?.squareImage ?? null} isLoading={isGenerating} />
              <ImageCard label="Landscape (1.5:1)" format="landscape" src={result?.landscapeImage ?? null} isLoading={isGenerating} />
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
