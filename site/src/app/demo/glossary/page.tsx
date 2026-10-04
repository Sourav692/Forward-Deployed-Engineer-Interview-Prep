import type { Metadata } from 'next'
import Link from 'next/link'
import * as repo from '@/demo/repo'
import { Breadcrumbs, PageHeader } from '@/demo/components/ui'

export const metadata: Metadata = { title: 'Glossary' }

export default function GlossaryPage() {
  const terms = repo.listGlossary()
  const letters = [...new Set(terms.map((t) => t.term[0].toUpperCase()))]
  return (
    <>
      <Breadcrumbs items={[{ label: 'Glossary' }]} />
      <PageHeader eyebrow="Utility" title="Glossary" description={`${terms.length} terms used across the sample curriculum, each linked to the module that teaches it.`} />
      <nav aria-label="Jump to letter" className="mb-6 flex flex-wrap gap-1">
        {letters.map((l) => (
          <a key={l} href={`#letter-${l}`} className="rounded px-2 py-1 text-[0.8125rem] font-semibold hover:bg-surface-2">{l}</a>
        ))}
      </nav>
      <dl className="divide-y divide-border rounded-xl border border-border bg-surface">
        {terms.map((t, i) => {
          const first = i === 0 || terms[i - 1].term[0].toUpperCase() !== t.term[0].toUpperCase()
          return (
            <div key={t.id} id={t.id} className="scroll-mt-24 px-4 py-3">
              {first && <span id={`letter-${t.term[0].toUpperCase()}`} className="block scroll-mt-24" />}
              <dt className="font-semibold">
                {t.term}
                {t.expansion && <span className="ml-2 font-normal text-subtle">{t.expansion}</span>}
              </dt>
              <dd className="mt-0.5 text-[0.9375rem] text-muted">
                {t.definition}{' '}
                {t.moduleIds.map((id) => {
                  const m = repo.getModule(id)
                  return m ? <Link key={id} href={repo.href.module(m)} className="ml-1 text-[0.8125rem] font-semibold text-accent hover:underline">{m.code}</Link> : null
                })}
              </dd>
            </div>
          )
        })}
      </dl>
    </>
  )
}
