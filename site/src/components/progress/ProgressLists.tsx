'use client'

/**
 * The three list pages under /progress (FE-16): revision queue, history and bookmarks.
 * Client islands over the `fd:v1` store, with the empty states from the UX-07 copy deck.
 */
import Link from 'next/link'
import { listActivity, listBookmarks, toggleBookmark } from '@/lib/progress/store'
import { useProgress } from '@/lib/progress/useProgress'
import { Button, EmptyState, SkeletonCard, cx, focusRing, toast } from '@/components/ui'
import type { ModuleInput } from '@/components/learn/progress-model'
import { RevisionRows, relativeDay } from './Dashboard'
import { describeActivity, revisionQueue } from './dashboard-model'

export function RevisionList({ modules }: { modules: ModuleInput[] }) {
  const rows = useProgress(() => revisionQueue(modules))
  if (!rows) return <SkeletonCard />
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Nothing to revise."
        body="A module appears here when you rate it 2 or less, or when an older rating fades: confidence drops one level for every 21 days without a new rating."
      />
    )
  }
  return <RevisionRows rows={rows} />
}

export function HistoryList() {
  const events = useProgress(listActivity)
  if (!events) return <SkeletonCard lines={6} />
  if (events.length === 0) {
    return <EmptyState title="No activity yet." body="Reading lessons, rating confidence and scoring rounds are recorded here." />
  }
  // Newest first, grouped under Today, Yesterday or the date.
  const groups: { day: string; items: typeof events }[] = []
  for (const e of events) {
    const day = relativeDay(e.at)
    if (groups.at(-1)?.day === day) groups.at(-1)!.items.push(e)
    else groups.push({ day, items: [e] })
  }
  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <section key={g.day} aria-label={g.day}>
          <h2 className="text-sm font-semibold text-subtle">{g.day}</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {g.items.map((e) => {
              const { text, href } = describeActivity(e)
              const time = new Date(e.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
              return (
                <li key={e.id} className="flex gap-3">
                  <span className="w-12 shrink-0 tabular-nums text-subtle">{time}</span>
                  {href ? (
                    <Link href={href} className={cx('min-w-0 rounded-sm hover:text-accent', focusRing)}>
                      {text}
                    </Link>
                  ) : (
                    <span className="min-w-0">{text}</span>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
      <p className="text-xs text-subtle">The newest 200 events are kept in this browser.</p>
    </div>
  )
}

export function BookmarkList() {
  const bookmarks = useProgress(listBookmarks)
  if (!bookmarks) return <SkeletonCard />
  if (bookmarks.length === 0) {
    return <EmptyState title="No bookmarks yet." body="Use the Bookmark button on any lesson." />
  }
  return (
    <ul className="divide-y divide-border">
      {[...bookmarks].reverse().map((b) => (
        <li key={b.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5">
          <div className="min-w-0 text-sm">
            {b.href ? (
              <Link href={b.href} className={cx('rounded-sm font-medium hover:text-accent', focusRing)}>
                {b.label ?? b.itemId}
              </Link>
            ) : (
              <span className="font-medium">{b.label ?? b.itemId}</span>
            )}
            <span className="text-subtle"> · {b.kind}</span>
          </div>
          <Button
            variant="ghost"
            aria-label={`Remove bookmark: ${b.label ?? b.itemId}`}
            onClick={() => {
              toggleBookmark({ kind: b.kind, itemId: b.itemId })
              toast('Bookmark removed.')
            }}
          >
            Remove
          </Button>
        </li>
      ))}
    </ul>
  )
}
