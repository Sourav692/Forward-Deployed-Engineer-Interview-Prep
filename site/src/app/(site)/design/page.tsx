import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { FilteredGroups } from '@/components/areas/FilteredGroups'
import { LEVEL_LABEL } from '@/lib/editorial'
import { ModuleProgress } from '@/components/Progress'
import { ContentsGroup } from '@/components/editorial/ContentsGroup'
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

  // Hallmark, Editorial theme (editorial.css): the name and its argument, then the cases
  // as a contents page, theme by theme, and the method note last.
  return (
    <div className="pb-24">
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Casebook', path: '/design' }])} />
      <header className="cb-hero">
        <div>
          <h1>Casebook</h1>
          <p className="cb-standfirst">
            {counts.designs} worked system designs, grouped by the kind of system they build.
          </p>
        </div>
        <div className="cb-hero-side">
          <p>
            {counts.layeredDesigns} of them read at three depths: the answer you would say in the interview, the
            technical deep dive behind it, and a quick review for the night before.
          </p>
          <div className="mt-6">
            <ModuleProgress scenarios={scenarios} plain />
          </div>
        </div>
      </header>

      <section id="cases" aria-labelledby="cases-heading" className="scroll-mt-20">
        <div className="cb-opens mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
          <h2 id="cases-heading" className="cb-section-head">
            Cases by theme
          </h2>
          <p className="cb-label text-[0.9375rem] text-muted">Filter by theme, level or reading time.</p>
        </div>
        <Suspense
          fallback={
            <div>
              {groups.map((g) => (
                <ContentsGroup key={g.id} group={g} unit={['case', 'cases']} />
              ))}
            </div>
          }
        >
          <FilteredGroups groups={groups} levels={LEVEL_LABEL} noun="designs" unit={['case', 'cases']} time contents />
        </Suspense>
      </section>

      <aside id="method" aria-label="Learn the design method" className="cb-well mt-24 scroll-mt-20 lg:grid lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-10">
        <h2 className="text-[1.75rem] leading-none">Need a structure for your answer?</h2>
        <div className="mt-4 lg:mt-0">
          <p className="max-w-[60ch] text-base">
            The AI System Design track in Learn teaches the framework, whiteboard timing and reusable patterns. Its
            Classic AI designs module takes nine systems through that method in short lessons, each with an interactive
            explorer. Return here for the complete worked designs.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={learnHref.track(METHOD_TRACK)} className="cb-btn cb-btn--primary">
              Learn the design method
            </Link>
            <Link href={learnHref.module({ track: METHOD_TRACK, slug: CLASSIC_MODULE })} className="cb-btn">
              Open Classic AI designs
            </Link>
          </div>
        </div>
      </aside>
    </div>
  )
}
