import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import * as repo from '@/demo/repo'
import { Breadcrumbs, Card, PageHeader, Tag, cx } from '@/demo/components/ui'

export function generateStaticParams() {
  return repo.listCompanyPacks().map((c) => ({ companyId: c.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ companyId: string }> }): Promise<Metadata> {
  return { title: repo.getCompanyPack((await params).companyId)?.name ?? 'Company pack' }
}

const SECTIONS = ['Sources and confidence', 'Loop map', 'Coverage versus gaps', 'Phased reading order', 'Company brief', 'Per-round guides', 'Practice bank', 'Questions to ask', 'Fill in your own', 'Final checklist']

function Sec({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <section id={`s${n}`} className="scroll-mt-24">
      <h2 className="mb-3 mt-10 text-[1.125rem] font-semibold">
        <span className="mr-2 tabular-nums text-subtle">{n}.</span>
        {SECTIONS[n - 1]}
      </h2>
      {children}
    </section>
  )
}

const ModuleLinks = ({ ids }: { ids: string[] }) => (
  <>
    {ids.map((id) => {
      const m = repo.getModule(id)
      return m ? (
        <Link key={id} href={repo.href.module(m)} className="mr-2 text-accent hover:underline">
          {m.code}
        </Link>
      ) : null
    })}
  </>
)

export default async function CompanyPage({ params }: { params: Promise<{ companyId: string }> }) {
  const c = repo.getCompanyPack((await params).companyId)
  if (!c) notFound()
  const tone = { high: 'success', medium: 'accent', low: 'danger' } as const
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
      <nav aria-label="Pack sections" className="hidden text-[0.8125rem] lg:sticky lg:top-20 lg:block lg:self-start">
        <ol className="space-y-1">
          {SECTIONS.map((s, i) => (
            <li key={s}>
              <a href={`#s${i + 1}`} className="block rounded px-2 py-1 text-muted hover:bg-surface-2 hover:text-text">
                {i + 1}. {s}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="min-w-0">
        <Breadcrumbs items={[{ label: 'Interview', href: '/demo/interview' }, { label: 'Company packs', href: '/demo/interview' }, { label: c.name }]} />
        <PageHeader eyebrow="Company pack · fictional" title={c.name} description={c.tagline} />

        <Sec n={1}>
          <ul className="space-y-2">
            {c.sources.map((s) => (
              <li key={s.claim} className="flex flex-wrap items-start gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[0.9375rem]">
                <Tag tone={tone[s.confidence]}>{s.confidence}</Tag>
                <span className="min-w-0 flex-1">{s.claim}</span>
                <span className="text-[0.8125rem] text-subtle">{s.source}</span>
              </li>
            ))}
          </ul>
        </Sec>
        <Sec n={2}>
          <Card className="overflow-x-auto p-0 sm:p-0">
            <table className="w-full min-w-[36rem] text-left text-[0.875rem]">
              <thead className="bg-surface-2">
                <tr>
                  {['Round', 'Format', 'Time', 'AI-tool policy'].map((h) => (
                    <th key={h} scope="col" className="px-3 py-2 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {c.loop.map((r) => (
                  <tr key={r.round}>
                    <th scope="row" className="px-3 py-2 font-semibold">{r.round}</th>
                    <td className="px-3 py-2">{r.format}</td>
                    <td className="px-3 py-2 tabular-nums">{r.minutes} min</td>
                    <td className="px-3 py-2 text-muted">{r.aiPolicy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </Sec>
        <Sec n={3}>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {c.coverage.map((x) => (
              <li key={x.area} className={cx('rounded-lg border px-3 py-2 text-[0.875rem]', x.covered ? 'border-success/40 bg-success-soft' : 'border-warning/50 bg-warning-soft')}>
                <span className="font-semibold">{x.covered ? 'Covered' : 'Gap'}: {x.area}</span>
                <span className="block text-muted">{x.note}</span>
                <ModuleLinks ids={x.moduleIds} />
              </li>
            ))}
          </ul>
        </Sec>
        <Sec n={4}>
          <ol className="space-y-3">
            {c.readingOrder.map((p) => (
              <li key={p.phase} className="rounded-lg border border-border bg-surface p-3">
                <p className="font-semibold">{p.phase}</p>
                <ul className="mt-1 list-disc pl-5 text-[0.875rem]">{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
                <p className="mt-1 text-[0.8125rem] text-muted"><span className="font-semibold text-text">Done when: </span>{p.doneWhen}</p>
              </li>
            ))}
          </ol>
        </Sec>
        <Sec n={5}>
          <ul className="list-disc space-y-1 pl-5">{c.brief.map((b) => <li key={b}>{b}</li>)}</ul>
        </Sec>
        <Sec n={6}>
          <ul className="space-y-2">
            {c.roundGuides.map((g) => (
              <li key={g.round} className="rounded-lg border border-border bg-surface px-3 py-2 text-[0.9375rem]">
                <p className="font-semibold">{g.round}</p>
                <p className="text-muted">{g.guidance}</p>
                <p className="mt-1 text-[0.8125rem]">Generic modules: <ModuleLinks ids={g.moduleIds} /></p>
              </li>
            ))}
          </ul>
        </Sec>
        <Sec n={7}>
          <ul className="space-y-1.5">
            {c.practiceBank.map((p) => {
              const q = p.questionId ? repo.getQuestion(p.questionId) : undefined
              return (
                <li key={p.prompt} className="text-[0.9375rem]">
                  {q ? <Link href={repo.href.question(q)} className="hover:text-accent">{p.prompt} →</Link> : p.prompt}
                </li>
              )
            })}
          </ul>
        </Sec>
        <Sec n={8}>
          <ul className="list-disc space-y-1 pl-5">{c.questionsToAsk.map((q) => <li key={q}>{q}</li>)}</ul>
        </Sec>
        <Sec n={9}>
          <ul className="space-y-1.5">
            {c.fillIn.map((f) => (
              <li key={f} className="rounded-md border border-dashed border-border-strong px-3 py-2 text-[0.9375rem] text-muted">{f}</li>
            ))}
          </ul>
        </Sec>
        <Sec n={10}>
          <ul className="space-y-1.5">
            {c.checklist.map((x) => (
              <li key={x} className="flex items-start gap-2 text-[0.9375rem]">
                <span aria-hidden className="mt-1 h-3.5 w-3.5 shrink-0 rounded border border-border-strong" />
                {x}
              </li>
            ))}
          </ul>
        </Sec>
      </div>
    </div>
  )
}
