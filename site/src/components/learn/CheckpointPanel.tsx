'use client'

/**
 * A module checkpoint (DATA-10): answer every question, submit, see the score against
 * the 70 % pass mark and an explanation for each miss. Each submission is an `Attempt`
 * under `fd:v1:learn:attempts:checkpoint:<module>` plus a checkpoint-passed or -failed
 * activity event, which drive interview readiness and the revision queue.
 */
import { useId, useState } from 'react'
import type { CheckpointItem } from '@/lib/checkpoints'
import { CHECKPOINT_PASS, checkpointId, scoreCheckpoint, type CheckpointResult } from '@/lib/progress/rules'
import { listAttempts, recordAttempt } from '@/lib/progress/store'
import { useProgress } from '@/lib/progress/useProgress'
import { Button, ErrorState, cx, toast } from '@/components/ui'
import { COPY } from './copy'

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export function CheckpointPanel({
  moduleSlug,
  title,
  href,
  items,
}: {
  moduleSlug: string
  /** The module's title, used in the activity entry. */
  title: string
  href: string
  items: CheckpointItem[]
}) {
  const uid = useId()
  const id = checkpointId(moduleSlug)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [result, setResult] = useState<CheckpointResult<CheckpointItem> | null>(null)
  const last = useProgress(() => listAttempts(id).at(-1) ?? null)

  const submit = () => {
    const r = scoreCheckpoint({ passPercent: CHECKPOINT_PASS }, items, answers)
    if (r.unanswered.length) {
      const numbers = r.unanswered.map((u) => items.findIndex((i) => i.id === u) + 1)
      return setError(`Answer every question first. Still open: ${numbers.join(', ')}.`)
    }
    setError('')
    setResult(r)
    const saved = recordAttempt(
      { assessmentId: id, kind: 'checkpoint', at: new Date().toISOString(), score: r.score, passed: r.passed, answers, skillScores: r.skillScores },
      { kind: r.passed ? 'checkpoint-passed' : 'checkpoint-failed', label: `${r.passed ? 'Passed' : 'Did not pass'} the ${title} checkpoint (${r.score} %)`, href: `${href}#checkpoint` },
    )
    if (!saved) toast(COPY.saveFailed, 'error')
    else toast(r.passed ? `Checkpoint passed: ${r.score} %.` : `${r.score} %. The pass mark is ${CHECKPOINT_PASS} %.`, r.passed ? 'success' : 'info')
  }

  const retake = () => {
    setAnswers({})
    setResult(null)
  }

  return (
    <div>
      <p className="text-sm text-muted">
        {items.length} questions on this module&apos;s lessons. Pass mark {CHECKPOINT_PASS} %. Your result feeds interview
        readiness, and a failed checkpoint puts the module in your revision queue.
      </p>
      {last && !result && (
        <p className="mt-2 text-sm">
          Last attempt: <strong>{last.score} %</strong>, {last.passed ? 'passed' : 'not passed'} on {formatDate(last.at)}.
        </p>
      )}

      <ol className="mt-5 space-y-6">
        {items.map((item, n) => {
          const missed = result?.missed.some((m) => m.id === item.id)
          return (
            <li key={item.id}>
              <fieldset disabled={!!result}>
                <legend className="text-sm font-semibold">
                  {n + 1}. {item.prompt}
                </legend>
                <div className="mt-2 space-y-1.5">
                  {item.options.map((o) => {
                    const correct = result && o.id === item.correctOptionId
                    return (
                      <label
                        key={o.id}
                        className={cx(
                          'flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-sm',
                          correct ? 'border-success/50 bg-success-soft' : 'border-border hover:bg-surface-2',
                        )}
                      >
                        <input
                          type="radio"
                          name={`${uid}-${item.id}`}
                          className="mt-0.5 accent-[var(--accent)]"
                          checked={answers[item.id] === o.id}
                          onChange={() => setAnswers((a) => ({ ...a, [item.id]: o.id }))}
                        />
                        <span>
                          {o.text}
                          {correct && <span className="sr-only"> (correct answer)</span>}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
              {result && (
                <p className={cx('mt-2 text-sm', missed ? 'text-danger' : 'text-muted')}>
                  <strong>{missed ? 'Missed.' : 'Correct.'}</strong> {item.explanation}
                </p>
              )}
            </li>
          )
        })}
      </ol>

      {error && (
        <div className="mt-4">
          <ErrorState title="Not submitted yet" body={error} />
        </div>
      )}
      {result ? (
        <div
          role="status"
          className={cx('mt-5 rounded-lg border p-4', result.passed ? 'border-success/40 bg-success-soft' : 'border-danger/40 bg-danger-soft')}
        >
          <p className="font-semibold">
            {result.passed ? 'Passed' : 'Not passed yet'}: {result.score} % ({items.length - result.missed.length} of {items.length})
          </p>
          <Button variant="secondary" className="mt-3" onClick={retake}>
            Take it again
          </Button>
        </div>
      ) : (
        <Button className="mt-5" onClick={submit}>
          Submit checkpoint
        </Button>
      )}
    </div>
  )
}
