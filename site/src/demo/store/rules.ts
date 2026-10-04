/**
 * Business rules for the prototype (blueprint §16), as pure functions.
 *
 * Nothing here reads storage, the clock or the data files: callers pass the learner
 * state, the entities and `now`. That keeps every rule testable under plain `node`
 * (`scripts/check-demo-rules.ts`) and lets the "time travel" setting work by simply
 * passing a shifted `now`. Only `import type` is allowed in this file: Node's type
 * stripping erases it, whereas a runtime import would need a resolvable path.
 */
import type {
  Assessment,
  AssessmentItem,
  Attempt,
  ConfidenceRating,
  LearnerState,
  Module,
  RubricDimension,
  Status,
} from '../types'

export const DAY_MS = 86_400_000
export const CHECKPOINT_PASS = 70
export const MASTERY_GAP_DAYS = 7
export const DECAY_INTERVALS = [14, 30, 60] as const
export const CONFIDENCE_DECAY_DAYS = 21
export const EXAM_PASS = 82

const daysBetween = (from: string | number, to: number) =>
  (to - (typeof from === 'number' ? from : Date.parse(from))) / DAY_MS

/** The learner's "now", shifted by the settings time-travel control. */
export function effectiveNow(state: Pick<LearnerState, 'clockOffsetDays'>, realNow: number): number {
  return realNow + state.clockOffsetDays * DAY_MS
}

// ── Attempts and confidence ────────────────────────────────────────────────

export function attemptsFor(state: Pick<LearnerState, 'attempts'>, assessmentId: string): Attempt[] {
  return state.attempts
    .filter((a) => a.assessmentId === assessmentId)
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
}

export function latestAttempt(state: Pick<LearnerState, 'attempts'>, assessmentId: string): Attempt | undefined {
  const all = attemptsFor(state, assessmentId)
  return all[all.length - 1]
}

export function lastPass(state: Pick<LearnerState, 'attempts'>, assessmentId: string): Attempt | undefined {
  return attemptsFor(state, assessmentId).filter((a) => a.passed).pop()
}

/** Confidence drops one level per 21 days without review, never below 1. */
export function effectiveConfidence(rating: ConfidenceRating | undefined, now: number): number | undefined {
  if (!rating) return undefined
  const decay = Math.floor(Math.max(0, daysBetween(rating.at, now)) / CONFIDENCE_DECAY_DAYS)
  return Math.max(1, rating.value - decay)
}

// ── Mastery ────────────────────────────────────────────────────────────────

/**
 * Mastered: passed twice, at least 7 days apart, with confidence ≥ 4.
 *
 * TODO(learner): implement. Inputs: every attempt at this module's checkpoint, oldest
 * first, and the learner's current (already decayed) confidence for the module.
 */
export function isMastered(attempts: Attempt[], confidence: number | undefined): boolean {
  void attempts
  void confidence
  return false
}

// ── Prerequisites (soft gating) ────────────────────────────────────────────

export interface PrerequisiteCheck {
  ok: boolean
  /** Prerequisite modules whose checkpoint has never been attempted. */
  missing: string[]
  /** Prerequisite modules whose checkpoint was attempted but never passed. */
  failed: string[]
}

/** A prerequisite is met by a passed checkpoint or a skip ("Test out" or the path). */
export function checkPrerequisites(
  state: Pick<LearnerState, 'attempts' | 'skipped'>,
  module: Pick<Module, 'prerequisites'>,
  modulesById: Record<string, Pick<Module, 'checkpointId'>>,
): PrerequisiteCheck {
  const missing: string[] = []
  const failed: string[] = []
  for (const id of module.prerequisites) {
    const prereq = modulesById[id]
    if (!prereq || state.skipped[id]) continue
    const attempts = attemptsFor(state, prereq.checkpointId)
    if (attempts.some((a) => a.passed)) continue
    ;(attempts.length ? failed : missing).push(id)
  }
  return { ok: missing.length === 0 && failed.length === 0, missing, failed }
}

// ── Revision ───────────────────────────────────────────────────────────────

export type RevisionReason = 'low-confidence' | 'failed-checkpoint' | 'decay'

/**
 * Why an item needs revision, or null. Items enter when confidence ≤ 2, the latest
 * checkpoint failed, or 14 / 30 / 60 days pass since the last pass; they leave on a
 * re-pass or a confidence rating ≥ 4 given after the trigger.
 */
export function revisionReason(
  state: Pick<LearnerState, 'attempts' | 'confidence'>,
  itemId: string,
  checkpointId: string | undefined,
  now: number,
): RevisionReason | null {
  const rating = state.confidence[itemId]
  const conf = effectiveConfidence(rating, now)
  if (conf !== undefined && conf <= 2) return 'low-confidence'
  if (!checkpointId) return null

  const latest = latestAttempt(state, checkpointId)
  const reassured = (since: string) =>
    rating !== undefined && rating.value >= 4 && Date.parse(rating.at) > Date.parse(since)

  if (latest && !latest.passed && !reassured(latest.at)) return 'failed-checkpoint'

  const pass = lastPass(state, checkpointId)
  if (!pass) return null
  // Each confidence ≥ 4 review after the pass pushes the next due date further out.
  const reviews = rating && rating.value >= 4 && Date.parse(rating.at) > Date.parse(pass.at) ? 1 : 0
  const anchor = reviews ? rating!.at : pass.at
  const interval = DECAY_INTERVALS[Math.min(reviews, DECAY_INTERVALS.length - 1)]
  return daysBetween(anchor, now) >= interval ? 'decay' : null
}

// ── Module status ──────────────────────────────────────────────────────────

export interface ModuleFacts {
  lessonsRead: number
  lessonsTotal: number
  requiredExerciseSubmitted: boolean
  anyExerciseSubmitted: boolean
}

/** Precedence: skipped > mastered > needs-revision > completed > blocked > ready > in progress. */
export function moduleStatus(
  state: Pick<LearnerState, 'attempts' | 'skipped' | 'confidence'>,
  module: Module,
  facts: ModuleFacts,
  modulesById: Record<string, Pick<Module, 'checkpointId'>>,
  now: number,
): Status {
  if (state.skipped[module.id]) return 'skipped'

  const attempts = attemptsFor(state, module.checkpointId)
  const passed = attempts.some((a) => a.passed)
  const confidence = effectiveConfidence(state.confidence[module.id], now)
  const allRead = facts.lessonsTotal > 0 && facts.lessonsRead >= facts.lessonsTotal

  if (passed && allRead && isMastered(attempts, confidence)) return 'mastered'
  if (revisionReason(state, module.id, module.checkpointId, now)) return 'needs-revision'
  if (passed && allRead && facts.requiredExerciseSubmitted) return 'completed'
  if (!checkPrerequisites(state, module, modulesById).ok) return 'blocked'
  if (allRead && facts.requiredExerciseSubmitted) return 'ready-for-review'
  if (facts.lessonsRead > 0 || facts.anyExerciseSubmitted || attempts.length > 0) return 'in-progress'
  return 'not-started'
}

/** Done for progress and path completion. Skipped counts as done; it adds no evidence. */
export const isDone = (s: Status) => s === 'completed' || s === 'mastered' || s === 'skipped'

// ── Progress rollups ───────────────────────────────────────────────────────

export interface Weighted {
  minutes: number
  fraction: number // 0–1
}

/** Rollups are weighted by estimated minutes, not item counts (blueprint §16). */
export function rollup(parts: Weighted[]): number {
  const total = parts.reduce((s, p) => s + p.minutes, 0)
  if (total === 0) return 0
  return parts.reduce((s, p) => s + p.minutes * Math.min(1, Math.max(0, p.fraction)), 0) / total
}

export function moduleFraction(
  status: Status,
  parts: { lessons: Weighted[]; exercise: Weighted; checkpoint: Weighted },
): number {
  if (isDone(status)) return 1
  return rollup([...parts.lessons, parts.exercise, parts.checkpoint])
}

// ── Assessments ────────────────────────────────────────────────────────────

export interface CheckpointResult {
  score: number
  passed: boolean
  unanswered: string[]
  skillScores: Record<string, { correct: number; total: number }>
  missed: AssessmentItem[]
}

export function scoreCheckpoint(
  assessment: Pick<Assessment, 'passPercent'>,
  items: AssessmentItem[],
  answers: Record<string, string>,
): CheckpointResult {
  const skillScores: CheckpointResult['skillScores'] = {}
  const missed: AssessmentItem[] = []
  const unanswered = items.filter((i) => !answers[i.id]).map((i) => i.id)
  let correct = 0
  for (const i of items) {
    const s = (skillScores[i.skillId] ??= { correct: 0, total: 0 })
    s.total++
    if (answers[i.id] === i.correctOptionId) {
      correct++
      s.correct++
    } else missed.push(i)
  }
  const score = items.length ? Math.round((correct / items.length) * 100) : 0
  return { score, passed: score >= assessment.passPercent, unanswered, skillScores, missed }
}

export const RUBRIC_DIMENSIONS: RubricDimension[] = [
  'structure',
  'technical-depth',
  'trade-offs',
  'communication',
  'customer-judgement',
]

export interface MockResult {
  mean: number
  passed: boolean
  lowest: RubricDimension | null
}

/** Mock pass: no dimension below 2 and a mean of 3 or more. Customer judgement only on FDE rounds. */
export function scoreMock(
  rubric: Partial<Record<RubricDimension, number>>,
  fdeRound: boolean,
): MockResult {
  const dims = RUBRIC_DIMENSIONS.filter((d) => fdeRound || d !== 'customer-judgement')
  const values = dims.map((d) => rubric[d] ?? 0)
  const mean = values.reduce((s, v) => s + v, 0) / dims.length
  let lowest: RubricDimension | null = null
  for (const d of dims) if (lowest === null || (rubric[d] ?? 0) < (rubric[lowest] ?? 0)) lowest = d
  const complete = values.every((v) => v >= 1)
  return { mean, passed: complete && values.every((v) => v >= 2) && mean >= 3, lowest }
}

export interface ExamResult {
  total: number
  raw: number
  passed: boolean
  capped: boolean
}

/** Any automatic-fail condition caps the result just below the pass mark. */
export function scoreExam(sectionScores: Record<string, number>, autoFails: string[], passMark = EXAM_PASS): ExamResult {
  const raw = Object.values(sectionScores).reduce((s, v) => s + v, 0)
  const capped = autoFails.length > 0 && raw >= passMark
  const total = autoFails.length > 0 ? Math.min(raw, passMark - 1) : raw
  return { total, raw, passed: total >= passMark && autoFails.length === 0, capped }
}

// ── Readiness ──────────────────────────────────────────────────────────────

export interface ReadinessPart {
  id: string
  label: string
  weight: number
  value: number // 0–100
}

export interface Readiness {
  score: number
  parts: ReadinessPart[]
  weakest: ReadinessPart
}

function readiness(parts: ReadinessPart[]): Readiness {
  const score = Math.round(parts.reduce((s, p) => s + p.weight * p.value, 0))
  const weakest = parts.reduce((w, p) => (p.value < w.value ? p : w), parts[0])
  return { score, parts, weakest }
}

/** Rubric means (1–4) map to 0–100 so that 1 = 0 and 4 = 100. */
export const rubricToPercent = (mean: number) => Math.max(0, Math.min(100, ((mean - 1) / 3) * 100))

/**
 * Interview readiness: 35% worksheet and rubric means + 30% mocks + 20% checkpoint
 * pass rate + 15% behavioural readiness. Reading counts zero.
 */
export function interviewReadiness(input: {
  rubricMeans: number[] // latest self-scored exercise/worksheet means, 1–4
  mockMeans: number[] // latest mean per required mock, 0 when not taken
  checkpointsPassed: number
  checkpointsTotal: number
  behavioural: number // 0–100
}): Readiness {
  const avg = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0)
  return readiness([
    { id: 'worksheets', label: 'Worksheet and rubric scores', weight: 0.35, value: input.rubricMeans.length ? rubricToPercent(avg(input.rubricMeans)) : 0 },
    { id: 'mocks', label: 'Mock interviews', weight: 0.3, value: avg(input.mockMeans.map((m) => (m ? rubricToPercent(m) : 0))) },
    { id: 'checkpoints', label: 'Checkpoint pass rate', weight: 0.2, value: input.checkpointsTotal ? (input.checkpointsPassed / input.checkpointsTotal) * 100 : 0 },
    { id: 'behavioural', label: 'Behavioural readiness', weight: 0.15, value: input.behavioural },
  ])
}

/** Portfolio readiness: 40% capstone rubric + 30% projects + 20% write-up + 10% story links. */
export function portfolioReadiness(input: {
  capstoneRubric: number | undefined // 1–4
  projectsCompleted: number
  projectsRequired: number
  writeUpDone: boolean
  storyProjectLinks: number
}): Readiness {
  return readiness([
    { id: 'capstone', label: 'Capstone rubric', weight: 0.4, value: input.capstoneRubric ? rubricToPercent(input.capstoneRubric) : 0 },
    { id: 'projects', label: 'Projects completed', weight: 0.3, value: input.projectsRequired ? Math.min(1, input.projectsCompleted / input.projectsRequired) * 100 : 0 },
    { id: 'write-up', label: 'Portfolio write-up', weight: 0.2, value: input.writeUpDone ? 100 : 0 },
    { id: 'story-links', label: 'Stories linked to projects', weight: 0.1, value: Math.min(1, input.storyProjectLinks / 3) * 100 },
  ])
}

// ── Planning ───────────────────────────────────────────────────────────────

/** Study-plan days-to-finish model: remaining minutes over a daily budget from weekly hours. */
export function finishBy(remainingMinutes: number, weeklyHours: number, now: number): { days: number; date: number } {
  const perDay = (Math.max(0.5, weeklyHours) * 60) / 7
  const days = Math.ceil(Math.max(0, remainingMinutes) / perDay)
  return { days, date: now + days * DAY_MS }
}
