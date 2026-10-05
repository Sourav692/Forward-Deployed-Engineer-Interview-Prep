'use client'

/**
 * Lesson actions (FE-09): Mark read / Mark unread, bookmark, and the learner's notes
 * on the module. A client island inside an otherwise static lesson page. Every write
 * goes through `lib/progress/store`, which survives blocked storage (the buttons
 * disable and `StorageNotice` explains why).
 */
import { useId } from 'react'
import { isBookmarked, isLessonRead, getModuleRecord, markLessonRead, markLessonUnread, setNotes, toggleBookmark } from '@/lib/progress/store'
import { useProgress, useStorageAvailable } from '@/lib/progress/useProgress'
import { Button, Textarea, toast } from '@/components/ui'
import { COPY } from './copy'
import { Tick } from './ProgressIslands'

export function LessonActions({
  moduleSlug,
  lessonSlug,
  title,
  href,
}: {
  /** The lesson's home module: read state is stored under it. */
  moduleSlug: string
  lessonSlug: string
  title: string
  href: string
}) {
  const read = useProgress(() => isLessonRead(moduleSlug, lessonSlug))
  const marked = useProgress(() => isBookmarked('lesson', `${moduleSlug}/${lessonSlug}`))
  const storage = useStorageAvailable()
  const disabled = read === null || storage === false

  const toggleRead = () => {
    if (read) {
      markLessonUnread(moduleSlug, lessonSlug)
      return
    }
    if (markLessonRead(moduleSlug, lessonSlug)) toast(COPY.toastRead)
    else toast(COPY.saveFailed, 'error')
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant={read ? 'secondary' : 'primary'} onClick={toggleRead} disabled={disabled} aria-pressed={!!read}>
        {read && <Tick className="text-success" />}
        {read ? COPY.markUnread : COPY.markRead}
      </Button>
      <Button
        variant="ghost"
        onClick={() => toggleBookmark({ kind: 'lesson', itemId: `${moduleSlug}/${lessonSlug}`, label: title, href })}
        disabled={disabled}
        aria-pressed={!!marked}
      >
        <BookmarkIcon filled={!!marked} />
        {marked ? COPY.bookmarked : COPY.bookmark}
      </Button>
    </div>
  )
}

/** The learner's free-text notes on a module, saved when the box loses focus. */
export function ModuleNotes({ moduleSlug }: { moduleSlug: string }) {
  const id = useId()
  const notes = useProgress(() => getModuleRecord(moduleSlug).notes)
  const storage = useStorageAvailable()
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {COPY.notesLabel}
      </label>
      <p id={`${id}-hint`} className="mt-0.5 text-xs text-muted">
        {COPY.notesHint}
      </p>
      <Textarea
        // Remount once the stored value is known, so the uncontrolled box starts from it.
        key={notes === null ? 'loading' : 'ready'}
        id={id}
        aria-describedby={`${id}-hint`}
        rows={4}
        className="mt-2"
        defaultValue={notes ?? ''}
        disabled={notes === null || storage === false}
        onBlur={(e) => {
          if (e.target.value === (notes ?? '')) return
          if (setNotes(moduleSlug, e.target.value)) toast(COPY.notesSaved)
          else toast(COPY.saveFailed, 'error')
        }}
      />
    </div>
  )
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" className="size-4">
      <path
        d="M4.5 2.5h7v11L8 11l-3.5 2.5z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
