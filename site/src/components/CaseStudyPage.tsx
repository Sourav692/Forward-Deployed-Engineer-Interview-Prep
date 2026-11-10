import { familyMeta, getRelated } from '@/lib/content'
import { MODES, itemLevel } from '@/lib/editorial'
import { documentsOf, hasChapters, scenarioHref, type CaseDocument, type CaseStudy } from '@/lib/scenario'
import { learningResourceJsonLd } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { CaseStudyView } from '@/components/CaseStudyView'
import { Breadcrumbs, type Crumb } from '@/components/learn/Breadcrumbs'
import { BeforeYouStart, Fact, WhereNext } from '@/components/PageIntro'
import { PageHead } from '@/components/editorial/PageHead'
import { pageTwins } from '@/lib/twins'
import { SHOW_STUDY_TIME } from '@/lib/study-time'

export const caseDescription = (study: CaseStudy) =>
  study.ref.moduleId === '16-company-oriented-prep'
    ? `Company-oriented interview preparation: ${study.title}.`
    : `FDE case study: ${study.title} — ${documentsOf(study).filter((d) => d.tab !== 'intro').map((d) => d.label.toLowerCase()).join(', ')}.`

/**
 * A reading page: the casebook designs at /design/<slug> (ENH-16), and the company prep
 * guides under /modules/16-… when they are published. The route decides the trail.
 */
export async function CaseStudyPage({
  study,
  crumbs,
  partOf,
}: {
  study: CaseStudy
  crumbs: Crumb[]
  partOf: { name: string; path: string }
}) {
  const meta = familyMeta(study.ref.trackId)
  const [related, twins] = await Promise.all([getRelated(study.ref), pageTwins(study.ref)])
  // The Introduction is the case's landing page, not one of its documents.
  const documents = documentsOf(study).filter((d) => d.tab !== 'intro')
  const minutes = documents.reduce((sum, d) => sum + d.minutes, 0)

  return (
    <div className="pb-20 pt-8">
      <JsonLd
        data={learningResourceJsonLd({
          name: study.title,
          description: caseDescription(study),
          path: scenarioHref(study.ref),
          minutes,
          partOf,
          type: 'Case study',
        })}
      />
      <Breadcrumbs items={crumbs} />

      <PageHead
        tag={study.ref.trackTitle}
        title={study.title}
        facts={[
          { term: 'Kind', value: MODES[meta.mode].label },
          { term: 'Level', value: itemLevel(`${study.ref.trackId}/${study.ref.slug}`, meta.difficulty) },
          ...(SHOW_STUDY_TIME
            ? [{ term: 'Reading time', value: documents.length > 1 ? `${documents.length} documents, ${minutes} min in total` : `${minutes} min` }]
            : documents.length > 1
              ? [{ term: 'Documents', value: String(documents.length) }]
              : []),
        ]}
        updated={study.ref.updated}
        twins={twins}
        report={{ title: study.title, path: scenarioHref(study.ref) }}
      >
        {/* A chapters case says all of this on its Introduction page instead. */}
        {!hasChapters(study) && (
          <BeforeYouStart meta={meta}>
            <ReadingOrder study={study} documents={documents} />
          </BeforeYouStart>
        )}
      </PageHead>

      <CaseStudyView study={study} />

      <WhereNext reviews={related.reviews} counterpart={related.counterpart} next={null} />
    </div>
  )
}

/**
 * The tabs in the order worth reading them, with time per tab, plus where the sources
 * live and any superseded versions — so every tab can reach the provenance without
 * repeating it.
 */
function ReadingOrder({ study, documents }: { study: CaseStudy; documents: CaseDocument[] }) {
  return (
    <>
      {documents.length > 1 && (
        <Fact term="Reading order">
          <ol className="list-decimal space-y-0.5 pl-4 marker:text-subtle">
            {documents.map((d) => (
              <li key={d.tab}>
                <DocumentLink document={d} />
              </li>
            ))}
          </ol>
        </Fact>
      )}
      <Fact term="Sources">
        {study.sources ? (
          <>
            The references for every tab are in{' '}
            <a href={`#${study.sources.anchor}`} className="whitespace-nowrap text-accent underline underline-offset-2 hover:text-accent-hover">
              {study.sources.label}, {study.sources.title}
            </a>
            .
          </>
        ) : (
          'This case does not cite external sources; treat vendor-specific details as illustrative.'
        )}
      </Fact>
    </>
  )
}

function DocumentLink({ document: d }: { document: CaseDocument }) {
  return (
    <>
      <a href={`#${d.tab}`} className="text-accent underline underline-offset-2 hover:text-accent-hover">
        {d.label}
      </a>{' '}
      {(SHOW_STUDY_TIME || d.parts.length > 1) && (
        <span className="text-subtle">
          ({[...(SHOW_STUDY_TIME ? [`${d.minutes} min`] : []), ...(d.parts.length > 1 ? [`${d.parts.length} parts`] : [])].join(', ')})
        </span>
      )}
    </>
  )
}

