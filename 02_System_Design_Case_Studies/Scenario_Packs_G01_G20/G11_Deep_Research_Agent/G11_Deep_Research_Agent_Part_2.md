# Deep Research Agent at Consumer Scale, part 2

## 9. Degrade Every Branch to a Gap, Never to Silence

A research answer is only as honest as its gaps. Ten parallel workers where one fails should produce nine findings and a gap note, not nothing. The wrong answer is losing nine successes to one failure because no one decided.

Rehearse "what breaks first?" most of all. "Hallucinations" is the wrong answer. The right shape names a symptom, a mechanism, a metric and a fix in one breath:

> *"The web search tool returns empty result sets during a partial outage. The agent treats empty as valid, and we ship an ungrounded response with no citations. The signal is citation-free answer rate. The fix is a typed result distinguishing empty from unavailable."*

The ladder below applies that shape to each component *(own construction)*.

| Fails | Behaviour |
|---|---|
| Search tool returns empty during an outage | Typed `UNAVAILABLE` vs `EMPTY`; unavailable becomes a gap note, never evidence of absence |
| One web sub-agent errors or times out | Error marker in state; synthesis proceeds with a coverage note naming the gap |
| Coverage grade stays thin | One capped replan; then answer with explicit low coverage, or say "not enough evidence" |
| Verifier finds an unsupported claim | Cut or flag the claim; never stream it as cited |
| Reasoning tier unavailable | Queue with visible status; never downgrade the verifier silently |
| Budget ceiling reached | Stop, synthesise from the ledger so far, state what was not searched |
| Fetched page contains injected instructions | Contained by scope; the finding is typed data, and rendering is filtered |
| Hop cap or no-progress check trips | Partial result with the reason attached |

## 10. Measure It and Name the Metric That Would Prove It Wrong

A design that cannot be falsified cannot be improved. Name the one metric whose value would say the architecture was the wrong bet.

Here that metric is the grade distribution. If most runs grade poorly even after correction, the corpus is the constraint, not the architecture, and the wrong thing was built.

Evaluate at two levels. Outcome evaluation asks whether the final answer was right. Trajectory evaluation asks whether it took a sensible path: did the planner decompose sensibly, did agents stay in role, how many hops. Trajectory matters more in a multi-agent system. A run that reaches the right answer through six wasted hops is one prompt change away from not reaching it.

| Question a worried owner asks | Metric *(own construction)* |
|---|---|
| Is every claim actually supported? | Claim-support rate from the verifier, audited by human sample |
| Are we shipping answers with no sources? | Citation-free answer rate |
| Is coverage good enough to trust? | Grade distribution after correction (the falsifying metric) |
| Are runs taking sensible paths? | Hops per run; replan rate; routing accuracy on a labelled set |
| Are we inside budget? | Cost per run, split by branch and tier; share of runs hitting the ceiling |
| Does it feel fast? | Time to first signal (under 3s); p95 total (under 90s) |
| Is the private corpus safe? | Cross-user retrieval tests at zero; egress-firewall trigger rate |

Debug a bad run from the trace keyed by run ID. Record per hop which agent ran, why it was chosen, what it saw and what it returned. The routing reasoning is the highest-value thing to log, because many bad multi-agent outputs come from how work was split and routed, not from one weak agent. Find the first hop where the trajectory diverged.

## 11. Read the Deployed Research Platform as Proof (#12)

The Research Platform is my own build of the same product, running on AWS. Given a topic, it researches, writes a full report, safety-checks it, caches it and remembers it. Read it once as evidence that each whiteboard box is a real component.

It has nine layers, and one request passes through them top to bottom.

| Layer | What it does | Detail worth quoting |
|---|---|---|
| 1 · Entry and security | API-key check, rate limit, input guardrail, then a job on a queue | Wrong key → 401; a Redis counter per client IP, 10 requests per 60 s; Bedrock Guardrails screen raw input *before any LLM sees the text*; Redis Stream queue decouples accepted from processed |
| 2 · Smart lookup | Three progressively looser checks before any agent runs | Semantic cache ≥ 0.85; exact long-term-memory match ≥ 0.88; related LTM 0.50–0.88 passed to the Writer as context |
| 3 · Agent pipeline | Search → Summarize → Writer → Critic | Search finds 5 key facts using the last four turns of history; a Critic NO under `agent_max_iterations` loops back to Search |
| 4 · LLM gateway | Every call goes through one sidecar, TensorZero (archived and unmaintained since June 2026) | Agents name a *function*, not a model; primary OpenAI GPT-4o, fallback Groq `llama-3.1-8b-instant` (as built; Groq retired that model for free and developer tiers in Aug 2026) |
| 5 · Output, save, evaluate | Output guardrail, persist, score | Bedrock again on generated content; LLM-as-judge on relevance, completeness, hallucination and quality, in parallel and non-blocking |
| 6 · Storage | Redis for fast and short-lived, Postgres for durable | RDS PostgreSQL 15 + pgvector; every report as a 384-dimension embedding |
| 7 · Observability | One trace per request | LangSmith spans with eval scores attached; in-process `all-MiniLM-L6-v2` embeddings add no gateway latency or cost |
| 8 · Red team | PyRIT attacks the real `/query` endpoint | Jailbreaks, XPIA, Crescendo, Skeleton Key; every Monday at 02:00 UTC via EventBridge |
| 9 · Infra and CI/CD | Terraform, GitHub Actions, ECS Fargate | Auto-rollback on failed health checks; Secrets Manager; CloudWatch logs kept seven days |

The delta from the anchor is the infrastructure. Four pieces carry it.

The gateway means an outage, rate limit or price change is a config change, not a code change in five places. The guardrails run on both sides, because a model can produce harmful output from a benign prompt. The input check runs on raw user input, not on an agent's interpretation of it. pgvector turns the cache from short-lived to durable. A report evicted from Redis is still found at ≥ 0.88, and a related one in the 0.50–0.88 band seeds the Writer. PyRIT attacks through the same auth, rate-limit and guardrail path as a real user. A passing run is therefore genuine evidence the defences hold, not a test of a mock.

Be precise about its shape. Layer 3 is a pipeline with a loop and a gate, closer to single-agent multi-step than to supervisor and workers. Its agents share one context and one tool set. What earns the split is the Critic's independent judgement and the bounded retry.

Name what it lacks, because that is the coverage-map habit. It has no per-user access control: one API key, no tenant model, so every user sees every cached report. That is fine for a research tool and wrong for an enterprise one, and it is exactly the anchor's per-user isolation requirement. It also has no deterministic release gate, since the judge scores are observability, not a gate.

## 12. Build the Supervisor-and-Workers Version (#103)

The mock prompt is "design a research system with a supervisor and workers". It is the anchor's implementation view. The supervisor plans N queries, workers execute them independently in parallel, and a synthesiser merges.

State carries findings with `operator.add`, so parallel writes accumulate. Bound it with a hop cap and a per-run model-call budget. Then volunteer the honest trade-off. The supervisor's planning call is pure overhead if the query decomposition was predictable, and in that case hardcode it.

Parallel is right here because the queries are independent. Parallel costs N calls at once, merge logic and partial failure. It buys the latency of the slowest branch rather than the sum. Sequential is right only when a later step needs an earlier one's result.

Justify multi-agent by naming what it buys. The three honest reasons are real parallelism, distinct tool permissions per role, and context one agent cannot hold. This design has all three. It fans out searches, web agents hold different permissions from the document agent, and isolation keeps the parent's window small. If none of the three can be named, use one agent with more tools.

Four costs belong in the answer *(from #103)*. A supervisor adds one model call per hop. Passing full history to every agent makes hop N pay for hops 1 to N-1, so pass a summary instead. Constrain routing with a `Literal` over the real agent names so the supervisor cannot route to one that does not exist. Parallel agents over one corpus duplicate retrieval, so share one retrieval step upstream.

## 13. Deliver It in Forty-Five Minutes

The binding constraint in the round is time. Miss the first 8 minutes and every later answer is guesswork. Miss the last 5 and the leveling signal is gone.

| Minutes | Phase | Sections |
|---|---|---|
| 0-8 | Requirements: 8 numbers, the oracle, scope cut | 1, 2 |
| 8-12 | State schema + action space | 3 |
| 12-20 | Control pattern, draw architecture | 4, 5 |
| 20-28 | Failure ladder, safety, human gates | 7, 8, 9 |
| 28-35 | Scale, cost arithmetic, capacity | 6, 14 |
| 35-41 | Measurement and rollout | 10 |
| 41-45 | Questions for the interviewer | — |

Cover the whole design at consistent depth first, then offer depth explicitly: "I can go deeper on the evaluation layer or the cost model — which is more useful to you?" Candidates who go deep unprompted usually pick the component they know best. They then run out of time before the failure and measurement sections, where the leveling signal lives.

The follow-up bank, with the shape of a strong answer:

| Follow-up | Shape of a strong answer |
|---|---|
| How does this scale 10x? | Name the *binding constraint* first (here I'd expect provider quota), then the arithmetic, then which lever you'd pull and its cost |
| What breaks first? | A specific component with a specific symptom and the metric that reveals it — never "hallucinations" |
| How do you know it works? | The oracle, sampled online measurement, the offline gate, and the offline suite's power limitation |
| What if the model gets worse? | Version pinning, evaluation before adoption, canary with guardrails, automatic rollback, a second provider behind an adapter |
| How much does it cost? | The per-run arithmetic derived aloud, the blended figure, the levers with expected effect |
| Where's the security boundary? | The gateway, the trifecta analysis, egress control on both the tool path and the rendering path |
| What would you cut for a 2-week version? | A specific reduced scope that still has an oracle and a failure ladder — and what you would NOT cut, and why |
| How do you handle a bad actor? | Rate limits, a cost governor per principal, anomalous tool-sequence detection — and that prompt defenses are rate-reducers, not boundaries |

The leveling rubric describes what to say, not who the candidate is.

| Level | Sounds like | Missing |
|---|---|---|
| Mid | Correct components, names a framework, describes a working happy path | Numbers, failure design, trade-offs stated as choices |
| Senior | Requirements as numbers, names the control pattern *and the rejected alternative*, walks a degradation ladder, does cost arithmetic | Organisational consequences, migration path, second-order effects |
| Staff | All of the above, plus: what to build first and why, what to deliberately *not* build, how the design changes at 10x, the measurement that would falsify it | Little — at this level differences are about scope of influence |

Recover a round that goes sideways out loud. Behind on time: say so and reprioritise aloud. The interviewer keeps redirecting: stop defending the path, follow, and ask what they want to assess. A wrong number: correct it immediately. Self-correction is a strong signal, and an uncorrected error that was noticed is a weak one. An unfamiliar domain: say so and ask two questions that make it reasonable. The failure is not running out of time. It is running out of time without saying so.

The two-minute spoken answer *(own construction from the source's design)*:

> *This is a read-only research agent, forty thousand runs a day, peaking at three times the mean, under ninety seconds at p95 with a first signal in three, and twenty cents a run. Success is every claim cited to a source a reviewer would accept. A planner on the reasoning tier decides whether to decompose and writes a dependency-aware plan. Web sub-agents fetch and read in their own windows and hold no access to the user's documents. A separate user-scoped sub-agent reads those. Only typed findings cross the schema boundary into a deduplicated evidence ledger with a concatenating merge, so no parallel branch is lost. A grader checks coverage and agreement, the synthesiser writes with citations, and a verifier checks every claim before the answer streams with a coverage note. At peak that is about a hundred runs a minute and around a hundred and twenty in flight, so I would provision around a hundred and seventy. A naive seven-step run blows the budget, and sub-agent isolation, prefix caching and tier routing bring it back. On safety, the agent reads private data and untrusted pages. The rendered answer is its outbound channel, so rendering goes through an egress firewall. The metric that would prove me wrong is the grade distribution.*

The lines that carry the round *(own construction from the source's arguments)*:

1. *"Read-only, so no approval subsystem. I'm saying that on purpose."*
2. *"Sub-agent isolation is the single largest cost lever. The parent sees hundreds of tokens, not raw pages."*
3. *"Evidence merges by concatenation. Last-write-wins silently loses branches."*
4. *"A hundred a minute, a hundred and twenty in flight, a hundred and seventy provisioned."*
5. *"The rendered answer is a channel. Egress control goes on the rendering path too."*
6. *"Web agents hold zero document scope, so an injection can't reach the private corpus even in principle."*
7. *"Empty is not unavailable. Type the difference."*
8. *"If most runs grade poorly after correction, the corpus is the constraint, not the architecture."*
