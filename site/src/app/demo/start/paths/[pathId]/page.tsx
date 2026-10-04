import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import * as repo from '@/demo/repo'
import { ChoosePathButton } from '@/demo/components/PathPicker'
import { Breadcrumbs, Card, Dl, FlagBadge, H2, PageHeader } from '@/demo/components/ui'

export function generateStaticParams() {
  return repo.listPaths().map((p) => ({ pathId: p.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ pathId: string }> }): Promise<Metadata> {
  return { title: repo.getPath((await params).pathId)?.title ?? 'Path' }
}

export default async function PathPage({ params }: { params: Promise<{ pathId: string }> }) {
  const { pathId } = await params
  const path = repo.getPath(pathId)
  if (!path) notFound()
  const persona = repo.listPersonas().find((p) => p.id === path.persona)
  const base = path.companyVariantOf ? repo.getPath(path.companyVariantOf) : undefined
  const counts = { required: 0, recommended: 0, optional: 0 }
  for (const f of Object.values(path.moduleFlags)) counts[f]++

  return (
    <>
      <Breadcrumbs items={[{ label: 'Start', href: '/demo/start' }, { label: path.title }]} />
      <PageHeader eyebrow={path.companyVariantOf ? 'Company variant' : 'Learning path'} title={path.title} description={path.summary} actions={<ChoosePathButton pathId={path.id} />} />

      <Card>
        <Dl
          items={[
            ['For', persona ? `${persona.title}: ${persona.startingPoint.toLowerCase()}` : 'Any learner'],
            ['Estimated effort', `~${path.estHours} hours of required and recommended modules`],
            ['Module flags', `${counts.required} required · ${counts.recommended} recommended · ${counts.optional} optional`],
            ['Skip criteria', path.skipCriteria],
            ['Interview-ready when', path.readinessCriteria],
            ['Based on', base ? <Link key="b" href={repo.href.path(base.id)} className="text-accent hover:underline">{base.title} path</Link> : 'A base path'],
          ]}
        />
      </Card>

      <H2>Recommended sequence</H2>
      <ol className="flex flex-wrap items-center gap-1.5 text-[0.875rem]">
        {path.sequence.map((code, i) => (
          <li key={`${code}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden className="text-subtle">→</span>}
            <Link href={repo.href.track(code.split('.')[0].toLowerCase())} className="rounded-md bg-surface-2 px-2 py-0.5 font-semibold hover:text-accent">
              {code}
            </Link>
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <H2>Required projects</H2>
          <ul className="space-y-1 text-[0.9375rem]">
            {path.requiredProjectIds.map((id) => (
              <li key={id}>
                <Link href={repo.href.project(id)} className="hover:text-accent">
                  {repo.getProject(id)!.code} {repo.getProject(id)!.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <H2>Required mocks</H2>
          <ul className="space-y-1 text-[0.9375rem]">
            {path.requiredMockIds.length ? path.requiredMockIds.map((id) => (
              <li key={id}>
                <Link href={repo.href.mock(id)} className="hover:text-accent">
                  Mock {repo.getMock(id)!.letter}: {repo.getMock(id)!.title}
                </Link>
              </li>
            )) : <li className="text-subtle">None: this path is not interview-targeted.</li>}
          </ul>
        </div>
      </div>

      <H2>Modules by track</H2>
      <div className="grid gap-3 md:grid-cols-2">
        {repo.listTracks().map((t) => {
          const skipped = repo.trackSkippedForPath(path.id, t.id)
          return (
            <details key={t.id} className="rounded-xl border border-border bg-surface">
              <summary className="flex cursor-pointer flex-wrap items-center gap-2 px-4 py-3">
                <span className="font-semibold">
                  {t.code} {t.title}
                </span>
                {skipped && <span className="ml-auto text-[0.75rem] text-subtle">Skipped for this path</span>}
              </summary>
              <ul className="divide-y divide-border border-t border-border">
                {repo.listModules(t.id).map((m) => (
                  <li key={m.id} className="flex items-center gap-3 px-4 py-2 text-[0.875rem]">
                    <span className="w-9 shrink-0 tabular-nums text-subtle">{m.code}</span>
                    <span className="min-w-0 flex-1">{m.title}</span>
                    <FlagBadge flag={path.moduleFlags[m.id]} />
                  </li>
                ))}
              </ul>
            </details>
          )
        })}
      </div>
    </>
  )
}
