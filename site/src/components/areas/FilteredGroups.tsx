'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Level } from '@/lib/editorial'
import { ChipGroup, type ChipOption } from '@/components/learn/ChipGroup'
import { COPY } from '@/components/learn/copy'
import { Button, EmptyState } from '@/components/ui'
import { ContentsGroup } from '@/components/editorial/ContentsGroup'
import { AreaGroup, LinkList } from './Area'
import type { GroupItem, TrackGroup } from './data'
import { SHOW_STUDY_TIME } from '@/lib/study-time'

const TIME: ChipOption[] = [
  { value: '', label: 'Any length' },
  { value: 'short', label: 'Under 30 min' },
  { value: 'medium', label: '30–60 min' },
  { value: 'long', label: 'Over an hour' },
]
const timeBucket = (minutes?: number) => (minutes === undefined ? '' : minutes < 30 ? 'short' : minutes <= 60 ? 'medium' : 'long')

type Choice = { theme: string; level: string; time: string }

/**
 * The /design and /practice lists, filtered by theme, level and, for designs, reading
 * time (ENH-23). The choice lives in the URL (`?theme=&level=&time=`), so a filtered view
 * can be shared and survives a reload. Each chip counts the items it would leave, given
 * the other choices. The page renders the full list as the Suspense fallback, so the
 * list works before hydration and without JavaScript.
 */
export function FilteredGroups({
  groups,
  levels,
  noun,
  unit,
  time: timeProp = false,
  contents = false,
}: {
  groups: TrackGroup[]
  levels: Record<Level, string>
  /** Plural, for the filter group and live region: "designs". */
  noun: string
  /** Each group's count label: ['case', 'cases']. */
  unit: [string, string]
  time?: boolean
  /** Render each group as a casebook contents block (`ContentsGroup`) instead of a card. */
  contents?: boolean
}) {
  // The reading-time filter goes with the rest of the study time (SHOW_STUDY_TIME).
  const time = timeProp && SHOW_STUDY_TIME
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const THEME: ChipOption[] = [{ value: '', label: 'All themes' }, ...groups.map((g) => ({ value: g.id, label: g.title }))]
  const LEVEL: ChipOption[] = [
    { value: '', label: 'Any level' },
    ...(Object.entries(levels) as [Level, string][]).map(([value, label]) => ({ value, label })),
  ]
  const pick = (key: string, options: ChipOption[]) => {
    const value = params.get(key) ?? ''
    return options.some((o) => o.value === value) ? value : ''
  }
  const chosen: Choice = { theme: pick('theme', THEME), level: pick('level', LEVEL), time: time ? pick('time', TIME) : '' }

  const matches = (group: TrackGroup, item: GroupItem, c: Choice) =>
    (!c.theme || group.id === c.theme) && (!c.level || item.level === c.level) && (!c.time || timeBucket(item.minutes) === c.time)
  const counts = (key: keyof Choice, options: ChipOption[]) =>
    Object.fromEntries(
      options.map((o) => [o.value, groups.reduce((n, g) => n + g.items.filter((i) => matches(g, i, { ...chosen, [key]: o.value })).length, 0)]),
    )

  const set = (key: keyof Choice, value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const shown = groups.map((g) => ({ ...g, items: g.items.filter((i) => matches(g, i, chosen)) })).filter((g) => g.items.length > 0)
  const total = groups.reduce((n, g) => n + g.items.length, 0)
  const visible = shown.reduce((n, g) => n + g.items.length, 0)

  return (
    <>
      <div role="group" aria-label={`Filter ${noun}`} className="mb-5 flex flex-col gap-3">
        <ChipGroup label="Theme" options={THEME} value={chosen.theme} onChange={(v) => set('theme', v)} counts={counts('theme', THEME)} />
        <ChipGroup label="Level" options={LEVEL} value={chosen.level} onChange={(v) => set('level', v)} counts={counts('level', LEVEL)} />
        {time && <ChipGroup label="Time" options={TIME} value={chosen.time} onChange={(v) => set('time', v)} counts={counts('time', TIME)} />}
      </div>
      <p className="sr-only" aria-live="polite">
        {visible} of {total} {noun} shown
      </p>
      {shown.length > 0 ? (
        <div className={contents ? undefined : 'space-y-4'}>
          {shown.map((g) => contents ? <ContentsGroup key={g.id} group={g} unit={unit} /> : (
            <AreaGroup
              key={g.id}
              id={g.id}
              title={g.title}
              blurb={g.blurb}
              action={{ label: `${g.items.length} ${g.items.length === 1 ? unit[0] : unit[1]}`, href: g.href }}
            >
              <LinkList items={g.items} />
            </AreaGroup>
          ))}
        </div>
      ) : (
        <EmptyState
          title={`No ${noun} match these filters`}
          body={`Clear a filter to see more ${noun}.`}
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
