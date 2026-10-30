import type { Metadata } from 'next'
import Link from 'next/link'
import { SuggestTopic } from '@/components/areas/SuggestTopic'
import { curriculumModules, siteCounts } from '@/components/areas/data'
import { EditorialSection } from '@/components/editorial/EditorialSection'
import { ModuleProgress } from '@/components/learn/ProgressIslands'
import { Tag, cx, focusRing } from '@/components/ui'
import { LAST_DAY } from '@/lib/editorial'
import { curriculumHref } from '@/lib/curriculum-href'
import { INTERVIEW_TRACK, moduleInput, readingList } from '@/lib/learn'
import { INTERVIEW_ROUNDS, practiseCount, roundHref, type InterviewRound } from './rounds'

/**
 * PROTOTYPE of the /interview hub organised by round (plan Part 4, step 23). Not linked
 * from the site and not indexed. On approval it replaces src/app/(site)/interview/page.tsx.
 */

export const metadata: Metadata = {
  title: 'Interview by round (prototype)',
  robots: { index: false, follow: false },
}

const FINAL_WEEK = 'final-week'

export default async function InterviewRoundsPrototype() {
  const counts = await siteCounts()
  const finalWeek = curriculumModules(INTERVIEW_TRACK).find((m) => m.slug === FINAL_WEEK)!
  const finalWeekLessons = readingList(finalWeek).main
  const live = INTERVIEW_ROUNDS.filter((r) => !r.planned).length

  return (
    <div className="pb-24">
      <p className="mt-6 border border-dashed border-[var(--color-rule-2)] bg-[var(--color-paper-2)] px-4 py-3 text-[0.9375rem]">
        <strong>Prototype.</strong> The interview area organised by round. Not linked from the site yet; the current hub
        is still at{' '}
        <Link href="/interview" className="underline underline-offset-2">
          /interview
        </Link>
        .
      </p>

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
            {live} of {INTERVIEW_ROUNDS.length} rounds are ready. The technical worksheets are also in{' '}
            <Link href="/practice" className="underline underline-offset-2">
              Practice
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
          {INTERVIEW_ROUNDS.map((round, i) => (
            <li key={round.slug} className="flex">
              <RoundCard round={round} number={i + 1} />
            </li>
          ))}
        </ul>
      </EditorialSection>

      <EditorialSection
        id="final-week"
        title={LAST_DAY.title}
        description={`For every round: a six-day plan with ${counts.reviews} condensed reviews, one-page recall cards and a last-day pass. Read it after you have studied the concepts.`}
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

/** One round as a square bordered card, the same piece as the Learn group cards. */
function RoundCard({ round, number }: { round: InterviewRound; number: number }) {
  const live = !round.planned
  const practise = practiseCount(round)
  return (
    <article className={cx('cb-group-card relative flex w-full flex-col', !live && 'is-soon')}>
      <div className="flex min-h-6 flex-wrap items-center gap-2">
        <span className="text-xs font-semibold tabular-nums text-subtle">Round {String(number).padStart(2, '0')}</span>
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
