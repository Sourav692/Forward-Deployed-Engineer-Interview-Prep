'use client'

/**
 * React bindings for the learner store (`store.ts`).
 *
 * `useSyncExternalStore` is React's hook for reading state that lives outside React,
 * here localStorage. It takes three functions:
 *
 * - `subscribe`: tells React when the outside state may have changed. We listen to the
 *   `fd:progress` event (this tab) and the `storage` event (other tabs).
 * - `getSnapshot`: a cheap, stable value React compares to decide whether to re-render.
 *   We return a version number that goes up on every change, never a fresh object
 *   (a new object every call would make React re-render forever).
 * - `getServerSnapshot`: the value used on the server and during hydration. The server
 *   has no localStorage, so it returns -1, meaning "not known yet".
 *
 * During hydration React renders with the server snapshot, so the first client render
 * matches the prerendered HTML exactly (no hydration mismatch). Straight after, React
 * reads `getSnapshot`, sees a different number and re-renders with the stored values.
 * Hooks below return `null` (or a neutral fallback) while the version is -1, so
 * components can show a skeleton until then.
 */
import { useSyncExternalStore } from 'react'
import { PROGRESS_EVENT } from '../storage'
import {
  PREFIX,
  getModuleRecord,
  getPath,
  isLessonRead,
  listActivity,
  listBookmarks,
  migrateRenamedProgress,
  moduleProgress,
  storageAvailable,
  trackProgress,
} from './store'

let version = 0
const listeners = new Set<() => void>()
let migrated = false

function bump() {
  version++
  for (const listener of listeners) listener()
}

function onStorage(e: StorageEvent) {
  // `key` is null when another tab clears all storage.
  if (e.key === null || e.key.startsWith(PREFIX)) bump()
}

function subscribe(listener: () => void): () => void {
  // Once per page load, before anything shows progress: move read marks of retired lessons.
  if (!migrated) {
    migrated = true
    migrateRenamedProgress()
  }
  if (listeners.size === 0) {
    window.addEventListener(PROGRESS_EVENT, bump)
    window.addEventListener('storage', onStorage)
  }
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      window.removeEventListener(PROGRESS_EVENT, bump)
      window.removeEventListener('storage', onStorage)
    }
  }
}

const getSnapshot = () => version
const getServerSnapshot = () => -1

/** The store version: -1 on the server and during hydration, 0 or more once hydrated. */
export function useProgressVersion(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/**
 * Reads the store with `read` and re-renders whenever progress changes. Returns `null`
 * until hydration finishes. `read` runs on each render, so keep it to store getters.
 */
export function useProgress<T>(read: () => T): T | null {
  const v = useProgressVersion()
  return v < 0 ? null : read()
}

/** `null` until hydrated; then whether this browser is saving progress. */
export const useStorageAvailable = () => useProgress(storageAvailable)

export const useLessonRead = (moduleSlug: string, lessonSlug: string) =>
  useProgress(() => isLessonRead(moduleSlug, lessonSlug))

export const useModuleRecord = (moduleSlug: string) => useProgress(() => getModuleRecord(moduleSlug))

export const useModuleProgress = (moduleSlug: string) => useProgress(() => moduleProgress(moduleSlug))

export const useTrackProgress = (trackSlug: string) => useProgress(() => trackProgress(trackSlug))

export const usePath = () => useProgress(getPath)

export const useBookmarks = () => useProgress(listBookmarks)

export const useActivity = () => useProgress(listActivity)
