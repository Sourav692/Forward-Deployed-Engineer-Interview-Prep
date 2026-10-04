/**
 * Presentational primitives for the prototype. No hooks and no `'use client'`, so they
 * render inside Server Components and client islands alike (React 19 lets a Server
 * Component pass these straight through; a client component can import them too).
 */
import Link from 'next/link'
import { Ring } from '@/components/Progress'
import type { ModuleFlag, Status } from '../types'

export const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ')

// ── Status ─────────────────────────────────────────────────────────────────

export const STATUS_META: Record<Status, { label: string; rule: string; className: string; icon: React.ReactNode }> = {
  'not-started': {
    label: 'Not started',
    rule: 'Nothing read, submitted or attempted yet.',
    className: 'border-border-strong text-muted bg-surface',
    icon: <circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="1.8" />,
  },
  'in-progress': {
    label: 'In progress',
    rule: 'At least one lesson read, exercise submitted or checkpoint attempted.',
    className: 'border-accent/40 text-accent bg-accent-soft',
    icon: (
      <>
        <circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 3a5 5 0 010 10z" fill="currentColor" />
      </>
    ),
  },
  blocked: {
    label: 'Blocked',
    rule: 'A prerequisite checkpoint is missing or failed. You can still open it (soft gating).',
    className: 'border-danger/40 text-danger bg-danger-soft',
    icon: <path d="M4.5 8h7M8 3a5 5 0 100 10A5 5 0 008 3z" fill="none" stroke="currentColor" strokeWidth="1.8" />,
  },
  'ready-for-review': {
    label: 'Ready for review',
    rule: 'Lessons read and the required exercise submitted; take the checkpoint to complete it.',
    className: 'border-review/40 text-review bg-review-soft',
    icon: <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="2 2" />,
  },
  completed: {
    label: 'Completed',
    rule: 'Lessons read, checkpoint at 70% or above, and the required exercise submitted.',
    className: 'border-success/40 text-success bg-success-soft',
    icon: <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  },
  'needs-revision': {
    label: 'Needs revision',
    rule: 'Confidence 2 or below, a failed checkpoint, or 14 / 30 / 60 days since the last pass.',
    className: 'border-warning/50 text-warning-text bg-warning-soft',
    icon: <path d="M13 8A5 5 0 113.5 5.5M3 2.5v3h3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
  },
  mastered: {
    label: 'Mastered',
    rule: 'Passed twice, at least 7 days apart, with confidence 4 or above.',
    className: 'border-mastered/40 text-mastered bg-mastered-soft',
    icon: <path d="M8 2l1.8 3.8 4.2.5-3.1 2.9.8 4.1L8 11.3l-3.7 2 .8-4.1L2 6.3l4.2-.5z" fill="currentColor" />,
  },
  skipped: {
    label: 'Skipped',
    rule: 'Skipped by your path or a “Test out” action. Counts as done but adds no readiness evidence.',
    className: 'border-dashed border-border-strong text-subtle bg-transparent',
    icon: <path d="M3 4l5 4-5 4zM9 4l5 4-5 4z" fill="currentColor" />,
  },
}

/** Badge with an accessible tooltip explaining the rule behind the status. */
export function StatusBadge({ status, size = 'sm' }: { status: Status; size?: 'sm' | 'xs' }) {
  const meta = STATUS_META[status]
  return (
    <span className="group relative inline-flex">
      <span
        tabIndex={0}
        aria-label={`${meta.label}: ${meta.rule}`}
        className={cx(
          'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border font-semibold',
          size === 'sm' ? 'px-2 py-0.5 text-[0.75rem]' : 'px-1.5 py-px text-[0.6875rem]',
          meta.className,
        )}
      >
        <svg viewBox="0 0 16 16" aria-hidden className="h-3 w-3">
          {meta.icon}
        </svg>
        {meta.label}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-1.5 hidden w-56 -translate-x-1/2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[0.75rem] font-normal leading-snug text-text shadow-[var(--shadow-lg)] group-focus-within:block group-hover:block"
      >
        {meta.rule}
      </span>
    </span>
  )
}

export function FlagBadge({ flag }: { flag: ModuleFlag }) {
  const cls =
    flag === 'required'
      ? 'bg-text text-bg'
      : flag === 'recommended'
        ? 'bg-accent-soft text-accent'
        : 'border border-border text-subtle'
  return (
    <span className={cx('rounded px-1.5 py-px text-[0.6875rem] font-semibold uppercase tracking-wide', cls)}>
      {flag}
    </span>
  )
}

export function Tag({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'accent' | 'danger' | 'success' }) {
  const cls = {
    neutral: 'bg-surface-2 text-muted',
    accent: 'bg-accent-soft text-accent',
    danger: 'bg-danger-soft text-danger',
    success: 'bg-success-soft text-success',
  }[tone]
  return <span className={cx('inline-flex items-center rounded-md px-1.5 py-0.5 text-[0.75rem] font-medium', cls)}>{children}</span>
}

// ── Progress ───────────────────────────────────────────────────────────────

export function ProgressBar({ value, label, tone = 'accent' }: { value: number; label: string; tone?: 'accent' | 'success' | 'warning' }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100)
  const bar = { accent: 'bg-accent', success: 'bg-success', warning: 'bg-warning' }[tone]
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
      <div className={cx('h-full rounded-full transition-[width] duration-500', bar)} style={{ width: `${pct}%` }} />
    </div>
  )
}

/** Wraps the live site's `Ring` with a centred percentage. */
export function ProgressRing({ value, size = 48, label }: { value: number; size?: number; label: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100)
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" role="img" aria-label={`${label}: ${pct}%`}>
      <Ring percent={pct} size={size} />
      <span className="absolute text-[0.6875rem] font-semibold tabular-nums">{pct}%</span>
    </span>
  )
}

// ── Layout ─────────────────────────────────────────────────────────────────

export function SampleContentBadge({ className }: { className?: string }) {
  return (
    <span
      className={cx('inline-flex items-center gap-1 rounded-full border border-warning/50 bg-warning-soft px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-warning-text', className)}
      title="Everything in this prototype is sample content, not final curriculum."
    >
      Sample content
    </span>
  )
}

export interface Crumb {
  label: string
  href?: string
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 text-[0.8125rem] text-subtle">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-1.5">
            {i > 0 && <span aria-hidden>›</span>}
            {c.href && i < items.length - 1 ? (
              <Link href={c.href} className="truncate hover:text-text hover:underline">
                {c.label}
              </Link>
            ) : (
              <span aria-current={i === items.length - 1 ? 'page' : undefined} className="truncate text-muted">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <header className="mb-8">
      <div className="flex flex-wrap items-center gap-2 text-[0.8125rem] font-semibold text-accent">
        {eyebrow}
        <SampleContentBadge />
      </div>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-3xl">
          <h1 className="text-[1.75rem] font-bold leading-tight tracking-[-0.022em] sm:text-[2rem]">{title}</h1>
          {description && <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </header>
  )
}

export function Card({ children, className, as: As = 'div' }: { children: React.ReactNode; className?: string; as?: 'div' | 'section' | 'article' | 'li' }) {
  return <As className={cx('rounded-xl border border-border bg-surface p-4 sm:p-5', className)}>{children}</As>
}

export function H2({ children, id, action }: { children: React.ReactNode; id?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 mt-10 flex items-baseline justify-between gap-3">
      <h2 id={id} className="text-[1.125rem] font-semibold tracking-[-0.011em]">
        {children}
      </h2>
      {action}
    </div>
  )
}

export function StatCard({ label, value, hint }: { label: string; value: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <Card>
      <div className="text-[0.75rem] font-medium uppercase tracking-wide text-subtle">{label}</div>
      <div className="mt-1 text-[1.5rem] font-bold tabular-nums">{value}</div>
      {hint && <div className="mt-0.5 text-[0.8125rem] text-muted">{hint}</div>}
    </Card>
  )
}

export function Dl({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {items.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-[0.75rem] font-semibold uppercase tracking-wide text-subtle">{k}</dt>
          <dd className="mt-0.5 text-[0.9375rem] leading-relaxed">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

// ── Buttons and links ──────────────────────────────────────────────────────

export const btn = {
  primary:
    'inline-flex items-center justify-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-[0.875rem] font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50 dark:text-bg',
  secondary:
    'inline-flex items-center justify-center gap-1.5 rounded-md border border-border-strong bg-surface px-3.5 py-2 text-[0.875rem] font-semibold transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50',
  ghost:
    'inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-[0.875rem] text-muted transition-colors hover:bg-surface-2 hover:text-text',
  danger:
    'inline-flex items-center justify-center gap-1.5 rounded-md bg-danger px-3.5 py-2 text-[0.875rem] font-semibold text-white transition-colors hover:opacity-90 dark:text-bg',
}

// ── States ─────────────────────────────────────────────────────────────────

export function EmptyState({ title, body, action }: { title: string; body: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border-strong px-5 py-8 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-[0.875rem] text-muted">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorState({ title, body, action }: { title: string; body: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div role="alert" className="rounded-xl border border-danger/40 bg-danger-soft px-4 py-3 text-[0.875rem]">
      <p className="font-semibold text-danger">{title}</p>
      <div className="mt-0.5 text-text">{body}</div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cx('animate-pulse rounded-md bg-surface-2', className)} />
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-4 w-1/3" />
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cx('mt-3 h-3', i % 2 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}

export function Callout({ tone = 'warning', title, children }: { tone?: 'warning' | 'info' | 'danger'; title: string; children: React.ReactNode }) {
  const cls = {
    warning: 'border-warning/50 bg-warning-soft',
    info: 'border-accent/30 bg-accent-soft',
    danger: 'border-danger/40 bg-danger-soft',
  }[tone]
  return (
    <aside className={cx('rounded-lg border-l-4 px-4 py-3 text-[0.9375rem] leading-relaxed', cls)}>
      <p className="font-semibold">{title}</p>
      <div className="mt-0.5">{children}</div>
    </aside>
  )
}

export const formatMinutes = (min: number) =>
  min < 60 ? `${min} min` : `${Math.round((min / 60) * 10) / 10} h`

export const formatDate = (ms: number | string) =>
  new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
