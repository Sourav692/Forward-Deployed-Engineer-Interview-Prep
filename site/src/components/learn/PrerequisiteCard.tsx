'use client'

/**
 * PrerequisiteCard (FE-08). Soft gating: when a prerequisite module is not complete,
 * the card shows the Blocked badge, lists what to finish, and offers "Open anyway".
 * Nothing is ever locked; the lessons stay readable below the card.
 *
 * "Complete" is the Phase 1 rule in `progress-model.ts` (all lessons read and
 * confidence ≥ 3), standing in for a passed checkpoint until checkpoints ship
 * (plan §15 Q4).
 */
import Link from 'next/link'
import { useState } from 'react'
import { getModuleRecord, latestConfidence, openAnyway } from '@/lib/progress/store'
import { useProgress } from '@/lib/progress/useProgress'
import { Button, StatusBadge, cx } from '@/components/ui'
import { isCompleted, isRead, prerequisiteCheck, type ModuleInput } from './progress-model'
import { COPY } from './copy'
import { Tick } from './ProgressIslands'

export type PrereqMeta = { slug: string; code: string; title: string; href: string }

export function PrerequisiteCard({ input, meta }: { input: ModuleInput; meta: PrereqMeta[] }) {
  const state = useProgress(() => {
    const check = prerequisiteCheck(input.prereqs)
    return {
      ok: check.ok,
      openedAt: getModuleRecord(input.slug).openedAnywayAt,
      prereqs: input.prereqs.map((p) => ({
        slug: p.slug,
        done: isCompleted(p.slug, p.reading),
        read: p.reading.filter(isRead).length,
        total: p.reading.length,
        confidence: latestConfidence(p.slug)?.value,
      })),
    }
  })
  // Session fallback so "Open anyway" still works when storage is blocked.
  const [openedHere, setOpenedHere] = useState(false)
  if (input.prereqs.length === 0 || !state) return null

  if (state.ok) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-muted">
        <Tick className="text-success" />
        {COPY.prereqSatisfied}
      </p>
    )
  }

  const compact = !!state.openedAt || openedHere
  const metaBySlug = new Map(meta.map((m) => [m.slug, m]))
  const todo = state.prereqs.filter((p) => !p.done)

  return (
    <section
      aria-labelledby={`prereq-${input.slug}`}
      className={cx('rounded-lg border border-warning/50 bg-warning-soft', compact ? 'px-4 py-3' : 'p-4 sm:p-5')}
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status="blocked" tooltip={false} />
        <h2 id={`prereq-${input.slug}`} className="font-semibold text-warning-text">
          {compact ? COPY.prereqOpenedTitle : COPY.prereqTitle}
        </h2>
      </div>
      {!compact && <p className="mt-2 text-sm text-text">{COPY.prereqBody}</p>}
      <ul className="mt-3 space-y-1.5">
        {todo.map((p) => {
          const m = metaBySlug.get(p.slug)
          if (!m) return null
          return (
            <li key={p.slug} className="flex flex-wrap items-baseline gap-x-2 text-sm">
              <Link href={m.href} className="font-semibold text-text underline underline-offset-2 hover:text-accent">
                {m.code} {m.title}
              </Link>
              <span className="text-muted">
                {p.total ? `${p.read} of ${p.total} lessons read` : 'No lessons yet'}
                {' · '}
                {p.confidence ? `confidence ${p.confidence} of 5` : 'confidence not rated'}
              </span>
            </li>
          )
        })}
      </ul>
      {!compact && (
        <div className="mt-4">
          <Button
            variant="secondary"
            onClick={() => {
              openAnyway(input.slug)
              setOpenedHere(true)
            }}
          >
            {COPY.prereqOpenAnyway}
          </Button>
        </div>
      )}
    </section>
  )
}
