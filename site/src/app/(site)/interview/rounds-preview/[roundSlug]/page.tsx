import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/learn/Breadcrumbs'
import { EditorialSection } from '@/components/editorial/EditorialSection'
import { PageHead } from '@/components/editorial/PageHead'
import { INTERVIEW_ROUNDS, lessonRow, moduleRow, practiseCount, roundHref, type Row } from '../rounds'

/**
 * PROTOTYPE of one interview round page (plan Part 4, step 23): what the round tests,
 * then what to study, practise and run as a mock, all as links to pages that already
 * exist. Live rounds only; a Coming soon round has no page.
 */

type Params = { roundSlug: string }

export const dynamicParams = false

export function generateStaticParams(): Params[] {
  return INTERVIEW_ROUNDS.filter((r) => !r.planned).map((r) => ({ roundSlug: r.slug }))
}

const getRound = (slug: string) => INTERVIEW_ROUNDS.find((r) => r.slug === slug && !r.planned)

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const round = getRound((await params).roundSlug)
  return round ? { title: `${round.title} Round (prototype)`, robots: { index: false, follow: false } } : {}
}

export default async function RoundPage({ params }: { params: Promise<Params> }) {
  const round = getRound((await params).roundSlug)
  if (!round) notFound()

  const number = INTERVIEW_ROUNDS.indexOf(round) + 1
  const live = INTERVIEW_ROUNDS.filter((r) => !r.planned)
  const at = live.indexOf(round)
  const prev = live[at - 1]
  const next = live[at + 1]

  const practise = practiseCount(round)
  const facts = [
    { term: 'Format', value: round.format },
    ...(round.study.length ? [{ term: 'Study', value: `${round.study.length} modules` }] : []),
    ...(practise ? [{ term: 'Practise', value: `${practise} lessons` }] : []),
    ...(round.mocks.length ? [{ term: 'Mocks', value: `${round.mocks.length}` }] : []),
  ]

  return (
    <div className="pb-24">
      <p className="mt-6 border border-dashed border-[var(--color-rule-2)] bg-[var(--color-paper-2)] px-4 py-3 text-[0.9375rem]">
        <strong>Prototype.</strong> One round page of the interview area organised by round.
      </p>
      <div className="mt-4" />
      <Breadcrumbs items={[{ label: 'Interview', href: '/interview/rounds-preview' }, { label: round.title }]} />
      <PageHead tag={`Round ${number}`} title={round.title} standfirst={round.summary} facts={facts} />

      <EditorialSection id="tests" title="What It Tests" description="A strong answer shows all three.">
        <ol className="cb-rows">
          {round.tests.map((t, i) => (
            <li key={t} className="cb-row">
              <div className="cb-row-link">
                <span className="cb-row-title">
                  <span className="mr-3 tabular-nums text-subtle">{i + 1}</span>
                  {t}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </EditorialSection>

      {round.study.length > 0 && (
        <EditorialSection id="study" title="Study in Learn" description="The modules that teach what this round tests. Start here if a topic is new.">
          <Rows rows={round.study.map(moduleRow)} />
        </EditorialSection>
      )}

      {practise > 0 && (
        <EditorialSection
          id="practise"
          title="Practise"
          description="Answer each question out loud before you read the model answer."
        >
          <div className="space-y-10">
            {round.practise.map((g) => (
              <div key={g.title}>
                <h3 className="cb-label mb-2">
                  {g.title} <span className="tabular-nums text-subtle">({g.lessons.length})</span>
                </h3>
                <Rows rows={g.lessons.map(lessonRow)} />
              </div>
            ))}
          </div>
        </EditorialSection>
      )}

      {round.mocks.length > 0 && (
        <EditorialSection
          id="mocks"
          title="Mock Interview"
          description="Run it under time with a partner, then score it against the scorecard."
        >
          <Rows rows={round.mocks.map(lessonRow)} />
        </EditorialSection>
      )}

      <nav aria-label="Other rounds" className="mt-16 grid gap-4 border-t border-[var(--color-rule-2)] pt-6 sm:grid-cols-2">
        {prev ? (
          <Link href={roundHref(prev.slug)} className="block py-2" aria-label={`Previous round: ${prev.title}`}>
            <span className="cb-label block">Previous round</span>
            <span className="cb-row-title mt-1 block">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={roundHref(next.slug)} className="block py-2 sm:text-right" aria-label={`Next round: ${next.title}`}>
            <span className="cb-label block">Next round</span>
            <span className="cb-row-title mt-1 block">{next.title}</span>
          </Link>
        )}
      </nav>
    </div>
  )
}

function Rows({ rows }: { rows: Row[] }) {
  return (
    <ul className="cb-rows">
      {rows.map((r) => (
        <li key={r.href} className="cb-row">
          <Link href={r.href} className="cb-row-link">
            <span className="cb-row-title">{r.title}</span>
            <span className="cb-row-facts">
              {r.facts.map((f) => (
                <span key={f}>{f}</span>
              ))}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
