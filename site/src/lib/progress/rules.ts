/**
 * Learner-progress business rules (blueprint §16), shared by /demo and production, as pure functions.
 *
 * Nothing here reads storage, the clock or the data files: callers pass the learner
 * state, the entities and `now`. That keeps every rule testable under plain `node`
 * (`scripts/check-progress-rules.ts`) and lets the "time travel" setting work by simply
 * passing a shifted `now`. The rules are typed against the minimal structural shapes in
 * `./types` (`RuleAttempt`, `RuleModule`, `ScorableItem`), so demo entities and production
 * records both fit. Only `import type` is allowed in this file: Node's type
 * stripping erases it, whereas a runtime import would need a resolvable path.
 */
import type {
  ConfidenceRating,
  RubricDimension,
  RuleAttempt,
  RuleModule,
  RuleState,
  ScorableItem,
  Status,
} from './types'

/** Rules read only these learner-state fields; callers pass a `Pick` of what they hold. */
type LearnerState = RuleState

export const DAY_MS = 86_400_000
export const CHECKPOINT_PASS = 70

/** A module checkpoint's assessment id; attempts live under `fd:v1:learn:attempts:<id>` (DATA-10). */
export const checkpointId = (moduleSlug: string) => `checkpoint:${moduleSlug}`
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

export function attemptsFor<A extends RuleAttempt>(state: { attempts: A[] }, assessmentId: string): A[] {
  return state.attempts
    .filter((a) => a.assessmentId === assessmentId)
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
}

export function latestAttempt<A extends RuleAttempt>(state: { attempts: A[] }, assessmentId: string): A | undefined {
  const all = attemptsFor(state, assessmentId)
  return all[all.length - 1]
}

export function lastPass<A extends RuleAttempt>(state: { attempts: A[] }, assessmentId: string): A | undefined {
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
 * Any two passes count, so comparing the earliest and latest pass is enough. A fail
 * after the second pass is handled by `revisionReason`, which `moduleStatus` checks
 * next. `attempts` are oldest first; `confidence` is already decayed.
 */
export function isMastered(attempts: RuleAttempt[], confidence: number | undefined): boolean {
  if (confidence === undefined || confidence < 4) return false
  const passes = attempts.filter((a) => a.passed)
  if (passes.length < 2) return false
  const gap = Date.parse(passes[passes.length - 1].at) - Date.parse(passes[0].at)
  return gap >= MASTERY_GAP_DAYS * DAY_MS
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
  module: Pick<RuleModule, 'prerequisites'>,
  modulesById: Record<string, Pick<RuleModule, 'checkpointId'>>,
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
  module: RuleModule,
  facts: ModuleFacts,
  modulesById: Record<string, Pick<RuleModule, 'checkpointId'>>,
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

export interface CheckpointResult<I extends ScorableItem = ScorableItem> {
  score: number
  passed: boolean
  unanswered: string[]
  skillScores: Record<string, { correct: number; total: number }>
  missed: I[]
}

export function scoreCheckpoint<I extends ScorableItem>(
  assessment: { passPercent: number },
  items: I[],
  answers: Record<string, string>,
): CheckpointResult<I> {
  const skillScores: CheckpointResult['skillScores'] = {}
  const missed: I[] = []
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

/** The demo's shared rubric (1–4). Production mocks use the lessons' own rubric; removed with `/demo` (FE-19). */
export const RUBRIC_DIMENSIONS: RubricDimension[] = [
  'structure',
  'technical-depth',
  'trade-offs',
  'communication',
  'customer-judgement',
]

export interface MockResult<D extends string = string> {
  mean: number
  passed: boolean
  lowest: D | null
}

/**
 * Mock pass: every dimension scored, none below 2, and a mean of 3 or more. `dims` is the
 * round's rubric: the T8.2 short round's five signals or the full round's six dimensions.
 */
export function scoreMock<D extends string>(rubric: Partial<Record<D, number>>, dims: readonly D[]): MockResult<D> {
  const values = dims.map((d) => rubric[d] ?? 0)
  const mean = dims.length ? values.reduce((s, v) => s + v, 0) / dims.length : 0
  let lowest: D | null = null
  for (const d of dims) if (lowest === null || (rubric[d] ?? 0) < (rubric[lowest] ?? 0)) lowest = d
  const complete = dims.length > 0 && values.every((v) => v >= 1)
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

/** Rubric means map to 0–100 so that 1 = 0 and the top score = 100. Worksheets use 1–4, mocks 1–5. */
export const rubricToPercent = (mean: number, max = 4) => Math.max(0, Math.min(100, ((mean - 1) / (max - 1)) * 100))

/** Interview readiness inputs and weights (plan §9). Reading counts zero. */
export const INTERVIEW_INPUTS = [
  { id: 'worksheets', label: 'Worksheet and rubric scores', weight: 0.35 },
  { id: 'mocks', label: 'Mock interviews', weight: 0.3 },
  { id: 'checkpoints', label: 'Checkpoint pass rate', weight: 0.2 },
  { id: 'behavioural', label: 'Behavioural readiness', weight: 0.15 },
] as const

export type InterviewInput = (typeof INTERVIEW_INPUTS)[number]['id']

/** A readiness input that may not be measured yet: `value` is 0–100, or `null`. */
export interface MeasuredPart {
  id: InterviewInput
  label: string
  weight: number
  value: number | null
}

export interface MeasuredReadiness {
  /** `null` until at least one input is measured. */
  score: number | null
  measured: number
  parts: MeasuredPart[]
  /** The lowest measured input; never an unmeasured one. */
  weakest: MeasuredPart | null
}

/**
 * Interview readiness from measured inputs only (UX-07): an unmeasured input is left
 * out and the remaining weights are rescaled to 100%, so "not measured" never reads as
 * 0. With no measured input there is no score.
 */
export function measuredInterviewReadiness(values: Partial<Record<InterviewInput, number | null>>): MeasuredReadiness {
  const parts: MeasuredPart[] = INTERVIEW_INPUTS.map((p) => ({ ...p, value: values[p.id] ?? null }))
  const measured = parts.filter((p): p is MeasuredPart & { value: number } => p.value !== null)
  const weight = measured.reduce((s, p) => s + p.weight, 0)
  const score = measured.length ? Math.round(measured.reduce((s, p) => s + p.weight * p.value, 0) / weight) : null
  const weakest = measured.reduce<MeasuredPart | null>((w, p) => (w === null || p.value < (w.value ?? 0) ? p : w), null)
  return { score, measured: measured.length, parts, weakest }
}

/** Worksheet input: the mean of every scored scorecard row (levels 1, 3, 5) as 0–100. */
export function scorecardReadiness(scores: number[]): number | null {
  const valid = scores.filter((s) => s >= 1 && s <= 5)
  return valid.length ? rubricToPercent(valid.reduce((s, v) => s + v, 0) / valid.length, 5) : null
}

/**
 * Mock input: one entry per scenario mock, the latest round's 1–5 mean or `null` when
 * the mock was never scored. Untaken mocks count 0; no scored mock at all is unmeasured.
 */
export function mockReadiness(latestMeans: (number | null)[]): number | null {
  if (!latestMeans.some((m) => m !== null)) return null
  return latestMeans.reduce<number>((s, m) => s + (m === null ? 0 : rubricToPercent(m, 5)), 0) / latestMeans.length
}

/**
 * Checkpoint input: of the module checkpoints the learner has taken, the share whose
 * latest attempt passed. Unmeasured until one checkpoint is taken.
 */
export function checkpointReadiness(latestPassed: boolean[]): number | null {
  return latestPassed.length ? (latestPassed.filter(Boolean).length / latestPassed.length) * 100 : null
}

/**
 * Behavioural input: across every competency-worksheet question, Practised counts half
 * and Mastered one. Unmeasured until at least one question is Practised or Mastered.
 */
export function behaviouralReadiness(statuses: string[], totalQuestions: number): number | null {
  const credit = statuses.reduce((s, v) => s + (v === 'mastered' ? 1 : v === 'practiced' ? 0.5 : 0), 0)
  return credit > 0 && totalQuestions > 0 ? Math.min(100, (credit / totalQuestions) * 100) : null
}

/**
 * Interview readiness as the demo computes it, with unmeasured inputs at 0. Demo only:
 * production uses `measuredInterviewReadiness`; removed with /demo (FE-19).
 */
export function interviewReadiness(input: {
  rubricMeans: number[] // latest self-scored exercise/worksheet means, 1–4
  mockMeans: number[] // latest mean per required mock, 1–5, 0 when not taken
  checkpointsPassed: number
  checkpointsTotal: number
  behavioural: number // 0–100
}): Readiness {
  const avg = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0)
  const value: Record<InterviewInput, number> = {
    worksheets: input.rubricMeans.length ? rubricToPercent(avg(input.rubricMeans)) : 0,
    mocks: avg(input.mockMeans.map((m) => (m ? rubricToPercent(m, 5) : 0))),
    checkpoints: input.checkpointsTotal ? (input.checkpointsPassed / input.checkpointsTotal) * 100 : 0,
    behavioural: input.behavioural,
  }
  return readiness(INTERVIEW_INPUTS.map((p) => ({ ...p, value: value[p.id] })))
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
