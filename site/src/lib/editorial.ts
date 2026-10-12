/**
 * Editorial registry: every visible name, every content mode, and the metadata each
 * page states about itself — who it is for, what it assumes, what it teaches, how long
 * it takes, and where to go next.
 *
 * One file on purpose. The sync scripts import it (Node strips the types) to write
 * track titles into the manifest and to rename the static Last-Day pages, and the app
 * imports it to render headers, breadcrumbs and search. A name
 * changed here changes everywhere; a name changed anywhere else is drift, and
 * `check:content` looks for it.
 *
 * Nothing here is a route, file name or storage key. Those stay fixed so bookmarks
 * and saved progress keep working — only what the reader sees is decided here.
 *
 * Keep this file free of runtime imports: `scripts/*.mjs` load it directly.
 */

// ---------------------------------------------------------------- content modes

export type ContentMode =
  | 'orientation'
  | 'practice'
  | 'behavioural'
  | 'case-study'
  | 'company-prep'
  | 'revision'

export const MODES: Record<ContentMode, { label: string; summary: string }> = {
  orientation: {
    label: 'Orientation',
    summary: 'Explains how the material fits together and where to start.',
  },
  practice: {
    label: 'Practice',
    summary:
      'A worksheet you fill in, section by section, then check against a model answer and score yourself.',
  },
  behavioural: {
    label: 'Behavioural practice',
    summary:
      'A personalisation template: the structure of a strong answer, with gaps only your own experience can fill.',
  },
  'case-study': {
    label: 'Case study',
    summary: 'A complete system design to read, at several depths, from interview answer to sourced detail.',
  },
  'company-prep': {
    label: 'Company prep',
    summary: 'A company-specific preparation pack for one interview loop, including its product context and likely exercises.',
  },
  revision: {
    label: 'Revision',
    summary:
      'Condensed recall for concepts you have already studied — not a first introduction to them.',
  },
}

export type Difficulty = 'Foundation' | 'Intermediate' | 'Advanced'

/** Where a page's claims come from. */
export type SourceStatus = 'original' | 'derived' | 'sourced' | 'personal'

export const SOURCE_STATUS_LABELS: Record<SourceStatus, string> = {
  original: 'Original material for this site',
  derived: 'Condensed from the sources credited on the How It Works page',
  sourced: 'Cites its sources in the Sources and Full Design tab',
  personal: "Built from one candidate's engagements — adapt, do not recite",
}

export type Link = { label: string; href: string }

export type EditorialMeta = {
  mode: ContentMode
  audience: string
  difficulty: Difficulty
  prerequisites: string[]
  outcomes: string[]
  howToUse: string
  sourceStatus: SourceStatus
  /** Behavioural pages: the model answers contain `[FILL: …]` slots. */
  personalisation?: boolean
}

// ---------------------------------------------------------------- site and nav

export const SITE_NAME = 'Forward Deployed'

/** Who wrote the site's own material: the author line on lessons, cases and worksheets (PQ-15). */
export const AUTHOR = 'Sourav Banerjee'

/** "2026-09-27" -> "27 Sep 2026". Parsed by hand so the server, the browser and the sync agree. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${d} ${months[m - 1]} ${y}`
}

/**
 * Production origin. The one place it is written down: sitemap, robots, canonical URLs
 * and the final-week pages' head tags (written by the sync) all read it.
 */
export const SITE_URL = 'https://forward-deployed-sigma.vercel.app'
export const SITE_TAGLINE = 'FDE interview practice and system-design review'

/**
 * The top-level areas of the site (plan §4, UX-02), in display order. Ids are stable;
 * labels may change. `href` is where the area link goes; `match` lists the path
 * prefixes that also mark the area as current (`aria-current="page"`).
 *
 * Each area links to its own index page, and every area page now lives under its own
 * path (ENH-16 to ENH-18), so `match` is just that path. Company Prep (`/company-prep`)
 * is not listed while it has no packs (audit check FV-02); its route stays.
 */
export const NAV = [
  { id: 'start', label: 'Choose Your Path', href: '/start', match: ['/start'] },
  { id: 'learn', label: 'Learn', href: '/learn', match: ['/learn'] },
  {
    id: 'design',
    label: 'Design',
    href: '/design',
    match: ['/design'],
  },
  {
    id: 'practice',
    label: 'Practice',
    href: '/practice',
    match: ['/practice'],
  },
  {
    id: 'interview',
    label: 'Interview',
    href: '/interview',
    match: ['/interview'],
  },
] as const

/** Utility links shown after the areas in the header. Six header links in all (IA-01). */
export const UTILITY_NAV = [{ id: 'progress', label: 'Progress', href: '/progress', match: ['/progress'] }] as const

/**
 * The footer, in order (audit checks PR-05, PR-06, IA-15). The mobile menu lists the
 * ones that have an icon (Glossary, Library, Settings), so Settings is reachable at
 * every width. "Report an issue" follows these.
 */
export const FOOTER_NAV = [
  { id: 'guide', label: 'How this works', href: '/start#how-it-works', match: [] },
  { id: 'glossary', label: 'Glossary', href: '/glossary', match: ['/glossary'] },
  { id: 'library', label: 'Library', href: '/library', match: ['/library'] },
  { id: 'credits', label: 'Credits', href: '/library/credits', match: ['/library/credits'] },
  { id: 'about', label: 'About', href: '/about', match: ['/about'] },
  { id: 'changelog', label: 'Changelog', href: '/changelog', match: ['/changelog'] },
  { id: 'settings', label: 'Settings', href: '/settings', match: ['/settings'] },
] as const

/**
 * Where reports and suggestions go, and the contact on /about (owner decision 1). The
 * repository is private, so a GitHub issue link would 404 for visitors.
 */
export const FEEDBACK_EMAIL = 'sourav692@gmail.com'

/** A `mailto:` link whose subject names the page, so a report says where it came from. */
export const reportHref = (page?: { title: string; path: string }) =>
  `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(page ? `Report: ${page.title} (${page.path})` : 'Report an issue')}`

/** A `mailto:` link for topic suggestions from the hubs. */
export const suggestTopicHref = (hub: string) =>
  `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(`Suggest the next topic (${hub})`)}`

/** The final week: the I3 lessons at /interview/final-week (ENH-18). */
export const LAST_DAY = {
  title: 'Final Week Review',
  eyebrow: 'Focused interview-week review',
  href: '/interview/final-week',
} as const

// ---------------------------------------------------------------- tracks

/**
 * Display name and description of every track, keyed by the track id that routes and
 * saved progress use. The sync scripts write these into the manifest.
 */
export const TRACKS: Record<string, { title: string; blurb: string }> = {
  core: {
    title: 'Discovery Foundations',
    blurb:
      'Ten GenAI customer problems. Start here: they practise the discovery and ' +
      'decomposition moves every later scenario builds on.',
  },
  'system-design': {
    title: 'System Design Practice',
    blurb:
      'Twelve harder scenarios, each built around one dangerous constraint — permission ' +
      'fidelity, tenant isolation, air-gapped deployment, release gating.',
  },
  'fde-competencies': {
    title: 'Behavioural Round Questions',
    blurb:
      'Six competencies FDE interviewers probe, from discovery to scaling beyond yourself, ' +
      'plus an optional set for lead roles. Each model answer shows the shape of a strong ' +
      'story and marks the details you must supply yourself.',
  },
  'knowledge-retrieval': {
    title: 'Knowledge and Retrieval',
    blurb:
      'Systems that answer from an organisation’s own documents and data, where the hard ' +
      'part is who may see what, and proving where each answer came from.',
  },
  'agents-that-act': {
    title: 'Agents and Copilots in Real Workflows',
    blurb:
      'Systems that work inside real tools — tickets, deploys, CRMs, shipments. Some act on ' +
      'their own within limits; others draft and a person commits. The design is mostly ' +
      'about deciding which is which.',
  },
  'platforms-and-scale': {
    title: 'AI Platforms and Scale',
    blurb:
      'Shared platforms and high-volume services: tenant isolation, batch throughput, ' +
      'consumer-scale chat and the serving layer underneath them.',
  },
  'delivery-evaluation-operations': {
    title: 'Delivery, Evaluation, and Operations',
    blurb:
      'Getting from a scoping document to a system in production, deciding when it is ' +
      'safe to release, and diagnosing it once it is live.',
  },
  'model-development': {
    title: 'Model Development and Post-Training',
    blurb: 'Building and adapting the model itself: data, fine-tuning, post-training and evaluation.',
  },
  'standalone-designs': {
    title: 'Additional System Designs',
    blurb:
      'Complete designs that do not belong to one of the themes above, from an ' +
      'air-gapped deployment to a gateway in front of every model call.',
  },
  'judgement-and-decomposition': {
    title: 'Product Judgement and Problem Decomposition',
    blurb:
      'Questions that test how you think rather than what you draw: which use cases to ' +
      'fund, how to scale a prototype, what to do with poor data, and how to break an ' +
      'open-ended problem down in sixty minutes.',
  },
  'blitzy-prep': {
    title: 'Blitzy Prep',
    blurb:
      'Company-specific preparation for the Blitzy interview loop: product context, code-review drills, incidents, customer communication and engineering leadership.',
  },
}

export const PRACTICE_TRACKS = ['core', 'system-design']

/**
 * Visible titles that differ from the source document's own heading, keyed `track/slug`.
 * Used where a source title's noun does not match what the system actually does — see
 * the autonomy rule in the style guide: an assistant answers or recommends, a copilot
 * drafts inside someone's workflow for them to commit, an agent picks and runs actions
 * within limits, an automation follows a fixed workflow. Sources keep their headings.
 */
export const TITLE_OVERRIDES: Record<string, string> = {
  // Only answers questions over governed metrics; it never drafts or acts.
  'core/executive-dashboard-copilot': 'Executive Dashboard Assistant',
  // "Automation Agent" named it twice; it proposes and performs actions within policy.
  'core/service-now-ticket-agent': 'ServiceNow Ticket Agent',
  // Drafts remediation notes for a human to approve — the same shape as G08 and the
  // legal contract copilot, so the same noun.
  'core/financial-compliance-reviewer': 'Financial Compliance Review Copilot',
}
export const BEHAVIOURAL_TRACKS = ['fde-competencies']

/**
 * The behavioural Story Bank (CONTENT-15): one page of the author's anonymised stories,
 * each cut to a single moment, with links to every question it can answer. Source is
 * `04_Behavioral_and_Leadership/story_bank.md`. A story lists its
 * questions on an `**Answers:**` line; those links also drive the "Stories that fit"
 * line on each behavioural worksheet question, so the two views cannot disagree.
 */
export const STORY_BANK = {
  moduleId: '14-behavioural-and-leadership-round',
  slug: 'story-bank',
  source: 'story_bank.md',
  title: 'Story Bank',
  blurb:
    'A small set of real moments, each cut to one story you can tell in two minutes, with ' +
    'every behavioural question it can answer. Learn the stories, then pick by what the ' +
    'question tests.',
  href: '/practice/story-bank',
} as const

/**
 * The Story Bank's customer groups, in display order. Each is a tab on the page (ENH-25),
 * holding the stories whose H2 starts with one of its `prefixes`; stories that match none
 * share a last "Build your own" tab. The page-length check groups the same way.
 */
export const STORY_GROUPS = [
  {
    id: 'asian-life-insurer',
    title: 'Asian life insurer',
    context: 'A short project to help insurance teams ask questions about sensitive company data safely.',
    bestFor: 'Understanding a customer, keeping the first launch small, handling a problem, and earning trust.',
    prefixes: ['The insurer:'],
  },
  {
    id: 'consumer-lender',
    title: 'Indian consumer lender',
    context: 'A project to help an IT team investigate lead-routing issues without making risky automatic changes.',
    bestFor: 'Learning a new customer system, making safe choices, and being honest about results.',
    prefixes: ['The lender:'],
  },
  {
    id: 'meridian-assist',
    title: 'Meridian Assist reference build',
    context: 'A small reference system used to prove that answers are safe, checked, and backed by evidence.',
    bestFor: 'High standards, testing, owning mistakes, and explaining safety to non-technical people.',
    prefixes: ['Meridian:'],
  },
  {
    id: 'cross-engagement',
    title: 'Guardrails and reusable patterns',
    context: 'Stories about saying no safely, writing down known gaps, and sharing useful lessons with other teams.',
    bestFor: 'Making a difficult call, keeping people safe, and having impact beyond one customer.',
    prefixes: ['The guardrail engine:', 'Financial services:', 'Beyond one engagement:'],
  },
] as const

/** The Story Bank group a story belongs to, from its H2 title; undefined for "Build your own". */
export const storyGroupOf = (title: string) => STORY_GROUPS.find((g) => g.prefixes.some((p) => title.startsWith(p)))

// ---------------------------------------------------------------- reading-page tabs

/**
 * Every tab a reading page can have. `id` is the stored, linked identifier and never
 * changes; `label` is what the reader sees; `purpose` is the one line shown at the top
 * of the tab. The source file names in `scripts/case-studies.mjs` point at these ids.
 */
export const TABS: Record<string, { label: string; purpose: string; short?: string }> = {
  'company-guide': {
    label: 'Company Guide',
    purpose: 'A company-specific preparation guide for this interview loop.',
  },
  main: {
    label: 'Interview Guide',
    purpose:
      'Start here. The answer you would talk through in the interview, readable on its own.',
  },
  'deep-dive': {
    label: 'Technical Deep Dive',
    purpose:
      'Read after the Interview Guide. The detail behind each component, for follow-up questions.',
  },
  'cheat-sheet': {
    label: 'Quick Review',
    purpose: 'The whole case on one page, for recall before an interview. Assumes the guide.',
  },
  'full-pack': {
    label: 'Sources and Full Design',
    short: 'Full Design',
    purpose:
      'The complete, referenced write-up behind the other tabs. The sources for every tab live here.',
  },
  worksheet: {
    label: 'Practice Worksheet',
    purpose:
      'Attempt the case yourself first. Read-only here — use the interactive version to save answers.',
  },
  'answer-key': {
    label: 'Model Answer',
    purpose: 'Compare after attempting the worksheet: the ground a strong answer covers.',
  },
  'tutorial-v2': {
    label: 'Tutorial',
    purpose: 'The full lesson: how to reason through this case from first question to rollout.',
  },
  casebook: {
    label: 'Interview Casebook',
    purpose: 'Start here. The case as you would present it, with the likely follow-ups.',
  },
  'full-design': {
    label: 'Reference Design',
    purpose: 'The complete long-form design behind the casebook, for depth and follow-ups.',
  },
  'worked-example': {
    label: 'Worked Example',
    purpose: 'Start here. One travel-agent problem taken through every part of the framework.',
  },
  'framework-overview': {
    label: '12-Part Framework',
    purpose: 'The general framework the worked example applies, to reuse on any design question.',
  },
  guide: {
    label: 'Interview Guide',
    purpose: 'The complete case in one document — no companion tabs are needed.',
  },
  'interview-template': {
    label: 'Answer Template',
    purpose: 'A reusable structure for answering this question under time pressure.',
  },
}

/**
 * A tab's label and purpose, including a tab split into parts (ENH-25). A tab too long
 * for one page is split at its H2s: part 1 keeps the tab's id, so saved read state holds;
 * later parts are `<id>-part-<n>`. Every part is labelled "<short label> <n>". `parts`
 * is how many parts the tab has on its page.
 */
export function tabMeta(id: string, parts = 1): { label: string; purpose: string } | undefined {
  const part = id.match(/^(.+)-part-(\d+)$/)
  const tab = TABS[part ? part[1] : id]
  if (!tab) return undefined
  return parts > 1 ? { label: `${tab.short ?? tab.label} ${part ? part[2] : 1}`, purpose: tab.purpose } : tab
}

/** Reading speed used for expected-time estimates. Dense technical prose, so slow. */
export const WORDS_PER_MINUTE = 180

/**
 * Words a reader reads in a markdown document: words outside code fences (diagrams and
 * code are not read word by word). Reading time and the page-length limit (ENH-25) both
 * count with it, so "2,500 words" and "14 min read" measure the same thing.
 */
export function wordCount(markdown: string): number {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w)).length
}

/**
 * Whole minutes to read a markdown document: its `wordCount` at WORDS_PER_MINUTE,
 * rounded up, never zero. The one reading-time rule (ENH-22): the Learn and casebook
 * syncs and the pages all call it, so a page and its listing show the same time.
 */
export function readingMinutes(markdown: string): number {
  return Math.max(1, Math.ceil(wordCount(markdown) / WORDS_PER_MINUTE))
}

// ---------------------------------------------------------------- Last-Day Review

export type Review = {
  number: number
  /** The review's lesson slug in the final week (I3). */
  dir: string
  title: string
  blurb: string
  /** Practice worksheets to do first: `track/slug`. */
  learnFirst: string[]
  /** Case studies that show the concept in a complete system: `track/slug`. */
  goDeeper: string[]
}

export const REVIEWS: Review[] = [
  { number: 1, dir: 'module-01-fde-problem-decomposition', title: 'FDE Problem Decomposition',
    blurb: 'The six-bucket discovery model and the ten questions that turn a vague ask into a problem statement.',
    learnFirst: ['core/internal-knowledge-assistant', 'core/sales-copilot'],
    goDeeper: ['judgement-and-decomposition/decomposition-classics-67-68-69', 'delivery-evaluation-operations/scoping-to-deployed-agent', 'judgement-and-decomposition/prioritize-ai-use-cases'] },
  { number: 2, dir: 'module-02-functional-requirements', title: 'Functional Requirements',
    blurb: 'Twelve reusable functional-requirement patterns and the trigger phrases that signal each one.',
    learnFirst: ['core/service-now-ticket-agent', 'core/legal-contract-copilot'],
    goDeeper: ['agents-that-act/customer-support-automation', 'agents-that-act/sales-copilot'] },
  { number: 3, dir: 'module-03-non-functional-requirements', title: 'Non-Functional Requirements',
    blurb: 'Turning “fast, safe, reliable, cheap” into measurable targets with a stated workload and window.',
    learnFirst: ['core/healthcare-prior-auth-assistant', 'core/financial-compliance-reviewer'],
    goDeeper: ['platforms-and-scale/consumer-scale-chat-service', 'judgement-and-decomposition/scale-prototype-to-production'] },
  { number: 4, dir: 'module-04-core-architecture-building-blocks', title: 'Core Architecture Building Blocks',
    blurb: 'API gateway versus model gateway, router versus orchestrator, and the seven blocks that recur in every design.',
    learnFirst: ['system-design/enterprise-chatbot-platform', 'system-design/configurable-platform-customer-specific-workflows'],
    goDeeper: ['standalone-designs/production-llm-gateway', 'standalone-designs/travel-agent-worked-example'] },
  { number: 5, dir: 'module-05-rag-and-enterprise-data', title: 'RAG and Enterprise Data',
    blurb: 'Recall versus precision, grounded versus correct, and the debugging order for a broken retrieval pipeline.',
    learnFirst: ['system-design/enterprise-knowledge-assistant-rag', 'core/internal-knowledge-assistant'],
    goDeeper: ['knowledge-retrieval/enterprise-knowledge-assistant', 'knowledge-retrieval/nl-over-governed-data', 'knowledge-retrieval/document-review-copilot', 'judgement-and-decomposition/build-when-customer-data-is-poor'] },
  { number: 6, dir: 'module-06-agentic-architecture', title: 'Agentic Architecture',
    blurb: 'Workflow versus bounded agent, and what actually justifies the coordination cost of more than one agent.',
    learnFirst: ['system-design/tool-using-ai-agent-with-safety-controls', 'core/sre-triage-agent'],
    goDeeper: ['knowledge-retrieval/deep-research-agent', 'agents-that-act/enterprise-coding-assistant', 'standalone-designs/self-adapting-agent', 'standalone-designs/personal-assistant-with-memory'] },
  { number: 7, dir: 'module-07-tools-actions-and-enterprise-integration', title: 'Tools, Actions and Enterprise Integration',
    blurb: 'Controlled tool layers, scoped credentials, and read versus write operations against real systems.',
    learnFirst: ['core/service-now-ticket-agent', 'system-design/ai-customer-support-automation'],
    goDeeper: ['agents-that-act/tool-using-agent-with-safety-controls', 'agents-that-act/logistics-exception-handling'] },
  { number: 8, dir: 'module-08-guardrails-policy-and-human-approval', title: 'Guardrails, Policy and Human Approval',
    blurb: 'Recommend versus act, durable human-in-the-loop workflows, approval binding, and fail-closed sensitive writes.',
    learnFirst: ['system-design/tool-using-ai-agent-with-safety-controls', 'core/healthcare-prior-auth-assistant'],
    goDeeper: ['agents-that-act/tool-using-agent-with-safety-controls', 'agents-that-act/sre-incident-response-agent'] },
  { number: 9, dir: 'module-09-scaling-ai-systems', title: 'Scaling AI Systems',
    blurb: 'Noisy-neighbour fairness, admission control, and finding the bottleneck when more workers do not help.',
    learnFirst: ['system-design/high-volume-batch-inference-system', 'system-design/secure-multi-tenant-ai-platform'],
    goDeeper: ['platforms-and-scale/high-volume-batch-pipeline', 'platforms-and-scale/consumer-scale-chat-service', 'platforms-and-scale/llm-inference-serving'] },
  { number: 10, dir: 'module-10-latency-optimization', title: 'Latency Optimisation',
    blurb: 'Tail latency, the critical path, streaming versus completion, and when asynchronous work actually helps.',
    learnFirst: ['system-design/natural-language-to-sql-analytics-assistant', 'core/executive-dashboard-copilot'],
    goDeeper: ['agents-that-act/real-time-call-assistant', 'platforms-and-scale/llm-inference-serving'] },
  { number: 11, dir: 'module-11-cost-optimization', title: 'Cost Optimisation',
    blurb: 'Cost attribution, context growth, model routing, and cost per successful task — not per request.',
    learnFirst: ['system-design/high-volume-batch-inference-system', 'core/retail-demand-explainer'],
    goDeeper: ['platforms-and-scale/high-volume-batch-pipeline', 'platforms-and-scale/agent-platform-for-non-technical-users', 'standalone-designs/production-llm-gateway'] },
  { number: 12, dir: 'module-12-reliability-and-failure-handling', title: 'Reliability and Failure Handling',
    blurb: 'Idempotency, bounded retry, retry amplification, durable recovery, and dead-letter handling.',
    learnFirst: ['system-design/reliable-workflow-orchestration-system'],
    goDeeper: ['standalone-designs/reliable-workflow-orchestration', 'agents-that-act/logistics-exception-handling'] },
  { number: 13, dir: 'module-13-ai-evaluation', title: 'AI Evaluation',
    blurb: 'Task success versus good wording, deterministic checks versus semantic rubrics, and online versus offline evidence.',
    learnFirst: ['system-design/llm-evaluation-and-release-gating-platform'],
    goDeeper: ['delivery-evaluation-operations/evaluation-and-release-gating', 'model-development/model-development-and-post-training'] },
  { number: 14, dir: 'module-14-release-and-change-management', title: 'Release and Change Management',
    blurb: 'Shadow versus canary, scoped rollout, rollback versus undo, and version-compatible in-flight state.',
    learnFirst: ['system-design/llm-evaluation-and-release-gating-platform', 'system-design/configurable-platform-customer-specific-workflows'],
    goDeeper: ['delivery-evaluation-operations/evaluation-and-release-gating', 'delivery-evaluation-operations/scoping-to-deployed-agent', 'standalone-designs/configurable-platform-customer-workflows'] },
  { number: 15, dir: 'module-15-observability-and-production-operations', title: 'Observability and Production Operations',
    blurb: 'Logs versus metrics versus traces versus audit trail, and SLI/SLO/SLA discipline for a probabilistic system.',
    learnFirst: ['system-design/observability-customer-facing-ai-application'],
    goDeeper: ['delivery-evaluation-operations/observability-and-production-diagnosis', 'agents-that-act/sre-incident-response-agent'] },
  { number: 16, dir: 'module-16-security-and-enterprise-multi-tenancy', title: 'Security and Enterprise Multi-Tenancy',
    blurb: 'Authentication versus authorisation versus business policy, least privilege, and end-to-end tenant isolation.',
    learnFirst: ['system-design/secure-multi-tenant-ai-platform', 'system-design/ai-system-for-an-air-gapped-environment', 'core/multi-tenant-saas-support'],
    goDeeper: ['platforms-and-scale/secure-multi-tenant-ai-platform', 'standalone-designs/air-gapped-ai-system'] },
  { number: 17, dir: 'module-17-trade-off-thinking', title: 'Trade-Off Thinking',
    blurb: 'Justifying complexity against a requirement, and stating the trade-off out loud instead of hiding it.',
    learnFirst: ['system-design/enterprise-chatbot-platform', 'core/retail-demand-explainer'],
    goDeeper: ['judgement-and-decomposition/scale-prototype-to-production', 'judgement-and-decomposition/build-when-customer-data-is-poor', 'platforms-and-scale/agent-platform-for-non-technical-users'] },
  { number: 18, dir: 'module-18-end-to-end-fde-interview-execution', title: 'End-to-End FDE Interview Execution',
    blurb: 'Discover → require → design → stress-test → ship and operate, walked through as one continuous answer.',
    learnFirst: ['system-design/enterprise-chatbot-platform', 'core/internal-knowledge-assistant'],
    goDeeper: ['standalone-designs/travel-agent-worked-example', 'standalone-designs/enterprise-chatbot-platform', 'standalone-designs/recruiting-platform'] },
]

/** A review's lesson page. Its one-page memory card is the lesson's Recall card tab (`#recall-card`). */
export const reviewHref = (r: Review) => `${LAST_DAY.href}/${r.dir}`

/** The final week's two guides, its first two lessons (found by `source`). */
export const LAST_DAY_GUIDES = [
  {
    id: 'roadmap',
    source: 'Roadmap.md',
    title: 'Learning Roadmap',
    eyebrow: 'Start here',
    blurb:
      'The mental model behind all eighteen reviews: what to ask, what requirement it ' +
      'creates, which component answers it, and the trade-off it introduces.',
  },
  {
    id: 'rapid-revision',
    source: 'Rapid_Revision_Guide.md',
    title: 'Rapid Revision Guide',
    eyebrow: 'Final rehearsal',
    blurb:
      'The whole interview flow compressed into one pass — discovery, requirements, ' +
      'components, retrieval, agents and operations — for the last read before the loop.',
  },
] as const

// ---------------------------------------------------------------- scorecard remediation

/** Weak on a scorecard row? These reviews cover it. Keys are the row's area label. */
export const SCORECARD_REMEDIATION: Record<string, number[]> = {
  'Problem framing': [1, 2, 3],
  Architecture: [4, 17],
  Evaluation: [13],
  'Production thinking': [12, 14, 15],
  Communication: [18],
}

// ---------------------------------------------------------------- page metadata

const FDE_AUDIENCE =
  'Engineers preparing for Forward Deployed, solutions or applied-AI engineering interviews'

/** Family defaults, keyed by track id. Every published page resolves through one. */
export const FAMILY_META: Record<string, EditorialMeta> = {
  core: {
    mode: 'practice',
    audience: FDE_AUDIENCE,
    difficulty: 'Intermediate',
    prerequisites: [
      'Working familiarity with LLM applications: prompting, retrieval and tool calls',
    ],
    outcomes: [
      'Turn a vague customer request into users, workflows and measurable requirements',
      'Propose a first architecture and say how you would evaluate and roll it out',
    ],
    howToUse:
      'Time-box it to about 45 minutes. Draft each section before opening its model answer — ' +
      'a rough attempt teaches more than a blank one, and you do not need to fill every cell.',
    sourceStatus: 'original',
    // Fact-check round 2 (CONTENT-18): external claims checked against official docs.
  },
  'system-design': {
    mode: 'practice',
    audience: FDE_AUDIENCE,
    difficulty: 'Advanced',
    prerequisites: [
      'Two or three Discovery Foundations scenarios completed',
      'Comfort with retrieval, agents, queues and multi-tenant cloud architecture',
    ],
    outcomes: [
      'Find the one constraint that makes the scenario dangerous before designing',
      'Defend an architecture, evaluation plan and rollout under follow-up questions',
    ],
    howToUse:
      'Allow about an hour. Work the discovery sections properly — they decide the design — ' +
      'then compare each section with the model answer and score yourself honestly.',
    sourceStatus: 'derived',
    // Fact-check round 2 (CONTENT-18): external claims checked against official docs.
  },
  'fde-competencies': {
    mode: 'behavioural',
    audience: 'Candidates with real customer-facing delivery experience to draw on',
    difficulty: 'Intermediate',
    prerequisites: [
      'A short list of six to ten real engagements you can talk about in detail',
    ],
    outcomes: [
      'Read a strong answer for each question and practise it in your own words',
      'Track which answers you have not started, are practising, or have mastered',
    ],
    howToUse:
      'Read the sample answer, practise the structure in your own words, and choose a status ' +
      'for each question. Use the Story Bank to find a real experience that fits the question.',
    sourceStatus: 'personal',
    personalisation: true,
  },
}

const CASE_STUDY_BASE: Omit<EditorialMeta, 'difficulty' | 'outcomes'> = {
  mode: 'case-study',
  audience: FDE_AUDIENCE,
  prerequisites: [
    'Comfort with retrieval, agents and basic cloud architecture — the related reviews below cover each',
  ],
  howToUse:
    'Read the tabs in order. The Interview Guide stands alone; later tabs assume it. Mark ' +
    'each tab as read to track the case as one unit.',
  sourceStatus: 'sourced',
}

for (const track of [
  'knowledge-retrieval',
  'agents-that-act',
  'platforms-and-scale',
  'delivery-evaluation-operations',
  'model-development',
]) {
  FAMILY_META[track] = {
    ...CASE_STUDY_BASE,
    // Round 1 of the fact check (CONTENT-18): every high- and medium-priority claim in
    // the twenty grouped cases checked against official docs and papers.
    difficulty: 'Advanced',
    outcomes: [
      'Explain the system end to end at interview depth, including its dangerous constraint',
      'Answer follow-up questions on components, failure modes, evaluation and rollout',
    ],
  }
}

FAMILY_META['standalone-designs'] = {
  ...CASE_STUDY_BASE,
  // Fact-check round 2 (CONTENT-18).
  difficulty: 'Advanced',
  howToUse:
    'Read the tabs left to right; a single-document case is complete on its own. Where a ' +
    'Practice Worksheet exists, attempt it before the Model Answer.',
  sourceStatus: 'derived',
  outcomes: [
    'Explain a complete design and the trade-offs behind it',
    'Reuse its structure on an unfamiliar design question',
  ],
}

FAMILY_META['judgement-and-decomposition'] = {
  ...CASE_STUDY_BASE,
  // Fact-check round 2 (CONTENT-18).
  difficulty: 'Intermediate',
  prerequisites: ['No specific technical prerequisite — these test reasoning, not components'],
  howToUse:
    'Before reading, spend five minutes sketching your own answer. Then read the guide and ' +
    'compare the structure, not just the conclusion.',
  sourceStatus: 'original',
  outcomes: [
    'Structure an open-ended or business-judgement question in the first five minutes',
    'Explain what you would do first, and why, when the data or scope is poor',
  ],
}

FAMILY_META['blitzy-prep'] = {
  ...CASE_STUDY_BASE,
  mode: 'company-prep',
  difficulty: 'Intermediate',
  sourceStatus: 'original',
  prerequisites: ['Read the Start Here guide before choosing a drill or topic'],
  howToUse:
    'Start with the coverage guide, then work through the documents that match your next interview round. Mark each guide as read when you can explain its key points out loud.',
  outcomes: [
    'Explain Blitzy’s product, customer and engineering context in interview-ready language',
    'Practise the code-review, incident, communication and scaling themes likely to appear in the loop',
  ],
}

export const REVISION_META: EditorialMeta = {
  mode: 'revision',
  audience: FDE_AUDIENCE,
  difficulty: 'Intermediate',
  prerequisites: [
    'You have already studied these concepts — through the practice worksheets and case studies, or elsewhere',
  ],
  outcomes: [
    'Recall the mental model, gotchas and trigger phrases for each topic under time pressure',
  ],
  howToUse:
    'Read the Interview Review once, then test yourself with the One-Page Recall Card. If a ' +
    'concept is new rather than rusty, open the “learn first” link instead.',
  sourceStatus: 'original',
}

export const ORIENTATION_META: EditorialMeta = {
  mode: 'orientation',
  audience: FDE_AUDIENCE,
  difficulty: 'Foundation',
  prerequisites: ['None — this is the place to start'],
  outcomes: [
    'Know the order of an FDE design answer and which review covers each step',
  ],
  howToUse:
    'Read it once end to end before the reviews. Come back to the mental model whenever a ' +
    'review feels disconnected from the rest.',
  sourceStatus: 'original',
  // Fact-check round 2 (CONTENT-18).
}

export const STORY_BANK_META: EditorialMeta = {
  mode: 'behavioural',
  audience: 'Candidates preparing the behavioural round',
  difficulty: 'Intermediate',
  prerequisites: ['Try a few behavioural worksheets first, so you know what the questions test'],
  outcomes: [
    'Tell each story in one line, then in two minutes',
    'Pick the right story for a question by what it tests',
    'Build the same bank from your own experience',
  ],
  howToUse:
    'Learn the one-liners first. Then take a worksheet question, choose a story from ' +
    '"Stories that fit" and say it out loud. Replace the examples with your own stories ' +
    'before the interview.',
  sourceStatus: 'personal',
}

export const FINAL_REHEARSAL_META: EditorialMeta = {
  ...REVISION_META,
  prerequisites: ['The eighteen reviews, or equivalent study'],
  outcomes: ['Walk the full interview flow from memory in one pass'],
  // Checked in fact-check round 2 (CONTENT-18), after the reviews in round 1.
  howToUse:
    'Read it the evening before or the morning of the interview. Anything that does not come ' +
    'back quickly points to the review to reopen.',
}

/**
 * The fields every published page must resolve. `check:content` fails a page that
 * resolves any of them to nothing.
 */
export const REQUIRED_META_FIELDS = [
  'mode',
  'audience',
  'difficulty',
  'prerequisites',
  'outcomes',
  'howToUse',
  'sourceStatus',
] as const

// ---------------------------------------------------------------- cross-links

/** Reviews that name this page as learn-first or go-deeper material. */
export function reviewsFor(ref: string): Review[] {
  return REVIEWS.filter((r) => r.learnFirst.includes(ref) || r.goDeeper.includes(ref))
}

/**
 * Practice worksheets and the case study that works the same problem space in full: the
 * one list of design–worksheet twins. Keyed by practice `track/slug`, valued by
 * case-study `track/slug`. The first five are the same scenario published twice; the
 * rest are close relatives. Each page, and each list page, links to the other under
 * TWIN_LABEL (ENH-21).
 */
export const RELATED_CASE: Record<string, string> = {
  'system-design/secure-multi-tenant-ai-platform': 'platforms-and-scale/secure-multi-tenant-ai-platform',
  'system-design/ai-system-for-an-air-gapped-environment': 'standalone-designs/air-gapped-ai-system',
  'system-design/reliable-workflow-orchestration-system': 'standalone-designs/reliable-workflow-orchestration',
  'system-design/configurable-platform-customer-specific-workflows': 'standalone-designs/configurable-platform-customer-workflows',
  'system-design/enterprise-chatbot-platform': 'standalone-designs/enterprise-chatbot-platform',
  'system-design/enterprise-knowledge-assistant-rag': 'knowledge-retrieval/enterprise-knowledge-assistant',
  'system-design/natural-language-to-sql-analytics-assistant': 'knowledge-retrieval/nl-over-governed-data',
  'system-design/ai-customer-support-automation': 'agents-that-act/customer-support-automation',
  'system-design/tool-using-ai-agent-with-safety-controls': 'agents-that-act/tool-using-agent-with-safety-controls',
  'system-design/llm-evaluation-and-release-gating-platform': 'delivery-evaluation-operations/evaluation-and-release-gating',
  'system-design/high-volume-batch-inference-system': 'platforms-and-scale/high-volume-batch-pipeline',
  'system-design/observability-customer-facing-ai-application': 'delivery-evaluation-operations/observability-and-production-diagnosis',
  'core/sales-copilot': 'agents-that-act/sales-copilot',
  'core/sre-triage-agent': 'agents-that-act/sre-incident-response-agent',
}

export const RELATED_PRACTICE: Record<string, string> = Object.fromEntries(
  Object.entries(RELATED_CASE).map(([p, c]) => [c, p]),
)

/** The twin links' labels: the same words on the pages, their foot and the list pages. */
export const TWIN_LABEL = {
  worksheet: 'Practise this as a worksheet',
  design: 'Read the worked design',
  classic: 'Read the classic design',
} as const

/**
 * Classic designs in Learn (T5.4) that a casebook case works in full: lesson slug → case
 * `track/slug`. The lesson and the case link to each other (ENH-21).
 */
export const CLASSIC_DESIGN_CASE: Record<string, string> = {
  'recruiting-platform-explainable-ranking-human-decisions': 'standalone-designs/recruiting-platform',
  'logistics-exceptions-designing-around-a-policy-gate': 'agents-that-act/logistics-exception-handling',
  'access-controlled-enterprise-rag': 'knowledge-retrieval/enterprise-knowledge-assistant',
  'customer-support-assistant-knowledge-actions-and-approval': 'agents-that-act/customer-support-automation',
  'coding-assistant-context-engineering-under-300-ms': 'agents-that-act/enterprise-coding-assistant',
}

/** How demanding a case or worksheet is, for the /design and /practice filters (ENH-23). */
export type Level = 'foundation' | 'core' | 'advanced'

export const LEVEL_LABEL: Record<Level, string> = { foundation: 'Foundation', core: 'Core', advanced: 'Advanced' }

/**
 * The level of every case and worksheet, keyed by `track/slug` (ENH-23; the owner reviews
 * these). Foundation: a single well-known system, a first worksheet. Core: the usual
 * interview depth. Advanced: scale, isolation, platforms or staff-level judgement.
 * check:content fails when a published case or worksheet has no level.
 */
export const LEVELS: Record<string, Level> = {
  // core
  'core/internal-knowledge-assistant': 'foundation',
  'core/sales-copilot': 'foundation',
  'core/financial-compliance-reviewer': 'foundation',
  'core/healthcare-prior-auth-assistant': 'foundation',
  'core/legal-contract-copilot': 'foundation',
  'core/sre-triage-agent': 'foundation',
  'core/multi-tenant-saas-support': 'foundation',
  'core/retail-demand-explainer': 'foundation',
  'core/service-now-ticket-agent': 'foundation',
  'core/executive-dashboard-copilot': 'foundation',
  // system-design
  'system-design/enterprise-knowledge-assistant-rag': 'core',
  'system-design/secure-multi-tenant-ai-platform': 'advanced',
  'system-design/natural-language-to-sql-analytics-assistant': 'core',
  'system-design/ai-customer-support-automation': 'core',
  'system-design/ai-system-for-an-air-gapped-environment': 'advanced',
  'system-design/llm-evaluation-and-release-gating-platform': 'advanced',
  'system-design/high-volume-batch-inference-system': 'core',
  'system-design/tool-using-ai-agent-with-safety-controls': 'core',
  'system-design/reliable-workflow-orchestration-system': 'core',
  'system-design/observability-customer-facing-ai-application': 'core',
  'system-design/configurable-platform-customer-specific-workflows': 'core',
  'system-design/enterprise-chatbot-platform': 'core',
  // fde-competencies
  'fde-competencies/customer-focus-and-discovery': 'foundation',
  'fde-competencies/communication-and-influence': 'core',
  'fde-competencies/pushback-and-saying-no': 'core',
  'fde-competencies/delivery-under-pressure': 'core',
  'fde-competencies/ownership-standards-and-failure': 'core',
  'fde-competencies/scale-beyond-yourself': 'advanced',
  'fde-competencies/leading-people': 'advanced',
  // knowledge-retrieval
  'knowledge-retrieval/enterprise-knowledge-assistant': 'foundation',
  'knowledge-retrieval/nl-over-governed-data': 'core',
  'knowledge-retrieval/document-review-copilot': 'core',
  'knowledge-retrieval/deep-research-agent': 'advanced',
  // agents-that-act
  'agents-that-act/customer-support-automation': 'foundation',
  'agents-that-act/tool-using-agent-with-safety-controls': 'core',
  'agents-that-act/sre-incident-response-agent': 'core',
  'agents-that-act/sales-copilot': 'foundation',
  'agents-that-act/enterprise-coding-assistant': 'advanced',
  'agents-that-act/real-time-call-assistant': 'advanced',
  'agents-that-act/logistics-exception-handling': 'core',
  // platforms-and-scale
  'platforms-and-scale/secure-multi-tenant-ai-platform': 'advanced',
  'platforms-and-scale/high-volume-batch-pipeline': 'core',
  'platforms-and-scale/agent-platform-for-non-technical-users': 'advanced',
  'platforms-and-scale/consumer-scale-chat-service': 'advanced',
  'platforms-and-scale/llm-inference-serving': 'advanced',
  // delivery-evaluation-operations
  'delivery-evaluation-operations/scoping-to-deployed-agent': 'core',
  'delivery-evaluation-operations/evaluation-and-release-gating': 'core',
  'delivery-evaluation-operations/observability-and-production-diagnosis': 'core',
  // model-development
  'model-development/model-development-and-post-training': 'advanced',
  // standalone-designs
  'standalone-designs/recruiting-platform': 'core',
  'standalone-designs/travel-agent-worked-example': 'foundation',
  'standalone-designs/air-gapped-ai-system': 'advanced',
  'standalone-designs/reliable-workflow-orchestration': 'core',
  'standalone-designs/configurable-platform-customer-workflows': 'core',
  'standalone-designs/enterprise-chatbot-platform': 'foundation',
  'standalone-designs/self-adapting-agent': 'advanced',
  'standalone-designs/personal-assistant-with-memory': 'core',
  'standalone-designs/production-llm-gateway': 'core',
  // judgement-and-decomposition
  'judgement-and-decomposition/prioritize-ai-use-cases': 'foundation',
  'judgement-and-decomposition/scale-prototype-to-production': 'core',
  'judgement-and-decomposition/build-when-customer-data-is-poor': 'core',
  'judgement-and-decomposition/decomposition-classics-67-68-69': 'foundation',
}

/**
 * Content-type qualifier appended where a scenario name is not unique across the site —
 * search results, breadcrumbs, browser titles and prev/next. The canonical title itself
 * stays unqualified. Which titles collide is worked out from the manifest, so a new
 * duplicate is qualified without anyone remembering to list it.
 */
export function qualifierFor(mode: ContentMode): string {
  if (mode === 'case-study') return 'Case Study'
  if (mode === 'company-prep') return 'Company Prep'
  return 'Practice Worksheet'
}

export const normaliseTitle = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '')
