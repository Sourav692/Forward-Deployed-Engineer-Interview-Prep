'use client'

import * as repo from '../repo'
import { update, useDemo } from '../store/useDemo'
import { toast } from './feedback'
import { btn, cx } from './ui'

/** Mark a lesson complete (or not). Reading counts toward progress, never readiness. */
export function MarkCompleteButton({ lessonId }: { lessonId: string }) {
  const { state } = useDemo()
  const l = repo.getLesson(lessonId)!
  const m = repo.getModule(l.moduleId)!
  const done = Boolean(state?.lessonsRead[lessonId])
  const toggle = () => {
    update(
      (s) => {
        if (done) delete s.lessonsRead[lessonId]
        else s.lessonsRead[lessonId] = new Date().toISOString()
        s.timeSpent[m.trackId] = (s.timeSpent[m.trackId] ?? 0) + (done ? 0 : l.readingMin)
      },
      done ? undefined : { kind: 'lesson-read', itemId: lessonId, label: `Read “${l.title}” (${m.code})`, href: repo.href.lesson(l) },
    )
    if (!done) toast('Lesson marked complete. Module progress updated.')
  }
  return (
    <button type="button" onClick={toggle} disabled={!state} aria-pressed={done} className={cx(done ? btn.secondary : btn.primary, done && 'border-success text-success')}>
      {done ? '✓ Completed' : 'Mark complete'}
    </button>
  )
}
