import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { familyMeta, getAllScenarios, getCaseStudy, getRelated, getScenario } from '@/lib/content'
import { getModule } from '@/lib/registry'
import { MODES } from '@/lib/editorial'
import { ScenarioView } from '@/components/ScenarioView'
import { CaseStudyPage, caseDescription } from '@/components/CaseStudyPage'
import { BeforeYouStart, MetaStrip, WhereNext } from '@/components/PageIntro'
import { CASEBOOK_MODULE, qualifiedTitle, scenarioHref, type ScenarioRef } from '@/lib/scenario'
import { learningResourceJsonLd, pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { Byline } from '@/components/Byline'

type Params = { module: string; track: string; scenario: string }

// Any other param is a 404 at routing time, served as the prerendered not-found page.
export const dynamicParams = false

// The casebook lives at /design/<slug> (ENH-16); its old URLs redirect there.
export async function generateStaticParams() {
  const scenarios = (await getAllScenarios()).filter((s) => s.moduleId !== CASEBOOK_MODULE)
  return scenarios.map((s) => ({
    module: s.moduleId,
    track: s.trackId,
    scenario: s.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { module: moduleId, track, scenario: slug } = await params
  if (getModule(moduleId)?.kind === 'reading') {
    const study = await getCaseStudy(moduleId, track, slug)
    return study
      ? pageMetadata({
          path: scenarioHref(study.ref),
          title: `${study.ref.tag} · ${qualifiedTitle(study.ref)}`,
          description: caseDescription(study),
        })
      : {}
  }
  const scenario = await getScenario(moduleId, track, slug)
  if (!scenario) return {}
  return pageMetadata({
    path: scenarioHref(scenario.ref),
    title: qualifiedTitle({ title: scenario.title, qualifier: scenario.ref.qualifier }),
    description: practiceDescription(scenario.title, track),
  })
}

const practiceDescription = (title: string, track: string) => {
  const meta = familyMeta(track)
  return `${MODES[meta.mode].label}: ${title}. ${meta.outcomes[0]}.`
}

/** Practice and behavioural pages sit under Practice. */
function Breadcrumbs({ moduleId, page }: { moduleId: string; page: ScenarioRef }) {
  const meta = getModule(moduleId)
  return (
    <nav aria-label="Breadcrumb" className="no-print mb-6 flex flex-wrap items-center gap-1.5 text-[0.8125rem] text-subtle">
      <Link href="/#practice" className="transition-colors hover:text-text">
        Practice
      </Link>
      <span aria-hidden>/</span>
      <Link href={`/modules/${moduleId}`} className="transition-colors hover:text-text">
        {meta?.title ?? moduleId}
      </Link>
      <span aria-hidden>/</span>
      <Link href={`/modules/${moduleId}#${page.trackId}`} className="transition-colors hover:text-text">
        {page.trackTitle}
      </Link>
      {page.qualifier && (
        <>
          <span aria-hidden>/</span>
          <span className="text-muted">{page.qualifier}</span>
        </>
      )}
    </nav>
  )
}

export default async function ScenarioPage({ params }: { params: Promise<Params> }) {
  const { module: moduleId, track, scenario: slug } = await params
  const moduleMeta = getModule(moduleId)
  if (moduleMeta?.kind === 'reading') {
    // Company prep guides (module 16, unpublished). The casebook has its own route.
    const study = await getCaseStudy(moduleId, track, slug)
    if (!study) notFound()
    return (
      <CaseStudyPage
        study={study}
        crumbs={[
          { label: moduleMeta.title, href: `/modules/${moduleId}` },
          { label: study.ref.trackTitle, href: `/modules/${moduleId}#${track}` },
          { label: qualifiedTitle(study.ref) },
        ]}
        partOf={{ name: moduleMeta.title, path: `/modules/${moduleId}` }}
      />
    )
  }

  const scenario = await getScenario(moduleId, track, slug)
  if (!scenario) notFound()
  const meta = familyMeta(track)
  const related = await getRelated(scenario.ref)

  return (
    <div className="py-10">
      <JsonLd
        data={learningResourceJsonLd({
          name: scenario.title,
          description: practiceDescription(scenario.title, track),
          path: scenarioHref(scenario.ref),
          partOf: { name: moduleMeta?.title ?? scenario.ref.trackTitle, path: `/modules/${moduleId}` },
          type: 'Worksheet',
        })}
      />
      <Breadcrumbs moduleId={moduleId} page={scenario.ref} />

      <header className="mb-8 max-w-3xl">
        <div className="mb-2 flex items-center gap-2.5">
          <span className="text-[0.8125rem] font-bold tabular-nums text-accent">
            {meta.personalisation ? 'Question set' : 'Scenario'} {String(scenario.ref.order).padStart(2, '0')}
          </span>
          <span className="text-[0.8125rem] text-subtle">{scenario.ref.trackTitle}</span>
        </div>
        <h1 className="text-[2rem] font-bold leading-[1.2] tracking-[-0.02em]">
          {scenario.title}
        </h1>
        <Byline updated={scenario.ref.updated} report={{ title: scenario.title, path: scenarioHref(scenario.ref) }} />
        <div className="mt-3">
          <MetaStrip
            meta={meta}
            minutes={null}
            extra={
              meta.personalisation && (
                <>
                  <span aria-hidden>·</span>
                  <span className="font-semibold text-text">
                    Track each answer as you practise
                  </span>
                </>
              )
            }
          />
        </div>
        <BeforeYouStart meta={meta} />
      </header>

      <ScenarioView scenario={scenario} behavioral={meta.mode === 'behavioural'} />

      <WhereNext reviews={related.reviews} counterpart={related.counterpart} next={null} />
    </div>
  )
}
