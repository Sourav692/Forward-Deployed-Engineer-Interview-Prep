import { Ring } from '@/components/Progress'
import { cx } from './cx'

export type ProgressTone = 'accent' | 'success' | 'warning'

const clampPct = (value: number) => Math.round(Math.max(0, Math.min(1, value)) * 100)

/**
 * Horizontal progress bar. `value` is 0–1. Pass `value={null}` for an indeterminate
 * bar (no `aria-valuenow`, so screen readers announce "busy" rather than a number).
 */
export function ProgressBar({ value, label, tone = 'accent' }: { value: number | null; label: string; tone?: ProgressTone }) {
  const bar: Record<ProgressTone, string> = { accent: 'bg-accent', success: 'bg-success', warning: 'bg-warning' }
  if (value === null) {
    return (
      <div role="progressbar" aria-label={label} aria-busy="true" className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div className={cx('h-full w-1/3 animate-pulse rounded-full motion-reduce:animate-none', bar[tone])} />
      </div>
    )
  }
  const pct = clampPct(value)
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
      <div className={cx('h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none', bar[tone])} style={{ width: `${pct}%` }} />
    </div>
  )
}

/** Wraps the live site's `Ring` with a centred percentage. `value` is 0–1. */
export function ProgressRing({ value, size = 48, label }: { value: number; size?: number; label: string }) {
  const pct = clampPct(value)
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" role="img" aria-label={`${label}: ${pct}%`}>
      <Ring percent={pct} size={size} />
      <span className="absolute text-[0.6875rem] font-semibold tabular-nums">{pct}%</span>
    </span>
  )
}
