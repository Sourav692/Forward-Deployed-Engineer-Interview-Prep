/**
 * Personas (blueprint §8), the seven learning paths plus two company variants (§12),
 * and the ten-question path diagnostic.
 *
 * Paths are written the way the blueprint states them ("T2–T5", "T4.1–T4.5") and
 * expanded into per-module flags here, so the table stays readable and every flag
 * still points at a real module id.
 */
import type { ModuleFlag, Path, Persona } from '../types'
import { MODULES } from './curriculum'

export const PERSONAS: Persona[] = [
  {
    id: 'swe',
    title: 'Software engineer moving into AI',
    startingPoint: 'Strong backend, little ML or LLM experience',
    painPoint: 'Doesn’t know what to learn first; framework churn',
    needs: 'T2–T4 fundamentals, then the design method',
    defaultPathId: 'experienced-swe',
  },
  {
    id: 'data-engineer',
    title: 'Data engineer moving into applied AI',
    startingPoint: 'Pipelines, SQL, Spark and governance',
    painPoint: 'Knows data, not agents or evaluation',
    needs: 'Retrieval, agents and evaluation; can skip ingestion basics',
    defaultPathId: 'data-engineer',
  },
  {
    id: 'ml-engineer',
    title: 'ML engineer moving to production',
    startingPoint: 'Models and training, weaker on systems and customers',
    painPoint: 'Can’t frame business trade-offs; thin on serving at scale',
    needs: 'T4.8 serving, T5 design and T6 customer framing',
    defaultPathId: 'ml-engineer',
  },
  {
    id: 'architect',
    title: 'Solution architect or consultant',
    startingPoint: 'Customer-facing, broad architecture experience',
    painPoint: 'Less hands-on depth; needs credibility in AI specifics',
    needs: 'T2–T4 depth, T6 delivery and projects for proof',
    defaultPathId: 'architect',
  },
  {
    id: 'fde-candidate',
    title: 'Forward Deployed Engineer candidate',
    startingPoint: 'Mixed background, interview in two to eight weeks',
    painPoint: 'Unknown format; needs mocks and company specifics',
    needs: 'Practice, mocks, company loops and a readiness score',
    defaultPathId: 'fde',
  },
  {
    id: 'senior',
    title: 'Senior or staff candidate',
    startingPoint: 'Deep experience, rusty interview skills',
    painPoint: 'Answers run long; no structure; stories untold',
    needs: 'Design method, behavioural practice and timed mocks',
    defaultPathId: 'fde',
  },
  {
    id: 'revision',
    title: 'Revision-only learner',
    startingPoint: 'Already studied; interview this week',
    painPoint: 'Needs fast, targeted recall',
    needs: 'Final week, cheat sheets and the revision queue',
    defaultPathId: 'revision',
  },
]

/** Expands blueprint shorthand: 'T2', 'T2–T5', 'T4.1–T4.5', 'T6.1'. */
function expand(spec: string): string[] {
  const range = spec.match(/^T(\d)\.(\d)\s*–\s*T\d\.(\d)$/)
  if (range) {
    const ids: string[] = []
    for (let i = Number(range[2]); i <= Number(range[3]); i++) ids.push(`t${range[1]}-${i}`)
    return ids
  }
  const trackRange = spec.match(/^T(\d)\s*–\s*T(\d)$/)
  if (trackRange) {
    const from = Number(trackRange[1])
    const to = Number(trackRange[2])
    return MODULES.filter((m) => {
      const t = Number(m.trackId.slice(1))
      return t >= from && t <= to
    }).map((m) => m.id)
  }
  if (/^T\d\.\d$/.test(spec)) return [`t${spec[1]}-${spec[3]}`]
  if (/^T\d$/.test(spec)) return MODULES.filter((m) => m.trackId === spec.toLowerCase()).map((m) => m.id)
  throw new Error(`Unknown path spec: ${spec}`)
}

function flags(
  fallback: ModuleFlag,
  spec: { optional?: string[]; recommended?: string[]; required?: string[] },
): Record<string, ModuleFlag> {
  const out: Record<string, ModuleFlag> = {}
  for (const m of MODULES) out[m.id] = fallback
  for (const level of ['optional', 'recommended', 'required'] as const) {
    for (const s of spec[level] ?? []) for (const id of expand(s)) out[id] = level
  }
  return out
}

function hours(moduleFlags: Record<string, ModuleFlag>): number {
  const minutes = MODULES.filter((m) => moduleFlags[m.id] !== 'optional').reduce(
    (sum, m) => sum + m.estMinutes,
    0,
  )
  return Math.round(minutes / 60)
}

function path(p: Omit<Path, 'estHours'>): Path {
  return { ...p, estHours: hours(p.moduleFlags) }
}

const FDE_FLAGS = flags('recommended', { optional: ['T1', 'T9'], required: ['T0', 'T2–T8'] })

export const PATHS: Path[] = [
  path({
    id: 'beginner',
    title: 'Beginner',
    persona: 'swe',
    summary: 'Programming basics to a working RAG prototype and a structured design answer.',
    sequence: ['T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T7'],
    moduleFlags: flags('recommended', {
      optional: ['T6', 'T4.6–T4.8', 'T9', 'T8'],
      required: ['T0', 'T1', 'T2', 'T3', 'T4.1–T4.5', 'T5.1–T5.4', 'T7.1', 'T7.2'],
    }),
    skipCriteria: 'None: every module has a checkpoint.',
    requiredProjectIds: ['p1', 'p2', 'p3'],
    requiredMockIds: [],
    readinessCriteria: 'Not interview-targeted; aim for P4 and Interview readiness ≥ 60.',
  }),
  path({
    id: 'experienced-swe',
    title: 'Experienced SWE',
    persona: 'swe',
    summary: 'Skip the engineering basics; go deep on LLM systems, design and delivery.',
    sequence: ['T0', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'],
    moduleFlags: flags('recommended', {
      optional: ['T1', 'T4.8', 'T9'],
      required: ['T0', 'T2–T5', 'T6.1–T6.3', 'T7', 'T8'],
    }),
    skipCriteria: 'T1 by diagnostic; T2.5 if you already use LangGraph.',
    requiredProjectIds: ['p2', 'p4', 'p5'],
    requiredMockIds: ['mock-a', 'mock-c'],
    readinessCriteria: 'Interview readiness ≥ 75 and Mocks A and C passed.',
  }),
  path({
    id: 'data-engineer',
    title: 'Data engineer',
    persona: 'data-engineer',
    summary: 'Start at retrieval; your pipeline experience covers ingestion basics.',
    sequence: ['T0', 'T2.4', 'T3', 'T4', 'T5', 'T7', 'T8'],
    moduleFlags: flags('recommended', {
      optional: ['T1', 'T6', 'T9', 'T2.3'],
      required: ['T0', 'T2.1', 'T2.2', 'T2.4', 'T2.5', 'T2.6', 'T3', 'T4', 'T5', 'T7', 'T8'],
    }),
    skipCriteria: 'T1.3, T1.5 and T2.3 by checkpoint.',
    requiredProjectIds: ['p2', 'p4', 'p5'],
    requiredMockIds: ['mock-a'],
    readinessCriteria: 'Interview readiness ≥ 75 and Mock A passed.',
  }),
  path({
    id: 'ml-engineer',
    title: 'ML engineer',
    persona: 'ml-engineer',
    summary: 'From models to production systems and customer framing.',
    sequence: ['T0', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'],
    moduleFlags: flags('recommended', {
      optional: ['T1', 'T2', 'T9'],
      required: ['T0', 'T3', 'T4', 'T5', 'T6.1', 'T6.2', 'T7', 'T8'],
    }),
    skipCriteria: 'T2 and T2.6 by checkpoint.',
    requiredProjectIds: ['p3', 'p4', 'p5'],
    requiredMockIds: ['mock-a', 'mock-c'],
    readinessCriteria: 'Interview readiness ≥ 75 and Mocks A and C passed.',
  }),
  path({
    id: 'architect',
    title: 'Architect or consultant',
    persona: 'architect',
    summary: 'Hands-on AI depth plus delivery, with projects as proof.',
    sequence: ['T0', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T9'],
    moduleFlags: flags('recommended', {
      optional: ['T1', 'T4.8', 'T8.6', 'T9.1'],
      required: ['T0', 'T2–T6', 'T7', 'T9.2'],
    }),
    skipCriteria: 'T5.1 by a worksheet score ≥ 3.',
    requiredProjectIds: ['p2', 'p5', 'p6'],
    requiredMockIds: ['mock-d'],
    readinessCriteria: 'Portfolio readiness ≥ 70 and Mock D passed.',
  }),
  path({
    id: 'fde',
    title: 'Forward Deployed Engineer',
    persona: 'fde-candidate',
    summary: 'The full core: systems, design, delivery, stories and mocks.',
    sequence: ['T0', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'],
    moduleFlags: FDE_FLAGS,
    skipCriteria: 'Any module by a checkpoint score ≥ 85%.',
    requiredProjectIds: ['p2', 'p4', 'p5', 'p6', 'p7', 'p8'],
    requiredMockIds: ['mock-a', 'mock-b', 'mock-c', 'mock-d'],
    readinessCriteria: 'Interview readiness ≥ 75 and Mocks A–D passed.',
  }),
  path({
    id: 'revision',
    title: 'Revision',
    persona: 'revision',
    summary: 'Interview this week: the opening routine, design method and final-week drills.',
    sequence: ['T0.3', 'T8.4', 'T8.2', 'T8.3'],
    moduleFlags: flags('optional', { required: ['T0.3', 'T5.1', 'T5.2', 'T8'] }),
    skipCriteria: 'Everything with confidence ≥ 4.',
    requiredProjectIds: ['p8'],
    requiredMockIds: ['mock-a', 'mock-e'],
    readinessCriteria: 'Confidence ≥ 3 on every queued review and two mocks passed.',
  }),
  path({
    id: 'fde-openai-anthropic',
    title: 'FDE: OpenAI / Anthropic variant',
    persona: 'fde-candidate',
    summary: 'The FDE path plus company loops and refactor-under-tests coding in the final two weeks.',
    sequence: ['T0', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T8.5', 'T8.6'],
    moduleFlags: { ...FDE_FLAGS, 't4-8': 'optional', 't8-5': 'required', 't8-6': 'required', 't1-1': 'recommended' },
    skipCriteria: 'As the FDE path.',
    requiredProjectIds: ['p2', 'p4', 'p5', 'p6', 'p7', 'p8'],
    requiredMockIds: ['mock-a', 'mock-b', 'mock-c', 'mock-d'],
    readinessCriteria: 'FDE criteria plus a take-home rehearsal.',
    companyVariantOf: 'fde',
  }),
  path({
    id: 'fde-google',
    title: 'FDE: Google variant',
    persona: 'fde-candidate',
    summary: 'The FDE path plus text-to-SQL, A2A and timed DSA sets from week one.',
    sequence: ['T0', 'T1.6', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'],
    moduleFlags: { ...FDE_FLAGS, 't1-6': 'required', 't1-3': 'recommended', 't3-2': 'required' },
    skipCriteria: 'As the FDE path.',
    requiredProjectIds: ['p2', 'p4', 'p5', 'p6', 'p7', 'p8', 'p10'],
    requiredMockIds: ['mock-a', 'mock-b', 'mock-c', 'mock-d'],
    readinessCriteria: 'FDE criteria plus DSA timed sets ≥ 70%.',
    companyVariantOf: 'fde',
  }),
]

export interface DiagnosticOption {
  label: string
  weights: Partial<Record<string, number>>
}

export interface DiagnosticQuestion {
  id: string
  prompt: string
  options: DiagnosticOption[]
}

/** Each answer adds weight to one or more base paths; the highest total wins. */
export const DIAGNOSTIC: DiagnosticQuestion[] = [
  {
    id: 'd1',
    prompt: 'How much professional software engineering have you done?',
    options: [
      { label: 'Under a year', weights: { beginner: 3 } },
      { label: '1–3 years', weights: { beginner: 1, 'data-engineer': 1, 'ml-engineer': 1 } },
      { label: '3+ years building backend services', weights: { 'experienced-swe': 2, fde: 1 } },
      { label: '3+ years, mostly architecture or consulting', weights: { architect: 3 } },
    ],
  },
  {
    id: 'd2',
    prompt: 'What does most of your current work look like?',
    options: [
      { label: 'APIs and product features', weights: { 'experienced-swe': 2 } },
      { label: 'Pipelines, SQL and data platforms', weights: { 'data-engineer': 3 } },
      { label: 'Training and evaluating models', weights: { 'ml-engineer': 3 } },
      { label: 'Customer workshops and solution designs', weights: { architect: 2, fde: 1 } },
    ],
  },
  {
    id: 'd3',
    prompt: 'Have you shipped an LLM feature to real users?',
    options: [
      { label: 'No', weights: { beginner: 1, 'experienced-swe': 1 } },
      { label: 'A prototype or internal demo', weights: { 'experienced-swe': 1, 'data-engineer': 1 } },
      { label: 'Yes, in production', weights: { fde: 2, revision: 1 } },
    ],
  },
  {
    id: 'd4',
    prompt: 'When is your next interview?',
    options: [
      { label: 'No date yet', weights: { beginner: 1, architect: 1 } },
      { label: 'Within two months', weights: { fde: 2, 'experienced-swe': 1 } },
      { label: 'Within two weeks', weights: { fde: 1, revision: 2 } },
      { label: 'This week', weights: { revision: 4 } },
    ],
  },
  {
    id: 'd5',
    prompt: 'Which role are you targeting?',
    options: [
      { label: 'Forward Deployed Engineer', weights: { fde: 3 } },
      { label: 'Applied AI or AI engineer', weights: { 'experienced-swe': 2, 'ml-engineer': 1 } },
      { label: 'AI solutions architect', weights: { architect: 3 } },
      { label: 'Not decided', weights: { beginner: 2 } },
    ],
  },
  {
    id: 'd6',
    prompt: 'How comfortable are you explaining chunking and hybrid retrieval?',
    options: [
      { label: 'Not yet', weights: { beginner: 2, 'ml-engineer': 1 } },
      { label: 'I know the words', weights: { 'experienced-swe': 1, 'data-engineer': 1 } },
      { label: 'I could teach it', weights: { revision: 2, fde: 1 } },
    ],
  },
  {
    id: 'd7',
    prompt: 'How often do you talk directly to customers or business stakeholders?',
    options: [
      { label: 'Rarely', weights: { 'experienced-swe': 1, 'ml-engineer': 1 } },
      { label: 'Monthly', weights: { 'data-engineer': 1, fde: 1 } },
      { label: 'Weekly or more', weights: { architect: 2, fde: 2 } },
    ],
  },
  {
    id: 'd8',
    prompt: 'Could you run a 45-minute AI system-design round today?',
    options: [
      { label: 'No', weights: { beginner: 1, 'experienced-swe': 1 } },
      { label: 'With gaps', weights: { fde: 2 } },
      { label: 'Yes, I need timed practice', weights: { revision: 3 } },
    ],
  },
  {
    id: 'd9',
    prompt: 'Do you have 8–12 interview stories ready?',
    options: [
      { label: 'None written down', weights: { fde: 1, beginner: 1 } },
      { label: 'A few', weights: { fde: 1, 'experienced-swe': 1 } },
      { label: 'Yes, rehearsed', weights: { revision: 2 } },
    ],
  },
  {
    id: 'd10',
    prompt: 'How many hours a week can you study?',
    options: [
      { label: 'Under 4', weights: { revision: 1 } },
      { label: '4–8', weights: { fde: 1, 'experienced-swe': 1 } },
      { label: '8+', weights: { beginner: 1, architect: 1, fde: 1 } },
    ],
  },
]
