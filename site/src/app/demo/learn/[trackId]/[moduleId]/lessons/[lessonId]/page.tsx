import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import * as repo from '@/demo/repo'
import { AuthGate, BookmarkButton, ModuleBar, ModuleStatus, NotesPanel } from '@/demo/components/islands'
import { MarkCompleteButton } from '@/demo/components/LessonActions'
import { Breadcrumbs, Callout, Card, SampleContentBadge } from '@/demo/components/ui'

export function generateStaticParams() {
  return repo.listLessons().map((l) => {
    const m = repo.getModule(l.moduleId)!
    return { trackId: m.trackId, moduleId: m.id, lessonId: l.id }
  })
}

type Params = Promise<{ trackId: string; moduleId: string; lessonId: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const l = repo.getLesson((await params).lessonId)
  return { title: l?.title ?? 'Lesson' }
}

export default async function LessonPage({ params }: { params: Params }) {
  const { trackId, moduleId, lessonId } = await params
  const l = repo.getLesson(lessonId)
  const m = repo.getModule(moduleId)
  if (!l || !m || l.moduleId !== m.id || m.trackId !== trackId) notFound()
  const track = repo.getTrack(trackId)!
  const section = repo.getSection(m.sectionId)!
  const lessons = repo.listLessons(m.id)
  const i = lessons.findIndex((x) => x.id === l.id)
  const prev = lessons[i - 1]
  const next = lessons[i + 1]
  const refs = repo.listReferences(l.referenceIds)

  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumbs
        items={[
          { label: 'Learn', href: '/demo/learn' },
          { label: track.code, href: repo.href.track(track.id) },
          { label: section.title, href: repo.href.track(track.id) },
          { label: `${m.code} ${m.title}`, href: repo.href.module(m) },
          { label: `Lesson ${l.order}` },
        ]}
      />
      <AuthGate>
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2">
          <span className="text-[0.8125rem] font-semibold">{m.code}</span>
          <span className="text-[0.8125rem] text-subtle">
            Lesson {l.order} of {lessons.length}
          </span>
          <div className="min-w-24 flex-1">
            <ModuleBar moduleId={m.id} />
          </div>
          <ModuleStatus moduleId={m.id} size="xs" />
        </div>

        <article className="lesson-reading">
          <header>
            <div className="flex flex-wrap items-center gap-2 text-[0.8125rem] text-subtle">
              <SampleContentBadge />
              <span>{l.readingMin} min read</span>
              {!repo.isAuthoredLesson(l.id) && <span>· Template-generated sample</span>}
            </div>
            <h1 className="mt-3">{l.title}</h1>
            <p className="lead mt-2 italic text-muted">{l.tagline}</p>
          </header>

          <Card className="mt-6">
            <h2 className="mt-0 text-xs font-semibold uppercase tracking-wide text-subtle">By the end you can</h2>
            <ul className="mb-0 mt-2">
              {l.objectives.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </Card>

          <div>
            {l.sections.map((s) => (
              <section key={s.heading}>
                <h2>{s.heading}</h2>
                <p>{s.body}</p>
              </section>
            ))}
            <section className="mt-8 rounded-xl border border-border bg-surface-2 p-5">
              <h2 className="mt-0 text-lg">Worked example: {l.workedExample.title}</h2>
              <p>{l.workedExample.body}</p>
            </section>
          </div>

          <div className="mt-6">
            <Callout title="Watch out">{l.warning}</Callout>
          </div>

          <section>
            <h2>Key takeaways</h2>
            <ul>
              {l.takeaways.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Check yourself</h2>
            <ol>
              {l.checkYourself.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
          </section>

          <section className="mt-8 text-sm">
            <h2 className="text-lg">References</h2>
            <ul className="list-none pl-0 text-muted">
              {refs.map((r) => (
                <li key={r.id}>
                  <span className="text-text">{r.title}</span>, {r.source}. {r.note}
                </li>
              ))}
            </ul>
          </section>
        </article>

        <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6">
          <MarkCompleteButton lessonId={l.id} />
          <BookmarkButton kind="lesson" itemId={l.id} label={l.title} />
        </div>
        <div className="mt-6">
          <NotesPanel itemId={l.id} label={l.title} href={repo.href.lesson(l)} />
        </div>

        <nav aria-label="Lesson navigation" className="mt-10 flex flex-wrap justify-between gap-3 text-[0.875rem]">
          {prev ? <Link href={repo.href.lesson(prev)} className="hover:text-accent">← {prev.title}</Link> : <Link href={repo.href.module(m)} className="hover:text-accent">← {m.code} overview</Link>}
          {next ? (
            <Link href={repo.href.lesson(next)} className="text-right hover:text-accent">{next.title} →</Link>
          ) : (
            <Link href={repo.href.exercise(repo.listExercises(m.id)[0])} className="text-right font-semibold text-accent hover:underline">Exercise →</Link>
          )}
        </nav>
      </AuthGate>
    </div>
  )
}
