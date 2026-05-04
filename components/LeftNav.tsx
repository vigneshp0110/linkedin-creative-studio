'use client'

import { useState } from 'react'

export type AppMode = 'pain-solution' | 'educational' | 'social-proof'

const NAV_ITEMS: { id: AppMode; label: string; icon: React.ReactNode; comingSoon?: boolean }[] = [
  {
    id: 'pain-solution',
    label: 'Pain Solution',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="9" cy="9" r="4" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="9" cy="9" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'educational',
    label: 'Educational Assets',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="3" y="2" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6 6h5M6 9h5M6 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M13 5l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'social-proof',
    label: 'Social Proof',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 7c0-1.1.9-2 2-2h1.5C7.3 3.3 8.5 2 9 2s1.7 1.3 2.5 3H13a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6.5 9.5l1.5 1.5 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export default function LeftNav({
  activeMode,
  onModeChange,
}: {
  activeMode: AppMode
  onModeChange: (mode: AppMode) => void
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <aside
      className="flex shrink-0 flex-col border-r border-white/5 bg-[#0A1628] transition-all duration-300 ease-in-out"
      style={{ width: expanded ? '192px' : '56px' }}
    >
      {/* Toggle */}
      <div className="flex h-12 items-center justify-end border-b border-white/5 px-3">
        <button
          onClick={() => setExpanded(v => !v)}
          title={expanded ? 'Collapse nav' : 'Expand nav'}
          className="flex h-7 w-7 items-center justify-center rounded-md text-white/30 transition hover:bg-white/5 hover:text-white/60"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            {expanded ? (
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            ) : (
              <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            )}
          </svg>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-1 p-2 pt-3">
        {NAV_ITEMS.map(item => {
          const isActive = activeMode === item.id
          return (
            <button
              key={item.id}
              onClick={() => !item.comingSoon && onModeChange(item.id)}
              disabled={item.comingSoon}
              title={!expanded ? item.label : undefined}
              className={`flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition ${
                isActive
                  ? 'bg-[#F5A623]/10 text-[#F5A623]'
                  : item.comingSoon
                  ? 'cursor-not-allowed text-white/20'
                  : 'text-white/45 hover:bg-white/5 hover:text-white/70'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {expanded && (
                <span className="flex flex-1 items-center justify-between overflow-hidden">
                  <span className="truncate text-xs font-medium">{item.label}</span>
                  {item.comingSoon && (
                    <span className="ml-1.5 shrink-0 rounded bg-white/8 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/30">
                      Soon
                    </span>
                  )}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
