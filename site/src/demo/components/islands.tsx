'use client'

/**
 * Small interactive islands used across many pages. Each reads the store itself, so a
 * Server Component page can drop one in by id without passing state around: the
 * `'use client'` boundary sits here, not on the page.
 */
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useId, useState } from 'react'
import type { BookmarkKind, LearnerState, Status } from '../types'
import { update, useDemo } from '../store/useDemo'
import { setUnsaved } from '../store/unsaved'
import type { Progress } from '../store/selectors'
import { toast } from './feedback'
import { ProgressBar, ProgressRing, SkeletonCard, StatusBadge, btn, cx, Skeleton } from './ui'

/** Renders children only for a signed-in learner; otherwise redirects to sign-in. */
export function AuthGate({ children, fallbackLines = 4 }: { children: React.ReactNode; fallbackLines?: number }) {
  const { ready, signedIn } = useDemo()
  const router = useRouter()
  const pathname = usePathname()
  useEffect(() => {
    if (ready && !signedIn) router.replace(`/demo/sign-in?next=${encodeURIComponent(pathname)}`)
  }, [ready, signedIn, router, pathname])
  if (!ready || !signedIn)
    return (
      <div className="grid gap-4">
        <SkeletonCard lines={fallbackLines} />
        <SkeletonCard lines={2} />
      </div>
    )
  return <>{children}</>
}

/** Live data for a signed-in learner, or null while loading / signed out. */
export function useLearner(): { state: LearnerState; progress: Progress } | null {
  const { state, progress } = useDemo()
  return state && progress ? { state, progress } : null
}

export function ModuleStatus({ moduleId, size }: { moduleId: string; size?: 'sm' | 'xs' }) {
  const { ready, progress } = useDemo()
  if (!ready) return <Skeleton className="h-5 w-20 rounded-full" />
  const status: Status = progress?.modules[moduleId]?.status ?? 'not-started'
  return <StatusBadge status={status} size={size} />
}

export function ModuleBar({ moduleId }: { moduleId: string }) {
  const { progress } = useDemo()
  return <ProgressBar value={progress?.modules[moduleId]?.fraction ?? 0} label="Module progress" />
}

export function TrackRing({ trackId, size }: { trackId: string; size?: number }) {
  const { progress } = useDemo()
  return <ProgressRing value={progress?.tracks[trackId]?.fraction ?? 0} size={size} label="Track progress" />
}

export function SectionBar({ sectionId }: { sectionId: string }) {
  const { progress } = useDemo()
  return <ProgressBar value={progress?.sections[sectionId] ?? 0} label="Section progress" />
}

export function BookmarkButton({ kind, itemId, label }: { kind: BookmarkKind; itemId: string; label: string }) {
  const { state, ready } = useDemo()
  const router = useRouter()
  const pathname = usePathname()
  const on = Boolean(state?.bookmarks.some((b) => b.kind === kind && b.itemId === itemId))
  const toggle = () => {
    if (!state) {
      router.push(`/demo/sign-in?next=${encodeURIComponent(pathname)}`)
      return
    }
    update(
      (s) => {
        s.bookmarks = on
          ? s.bookmarks.filter((b) => !(b.kind === kind && b.itemId === itemId))
          : [{ id: `bm-${Date.now()}`, kind, itemId, at: new Date().toISOString() }, ...s.bookmarks]
      },
      on ? undefined : { kind: 'bookmark-added', itemId, label: `Bookmarked ${label}`, href: pathname },
    )
    toast(on ? 'Bookmark removed.' : 'Bookmarked.', on ? 'info' : 'success')
  }
  return (
    <button type="button" onClick={toggle} disabled={!ready} aria-pressed={on} className={cx(btn.secondary, 'px-2.5 py-1.5 text-[0.8125rem]', on && 'border-accent text-accent')}>
      <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6">
        <path d="M4 2h8v12l-4-3-4 3z" strokeLinejoin="round" />
      </svg>
      {on ? 'Bookmarked' : 'Bookmark'}
    </button>
  )
}

const CONF_LABELS = ['', 'Lost', 'Shaky', 'Okay', 'Confident', 'Could teach it']

/** 1–5 self-rating. Rating ≤ 2 adds the item to the revision queue; ≥ 4 removes it. */
export function ConfidenceControl({ itemId, label, href }: { itemId: string; label: string; href: string }) {
  const { state } = useDemo()
  const id = useId()
  const value = state?.confidence[itemId]?.value
  const set = (v: 1 | 2 | 3 | 4 | 5) => {
    update(
      (s) => {
        const at = new Date(Date.now() + s.clockOffsetDays * 86_400_000).toISOString()
        s.confidence[itemId] = { value: v, at }
        s.reviews.push({ itemId, at, confidence: v })
      },
      { kind: 'confidence-set', itemId, label: `Rated confidence ${v} on ${label}`, href },
    )
    toast(v <= 2 ? 'Added to your revision queue.' : v >= 4 ? 'Confidence saved. Removed from revision if it was queued.' : 'Confidence saved.')
  }
  return (
    <fieldset disabled={!state}>
      <legend id={id} className="text-[0.8125rem] font-semibold">
        Confidence
      </legend>
      <div role="radiogroup" aria-labelledby={id} className="mt-1.5 flex flex-wrap gap-1">
        {([1, 2, 3, 4, 5] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            aria-label={`${v}: ${CONF_LABELS[v]}`}
            title={CONF_LABELS[v]}
            onClick={() => set(v)}
            className={cx(
              'h-8 w-8 rounded-md border text-[0.8125rem] font-semibold tabular-nums transition-colors',
              value === v ? 'border-accent bg-accent text-white dark:text-bg' : 'border-border-strong hover:bg-surface-2',
            )}
          >
            {v}
          </button>
        ))}
      </div>
      <p className="mt-1 text-[0.75rem] text-subtle">{value ? `${CONF_LABELS[value]}. ` : ''}1–2 queues it for revision; 4–5 clears it.</p>
    </fieldset>
  )
}

export function NotesPanel({ itemId, label, href }: { itemId: string; label: string; href: string }) {
  const { state } = useDemo()
  const notes = state?.notes.filter((n) => n.itemId === itemId) ?? []
  const [draft, setDraft] = useState('')
  const fieldId = useId()
  useEffect(() => {
    setUnsaved(fieldId, draft.trim() !== '')
    return () => setUnsaved(fieldId, false)
  }, [draft, fieldId])
  const save = () => {
    if (!draft.trim()) return
    update(
      (s) => {
        s.notes.unshift({ id: `n-${Date.now()}`, itemId, body: draft.trim(), at: new Date().toISOString() })
      },
      { kind: 'note-saved', itemId, label: `Saved a note on ${label}`, href },
    )
    setDraft('')
    toast('Note saved.')
  }
  const remove = (id: string) => update((s) => void (s.notes = s.notes.filter((n) => n.id !== id)))
  return (
    <div>
      <label htmlFor={fieldId} className="text-[0.8125rem] font-semibold">
        Notes
      </label>
      {notes.length > 0 && (
        <ul className="mt-2 space-y-2">
          {notes.map((n) => (
            <li key={n.id} className="rounded-md bg-surface-2 px-3 py-2 text-[0.875rem]">
              <p className="whitespace-pre-wrap">{n.body}</p>
              <div className="mt-1 flex items-center gap-3 text-[0.75rem] text-subtle">
                <span>{new Date(n.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                <button type="button" onClick={() => remove(n.id)} className="underline hover:text-danger">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <textarea
        id={fieldId}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        disabled={!state}
        rows={3}
        placeholder={state ? 'Write a note for future you…' : 'Sign in to keep notes'}
        className="mt-2 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-[0.875rem] outline-none focus:border-accent"
      />
      <button type="button" onClick={save} disabled={!draft.trim()} className={cx(btn.secondary, 'mt-1.5 px-3 py-1.5 text-[0.8125rem]')}>
        Save note
      </button>
    </div>
  )
}

/** Marks an item as accessed (for "last accessed" and the Continue link). */
export function TrackAccess({ itemId }: { itemId: string }) {
  const { signedIn } = useDemo()
  useEffect(() => {
    if (signedIn) update((s) => void (s.lastAccessed[itemId] = new Date().toISOString()))
  }, [signedIn, itemId])
  return null
}
