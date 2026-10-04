import type { Metadata } from 'next'
import Link from 'next/link'
import * as repo from '@/demo/repo'
import { Breadcrumbs, Card, H2, PageHeader, Tag } from '@/demo/components/ui'

export const metadata: Metadata = { title: 'Library' }

export default function LibraryPage() {
  const sources = [...new Set(repo.listModules().map((m) => m.canonicalSource))]
  return (
    <>
      <Breadcrumbs items={[{ label: 'Library' }]} />
      <PageHeader eyebrow="Utility" title="Library" description="Reading the sample lessons cite, and the planned canonical source behind every module." />
      <H2>References</H2>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {repo.listReferences().map((r) => (
          <li key={r.id}>
            <Card className="h-full">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{r.title}</span>
                <Tag>{r.kind}</Tag>
              </div>
              <p className="text-[0.8125rem] text-subtle">{r.source}</p>
              <p className="mt-1 text-[0.875rem] text-muted">{r.note}</p>
            </Card>
          </li>
        ))}
      </ul>
      <H2>Planned canonical sources</H2>
      <p className="mb-3 text-[0.875rem] text-muted">Placeholders: production lessons will sync from these paths. The prototype does not copy their text.</p>
      <Card className="overflow-x-auto p-0 sm:p-0">
        <table className="w-full min-w-[36rem] text-left text-[0.8125rem]">
          <thead className="bg-surface-2">
            <tr>
              <th scope="col" className="px-3 py-2 font-semibold">Source path (placeholder)</th>
              <th scope="col" className="px-3 py-2 font-semibold">Modules</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sources.map((s) => (
              <tr key={s}>
                <td className="break-all px-3 py-2 font-mono text-[0.75rem]">{s}</td>
                <td className="px-3 py-2">
                  {repo.listModules().filter((m) => m.canonicalSource === s).map((m) => (
                    <Link key={m.id} href={repo.href.module(m)} className="mr-2 text-accent hover:underline">{m.code}</Link>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}
