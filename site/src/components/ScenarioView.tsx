'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Block, Section } from '@/lib/parse'
import type { Scenario } from '@/lib/scenario'
import { qualifiedTitle, scenarioHref } from '@/lib/scenario'
import {
  clearScenario,
  loadAnswers,
  loadAnswerStatuses,
  loadExtraRows,
  loadScores,
  loadStatus,
  notifyProgress,
  saveAnswers,
  saveAnswerStatuses,
  saveExtraRows,
  saveScores,
  saveStatus,
  STATUS_LABELS,
  type Answers,
  type ExtraRows,
  type Scores,
  type Status,
} from '@/lib/storage'
import { Blocks } from './Blocks'
import { AnswerKeyReveal } from './AnswerKeyReveal'
import { ScenarioToolbar } from './ScenarioToolbar'

const SAVE_DEBOUNCE_MS = 400
type AnswerStatusFilter = 'all' | Status

/**
 * Behavioural pages are a focused answer library: the answer is visible immediately,
 * while each question keeps its own preparation status in local storage.
 */
export function ScenarioView({
  scenario,
  behavioral = false,
}: {
  scenario: Scenario
  behavioral?: boolean
}) {
  const id = `${scenario.ref.trackId}/${scenario.ref.slug}`

  // State starts empty on both server and client so the first client render matches
  // the prerendered HTML exactly; saved values arrive in the effect below.
  const [answers, setAnswers] = useState<Answers>({})
  const [scores, setScores] = useState<Scores>({})
  const [extraRows, setExtraRows] = useState<ExtraRows>({})
  const [answerStatuses, setAnswerStatuses] = useState<Record<string, Status>>({})
  const [statusFilter, setStatusFilter] = useState<AnswerStatusFilter>('all')
  const [status, setStatus] = useState<Status>('not-started')
  const [hydrated, setHydrated] = useState(false)
  const [storageAvailable, setStorageAvailable] = useState(true)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [revealAll, setRevealAll] = useState(false)

  // Saved answers live in localStorage, which does not exist during prerendering and
  // must not be read during render. Reading after mount is what keeps the first client
  // render identical to the prerendered HTML; seeding this state any earlier is exactly
  // what would be unsafe. One pass, on scenario change.
  /* eslint-disable react-hooks/set-state-in-effect -- hydration-safe by design */
  useEffect(() => {
    const savedAnswerStatuses = loadAnswerStatuses(id)
    const defaultAnswerStatus = loadStatus(id)
    const initialAnswerStatuses = behavioral
      ? Object.fromEntries(
          scenario.sections.map((section) => [
            section.key,
            savedAnswerStatuses[section.key] ?? defaultAnswerStatus,
          ]),
        )
      : savedAnswerStatuses
    setAnswers(loadAnswers(id))
    setScores(loadScores(id))
    setExtraRows(loadExtraRows(id))
    setAnswerStatuses(initialAnswerStatuses)
    if (behavioral) saveAnswerStatuses(id, initialAnswerStatuses, scenario.sections.length)
    setStatus(loadStatus(id))
    try {
      const probe = '__fd_probe__'
      window.localStorage.setItem(probe, '1')
      window.localStorage.removeItem(probe)
    } catch {
      setStorageAvailable(false)
    }
    setHydrated(true)
  }, [behavioral, id, scenario.sections])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Debounced so typing does not write on every keystroke. The timer is cleared on
  // unmount, and a pending write is flushed first so navigating away keeps the edit.
  const pending = useRef<Answers | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flush = useCallback(() => {
    if (pending.current) {
      saveAnswers(id, pending.current)
      pending.current = null
      notifyProgress()
    }
  }, [id])

  useEffect(() => () => flush(), [flush])

  const handleAnswer = useCallback(
    (fieldId: string, value: string) => {
      setAnswers((prev) => {
        const next = { ...prev, [fieldId]: value }
        pending.current = next
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => {
          flush()
          setSavedAt(Date.now())
        }, SAVE_DEBOUNCE_MS)
        return next
      })
    },
    [flush],
  )

  const handleScore = useCallback(
    (rowId: string, value: number) => {
      setScores((prev) => {
        const next = prev[rowId] === value ? omit(prev, rowId) : { ...prev, [rowId]: value }
        saveScores(id, next)
        notifyProgress()
        setSavedAt(Date.now())
        return next
      })
    },
    [id],
  )

  const handleAddRow = useCallback(
    (blockId: string) => {
      setExtraRows((prev) => {
        const next = { ...prev, [blockId]: (prev[blockId] ?? 0) + 1 }
        saveExtraRows(id, next)
        return next
      })
    },
    [id],
  )

  const handleStatus = useCallback(
    (next: Status) => {
      setStatus(next)
      saveStatus(id, next)
      notifyProgress()
    },
    [id],
  )

  const handleAnswerStatus = useCallback(
    (sectionKey: string, nextStatus: Status) => {
      setAnswerStatuses((previous) => {
        const next = { ...previous, [sectionKey]: nextStatus }
        saveAnswerStatuses(id, next, scenario.sections.length)
        notifyProgress()
        return next
      })
    },
    [id, scenario.sections.length],
  )

  const handleReset = useCallback(() => {
    const message =
      'Clear your saved answers, scores and status for this scenario?\n\n' +
      'This cannot be undone. Export first if you want to keep them.'
    if (!window.confirm(message)) return
    clearScenario(id)
    pending.current = null
    if (timer.current) clearTimeout(timer.current)
    setAnswers({})
    setScores({})
    setExtraRows({})
    setAnswerStatuses({})
    setStatus('not-started')
    setSavedAt(null)
    notifyProgress()
  }, [id])

  const handleExport = useCallback(() => {
    flush()
    downloadMarkdown(scenario, answers, scores)
  }, [flush, scenario, answers, scores])

  // "Saved" is a transient acknowledgement, not persistent state.
  useEffect(() => {
    if (savedAt === null) return
    const t = setTimeout(() => setSavedAt(null), 2000)
    return () => clearTimeout(t)
  }, [savedAt])

  const totalFields = useMemo(() => countFields(scenario.sections), [scenario.sections])
  const answered = useMemo(
    () => Object.values(answers).filter((v) => v.trim() !== '').length,
    [answers],
  )
  const visibleSections = behavioral
    ? scenario.sections.filter((section) =>
        statusFilter === 'all' ? true : (answerStatuses[section.key] ?? 'not-started') === statusFilter,
      )
    : scenario.sections

  return (
    <article className="pb-20">
      {!behavioral && (
        <ScenarioToolbar
          status={status}
          onStatus={handleStatus}
          answered={answered}
          total={totalFields}
          savedAt={savedAt}
          storageAvailable={storageAvailable && hydrated}
          revealAll={revealAll}
          onRevealAll={setRevealAll}
          onExport={handleExport}
          onReset={handleReset}
        />
      )}

      {behavioral && (
        <>
          <BehavioralReadingGuide />
          <AnswerStatusFilterBar
            activeFilter={statusFilter}
            onChange={setStatusFilter}
            visible={visibleSections.length}
            total={scenario.sections.length}
          />
        </>
      )}

      {!behavioral && scenario.intro.length > 0 && (
        <div className="mb-12 rounded-xl border border-border bg-surface-2/50 p-5 text-[0.9375rem] leading-relaxed">
          <Blocks blocks={scenario.intro} />
        </div>
      )}

      <div className="space-y-12">
        {visibleSections.map((section) => (
          <section key={section.index} id={`section-${section.index}`} className="scroll-mt-32">
            <div className="mb-4 flex items-baseline gap-3">
              <span className="text-[0.8125rem] font-bold tabular-nums text-accent">
                {String(section.index).padStart(2, '0')}
              </span>
              <h2 className="text-xl font-semibold tracking-[-0.011em]">{section.title}</h2>
            </div>

            {section.stories && section.stories.length > 0 && (
              <p className="no-print -mt-2 mb-4 text-[0.8125rem] leading-relaxed text-muted">
                <span className="font-semibold text-subtle">Stories that fit: </span>
                {section.stories.map((story, i) => (
                  <span key={story.href}>
                    {i > 0 && ' · '}
                    <Link href={story.href} className="text-accent hover:text-accent-hover">
                      {story.title}
                    </Link>
                  </span>
                ))}
              </p>
            )}

            {behavioral ? (
              <BehavioralAnswer
                sections={section.answerKey}
                status={answerStatuses[section.key] ?? 'not-started'}
                onStatus={(nextStatus) => handleAnswerStatus(section.key, nextStatus)}
              />
            ) : (
              <>
                <Blocks
                  blocks={section.blocks}
                  subheading="h3"
                  answers={answers}
                  scores={scores}
                  extraRows={extraRows}
                  onAnswer={handleAnswer}
                  onScore={handleScore}
                  onAddRow={handleAddRow}
                />

                <AnswerKeyReveal
                  key={`${section.index}-${revealAll}`}
                  sections={section.answerKey}
                  defaultOpen={revealAll}
                />
              </>
            )}
          </section>
        ))}
        {behavioral && visibleSections.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-[0.875rem] text-muted">
            No answers have this status yet. Choose another filter or update an answer’s status.
          </div>
        )}
      </div>

      {scenario.closing && <ClosingCard section={scenario.closing} />}

      <nav className="no-print mt-16 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
        {scenario.prev ? (
          <Link
            href={scenarioHref(scenario.prev)}
            className="group rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong"
          >
            <div className="mb-1 text-[0.75rem] text-subtle">← Previous</div>
            <div className="text-[0.9375rem] font-medium group-hover:text-accent">
              {qualifiedTitle(scenario.prev)}
            </div>
          </Link>
        ) : (
          <div />
        )}
        {scenario.next && (
          <Link
            href={scenarioHref(scenario.next)}
            className="group rounded-lg border border-border bg-surface p-4 text-right transition-colors hover:border-border-strong sm:col-start-2"
          >
            <div className="mb-1 text-[0.75rem] text-subtle">Next →</div>
            <div className="text-[0.9375rem] font-medium group-hover:text-accent">
              {qualifiedTitle(scenario.next)}
            </div>
          </Link>
        )}
      </nav>
    </article>
  )
}

const ANSWER_STATUSES: Status[] = ['not-started', 'practiced', 'mastered']

function AnswerStatusFilterBar({
  activeFilter,
  onChange,
  visible,
  total,
}: {
  activeFilter: AnswerStatusFilter
  onChange: (filter: AnswerStatusFilter) => void
  visible: number
  total: number
}) {
  const options: { value: AnswerStatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    ...ANSWER_STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] })),
  ]

  return (
    <div className="no-print mb-8 rounded-xl border border-border bg-surface px-4 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[0.875rem] font-semibold">Filter answers by status</p>
          <p className="text-[0.8125rem] text-muted">Showing {visible} of {total} answers</p>
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter answers by status">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={activeFilter === option.value}
              onClick={() => onChange(option.value)}
              className={`rounded-md border px-2.5 py-1.5 text-[0.75rem] font-semibold transition-colors ${
                option.value === 'all'
                  ? activeFilter === 'all'
                    ? 'border-border-strong bg-surface-2 text-text'
                    : 'border-border text-muted hover:border-border-strong hover:text-text'
                  : answerStatusClass(option.value, activeFilter === option.value)
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function BehavioralReadingGuide() {
  return (
    <aside className="no-print mb-5 rounded-xl border border-accent/25 bg-accent-soft px-4 py-3.5">
      <h2 className="text-[0.9375rem] font-semibold">A simple way to read these answers</h2>
      <p className="mt-1 text-[0.875rem] leading-relaxed text-muted">
        Listen for four things: what the customer needed, the problem you owned, what you did,
        and what changed. You do not need to sound technical. Use clear words and a real example.
      </p>
    </aside>
  )
}

function BehavioralAnswer({
  sections,
  status,
  onStatus,
}: {
  sections: Section[]
  status: Status
  onStatus: (status: Status) => void
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-col gap-3 border-b border-border bg-surface-2/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[0.875rem] font-semibold">Sample answer</p>
          <p className="mt-0.5 text-[0.8125rem] text-muted">Read it, practise it in your own words, then choose your status.</p>
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Answer preparation status">
          {ANSWER_STATUSES.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={status === option}
              onClick={() => onStatus(option)}
              className={`rounded-md border px-2.5 py-1.5 text-[0.75rem] font-semibold transition-colors ${answerStatusClass(option, status === option)}`}
            >
              {STATUS_LABELS[option]}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-6 px-4 py-4">
        {sections.length > 0 ? (
          sections.map((answer) => (
            <div key={answer.key}>
              <h3 className="mb-2.5 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-accent">
                {answer.title}
              </h3>
              <Blocks blocks={makeBehavioralAnswerEasyToRead(answer.blocks)} />
            </div>
          ))
        ) : (
          <p className="text-[0.875rem] text-muted">A sample answer is not available for this question yet.</p>
        )}
      </div>
    </div>
  )
}

function answerStatusClass(status: Status, active: boolean): string {
  if (status === 'mastered') return active
    ? 'border-success bg-success/15 text-success'
    : 'border-success/30 text-success hover:bg-success/10'
  if (status === 'practiced') return active
    ? 'border-warning bg-warning/15 text-warning'
    : 'border-warning/30 text-warning hover:bg-warning/10'
  return active
    ? 'border-border-strong bg-surface text-text shadow-[var(--shadow)]'
    : 'border-border text-muted hover:border-border-strong hover:text-text'
}

function makeBehavioralAnswerEasyToRead(blocks: Block[]): Block[] {
  return blocks
    .map((block) => {
      if (block.kind === 'prose') return { ...block, html: plainLanguageText(cleanFillText(block.html)) }
      if (block.kind === 'subheading') return { ...block, text: plainLanguageText(block.text) }
      if (block.kind === 'list') {
        return {
          ...block,
          items: block.items
            .filter((item) => item.kind === 'text')
            .map((item) => item.kind === 'text' ? { ...item, html: plainLanguageText(cleanFillText(item.html)) } : item),
        }
      }
      if (block.kind === 'table') {
        return {
          ...block,
          headers: block.headers.map(plainLanguageText),
          rows: block.rows.map((row) => row.map((cell) => ({
            ...cell,
            editable: false,
            text: plainLanguageText(cleanFillText(cell.text)),
          }))),
        }
      }
      return block
    })
    .filter((block) => block.kind !== 'list' || block.items.length > 0)
}

function cleanFillText(value: string): string {
  return value
    .replace(/\[FILL:[^\]]+\]/g, '')
    .replace(/\[[^\]]+\]/g, '')
    .replace(/\s*[—–-]\s*([.,;:])/g, '$1')
    .replace(/\bwhen\s+reviewed\b/gi, 'when the review team reviewed')
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/\s{2,}/g, ' ')
}

/**
 * Behavioral answer keys were written by experienced FDEs and contain useful detail,
 * but their original vocabulary assumes customer-facing delivery experience. This keeps
 * the evidence while translating the terms a newer candidate is least likely to know.
 */
function plainLanguageText(value: string): string {
  return value
    .replace(/\bSituation\./g, 'What the customer needed.')
    .replace(/\bTask\./g, 'What I needed to do.')
    .replace(/\bAction\./g, 'What I did.')
    .replace(/\bResult\./g, 'What happened.')
    .replace(/\bWhy it lands\./g, 'Why an interviewer likes this answer.')
    .replace(/\bThe trap\./g, 'Watch out.')
    .replace(/\bAnchor\b/g, 'Real example')
    .replace(/\bengagements\b/gi, 'customer projects')
    .replace(/\bengagement\b/gi, 'customer project')
    .replace(/\bstakeholders\b/gi, 'people involved')
    .replace(/\bstakeholder\b/gi, 'person involved')
    .replace(/\bscope creep\b/gi, 'extra work being added')
    .replace(/\bscoping\b/gi, 'agreeing the work')
    .replace(/\bscope\b/gi, 'amount of work')
    .replace(/\bgovernance\b/gi, 'safety')
    .replace(/\bgoverned\b/gi, 'approved and controlled')
    .replace(/\brollout\b/gi, 'launch')
    .replace(/\bproduction\b/gi, 'live system')
    .replace(/\barchitecture\b/gi, 'system plan')
    .replace(/\btradeoff\b/gi, 'choice and its downside')
    .replace(/\bsupervised autonomy\b/gi, 'a person checks important decisions')
    .replace(/\bfull autonomy\b/gi, 'fully automated decisions')
    .replace(/\bautonomy\b/gi, 'independence')
    .replace(/\bobservability\b/gi, 'tracking')
    .replace(/\btraceability\b/gi, 'a clear record of what happened')
    .replace(/\bescalation surface\b/gi, 'impact if it fails')
    .replace(/\beconomic buyer\b/gi, 'person who owns the budget')
    .replace(/\btechnical buyer\b/gi, 'person who will use or run the system')
    .replace(/\bMVP\b/g, 'first useful version')
    .replace(/\bRCA\b/g, 'root-cause analysis')
    .replace(/\bPII\b/g, 'personal data')
    .replace(/\bdemonstrable consumption and ROI\b/gi, 'whether the investment was being used and delivering value')
    .replace(/\bconstrained rollout\b/gi, 'safe first launch')
}

/**
 * The answer key's closing section, given its own card. It is the one piece of the
 * key that is a script rather than a checklist — the thing you rehearse out loud.
 */
function ClosingCard({ section }: { section: Section }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-14 overflow-hidden rounded-xl border border-accent/30 bg-accent-soft">
      <div className="px-5 py-4">
        <div className="mb-1 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-accent">
          The closer
        </div>
        <h3 className="text-lg font-semibold">{section.title}</h3>
        <p className="mt-1 text-[0.875rem] text-muted">
          Rehearse this out loud before you look at it. Summarising the whole design in
          two minutes is its own skill, and it is usually the last thing you are asked for.
        </p>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="no-print mt-3 rounded-md bg-accent px-3 py-1.5 text-[0.8125rem] font-semibold text-white transition-colors dark:text-bg hover:bg-accent-hover"
          >
            Show the model answer
          </button>
        )}
      </div>
      {open && (
        <div className="border-t border-accent/20 bg-surface px-5 py-4">
          <Blocks blocks={section.blocks} />
        </div>
      )}
    </div>
  )
}

function omit<T extends Record<string, unknown>>(obj: T, key: string): T {
  const next = { ...obj }
  delete next[key]
  return next
}

function countFields(sections: Section[]): number {
  let total = 0
  const walk = (blocks: Block[]) => {
    for (const b of blocks) {
      if (b.kind === 'list') {
        for (const item of b.items) if (item.kind !== 'text') total++
      }
      if (b.kind === 'table') {
        for (const row of b.rows) for (const cell of row) if (cell.editable) total++
      }
    }
  }
  for (const section of sections) walk(section.blocks)
  return total
}

/**
 * Rebuilds the worksheet as markdown with the reader's answers filled into the blanks,
 * so practice work leaves the browser in the same shape it arrived in.
 */
function downloadMarkdown(scenario: Scenario, answers: Answers, scores: Scores): void {
  const lines: string[] = [`# ${scenario.title} — my answers`, '']

  for (const section of scenario.sections) {
    lines.push(`## ${section.index}. ${section.title}`, '')
    for (const block of section.blocks) {
      if (block.kind === 'prose') lines.push(htmlToText(block.html), '')
      if (block.kind === 'subheading') lines.push(`### ${block.text}`, '')
      if (block.kind === 'list') {
        for (const item of block.items) {
          if (item.kind === 'text') lines.push(`- ${htmlToText(item.html)}`)
          if (item.kind === 'input') lines.push(`- ${answers[item.id] ?? ''}`)
          if (item.kind === 'field')
            lines.push(`- ${item.label}: ${answers[item.id] ?? ''}`)
        }
        lines.push('')
      }
      if (block.kind === 'table') {
        lines.push(`| ${block.headers.join(' | ')} |`)
        lines.push(`|${block.headers.map(() => '---').join('|')}|`)
        for (const row of block.rows) {
          const cells = row.map((cell) =>
            cell.editable ? (answers[cell.id] ?? '').replace(/\n/g, ' ') : htmlToText(cell.text),
          )
          lines.push(`| ${cells.join(' | ')} |`)
        }
        lines.push('')
      }
      if (block.kind === 'scorecard') {
        lines.push('| Area | My score |', '|---|---|')
        for (const row of block.rows) {
          lines.push(`| ${row.area} | ${scores[row.id] ?? '—'} |`)
        }
        lines.push('')
      }
    }
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${scenario.ref.slug}-my-answers.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/g, ' ')
    .replace(/<\/p>\s*<p>/g, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}
