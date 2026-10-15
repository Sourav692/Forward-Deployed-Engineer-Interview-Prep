'use client'

import dynamic from 'next/dynamic'
import { useSyncExternalStore, type ReactNode } from 'react'
import { cx, focusRing } from '@/components/ui'
import type { ExplorerData } from '@/lib/explorers/types'

const Explorer = dynamic(() => import('./Explorer'), {
  loading: () => <div className="rounded-xl border border-border bg-surface p-8 text-sm text-muted" role="status">Opening the interactive explorer…</div>,
})

const EVENT = 'fd:lesson-view'
const snapshot = () => new URLSearchParams(window.location.search).get('view') === 'explore' ? 'explore' : 'read'
function subscribe(notify: () => void) {
  const hash = () => {
    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)))
    if (target?.closest('#lesson-read-panel')) {
      const url = new URL(window.location.href)
      url.searchParams.delete('view')
      window.history.replaceState(null, '', url)
      requestAnimationFrame(() => target.scrollIntoView())
    }
    notify()
  }
  window.addEventListener(EVENT, notify)
  window.addEventListener('popstate', notify)
  window.addEventListener('hashchange', hash)
  return () => {
    window.removeEventListener(EVENT, notify)
    window.removeEventListener('popstate', notify)
    window.removeEventListener('hashchange', hash)
  }
}

export function LessonExperience({ data, sourceLinks, children }: { data: ExplorerData; sourceLinks: Record<string, string>; children: ReactNode }) {
  const mode = useSyncExternalStore(subscribe, snapshot, () => 'read')
  const select = (next: string) => {
    const url = new URL(window.location.href)
    if (next === 'explore') { url.searchParams.set('view', 'explore'); url.hash = '' }
    else url.searchParams.delete('view')
    window.history.replaceState(null, '', url)
    window.dispatchEvent(new Event(EVENT))
  }
  return (
    <div className="mt-6">
      <div role="tablist" aria-label="Lesson format" className="no-print mb-6 flex w-fit max-w-full gap-1 rounded-lg border border-border bg-surface p-1">
        {[['read', 'Read lesson'], ['explore', 'Interactive explorer']].map(([id, label], index) => (
          <button key={id} id={`lesson-format-${id}`} type="button" role="tab" aria-selected={mode === id}
            aria-controls={`lesson-${id}-panel`} tabIndex={mode === id ? 0 : -1}
            onClick={() => select(id)}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
              e.preventDefault()
              const next = index === 0 ? 'explore' : 'read'
              select(next)
              document.getElementById(`lesson-format-${next}`)?.focus()
            }}
            className={cx('rounded-md px-4 py-2 text-sm font-semibold transition-colors', mode === id ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-surface-2', focusRing)}>
            {label}
          </button>
        ))}
      </div>
      <div id="lesson-read-panel" role="tabpanel" aria-labelledby="lesson-format-read" hidden={mode !== 'read'}>{children}</div>
      <div id="lesson-explore-panel" role="tabpanel" aria-labelledby="lesson-format-explore" hidden={mode !== 'explore'}>
        {mode === 'explore' && <Explorer data={data} sourceLinks={sourceLinks} />}
      </div>
    </div>
  )
}
