import Link from 'next/link'
import type { CurriculumTrack } from '@/lib/curriculum-types'
import { getModuleBySlug, learnHref } from '@/lib/learn'
import { cx, focusRing } from '@/components/ui'

/**
 * SideNav tree (FE-03): the track's sections and modules, as nested lists.
 *
 * From 1024 px it is a sticky sidebar. Below that the same tree sits in a native
 * `<details>` drawer, which is keyboard-operable and needs no JavaScript. The current
 * module carries `aria-current="page"` (or `"location"` on its lesson pages, where
 * the module is an ancestor of the page rather than the page itself).
 */
export function SideNav({
  track,
  currentModule,
  onLesson = false,
}: {
  track: CurriculumTrack
  currentModule?: string
  onLesson?: boolean
}) {
  const tree = (
    <nav aria-label={`${track.code} ${track.title}: sections and modules`} className="text-[0.8125rem]">
      <Link
        href={learnHref.track(track.slug)}
        aria-current={!currentModule ? 'page' : undefined}
        className={cx('block rounded-md px-2 py-1 font-semibold hover:text-accent', focusRing)}
      >
        {track.code} {track.title}
      </Link>
      <ul className="mt-2 space-y-3">
        {track.sections.map((s) => (
          <li key={s.slug}>
            <span className="block px-2 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle">{s.title}</span>
            <ul className="mt-1 space-y-0.5">
              {s.modules.map((slug) => {
                const m = getModuleBySlug(slug)
                if (!m) return null
                const current = slug === currentModule
                const gap = m.status === 'coming-soon' ? 'Coming soon' : m.status === 'on-hold' ? 'On hold' : null
                return (
                  <li key={slug}>
                    <Link
                      href={learnHref.module(m)}
                      aria-current={current ? (onLesson ? 'location' : 'page') : undefined}
                      className={cx(
                        'flex items-start gap-2 rounded-md px-2 py-1.5',
                        current ? 'bg-accent-soft font-semibold text-accent' : 'text-text hover:bg-surface-2',
                        focusRing,
                      )}
                    >
                      <span className={cx('w-9 shrink-0 tabular-nums', current ? 'text-accent' : 'text-subtle')}>{m.code}</span>
                      <span className="min-w-0 flex-1">
                        {m.title}
                        {gap && <span className="block text-xs font-normal text-muted">{gap}</span>}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  )

  return (
    <>
      <details className="no-print mb-6 rounded-lg border border-border bg-surface lg:hidden">
        <summary className={cx('cursor-pointer rounded-lg px-4 py-3 text-sm font-semibold', focusRing)}>
          {track.code} sections and modules
        </summary>
        <div className="border-t border-border p-3">{tree}</div>
      </details>
      <aside className="no-print sticky top-20 hidden max-h-[calc(100vh-6rem)] overflow-y-auto pb-6 pr-2 lg:block">{tree}</aside>
    </>
  )
}
