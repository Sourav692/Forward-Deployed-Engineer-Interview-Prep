import type { Metadata } from 'next'
import { Suspense } from 'react'
import { FilteredGroups } from '@/components/areas/FilteredGroups'
import { LEVEL_LABEL } from '@/lib/editorial'
import { ModuleProgress } from '@/components/Progress'
import { AreaGroup, AreaHeader, AreaSection, LinkList, TextLink } from '@/components/areas/Area'
import { LIVE, moduleGroups, siteCounts } from '@/components/areas/data'
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
  title: 'Casebook',
  description:
    'The casebook: complete AI system designs grouped by theme, each readable as a spoken interview answer, a technical deep dive, or a quick review.',
})

const METHOD_TRACK = 'ai-systems-design'
/** The short Learn versions of nine cases (T5.4); its lessons and these cases link to each other. */
const CLASSIC_MODULE = 'classic-ai-designs'

export default async function DesignPage() {
  const { groups, scenarios } = await moduleGroups(LIVE.casebook)
  const counts = await siteCounts()

  return (
    <div className="py-12">
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Casebook', path: '/design' }])} />
      <AreaHeader eyebrow="Worked system designs" title="Casebook">
        <p>
          {counts.designs} complete system designs, grouped by the kind of system they build. {counts.layeredDesigns} of them read
          at three depths: the answer you would say in the interview, the technical deep dive behind it, and a quick
          review for the night before. Choose a case to study the architecture, trade-offs and failure modes in depth.
        </p>
      </AreaHeader>
      <aside id="method" aria-label="Learn the design method" className="mt-6 max-w-3xl scroll-mt-20 rounded-lg border border-border bg-surface p-4 text-sm sm:p-5">
        <p className="text-muted">
          Need a structure for your answer? The AI Systems Design track in Learn teaches the framework, whiteboard
          timing and reusable patterns. Its Classic AI designs module takes nine systems through that method in
          short lessons, each with an interactive explorer. Return here for the complete worked designs.
        </p>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          <TextLink href={learnHref.track(METHOD_TRACK)}>Learn the design method</TextLink>
          <TextLink href={learnHref.module({ track: METHOD_TRACK, slug: CLASSIC_MODULE })}>Open Classic AI designs</TextLink>
        </div>
      </aside>
      <div className="mt-6">
        <ModuleProgress scenarios={scenarios} />
      </div>

      <AreaSection
        id="cases"
        title="Cases by Theme"
        description="One line per case; filter by theme, level or reading time. Open a case to choose its depth from the tabs at the top of the page."
      >
        <Suspense
          fallback={
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
          }
        >
          <FilteredGroups groups={groups} levels={LEVEL_LABEL} noun="designs" unit={['case', 'cases']} time />
        </Suspense>
      </AreaSection>
    </div>
  )
}
