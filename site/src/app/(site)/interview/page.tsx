import type { Metadata } from 'next'
import { ModuleProgress } from '@/components/Progress'
import { AreaGroup, AreaHeader, AreaSection, LinkList, PlannedList } from '@/components/areas/Area'
import { LIVE, curriculumModules, curriculumTrack, moduleGroups, moduleHref } from '@/components/areas/data'
import { ModuleCard } from '@/components/learn/ModuleCard'
import { LAST_DAY, LAST_DAY_GUIDES, MODES, REVIEWS } from '@/lib/editorial'
import { learnHref } from '@/lib/learn'

/**
 * /interview: the interview prep hub (FE-11). Links to the final-week review
 * (/fde-last-day-prep), company prep (/modules/16-...) and the interview-practice
 * modules in Learn. The five topic hubs arrive with FE-18 in Phase 2; until then they
 * are listed as Coming soon without links.
 */

export const metadata: Metadata = {
  title: 'Interview',
  description:
    'Interview preparation: the final-week review, company-specific prep, and the interview practice and revision modules.',
}

const PRACTICE_TRACK = 'interview-practice'

/** Phase 2 topic hubs (FE-18, DATA-07). Titles only: no page exists yet. */
const TOPIC_HUBS = [
  {
    title: 'Technical Foundations',
    summary: 'Core engineering questions on code, data, APIs and infrastructure that every applied AI loop still tests.',
  },
  {
    title: 'AI and Machine Learning',
    summary: 'Depth questions on models, retrieval, prompting, agents, evaluation and safety for LLM-based products.',
  },
  {
    title: 'AI Systems Design',
    summary: 'Whiteboard-style design prompts that test end-to-end architecture, scale, reliability, security and cost.',
  },
  {
    title: 'Forward Deployed Engineering',
    summary: 'Customer-facing scenarios that test discovery, scoping, delivery under constraints and proving business impact.',
  },
  {
    title: 'Behavioural and Communication',
    summary: 'Story-based and explanation questions that test judgement, ownership and how clearly you communicate.',
  },
]

export default async function InterviewPage() {
  const company = await moduleGroups(LIVE.companyPrep)
  const practiceModules = curriculumModules(PRACTICE_TRACK)
  const practiceTrack = curriculumTrack(PRACTICE_TRACK)

  return (
    <div className="py-12">
      <AreaHeader eyebrow="Interview" title="Get Ready for the Loop">
        <p>
          The last stretch before an interview: condensed revision of what you already know, preparation for one
          company’s loop, and full practice rounds under time.
        </p>
      </AreaHeader>

      <AreaSection
        id="final-week"
        title={LAST_DAY.title}
        description={`${REVIEWS.length} condensed reviews, a searchable trigger-to-concept reference, an orientation roadmap and a final rehearsal guide. ${MODES.revision.summary}`}
        action={{ label: 'Open the final-week review', href: LAST_DAY.href }}
      >
        <LinkList
          items={LAST_DAY_GUIDES.map((g) => ({ href: `${LAST_DAY.href}/${g.id}`, title: g.title, note: g.blurb }))}
        />
      </AreaSection>

      <AreaSection
        id="company-prep"
        title="Company Prep"
        description={MODES['company-prep'].summary}
        action={{ label: 'Open company prep', href: moduleHref(LIVE.companyPrep) }}
      >
        <ModuleProgress scenarios={company.scenarios} readingNoun="guides" />
        <div className="mt-5 space-y-4">
          {company.groups.map((g) => (
            <AreaGroup
              key={g.id}
              title={g.title}
              blurb={g.blurb}
              action={{ label: `${g.items.length} guides`, href: g.href }}
            >
              <LinkList items={g.items} />
            </AreaGroup>
          ))}
        </div>
      </AreaSection>

      <AreaSection
        id="practice-modules"
        title="Interview Practice and Revision"
        description="The curriculum modules for proving readiness: case-study worksheets, mock interviews, the final week and company loops."
        action={practiceTrack ? { label: 'Open the track', href: learnHref.track(practiceTrack.slug) } : undefined}
      >
        <div className="space-y-2">
          {practiceModules.map((m) => (
            <ModuleCard key={m.slug} module={m} />
          ))}
        </div>
      </AreaSection>

      <AreaSection
        id="topic-hubs"
        title="Interview Topic Hubs"
        description="Five hubs that will gather the questions for each kind of round, with links to the material that answers them."
      >
        <PlannedList items={TOPIC_HUBS} />
      </AreaSection>
    </div>
  )
}
