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

/** `live`: already published elsewhere (a case, worksheet or Story Bank page), so Learn links
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
  /**
   * Hand estimate in minutes, only for a module with no lessons of its own (planned, on
   * hold, or one that lists another module's lessons). Every other module's time is its
   * lessons' reading time plus `practiceMinutes` (`studyTime` in study-time.ts).
   */
  estMinutes?: number
  /** Minutes of practice beyond reading: worksheets, mocks, a build (ENH-22). */
  practiceMinutes?: number
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
  /**
   * Another page lists this module's lessons, so the module page links there instead of
   * repeating the list (T5.5 and the casebook, ENH-16). The lessons still count for progress.
   */
  listedOn?: { href: string; label: string; lead: string }
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
  /** Estimated reading time. Weights the module progress rollup when known. */
  estMinutes?: number
  /**
   * Publishes only part of a markdown source file (a "lesson slice"), so one file
   * that covers two modules' topics can give each module a real lesson.
   *
   * Entries are the texts of the source's `## ` headings, matched exactly after
   * trimming (punctuation included). The sync fails when a listed heading is not
   * in the source.
   *  - `include`: publish only those H2 sections, in the listed order. Nothing
   *    before the first H2 is kept except the title `#` heading.
   *  - `exclude`: publish the whole file minus those H2 sections.
   *
   * When several lessons share one source, every H2 must be published by exactly
   * one of them or be excluded on purpose (listed in an `exclude` and in no
   * `include`), and at most one of them may lack `include`. That one is the "main"
   * part: it keeps the preamble, and a repository link to the file without an
   * anchor goes to it. `check:curriculum` enforces this, so a heading can neither
   * be published twice nor silently dropped.
   */
  sections?: { include?: string[]; exclude?: string[] }
}

/**
 * An interview topic hub (DATA-07), shown at `/interview/hubs/<slug>`. A hub is an index
 * onto practice that already exists: it lists lessons and modules by slug, so their
 * titles and URLs come from the curriculum and never drift. It holds no question text.
 */
export type InterviewHub = {
  /** URL id. Never change one after it ships. */
  slug: string
  title: string
  summary: string
  /** Published lesson slugs to practise with, interview-question lessons first. */
  practice: string[]
  /** Module slugs to study when practice shows a gap. */
  modules: string[]
}
