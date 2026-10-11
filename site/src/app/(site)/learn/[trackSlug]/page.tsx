import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { breadcrumbJsonLd, courseJsonLd, pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import {
  REQUIREMENT_LABEL,
  formatMinutes,
  getModuleBySlug,
  getTrack,
  isRequired,
  learnHref,
  moduleTime,
  trackHours,
  trackParams,
} from '@/lib/learn'
import type { CurriculumModule } from '@/lib/curriculum-types'
import { Breadcrumbs } from '@/components/learn/Breadcrumbs'
import { ModuleCard } from '@/components/learn/ModuleCard'
import { StorageNotice } from '@/components/learn/ProgressIslands'
import { SectionAccordion } from '@/components/learn/SectionAccordion'
import { SideNav } from '@/components/learn/SideNav'
import { Tag } from '@/components/ui'
import { DiagnosticText } from '@/components/learn/DiagnosticText'
import { trackTag } from '@/lib/curriculum-href'

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

  const prereqTracks = track.prerequisites
    .filter((s, i, all) => all.indexOf(s) === i)
    .map((s) => getTrack(s))
    .filter((t) => !!t)

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Learn', path: learnHref.index() },
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
      <Breadcrumbs items={[{ label: 'Learn', href: learnHref.index() }, { label: track.title }]} />
      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
        <SideNav track={track} />
        <div className="min-w-0">
          <header className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              {trackTag(track) && <span className="text-xs font-semibold tabular-nums text-subtle">{trackTag(track)}</span>}
              <Tag tone={isRequired(track) ? 'accent' : 'neutral'}>{REQUIREMENT_LABEL[track.required]}</Tag>
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{track.title}</h1>
            <p className="mt-3 text-base text-muted">{track.objective}.</p>
          </header>

          <dl className="mt-6 grid gap-4 rounded-lg border border-border bg-surface p-4 text-sm sm:grid-cols-3 sm:p-5">
            <Fact term="For whom">{track.forWhom}</Fact>
            <Fact term="Time">About {trackHours(track)} hours</Fact>
            <Fact term="Before this track">
              {prereqTracks.length === 0 && !track.prerequisiteNote && 'Nothing; start here'}
              {prereqTracks.map((t, i) => (
                <span key={t.slug}>
                  {i > 0 && ', '}
                  <Link href={learnHref.track(t.slug)} className="text-accent underline underline-offset-2">
                    {t.title}
                  </Link>
                </span>
              ))}
              {track.prerequisiteNote && `${prereqTracks.length ? '; ' : ''}${track.prerequisiteNote}`}
            </Fact>
          </dl>

          <section aria-labelledby="exit" className="mt-6">
            <h2 id="exit" className="text-sm font-semibold">
              By the end you can
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text marker:text-subtle">
              {track.exitCompetencies.map((c) => (
                <li key={c}>{c[0].toUpperCase() + c.slice(1)}</li>
              ))}
            </ul>
          </section>

          <StorageNotice />

          <div className="mt-8 space-y-4">
            {track.sections.map((s) => {
              const modules = s.modules.map((slug) => getModuleBySlug(slug)).filter((m): m is CurriculumModule => !!m)
              const minutes = modules.reduce((sum, m) => sum + moduleTime(m).total, 0)
              return (
                <SectionAccordion
                  key={s.slug}
                  id={s.slug}
                  title={s.title}
                  meta={`${modules.length} ${modules.length === 1 ? 'module' : 'modules'} · ${formatMinutes(minutes)}`}
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
      <dt className="text-xs font-semibold uppercase tracking-wide text-subtle">{term}</dt>
      <dd className="mt-1 text-text">{children}</dd>
    </div>
  )
}
