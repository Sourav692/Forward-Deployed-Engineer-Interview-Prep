import Link from 'next/link'
import type { CurriculumTrack } from '@/lib/curriculum-types'
import { REQUIREMENT_LABEL, isRequired, learnHref, trackHours, trackModules, trackNotebooks } from '@/lib/learn'
import { Tag, cx, focusRing } from '@/components/ui'
import { TrackPathSummary } from './PathFlagIslands'
import { TrackProgress } from './ProgressIslands'
import { trackTag } from '@/lib/curriculum-href'
import { SHOW_STUDY_TIME } from '@/lib/study-time'

/**
 * TrackCard (FE-06): one track on /learn, a ruled entry in the Editorial theme. The whole
 * entry is one link (the title), stretched over it with a pseudo-element so there is a
 * single tab stop. Module status counts are left to the track page, which labels each
 * module (FV-03).
 */
export function TrackCard({ track, minutes }: { track: CurriculumTrack; minutes: Record<string, number> }) {
  const modules = trackModules(track)

  return (
    <article className="cb-entry relative flex w-full flex-col">
      <div className="flex flex-wrap items-center gap-2">
        {trackTag(track) && <span className="text-xs font-semibold tabular-nums text-subtle">{trackTag(track)}</span>}
        <Tag tone={isRequired(track) ? 'accent' : 'neutral'}>{REQUIREMENT_LABEL[track.required]}</Tag>
      </div>
      <h2 className="cb-entry-title mt-3">
        <Link href={learnHref.track(track.slug)} className={cx('after:absolute after:inset-0', focusRing)}>
          {track.title}
        </Link>
      </h2>
      <p className="cb-entry-body">{track.objective}</p>
      <p className="cb-entry-facts">
        {SHOW_STUDY_TIME && <span>About {trackHours(track)} h</span>}
        <span>{modules.length} modules</span>
        {trackNotebooks(track) > 0 && (
          <span>
            {trackNotebooks(track)} {trackNotebooks(track) === 1 ? 'notebook' : 'notebooks'}
          </span>
        )}
      </p>
      <TrackPathSummary trackSlug={track.slug} />
      <div className="mt-auto pt-4">
        <TrackProgress trackSlug={track.slug} minutes={minutes} />
      </div>
    </article>
  )
}
