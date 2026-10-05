/**
 * Demo-only presentational pieces (page header, breadcrumbs, flags, formatters). No hooks and no `'use client'`, so they
 * render inside Server Components and client islands alike (React 19 lets a Server
 * Component pass these straight through; a client component can import them too).
 */
import Link from 'next/link'
import { Card, cx } from '@/components/ui'
import type { ModuleFlag } from '../types'

// The reusable primitives moved to `@/components/ui` (FE-05, DS-03). These re-exports
// keep the demo's existing imports working; new code imports from `@/components/ui`.
export {
  btn,
  Callout,
  Card,
  cx,
  EmptyState,
  ErrorState,
  ProgressBar,
  ProgressRing,
  Skeleton,
  SkeletonCard,
  STATUS_META,
  StatusBadge,
  Tag,
} from '@/components/ui'

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
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
      {items.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-[0.75rem] font-semibold uppercase tracking-wide text-subtle">{k}</dt>
          <dd className="mt-0.5 text-[0.9375rem] leading-relaxed">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export const formatMinutes = (min: number) =>
  min < 60 ? `${min} min` : `${Math.round((min / 60) * 10) / 10} h`

export const formatDate = (ms: number | string) =>
  new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
