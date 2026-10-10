import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { TextLink } from '@/components/areas/Area'
import { LIVE, coverage } from '@/components/areas/data'
import { LinkButton } from '@/components/ui'
import { PracticePreview } from '@/components/landing/PracticePreview'
import { LearningJourney } from '@/components/landing/LearningJourney'
import { getAllScenarios } from '@/lib/content'
import { NAV, REVIEWS, SITE_NAME, SITE_TAGLINE } from '@/lib/editorial'
import { pageMetadata, webSiteJsonLd } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { ExpressLane } from '@/components/start/ExpressLane'
import { learnTracks } from '@/lib/learn'

/**
 * `/`: the product landing page (FE-13). A Server Component with two interactive
 * leaves: a small practice exercise and a scroll camera study. It says what the
 * site is, who it is for and what each area does, then sends the reader to /start or
 * /learn. The old home's module cards now live on the area indexes: worksheets and
 * behavioural practice on /practice, worked designs on /design, company prep and the
 * final-week review on /interview.
 *
 * Every number on this page is computed from `curriculum.ts` or the synced manifest,
 * so the coverage claim cannot drift from what is actually published.
 */

const TAGLINE = 'Learn the foundations, work through real designs, and practise the decisions interviewers test.'

export const metadata: Metadata = pageMetadata({ path: '/', description: TAGLINE, ogTitle: `${SITE_NAME} — ${SITE_TAGLINE}` })

const PERSONAS = [
  { who: 'Beginner', line: 'Start from the foundations and follow one path, so you always know what comes next.' },
  {
    who: 'Experienced software engineer moving into AI',
    line: 'Skip what you know and spend your time on retrieval, agents, evaluation and production AI.',
  },
  { who: 'Data engineer', line: 'Build on pipelines and governance you already run, and learn where models change the design.' },
  {
    who: 'ML engineer going to production',
    line: 'Move from a working model to a system a customer can trust: serving, evaluation, security and operations.',
  },
  {
    who: 'Architect or consultant',
    line: 'Sharpen the judgement calls: which use case to fund, what to build first, and how to scope it.',
  },
  { who: 'FDE candidate', line: 'Practise the full loop: discovery, design, behavioural stories and a final-week review.' },
  {
    who: 'Revision-only candidate',
    line: 'Interview soon? Go straight to condensed reviews, worked designs and timed practice.',
  },
]

/** One line per area, keyed by the stable NAV ids. Labels and hrefs come from NAV. */
const AREA_COPY: Record<(typeof NAV)[number]['id'], { purpose: string; cta: string }> = {
  start: { purpose: 'Answer a few questions and get a study path that fits where you are today.', cta: 'Pick a path' },
  learn: { purpose: 'The curriculum: tracks, modules and lessons, with progress saved in this browser.', cta: 'Browse the curriculum' },
  design: { purpose: 'The casebook: complete system designs to read as interview answers or deep dives.', cta: 'Open the casebook' },
  practice: { purpose: 'Worksheets and behavioural questions you answer, then score against a model answer.', cta: 'Start practising' },
  interview: { purpose: 'Case-study worksheets, full mock rounds and the final-week review for the days before the loop.', cta: 'Get interview ready' },
}

const DIFFERENT = [
  {
    title: 'A Judgement Layer',
    body: 'Every design asks why, not only what: which constraint bites, which trade-off you accept, and what you would tell the customer.',
  },
  {
    title: 'A Casebook at Three Depths',
    body: 'Read a case as the answer you would say out loud, as the technical deep dive behind it, or as a quick review the night before.',
  },
  {
    title: 'Rubric-Scored Practice',
    body: 'Worksheets make you write the answer first, then check it against what a strong answer covers and score yourself honestly.',
  },
  {
    title: 'Built for Spoken Answers',
    body: 'Interviews are spoken. Material leads with the line you could say, then adds depth only where it earns its place.',
  },
]

export default async function HomePage() {
  const scenarios = await getAllScenarios()
  const count = (moduleId: string) => scenarios.filter((s) => s.moduleId === moduleId).length
  const cov = coverage()
  // /learn lists only its own tracks; the interview track lives under /interview (FV-04).
  const learnTrackCount = learnTracks().length

  const stats: { value: number; label: string }[] = [
    { value: cov.byStatus.ready, label: 'modules ready' },
    { value: cov.byStatus.partly, label: 'modules partly ready' },
    { value: cov.byStatus['coming-soon'], label: 'modules coming soon' },
    { value: cov.byStatus['on-hold'], label: 'modules on hold' },
  ]
  const material = [
    `${count(LIVE.worksheets)} technical worksheets`,
    `${count(LIVE.behavioural)} behavioural worksheets`,
    `${count(LIVE.casebook)} worked system designs`,
    `${REVIEWS.length} final-week reviews`,
  ]

  return (
    <div className="py-10 sm:py-14">
      <JsonLd data={webSiteJsonLd()} />
      <section aria-labelledby="hero-heading" className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">From the customer’s problem to production</p>
          <h1 id="hero-heading" className="mt-5 text-[2.6rem] font-bold leading-[1.06] tracking-[-0.035em] sm:text-[3.4rem] lg:text-[3.3rem]">
            Build AI systems.<br /><span className="text-accent">Explain them with confidence.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">{TAGLINE}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <LinkButton href="/start" className="min-h-11 px-4 py-2.5 text-[0.9375rem]">Choose your path</LinkButton>
            <LinkButton href="/learn" variant="secondary" className="min-h-11 px-4 py-2.5 text-[0.9375rem]">Explore curriculum</LinkButton>
          </div>
          <ExpressLane className="mt-4" />
        </div>
        <PracticePreview />
      </section>

      <dl className="mt-10 grid grid-cols-3 gap-4 border-y border-border py-5 sm:mt-14">
        {[
          { value: cov.byStatus.ready, label: 'ready curriculum modules' },
          { value: count(LIVE.casebook), label: 'worked system designs' },
          { value: count(LIVE.worksheets), label: 'technical worksheets' },
        ].map((item) => (
          <div key={item.label}>
            <dd className="text-2xl font-semibold tabular-nums sm:text-3xl">{item.value}</dd>
            <dt className="mt-1 text-xs leading-relaxed text-muted sm:text-sm">{item.label}</dt>
          </div>
        ))}
      </dl>

      <LearningJourney />

      <LandingSection id="areas" title="Find Your Next Step">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {NAV.map((area) => (
            <li key={area.id} className="flex flex-col rounded-xl border border-border bg-surface p-5">
              <h3 className="text-lg font-semibold">{area.label}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{AREA_COPY[area.id].purpose}</p>
              <div className="mt-4">
                <TextLink href={area.href}>{AREA_COPY[area.id].cta}</TextLink>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-muted">Your reading and practice progress stays in this browser as you go.</p>
      </LandingSection>

      <LandingSection id="who" title="Who It Is For">
        <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {PERSONAS.map((p) => (
            <li key={p.who} className="border-l-2 border-border pl-4">
              <p className="font-semibold">{p.who}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted">{p.line}</p>
            </li>
          ))}
        </ul>
      </LandingSection>

      <LandingSection id="different" title="What Makes It Different">
        <ul className="grid gap-4 sm:grid-cols-2">
          {DIFFERENT.map((d) => (
            <li key={d.title} className="rounded-xl border border-border bg-surface p-5">
              <h3 className="font-semibold">{d.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{d.body}</p>
            </li>
          ))}
        </ul>
      </LandingSection>

      <LandingSection id="coverage" title="What Is Ready Today">
        <p className="max-w-3xl text-[0.9375rem] leading-relaxed text-muted">
          The curriculum has {learnTrackCount} tracks in Learn and {cov.tracks - learnTrackCount} in Interview, {cov.modules} modules in all. Not all of them have material yet, and the
          site says so on every module page rather than hiding the gaps.
        </p>
        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col rounded-xl border border-border bg-surface px-4 py-3">
              <dt className="text-sm text-muted">{s.label}</dt>
              <dd className="order-first text-2xl font-semibold tabular-nums">{s.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 max-w-3xl text-[0.9375rem] leading-relaxed text-muted">
          Live today: {material.slice(0, -1).join(', ')}, and {material.at(-1)}.
        </p>
      </LandingSection>

      <section aria-labelledby="cta-heading" className="mt-16 border-t border-border pt-10">
        <h2 id="cta-heading" className="text-xl font-semibold tracking-[-0.014em]">
          Know What to Study Next
        </h2>
        <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-muted">
          Pick a path if you want a sequence. Open the curriculum if you would rather choose for yourself.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <LinkButton href="/start">Start learning</LinkButton>
          <LinkButton href="/learn" variant="secondary">
            Explore curriculum
          </LinkButton>
        </div>
      </section>
    </div>
  )
}

function LandingSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} tabIndex={-1} aria-labelledby={`${id}-heading`} className="mt-16 scroll-mt-20">
      <h2 id={`${id}-heading`} className="mb-5 text-[1.375rem] font-semibold tracking-[-0.014em]">
        {title}
      </h2>
      {children}
    </section>
  )
}
