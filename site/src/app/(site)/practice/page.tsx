import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Suspense } from 'react'
import { FilteredGroups } from '@/components/areas/FilteredGroups'
import { ModuleProgress } from '@/components/Progress'
import { ContentsGroup } from '@/components/editorial/ContentsGroup'
import { SuggestTopic } from '@/components/areas/SuggestTopic'
import { LIVE, moduleGroups } from '@/components/areas/data'
import { LEVEL_LABEL, STORY_BANK } from '@/lib/editorial'
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'

/**
 * /practice: the practice index (FE-11), the one place the worksheets are listed. Links to
 * the technical and behavioural worksheets at /practice/<slug> and the Story Bank (ENH-17).
 * Mock interviews live under /interview, so they are not listed here. Projects have no
 * source yet (plan §15 Q14), so the page does not mention them (audit check FV-03).
 */

export const metadata: Metadata = pageMetadata({
  path: '/practice',
  title: 'Practice',
  description:
    'Worksheets you fill in and score against a model answer, and behavioural questions with a story bank.',
})

export default async function PracticePage() {
  const [worksheets, behavioural] = await Promise.all([
    moduleGroups(LIVE.worksheets),
    moduleGroups(LIVE.behavioural),
  ])

  const sections = [
    { href: '#worksheets', label: 'Technical worksheets', count: `${worksheets.scenarios.length} worksheets` },
    { href: '#behavioural', label: 'Behavioural and leadership', count: `${behavioural.scenarios.length} worksheets` },
  ]

  // Hallmark, Editorial theme (editorial.css): the name and what practice means here, an
  // index of the two areas, then each area opened by a heavy rule with its pages as
  // contents rows.
  return (
    <div className="pb-24">
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Practice', path: '/practice' }])} />
      <header className="cb-hero">
        <div>
          <h1>Practice</h1>
          <p className="cb-standfirst">
            Each worksheet hands you a customer problem to work section by section, then shows what a strong answer
            covers so you can score yourself honestly.
          </p>
        </div>
        <div className="cb-hero-side">
          <p>Behavioural questions work the same way, with your own stories in the gaps.</p>
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

      <PracticeSection
        id="worksheets"
        title="Technical worksheets"
        description="Customer scenarios worked from discovery to rollout. Start with Discovery Foundations; the System Design Practice set adds one dangerous constraint to each problem."
      >
        <ModuleProgress scenarios={worksheets.scenarios} plain />
        <div className="mt-10">
          <Suspense
            fallback={
              <div>
                {worksheets.groups.map((g) => (
                  <ContentsGroup key={g.id} group={g} unit={['worksheet', 'worksheets']} />
                ))}
              </div>
            }
          >
            <FilteredGroups groups={worksheets.groups} levels={LEVEL_LABEL} noun="worksheets" unit={['worksheet', 'worksheets']} contents />
          </Suspense>
        </div>
      </PracticeSection>

      <PracticeSection
        id="behavioural"
        title="Behavioural and leadership"
        description="Hiring manager and leadership principle questions. Each model answer shows the shape of a strong story and marks the details only you can supply."
      >
        <ModuleProgress scenarios={behavioural.scenarios} plain />
        <div className="cb-well mt-10 lg:grid lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-10">
          <h3 className="text-[1.75rem] leading-none">{STORY_BANK.title}</h3>
          <div className="mt-4 lg:mt-0">
            <p className="max-w-[60ch] text-base">{STORY_BANK.blurb}</p>
            <Link href={STORY_BANK.href} className="cb-btn cb-btn--primary mt-5">
              Open the Story Bank
            </Link>
          </div>
        </div>
        <div className="mt-16">
          {behavioural.groups.map((g) => (
            <ContentsGroup key={g.id} group={g} unit={['worksheet', 'worksheets']} />
          ))}
        </div>
      </PracticeSection>

      <div className="mt-24">
        <SuggestTopic hub="Practice" />
      </div>
    </div>
  )
}

/** One practice area: a heavy rule, the condensed head and its standfirst, then its pages. */
function PracticeSection({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="mt-24 scroll-mt-20 first-of-type:mt-0">
      <div className="cb-opens mb-8 lg:grid lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-10">
        <h2 id={`${id}-heading`} className="cb-section-head">
          {title}
        </h2>
        <p className="mt-4 max-w-[60ch] text-base lg:mt-1">{description}</p>
      </div>
      {children}
    </section>
  )
}
