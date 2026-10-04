import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import * as repo from '@/demo/repo'
import { ContinueButton } from '@/demo/components/ContinueButton'
import { ModuleStatus, SectionBar, TrackRing } from '@/demo/components/islands'
import { TrackTree } from '@/demo/components/TrackTree'
import { Breadcrumbs, Card, Dl, H2, PageHeader, Tag, formatMinutes } from '@/demo/components/ui'

/**
 * Track detail. `generateStaticParams` tells Next 16 every valid `trackId` at build
 * time, so all ten pages prerender as static HTML. In Next 16 `params` is a Promise,
 * which is why the page awaits it.
 */
export function generateStaticParams() {
  return repo.listTracks().map((t) => ({ trackId: t.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ trackId: string }> }): Promise<Metadata> {
  const t = repo.getTrack((await params).trackId)
  return { title: t ? `${t.code} ${t.title}` : 'Track' }
}

export default async function TrackPage({ params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params
  const track = repo.getTrack(trackId)
  if (!track) notFound()
  const sections = repo.listSections(track.id)

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <TrackTree trackId={track.id} />
      <div className="min-w-0">
        <Breadcrumbs items={[{ label: 'Learn', href: '/demo/learn' }, { label: `${track.code} ${track.title}` }]} />
        <PageHeader
          eyebrow={`Track ${track.code}`}
          title={track.title}
          description={track.objective}
          actions={
            <>
              <TrackRing trackId={track.id} size={52} />
              <ContinueButton trackId={track.id} />
            </>
          }
        >
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Tag tone={track.required ? 'accent' : 'neutral'}>{track.required ? 'Required' : 'Optional'}</Tag>
            <Tag>{track.requiredNote}</Tag>
            {!track.inDepth && <Tag>Outline: one fully browsable module</Tag>}
          </div>
        </PageHeader>

        <Card>
          <Dl
            items={[
              ['Target learner', track.targetLearner],
              ['Prerequisites', track.prerequisites],
              ['Estimated time', `~${track.estHours} hours`],
              ['Exit competencies', <ul key="c" className="list-disc pl-4">{track.exitCompetencies.map((c) => <li key={c}>{c}</li>)}</ul>],
            ]}
          />
        </Card>

        <H2>Sections</H2>
        <div className="space-y-3">
          {sections.map((s, i) => {
            const project = s.projectId ? repo.getProject(s.projectId) : undefined
            return (
              <details key={s.id} open={i === 0} className="group rounded-xl border border-border bg-surface">
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-4 py-3">
                  <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 text-subtle transition-transform group-open:rotate-90">
                    <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="font-semibold">{s.title}</span>
                  <span className="text-[0.8125rem] text-subtle">{s.moduleIds.length} modules</span>
                  <span className="ml-auto w-full sm:w-40">
                    <SectionBar sectionId={s.id} />
                  </span>
                </summary>
                <div className="border-t border-border px-4 py-3">
                  <p className="text-[0.875rem] text-muted">{s.purpose}.</p>
                  <ul className="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border">
                    {s.moduleIds.map((id) => {
                      const m = repo.getModule(id)!
                      return (
                        <li key={id}>
                          <Link href={repo.href.module(m)} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5 hover:bg-surface-2">
                            <span className="w-9 shrink-0 text-[0.8125rem] font-semibold tabular-nums text-subtle">{m.code}</span>
                            <span className="min-w-0 flex-1 text-[0.9375rem] font-medium">{m.title}</span>
                            <span className="text-[0.75rem] text-subtle">
                              {m.lessonIds.length} lessons · {formatMinutes(m.estMinutes)}
                            </span>
                            <ModuleStatus moduleId={id} size="xs" />
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                  <dl className="mt-3 grid grid-cols-1 gap-2 text-[0.8125rem] sm:grid-cols-3">
                    <div>
                      <dt className="font-semibold text-subtle">Project</dt>
                      <dd>{project ? <Link href={repo.href.project(project.id)} className="text-accent hover:underline">{project.code} {project.title}</Link> : s.projectLabel}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-subtle">Checkpoint</dt>
                      <dd>{s.assessment}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-subtle">Done when</dt>
                      <dd>{s.doneWhen}</dd>
                    </div>
                  </dl>
                </div>
              </details>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <H2>Related projects</H2>
            <ul className="space-y-1.5 text-[0.875rem]">
              {track.relatedProjectIds.length ? track.relatedProjectIds.map((id) => {
                const p = repo.getProject(id)!
                return <li key={id}><Link href={repo.href.project(id)} className="hover:text-accent">{p.code} {p.title}</Link></li>
              }) : <li className="text-subtle">No project for this track.</li>}
            </ul>
          </div>
          <div>
            <H2>Interview hubs</H2>
            <ul className="space-y-1.5 text-[0.875rem]">
              {track.relatedHubIds.length ? track.relatedHubIds.map((id) => <li key={id}><Link href={repo.href.hub(id)} className="hover:text-accent">{repo.getHub(id)!.title}</Link></li>) : <li className="text-subtle">No linked hub.</li>}
            </ul>
          </div>
          <div>
            <H2>Design cases</H2>
            <ul className="space-y-1.5 text-[0.875rem]">
              {track.relatedCaseIds.length ? track.relatedCaseIds.map((id) => { const c = repo.getCase(id)!; return <li key={id}><Link href={repo.href.case(id)} className="hover:text-accent">{c.code} {c.title}</Link></li> }) : <li className="text-subtle">No linked case.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
