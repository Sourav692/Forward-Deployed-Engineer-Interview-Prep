/**
 * Mock interviews and the final readiness exam for the /demo prototype.
 *
 * Sample content written for the prototype only. Every customer, organisation and
 * scenario here is fictional.
 */

import type { MockInterview, ReadinessExam } from '../types'

export const MOCKS: MockInterview[] = [
  {
    id: 'mock-a',
    letter: 'A',
    title: 'AI system-design round',
    minutes: 60,
    covers: 'T5 plus a T2–T4 depth probe',
    prompt: 'Northwind Freight, a fictional logistics company with 12,000 staff, wants an assistant that answers operations questions from its runbooks, carrier contracts and incident history. Design the system end to end. The interviewer will pick one component, such as retrieval, evaluation or serving, and probe it in depth for the last fifteen minutes.',
    context: [
      'About 400,000 documents across a wiki, a contract store and a ticketing system',
      'Peak load is roughly 30 questions a second during shift changes',
      'Contracts are restricted to the commercial team; runbooks are open to all staff',
      'Target p95 response time is four seconds, with answers citing their sources',
      'Monthly model budget is capped and must be shown per query',
    ],
    probes: [
      'Walk me through one question from the user to the cited answer.',
      'Where exactly are permissions enforced, and what happens when they change?',
      'How do you know the assistant is good enough to launch?',
      'What breaks first if usage grows tenfold?',
      'What is your cost per query, and how would you halve it?',
      'Pick your retrieval design and defend it against pure vector search.',
    ],
    fdeRound: false,
    relatedModuleIds: ['t5-1', 't5-2', 't5-3', 't2-4', 't4-2'],
  },
  {
    id: 'mock-b',
    letter: 'B',
    title: 'Decomposition and discovery round',
    minutes: 45,
    covers: 'T6.1–T6.2',
    prompt: 'The operations director at Harbourline Insurance, a fictional mid-sized insurer, says: "Our underwriters drown in broker emails. We want AI to fix it." You have 45 minutes with the interviewer playing the director. Run discovery, turn the ask into requirements and propose a first slice you could deliver in six weeks.',
    context: [
      'About 60 underwriters handle roughly 1,500 broker emails a day',
      'Emails often carry attachments: schedules, loss histories and scanned forms',
      'A policy administration system holds the system of record and has a limited API',
      'The director reports to a chief operating officer who wants results this quarter',
    ],
    probes: [
      'What would you ask in the first ten minutes, and why those questions?',
      'Which metric would tell us this worked?',
      'What is explicitly out of scope for the first slice?',
      'What would make this project fail?',
      'The head of underwriting disagrees with the director on the main pain. What now?',
    ],
    fdeRound: true,
    relatedModuleIds: ['t6-1', 't6-2'],
  },
  {
    id: 'mock-c',
    letter: 'C',
    title: 'Production incident and debugging',
    minutes: 30,
    covers: 'T4.3, T6.6',
    prompt: 'You are the deployed engineer for Meridian Health Partners, a fictional clinic network using a document question-answering assistant you helped build. At 09:10 the clinic operations lead reports that answers have become vague and often say the information is not available. It worked yesterday. The interviewer will reveal logs and metrics as you ask for them.',
    context: [
      'Overnight, the customer\'s IT team rotated a service-account credential',
      'A scheduled index refresh ran at 02:00 and reported success',
      'Error rates are flat; p95 latency fell by 40 percent',
      'You have read-only access to traces but not to the customer\'s network',
    ],
    probes: [
      'What do you check first, and what would each result tell you?',
      'Why might latency have improved while quality fell?',
      'What do you tell the operations lead in the next fifteen minutes?',
      'How do you confirm the fix without full production access?',
      'What change would stop this class of incident recurring?',
    ],
    fdeRound: true,
    relatedModuleIds: ['t4-3', 't6-6'],
  },
  {
    id: 'mock-d',
    letter: 'D',
    title: 'Customer-case simulation',
    minutes: 60,
    covers: 'T6 end to end, executive communication',
    prompt: 'Corvane Energy, a fictional utility, ran an eight-week pilot of a field-technician assistant that answers equipment questions from manuals. The pilot met its accuracy target but usage fell after week three, and the sponsor\'s budget review is in two weeks. Play the deployed engineer from diagnosis through to a recommendation presented to the sponsor, played by the interviewer.',
    context: [
      'Pilot covered 80 technicians in two regions; 25 still use it weekly',
      'Answer accuracy on the agreed evaluation set is 91 percent against a target of 85',
      'Technicians work offline in some substations and use tablets with gloves',
      'The sponsor must choose between expanding, extending the pilot or stopping',
      'The customer\'s IT team wants a support handover plan before any expansion',
    ],
    probes: [
      'How do you find out why usage dropped?',
      'What options do you put in front of the sponsor, and which do you recommend?',
      'How would you prove business impact to their finance team?',
      'What does production readiness require that the pilot did not?',
      'The sponsor says the pilot failed. How do you respond?',
      'Give me the two-minute executive summary.',
    ],
    fdeRound: true,
    relatedModuleIds: ['t6-3', 't6-4', 't6-5', 't7-5'],
  },
  {
    id: 'mock-e',
    letter: 'E',
    title: 'Behavioural and hiring manager',
    minutes: 45,
    covers: 'T7',
    prompt: 'A hiring manager round for an applied AI engineering role. Expect four or five story questions on ownership, ambiguity, conflict and influence, then a section where you explain one of your own systems at two levels of depth. The interviewer probes each story for your personal contribution and the measured result.',
    context: [
      'Prepare six to eight stories mapped to ownership, ambiguity, conflict, failure and influence',
      'Each story should fit in two minutes with a clear decision and a measured result',
      'You will be asked to explain one system to a non-technical listener',
      'Leave five minutes for your own questions about the team',
    ],
    probes: [
      'What exactly did you do, as opposed to the team?',
      'How did you measure that result?',
      'What would you do differently now?',
      'Tell me about a time you were wrong.',
      'Explain that system again for someone in sales.',
    ],
    fdeRound: false,
    relatedModuleIds: ['t7-1', 't7-3', 't7-4', 't7-5'],
  },
]

export const READINESS_EXAM: ReadinessExam = {
  id: 'readiness-exam',
  title: 'Final readiness exam',
  minutes: 150,
  passMark: 82,
  scenario: 'Larkspur Mutual, a fictional regulated savings and lending provider with 4,000 staff, wants an internal assistant that helps compliance analysts, customer service staff and branch managers answer policy and procedure questions. Sources include a policy library, product terms, internal circulars and a case-management system containing customer correspondence with personal data. Each staff group may see only some sources, and the regulator expects every answer used in a customer decision to be traceable. The chief operating officer wants a pilot in eight weeks and has asked you to present the plan.',
  sections: [
    {
      id: 'discovery',
      title: 'Discovery and scoping',
      maxPoints: 15,
      task: 'List the questions you would ask in discovery, name the users and the success metric, and define a first slice with an explicit out-of-scope list.',
    },
    {
      id: 'architecture',
      title: 'Architecture',
      maxPoints: 20,
      task: 'Draw the end-to-end architecture from ingestion to answer, showing the data flow, the main components and where state is held.',
    },
    {
      id: 'retrieval-permissions',
      title: 'Retrieval and permissions',
      maxPoints: 20,
      task: 'Design retrieval for mixed query types and explain exactly where and how access controls are enforced, including when permissions change.',
    },
    {
      id: 'evaluation',
      title: 'Evaluation plan',
      maxPoints: 20,
      task: 'Define the metrics, the golden set, how automated judges are validated and the gates that must pass before the pilot and before production.',
    },
    {
      id: 'operations-cost',
      title: 'Operations and cost',
      maxPoints: 15,
      task: 'Set service-level objectives, describe monitoring and incident handling, and estimate cost per query with two ways to reduce it.',
    },
    {
      id: 'communication',
      title: 'Customer communication',
      maxPoints: 10,
      task: 'Write the two-minute summary for the chief operating officer: the outcome, the main risk with its controls, and the decision you need.',
    },
  ],
  autoFailConditions: [
    { id: 'filter-after-retrieval', label: 'Filters permissions after retrieval instead of before' },
    { id: 'fabricated-citations', label: 'Presents fabricated or unverifiable citations' },
    { id: 'no-evaluation-plan', label: 'Proposes a launch with no evaluation plan or release gate' },
    { id: 'raw-pii-logging', label: 'Logs raw prompts or outputs containing personal data' },
    { id: 'no-audit-trail', label: 'Provides no audit trail for answers used in customer decisions' },
  ],
}
