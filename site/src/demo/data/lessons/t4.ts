/**
 * Sample lesson bodies for T4 (Production AI Systems) in the /demo prototype.
 * These illustrate the house lesson shape; they are not final curriculum text.
 */
import type { Lesson } from '../../types'

export const LESSONS_T4: Lesson[] = [
  // ── T4.1 Enterprise RAG in production ────────────────────────────────────
  {
    id: 't4-1-l1',
    moduleId: 't4-1',
    order: 1,
    title: 'Enforce Access Control at Retrieval Time',
    tagline: 'Filtering inside the index keeps answers safe but ties retrieval to a permission model you must keep in sync.',
    readingMin: 7,
    objectives: [
      'Explain why permissions must apply before ranking, not after generation',
      'Choose between ACL lists and attribute-based rules for a document corpus',
      'Design a permission sync that handles revocation within an agreed window',
    ],
    sections: [
      {
        heading: 'Filter by permission before retrieval',
        body: 'Attach access metadata to every chunk at ingestion time and pass the caller identity into the vector query as a filter. The search engine then ranks only documents the user may read. If you retrieve first and filter afterwards, the top-k list can be emptied by the filter, and restricted text may already have leaked into logs, caches or a reranker prompt.',
      },
      {
        heading: 'Pick a permission model that matches the source',
        body: 'Access control lists (ACLs) copy the source system group memberships onto each chunk; they are simple but grow large when groups nest. Attribute-based access control (ABAC) evaluates rules such as region, department and clearance against user attributes at query time; it scales better but needs a policy engine and well-maintained attributes.',
      },
      {
        heading: 'Treat revocation as a service level',
        body: 'Agree with the customer how quickly a removed permission must take effect, then design the sync to meet it. Event-driven updates from the identity provider beat nightly batch jobs when the window is minutes rather than hours.',
      },
    ],
    workedExample: {
      title: 'A regional insurer with 40,000 policy documents',
      body: 'Claims handlers in three regions share one index. Each chunk carries region and line-of-business attributes. A handler in the north region queries with a filter of region equal to north and line in motor or home. Top-k of 20 returns 20 eligible chunks. Under the earlier design, which filtered after retrieval, the same query returned 20 chunks of which 14 were dropped, leaving six weak matches and a noticeably worse answer.',
    },
    warning: 'Filtering after retrieval is the most common enterprise RAG mistake. It degrades recall and can expose restricted text to intermediate components before the filter runs.',
    takeaways: [
      'Permissions are a retrieval filter, not a post-processing step',
      'ACLs are simple; ABAC scales but needs a policy engine',
      'Revocation latency is a requirement to agree and measure',
    ],
    checkYourself: [
      'Why does post-retrieval filtering hurt recall as well as security?',
      'When would you move from ACLs to ABAC for a corpus?',
      'How would you test that a revoked user can no longer retrieve a document?',
    ],
    referenceIds: ['ref-owasp-llm', 'ref-rag-paper'],
  },
  {
    id: 't4-1-l2',
    moduleId: 't4-1',
    order: 2,
    title: 'Build an Ingestion Pipeline That Stays Fresh',
    tagline: 'Incremental ingestion keeps the index current but adds change tracking and delete handling you must get right.',
    readingMin: 6,
    objectives: [
      'Describe the stages of a production ingestion pipeline',
      'Handle updates and deletions without full re-indexing',
      'Track freshness as a measurable property of the index',
    ],
    sections: [
      {
        heading: 'Split ingestion into idempotent stages',
        body: 'Fetch, parse, chunk, embed and upsert should each be a separate step keyed by document id and content hash. If a stage fails, you can replay it without duplicating chunks. Storing the hash lets you skip embedding when a document is touched but not changed, which saves both time and money.',
      },
      {
        heading: 'Propagate deletes as carefully as inserts',
        body: 'A deleted or archived source document must remove every chunk derived from it. Keep a mapping from document id to chunk ids so deletion is a targeted operation. Without it, stale chunks keep answering questions long after the source is gone, and nobody notices until a customer quotes outdated policy.',
      },
      {
        heading: 'Measure freshness explicitly',
        body: 'Record the source modified time and the indexed time for each document. The gap between them is your freshness lag. Alert when the p95 lag exceeds the agreed target, for example one hour for policy documents.',
      },
    ],
    workedExample: {
      title: 'Nightly versus incremental sync for 120,000 pages',
      body: 'A 500-user support org re-embedded its full knowledge base every night: 120,000 pages, roughly 600,000 chunks, six hours of embedding time. Change logs showed only about 1,500 pages changed per day. Switching to hash-based incremental sync cut daily embedding to around 7,500 chunks and brought freshness lag from up to 24 hours down to a p95 of 20 minutes.',
    },
    warning: 'Teams often build inserts carefully and forget deletes. An index that never forgets is a correctness and compliance problem, not just a tidiness issue.',
    takeaways: [
      'Key every stage by document id and content hash',
      'Deletes need a document-to-chunk mapping',
      'Freshness lag is a metric with a target',
    ],
    checkYourself: [
      'What breaks if the chunk stage is not idempotent?',
      'How would you detect stale chunks from deleted documents?',
      'What freshness target would you propose for a pricing catalogue?',
    ],
    referenceIds: ['ref-ddia', 'ref-rag-paper'],
  },
  {
    id: 't4-1-l3',
    moduleId: 't4-1',
    order: 3,
    title: 'Add Guardrails and Grounded Citations',
    tagline: 'Strict grounding checks reduce unsupported answers but increase refusals users may find unhelpful.',
    readingMin: 6,
    objectives: [
      'Place input and output guardrails in a RAG request path',
      'Require citations that map to retrieved chunks',
      'Tune refusal behaviour against a measured baseline',
    ],
    sections: [
      {
        heading: 'Check inputs before they reach the model',
        body: 'Input guardrails classify the request for scope, abuse and personal data before retrieval runs. Out-of-scope questions can be routed to a fixed response or a human queue, which is cheaper and more predictable than letting the model improvise.',
      },
      {
        heading: 'Require every claim to cite a retrieved chunk',
        body: 'Ask the model to attach chunk ids to each statement, then verify in code that every cited id was actually retrieved for this request. A lightweight grounding check, such as an entailment classifier, can flag sentences that the cited text does not support. Unsupported answers are rewritten or replaced with a clear statement that the sources do not cover the question.',
      },
    ],
    workedExample: {
      title: 'Tuning a grounding threshold',
      body: 'A regional insurer tested its claims assistant on 300 labelled questions. With no grounding check, 11 percent of answers contained an unsupported claim. A threshold of 0.5 on the entailment score cut that to 3 percent while raising refusals from 4 to 9 percent. A threshold of 0.8 reached 1 percent unsupported but 21 percent refusals, which handlers rejected in testing. The team shipped 0.5 and logged every refusal for review.',
    },
    warning: 'Guardrails without a baseline are guesswork. Measure unsupported-claim and refusal rates before and after each change, or you cannot tell whether a guardrail helps.',
    takeaways: [
      'Guard inputs for scope and data, outputs for grounding',
      'Verify citations in code, not by trusting the model',
      'Every guardrail threshold trades safety against helpfulness',
    ],
    checkYourself: [
      'Why verify cited chunk ids in code rather than in the prompt?',
      'What two rates would you track when tuning a grounding threshold?',
      'Where in the request path should personal data detection run?',
    ],
    referenceIds: ['ref-owasp-llm', 'ref-ragas'],
  },

  // ── T4.2 Evaluation and release gates ────────────────────────────────────
  {
    id: 't4-2-l1',
    moduleId: 't4-2',
    order: 1,
    title: 'Build a Golden Set That Reflects Real Traffic',
    tagline: 'A larger golden set gives tighter estimates but costs expert labelling time you must budget for.',
    readingMin: 7,
    objectives: [
      'Sample golden set cases from real or realistic traffic',
      'Write reference answers and pass criteria experts agree on',
      'Size the set for the decisions it must support',
    ],
    sections: [
      {
        heading: 'Sample from the traffic you expect',
        body: 'Pull questions from logs, support tickets or customer workshops, then stratify by intent and difficulty so rare but important cases are present. Add adversarial and out-of-scope cases on purpose. A set of easy questions written by the build team will flatter every model.',
      },
      {
        heading: 'Define pass criteria, not just reference answers',
        body: 'For each case, record the facts the answer must contain, the facts it must not contain, and the source documents that support it. Criteria are easier for two reviewers to agree on than prose answers, and they make automated grading possible later.',
      },
      {
        heading: 'Size the set for the decision',
        body: 'With 200 cases and a true pass rate near 85 percent, the 95 percent confidence interval is roughly plus or minus five points. If you need to detect a two-point regression, you need far more cases or a paired comparison on the same items.',
      },
    ],
    workedExample: {
      title: 'Golden set for a 500-user support org',
      body: 'The team sampled 400 tickets across eight intents, weighting billing and outages because they drive escalations. Two senior agents wrote pass criteria; they agreed on 92 percent of cases at first pass and resolved the rest in one session. The set took about 30 expert hours. It revealed that the prototype passed 90 percent of how-to questions but only 61 percent of billing disputes.',
    },
    warning: 'Vibes-based evaluation, where a few people try some prompts and declare it good, cannot detect regressions or compare versions. It also fails silently on the cases nobody thought to try.',
    takeaways: [
      'Stratify cases by intent and difficulty',
      'Pass criteria beat free-text reference answers',
      'Set size follows from the smallest change you must detect',
    ],
    checkYourself: [
      'Why include deliberately out-of-scope questions in a golden set?',
      'What is the rough confidence interval on 200 cases at 85 percent?',
      'How would you keep the golden set current as the product changes?',
    ],
    referenceIds: ['ref-ragas'],
  },
  {
    id: 't4-2-l2',
    moduleId: 't4-2',
    order: 2,
    title: 'Validate an LLM Judge Before You Trust It',
    tagline: 'An LLM judge scales evaluation but adds a model you must validate.',
    readingMin: 7,
    objectives: [
      'Write a judge rubric with narrow, checkable criteria',
      'Measure judge agreement against human labels',
      'Recognise common judge biases and control for them',
    ],
    sections: [
      {
        heading: 'Give the judge one narrow question at a time',
        body: 'Ask separate binary questions such as whether the answer contains a required fact or whether every claim is supported by the cited text. Broad one-to-ten quality scores drift and are hard to calibrate. Supply the pass criteria and source text so the judge grades against evidence rather than its own knowledge.',
      },
      {
        heading: 'Measure agreement with humans',
        body: 'Have experts label a held-out sample of 100 to 200 judge decisions. Report agreement and Cohen kappa per criterion, and inspect disagreements by category. A judge that agrees 95 percent on factual coverage but 70 percent on tone should only gate on coverage.',
      },
      {
        heading: 'Control for known biases',
        body: 'Judges tend to prefer longer answers, the first option in pairwise comparisons and outputs from their own model family. Randomise order, cap length differences and re-validate whenever you change the judge model or prompt.',
      },
    ],
    workedExample: {
      title: 'Validating a groundedness judge',
      body: 'A regional insurer labelled 150 answers by hand. The first judge prompt agreed with humans on 81 percent, with a kappa of 0.58, and over-passed long answers. Splitting the rubric into per-sentence support checks raised agreement to 93 percent and kappa to 0.84. The team accepted the judge for release gating on groundedness only and kept human review for tone.',
    },
    warning: 'Unvalidated LLM judges produce confident numbers with unknown error. If you have not measured agreement with humans, the score is an opinion, not a metric.',
    takeaways: [
      'Narrow binary criteria make judges reliable',
      'Report agreement and kappa per criterion',
      'Re-validate after any change to the judge',
    ],
    checkYourself: [
      'Why is kappa more informative than raw agreement?',
      'Name two biases common to pairwise LLM judges.',
      'When should a criterion stay with human reviewers?',
    ],
    referenceIds: ['ref-ragas'],
  },
  {
    id: 't4-2-l3',
    moduleId: 't4-2',
    order: 3,
    title: 'Set Release Gates and Online Evaluation',
    tagline: 'Hard release gates prevent regressions but can block urgent fixes unless you define an override path.',
    readingMin: 6,
    objectives: [
      'Turn offline metrics into explicit release gates',
      'Choose online signals that confirm offline results',
      'Define who can override a gate and how it is recorded',
    ],
    sections: [
      {
        heading: 'Write gates as thresholds plus non-regression rules',
        body: 'A gate states a minimum, such as groundedness of at least 95 percent, and a maximum regression against the current production version, such as no more than two points on any intent slice. Slice-level rules catch a change that improves the average while breaking one important intent.',
      },
      {
        heading: 'Confirm with online signals after release',
        body: 'Offline sets age. Track thumbs-down rate, escalation to a human, answer edit distance and task completion in production, and sample live traffic for judge scoring. Feed failures back into the golden set so the next offline run covers them.',
      },
    ],
    workedExample: {
      title: 'A gate that caught a slice regression',
      body: 'A 500-user support org tested a new retrieval configuration. Overall pass rate rose from 84 to 87 percent, but billing disputes fell from 78 to 70 percent. The slice rule blocked the release. The team found that a smaller chunk size had split invoice tables across chunks, fixed the parser and shipped a week later with billing at 80 percent. Online escalation rate then fell from 12 to 10 percent over two weeks.',
    },
    warning: 'Gating only on the average hides slice regressions. Always report and gate on the slices the customer cares about most.',
    takeaways: [
      'Gates combine absolute thresholds with non-regression rules',
      'Online signals validate and refresh offline sets',
      'Overrides need an owner and a written record',
    ],
    checkYourself: [
      'Why can an average improvement hide a release risk?',
      'Which online signals would you track for a support assistant?',
      'What should an override record contain?',
    ],
    referenceIds: ['ref-ragas', 'ref-accelerate'],
  },

  // ── T4.3 Observability and production diagnosis ──────────────────────────
  {
    id: 't4-3-l1',
    moduleId: 't4-3',
    order: 1,
    title: 'Trace Every Request End to End',
    tagline: 'Rich traces speed up diagnosis but store sensitive text you must redact and retain carefully.',
    readingMin: 6,
    objectives: [
      'Instrument a RAG or agent request as a tree of spans',
      'Record the attributes needed to replay a failure',
      'Redact personal data before it reaches the telemetry store',
    ],
    sections: [
      {
        heading: 'Model each request as a span tree',
        body: 'Use OpenTelemetry or a similar standard to create a root span per user request, with child spans for retrieval, reranking, each model call and each tool call. Record latency, token counts, model version, prompt version and retrieved document ids on the relevant span. With this structure you can see where the time and the error came from.',
      },
      {
        heading: 'Redact before export',
        body: 'Run personal data detection in the application or the collector, before spans leave your boundary. Replace names, account numbers and contact details with typed placeholders, and keep raw text only in a short-retention store with tighter access. Many teams keep full prompts for seven days and redacted spans for ninety.',
      },
    ],
    workedExample: {
      title: 'Finding a slow step in a claims assistant',
      body: 'A regional insurer saw p95 latency rise from 4.1 to 7.8 seconds. Traces showed retrieval at 300 milliseconds and generation unchanged, but a new policy-lookup tool span at p95 of 3.6 seconds, called twice per request on 40 percent of traffic. Caching lookups by policy id for five minutes brought p95 back to 4.4 seconds within a day.',
    },
    warning: 'Logging prompts without redaction turns your observability platform into an uncontrolled copy of customer data, often with wider access than the source system.',
    takeaways: [
      'One root span per request, child spans per step',
      'Record versions and document ids for replay',
      'Redact at source and separate retention for raw text',
    ],
    checkYourself: [
      'Which attributes would you need to replay a bad answer?',
      'Where should redaction happen, and why there?',
      'How would you find which step caused a p95 regression?',
    ],
    referenceIds: ['ref-sre'],
  },
  {
    id: 't4-3-l2',
    moduleId: 't4-3',
    order: 2,
    title: 'Define SLOs and Diagnose Incidents',
    tagline: 'Quality SLOs catch silent failures but are noisier and slower to measure than latency SLOs.',
    readingMin: 7,
    objectives: [
      'Write latency, availability and quality SLOs for an AI service',
      'Use an error budget to decide when to pause changes',
      'Run a structured diagnosis when quality drops',
    ],
    sections: [
      {
        heading: 'Set SLOs on what users feel',
        body: 'Typical service level objectives (SLOs) cover availability, p95 time to first token and p95 full-response latency. Add a quality SLO, such as judge-scored groundedness on a daily sample, because an AI service can return fast, valid responses that are wrong. Each SLO implies an error budget: at 99.5 percent availability, about 3.6 hours of failure per month.',
      },
      {
        heading: 'Diagnose by narrowing the layer',
        body: 'When a quality metric drops, check in order: did any version change, did input traffic shift, did retrieval results change, did the model provider change behaviour? Compare traces from before and after on the same slice. Most incidents trace back to a change someone made, so a change log keyed to timestamps is the fastest tool you have.',
      },
    ],
    workedExample: {
      title: 'A quality incident with no errors',
      body: 'A 500-user support org saw daily groundedness fall from 96 to 88 percent with zero HTTP errors. The change log showed no prompt or model change. Retrieval spans showed the median number of chunks returned had fallen from 8 to 3. A connector credential had expired two days earlier, so new articles were not indexed and many queries matched nothing relevant. Renewing the credential and backfilling restored 95 percent within six hours.',
    },
    warning: 'Monitoring only latency and errors misses the failures that matter most in AI systems. Without a quality signal, wrong answers look like a healthy service.',
    takeaways: [
      'Pair latency and availability SLOs with a quality SLO',
      'Error budgets decide when to slow change',
      'Diagnose top down: versions, inputs, retrieval, provider',
    ],
    checkYourself: [
      'How much monthly downtime does a 99.9 percent SLO allow?',
      'Why does an AI service need a quality SLO?',
      'What would you check first when quality drops without errors?',
    ],
    referenceIds: ['ref-sre'],
  },

  // ── T4.4 Security, tenancy and prompt injection ──────────────────────────
  {
    id: 't4-4-l1',
    moduleId: 't4-4',
    order: 1,
    title: 'Threat Model an AI System and Its Tenants',
    tagline: 'Shared infrastructure keeps costs down but raises the stakes of every tenant isolation bug.',
    readingMin: 7,
    objectives: [
      'List the assets, entry points and trust boundaries of an AI system',
      'Choose a tenancy model for indexes, caches and logs',
      'Map threats to concrete controls',
    ],
    sections: [
      {
        heading: 'Draw the trust boundaries first',
        body: 'Sketch the request path and mark every point where data crosses from one trust level to another: user input, retrieved documents, tool outputs, third-party model APIs and telemetry. Each crossing is an entry point. List the assets behind it, such as customer documents, credentials and tool permissions, and ask what an attacker could read or change.',
      },
      {
        heading: 'Isolate tenants in every store',
        body: 'Tenancy is not only the vector index. Semantic caches, conversation memory, logs and fine-tuning data all hold tenant data. Options range from a tenant id filter on shared stores to separate namespaces or separate deployments. Stronger isolation costs more but limits the damage a single bug can do.',
      },
    ],
    workedExample: {
      title: 'A cache that crossed tenants',
      body: 'A platform serving 30 insurance brokers used a shared semantic cache keyed only on the embedding of the question. Two brokers asking about the same commission rule received the same cached answer, which quoted one broker confidential rate table. The fix added tenant id and permission scope to the cache key, which lowered the hit rate from 34 to 22 percent but closed the leak. A threat model would have flagged the cache as a tenant data store.',
    },
    warning: 'Teams isolate the vector index and forget caches, memory and logs. Every component that stores model inputs or outputs needs a tenancy decision.',
    takeaways: [
      'Every trust boundary crossing is an entry point',
      'Caches, memory and logs are tenant data stores',
      'Isolation strength is a cost and blast-radius trade-off',
    ],
    checkYourself: [
      'Name four trust boundary crossings in a RAG system.',
      'Why must a semantic cache key include tenant scope?',
      'When would you choose separate deployments per tenant?',
    ],
    referenceIds: ['ref-owasp-llm'],
  },
  {
    id: 't4-4-l2',
    moduleId: 't4-4',
    order: 2,
    title: 'Defend Against Prompt Injection',
    tagline: 'Limiting tool permissions contains injection damage but reduces what the assistant can do unaided.',
    readingMin: 7,
    objectives: [
      'Distinguish direct and indirect prompt injection',
      'Apply least privilege to tools an agent can call',
      'Add confirmation and detection layers for risky actions',
    ],
    sections: [
      {
        heading: 'Treat retrieved text as untrusted input',
        body: 'Indirect injection hides instructions inside documents, emails or web pages the system retrieves. The model cannot reliably tell data from instructions, so no prompt wording fully prevents it. Mark retrieved content clearly, but design on the assumption that some injected instructions will be followed.',
      },
      {
        heading: 'Constrain what a successful injection can do',
        body: 'Give each tool the narrowest scope it needs and run it with the end user permissions, not a service account. Require human confirmation for actions that send data out, spend money or change records. Block outbound links and image rendering in answers, since both can exfiltrate data through URLs.',
      },
      {
        heading: 'Test with an injection suite',
        body: 'Keep a set of documents containing injection attempts and run it in CI. Track the rate at which the system follows them as a release metric.',
      },
    ],
    workedExample: {
      title: 'An email assistant with a send tool',
      body: 'An assistant for a 500-user support org could read inbound email and draft replies. A test email contained hidden text telling the assistant to forward the last ten tickets to an outside address. In red teaming, the unprotected version complied in 7 of 50 attempts. Restricting the send tool to reply-only, adding a confirmation step for new recipients and stripping external links brought successful exfiltration to 0 of 50.',
    },
    warning: 'Trusting retrieved text is the root of most injection incidents. A document in your index is attacker-controlled input if anyone outside your team can write to its source.',
    takeaways: [
      'Indirect injection arrives through retrieved content',
      'Least privilege limits the blast radius',
      'Confirmation gates belong on irreversible actions',
    ],
    checkYourself: [
      'Why can prompt wording alone not prevent injection?',
      'How can a rendered image leak data?',
      'Which tool actions should always require confirmation?',
    ],
    referenceIds: ['ref-owasp-llm', 'ref-mcp'],
  },

  // ── T4.5 Cost and latency optimisation ───────────────────────────────────
  {
    id: 't4-5-l1',
    moduleId: 't4-5',
    order: 1,
    title: 'Model Cost and Latency from First Principles',
    tagline: 'A simple per-request model is quick to build but hides the tail effects that drive real latency.',
    readingMin: 7,
    objectives: [
      'Estimate monthly cost from traffic and token counts',
      'Break latency into time to first token and generation time',
      'Measure p50 and p95 before proposing changes',
    ],
    sections: [
      {
        heading: 'Build the cost model from tokens',
        body: 'Cost per request is input tokens times input price plus output tokens times output price, summed over every model call in the request. Multiply by daily requests and add retrieval, reranking and infrastructure. Agents and multi-step chains often make four to ten calls per request, so count calls before counting tokens.',
      },
      {
        heading: 'Split latency into its parts',
        body: 'Time to first token depends mainly on input length, queueing and network; generation time scales with output tokens. Retrieval, reranking and tool calls add sequential steps. Measure each from traces and report p50 and p95, because users notice the tail and averages hide it.',
      },
    ],
    workedExample: {
      title: 'Costing a support assistant',
      body: 'A 500-user support org sends 20,000 requests a day, each with 3,000 input tokens and 300 output tokens, one model call per request. At an illustrative 3 dollars per million input tokens and 15 dollars per million output tokens, that is 180 dollars of input and 90 dollars of output per day, about 8,100 dollars a month. Traces showed p95 latency of 6.2 seconds, of which 2.4 seconds was time to first token and 2.9 seconds generation.',
    },
    warning: 'Optimising before measuring wastes effort on the wrong driver. Build the cost and latency breakdown first, then target the largest component.',
    takeaways: [
      'Count model calls per request before counting tokens',
      'Report p95, not only averages',
      'The breakdown tells you which lever matters',
    ],
    checkYourself: [
      'What dominates cost when input tokens far exceed output tokens?',
      'Which latency component grows with answer length?',
      'Why can a four-call agent cost more than a larger single-call model?',
    ],
    referenceIds: ['ref-sre'],
  },
  {
    id: 't4-5-l2',
    moduleId: 't4-5',
    order: 2,
    title: 'Apply the Eight Cost and Latency Drivers',
    tagline: 'Routing simple requests to a smaller model saves money but adds a classifier whose mistakes cost quality.',
    readingMin: 8,
    objectives: [
      'Name the eight common cost and latency drivers',
      'Estimate the saving from each before implementing it',
      'Check every optimisation against the quality gate',
    ],
    sections: [
      {
        heading: 'Work through the drivers in order of impact',
        body: 'The usual drivers are model choice, input tokens, output tokens, number of calls, caching, batching, parallelism and streaming. Trimming retrieved context and system prompts cuts input tokens. Capping answer length cuts output. Merging chain steps cuts calls. Prompt caching and response caching avoid repeated work, batching suits offline jobs, parallel tool calls reduce wall-clock time and streaming improves perceived latency.',
      },
      {
        heading: 'Re-run evaluation after every change',
        body: 'Each optimisation can lower quality: a smaller model may miss nuance, fewer chunks may drop the answer, a shorter output may omit a caveat. Treat every cost change as a release and run it through the same gates as a feature.',
      },
    ],
    workedExample: {
      title: 'Halving the support assistant bill',
      body: 'Starting from 8,100 dollars a month, the team reduced retrieved chunks from 10 to 5 after reranking, cutting input from 3,000 to 1,800 tokens. Prompt caching on the 800-token system prompt lowered the effective input price for that portion. Routing 55 percent of simple how-to questions to a model one fifth the price saved more. The combined bill fell to about 3,100 dollars a month, and the golden set pass rate moved from 87 to 86 percent, within the gate.',
    },
    warning: 'Cutting cost without re-running the quality gate is a common way to ship a cheaper but worse product. Always pair the saving with the evaluation result.',
    takeaways: [
      'Eight drivers cover most cost and latency work',
      'Estimate each saving before building it',
      'Every optimisation passes the same quality gate',
    ],
    checkYourself: [
      'Which drivers reduce perceived latency but not cost?',
      'What risk does model routing introduce?',
      'Why does reranking make it safer to send fewer chunks?',
    ],
    referenceIds: ['ref-rerank', 'ref-lost-middle'],
  },

  // ── T4.6 Scaling and reliability ─────────────────────────────────────────
  {
    id: 't4-6-l1',
    moduleId: 't4-6',
    order: 1,
    title: 'Scale Ingestion and Serving Independently',
    tagline: 'Queue-based ingestion absorbs spikes but delays freshness when the backlog grows.',
    readingMin: 6,
    objectives: [
      'Separate ingestion and query workloads',
      'Use queues and backpressure to protect shared dependencies',
      'Plan capacity against provider rate limits',
    ],
    sections: [
      {
        heading: 'Decouple ingestion from the query path',
        body: 'Put ingestion work on a queue with its own workers so a large backfill cannot starve live queries. Scale workers on queue depth and oldest-message age. Give ingestion a separate embedding quota or a lower priority so it yields when user traffic peaks.',
      },
      {
        heading: 'Apply backpressure before dependencies fail',
        body: 'Model providers enforce requests-per-minute and tokens-per-minute limits. Track usage against them and slow producers before you hit the limit, rather than retrying into it. Concurrency limits per tenant stop one large customer consuming the whole budget.',
      },
    ],
    workedExample: {
      title: 'A backfill that took down search',
      body: 'A regional insurer onboarded a new line of business with 900,000 pages. The backfill shared the embedding quota of 1 million tokens per minute with live queries. Within an hour, query embedding calls were throttled and p95 search latency reached 14 seconds. Splitting quotas to 700,000 for ingestion and 300,000 reserved for queries, with workers scaling on queue age, kept query p95 under 1 second while the backfill finished in 31 hours.',
    },
    warning: 'No backpressure or degradation plan means the first traffic spike or large backfill becomes an outage. Rate limits are capacity you must plan, not an error to retry.',
    takeaways: [
      'Ingestion and queries scale on different signals',
      'Reserve capacity for the user-facing path',
      'Throttle producers before hitting provider limits',
    ],
    checkYourself: [
      'Which metrics should drive ingestion worker scaling?',
      'Why is blind retrying against a rate limit harmful?',
      'How would you stop one tenant consuming all capacity?',
    ],
    referenceIds: ['ref-ddia', 'ref-sre'],
  },
  {
    id: 't4-6-l2',
    moduleId: 't4-6',
    order: 2,
    title: 'Plan for Failure and Graceful Degradation',
    tagline: 'Fallbacks keep the service up but return answers of lower quality you must label honestly.',
    readingMin: 6,
    objectives: [
      'Design timeouts, retries and circuit breakers for model calls',
      'Define a degradation ladder from full answer to safe fallback',
      'Test failure modes before they happen in production',
    ],
    sections: [
      {
        heading: 'Bound every dependency call',
        body: 'Set a timeout on each model, retrieval and tool call based on its p99 latency, retry only idempotent calls with exponential backoff and jitter, and add a circuit breaker so a failing provider is skipped quickly instead of tying up threads. Without bounds, one slow dependency turns into a full outage.',
      },
      {
        heading: 'Write the degradation ladder',
        body: 'List the steps the system takes as conditions worsen: switch to a secondary model, drop reranking, return search results without a generated answer, then show a clear message with a human contact. Agree with the customer which steps are acceptable, and label degraded answers so users know what they are getting.',
      },
    ],
    workedExample: {
      title: 'A provider outage handled well',
      body: 'A 500-user support org depended on one hosted model. When the provider returned errors on 60 percent of calls for 40 minutes, the circuit breaker opened after 20 failures in 30 seconds. Traffic moved to a secondary model with a pre-tested prompt, which scored 4 points lower on the golden set. Answers carried a reduced-quality notice. Ticket deflection fell by 6 percent during the window instead of to zero.',
    },
    warning: 'A fallback model that has never been evaluated is not a plan. Run the secondary path through the golden set and keep its prompt current.',
    takeaways: [
      'Timeouts, retries and breakers bound every call',
      'A degradation ladder is agreed in advance',
      'Fallback paths need their own evaluation',
    ],
    checkYourself: [
      'Why add jitter to retry backoff?',
      'What are the steps of a reasonable degradation ladder?',
      'How would you rehearse a provider outage safely?',
    ],
    referenceIds: ['ref-sre', 'ref-ddia'],
  },

  // ── T4.7 AgentOps ────────────────────────────────────────────────────────
  {
    id: 't4-7-l1',
    moduleId: 't4-7',
    order: 1,
    title: 'Version Prompts and Models Like Code',
    tagline: 'Running evaluations on every change slows merges but stops silent regressions reaching users.',
    readingMin: 6,
    objectives: [
      'Version prompts, model ids and retrieval settings together',
      'Run evaluation automatically in CI on every change',
      'Record which configuration produced each response',
    ],
    sections: [
      {
        heading: 'Store the whole configuration as one versioned unit',
        body: 'A behaviour change can come from the prompt, the model id, temperature, retrieval settings or tool definitions. Keep them together in version control as a single configuration with a version id, and stamp that id on every trace. Pin model ids to dated versions rather than floating aliases, so a provider update does not change behaviour without your knowledge.',
      },
      {
        heading: 'Gate merges on evaluation',
        body: 'Run a fast subset of the golden set on every pull request and the full set before release. Post the results, including slice changes, on the pull request so reviewers see the effect of a one-line prompt edit.',
      },
    ],
    workedExample: {
      title: 'A one-word prompt change',
      body: 'An engineer at a regional insurer changed concise to brief in the system prompt to shorten answers. The CI run on 80 fast cases showed average length down 22 percent, but the required-caveat criterion fell from 97 to 84 percent because the model dropped regulatory disclaimers. The pull request was revised to state the caveat requirement explicitly, and the next run passed at 98 percent.',
    },
    warning: 'Shipping prompt edits without evals is the most common source of silent regressions. Prompts are code; a small wording change can alter behaviour on many slices at once.',
    takeaways: [
      'Version the full configuration, not just the prompt',
      'Pin dated model versions',
      'Evaluation results belong on the pull request',
    ],
    checkYourself: [
      'Which settings besides the prompt can change behaviour?',
      'Why avoid floating model aliases in production?',
      'How large should a per-pull-request eval subset be?',
    ],
    referenceIds: ['ref-accelerate'],
  },
  {
    id: 't4-7-l2',
    moduleId: 't4-7',
    order: 2,
    title: 'Roll Out Changes with Canaries and Red Teaming',
    tagline: 'Canary rollouts limit blast radius but need enough traffic to detect a regression in time.',
    readingMin: 7,
    objectives: [
      'Plan a staged canary rollout with rollback criteria',
      'Choose metrics that can detect regressions on small traffic',
      'Run red teaming before and after major changes',
    ],
    sections: [
      {
        heading: 'Stage the rollout with explicit rollback rules',
        body: 'Send 5 percent of traffic to the new version, then 25, then 100, holding each stage long enough to collect a meaningful sample. Write rollback triggers in advance, such as an error rate above 1 percent or a thumbs-down rate two points above control. Keep the previous configuration deployable so rollback is a configuration switch, not a rebuild.',
      },
      {
        heading: 'Red team before major releases',
        body: 'Before a new model, tool or data source goes live, run structured attacks: prompt injection, data exfiltration, jailbreaks and harmful-advice probes. Record successful attacks as test cases so they join the automated suite.',
      },
    ],
    workedExample: {
      title: 'Sizing a canary stage',
      body: 'A 500-user support org handles 20,000 requests a day with a baseline thumbs-down rate of 4 percent. A 5 percent canary sees 1,000 requests a day. To detect a rise to 6 percent with reasonable confidence needs roughly 2,000 requests per arm, so the team held the canary for two days instead of two hours. On day two the canary showed 6.3 percent on billing questions, and the rollout was paused.',
    },
    warning: 'A canary held for too short a time gives false confidence. Size each stage from the baseline rate and the smallest regression you need to catch.',
    takeaways: [
      'Rollback triggers are written before rollout',
      'Canary duration follows from the sample size needed',
      'Red team findings become permanent test cases',
    ],
    checkYourself: [
      'What determines how long a canary stage must run?',
      'Name three rollback triggers for an assistant release.',
      'Why add successful attacks to the automated suite?',
    ],
    referenceIds: ['ref-accelerate', 'ref-owasp-llm', 'ref-sre'],
  },

  // ── T4.8 Model adaptation and inference serving ──────────────────────────
  {
    id: 't4-8-l1',
    moduleId: 't4-8',
    order: 1,
    title: 'Choose Between Prompting, RAG and Fine-Tuning',
    tagline: 'Fine-tuning can fix style and format cheaply at inference but locks knowledge in at training time.',
    readingMin: 7,
    objectives: [
      'Match the adaptation method to the problem being solved',
      'Explain why fine-tuning is a poor way to add facts',
      'Estimate the data and maintenance cost of each option',
    ],
    sections: [
      {
        heading: 'Start with prompting and measure the gap',
        body: 'Clear instructions and a few examples solve many problems at no training cost. Run the golden set and classify the failures: missing knowledge, wrong format, wrong tone or weak reasoning. The failure type points to the next step.',
      },
      {
        heading: 'Use RAG for knowledge and fine-tuning for behaviour',
        body: 'Retrieval supplies facts that change and can be cited and permission-filtered. Fine-tuning teaches consistent format, tone, classification labels or a narrow task, and can let a smaller model match a larger one on that task. It needs hundreds to thousands of quality examples and a retraining plan whenever requirements change.',
      },
    ],
    workedExample: {
      title: 'Claims triage at a regional insurer',
      body: 'The team needed claims routed into 14 categories in a fixed JSON format, and answers about current policy terms. Prompting a large model reached 88 percent routing accuracy at 0.9 cents per claim. Fine-tuning a small model on 4,000 labelled claims reached 93 percent at 0.1 cents. Policy questions stayed on RAG, because terms change quarterly and every answer had to cite the current wording.',
    },
    warning: 'Fine-tuning to inject facts produces a model that states stale facts confidently, cannot cite sources and cannot respect document permissions. Use retrieval for knowledge.',
    takeaways: [
      'Classify failures before choosing a method',
      'RAG for changing facts, fine-tuning for stable behaviour',
      'Fine-tuning brings a data and retraining commitment',
    ],
    checkYourself: [
      'Which failure types suggest fine-tuning?',
      'Why can a fine-tuned model not respect document permissions?',
      'What ongoing cost does fine-tuning add?',
    ],
    referenceIds: ['ref-rag-paper'],
  },
  {
    id: 't4-8-l2',
    moduleId: 't4-8',
    order: 2,
    title: 'Size Self-Hosted Inference Serving',
    tagline: 'Larger batches raise GPU throughput but increase per-request latency.',
    readingMin: 8,
    objectives: [
      'Estimate GPU memory for weights and KV cache',
      'Explain how continuous batching trades latency for throughput',
      'Decide when self-hosting beats a hosted API',
    ],
    sections: [
      {
        heading: 'Budget memory for weights and KV cache',
        body: 'Weights need roughly parameters times bytes per parameter: an 8-billion-parameter model in 16-bit precision needs about 16 GB. The KV cache stores keys and values for every token in flight, sized at two times layers times KV heads times head dimension times bytes per token. The remaining memory after weights caps how many concurrent sequences you can serve.',
      },
      {
        heading: 'Tune batching against the latency SLO',
        body: 'Continuous batching adds new requests to the running batch as others finish, keeping the GPU busy. Larger batches raise tokens per second overall but slow each request. Load test with realistic prompt and output lengths, and pick the largest batch that still meets your p95 target.',
      },
    ],
    workedExample: {
      title: 'One 80 GB GPU for an 8-billion-parameter model',
      body: 'The model has 32 layers, 8 KV heads and head dimension 128. In 16-bit precision the KV cache is 2 times 32 times 8 times 128 times 2 bytes, or 128 KB per token. Weights take 16 GB; allowing 8 GB for overhead leaves about 56 GB, room for roughly 450,000 cached tokens. At 4,000 tokens per sequence that is about 110 concurrent requests, enough for a 500-user support org peak of 60.',
    },
    warning: 'Sizing on weights alone is a common mistake. The KV cache, not the weights, usually limits concurrency on long prompts.',
    takeaways: [
      'Memory equals weights plus KV cache plus overhead',
      'Batch size trades throughput against latency',
      'Self-host only when utilisation and control justify it',
    ],
    checkYourself: [
      'How does grouped-query attention reduce KV cache size?',
      'Why does doubling context length halve concurrency?',
      'What utilisation would justify self-hosting over an API?',
    ],
    referenceIds: ['ref-ddia'],
  },
]
