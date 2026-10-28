import type { Metadata } from 'next'
import Link from 'next/link'
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { Suspense } from 'react'
import { allMinutes, isRequired, learnTracks } from '@/lib/learn'
import { LEARN_STAGES } from '@/lib/learn-stages'
import { StaticTrackGrid, TrackBrowser, type TrackItem } from '@/components/learn/FilterBar'
import { PathBanner } from '@/components/learn/PathFlagIslands'
import { StorageNotice } from '@/components/learn/ProgressIslands'
import { TrackCard } from '@/components/learn/TrackCard'
import { SuggestTopic } from '@/components/areas/SuggestTopic'
import { siteCounts } from '@/components/areas/data'

/**
 * /learn: the curriculum overview (FE-06). A static Server Component. The track cards
 * render here on the server; filtering and progress are client islands. Editorial theme:
 * the hero indexes the five stages, and each stage lists its tracks as ruled entries.
 */

export const metadata: Metadata = pageMetadata({
  path: '/learn',
  title: 'Learn',
  description: 'The Forward Deployed curriculum: tracks from orientation to capstone, each with modules, lessons and progress you can track in this browser. Interview practice lives under Interview.',
})

export default async function LearnPage() {
  const tracks = learnTracks()
  const counts = await siteCounts()
  const minutes = allMinutes()
  const items: TrackItem[] = tracks.map((t) => ({
    slug: t.slug,
    required: isRequired(t),
    node: <TrackCard track={t} minutes={minutes} />,
  }))

  return (
    <div className="pb-16">
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Learn', path: '/learn' }])} />
      <header className="cb-hero">
        <div>
          <h1>Learn</h1>
          <p className="cb-standfirst">
            {counts.learnTracks} tracks in five learning stages, about {counts.learnHours} hours in all. Open a track to
            see its modules.
          </p>
        </div>
        <div className="cb-hero-side">
          <p>
            Follow your chosen path or start with the gaps you need to fill. The worksheets are in{' '}
            <Link href="/practice" className="underline underline-offset-2">
              Practice
            </Link>
            ; mock interviews and the final-week review are in{' '}
            <Link href="/interview" className="underline underline-offset-2">
              Interview
            </Link>
            .
          </p>
          <nav aria-label="On this page" className="mt-5">
            <ul className="cb-rows">
              {LEARN_STAGES.map((stage, i) => (
                <li key={stage.slug} className="cb-row">
                  <a href={`#${stage.slug}`} className="cb-row-link">
                    <span className="cb-row-title">
                      {i + 1}. {stage.title}
                    </span>
                    <span className="cb-row-facts">
                      {stage.tracks.length} {stage.tracks.length === 1 ? 'track' : 'tracks'}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <StorageNotice />
      <PathBanner />
      {/* useSearchParams in TrackBrowser needs a Suspense boundary on a static page. */}
      <Suspense fallback={<StaticTrackGrid items={items} />}>
        <TrackBrowser items={items} minutes={minutes} />
      </Suspense>
      <div className="mt-24">
        <SuggestTopic hub="Learn" />
      </div>
    </div>
  )
}
