'use client'

/**
 * Path flags on Learn pages (FE-10). Each island renders nothing on the server, while
 * hydrating and when no path is chosen, so the prerendered HTML is the same with or
 * without a path. Once hydrated, it shows how the chosen path treats the module or track.
 */
import Link from 'next/link'
import { FLAG_LABEL, FLAG_ORDER, TRACK_MODULES } from '@/lib/paths'
import { cx, focusRing } from '@/components/ui'
import { useChosenPath } from '@/components/start/path-state'
import { PathFlag } from './PathFlag'

/** "Path: Required" next to a module's status. */
export function ModulePathFlag({ moduleSlug, size = 'sm' }: { moduleSlug: string; size?: 'sm' | 'xs' }) {
  const chosen = useChosenPath()
  const flag = chosen?.path.moduleFlags[moduleSlug]
  if (!flag) return null
  return <PathFlag flag={flag} size={size} prefix="Path:" srPrefix={`On your ${chosen.path.title} path,`} />
}

/** One line per track card on /learn: how many of its modules the path flags each way. */
export function TrackPathSummary({ trackSlug }: { trackSlug: string }) {
  const chosen = useChosenPath()
  if (!chosen) return null
  const slugs = TRACK_MODULES[trackSlug] ?? []
  const counts = FLAG_ORDER.map((f) => ({ f, n: slugs.filter((s) => chosen.path.moduleFlags[s] === f).length })).filter(
    (c) => c.n > 0,
  )
  if (counts.length === 0) return null
  const allSkip = counts.length === 1 && counts[0].f === 'skip'
  return (
    <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted">
      <span className="font-semibold text-text">Your path:</span>
      {allSkip ? (
        <PathFlag flag="skip" size="xs" />
      ) : (
        <span>
          {counts
            .filter((c) => c.f !== 'skip')
            .map((c) => `${c.n} ${FLAG_LABEL[c.f].toLowerCase()}`)
            .join(', ')}
        </span>
      )}
    </p>
  )
}

/** Banner on /learn naming the chosen path, with links to view or change it. */
export function PathBanner() {
  const chosen = useChosenPath()
  if (!chosen) return null
  const { path, persisted } = chosen
  const required = Object.values(path.moduleFlags).filter((f) => f === 'required').length
  const link = cx('rounded-sm font-semibold text-accent underline underline-offset-2 hover:text-accent-hover', focusRing)
  return (
    <div className="mb-6 rounded-lg border border-accent/30 bg-accent-soft px-4 py-3 text-sm">
      <p>
        You are following the <span className="font-semibold">{path.title}</span> path: {required} required modules,
        marked on each track and module.{' '}
        {!persisted && <span>This choice lasts for this visit only, because storage is blocked. </span>}
        <Link href={`/start/paths/${path.id}`} className={link}>
          View path
        </Link>
        {' · '}
        <Link href="/start" className={link}>
          Change path
        </Link>
      </p>
    </div>
  )
}
