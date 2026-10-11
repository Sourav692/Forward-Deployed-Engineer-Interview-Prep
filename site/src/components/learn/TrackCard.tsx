import Link from 'next/link'
import type { CurriculumTrack } from '@/lib/curriculum-types'
import { REQUIREMENT_LABEL, isRequired, learnHref, trackHours, trackModules } from '@/lib/learn'
import { Tag, cx, focusRing } from '@/components/ui'
import { TrackPathSummary } from './PathFlagIslands'
import { TrackProgress } from './ProgressIslands'
import { trackTag } from '@/lib/curriculum-href'

/**
 * TrackCard (FE-06): one track on /learn. The whole card is one link (the title),
 * stretched over the card with a pseudo-element so there is a single tab stop. Module
 * status counts are left to the track page, which labels each module (FV-03).
 */
export function TrackCard({ track, minutes }: { track: CurriculumTrack; minutes: Record<string, number> }) {
  const modules = trackModules(track)

  return (
    <article className="relative flex w-full flex-col rounded-lg border border-border bg-surface p-4 transition-shadow duration-150 hover:shadow-[var(--shadow)] sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        {trackTag(track) && <span className="text-xs font-semibold tabular-nums text-subtle">{trackTag(track)}</span>}
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
        About {trackHours(track)} h · {modules.length} modules
      </p>
      <TrackPathSummary trackSlug={track.slug} />
      <div className="mt-auto pt-4">
        <TrackProgress trackSlug={track.slug} minutes={minutes} />
      </div>
    </article>
  )
}
