'use client'

/**
 * Self-scoring for a scenario mock lesson (FE-15). The learner picks the round they ran,
 * scores each dimension 1–5 with one line of evidence, and saves. Each save is an
 * `Attempt` under `fd:v1:learn:attempts:mock:<lessonSlug>:<round>`, and the activity
 * log gets a `mock-completed` entry for the dashboard (FE-16). With storage blocked the
 * result still shows for this visit; `StorageNotice` on the page explains why it is lost.
 */
import { useId, useState } from 'react'
import { listAttempts, recordAttempt } from '@/lib/progress/store'
import { rubricToPercent, scoreMock } from '@/lib/progress/rules'
import { useProgress } from '@/lib/progress/useProgress'
import { Button, ErrorState, Input, cx, toast } from '@/components/ui'
import { COPY } from '@/components/learn/copy'
import { EVIDENCE_FROM, MOCK_ROUNDS, mockAssessmentId, saveBlocker, type MockDimension, type MockRound } from './mock-rubric'

const LEVELS = ['Weak (1–2)', 'Average (3)', 'Strong (4)', 'Excellent (5)']
// Labels are `relative` so each visually hidden radio sits inside its own label: clicks
// and focus scrolling then land on the right option.

export function MockScorer({
  lessonSlug,
  title,
  href,
  rounds,
}: {
  lessonSlug: string
  title: string
  href: string
  /** The rounds this mock offers (`mockRoundsFor`); a single round needs no picker. */
  rounds: MockRound[]
}) {
  const uid = useId()
  const [round, setRound] = useState<MockRound>(rounds[0])
  const [scores, setScores] = useState<Record<string, number>>({})
  const [evidence, setEvidence] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [unsaved, setUnsaved] = useState<{ round: MockRound; rubric: Record<string, number> } | null>(null)

  const { label, dims } = MOCK_ROUNDS[round]
  const ids = dims.map((d) => d.id)
  const assessmentId = mockAssessmentId(lessonSlug, round)
  const last = useProgress(() => listAttempts(assessmentId).at(-1) ?? null)
  const shown = unsaved?.round === round ? unsaved.rubric : last?.rubric
  const result = shown ? scoreMock(shown, ids) : null
  // Name the weakest dimension only when one actually trails the mean (not on a flat round).
  const lowest = dims.find((d) => d.id === result?.lowest && (shown?.[d.id] ?? 0) < result.mean)

  const save = () => {
    const blocker = saveBlocker(dims, scores, evidence)
    if (blocker) return setError(blocker)
    setError('')
    const rubric = Object.fromEntries(ids.map((id) => [id, scores[id]]))
    const answers = Object.fromEntries(ids.filter((id) => evidence[id]?.trim()).map((id) => [id, evidence[id].trim()]))
    const r = scoreMock(rubric, ids)
    const saved = recordAttempt(
      {
        assessmentId,
        kind: 'mock',
        at: new Date().toISOString(),
        score: Math.round(rubricToPercent(r.mean, 5)),
        passed: r.passed,
        rubric,
        answers,
      },
      { kind: 'mock-completed', label: `${r.passed ? 'Passed' : 'Scored'} ${title}, ${label.toLowerCase()} (mean ${r.mean.toFixed(1)})`, href },
    )
    setUnsaved(saved ? null : { round, rubric })
    if (!saved) toast(COPY.saveFailed, 'error')
    else toast(r.passed ? `${label} passed.` : `${label} scored. Not a pass yet.`, r.passed ? 'success' : 'info')
  }

  return (
    <section aria-labelledby={`${uid}-h`} className="mt-10 rounded-lg border border-border bg-surface p-4 sm:p-6">
      <h2 id={`${uid}-h`} className="text-xl font-semibold">
        Score your round
      </h2>
      <p className="mt-1 text-sm text-muted">
        Score each dimension from 1 to 5. A score of {EVIDENCE_FROM} or 5 needs one line of evidence quoted from your
        answer. Pass: no dimension below 2 and a mean of 3 or more.
      </p>

      {rounds.length > 1 && (
        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Which round did you run?</legend>
          <div className="mt-2 inline-flex rounded-md border border-border p-0.5">
            {rounds.map((r) => (
              <label
                key={r}
                className={cx(
                  'relative cursor-pointer rounded-sm px-3 py-1.5 text-sm font-medium focus-within:ring-4 focus-within:ring-accent-ring',
                  round === r ? 'bg-accent-soft text-accent' : 'text-muted hover:text-text',
                )}
              >
                <input
                  type="radio"
                  name={`${uid}-round`}
                  className="sr-only"
                  checked={round === r}
                  onChange={() => (setRound(r), setError(''))}
                />
                {MOCK_ROUNDS[r].label} ({MOCK_ROUNDS[r].dims.length} dimensions)
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-6 space-y-6">
        {dims.map((d) => (
          <DimensionField
            key={`${round}-${d.id}`}
            uid={uid}
            dim={d}
            score={scores[d.id]}
            evidence={evidence[d.id] ?? ''}
            onScore={(v) => setScores((s) => ({ ...s, [d.id]: v }))}
            onEvidence={(v) => setEvidence((e) => ({ ...e, [d.id]: v }))}
          />
        ))}
      </div>

      {error && (
        <div className="mt-4">
          <ErrorState title="Not saved yet" body={error} />
        </div>
      )}
      <Button className="mt-5" onClick={save}>
        Save {label.toLowerCase()} score
      </Button>

      {result && (
        <div
          className={cx(
            'mt-5 rounded-lg border p-4',
            result.passed ? 'border-success/40 bg-success-soft' : 'border-danger/40 bg-danger-soft',
          )}
        >
          <p className="font-semibold">
            {unsaved ? 'This visit' : 'Last saved'}, {label.toLowerCase()}: {result.passed ? 'Pass' : 'Not yet'}, mean{' '}
            {result.mean.toFixed(1)} of 5
          </p>
          {lowest && (
            <p className="mt-1 text-sm">
              Weakest dimension: <strong>{lowest.label}</strong>.{' '}
              {!result.passed && 'Re-read the strong framing above for it, then run the round again.'}
            </p>
          )}
        </div>
      )}
    </section>
  )
}

function DimensionField({
  uid,
  dim,
  score,
  evidence,
  onScore,
  onEvidence,
}: {
  uid: string
  dim: MockDimension
  score: number | undefined
  evidence: string
  onScore: (v: number) => void
  onEvidence: (v: string) => void
}) {
  const hintId = `${uid}-${dim.id}-hint`
  return (
    <fieldset aria-describedby={hintId}>
      <legend className="font-semibold">{dim.label}</legend>
      {dim.anchors ? (
        <ul id={hintId} className="mt-1 space-y-0.5 text-sm text-muted">
          {dim.anchors.map((a, i) => (
            <li key={LEVELS[i]}>
              <span className="font-medium text-text">{LEVELS[i]}:</span> {a}
            </li>
          ))}
        </ul>
      ) : (
        <p id={hintId} className="mt-1 text-sm text-muted">
          Strong evidence: {dim.strong}
        </p>
      )}
      <div className="mt-2 flex gap-2">
        {[1, 2, 3, 4, 5].map((v) => (
          <label
            key={v}
            className={cx(
              'relative grid h-10 w-10 cursor-pointer place-items-center rounded-md border text-sm font-semibold focus-within:ring-4 focus-within:ring-accent-ring',
              score === v ? 'border-accent bg-accent-soft text-accent' : 'border-input-border hover:bg-surface-2',
            )}
          >
            <input type="radio" name={`${uid}-${dim.id}`} className="sr-only" checked={score === v} onChange={() => onScore(v)} />
            {v}
          </label>
        ))}
      </div>
      <label className="mt-2 block text-sm">
        <span className="text-muted">
          Evidence{(score ?? 0) >= EVIDENCE_FROM ? ', required for this score' : ''}
        </span>
        <Input
          className="mt-1"
          required={(score ?? 0) >= EVIDENCE_FROM}
          value={evidence}
          onChange={(e) => onEvidence(e.target.value)}
          placeholder="One line quoted from your answer"
        />
      </label>
    </fieldset>
  )
}
