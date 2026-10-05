/**
 * Derived progress: joins the pure rules with the curriculum data. One call to
 * `deriveProgress` computes every status, rollup, queue and score a page needs, so
 * components stay declarative and the rules stay in `rules.ts`.
 */
import type { LearnerState, Module, ModuleFlag, Status } from '../types'
import * as repo from '../repo'
import {
  DAY_MS,
  attemptsFor,
  checkPrerequisites,
  effectiveNow,
  finishBy,
  interviewReadiness,
  isDone,
  latestAttempt,
  moduleFraction,
  moduleStatus,
  portfolioReadiness,
  revisionReason,
  rollup,
  scoreMock,
  type PrerequisiteCheck,
  type Readiness,
  type RevisionReason,
} from '@/lib/progress/rules'

const CHECKPOINT_MINUTES = 20

export interface ModuleProgress {
  status: Status
  fraction: number
  lessonsRead: number
  lessonsTotal: number
  prerequisites: PrerequisiteCheck
  flag: ModuleFlag
  lastScore?: number
  attempts: number
}

export interface RevisionItem {
  itemId: string
  kind: 'module' | 'question'
  title: string
  href: string
  reason: RevisionReason
}

export interface NextUp {
  module: Module
  reason: string
}

export interface Progress {
  now: number
  modules: Record<string, ModuleProgress>
  sections: Record<string, number>
  tracks: Record<string, { fraction: number; status: Status }>
  path: { fraction: number; remainingMinutes: number; finishBy: { days: number; date: number } }
  revision: RevisionItem[]
  interview: Readiness
  portfolio: Readiness
  nextUp?: NextUp
  statusCounts: Record<Status, number>
}

function moduleFacts(state: LearnerState, m: Module) {
  const lessonsRead = m.lessonIds.filter((id) => state.lessonsRead[id]).length
  const required = repo.listExercises(m.id).filter((e) => e.required)
  return {
    lessonsRead,
    lessonsTotal: m.lessonIds.length,
    requiredExerciseSubmitted: required.every((e) => state.exercises[e.id]),
    anyExerciseSubmitted: m.exerciseIds.some((id) => state.exercises[id]),
  }
}

export function deriveProgress(state: LearnerState, realNow: number): Progress {
  const now = effectiveNow(state, realNow)
  const byId = repo.modulesById()
  const path = repo.getPath(state.pathId) ?? repo.getPath('fde')!
  const modules: Record<string, ModuleProgress> = {}
  const statusCounts = {} as Record<Status, number>

  for (const m of repo.listModules()) {
    const facts = moduleFacts(state, m)
    const status = moduleStatus(state, m, facts, byId, now)
    const lessons = repo.listLessons(m.id).map((l) => ({ minutes: l.readingMin, fraction: state.lessonsRead[l.id] ? 1 : 0 }))
    const ex = repo.listExercises(m.id)[0]
    const passed = attemptsFor(state, m.checkpointId).some((a) => a.passed)
    const fraction = moduleFraction(status, {
      lessons,
      exercise: { minutes: ex?.estMinutes ?? 0, fraction: ex && state.exercises[ex.id] ? 1 : 0 },
      checkpoint: { minutes: CHECKPOINT_MINUTES, fraction: passed ? 1 : 0 },
    })
    const latest = latestAttempt(state, m.checkpointId)
    modules[m.id] = {
      status,
      fraction,
      ...facts,
      prerequisites: checkPrerequisites(state, m, byId),
      flag: path.moduleFlags[m.id] ?? 'optional',
      lastScore: latest?.score,
      attempts: attemptsFor(state, m.checkpointId).length,
    }
    statusCounts[status] = (statusCounts[status] ?? 0) + 1
  }

  const weighted = (ms: Module[]) => rollup(ms.map((m) => ({ minutes: m.estMinutes, fraction: modules[m.id].fraction })))

  const sections: Record<string, number> = {}
  const tracks: Progress['tracks'] = {}
  for (const t of repo.listTracks()) {
    for (const s of repo.listSections(t.id)) sections[s.id] = weighted(s.moduleIds.map((id) => byId[id]))
    const ms = repo.listModules(t.id)
    const fraction = weighted(ms)
    const statuses = ms.map((m) => modules[m.id].status)
    const status: Status = statuses.every(isDone)
      ? 'completed'
      : statuses.every((s) => s === 'not-started' || s === 'blocked')
        ? 'not-started'
        : 'in-progress'
    tracks[t.id] = { fraction, status }
  }

  // Path progress covers required and recommended modules only.
  const pathModules = repo.listModules().filter((m) => modules[m.id].flag !== 'optional')
  const remainingMinutes = Math.round(
    pathModules.reduce((s, m) => s + m.estMinutes * (1 - modules[m.id].fraction), 0),
  )

  // Revision queue: modules and questions.
  const revision: RevisionItem[] = []
  for (const m of repo.listModules()) {
    const reason = revisionReason(state, m.id, m.checkpointId, now)
    if (reason && !state.skipped[m.id]) {
      revision.push({ itemId: m.id, kind: 'module', title: `${m.code} ${m.title}`, href: repo.href.module(m), reason })
    }
  }
  for (const q of repo.listQuestions()) {
    const reason = revisionReason(state, q.id, undefined, now)
    if (reason) revision.push({ itemId: q.id, kind: 'question', title: q.prompt, href: repo.href.question(q), reason })
  }

  // Interview readiness: evidence only.
  const submitted = Object.entries(state.exercises).filter(([id]) => {
    const ex = repo.getExercise(id)
    return ex && modules[ex.moduleId]?.flag !== 'optional'
  })
  const rubricMeans = submitted.map(([, s]) => {
    const v = Object.values(s.selfScores)
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0
  })
  const mockMeans = path.requiredMockIds.map((id) => {
    const a = latestAttempt(state, id)
    const mock = repo.getMock(id)
    return a?.rubric && mock ? scoreMock(a.rubric, mock.fdeRound).mean : 0
  })
  const required = repo.listModules().filter((m) => modules[m.id].flag === 'required' && !state.skipped[m.id])
  const attempted = required.filter((m) => modules[m.id].attempts > 0)
  const t7 = repo.listModules('t7')
  const behavioural =
    50 * Math.min(1, state.portfolio.storiesMapped / 10) +
    50 * (t7.filter((m) => isDone(modules[m.id].status)).length / t7.length)

  const interview = interviewReadiness({
    rubricMeans,
    mockMeans,
    checkpointsPassed: attempted.filter((m) => attemptsFor(state, m.checkpointId).some((a) => a.passed)).length,
    checkpointsTotal: Math.max(attempted.length, 1),
    behavioural,
  })
  const portfolio = portfolioReadiness({
    capstoneRubric: state.projects.p9?.rubricScore,
    projectsCompleted: path.requiredProjectIds.filter((id) => state.projects[id]?.status === 'completed').length,
    projectsRequired: path.requiredProjectIds.length,
    writeUpDone: state.portfolio.writeUpDone,
    storyProjectLinks: state.portfolio.storyProjectLinks,
  })

  return {
    now,
    modules,
    sections,
    tracks,
    path: { fraction: weighted(pathModules), remainingMinutes, finishBy: finishBy(remainingMinutes, state.weeklyHours, now) },
    revision,
    interview,
    portfolio,
    nextUp: nextUp(path.sequence, modules, revision),
    statusCounts,
  }
}

/** The single highest-value next step: revision first, then the path sequence. */
function nextUp(
  sequence: string[],
  modules: Record<string, ModuleProgress>,
  revision: RevisionItem[],
): NextUp | undefined {
  const failed = revision.find((r) => r.kind === 'module' && r.reason === 'failed-checkpoint')
  if (failed) {
    const m = repo.getModule(failed.itemId)!
    return { module: m, reason: `Your last ${m.code} checkpoint did not pass, and modules after it depend on it.` }
  }
  const order = sequence.flatMap((code) =>
    code.includes('.')
      ? [repo.getModule(`t${code[1]}-${code[3]}`)!]
      : repo.listModules(code.toLowerCase()),
  )
  const candidate = order.find((m) => {
    const p = modules[m.id]
    return p.flag !== 'optional' && !isDone(p.status) && p.prerequisites.ok && p.status !== 'needs-revision'
  })
  if (candidate) {
    const p = modules[candidate.id]
    const unlocks = candidate.unlocks.map((id) => repo.getModule(id)?.code).filter(Boolean)
    return {
      module: candidate,
      reason:
        p.status === 'in-progress' || p.status === 'ready-for-review'
          ? `You have started it; finishing it moves your path ${Math.round(candidate.estMinutes / 60) || 1} h closer.`
          : unlocks.length
            ? `Next on your path, and it unlocks ${unlocks.slice(0, 3).join(', ')}.`
            : 'Next on your path, with every prerequisite passed.',
    }
  }
  return undefined
}

export const daysAgo = (iso: string, now: number) => Math.floor((now - Date.parse(iso)) / DAY_MS)

export interface SkillEvidence {
  label: string
  href: string
}

/**
 * Proficiency 0–4 from evidence only: +1 per passed checkpoint (max 2), +1 for a
 * submitted exercise self-scored ≥ 3, +1 for a project ready for review or completed.
 * Reading never counts.
 */
export function skillProficiency(state: LearnerState, skillId: string): { level: number; evidence: SkillEvidence[] } {
  const evidence: SkillEvidence[] = []
  let cps = 0
  let exercise = 0
  let project = 0
  for (const m of repo.listModules()) {
    if (!m.skillIds.includes(skillId) || state.skipped[m.id]) continue
    if (attemptsFor(state, m.checkpointId).some((a) => a.passed)) {
      cps++
      evidence.push({ label: `${m.code} checkpoint passed`, href: repo.href.module(m) })
    }
    const ex = state.exercises[`${m.id}-ex1`]
    const vals = ex ? Object.values(ex.selfScores) : []
    if (vals.length && vals.reduce((a, b) => a + b, 0) / vals.length >= 3) {
      exercise = 1
      evidence.push({ label: `${m.code} exercise`, href: repo.href.exercise({ id: `${m.id}-ex1`, moduleId: m.id }) })
    }
  }
  for (const p of repo.listProjects({ skillId })) {
    const ps = state.projects[p.id]
    if (ps && (ps.status === 'ready-for-review' || ps.status === 'completed')) {
      project = 1
      evidence.push({ label: `${p.code} ${p.title}`, href: repo.href.project(p.id) })
    }
  }
  return { level: Math.min(4, Math.min(cps, 2) + exercise + project), evidence }
}
