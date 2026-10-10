/**
 * Learner record types for the production site (plan §8 and §9, task BE-01).
 *
 * Two layers live here:
 *
 * 1. Shared rule vocabulary (`Status`, `ConfidenceRating`, `AttemptBase`, …), used by
 *    the pure rules in `rules.ts` and the progress islands.
 * 2. Production records. Each record that version 2 sync will upload carries a stable
 *    `id` and an `updatedAt` (ISO), so a server can merge them last-writer-wins.
 *
 * Types only: Node's type stripping erases `import type`, which keeps `rules.ts` and the
 * check scripts runnable under plain `node`.
 */

// ── Shared rule vocabulary ─────────────────────────────────────────────────

/** The eight learner-facing statuses (blueprint §16). */
export type Status =
  | 'not-started'
  | 'in-progress'
  | 'blocked'
  | 'ready-for-review'
  | 'completed'
  | 'needs-revision'
  | 'mastered'
  | 'skipped'

export type AssessmentKind = 'checkpoint' | 'mock' | 'readiness-exam'

/** A dated 1–5 self-rating; decays one level per 21 days without review. */
export interface ConfidenceRating {
  value: 1 | 2 | 3 | 4 | 5
  at: string // ISO
}

/** One checkpoint, mock or exam attempt, as the rules see it. */
export interface AttemptBase {
  id: string
  assessmentId: string
  kind: AssessmentKind
  at: string
  /** 0–100 for checkpoints and the exam; for mocks, the rubric mean as 0–100 (`rubricToPercent`). */
  score: number
  passed: boolean
  answers?: Record<string, string>
  skillScores?: Record<string, { correct: number; total: number }>
  /** Mock scores by dimension id; `answers` then holds the evidence line per dimension. */
  rubric?: Partial<Record<string, number>>
  sectionScores?: Record<string, number>
  autoFails?: string[]
}

// ── Minimal shapes the pure rules work on ──────────────────────────────────
// The rules accept anything with these fields, so curriculum records and learner
// state fit without the rules knowing either model.

/** The attempt fields the rules read. */
export interface RuleAttempt {
  assessmentId: string
  at: string
  passed: boolean
}

/** The learner-state fields the rules read. Callers pass a `Pick` of what they have. */
export interface RuleState<A extends RuleAttempt = RuleAttempt> {
  attempts: A[]
  /** Module id → ISO time it was skipped ("Test out" or the chosen path). */
  skipped: Record<string, string>
  /** Module or question id → latest rating. */
  confidence: Record<string, ConfidenceRating>
}

/** The module fields the rules read. */
export interface RuleModule {
  id: string
  prerequisites: string[]
  checkpointId: string
}

/** The assessment-item fields checkpoint scoring reads. */
export interface ScorableItem {
  id: string
  correctOptionId: string
  skillId: string
}

// ── Production learner records (sync-ready) ────────────────────────────────

/** Every record a version 2 account would sync. */
export interface LearnerRecord {
  /** Stable across devices; derived from the item it describes where possible. */
  id: string
  /** ISO time of the last change; the merge key for last-writer-wins sync. */
  updatedAt: string
}

/** A lesson or module state, as version 2 sync would upload it. */
export interface ProgressRecord extends LearnerRecord {
  /** `lesson:<moduleSlug>/<lessonSlug>` or `module:<moduleSlug>`. */
  itemId: string
  status: Status
  confidence?: ConfidenceRating
  timeSpentMin?: number
  lastAccessed?: string
}

/** Stored under `fd:v1:learn:attempts:<assessmentId>` as `Attempt[]` (Phase 2). */
export interface Attempt extends AttemptBase, LearnerRecord {}

export type BookmarkKind = 'lesson' | 'module' | 'question' | 'mock' | 'case'

/** Stored as `Bookmark[]` under `fd:v1:bookmarks`. */
export interface Bookmark extends LearnerRecord {
  kind: BookmarkKind
  /** Lesson items use `<moduleSlug>/<lessonSlug>`; others use their slug. */
  itemId: string
  label?: string
  href?: string
  at: string
}

/** A module's free-text note. Stored inside the module record as `notes`; this is its sync shape. */
export interface Note extends LearnerRecord {
  itemId: string
  body: string
}

export type ActivityKind =
  | 'lesson-read'
  | 'confidence-set'
  | 'module-opened-anyway'
  | 'path-chosen'
  | 'bookmark-added'
  | 'attempt-recorded'
  | 'checkpoint-passed'
  | 'checkpoint-failed'
  | 'mock-completed'
  | 'note-saved'

/** Stored as the newest 200 events under `fd:v1:activity`, newest first. */
export interface ActivityEvent extends LearnerRecord {
  kind: ActivityKind
  at: string
  itemId: string
  label?: string
  href?: string
}

// ── Stored values, one per fd:v1 key (plan §8) ─────────────────────────────

/** `fd:v1:path`. A singleton, so no `id`. */
export interface PathChoice {
  pathId: string
  variant?: string
  weeklyHours: number
  chosenAt: string
}

/** `fd:v1:learn:lesson:<moduleSlug>/<lessonSlug>`. Absent key means unread. */
export interface LessonReadRecord {
  readAt: string
}

/** `fd:v1:learn:module:<moduleSlug>`. */
export interface ModuleRecord {
  /** Every rating given, oldest first; the latest one drives the rules. */
  confidence: ConfidenceRating[]
  notes: string
  /** Set when the learner opened the module despite unmet prerequisites. */
  openedAnywayAt?: string
  /** ISO time the module was skipped ("Test out" or the path). */
  skipped?: string
  updatedAt?: string
}

/** The file written by `exportProgress` and accepted by `importProgress`. */
export interface ProgressExport {
  app: 'forward-deployed'
  version: 1
  exportedAt: string
  /** Raw localStorage values, keyed by their full `fd:v1:*` key. */
  data: Record<string, string>
}
