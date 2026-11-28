import { marked, type Token, type Tokens } from 'marked'
import { parseReading, type ReadingChunk } from './reading.ts'

/**
 * A track exercise page (`content/learn/<track>/exercise.md`), split into the parts the
 * exercise layout renders. The course README uses ten fixed `##` headings, in order (course
 * CLAUDE.md, "Exercise README format"); the RAG import and the course test enforce them, and
 * this parser throws on drift too, so a bad page fails the build instead of rendering wrong.
 */

export const EXERCISE_PARTS = [
  { id: 'problem', title: 'Problem statement', label: 'Context' },
  { id: 'objectives', title: 'What you will learn', label: 'Outcomes' },
  { id: 'setup', title: 'Before you start', label: 'Setup' },
  { id: 'workflow', title: 'Experiment workflow', label: 'Architecture' },
  { id: 'tasks', title: 'Implementation tasks', label: 'Build' },
  { id: 'results', title: 'Record results', label: 'Measure' },
  { id: 'done-when', title: 'Done when', label: 'Verify' },
  { id: 'mistakes', title: 'Common mistakes', label: 'Debug' },
  { id: 'interview', title: 'Interview angle', label: 'Transfer' },
  { id: 'solution', title: 'Worked solution', label: 'Review' },
] as const

export type Titled = { title: string; chunks: ReadingChunk[] }
export type RecordTable = {
  columns: string[]
  /** One row per Record results row: its label, then a cell per later column; null is a learner input. */
  rows: { label: string; cells: (string | null)[] }[]
}

export type Exercise = {
  problem: ReadingChunk[]
  objectives: ReadingChunk[]
  setup: Titled[]
  workflow: ReadingChunk[]
  tasks: (Titled & { number: string })[]
  record: RecordTable
  recordNotes: ReadingChunk[]
  /** Inline HTML, one per Done when item. */
  doneWhen: string[]
  mistakes: Titled[]
  interview: { question: string; answer: ReadingChunk[] }
  solution: { visible: ReadingChunk[]; hidden: ReadingChunk[] }
}

const raw = (tokens: Token[]) => tokens.map((t) => t.raw).join('')
const chunks = (tokens: Token[]) => parseReading(raw(tokens), 'exercise').sections.flatMap((s) => s.chunks)
const inline = (text: string) => marked.parseInline(text, { async: false }) as string

/** Splits tokens at headings of one depth: the lead-in, then a group per heading. */
function splitAt(tokens: Token[], depth: number): { lead: Token[]; groups: { title: string; body: Token[] }[] } {
  const lead: Token[] = []
  const groups: { title: string; body: Token[] }[] = []
  for (const t of tokens) {
    if (t.type === 'heading' && (t as Tokens.Heading).depth === depth) groups.push({ title: (t as Tokens.Heading).text, body: [] })
    else (groups.at(-1)?.body ?? lead).push(t)
  }
  return { lead, groups }
}

const titled = (body: Token[]): Titled[] => splitAt(body, 3).groups.map((g) => ({ title: g.title, chunks: chunks(g.body) }))

export function parseExercise(markdown: string, name: string): Exercise {
  const fail = (why: string): never => {
    throw new Error(`${name}: ${why}`)
  }
  const tokens = marked.lexer(markdown, { gfm: true }).filter((t) => !(t.type === 'heading' && (t as Tokens.Heading).depth === 1))
  const { groups } = splitAt(tokens, 2)
  const titles = groups.map((g) => g.title)
  if (titles.join('|') !== EXERCISE_PARTS.map((p) => p.title).join('|')) fail(`headings are ${titles.join(', ')}`)
  const body = Object.fromEntries(EXERCISE_PARTS.map((p, i) => [p.id, groups[i].body])) as Record<(typeof EXERCISE_PARTS)[number]['id'], Token[]>

  const tasks = splitAt(body.tasks, 3).groups.map((g) => {
    const m = g.title.match(/^(\d\d) (.+)$/) ?? fail(`task heading "${g.title}" is not "NN Title"`)
    return { number: m[1], title: m[2], chunks: chunks(g.body) }
  })

  const table = (body.results.find((t) => t.type === 'table') as Tokens.Table | undefined) ?? fail('Record results has no table')
  const record: RecordTable = {
    columns: table.header.map((c) => c.text),
    rows: table.rows.map(([label, ...cells]) => ({ label: label.text, cells: cells.map((c) => c.text.trim() || null) })),
  }

  const list = body['done-when'].find((t) => t.type === 'list') as Tokens.List | undefined
  const doneWhen = list?.items.map((i) => inline(i.text)) ?? []
  if (doneWhen.length < 3 || doneWhen.length > 5) fail(`Done when has ${doneWhen.length} items, wants 3 to 5`)

  const qAt = body.interview.findIndex((t) => t.type === 'paragraph' && /^".+\?"$/.test((t as Tokens.Paragraph).text.trim()))
  if (qAt === -1) fail('Interview angle has no question in quotes on its own line')
  const question = inline((body.interview[qAt] as Tokens.Paragraph).text.trim().slice(1, -1))

  const firstPara = body.solution.findIndex((t) => t.type === 'paragraph')
  if (firstPara === -1) fail('Worked solution has no opening paragraph')

  return {
    problem: chunks(body.problem),
    objectives: chunks(body.objectives),
    setup: titled(body.setup),
    workflow: chunks(body.workflow),
    tasks,
    record,
    recordNotes: chunks(body.results.filter((t) => t !== table)),
    doneWhen,
    mistakes: titled(body.mistakes),
    interview: { question, answer: chunks(body.interview.filter((_, i) => i !== qAt)) },
    solution: { visible: chunks(body.solution.slice(0, firstPara + 1)), hidden: chunks(body.solution.slice(firstPara + 1)) },
  }
}
