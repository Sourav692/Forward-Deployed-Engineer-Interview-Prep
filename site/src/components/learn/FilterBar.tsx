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
        <ul className="grid gap-4 sm:grid-cols-2">
          {visible.map((i) => (
            <li key={i.slug} className="flex">
              {i.node}
            </li>
          ))}
        </ul>
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
    <ul className="mt-[3.25rem] grid gap-4 sm:grid-cols-2">
      {items.map((i) => (
        <li key={i.slug} className="flex">
          {i.node}
        </li>
      ))}
    </ul>
  )
}
