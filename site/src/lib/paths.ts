/**
 * Learning paths and the path diagnostic (plan §9 Path entity; tasks UX-05, FE-10).
 *
 * Pure data plus one pure function, `scoreDiagnostic`. Type-only imports, so the
 * self-check `scripts/check-paths.ts` runs it under plain `node`, and both Server and
 * Client Components can import it.
 *
 * OWNER REVIEW: the diagnostic questions, answer labels, weights and path copy below
 * are product copy awaiting owner review (plan assumption A2, task PM-04). They are
 * listed for review in `.website_spec/reference/2026-10-05-learn-ux.md` ("Path diagnostic"). Change the
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
  'ai-engineering-foundations': [
    'python-and-data-toolkit-refresher',
    'llm-provider-apis-and-model-selection',
    'hugging-face-models-and-gradio-demos',
  ],
  'prompt-and-context-engineering': ['prompt-engineering-patterns', 'multimodal-prompting'],
  'langchain-and-langgraph-fundamentals': [
    'langchain-core-models-prompts-and-parsers',
    'lcel-runnables-and-chains',
    'langchain-and-langgraph',
    'langgraph-runtime-persistence-hitl-and-streaming',
  ],
  'llm-and-retrieval': [
    'rag-from-first-principles',
    'document-ingestion-and-metadata-design',
    'chunking-and-indexing',
    'embeddings-and-model-selection',
    'vector-stores-and-index-operations',
    'advanced-indexing-strategies',
  ],
  'retrieval-quality-engineering': [
    'retrieval-hybrid-rerank',
    'query-transformation-and-routing',
    'post-retrieval-optimisation-and-reranking',
    'end-to-end-rag-systems',
    'multimodal-rag',
    'framework-fluency-llamaindex',
  ],
  'agentic-systems': [
    'the-agent-loop-and-tool-calling',
    'react-agents-and-langchain-create-agent',
    'agentic-workflow-patterns',
  ],
  'advanced-agents': [
    'planning-reflection-and-reasoning-patterns',
    'coding-computer-use-and-deep-agents',
    'human-approval-and-applied-single-agent-builds',
  ],
  'agentic-and-self-correcting-rag': [
    'agentic-rag-foundations-grading-and-query-rewriting',
    'self-correcting-rag-crag-and-self-rag',
    'adaptive-rag-and-query-routing',
    'rag-as-an-agent-tool',
    'reliability-feedback-loops-and-diversity',
  ],
  'memory-and-multi-agent-rag': [
    'conversation-memory-and-conversational-rag',
    'memory-and-state',
  ],
  'multi-agent-systems': [
    'multi-agent-architectures',
    'collaboration-control-and-parallel-agents',
    'multi-agent-applied-builds-and-deep-agents',
  ],
  'agent-protocols-mcp-and-a2a': [
    'mcp-foundations',
    'building-mcp-servers-and-clients',
    'mcp-applications-and-rag-over-mcp',
    'a2a-agent-to-agent-protocol',
  ],
  'hierarchical-memory-and-graph-rag': [
    'hierarchical-and-memory-augmented-retrieval',
    'knowledge-graphs-with-neo4j',
    'graphrag-techniques',
  ],
  'fine-tuning-and-model-adaptation': ['fine-tuning-fundamentals'],
  'architecture-synthesis-and-capstone': ['agentic-rag-architectures-choosing-a-design'],
  'production-ai': [
    'tool-design-mcp-a2a',
    'context-engineering',
    'robust-agents',
    'agentic-workflow-platforms',
    'enterprise-rag-in-production',
    'security-tenancy-prompt-injection',
    'evaluation-and-release-gates',
    'agentops',
    'observability-and-diagnosis',
    'cost-and-latency',
    'scaling-and-reliability',
    'model-adaptation-and-serving',
    // Production AI Engineering scaffold (PA01 to PA18): Coming soon, so also in GAP_MODULES.
    'the-evaluation-lifecycle',
    'golden-datasets-and-test-design',
    'model-judges-and-human-calibration',
    'retrieval-evaluation',
    'answer-quality-and-evidence',
    'rag-regression-comparisons',
    'tools-and-side-effects',
    'trajectories-and-task-completion',
    'multi-turn-state',
    'evaluation-harness-and-ci',
    'release-gates-and-reliable-measurement',
    'tracing-and-observability',
    'online-evaluation-and-production-monitoring',
    'cost-latency-and-performance',
    'guardrails-and-moderation',
    'red-teaming-and-adversarial-testing',
    'security-privacy-and-multi-tenant-governance',
    'production-evaluation-capstone',
  ],
  'ai-systems-design': ['design-framework', 'sixty-minute-whiteboard', 'architecture-patterns', 'classic-ai-designs'],
  'forward-deployed': [
    'customer-discovery',
    'scoping-an-fde-project',
    'judgement-cases',
    'delivery-stages-and-gates',
    'adoption-and-impact',
    'debugging-customer-environment',
  ],
  'communication-and-behavioural': ['telling-the-build-story', 'building-the-story-bank'],
  'interview-practice': [
    'case-study-worksheets',
    'mock-interviews',
    'final-week',
    'company-loops',
    'coding-round-practice',
  ],
  'capstone-and-portfolio': ['capstone-build', 'portfolio-write-up'],
  'staff-ai-system-design': [
    'enterprise-overview',
    'mvp',
    'distributed-execution',
    'enterprise-knowledge',
    'application-scaling',
    'overload-fairness',
    'enterprise-security',
    'reliability-consistency',
    'evaluation-releases',
    'inference-gpu',
    'fine-tuning',
    'multi-region',
    'staff-platform',
    'architecture-decisions',
  ],
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
  'company-loops',
  'coding-round-practice',
  ...TRACK_MODULES['production-ai'].slice(TRACK_MODULES['production-ai'].indexOf('the-evaluation-lifecycle')),
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
  // The Staff AI System Design course (T18) is an optional deep dive on every path; a path's own
  // spec can still raise it. Optional modules add nothing to a path's hours.
  for (const slug of TRACK_MODULES['staff-ai-system-design']) out[slug] = 'optional'
  for (const level of FLAG_ORDER) for (const item of spec[level] ?? []) for (const slug of expand(item)) out[slug] = level
  for (const slug of GAP_MODULES) if (out[slug] !== 'skip') out[slug] = 'later'
  // Kept in the registry for case references and saved progress, not assigned in Learn.
  out['scenario-library'] = 'skip'
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
    'ai-engineering-foundations',
    'prompt-and-context-engineering',
    'langchain-and-langgraph-fundamentals',
    'llm-and-retrieval',
    'retrieval-quality-engineering',
    'agentic-systems',
    'advanced-agents',
    'agentic-and-self-correcting-rag',
    'memory-and-multi-agent-rag',
    'multi-agent-systems',
    'agent-protocols-mcp-and-a2a',
    'production-ai',
    'ai-systems-design',
    'forward-deployed',
    'communication-and-behavioural',
    'interview-practice',
  ],
  optional: [
    'engineering-foundations',
    'capstone-and-portfolio',
    'hierarchical-memory-and-graph-rag',
    'fine-tuning-and-model-adaptation',
    'architecture-synthesis-and-capstone',
  ],
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
        'ai-engineering-foundations',
        'prompt-and-context-engineering',
        'langchain-and-langgraph-fundamentals',
        'llm-and-retrieval',
        'retrieval-quality-engineering',
        'agentic-systems',
        'advanced-agents',
        'agentic-and-self-correcting-rag',
        'memory-and-multi-agent-rag',
        'multi-agent-systems',
        'agent-protocols-mcp-and-a2a',
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
        'hierarchical-memory-and-graph-rag',
        'fine-tuning-and-model-adaptation',
        'architecture-synthesis-and-capstone',
      ],
    }),
    estHours: 244,
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
        'ai-engineering-foundations',
        'prompt-and-context-engineering',
        'langchain-and-langgraph-fundamentals',
        'llm-and-retrieval',
        'retrieval-quality-engineering',
        'agentic-systems',
        'advanced-agents',
        'agentic-and-self-correcting-rag',
        'memory-and-multi-agent-rag',
        'multi-agent-systems',
        'agent-protocols-mcp-and-a2a',
        'production-ai',
        'ai-systems-design',
        'customer-discovery',
        'scoping-an-fde-project',
        'delivery-stages-and-gates',
        'communication-and-behavioural',
        'interview-practice',
      ],
      optional: [
        'engineering-foundations',
        'model-adaptation-and-serving',
        'capstone-and-portfolio',
        'hierarchical-memory-and-graph-rag',
        'fine-tuning-and-model-adaptation',
        'architecture-synthesis-and-capstone',
      ],
    }),
    estHours: 290,
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
        'ai-engineering-foundations',
        'prompt-and-context-engineering',
        'langchain-and-langgraph-fundamentals',
        'ai-engineering-foundations',
        'prompt-and-context-engineering',
        'langchain-and-langgraph-fundamentals',
        'llm-and-retrieval',
        'retrieval-quality-engineering',
        'retrieval-quality-engineering',
        'agentic-systems',
        'advanced-agents',
        'agentic-and-self-correcting-rag',
        'memory-and-multi-agent-rag',
        'multi-agent-systems',
        'agent-protocols-mcp-and-a2a',
        'agentic-and-self-correcting-rag',
        'memory-and-multi-agent-rag',
        'multi-agent-systems',
        'agent-protocols-mcp-and-a2a',
        'production-ai',
        'ai-systems-design',
        'communication-and-behavioural',
        'interview-practice',
      ],
      optional: [
        'engineering-foundations',
        'document-ingestion-and-metadata-design',
        'chunking-and-indexing',
        'embeddings-and-model-selection',
        'vector-stores-and-index-operations',
        'advanced-indexing-strategies',
        'forward-deployed',
        'capstone-and-portfolio',
        'hierarchical-memory-and-graph-rag',
        'fine-tuning-and-model-adaptation',
        'architecture-synthesis-and-capstone',
      ],
    }),
    estHours: 252,
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
        'advanced-agents',
        'agentic-and-self-correcting-rag',
        'memory-and-multi-agent-rag',
        'multi-agent-systems',
        'agent-protocols-mcp-and-a2a',
        'production-ai',
        'ai-systems-design',
        'customer-discovery',
        'scoping-an-fde-project',
        'communication-and-behavioural',
        'interview-practice',
      ],
      optional: [
        'engineering-foundations',
        'ai-engineering-foundations',
        'prompt-and-context-engineering',
        'langchain-and-langgraph-fundamentals',
        'llm-and-retrieval',
        'retrieval-quality-engineering',
        'capstone-and-portfolio',
        'hierarchical-memory-and-graph-rag',
        'fine-tuning-and-model-adaptation',
        'architecture-synthesis-and-capstone',
      ],
    }),
    estHours: 208,
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
        'ai-engineering-foundations',
        'prompt-and-context-engineering',
        'langchain-and-langgraph-fundamentals',
        'llm-and-retrieval',
        'retrieval-quality-engineering',
        'agentic-systems',
        'advanced-agents',
        'agentic-and-self-correcting-rag',
        'memory-and-multi-agent-rag',
        'multi-agent-systems',
        'agent-protocols-mcp-and-a2a',
        'production-ai',
        'ai-systems-design',
        'forward-deployed',
        'communication-and-behavioural',
        'portfolio-write-up',
      ],
      // Architects are asked staff-level design questions, so the T18 course is recommended here.
      recommended: ['staff-ai-system-design'],
      optional: [
        'engineering-foundations',
        'model-adaptation-and-serving',
        'capstone-build',
        'hierarchical-memory-and-graph-rag',
        'fine-tuning-and-model-adaptation',
        'architecture-synthesis-and-capstone',
      ],
    }),
    estHours: 375,
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
    estHours: 295,
    skipCriteria: 'Any module you can explain without notes and rate 4 or more for confidence.',
    readinessCriteria: FDE_READINESS,
    startModule: 'how-the-platform-works',
  },
  {
    id: 'revision',
    title: 'Revision Only',
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
    // and the modules it leaned on (T1.4, T1.6) are Coming soon.
    id: 'fde-frontier-lab',
    title: 'Forward Deployed Engineer: Frontier Lab Loop',
    persona: 'fde-candidate',
    variantOf: 'fde',
    summary:
      'The Forward Deployed Engineer path for loops with a coding round and a take-home build of 3 to 5 hours, with customer delivery and evaluation required.',
    moduleFlags: {
      ...FDE_FLAGS,
      // T19 Forward Deployed Engineering and T16.7 Evaluation and release gates.
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
    estHours: 325,
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

// ── Weekly plan ────────────────────────────────────────────────────────────

export type PlanWeek = { week: number; modules: string[] }
export type WeeklyPlan = { weeks: PlanWeek[]; totalWeeks: number; minutes: number; skipped: number }

/**
 * The diagnostic's week-by-week plan: the path's required and recommended modules in
 * curriculum order, less the ones the answers say may be skipped, laid end to end at
 * `weeklyHours` a week. Each module is listed in the week it starts. Gap modules are
 * never required or recommended (ON-05), so the plan only uses material that exists.
 */
export function weeklyPlan(
  path: LearningPath,
  weeklyHours: number,
  canSkip: readonly string[],
  minutesOf: (slug: string) => number,
): WeeklyPlan {
  const budget = Math.max(1, weeklyHours) * 60
  const studied = ALL_MODULES.filter((s) => path.moduleFlags[s] === 'required' || path.moduleFlags[s] === 'recommended')
  const slugs = studied.filter((s) => !canSkip.includes(s))
  const weeks: PlanWeek[] = []
  let minutes = 0
  for (const slug of slugs) {
    const week = Math.floor(minutes / budget) + 1
    if (weeks.at(-1)?.week === week) weeks.at(-1)!.modules.push(slug)
    else weeks.push({ week, modules: [slug] })
    minutes += minutesOf(slug)
  }
  return { weeks, totalWeeks: Math.max(1, Math.ceil(minutes / budget)), minutes, skipped: studied.length - slugs.length }
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
      { label: 'Training and evaluating models', weights: { 'ml-engineer': 3 }, canSkip: ['fine-tuning-fundamentals'] },
      { label: 'Customer workshops and solution designs', weights: { architect: 2, fde: 1 } },
    ],
  },
  {
    id: 'd3',
    prompt: 'Have you shipped an LLM feature to real users?',
    options: [
      { label: 'No', weights: { beginner: 1, 'experienced-swe': 1 } },
      { label: 'A prototype or internal demo', weights: { 'experienced-swe': 1, 'data-engineer': 1 } },
      { label: 'Yes, in production', weights: { fde: 2, revision: 1 }, canSkip: ['llm-provider-apis-and-model-selection'] },
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
