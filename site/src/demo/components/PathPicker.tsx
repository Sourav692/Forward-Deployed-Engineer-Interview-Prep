'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import * as repo from '../repo'
import { choosePath, useDemo } from '../store/useDemo'
import { toast } from './feedback'
import { Card, ErrorState, Tag, btn, cx } from './ui'

/** Sums each answer's weights per base path; the highest total is the recommendation. */
function recommend(answers: Record<string, number>): { pathId: string; scores: Record<string, number> } {
  const scores: Record<string, number> = {}
  for (const q of repo.getDiagnostic()) {
    const opt = q.options[answers[q.id]]
    if (!opt) continue
    for (const [p, w] of Object.entries(opt.weights)) scores[p] = (scores[p] ?? 0) + (w ?? 0)
  }
  const pathId = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'fde'
  return { pathId, scores }
}

export function ChoosePathButton({ pathId, primary = true }: { pathId: string; primary?: boolean }) {
  const { pathId: current } = useDemo()
  const router = useRouter()
  const p = repo.getPath(pathId)!
  if (current === pathId) return <span className={cx(btn.secondary, 'pointer-events-none border-success text-success')}>✓ Your current path</span>
  return (
    <button
      type="button"
      className={primary ? btn.primary : btn.secondary}
      onClick={() => {
        choosePath(pathId, p.title)
        toast(`Path set to ${p.title}. Your recommended sequence is updated.`)
        router.push('/demo/learn')
      }}
    >
      Choose this path
    </button>
  )
}

export function PathPicker() {
  const questions = repo.getDiagnostic()
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(false)
  const answered = Object.keys(answers).length
  const rec = recommend(answers)
  const recPath = repo.getPath(rec.pathId)!

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section aria-labelledby="diag">
        <h2 id="diag" className="text-[1.125rem] font-semibold">
          Path diagnostic
        </h2>
        <p className="text-[0.875rem] text-muted">Ten questions, about two minutes. Your answers stay in this browser.</p>
        <ol className="mt-4 space-y-4">
          {questions.map((q, n) => (
            <li key={q.id}>
              <fieldset className="rounded-xl border border-border bg-surface p-4">
                <legend className="px-1 text-[0.9375rem] font-semibold">
                  {n + 1}. {q.prompt}
                </legend>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {q.options.map((o, i) => (
                    <label
                      key={o.label}
                      className={cx(
                        'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-[0.875rem] focus-within:ring-2 focus-within:ring-accent',
                        answers[q.id] === i ? 'border-accent bg-accent-soft' : 'border-border hover:bg-surface-2',
                      )}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={answers[q.id] === i}
                        onChange={() => {
                          setAnswers((a) => ({ ...a, [q.id]: i }))
                          setError(false)
                        }}
                        className="accent-[var(--accent)]"
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </li>
          ))}
        </ol>
        {error && (
          <div className="mt-4">
            <ErrorState title="Answer every question" body={`You have answered ${answered} of ${questions.length}.`} />
          </div>
        )}
        <button type="button" className={cx(btn.primary, 'mt-4')} onClick={() => (answered < questions.length ? setError(true) : setSubmitted(true))}>
          See my recommended path
        </button>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <Card className={cx(submitted && 'border-accent')}>
          <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-subtle">{submitted ? 'Recommended for you' : `Live estimate · ${answered}/10 answered`}</p>
          <p className="mt-1 text-[1.25rem] font-bold">{answered ? recPath.title : 'Answer a few questions'}</p>
          {answered > 0 && <p className="mt-1 text-[0.875rem] text-muted">{recPath.summary}</p>}
          {submitted && (
            <div className="mt-3 flex flex-wrap gap-2">
              <ChoosePathButton pathId={recPath.id} />
              <Link href={repo.href.path(recPath.id)} className={btn.secondary}>
                See details
              </Link>
            </div>
          )}
        </Card>
        <Card>
          <h2 className="font-semibold">All paths</h2>
          <ul className="mt-2 space-y-1.5 text-[0.875rem]">
            {repo.listBasePaths().map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2">
                <Link href={repo.href.path(p.id)} className={cx('hover:text-accent', submitted && p.id === rec.pathId && 'font-semibold text-accent')}>
                  {p.title}
                </Link>
                <span className="text-[0.75rem] tabular-nums text-subtle">~{p.estHours} h</span>
              </li>
            ))}
          </ul>
          <h3 className="mt-4 text-[0.8125rem] font-semibold">Company variants</h3>
          <ul className="mt-1 space-y-1.5 text-[0.875rem]">
            {repo.listCompanyVariants().map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2">
                <Link href={repo.href.path(p.id)} className="hover:text-accent">
                  {p.title}
                </Link>
                <Tag>Variant</Tag>
              </li>
            ))}
          </ul>
        </Card>
      </aside>
    </div>
  )
}
