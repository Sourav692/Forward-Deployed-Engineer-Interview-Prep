import type { Metadata } from 'next'
import Link from 'next/link'
import { getLearnManifest, getModuleBySlug, inlineHtml, learnHref, type LearnLesson } from '@/lib/learn'
import type { Rights } from '@/lib/curriculum-types'
import { RAG_COURSE_URL } from '@/lib/editorial'
import { RAG_TRACKS } from '@/lib/rag-tracks'
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs } from '@/components/learn/Breadcrumbs'
import { focusRing } from '@/components/ui'

/**
 * Credits (plan §12, SEC-05): every published lesson whose `publish` decision is
 * `credited`, grouped by its credit line, with links to the lesson and its module.
 * Built from the Learn manifest, so it lists exactly what the site publishes. Each line
 * shows its rights status as text (ENH-28, owner decision 7).
 */

const RIGHTS: Record<Rights, string> = {
  licensed: 'Licensed',
  permitted: 'Permitted',
  rewrite: 'Being rewritten in our own words',
}

export const metadata: Metadata = pageMetadata({
  path: '/library/credits',
  title: 'Credits',
  description: 'The third-party books, guides and courses that credited lessons on Forward Deployed draw on, and where each one is used.',
})

type Group = { credit: string; rights?: Rights; lessons: LearnLesson[] }

function creditGroups(): Group[] {
  const groups = new Map<string, LearnLesson[]>()
  for (const lesson of getLearnManifest()) {
    if (lesson.publish !== 'credited' || !lesson.credit) continue
    const list = groups.get(lesson.credit) ?? []
    list.push(lesson)
    groups.set(lesson.credit, list)
  }
  return [...groups]
    .map(([credit, lessons]) => ({ credit, rights: lessons[0].rights, lessons }))
    .sort((a, b) => b.lessons.length - a.lessons.length || a.credit.localeCompare(b.credit))
}

const link = `rounded-sm text-accent underline-offset-2 hover:underline ${focusRing}`

export default function CreditsPage() {
  const groups = creditGroups()
  const total = groups.reduce((n, g) => n + g.lessons.length, 0)

  return (
    <div className="py-8 sm:py-10">
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Library', path: '/library' }, { name: 'Credits', path: '/library/credits' }])} />
      <Breadcrumbs items={[{ label: 'Library', href: '/library' }, { label: 'Credits' }]} />
      <header className="mb-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-subtle">Library</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">Credits</h1>
        <p className="mt-3 text-base text-muted">
          {total} lessons draw on work by other authors. Each one carries its credit line under the lesson; this page
          collects them by source so you can see what each source contributes and where.
        </p>
        <p className="mt-3 text-[0.9375rem] text-muted">
          Each source shows its status: <strong className="font-semibold text-text">licensed</strong> (a licence
          covers it), <strong className="font-semibold text-text">permitted</strong> (the source allows this use, or the
          lessons only summarise its ideas in our own words) or{' '}
          <strong className="font-semibold text-text">being rewritten in our own words</strong> (the lessons stay up
          until their rewrite is published).
        </p>
      </header>

      <div className="flex max-w-3xl flex-col gap-6">
        <section className="rounded-lg border border-border bg-surface p-4 sm:p-5">
          <h2 className="text-base font-semibold leading-snug">
            <a href={RAG_COURSE_URL} className={link}>
              RAG &amp; Agents Engineering
            </a>
            , the author&apos;s own open-source course
          </h2>
          <p className="mt-1 text-[0.8125rem] text-subtle">
            {RAG_TRACKS.length} tracks of the <Link href="/learn/topics/ai-engineering" className={link}>AI Engineering group</Link> ·{' '}
            <span className="font-semibold text-text">Status: Licensed (MIT)</span>
          </p>
          <p className="mt-3 text-[0.9375rem] leading-snug text-muted">
            Its lessons, labs and diagrams appear here as written, and each lesson links to the course&apos;s runnable
            notebooks.
          </p>
        </section>
        {groups.map((group) => (
          <section key={group.credit} className="rounded-lg border border-border bg-surface p-4 sm:p-5">
            <h2
              className="text-base font-semibold leading-snug [&_em]:italic"
              dangerouslySetInnerHTML={{ __html: inlineHtml(group.credit) }}
            />
            <p className="mt-1 text-[0.8125rem] text-subtle">
              {group.lessons.length} {group.lessons.length === 1 ? 'lesson' : 'lessons'}
              {group.rights && (
                <>
                  {' · '}
                  <span className="font-semibold text-text">Status: {RIGHTS[group.rights]}</span>
                </>
              )}
            </p>
            <ul className="mt-3 flex flex-col gap-1.5">
              {group.lessons.map((lesson) => {
                const mod = getModuleBySlug(lesson.module)
                return (
                  <li key={lesson.slug} className="text-[0.9375rem] leading-snug">
                    {/* inline-block + padding keeps each link a 24 px target (WCAG 2.5.8) when they stack on phones. */}
                    <Link href={lesson.href} className={`inline-block py-0.5 font-medium ${link}`}>
                      {lesson.title}
                    </Link>
                    {mod && (
                      <span className="block text-[0.8125rem] text-subtle sm:inline">
                        <span className="hidden sm:inline"> · </span>
                        <Link href={learnHref.module(mod)} className={`inline-block py-1 ${link}`}>
                          {mod.title}
                        </Link>
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
