'use client'

import { useState } from 'react'

export type AppMode = 'vertical-programs' | 'q2-campaigns'

const NAV_ITEMS: { id: AppMode; label: string; icon: React.ReactNode }[] = [
  {
    id: 'vertical-programs',
    label: 'Vertical Programs',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="9" cy="9" r="4" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="9" cy="9" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'q2-campaigns',
    label: 'Q2 Campaigns',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 4h14M2 9h10M2 14h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="14" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M14 11v1.5l1 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
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
              onClick={() => onModeChange(item.id)}
              title={!expanded ? item.label : undefined}
              className={`flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition ${
                isActive
                  ? 'bg-[#F5A623]/10 text-[#F5A623]'
                  : 'text-white/45 hover:bg-white/5 hover:text-white/70'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {expanded && (
                <span className="truncate text-xs font-medium">{item.label}</span>
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
