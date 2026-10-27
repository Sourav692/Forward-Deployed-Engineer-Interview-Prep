import { familyMeta, getRelated } from '@/lib/content'
import { documentsOf, hasChapters, scenarioHref, type CaseDocument, type CaseStudy } from '@/lib/scenario'
import { learningResourceJsonLd } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { Byline } from '@/components/Byline'
import { CaseStudyView } from '@/components/CaseStudyView'
import { Breadcrumbs, type Crumb } from '@/components/learn/Breadcrumbs'
import { BeforeYouStart, Fact, MetaStrip, TwinLinks, WhereNext } from '@/components/PageIntro'
import { pageTwins } from '@/lib/twins'

export const caseDescription = (study: CaseStudy) =>
  study.ref.moduleId === '16-company-oriented-prep'
    ? `Company-oriented interview preparation: ${study.title}.`
    : `FDE case study: ${study.title} — ${documentsOf(study).map((d) => d.label.toLowerCase()).join(', ')}.`

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
  const minutes = study.docs.reduce((sum, d) => sum + d.minutes, 0)
  const documents = documentsOf(study)

  return (
    <div className="py-10">
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

      <header className="mb-6 max-w-3xl">
        <div className="mb-2 text-[0.8125rem] font-semibold text-accent">{study.ref.trackTitle}</div>
        <h1 className="text-[2rem] font-bold leading-[1.2] tracking-[-0.02em]">{study.title}</h1>
        <Byline updated={study.ref.updated} report={{ title: study.title, path: scenarioHref(study.ref) }} />
        <TwinLinks links={twins} />
        <div className="mt-3">
          <MetaStrip
            meta={meta}
            minutes={documents.length === 1 ? minutes : null}
            extra={
              documents.length > 1 && (
                <>
                  <span aria-hidden>·</span>
                  <span>
                    {documents.length} documents, {minutes} min in total
                  </span>
                </>
              )
            }
          />
        </div>
        <BeforeYouStart meta={meta}>
          <ReadingOrder study={study} documents={documents} />
        </BeforeYouStart>
      </header>

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
  // With chapters, the full design is reference material the other tabs were drawn from,
  // so it sits after the reading order instead of being its longest step.
  const reference = hasChapters(study) ? documents.find((d) => d.tab === 'full-pack') : undefined
  const steps = documents.filter((d) => d !== reference)
  return (
    <>
      {documents.length > 1 && (
        <Fact term="Reading order">
          <ol className="list-decimal space-y-0.5 pl-4 marker:text-subtle">
            {steps.map((d) => (
              <li key={d.tab}>
                <DocumentLink document={d} />
              </li>
            ))}
          </ol>
          {reference && (
            <p className="mt-1.5">
              For detail and sources: <DocumentLink document={reference} />
            </p>
          )}
        </Fact>
      )}
      <Fact term="Sources">
        {study.sources ? (
          <>
            The references for every tab are in{' '}
            <a href={`#${study.sources.anchor}`} className="text-accent underline underline-offset-2 hover:text-accent-hover">
              {sourcesLabel(study.sources.tab, documents, study.sources.label)} → {study.sources.title}
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
      <span className="text-subtle">
        · {d.minutes} min{d.parts.length > 1 && `, ${d.parts.length} parts`}
      </span>
    </>
  )
}

/** "Full Design, part 5" for a part of a split document; the tab's own label otherwise. */
function sourcesLabel(tab: string, documents: CaseDocument[], fallback: string) {
  const d = documents.find((doc) => doc.parts.length > 1 && doc.parts.some((p) => p.tab === tab))
  return d ? `${d.label}, part ${d.parts.findIndex((p) => p.tab === tab) + 1}` : fallback
}
