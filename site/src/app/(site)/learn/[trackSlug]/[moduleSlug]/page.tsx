import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import {
  capitalise,
  formatMinutes,
  getModule,
  getModuleBySlug,
  getSection,
  getTrack,
  inlineHtml,
  learnHref,
  moduleInput,
  moduleTime,
  moduleParams,
  readingList,
  relatedModules,
  trackModules,
  trackTrail,
} from '@/lib/learn'
import type { CurriculumModule } from '@/lib/curriculum-types'
import { Breadcrumbs } from '@/components/learn/Breadcrumbs'
import { CheckpointPanel } from '@/components/learn/CheckpointPanel'
import { getCheckpoint } from '@/lib/checkpoints'
import { ConfidenceControl } from '@/components/learn/ConfidenceControl'
import { COPY } from '@/components/learn/copy'
import { GapPanel } from '@/components/learn/GapPanel'
import { ModuleNotes } from '@/components/learn/LessonActions'
import { ModulePathFlag } from '@/components/learn/PathFlagIslands'
import { PrerequisiteCard } from '@/components/learn/PrerequisiteCard'
import { ModuleProgress, ModuleStatusBadge, StorageNotice } from '@/components/learn/ProgressIslands'
import { ReadingList } from '@/components/learn/ReadingList'
import { SideNav } from '@/components/learn/SideNav'
import { EmptyState, LinkButton, Tag } from '@/components/ui'
import { PrevNext } from '@/components/PrevNext'
import { DiagnosticText } from '@/components/learn/DiagnosticText'
import { LISTED_ELSEWHERE, isLearnTrack, moduleTag } from '@/lib/curriculum-href'
import { PageHead } from '@/components/editorial/PageHead'

/**
 * Module page (FE-07). Prerendered for every Learn module (`generateStaticParams` +
 * `dynamicParams = false`); the page is a Server Component and only the progress
 * pieces (status, prerequisite check, progress bar, confidence, notes) are islands.
 */

type Params = { trackSlug: string; moduleSlug: string }

export const dynamicParams = false

export function generateStaticParams(): Params[] {
  return moduleParams()
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { trackSlug, moduleSlug } = await params
  const mod = getModule(trackSlug, moduleSlug)
  if (!mod) return {}
  return pageMetadata({
    path: learnHref.module(mod),
    title: `${mod.title} · ${getTrack(trackSlug)?.title ?? mod.track}`,
    ogTitle: mod.title,
    description: capitalise(mod.objective),
  })
}

export default async function ModulePage({ params }: { params: Promise<Params> }) {
  const { trackSlug, moduleSlug } = await params
  const mod = getModule(trackSlug, moduleSlug)
  const track = getTrack(trackSlug)
  if (!mod || !track) notFound()

  const section = getSection(mod)
  const list = readingList(mod)
  const time = moduleTime(mod)
  const input = moduleInput(mod)
  const checkpoint = getCheckpoint(mod.slug)
  const related = relatedModules(mod)
  const gap = mod.status === 'coming-soon' || mod.status === 'on-hold'
  const prereqModules = mod.prerequisites.map((s) => getModuleBySlug(s)).filter((m): m is CurriculumModule => !!m)
  // A module with no lessons of its own that is not ready is planned work: its list
  // is related reading, so there is nothing to start (audit check FV-05).
  const firstLesson = list.seeAlsoIsMain && mod.status !== 'ready' ? undefined : list.main[0]
  const trail = trackTrail(track)
  // Modules in track order; the overview links to its neighbours (ENH-22, PQ-05).
  const order = trackModules(track).filter((m) => !LISTED_ELSEWHERE.has(m.slug))
  const at = order.findIndex((m) => m.slug === mod.slug)
  const prevModule = at > 0 ? order[at - 1] : null
  const nextModule = at >= 0 && at < order.length - 1 ? order[at + 1] : null
  // An area-served track (/interview) renders in its area's Editorial theme: the head
  // becomes a ruled spec line instead of the dot-joined Learn meta.
  const area = !isLearnTrack(track.slug)
  const lessonCount = list.main.length > 0 ? `${list.main.length} ${list.main.length === 1 ? 'lesson' : 'lessons'}${mod.listedOn ? ', listed in the casebook' : ''}` : null
  // Section anchors exist only on Learn track pages.
  const sectionCrumb = section && trail.length > 1 ? [{ label: section.title, href: `${learnHref.track(track.slug)}#${section.slug}` }] : []

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          ...trail.map((c) => ({ name: c.label, path: c.href })),
          { name: mod.title, path: learnHref.module(mod) },
        ])}
      />
      <Breadcrumbs
        items={[...trail, ...sectionCrumb, { label: mod.title }]}
      />
      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
        <SideNav track={track} currentModule={mod.slug} />
        <div className="min-w-0 max-w-3xl">
          {area ? (
            <PageHead
              title={mod.title}
              standfirst={`${capitalise(mod.objective)}.`}
              facts={[
                { term: 'Time', value: `About ${formatMinutes(time.total)}${time.practice > 0 ? `: ${formatMinutes(time.reading)} reading, ${formatMinutes(time.practice)} practice` : ''}` },
                ...(lessonCount ? [{ term: 'Lessons', value: lessonCount }] : []),
              ]}
            >
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <ModuleStatusBadge input={input} />
                {mod.status === 'partly' && <Tag>Partly ready</Tag>}
                <ModulePathFlag moduleSlug={mod.slug} />
              </div>
            </PageHead>
          ) : (
          <header>
            <div className="flex flex-wrap items-center gap-2">
              {moduleTag(mod) && <span className="text-xs font-semibold tabular-nums text-subtle">{moduleTag(mod)}</span>}
              <ModuleStatusBadge input={input} />
              {mod.status === 'partly' && <Tag>Partly ready</Tag>}
              <ModulePathFlag moduleSlug={mod.slug} />
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{mod.title}</h1>
            <p className="mt-3 text-lg text-muted">{capitalise(mod.objective)}.</p>
            <p className="mt-2 text-sm text-muted">
              About {formatMinutes(time.total)}
              {time.practice > 0 && `: ${formatMinutes(time.reading)} reading + ${formatMinutes(time.practice)} practice`}
              {lessonCount && ` · ${lessonCount}`}
            </p>
          </header>
          )}

          <div className="mt-6">
            <StorageNotice />
          </div>

          {gap && (
            <div className="mt-2">
              <GapPanel module={mod} />
            </div>
          )}

          <dl className="mt-6 grid gap-4 rounded-lg border border-border bg-surface p-4 text-sm sm:p-5">
            {mod.scope && <Fact term="Scope">{capitalise(mod.scope)}</Fact>}
            {!gap && (
              <Fact term="Prerequisites">
                {prereqModules.length === 0 ? (
                  'None'
                ) : (
                  <ul className="space-y-1.5">
                    {prereqModules.map((p) => (
                      <li key={p.slug} className="flex flex-wrap items-center gap-2">
                        <Link href={learnHref.module(p)} className="text-accent underline underline-offset-2">
                          {p.title}
                        </Link>
                        <ModuleStatusBadge input={moduleInput(p)} size="xs" />
                      </li>
                    ))}
                  </ul>
                )}
              </Fact>
            )}
          </dl>

          {!gap && (
            <>
              <div className="mt-6">
                <PrerequisiteCard
                  input={input}
                  meta={prereqModules.map((p) => ({ slug: p.slug, title: p.title, href: learnHref.module(p) }))}
                />
              </div>

              <section aria-labelledby="lessons" className="mt-8">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <h2 id="lessons" className="text-xl font-semibold">
                    {COPY.readingListTitle}
                  </h2>
                  {firstLesson && (
                    <LinkButton href={firstLesson.href} variant="secondary">
                      Start module
                    </LinkButton>
                  )}
                </div>
                {list.seeAlsoIsMain && <p className="mt-1 text-sm text-muted">{COPY.seeAlsoAsMainLead}</p>}
                <div className="mt-3">
                  <ModuleProgress input={input} />
                </div>
                <div className="mt-3">
                  {mod.listedOn ? (
                    <p className="text-sm text-muted">
                      {mod.listedOn.lead}{' '}
                      <Link href={mod.listedOn.href} className="font-medium text-accent underline underline-offset-2 hover:text-accent-hover">
                        {mod.listedOn.label}
                      </Link>
                    </p>
                  ) : list.main.length ? (
                    <ReadingList lessons={list.main} />
                  ) : (
                    <EmptyState title={COPY.emptyReadingList} body={COPY.comingSoonNoRelated} />
                  )}
                </div>
                {mod.status === 'partly' && (
                  <div className="mt-4">
                    <GapPanel module={mod} />
                  </div>
                )}
                {!list.seeAlsoIsMain && list.seeAlso.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-base font-semibold">{COPY.seeAlsoTitle}</h3>
                    <p className="mt-0.5 text-sm text-muted">{COPY.seeAlsoLead}</p>
                    <div className="mt-3">
                      <ReadingList lessons={list.seeAlso} numbered={false} />
                    </div>
                  </div>
                )}
              </section>

              <section aria-labelledby="practise" className="mt-10">
                <h2 id="practise" className="text-xl font-semibold">
                  Practise and Check
                </h2>
                <dl className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
                  {mod.deliverable && (
                    <Fact term="Deliverable">
                      <DiagnosticText text={capitalise(mod.deliverable)} />
                    </Fact>
                  )}
                  {mod.assessment && (
                    <Fact term="Assessment">
                      <DiagnosticText text={capitalise(mod.assessment)} />
                    </Fact>
                  )}
                  {mod.interviewProbe && <Fact term="Interview probe">{capitalise(mod.interviewProbe)}</Fact>}
                  {mod.commonMistakes.length > 0 && (
                    <Fact term="Common mistakes">
                      <ul className="list-disc space-y-1 pl-5 marker:text-subtle">
                        {mod.commonMistakes.map((m) => (
                          <li key={m} className="[&_code]:font-mono [&_code]:text-[0.875em]" dangerouslySetInnerHTML={{ __html: inlineHtml(m) }} />
                        ))}
                      </ul>
                    </Fact>
                  )}
                </dl>
              </section>

              {checkpoint && (
                <section aria-labelledby="checkpoint" className="mt-10 scroll-mt-20">
                  <h2 id="checkpoint" className="text-xl font-semibold">
                    Checkpoint
                  </h2>
                  <div className="mt-3">
                    <CheckpointPanel moduleSlug={mod.slug} title={mod.title} href={learnHref.module(mod)} items={checkpoint.items} />
                  </div>
                </section>
              )}

              <section aria-labelledby="yours" className="mt-10 rounded-lg border border-border bg-surface p-4 sm:p-5">
                <h2 id="yours" className="text-xl font-semibold">
                  Your Progress
                </h2>
                <div className="mt-4 grid gap-6 md:grid-cols-2">
                  <ConfidenceControl moduleSlug={mod.slug} />
                  <ModuleNotes moduleSlug={mod.slug} />
                </div>
              </section>
            </>
          )}

          {related.length > 0 && (
            <section aria-labelledby="related" className="mt-10">
              <h2 id="related" className="text-xl font-semibold">
                Related Modules
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={learnHref.module(r)}
                      className="block rounded-md border border-border bg-surface px-3 py-2 text-sm transition-colors hover:bg-surface-2"
                    >
                      {moduleTag(r) && <span className="mr-2 text-xs font-semibold tabular-nums text-subtle">{moduleTag(r)}</span>}
                      <span className="font-semibold">{r.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {gap && related.length === 0 && <p className="mt-8 text-sm text-muted">{COPY.comingSoonNoRelated}</p>}

          <PrevNext
            prev={prevModule && { href: learnHref.module(prevModule), title: prevModule.title }}
            next={nextModule && { href: learnHref.module(nextModule), title: nextModule.title }}
          />
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
