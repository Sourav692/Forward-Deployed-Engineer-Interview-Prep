import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { Suspense } from 'react'
import { allMinutes, getTracks, isRequired } from '@/lib/learn'
import { StaticTrackGrid, TrackBrowser, type TrackItem } from '@/components/learn/FilterBar'
import { StorageNotice } from '@/components/learn/ProgressIslands'
import { TrackCard } from '@/components/learn/TrackCard'

/**
 * /learn: the curriculum overview (FE-06). A static Server Component. The track cards
 * render here on the server; filtering and progress are client islands.
 */

export const metadata: Metadata = pageMetadata({
  path: '/learn',
  title: 'Learn',
  description: 'The Forward Deployed curriculum: ten tracks from orientation to capstone, each with modules, lessons and progress you can track in this browser.',
})

export default function LearnPage() {
  const tracks = getTracks()
  const minutes = allMinutes()
  const items: TrackItem[] = tracks.map((t) => ({
    slug: t.slug,
    required: isRequired(t),
    node: <TrackCard track={t} minutes={minutes} />,
  }))
  const hours = tracks.reduce((s, t) => s + t.estHours, 0)

  return (
    <>
      <header className="mb-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-subtle">Learn</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">The Curriculum</h1>
        <p className="mt-3 text-base text-muted">
          Ten tracks, about {hours} hours in all. Required tracks build the core every Forward Deployed Engineer is
          tested on; optional tracks fill gaps. Open a track to see its sections and modules.
        </p>
      </header>
      <StorageNotice />
      {/* useSearchParams in TrackBrowser needs a Suspense boundary on a static page. */}
      <Suspense fallback={<StaticTrackGrid items={items} />}>
        <TrackBrowser items={items} minutes={minutes} />
      </Suspense>
    </>
  )
}
