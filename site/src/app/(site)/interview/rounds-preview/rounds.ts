/**
 * PROTOTYPE (plan Part 4, step 22): every interview page mapped to one round of a real
 * loop. Slugs are published lesson slugs (`getPublishedLesson`) or module slugs
 * (`getModuleBySlug`), so the round pages copy no content. On approval this moves to
 * `curriculum.ts` as INTERVIEW_ROUNDS and the pages replace /interview.
 */

import { formatMinutes, getModuleBySlug, getPublishedLesson, learnHref, moduleTime, readingList } from '@/lib/learn'

export type InterviewRound = {
  slug: string
  title: string
  /** What the interviewer is testing, in one sentence. */
  summary: string
  /** How the round usually runs. */
  format: string
  /** Three things a strong answer shows. */
  tests: string[]
  /** Learn modules to study first. */
  study: string[]
  /** Practice lessons, in groups. */
  practise: { title: string; lessons: string[] }[]
  /** Timed mock interviews for this round. */
  mocks: string[]
  /** Set while the round has no content: shown on a Coming soon card. */
  planned?: string
}

const DISCOVERY_WORKSHEETS = [
  'internal-knowledge-assistant',
  'sales-copilot',
  'financial-compliance-reviewer',
  'healthcare-prior-auth-assistant',
  'legal-contract-copilot',
  'sre-triage-agent',
  'multi-tenant-saas-support',
  'retail-demand-explainer',
  'service-now-ticket-agent',
  'executive-dashboard-copilot',
]

const DESIGN_WORKSHEETS = [
  'enterprise-knowledge-assistant-rag',
  'secure-multi-tenant-ai-platform',
  'natural-language-to-sql-analytics-assistant',
  'ai-customer-support-automation',
  'ai-system-for-an-air-gapped-environment',
  'llm-evaluation-and-release-gating-platform',
  'high-volume-batch-inference-system',
  'tool-using-ai-agent-with-safety-controls',
  'reliable-workflow-orchestration-system',
  'observability-customer-facing-ai-application',
  'configurable-platform-customer-specific-workflows',
  'system-design-worksheets-enterprise-chatbot-platform',
]

export const INTERVIEW_ROUNDS: InterviewRound[] = [
  {
    slug: 'recruiter-screen',
    title: 'Recruiter Screen',
    summary: 'Why this role, why you, and whether your story holds up in two minutes.',
    format: '20 to 30 minute call',
    tests: [
      'You can say what a forward deployed engineer does and why you want to be one.',
      'Your background comes across as one short story with a clear build at its centre.',
      'You ask questions that show you know how the team works with customers.',
    ],
    study: ['the-fde-role', 'telling-the-build-story'],
    practise: [{ title: 'Role questions', lessons: ['practise-fde-role'] }],
    mocks: [],
  },
  {
    slug: 'coding',
    title: 'Coding',
    summary: 'Working code under time, plus the backend and infrastructure questions asked around it.',
    format: '45 to 60 minutes, shared editor',
    tests: [
      'You clarify the input and edge cases before you type.',
      'You reach a working version first, then improve it out loud.',
      'You can explain the API, data and deployment choices behind the code.',
    ],
    study: ['apis-and-backend', 'cloud-containers-deployment', 'distributed-systems-essentials'],
    practise: [
      {
        title: 'Technical questions',
        lessons: ['practise-api-and-backend', 'practise-deployment', 'module-12-reliability-and-failure-handling'],
      },
    ],
    mocks: [],
  },
  {
    slug: 'ai-assisted-coding',
    title: 'AI-Assisted Coding',
    summary: 'Building with an AI pair: how you prompt, check and own the code it writes.',
    format: '60 to 90 minutes, your own tools',
    tests: [
      'You split the task so the assistant gets small, checkable steps.',
      'You read, test and correct generated code rather than accept it.',
      'You can explain every line you ship, including the ones you did not type.',
    ],
    study: [],
    practise: [],
    mocks: [],
    planned: 'a timed build with an AI pair, reviewing and testing generated code, and explaining your checks',
  },
  {
    slug: 'ai-system-design',
    title: 'AI System Design',
    summary: 'An end-to-end AI system on a whiteboard: retrieval, agents, evaluation, scale, security and cost.',
    format: '45 to 60 minutes, whiteboard',
    tests: [
      'You pin down users, data and the success measure before drawing boxes.',
      'You name the trade-offs in retrieval, model choice, latency and cost, with numbers.',
      'You show how the system is evaluated, secured and operated after launch.',
    ],
    study: ['design-framework', 'sixty-minute-whiteboard', 'architecture-patterns', 'classic-ai-designs'],
    practise: [
      {
        title: 'Design questions',
        lessons: [
          'practise-enterprise-rag',
          'practise-security-and-tenancy',
          'practise-observability-and-diagnosis',
          'practise-cost-and-latency',
          'practise-scaling-and-reliability',
          'practise-agentops',
        ],
      },
      {
        title: 'Depth questions',
        lessons: [
          'practise-rag-fundamentals',
          'practise-chunking-and-indexing',
          'practise-retrieval',
          'practise-framework-interview-questions',
          'practise-agent-loop-interview-questions',
          'practise-tool-design-interview-questions',
          'practise-context-and-orchestration-interview-questions',
          'practise-memory-and-state',
          'practise-robust-agents',
          'practise-multi-agent-systems',
          'practise-agentic-workflow-platforms',
          'practise-evaluation-and-release-gates',
        ],
      },
      { title: 'System design worksheets', lessons: DESIGN_WORKSHEETS },
    ],
    mocks: [
      'running-and-scoring-a-mock-interview',
      'internal-knowledge-assistant-mock-interview',
      'agentic-support-workflow-mock-interview',
      'financial-compliance-and-red-team-mock-interview',
      'sre-triage-agent-mock-interview',
      'multi-tenant-saas-assistant-mock-interview',
    ],
  },
  {
    slug: 'decomposition',
    title: 'Decomposition or Case Study',
    summary: 'A vague business problem broken into a scoped, buildable first version.',
    format: '45 to 60 minutes, discussion',
    tests: [
      'You find the real problem and the person who has it before proposing a fix.',
      'You cut the scope to something you could ship in weeks, and say what you left out.',
      'You make judgement calls under uncertainty and explain them.',
    ],
    study: ['customer-discovery', 'scoping-an-fde-project', 'judgement-cases'],
    practise: [
      {
        title: 'Cases',
        lessons: ['practise-decomposition-interview-cases', 'module-01-fde-problem-decomposition', 'scoping-in-practice'],
      },
    ],
    mocks: [],
  },
  {
    slug: 'customer-scenario',
    title: 'Customer Scenario',
    summary: 'A role-play with a client: discovery, pushback, delivery under constraints and proving impact.',
    format: '45 to 60 minutes, role-play',
    tests: [
      'You run discovery like a conversation, not a questionnaire.',
      'You hold a position under pushback and agree the next step.',
      'You tie the build to a measure the customer already cares about.',
    ],
    study: ['customer-discovery', 'delivery-stages-and-gates', 'adoption-and-impact'],
    practise: [
      {
        title: 'Delivery rounds',
        lessons: ['practise-the-two-week-delivery-round', 'module-18-end-to-end-fde-interview-execution'],
      },
      { title: 'Customer discovery worksheets', lessons: DISCOVERY_WORKSHEETS },
    ],
    mocks: [
      'bank-policy-assistant-client-simulation',
      'it-service-desk-agent-client-simulation',
      'grocery-forecast-explainer-client-simulation',
      'saas-support-deflection-client-simulation',
      'prior-authorisation-packets-client-simulation',
    ],
  },
  {
    slug: 'behavioural',
    title: 'Behavioural',
    summary: 'Stories that show judgement, ownership and how you work with customers and teams.',
    format: '45 minutes, structured questions',
    tests: [
      'Each story has a clear situation, your own action and a measured result.',
      'You can tell a failure without blaming anyone and say what changed.',
      'You pick the right story for the question within a few seconds.',
    ],
    study: ['telling-the-build-story', 'building-the-story-bank'],
    practise: [
      {
        title: 'Story bank',
        lessons: [
          'story-bank',
          'customer-focus-and-discovery',
          'communication-and-influence',
          'pushback-and-saying-no',
          'delivery-under-pressure',
          'ownership-standards-and-failure',
          'scale-beyond-yourself',
          'leading-people',
        ],
      },
    ],
    mocks: [],
  },
  {
    slug: 'demo-or-take-home',
    title: 'Demo or Take-Home',
    summary: 'A build you made on your own time, shown and defended in front of the panel.',
    format: 'A few days to build, 45 minutes to present',
    tests: [
      'You scope the brief so the core works end to end.',
      'You show how you tested it and where it would break.',
      'You answer design questions about your own choices without getting defensive.',
    ],
    study: ['capstone-build'],
    practise: [],
    mocks: ['contract-review-take-home-brief'],
  },
]

export const roundHref = (slug: string) => `/interview/rounds-preview/${slug}`

export type Row = { href: string; title: string; facts: string[] }

/** A published lesson as a contents row. A miss means a stale snapshot: run npm run sync. */
export function lessonRow(slug: string): Row {
  const lesson = getPublishedLesson(slug)
  const mod = lesson && getModuleBySlug(lesson.module)
  if (!lesson || !mod) throw new Error(`Interview round: lesson "${slug}" is not in the learn manifest.`)
  return { href: lesson.href, title: lesson.title, facts: [mod.title, ...(lesson.estMinutes ? [formatMinutes(lesson.estMinutes)] : [])] }
}

/** A Learn module as a contents row: its time and lesson count. */
export function moduleRow(slug: string): Row {
  const mod = getModuleBySlug(slug)
  if (!mod) throw new Error(`Interview round: no module "${slug}".`)
  const lessons = readingList(mod).main.length
  return {
    href: learnHref.module(mod),
    title: mod.title,
    facts: [formatMinutes(moduleTime(mod).total), ...(lessons ? [`${lessons} ${lessons === 1 ? 'lesson' : 'lessons'}`] : [])],
  }
}

export const practiseCount = (round: InterviewRound) => round.practise.reduce((n, g) => n + g.lessons.length, 0)
