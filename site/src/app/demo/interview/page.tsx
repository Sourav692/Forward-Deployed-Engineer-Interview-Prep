import type { Metadata } from 'next'
import Link from 'next/link'
import * as repo from '@/demo/repo'
import { QuestionBrowser } from '@/demo/components/QuestionBrowser'
import { Breadcrumbs, Card, H2, PageHeader, Tag } from '@/demo/components/ui'

export const metadata: Metadata = { title: 'Interview' }

const RUBRIC: [string, string, string, string, string][] = [
  ['Structure', 'No visible order', 'Order, but gaps', 'Framework applied', 'Framework applied and time-boxed'],
  ['Technical depth', 'Buzzwords', 'Correct but shallow', 'Correct with mechanisms', 'Mechanisms, numbers and failure modes'],
  ['Trade-offs', 'None stated', 'Named, not weighed', 'Weighed for this context', 'Weighed and tied to the success metric'],
  ['Communication', 'Hard to follow', 'Clear but long', 'Clear and concise', 'Adapts to the interviewer’s probes'],
  ['Customer judgement (FDE)', 'Ignores the customer', 'Mentions users', 'Asks, scopes, names the metric', 'Plans adoption and impact measurement'],
]

export default function InterviewIndex() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Interview' }]} />
      <PageHeader eyebrow="Interview" title="Perform under interview conditions" description="Five topic hubs, mock rounds A–E on one shared rubric, a final readiness exam, and company packs built on a shared ten-section template." />

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {repo.listHubs().map((h) => (
          <li key={h.id}>
            <Link href={repo.href.hub(h.id)} className="flex h-full flex-col rounded-xl border border-border bg-surface p-4 hover:border-accent">
              <span className="font-semibold">{h.title}</span>
              <span className="mt-1 flex-1 text-[0.8125rem] text-muted">{h.summary}</span>
              <span className="mt-2 text-[0.75rem] text-subtle">{repo.listQuestions({ hubId: h.id }).length} questions</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <H2>Mock interviews</H2>
          <ul className="space-y-2">
            {repo.listMocks().map((m) => (
              <li key={m.id}>
                <Link href={repo.href.mock(m.id)} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 hover:border-accent">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-soft font-bold text-accent">{m.letter}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{m.title}</span>
                    <span className="block text-[0.8125rem] text-subtle">{m.covers}</span>
                  </span>
                  <Tag>{m.minutes} min</Tag>
                </Link>
              </li>
            ))}
            <li>
              <Link href="/demo/interview/readiness-exam" className="flex items-center gap-3 rounded-lg border border-dashed border-border-strong px-3 py-2.5 hover:border-accent">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-2 font-bold">★</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">Final readiness exam</span>
                  <span className="block text-[0.8125rem] text-subtle">One 150-minute scenario, pass at 82/100, with automatic-fail conditions</span>
                </span>
              </Link>
            </li>
          </ul>
        </section>
        <section>
          <H2>Company packs</H2>
          <ul className="space-y-2">
            {repo.listCompanyPacks().map((c) => (
              <li key={c.id}>
                <Link href={repo.href.company(c.id)} className="block rounded-lg border border-border bg-surface px-3 py-2.5 hover:border-accent">
                  <span className="block font-medium">{c.name}</span>
                  <span className="block text-[0.8125rem] text-subtle">{c.tagline}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[0.8125rem] text-subtle">All three companies are fictional, built to show the template.</p>
        </section>
      </div>

      <H2>The shared rubric</H2>
      <Card className="overflow-x-auto p-0 sm:p-0">
        <table className="w-full min-w-[40rem] text-left text-[0.8125rem]">
          <thead className="bg-surface-2">
            <tr>
              {['Dimension', '1 Weak', '2 Developing', '3 Solid', '4 Strong'].map((h) => (
                <th key={h} scope="col" className="px-3 py-2 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {RUBRIC.map(([d, ...cells]) => (
              <tr key={d}>
                <th scope="row" className="px-3 py-2 font-semibold">
                  {d}
                </th>
                {cells.map((c) => (
                  <td key={c} className="px-3 py-2 text-muted">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <H2>All questions</H2>
      <QuestionBrowser />
    </>
  )
}
