import type { Metadata } from 'next'
import { AreaHeader, AreaSection, LinkList, PlannedList } from '@/components/areas/Area'
import { curriculumModules } from '@/components/areas/data'
import { ModuleCard } from '@/components/learn/ModuleCard'
import { LAST_DAY, LAST_DAY_GUIDES, MODES, REVIEWS } from '@/lib/editorial'
import { INTERVIEW_TRACK } from '@/lib/learn'

/**
 * /interview: the interview prep area (FE-11). It is the home of the interview
 * practice track (worksheets, mock interviews, final week), whose module and lesson
 * pages live at /interview/<module>/<lesson> rather than under /learn, and it links
 * to the final-week review (/fde-last-day-prep). Company-specific packs have their
 * own area at /company-prep. The five topic hubs arrive with FE-18 in Phase 2; until
 * then they are listed as Coming soon without links.
 */

export const metadata: Metadata = {
  title: 'Interview',
  description:
    'Interview preparation: case-study worksheets, mock interviews and scorecards, and the final-week review.',
}

/** Company loops is a company-prep module; it is surfaced under Company Prep, not here. */
const COMPANY_MODULE = 'company-loops'

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

export default function InterviewPage() {
  const practiceModules = curriculumModules(INTERVIEW_TRACK).filter((m) => m.slug !== COMPANY_MODULE)

  return (
    <div className="py-12">
      <AreaHeader eyebrow="Interview" title="Get Ready for the Loop">
        <p>
          The last stretch before an interview: full practice rounds under time, scored against a rubric, and condensed
          revision of what you already know.
        </p>
      </AreaHeader>

      <AreaSection
        id="practice-modules"
        title="Interview Practice and Revision"
        description="Prove readiness under realistic conditions: case-study worksheets, mock interviews with scorecards, and the final week."
      >
        <div className="space-y-2">
          {practiceModules.map((m) => (
            <ModuleCard key={m.slug} module={m} />
          ))}
        </div>
      </AreaSection>

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
        id="topic-hubs"
        title="Interview Topic Hubs"
        description="Five hubs that will gather the questions for each kind of round, with links to the material that answers them."
      >
        <PlannedList items={TOPIC_HUBS} />
      </AreaSection>
    </div>
  )
}
