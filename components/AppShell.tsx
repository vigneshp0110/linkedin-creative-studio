'use client'

import { useState } from 'react'
import LeftNav, { AppMode } from './LeftNav'
import CreativeStudio from './CreativeStudio'
import EducationalAssets from './EducationalAssets'
import SocialProof from './SocialProof'
import CampaignThemes from './CampaignThemes'
import ImageEditor from './ImageEditor'
import { IllustrationMode } from '@/lib/types'

type ContentTab = 'use-cases' | 'social-proof' | 'educational'

const TABS: { id: ContentTab; label: string }[] = [
  { id: 'use-cases',    label: 'Use Cases' },
  { id: 'social-proof', label: 'Social Proof' },
  { id: 'educational',  label: 'Educational Assets' },
]

export default function AppShell({
  verticals,
  campaignThemes,
}: {
  verticals: { id: string; label: string }[]
  campaignThemes: { id: string; label: string; available: boolean }[]
}) {
  const [mode, setMode] = useState<AppMode>('vertical-programs')
  const [tab, setTab] = useState<ContentTab>('use-cases')
  const [illustrationMode, setIllustrationMode] = useState<IllustrationMode>('with')

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode)
    setTab('use-cases')
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#1A0D17] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#2A1425] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#1BA894]/50 text-sm font-bold text-[#1BA894]">
            e
          </div>
          <span className="text-sm font-semibold tracking-wide text-white">everstage</span>
          <span className="text-white/20">·</span>
          <span className="text-sm text-white/50">Creative Studio</span>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <LeftNav activeMode={mode} onModeChange={handleModeChange} />

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Image Editor: full-bleed, no tab strip */}
          {mode === 'image-editor' && <ImageEditor />}

          {/* Tab strip + toggles — only for non-editor modes */}
          {mode !== 'image-editor' && (
            <div className="flex shrink-0 items-center justify-between border-b border-white/5 bg-[#2A1425] px-4">
              {/* Content tabs */}
              <div className="flex items-center">
                {TABS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`relative px-4 py-3.5 text-xs font-medium transition ${
                      tab === t.id
                        ? 'text-white'
                        : 'text-white/35 hover:text-white/65'
                    }`}
                  >
                    {t.label}
                    {tab === t.id && (
                      <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-t-full bg-[#1BA894]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Illustration toggle */}
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                  Style
                </span>
                <div className="flex rounded-lg border border-white/10 p-0.5">
                  <button
                    onClick={() => setIllustrationMode('with')}
                    className={`rounded-md px-3 py-1 text-[11px] font-medium transition ${
                      illustrationMode === 'with'
                        ? 'bg-white/10 text-white'
                        : 'text-white/35 hover:text-white/60'
                    }`}
                  >
                    Illustration
                  </button>
                  <button
                    onClick={() => setIllustrationMode('without')}
                    className={`rounded-md px-3 py-1 text-[11px] font-medium transition ${
                      illustrationMode === 'without'
                        ? 'bg-white/10 text-white'
                        : 'text-white/35 hover:text-white/60'
                    }`}
                  >
                    Text Only
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content — only for non-editor modes */}
          {mode !== 'image-editor' && (
            <div className="flex flex-1 flex-col overflow-hidden">
              {tab === 'use-cases' && mode === 'vertical-programs' && (
                <CreativeStudio verticals={verticals} illustrationMode={illustrationMode} />
              )}
              {tab === 'use-cases' && mode === 'q2-campaigns' && (
                <CampaignThemes campaignThemes={campaignThemes} illustrationMode={illustrationMode} />
              )}
              {tab === 'social-proof' && <SocialProof />}
              {tab === 'educational' && <EducationalAssets />}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
