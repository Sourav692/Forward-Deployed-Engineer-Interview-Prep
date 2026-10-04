'use client'

import { useState } from 'react'
import type { ActivityKind, BookmarkKind } from '../types'
import { BookmarkLink } from './Dashboard'
import { Select } from './CurriculumOverview'
import { useLearner } from './islands'
import { ActivityTimeline, RevisionQueueList } from './ProgressViews'
import { EmptyState, H2 } from './ui'

export function RevisionPage() {
  const data = useLearner()
  if (!data) return null
  const { progress } = data
  return (
    <>
      <p className="mb-4 max-w-2xl text-[0.9375rem] text-muted">
        Items enter when confidence is 2 or below, a checkpoint fails, or 14, 30 or 60 days pass since the last pass. “Review now” re-opens the item; rate it 4 or above, or pass the checkpoint again, to clear it.
      </p>
      <RevisionQueueList items={progress.revision} />
    </>
  )
}

const KINDS: [string, string][] = [
  ['', 'Everything'],
  ['lesson-read', 'Lessons read'],
  ['exercise-submitted', 'Exercises'],
  ['checkpoint', 'Checkpoints'],
  ['mock-completed', 'Mocks'],
  ['project-updated', 'Projects'],
  ['note-saved', 'Notes'],
]

export function HistoryPage() {
  const data = useLearner()
  const [kind, setKind] = useState('')
  if (!data) return null
  const events = data.state.activity.filter((e) => !kind || e.kind === kind || (kind === 'checkpoint' && (e.kind as ActivityKind).startsWith('checkpoint')))
  return (
    <>
      <div className="mb-6 max-w-xs">
        <Select id="h-kind" label="Show" value={kind} onChange={setKind} options={KINDS} />
      </div>
      <ActivityTimeline events={events} now={data.progress.now} />
    </>
  )
}

const CATEGORIES: { kind: BookmarkKind; title: string; empty: string }[] = [
  { kind: 'lesson', title: 'Lessons', empty: 'Use “Bookmark” at the foot of any lesson to keep it here.' },
  { kind: 'question', title: 'Interview questions', empty: 'Open a question in a topic hub and bookmark it.' },
  { kind: 'project', title: 'Projects', empty: 'Bookmark a project brief from Practice.' },
  { kind: 'case', title: 'Design cases', empty: 'Bookmark a case study from the Design casebook; its cheat sheet is handy the night before.' },
]

export function BookmarksPage() {
  const data = useLearner()
  if (!data) return null
  return (
    <div className="grid gap-x-8 md:grid-cols-2">
      {CATEGORIES.map((c) => {
        const items = data.state.bookmarks.filter((b) => b.kind === c.kind)
        return (
          <section key={c.kind}>
            <H2>
              {c.title} <span className="font-normal text-subtle">· {items.length}</span>
            </H2>
            {items.length ? (
              <ul className="space-y-1.5 text-[0.9375rem]">
                {items.map((b) => (
                  <li key={b.id}>
                    <BookmarkLink kind={b.kind} itemId={b.itemId} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title={`No ${c.title.toLowerCase()} saved`} body={c.empty} />
            )}
          </section>
        )
      })}
    </div>
  )
}
