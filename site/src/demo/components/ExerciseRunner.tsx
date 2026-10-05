'use client'

import Link from 'next/link'
import { useState } from 'react'
import * as repo from '../repo'
import { update, useDemo } from '../store/useDemo'
import { toast } from './feedback'
import { Callout, ErrorState, btn, cx } from './ui'
import { Textarea } from '@/components/ui'

/**
 * Exercise flow: progressive hints, a simulated submission (no code runs), then a
 * self-evaluation against rubric anchors. Submitting stores the answer and scores.
 */
export function ExerciseRunner({ exerciseId }: { exerciseId: string }) {
  const { state } = useDemo()
  const ex = repo.getExercise(exerciseId)!
  const m = repo.getModule(ex.moduleId)!
  const saved = state?.exercises[exerciseId]
  const [hints, setHints] = useState(0)
  const [answer, setAnswer] = useState('')
  const [scores, setScores] = useState<Record<string, number>>({})
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)

  if (saved && !editing) {
    const mean = Object.values(saved.selfScores).reduce((a, b) => a + b, 0) / Math.max(1, Object.values(saved.selfScores).length)
    return (
      <div className="space-y-4">
        <div role="status" className="rounded-xl border border-success/40 bg-success-soft p-4">
          <p className="font-semibold text-success">Submitted</p>
          <p className="mt-1 text-[0.875rem]">
            Self-evaluated mean {mean.toFixed(1)} / 4 on {new Date(saved.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}. It counts toward Interview readiness.
          </p>
          <ul className="mt-2 text-[0.8125rem] text-muted">
            {Object.entries(saved.selfScores).map(([k, v]) => (
              <li key={k}>
                {k}: {v}
              </li>
            ))}
          </ul>
        </div>
        <blockquote className="whitespace-pre-wrap rounded-lg border border-border bg-surface p-3 text-[0.875rem]">{saved.answer}</blockquote>
        <div className="flex flex-wrap gap-2">
          <Link href={repo.href.checkpoint(m)} className={btn.primary}>
            Take the {m.code} checkpoint
          </Link>
          <button type="button" className={btn.secondary} onClick={() => (setAnswer(saved.answer), setScores(saved.selfScores), setEditing(true))}>
            Revise submission
          </button>
        </div>
      </div>
    )
  }

  const submit = () => {
    if (answer.trim().length < 20) return setError('Write at least a couple of sentences before submitting.')
    const missing = ex.rubric.filter((r) => !scores[r.criterion])
    if (missing.length) return setError(`Self-evaluate every criterion first: ${missing.map((r) => r.criterion).join(', ')}.`)
    setError('')
    update(
      (s) => {
        s.exercises[exerciseId] = { at: new Date().toISOString(), answer: answer.trim(), selfScores: scores }
        s.timeSpent[m.trackId] = (s.timeSpent[m.trackId] ?? 0) + ex.estMinutes
      },
      { kind: 'exercise-submitted', itemId: exerciseId, label: `Submitted the ${m.code} exercise`, href: repo.href.exercise(ex) },
    )
    setEditing(false)
    toast('Exercise submitted. Nice work.')
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-semibold">Instructions</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-[0.9375rem]">
          {ex.instructions.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ol>
        <p className="mt-3 text-[0.875rem]">
          <span className="font-semibold">Expected output: </span>
          {ex.expectedOutput}
        </p>
      </section>

      <section aria-label="Hints">
        <h2 className="font-semibold">Hints</h2>
        <ol className="mt-2 space-y-2">
          {ex.hints.slice(0, hints).map((h, i) => (
            <li key={h} className="rounded-md bg-surface-2 px-3 py-2 text-[0.875rem]">
              <span className="font-semibold">Hint {i + 1}. </span>
              {h}
            </li>
          ))}
        </ol>
        {hints < ex.hints.length ? (
          <button type="button" className={cx(btn.secondary, 'mt-2 px-3 py-1.5 text-[0.8125rem]')} onClick={() => setHints((h) => h + 1)}>
            Reveal hint {hints + 1} of {ex.hints.length}
          </button>
        ) : (
          <p className="mt-2 text-[0.8125rem] text-subtle">All hints revealed.</p>
        )}
      </section>

      <section>
        <label htmlFor="answer" className="font-semibold">
          Your submission
        </label>
        <p className="text-[0.8125rem] text-subtle">Simulated: paste a summary or link. Nothing is executed.</p>
        <Textarea id="answer" rows={6} value={answer} onChange={(e) => setAnswer(e.target.value)} className="mt-2" />
      </section>

      <section>
        <h2 className="font-semibold">Self-evaluate against the rubric</h2>
        <div className="mt-2 space-y-4">
          {ex.rubric.map((r) => (
            <fieldset key={r.criterion}>
              <legend className="text-[0.875rem] font-semibold">{r.criterion}</legend>
              <div className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-4">
                {r.anchors.map((a) => (
                  <label
                    key={a.level}
                    className={cx(
                      'cursor-pointer rounded-lg border p-2.5 text-[0.8125rem] focus-within:ring-2 focus-within:ring-accent',
                      scores[r.criterion] === a.level ? 'border-accent bg-accent-soft' : 'border-border hover:bg-surface-2',
                    )}
                  >
                    <input type="radio" name={r.criterion} value={a.level} checked={scores[r.criterion] === a.level} onChange={() => setScores((s) => ({ ...s, [r.criterion]: a.level }))} className="sr-only" />
                    <span className="font-semibold">
                      {a.level} {a.label}
                    </span>
                    <span className="mt-0.5 block text-muted">{a.description}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      {error && <ErrorState title="Not submitted yet" body={error} />}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btn.primary} onClick={submit} disabled={!state}>
          Submit exercise
        </button>
        {editing && (
          <button type="button" className={btn.ghost} onClick={() => setEditing(false)}>
            Cancel
          </button>
        )}
      </div>
      <Callout tone="info" title="How this is scored">
        Your self-scores feed the 35% worksheet-and-rubric part of Interview readiness. Be honest: a 2 now beats a surprise in the interview.
      </Callout>
    </div>
  )
}
