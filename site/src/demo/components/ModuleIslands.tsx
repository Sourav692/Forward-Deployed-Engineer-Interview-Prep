'use client'

import Link from 'next/link'
import { useState } from 'react'
import * as repo from '../repo'
import { attemptsFor, isDone } from '@/lib/progress/rules'
import { update, useDemo } from '../store/useDemo'
import { ConfirmDialog, toast } from './feedback'
import { ModuleStatus } from './islands'
import { ProgressBar, StatusBadge, btn, cx, formatMinutes } from './ui'

/**
 * Soft gating. When a prerequisite checkpoint is missing or failed, show what to finish
 * first, but always offer "Open anyway": the module stays reachable (blueprint §16).
 */
export function PrerequisiteGate({ moduleId, children }: { moduleId: string; children: React.ReactNode }) {
  const { progress } = useDemo()
  const [opened, setOpened] = useState(false)
  const p = progress?.modules[moduleId]
  if (!p || p.prerequisites.ok || opened) {
    return (
      <>
        {p && !p.prerequisites.ok && <PrerequisiteCard moduleId={moduleId} compact />}
        {children}
      </>
    )
  }
  return (
    <div>
      <PrerequisiteCard moduleId={moduleId} />
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className={btn.secondary} onClick={() => setOpened(true)}>
          Open anyway
        </button>
      </div>
    </div>
  )
}

function PrerequisiteCard({ moduleId, compact }: { moduleId: string; compact?: boolean }) {
  const { progress } = useDemo()
  const p = progress?.modules[moduleId]
  if (!p) return null
  const items = [
    ...p.prerequisites.failed.map((id) => ({ id, why: 'checkpoint not passed yet' })),
    ...p.prerequisites.missing.map((id) => ({ id, why: 'checkpoint not taken' })),
  ]
  return (
    <section aria-label="Prerequisite check" className={cx('rounded-xl border border-danger/40 bg-danger-soft p-4', compact && 'mb-6')}>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status="blocked" />
        <h2 className="font-semibold">{compact ? 'Opened before its prerequisites' : 'Finish these first'}</h2>
      </div>
      <p className="mt-1 text-[0.875rem]">
        This module builds on {items.length === 1 ? 'a module' : 'modules'} whose checkpoint you have not passed. You can still read it, but it stays Blocked until the prerequisites pass.
      </p>
      <ul className="mt-3 space-y-1.5">
        {items.map(({ id, why }) => {
          const m = repo.getModule(id)!
          return (
            <li key={id} className="flex flex-wrap items-center gap-2 text-[0.875rem]">
              <Link href={repo.href.module(m)} className="font-semibold underline-offset-2 hover:underline">
                {m.code} {m.title}
              </Link>
              <span className="text-muted">({why})</span>
              <Link href={repo.href.checkpoint(m)} className="text-[0.8125rem] font-semibold text-accent hover:underline">
                Take checkpoint →
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function ModuleSummary({ moduleId }: { moduleId: string }) {
  const { progress } = useDemo()
  const m = repo.getModule(moduleId)!
  const p = progress?.modules[moduleId]
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <ModuleStatus moduleId={moduleId} />
        {p && <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[0.75rem] font-semibold uppercase text-subtle">{p.flag} on your path</span>}
      </div>
      <ProgressBar value={p?.fraction ?? 0} label={`${m.code} progress`} />
      <p className="text-[0.8125rem] tabular-nums text-subtle">
        {p ? `${Math.round(p.fraction * 100)}% · ${p.lessonsRead}/${p.lessonsTotal} lessons · ${p.attempts} checkpoint attempt${p.attempts === 1 ? '' : 's'}${p.lastScore !== undefined ? ` · last ${p.lastScore}%` : ''}` : `${formatMinutes(m.estMinutes)} estimated`}
      </p>
    </div>
  )
}

export function LessonChecklist({ moduleId }: { moduleId: string }) {
  const { state } = useDemo()
  return (
    <ol className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
      {repo.listLessons(moduleId).map((l, i) => {
        const read = Boolean(state?.lessonsRead[l.id])
        return (
          <li key={l.id}>
            <Link href={repo.href.lesson(l)} className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface-2">
              <span
                aria-label={read ? 'Read' : 'Not read'}
                className={cx('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[0.6875rem] font-semibold', read ? 'border-success bg-success text-white dark:text-bg' : 'border-border-strong text-subtle')}
              >
                {read ? '✓' : i + 1}
              </span>
              <span className="min-w-0 flex-1 font-medium">{l.title}</span>
              <span className="shrink-0 text-[0.75rem] text-subtle">{l.readingMin} min</span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}

export function AssessmentLinks({ moduleId }: { moduleId: string }) {
  const { state } = useDemo()
  const m = repo.getModule(moduleId)!
  const attempts = state ? attemptsFor(state, m.checkpointId) : []
  const latest = attempts[attempts.length - 1]
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
      {repo.listExercises(moduleId).map((e) => (
        <li key={e.id}>
          <Link href={repo.href.exercise(e)} className="flex flex-wrap items-center gap-3 px-3 py-2.5 hover:bg-surface-2">
            <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[0.6875rem] font-semibold uppercase text-subtle">Exercise</span>
            <span className="min-w-0 flex-1 font-medium">{e.title}</span>
            <span className="text-[0.75rem] text-subtle">{state?.exercises[e.id] ? 'Submitted' : `${e.estMinutes} min${e.required ? ' · required' : ''}`}</span>
          </Link>
        </li>
      ))}
      <li>
        <Link href={repo.href.checkpoint(m)} className="flex flex-wrap items-center gap-3 px-3 py-2.5 hover:bg-surface-2">
          <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[0.6875rem] font-semibold uppercase text-accent">Checkpoint</span>
          <span className="min-w-0 flex-1 font-medium">{m.code} checkpoint · pass at 70%</span>
          <span className="text-[0.75rem] text-subtle">
            {latest ? `${latest.passed ? 'Passed' : 'Not passed'} · ${latest.score}% · ${attempts.length} attempt${attempts.length === 1 ? '' : 's'}` : 'Not taken'}
          </span>
        </Link>
      </li>
    </ul>
  )
}

/** "Test out": mark Skipped. Counts as done, adds no readiness evidence. Undo available. */
export function TestOutButton({ moduleId }: { moduleId: string }) {
  const { state, progress } = useDemo()
  const [confirm, setConfirm] = useState(false)
  const m = repo.getModule(moduleId)!
  const skipped = Boolean(state?.skipped[moduleId])
  if (!state) return null
  if (skipped)
    return (
      <button type="button" className={btn.ghost} onClick={() => (update((s) => void delete s.skipped[moduleId]), toast(`${m.code} is no longer skipped.`, 'info'))}>
        Undo skip
      </button>
    )
  if (progress && isDone(progress.modules[moduleId].status)) return null
  return (
    <>
      <button type="button" className={btn.ghost} onClick={() => setConfirm(true)}>
        Test out
      </button>
      <ConfirmDialog
        open={confirm}
        title={`Skip ${m.code}?`}
        body="Skipped modules count as done for your path and clear prerequisites, but add no readiness evidence. You can undo this."
        confirmLabel="Skip module"
        onConfirm={() => {
          setConfirm(false)
          update((s) => void (s.skipped[moduleId] = new Date().toISOString()), { kind: 'module-skipped', itemId: moduleId, label: `Tested out of ${m.code}`, href: repo.href.module(m) })
          toast(`${m.code} marked Skipped.`)
        }}
        onCancel={() => setConfirm(false)}
      />
    </>
  )
}

export function PrereqList({ moduleId }: { moduleId: string }) {
  const m = repo.getModule(moduleId)!
  if (!m.prerequisites.length) return <p className="text-[0.875rem] text-subtle">None.</p>
  return (
    <ul className="space-y-1.5">
      {m.prerequisites.map((id) => {
        const pm = repo.getModule(id)!
        return (
          <li key={id} className="flex flex-wrap items-center gap-2 text-[0.875rem]">
            <Link href={repo.href.module(pm)} className="font-medium hover:text-accent">
              {pm.code} {pm.title}
            </Link>
            <ModuleStatus moduleId={id} size="xs" />
          </li>
        )
      })}
    </ul>
  )
}
