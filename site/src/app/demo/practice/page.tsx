import type { Metadata } from 'next'
import Link from 'next/link'
import * as repo from '@/demo/repo'
import { ProjectCatalog } from '@/demo/components/ProjectIslands'
import { Breadcrumbs, H2, PageHeader } from '@/demo/components/ui'

export const metadata: Metadata = { title: 'Practice' }

export default function PracticePage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Practice' }]} />
      <PageHeader eyebrow="Practice" title="Worksheets and projects" description="Do the work yourself. Every exercise is self-scored against rubric anchors, and projects P1–P10 follow one brief format from business problem to completion rubric." />
      <H2>Projects</H2>
      <ProjectCatalog />
      <H2>Worksheets by track</H2>
      <p className="mb-3 text-[0.875rem] text-muted">One exercise per module. Required exercises count toward module completion and Interview readiness.</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {repo.listTracks().map((t) => (
          <details key={t.id} className="rounded-xl border border-border bg-surface">
            <summary className="cursor-pointer px-4 py-3 font-semibold">
              {t.code} {t.title} <span className="font-normal text-subtle">· {repo.listModules(t.id).length}</span>
            </summary>
            <ul className="divide-y divide-border border-t border-border text-[0.875rem]">
              {repo.listModules(t.id).flatMap((m) =>
                repo.listExercises(m.id).map((e) => (
                  <li key={e.id}>
                    <Link href={repo.href.exercise(e)} className="flex gap-3 px-4 py-2 hover:bg-surface-2">
                      <span className="w-9 shrink-0 tabular-nums text-subtle">{m.code}</span>
                      <span className="min-w-0 flex-1">{e.title}</span>
                    </Link>
                  </li>
                )),
              )}
            </ul>
          </details>
        ))}
      </div>
    </>
  )
}
