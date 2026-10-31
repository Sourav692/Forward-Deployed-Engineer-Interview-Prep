import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { breadcrumbJsonLd, courseJsonLd, pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import {
  REQUIREMENT_LABEL,
  countedMinutes,
  formatMinutes,
  getModuleBySlug,
  getTrack,
  groupTrail,
  learnHref,
  trackMinutes,
  trackParams,
} from '@/lib/learn'
import type { CurriculumModule } from '@/lib/curriculum-types'
import { Breadcrumbs } from '@/components/learn/Breadcrumbs'
import { ModuleCard } from '@/components/learn/ModuleCard'
import { StorageNotice } from '@/components/learn/ProgressIslands'
import { SectionAccordion } from '@/components/learn/SectionAccordion'
import { SideNav } from '@/components/learn/SideNav'
import { DiagnosticText } from '@/components/learn/DiagnosticText'
import { trackTag } from '@/lib/curriculum-href'
import { TextLink } from '@/components/areas/Area'
import { PageHead } from '@/components/editorial/PageHead'

/**
 * Track page (FE-06). Every track is prerendered at build time: `generateStaticParams`
 * lists the slugs, and `dynamicParams = false` makes any other slug a 404 instead of
 * an on-demand render.
 */

type Params = { trackSlug: string }

export const dynamicParams = false

export function generateStaticParams(): Params[] {
  return trackParams()
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const track = getTrack((await params).trackSlug)
  if (!track) return {}
  return pageMetadata({
    path: learnHref.track(track.slug),
    title: track.title,
    description: track.objective,
  })
}

export default async function TrackPage({ params }: { params: Promise<Params> }) {
  const track = getTrack((await params).trackSlug)
  if (!track) notFound()

  // `check:curriculum` rejects unknown and repeated prerequisites.
  const prereqTracks = track.prerequisites.map((s) => getTrack(s)).filter((t) => !!t)

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            ...groupTrail(track).map((c) => ({ name: c.label, path: c.href })),
            { name: track.title, path: learnHref.track(track.slug) },
          ]),
          courseJsonLd({
            name: track.title,
            description: track.objective,
            code: track.code,
            path: learnHref.track(track.slug),
          }),
        ]}
      />
      <Breadcrumbs items={[...groupTrail(track), { label: track.title }]} />
      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
        <SideNav track={track} />
        <div className="min-w-0">
          <PageHead
            tag={trackTag(track) ?? undefined}
            title={track.title}
            standfirst={`${track.objective}.`}
            facts={[
              { term: 'Requirement', value: REQUIREMENT_LABEL[track.required] },
              { term: 'For whom', value: track.forWhom },
              { term: 'Time', value: formatMinutes(trackMinutes(track)) },
              {
                term: 'Before this track',
                value: (
                  <>
                    {prereqTracks.length === 0 && !track.prerequisiteNote && 'Nothing; start here'}
                    {prereqTracks.map((t, i) => (
                      <span key={t.slug}>
                        {i > 0 && ', '}
                        <Link href={learnHref.track(t.slug)} className="underline underline-offset-2">
                          {t.title}
                        </Link>
                      </span>
                    ))}
                    {track.prerequisiteNote && `${prereqTracks.length ? '; ' : ''}${track.prerequisiteNote}`}
                  </>
                ),
              },
            ]}
          />

          <section aria-labelledby="exit" className="mt-6">
            <h2 id="exit" className="text-sm font-semibold">
              Objectives
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text marker:text-subtle">
              {track.exitCompetencies.map((c) => (
                <li key={c}>{c[0].toUpperCase() + c.slice(1)}</li>
              ))}
            </ul>
          </section>

          {track.slug === 'ai-systems-design' && (
            <aside aria-label="Worked design cases" className="mt-6 max-w-3xl rounded-lg border border-border bg-surface p-4 text-sm sm:p-5">
              <p className="text-muted">
                Start here to learn the design framework, whiteboard timing and reusable patterns. The classic design
                lessons are short walkthroughs for recognising those patterns. For complete architectures, deeper
                trade-offs and interview follow-ups, open the worked cases in Casebook.
              </p>
              <div className="mt-3">
                <TextLink href="/design">Explore worked design cases</TextLink>
              </div>
            </aside>
          )}

          <StorageNotice />

          <div className="mt-8 space-y-4">
            {track.sections.map((s) => {
              const modules = s.modules.map((slug) => getModuleBySlug(slug)).filter((m): m is CurriculumModule => !!m)
              const minutes = countedMinutes(modules)
              return (
                <SectionAccordion
                  key={s.slug}
                  id={s.slug}
                  title={s.title}
                  meta={`${modules.length} ${modules.length === 1 ? 'module' : 'modules'}, ${formatMinutes(minutes)}`}
                >
                  <p className="text-sm text-muted">{s.whyItMatters}</p>
                  <ul className="mt-3 space-y-2">
                    {modules.map((m) => (
                      <li key={m.slug}>
                        <ModuleCard module={m} />
                      </li>
                    ))}
                  </ul>
                  <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                    <Fact term="Exercise">
                      <DiagnosticText text={s.exercise} />
                    </Fact>
                    <Fact term="Done when">
                      <DiagnosticText text={s.doneWhen} />
                    </Fact>
                  </dl>
                </SectionAccordion>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

function Fact({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[0.8125rem] font-medium text-subtle">{term}</dt>
      <dd className="mt-1 text-text">{children}</dd>
    </div>
  )
}
