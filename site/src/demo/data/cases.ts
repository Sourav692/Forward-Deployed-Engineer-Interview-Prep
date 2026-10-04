/**
 * Sample case studies for the /demo prototype. Original illustrative content written
 * for the prototype only, not drawn from the repository's prep material.
 */
import type { CaseStudy } from '../types'

export const CASES: CaseStudy[] = [
  {
    id: 'case-enterprise-assistant',
    code: 'C01',
    title: 'Permission-aware enterprise knowledge assistant',
    summary:
      'An assistant that answers employee questions from wikis, tickets and shared drives while never revealing a document the asker cannot already open.',
    pattern: 'Permission-aware RAG',
    difficulty: 'medium',
    moduleIds: ['t2-2', 't2-4', 't4-1', 't4-4'],
    main: [
      {
        heading: 'Requirements',
        body:
          'Employees ask natural-language questions and get cited answers drawn from roughly two million documents across a wiki, a ticketing system and shared drives. The hard requirement is that answers respect source permissions exactly: a user must never see text from a document they could not open directly. Secondary requirements are freshness within fifteen minutes of an edit, p95 latency under four seconds, and a clear "I could not find this" response instead of a guess. Usage is bursty around Monday mornings and quarter ends, with about five thousand daily active users.',
      },
      {
        heading: 'Architecture',
        body:
          'Connectors pull content and access control lists from each source into a normalised document store. An indexing pipeline chunks documents, embeds the chunks and writes them to a hybrid index that holds both vectors and BM25 terms, with each chunk carrying the principal ids allowed to read it. The query service resolves the caller to their groups, filters retrieval by those principals, reranks the survivors and passes the top passages to the model with a citation-first prompt. An evaluation service and a trace store sit beside the request path rather than in it.',
      },
      {
        heading: 'Data flow',
        body:
          'On ingest, a connector emits a change event with the document body and its current access list. The pipeline splits the body on headings, attaches title and path metadata, embeds each chunk and upserts it with the access list as a filterable field. On query, the service expands the user into group ids through the identity provider, issues a filtered hybrid search for forty candidates, reranks to eight, and builds a prompt that numbers each passage. The answer is returned with passage numbers mapped back to source links the user can click.',
      },
      {
        heading: 'Evaluation',
        body:
          'A golden set of three hundred questions is written with subject-matter owners, each tagged with the documents that should be cited and the persona asking. Retrieval is measured with recall@8 against those documents, and answers are scored for groundedness and correctness by an LLM judge calibrated against fifty human-graded examples. A separate permission suite runs every question as several personas and fails the build if any answer cites a document the persona cannot read. Release gates require no permission leaks and no regression greater than two points on groundedness.',
      },
      {
        heading: 'Risks',
        body:
          'The largest risk is a permission leak caused by stale access lists, for example when someone leaves a team but the index still lists them. Other risks are low adoption if early answers are confidently wrong, prompt injection hidden in user-editable wiki pages, and cost growth as the corpus expands. Mitigations are short access-list sync intervals with a deny-on-doubt rule, visible citations and an honest refusal path, treating retrieved text as untrusted data in the prompt, and a per-tenant budget with alerts on token spend per answer.',
      },
    ],
    deepDive: [
      {
        heading: 'Keep access lists in sync',
        body:
          'Content changes and permission changes travel on different clocks. Many sources emit an event when a page is edited but not when a group membership changes, so a pure event-driven sync drifts. The robust pattern is two loops: an event loop for content and a frequent reconciliation job that recomputes effective access for documents whose groups changed. Store group ids rather than expanded user lists on each chunk, then expand the caller at query time. Group membership churn then becomes one cheap identity lookup instead of a mass reindex.',
      },
      {
        heading: 'Filter before ranking, not after',
        body:
          'Filtering results after retrieval looks simpler but fails in two ways. It can return too few results when most top candidates are forbidden, and it leaks information through timing and result counts. Push the principal filter into the index query itself so forbidden chunks never enter the candidate set. If the index cannot filter efficiently on large group lists, partition by department or sensitivity tier first, then filter inside the partition. Test the filter with a persona who belongs to no groups: they should get only public content.',
      },
      {
        heading: 'Design the permission test suite',
        body:
          'Ordinary quality metrics will not catch a leak, because a leaked answer is often a very good answer. Build a dedicated suite: pick twenty restricted documents, write questions only they can answer, and run each question as an allowed and a denied persona. The denied run must refuse or answer from public material only. Add regression cases for every incident. Run the suite on every index rebuild and every prompt change, and treat a single failure as a release blocker rather than a score to trade off.',
      },
      {
        heading: 'Handle the honest "not found"',
        body:
          'Users forgive a clear refusal far more readily than a confident wrong answer. Set a retrieval confidence floor from reranker scores and route low-scoring queries to a refusal template that suggests where to look or whom to ask. Track the refusal rate as a product metric: rising refusals point at coverage gaps in the connectors, while falling refusals with flat groundedness can signal that the floor is too permissive. Review a sample of refusals weekly with content owners to decide which gaps to close.',
      },
    ],
    cheatSheet: [
      'Store group ids on chunks, expand the caller at query time.',
      'Filter inside the index query, never after ranking.',
      'Two sync loops: content events plus permission reconciliation.',
      'Hybrid retrieval of about 40 candidates, rerank to about 8.',
      'Permission suite runs each question as allowed and denied personas.',
      'Any permission leak is a release blocker, not a metric.',
      'Treat retrieved text as untrusted data, not instructions.',
      'A clear refusal beats a confident guess: track refusal rate.',
    ],
  },
  {
    id: 'case-claims-copilot',
    code: 'C02',
    title: 'Insurer claims triage copilot',
    summary:
      'A copilot that reads incoming insurance claims, summarises them, flags missing evidence and suggests a triage queue for a human handler to confirm.',
    pattern: 'Human-in-the-loop extraction and classification',
    difficulty: 'medium',
    moduleIds: ['t6-1', 't6-2', 't4-2', 't2-2'],
    main: [
      {
        heading: 'Requirements',
        body:
          'The claims team receives about four thousand new claims a day as emails, web forms and scanned attachments. Handlers spend the first twenty minutes of each claim working out what it is, whether evidence is missing and which queue it belongs in. The copilot must cut that triage time, never make a final coverage decision, and leave an auditable record of every suggestion. Accuracy matters more than speed: a misrouted fraud-risk claim is far more costly than a slow one. Personal data must stay in the insurer region.',
      },
      {
        heading: 'Architecture',
        body:
          'An intake service normalises emails, forms and documents into a single claim record. A document step runs OCR and layout extraction on attachments. The copilot service calls the model with the claim record, the relevant policy wording retrieved from a policy index, and a structured output schema covering summary, claim type, missing items and suggested queue with reasons. Results land in the existing claims system as a side panel. Handler accept, edit and override actions are logged and feed the evaluation set.',
      },
      {
        heading: 'Data flow',
        body:
          'A new claim triggers intake, which assembles text from the form, the email body and extracted attachment text. The service looks up the policy number, retrieves the matching wording sections, and sends both to the model with the schema. Schema validation rejects malformed output and retries once. The validated suggestion is written to the claim with model version and prompt version attached. When the handler confirms or changes the queue, that decision is stored beside the suggestion so the pair can be compared later.',
      },
      {
        heading: 'Evaluation',
        body:
          'Start with five hundred historical claims whose final queues and missing-evidence notes are already known. Measure queue accuracy, recall on missing evidence, and summary faithfulness checked by an LLM judge against the source text. Weight errors by cost: sending a fraud-risk claim to the fast-track queue counts many times more than the reverse. After launch, the override rate per queue becomes the main live signal, and a weekly sample of overrides is reviewed with a senior handler to find new failure patterns.',
      },
      {
        heading: 'Risks',
        body:
          'The main risks are automation bias, where handlers accept suggestions without reading them, silent drift as claim mix changes with the season, and poor OCR on phone photos of receipts. There is also a regulatory risk if the tool appears to make coverage decisions. Mitigations include showing reasons and evidence beside every suggestion, monitoring acceptance rates for suspiciously high values, a confidence threshold below which no queue is suggested, and wording in the interface that frames output as a draft for the handler.',
      },
    ],
    deepDive: [
      {
        heading: 'Discover the real triage process',
        body:
          'The documented process rarely matches what handlers do. Sit with three handlers for an hour each and record the questions they ask of each claim, the systems they open and the shortcuts they use. You will usually find unwritten rules, such as escalating any claim mentioning a solicitor. Capture these as explicit checks in the schema. Agree with the claims lead which decisions the copilot may suggest and which it must never touch, and write that boundary into the scope document.',
      },
      {
        heading: 'Weight the evaluation by cost',
        body:
          'Plain accuracy hides the errors that matter. Build a cost matrix with the claims lead: each cell is the cost of predicting queue A when the truth is queue B. Use it to score candidates and to set per-queue confidence thresholds. A model with lower accuracy can win if it makes fewer expensive mistakes. Report both numbers to stakeholders, and explain the matrix in business terms such as handler hours lost and leakage risk rather than abstract percentages.',
      },
      {
        heading: 'Watch for automation bias',
        body:
          'If handlers accept ninety-nine per cent of suggestions, either the model is excellent or nobody is checking. Seed a small number of known-answer claims into the stream to measure attention, show the evidence the suggestion relied on, and require a short reason when accepting a suggestion for a high-risk queue. Track time spent per claim alongside acceptance: a sharp drop in time with flat accuracy is good, while a sharp drop with rising downstream reopen rates is a warning.',
      },
    ],
    cheatSheet: [
      'Copilot suggests, the handler decides: never a coverage decision.',
      'Structured output schema with reasons and missing-evidence list.',
      'Retrieve policy wording to ground each suggestion.',
      'Evaluate with a cost matrix, not plain accuracy.',
      'Override rate per queue is the main live metric.',
      'Log model and prompt version with every suggestion.',
      'Watch acceptance rate for automation bias.',
    ],
  },
  {
    id: 'case-text-to-sql',
    code: 'C03',
    title: 'Text-to-SQL analytics assistant',
    summary:
      'An assistant that lets business users ask questions of a governed warehouse in plain English and returns a query, a result table and an explanation.',
    pattern: 'Semantic-layer grounded generation',
    difficulty: 'hard',
    moduleIds: ['t2-4', 't4-2', 't4-4', 't5-3'],
    main: [
      {
        heading: 'Requirements',
        body:
          'Analysts are a bottleneck: sales and finance teams wait days for simple numbers. The assistant must answer questions such as "revenue by region last quarter" against a warehouse of about four hundred tables, show the generated SQL, and explain assumptions. Results must match the numbers on official dashboards, so metric definitions cannot be improvised. Queries must respect row-level security, must be read-only, and must not run for more than thirty seconds or scan more than a set budget of data.',
      },
      {
        heading: 'Architecture',
        body:
          'The assistant sits on top of a semantic layer that defines certified metrics, dimensions and join paths. A schema retriever selects the relevant tables, columns and metric definitions for each question using descriptions and example queries. The model generates SQL against that narrowed context. A validator parses the SQL, checks it uses only allowed objects, enforces read-only and a row limit, and runs a dry-run cost estimate. The query executes under the caller\'s own warehouse identity, so existing row-level policies apply.',
      },
      {
        heading: 'Data flow',
        body:
          'A question arrives with the user identity. The retriever returns the top metric definitions, tables and a few similar question-and-SQL pairs from a curated library. The model drafts SQL plus a short statement of assumptions. The validator rejects anything that writes, touches a forbidden schema or exceeds the scan budget, returning the error to the model for one repair attempt. The approved query runs, results are returned as a table, and the model writes a two-sentence explanation that restates the metric definition and filters used.',
      },
      {
        heading: 'Evaluation',
        body:
          'Build a golden set of two hundred questions with reference SQL written by analysts. Compare by executing both queries and checking that the result sets match, rather than comparing SQL text. Track execution accuracy, the rate of invalid SQL, and the rate of questions the assistant correctly declines as ambiguous. Add adversarial cases that try to bypass row-level security or trigger expensive cross joins. Re-run the full set whenever the semantic layer, the schema descriptions or the prompt changes.',
      },
      {
        heading: 'Risks',
        body:
          'The worst failure is a plausible but wrong number that someone repeats in a board deck. Others are runaway query costs, data exposure through badly scoped credentials, and schema drift that silently breaks retrieval. Mitigations are grounding on certified metrics, always showing the SQL and the definition used, executing as the end user, strict validation with scan budgets, and a nightly job that re-runs golden questions so schema changes surface before users notice them.',
      },
    ],
    deepDive: [
      {
        heading: 'Ground on the semantic layer',
        body:
          'Letting the model write joins across four hundred raw tables invites subtle errors, such as double counting through a one-to-many join. Instead, expose certified metrics and their allowed dimensions, and have the model compose from those. Where no certified metric exists, the assistant should say so and offer the closest one rather than inventing a definition. This shifts much of the accuracy problem from generation to curation, which is where the analytics team already has expertise and ownership.',
      },
      {
        heading: 'Evaluate by execution, not by text',
        body:
          'Two correct queries can look completely different, and a query that looks right can return the wrong rows. Compare result sets instead: run reference and generated SQL against a frozen snapshot, normalise column order and rounding, and check equality. Keep the snapshot fixed so results are reproducible. Separately score whether the explanation states the metric and filters truthfully, because a correct table with a misleading explanation still misleads the reader.',
      },
      {
        heading: 'Contain cost and blast radius',
        body:
          'A single unbounded query can cost more than a month of model calls. Run a dry-run estimate before execution and refuse anything above the per-query budget, with a clear message suggesting a narrower filter. Use a dedicated warehouse pool with its own quota so assistant traffic cannot starve production dashboards. Cache results for identical normalised queries for a short window, since popular questions repeat heavily on Monday mornings and at month end.',
      },
      {
        heading: 'Handle ambiguity explicitly',
        body:
          'Questions like "top customers" hide choices about the metric, period and ranking. Teach the assistant to ask one clarifying question when a key choice is missing, or to state its default plainly when a sensible default exists. Measure how often it asks: too rarely means silent assumptions, too often means users abandon the tool. Record the clarifications users choose, because they reveal which defaults the business actually expects.',
      },
    ],
    cheatSheet: [
      'Generate against the semantic layer, not raw tables.',
      'Retrieve schema and example queries to narrow context.',
      'Validate: parse, read-only, allowed objects, scan budget.',
      'Execute as the end user so row-level security applies.',
      'Evaluate by comparing result sets on a frozen snapshot.',
      'Always show the SQL and the metric definition used.',
      'Ask one clarifying question when a key choice is missing.',
      'Separate warehouse pool and quota for assistant traffic.',
    ],
  },
  {
    id: 'case-support-agent',
    code: 'C04',
    title: 'Tool-using support agent with refunds',
    summary:
      'A customer support agent that looks up orders, answers policy questions and issues refunds within limits, escalating anything outside them to a person.',
    pattern: 'Bounded tool-calling agent',
    difficulty: 'hard',
    moduleIds: ['t3-1', 't3-5', 't4-4', 't4-6'],
    main: [
      {
        heading: 'Requirements',
        body:
          'A retailer handles about thirty thousand support chats a week, most about order status, returns and refunds. The agent must resolve routine cases end to end, including issuing refunds up to a set amount, and hand off cleanly to a human for anything else. Every refund must be correct, traceable and issued at most once. Customers must never be able to talk the agent into exceeding policy. Median response time should stay under five seconds per turn.',
      },
      {
        heading: 'Architecture',
        body:
          'An orchestrator runs the agent loop: the model reads the conversation, chooses a tool, the orchestrator executes it and returns the result. Tools are narrow and typed: get_order, get_policy, check_refund_eligibility, issue_refund and escalate_to_human. Policy limits are enforced inside the tools, not in the prompt. The refund tool requires an idempotency key and writes to an audit log. A step budget and a timeout stop runaway loops, and every turn is traced with tool inputs and outputs.',
      },
      {
        heading: 'Data flow',
        body:
          'A customer message arrives with an authenticated customer id. The model calls get_order, which only returns orders owned by that customer. For a refund request it calls check_refund_eligibility, which applies the policy and returns allowed amounts. If eligible, issue_refund runs with an idempotency key derived from order and reason, and the payment service confirms. The model then writes a reply quoting the amount and timeline. If eligibility fails or the amount exceeds the limit, the agent escalates with a summary for the human.',
      },
      {
        heading: 'Evaluation',
        body:
          'Offline, replay a few hundred anonymised historical conversations against a sandbox with fake orders and a mock payment service. Score task success, policy compliance, number of steps and tone. Build a red-team set of manipulative customers who claim false entitlements, paste instructions, or ask for other customers\' orders. Policy violations are zero-tolerance. Online, track resolution rate, escalation rate, refund amount distribution and customer satisfaction, with a canary release to a small share of traffic first.',
      },
      {
        heading: 'Risks',
        body:
          'Risks include duplicate refunds after retries, the agent being persuaded to exceed limits, data leakage across customers, and loops that burn tokens without progress. There is also reputational risk from tone in sensitive cases such as bereavement. Mitigations are idempotent refunds, limits enforced in code, tools scoped to the authenticated customer, a step budget with automatic escalation, and routing of sensitive intents straight to a person rather than attempting resolution.',
      },
    ],
    deepDive: [
      {
        heading: 'Put guardrails in tools, not prompts',
        body:
          'A prompt that says "never refund more than fifty pounds" is a suggestion the model may ignore under pressure. Move every hard rule into the tool: issue_refund checks the amount against policy and the order total, rejects anything over the limit, and returns a structured error. The model can then only choose among safe actions. Treat the prompt as guidance on tone and flow, and treat the tool layer as the security boundary that a determined customer cannot argue past.',
      },
      {
        heading: 'Make refunds idempotent',
        body:
          'Agent loops retry: a timeout from the payment service can lead the model to call issue_refund again. Derive an idempotency key from the order id and refund reason, store it with the result, and return the original result on a repeat call. Check the key before contacting the payment provider, and pass it through to the provider if it supports keys natively. Test by injecting timeouts in the sandbox and asserting exactly one refund per order and reason.',
      },
      {
        heading: 'Design the escalation path',
        body:
          'Escalation is a feature, not a failure. Define explicit triggers: policy rejection, repeated customer frustration, sensitive intents, step budget reached, or low confidence in the order match. On escalation, the agent writes a short structured summary covering what the customer wants, what was checked and what was offered, so the human does not start from scratch. Measure handoff quality by asking human agents to rate summaries, and track how often they have to re-ask the customer.',
      },
    ],
    cheatSheet: [
      'Narrow, typed tools: get_order, check eligibility, issue_refund, escalate.',
      'Policy limits live in the tool code, not the prompt.',
      'Idempotency key on every refund, derived from order and reason.',
      'Tools scoped to the authenticated customer only.',
      'Step budget and timeout, then escalate automatically.',
      'Red-team set of manipulative customers, zero policy violations.',
      'Escalation summary so humans never restart the conversation.',
    ],
  },
  {
    id: 'case-multi-tenant-rag',
    code: 'C05',
    title: 'Multi-tenant RAG platform for regulated clients',
    summary:
      'A shared retrieval and generation platform serving many regulated client organisations, each with strict data isolation, audit and residency needs.',
    pattern: 'Tenant-isolated RAG platform',
    difficulty: 'hard',
    moduleIds: ['t4-1', 't4-4', 't4-5', 't4-6'],
    main: [
      {
        heading: 'Requirements',
        body:
          'A software vendor wants to offer document question answering to around two hundred clients in finance and healthcare. Each tenant\'s data must be isolated, auditable and stored in a chosen region. Some large tenants require dedicated encryption keys and the ability to delete all their data on request with proof. The platform must keep per-tenant costs visible, stop one noisy tenant from degrading others, and let the vendor ship model and prompt updates without breaking any tenant\'s validated behaviour.',
      },
      {
        heading: 'Architecture',
        body:
          'A control plane manages tenants, keys, regions and configuration. Each region runs a data plane with ingestion workers, a vector and keyword index, and a query service. Small tenants share index clusters with a tenant id on every record and mandatory filters, while large or high-risk tenants get dedicated indexes. Every request carries a tenant context set at the gateway from the authenticated token, never from the request body. Model calls go through a gateway that enforces per-tenant rate limits and records usage.',
      },
      {
        heading: 'Data flow',
        body:
          'A tenant uploads documents through the regional endpoint. Ingestion encrypts raw files with the tenant key, chunks and embeds them, and writes chunks with the tenant id to the assigned index. A query hits the gateway, which resolves the tenant and region, applies rate limits, and forwards to the regional query service. Retrieval always includes the tenant filter, or targets the dedicated index. The answer and its citations are logged to the tenant\'s audit stream, which the tenant can export.',
      },
      {
        heading: 'Evaluation',
        body:
          'Maintain a shared golden set for general quality plus optional tenant-specific sets that large clients help write. Run cross-tenant leakage tests on every release: seed canary documents with unique phrases into test tenants and check that no other tenant can ever retrieve them. Measure p95 latency and error rate per tenant, not just globally, so a single tenant\'s pain is not averaged away. Model or prompt upgrades go through tenant cohorts with their own pass criteria.',
      },
      {
        heading: 'Risks',
        body:
          'The defining risk is cross-tenant data exposure, through a missing filter, a shared cache key or a logging pipeline that mixes tenants. Others are noisy neighbours, residency violations when a fallback routes to another region, and unbounded spend. Mitigations are tenant context injected by infrastructure, cache keys that always include the tenant id, canary leakage tests, region-pinned model endpoints with no cross-region fallback, and per-tenant quotas with alerts and hard caps.',
      },
    ],
    deepDive: [
      {
        heading: 'Choose the isolation model per tier',
        body:
          'Isolation is a spectrum: shared index with row filters, index per tenant, or a full stack per tenant. Shared indexes are cheap but rely on every query path applying the filter. Dedicated indexes cost more but make leaks structurally harder. Offer tiers: shared for small tenants, dedicated index for regulated mid-size tenants, dedicated stack for the largest. Make the tier a configuration field so moving a tenant up is a migration job, not a redesign.',
      },
      {
        heading: 'Prove deletion and residency',
        body:
          'Regulated clients will ask you to prove that data is gone and that it never left a region. Encrypt each tenant\'s raw files and chunks with a tenant key, so destroying the key renders backups unreadable. Keep an inventory of every store that holds tenant data, including caches, logs and evaluation snapshots, and make the deletion job walk that inventory and emit a signed report. Pin model endpoints per region and fail closed rather than routing to another region during an outage.',
      },
      {
        heading: 'Control cost at ten times scale',
        body:
          'At ten times the tenants, model spend and index memory dominate. Attribute every token and every gigabyte to a tenant through the gateway and the index metadata. Cache embeddings for repeated documents, cache answers for repeated questions within a tenant, and route simple questions to a smaller model. Set per-tenant quotas tied to their plan, with soft alerts at eighty per cent and hard caps at the limit. Review the top ten tenants by cost each month with account owners.',
      },
      {
        heading: 'Contain noisy neighbours',
        body:
          'One tenant bulk-uploading a million documents should not slow everyone else. Give ingestion separate per-tenant queues with fair scheduling, and cap concurrent indexing jobs per tenant. On the query side, apply token-bucket rate limits per tenant at the gateway and shed load from the heaviest tenant first. Report per-tenant p95 latency on a dashboard, and alert when any tenant\'s latency diverges from the fleet median, even if the global numbers look healthy.',
      },
    ],
    cheatSheet: [
      'Tenant context comes from the token at the gateway, never the body.',
      'Isolation tiers: shared filtered index, dedicated index, dedicated stack.',
      'Every cache key and log record includes the tenant id.',
      'Canary documents test cross-tenant leakage on each release.',
      'Per-tenant keys make deletion provable through key destruction.',
      'Region-pinned endpoints, fail closed, no cross-region fallback.',
      'Per-tenant quotas, rate limits and p95 dashboards.',
    ],
  },
  {
    id: 'case-document-ai',
    code: 'C06',
    title: 'Document AI extraction pipeline',
    summary:
      'A pipeline that extracts structured fields from invoices, contracts and forms at volume, routing low-confidence results to human review.',
    pattern: 'Extraction pipeline with review queue',
    difficulty: 'medium',
    moduleIds: ['t2-3', 't4-2', 't4-5', 't6-3'],
    main: [
      {
        heading: 'Requirements',
        body:
          'An operations team processes about fifty thousand documents a month: supplier invoices, purchase orders and short contracts, many scanned. They need fields such as supplier, dates, totals, line items and key clauses extracted into the finance system. Field-level accuracy must exceed manual entry for critical fields like totals and bank details. Turnaround can be up to an hour. Every extracted value must be traceable to a location in the source document, and uncertain results must go to a reviewer.',
      },
      {
        heading: 'Architecture',
        body:
          'Documents land in object storage and trigger a queue message. A classifier identifies document type. A layout step runs OCR and returns text with bounding boxes. A type-specific extractor calls the model with a field schema and the layout text, asking for each value with its page and region. Deterministic validators check totals against line items, dates against ranges and bank details against the supplier master. Results above threshold flow to the finance system, the rest go to a review queue.',
      },
      {
        heading: 'Data flow',
        body:
          'An uploaded invoice is stored and queued. The classifier tags it, layout extraction produces text blocks with coordinates, and the extractor returns a JSON object conforming to the invoice schema with source locations. Validators run and attach pass or fail flags per field. A confidence score combines model signals and validator results. High-confidence documents post automatically. Others appear in a review interface that highlights the source region for each field, and reviewer corrections are stored as labelled examples.',
      },
      {
        heading: 'Evaluation',
        body:
          'Label a stratified sample of six hundred documents across types, suppliers and scan quality. Measure field-level precision and recall, with critical fields reported separately. Measure the straight-through rate, the share of documents needing no human touch, and the error rate among those that went straight through, which is the number finance cares most about. Re-run evaluation for every schema, prompt or model change, and check performance on the worst-quality scans as a separate slice.',
      },
      {
        heading: 'Risks',
        body:
          'Risks are wrong values posted silently, particularly bank details changed by fraudulent invoices, degraded accuracy on new supplier layouts, and cost growth at high page counts. Mitigations are hard validators on critical fields, a rule that bank detail changes always require human review, monitoring accuracy by supplier to catch new layouts, and routing short simple documents to a cheaper model while reserving the larger model for complex contracts.',
      },
    ],
    deepDive: [
      {
        heading: 'Calibrate confidence for routing',
        body:
          'Raw model confidence is poorly calibrated, so do not route on it alone. Combine signals: validator passes, agreement between two extraction passes, OCR quality and whether the supplier layout has been seen before. Fit a simple calibration on labelled data so that a score of 0.95 means roughly ninety-five per cent of such fields are correct. Then set thresholds per field, strict for totals and bank details, looser for descriptive fields, and review the thresholds monthly against reviewer corrections.',
      },
      {
        heading: 'Close the loop with reviewers',
        body:
          'Every correction a reviewer makes is a labelled example. Store the original value, the corrected value, the source region and the supplier. Use them to add few-shot examples for difficult suppliers, to tune validators, and to grow the evaluation set. Track reviewer throughput and disagreement: if two reviewers often disagree on a field, the field definition is unclear and should be fixed in the schema before blaming the model.',
      },
      {
        heading: 'Plan cost at ten times volume',
        body:
          'At half a million documents a month, per-page model cost dominates. Classify first and skip extraction on irrelevant pages such as terms and conditions boilerplate. Use a smaller model for standard invoices from known suppliers and the larger model only for unfamiliar layouts and contracts. Batch requests where latency allows, cache results for duplicate uploads by content hash, and track cost per straight-through document as the unit economics number to report.',
      },
    ],
    cheatSheet: [
      'Classify, then layout OCR, then schema-bound extraction.',
      'Every value carries a page and region for traceability.',
      'Deterministic validators on totals, dates and bank details.',
      'Calibrated confidence decides straight-through versus review.',
      'Bank detail changes always go to a human.',
      'Report error rate among straight-through documents.',
      'Reviewer corrections feed examples, validators and the eval set.',
      'Route simple documents to a cheaper model, dedupe by content hash.',
    ],
  },
]
