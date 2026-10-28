'use client'

/**
 * FilterBar and the filtered track grid for /learn (FE-06).
 *
 * Filter state lives in the URL (`?req=required&progress=in-progress`), so a filtered
 * view can be shared and survives a refresh. The page itself is static, so it cannot
 * read `searchParams` on the server; `useSearchParams` reads them here instead. Next
 * requires a component that calls it during prerender to sit inside `<Suspense>`:
 * the page renders the unfiltered grid as the fallback, and this island takes over
 * in the browser.
 */
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'
import { trackProgress } from '@/lib/progress/store'
import { useProgress } from '@/lib/progress/useProgress'
import { Button, EmptyState } from '@/components/ui'
import { COPY } from './copy'
import { ChipGroup, type ChipOption as Option } from './ChipGroup'
import { LEARN_STAGES } from '@/lib/learn-stages'


const REQ: Option[] = [
  { value: '', label: 'All' },
  { value: 'required', label: 'Required' },
  { value: 'optional', label: 'Optional' },
]

const PROGRESS: Option[] = [
  { value: '', label: 'Any progress' },
  { value: 'not-started', label: 'Not started' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
]

export type TrackItem = { slug: string; required: boolean; node: ReactNode }

function progressBucket(slug: string, minutes: Record<string, number>): string {
  const f = trackProgress(slug, minutes).fraction
  return f <= 0 ? 'not-started' : f >= 1 ? 'completed' : 'in-progress'
}

export function TrackBrowser({ items, minutes }: { items: TrackItem[]; minutes: Record<string, number> }) {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const req = REQ.some((o) => o.value === params.get('req')) ? params.get('req')! : ''
  const prog = PROGRESS.some((o) => o.value === params.get('progress')) ? params.get('progress')! : ''

  const buckets = useProgress(() => Object.fromEntries(items.map((i) => [i.slug, progressBucket(i.slug, minutes)])))

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const visible = items.filter((i) => {
    if (req === 'required' && !i.required) return false
    if (req === 'optional' && i.required) return false
    // Progress is unknown until hydration; show everything until then.
    if (prog && buckets && buckets[i.slug] !== prog) return false
    return true
  })

  return (
    <>
      <div role="group" aria-label="Filter tracks" className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
        <ChipGroup label="Requirement" options={REQ} value={req} onChange={(v) => set('req', v)} />
        <ChipGroup label="Progress" options={PROGRESS} value={prog} onChange={(v) => set('progress', v)} />
      </div>
      <p className="sr-only" aria-live="polite">
        {visible.length} of {items.length} tracks shown
      </p>
      {visible.length ? (
        <GroupedTracks items={visible} />
      ) : (
        <EmptyState
          title={COPY.filterEmptyTitle}
          body={COPY.filterEmptyBody}
          action={
            <Button variant="secondary" onClick={() => router.replace(pathname, { scroll: false })}>
              {COPY.clearFilters}
            </Button>
          }
        />
      )}
    </>
  )
}


/** The grid shown before the island hydrates (and to crawlers): every track, no filters. */
export function StaticTrackGrid({ items }: { items: TrackItem[] }) {
  return (
    <div className="mt-[3.25rem]">
      <GroupedTracks items={items} />
    </div>
  )
}

/** Share the same grouping before hydration and after requirement/progress filtering. */
function GroupedTracks({ items }: { items: TrackItem[] }) {
  return (
    <div className="space-y-20">
      {LEARN_STAGES.map((stage, index) => {
        const tracks = stage.tracks.flatMap((slug) => items.filter((item) => item.slug === slug))
        if (!tracks.length) return null
        return (
          <section key={stage.slug} id={stage.slug} aria-labelledby={`stage-${stage.slug}`} className="scroll-mt-24">
            <div className="cb-opens mb-6 lg:grid lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-10">
              <h2 id={`stage-${stage.slug}`} className="cb-section-head">
                <span className="cb-stage-number">{index + 1}.</span>
                {stage.title}
              </h2>
              <p className="mt-4 max-w-[60ch] text-base lg:mt-1">{stage.summary}</p>
            </div>
            <ul className="grid gap-x-10 sm:grid-cols-2">
              {tracks.map((item) => <li key={item.slug} className="flex">{item.node}</li>)}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
