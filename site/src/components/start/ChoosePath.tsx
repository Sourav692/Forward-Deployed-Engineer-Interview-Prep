'use client'

/**
 * Client islands for choosing a path (FE-10).
 *
 * `ChoosePathPanel` (path detail page): "Choose this path" saves the choice, shows a
 * toast and then offers "Start first module". `CurrentPathNotice` (/start): names the
 * chosen path, if any. Both render a neutral state on the server and while hydrating.
 */
import Link from 'next/link'
import { useState } from 'react'
import { DEFAULT_WEEKLY_HOURS, getPathById } from '@/lib/paths'
import { Button, LinkButton, Skeleton, cx, focusRing, toast } from '@/components/ui'
import { savePath, useChosenPath } from './path-state'

export function ChoosePathPanel({ pathId, startHref, startLabel }: { pathId: string; startHref: string; startLabel: string }) {
  const chosen = useChosenPath()
  const [justChose, setJustChose] = useState(false)
  const path = getPathById(pathId)
  if (!path) return null

  if (chosen === undefined) return <Skeleton className="h-10 w-48 rounded-md" />

  const isCurrent = chosen?.path.id === pathId
  const choose = () => {
    const saved = savePath(path, DEFAULT_WEEKLY_HOURS)
    setJustChose(true)
    toast(saved ? `Path chosen: ${path.title}.` : `Path chosen for this visit: ${path.title}.`, saved ? 'success' : 'info')
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {isCurrent ? (
          <LinkButton href={startHref}>Start first module: {startLabel}</LinkButton>
        ) : (
          <Button onClick={choose}>Choose this path</Button>
        )}
        {isCurrent && !justChose && <span className="text-sm text-muted">This is your current path.</span>}
        {isCurrent && justChose && <span className="text-sm text-muted">Saved. Learn now marks each module with this path&apos;s flag.</span>}
      </div>
      {chosen && !isCurrent && (
        <p className="text-sm text-muted">Choosing this path replaces your current path, {chosen.path.title}. Your progress stays.</p>
      )}
      {isCurrent && !chosen.persisted && (
        <p role="status" className="rounded-md border border-warning/50 bg-warning-soft px-3 py-2 text-sm text-warning-text">
          <span className="font-semibold">Progress won&apos;t be saved in this browser.</span> Storage is blocked, so this
          path is kept for this visit only.
        </p>
      )}
    </div>
  )
}

export function CurrentPathNotice() {
  const chosen = useChosenPath()
  if (!chosen) return null
  return (
    <p className="mb-6 rounded-lg border border-accent/30 bg-accent-soft px-4 py-3 text-sm">
      Your current path is <span className="font-semibold">{chosen.path.title}</span>
      {!chosen.persisted && ' (this visit only)'}.{' '}
      <Link
        href={`/start/paths/${chosen.path.id}`}
        className={cx('rounded-sm font-semibold text-accent underline underline-offset-2', focusRing)}
      >
        View your path
      </Link>{' '}
      or choose another below.
    </p>
  )
}
