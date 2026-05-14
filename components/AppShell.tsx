'use client'

import { useState } from 'react'
import LeftNav, { AppMode } from './LeftNav'
import CreativeStudio from './CreativeStudio'
import EducationalAssets from './EducationalAssets'
import SocialProof from './SocialProof'
import CampaignThemes from './CampaignThemes'

type ContentTab = 'use-cases' | 'social-proof' | 'educational'

const TABS: { id: ContentTab; label: string }[] = [
  { id: 'use-cases',   label: 'Use Cases' },
  { id: 'social-proof', label: 'Social Proof' },
  { id: 'educational', label: 'Educational Assets' },
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

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode)
    setTab('use-cases')
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#070E1A] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0A1628] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#F5A623]/40 text-sm font-bold text-[#F5A623]">
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
          {/* Top tab strip */}
          <div className="flex shrink-0 items-center gap-0 border-b border-white/5 bg-[#0A1628] px-4">
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
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-t-full bg-[#F5A623]" />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {tab === 'use-cases' && mode === 'vertical-programs' && (
              <CreativeStudio verticals={verticals} />
            )}
            {tab === 'use-cases' && mode === 'q2-campaigns' && (
              <CampaignThemes campaignThemes={campaignThemes} />
            )}
            {tab === 'social-proof' && <SocialProof />}
            {tab === 'educational' && <EducationalAssets />}
          </div>
        </div>
      </div>
    </div>
  )
}
