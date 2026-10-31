/**
 * The production learner store (plan §8, task FE-02): Learn progress, path choice,
 * confidence, notes, bookmarks, attempts and activity, all in this browser's
 * localStorage under the `fd:v1:*` keys the plan lists.
 *
 * Plain module, no React: components read it through `useProgress.ts`. Every read and
 * write is wrapped in try/catch, because storage throws in private windows, with site
 * data blocked or over quota. Writes return false instead of throwing, and
 * `storageAvailable()` lets the UI show the "progress is not being saved" notice.
 *
 * Changes fire the existing `fd:progress` event (same tab); other tabs hear the native
 * `storage` event. Nothing here leaves the browser.
 *
 * Runtime imports use explicit `.ts` paths so `scripts/check-progress-store.ts` can run
 * this file under plain `node`.
 */
import { LESSONS, MODULES, RENAMED, TRACKS } from '../curriculum.ts'
import { notifyProgress, storageAvailable } from '../storage.ts'
import { rollup } from './rules.ts'
import { studyTime } from '../study-time.ts'
import type {
  ActivityEvent,
  Attempt,
  Bookmark,
  BookmarkKind,
  ConfidenceRating,
  LessonReadRecord,
  ModuleRecord,
  PathChoice,
  ProgressExport,
} from './types'

export { storageAvailable }

// ── Keys ───────────────────────────────────────────────────────────────────

export const PREFIX = 'fd:v1:'
export const PATH_KEY = 'fd:v1:path'
export const BOOKMARKS_KEY = 'fd:v1:bookmarks'
export const ACTIVITY_KEY = 'fd:v1:activity'
/** Kept by `resetProgress`: the theme is a preference, not progress. */
export const THEME_KEY = 'fd:v1:theme'
export const ACTIVITY_CAP = 200

export const lessonKey = (moduleSlug: string, lessonSlug: string) =>
  `fd:v1:learn:lesson:${moduleSlug}/${lessonSlug}`
export const moduleKey = (moduleSlug: string) => `fd:v1:learn:module:${moduleSlug}`
export const attemptsKey = (assessmentId: string) => `fd:v1:learn:attempts:${assessmentId}`

// ── Guarded storage access ─────────────────────────────────────────────────

const hasWindow = () => typeof window !== 'undefined'

function readRaw(key: string): string | null {
  if (!hasWindow()) return null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function readJson<T>(key: string): T | null {
  const raw = readRaw(key)
  if (raw === null) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/** Writes without notifying; callers batch and then call `notifyProgress` once. */
function setRaw(key: string, raw: string): boolean {
  if (!hasWindow()) return false
  try {
    window.localStorage.setItem(key, raw)
    return true
  } catch {
    return false
  }
}

function removeRaw(key: string): void {
  if (!hasWindow()) return
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* nothing stored */
  }
}

function writeJson(key: string, value: unknown): boolean {
  const ok = setRaw(key, JSON.stringify(value))
  notifyProgress()
  return ok
}

function remove(key: string): void {
  removeRaw(key)
  notifyProgress()
}

/** Every `fd:v1:*` key currently stored, including the live worksheet keys. */
function progressKeys(): string[] {
  if (!hasWindow()) return []
  try {
    const keys: string[] = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (key?.startsWith(PREFIX) && key !== 'fd:v1:probe') keys.push(key)
    }
    return keys
  } catch {
    return []
  }
}

/**
 * Every `fd:v1:<kind>:*` value, keyed by the rest of the key. Reads the live worksheet
 * keys the dashboard counts (`scores`, `answer-statuses`), which `lib/storage` writes.
 */
export function readKind<T>(kind: string): Record<string, T> {
  const prefix = `${PREFIX}${kind}:`
  const out: Record<string, T> = {}
  for (const key of progressKeys()) {
    if (!key.startsWith(prefix)) continue
    const value = readJson<T>(key)
    if (value !== null) out[key.slice(prefix.length)] = value
  }
  return out
}

const iso = (now: number) => new Date(now).toISOString()

// ── Lessons ────────────────────────────────────────────────────────────────

export function isLessonRead(moduleSlug: string, lessonSlug: string): boolean {
  return readJson<LessonReadRecord>(lessonKey(moduleSlug, lessonSlug))?.readAt !== undefined
}

export function lessonReadAt(moduleSlug: string, lessonSlug: string): string | undefined {
  return readJson<LessonReadRecord>(lessonKey(moduleSlug, lessonSlug))?.readAt
}

export function markLessonRead(moduleSlug: string, lessonSlug: string, now = Date.now()): boolean {
  const record: LessonReadRecord = { readAt: iso(now) }
  const ok = writeJson(lessonKey(moduleSlug, lessonSlug), record)
  if (ok) {
    const lesson = LESSONS.find((l) => l.slug === lessonSlug)
    logActivity({ kind: 'lesson-read', itemId: `${moduleSlug}/${lessonSlug}`, label: lesson?.title }, now)
  }
  return ok
}

export function markLessonUnread(moduleSlug: string, lessonSlug: string): void {
  remove(lessonKey(moduleSlug, lessonSlug))
}

/**
 * Carries read marks across lesson retirements (FE-15). For each RENAMED pair, a lesson read
 * under its old key counts as read under the lesson that replaced it, unless that lesson has
 * its own record, and the old key goes. Removing it makes this safe to run on every load:
 * a pair is migrated once, and marking the new lesson unread later sticks. A withdrawn
 * lesson (`null`) keeps its key. Returns how many read marks moved.
 */
export function migrateRenamedProgress(renamed: Record<string, string | null> = RENAMED): number {
  let moved = 0
  let changed = false
  for (const [from, to] of Object.entries(renamed)) {
    const oldKey = lessonKey(...(from.split('/') as [string, string]))
    const old = to ? readRaw(oldKey) : null
    if (old === null || !to) continue
    const newKey = lessonKey(...(to.split('/') as [string, string]))
    if (readRaw(newKey) === null) {
      if (!setRaw(newKey, old)) continue
      moved++
    }
    removeRaw(oldKey)
    changed = true
  }
  if (changed) notifyProgress()
  return moved
}

// ── Modules: confidence, notes, open anyway ────────────────────────────────

const emptyModule = (): ModuleRecord => ({ confidence: [], notes: '' })

export function getModuleRecord(moduleSlug: string): ModuleRecord {
  const stored = readJson<Partial<ModuleRecord>>(moduleKey(moduleSlug))
  if (!stored || typeof stored !== 'object') return emptyModule()
  return {
    ...stored,
    confidence: Array.isArray(stored.confidence) ? stored.confidence : [],
    notes: typeof stored.notes === 'string' ? stored.notes : '',
  }
}

function updateModule(moduleSlug: string, change: (r: ModuleRecord) => ModuleRecord, now: number): boolean {
  const next = change(getModuleRecord(moduleSlug))
  return writeJson(moduleKey(moduleSlug), { ...next, updatedAt: iso(now) })
}

/** The latest rating, which drives revision and mastery. */
export function latestConfidence(moduleSlug: string): ConfidenceRating | undefined {
  const all = getModuleRecord(moduleSlug).confidence
  return all[all.length - 1]
}

export function setConfidence(moduleSlug: string, value: ConfidenceRating['value'], now = Date.now()): boolean {
  if (![1, 2, 3, 4, 5].includes(value)) return false
  const rating: ConfidenceRating = { value, at: iso(now) }
  const ok = updateModule(moduleSlug, (r) => ({ ...r, confidence: [...r.confidence, rating] }), now)
  if (ok) logActivity({ kind: 'confidence-set', itemId: moduleSlug, label: `Confidence ${value} of 5` }, now)
  return ok
}

export function setNotes(moduleSlug: string, notes: string, now = Date.now()): boolean {
  return updateModule(moduleSlug, (r) => ({ ...r, notes }), now)
}

/** Records that the learner opened a module despite unmet prerequisites (soft gating). */
export function openAnyway(moduleSlug: string, now = Date.now()): boolean {
  const ok = updateModule(moduleSlug, (r) => ({ ...r, openedAnywayAt: iso(now) }), now)
  if (ok) logActivity({ kind: 'module-opened-anyway', itemId: moduleSlug }, now)
  return ok
}

// ── Path ───────────────────────────────────────────────────────────────────

export function getPath(): PathChoice | null {
  const path = readJson<PathChoice>(PATH_KEY)
  return path && typeof path.pathId === 'string' ? path : null
}

export function choosePath(
  choice: { pathId: string; variant?: string; weeklyHours: number },
  now = Date.now(),
): boolean {
  const path: PathChoice = { ...choice, chosenAt: iso(now) }
  if (path.variant === undefined) delete path.variant
  const ok = writeJson(PATH_KEY, path)
  if (ok) logActivity({ kind: 'path-chosen', itemId: choice.pathId }, now)
  return ok
}

/** Changes the weekly study hours on the chosen path. `false` when no path is chosen or the write fails. */
export function setWeeklyHours(weeklyHours: number): boolean {
  const path = getPath()
  return path !== null && writeJson(PATH_KEY, { ...path, weeklyHours })
}

// ── Bookmarks ──────────────────────────────────────────────────────────────

export function listBookmarks(): Bookmark[] {
  const all = readJson<Bookmark[]>(BOOKMARKS_KEY)
  return Array.isArray(all) ? all : []
}

export function isBookmarked(kind: BookmarkKind, itemId: string): boolean {
  return listBookmarks().some((b) => b.kind === kind && b.itemId === itemId)
}

/** Adds the bookmark, or removes it if present. Returns true when the item is now bookmarked. */
export function toggleBookmark(
  item: { kind: BookmarkKind; itemId: string; label?: string; href?: string },
  now = Date.now(),
): boolean {
  const all = listBookmarks()
  const id = `${item.kind}:${item.itemId}`
  if (all.some((b) => b.id === id)) {
    writeJson(BOOKMARKS_KEY, all.filter((b) => b.id !== id))
    return false
  }
  const at = iso(now)
  const ok = writeJson(BOOKMARKS_KEY, [...all, { ...item, id, at, updatedAt: at }])
  if (ok) logActivity({ kind: 'bookmark-added', itemId: id, label: item.label, href: item.href }, now)
  return ok
}

// ── Attempts (Phase 2) ─────────────────────────────────────────────────────

export function listAttempts(assessmentId: string): Attempt[] {
  const all = readJson<Attempt[]>(attemptsKey(assessmentId))
  return Array.isArray(all) ? all : []
}

/** `event` overrides the activity entry, e.g. a `mock-completed` with a readable label and link. */
export function recordAttempt(
  attempt: Omit<Attempt, 'id' | 'updatedAt'>,
  event: Partial<Pick<ActivityEvent, 'kind' | 'label' | 'href'>> = {},
  now = Date.now(),
): boolean {
  const all = listAttempts(attempt.assessmentId)
  const record: Attempt = { ...attempt, id: `${attempt.assessmentId}:${all.length + 1}`, updatedAt: iso(now) }
  const ok = writeJson(attemptsKey(attempt.assessmentId), [...all, record])
  if (ok) logActivity({ kind: 'attempt-recorded', itemId: attempt.assessmentId, label: `Scored ${attempt.score}`, ...event }, now)
  return ok
}

// ── Activity ───────────────────────────────────────────────────────────────

/** Newest first, at most 200. */
export function listActivity(): ActivityEvent[] {
  const all = readJson<ActivityEvent[]>(ACTIVITY_KEY)
  return Array.isArray(all) ? all : []
}

let activitySeq = 0

export function logActivity(
  event: Pick<ActivityEvent, 'kind' | 'itemId'> & Partial<Pick<ActivityEvent, 'label' | 'href'>>,
  now = Date.now(),
): boolean {
  const at = iso(now)
  const entry: ActivityEvent = { ...event, id: `${now.toString(36)}-${(activitySeq++).toString(36)}`, at, updatedAt: at }
  for (const k of ['label', 'href'] as const) if (entry[k] === undefined) delete entry[k]
  return writeJson(ACTIVITY_KEY, [entry, ...listActivity()].slice(0, ACTIVITY_CAP))
}

// ── Rollups ────────────────────────────────────────────────────────────────

export interface ProgressSummary {
  /** 0–1, weighted by lesson minutes when known. */
  fraction: number
  lessonsRead: number
  lessonsTotal: number
}

/**
 * The share of a module's home lessons read, weighted by each lesson's `estMinutes`
 * when known. A lesson without an estimate weighs the mean of the known ones, or 1
 * when none are known, so the rollup is an equal split until estimates arrive.
 *
 * `minutes` (lesson slug → minutes) overrides the curriculum estimates. Learn pages
 * pass the sync manifest's `estMinutes` here, since the curriculum file carries none.
 */
export function moduleProgress(moduleSlug: string, minutes?: Readonly<Record<string, number>>): ProgressSummary {
  const mod = MODULES.find((m) => m.slug === moduleSlug)
  if (!mod) return { fraction: 0, lessonsRead: 0, lessonsTotal: 0 }
  const lessons = mod.lessons.map((slug) => {
    const lesson = LESSONS.find((l) => l.slug === slug)
    return lesson && minutes?.[slug] ? { ...lesson, estMinutes: minutes[slug] } : lesson
  })
  const known = lessons.map((l) => l?.estMinutes).filter((m): m is number => typeof m === 'number' && m > 0)
  const fallback = known.length ? known.reduce((s, m) => s + m, 0) / known.length : 1
  let lessonsRead = 0
  const parts = mod.lessons.map((slug, i) => {
    const read = isLessonRead(moduleSlug, slug)
    if (read) lessonsRead++
    const est = lessons[i]?.estMinutes
    return { minutes: typeof est === 'number' && est > 0 ? est : fallback, fraction: read ? 1 : 0 }
  })
  return { fraction: rollup(parts), lessonsRead, lessonsTotal: mod.lessons.length }
}

/**
 * A track's progress: its modules' fractions weighted by their study time (`studyTime`).
 * Without lesson `minutes`, every module weighs the same.
 * Modules with no home lessons yet (Coming soon) are left out, because there is
 * nothing to read.
 */
export function trackProgress(trackSlug: string, minutes?: Readonly<Record<string, number>>): ProgressSummary {
  let lessonsRead = 0
  let lessonsTotal = 0
  const listed = new Set(TRACKS.find((t) => t.slug === trackSlug)?.sections.flatMap((s) => s.modules) ?? [])
  const parts = MODULES.filter((m) => listed.has(m.slug) && m.lessons.length > 0).map((m) => {
    const p = moduleProgress(m.slug, minutes)
    lessonsRead += p.lessonsRead
    lessonsTotal += p.lessonsTotal
    return { minutes: (minutes && studyTime(m, minutes).total) || 1, fraction: p.fraction }
  })
  return { fraction: rollup(parts), lessonsRead, lessonsTotal }
}

// ── Export, import, reset ──────────────────────────────────────────────────

export const EXPORT_APP = 'forward-deployed'
export const EXPORT_VERSION = 1
export const MAX_IMPORT_BYTES = 1024 * 1024

/** Every `fd:v1:*` value in this browser, including the live worksheet keys, as one file. */
export function exportProgress(now = Date.now()): ProgressExport {
  const data: Record<string, string> = {}
  for (const key of progressKeys()) {
    const raw = readRaw(key)
    if (raw !== null) data[key] = raw
  }
  return { app: EXPORT_APP, version: EXPORT_VERSION, exportedAt: iso(now), data }
}

export type ImportCheck = { ok: true; value: ProgressExport } | { ok: false; error: string }

const TOP_LEVEL = new Set(['app', 'version', 'exportedAt', 'data'])
const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/**
 * Hand-written type guard for an export file (task SEC-03). Returns the first
 * problem as a message that says what happened and what to do.
 */
export function checkImport(json: string): ImportCheck {
  const fail = (error: string): ImportCheck => ({ ok: false, error })
  const again = 'Export your progress again from Settings and import that file.'

  if (typeof json !== 'string') return fail(`The file could not be read as text. ${again}`)
  const bytes = new TextEncoder().encode(json).length
  if (bytes > MAX_IMPORT_BYTES) {
    return fail('The file is larger than 1 MB, so it was not imported. Choose a progress file exported from this site.')
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return fail(`The file is not valid JSON, so it was not imported. ${again}`)
  }
  if (!isPlainObject(parsed)) return fail(`The file does not contain a progress export. ${again}`)
  if (parsed.app !== EXPORT_APP) {
    return fail('The file was not exported from Forward Deployed, so it was not imported. Choose a file exported from this site’s Settings page.')
  }
  if (parsed.version !== EXPORT_VERSION) {
    return fail(`The file uses export version ${JSON.stringify(parsed.version)}, which this site cannot read. ${again}`)
  }
  for (const key of Object.keys(parsed)) {
    if (!TOP_LEVEL.has(key)) return fail(`The file has an unexpected field "${key}", so it was not imported. ${again}`)
  }
  if (parsed.exportedAt !== undefined && typeof parsed.exportedAt !== 'string') {
    return fail(`The file’s export date is not text, so it was not imported. ${again}`)
  }
  if (!isPlainObject(parsed.data)) return fail(`The file has no progress data. ${again}`)
  for (const [key, value] of Object.entries(parsed.data)) {
    if (!key.startsWith(PREFIX)) {
      return fail(`The file contains the key "${key}", which is not Forward Deployed progress, so nothing was imported. ${again}`)
    }
    if (typeof value !== 'string') {
      return fail(`The value for "${key}" is not text, so nothing was imported. ${again}`)
    }
    try {
      JSON.parse(value)
    } catch {
      return fail(`The value for "${key}" is damaged, so nothing was imported. ${again}`)
    }
  }
  return {
    ok: true,
    value: {
      app: EXPORT_APP,
      version: EXPORT_VERSION,
      exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : '',
      data: parsed.data as Record<string, string>,
    },
  }
}

export type ImportResult = { ok: true; keys: number } | { ok: false; error: string }

/**
 * Replaces this browser's progress with the file's. Nothing changes unless the whole
 * file passes `checkImport`. The theme is kept unless the file carries one.
 */
export function importProgress(json: string): ImportResult {
  const check = checkImport(json)
  if (!check.ok) return check
  if (!storageAvailable()) {
    return { ok: false, error: 'This browser is not saving site data, so the progress could not be imported. Allow site data for this site, or leave private browsing, and try again.' }
  }
  for (const key of progressKeys()) if (key !== THEME_KEY) removeRaw(key)
  let written = 0
  for (const [key, value] of Object.entries(check.value.data)) {
    if (setRaw(key, value)) written++
  }
  notifyProgress()
  const total = Object.keys(check.value.data).length
  if (written < total) {
    return { ok: false, error: `Only ${written} of ${total} entries could be saved, probably because browser storage is full. Free some space for this site and import the file again.` }
  }
  return { ok: true, keys: written }
}

/** Removes every `fd:v1:*` progress key, including the live worksheet keys. Keeps the theme. */
export function resetProgress(): void {
  for (const key of progressKeys()) if (key !== THEME_KEY) removeRaw(key)
  notifyProgress()
}
