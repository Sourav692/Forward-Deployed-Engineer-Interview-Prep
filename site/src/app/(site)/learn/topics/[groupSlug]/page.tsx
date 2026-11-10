import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { allMinutes, getTrack, isRequired, learnHref, notebookCount, trackHours } from '@/lib/learn'
import { groupHref, liveGroups } from '@/lib/learn-stages'
import { Breadcrumbs } from '@/components/learn/Breadcrumbs'
import { StaticTrackGrid, TrackBrowser, type TrackItem } from '@/components/learn/FilterBar'
import { StorageNotice } from '@/components/learn/ProgressIslands'
import { TrackCard } from '@/components/learn/TrackCard'
import { PageHead } from '@/components/editorial/PageHead'
import { SHOW_STUDY_TIME } from '@/lib/study-time'

/**
 * A topic group's page: its tracks as cards with the requirement and progress filters.
 * Only groups with tracks are prerendered; `dynamicParams = false` makes a Coming soon
 * group, or any other slug, a 404.
 */

type Params = { groupSlug: string }

export const dynamicParams = false

export function generateStaticParams(): Params[] {
  return liveGroups().map((g) => ({ groupSlug: g.slug }))
}

const findGroup = (slug: string) => liveGroups().find((g) => g.slug === slug)

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const group = findGroup((await params).groupSlug)
  if (!group) return {}
  return pageMetadata({ path: groupHref(group.slug), title: group.title, description: group.summary })
}

export default async function GroupPage({ params }: { params: Promise<Params> }) {
  const group = findGroup((await params).groupSlug)
  if (!group) notFound()

  const tracks = group.tracks.flatMap((slug) => getTrack(slug) ?? [])
  const minutes = allMinutes()
  const items: TrackItem[] = tracks.map((t) => ({
    slug: t.slug,
    required: isRequired(t),
    node: <TrackCard track={t} minutes={minutes} />,
  }))

  return (
    <div className="pb-16">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Learn', path: learnHref.index() },
          { name: group.title, path: groupHref(group.slug) },
        ])}
      />
      <Breadcrumbs items={[{ label: 'Learn', href: learnHref.index() }, { label: group.title }]} />
      <PageHead
        tag="Topic group"
        title={group.title}
        standfirst={group.summary}
        facts={[
          { term: 'Tracks', value: String(tracks.length) },
          ...(notebookCount(tracks) ? [{ term: 'Notebooks', value: String(notebookCount(tracks)) }] : []),
          ...(SHOW_STUDY_TIME ? [{ term: 'Time', value: `About ${tracks.reduce((sum, t) => sum + trackHours(t), 0)} h` }] : []),
        ]}
      />
      <StorageNotice />
      {/* useSearchParams in TrackBrowser needs a Suspense boundary on a static page. */}
      <Suspense fallback={<StaticTrackGrid items={items} />}>
        <TrackBrowser items={items} minutes={minutes} />
      </Suspense>
    </div>
  )
}
