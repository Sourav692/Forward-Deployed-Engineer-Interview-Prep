import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import * as repo from '@/demo/repo'
import { AuthGate, ConfidenceControl, NotesPanel, TrackAccess } from '@/demo/components/islands'
import { AssessmentLinks, LessonChecklist, ModuleSummary, PrereqList, PrerequisiteGate, TestOutButton } from '@/demo/components/ModuleIslands'
import { TrackTree } from '@/demo/components/TrackTree'
import { Breadcrumbs, Card, H2, PageHeader, btn, formatMinutes } from '@/demo/components/ui'

/**
 * Module detail. The page is a Server Component that prerenders every module (54) via
 * `generateStaticParams`; the auth gate, prerequisite card, progress and controls are
 * client islands nested inside it. A Server Component can pass server-rendered JSX as
 * `children` into a client component, so the static content is not re-rendered on the
 * client.
 */
export function generateStaticParams() {
  return repo.listModules().map((m) => ({ trackId: m.trackId, moduleId: m.id }))
}

type Params = Promise<{ trackId: string; moduleId: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const m = repo.getModule((await params).moduleId)
  return { title: m ? `${m.code} ${m.title}` : 'Module' }
}

export default async function ModulePage({ params }: { params: Params }) {
  const { trackId, moduleId } = await params
  const m = repo.getModule(moduleId)
  if (!m || m.trackId !== trackId) notFound()
  const track = repo.getTrack(trackId)!
  const section = repo.getSection(m.sectionId)!
  const { prev, next } = repo.adjacentModules(m.id)
  const firstLesson = repo.listLessons(m.id)[0]
  const href = repo.href.module(m)

  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <TrackTree trackId={track.id} currentModuleId={m.id} />
      <div className="min-w-0">
        <Breadcrumbs
          items={[
            { label: 'Learn', href: '/demo/learn' },
            { label: `${track.code} ${track.title}`, href: repo.href.track(track.id) },
            { label: section.title, href: repo.href.track(track.id) },
            { label: `${m.code} ${m.title}` },
          ]}
        />
        <AuthGate>
          <TrackAccess itemId={m.id} />
          <PageHeader
            eyebrow={`Module ${m.code} · ${formatMinutes(m.estMinutes)}`}
            title={m.title}
            description={m.objective}
            actions={
              <>
                <TestOutButton moduleId={m.id} />
                <Link href={repo.href.lesson(firstLesson)} className={btn.primary}>
                  Continue
                </Link>
              </>
            }
          >
            <div className="mt-4 max-w-md">
              <ModuleSummary moduleId={m.id} />
            </div>
          </PageHeader>

          <PrerequisiteGate moduleId={m.id}>
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="min-w-0">
                <Card className="border-l-4 border-l-accent">
                  <p className="text-[0.8125rem] font-semibold text-accent">Why this matters</p>
                  <p className="mt-1 text-[0.9375rem]">{m.why}</p>
                  {m.unlocks.length > 0 && (
                    <p className="mt-2 text-[0.875rem] text-muted">
                      Unblocks:{' '}
                      {m.unlocks.map((id, i) => {
                        const u = repo.getModule(id)!
                        return (
                          <span key={id}>
                            {i > 0 && ', '}
                            <Link href={repo.href.module(u)} className="font-medium text-text hover:text-accent">
                              {u.code} {u.title}
                            </Link>
                          </span>
                        )
                      })}
                    </p>
                  )}
                </Card>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <h2 className="text-[0.9375rem] font-semibold">Learning objectives</h2>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.9375rem]">
                      {m.outcomes.map((o) => (
                        <li key={o}>{o}</li>
                      ))}
                    </ul>
                    <p className="mt-3 text-[0.8125rem] text-muted">
                      <span className="font-semibold text-text">Scope boundary: </span>
                      {m.scope}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-[0.9375rem] font-semibold">Prerequisites</h2>
                    <div className="mt-2">
                      <PrereqList moduleId={m.id} />
                    </div>
                  </div>
                </div>

                <H2>Lessons</H2>
                <LessonChecklist moduleId={m.id} />
                <H2>Exercise and checkpoint</H2>
                <AssessmentLinks moduleId={m.id} />

                <H2>Common mistakes</H2>
                <ul className="list-disc space-y-1 pl-5 text-[0.9375rem]">
                  {m.commonMistakes.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>

                <div className="mt-10 grid gap-6 sm:grid-cols-2">
                  <div>
                    <h2 className="text-[0.9375rem] font-semibold">Related modules</h2>
                    <ul className="mt-2 space-y-1 text-[0.875rem]">
                      {m.relatedModuleIds.length ? (
                        m.relatedModuleIds.map((id) => {
                          const r = repo.getModule(id)
                          return r ? (
                            <li key={id}>
                              <Link href={repo.href.module(r)} className="hover:text-accent">
                                {r.code} {r.title}
                              </Link>
                            </li>
                          ) : null
                        })
                      ) : (
                        <li className="text-subtle">None listed.</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-[0.9375rem] font-semibold">Interview questions</h2>
                    <ul className="mt-2 space-y-1 text-[0.875rem]">
                      {m.interviewQuestionIds.length ? (
                        m.interviewQuestionIds.slice(0, 5).map((id) => {
                          const q = repo.getQuestion(id)!
                          return (
                            <li key={id}>
                              <Link href={repo.href.question(q)} className="hover:text-accent">
                                {q.prompt}
                              </Link>
                            </li>
                          )
                        })
                      ) : (
                        <li className="text-subtle">No linked questions yet.</li>
                      )}
                    </ul>
                  </div>
                </div>

                <p className="mt-8 rounded-md bg-surface-2 px-3 py-2 text-[0.8125rem] text-muted">
                  <span className="font-semibold text-text">Canonical source (placeholder): </span>
                  <code className="break-all">{m.canonicalSource}</code>
                </p>
              </div>

              <aside className="space-y-6 xl:sticky xl:top-20 xl:self-start">
                <Card>
                  <ConfidenceControl itemId={m.id} label={m.code} href={href} />
                </Card>
                <Card>
                  <NotesPanel itemId={m.id} label={`${m.code} ${m.title}`} href={href} />
                </Card>
              </aside>
            </div>
          </PrerequisiteGate>

          <nav aria-label="Module navigation" className="mt-12 flex flex-wrap justify-between gap-3 border-t border-border pt-6 text-[0.875rem]">
            {prev ? (
              <Link href={repo.href.module(prev)} className="hover:text-accent">
                ← {prev.code} {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={repo.href.module(next)} className="text-right hover:text-accent">
                {next.code} {next.title} →
              </Link>
            )}
          </nav>
        </AuthGate>
      </div>
    </div>
  )
}
