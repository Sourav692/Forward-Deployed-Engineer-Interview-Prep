# Deep Research Agent: Deep Dive

> Read with the unchanged [source](/design/deep-research-agent#full-pack). The [Main guide](/design/deep-research-agent#main) gives the interview flow; the [Cheat Sheet](/design/deep-research-agent#cheat-sheet) is the recall card.

## 1. Permission and trust topology

The public-web subagents and private-document subagent have different tool credentials. A public branch must not receive user document scope, even if a web page tells it to request that scope. Retrieved text is evidence, never a system instruction. The private branch is scoped to one authenticated user and current access rights. Tenant/user identity belongs in retrieval and cache keys, not only in the prompt.

The final answer can itself leak data if it renders attacker-controlled Markdown images or external links with secret query parameters. Normalise typed findings, verify citations, and sanitize output at the egress boundary. Test injection in web pages and uploaded documents. A zero cross-user leak target outranks any average quality score.

## 2. Agent state and reducers

A run records user/run ID, goal, dependency plan, typed evidence, tool errors, draft, coverage score, hop/replan counters and budget. Parallel branches should append to an evidence list with provenance and dedupe; a scalar summary with last-write-wins semantics loses a branch. Budget counters aggregate across branches. An evidence record should identify source URL or document ID, access scope, retrieved timestamp, quoted span/locator and claim relevance.

The planner may request 3–12 steps, but the supervisor enforces a hard cap and no-progress rule. If a branch repeats the same delegation without new evidence, stop. `EMPTY` means a successful search found nothing; `UNAVAILABLE` means a tool failed. The synthesiser must not treat either as proof that a claim is false.

## 3. Latency and cost budget

40,000 runs/day is about 28/minute; a 3× peak is about 100/minute. With roughly 70 seconds active time, that suggests about 120 concurrent runs and around 170 slots with 70% utilisation. Validate against observed arrival bursts and service-time distribution; p95 time is not a formal mean for Little's Law. First signal under 3 seconds should be a useful status or partial evidence, not a fake answer.

Context isolation cuts cost sharply. A web branch sees its task and relevant snippets, not the entire conversation or other branch histories. Use small models for narrow search summaries and a stronger reasoning model where planning/synthesis needs it. Prefix caching helps repeated stable instructions; public topic caches differ from user-scoped private caches. Track tokens into synthesis, cost per branch, searches per report and replans, then tune budgets without cutting coverage the answer needs.

## 4. Quality checks and evaluation

The coverage grader asks whether evidence addresses each research subquestion and whether sources agree. Its score alone does not decide a release. Evaluate citation correctness and claim support with human-labelled examples, including conflicting sources, stale pages, tool failures and adversarial instructions. Correct a misleading grader and then inspect its score distribution; a post-fix score drop can reflect better measurement rather than worse answers.

Trajectory metrics include hops, duplicate searches, misrouted private queries and budget exhaustion. Outcome metrics include task completion, grounded-claim rate, citation-free claims, explicit gaps, latency and cost. Track both, because a good-looking answer can have unsafe routing and a safe trajectory can still miss the user's question.

## 5. Variants

The AWS platform variant gives concrete infrastructure: API key/Redis limits, Bedrock input/output guardrails, cache and vector memory, a search–summarise–write–critic loop, gateway tracing, Postgres/pgvector and deployment automation. It lacks per-user ACL and a deterministic release gate, both of which the anchor case requires. The supervisor-worker variant uses parallel subquestions and an append reducer; choose it when permissions or independent work justify agent boundaries. For predictable decomposition, a deterministic workflow avoids supervisor cost and loops.
