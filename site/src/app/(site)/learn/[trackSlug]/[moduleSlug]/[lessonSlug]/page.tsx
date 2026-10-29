import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { breadcrumbJsonLd, learningResourceJsonLd, pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { capitalise, getLessonPage, learnHref, lessonParams, moduleInput, trackModules, trackTrail } from '@/lib/learn'
import { Breadcrumbs } from '@/components/learn/Breadcrumbs'
import { LessonActions } from '@/components/learn/LessonActions'
import { LessonReader } from '@/components/learn/LessonReader'
import { ModuleProgress, ModuleStatusBadge, StorageNotice } from '@/components/learn/ProgressIslands'
import { LessonSideNav } from '@/components/learn/LessonSideNav'
import { ReviewLinks } from '@/components/learn/ReviewLinks'
import { lessonTwins } from '@/lib/twins'
import { MockScorer } from '@/components/progress/MockScorer'
import { MockTimer } from '@/components/progress/MockTimer'
import { MOCK_MINUTES, MOCK_MODULE, mockRoundsFor } from '@/components/progress/mock-rubric'
import { cx, focusRing } from '@/components/ui'
import { lessonExplorer } from '@/lib/explorers/load'
import { LISTED_ELSEWHERE, isLearnTrack } from '@/lib/curriculum-href'

/** Layout preview: option 1 widens and centres the column; option 2 also sets the body in Inter. */
const LAYOUT_PREVIEW: Record<string, 'wide' | 'wide-sans'> = {
  'logs-metrics-and-traces': 'wide',
  'the-run-trace': 'wide-sans',
}

/**
 * Lesson page (FE-07). One static page per synced, published lesson: the params come
 * from the sync manifest, and `dynamicParams = false` turns any other URL into a 404.
 * `lessonParams()` throws when a manifest entry has no markdown file, so a missing
 * lesson fails the build instead of shipping an empty page.
 */

type Params = { trackSlug: string; moduleSlug: string; lessonSlug: string }

export const dynamicParams = false

export function generateStaticParams(): Params[] {
  return lessonParams()
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { trackSlug, moduleSlug, lessonSlug } = await params
  const page = getLessonPage(trackSlug, moduleSlug, lessonSlug)
  if (!page) return {}
  // The root layout's template appends "· Forward Deployed".
  return pageMetadata({
    path: page.lesson.href,
    title: `${page.lesson.title} · ${page.module.title}`,
    ogTitle: page.lesson.title,
    description: capitalise(page.module.objective),
    type: 'article',
  })
}

export default async function LessonPage({ params }: { params: Promise<Params> }) {
  const { trackSlug, moduleSlug, lessonSlug } = await params
  const page = getLessonPage(trackSlug, moduleSlug, lessonSlug)
  if (!page) notFound()
  const { lesson, track, section, module: mod, siblings, doc, prev, next, index, count } = page
  // After a module's last lesson, Next goes on to the following module, not back to this one.
  const order = trackModules(track).filter((m) => !LISTED_ELSEWHERE.has(m.slug))
  const nextModule = order[order.findIndex((m) => m.slug === mod.slug) + 1]
  const input = moduleInput(mod)
  const trail = trackTrail(track)
  // Section anchors exist only on Learn track pages.
  const sectionCrumb = section && trail.length > 1 ? [{ label: section.title, href: `${learnHref.track(track.slug)}#${section.slug}` }] : []
  // The scenario mocks (every T8.2 lesson after the method lesson) get a timer and a scorer (FE-15).
  const mockRounds = mod.slug === MOCK_MODULE ? mockRoundsFor(lesson.slug) : []
  const scenarioMock = mockRounds.length > 0
  // Layout preview (feat/lesson-width-preview): two lessons try an Educative-style wide column.
  const layout = LAYOUT_PREVIEW[lesson.slug]
  // The Editorial head is tagged with the area the lesson is served under.
  const area = isLearnTrack(track.slug) ? 'Learn' : 'Interview'

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            ...trail.map((c) => ({ name: c.label, path: c.href })),
            { name: mod.title, path: learnHref.module(mod) },
            { name: lesson.title, path: lesson.href },
          ]),
          learningResourceJsonLd({
            name: lesson.title,
            description: capitalise(mod.objective),
            path: lesson.href,
            minutes: lesson.estMinutes,
            partOf: { name: mod.title, path: learnHref.module(mod) },
          }),
        ]}
      />
      <Breadcrumbs
        items={[
          ...trail,
          ...sectionCrumb,
          { label: mod.title, href: learnHref.module(mod) },
          { label: lesson.title },
        ]}
      />
      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
        <LessonSideNav track={track} module={mod} lessons={siblings} current={lesson.slug} doc={doc} />
        <div className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-border bg-surface px-3 py-2">
            <Link href={learnHref.module(mod)} className={cx('rounded-sm text-[0.8125rem] font-semibold hover:text-accent', focusRing)}>
              {mod.title}
            </Link>
            {index >= 0 && (
              <span className="text-[0.8125rem] text-subtle">
                Lesson {index + 1} of {count}
              </span>
            )}
            <div className="min-w-32 flex-1">
              <ModuleProgress input={input} />
            </div>
            <ModuleStatusBadge input={input} size="xs" />
          </div>

          <StorageNotice />

          <ReviewLinks lessonSlug={lesson.slug} />

          {scenarioMock && (
            <div className="mb-6">
              <MockTimer minutes={MOCK_MINUTES} />
            </div>
          )}

          <LessonReader page={page} twins={await lessonTwins(lesson.slug)} explorer={await lessonExplorer(lesson.slug)} tag={area} layout={layout} />

          {scenarioMock && <MockScorer lessonSlug={lesson.slug} title={lesson.title} href={lesson.href} rounds={mockRounds} />}

          <div className="mt-10 border-t border-border pt-6">
            <LessonActions moduleSlug={mod.slug} lessonSlug={lesson.slug} title={lesson.title} href={lesson.href} />
            <p className="mt-3 text-xs text-muted">
              Rate your confidence and keep notes on the{' '}
              <Link href={`${learnHref.module(mod)}#yours`} className="text-accent underline underline-offset-2">
                module page
              </Link>
              .
            </p>
          </div>

          {/* Sticky at the bottom on small screens so the next lesson is always one tap away. */}
          <nav
            aria-label="Lesson navigation"
            className="no-print sticky bottom-0 z-20 -mx-4 mt-8 grid grid-cols-2 gap-3 border-t border-border bg-bg/95 px-4 py-3 text-sm backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-t-0 lg:bg-transparent lg:px-0 lg:backdrop-blur-none"
          >
            {prev ? (
              <NavLink href={prev.href} dir="prev" label={prev.title} />
            ) : (
              <NavLink href={learnHref.module(mod)} dir="prev" label={`${mod.title} overview`} />
            )}
            {next ? (
              <NavLink href={next.href} dir="next" label={next.title} />
            ) : nextModule ? (
              <NavLink href={learnHref.module(nextModule)} dir="next" label={nextModule.title} />
            ) : (
              <NavLink href={learnHref.module(mod)} dir="next" label={`Back to ${mod.title}`} />
            )}
          </nav>
        </div>
      </div>
    </>
  )
}

/** The visible label drops the arrow glued to it (Editorial theme); the accessible name keeps it. */
function NavLink({ href, dir, label }: { href: string; dir: 'prev' | 'next'; label: string }) {
  const word = dir === 'prev' ? '← Previous' : 'Next →'
  return (
    <Link
      href={href}
      rel={dir}
      aria-label={`${word} ${label}`}
      className={cx(
        'flex min-w-0 flex-col rounded-md px-2 py-1 hover:bg-surface-2',
        dir === 'next' && 'col-start-2 items-end text-right',
        focusRing,
      )}
    >
      <span className="text-xs text-subtle">{dir === 'prev' ? 'Previous' : 'Next'}</span>
      <span className="w-full truncate font-semibold">{label}</span>
    </Link>
  )
}
