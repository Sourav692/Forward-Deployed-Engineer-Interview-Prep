'use client'

import { useId, useRef, useState } from 'react'
import { cx } from './ui'

/**
 * WAI-ARIA tabs: arrow keys, Home and End move between tabs; panels are server-
 * rendered content passed in as props, so only the switching logic runs on the client.
 */
export function Tabs({ tabs }: { tabs: { id: string; label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(0)
  const base = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const move = (to: number) => {
    const n = (to + tabs.length) % tabs.length
    setActive(n)
    refs.current[n]?.focus()
  }
  return (
    <div>
      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            role="tab"
            id={`${base}-tab-${t.id}`}
            aria-selected={i === active}
            aria-controls={`${base}-panel-${t.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') move(i + 1)
              else if (e.key === 'ArrowLeft') move(i - 1)
              else if (e.key === 'Home') move(0)
              else if (e.key === 'End') move(tabs.length - 1)
              else return
              e.preventDefault()
            }}
            className={cx(
              '-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-[0.875rem] font-semibold transition-colors',
              i === active ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-text',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t.id} role="tabpanel" id={`${base}-panel-${t.id}`} aria-labelledby={`${base}-tab-${t.id}`} hidden={i !== active} tabIndex={0} className="pt-6 outline-none">
          {t.content}
        </div>
      ))}
    </div>
  )
}
