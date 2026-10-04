import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import * as repo from '@/demo/repo'
import { ExerciseRunner } from '@/demo/components/ExerciseRunner'
import { AuthGate } from '@/demo/components/islands'
import { Breadcrumbs, PageHeader, Tag } from '@/demo/components/ui'

export function generateStaticParams() {
  return repo.listExercises().map((e) => {
    const m = repo.getModule(e.moduleId)!
    return { trackId: m.trackId, moduleId: m.id, exerciseId: e.id }
  })
}

type Params = Promise<{ trackId: string; moduleId: string; exerciseId: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const e = repo.getExercise((await params).exerciseId)
  return { title: e ? `Exercise: ${e.title}` : 'Exercise' }
}

export default async function ExercisePage({ params }: { params: Params }) {
  const { trackId, moduleId, exerciseId } = await params
  const e = repo.getExercise(exerciseId)
  const m = repo.getModule(moduleId)
  if (!e || !m || e.moduleId !== m.id || m.trackId !== trackId) notFound()
  const track = repo.getTrack(trackId)!
  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumbs
        items={[
          { label: 'Learn', href: '/demo/learn' },
          { label: track.code, href: repo.href.track(track.id) },
          { label: `${m.code} ${m.title}`, href: repo.href.module(m) },
          { label: 'Exercise' },
        ]}
      />
      <AuthGate>
        <PageHeader eyebrow={`${m.code} exercise`} title={e.title}>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Tag>Difficulty: {e.difficulty}</Tag>
            <Tag>About {e.estMinutes} min</Tag>
            {e.required && <Tag tone="accent">Required for completion</Tag>}
            {e.skillIds.map((s) => (
              <Tag key={s}>{repo.getSkill(s)?.title}</Tag>
            ))}
          </div>
        </PageHeader>
        <ExerciseRunner exerciseId={e.id} />
      </AuthGate>
    </div>
  )
}
