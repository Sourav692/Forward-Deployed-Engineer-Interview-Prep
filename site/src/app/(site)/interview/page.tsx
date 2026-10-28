import type { Metadata } from 'next'
import Link from 'next/link'
import { SuggestTopic } from '@/components/areas/SuggestTopic'
import { curriculumModules, siteCounts } from '@/components/areas/data'
import { EditorialSection } from '@/components/editorial/EditorialSection'
import { ModuleProgress } from '@/components/learn/ProgressIslands'
import { LAST_DAY, LAST_DAY_GUIDES } from '@/lib/editorial'
import { INTERVIEW_HUBS, LESSONS } from '@/lib/curriculum'
import { curriculumHref, hubHref } from '@/lib/curriculum-href'
import { INTERVIEW_TRACK, formatMinutes, moduleInput, readingList, type LearnLesson } from '@/lib/learn'
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'

/**
 * /interview: the interview prep area (FE-11). It is the home of the interview
 * practice track (mock interviews, final week), whose module and lesson
 * pages live at /interview/<module>/<lesson> rather than under /learn, and it links
 * to the final week (/interview/final-week, ENH-18) and the five topic hubs
 * (/interview/hubs/<hub>). Company-specific packs have their own area at /company-prep.
 */

export const metadata: Metadata = pageMetadata({
  path: '/interview',
  title: 'Interview',
  description:
    'Interview preparation: mock interviews and scorecards, the final-week review and the interview topic hubs.',
})

/**
 * The two ready modules this hub lists. Technical worksheets live under /practice and
 * company loops under Company Prep; the on-hold modules keep their own pages only.
 */
const MOCKS = 'mock-interviews'
const FINAL_WEEK = 'final-week'

/** The final week's two guides are its first lessons; found by source file. */
const guideHref = (source: string) => {
  const lesson = LESSONS.find((l) => l.source === `07_Last_Day_Revision/${source}`)
  if (!lesson) throw new Error(`No final-week lesson for 07_Last_Day_Revision/${source}`)
  return curriculumHref(INTERVIEW_TRACK, FINAL_WEEK, lesson.slug)
}

const moduleOf = (slug: string) => {
  const mod = curriculumModules(INTERVIEW_TRACK).find((m) => m.slug === slug)
  if (!mod) throw new Error(`No interview module "${slug}"`)
  return mod
}

export default async function InterviewPage() {
  const counts = await siteCounts()
  const mocks = moduleOf(MOCKS)
  const finalWeek = moduleOf(FINAL_WEEK)
  const mockLessons = readingList(mocks).main
  const finalWeekLessons = readingList(finalWeek).main

  const sections = [
    { href: '#practice-modules', label: 'Mock interviews', count: `${mockLessons.length} lessons` },
    { href: '#final-week', label: LAST_DAY.title, count: `${finalWeekLessons.length} lessons` },
    { href: '#topic-hubs', label: 'Interview Topic Hubs', count: `${INTERVIEW_HUBS.length} hubs` },
  ]

  // Hallmark, Editorial theme (editorial.css): the name and what the area is for, an
  // index of its three parts, then each part opened by a heavy rule with its pages as
  // contents rows.
  return (
    <div className="pb-24">
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Interview', path: '/interview' }])} />
      <header className="cb-hero">
        <div>
          <h1>Interview</h1>
          <p className="cb-standfirst">
            The last stretch before an interview: full rounds under time, scored against a rubric, and condensed revision
            of what you already know.
          </p>
        </div>
        <div className="cb-hero-side">
          <p>
            The technical worksheets are in{' '}
            <Link href="/practice" className="underline underline-offset-2">
              Practice
            </Link>
            .
          </p>
          <nav aria-label="On this page" className="mt-5">
            <ul className="cb-rows">
              {sections.map((s) => (
                <li key={s.href} className="cb-row">
                  <a href={s.href} className="cb-row-link">
                    <span className="cb-row-title">{s.label}</span>
                    <span className="cb-row-facts">{s.count}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <EditorialSection
        id="practice-modules"
        title="Mock interviews"
        description="Start with the method lesson, then run Mocks A to E, five client simulations and a take-home brief. Each round has a timer and a scorecard."
      >
        <div className="cb-group">
          <div>
            <div className="max-w-[22rem]">
              <ModuleProgress input={moduleInput(mocks)} />
            </div>
            <Link href={curriculumHref(INTERVIEW_TRACK, MOCKS)} className="cb-group-count">
              Open the module
            </Link>
          </div>
          <LessonRows lessons={mockLessons} />
        </div>
      </EditorialSection>

      <EditorialSection
        id="final-week"
        title={LAST_DAY.title}
        description={`${counts.reviews} condensed reviews, each with a one-page recall card, and a trigger-to-concept cheat sheet. Read them after you have studied the concepts; a new concept needs its lesson first.`}
      >
        <div className="cb-well lg:grid lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-10">
          <div>
            <h3 className="text-[1.75rem] leading-none">Start with a guide</h3>
            <div className="mt-4 max-w-[22rem]">
              <ModuleProgress input={moduleInput(finalWeek)} />
            </div>
            <Link href={curriculumHref(INTERVIEW_TRACK, FINAL_WEEK)} className="cb-btn cb-btn--primary mt-5">
              Open the final week
            </Link>
          </div>
          <ul className="cb-rows mt-6 lg:mt-0">
            {LAST_DAY_GUIDES.map((g) => (
              <li key={g.id} className="cb-row">
                <Link href={guideHref(g.source)} className="cb-row-link">
                  <span className="cb-row-title">{g.title}</span>
                  <span className="cb-row-note">{g.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </EditorialSection>

      <EditorialSection
        id="topic-hubs"
        title="Interview Topic Hubs"
        description="Practice grouped by what the interviewer tests: the question lessons and timed rounds for each kind of round, and the modules behind them."
      >
        <ul className="cb-rows">
          {INTERVIEW_HUBS.map((h) => (
            <li key={h.slug} className="cb-row">
              <Link href={hubHref(h.slug)} className="cb-row-link">
                <span className="cb-row-title">{h.title}</span>
                <span className="cb-row-note">{h.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      </EditorialSection>

      <div className="mt-24">
        <SuggestTopic hub="Interview" />
      </div>
    </div>
  )
}

/** A module's lessons as contents rows: the title, then its reading time at the edge. */
function LessonRows({ lessons }: { lessons: LearnLesson[] }) {
  return (
    <ul className="cb-rows">
      {lessons.map((l) => (
        <li key={l.slug} className="cb-row">
          <Link href={l.href} className="cb-row-link">
            <span className="cb-row-title">{l.title}</span>
            {l.estMinutes ? <span className="cb-row-facts">{formatMinutes(l.estMinutes)}</span> : null}
          </Link>
        </li>
      ))}
    </ul>
  )
}
