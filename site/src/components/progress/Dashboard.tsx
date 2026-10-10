'use client'

/**
 * The /progress dashboard (FE-16), built to `specs/2026-10-05-learn-ux.md` § Dashboard.
 * Everything is read from this browser's `fd:v1` store after hydration, so the server
 * renders skeletons and the first client render matches them. Empty-first: a widget
 * appears with its first data, and nothing shows a number the learner never produced.
 */
import Link from 'next/link'
import type { ReactNode } from 'react'
import type { CompetencySheet, DashboardData } from '@/lib/dashboard'
import { resolveChoice } from '@/lib/paths'
import { getPath, listActivity, listBookmarks } from '@/lib/progress/store'
import { useProgress } from '@/lib/progress/useProgress'
import type { MeasuredReadiness } from '@/lib/progress/rules'
import { LinkButton, ProgressBar, SkeletonCard, cx, focusRing } from '@/components/ui'
import {
  describeActivity,
  finishByNow,
  interviewReadinessNow,
  nextUp,
  remedyFor,
  revisionHref,
  revisionQueue,
  trackRows,
  type RevisionRow,
} from './dashboard-model'

export const formatDate = (at: number | string) =>
  new Date(at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export function Dashboard({ modules, sheets }: DashboardData) {
  const view = useProgress(() => {
    const choice = getPath()
    const path = resolveChoice(choice) ?? null
    const readiness = interviewReadinessNow(sheets, modules)
    const activity = listActivity()
    const bookmarks = listBookmarks()
    return {
      path,
      readiness,
      next: nextUp(modules, path),
      revision: revisionQueue(modules),
      finish: path && choice ? finishByNow(modules, path, choice) : null,
      tracks: trackRows(modules),
      activity: activity.slice(0, 5),
      bookmarks: bookmarks.slice(-5).reverse(),
      isNew: !path && activity.length === 0 && bookmarks.length === 0 && readiness.measured === 0,
    }
  })

  if (!view) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]" aria-busy="true">
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard lines={5} />
      </div>
    )
  }

  if (view.isNew) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Panel title="Nothing to Show Yet">
          <p className="text-sm text-muted">
            Your progress appears here as you read lessons, rate your confidence and score practice rounds. It stays in
            this browser.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton href="/start">Choose a path</LinkButton>
            <LinkButton href="/learn" variant="secondary">
              Browse the curriculum
            </LinkButton>
          </div>
        </Panel>
        <ReadinessPanel readiness={view.readiness} sheets={sheets} modules={modules} />
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-6">
        {view.next && (
          <Panel title="Next Up">
            <p className="text-xs font-semibold tabular-nums text-subtle">{view.next.module.code}</p>
            <p className="font-semibold">{view.next.module.title}</p>
            <p className="mt-1 text-sm text-muted">{view.next.reason}</p>
            <LinkButton href={view.next.href} className="mt-3">
              {view.next.action}
            </LinkButton>
          </Panel>
        )}
        {view.revision.length > 0 && (
          <Panel title={`Revision Queue (${view.revision.length})`} more={{ href: '/progress/revision', label: 'All' }}>
            <RevisionRows rows={view.revision.slice(0, 3)} />
          </Panel>
        )}
        {view.tracks.length > 0 && (
          <Panel title="Track Progress">
            <ul className="space-y-3">
              {view.tracks.map((t) => (
                <li key={t.code}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <Link href={t.href} className={cx('rounded-sm font-medium hover:text-accent', focusRing)}>
                      {t.code} {t.title}
                    </Link>
                    <span className="shrink-0 tabular-nums text-muted">
                      {t.read} of {t.total}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <ProgressBar value={t.fraction} label={`${t.code} ${t.title}: ${t.read} of ${t.total} lessons read`} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>

      <div className="min-w-0 space-y-6">
        <ReadinessPanel readiness={view.readiness} sheets={sheets} modules={modules} />
        <Panel title="Finish By">
          {view.finish ? (
            <>
              <p className="font-semibold">{formatDate(view.finish.date)}</p>
              <p className="mt-1 text-sm text-muted">
                {view.finish.days} days at {view.finish.weeklyHours} h a week · {view.finish.hoursLeft} h left on your path
              </p>
              <Link href="/settings" className="mt-2 inline-block text-sm text-accent underline underline-offset-2">
                Change pace
              </Link>
            </>
          ) : (
            <p className="text-sm text-muted">
              Choose a path to see a finish date.{' '}
              <Link href="/start" className="text-accent underline underline-offset-2">
                Choose a path
              </Link>
            </p>
          )}
        </Panel>
        {view.activity.length > 0 && (
          <Panel title="Recent Activity" more={{ href: '/progress/history', label: 'History' }}>
            <ul className="space-y-2 text-sm">
              {view.activity.map((e) => {
                const { text, href } = describeActivity(e)
                return (
                  <li key={e.id} className="flex gap-2">
                    <span className="w-12 shrink-0 text-subtle">{relativeDay(e.at)}</span>
                    {href ? (
                      <Link href={href} className={cx('min-w-0 rounded-sm hover:text-accent', focusRing)}>
                        {text}
                      </Link>
                    ) : (
                      <span className="min-w-0">{text}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </Panel>
        )}
        {view.bookmarks.length > 0 && (
          <Panel title="Bookmarks" more={{ href: '/progress/bookmarks', label: 'All' }}>
            <ul className="space-y-2 text-sm">
              {view.bookmarks.map((b) => (
                <li key={b.id}>
                  {b.href ? (
                    <Link href={b.href} className={cx('rounded-sm hover:text-accent', focusRing)}>
                      {b.label ?? b.itemId}
                    </Link>
                  ) : (
                    b.label ?? b.itemId
                  )}{' '}
                  <span className="text-subtle">· {b.kind}</span>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>
    </div>
  )
}

function ReadinessPanel({
  readiness,
  sheets,
  modules,
}: {
  readiness: MeasuredReadiness
  sheets: CompetencySheet[]
  modules: DashboardData['modules']
}) {
  const { score, measured, parts, weakest } = readiness
  return (
    <Panel title="Interview Readiness">
      {score === null ? (
        <p className="text-sm text-muted">
          No score yet. It is built from your worksheet scorecards, mock interviews, module checkpoints and
          behavioural worksheets.
        </p>
      ) : (
        <>
          <p className="text-2xl font-semibold tabular-nums">
            {score} %<span className="ml-2 text-sm font-normal text-muted">based on {measured} of 4 inputs</span>
          </p>
          <div className="mt-2">
            <ProgressBar value={score / 100} label={`Interview readiness ${score} %`} />
          </div>
        </>
      )}
      <ul className="mt-4 space-y-3">
        {parts.map((p) => {
          const remedy = remedyFor(p.id, sheets, modules)
          const isWeakest = weakest?.id === p.id && measured > 1
          return (
            <li key={p.id} className="text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <span className={cx(isWeakest && 'font-semibold')}>{p.label}</span>
                <span className="shrink-0 tabular-nums text-muted">
                  {p.value === null ? 'Not measured' : `${Math.round(p.value)} %`}
                </span>
              </div>
              {p.value !== null && (
                <div className="mt-1.5">
                  <ProgressBar value={p.value / 100} label={`${p.label} ${Math.round(p.value)} %`} tone={isWeakest ? 'warning' : 'accent'} />
                </div>
              )}
              {p.id === 'checkpoints' && p.value === null && !remedy ? (
                <p className="mt-1 text-xs text-muted">Module checkpoints are coming later.</p>
              ) : (
                (p.value === null || isWeakest) &&
                remedy && (
                  <p className="mt-1 text-xs text-muted">
                    {isWeakest ? 'Weakest. Next: ' : 'Start with '}
                    <Link href={remedy.href} className="text-accent underline underline-offset-2">
                      {remedy.label}
                    </Link>
                  </p>
                )
              )}
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

const REASON_TEXT: Record<RevisionRow['reason'], (r: RevisionRow) => string> = {
  'failed-checkpoint': (r) => `Checkpoint not passed (${r.score} %)`,
  low: () => 'Low confidence (rated 1 or 2)',
  faded: (r) => `Last rated ${r.days} days ago`,
  'checkpoint-due': (r) => `Checkpoint passed ${r.days} days ago; due for a re-check`,
}

export function RevisionRows({ rows }: { rows: RevisionRow[] }) {
  return (
    <ul className="divide-y divide-border">
      {rows.map((r) => (
        <li key={r.module.slug} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5 first:pt-0 last:pb-0">
          <div className="min-w-0 text-sm">
            <p className="font-medium">
              {r.module.code} {r.module.title}
            </p>
            <p className="text-muted">
              {REASON_TEXT[r.reason](r)} · since {formatDate(r.since)}
            </p>
          </div>
          <LinkButton href={revisionHref(r)} variant="secondary">
            Review now
          </LinkButton>
        </li>
      ))}
    </ul>
  )
}

export function Panel({ title, more, children }: { title: string; more?: { href: string; label: string }; children: ReactNode }) {
  return (
    <section aria-label={title} className="rounded-lg border border-border bg-surface p-4 sm:p-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {more && (
          <Link href={more.href} className={cx('rounded-sm text-sm font-semibold text-accent hover:text-accent-hover', focusRing)}>
            {more.label} <span aria-hidden>→</span>
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

export function relativeDay(at: string, now = Date.now()): string {
  const day = (t: number) => Math.floor((t - new Date(t).getTimezoneOffset() * 60_000) / 86_400_000)
  const diff = day(now) - day(Date.parse(at))
  if (diff <= 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return new Date(at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
