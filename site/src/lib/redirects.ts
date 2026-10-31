/**
 * Every redirect the site serves, in one list (ENH-15, owner decision 6).
 *
 * `next.config.ts` returns `REDIRECTS` from `redirects()`. `check:curriculum` fails when
 * one entry's destination is another entry's source (a chain), and `check:routes` requests
 * every fixed source and expects one 308 (307 when temporary) to a page that returns 200.
 *
 * Rules:
 * - Never drop an entry: bookmarks and activity entries store an `href`, and they keep
 *   working only through these redirects.
 * - Point at the item's own new page, never at a hub or the home page unless that page
 *   is its real home.
 * - No chains: when a page moves again, update every entry that pointed at it.
 *
 * Order matters (Next.js applies the first match): lesson renames, then pages that moved
 * into /practice (one of them sits under an area rule), then whole areas, then retired
 * modules, the casebook, the final week and one-off pages.
 *
 * Imported by `next.config.ts` and the check scripts, so it has no runtime imports.
 */
import { MODULES, RENAMED, RETIRED_MODULES } from './curriculum.ts'
import { AREA_TRACKS, curriculumHref } from './curriculum-href.ts'
import { CASEBOOK_MODULE, scenarioHref } from './scenario.ts'

export type Redirect = { source: string; destination: string; permanent: boolean }

const trackOf = new Map(MODULES.map((m) => [m.slug, m.track]))

/**
 * Lesson URLs retired by a consolidation, derived from RENAMED in src/lib/curriculum.ts
 * (one file per track in src/lib/consolidation/). A retired lesson redirects to the
 * lesson that now teaches it, or to its module page when it was withdrawn (`null`).
 */
function lessonRedirects(): Redirect[] {
  const resolveKey = (key: string) => {
    const [mod, lesson] = key.split('/')
    const track = trackOf.get(mod)
    if (!track) throw new Error(`RENAMED key "${key}" names an unknown module`)
    return { track, mod, lesson }
  }
  const out: Redirect[] = []
  for (const [from, to] of Object.entries(RENAMED)) {
    // A retired module's lessons go with it; retiredModuleRedirects sends the module on.
    if (from.split('/')[0] in RETIRED_MODULES) continue
    const src = resolveKey(from)
    const dst = resolveKey(to ?? from.split('/')[0])
    const destination = curriculumHref(dst.track, dst.mod, dst.lesson)
    out.push({ source: curriculumHref(src.track, src.mod, src.lesson), destination, permanent: true })
    // A track that moved out of /learn keeps its old /learn URL, sent straight to the
    // final page so the redirect never chains through the area rule below.
    if (src.track in AREA_TRACKS) {
      const source = [`/learn/${src.track}`, src.mod, src.lesson].filter(Boolean).join('/')
      out.push({ source, destination, permanent: true })
    }
  }
  return out
}

/**
 * Tracks served by their own area (src/lib/curriculum-href.ts) used to live under
 * /learn/<track>. Their old URLs redirect to the area, keeping the module and lesson.
 * The bare track URL gets its own rule: `:path*` matching nothing would leave a
 * trailing slash (`/interview/`) and cost a second redirect.
 */
const areaRedirects = (): Redirect[] =>
  Object.entries(AREA_TRACKS).flatMap(([track, base]) => [
    { source: `/learn/${track}`, destination: base, permanent: true },
    { source: `/learn/${track}/:path+`, destination: `${base}/:path+`, permanent: true },
  ])

/**
 * Company-oriented prep (module 16) is unpublished while its packs move to the Company
 * Prep area. Temporary (307), because the module URLs may come back.
 */
const companyPrepRedirects: Redirect[] = [
  { source: '/modules/16-company-oriented-prep', destination: '/company-prep', permanent: false },
  { source: '/modules/16-company-oriented-prep/:path*', destination: '/company-prep', permanent: false },
]

/** Removed modules (RETIRED_MODULES in curriculum.ts) redirect to the module that took them over. */
const retiredModuleRedirects = (): Redirect[] =>
  Object.entries(RETIRED_MODULES).map(([from, to]) => ({
    source: curriculumHref(trackOf.get(to)!, from),
    destination: curriculumHref(trackOf.get(to)!, to),
    permanent: true,
  }))

/**
 * The worksheets moved from /modules/<module>/<track>/<slug> to /practice/<slug>, and the
 * Story Bank to /practice/story-bank (ENH-17). The I1 module page went too: /practice
 * lists its worksheets. Listed by hand, like the casebook, because old URLs are history.
 */
const WORKSHEETS_MODULE = '01-customer-discovery-and-decomposition'
const BEHAVIOURAL_MODULE = '14-behavioural-and-leadership-round'
const PRACTICE_BEFORE_ENH_17: Record<string, Record<string, string[]>> = {
  [WORKSHEETS_MODULE]: {
    core: [
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
    ],
    'system-design': [
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
      'enterprise-chatbot-platform',
    ],
  },
  [BEHAVIOURAL_MODULE]: {
    'fde-competencies': [
      'customer-focus-and-discovery',
      'communication-and-influence',
      'pushback-and-saying-no',
      'delivery-under-pressure',
      'ownership-standards-and-failure',
      'scale-beyond-yourself',
      'leading-people',
    ],
  },
}

const practiceRedirects: Redirect[] = [
  { source: `/modules/${WORKSHEETS_MODULE}`, destination: '/practice', permanent: true },
  { source: `/modules/${BEHAVIOURAL_MODULE}`, destination: '/practice', permanent: true },
  { source: `/modules/${BEHAVIOURAL_MODULE}/story-bank`, destination: '/practice/story-bank', permanent: true },
  { source: '/interview/case-study-worksheets', destination: '/practice', permanent: true },
  // Ahead of areaRedirects, which would otherwise send it to the line above: two hops.
  { source: '/learn/interview-practice/case-study-worksheets', destination: '/practice', permanent: true },
  ...Object.entries(PRACTICE_BEFORE_ENH_17).flatMap(([moduleId, tracks]) =>
    Object.entries(tracks).flatMap(([trackId, slugs]) =>
      slugs.map((slug) => ({
        source: `/modules/${moduleId}/${trackId}/${slug}`,
        destination: scenarioHref({ moduleId, trackId, slug }),
        permanent: true,
      })),
    ),
  ),
]

/**
 * The leadership-principle and hiring-manager worksheets were merged into the FDE
 * competency worksheets (T7.2, The behavioural round). Each old worksheet goes to the new
 * one that holds most of its questions.
 */
const RETIRED_BEHAVIOURAL_WORKSHEETS: Record<string, string> = {
  'hiring-manager/ambiguity-and-discovery': 'customer-focus-and-discovery',
  'hiring-manager/delivery-under-pressure': 'delivery-under-pressure',
  'hiring-manager/pushback-and-saying-no': 'pushback-and-saying-no',
  'hiring-manager/scale-beyond-self': 'scale-beyond-yourself',
  'hiring-manager/stakeholder-influence': 'communication-and-influence',
  'leadership-principles/attracts-and-retains-talent': 'leading-people',
  'leadership-principles/communicates-with-clarity': 'communication-and-influence',
  'leadership-principles/creates-a-culture-of-accountability': 'leading-people',
  'leadership-principles/customer-obsession': 'customer-focus-and-discovery',
  'leadership-principles/develops-people': 'leading-people',
  'leadership-principles/embraces-adversity': 'ownership-standards-and-failure',
  'leadership-principles/engenders-trust': 'communication-and-influence',
  'leadership-principles/focuses-on-outcomes': 'ownership-standards-and-failure',
  'leadership-principles/makes-good-decisions-quickly': 'delivery-under-pressure',
  'leadership-principles/never-stops-learning-and-growing': 'ownership-standards-and-failure',
  'leadership-principles/ownership': 'ownership-standards-and-failure',
  'leadership-principles/resourceful': 'scale-beyond-yourself',
  'leadership-principles/sets-high-standards': 'ownership-standards-and-failure',
  'leadership-principles/staff-level-and-cross-cutting': 'scale-beyond-yourself',
}

/**
 * The casebook moved from /modules/15-fde-case-studies/<theme>/<slug> to /design/<slug>
 * (ENH-16). The old URLs are history, so they are listed rather than read from the
 * manifest: a case that later changes theme must still answer at its old address.
 */
const CASEBOOK_BEFORE_ENH_16: Record<string, string[]> = {
  'knowledge-retrieval': ['enterprise-knowledge-assistant', 'nl-over-governed-data', 'document-review-copilot', 'deep-research-agent'],
  'agents-that-act': [
    'customer-support-automation',
    'tool-using-agent-with-safety-controls',
    'sre-incident-response-agent',
    'sales-copilot',
    'enterprise-coding-assistant',
    'real-time-call-assistant',
    'logistics-exception-handling',
  ],
  'platforms-and-scale': [
    'secure-multi-tenant-ai-platform',
    'high-volume-batch-pipeline',
    'agent-platform-for-non-technical-users',
    'consumer-scale-chat-service',
    'llm-inference-serving',
  ],
  'delivery-evaluation-operations': ['scoping-to-deployed-agent', 'evaluation-and-release-gating', 'observability-and-production-diagnosis'],
  'model-development': ['model-development-and-post-training'],
  'standalone-designs': [
    'recruiting-platform',
    'travel-agent-worked-example',
    'air-gapped-ai-system',
    'reliable-workflow-orchestration',
    'configurable-platform-customer-workflows',
    'enterprise-chatbot-platform',
    'self-adapting-agent',
    'personal-assistant-with-memory',
    'production-llm-gateway',
  ],
  'judgement-and-decomposition': [
    'prioritize-ai-use-cases',
    'scale-prototype-to-production',
    'build-when-customer-data-is-poor',
    'decomposition-classics-67-68-69',
  ],
}

const casebookRedirects: Redirect[] = [
  { source: '/learn/ai-systems-design/scenario-library', destination: '/design', permanent: true },
  { source: `/modules/${CASEBOOK_MODULE}`, destination: '/design', permanent: true },
  ...Object.entries(CASEBOOK_BEFORE_ENH_16).flatMap(([trackId, slugs]) =>
    slugs.map((slug) => ({
      source: `/modules/${CASEBOOK_MODULE}/${trackId}/${slug}`,
      destination: scenarioHref({ moduleId: CASEBOOK_MODULE, trackId, slug }),
      permanent: true,
    })),
  ),
]

const behaviouralRedirects: Redirect[] = Object.entries(RETIRED_BEHAVIOURAL_WORKSHEETS).map(([from, to]) => ({
  source: `/modules/${BEHAVIOURAL_MODULE}/${from}`,
  destination: scenarioHref({ moduleId: BEHAVIOURAL_MODULE, trackId: 'fde-competencies', slug: to }),
  permanent: true,
}))

/**
 * The final-week review moved from static HTML under /fde-last-day-prep into the I3
 * lessons at /interview/final-week (ENH-18). A review's one-page memory card is the
 * Recall card tab of its lesson (panel id `recall-card`). Listed by hand: history.
 */
const FINAL_WEEK = curriculumHref('interview-practice', 'final-week')
const REVIEW_LESSONS_BEFORE_ENH_18 = [
  'module-01-fde-problem-decomposition',
  'module-02-functional-requirements',
  'module-03-non-functional-requirements',
  'module-04-core-architecture-building-blocks',
  'module-05-rag-and-enterprise-data',
  'module-06-agentic-architecture',
  'module-07-tools-actions-and-enterprise-integration',
  'module-08-guardrails-policy-and-human-approval',
  'module-09-scaling-ai-systems',
  'module-10-latency-optimization',
  'module-11-cost-optimization',
  'module-12-reliability-and-failure-handling',
  'module-13-ai-evaluation',
  'module-14-release-and-change-management',
  'module-15-observability-and-production-operations',
  'module-16-security-and-enterprise-multi-tenancy',
  'module-17-trade-off-thinking',
  'module-18-end-to-end-fde-interview-execution',
]

const finalWeekRedirects: Redirect[] = [
  { source: '/fde-last-day-prep', destination: FINAL_WEEK, permanent: true },
  { source: '/fde-last-day-prep/roadmap', destination: `${FINAL_WEEK}/roadmap`, permanent: true },
  { source: '/fde-last-day-prep/rapid-revision', destination: `${FINAL_WEEK}/rapid-revision-guide`, permanent: true },
  {
    source: '/fde-last-day-prep/trigger-to-concept-cheat-sheet/trigger-to-concept-cheat-sheet.html',
    destination: `${FINAL_WEEK}/trigger-to-concept-cheat-sheet`,
    permanent: true,
  },
  ...REVIEW_LESSONS_BEFORE_ENH_18.flatMap((lesson) => [
    { source: `/fde-last-day-prep/${lesson}/concise-interview-module.html`, destination: `${FINAL_WEEK}/${lesson}`, permanent: true },
    { source: `/fde-last-day-prep/${lesson}/one-page-memory-card.html`, destination: `${FINAL_WEEK}/${lesson}#recall-card`, permanent: true },
  ]),
]

export const REDIRECTS: Redirect[] = [
  ...lessonRedirects(),
  ...practiceRedirects,
  ...areaRedirects(),
  ...companyPrepRedirects,
  ...retiredModuleRedirects(),
  ...casebookRedirects,
  ...behaviouralRedirects,
  ...finalWeekRedirects,
  // /start is the one onboarding page (ENH-11); the two pages it absorbed redirect.
  { source: '/guide', destination: '/start', permanent: true },
  { source: '/learning-map', destination: '/start', permanent: true },
  // The five topic hubs (FE-18) became interview rounds (plan Part 4): each hub goes to
  // the round that holds its practice. Rounds have no index of their own: /interview lists them.
  { source: '/interview/hubs', destination: '/interview', permanent: true },
  { source: '/interview/hubs/technical-foundations', destination: '/interview/rounds/coding', permanent: true },
  { source: '/interview/hubs/ai-and-machine-learning', destination: '/interview/rounds/ai-system-design', permanent: true },
  { source: '/interview/hubs/ai-systems-design', destination: '/interview/rounds/ai-system-design', permanent: true },
  { source: '/interview/hubs/forward-deployed-engineering', destination: '/interview/rounds/customer-scenario', permanent: true },
  { source: '/interview/hubs/behavioural-and-communication', destination: '/interview/rounds/behavioural', permanent: true },
  { source: '/interview/rounds', destination: '/interview', permanent: false },
  // The /demo prototype was retired once production covered it (FE-19). Its
  // fd:demo:v1 progress is not migrated (plan §15 Q12).
  { source: '/demo', destination: '/', permanent: true },
  { source: '/demo/:path*', destination: '/', permanent: true },
]
