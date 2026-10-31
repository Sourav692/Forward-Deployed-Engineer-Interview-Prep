import type { Metadata } from 'next'
import Link from 'next/link'
import { SuggestTopic } from '@/components/areas/SuggestTopic'
import { curriculumModules, siteCounts } from '@/components/areas/data'
import { EditorialSection } from '@/components/editorial/EditorialSection'
import { ModuleProgress } from '@/components/learn/ProgressIslands'
import { JsonLd } from '@/components/JsonLd'
import { Tag, cx, focusRing } from '@/components/ui'
import { INTERVIEW_ROUNDS } from '@/lib/curriculum'
import type { InterviewRound } from '@/lib/curriculum-types'
import { curriculumHref, roundHref } from '@/lib/curriculum-href'
import { LAST_DAY } from '@/lib/editorial'
import { liveRounds, practiseCount } from '@/lib/interview-rounds'
import { INTERVIEW_TRACK, moduleInput, readingList } from '@/lib/learn'
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo'

/**
 * /interview: the interview area organised by round (plan Part 4). Eight round cards in
 * the order most loops run them; a live round opens /interview/rounds/<round>, a round
 * with no content yet is a Coming soon card with no link. The final week follows,
 * because it serves every round. Mock interview and final-week lessons live at
 * /interview/<module>/<lesson>; company packs have their own area at /company-prep.
 */

export const metadata: Metadata = pageMetadata({
  path: '/interview',
  title: 'Interview',
  description:
    'Interview preparation round by round: what each round tests, what to study, what to practise and the mock interview to run, plus the final-week review.',
})

const FINAL_WEEK = 'final-week'
const MOCKS = 'mock-interviews'

export default async function InterviewPage() {
  const counts = await siteCounts()
  const finalWeek = curriculumModules(INTERVIEW_TRACK).find((m) => m.slug === FINAL_WEEK)
  if (!finalWeek) throw new Error(`No interview module "${FINAL_WEEK}"`)
  const finalWeekLessons = readingList(finalWeek).main
  const mocks = curriculumModules(INTERVIEW_TRACK).find((m) => m.slug === MOCKS)
  if (!mocks) throw new Error(`No interview module "${MOCKS}"`)

  // Hallmark, Editorial theme (editorial.css): the name and what the area is for, then
  // the rounds as square bordered cards (the Learn group card piece), then the final week.
  return (
    <div className="pb-24">
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Interview', path: '/interview' }])} />
      <header className="cb-hero">
        <div>
          <h1>Interview</h1>
          <p className="cb-standfirst">
            Prepare one round at a time. Each round says what the interviewer tests, what to study in Learn, what to
            practise and which mock interview to run under time.
          </p>
        </div>
        <div className="cb-hero-side">
          <p>
            {liveRounds().length} of {INTERVIEW_ROUNDS.length} rounds are ready. The technical worksheets are also in{' '}
            <Link href="/practice" className="underline underline-offset-2">
              Practice
            </Link>
            , and every mock interview is in{' '}
            <Link href={curriculumHref(INTERVIEW_TRACK, MOCKS)} className="underline underline-offset-2">
              {mocks.title}
            </Link>
            .
          </p>
          <nav aria-label="On this page" className="mt-5">
            <ul className="cb-rows">
              <li className="cb-row">
                <a href="#rounds" className="cb-row-link">
                  <span className="cb-row-title">The rounds</span>
                  <span className="cb-row-facts">{INTERVIEW_ROUNDS.length} rounds</span>
                </a>
              </li>
              <li className="cb-row">
                <a href="#final-week" className="cb-row-link">
                  <span className="cb-row-title">{LAST_DAY.title}</span>
                  <span className="cb-row-facts">{finalWeekLessons.length} lessons</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <EditorialSection
        id="rounds"
        title="The Rounds"
        description="In the order most loops run them. Companies drop or merge rounds, so check your loop and start with the rounds you will face."
      >
        <ul aria-label="Interview rounds" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {INTERVIEW_ROUNDS.map((round) => (
            <li key={round.slug} className="flex">
              <RoundCard round={round} />
            </li>
          ))}
        </ul>
      </EditorialSection>

      <EditorialSection
        id="final-week"
        title={LAST_DAY.title}
        description={`For every round: a six-day plan with ${counts.reviews} condensed reviews, one-page recall cards and a last-day pass. Read it after you have studied the concepts; a new concept needs its lesson first.`}
      >
        <div className="cb-well lg:grid lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-10">
          <div>
            <h3 className="text-[1.75rem] leading-none">One week, six days</h3>
            <div className="mt-4 max-w-[22rem]">
              <ModuleProgress input={moduleInput(finalWeek)} />
            </div>
            <Link href={curriculumHref(INTERVIEW_TRACK, FINAL_WEEK)} className="cb-btn cb-btn--primary mt-5">
              Open the final week
            </Link>
          </div>
          <ul className="cb-rows mt-6 lg:mt-0">
            {(finalWeek.groups ?? []).map((g) => (
              <li key={g.id} className="cb-row">
                <Link href={`${curriculumHref(INTERVIEW_TRACK, FINAL_WEEK)}#${g.id}`} className="cb-row-link">
                  <span className="cb-row-title">{g.title}</span>
                  <span className="cb-row-facts">{g.lessons.length} lessons</span>
                  <span className="cb-row-note">{g.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </EditorialSection>

      <div className="mt-24">
        <SuggestTopic hub="Interview" />
      </div>
    </div>
  )
}

/**
 * One round as a square bordered card (`cb-group-card`, shared with the Learn groups).
 * A live round's title opens its page, stretched over the card so the card is one tab
 * stop. A planned round shows its topics and has no link.
 */
function RoundCard({ round }: { round: InterviewRound }) {
  const live = !round.planned
  const practise = practiseCount(round)
  return (
    <article className={cx('cb-group-card relative flex w-full flex-col', !live && 'is-soon')}>
      <div className="flex min-h-6 flex-wrap items-center gap-2">
        {!live && <Tag>Coming soon</Tag>}
      </div>
      <h2 className="cb-entry-title mt-3">
        {live ? (
          <Link href={roundHref(round.slug)} className={cx('after:absolute after:inset-0', focusRing)}>
            {round.title}
          </Link>
        ) : (
          round.title
        )}
      </h2>
      <p className="cb-entry-body">{round.summary}</p>
      {live ? (
        <p className="cb-entry-facts mt-auto pt-4">
          {round.study.length > 0 && <span>{round.study.length} to study</span>}
          {practise > 0 && <span>{practise} to practise</span>}
          {round.mocks.length > 0 && (
            <span>
              {round.mocks.length} {round.mocks.length === 1 ? 'mock' : 'mocks'}
            </span>
          )}
        </p>
      ) : (
        <p className="mt-3 text-[0.9375rem] text-muted">Planned: {round.planned}.</p>
      )}
    </article>
  )
}
