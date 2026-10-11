/**
 * What the progress pages show, computed in the browser from the `fd:v1` store (FE-16).
 * The rules are written down in `.website_spec/2026-10-05-learn-ux.md` § Dashboard (UX-07).
 * Plain functions over store getters: only client islands call them, inside
 * `useProgress`, so they re-run whenever progress changes.
 */
import { LESSONS, MODULES, TRACKS } from '@/lib/curriculum'
import type { CurriculumModule } from '@/lib/curriculum-types'
import { curriculumHref, isLearnTrack } from '@/lib/curriculum-href'
import { getPathById, type LearningPath } from '@/lib/paths'
import {
  behaviouralReadiness,
  checkpointId,
  checkpointReadiness,
  finishBy,
  measuredInterviewReadiness,
  mockReadiness,
  scoreMock,
  scorecardReadiness,
  type InterviewInput,
  type MeasuredReadiness,
} from '@/lib/progress/rules'
import { latestConfidence, listActivity, listAttempts, readKind, trackProgress } from '@/lib/progress/store'
import type { ActivityEvent, PathChoice } from '@/lib/progress/types'
import type { CompetencySheet } from '@/lib/dashboard'
import { isRead, learnerStatus, moduleRevision, type ModuleInput } from '@/components/learn/progress-model'
import { MOCK_METHOD_LESSON, MOCK_MODULE, MOCK_ROUNDS, mockAssessmentId } from './mock-rubric'

const DAY_MS = 24 * 60 * 60 * 1000
const moduleBySlug = new Map(MODULES.map((m) => [m.slug, m]))
const lessonBySlug = new Map(LESSONS.map((l) => [l.slug, l]))
/** Curriculum order: tracks, then sections, then modules, as the Learn pages list them. */
const CURRICULUM_ORDER = TRACKS.flatMap((t) => t.sections.flatMap((s) => s.modules))

export const moduleHref = (m: Pick<CurriculumModule, 'track' | 'slug'>) => curriculumHref(m.track, m.slug)

/** The five scenario mocks: every T8.2 lesson after the method lesson. */
export const SCENARIO_MOCKS = (moduleBySlug.get(MOCK_MODULE)?.lessons ?? []).filter((s) => s !== MOCK_METHOD_LESSON)
const mockHref = (slug: string) => curriculumHref('interview-practice', MOCK_MODULE, slug)

// ── Readiness ──────────────────────────────────────────────────────────────

/** The latest full round's 1–5 mean for a mock, or the latest short round's, or null. */
export function latestMockMean(lessonSlug: string): number | null {
  for (const round of ['full', 'short'] as const) {
    const last = listAttempts(mockAssessmentId(lessonSlug, round)).at(-1)
    if (last?.rubric) return scoreMock(last.rubric, MOCK_ROUNDS[round].dims.map((d) => d.id)).mean
  }
  return null
}

function sheetStatuses(sheets: CompetencySheet[]): Map<string, string[]> {
  const stored = readKind<Record<string, string>>('answer-statuses')
  return new Map(sheets.map((s) => [s.key, Object.values(stored[s.key] ?? {})]))
}

/** The latest attempt of every checkpoint the learner has taken. */
function latestCheckpoints(modules: ModuleInput[]): { module: string; passed: boolean }[] {
  return modules.flatMap((m) => {
    const last = m.checkpoint ? listAttempts(checkpointId(m.slug)).at(-1) : undefined
    return last ? [{ module: m.slug, passed: last.passed }] : []
  })
}

export function interviewReadinessNow(sheets: CompetencySheet[], modules: ModuleInput[]): MeasuredReadiness {
  const scores = Object.values(readKind<Record<string, number>>('scores')).flatMap((row) => Object.values(row))
  const statuses = [...sheetStatuses(sheets).values()].flat()
  return measuredInterviewReadiness({
    worksheets: scorecardReadiness(scores.filter((s) => typeof s === 'number')),
    mocks: mockReadiness(SCENARIO_MOCKS.map(latestMockMean)),
    checkpoints: checkpointReadiness(latestCheckpoints(modules).map((c) => c.passed)),
    behavioural: behaviouralReadiness(statuses, sheets.reduce((n, s) => n + s.questions, 0)),
  })
}

export type Remedy = { label: string; href: string } | null

/** Where to go next for one readiness input (UX-07 remedy table). */
export function remedyFor(id: InterviewInput, sheets: CompetencySheet[], modules: ModuleInput[]): Remedy {
  if (id === 'worksheets') return { label: 'Case-study worksheets', href: curriculumHref('interview-practice', 'case-study-worksheets') }
  if (id === 'mocks') {
    const means = SCENARIO_MOCKS.map((slug) => ({ slug, mean: latestMockMean(slug) }))
    const pick = means.find((m) => m.mean === null) ?? means.reduce((lo, m) => ((m.mean ?? 0) < (lo.mean ?? 0) ? m : lo), means[0])
    return pick ? { label: lessonBySlug.get(pick.slug)?.title ?? 'Mock interviews', href: mockHref(pick.slug) } : null
  }
  if (id === 'checkpoints') {
    const taken = new Map(latestCheckpoints(modules).map((c) => [c.module, c.passed]))
    const withCheckpoint = modules.filter((m) => m.checkpoint)
    const pick = withCheckpoint.find((m) => !taken.has(m.slug)) ?? withCheckpoint.find((m) => taken.get(m.slug) === false)
    const mod = pick && moduleBySlug.get(pick.slug)
    return mod ? { label: `${mod.title} checkpoint`, href: `${moduleHref(mod)}#checkpoint` } : null
  }
  if (id === 'behavioural') {
    const statuses = sheetStatuses(sheets)
    const done = (s: CompetencySheet) => (statuses.get(s.key) ?? []).filter((v) => v !== 'not-started').length
    const pick = [...sheets].sort((a, b) => done(a) - done(b))[0]
    return pick ? { label: pick.title, href: pick.href } : null
  }
  return null
}

// ── Revision queue ─────────────────────────────────────────────────────────

export type RevisionRow = {
  module: CurriculumModule
  reason: 'failed-checkpoint' | 'low' | 'faded' | 'checkpoint-due'
  /** When the triggering rating or checkpoint attempt happened. */
  since: string
  days: number
  /** Latest checkpoint score, for the checkpoint reasons. */
  score?: number
}

const REASON_ORDER: RevisionRow['reason'][] = ['failed-checkpoint', 'low', 'faded', 'checkpoint-due']

/** Modules that need revision (`moduleRevision`), most urgent reason first, then the oldest. */
export function revisionQueue(modules: ModuleInput[], now = Date.now()): RevisionRow[] {
  const rows: RevisionRow[] = []
  for (const input of modules) {
    const why = moduleRevision(input, now)
    const mod = moduleBySlug.get(input.slug)
    if (!why || !mod) continue
    if (why === 'low-confidence') {
      const rating = latestConfidence(input.slug)
      if (!rating) continue
      rows.push({ module: mod, reason: rating.value <= 2 ? 'low' : 'faded', since: rating.at, days: daysSince(rating.at, now) })
    } else {
      const last = listAttempts(checkpointId(input.slug)).at(-1)
      if (!last) continue
      rows.push({
        module: mod,
        reason: why === 'failed-checkpoint' ? 'failed-checkpoint' : 'checkpoint-due',
        since: last.at,
        days: daysSince(last.at, now),
        score: last.score,
      })
    }
  }
  return rows.sort((a, b) => REASON_ORDER.indexOf(a.reason) - REASON_ORDER.indexOf(b.reason) || b.days - a.days)
}

const daysSince = (iso: string, now: number) => Math.floor((now - Date.parse(iso)) / DAY_MS)

/** Where a revision row sends the learner: the checkpoint, or the confidence control. */
export const revisionHref = (r: RevisionRow) =>
  `${moduleHref(r.module)}#${r.reason === 'failed-checkpoint' || r.reason === 'checkpoint-due' ? 'checkpoint' : 'yours'}`

// ── Next up ────────────────────────────────────────────────────────────────

export type NextUp = { module: CurriculumModule; reason: string; action: string; href: string }

const remainingMinutes = (input: ModuleInput) => {
  const known = Object.values(input.minutes)
  const fallback = known.length ? known.reduce((s, m) => s + m, 0) / known.length : 0
  return input.reading.filter((s) => !isRead(s)).reduce((n, s) => n + (input.minutes[s] ?? fallback), 0)
}

/** The one next step (UX-07): revision first, then the path, then the latest module in progress. */
export function nextUp(modules: ModuleInput[], path: LearningPath | null, now = Date.now()): NextUp | null {
  const inputs = new Map(modules.map((m) => [m.slug, m]))
  const flagged = (slug: string) => !path || ['required', 'recommended'].includes(path.moduleFlags[slug] ?? '')
  const revision = revisionQueue(modules, now).find((r) => flagged(r.module.slug))
  if (revision) {
    return {
      module: revision.module,
      reason:
        revision.reason === 'failed-checkpoint'
          ? `Your last ${revision.module.title} checkpoint did not pass. Review the module, then take it again.`
          : revision.reason === 'checkpoint-due'
            ? `Your ${revision.module.title} checkpoint pass is due for a re-check.`
            : `${revision.module.title} needs a review: your confidence is low or out of date.`,
      action: 'Review now',
      href: revisionHref(revision),
    }
  }

  if (path) {
    const onPath = CURRICULUM_ORDER.filter((s) => inputs.has(s))
    const nothingRead = !onPath.some((s) => inputs.get(s)!.reading.some(isRead))
    const start = moduleBySlug.get(path.startModule)
    if (nothingRead && start) {
      return { module: start, reason: `The first module on your ${path.title} path.`, action: 'Start module', href: moduleHref(start) }
    }
    for (const flag of ['required', 'recommended'] as const) {
      for (const slug of onPath) {
        if (path.moduleFlags[slug] !== flag) continue
        const input = inputs.get(slug)!
        const status = learnerStatus(input, now)
        if (status !== 'not-started' && status !== 'in-progress') continue
        const mod = moduleBySlug.get(slug)!
        if (status === 'in-progress') {
          const hours = Math.max(1, Math.round(remainingMinutes(input) / 60))
          return {
            module: mod,
            reason: `You have started it; finishing it moves your path ${hours} h closer.`,
            action: 'Continue module',
            href: moduleHref(mod),
          }
        }
        return { module: mod, reason: 'Next on your path, and its prerequisites are complete.', action: 'Start module', href: moduleHref(mod) }
      }
    }
    return null
  }

  for (const e of listActivity()) {
    const slug = activityModule(e)
    const input = slug ? inputs.get(slug) : undefined
    if (input && learnerStatus(input, now) === 'in-progress') {
      const mod = moduleBySlug.get(slug!)!
      return { module: mod, reason: 'You were working on this most recently.', action: 'Continue module', href: moduleHref(mod) }
    }
  }
  return null
}

// ── Finish by and tracks ───────────────────────────────────────────────────

export type FinishBy = { date: number; days: number; hoursLeft: number; weeklyHours: number }

/** Finish date from the unread lessons in the path's required and recommended modules. */
export function finishByNow(modules: ModuleInput[], path: LearningPath, choice: PathChoice, now = Date.now()): FinishBy {
  const minutes = modules
    .filter((m) => ['required', 'recommended'].includes(path.moduleFlags[m.slug] ?? ''))
    .reduce((n, m) => n + remainingMinutes(m), 0)
  const { date, days } = finishBy(minutes, choice.weeklyHours, now)
  return { date, days, hoursLeft: Math.round(minutes / 60), weeklyHours: choice.weeklyHours }
}

export type TrackRow = { code: string; title: string; href: string; read: number; total: number; fraction: number }

/** Learn tracks with at least one lesson read. */
export function trackRows(modules: ModuleInput[]): TrackRow[] {
  const minutes = Object.assign({}, ...modules.map((m) => m.minutes)) as Record<string, number>
  return TRACKS.filter((t) => isLearnTrack(t.slug))
    .map((t) => {
      const p = trackProgress(t.slug, minutes)
      return { code: t.code, title: t.title, href: curriculumHref(t.slug), read: p.lessonsRead, total: p.lessonsTotal, fraction: p.fraction }
    })
    .filter((r) => r.read > 0)
}

// ── Activity ───────────────────────────────────────────────────────────────

/** The module an activity event is about, when it is about one. */
function activityModule(e: ActivityEvent): string | null {
  if (e.kind === 'lesson-read') return e.itemId.split('/')[0]
  if (e.kind === 'confidence-set' || e.kind === 'module-opened-anyway') return e.itemId
  return null
}

/** One line of history: what happened, and where to go back to it. */
export function describeActivity(e: ActivityEvent): { text: string; href?: string } {
  const slug = activityModule(e)
  const mod = slug ? moduleBySlug.get(slug) : undefined
  switch (e.kind) {
    case 'lesson-read': {
      const lesson = e.itemId.split('/')[1]
      return { text: `Read “${e.label ?? lesson}”${mod ? ` · ${mod.title}` : ''}`, href: mod && curriculumHref(mod.track, mod.slug, lesson) }
    }
    case 'confidence-set':
      return { text: `${mod ? mod.title : e.itemId}: ${e.label ?? 'confidence rated'}`, href: mod && moduleHref(mod) }
    case 'module-opened-anyway':
      return { text: `Opened ${mod ? mod.title : e.itemId} before its prerequisites`, href: mod && moduleHref(mod) }
    case 'path-chosen': {
      const path = getPathById(e.itemId)
      return { text: `Chose the ${path?.title ?? e.itemId} path`, href: `/start/paths/${e.itemId}` }
    }
    case 'bookmark-added':
      return { text: `Bookmarked “${e.label ?? e.itemId}”`, href: e.href }
    default:
      return { text: e.label ?? e.kind.replace(/-/g, ' '), href: e.href }
  }
}
