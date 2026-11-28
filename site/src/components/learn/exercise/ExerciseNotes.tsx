'use client'

/**
 * The two places a learner writes on an exercise page: the results table (with a decision
 * note under it) and the Done when checklist. Both keep their values in this browser under
 * `fd:v1:exercise:<track>` (`lib/progress/store`). They are notes, not progress: nothing else
 * reads them. With storage blocked the fields still work for the visit and say so.
 */
import { useId } from 'react'
import { getExerciseNotes, saveExerciseNotes, type ExerciseNotes } from '@/lib/progress/store'
import { useProgress, useStorageAvailable } from '@/lib/progress/useProgress'
import type { RecordTable } from '@/lib/exercise'
import { Button, Input, Textarea } from '@/components/ui'

const EMPTY: ExerciseNotes = { results: {}, decision: '', checks: [] }

function useNotes(track: string) {
  const notes = useProgress(() => getExerciseNotes(track)) ?? EMPTY
  const update = (change: (n: ExerciseNotes) => ExerciseNotes) => saveExerciseNotes(track, change(getExerciseNotes(track)))
  return { notes, update }
}

function StorageLine() {
  const storage = useStorageAvailable()
  return (
    <p className="text-sm text-[var(--color-muted)]">
      {storage === false
        ? 'This browser is not saving site data, so what you enter here is lost when you leave the page.'
        : 'What you enter stays in this browser only.'}
    </p>
  )
}

export function ResultsTable({ track, record }: { track: string; record: RecordTable }) {
  const { notes, update } = useNotes(track)
  const decisionId = useId()
  const [rowHead, ...cols] = record.columns
  return (
    <div className="space-y-4">
      <StorageLine />
      <div className="table-wrap" tabIndex={0} role="region" aria-label="Your results">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th scope="col" className="py-2 pr-3 text-left">{rowHead}</th>
              {cols.map((c) => (
                <th key={c} scope="col" className="py-2 pr-3 text-left">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {record.rows.map((row, r) => (
              <tr key={row.label} className="border-t border-[var(--color-rule)]">
                <th scope="row" className="py-2 pr-3 text-left font-normal">{row.label}</th>
                {row.cells.map((fixed, c) => {
                  const key = `${r}:${c}`
                  return (
                    <td key={key} className="py-2 pr-3">
                      {fixed ?? (
                        <Input
                          aria-label={`${row.label}, ${cols[c]}`}
                          className="w-24 min-w-0"
                          value={notes.results[key] ?? ''}
                          onChange={(e) => update((n) => ({ ...n, results: { ...n.results, [key]: e.target.value } }))}
                        />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-2">
        <label htmlFor={decisionId} className="cb-small-head block">Your decision</label>
        <Textarea
          id={decisionId}
          rows={4}
          placeholder="Which setting do you keep, and which per-question rows decided it?"
          value={notes.decision}
          onChange={(e) => update((n) => ({ ...n, decision: e.target.value }))}
        />
      </div>
    </div>
  )
}

export function DoneChecklist({ track, items }: { track: string; items: string[] }) {
  const { notes, update } = useNotes(track)
  const done = items.filter((_, i) => notes.checks.includes(i)).length
  const toggle = (i: number) =>
    update((n) => ({ ...n, checks: n.checks.includes(i) ? n.checks.filter((x) => x !== i) : [...n.checks, i] }))
  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--color-muted)]" aria-live="polite">
        {done} of {items.length} done
      </p>
      <div className="h-1.5 bg-[var(--color-rule)]" aria-hidden="true">
        <div className="h-full bg-[var(--color-accent)]" style={{ width: `${(done * 100) / items.length}%` }} />
      </div>
      <ul className="m-0 list-none space-y-1 p-0">
        {items.map((html, i) => (
          <li key={i}>
            <label className="cb-ex-check flex cursor-pointer items-start gap-3 py-2 text-base">
              <input
                type="checkbox"
                className="mt-1.5 size-4 shrink-0 accent-[var(--color-accent)]"
                checked={notes.checks.includes(i)}
                onChange={() => toggle(i)}
              />
              <span dangerouslySetInnerHTML={{ __html: html }} />
            </label>
          </li>
        ))}
      </ul>
      <Button variant="secondary" onClick={() => update((n) => ({ ...n, checks: [] }))} disabled={done === 0}>
        Clear the ticks
      </Button>
      <StorageLine />
    </div>
  )
}
