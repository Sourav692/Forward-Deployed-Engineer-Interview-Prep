'use client'

/**
 * "Speak your answer" mode (ENH-33) for worksheets and scenario mocks. Interviews are
 * spoken, so this mode runs the `MockTimer` countdown with the written answers out of
 * the way: the page leaves out its answer fields and model answers (a real render
 * change, not CSS, so screen readers skip them too) and keeps its own rubric for
 * self-scoring afterwards. Nothing is recorded and no audio leaves the browser.
 *
 * The mode lives in the URL (`?mode=speak`) so a reload keeps it. It is read through
 * `useSyncExternalStore` rather than `useSearchParams`, so static pages need no Suspense
 * boundary; the server snapshot, and so the first paint, is the written mode.
 */
import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react'
import { Button } from '@/components/ui'
import { MockTimer } from './MockTimer'

const CHANGE = 'fd:speak-mode'
const subscribe = (onChange: () => void) => {
  window.addEventListener(CHANGE, onChange)
  window.addEventListener('popstate', onChange)
  return () => {
    window.removeEventListener(CHANGE, onChange)
    window.removeEventListener('popstate', onChange)
  }
}
const isSpeak = () => new URLSearchParams(window.location.search).get('mode') === 'speak'

const SpeakContext = createContext<{ on: boolean; toggle: () => void }>({ on: false, toggle: () => {} })

export const useSpeakMode = () => useContext(SpeakContext)

export function SpeakModeProvider({ children }: { children: ReactNode }) {
  const on = useSyncExternalStore(subscribe, isSpeak, () => false)

  const toggle = () => {
    const url = new URL(window.location.href)
    if (on) url.searchParams.delete('mode')
    else url.searchParams.set('mode', 'speak')
    window.history.replaceState(window.history.state, '', url)
    window.dispatchEvent(new Event(CHANGE))
  }

  return <SpeakContext.Provider value={{ on, toggle }}>{children}</SpeakContext.Provider>
}

/**
 * The toggle, and in speak mode the countdown and what to do. `timer: false` when the
 * page already shows a `MockTimer` (the scenario mocks), so there is one clock.
 */
export function SpeakPanel({ minutes, scoreHref, timer = true }: { minutes: number; scoreHref: string; timer?: boolean }) {
  const { on, toggle } = useSpeakMode()
  return (
    <div className="no-print mb-6 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant={on ? 'primary' : 'secondary'} aria-pressed={on} onClick={toggle}>
          Speak your answer
        </Button>
        <p className="text-sm text-muted">
          {on ? 'Speak mode is on. Turn it off to see the answers again.' : 'Practise out loud, against the clock, with the answers hidden.'}
        </p>
      </div>
      {on && (
        <div className="rounded-lg border border-border bg-surface-2/50 px-4 py-3 text-[0.9375rem]">
          <p>
            Start the timer and answer out loud, as you would to an interviewer. When time is up,{' '}
            <a href={scoreHref} className="text-accent underline underline-offset-2">
              score yourself
            </a>{' '}
            against the rubric below.
          </p>
          {timer && (
            <div className="mt-3">
              <MockTimer minutes={minutes} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** Leaves its children out in speak mode, with one line saying where they went. */
export function SpeakHidden({ label, children }: { label: string; children: ReactNode }) {
  const { on } = useSpeakMode()
  if (!on) return <>{children}</>
  return <p className="rounded-md border border-dashed border-border px-4 py-3 text-sm text-muted">{label} is hidden while you speak.</p>
}
