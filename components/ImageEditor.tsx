'use client'

import { useState, useRef, useCallback } from 'react'

interface ChatMessage {
  id: string
  role: 'user' | 'result'
  text: string
  imageUrl?: string
  isLoading?: boolean
}

export default function ImageEditor() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null)
  const [currentImageBase64, setCurrentImageBase64] = useState<string | null>(null)
  const [changeRequest, setChangeRequest] = useState('')
  const [changeHistory, setChangeHistory] = useState<string[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [format, setFormat] = useState<'square' | 'landscape'>('square')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const loadFilePreview = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setUploadedPreview(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return
    setUploadedFile(file)
    setCurrentImageBase64(null)
    setChangeHistory([])
    setChatMessages([])
    setChangeRequest('')
    loadFilePreview(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const currentDisplayImage = currentImageBase64 || uploadedPreview

  const handleApplyChange = async () => {
    const trimmed = changeRequest.trim()
    if (!trimmed) return
    if (!uploadedFile && !currentImageBase64) return
    if (isGenerating) return

    const msgId = Date.now().toString()
    const loadingId = (Date.now() + 1).toString()

    setChatMessages(prev => [
      ...prev,
      { id: msgId, role: 'user', text: trimmed },
      { id: loadingId, role: 'result', text: '', isLoading: true },
    ])
    setChangeRequest('')
    setIsGenerating(true)

    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)

    try {
      const fd = new FormData()
      fd.append('changeRequest', trimmed)
      fd.append('changeHistory', JSON.stringify(changeHistory))
      fd.append('format', format)

      if (currentImageBase64) {
        fd.append('imageBase64', currentImageBase64)
      } else if (uploadedFile) {
        fd.append('image', uploadedFile as Blob)
      }

      const res = await fetch('/api/edit-image', { method: 'POST', body: fd })
      const data = await res.json()

      if (!res.ok || !data.image) {
        throw new Error(data.error || 'Failed to generate image')
      }

      const newBase64 = data.image as string
      setCurrentImageBase64(newBase64)
      setChangeHistory(prev => [...prev, trimmed])

      setChatMessages(prev =>
        prev.map(m =>
          m.id === loadingId
            ? { id: loadingId, role: 'result', text: trimmed, imageUrl: newBase64, isLoading: false }
            : m
        )
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setChatMessages(prev =>
        prev.map(m =>
          m.id === loadingId
            ? { id: loadingId, role: 'result', text: `Error: ${message}`, isLoading: false }
            : m
        )
      )
    } finally {
      setIsGenerating(false)
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  const handleDownload = () => {
    const src = currentImageBase64 || uploadedPreview
    if (!src) return
    const a = document.createElement('a')
    a.href = src
    a.download = `everstage-creative-edited.png`
    a.click()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleApplyChange()
    }
  }

  const handleReset = () => {
    setUploadedFile(null)
    setUploadedPreview(null)
    setCurrentImageBase64(null)
    setChangeHistory([])
    setChatMessages([])
    setChangeRequest('')
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left — image canvas */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 overflow-auto bg-[#070E1A] p-8">
        {!uploadedPreview ? (
          /* Upload zone */
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`flex w-full max-w-[520px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed transition ${
              isDragging
                ? 'border-[#F5A623] bg-[#F5A623]/5'
                : 'border-white/15 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.05]'
            }`}
            style={{ minHeight: 360 }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M4 20v2a2 2 0 002 2h16a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-white/40"/>
                <path d="M14 4v14M9 9l5-5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-white/60"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white/70">Drop an image here, or click to upload</p>
              <p className="mt-1 text-xs text-white/30">PNG, JPG, WEBP — any LinkedIn creative</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleFileSelect(file)
              }}
            />
          </div>
        ) : (
          /* Image display */
          <div className="flex w-full max-w-[600px] flex-col items-center gap-4">
            {/* Controls row */}
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Format</span>
                <div className="flex rounded-lg border border-white/10 p-0.5">
                  <button
                    onClick={() => setFormat('square')}
                    className={`rounded-md px-3 py-1 text-[11px] font-medium transition ${format === 'square' ? 'bg-white/10 text-white' : 'text-white/35 hover:text-white/60'}`}
                  >
                    Square
                  </button>
                  <button
                    onClick={() => setFormat('landscape')}
                    className={`rounded-md px-3 py-1 text-[11px] font-medium transition ${format === 'landscape' ? 'bg-white/10 text-white' : 'text-white/35 hover:text-white/60'}`}
                  >
                    Landscape
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentDisplayImage && (
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/50 transition hover:border-white/20 hover:text-white/80"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1v7M3 6l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Download
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/40 transition hover:border-white/20 hover:text-white/60"
                >
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  New image
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentDisplayImage ?? ''}
                alt="Creative being edited"
                className="w-full object-contain"
              />
              {isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-[#F5A623]" />
                  <span className="text-xs text-white/60">Applying changes…</span>
                </div>
              )}
            </div>

            {changeHistory.length > 0 && (
              <p className="self-start text-[10px] text-white/25">
                {changeHistory.length} change{changeHistory.length !== 1 ? 's' : ''} applied
              </p>
            )}
          </div>
        )}
      </div>

      {/* Right — chat panel */}
      <div className="flex w-[360px] shrink-0 flex-col border-l border-white/5 bg-[#0A1628]">
        {/* Header */}
        <div className="border-b border-white/5 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">Edit Image</h2>
          <p className="mt-0.5 text-xs text-white/35">
            Describe what to change — copy, colors, layout, fonts.
          </p>
        </div>

        {/* Chat history */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
          {chatMessages.length === 0 && (
            <div className="mt-4 flex flex-col gap-2.5">
              {[
                'Change the headline to "Close Deals Faster"',
                'Make the background darker navy blue',
                'Increase the font size of the tagline',
                'Replace the CTA with "Book a Demo"',
              ].map(example => (
                <button
                  key={example}
                  onClick={() => setChangeRequest(example)}
                  className="rounded-lg border border-white/8 bg-white/[0.03] px-3.5 py-2.5 text-left text-xs text-white/40 transition hover:border-white/15 hover:text-white/65"
                >
                  {example}
                </button>
              ))}
            </div>
          )}

          {chatMessages.map(msg => (
            <div key={msg.id} className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.role === 'user' ? (
                <div className="max-w-[260px] rounded-2xl rounded-tr-sm bg-[#F5A623]/15 px-3.5 py-2.5">
                  <p className="text-xs leading-relaxed text-[#F5A623]">{msg.text}</p>
                </div>
              ) : (
                <div className="flex w-full flex-col gap-2">
                  {msg.isLoading ? (
                    <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/15 border-t-white/50" />
                      <span className="text-xs text-white/35">Generating…</span>
                    </div>
                  ) : msg.imageUrl ? (
                    <div className="flex flex-col gap-2">
                      <div className="overflow-hidden rounded-xl border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={msg.imageUrl} alt="Edited result" className="w-full object-contain" />
                      </div>
                      <p className="px-0.5 text-[10px] text-white/30">Change applied ✓</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-3.5 py-2.5">
                      <p className="text-xs text-red-400">{msg.text}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-white/5 p-4">
          <div className={`flex flex-col gap-2 rounded-xl border transition ${uploadedPreview ? 'border-white/15 bg-white/[0.04]' : 'border-white/8 bg-white/[0.02] opacity-50'}`}>
            <textarea
              ref={textareaRef}
              value={changeRequest}
              onChange={e => setChangeRequest(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!uploadedPreview || isGenerating}
              placeholder={uploadedPreview ? 'Describe what to change…' : 'Upload an image to get started'}
              rows={3}
              className="w-full resize-none bg-transparent px-3.5 pt-3 text-xs leading-relaxed text-white placeholder-white/25 outline-none"
            />
            <div className="flex items-center justify-between px-3 pb-2.5">
              <span className="text-[10px] text-white/20">⌘↵ to apply</span>
              <button
                onClick={handleApplyChange}
                disabled={!uploadedPreview || !changeRequest.trim() || isGenerating}
                className="flex items-center gap-1.5 rounded-lg bg-[#F5A623] px-4 py-1.5 text-xs font-semibold text-black transition hover:bg-[#F5A623]/90 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                    Applying
                  </>
                ) : (
                  <>
                    Apply
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1 5h8M5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
