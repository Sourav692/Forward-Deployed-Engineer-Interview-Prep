/**
 * Learner status for Learn modules, computed in the browser from the `fd:v1` store.
 *
 * Pure functions over the store getters; only client islands call them (the store
 * reads localStorage). Server pages describe each module with a `ModuleInput`, so
 * the islands never need the sync manifest.
 */
import { LESSONS, MODULES } from '@/lib/curriculum'
import type { ModuleStatus } from '@/lib/curriculum-types'
import { checkPrerequisites, revisionReason, rollup, type PrerequisiteCheck } from '@/lib/progress/rules'
import { getModuleRecord, isLessonRead, latestConfidence, moduleProgress, type ProgressSummary } from '@/lib/progress/store'
import type { RuleAttempt } from '@/lib/progress/types'
import type { LearnerStatus } from '@/components/ui/StatusBadge'

/** What an island needs to know about one module. Built on the server by `moduleInput()`. */
export type ModuleInput = {
  slug: string
  status: ModuleStatus
  /** Lesson slugs on the module's main reading list (home lessons, or see-also when it owns none). */
  reading: string[]
  /** Lesson slug → minutes, from the sync manifest. */
  minutes: Record<string, number>
  /** Prerequisite modules, each with its own main reading list. */
  prereqs: { slug: string; reading: string[] }[]
}

const homeOf = new Map(LESSONS.map((l) => [l.slug, l.home]))

/** Read state lives under the lesson's home module, whichever module links to it. */
export const lessonHome = (lessonSlug: string) => homeOf.get(lessonSlug) ?? ''

export const isRead = (lessonSlug: string) => isLessonRead(lessonHome(lessonSlug), lessonSlug)

/**
 * Progress over the main reading list, weighted by manifest minutes. When the list is
 * the module's own home lessons this is the store's `moduleProgress`; for a module
 * that only has see-also lessons (T1.4, T1.5) the same weighted rollup runs over them.
 */
export function readingProgress(input: Pick<ModuleInput, 'slug' | 'reading' | 'minutes'>): ProgressSummary {
  const mod = MODULES.find((m) => m.slug === input.slug)
  const ownsList = !!mod && mod.lessons.length > 0 && mod.lessons.length === input.reading.length
  if (ownsList) return moduleProgress(input.slug, input.minutes)
  const known = Object.values(input.minutes)
  const fallback = known.length ? known.reduce((s, m) => s + m, 0) / known.length : 1
  let lessonsRead = 0
  const parts = input.reading.map((slug) => {
    const read = isRead(slug)
    if (read) lessonsRead++
    return { minutes: input.minutes[slug] ?? fallback, fraction: read ? 1 : 0 }
  })
  return { fraction: rollup(parts), lessonsRead, lessonsTotal: input.reading.length }
}

/**
 * Completed, in Phase 1 terms: every lesson on the main reading list read and a
 * confidence rating of 3 or more.
 *
 * Plan §15 Q4: there are no checkpoints until Phase 2 (DATA-10), so "passed" cannot
 * mean a checkpoint pass yet. Until checkpoints ship, a module is Completed when its
 * lessons are read and confidence is ≥ 3, and that is what satisfies a prerequisite.
 */
export function isCompleted(slug: string, reading: string[]): boolean {
  if (reading.length === 0 || !reading.every(isRead)) return false
  return (latestConfidence(slug)?.value ?? 0) >= 3
}

/**
 * The plan's `checkPrerequisites` rule, fed with Phase 1 facts: each completed
 * prerequisite becomes a synthetic passed checkpoint attempt, and skipped modules
 * come from the module records.
 */
export function prerequisiteCheck(prereqs: ModuleInput['prereqs']): PrerequisiteCheck {
  const attempts: RuleAttempt[] = []
  const skipped: Record<string, string> = {}
  const byId: Record<string, { checkpointId: string }> = {}
  for (const p of prereqs) {
    byId[p.slug] = { checkpointId: `phase1:${p.slug}` }
    const skippedAt = getModuleRecord(p.slug).skipped
    if (skippedAt) skipped[p.slug] = skippedAt
    if (isCompleted(p.slug, p.reading)) attempts.push({ assessmentId: `phase1:${p.slug}`, at: '', passed: true })
  }
  return checkPrerequisites({ attempts, skipped }, { prerequisites: prereqs.map((p) => p.slug) }, byId)
}

/**
 * Precedence follows `rules.moduleStatus`: skipped > needs revision > completed >
 * blocked > in progress > not started. Mastered and Ready for review need checkpoints
 * and exercises, which arrive in Phase 2.
 */
export function learnerStatus(input: ModuleInput, now = Date.now()): LearnerStatus {
  const record = getModuleRecord(input.slug)
  if (record.skipped) return 'skipped'
  const latest = latestConfidence(input.slug)
  if (revisionReason({ attempts: [], confidence: latest ? { [input.slug]: latest } : {} }, input.slug, undefined, now)) {
    return 'needs-revision'
  }
  if (isCompleted(input.slug, input.reading)) return 'completed'
  if (!prerequisiteCheck(input.prereqs).ok) return 'blocked'
  if (input.reading.some(isRead) || latest) return 'in-progress'
  return 'not-started'
}
