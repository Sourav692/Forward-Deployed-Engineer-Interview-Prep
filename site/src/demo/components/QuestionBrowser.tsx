'use client'

import Link from 'next/link'
import { useState, useSyncExternalStore } from 'react'
import type { InterviewQuestion, QuestionCategory } from '../types'
import * as repo from '../repo'
import { update, useDemo } from '../store/useDemo'
import { Select } from './CurriculumOverview'
import { toast } from './feedback'
import { BookmarkButton, ConfidenceControl } from './islands'
import { EmptyState, Tag, btn, cx } from './ui'

const CATEGORIES: QuestionCategory[] = ['software-engineering', 'data-engineering', 'machine-learning', 'llm-applications', 'ai-systems-design', 'distributed-systems', 'fde', 'behavioural']
const label = (s: string) => (s === 'fde' ? 'FDE' : s === 'llm-applications' ? 'LLM applications' : s === 'ai-systems-design' ? 'AI systems design' : s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' '))
const DIM_LABEL: Record<string, string> = {
  structure: 'Structure',
  'technical-depth': 'Technical depth',
  'trade-offs': 'Trade-offs',
  communication: 'Communication',
  'customer-judgement': 'Customer judgement',
}

export function QuestionBrowser({ hubId }: { hubId?: string }) {
  const { state } = useDemo()
  const [hub, setHub] = useState(hubId ?? '')
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [reviewed, setReviewed] = useState('')
  const [bookmarked, setBookmarked] = useState('')
  const reviewedIds = new Set(state?.reviews.map((r) => r.itemId))
  const bookmarkedIds = new Set(state?.bookmarks.filter((b) => b.kind === 'question').map((b) => b.itemId))
  const questions = repo
    .listQuestions({ hubId: hub || undefined, category: (category || undefined) as QuestionCategory | undefined, difficulty: (difficulty || undefined) as InterviewQuestion['difficulty'] | undefined })
    .filter((q) => !reviewed || (reviewed === 'yes') === reviewedIds.has(q.id))
    .filter((q) => !bookmarked || (bookmarked === 'yes') === bookmarkedIds.has(q.id))
  const clear = () => (setHub(hubId ?? ''), setCategory(''), setDifficulty(''), setReviewed(''), setBookmarked(''))

  return (
    <div>
      <div className={cx('mb-4 grid grid-cols-2 gap-3', hubId ? 'md:grid-cols-4' : 'md:grid-cols-5')} role="group" aria-label="Filter questions">
        {!hubId && <Select id="q-hub" label="Hub" value={hub} onChange={setHub} options={[['', 'All hubs'], ...repo.listHubs().map((h): [string, string] => [h.id, h.title])]} />}
        <Select id="q-cat" label="Category" value={category} onChange={setCategory} options={[['', 'All categories'], ...CATEGORIES.map((c): [string, string] => [c, label(c)])]} />
        <Select id="q-diff" label="Difficulty" value={difficulty} onChange={setDifficulty} options={[['', 'Any'], ['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']]} />
        <Select id="q-rev" label="Reviewed" value={reviewed} onChange={setReviewed} options={[['', 'Any'], ['yes', 'Reviewed'], ['no', 'Not reviewed']]} />
        <Select id="q-bm" label="Bookmarked" value={bookmarked} onChange={setBookmarked} options={[['', 'Any'], ['yes', 'Bookmarked'], ['no', 'Not bookmarked']]} />
      </div>
      <p className="mb-3 text-[0.8125rem] text-subtle" aria-live="polite">
        {questions.length} question{questions.length === 1 ? '' : 's'}
      </p>
      {questions.length === 0 ? (
        <EmptyState title="No questions match" body="Clear a filter. Reviewed and bookmarked filters only match questions you have acted on." action={<button type="button" onClick={clear} className="text-[0.875rem] font-semibold text-accent underline">Clear filters</button>} />
      ) : (
        <ul className="space-y-3">
          {questions.map((q) => (
            <li key={q.id}>
              <QuestionCard q={q} reviewed={reviewedIds.has(q.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const subscribeHash = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

function QuestionCard({ q, reviewed }: { q: InterviewQuestion; reviewed: boolean }) {
  const { state } = useDemo()
  // A question linked by #id (search, revision queue) opens itself; the server
  // snapshot is '' so prerendered HTML and hydration agree.
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash, () => '')
  const [toggled, setOpen] = useState<boolean | null>(null)
  const open = toggled ?? hash === `#${q.id}`
  const [hints, setHints] = useState(0)
  const [answer, setAnswer] = useState(false)
  const canonical = repo.getModule(q.canonicalModuleId)
  const mock = repo.getMock(q.mockId)
  const panel = `qpanel-${q.id}`

  const markReviewed = () => {
    update(
      (s) => void s.reviews.push({ itemId: q.id, at: new Date().toISOString() }),
      { kind: 'question-reviewed', itemId: q.id, label: `Reviewed “${q.prompt}”`, href: repo.href.question(q) },
    )
    toast('Marked reviewed.')
  }

  return (
    <article id={q.id} className="scroll-mt-24 rounded-xl border border-border bg-surface">
      <button type="button" aria-expanded={open} aria-controls={panel} onClick={() => setOpen(!open)} className="flex w-full flex-wrap items-start gap-2 p-4 text-left">
        <span className="min-w-0 flex-1">
          <span className="block text-[0.75rem] font-semibold text-subtle">{q.topic}</span>
          <span className="mt-0.5 block font-semibold">{q.prompt}</span>
        </span>
        <span className="flex flex-wrap gap-1.5">
          <Tag>{label(q.category)}</Tag>
          <Tag>{q.difficulty}</Tag>
          {reviewed && <Tag tone="success">Reviewed</Tag>}
        </span>
      </button>
      {open && (
        <div id={panel} className="space-y-4 border-t border-border p-4 text-[0.9375rem]">
          <p>
            <span className="font-semibold">Concept review: </span>
            {q.conceptReview}{' '}
            {canonical && (
              <Link href={repo.href.module(canonical)} className="text-accent hover:underline">
                {canonical.code} {canonical.title} →
              </Link>
            )}
          </p>
          <div>
            <h3 className="font-semibold">Expected answer structure</h3>
            <ol className="mt-1 list-decimal space-y-0.5 pl-5">
              {q.answerStructure.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className="font-semibold">Hints</h3>
            {q.hints.slice(0, hints).map((h, i) => (
              <p key={h} className="mt-1 rounded-md bg-surface-2 px-3 py-1.5 text-[0.875rem]">
                {i + 1}. {h}
              </p>
            ))}
            {hints < q.hints.length && (
              <button type="button" className={cx(btn.ghost, 'mt-1 px-0 text-accent')} onClick={() => setHints((h) => h + 1)}>
                Reveal hint {hints + 1} of {q.hints.length}
              </button>
            )}
          </div>
          <div>
            <button type="button" aria-expanded={answer} aria-controls={`${panel}-answer`} className={btn.secondary} onClick={() => setAnswer((a) => !a)}>
              {answer ? 'Hide sample answer' : 'Reveal sample answer'}
            </button>
            {answer && (
              <blockquote id={`${panel}-answer`} className="mt-2 border-l-2 border-accent/40 pl-4 italic text-muted">
                {q.sampleAnswer}
              </blockquote>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h3 className="font-semibold">Common weak answers</h3>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[0.875rem]">
                {q.weakAnswers.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Follow-up questions</h3>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[0.875rem]">
                {q.followUps.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Rubric anchors: what “4 Strong” sounds like</h3>
            <dl className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {q.rubricAnchors.map((r) => (
                <div key={r.dimension} className="rounded-md bg-surface-2 px-3 py-2 text-[0.875rem]">
                  <dt className="font-semibold">{DIM_LABEL[r.dimension]}</dt>
                  <dd className="text-muted">{r.strong}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[0.875rem]">
            <span>
              <span className="font-semibold">Practice: </span>
              {q.practiceLinks.map((l, i) => (
                <span key={l.href}>
                  {i > 0 && ' · '}
                  <Link href={l.href} className="text-accent hover:underline">
                    {l.label}
                  </Link>
                </span>
              ))}
            </span>
            {mock && (
              <span>
                <span className="font-semibold">Mock format: </span>
                <Link href={repo.href.mock(mock.id)} className="text-accent hover:underline">
                  Mock {mock.letter}, {mock.title}
                </Link>
              </span>
            )}
            <span>
              <span className="font-semibold">Related: </span>
              {q.relatedModuleIds.map((id, i) => {
                const m = repo.getModule(id)
                return m ? (
                  <span key={id}>
                    {i > 0 && ', '}
                    <Link href={repo.href.module(m)} className="text-accent hover:underline">
                      {m.code}
                    </Link>
                  </span>
                ) : null
              })}
            </span>
          </div>
          <div className="flex flex-wrap items-end gap-4 border-t border-border pt-4">
            {state ? (
              <>
                <button type="button" className={btn.secondary} onClick={markReviewed}>
                  {reviewed ? 'Reviewed again' : 'Mark reviewed'}
                </button>
                <BookmarkButton kind="question" itemId={q.id} label="a question" />
                <ConfidenceControl itemId={q.id} label="a question" href={repo.href.question(q)} />
              </>
            ) : (
              <p className="text-[0.875rem] text-muted">
                <Link href={`/demo/sign-in?next=${encodeURIComponent(repo.href.hub(q.hubId))}`} className="font-semibold text-accent underline">
                  Sign in
                </Link>{' '}
                to mark reviewed, bookmark and self-assess.
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  )
}
