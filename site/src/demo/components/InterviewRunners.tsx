'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { RubricDimension } from '../types'
import * as repo from '../repo'
import { RUBRIC_DIMENSIONS, attemptsFor, scoreExam, scoreMock, type ExamResult, type MockResult } from '../store/rules'
import { update, useDemo } from '../store/useDemo'
import { ConfirmDialog, toast } from './feedback'
import { Card, ErrorState, ProgressBar, btn, cx, formatDate } from './ui'

const DIM_LABEL: Record<RubricDimension, string> = {
  structure: 'Structure',
  'technical-depth': 'Technical depth',
  'trade-offs': 'Trade-offs',
  communication: 'Communication',
  'customer-judgement': 'Customer judgement',
}
const ANCHORS: Record<RubricDimension, [string, string, string, string]> = {
  structure: ['No visible order', 'Order, but gaps', 'Framework applied', 'Framework applied and time-boxed'],
  'technical-depth': ['Buzzwords', 'Correct but shallow', 'Correct with mechanisms', 'Mechanisms, numbers and failure modes'],
  'trade-offs': ['None stated', 'Named, not weighed', 'Weighed for this context', 'Weighed and tied to the success metric'],
  communication: ['Hard to follow', 'Clear but long', 'Clear and concise', 'Adapts to the interviewer’s probes'],
  'customer-judgement': ['Ignores the customer', 'Mentions users', 'Asks, scopes, names the metric', 'Plans adoption and impact measurement'],
}

/** Countdown timer. Simulated: it never ends the round on its own. */
export function Timer({ minutes }: { minutes: number }) {
  const [left, setLeft] = useState(minutes * 60)
  const [running, setRunning] = useState(false)
  useEffect(() => {
    if (!running) return
    const t = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000)
    return () => window.clearInterval(t)
  }, [running])
  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
      <span role="timer" aria-label={`${mm} minutes ${ss} seconds left`} className={cx('font-mono text-[1.75rem] font-bold tabular-nums', left === 0 && 'text-danger')}>
        {mm}:{ss}
      </span>
      <div className="flex gap-2">
        <button type="button" className={btn.secondary} onClick={() => setRunning((r) => !r)}>
          {running ? 'Pause' : left === minutes * 60 ? 'Start timer' : 'Resume'}
        </button>
        <button type="button" className={btn.ghost} onClick={() => (setRunning(false), setLeft(minutes * 60))}>
          Reset
        </button>
      </div>
      <span className="text-[0.8125rem] text-subtle">{left === 0 ? 'Time. Wrap up in one sentence.' : `${minutes}-minute round`}</span>
    </div>
  )
}

export function MockRunner({ mockId }: { mockId: string }) {
  const { state } = useDemo()
  const mock = repo.getMock(mockId)!
  const dims = RUBRIC_DIMENSIONS.filter((d) => mock.fdeRound || d !== 'customer-judgement')
  const [rubric, setRubric] = useState<Partial<Record<RubricDimension, number>>>({})
  const [probes, setProbes] = useState(1)
  const [error, setError] = useState('')
  const [result, setResult] = useState<MockResult | null>(null)
  const history = state ? attemptsFor(state, mockId) : []

  const submit = () => {
    const missing = dims.filter((d) => !rubric[d])
    if (missing.length) return setError(`Score every dimension: ${missing.map((d) => DIM_LABEL[d]).join(', ')}.`)
    setError('')
    const r = scoreMock(rubric, mock.fdeRound)
    update(
      (s) =>
        void s.attempts.push({ id: `att-${Date.now()}`, assessmentId: mockId, kind: 'mock', at: new Date().toISOString(), score: Math.round(r.mean * 25), passed: r.passed, rubric }),
      { kind: 'mock-completed', itemId: mockId, label: `${r.passed ? 'Passed' : 'Completed'} Mock ${mock.letter} (mean ${r.mean.toFixed(1)})`, href: repo.href.mock(mockId) },
    )
    setResult(r)
    toast(r.passed ? `Mock ${mock.letter} passed.` : `Mock ${mock.letter} not passed yet.`, r.passed ? 'success' : 'error')
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-6">
        <Timer minutes={mock.minutes} />
        <Card>
          <h2 className="font-semibold">Prompt</h2>
          <p className="mt-1 text-[1rem] leading-relaxed">{mock.prompt}</p>
          <h3 className="mt-4 text-[0.875rem] font-semibold">You are told</h3>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[0.9375rem]">
            {mock.context.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Card>
        <section>
          <h2 className="font-semibold">Follow-up probes</h2>
          <p className="text-[0.8125rem] text-subtle">Reveal them one at a time, as an interviewer would.</p>
          <ol className="mt-2 space-y-2">
            {mock.probes.slice(0, probes).map((p, i) => (
              <li key={p} className="rounded-md bg-surface-2 px-3 py-2 text-[0.9375rem]">
                <span className="font-semibold">{i + 1}. </span>
                {p}
              </li>
            ))}
          </ol>
          {probes < mock.probes.length && (
            <button type="button" className={cx(btn.secondary, 'mt-2 px-3 py-1.5 text-[0.8125rem]')} onClick={() => setProbes((n) => n + 1)}>
              Next probe ({probes}/{mock.probes.length})
            </button>
          )}
        </section>

        <section aria-labelledby="score">
          <h2 id="score" className="font-semibold">
            Self-score on the shared rubric
          </h2>
          <p className="text-[0.8125rem] text-subtle">Pass: no dimension below 2 and a mean of 3 or more.{mock.fdeRound ? ' Customer judgement is scored on this FDE round.' : ''}</p>
          <div className="mt-3 space-y-4">
            {dims.map((d) => (
              <fieldset key={d}>
                <legend className="text-[0.875rem] font-semibold">{DIM_LABEL[d]}</legend>
                <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {ANCHORS[d].map((a, i) => (
                    <label key={a} className={cx('cursor-pointer rounded-lg border p-2 text-[0.8125rem] focus-within:ring-2 focus-within:ring-accent', rubric[d] === i + 1 ? 'border-accent bg-accent-soft' : 'border-border hover:bg-surface-2')}>
                      <input type="radio" name={d} className="sr-only" checked={rubric[d] === i + 1} onChange={() => setRubric((r) => ({ ...r, [d]: i + 1 }))} />
                      <span className="font-semibold">{i + 1}</span> <span className="text-muted">{a}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
          {error && (
            <div className="mt-3">
              <ErrorState title="Not scored yet" body={error} />
            </div>
          )}
          <button type="button" className={cx(btn.primary, 'mt-4')} onClick={submit}>
            Score this mock
          </button>
        </section>

        {result && (
          <div role="status" className={cx('rounded-xl border p-4', result.passed ? 'border-success/40 bg-success-soft' : 'border-danger/40 bg-danger-soft')}>
            <p className="font-semibold">{result.passed ? 'Passed' : 'Not passed'}: mean {result.mean.toFixed(2)} / 4</p>
            <p className="mt-1 text-[0.875rem]">
              Weakest dimension: <strong>{result.lowest ? DIM_LABEL[result.lowest] : 'n/a'}</strong>.{' '}
              {!result.passed && 'Revise the related modules, then run the round again.'}
            </p>
          </div>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <Card>
          <h2 className="font-semibold">Covers</h2>
          <p className="mt-1 text-[0.875rem] text-muted">{mock.covers}</p>
          <ul className="mt-2 space-y-1 text-[0.875rem]">
            {mock.relatedModuleIds.map((id) => {
              const m = repo.getModule(id)
              return m ? (
                <li key={id}>
                  <Link href={repo.href.module(m)} className="text-accent hover:underline">
                    {m.code} {m.title}
                  </Link>
                </li>
              ) : null
            })}
          </ul>
        </Card>
        <Card>
          <h2 className="font-semibold">Your attempts</h2>
          {history.length === 0 ? (
            <p className="mt-1 text-[0.875rem] text-subtle">None yet. Your scored attempts appear here.</p>
          ) : (
            <ul className="mt-2 space-y-1.5 text-[0.875rem]">
              {history
                .slice()
                .reverse()
                .map((a) => (
                  <li key={a.id} className="flex justify-between">
                    <span>{formatDate(a.at)}</span>
                    <span className={a.passed ? 'text-success' : 'text-danger'}>
                      {a.passed ? 'Passed' : 'Not passed'} · {(a.score / 25).toFixed(1)}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </Card>
      </aside>
    </div>
  )
}

export function ReadinessExamRunner() {
  const { state } = useDemo()
  const exam = repo.getReadinessExam()
  const [scores, setScores] = useState<Record<string, number>>({})
  const [fails, setFails] = useState<string[]>([])
  const [confirm, setConfirm] = useState(false)
  const [result, setResult] = useState<ExamResult | null>(null)
  const history = state ? attemptsFor(state, exam.id) : []
  const raw = exam.sections.reduce((s, x) => s + (scores[x.id] ?? 0), 0)

  const submit = () => {
    setConfirm(false)
    const r = scoreExam(scores, fails, exam.passMark)
    update(
      (s) => void s.attempts.push({ id: `att-${Date.now()}`, assessmentId: exam.id, kind: 'readiness-exam', at: new Date().toISOString(), score: r.total, passed: r.passed, sectionScores: scores, autoFails: fails }),
      { kind: 'exam-completed', itemId: exam.id, label: `Readiness exam: ${r.total}/100${r.passed ? ', passed' : ''}`, href: '/demo/interview/readiness-exam' },
    )
    setResult(r)
    toast(r.passed ? 'Readiness exam passed.' : 'Readiness exam not passed.', r.passed ? 'success' : 'error')
  }

  return (
    <div className="space-y-6">
      <Timer minutes={exam.minutes} />
      <Card>
        <h2 className="font-semibold">Scenario</h2>
        <p className="mt-1 leading-relaxed">{exam.scenario}</p>
      </Card>
      <section>
        <h2 className="font-semibold">Sections</h2>
        <p className="text-[0.8125rem] text-subtle">Simulated: work each task on paper, then score yourself against the section maximum.</p>
        <ol className="mt-3 space-y-3">
          {exam.sections.map((s, i) => (
            <li key={s.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold">
                  {i + 1}. {s.title}
                </h3>
                <span className="text-[0.8125rem] text-subtle">{s.maxPoints} points</span>
              </div>
              <p className="mt-1 text-[0.9375rem] text-muted">{s.task}</p>
              <label className="mt-3 flex items-center gap-3 text-[0.875rem]">
                <span className="w-24 shrink-0 font-semibold">Your score</span>
                <input type="range" min={0} max={s.maxPoints} value={scores[s.id] ?? 0} onChange={(e) => setScores((x) => ({ ...x, [s.id]: Number(e.target.value) }))} className="flex-1 accent-[var(--accent)]" aria-label={`${s.title} score`} />
                <span className="w-14 text-right tabular-nums">
                  {scores[s.id] ?? 0}/{s.maxPoints}
                </span>
              </label>
            </li>
          ))}
        </ol>
      </section>
      <fieldset className="rounded-xl border border-danger/40 bg-danger-soft p-4">
        <legend className="px-1 font-semibold text-danger">Automatic-fail conditions</legend>
        <p className="text-[0.8125rem]">Tick any that happened. Any one caps the result below the pass mark of {exam.passMark}.</p>
        <ul className="mt-2 space-y-1.5">
          {exam.autoFailConditions.map((c) => (
            <li key={c.id}>
              <label className="flex items-start gap-2 text-[0.875rem]">
                <input type="checkbox" checked={fails.includes(c.id)} onChange={(e) => setFails((f) => (e.target.checked ? [...f, c.id] : f.filter((x) => x !== c.id)))} className="mt-0.5 accent-[var(--danger)]" />
                {c.label}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[0.875rem] tabular-nums">Running total: {raw}/100</span>
        <button type="button" className={btn.primary} onClick={() => setConfirm(true)}>
          Submit exam
        </button>
      </div>
      <ConfirmDialog open={confirm} title="Submit the readiness exam?" body={`Raw score ${raw}/100${fails.length ? ` with ${fails.length} automatic-fail condition${fails.length > 1 ? 's' : ''}` : ''}. Every submission is recorded.`} confirmLabel="Submit" onConfirm={submit} onCancel={() => setConfirm(false)} />

      {result && (
        <div role="status" className={cx('rounded-xl border p-5', result.passed ? 'border-success/40 bg-success-soft' : 'border-danger/40 bg-danger-soft')}>
          <p className="text-[0.8125rem] font-semibold uppercase tracking-wide">{result.passed ? 'Passed' : 'Not passed'}</p>
          <p className="text-[2.25rem] font-bold tabular-nums">{result.total}/100</p>
          {result.capped && <p className="text-[0.875rem]">Raw score was {result.raw}, capped at {exam.passMark - 1} by an automatic-fail condition.</p>}
          {!result.passed && !result.capped && <p className="text-[0.875rem]">Pass mark is {exam.passMark}.</p>}
          <ul className="mt-3 space-y-2">
            {exam.sections.map((s) => (
              <li key={s.id}>
                <div className="flex justify-between text-[0.8125rem]">
                  <span>{s.title}</span>
                  <span className="tabular-nums">
                    {scores[s.id] ?? 0}/{s.maxPoints}
                  </span>
                </div>
                <ProgressBar value={(scores[s.id] ?? 0) / s.maxPoints} label={s.title} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {history.length > 0 && (
        <p className="text-[0.8125rem] text-subtle">
          Previous attempts: {history.map((a) => `${a.score}${a.passed ? ' ✓' : ''}`).join(', ')}
        </p>
      )}
    </div>
  )
}
