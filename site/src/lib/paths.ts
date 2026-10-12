/**
 * Learning paths and the path diagnostic (plan §9 Path entity; tasks UX-05, FE-10).
 *
 * Pure data plus one pure function, `scoreDiagnostic`. Type-only imports, so the
 * self-check `scripts/check-paths.ts` runs it under plain `node`, and both Server and
 * Client Components can import it.
 *
 * OWNER REVIEW: the diagnostic questions, answer labels, weights and path copy below
 * are product copy awaiting owner review (plan assumption A2, task PM-04). They are
 * listed for review in `.website_spec/2026-10-05-learn-ux.md` ("Path diagnostic"). Change the
 * copy there and here together.
 *
 * Module flags are keyed by curriculum module slug. Slugs never change; display codes
 * may, so nothing here depends on codes. `check:paths` fails if a slug is unknown, if
 * a path leaves a module unflagged, if a module with no lessons yet is required,
 * recommended or optional, or if `estHours` drifts from the flagged modules' minutes.
 */
import type { PathChoice } from './progress/types'

export type ModuleFlag = 'required' | 'recommended' | 'optional' | 'later' | 'skip'

export const FLAG_ORDER: readonly ModuleFlag[] = ['required', 'recommended', 'optional', 'later', 'skip']

export const FLAG_LABEL: Record<ModuleFlag, string> = {
  required: 'Required',
  recommended: 'Recommended',
  optional: 'Optional',
  later: 'Later',
  skip: 'Skip',
}

/** What each flag means, for legends and screen-reader text. */
export const FLAG_HELP: Record<ModuleFlag, string> = {
  required: 'Study this module; the path assumes it.',
  recommended: 'Study it if you have time; it strengthens the core.',
  optional: 'Fill a gap only if you need it.',
  later: 'Part of this path once it is written; it has no lessons yet.',
  skip: 'Not part of this path.',
}

export type Persona = {
  id: string
  title: string
  startingPoint: string
  needs: string
  pathId: string
}

export type LearningPath = {
  /** Stable id used in URLs and `fd:v1:path`. Never change it. */
  id: string
  title: string
  /** Persona id. */
  persona: string
  summary: string
  /** Base path id when this is a company-loop variant. */
  variantOf?: string
  /** Module slug → flag, covering every curriculum module. */
  moduleFlags: Record<string, ModuleFlag>
  /** Hours for the required and recommended modules (checked by `check:paths`). */
  estHours: number
  /** When a module may be skipped on this path. */
  skipCriteria: string
  /** What "ready" means at the end of this path. */
  readinessCriteria: string[]
  /** The module "Start first module" opens. Must be required and published. */
  startModule: string
}

// ── Module table ───────────────────────────────────────────────────────────
// Track slug → module slugs in curriculum order. A mirror of `curriculum.ts`, kept
// here so this file stays free of runtime imports; `check:paths` proves it matches.

export const TRACK_MODULES: Record<string, readonly string[]> = {
  orientation: ['how-the-platform-works', 'the-fde-role', 'first-ten-minutes'],
  'engineering-foundations': [
    'python-for-ai-services',
    'apis-and-backend',
    'cloud-containers-deployment',
    'sql-and-data-modelling',
    'distributed-systems-essentials',
    'coding-interview-patterns',
  ],
  'llm-and-retrieval': [
    'how-llms-behave',
    'ml-fundamentals',
    'rag-from-first-principles',
    'chunking-and-indexing',
    'retrieval-hybrid-rerank',
    'langchain-and-langgraph',
  ],
  'agentic-systems': [
    'the-tool-calling-loop',
    'tool-design-mcp-a2a',
    'context-engineering',
    'memory-and-state',
    'robust-agents',
    'multi-agent-systems',
    'agentic-workflow-platforms',
  ],
  'production-ai': [
    'enterprise-rag-in-production',
    'evaluation-and-release-gates',
    'security-tenancy-prompt-injection',
    'observability-and-diagnosis',
    'cost-and-latency',
    'scaling-and-reliability',
    'agentops',
    'model-adaptation-and-serving',
  ],
  'ai-systems-design': [
    'design-framework',
    'sixty-minute-whiteboard',
    'architecture-patterns',
    'classic-ai-designs',
    'scenario-library',
  ],
  'forward-deployed': [
    'customer-discovery',
    'scoping-an-fde-project',
    'judgement-cases',
    'delivery-stages-and-gates',
    'adoption-and-impact',
    'debugging-customer-environment',
  ],
  'communication-and-behavioural': [
    'telling-the-build-story',
    'building-the-story-bank',
  ],
  'interview-practice': ['case-study-worksheets', 'mock-interviews', 'final-week', 'company-loops', 'coding-round-practice'],
  'capstone-and-portfolio': ['capstone-build', 'portfolio-write-up'],
}

/**
 * Modules with no lessons yet: coming soon or on hold (`check:paths` keeps this list in
 * step with curriculum.ts). A path never asks for one: a module the path would include
 * is flagged `later`, and one it leaves out stays `skip` (audit check ON-05).
 */
export const GAP_MODULES: readonly string[] = [
  'python-for-ai-services',
  'sql-and-data-modelling',
  'coding-interview-patterns',
  'ml-fundamentals',
  'company-loops',
  'coding-round-practice',
]

const ALL_MODULES = Object.values(TRACK_MODULES).flat()

/** A track slug expands to its modules; anything else is a module slug. */
const expand = (item: string): readonly string[] => TRACK_MODULES[item] ?? [item]

type FlagSpec = Partial<Record<ModuleFlag, string[]>>

/**
 * Builds a full flag map. Layers apply in the order required, recommended, optional,
 * skip, so a later layer narrows an earlier one ("all of production AI is required,
 * except serving, which is optional"). A gap module the path would include becomes
 * `later`; one the path skips stays skipped.
 */
function flags(fallback: ModuleFlag, spec: FlagSpec): Record<string, ModuleFlag> {
  const out: Record<string, ModuleFlag> = {}
  for (const slug of ALL_MODULES) out[slug] = fallback
  for (const level of FLAG_ORDER) for (const item of spec[level] ?? []) for (const slug of expand(item)) out[slug] = level
  for (const slug of GAP_MODULES) if (out[slug] !== 'skip') out[slug] = 'later'
  return out
}

// ── Personas (plan §3) ─────────────────────────────────────────────────────

export const PERSONAS: Persona[] = [
  {
    id: 'beginner',
    title: 'Beginner',
    startingPoint: 'Some programming, little production or AI experience',
    needs: 'Engineering foundations, then LLM systems step by step',
    pathId: 'beginner',
  },
  {
    id: 'experienced-swe',
    title: 'Experienced software engineer moving into AI',
    startingPoint: 'Strong backend, little ML or LLM experience',
    needs: 'LLM systems, agents and the design method, without the basics',
    pathId: 'experienced-swe',
  },
  {
    id: 'data-engineer',
    title: 'Data engineer',
    startingPoint: 'Pipelines, SQL, Spark and governance',
    needs: 'Retrieval, agents and evaluation; ingestion basics you already know',
    pathId: 'data-engineer',
  },
  {
    id: 'ml-engineer',
    title: 'ML engineer going to production',
    startingPoint: 'Models and training, weaker on systems and customers',
    needs: 'Agents, production operations, design and customer framing',
    pathId: 'ml-engineer',
  },
  {
    id: 'architect',
    title: 'Architect or consultant',
    startingPoint: 'Customer-facing, broad architecture experience',
    needs: 'Hands-on AI depth, delivery and a portfolio as proof',
    pathId: 'architect',
  },
  {
    id: 'fde-candidate',
    title: 'Forward Deployed Engineer candidate',
    startingPoint: 'Mixed background, interview in two to eight weeks',
    needs: 'The full core: systems, design, delivery, stories and mocks',
    pathId: 'fde',
  },
  {
    id: 'revision',
    title: 'Revision-only candidate',
    startingPoint: 'Already studied; interview this week',
    needs: 'The opening routine, the design method and final-week drills',
    pathId: 'revision',
  },
]

// ── Paths ──────────────────────────────────────────────────────────────────

const FDE_FLAGS = flags('recommended', {
  required: [
    'orientation',
    'llm-and-retrieval',
    'agentic-systems',
    'production-ai',
    'ai-systems-design',
    'forward-deployed',
    'communication-and-behavioural',
    'interview-practice',
  ],
  optional: ['engineering-foundations', 'capstone-and-portfolio'],
})

const FDE_READINESS = [
  'Every required module completed: lessons read and confidence rated 3 or more.',
  'Two full technical worksheets answered inside 45 minutes each.',
  'Four timed mock interviews scored on the rubric, with no dimension below 3.',
  'Eight to twelve stories in your story bank, each told aloud in under three minutes.',
]

export const PATHS: LearningPath[] = [
  {
    id: 'beginner',
    title: 'Beginner',
    persona: 'beginner',
    summary: 'From engineering foundations to a working retrieval prototype and a structured design answer.',
    moduleFlags: flags('recommended', {
      required: [
        'orientation',
        'engineering-foundations',
        'llm-and-retrieval',
        'agentic-systems',
        'enterprise-rag-in-production',
        'evaluation-and-release-gates',
        'security-tenancy-prompt-injection',
        'observability-and-diagnosis',
        'cost-and-latency',
        'design-framework',
        'sixty-minute-whiteboard',
        'architecture-patterns',
        'classic-ai-designs',
        'telling-the-build-story',
        'building-the-story-bank',
      ],
      optional: [
        'forward-deployed',
        'scaling-and-reliability',
        'agentops',
        'model-adaptation-and-serving',
        'interview-practice',
        'capstone-and-portfolio',
      ],
    }),
    estHours: 118,
    skipCriteria: 'None. Each module builds on the one before, so work through them in order.',
    readinessCriteria: [
      'Every required module completed: lessons read and confidence rated 3 or more.',
      'One case-study worksheet answered end to end, untimed.',
      'Ready to move on to the Experienced software engineer or Forward Deployed Engineer path.',
    ],
    startModule: 'how-the-platform-works',
  },
  {
    id: 'experienced-swe',
    title: 'Experienced Software Engineer',
    persona: 'experienced-swe',
    summary: 'Skip the engineering basics and go deep on LLM systems, agents, design and delivery.',
    moduleFlags: flags('recommended', {
      required: [
        'orientation',
        'llm-and-retrieval',
        'agentic-systems',
        'production-ai',
        'ai-systems-design',
        'customer-discovery',
        'scoping-an-fde-project',
        'delivery-stages-and-gates',
        'communication-and-behavioural',
        'interview-practice',
      ],
      optional: ['engineering-foundations', 'model-adaptation-and-serving', 'capstone-and-portfolio'],
    }),
    estHours: 164,
    skipCriteria:
      'Engineering foundations if you already ship backend services. Frameworks: LangChain and LangGraph if you use them at work.',
    readinessCriteria: [
      'Every required module completed: lessons read and confidence rated 3 or more.',
      'Two technical worksheets answered inside 45 minutes each.',
      'Two timed mock interviews scored on the rubric, with no dimension below 3.',
    ],
    startModule: 'how-the-platform-works',
  },
  {
    id: 'data-engineer',
    title: 'Data Engineer',
    persona: 'data-engineer',
    summary: 'Start at retrieval: your pipeline experience already covers the ingestion basics.',
    moduleFlags: flags('recommended', {
      required: [
        'orientation',
        'how-llms-behave',
        'ml-fundamentals',
        'rag-from-first-principles',
        'retrieval-hybrid-rerank',
        'langchain-and-langgraph',
        'agentic-systems',
        'production-ai',
        'ai-systems-design',
        'communication-and-behavioural',
        'interview-practice',
      ],
      optional: ['engineering-foundations', 'chunking-and-indexing', 'forward-deployed', 'capstone-and-portfolio'],
    }),
    estHours: 147,
    skipCriteria:
      'SQL and data modelling, Distributed systems essentials, and Chunking and indexing, once you can explain them without notes.',
    readinessCriteria: [
      'Every required module completed: lessons read and confidence rated 3 or more.',
      'Two technical worksheets answered inside 45 minutes each.',
      'One timed mock interview scored on the rubric, with no dimension below 3.',
    ],
    startModule: 'how-the-platform-works',
  },
  {
    id: 'ml-engineer',
    title: 'ML Engineer',
    persona: 'ml-engineer',
    summary: 'From models to production systems, and to framing trade-offs for customers.',
    moduleFlags: flags('recommended', {
      required: [
        'orientation',
        'agentic-systems',
        'production-ai',
        'ai-systems-design',
        'customer-discovery',
        'scoping-an-fde-project',
        'communication-and-behavioural',
        'interview-practice',
      ],
      optional: ['engineering-foundations', 'llm-and-retrieval', 'capstone-and-portfolio'],
    }),
    estHours: 154,
    skipCriteria: 'The LLM and retrieval track, including ML fundamentals, once you can explain each module without notes.',
    readinessCriteria: [
      'Every required module completed: lessons read and confidence rated 3 or more.',
      'Two technical worksheets answered inside 45 minutes each.',
      'Two timed mock interviews scored on the rubric, with no dimension below 3.',
    ],
    startModule: 'how-the-platform-works',
  },
  {
    id: 'architect',
    title: 'Architect or Consultant',
    persona: 'architect',
    summary: 'Hands-on AI depth plus delivery, with a portfolio write-up as proof.',
    moduleFlags: flags('recommended', {
      required: [
        'orientation',
        'llm-and-retrieval',
        'agentic-systems',
        'production-ai',
        'ai-systems-design',
        'forward-deployed',
        'communication-and-behavioural',
        'portfolio-write-up',
      ],
      optional: ['engineering-foundations', 'model-adaptation-and-serving', 'capstone-build'],
    }),
    estHours: 169,
    skipCriteria: 'The design framework, if you already score 3 or more on a case-study worksheet.',
    readinessCriteria: [
      'Every required module completed: lessons read and confidence rated 3 or more.',
      'A portfolio write-up you can present in ten minutes.',
      'One timed mock interview scored on the rubric, with no dimension below 3.',
    ],
    startModule: 'how-the-platform-works',
  },
  {
    id: 'fde',
    title: 'Forward Deployed Engineer',
    persona: 'fde-candidate',
    summary: 'The full core: systems, design, delivery, stories and mock interviews.',
    moduleFlags: FDE_FLAGS,
    estHours: 169,
    skipCriteria: 'Any module you can explain without notes and rate 4 or more for confidence.',
    readinessCriteria: FDE_READINESS,
    startModule: 'how-the-platform-works',
  },
  {
    id: 'revision',
    title: 'Revision',
    persona: 'revision',
    summary: 'Interview this week: the opening routine, the design method and final-week drills.',
    moduleFlags: flags('optional', {
      required: ['first-ten-minutes', 'design-framework', 'sixty-minute-whiteboard', 'interview-practice'],
      skip: ['engineering-foundations', 'capstone-and-portfolio'],
    }),
    estHours: 41,
    skipCriteria: 'Everything you already rate 4 or more for confidence.',
    readinessCriteria: [
      'The first ten minutes of a design question run from memory.',
      'Confidence 3 or more on every module in the final-week list.',
      'Two timed mock interviews scored on the rubric.',
    ],
    startModule: 'first-ten-minutes',
  },
  {
    // Grounded in 08_Company_Specific_Prep/OpenAI_Anthropic_Pack/INTERVIEW_CENTRIC_GUIDE.md:
    // the loop map runs a coding round and then a build or take-home, about 5 hours on
    // model APIs with a recorded video walkthrough, or a 3 to 4 hour build against a brief.
    // A Big-Tech Loop variant was removed on 5 October 2026: no repository pack backs it,
    // and the modules it leaned on (T1.3, T1.6) are Coming soon.
    id: 'fde-frontier-lab',
    title: 'Forward Deployed Engineer: Frontier Lab Loop',
    persona: 'fde-candidate',
    variantOf: 'fde',
    summary:
      'The Forward Deployed Engineer path for loops with a coding round and a take-home build of 3 to 5 hours, with customer delivery and evaluation required.',
    moduleFlags: {
      ...FDE_FLAGS,
      // T6 Forward Deployed Engineering and T4.2 Evaluation and release gates.
      'customer-discovery': 'required',
      'scoping-an-fde-project': 'required',
      'judgement-cases': 'required',
      'delivery-stages-and-gates': 'required',
      'adoption-and-impact': 'required',
      'debugging-customer-environment': 'required',
      'evaluation-and-release-gates': 'required',
      // The take-home is a small working service with tests.
      'apis-and-backend': 'recommended',
      'capstone-build': 'recommended',
      'model-adaptation-and-serving': 'optional',
    },
    estHours: 199,
    skipCriteria: 'As the Forward Deployed Engineer path.',
    readinessCriteria: [
      ...FDE_READINESS,
      'One take-home rehearsed against the clock: a 3 to 5 hour build against a written brief using model APIs, with tests and a recorded walkthrough of the design and its trade-offs.',
    ],
    startModule: 'how-the-platform-works',
  },
]

export const BASE_PATHS = PATHS.filter((p) => !p.variantOf)

export const getPathById = (id: string): LearningPath | undefined => PATHS.find((p) => p.id === id)

export const pathVariants = (id: string): LearningPath[] => PATHS.filter((p) => p.variantOf === id)

export const personaFor = (path: LearningPath): Persona | undefined => PERSONAS.find((p) => p.id === path.persona)

/** The stored choice for a path: variants are saved as `{ pathId: base, variant: id }`. */
export function choiceFor(path: LearningPath, weeklyHours: number): Omit<PathChoice, 'chosenAt'> {
  return path.variantOf ? { pathId: path.variantOf, variant: path.id, weeklyHours } : { pathId: path.id, weeklyHours }
}

/** The path a stored choice points at, or undefined when the id is unknown. */
export function resolveChoice(choice: Pick<PathChoice, 'pathId' | 'variant'> | null | undefined): LearningPath | undefined {
  if (!choice) return undefined
  return (choice.variant && getPathById(choice.variant)) || getPathById(choice.pathId)
}

// ── Diagnostic ─────────────────────────────────────────────────────────────

export type DiagnosticOption = {
  label: string
  /** Base path id → points added when this answer is chosen. */
  weights: Partial<Record<string, number>>
  /** Module slugs this answer suggests the learner may be able to skip. */
  canSkip?: string[]
  /** Weekly study hours implied by this answer (question d10 only). */
  weeklyHours?: number
}

export type DiagnosticQuestion = {
  id: string
  prompt: string
  options: DiagnosticOption[]
}

/** Ten questions. Each answer adds weight to one or more base paths; the highest total wins. */
export const DIAGNOSTIC: DiagnosticQuestion[] = [
  {
    id: 'd1',
    prompt: 'How much professional software engineering have you done?',
    options: [
      { label: 'Under a year', weights: { beginner: 3 } },
      { label: 'One to three years', weights: { beginner: 1, 'data-engineer': 1, 'ml-engineer': 1 } },
      { label: 'More than three years, building backend services', weights: { 'experienced-swe': 2, fde: 1 }, canSkip: ['apis-and-backend'] },
      { label: 'More than three years, mostly architecture or consulting', weights: { architect: 3 } },
    ],
  },
  {
    id: 'd2',
    prompt: 'What does most of your current work look like?',
    options: [
      { label: 'APIs and product features', weights: { 'experienced-swe': 2 } },
      { label: 'Pipelines, SQL and data platforms', weights: { 'data-engineer': 3 }, canSkip: ['sql-and-data-modelling'] },
      { label: 'Training and evaluating models', weights: { 'ml-engineer': 3 }, canSkip: ['ml-fundamentals'] },
      { label: 'Customer workshops and solution designs', weights: { architect: 2, fde: 1 } },
    ],
  },
  {
    id: 'd3',
    prompt: 'Have you shipped an LLM feature to real users?',
    options: [
      { label: 'No', weights: { beginner: 1, 'experienced-swe': 1 } },
      { label: 'A prototype or internal demo', weights: { 'experienced-swe': 1, 'data-engineer': 1 } },
      { label: 'Yes, in production', weights: { fde: 2, revision: 1 }, canSkip: ['how-llms-behave'] },
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
    prompt: 'Which role are you aiming for?',
    options: [
      { label: 'Forward Deployed Engineer', weights: { fde: 3 } },
      { label: 'Applied AI or AI engineer', weights: { 'experienced-swe': 2, 'ml-engineer': 1 } },
      { label: 'AI solutions architect', weights: { architect: 3 } },
      { label: 'Not decided yet', weights: { beginner: 2 } },
    ],
  },
  {
    id: 'd6',
    prompt: 'How comfortable are you explaining chunking and hybrid retrieval?',
    options: [
      { label: 'Not yet', weights: { beginner: 2, 'ml-engineer': 1 } },
      { label: 'I know the words', weights: { 'experienced-swe': 1, 'data-engineer': 1 } },
      {
        label: 'I could teach it',
        weights: { revision: 2, fde: 1 },
        canSkip: ['rag-from-first-principles', 'chunking-and-indexing', 'retrieval-hybrid-rerank'],
      },
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
      { label: 'Yes, with gaps', weights: { fde: 2 } },
      { label: 'Yes; I need timed practice', weights: { revision: 3 }, canSkip: ['design-framework'] },
    ],
  },
  {
    id: 'd9',
    prompt: 'Do you have eight to twelve interview stories ready?',
    options: [
      { label: 'None written down', weights: { fde: 1, beginner: 1 } },
      { label: 'A few', weights: { fde: 1, 'experienced-swe': 1 } },
      { label: 'Yes, rehearsed aloud', weights: { revision: 2 }, canSkip: ['building-the-story-bank'] },
    ],
  },
  {
    id: 'd10',
    prompt: 'How many hours a week can you study?',
    options: [
      { label: 'Under four', weights: { revision: 1 }, weeklyHours: 3 },
      { label: 'Four to eight', weights: { fde: 1, 'experienced-swe': 1 }, weeklyHours: 6 },
      { label: 'More than eight', weights: { beginner: 1, architect: 1, fde: 1 }, weeklyHours: 10 },
    ],
  },
]

/** Weekly hours assumed when the learner picks a path without the diagnostic. */
export const DEFAULT_WEEKLY_HOURS = 6

/** Ties go to the earlier path in this list: the broader path is the safer default. */
const TIE_ORDER = ['fde', 'experienced-swe', 'data-engineer', 'ml-engineer', 'architect', 'beginner', 'revision']

export type DiagnosticResult = {
  pathId: string
  /** Base path id → total points. */
  scores: Record<string, number>
  /** The chosen answer labels that added most to the winning path, strongest first. */
  reasons: { prompt: string; answer: string }[]
  /** Module slugs the answers suggest may be skipped and flagged on the winning path. */
  canSkip: string[]
  weeklyHours: number
}

/**
 * Scores the diagnostic. `answers` maps question id to the chosen option index;
 * unanswered or out-of-range answers are ignored. Always returns a base path id.
 */
export function scoreDiagnostic(answers: Readonly<Record<string, number>>): DiagnosticResult {
  const scores: Record<string, number> = Object.fromEntries(TIE_ORDER.map((id) => [id, 0]))
  const chosen: { q: DiagnosticQuestion; o: DiagnosticOption }[] = []
  for (const q of DIAGNOSTIC) {
    const o = q.options[answers[q.id]]
    if (!o) continue
    chosen.push({ q, o })
    for (const [id, w] of Object.entries(o.weights)) if (id in scores) scores[id] += w ?? 0
  }
  let pathId = TIE_ORDER[0]
  for (const id of TIE_ORDER) if (scores[id] > scores[pathId]) pathId = id

  const reasons = chosen
    .map(({ q, o }) => ({ prompt: q.prompt, answer: o.label, w: o.weights[pathId] ?? 0 }))
    .filter((r) => r.w > 0)
    .sort((a, b) => b.w - a.w)
    .slice(0, 3)
    .map(({ prompt, answer }) => ({ prompt, answer }))

  const flagsOnPath = getPathById(pathId)?.moduleFlags ?? {}
  const canSkip = [...new Set(chosen.flatMap(({ o }) => o.canSkip ?? []))].filter(
    (slug) => flagsOnPath[slug] === 'required' || flagsOnPath[slug] === 'recommended',
  )
  const weeklyHours = chosen.find(({ o }) => o.weeklyHours)?.o.weeklyHours ?? DEFAULT_WEEKLY_HOURS

  return { pathId, scores, reasons, canSkip, weeklyHours }
}
