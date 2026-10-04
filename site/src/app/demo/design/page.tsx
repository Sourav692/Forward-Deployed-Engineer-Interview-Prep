import type { Metadata } from 'next'
import Link from 'next/link'
import * as repo from '@/demo/repo'
import { Breadcrumbs, PageHeader, Tag } from '@/demo/components/ui'

export const metadata: Metadata = { title: 'Design' }

export default function DesignIndex() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Design' }]} />
      <PageHeader eyebrow="Design" title="Casebook" description="Worked AI system designs, each at three depths: Main for the shape of the answer, Deep Dive for the hardest part, and a Cheat Sheet for recall the night before." />
      <ul className="grid gap-3 md:grid-cols-2">
        {repo.listCases().map((c) => (
          <li key={c.id}>
            <Link href={repo.href.case(c.id)} className="flex h-full flex-col rounded-xl border border-border bg-surface p-4 hover:border-accent">
              <div className="flex items-center gap-2">
                <span className="text-[0.8125rem] font-semibold tabular-nums text-subtle">{c.code}</span>
                <span className="font-semibold">{c.title}</span>
              </div>
              <p className="mt-1 flex-1 text-[0.875rem] text-muted">{c.summary}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Tag tone="accent">{c.pattern}</Tag>
                <Tag>{c.difficulty}</Tag>
                {c.moduleIds.slice(0, 3).map((id) => (
                  <Tag key={id}>{repo.getModule(id)?.code}</Tag>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
