import Link from 'next/link'
import { formatMinutes, type LearnLesson } from '@/lib/learn'
import { cx, focusRing } from '@/components/ui'
import { COPY } from './copy'
import { LessonReadMark } from './ProgressIslands'

/**
 * A module's reading list. Synced lessons open their /learn page; live lessons open
 * the existing practice or case-study page and say so, and carry their own Mark read
 * toggle because that page has no Learn actions.
 */
export function ReadingList({ lessons, numbered = true }: { lessons: LearnLesson[]; numbered?: boolean }) {
  const List = numbered ? 'ol' : 'ul'
  return (
    <List className="divide-y divide-border rounded-lg border border-border bg-surface">
      {lessons.map((l, i) => {
        const live = l.kind === 'live'
        return (
          <li key={l.slug} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex min-w-0 flex-1 items-baseline gap-3">
              {numbered && <span className="w-5 shrink-0 text-right text-xs tabular-nums text-subtle">{i + 1}</span>}
              <div className="min-w-0">
                <Link href={l.href} className={cx('rounded-sm text-sm font-semibold hover:text-accent hover:underline', focusRing)}>
                  {l.title}
                </Link>
                <p className="mt-0.5 text-xs text-muted">
                  {l.estMinutes ? `${formatMinutes(l.estMinutes)}` : null}
                  {l.estMinutes && live ? ' · ' : null}
                  {live && <span>{COPY.liveLessonHint(l.href)}</span>}
                  {l.publish === 'credited' && ' · Credited source'}
                </p>
              </div>
            </div>
            <div className={cx('shrink-0', numbered && 'pl-8 sm:pl-0')}>
              <LessonReadMark lessonSlug={l.slug} title={l.title} toggle={live} />
            </div>
          </li>
        )
      })}
    </List>
  )
}
