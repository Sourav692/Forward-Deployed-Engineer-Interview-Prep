import type { Metadata } from 'next'
import Link from 'next/link'
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { Suspense } from 'react'
import { allMinutes, isRequired, learnTracks } from '@/lib/learn'
import { StaticTrackGrid, TrackBrowser, type TrackItem } from '@/components/learn/FilterBar'
import { PathBanner } from '@/components/learn/PathFlagIslands'
import { StorageNotice } from '@/components/learn/ProgressIslands'
import { TrackCard } from '@/components/learn/TrackCard'
import { SuggestTopic } from '@/components/areas/Area'

/**
 * /learn: the curriculum overview (FE-06). A static Server Component. The track cards
 * render here on the server; filtering and progress are client islands.
 */

export const metadata: Metadata = pageMetadata({
  path: '/learn',
  title: 'Learn',
  description: 'The Forward Deployed curriculum: tracks from orientation to capstone, each with modules, lessons and progress you can track in this browser. Interview practice lives under Interview.',
})

export default function LearnPage() {
  const tracks = learnTracks()
  const minutes = allMinutes()
  const items: TrackItem[] = tracks.map((t) => ({
    slug: t.slug,
    required: isRequired(t),
    node: <TrackCard track={t} minutes={minutes} />,
  }))
  const hours = tracks.reduce((s, t) => s + t.estHours, 0)

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Learn', path: '/learn' }])} />
      <header className="mb-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-subtle">The curriculum</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">Learn</h1>
        <p className="mt-3 text-base text-muted">
          {tracks.length} tracks, about {hours} hours in all. Required tracks build the core every Forward Deployed
          Engineer is tested on; optional tracks fill gaps. Open a track to see its sections and modules. Worksheets,
          mock interviews and final-week revision are under{' '}
          <Link href="/interview" className="text-accent underline underline-offset-2">
            Interview
          </Link>
          .
        </p>
      </header>
      <StorageNotice />
      <PathBanner />
      {/* useSearchParams in TrackBrowser needs a Suspense boundary on a static page. */}
      <Suspense fallback={<StaticTrackGrid items={items} />}>
        <TrackBrowser items={items} minutes={minutes} />
      </Suspense>
      <SuggestTopic hub="Learn" />
    </>
  )
}
