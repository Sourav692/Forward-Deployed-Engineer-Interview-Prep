'use client'

/**
 * The chosen path, read and written from client islands (FE-10).
 *
 * The path is saved to `fd:v1:path` through the learner store. When storage is
 * blocked the write fails, so the choice is kept in memory instead: it lasts for this
 * visit (client-side navigation keeps the module alive) and is lost on reload, which
 * the UI says in a notice. Path choice is always optional; nothing requires it.
 */
import { choiceFor, resolveChoice, type LearningPath } from '@/lib/paths'
import { choosePath, getPath } from '@/lib/progress/store'
import type { PathChoice } from '@/lib/progress/types'
import { useProgress } from '@/lib/progress/useProgress'
import { notifyProgress } from '@/lib/storage'

let sessionChoice: PathChoice | null = null

/** Saves the choice. Returns `true` when it was stored, `false` when it is session-only. */
export function savePath(path: LearningPath, weeklyHours: number): boolean {
  const choice = choiceFor(path, weeklyHours)
  const ok = choosePath(choice)
  sessionChoice = ok ? null : { ...choice, chosenAt: new Date().toISOString() }
  if (!ok) notifyProgress()
  return ok
}

export type ChosenPath = { path: LearningPath; persisted: boolean }

/**
 * The chosen path: `undefined` on the server and during hydration, `null` when no path
 * is chosen (or the stored id is unknown), otherwise the path and whether it is saved.
 */
export function useChosenPath(): ChosenPath | null | undefined {
  // Wrapped in an object because `useProgress` itself returns null while hydrating.
  const result = useProgress((): { chosen: ChosenPath | null } => {
    const stored = resolveChoice(getPath())
    if (stored) return { chosen: { path: stored, persisted: true } }
    const session = resolveChoice(sessionChoice)
    return { chosen: session ? { path: session, persisted: false } : null }
  })
  return result === null ? undefined : result.chosen
}
