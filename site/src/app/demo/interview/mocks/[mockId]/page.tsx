import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import * as repo from '@/demo/repo'
import { AuthGate } from '@/demo/components/islands'
import { MockRunner } from '@/demo/components/InterviewRunners'
import { Breadcrumbs, PageHeader } from '@/demo/components/ui'

export function generateStaticParams() {
  return repo.listMocks().map((m) => ({ mockId: m.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ mockId: string }> }): Promise<Metadata> {
  const m = repo.getMock((await params).mockId)
  return { title: m ? `Mock ${m.letter}: ${m.title}` : 'Mock interview' }
}

export default async function MockPage({ params }: { params: Promise<{ mockId: string }> }) {
  const m = repo.getMock((await params).mockId)
  if (!m) notFound()
  return (
    <>
      <Breadcrumbs items={[{ label: 'Interview', href: '/demo/interview' }, { label: `Mock ${m.letter}` }]} />
      <AuthGate>
        <PageHeader eyebrow={`Mock ${m.letter} · ${m.minutes} minutes${m.fdeRound ? ' · FDE round' : ''}`} title={m.title} description="Start the timer, answer out loud, reveal the probes as you go, then score yourself honestly." />
        <MockRunner mockId={m.id} />
      </AuthGate>
    </>
  )
}
