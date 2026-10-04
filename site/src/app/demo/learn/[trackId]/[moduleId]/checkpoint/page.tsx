import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import * as repo from '@/demo/repo'
import { AssessmentRunner } from '@/demo/components/AssessmentRunner'
import { AuthGate } from '@/demo/components/islands'
import { Breadcrumbs, PageHeader } from '@/demo/components/ui'

export function generateStaticParams() {
  return repo.listModules().map((m) => ({ trackId: m.trackId, moduleId: m.id }))
}

type Params = Promise<{ trackId: string; moduleId: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const m = repo.getModule((await params).moduleId)
  return { title: m ? `${m.code} checkpoint` : 'Checkpoint' }
}

export default async function CheckpointPage({ params }: { params: Params }) {
  const { trackId, moduleId } = await params
  const m = repo.getModule(moduleId)
  if (!m || m.trackId !== trackId) notFound()
  const track = repo.getTrack(trackId)!
  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumbs
        items={[
          { label: 'Learn', href: '/demo/learn' },
          { label: track.code, href: repo.href.track(track.id) },
          { label: `${m.code} ${m.title}`, href: repo.href.module(m) },
          { label: 'Checkpoint' },
        ]}
      />
      <AuthGate>
        <PageHeader eyebrow={`${m.code} checkpoint`} title={m.title} description="Multiple-choice and scenario questions. Pass at 70% or above; every attempt is recorded." />
        <AssessmentRunner moduleId={m.id} />
      </AuthGate>
    </div>
  )
}
