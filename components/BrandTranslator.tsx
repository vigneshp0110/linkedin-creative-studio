'use client'

import { useState, useRef, useEffect } from 'react'

type Phase = 'upload' | 'translating' | 'result'
type Format = 'square' | 'landscape'

interface ExtractedCopy {
  headline: string
  subheadline: string
  cta: string
  intent: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const TRANSLATING_STEPS = [
  'Reading your old creative…',
  'Extracting copy and intent…',
  'Choosing new brand direction…',
  'Generating new creative…',
  'Applying Everstage brand system…',
]

const EXAMPLE_PROMPTS = [
  'Try the E-grid checkerboard pattern',
  'Switch to a teal background',
  'Make the headline much larger',
  'Use floating coloured bars over a photo',
  'Try a darker, eggplant-dominant version',
  'Make it feel more energetic',
]

export default function BrandTranslator() {
  const [phase, setPhase] = useState<Phase>('upload')
  const [format, setFormat] = useState<Format>('square')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null)
  const [translatedImage, setTranslatedImage] = useState<string | null>(null)
  const [extractedCopy, setExtractedCopy] = useState<ExtractedCopy | null>(null)
  const [brandDirection, setBrandDirection] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isRefining, setIsRefining] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (phase !== 'translating') return
    const id = setInterval(() => setStepIndex(s => (s + 1) % TRANSLATING_STEPS.length), 2200)
    return () => clearInterval(id)
  }, [phase])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isRefining])

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setUploadedFile(file)
    setUploadedPreview(URL.createObjectURL(file))
    setError(null)
  }

  async function handleTranslate() {
    if (!uploadedFile) return
    setPhase('translating')
    setStepIndex(0)
    setError(null)

    const fd = new FormData()
    fd.append('image', uploadedFile)
    fd.append('format', format)

    try {
      const res = await fetch('/api/translate-creative', { method: 'POST', body: fd })
      const raw = await res.text()
      let data: { image?: string; analysis?: ExtractedCopy; direction?: string; chatIntro?: string; error?: string } = {}
      try { data = JSON.parse(raw) } catch { throw new Error(`Server error: ${raw.slice(0, 150)}`) }
      if (!res.ok || !data.image) throw new Error(data.error || 'Translation failed')

      setTranslatedImage(data.image)
      setExtractedCopy(data.analysis ?? null)
      setBrandDirection(data.direction ?? '')
      setChatMessages([{
        role: 'assistant',
        content: data.chatIntro ?? "I've translated your creative to the new Everstage brand. What would you like to refine?",
      }])
      setPhase('result')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setPhase('upload')
    }
  }

  async function handleSend(msg?: string) {
    const text = (msg ?? chatInput).trim()
    if (!text || isRefining || !translatedImage) return
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: text }])
    setIsRefining(true)

    try {
      const res = await fetch('/api/translate-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentImageBase64: translatedImage,
          userMessage: text,
          extractedCopy,
          brandDirection,
          chatHistory: chatMessages,
          format,
        }),
      })
      const raw = await res.text()
      let data: { image?: string | null; assistantMessage?: string; error?: string } = {}
      try { data = JSON.parse(raw) } catch { throw new Error(`Server error: ${raw.slice(0, 150)}`) }

      if (data.image) setTranslatedImage(data.image)
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.assistantMessage ?? "Done! Let me know if you'd like anything else.",
      }])
    } catch (e) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `Something went wrong: ${e instanceof Error ? e.message : 'Unknown error'}`,
      }])
    } finally {
      setIsRefining(false)
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }

  function handleDownload() {
    if (!translatedImage) return
    const a = document.createElement('a')
    a.href = translatedImage
    a.download = `everstage-${format}-${Date.now()}.png`
    a.click()
  }

  function handleReset() {
    setPhase('upload')
    setUploadedFile(null)
    setUploadedPreview(null)
    setTranslatedImage(null)
    setExtractedCopy(null)
    setBrandDirection('')
    setChatMessages([])
    setChatInput('')
    setError(null)
  }

  // ─── UPLOAD ───────────────────────────────────────────────────────────────
  if (phase === 'upload') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-8">
        <div className="w-full max-w-lg">
          <h2 className="mb-1 text-sm font-semibold text-white">Brand Translator</h2>
          <p className="mb-6 text-xs text-white/40">
            Upload a creative from the old brand. Claude analyses it, extracts the copy, and regenerates it in the new Everstage design system. Refine the output through conversation.
          </p>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
              {error}
            </div>
          )}

          {!uploadedFile ? (
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
              onClick={() => fileInputRef.current?.click()}
              className={`flex h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition ${
                isDragging ? 'border-[#1BA894] bg-[#1BA894]/5' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
              }`}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="mb-3 text-white/20">
                <rect x="2.5" y="4.5" width="23" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="9" cy="10.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2.5 20l6-5 4.5 4.5 3.5-3.5L25.5 23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-sm font-medium text-white/50">Drop your old creative here</p>
              <p className="mt-1 text-xs text-white/25">or click to browse · PNG, JPG</p>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-xl border border-white/10">
              <img src={uploadedPreview!} alt="Uploaded creative" className="w-full object-contain" />
              <button
                onClick={() => { setUploadedFile(null); setUploadedPreview(null) }}
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white/60 transition hover:text-white"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Output</span>
            <div className="flex rounded-lg border border-white/10 p-0.5">
              {(['square', 'landscape'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`rounded-md px-3 py-1 text-[11px] font-medium capitalize transition ${
                    format === f ? 'bg-white/10 text-white' : 'text-white/35 hover:text-white/60'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {uploadedFile && (
            <button
              onClick={handleTranslate}
              className="mt-5 w-full rounded-xl bg-[#1BA894] py-3 text-sm font-semibold text-white transition hover:bg-[#1BA894]/90"
            >
              Translate to New Brand →
            </button>
          )}
        </div>
      </div>
    )
  }

  // ─── TRANSLATING ──────────────────────────────────────────────────────────
  if (phase === 'translating') {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1BA894]/20 border-t-[#1BA894]" />
          <p className="text-sm text-white/50">{TRANSLATING_STEPS[stepIndex]}</p>
        </div>
      </div>
    )
  }

  // ─── RESULT ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Image comparison row */}
      <div className="flex shrink-0 gap-3 border-b border-white/5 p-4" style={{ maxHeight: '45vh' }}>
        {/* Original */}
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">Original</p>
          <div className="flex-1 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
            <img src={uploadedPreview!} alt="Original" className="h-full w-full object-contain" />
          </div>
        </div>

        {/* Translated */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">New Brand</p>
            <div className="flex items-center gap-1.5">
              {isRefining && (
                <div className="h-3 w-3 animate-spin rounded-full border border-[#1BA894]/30 border-t-[#1BA894]" />
              )}
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-white/40 transition hover:bg-white/5 hover:text-white/70"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 1v5.5M2.5 5l2.5 2.5L7.5 5M1 9h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Download
              </button>
              <button
                onClick={handleReset}
                className="rounded-md px-2 py-1 text-[10px] text-white/40 transition hover:bg-white/5 hover:text-white/70"
              >
                ← New
              </button>
            </div>
          </div>
          <div className="relative flex-1 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
            {translatedImage && (
              <img src={translatedImage} alt="Translated" className="h-full w-full object-contain" />
            )}
            {isRefining && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1BA894]/20 border-t-[#1BA894]" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat panel */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[72%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#1BA894]/20 text-white/80'
                    : 'bg-white/5 text-white/60'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Example prompts shown when chat is fresh (just the intro message) */}
          {chatMessages.length === 1 && !isRefining && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {EXAMPLE_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => handleSend(p)}
                  className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/40 transition hover:border-white/20 hover:text-white/65"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {isRefining && (
            <div className="flex justify-start">
              <div className="rounded-xl bg-white/5 px-3.5 py-2.5">
                <span className="animate-pulse text-xs text-white/35">Applying changes…</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-white/5 p-3">
          <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <textarea
              ref={textareaRef}
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSend() }
              }}
              placeholder="Ask for refinements… e.g. 'Try a periwinkle E-grid' or 'Make it warmer'"
              rows={2}
              className="flex-1 resize-none bg-transparent text-xs text-white/80 placeholder-white/25 outline-none"
            />
            <button
              onClick={() => handleSend()}
              disabled={!chatInput.trim() || isRefining}
              className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1BA894] text-white transition hover:bg-[#1BA894]/90 disabled:opacity-30"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <p className="mt-1.5 text-[9px] text-white/20">⌘↵ to send</p>
        </div>
      </div>
    </div>
  )
}
