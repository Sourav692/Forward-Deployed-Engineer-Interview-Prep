import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import * as repo from '@/demo/repo'
import { BookmarkButton } from '@/demo/components/islands'
import { Tabs } from '@/demo/components/Tabs'
import { Breadcrumbs, PageHeader, Tag } from '@/demo/components/ui'
import type { LessonSection } from '@/demo/types'

export function generateStaticParams() {
  return repo.listCases().map((c) => ({ caseId: c.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ caseId: string }> }): Promise<Metadata> {
  return { title: repo.getCase((await params).caseId)?.title ?? 'Case study' }
}

function Sections({ items }: { items: LessonSection[] }) {
  return (
    <div className="prose max-w-3xl">
      {items.map((s) => (
        <section key={s.heading} className="mt-6 first:mt-0">
          <h2 className="text-[1.125rem] font-semibold">{s.heading}</h2>
          <p>{s.body}</p>
        </section>
      ))}
    </div>
  )
}

export default async function CasePage({ params }: { params: Promise<{ caseId: string }> }) {
  const c = repo.getCase((await params).caseId)
  if (!c) notFound()
  return (
    <>
      <Breadcrumbs items={[{ label: 'Design', href: '/demo/design' }, { label: `${c.code} ${c.title}` }]} />
      <PageHeader eyebrow={`Case ${c.code} · ${c.pattern}`} title={c.title} description={c.summary} actions={<BookmarkButton kind="case" itemId={c.id} label={c.title} />}>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Tag>{c.difficulty}</Tag>
          {c.moduleIds.map((id) => {
            const m = repo.getModule(id)!
            return (
              <Link key={id} href={repo.href.module(m)} className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[0.75rem] font-medium text-muted hover:text-accent">
                {m.code} {m.title}
              </Link>
            )
          })}
        </div>
      </PageHeader>
      <Tabs
        tabs={[
          { id: 'main', label: 'Main', content: <Sections items={c.main} /> },
          { id: 'deep', label: 'Deep Dive', content: <Sections items={c.deepDive} /> },
          {
            id: 'cheat',
            label: 'Cheat Sheet',
            content: (
              <ul className="grid grid-cols-1 max-w-3xl gap-2 sm:grid-cols-2">
                {c.cheatSheet.map((x) => (
                  <li key={x} className="rounded-lg border border-border bg-surface px-3 py-2 text-[0.9375rem]">
                    {x}
                  </li>
                ))}
              </ul>
            ),
          },
        ]}
      />
    </>
  )
}
