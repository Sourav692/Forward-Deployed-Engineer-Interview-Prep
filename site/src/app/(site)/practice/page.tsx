import type { Metadata } from 'next'
import { ModuleProgress } from '@/components/Progress'
import { AreaGroup, AreaHeader, AreaSection, LinkList, TextLink } from '@/components/areas/Area'
import { LIVE, curriculumModules, moduleGroups, moduleHref } from '@/components/areas/data'
import { ModuleCard } from '@/components/learn/ModuleCard'
import { STORY_BANK } from '@/lib/editorial'

/**
 * /practice: the practice index (FE-11). Links into the existing worksheet pages
 * (/modules/01-...), the behavioural round (/modules/14-...) and its Story Bank, and
 * the mock-interview module in Learn. Projects have no source yet (plan §15 Q14), so
 * the page does not mention them (audit check FV-03).
 */

export const metadata: Metadata = {
  title: 'Practice',
  description:
    'Worksheets you fill in and score against a model answer, behavioural questions with a story bank, and timed mock interviews.',
}

const MOCKS_MODULE = 'mock-interviews'

export default async function PracticePage() {
  const [worksheets, behavioural] = await Promise.all([
    moduleGroups(LIVE.worksheets),
    moduleGroups(LIVE.behavioural),
  ])
  const mocks = curriculumModules('interview-practice').filter((m) => m.slug === MOCKS_MODULE)

  return (
    <div className="py-12">
      <AreaHeader eyebrow="Practice" title="Practise Under Interview Conditions">
        <p>
          Reading a strong answer is not the same as giving one. Each worksheet hands you a customer problem to work
          section by section, then shows what a strong answer covers so you can score yourself honestly. Behavioural
          questions work the same way, with your own stories in the gaps.
        </p>
      </AreaHeader>

      <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2">
        {[
          ['#worksheets', 'Worksheets'],
          ['#behavioural', 'Behavioural'],
          ['#mocks', 'Mock interviews'],
          ['#projects', 'Projects'],
        ].map(([href, label]) => (
          <a
            key={href}
            href={href}
            className="rounded-full border border-border px-3 py-1 text-[0.8125rem] text-muted transition-colors hover:border-border-strong hover:text-text"
          >
            {label}
          </a>
        ))}
      </nav>

      <AreaSection
        id="worksheets"
        title="Technical Worksheets"
        description="Customer scenarios worked from discovery to rollout. Start with Discovery Foundations; the System Design Practice set adds one dangerous constraint to each problem."
        action={{ label: 'Open technical practice', href: moduleHref(LIVE.worksheets) }}
      >
        <ModuleProgress scenarios={worksheets.scenarios} />
        <div className="mt-5 space-y-4">
          {worksheets.groups.map((g) => (
            <AreaGroup
              key={g.id}
              title={g.title}
              blurb={g.blurb}
              action={{ label: `${g.items.length} worksheets`, href: g.href }}
            >
              <LinkList items={g.items} />
            </AreaGroup>
          ))}
        </div>
      </AreaSection>

      <AreaSection
        id="behavioural"
        title="Behavioural and Leadership"
        description="Hiring manager and leadership principle questions. Each model answer shows the shape of a strong story and marks the details only you can supply."
        action={{ label: 'Open behavioural practice', href: moduleHref(LIVE.behavioural) }}
      >
        <ModuleProgress scenarios={behavioural.scenarios} />
        <div className="mt-5 space-y-4">
          <AreaGroup title={STORY_BANK.title} blurb={STORY_BANK.blurb}>
            <div className="px-2 pb-1">
              <TextLink href={STORY_BANK.href}>Open the Story Bank</TextLink>
            </div>
          </AreaGroup>
          {behavioural.groups.map((g) => (
            <AreaGroup
              key={g.id}
              title={g.title}
              blurb={g.blurb}
              action={{ label: `${g.items.length} worksheets`, href: g.href }}
            >
              <LinkList items={g.items} />
            </AreaGroup>
          ))}
        </div>
      </AreaSection>

      <AreaSection
        id="mocks"
        title="Mock Interviews"
        description="Full rounds under time, scored against the interviewer rubric. The mock formats and scorecards are in the Learn module below."
      >
        <div className="space-y-2">
          {mocks.map((m) => (
            <ModuleCard key={m.slug} module={m} />
          ))}
        </div>
      </AreaSection>
    </div>
  )
}
