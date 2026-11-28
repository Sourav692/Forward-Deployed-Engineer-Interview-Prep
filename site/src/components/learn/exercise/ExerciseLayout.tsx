import type { ReactNode } from 'react'
import { Chunks } from '@/components/learn/LessonReader'
import { EXERCISE_PARTS, type Exercise, type Titled } from '@/lib/exercise'
import { DoneChecklist, ResultsTable } from './ExerciseNotes'

/**
 * The exercise page body (owner-approved layout, 28 November 2026): an On this page list,
 * then the ten parts in the course README's order. Server-rendered except the results
 * table and the checklist. The model answer and the worked run sit in `<details>`, so
 * they open without JavaScript.
 */

type PartId = (typeof EXERCISE_PARTS)[number]['id']
const partId = (id: PartId) => `exercise-${id}`

function Part({ id, children }: { id: PartId; children: ReactNode }) {
  const n = EXERCISE_PARTS.findIndex((p) => p.id === id)
  const part = EXERCISE_PARTS[n]
  return (
    <section id={partId(id)} aria-labelledby={`${partId(id)}-title`} className="scroll-mt-24 py-6">
      <p className="cb-label m-0 text-sm text-[var(--color-accent)]">
        {String(n + 1).padStart(2, '0')} {part.label}
      </p>
      <h2 id={`${partId(id)}-title`} className="mt-1 mb-4">{part.title}</h2>
      {children}
    </section>
  )
}

function Panels({ items, columns }: { items: Titled[]; columns?: boolean }) {
  return (
    <div className={columns ? 'grid gap-3 sm:grid-cols-2' : 'grid gap-3'}>
      {items.map((p) => (
        <div key={p.title} className="cb-ex-panel">
          <h3 className="cb-small-head mt-0 mb-2">{p.title}</h3>
          <Chunks chunks={p.chunks} />
        </div>
      ))}
    </div>
  )
}

function Reveal({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="cb-ex-reveal">
      <summary>{summary}</summary>
      <div className="mt-4">{children}</div>
    </details>
  )
}

export function ExerciseContents() {
  return (
    <nav aria-label="On this page" className="cb-ex-contents">
      <p className="cb-label m-0 mb-2 hidden text-sm text-[var(--color-muted)] lg:block">On this page</p>
      <ol className="m-0 list-none p-0">
        {EXERCISE_PARTS.map((p, i) => (
          <li key={p.id}>
            <a href={`#${partId(p.id)}`}>
              {String(i + 1).padStart(2, '0')} {p.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function ExerciseBody({ track, exercise: e }: { track: string; exercise: Exercise }) {
  return (
    <>
      <Part id="problem">
        <Chunks chunks={e.problem} />
      </Part>
      <Part id="objectives">
        <Chunks chunks={e.objectives} />
      </Part>
      <Part id="setup">
        <Panels items={e.setup} columns />
      </Part>
      <Part id="workflow">
        <Chunks chunks={e.workflow} />
      </Part>
      <Part id="tasks">
        <ol className="m-0 grid list-none gap-3 p-0">
          {e.tasks.map((t) => (
            <li key={t.number} className="cb-ex-panel grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3">
              <span className="cb-ex-number" aria-hidden="true">{t.number}</span>
              <div className="min-w-0">
                <h3 className="cb-small-head mt-0 mb-2">
                  <span className="sr-only">Task {Number(t.number)}: </span>
                  {t.title}
                </h3>
                <Chunks chunks={t.chunks} />
              </div>
            </li>
          ))}
        </ol>
      </Part>
      <Part id="results">
        <div className="space-y-4">
          <ResultsTable track={track} record={e.record} />
          <Chunks chunks={e.recordNotes} />
        </div>
      </Part>
      <Part id="done-when">
        <DoneChecklist track={track} items={e.doneWhen} />
      </Part>
      <Part id="mistakes">
        <Panels items={e.mistakes} />
      </Part>
      <Part id="interview">
        <p className="cb-small-head" dangerouslySetInnerHTML={{ __html: `“${e.interview.question}”` }} />
        <Reveal summary="Show a model answer">
          <Chunks chunks={e.interview.answer} />
        </Reveal>
      </Part>
      <Part id="solution">
        <div className="space-y-4">
          <Chunks chunks={e.solution.visible} />
          <Reveal summary="Show our run and the reasoning">
            <Chunks chunks={e.solution.hidden} />
          </Reveal>
        </div>
      </Part>
    </>
  )
}
