import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllScenarios, getCaseStudy } from '@/lib/content'
import { getModule } from '@/lib/registry'
import { CaseStudyPage, caseDescription } from '@/components/CaseStudyPage'
import { MODULE_AREAS, qualifiedTitle, scenarioHref } from '@/lib/scenario'
import { pageMetadata } from '@/lib/seo'

/**
 * Pages of modules not served by an area: only the company prep guides (module 16,
 * unpublished), so this builds nothing today. The casebook lives at /design/<slug> and
 * the worksheets at /practice/<slug> (ENH-16, ENH-17); their old URLs redirect there.
 */

type Params = { module: string; track: string; scenario: string }

// Any other param is a 404 at routing time, served as the prerendered not-found page.
export const dynamicParams = false

export async function generateStaticParams() {
  const scenarios = (await getAllScenarios()).filter((s) => s.reading && !(s.moduleId in MODULE_AREAS))
  return scenarios.map((s) => ({
    module: s.moduleId,
    track: s.trackId,
    scenario: s.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { module: moduleId, track, scenario: slug } = await params
  const study = await getCaseStudy(moduleId, track, slug)
  return study
    ? pageMetadata({
        path: scenarioHref(study.ref),
        title: qualifiedTitle(study.ref),
        description: caseDescription(study),
      })
    : {}
}

export default async function ScenarioPage({ params }: { params: Promise<Params> }) {
  const { module: moduleId, track, scenario: slug } = await params
  const moduleMeta = getModule(moduleId)
  const study = await getCaseStudy(moduleId, track, slug)
  if (!moduleMeta || !study) notFound()
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
