/**
 * The mock interview rubric (FE-15), copied from the T8.2 lessons so the scorer matches
 * the tables the learner just read: the short round's five signals ("Score the Round",
 * lessons 02–06) and the full round's six dimensions with anchors ("Score With the
 * Six-Dimension Rubric", lesson 01). Both are scored 1–5. Edit the lessons first, then
 * this file.
 */

export type MockRound = 'short' | 'full'

export interface MockDimension {
  id: string
  label: string
  /** Short round: the scorecard's "Strong evidence" column. */
  strong?: string
  /** Full round: anchors for 1–2 Weak, 3 Average, 4 Strong, 5 Excellent. */
  anchors?: [weak: string, average: string, strong: string, excellent: string]
}

export const MOCK_MINUTES = 45

/** Lesson 01 teaches the method; the five lessons after it are the scenario mocks. */
export const MOCK_MODULE = 'mock-interviews'
export const MOCK_METHOD_LESSON = 'running-and-scoring-a-mock-interview'

export const MOCK_ROUNDS: Record<MockRound, { label: string; dims: MockDimension[] }> = {
  short: {
    label: 'Short round',
    dims: [
      { id: 'discovery', label: 'Discovery', strong: 'Clear workflow, users, metrics' },
      { id: 'architecture', label: 'Architecture', strong: 'Secure, permission-aware, observable' },
      { id: 'evals', label: 'Evals', strong: 'Golden set, regression, red-team' },
      { id: 'production', label: 'Production', strong: 'SLOs, costs, rollout, rollback' },
      { id: 'communication', label: 'Communication', strong: 'Clear business and technical framing' },
    ],
  },
  full: {
    label: 'Full round',
    dims: [
      {
        id: 'discovery',
        label: 'Discovery',
        anchors: [
          'Starts with tools or the model',
          'Some workflow questions',
          'Clear user, workflow and risk questions',
          'Quantifies business value, failure cost, owners and adoption path',
        ],
      },
      {
        id: 'architecture',
        label: 'Architecture',
        anchors: [
          'Generic GPT plus vector DB',
          'Basic RAG or agent design',
          'Permission-aware, observable, risk-bounded design',
          'Explains data flow, auth, eval gates, rollback and operational ownership',
        ],
      },
      {
        id: 'security',
        label: 'Security',
        anchors: [
          'Mentions privacy generally',
          'Adds access control',
          'Handles ACLs, prompt injection, audit and approval',
          'Threat-models misuse, tenant isolation, policy enforcement and evidence logs',
        ],
      },
      {
        id: 'evaluation',
        label: 'Evaluation',
        anchors: [
          'Says "accuracy testing"',
          'Adds a golden set',
          'Measures groundedness, citations, task success and regressions',
          'Includes adversarial tests, human review, launch gates and continuous evals',
        ],
      },
      {
        id: 'production',
        label: 'Production',
        anchors: [
          'Demo-only thinking',
          'Basic monitoring',
          'SLOs, cost and latency budgets, rollout, fallback',
          'Clear phased launch, incident response, business dashboard, model and version governance',
        ],
      },
      {
        id: 'communication',
        label: 'Communication',
        anchors: [
          'Vague and buzzword-heavy',
          'Understandable but shallow',
          'Clear trade-offs and customer framing',
          'Executive-ready, technically precise, honest about limits',
        ],
      },
    ],
  },
}

/** Attempts for one lesson and round live under `fd:v1:learn:attempts:mock:<lessonSlug>:<round>`. */
export const mockAssessmentId = (lessonSlug: string, round: MockRound) => `mock:${lessonSlug}:${round}`

/**
 * Why a round cannot be saved yet, as a message for the learner, or `null` when it can.
 *
 * Evidence policy (owner decision, 10 October 2026): a score of 4 or 5 needs one line of
 * evidence quoted from the answer. The lessons say "a score without evidence is a
 * guess", and generous high scores are the guesses that mislead readiness; low scores
 * stay quick to record.
 */
export const EVIDENCE_FROM = 4

export function saveBlocker(
  dims: MockDimension[],
  scores: Record<string, number>,
  evidence: Record<string, string>,
): string | null {
  const unscored = dims.filter((d) => !scores[d.id])
  if (unscored.length) return `Score every dimension first: ${unscored.map((d) => d.label).join(', ')}.`
  const unevidenced = dims.filter((d) => scores[d.id] >= EVIDENCE_FROM && !evidence[d.id]?.trim())
  if (unevidenced.length) {
    return `Add a line of evidence for each score of ${EVIDENCE_FROM} or 5: ${unevidenced.map((d) => d.label).join(', ')}.`
  }
  return null
}
