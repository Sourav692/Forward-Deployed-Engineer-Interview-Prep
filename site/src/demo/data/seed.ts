/**
 * Seeded learner state for the demo account (Alex Morgan, fictional), plus the empty
 * state a newly created learner starts from.
 *
 * Dates are relative to the moment of seeding, so the demo always shows "2 days ago"
 * rather than drifting stale. The seed deliberately covers every status: T0 completed,
 * T2 mixed, T4.1 blocked behind a failed T2.4 checkpoint, T2.5 skipped, and so on.
 */
import type { ActivityEvent, Attempt, LearnerState, User } from '../types'
import { MODULES } from './curriculum'

const DAY = 86_400_000

export function emptyState(user: User, now: number, pathId = 'fde'): LearnerState {
  return {
    version: 1,
    user,
    pathId,
    weeklyHours: 6,
    startedAt: new Date(now).toISOString(),
    clockOffsetDays: 0,
    lessonsRead: {},
    exercises: {},
    attempts: [],
    confidence: {},
    skipped: {},
    reviews: [],
    bookmarks: [],
    notes: [],
    projects: {},
    activity: [],
    notifications: [],
    lastAccessed: {},
    timeSpent: {},
    portfolio: { writeUpDone: false, storyProjectLinks: 0, storiesMapped: 0, artifacts: [] },
  }
}

export function seedDemoState(user: User, now: number): LearnerState {
  const ago = (days: number, hours = 0) => new Date(now - days * DAY - hours * 3_600_000).toISOString()
  const s = emptyState(user, now, 'fde-openai-anthropic')
  s.weeklyHours = 8
  s.startedAt = ago(24)
  const lessonsOf = (id: string) => MODULES.find((m) => m.id === id)!.lessonIds

  const readAll = (moduleId: string, days: number, count?: number) =>
    lessonsOf(moduleId)
      .slice(0, count)
      .forEach((l, i) => (s.lessonsRead[l] = ago(days, i)))
  const submit = (moduleId: string, days: number, scores: [number, number]) =>
    (s.exercises[`${moduleId}-ex1`] = {
      at: ago(days),
      answer: 'Sample submission written for the demo account.',
      selfScores: { Completeness: scores[0], 'Trade-offs': scores[1] },
    })
  const pass = (moduleId: string, days: number, score: number, passed = true): Attempt => {
    const a: Attempt = {
      id: `seed-${moduleId}-${days}`,
      assessmentId: `${moduleId}-cp`,
      kind: 'checkpoint',
      at: ago(days),
      score,
      passed,
    }
    s.attempts.push(a)
    return a
  }

  // T0 Orientation: completed.
  for (const [id, d] of [['t0-1', 13], ['t0-2', 12], ['t0-3', 11]] as const) {
    readAll(id, d + 1)
    submit(id, d, [3, 3])
    pass(id, d, 100)
    s.confidence[id] = { value: 4, at: ago(d) }
  }

  // T2: mixed states.
  readAll('t2-1', 21)
  submit('t2-1', 20, [4, 3])
  pass('t2-1', 20, 83)
  pass('t2-1', 9, 100) // second pass, 11 days later: mastered
  s.confidence['t2-1'] = { value: 5, at: ago(9) }

  readAll('t2-2', 17)
  submit('t2-2', 16, [3, 3])
  pass('t2-2', 16, 83) // 16 days since the last pass: due for review

  readAll('t2-3', 9)
  submit('t2-3', 8, [3, 2])
  pass('t2-3', 8, 83)
  s.confidence['t2-3'] = { value: 2, at: ago(3) } // low confidence: needs revision

  readAll('t2-4', 3, 2)
  pass('t2-4', 2, 50, false) // failed, retryable; also blocks T4.1
  s.skipped['t2-5'] = ago(6)
  readAll('t2-6', 1, 1)

  // T6.1: lessons and exercise done, checkpoint not yet taken.
  readAll('t6-1', 5)
  submit('t6-1', 4, [3, 3])
  // T7.1: started.
  readAll('t7-1', 7, 1)

  // Interview practice.
  s.attempts.push({
    id: 'seed-mock-b',
    assessmentId: 'mock-b',
    kind: 'mock',
    at: ago(4),
    score: 81,
    passed: true,
    rubric: { structure: 3, 'technical-depth': 3, 'trade-offs': 4, communication: 3, 'customer-judgement': 3 },
  })
  s.confidence['q-ai-05'] = { value: 2, at: ago(2) }
  s.confidence['q-sd-01'] = { value: 4, at: ago(3) }
  s.reviews.push({ itemId: 'q-sd-01', at: ago(3), confidence: 4 }, { itemId: 'q-fde-01', at: ago(5) })

  // Projects.
  s.projects.p2 = {
    status: 'in-progress',
    repoUrl: 'https://github.com/alex-morgan-demo/rag-messy-corpus',
    portfolioUrl: '',
    checklist: { 0: true },
    updatedAt: ago(1),
  }
  s.projects.p5 = {
    status: 'ready-for-review',
    repoUrl: '',
    portfolioUrl: 'https://example.com/alex/design-exercise',
    checklist: { 0: true, 1: true, 2: true },
    rubricScore: 3,
    updatedAt: ago(6),
  }

  s.bookmarks = [
    { id: 'bm1', kind: 'lesson', itemId: 't2-4-l1', at: ago(3) },
    { id: 'bm2', kind: 'question', itemId: 'q-sd-01', at: ago(3) },
    { id: 'bm3', kind: 'project', itemId: 'p2', at: ago(8) },
  ]
  s.notes = [
    { id: 'n1', itemId: 't2-4', body: 'Recall dropped on table-heavy PDFs. Try parent-document retrieval before raising k.', at: ago(2) },
    { id: 'n2', itemId: 't2-3-l1', body: 'Chunk by heading for policy docs; fixed-size only for chat logs.', at: ago(8) },
  ]
  s.notifications = [
    { id: 'nt1', at: ago(2), title: 'Checkpoint not passed', body: 'T2.4 scored 50%. Revise and retry when ready.', href: '/demo/learn/t2/t2-4/checkpoint', read: false },
    { id: 'nt2', at: ago(1), title: 'Review due', body: 'T2.2 passed 16 days ago and is due for review.', href: '/demo/progress/revision', read: false },
    { id: 'nt3', at: ago(4), title: 'Mock B passed', body: 'Decomposition round: mean 3.2, no dimension below 3.', href: '/demo/interview/mocks/mock-b', read: true },
  ]
  s.portfolio = {
    writeUpDone: false,
    storyProjectLinks: 1,
    storiesMapped: 6,
    artifacts: [{ id: 'a1', title: 'Design exercise: enterprise assistant', kind: 'design-doc', projectId: 'p5', url: 'https://example.com/alex/design-exercise' }],
  }

  const ev = (id: string, kind: ActivityEvent['kind'], days: number, itemId: string, label: string, href: string): ActivityEvent => ({
    id, kind, at: ago(days), itemId, label, href,
  })
  s.activity = [
    ev('e1', 'path-chosen', 14, 'fde-openai-anthropic', 'Chose the FDE path (OpenAI / Anthropic variant)', '/demo/start/paths/fde-openai-anthropic'),
    ev('e2', 'checkpoint-passed', 13, 't0-1', 'Passed the T0.1 checkpoint (100%)', '/demo/learn/t0/t0-1'),
    ev('e3', 'checkpoint-passed', 11, 't0-3', 'Passed the T0.3 checkpoint (100%)', '/demo/learn/t0/t0-3'),
    ev('e4', 'checkpoint-passed', 9, 't2-1', 'Passed the T2.1 checkpoint again (100%)', '/demo/learn/t2/t2-1'),
    ev('e5', 'checkpoint-passed', 8, 't2-3', 'Passed the T2.3 checkpoint (83%)', '/demo/learn/t2/t2-3'),
    ev('e6', 'note-saved', 8, 't2-3-l1', 'Saved a note on Chunking and indexing', '/demo/learn/t2/t2-3/lessons/t2-3-l1'),
    ev('e7', 'lesson-read', 7, 't7-1-l1', 'Read the first T7.1 lesson', '/demo/learn/t7/t7-1/lessons/t7-1-l1'),
    ev('e8', 'project-updated', 6, 'p5', 'Submitted P5 for review', '/demo/practice/projects/p5'),
    ev('e9', 'module-skipped', 6, 't2-5', 'Tested out of T2.5', '/demo/learn/t2/t2-5'),
    ev('e10', 'exercise-submitted', 4, 't6-1-ex1', 'Submitted the T6.1 exercise', '/demo/learn/t6/t6-1/exercises/t6-1-ex1'),
    ev('e11', 'mock-completed', 4, 'mock-b', 'Passed Mock B, decomposition round', '/demo/interview/mocks/mock-b'),
    ev('e12', 'confidence-set', 3, 't2-3', 'Rated confidence 2 on T2.3', '/demo/learn/t2/t2-3'),
    ev('e13', 'checkpoint-failed', 2, 't2-4', 'Scored 50% on the T2.4 checkpoint', '/demo/learn/t2/t2-4/checkpoint'),
    ev('e14', 'project-updated', 1, 'p2', 'Added a repository to P2', '/demo/practice/projects/p2'),
    ev('e15', 'lesson-read', 1, 't2-6-l1', 'Read the first T2.6 lesson', '/demo/learn/t2/t2-6/lessons/t2-6-l1'),
  ]
  s.timeSpent = { t0: 180, t2: 610, t6: 140, t7: 25 }
  return s
}
