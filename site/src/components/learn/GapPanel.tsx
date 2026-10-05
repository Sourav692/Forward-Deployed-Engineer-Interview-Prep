import type { CurriculumModule } from '@/lib/curriculum-types'
import { COPY } from './copy'

/**
 * GapPanel (FE-07): says in place what a module is missing (plan §5, flow 3).
 *
 * - Partly ready: sits after the published lessons and names the gap
 *   ("Coming soon in this module: …").
 * - Coming soon: explains there are no lessons yet; the page then shows the
 *   objective, scope and related modules.
 * - On hold: "Paused, will return". `holdNote` is owner-facing and is never
 *   rendered, and neither is any repository path (plan §5 acceptance criteria).
 */
export function GapPanel({ module: mod }: { module: CurriculumModule }) {
  if (mod.status === 'partly') {
    return (
      <aside aria-labelledby="gap-title" className="rounded-lg border border-dashed border-border-strong bg-surface px-4 py-4 sm:px-5">
        <h2 id="gap-title" className="flex items-center gap-2 text-base font-semibold">
          <ClockIcon />
          {COPY.partlyTitle}
        </h2>
        <p className="mt-1 text-sm text-muted">{COPY.partlyLead}</p>
        {mod.gapNote && <p className="mt-3 text-sm">{COPY.partlyComingSoon(mod.gapNote)}</p>}
      </aside>
    )
  }
  if (mod.status === 'coming-soon') {
    return (
      <aside aria-labelledby="gap-title" className="rounded-lg border border-dashed border-border-strong bg-surface px-4 py-4 sm:px-5">
        <h2 id="gap-title" className="flex items-center gap-2 text-base font-semibold">
          <ClockIcon />
          {COPY.comingSoonTitle}
        </h2>
        <p className="mt-1 text-sm text-muted">{COPY.comingSoonLead}</p>
      </aside>
    )
  }
  if (mod.status === 'on-hold') {
    return (
      <aside aria-labelledby="gap-title" className="rounded-lg border border-warning/60 bg-warning-soft px-4 py-4 sm:px-5">
        <h2 id="gap-title" className="flex items-center gap-2 text-base font-semibold text-warning-text">
          <PauseIcon />
          {COPY.onHoldTitle}
        </h2>
        <p className="mt-1 text-sm text-text">{COPY.onHoldLead}</p>
      </aside>
    )
  }
  return null
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" className="size-4 shrink-0 text-subtle">
      <circle cx="8" cy="8" r="5.25" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 5.25V8l1.75 1.25" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" className="size-4 shrink-0">
      <circle cx="8" cy="8" r="5.25" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.75 6v4M9.25 6v4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
