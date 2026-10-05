'use client'

/**
 * ConfidenceControl (FE-09): a 1–5 rating for a module, kept with its date.
 *
 * Built from native radio inputs inside a fieldset, so it already behaves as a radio
 * group: Tab enters the group once, arrow keys move and select, and the legend names
 * it. Each new rating is appended (the store keeps the history); the latest drives
 * Completed (≥ 3) and Needs revision (≤ 2).
 */
import { useId } from 'react'
import { latestConfidence, setConfidence } from '@/lib/progress/store'
import { useProgress, useStorageAvailable } from '@/lib/progress/useProgress'
import { cx, toast } from '@/components/ui'
import type { ConfidenceRating } from '@/lib/progress/types'
import { COPY } from './copy'

const LABELS: Record<ConfidenceRating['value'], string> = {
  1: 'Lost',
  2: 'Shaky',
  3: 'Getting there',
  4: 'Confident',
  5: 'Could teach it',
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export function ConfidenceControl({ moduleSlug }: { moduleSlug: string }) {
  const name = useId()
  const latest = useProgress(() => latestConfidence(moduleSlug) ?? false)
  const storage = useStorageAvailable()
  const value = latest ? latest.value : undefined

  return (
    <fieldset className="min-w-0" disabled={latest === null || storage === false} aria-describedby={`${name}-hint`}>
      <legend className="text-sm font-semibold">{COPY.confidenceLegend}</legend>
      <p id={`${name}-hint`} className="mt-0.5 text-xs text-muted">
        {COPY.confidenceHint}
      </p>
      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {([1, 2, 3, 4, 5] as const).map((v) => (
          <label
            key={v}
            className={cx(
              'flex cursor-pointer flex-col items-center gap-0.5 rounded-md border px-1 py-2 text-center transition-colors duration-150',
              'has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-accent-ring',
              value === v ? 'border-accent bg-accent-soft text-accent' : 'border-input-border hover:bg-surface-2',
            )}
          >
            <input
              type="radio"
              name={name}
              value={v}
              checked={value === v}
              onChange={() => {
                if (setConfidence(moduleSlug, v)) toast(COPY.confidenceSaved(v))
                else toast(COPY.saveFailed, 'error')
              }}
              className="sr-only"
            />
            <span className="text-base font-semibold tabular-nums">{v}</span>
            <span className="text-[0.6875rem] leading-tight text-muted">{LABELS[v]}</span>
          </label>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted" aria-live="polite">
        {latest ? `Last rated ${latest.value} of 5 on ${formatDate(latest.at)}.` : latest === false ? COPY.confidenceNone : ' '}
      </p>
    </fieldset>
  )
}
