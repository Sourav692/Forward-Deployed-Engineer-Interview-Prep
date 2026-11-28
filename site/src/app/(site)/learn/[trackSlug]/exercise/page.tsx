import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { breadcrumbJsonLd, learningResourceJsonLd, pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { capitalise, exerciseParams, formatMinutes, getExercisePage, learnHref, trackTrail } from '@/lib/learn'
import { trackTag } from '@/lib/curriculum-href'
import { Breadcrumbs } from '@/components/learn/Breadcrumbs'
import { ExerciseBody, ExerciseContents } from '@/components/learn/exercise/ExerciseLayout'
import { PageHead } from '@/components/editorial/PageHead'
import { SHOW_STUDY_TIME } from '@/lib/study-time'

/**
 * A track's exercise page: one task that draws on the track's modules, written in the
 * course (`<part>/exercise/README.md`) and synced to `content/learn/<track>/exercise.md`.
 * `parseExercise` splits it into the ten parts `ExerciseBody` lays out.
 * This static segment wins over `[moduleSlug]`, so no module may use the slug `exercise`
 * (check:curriculum). Only tracks with a synced page get one; any other is a 404.
 */

type Params = { trackSlug: string }

export const dynamicParams = false

export function generateStaticParams(): Params[] {
  return exerciseParams()
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const page = getExercisePage((await params).trackSlug)
  if (!page) return {}
  return pageMetadata({
    path: page.exercise.href,
    title: `${page.exercise.title} · ${page.track.title}`,
    ogTitle: page.exercise.title,
    description: capitalise(page.section.exercise),
    type: 'article',
  })
}

export default async function ExercisePage({ params }: { params: Promise<Params> }) {
  const page = getExercisePage((await params).trackSlug)
  if (!page) notFound()
  const { exercise, track, body } = page
  const trail = trackTrail(track)
  const tag = trackTag(track)

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([...trail.map((c) => ({ name: c.label, path: c.href })), { name: exercise.title, path: exercise.href }]),
          learningResourceJsonLd({
            name: exercise.title,
            description: capitalise(page.section.exercise),
            path: exercise.href,
            minutes: exercise.estMinutes,
            partOf: { name: track.title, path: learnHref.track(track.slug) },
          }),
        ]}
      />
      <Breadcrumbs items={[...trail, { label: 'Exercise' }]} />
      <div className="mx-auto w-full max-w-[76rem] lg:grid lg:grid-cols-[13rem_minmax(0,60rem)] lg:justify-center lg:gap-12">
        <aside className="lg:order-first">
          <div className="lg:sticky lg:top-24">
            <ExerciseContents />
          </div>
        </aside>
        <article className="lesson-reading w-full min-w-0 break-words" aria-labelledby="exercise-title">
          <PageHead
            tag={tag ? `${tag} exercise` : 'Exercise'}
            title={exercise.title}
            titleId="exercise-title"
            facts={[
              { term: 'Track', value: track.title },
              ...(SHOW_STUDY_TIME && exercise.estMinutes ? [{ term: 'Reading time', value: formatMinutes(exercise.estMinutes) }] : []),
            ]}
            updated={exercise.updated}
            report={{ title: exercise.title, path: exercise.href }}
          />
          <div className="mt-6">
            <ExerciseBody track={track.slug} exercise={body} />
          </div>
        </article>
      </div>
    </>
  )
}
