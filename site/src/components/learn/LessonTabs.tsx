'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { cx, focusRing } from '@/components/ui'

export type LessonTab = { id: string; label: string; panel: ReactNode }

/**
 * Tabs inside one page: a final-week review and its one-page recall card (ENH-18), the
 * Story Bank's customer groups (ENH-25).
 * All panels are in the static HTML and the first shows until the reader picks another.
 * A URL hash naming a panel, or any element inside one (a contents link, a search
 * result), opens that panel and scrolls to it.
 */
export function LessonTabs({ label, tabs }: { label: string; tabs: LessonTab[] }) {
  const [active, setActive] = useState(tabs[0].id)
  const ids = tabs.map((t) => t.id).join('|')

  useEffect(() => {
    const apply = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      const target = id ? document.getElementById(id) : null
      const panel = target?.closest('[role="tabpanel"]')?.id
      if (!target || !panel || !ids.split('|').includes(panel)) return
      setActive(panel)
      // Scroll once the panel is unhidden, then again after the router settles.
      const scroll = () => target.scrollIntoView()
      requestAnimationFrame(scroll)
      setTimeout(scroll, 250)
    }
    apply()
    window.addEventListener('hashchange', apply)
    return () => window.removeEventListener('hashchange', apply)
  }, [ids])

  const select = (id: string) => {
    setActive(id)
    // replaceState, not a hash assignment: a tab click should not add a history entry.
    window.history.replaceState(null, '', `#${id}`)
  }

  return (
    <div>
      <div role="tablist" aria-label={label} className="no-print mb-6 flex gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-1">
        {tabs.map((t) => {
          const selected = active === t.id
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={selected}
              aria-controls={t.id}
              onClick={() => select(t.id)}
              className={cx(
                'shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-[0.875rem] font-medium transition-colors',
                selected ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-surface-2 hover:text-text',
                focusRing,
              )}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      {tabs.map((t) => (
        <div key={t.id} id={t.id} role="tabpanel" aria-labelledby={`tab-${t.id}`} hidden={active !== t.id} className="scroll-mt-24">
          {t.panel}
        </div>
      ))}
    </div>
  )
}
