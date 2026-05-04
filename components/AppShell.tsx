'use client'

import { useState } from 'react'
import LeftNav, { AppMode } from './LeftNav'
import CreativeStudio from './CreativeStudio'
import EducationalAssets from './EducationalAssets'
import SocialProof from './SocialProof'

export default function AppShell({ verticals }: { verticals: { id: string; label: string }[] }) {
  const [mode, setMode] = useState<AppMode>('pain-solution')

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
        <LeftNav activeMode={mode} onModeChange={setMode} />
        <div className="flex flex-1 flex-col overflow-hidden">
          {mode === 'pain-solution' && <CreativeStudio verticals={verticals} />}
          {mode === 'educational' && <EducationalAssets />}
          {mode === 'social-proof' && <SocialProof />}
        </div>
      </div>
    </div>
  )
}
