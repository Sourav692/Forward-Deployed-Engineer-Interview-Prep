import Link from 'next/link'
import type { CurriculumModule, CurriculumTrack } from '@/lib/curriculum-types'
import { learnHref, trackLabel, type LearnLesson } from '@/lib/learn'
import type { ReadingDocument } from '@/lib/reading'
import { cx, focusRing } from '@/components/ui'
import { LessonToc, type TocHeading } from './LessonToc'
import { moduleTag } from '@/lib/curriculum-href'

/**
 * Lesson-page sidebar: the module's lessons in order, with the current lesson
 * expanded into its own headings ("On this page"). Track and module pages keep the
 * track tree (`SideNav`); on a lesson the reader needs where they are inside the
 * lesson and what comes next in the module, so the track sits behind one back link.
 *
 * From 1024 px it is a sticky sidebar; below that the same content sits in a native
 * `<details>` drawer, closed by default so the lesson text comes first.
 */
export function LessonSideNav({
  track,
  module: mod,
  lessons,
  current,
  doc,
}: {
  track: CurriculumTrack
  module: CurriculumModule
  lessons: LearnLesson[]
  current: string
  doc: ReadingDocument
}) {
  const headings: TocHeading[] = doc.sections
    .filter((s): s is typeof s & { title: string } => !!s.title)
    .map((s) => ({ id: s.id, html: s.title }))
  // A grouped module (the final week's days) heads each group's first lesson with its title
  // and drops the running number, which would clash with the review numbers.
  const groupAt = new Map((mod.groups ?? []).map((g) => [g.lessons[0], g.title]))

  const body = (
    <nav aria-label={`${mod.title}: lessons and contents`} className="text-[0.8125rem]">
      <Link
        href={learnHref.track(track.slug)}
        className={cx('inline-flex rounded-sm px-2 py-1 text-xs text-muted hover:text-accent', focusRing)}
      >
        <span aria-hidden="true">←&nbsp;</span>
        {trackLabel(track)}
      </Link>
      <Link
        href={learnHref.module(mod)}
        className={cx('mt-1 flex items-start gap-2 rounded-md px-2 py-1 font-semibold hover:text-accent', focusRing)}
      >
        {moduleTag(mod) && <span className="w-9 shrink-0 tabular-nums text-subtle">{moduleTag(mod)}</span>}
        <span className="min-w-0 flex-1">{mod.title}</span>
      </Link>

      <div className="mt-3 px-2 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle">Lessons</div>
      <ol className="mt-1 space-y-0.5">
        {lessons.map((l, i) => {
          const isCurrent = l.slug === current
          return (
            <li key={l.slug}>
              {groupAt.has(l.slug) && <span className="mb-1 mt-3 block px-2 text-xs font-medium text-subtle">{groupAt.get(l.slug)}</span>}
              <Link
                href={l.href}
                aria-current={isCurrent ? 'page' : undefined}
                className={cx(
                  'flex items-start gap-2 rounded-md px-2 py-1.5',
                  isCurrent ? 'bg-accent-soft font-semibold text-accent' : 'text-text hover:bg-surface-2',
                  focusRing,
                )}
              >
                {!mod.groups && <span className={cx('w-5 shrink-0 tabular-nums', isCurrent ? 'text-accent' : 'text-subtle')}>{i + 1}</span>}
                <span className="min-w-0 flex-1">{l.title}</span>
              </Link>
              {isCurrent && headings.length > 0 && (
                <div className="mb-2 ml-7 mt-1">
                  <span className="sr-only">On this page</span>
                  <LessonToc headings={headings} />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )

  return (
    <>
      <details className="no-print mb-6 rounded-lg border border-border bg-surface lg:hidden">
        <summary className={cx('cursor-pointer rounded-lg px-4 py-3 text-sm font-semibold', focusRing)}>
          Lessons and contents
        </summary>
        <div className="border-t border-border p-3">{body}</div>
      </details>
      <aside className="no-print sticky top-20 hidden max-h-[calc(100vh-6rem)] overflow-y-auto pb-6 pr-2 lg:block">{body}</aside>
    </>
  )
}
