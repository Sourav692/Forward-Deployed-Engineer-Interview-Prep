'use client'

import Link from 'next/link'
import { useState } from 'react'
import * as repo from '../repo'
import { DAY_MS, attemptsFor, scoreCheckpoint, type CheckpointResult } from '@/lib/progress/rules'
import { update, useDemo } from '../store/useDemo'
import { ConfirmDialog, toast } from './feedback'
import { ErrorState, ProgressBar, StatusBadge, btn, cx } from './ui'
import type { AssessmentItem } from '../types'

/**
 * Checkpoint runner: one question at a time, a confirmation step before submitting,
 * then a score screen with a per-skill breakdown and revision links. Every submission
 * is recorded as an attempt, so retrying keeps the history.
 */
export function AssessmentRunner({ moduleId }: { moduleId: string }) {
  const { state } = useDemo()
  const m = repo.getModule(moduleId)!
  const assessment = repo.getAssessment(m.checkpointId)!
  const items = repo.getAssessmentItems(assessment.id)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [i, setI] = useState(0)
  const [confirm, setConfirm] = useState(false)
  const [unanswered, setUnanswered] = useState<number[]>([])
  const [result, setResult] = useState<{ r: CheckpointResult<AssessmentItem>; attempt: number } | null>(null)
  const attempts = state ? attemptsFor(state, assessment.id) : []

  const restart = () => {
    setAnswers({})
    setI(0)
    setResult(null)
    setUnanswered([])
  }

  const trySubmit = () => {
    const missing = items.map((it, n) => (answers[it.id] ? -1 : n)).filter((n) => n >= 0)
    setUnanswered(missing)
    if (missing.length) return
    setConfirm(true)
  }

  const submit = () => {
    setConfirm(false)
    const r = scoreCheckpoint(assessment, items, answers)
    update(
      (s) => {
        s.attempts.push({
          id: `att-${Date.now()}`,
          assessmentId: assessment.id,
          kind: 'checkpoint',
          // Dated on the learner's clock, so the time-travel setting can test mastery.
          at: new Date(Date.now() + s.clockOffsetDays * DAY_MS).toISOString(),
          score: r.score,
          passed: r.passed,
          answers,
          skillScores: r.skillScores,
        })
      },
      {
        kind: r.passed ? 'checkpoint-passed' : 'checkpoint-failed',
        itemId: m.id,
        label: `${r.passed ? 'Passed' : 'Scored'} ${r.score}% on the ${m.code} checkpoint`,
        href: repo.href.checkpoint(m),
      },
    )
    setResult({ r, attempt: attempts.length + 1 })
    toast(r.passed ? `Passed with ${r.score}%.` : `Scored ${r.score}%. Pass is 70%.`, r.passed ? 'success' : 'error')
  }

  if (result) return <ScoreScreen moduleId={moduleId} result={result.r} attempt={result.attempt} onRetry={restart} />

  const item = items[i]
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3 text-[0.8125rem] text-subtle">
        <span>
          Question {i + 1} of {items.length}
        </span>
        <span>· Pass at {assessment.passPercent}%</span>
        <span>· {attempts.length ? `${attempts.length} previous attempt${attempts.length === 1 ? '' : 's'}` : 'First attempt'}</span>
      </div>
      <ProgressBar value={Object.keys(answers).length / items.length} label="Questions answered" />
      <ol aria-label="Questions" className="mt-3 flex flex-wrap gap-1.5">
        {items.map((it, n) => (
          <li key={it.id}>
            <button
              type="button"
              onClick={() => setI(n)}
              aria-label={`Question ${n + 1}${answers[it.id] ? ', answered' : ', unanswered'}`}
              aria-current={n === i ? 'step' : undefined}
              className={cx(
                'h-8 w-8 rounded-md border text-[0.8125rem] font-semibold tabular-nums',
                n === i ? 'border-accent ring-2 ring-accent/40' : 'border-border',
                answers[it.id] ? 'bg-accent-soft text-accent' : unanswered.includes(n) ? 'border-danger text-danger' : 'text-muted',
              )}
            >
              {n + 1}
            </button>
          </li>
        ))}
      </ol>

      <fieldset className="mt-6 rounded-xl border border-border bg-surface p-4 sm:p-5">
        <legend className="sr-only">Question {i + 1}</legend>
        <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle">{item.kind === 'scenario' ? 'Scenario' : 'Multiple choice'}</span>
        {item.scenario && <p className="mt-2 rounded-md bg-surface-2 px-3 py-2 text-[0.9375rem]">{item.scenario}</p>}
        <p className="mt-3 text-[1rem] font-semibold">{item.prompt}</p>
        <div className="mt-3 space-y-2">
          {item.options.map((o) => (
            <label
              key={o.id}
              className={cx(
                'flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-[0.9375rem] focus-within:ring-2 focus-within:ring-accent',
                answers[item.id] === o.id ? 'border-accent bg-accent-soft' : 'border-border hover:bg-surface-2',
              )}
            >
              <input
                type="radio"
                name={item.id}
                value={o.id}
                checked={answers[item.id] === o.id}
                onChange={() => {
                  setAnswers((a) => ({ ...a, [item.id]: o.id }))
                  setUnanswered((u) => u.filter((n) => n !== i))
                }}
                className="mt-1 accent-[var(--accent)]"
              />
              <span>
                <span className="font-semibold uppercase">{o.id}.</span> {o.text}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {unanswered.length > 0 && (
        <div className="mt-4">
          <ErrorState title="Some questions are unanswered" body={`Answer question${unanswered.length > 1 ? 's' : ''} ${unanswered.map((n) => n + 1).join(', ')} before submitting.`} />
        </div>
      )}

      <div className="mt-5 flex flex-wrap justify-between gap-2">
        <button type="button" className={btn.secondary} disabled={i === 0} onClick={() => setI(i - 1)}>
          Previous
        </button>
        {i < items.length - 1 ? (
          <button type="button" className={btn.primary} onClick={() => setI(i + 1)}>
            Next
          </button>
        ) : (
          <button type="button" className={btn.primary} onClick={trySubmit}>
            Submit checkpoint
          </button>
        )}
      </div>
      <ConfirmDialog
        open={confirm}
        title="Submit this checkpoint?"
        body={`You answered all ${items.length} questions. Submitting records an attempt; you can retry as often as you like.`}
        confirmLabel="Submit"
        onConfirm={submit}
        onCancel={() => setConfirm(false)}
      />
    </div>
  )
}

function ScoreScreen({ moduleId, result, attempt, onRetry }: { moduleId: string; result: CheckpointResult<AssessmentItem>; attempt: number; onRetry: () => void }) {
  const { progress } = useDemo()
  const m = repo.getModule(moduleId)!
  const revise = [...new Set(result.missed.map((x) => x.remediationModuleId))].map((id) => repo.getModule(id)!)
  const status = progress?.modules[moduleId]?.status
  return (
    <div className="space-y-6">
      <div className={cx('rounded-xl border p-5', result.passed ? 'border-success/40 bg-success-soft' : 'border-danger/40 bg-danger-soft')} role="status">
        <p className="text-[0.8125rem] font-semibold uppercase tracking-wide">{result.passed ? 'Passed' : 'Not passed'}</p>
        <p className="mt-1 text-[2.5rem] font-bold tabular-nums leading-none">{result.score}%</p>
        <p className="mt-2 text-[0.875rem]">
          Pass mark 70%. This was attempt {attempt}.{' '}
          {result.passed ? 'Prerequisite checks that depended on this checkpoint now pass.' : 'Revise the modules below, then retry.'}
        </p>
        {status && (
          <p className="mt-2 flex items-center gap-2 text-[0.8125rem]">
            Module status now: <StatusBadge status={status} size="xs" />
          </p>
        )}
      </div>

      <section>
        <h2 className="font-semibold">By skill</h2>
        <ul className="mt-2 space-y-2">
          {Object.entries(result.skillScores).map(([skillId, s]) => (
            <li key={skillId}>
              <div className="flex justify-between text-[0.875rem]">
                <span>{repo.getSkill(skillId)?.title ?? skillId}</span>
                <span className="tabular-nums text-muted">
                  {s.correct}/{s.total}
                </span>
              </div>
              <ProgressBar value={s.correct / s.total} label={`${skillId} score`} tone={s.correct / s.total >= 0.7 ? 'success' : 'warning'} />
            </li>
          ))}
        </ul>
      </section>

      {result.missed.length > 0 && (
        <section>
          <h2 className="font-semibold">What you missed</h2>
          <ul className="mt-2 space-y-2 text-[0.875rem]">
            {result.missed.map((x) => (
              <li key={x.id} className="rounded-md bg-surface-2 px-3 py-2">
                <p className="font-medium">{x.prompt}</p>
                <p className="mt-0.5 text-muted">{x.explanation}</p>
              </li>
            ))}
          </ul>
          <h3 className="mt-4 text-[0.9375rem] font-semibold">Recommended revision</h3>
          <ul className="mt-1 space-y-1 text-[0.875rem]">
            {revise.map((r) => (
              <li key={r.id}>
                <Link href={repo.href.module(r)} className="text-accent hover:underline">
                  {r.code} {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" className={result.passed ? btn.secondary : btn.primary} onClick={onRetry}>
          Retry checkpoint
        </button>
        <Link href={repo.href.module(m)} className={result.passed ? btn.primary : btn.secondary}>
          Back to {m.code}
        </Link>
      </div>
    </div>
  )
}
