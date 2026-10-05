import Link from 'next/link'
import type { CurriculumTrack, ModuleStatus } from '@/lib/curriculum-types'
import { REQUIREMENT_LABEL, isRequired, learnHref, trackModules } from '@/lib/learn'
import { Tag, cx, focusRing } from '@/components/ui'
import { TrackPathSummary } from './PathFlagIslands'
import { TrackProgress } from './ProgressIslands'

const STATUS_LABEL: Record<ModuleStatus, string> = {
  ready: 'ready',
  partly: 'partly ready',
  'coming-soon': 'coming soon',
  'on-hold': 'on hold',
}

/**
 * TrackCard (FE-06): one track on /learn. The whole card is one link (the title),
 * stretched over the card with a pseudo-element so there is a single tab stop.
 */
export function TrackCard({ track, minutes }: { track: CurriculumTrack; minutes: Record<string, number> }) {
  const modules = trackModules(track)
  const counts = (Object.keys(STATUS_LABEL) as ModuleStatus[])
    .map((s) => ({ s, n: modules.filter((m) => m.status === s).length }))
    .filter((c) => c.n > 0)

  return (
    <article className="relative flex w-full flex-col rounded-lg border border-border bg-surface p-4 transition-shadow duration-150 hover:shadow-[var(--shadow)] sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold tabular-nums text-subtle">{track.code}</span>
        <Tag tone={isRequired(track) ? 'accent' : 'neutral'}>{REQUIREMENT_LABEL[track.required]}</Tag>
      </div>
      <h2 className="mt-2 text-lg font-semibold leading-snug">
        <Link
          href={learnHref.track(track.slug)}
          className={cx('rounded-sm after:absolute after:inset-0 after:rounded-lg hover:text-accent', focusRing)}
        >
          {track.title}
        </Link>
      </h2>
      <p className="mt-1 text-sm text-muted">{track.objective}</p>
      <p className="mt-3 text-xs text-muted">
        About {track.estHours} h · {modules.length} modules
        {counts.length > 0 && ': '}
        {counts.map((c) => `${c.n} ${STATUS_LABEL[c.s]}`).join(', ')}
      </p>
      <TrackPathSummary trackSlug={track.slug} />
      <div className="mt-auto pt-4">
        <TrackProgress trackSlug={track.slug} minutes={minutes} />
      </div>
    </article>
  )
}
