'use client'

/**
 * Small progress islands used across the Learn pages. Each one renders a neutral
 * placeholder on the server and during hydration (the store is unknown there), then
 * the stored value straight after. See `useProgress.ts` for why.
 */
import { useState } from 'react'
import { markLessonRead, markLessonUnread, trackProgress } from '@/lib/progress/store'
import { useProgress, useStorageAvailable } from '@/lib/progress/useProgress'
import { ProgressBar, Skeleton, StatusBadge, cx, focusRing, toast } from '@/components/ui'
import { firstUnmetPrerequisite, isRead, learnerStatus, lessonHome, readingProgress, type ModuleInput } from './progress-model'
import { COPY } from './copy'

/** Learner status for a module, or its gap label when it has nothing to read. */
export function ModuleStatusBadge({ input, size = 'sm' }: { input: ModuleInput; size?: 'sm' | 'xs' }) {
  const gap = input.status === 'coming-soon' || input.status === 'on-hold'
  const view = useProgress(() => {
    if (gap) return null
    const status = learnerStatus(input)
    return { status, prerequisite: status === 'blocked' ? firstUnmetPrerequisite(input.prereqs) : undefined }
  })
  if (gap) return <StatusBadge status={input.status as 'coming-soon' | 'on-hold'} size={size} />
  if (!view) return <Skeleton className={cx('inline-block rounded-full', size === 'sm' ? 'h-6 w-24' : 'h-5 w-20')} />
  return <StatusBadge status={view.status} prerequisite={view.prerequisite} size={size} />
}

/** Bar plus "2 of 5 read" for a module's main reading list. */
export function ModuleProgress({ input, compact = false }: { input: ModuleInput; compact?: boolean }) {
  const p = useProgress(() => readingProgress(input))
  if (input.reading.length === 0) return null
  const label = p ? `${p.lessonsRead} of ${p.lessonsTotal} read` : `${input.reading.length} lessons`
  return (
    <div className={cx('flex items-center gap-3', compact ? 'min-w-28' : 'w-full')}>
      <div className="min-w-16 flex-1">
        <ProgressBar value={p ? p.fraction : 0} label="Module progress" />
      </div>
      <span className="shrink-0 text-xs tabular-nums text-muted">{label}</span>
    </div>
  )
}

/** Track progress for the /learn cards: modules weighted by minutes. */
export function TrackProgress({ trackSlug, minutes }: { trackSlug: string; minutes: Record<string, number> }) {
  const p = useProgress(() => trackProgress(trackSlug, minutes))
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <ProgressBar value={p ? p.fraction : 0} label="Track progress" />
      </div>
      <span className="shrink-0 text-xs tabular-nums text-muted">
        {p ? `${Math.round(p.fraction * 100)}%` : '0%'}
      </span>
    </div>
  )
}

/**
 * Read state for one row of a module's reading list. Synced lessons show a tick once
 * read (they are marked from the lesson page). Live lessons open another page, so the
 * row carries its own Mark read toggle.
 */
export function LessonReadMark({ lessonSlug, title, toggle }: { lessonSlug: string; title: string; toggle: boolean }) {
  const read = useProgress(() => isRead(lessonSlug))
  const storage = useStorageAvailable()
  if (!toggle) {
    return read ? (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted">
        <Tick className="text-success" />
        Read
      </span>
    ) : null
  }
  const flip = () => {
    const home = lessonHome(lessonSlug)
    if (read) {
      markLessonUnread(home, lessonSlug)
    } else if (markLessonRead(home, lessonSlug)) {
      toast(COPY.toastRead)
    }
  }
  return (
    <button
      type="button"
      onClick={flip}
      disabled={read === null || storage === false}
      aria-pressed={!!read}
      aria-label={`${read ? 'Mark unread' : 'Mark read'}: ${title}`}
      className={cx(
        'inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50',
        read ? 'border-success/50 text-text' : 'border-border-strong text-muted hover:bg-surface-2 hover:text-text',
        focusRing,
      )}
    >
      {read && <Tick className="text-success" />}
      {read ? 'Read' : 'Mark read'}
    </button>
  )
}

/** "Progress won't be saved in this browser." Renders nothing while storage works. */
export function StorageNotice() {
  const available = useStorageAvailable()
  const [hidden, setHidden] = useState(false)
  if (available !== false || hidden) return null
  return (
    <div role="status" className="mb-6 flex items-start gap-3 rounded-lg border border-warning/50 bg-warning-soft px-4 py-3 text-sm text-warning-text">
      <p className="flex-1">
        <span className="font-semibold">{COPY.storageBlockedTitle}</span> {COPY.storageBlockedBody}
      </p>
      <button type="button" onClick={() => setHidden(true)} className={cx('rounded-md px-1.5 text-sm font-semibold underline', focusRing)}>
        Dismiss
      </button>
    </div>
  )
}

export function Tick({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" className={cx('size-4 shrink-0', className)}>
      <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
