/**
 * Self-check for the /demo prototype's business rules (`src/demo/store/rules.ts`).
 *
 * Runs under plain `node` via native TypeScript type stripping, like check-parse.ts:
 *   node scripts/check-demo-rules.ts
 * Covers status transitions, prerequisite gating, the revision queue, readiness
 * formulas, mock and exam scoring, and the finish-by model.
 */
import {
  DAY_MS,
  checkPrerequisites,
  effectiveConfidence,
  finishBy,
  interviewReadiness,
  isMastered,
  moduleStatus,
  portfolioReadiness,
  revisionReason,
  rollup,
  scoreCheckpoint,
  scoreExam,
  scoreMock,
} from '../src/demo/store/rules.ts'
import type { Attempt, AssessmentItem, LearnerState, Module } from '../src/demo/types.ts'

let failures = 0
let passes = 0
function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (ok) passes++
  else {
    failures++
    console.error(`✗ ${name}\n    expected ${JSON.stringify(expected)}\n    got      ${JSON.stringify(actual)}`)
  }
}

const NOW = Date.parse('2026-10-05T12:00:00Z')
const ago = (days: number) => new Date(NOW - days * DAY_MS).toISOString()

const mod = (id: string, prerequisites: string[] = []): Module => ({
  id, code: id.toUpperCase(), trackId: 't9', sectionId: 's', title: id, objective: '', scope: '', why: '',
  outcomes: [], prerequisites, unlocks: [], lessonIds: ['l1', 'l2'], exerciseIds: ['ex'], checkpointId: `${id}-cp`,
  estMinutes: 60, canonicalSource: '', relatedModuleIds: [], interviewQuestionIds: [], commonMistakes: [], skillIds: [],
})
const A = mod('a')
const B = mod('b', ['a'])
const byId = { a: A, b: B }

const attempt = (assessmentId: string, daysAgo: number, passed: boolean): Attempt => ({
  id: `${assessmentId}-${daysAgo}`, assessmentId, kind: 'checkpoint', at: ago(daysAgo), score: passed ? 85 : 50, passed,
})
type S = Pick<LearnerState, 'attempts' | 'skipped' | 'confidence'>
const state = (s: Partial<S> = {}): S => ({ attempts: [], skipped: {}, confidence: {}, ...s })
const facts = (read: number, ex: boolean) => ({ lessonsRead: read, lessonsTotal: 2, requiredExerciseSubmitted: ex, anyExerciseSubmitted: ex })

// Status transitions
check('not started', moduleStatus(state(), A, facts(0, false), byId, NOW), 'not-started')
check('in progress after one lesson', moduleStatus(state(), A, facts(1, false), byId, NOW), 'in-progress')
check('ready for review: lessons + exercise, no checkpoint', moduleStatus(state(), A, facts(2, true), byId, NOW), 'ready-for-review')
check('completed', moduleStatus(state({ attempts: [attempt('a-cp', 1, true)] }), A, facts(2, true), byId, NOW), 'completed')
check('pass without lessons is still in progress', moduleStatus(state({ attempts: [attempt('a-cp', 1, true)] }), A, facts(0, true), byId, NOW), 'in-progress')
check('skipped wins', moduleStatus(state({ skipped: { a: ago(1) } }), A, facts(0, false), byId, NOW), 'skipped')
check('failed checkpoint needs revision', moduleStatus(state({ attempts: [attempt('a-cp', 1, false)] }), A, facts(2, true), byId, NOW), 'needs-revision')
check('confidence 2 needs revision', moduleStatus(state({ confidence: { a: { value: 2, at: ago(1) } } }), A, facts(1, false), byId, NOW), 'needs-revision')

// Prerequisite gating: Blocked until the prerequisite checkpoint passes; skip also clears it.
check('blocked: prerequisite missing', moduleStatus(state(), B, facts(0, false), byId, NOW), 'blocked')
check('blocked card lists failed prerequisite', checkPrerequisites(state({ attempts: [attempt('a-cp', 2, false)] }), B, byId), { ok: false, missing: [], failed: ['a'] })
check('unblocked after prerequisite passes', moduleStatus(state({ attempts: [attempt('a-cp', 2, false), attempt('a-cp', 1, true)] }), B, facts(0, false), byId, NOW), 'not-started')
check('unblocked by skipping prerequisite', checkPrerequisites(state({ skipped: { a: ago(1) } }), B, byId).ok, true)

// Mastery
const twoPasses = [attempt('a-cp', 10, true), attempt('a-cp', 2, true)]
check('mastered: two passes 8 days apart, confidence 4', isMastered(twoPasses, 4), true)
check('not mastered: passes 3 days apart', isMastered([attempt('a-cp', 5, true), attempt('a-cp', 2, true)], 5), false)
check('not mastered: confidence 3', isMastered(twoPasses, 3), false)
check('not mastered: one pass', isMastered([attempt('a-cp', 10, true)], 5), false)
check('mastered status', moduleStatus(state({ attempts: twoPasses, confidence: { a: { value: 5, at: ago(2) } } }), A, facts(2, true), byId, NOW), 'mastered')

// Revision queue
check('decay: 15 days since pass', revisionReason(state({ attempts: [attempt('a-cp', 15, true)] }), 'a', 'a-cp', NOW), 'decay')
check('no decay at 13 days', revisionReason(state({ attempts: [attempt('a-cp', 13, true)] }), 'a', 'a-cp', NOW), null)
check('review resets decay to 30 days', revisionReason(state({ attempts: [attempt('a-cp', 40, true)], confidence: { a: { value: 4, at: ago(20) } } }), 'a', 'a-cp', NOW), null)
check('confidence ≥ 4 after a fail clears it', revisionReason(state({ attempts: [attempt('a-cp', 3, false)], confidence: { a: { value: 4, at: ago(1) } } }), 'a', 'a-cp', NOW), null)
check('re-pass clears failed checkpoint', revisionReason(state({ attempts: [attempt('a-cp', 3, false), attempt('a-cp', 1, true)] }), 'a', 'a-cp', NOW), null)
check('question with confidence 1', revisionReason(state({ confidence: { q: { value: 1, at: ago(1) } } }), 'q', undefined, NOW), 'low-confidence')
check('confidence decays one level per 21 days', effectiveConfidence({ value: 5, at: ago(43) }, NOW), 3)

// Rollups weight by minutes
check('rollup weights by minutes', rollup([{ minutes: 30, fraction: 1 }, { minutes: 90, fraction: 0 }]), 0.25)

// Checkpoint scoring
const items: AssessmentItem[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({
  id: `q${n}`, kind: 'multiple-choice', prompt: '', options: [], correctOptionId: 'a', explanation: '',
  skillId: n <= 5 ? 's1' : 's2', remediationModuleId: 'a',
}))
const answers = (right: number) => Object.fromEntries(items.map((i, n) => [i.id, n < right ? 'a' : 'b']))
check('70% passes', scoreCheckpoint({ passPercent: 70 }, items, answers(7)).passed, true)
check('60% fails', scoreCheckpoint({ passPercent: 70 }, items, answers(6)).passed, false)
check('skill breakdown', scoreCheckpoint({ passPercent: 70 }, items, answers(7)).skillScores, { s1: { correct: 5, total: 5 }, s2: { correct: 2, total: 5 } })
check('unanswered reported', scoreCheckpoint({ passPercent: 70 }, items, { q1: 'a' }).unanswered.length, 9)

// Mocks
check('mock pass: mean 3, none below 2', scoreMock({ structure: 3, 'technical-depth': 3, 'trade-offs': 3, communication: 3 }, false).passed, true)
check('mock fail: one dimension 1', scoreMock({ structure: 4, 'technical-depth': 4, 'trade-offs': 1, communication: 4 }, false).passed, false)
check('mock fail: FDE round missing customer judgement', scoreMock({ structure: 4, 'technical-depth': 4, 'trade-offs': 4, communication: 4 }, true).passed, false)

// Readiness exam
check('exam pass at 82', scoreExam({ a: 50, b: 32 }, []).passed, true)
check('exam auto-fail caps result', scoreExam({ a: 60, b: 35 }, ['filter-after-retrieval']), { total: 81, raw: 95, passed: false, capped: true })

// Readiness formulas
const ir = interviewReadiness({ rubricMeans: [4], mockMeans: [4, 0], checkpointsPassed: 1, checkpointsTotal: 2, behavioural: 40 })
check('interview readiness = 35 + 15 + 10 + 6', ir.score, 66)
check('weakest interview dimension', ir.weakest.id, 'behavioural')
const pr = portfolioReadiness({ capstoneRubric: undefined, projectsCompleted: 1, projectsRequired: 2, writeUpDone: true, storyProjectLinks: 3 })
check('portfolio readiness = 0 + 15 + 20 + 10', pr.score, 45)
check('weakest portfolio dimension', pr.weakest.id, 'capstone')

// Planning: 8 h a week ≈ 68.6 min a day
check('finish-by days', finishBy(600, 8, NOW).days, 9)

console.log(`${passes} passed, ${failures} failed`)
if (failures) process.exit(1)
