/**
 * Data access for the prototype. Components call these functions and never import
 * the raw arrays in `data/`, so swapping the static data for API calls later changes
 * this file only. Everything here is synchronous and side-effect free, which lets
 * Server Components call it at build time.
 */
import type {
  Assessment,
  AssessmentItem,
  CaseStudy,
  CompanyPack,
  Difficulty,
  Exercise,
  GlossaryTerm,
  InterviewHub,
  InterviewQuestion,
  Lesson,
  Level,
  MockInterview,
  Module,
  ModuleFlag,
  Path,
  Persona,
  Project,
  ProjectType,
  QuestionCategory,
  ReadinessExam,
  Reference,
  Section,
  Skill,
  Competency,
  Topic,
  Track,
} from './types'
import { MODULES, SECTIONS, TRACKS } from './data/curriculum'
import { LESSONS_T2 } from './data/lessons/t2'
import { LESSONS_T4 } from './data/lessons/t4'
import { LESSONS_T5 } from './data/lessons/t5'
import { LESSONS_T6 } from './data/lessons/t6'
import { LESSONS_BROWSABLE } from './data/lessons/browsable'
import { checkpointFor, generatedCheckpointItems, generatedExercise, generatedLesson } from './data/generated'
import { T2_4_ITEMS } from './data/assessments-checkpoint-t2-4'
import { PROJECTS } from './data/projects'
import { HUBS, QUESTIONS } from './data/interview'
import { MOCKS, READINESS_EXAM } from './data/mocks'
import { CASES } from './data/cases'
import { COMPANY_PACKS } from './data/companies'
import { DIAGNOSTIC, PATHS, PERSONAS } from './data/paths'
import { COMPETENCIES, SKILLS } from './data/skills'
import { REFERENCES } from './data/references'
import { GLOSSARY_TERMS } from './data/glossary'

export type { DiagnosticQuestion } from './data/paths'

// ── Indexes, built once per server/client bundle ───────────────────────────

const byId = <T extends { id: string }>(xs: T[]) => Object.fromEntries(xs.map((x) => [x.id, x])) as Record<string, T>

const authored = [...LESSONS_T2, ...LESSONS_T4, ...LESSONS_T5, ...LESSONS_T6, ...LESSONS_BROWSABLE]
const authoredById = byId(authored)
const LESSONS: Lesson[] = MODULES.flatMap((m) =>
  m.lessonIds.map((id) => authoredById[id] ?? generatedLesson(m)),
)
const EXERCISES: Exercise[] = MODULES.map(generatedExercise)

const HAND_WRITTEN_ITEMS: Record<string, AssessmentItem[]> = { 't2-4': T2_4_ITEMS }
const ITEMS: AssessmentItem[] = MODULES.flatMap((m) => HAND_WRITTEN_ITEMS[m.id] ?? generatedCheckpointItems(m))
const ASSESSMENTS: Assessment[] = MODULES.map((m) =>
  checkpointFor(m, ITEMS.filter((i) => i.id.startsWith(`${m.checkpointId}-`)).map((i) => i.id)),
)

// Interview questions point at modules; derive the reverse links once.
const MODULES_WITH_LINKS: Module[] = MODULES.map((m) => ({
  ...m,
  interviewQuestionIds: QUESTIONS.filter(
    (q) => q.canonicalModuleId === m.id || q.relatedModuleIds.includes(m.id),
  ).map((q) => q.id),
}))
const TRACKS_WITH_LINKS: Track[] = TRACKS.map((t) => {
  const moduleIds = new Set(MODULES.filter((m) => m.trackId === t.id).map((m) => m.id))
  return {
    ...t,
    relatedHubIds: HUBS.filter((h) =>
      QUESTIONS.some((q) => q.hubId === h.id && q.relatedModuleIds.some((id) => moduleIds.has(id))),
    ).map((h) => h.id),
    relatedCaseIds: CASES.filter((c) => c.moduleIds.some((id) => moduleIds.has(id))).map((c) => c.id),
    relatedProjectIds: [
      ...new Set([
        ...t.relatedProjectIds,
        ...PROJECTS.filter((p) => p.moduleIds.some((id) => moduleIds.has(id))).map((p) => p.id),
      ]),
    ],
  }
})

const idx = {
  tracks: byId(TRACKS_WITH_LINKS),
  sections: byId(SECTIONS),
  modules: byId(MODULES_WITH_LINKS),
  lessons: byId(LESSONS),
  exercises: byId(EXERCISES),
  items: byId(ITEMS),
  assessments: byId(ASSESSMENTS),
  projects: byId(PROJECTS),
  hubs: byId(HUBS),
  questions: byId(QUESTIONS),
  mocks: byId(MOCKS),
  cases: byId(CASES),
  companies: byId(COMPANY_PACKS),
  paths: byId(PATHS),
  skills: byId(SKILLS),
  references: byId(REFERENCES),
}

// ── Curriculum ─────────────────────────────────────────────────────────────

export const listTracks = (): Track[] => TRACKS_WITH_LINKS
export const getTrack = (id: string): Track | undefined => idx.tracks[id]

export interface TrackFilter {
  level?: Level
  topic?: Topic
  required?: boolean
}
export const filterTracks = (f: TrackFilter): Track[] =>
  TRACKS_WITH_LINKS.filter(
    (t) =>
      (!f.level || t.level === f.level) &&
      (!f.topic || t.topic === f.topic) &&
      (f.required === undefined || t.required === f.required),
  )

export const listSections = (trackId: string): Section[] =>
  SECTIONS.filter((s) => s.trackId === trackId)
export const getSection = (id: string): Section | undefined => idx.sections[id]

export const listModules = (trackId?: string): Module[] =>
  trackId ? MODULES_WITH_LINKS.filter((m) => m.trackId === trackId) : MODULES_WITH_LINKS
export const getModule = (id: string): Module | undefined => idx.modules[id]
export const modulesById = (): Record<string, Module> => idx.modules

/** Modules in curriculum order, for previous/next navigation. */
export function adjacentModules(id: string): { prev?: Module; next?: Module } {
  const i = MODULES_WITH_LINKS.findIndex((m) => m.id === id)
  return { prev: MODULES_WITH_LINKS[i - 1], next: MODULES_WITH_LINKS[i + 1] }
}

export const listLessons = (moduleId?: string): Lesson[] =>
  moduleId ? LESSONS.filter((l) => l.moduleId === moduleId) : LESSONS
export const getLesson = (id: string): Lesson | undefined => idx.lessons[id]
export const isAuthoredLesson = (id: string): boolean => id in authoredById

export const listExercises = (moduleId?: string): Exercise[] =>
  moduleId ? EXERCISES.filter((e) => e.moduleId === moduleId) : EXERCISES
export const getExercise = (id: string): Exercise | undefined => idx.exercises[id]

export const getAssessment = (id: string): Assessment | undefined => idx.assessments[id]
export const getAssessmentItems = (assessmentId: string): AssessmentItem[] =>
  (idx.assessments[assessmentId]?.itemIds ?? []).map((id) => idx.items[id])

// ── Projects ───────────────────────────────────────────────────────────────

export interface ProjectFilter {
  type?: ProjectType
  difficulty?: Difficulty
  skillId?: string
}
export const listProjects = (f: ProjectFilter = {}): Project[] =>
  PROJECTS.filter(
    (p) =>
      (!f.type || p.type === f.type) &&
      (!f.difficulty || p.difficulty === f.difficulty) &&
      (!f.skillId || p.skillIds.includes(f.skillId)),
  )
export const getProject = (id: string): Project | undefined => idx.projects[id]

// ── Interview ──────────────────────────────────────────────────────────────

export const listHubs = (): InterviewHub[] => HUBS
export const getHub = (id: string): InterviewHub | undefined => idx.hubs[id]

export interface QuestionFilter {
  hubId?: string
  category?: QuestionCategory
  difficulty?: Difficulty
  ids?: string[]
}
export const listQuestions = (f: QuestionFilter = {}): InterviewQuestion[] =>
  QUESTIONS.filter(
    (q) =>
      (!f.hubId || q.hubId === f.hubId) &&
      (!f.category || q.category === f.category) &&
      (!f.difficulty || q.difficulty === f.difficulty) &&
      (!f.ids || f.ids.includes(q.id)),
  )
export const getQuestion = (id: string): InterviewQuestion | undefined => idx.questions[id]

export const listMocks = (): MockInterview[] => MOCKS
export const getMock = (id: string): MockInterview | undefined => idx.mocks[id]
export const getReadinessExam = (): ReadinessExam => READINESS_EXAM

export const listCases = (): CaseStudy[] => CASES
export const getCase = (id: string): CaseStudy | undefined => idx.cases[id]

export const listCompanyPacks = (): CompanyPack[] => COMPANY_PACKS
export const getCompanyPack = (id: string): CompanyPack | undefined => idx.companies[id]

// ── Paths, people and skills ───────────────────────────────────────────────

export const listPaths = (): Path[] => PATHS
export const listBasePaths = (): Path[] => PATHS.filter((p) => !p.companyVariantOf)
export const listCompanyVariants = (): Path[] => PATHS.filter((p) => p.companyVariantOf)
export const getPath = (id: string): Path | undefined => idx.paths[id]
export const moduleFlag = (pathId: string, moduleId: string): ModuleFlag =>
  idx.paths[pathId]?.moduleFlags[moduleId] ?? 'optional'
/** A track is "skipped for your path" when none of its modules is required or recommended. */
export const trackSkippedForPath = (pathId: string, trackId: string): boolean =>
  listModules(trackId).every((m) => moduleFlag(pathId, m.id) === 'optional')

export const listPersonas = (): Persona[] => PERSONAS
export const getDiagnostic = () => DIAGNOSTIC

export const listCompetencies = (): Competency[] => COMPETENCIES
export const listSkills = (): Skill[] => SKILLS
export const getSkill = (id: string): Skill | undefined => idx.skills[id]

export const listReferences = (ids?: string[]): Reference[] =>
  ids ? ids.map((id) => idx.references[id]).filter(Boolean) : REFERENCES
export const listGlossary = (): GlossaryTerm[] => GLOSSARY_TERMS

// ── Routes ─────────────────────────────────────────────────────────────────

export const href = {
  track: (trackId: string) => `/demo/learn/${trackId}`,
  module: (m: Pick<Module, 'id' | 'trackId'>) => `/demo/learn/${m.trackId}/${m.id}`,
  lesson: (l: Pick<Lesson, 'id' | 'moduleId'>) =>
    `/demo/learn/${l.moduleId.split('-')[0]}/${l.moduleId}/lessons/${l.id}`,
  exercise: (e: Pick<Exercise, 'id' | 'moduleId'>) =>
    `/demo/learn/${e.moduleId.split('-')[0]}/${e.moduleId}/exercises/${e.id}`,
  checkpoint: (m: Pick<Module, 'id' | 'trackId'>) => `/demo/learn/${m.trackId}/${m.id}/checkpoint`,
  project: (id: string) => `/demo/practice/projects/${id}`,
  hub: (id: string) => `/demo/interview/${id}`,
  question: (q: Pick<InterviewQuestion, 'id' | 'hubId'>) => `/demo/interview/${q.hubId}#${q.id}`,
  mock: (id: string) => `/demo/interview/mocks/${id}`,
  case: (id: string) => `/demo/design/${id}`,
  company: (id: string) => `/demo/interview/companies/${id}`,
  path: (id: string) => `/demo/start/paths/${id}`,
}
