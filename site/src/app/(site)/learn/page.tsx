import type { Metadata } from 'next'
import Link from 'next/link'
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { allMinutes, getTrack } from '@/lib/learn'
import { LEARN_STAGES } from '@/lib/learn-stages'
import { PathBanner } from '@/components/learn/PathFlagIslands'
import { StorageNotice } from '@/components/learn/ProgressIslands'
import { GroupCard } from '@/components/learn/GroupCard'
import { SuggestTopic } from '@/components/areas/SuggestTopic'
import { siteCounts } from '@/components/areas/data'

/**
 * /learn: the curriculum overview (FE-06). A static Server Component listing the eight
 * topic groups as cards (site structure, 30 October 2026). A live group's card opens its
 * page at /learn/topics/<group>, where its tracks and filters are; a group with no tracks
 * yet shows as Coming soon.
 */

export const metadata: Metadata = pageMetadata({
  path: '/learn',
  title: 'Learn',
  description: 'The Forward Deployed curriculum in eight topic groups, from AI Engineering and AI System Design to Forward Deployed Engineering and Career, with progress you can track in this browser. Interview practice lives under Interview.',
})

export default async function LearnPage() {
  const counts = await siteCounts()
  const minutes = allMinutes()

  return (
    <div className="pb-16">
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Learn', path: '/learn' }])} />
      <header className="cb-hero">
        <div>
          <h1>Learn</h1>
          <p className="cb-standfirst">
            {counts.learnTracks} tracks in {LEARN_STAGES.length} topic groups, about {counts.learnHours} hours in all. Open a
            group to see its tracks.
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
        </div>
      </header>
      <StorageNotice />
      <PathBanner />
      <ul aria-label="Topic groups" className="mt-[3.25rem] grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
        {LEARN_STAGES.map((group, i) => (
          <li key={group.slug} className="flex">
            <GroupCard
              group={group}
              number={i + 1}
              tracks={group.tracks.flatMap((slug) => getTrack(slug) ?? [])}
              minutes={minutes}
            />
          </li>
        ))}
      </ul>
      <div className="mt-24">
        <SuggestTopic hub="Learn" />
      </div>
    </div>
  )
}
