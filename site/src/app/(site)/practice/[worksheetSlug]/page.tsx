import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { familyMeta, getAllScenarios, getRelated, getScenario } from '@/lib/content'
import { MODES } from '@/lib/editorial'
import { ScenarioView } from '@/components/ScenarioView'
import { BeforeYouStart, MetaStrip, TwinLinks, WhereNext } from '@/components/PageIntro'
import { pageTwins } from '@/lib/twins'
import { Breadcrumbs } from '@/components/learn/Breadcrumbs'
import { MODULE_AREAS, qualifiedTitle, scenarioHref } from '@/lib/scenario'
import { learningResourceJsonLd, pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { Byline } from '@/components/Byline'

/**
 * /practice/<slug>: one technical or behavioural worksheet (ENH-17). The URL drops the
 * track, so slugs are unique across both modules (`check:curriculum`, and the build).
 * Saved answers key on `<track>/<slug>` (src/lib/storage.ts), not on the URL.
 */

type Params = { worksheetSlug: string }

// Any other slug is a 404 at routing time, served as the prerendered not-found page.
export const dynamicParams = false

const worksheets = async () => (await getAllScenarios()).filter((s) => MODULE_AREAS[s.moduleId] === '/practice')

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = (await worksheets()).map((s) => s.slug)
  const clash = slugs.find((s, i) => slugs.indexOf(s) !== i)
  if (clash) throw new Error(`Two worksheets share the slug "${clash}"; /practice/<slug> needs it unique`)
  return slugs.map((worksheetSlug) => ({ worksheetSlug }))
}

async function load(worksheetSlug: string) {
  const ref = (await worksheets()).find((s) => s.slug === worksheetSlug)
  return ref ? getScenario(ref.moduleId, ref.trackId, ref.slug) : null
}

const practiceDescription = (title: string, track: string) => {
  const meta = familyMeta(track)
  return `${MODES[meta.mode].label}: ${title}. ${meta.outcomes[0]}.`
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const scenario = await load((await params).worksheetSlug)
  if (!scenario) return {}
  return pageMetadata({
    path: scenarioHref(scenario.ref),
    title: qualifiedTitle({ title: scenario.title, qualifier: scenario.ref.qualifier }),
    description: practiceDescription(scenario.title, scenario.ref.trackId),
  })
}

export default async function WorksheetPage({ params }: { params: Promise<Params> }) {
  const scenario = await load((await params).worksheetSlug)
  if (!scenario) notFound()
  const { ref } = scenario
  const meta = familyMeta(ref.trackId)
  const [related, twins] = await Promise.all([getRelated(ref), pageTwins(ref)])

  return (
    <div className="py-10">
      <JsonLd
        data={learningResourceJsonLd({
          name: scenario.title,
          description: practiceDescription(scenario.title, ref.trackId),
          path: scenarioHref(ref),
          partOf: { name: 'Practice', path: '/practice' },
          type: 'Worksheet',
        })}
      />
      <Breadcrumbs
        items={[
          { label: 'Practice', href: '/practice' },
          { label: ref.trackTitle, href: `/practice#${ref.trackId}` },
          { label: qualifiedTitle({ title: scenario.title, qualifier: ref.qualifier }) },
        ]}
      />

      <header className="mb-8 max-w-3xl">
        <div className="mb-2 text-[0.8125rem] font-semibold text-accent">{ref.trackTitle}</div>
        <h1 className="text-[2rem] font-bold leading-[1.2] tracking-[-0.02em]">{scenario.title}</h1>
        <Byline updated={ref.updated} report={{ title: scenario.title, path: scenarioHref(ref) }} />
        <TwinLinks links={twins} />
        <div className="mt-3">
          <MetaStrip
            meta={meta}
            minutes={null}
            extra={
              meta.personalisation && (
                <>
                  <span aria-hidden>·</span>
                  <span className="font-semibold text-text">Track each answer as you practise</span>
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
