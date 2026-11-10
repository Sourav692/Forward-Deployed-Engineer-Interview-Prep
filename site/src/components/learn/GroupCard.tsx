import Link from 'next/link'
import type { CurriculumTrack } from '@/lib/curriculum-types'
import { notebookCount, trackHours } from '@/lib/learn'
import { SHOW_STUDY_TIME } from '@/lib/study-time'
import { groupHref, type LearnGroup } from '@/lib/learn-stages'
import { Tag, cx, focusRing } from '@/components/ui'
import { GroupProgress } from './ProgressIslands'

/**
 * One topic group on /learn, a square bordered card in the Editorial theme (`cb-group-card`
 * in editorial.css). A live group's title opens its page, stretched over the card so the
 * card is one tab stop. A group with no tracks yet is a Coming soon card with its planned
 * topics and no link: it has no page to open.
 */
export function GroupCard({
  group,
  tracks,
  minutes,
}: {
  group: LearnGroup
  tracks: CurriculumTrack[]
  minutes: Record<string, number>
}) {
  const live = tracks.length > 0
  const hours = tracks.reduce((sum, t) => sum + trackHours(t), 0)
  const notebooks = notebookCount(tracks)

  return (
    <article className={cx('cb-group-card relative flex w-full flex-col', !live && 'is-soon')}>
      <div className="flex min-h-6 flex-wrap items-center gap-2">
        {!live && <Tag>Coming soon</Tag>}
      </div>
      <h2 className="cb-entry-title mt-3">
        {live ? (
          <Link href={groupHref(group.slug)} className={cx('after:absolute after:inset-0', focusRing)}>
            {group.title}
          </Link>
        ) : (
          group.title
        )}
      </h2>
      <p className="cb-entry-body">{group.summary}</p>
      {live ? (
        <>
          <p className="cb-entry-facts">
            <span>
              {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
            </span>
            {notebooks > 0 && (
              <span>
                {notebooks} {notebooks === 1 ? 'notebook' : 'notebooks'}
              </span>
            )}
            {SHOW_STUDY_TIME && <span>About {hours} h</span>}
          </p>
          <div className="mt-auto pt-4">
            <GroupProgress weights={Object.fromEntries(tracks.map((t) => [t.slug, trackHours(t) || 1]))} minutes={minutes} />
          </div>
        </>
      ) : (
        <p className="mt-3 text-[0.9375rem] text-muted">Planned: {group.planned}</p>
      )}
    </article>
  )
}
