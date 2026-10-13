'use client'

/**
 * StatusBadge (DS-03). One colour, one icon and a visible text label per status, so
 * no status relies on colour alone. Mapping: .website_spec/2026-10-05-design-tokens.md.
 *
 * The optional rule tooltip is not hover-only: the badge becomes focusable, the
 * tooltip shows on hover and on keyboard focus, Escape hides it, and its text is
 * wired to the badge through `aria-describedby` so screen readers read it too.
 */
import { useId, useState, type ReactNode } from 'react'
import type { ModuleStatus } from '@/lib/curriculum-types'
import { cx, focusRing } from './cx'

/** The eight learner statuses for a module, track or project. */
export type LearnerStatus =
  | 'not-started'
  | 'in-progress'
  | 'blocked'
  | 'ready-for-review'
  | 'completed'
  | 'needs-revision'
  | 'mastered'
  | 'skipped'

/** Module availability labels that show a gap instead of progress. */
export type GapStatus = Extract<ModuleStatus, 'coming-soon' | 'on-hold'>

export type BadgeStatus = LearnerStatus | GapStatus

export interface StatusMeta {
  label: string
  /** Plain-English rule for when this status applies; used as the tooltip text. */
  rule: string
  /** Pill border, fill and label colour. Label text meets 4.5:1 on its fill. */
  className: string
  /** Icon colour (3:1 minimum against the fill). */
  iconClassName: string
  icon: ReactNode
}

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const LEARNER_STATUSES: readonly LearnerStatus[] = [
  'not-started',
  'in-progress',
  'blocked',
  'ready-for-review',
  'completed',
  'needs-revision',
  'mastered',
  'skipped',
]

export const GAP_STATUSES: readonly GapStatus[] = ['coming-soon', 'on-hold']

export const STATUS_META: Record<BadgeStatus, StatusMeta> = {
  'not-started': {
    label: 'Not started',
    rule: 'Nothing read, submitted or attempted yet.',
    className: 'border-border-strong bg-surface text-muted',
    iconClassName: 'text-subtle',
    // Hollow circle
    icon: <circle cx="8" cy="8" r="5.25" {...stroke} />,
  },
  'in-progress': {
    label: 'In progress',
    rule: 'At least one lesson read, exercise submitted or checkpoint attempted.',
    className: 'border-accent/40 bg-accent-soft text-accent',
    iconClassName: 'text-accent',
    // Half circle
    icon: (
      <>
        <circle cx="8" cy="8" r="5.25" {...stroke} />
        <path d="M8 2.75a5.25 5.25 0 010 10.5z" fill="currentColor" />
      </>
    ),
  },
  blocked: {
    // A suggestion, not a lock (audit check FV-01): the module always opens.
    label: 'Suggested: read the prerequisites first',
    rule: 'An earlier module this one builds on is not complete yet. You can still open it.',
    className: 'border-warning/60 bg-warning-soft text-warning-text',
    iconClassName: 'text-warning-text',
    // Info
    icon: (
      <>
        <circle cx="8" cy="8" r="5.25" {...stroke} />
        <path d="M8 7.5v3M8 5.25v.01" {...stroke} />
      </>
    ),
  },
  'ready-for-review': {
    label: 'Ready for review',
    rule: 'Lessons read and the required exercise submitted; take the checkpoint to complete it.',
    className: 'border-accent/50 bg-surface text-accent',
    iconClassName: 'text-accent',
    // Flag
    icon: <path d="M4 14V2.5M4 3h7.5l-1.75 2.75L11.5 8.5H4" {...stroke} />,
  },
  completed: {
    label: 'Completed',
    rule: 'Lessons read, checkpoint at 70% or above, and the required exercise submitted.',
    // --success on --success-soft is 3.89:1 in light mode: fine for the icon, too low for 12px text.
    className: 'border-success/50 bg-success-soft text-text',
    iconClassName: 'text-success',
    // Check
    icon: <path d="M3 8.5l3 3 7-7" {...stroke} strokeWidth={2} />,
  },
  'needs-revision': {
    label: 'Needs revision',
    rule: 'Confidence 2 or below, a failed checkpoint, or 14 / 30 / 60 days since the last pass.',
    className: 'border-review/40 bg-review-soft text-review',
    iconClassName: 'text-review',
    // Rotate arrow
    icon: <path d="M13 8A5 5 0 113.5 5.5M3 2.5v3h3" {...stroke} />,
  },
  mastered: {
    label: 'Mastered',
    rule: 'Passed twice, at least 7 days apart, with confidence 4 or above.',
    className: 'border-mastered/40 bg-mastered-soft text-mastered',
    iconClassName: 'text-mastered',
    // Star
    icon: <path d="M8 2l1.8 3.8 4.2.5-3.1 2.9.8 4.1L8 11.3l-3.7 2 .8-4.1L2 6.3l4.2-.5z" fill="currentColor" />,
  },
  skipped: {
    label: 'Skipped',
    rule: 'Skipped by your path or a “Test out” action. Counts as done but adds no readiness evidence.',
    className: 'border-dashed border-border-strong bg-transparent text-muted',
    iconClassName: 'text-subtle',
    // Skip arrow
    icon: <path d="M3 4l5 4-5 4zM9 4l5 4-5 4z" fill="currentColor" />,
  },
  'coming-soon': {
    label: 'Coming soon',
    rule: 'No material exists for this module yet.',
    className: 'border-border-strong bg-transparent text-muted',
    iconClassName: 'text-subtle',
    // Clock
    icon: (
      <>
        <circle cx="8" cy="8" r="5.25" {...stroke} />
        <path d="M8 5v3.25l2 1.25" {...stroke} />
      </>
    ),
  },
  'on-hold': {
    label: 'On hold',
    rule: 'Paused by the owner. The module page explains why.',
    className: 'border-warning bg-transparent text-warning-text',
    iconClassName: 'text-warning-text',
    // Pause
    icon: (
      <>
        <circle cx="8" cy="8" r="5.25" {...stroke} />
        <path d="M6.75 6v4M9.25 6v4" {...stroke} />
      </>
    ),
  },
}

export interface StatusBadgeProps {
  status: BadgeStatus
  /** `sm` for headers and cards, `xs` for dense lists. */
  size?: 'sm' | 'xs'
  /**
   * Rule tooltip. `true` (default) uses the standard rule for the status, a string
   * overrides it, `false` renders a plain, non-focusable badge.
   */
  tooltip?: boolean | string
  /** Title of the first unmet prerequisite; names it in the `blocked` label. */
  prerequisite?: string
  className?: string
}

export function StatusBadge({ status, size = 'sm', tooltip = true, prerequisite, className }: StatusBadgeProps) {
  const meta = STATUS_META[status]
  const label = status === 'blocked' && prerequisite ? `Suggested: read ${prerequisite} first` : meta.label
  const tipId = useId()
  const [dismissed, setDismissed] = useState(false)
  const tipText = tooltip === false ? null : typeof tooltip === 'string' ? tooltip : meta.rule

  const pill = cx(
    'inline-flex items-center gap-1 border text-xs font-semibold',
    // Long suggestion labels shrink and wrap instead of squeezing the row's title.
    status === 'blocked' ? 'min-w-0 rounded-lg text-left' : 'shrink-0 rounded-full whitespace-nowrap',
    size === 'sm' ? 'px-2 py-0.5' : 'px-1.5 py-px',
    meta.className,
    className,
  )
  const icon = (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false" className={cx('size-4 shrink-0', meta.iconClassName)}>
      {meta.icon}
    </svg>
  )

  if (!tipText) {
    return (
      <span className={pill}>
        {icon}
        {label}
      </span>
    )
  }

  return (
    <span className="group relative inline-flex" onMouseLeave={() => setDismissed(false)}>
      <span
        tabIndex={0}
        aria-describedby={tipId}
        onBlur={() => setDismissed(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setDismissed(true)
        }}
        className={cx(pill, 'cursor-help', focusRing)}
      >
        {icon}
        {label}
      </span>
      <span
        id={tipId}
        role="tooltip"
        className={cx(
          'absolute bottom-full left-1/2 z-40 mb-1.5 hidden w-56 -translate-x-1/2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-normal text-text shadow-[var(--shadow-lg)]',
          !dismissed && 'group-focus-within:block group-hover:block',
        )}
      >
        {tipText}
      </span>
    </span>
  )
}
