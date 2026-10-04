/**
 * Content and learner-state model for the /demo prototype.
 *
 * Mirrors the blueprint's content model (§18) so the static data in `data/` can later
 * be swapped for API calls without reshaping the UI. Every entity has a stable string
 * id; relationships are expressed as ids, never as nested copies.
 *
 * This file holds types only. `store/rules.ts` imports it with `import type`, which
 * keeps the rules runnable under plain `node` (type stripping erases the import).
 */

// ── Shared ──────────────────────────────────────────────────────────────────

export type Level = 'foundation' | 'intermediate' | 'advanced'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type ModuleFlag = 'required' | 'recommended' | 'optional'

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

export type Topic =
  | 'orientation'
  | 'engineering'
  | 'llm-retrieval'
  | 'agents'
  | 'production'
  | 'design'
  | 'fde'
  | 'communication'
  | 'interview'
  | 'portfolio'

export type QuestionCategory =
  | 'software-engineering'
  | 'data-engineering'
  | 'machine-learning'
  | 'llm-applications'
  | 'ai-systems-design'
  | 'distributed-systems'
  | 'fde'
  | 'behavioural'

// ── Learning structure ─────────────────────────────────────────────────────

export interface Track {
  id: string // 't2'
  code: string // 'T2'
  title: string
  objective: string
  targetLearner: string
  prerequisites: string // human summary; module-level prerequisites are ids
  required: boolean
  requiredNote: string // e.g. 'Yes (FDE path)'
  estHours: number
  level: Level
  topic: Topic
  exitCompetencies: string[]
  sectionIds: string[]
  /** True for T2, T4, T5 and T6: every module has hand-written sample lessons. */
  inDepth: boolean
  relatedProjectIds: string[]
  relatedHubIds: string[]
  relatedCaseIds: string[]
}

export interface Section {
  id: string // 't2-retrieval'
  trackId: string
  title: string
  purpose: string
  outcomes: string
  moduleIds: string[]
  projectId?: string
  projectLabel: string // the blueprint's "Project / exercise" cell
  assessment: string
  interviewRelevance: string
  doneWhen: string
}

export interface Module {
  id: string // 't2-4'
  code: string // 'T2.4'
  trackId: string
  sectionId: string
  title: string
  objective: string
  scope: string
  why: string
  outcomes: string[]
  prerequisites: string[] // module ids
  unlocks: string[] // module ids this one feeds
  lessonIds: string[]
  exerciseIds: string[]
  checkpointId: string
  estMinutes: number
  canonicalSource: string // placeholder path only
  relatedModuleIds: string[]
  interviewQuestionIds: string[]
  commonMistakes: string[]
  skillIds: string[]
}

export interface LessonSection {
  heading: string // imperative
  body: string
}

export interface Lesson {
  id: string
  moduleId: string
  order: number
  title: string
  tagline: string // one-sentence trade-off
  readingMin: number
  objectives: string[]
  sections: LessonSection[]
  workedExample: { title: string; body: string }
  warning: string
  takeaways: string[]
  checkYourself: [string, string, string]
  referenceIds: string[]
}

export interface RubricAnchor {
  level: 1 | 2 | 3 | 4
  label: string
  description: string
}

export interface Exercise {
  id: string
  moduleId: string
  title: string
  required: boolean
  difficulty: Difficulty
  estMinutes: number
  skillIds: string[]
  instructions: string[]
  expectedOutput: string
  hints: string[]
  rubric: { criterion: string; anchors: RubricAnchor[] }[]
}

export type AssessmentKind = 'checkpoint' | 'mock' | 'readiness-exam'

export interface AssessmentOption {
  id: string
  text: string
}

export interface AssessmentItem {
  id: string
  kind: 'multiple-choice' | 'scenario'
  prompt: string
  scenario?: string
  options: AssessmentOption[]
  correctOptionId: string
  explanation: string
  skillId: string
  /** Module to revise when this item is missed. */
  remediationModuleId: string
}

export interface Assessment {
  id: string
  kind: AssessmentKind
  title: string
  moduleId?: string
  passPercent: number
  itemIds: string[]
}

// ── Projects and interview practice ────────────────────────────────────────

export type ProjectType =
  | 'implementation'
  | 'debugging'
  | 'architecture'
  | 'customer-simulation'
  | 'productionisation'
  | 'timed'
  | 'capstone'

export type ProjectStatus = 'not-started' | 'in-progress' | 'ready-for-review' | 'completed'

export interface Project {
  id: string // 'p2'
  code: string // 'P2'
  title: string
  type: ProjectType
  typeLabel: string
  difficulty: Difficulty
  estHours: number
  businessProblem: string
  targetUser: string
  functionalRequirements: string
  nonFunctionalRequirements: string
  suggestedArchitecture: string
  dataRequirements: string
  aiComponents: string
  deployment: string
  observability: string
  security: string
  cost: string
  evaluationStrategy: string
  deliverables: string[]
  stretchGoals: string
  interviewQuestions: string
  portfolioGuidance: string
  completionRubric: string
  checklist: string[]
  skillIds: string[]
  moduleIds: string[]
}

export interface InterviewHub {
  id: string // 'technical-foundations'
  title: string
  summary: string
  topics: string[]
}

export interface InterviewQuestion {
  id: string
  hubId: string
  topic: string
  category: QuestionCategory
  difficulty: Difficulty
  prompt: string
  conceptReview: string
  canonicalModuleId: string
  answerStructure: string[]
  hints: string[]
  sampleAnswer: string
  weakAnswers: string[]
  followUps: string[]
  rubricAnchors: { dimension: RubricDimension; strong: string }[]
  practiceLinks: { label: string; href: string }[]
  mockId: string
  relatedModuleIds: string[]
}

export type RubricDimension =
  | 'structure'
  | 'technical-depth'
  | 'trade-offs'
  | 'communication'
  | 'customer-judgement'

export interface MockInterview {
  id: string // 'mock-a'
  letter: 'A' | 'B' | 'C' | 'D' | 'E'
  title: string
  minutes: number
  covers: string
  prompt: string
  context: string[]
  probes: string[]
  fdeRound: boolean // whether customer judgement is scored
  relatedModuleIds: string[]
}

export interface ReadinessExamSection {
  id: string
  title: string
  maxPoints: number
  task: string
}

export interface ReadinessExam {
  id: 'readiness-exam'
  title: string
  minutes: number
  passMark: number
  scenario: string
  sections: ReadinessExamSection[]
  autoFailConditions: { id: string; label: string }[]
}

export interface CaseStudy {
  id: string
  code: string
  title: string
  summary: string
  pattern: string
  difficulty: Difficulty
  moduleIds: string[]
  main: LessonSection[]
  deepDive: LessonSection[]
  cheatSheet: string[]
}

export type Confidence = 'high' | 'medium' | 'low'

export interface CompanyPack {
  id: string
  name: string // fictional only
  tagline: string
  pathVariantId?: string
  sources: { claim: string; source: string; confidence: Confidence }[]
  loop: { round: string; format: string; minutes: number; aiPolicy: string }[]
  coverage: { area: string; covered: boolean; note: string; moduleIds: string[] }[]
  readingOrder: { phase: string; items: string[]; doneWhen: string }[]
  brief: string[]
  roundGuides: { round: string; guidance: string; moduleIds: string[] }[]
  practiceBank: { prompt: string; questionId?: string }[]
  questionsToAsk: string[]
  fillIn: string[]
  checklist: string[]
}

// ── Learners and paths ─────────────────────────────────────────────────────

export interface Persona {
  id: string
  title: string
  startingPoint: string
  painPoint: string
  needs: string
  defaultPathId: string
}

export interface Path {
  id: string
  title: string
  persona: string // persona id; company variants inherit the base path's
  summary: string
  sequence: string[] // track codes or module codes, in order
  moduleFlags: Record<string, ModuleFlag>
  skipCriteria: string
  requiredProjectIds: string[]
  requiredMockIds: string[]
  estHours: number
  readinessCriteria: string
  companyVariantOf?: string
  companyPackId?: string
}

export interface User {
  id: string
  name: string
  email: string
  currentRole: string
  targetRole: string
  github: string
  linkedin: string
  isDemo: boolean
}

// ── Skills and references ──────────────────────────────────────────────────

export interface Competency {
  id: string
  title: string
  skillIds: string[]
}

export interface Skill {
  id: string
  title: string
  competencyId: string
  moduleIds: string[]
}

export interface Reference {
  id: string
  title: string
  kind: 'paper' | 'docs' | 'book' | 'article' | 'internal'
  source: string
  note: string
}

export interface GlossaryTerm {
  id: string
  term: string
  expansion?: string
  definition: string
  moduleIds: string[]
}

// ── Learner state ──────────────────────────────────────────────────────────

/** A dated 1–5 self-rating; decays one level per 21 days without review. */
export interface ConfidenceRating {
  value: 1 | 2 | 3 | 4 | 5
  at: string // ISO
}

export interface ProgressRecord {
  itemId: string
  status: Status
  updatedAt: string
  confidence?: ConfidenceRating
  timeSpentMin: number
  lastAccessed?: string
}

export interface Attempt {
  id: string
  assessmentId: string
  kind: AssessmentKind
  at: string
  /** 0–100 for checkpoints and the exam; rubric mean ×25 for mocks. */
  score: number
  passed: boolean
  answers?: Record<string, string>
  skillScores?: Record<string, { correct: number; total: number }>
  rubric?: Partial<Record<RubricDimension, number>>
  sectionScores?: Record<string, number>
  autoFails?: string[]
}

export interface ExerciseSubmission {
  at: string
  answer: string
  selfScores: Record<string, number> // criterion → 1–4
}

export interface ProjectState {
  status: ProjectStatus
  repoUrl: string
  portfolioUrl: string
  checklist: Record<number, boolean>
  rubricScore?: number // 1–4 self-scored
  updatedAt: string
}

export type BookmarkKind = 'lesson' | 'question' | 'project' | 'case'

export interface Bookmark {
  id: string
  kind: BookmarkKind
  itemId: string
  at: string
}

export interface Note {
  id: string
  itemId: string // module or lesson id
  body: string
  at: string
}

/** Kept as `Review` to match §18: one question-review or confidence check. */
export interface Review {
  itemId: string
  at: string
  confidence?: ConfidenceRating['value']
}

export type ActivityKind =
  | 'lesson-read'
  | 'exercise-submitted'
  | 'checkpoint-passed'
  | 'checkpoint-failed'
  | 'mock-completed'
  | 'exam-completed'
  | 'project-updated'
  | 'question-reviewed'
  | 'confidence-set'
  | 'bookmark-added'
  | 'note-saved'
  | 'module-skipped'
  | 'path-chosen'

export interface ActivityEvent {
  id: string
  kind: ActivityKind
  at: string
  itemId: string
  label: string
  href: string
}

export interface Notification {
  id: string
  at: string
  title: string
  body: string
  href?: string
  read: boolean
}

export interface PortfolioArtifact {
  id: string
  title: string
  kind: 'design-doc' | 'eval-report' | 'demo' | 'write-up' | 'talk'
  projectId?: string
  url: string
}

export interface PortfolioState {
  writeUpDone: boolean
  storyProjectLinks: number
  storiesMapped: number
  artifacts: PortfolioArtifact[]
}

/** Everything one learner has done. Persisted whole under `fd:demo:v1:learner:<userId>`. */
export interface LearnerState {
  version: 1
  user: User
  pathId: string
  weeklyHours: number
  startedAt: string
  clockOffsetDays: number // the settings "time travel" control
  lessonsRead: Record<string, string> // lessonId → ISO
  exercises: Record<string, ExerciseSubmission>
  attempts: Attempt[]
  confidence: Record<string, ConfidenceRating> // module or question id
  skipped: Record<string, string> // moduleId → ISO
  reviews: Review[]
  bookmarks: Bookmark[]
  notes: Note[]
  projects: Record<string, ProjectState>
  activity: ActivityEvent[]
  notifications: Notification[]
  lastAccessed: Record<string, string>
  timeSpent: Record<string, number>
  portfolio: PortfolioState
}
