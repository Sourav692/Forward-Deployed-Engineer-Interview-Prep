/**
 * Persistence seam for the prototype. Every key lives under `fd:demo:v1:*` so demo
 * state never touches the live site's `fd:v1:*` progress.
 *
 * Same defensive pattern as `src/lib/storage.ts`: storage can throw on read as well as
 * write (private windows, blocked site data, quota), so every call is guarded and the
 * app keeps working in memory. Swap this module for API calls to make state durable.
 */

export const PREFIX = 'fd:demo:v1'
export const SESSION_KEY = `${PREFIX}:session`
export const THEME_KEY = `${PREFIX}:theme`
/** A signed-out visitor's path choice; adopted by the learner they create. */
export const GUEST_PATH_KEY = `${PREFIX}:guest-path`
export const learnerKey = (userId: string) => `${PREFIX}:learner:${userId}`

/** Fired on same-tab writes; the native `storage` event only reaches other tabs. */
export const CHANGE_EVENT = 'fd:demo:change'

/** In-memory fallback so the session still works when storage is blocked. */
const memory = new Map<string, string>()
let probed: boolean | null = null

/** True when localStorage accepts a write and a read; cached after the first probe. */
export function storageAvailable(): boolean {
  if (typeof window === 'undefined') return false
  if (probed !== null) return probed
  try {
    const key = `${PREFIX}:probe`
    window.localStorage.setItem(key, '1')
    window.localStorage.removeItem(key)
    probed = true
  } catch {
    probed = false
  }
  return probed
}

export function readRaw(key: string): string | null {
  if (typeof window === 'undefined') return null
  if (!storageAvailable()) return memory.get(key) ?? null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return memory.get(key) ?? null
  }
}

export function readJson<T>(key: string): T | null {
  const raw = readRaw(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeJson(key: string, value: unknown): boolean {
  if (typeof window === 'undefined') return false
  const raw = JSON.stringify(value)
  memory.set(key, raw)
  let ok = false
  if (storageAvailable()) {
    try {
      window.localStorage.setItem(key, raw)
      ok = true
    } catch {
      ok = false
    }
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
  return ok
}

export function removeKey(key: string): void {
  if (typeof window === 'undefined') return
  memory.delete(key)
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* nothing stored */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

/** Subscribes to demo-state changes from this tab and others. */
export function subscribe(callback: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (!e.key || e.key.startsWith(PREFIX)) callback()
  }
  window.addEventListener(CHANGE_EVENT, callback)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback)
    window.removeEventListener('storage', onStorage)
  }
}
