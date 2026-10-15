import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllScenarios, getCaseStudy } from '@/lib/content'
import { CASEBOOK_MODULE, qualifiedTitle, scenarioHref } from '@/lib/scenario'
import { pageMetadata } from '@/lib/seo'
import { CaseStudyPage, caseDescription } from '@/components/CaseStudyPage'

/**
 * /design/<case-slug>: one casebook design (ENH-16). The URL drops the theme, so slugs
 * must be unique across themes; `check:curriculum` and the build both fail on a clash.
 * Saved progress keys on `<theme>/<slug>` (CaseStudyView), not on the URL.
 */

type Params = { caseSlug: string }

// Any other slug is a 404 at routing time, served as the prerendered not-found page.
export const dynamicParams = false

const casebook = async () => (await getAllScenarios()).filter((s) => s.moduleId === CASEBOOK_MODULE)

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = (await casebook()).map((s) => s.slug)
  const clash = slugs.find((s, i) => slugs.indexOf(s) !== i)
  if (clash) throw new Error(`Two casebook designs share the slug "${clash}"; /design/<slug> needs it unique`)
  return slugs.map((caseSlug) => ({ caseSlug }))
}

async function load(caseSlug: string) {
  const ref = (await casebook()).find((s) => s.slug === caseSlug)
  return ref ? getCaseStudy(CASEBOOK_MODULE, ref.trackId, ref.slug) : null
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const study = await load((await params).caseSlug)
  return study
    ? pageMetadata({
        path: scenarioHref(study.ref),
        title: qualifiedTitle(study.ref),
        description: caseDescription(study),
      })
    : {}
}

export default async function CasePage({ params }: { params: Promise<Params> }) {
  const study = await load((await params).caseSlug)
  if (!study) notFound()
  return (
    <CaseStudyPage
      study={study}
      crumbs={[
        { label: 'Casebook', href: '/design' },
        { label: study.ref.trackTitle, href: `/design#${study.ref.trackId}` },
        { label: qualifiedTitle(study.ref) },
      ]}
      partOf={{ name: 'Casebook', path: '/design' }}
    />
  )
}
