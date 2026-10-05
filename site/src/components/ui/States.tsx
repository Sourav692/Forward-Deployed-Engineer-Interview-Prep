import type { ReactNode } from 'react'
import { cx } from './cx'

export function EmptyState({ title, body, action }: { title: string; body: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border-strong px-5 py-8 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorState({ title, body, action }: { title: string; body: ReactNode; action?: ReactNode }) {
  return (
    <div role="alert" className="rounded-xl border border-danger/40 bg-danger-soft px-4 py-3 text-sm">
      <p className="font-semibold text-danger">{title}</p>
      <div className="mt-0.5 text-text">{body}</div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cx('animate-pulse rounded-md bg-surface-2 motion-reduce:animate-none', className)} />
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
