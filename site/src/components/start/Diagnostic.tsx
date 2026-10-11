'use client'

/**
 * The ten-question path diagnostic on /start (FE-10). One question per step, each a
 * native radio group inside a fieldset, so arrow keys move between answers and screen
 * readers announce the question as the group label. Focus moves to the question (or
 * the result heading) on every step so keyboard and screen-reader users keep their
 * place. Answers live in component state only; nothing is stored until the learner
 * chooses the path.
 */
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { DIAGNOSTIC, getPathById, pathVariants, scoreDiagnostic, type DiagnosticResult } from '@/lib/paths'
import { Button, LinkButton, ProgressBar, cx, focusRing } from '@/components/ui'
import { savePath } from './path-state'

export type ModuleRef = { code: string; title: string; href: string }

type Step = 'intro' | number | 'result'

export function Diagnostic({ modules }: { modules: Record<string, ModuleRef> }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('intro')
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [missing, setMissing] = useState(false)
  const [result, setResult] = useState<DiagnosticResult | null>(null)
  const [sessionOnly, setSessionOnly] = useState(false)
  const focusRef = useRef<HTMLElement | null>(null)
  const moved = useRef(false)
  const errorId = useId()

  // Move focus after the learner acts (not on first render).
  useEffect(() => {
    if (moved.current) focusRef.current?.focus()
  }, [step])

  const go = (next: Step) => {
    moved.current = true
    setMissing(false)
    setStep(next)
  }

  if (step === 'intro') {
    return (
      <div className="rounded-lg border border-border bg-surface p-4 sm:p-5">
        <p className="text-sm text-muted">
          Ten questions about your background, your timeline and how you study. It takes about three minutes, and
          your answers stay on this page.
        </p>
        <Button className="mt-4" onClick={() => go(0)}>
          Start the diagnostic
        </Button>
      </div>
    )
  }

  if (step === 'result' && result) {
    const path = getPathById(result.pathId)
    if (!path) return null
    const start = modules[path.startModule]
    const variants = pathVariants(path.id)
    const follow = () => {
      const saved = savePath(path, result.weeklyHours)
      if (!saved) setSessionOnly(true)
      if (start) router.push(start.href)
    }
    return (
      <div className="rounded-lg border border-accent/30 bg-surface p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-subtle">Your Recommended Path</p>
        <h3
          ref={(el) => {
            focusRef.current = el
          }}
          tabIndex={-1}
          className="mt-1 text-2xl font-semibold tracking-[-0.01em] outline-none"
        >
          {path.title}
        </h3>
        <p className="mt-2 text-base text-muted">{path.summary}</p>
        <p className="mt-1 text-sm text-muted">
          About {path.estHours} hours of required and recommended study, or about{' '}
          {Math.max(1, Math.round(path.estHours / result.weeklyHours))} weeks at {result.weeklyHours} hours a week.
        </p>

        {result.reasons.length > 0 && (
          <>
            <h4 className="mt-5 text-sm font-semibold">Why This Path</h4>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
              {result.reasons.map((r) => (
                <li key={r.prompt}>
                  {r.prompt} <span className="font-semibold">{r.answer}.</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {result.canSkip.length > 0 && (
          <>
            <h4 className="mt-5 text-sm font-semibold">You May Be Able to Skip</h4>
            <p className="mt-1 text-sm text-muted">Open each one and skip it if you can explain it without notes.</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
              {result.canSkip
                .filter((slug) => modules[slug])
                .map((slug) => (
                  <li key={slug}>
                    <Link href={modules[slug].href} className={cx('rounded-sm text-accent underline underline-offset-2', focusRing)}>
                      {modules[slug].title}
                    </Link>
                  </li>
                ))}
            </ul>
          </>
        )}

        {variants.length > 0 && (
          <p className="mt-5 text-sm text-muted">
            Interviewing for a specific kind of loop? See the{' '}
            {variants.map((v, i) => (
              <span key={v.id}>
                {i > 0 && ' or '}
                <Link href={`/start/paths/${v.id}`} className={cx('rounded-sm font-semibold text-accent underline underline-offset-2', focusRing)}>
                  {v.title.replace(/^.*: /, '')}
                </Link>
              </span>
            ))}{' '}
            variant.
          </p>
        )}

        {sessionOnly && (
          <p role="status" className="mt-5 rounded-md border border-warning/50 bg-warning-soft px-3 py-2 text-sm text-warning-text">
            <span className="font-semibold">Progress won&apos;t be saved in this browser.</span> Your path is kept for
            this visit only.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={follow}>{start ? `Start first module: ${start.title}` : 'Choose this path'}</Button>
          <LinkButton href={`/start/paths/${path.id}`} variant="secondary">
            See the full path
          </LinkButton>
          <Button
            variant="ghost"
            onClick={() => {
              setAnswers({})
              setResult(null)
              go(0)
            }}
          >
            Retake the diagnostic
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted">Starting the first module saves this path in your browser. You can change it any time.</p>
      </div>
    )
  }

  const index = typeof step === 'number' ? step : 0
  const q = DIAGNOSTIC[index]
  const last = index === DIAGNOSTIC.length - 1
  const answered = answers[q.id] !== undefined

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!answered) {
      setMissing(true)
      return
    }
    if (last) {
      setResult(scoreDiagnostic(answers))
      go('result')
    } else go(index + 1)
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-border bg-surface p-4 sm:p-5" noValidate>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar value={index / DIAGNOSTIC.length} label="Diagnostic progress" />
        </div>
        <span className="shrink-0 text-xs tabular-nums text-muted">
          Question {index + 1} of {DIAGNOSTIC.length}
        </span>
      </div>
      <fieldset key={q.id} className="mt-4" aria-describedby={missing ? errorId : undefined}>
        <legend
          ref={(el) => {
            focusRef.current = el
          }}
          tabIndex={-1}
          className="text-lg font-semibold leading-snug outline-none"
        >
          <span className="sr-only">
            Question {index + 1} of {DIAGNOSTIC.length}:{' '}
          </span>
          {q.prompt}
        </legend>
        <div className="mt-3 grid gap-2">
          {q.options.map((o, i) => {
            const checked = answers[q.id] === i
            return (
              <label
                key={o.label}
                className={cx(
                  'flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors duration-150',
                  'has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-accent-ring',
                  checked ? 'border-accent bg-accent-soft' : 'border-border bg-bg hover:bg-surface-2',
                )}
              >
                <input
                  type="radio"
                  name={q.id}
                  value={i}
                  checked={checked}
                  onChange={() => {
                    setAnswers((a) => ({ ...a, [q.id]: i }))
                    setMissing(false)
                  }}
                  className="size-4 shrink-0 accent-[var(--accent)]"
                />
                <span>{o.label}</span>
              </label>
            )
          })}
        </div>
      </fieldset>
      {missing && (
        <p id={errorId} role="alert" className="mt-3 text-sm font-medium text-danger">
          Choose an answer to continue.
        </p>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {index > 0 && (
          <Button variant="secondary" onClick={() => go(index - 1)}>
            Back
          </Button>
        )}
        <Button type="submit">{last ? 'See my path' : 'Next'}</Button>
      </div>
    </form>
  )
}
