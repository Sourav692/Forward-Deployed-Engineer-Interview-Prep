'use client'

import Link from 'next/link'
import type { ActivityEvent, Status } from '../types'
import * as repo from '../repo'
import type { Readiness } from '@/lib/progress/rules'
import type { RevisionItem } from '../store/selectors'
import { STATUS_META, EmptyState, ProgressBar, StatusBadge, cx, formatDate } from './ui'

const REASON: Record<RevisionItem['reason'], string> = {
  'low-confidence': 'Confidence 2 or below',
  'failed-checkpoint': 'Checkpoint not passed',
  decay: 'Due: time since last pass',
}

/** Score, a ring-like bar per part, and the weakest dimension named with a link. */
export function ReadinessGauge({ title, readiness, target, remedyHref }: { title: string; readiness: Readiness; target: number; remedyHref?: string }) {
  const { score, parts, weakest } = readiness
  const angle = (score / 100) * 180
  return (
    <div>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 100 56" className="h-16 w-28 shrink-0" role="img" aria-label={`${title}: ${score} out of 100`}>
          <path d="M8 50a42 42 0 0184 0" fill="none" stroke="var(--surface-2)" strokeWidth="9" strokeLinecap="round" />
          <path
            d="M8 50a42 42 0 0184 0"
            fill="none"
            stroke={score >= target ? 'var(--success)' : 'var(--accent)'}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${(angle / 180) * 132} 200`}
          />
          <text x="50" y="48" textAnchor="middle" className="fill-[var(--text)] text-[18px] font-bold">
            {score}
          </text>
        </svg>
        <div className="min-w-0">
          <p className="font-semibold">{title}</p>
          <p className="text-[0.8125rem] text-muted">Target {target}. {score >= target ? 'On target.' : `${target - score} to go.`}</p>
          <p className="mt-1 text-[0.8125rem]">
            Weakest: <strong>{weakest.label}</strong> ({Math.round(weakest.value)}){' '}
            {remedyHref && (
              <Link href={remedyHref} className="font-semibold text-accent hover:underline">
                Fix it →
              </Link>
            )}
          </p>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5">
        {parts.map((p) => (
          <li key={p.id}>
            <div className="flex justify-between text-[0.75rem]">
              <span className={cx(p.id === weakest.id && 'font-semibold')}>
                {p.label} · {Math.round(p.weight * 100)}%
              </span>
              <span className="tabular-nums text-subtle">{Math.round(p.value)}</span>
            </div>
            <ProgressBar value={p.value / 100} label={p.label} tone={p.id === weakest.id ? 'warning' : 'accent'} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function RevisionQueueList({ items, limit }: { items: RevisionItem[]; limit?: number }) {
  if (!items.length)
    return <EmptyState title="Revision queue is clear" body="Items appear here when you rate confidence 2 or below, fail a checkpoint, or 14, 30 or 60 days pass since a module’s last pass." />
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
      {items.slice(0, limit).map((r) => (
        <li key={r.itemId} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5">
          <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[0.6875rem] font-semibold uppercase text-subtle">{r.kind}</span>
          <span className="min-w-0 flex-1 text-[0.9375rem] font-medium">{r.title}</span>
          <span className="text-[0.75rem] text-warning-text">{REASON[r.reason]}</span>
          <Link href={r.href} className="text-[0.8125rem] font-semibold text-accent hover:underline">
            Review now →
          </Link>
        </li>
      ))}
    </ul>
  )
}

const KIND_DOT: Partial<Record<ActivityEvent['kind'], string>> = {
  'checkpoint-passed': 'bg-success',
  'checkpoint-failed': 'bg-danger',
  'mock-completed': 'bg-review',
  'exam-completed': 'bg-review',
  'module-skipped': 'bg-border-strong',
}

export function ActivityTimeline({ events, limit, now }: { events: ActivityEvent[]; limit?: number; now: number }) {
  if (!events.length) return <EmptyState title="No activity yet" body="Read a lesson, submit an exercise or take a checkpoint; each step appears here with a link back." />
  const sorted = [...events].sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, limit)
  return (
    <ol className="relative space-y-3 border-l border-border pl-5">
      {sorted.map((e) => (
        <li key={e.id} className="relative">
          <span aria-hidden className={cx('absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-bg', KIND_DOT[e.kind] ?? 'bg-accent')} />
          <Link href={e.href} className="text-[0.9375rem] hover:text-accent">
            {e.label}
          </Link>
          <p className="text-[0.75rem] text-subtle">{relative(e.at, now)}</p>
        </li>
      ))}
    </ol>
  )
}

function relative(iso: string, now: number): string {
  const days = Math.floor((now - Date.parse(iso)) / 86_400_000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 14) return `${days} days ago`
  return formatDate(iso)
}

export function StatusLegend({ counts }: { counts: Partial<Record<Status, number>> }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {(Object.keys(STATUS_META) as Status[]).map((s) => (
        <li key={s} className="flex items-center gap-1.5">
          <StatusBadge status={s} size="xs" />
          <span className="text-[0.75rem] tabular-nums text-subtle">{counts[s] ?? 0}</span>
        </li>
      ))}
    </ul>
  )
}

/** Sends a weak readiness dimension to the module or page that fixes it. */
export function remedyFor(partId: string): string {
  const map: Record<string, string> = {
    worksheets: '/demo/practice',
    mocks: '/demo/interview',
    checkpoints: '/demo/progress/revision',
    behavioural: repo.href.module(repo.getModule('t7-2')!),
    capstone: repo.href.project('p9'),
    projects: '/demo/practice',
    'write-up': repo.href.module(repo.getModule('t9-2')!),
    'story-links': repo.href.module(repo.getModule('t7-1')!),
  }
  return map[partId] ?? '/demo/progress'
}
