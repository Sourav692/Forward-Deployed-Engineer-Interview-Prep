import type { Metadata } from 'next'
import { ModuleProgress } from '@/components/Progress'
import { AreaGroup, AreaHeader, AreaSection, LinkList } from '@/components/areas/Area'
import { LIVE, curriculumModules, curriculumTrack, moduleGroups } from '@/components/areas/data'
import { ModuleCard } from '@/components/learn/ModuleCard'
import { learnHref } from '@/lib/learn'
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'

/**
 * /design: the casebook index (FE-11), the one place the designs are listed. A static
 * Server Component that lists every worked system design by theme and links to its page
 * at /design/<slug> (ENH-16). Nothing is copied here; the case pages own their content.
 */

export const metadata: Metadata = pageMetadata({
  path: '/design',
  title: 'Design',
  description:
    'The casebook: complete AI system designs grouped by theme, each readable as a spoken interview answer, a technical deep dive, or a quick review.',
})

const METHOD_TRACK = 'ai-systems-design'

export default async function DesignPage() {
  const { groups, scenarios } = await moduleGroups(LIVE.casebook)
  const method = curriculumModules(METHOD_TRACK)
  const methodTrack = curriculumTrack(METHOD_TRACK)
  const layered = scenarios.filter((s) => s.tabs?.some((t) => t.id === 'deep-dive')).length

  return (
    <div className="py-12">
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Design', path: '/design' }])} />
      <AreaHeader eyebrow="The casebook" title="Design">
        <p>
          {scenarios.length} complete system designs, grouped by the kind of system they build. {layered} of them read
          at three depths: the answer you would say in the interview, the technical deep dive behind it, and a quick
          review for the night before. Learn the method first, then read cases to see it applied.
        </p>
      </AreaHeader>
      <div className="mt-6">
        <ModuleProgress scenarios={scenarios} />
      </div>

      <AreaSection
        id="method"
        title="Learn the Method"
        description={
          <>
            The design framework, the sixty-minute whiteboard routine and the patterns every case reuses. These modules
            live in{' '}
            {methodTrack ? methodTrack.title : 'the curriculum'} under Learn.
          </>
        }
        action={methodTrack ? { label: 'Open the track', href: learnHref.track(methodTrack.slug) } : undefined}
      >
        <div className="space-y-2">
          {method.map((m) => (
            <ModuleCard key={m.slug} module={m} />
          ))}
        </div>
      </AreaSection>

      <AreaSection
        id="cases"
        title="Cases by Theme"
        description="One line per case. Open a case to choose its depth from the tabs at the top of the page."
      >
        <div className="space-y-4">
          {groups.map((g) => (
            <AreaGroup
              key={g.id}
              id={g.id}
              title={g.title}
              blurb={g.blurb}
              action={{ label: `${g.items.length} ${g.items.length === 1 ? 'case' : 'cases'}`, href: g.href }}
            >
              <LinkList items={g.items} />
            </AreaGroup>
          ))}
        </div>
      </AreaSection>
    </div>
  )
}
