/**
 * Types for the production curriculum in `curriculum.ts` (plan §9). Kept apart so
 * the data file stays readable and both UI code and the .mjs sync scripts share
 * one definition.
 */

/** Ready: the repository covers the objective. Partly: publish what exists and
 *  show the gap. Coming soon: no material. On hold: paused by the owner. */
export type ModuleStatus = 'ready' | 'partly' | 'coming-soon' | 'on-hold'

/** How a track is flagged in the curriculum: required for everyone, optional
 *  (the diagnostic decides), required on the FDE path, or required for candidates. */
export type TrackRequirement = 'yes' | 'no' | 'fde-path' | 'candidates'

/** Publishing decision per lesson (owner decision PM-01). `pending` and `excluded`
 *  lessons are never written to site/content. */
export type PublishDecision = 'own' | 'credited' | 'pending' | 'excluded'

/** `live`: already published under /modules or /fde-last-day-prep, so Learn links
 *  to that page. `sync`: copied into content/learn by the Learn sync (DATA-02). */
export type LessonKind = 'live' | 'sync'

export type CurriculumSection = {
  slug: string
  title: string
  whyItMatters: string
  outcomes: string
  exercise: string
  assessment: string
  interviewRelevance: string
  doneWhen: string
  /** Module slugs, in teaching order. */
  modules: string[]
}

export type CurriculumTrack = {
  slug: string
  /** Display code such as `T2`. May change; the slug may not. */
  code: string
  title: string
  objective: string
  forWhom: string
  /** Track slugs that should come first. */
  prerequisites: string[]
  /** Free-text prerequisite when it is not a track, e.g. "Basic programming". */
  prerequisiteNote?: string
  required: TrackRequirement
  estHours: number
  exitCompetencies: string[]
  sections: CurriculumSection[]
}

export type CurriculumModule = {
  slug: string
  /** Display code such as `T2.4`. May change; the slug may not. */
  code: string
  title: string
  /** Track slug. */
  track: string
  /** Section slug within the track. */
  section: string
  status: ModuleStatus
  estMinutes: number
  objective: string
  /** The boundary: what this module does not teach, and where that lives. */
  scope: string
  /** Module slugs whose checkpoints gate this one (soft gating). */
  prerequisites: string[]
  deliverable: string
  assessment: string
  interviewProbe: string
  commonMistakes: string[]
  /** Lesson slugs whose home is this module, in reading order. */
  lessons: string[]
  /** Lesson slugs homed in another module that this module also uses. */
  seeAlso: string[]
  /** What is still missing (Partly ready) or why nothing exists (Coming soon). */
  gapNote?: string
  /** Owner-facing reason a module is on hold. Not for public display. */
  holdNote?: string
}

export type CurriculumLesson = {
  /** Stable id, from the source file name. */
  slug: string
  title: string
  /** Repository path of the canonical source file or folder. */
  source: string
  /** Slug of the one module that teaches this lesson. */
  home: string
  kind: LessonKind
  publish: PublishDecision
  /** Credit line shown under the lesson when `publish` is `credited`. */
  credit?: string
}
