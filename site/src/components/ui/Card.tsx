import type { ReactNode } from 'react'
import { cx } from './cx'

export function Card({ children, className, as: As = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'article' | 'li' }) {
  return <As className={cx('rounded-xl border border-border bg-surface p-4 sm:p-5', className)}>{children}</As>
}

export type TagTone = 'neutral' | 'accent' | 'danger' | 'success'

export function Tag({ children, tone = 'neutral' }: { children: ReactNode; tone?: TagTone }) {
  const cls: Record<TagTone, string> = {
    neutral: 'bg-surface-2 text-muted',
    accent: 'bg-accent-soft text-accent',
    danger: 'bg-danger-soft text-danger',
    success: 'bg-success-soft text-text',
  }
  return <span className={cx('inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium', cls[tone])}>{children}</span>
}

export type CalloutTone = 'warning' | 'info' | 'danger'

export function Callout({ tone = 'warning', title, children }: { tone?: CalloutTone; title: string; children: ReactNode }) {
  const cls: Record<CalloutTone, string> = {
    warning: 'border-warning/50 bg-warning-soft',
    info: 'border-accent/30 bg-accent-soft',
    danger: 'border-danger/40 bg-danger-soft',
  }
  return (
    <aside className={cx('rounded-lg border-l-4 px-4 py-3 text-[0.9375rem] leading-relaxed', cls[tone])}>
      <p className="font-semibold">{title}</p>
      <div className="mt-0.5">{children}</div>
    </aside>
  )
}
