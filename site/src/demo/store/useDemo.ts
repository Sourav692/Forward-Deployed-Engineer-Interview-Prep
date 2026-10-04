'use client'

/**
 * The prototype's client store: reads the session and the learner's state from
 * `persist.ts` through `useSyncExternalStore`, and exposes typed actions.
 *
 * React 19 note: `useSyncExternalStore` is the supported way to read an external,
 * mutable source (here localStorage). Its third argument is the server snapshot; we
 * return null there, so prerendered HTML shows skeletons and the client fills in
 * after hydration without a mismatch.
 */
import { useMemo, useSyncExternalStore } from 'react'
import type { ActivityEvent, LearnerState, User } from '../types'
import { DEMO_USER, getSession, signIn, signOut } from '../auth'
import { emptyState, seedDemoState } from '../data/seed'
import { GUEST_PATH_KEY, SESSION_KEY, learnerKey, readJson, readRaw, removeKey, subscribe, writeJson, storageAvailable } from './persist'
import { deriveProgress, type Progress } from './selectors'

interface Snapshot {
  raw: string
  /** Wall-clock time when the stored state last changed; rules derive from it. */
  at: number
}

// getSnapshot must return the same object until the store changes, or React loops.
let cached: Snapshot = { raw: '\u0001', at: 0 }

function getSnapshot(): Snapshot {
  const session = readRaw(SESSION_KEY)
  let raw = readRaw(GUEST_PATH_KEY) ?? ''
  if (session) {
    try {
      const id = (JSON.parse(session) as { userId: string }).userId
      raw += `\u0000${session}\u0000${readRaw(learnerKey(id)) ?? ''}`
    } catch {
      /* a corrupt session reads as signed out */
    }
  }
  if (raw !== cached.raw) cached = { raw, at: Date.now() }
  return cached
}
const getServerSnapshot = () => null

export interface DemoStore {
  /** False during SSR and the first client render: show skeletons. */
  ready: boolean
  signedIn: boolean
  state: LearnerState | null
  progress: Progress | null
  storageOk: boolean
  /** The learner's path, or a signed-out visitor's choice, defaulting to FDE. */
  pathId: string
}

export function useDemo(): DemoStore {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return useMemo(() => {
    if (snap === null) return { ready: false, signedIn: false, state: null, progress: null, storageOk: true, pathId: 'fde' }
    const session = getSession()
    const state = session ? readJson<LearnerState>(learnerKey(session.userId)) : null
    return {
      ready: true,
      signedIn: Boolean(session && state),
      state,
      progress: state ? deriveProgress(state, snap.at) : null,
      storageOk: storageAvailable(),
      pathId: state?.pathId ?? readJson<string>(GUEST_PATH_KEY) ?? 'fde',
    }
  }, [snap])
}

// ── Actions ────────────────────────────────────────────────────────────────

function current(): LearnerState | null {
  const session = getSession()
  return session ? readJson<LearnerState>(learnerKey(session.userId)) : null
}

/**
 * Applies a mutation to a copy of the learner state and persists it. Returns false if
 * nobody is signed in, or if storage refused the write (the change still applies for
 * this tab via the in-memory fallback).
 */
export function update(mutate: (s: LearnerState) => void, event?: Omit<ActivityEvent, 'id' | 'at'>): boolean {
  const s = current()
  if (!s) return false
  const next = structuredClone(s)
  mutate(next)
  if (event) {
    next.activity.unshift({ ...event, id: `e-${Date.now()}`, at: new Date().toISOString() })
    next.activity = next.activity.slice(0, 200)
  }
  return writeJson(learnerKey(next.user.id), next)
}

export function signInAsDemo(): void {
  if (!readJson<LearnerState>(learnerKey(DEMO_USER.id))) {
    writeJson(learnerKey(DEMO_USER.id), seedDemoState(DEMO_USER, Date.now()))
  }
  signIn(DEMO_USER.id)
}

/** Sets the path for the signed-in learner, or remembers it for a guest. */
export function choosePath(pathId: string, label: string): void {
  if (!update((s) => void (s.pathId = pathId), { kind: 'path-chosen', itemId: pathId, label: `Chose the ${label} path`, href: `/demo/start/paths/${pathId}` })) {
    writeJson(GUEST_PATH_KEY, pathId)
  }
}

export function signInAsNew(user: User, pathId = readJson<string>(GUEST_PATH_KEY) ?? 'fde'): void {
  if (!readJson<LearnerState>(learnerKey(user.id))) writeJson(learnerKey(user.id), emptyState(user, Date.now(), pathId))
  signIn(user.id)
}

export function signOutDemo(): void {
  signOut()
}

/** Restores the seeded state for the demo user, or an empty state for anyone else. */
export function resetLearner(): void {
  const s = current()
  if (!s) return
  writeJson(learnerKey(s.user.id), s.user.isDemo ? seedDemoState(s.user, Date.now()) : emptyState(s.user, Date.now(), s.pathId))
}

export function exportLearner(): string | null {
  const s = current()
  return s ? JSON.stringify(s, null, 2) : null
}

/** Validates an export before replacing state; returns an error message on failure. */
export function importLearner(json: string): string | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return 'That file is not valid JSON.'
  }
  const s = parsed as Partial<LearnerState>
  if (!s || s.version !== 1 || !s.user?.id || !Array.isArray(s.attempts) || typeof s.lessonsRead !== 'object') {
    return 'That JSON is not a Forward Deployed demo export (missing version, user or progress fields).'
  }
  const me = current()
  if (!me) return 'Sign in before importing progress.'
  writeJson(learnerKey(me.user.id), { ...s, user: me.user })
  return null
}

export function clearLearner(userId: string): void {
  removeKey(learnerKey(userId))
}
