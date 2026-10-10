import type { Metadata } from 'next'
import { AreaHeader, AreaSection, LinkList } from '@/components/areas/Area'
import { curriculumModules } from '@/components/areas/data'
import { ModuleCard } from '@/components/learn/ModuleCard'
import { LAST_DAY, LAST_DAY_GUIDES, MODES, REVIEWS } from '@/lib/editorial'
import { INTERVIEW_HUBS } from '@/lib/curriculum'
import { hubHref } from '@/lib/curriculum-href'
import { INTERVIEW_TRACK } from '@/lib/learn'
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'

/**
 * /interview: the interview prep area (FE-11). It is the home of the interview
 * practice track (worksheets, mock interviews, final week), whose module and lesson
 * pages live at /interview/<module>/<lesson> rather than under /learn, and it links
 * to the final-week review (/fde-last-day-prep) and the five topic hubs
 * (/interview/hubs/<hub>). Company-specific packs have their own area at /company-prep.
 */

export const metadata: Metadata = pageMetadata({
  path: '/interview',
  title: 'Interview',
  description:
    'Interview preparation: case-study worksheets, mock interviews and scorecards, and the final-week review.',
})

/** Company loops is a company-prep module; it is surfaced under Company Prep, not here. */
const COMPANY_MODULE = 'company-loops'

export default function InterviewPage() {
  // On-hold modules stay off the hub (audit check FV-03); their own pages still exist.
  const practiceModules = curriculumModules(INTERVIEW_TRACK).filter(
    (m) => m.slug !== COMPANY_MODULE && m.status !== 'on-hold',
  )

  return (
    <div className="py-12">
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Interview', path: '/interview' }])} />
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
        description="Practice grouped by what the interviewer tests: the question lessons and timed rounds for each kind of round, and the modules behind them."
      >
        <LinkList items={INTERVIEW_HUBS.map((h) => ({ href: hubHref(h.slug), title: h.title, note: h.summary }))} />
      </AreaSection>
    </div>
  )
}
