# Observability and Production Diagnosis for a Customer-Facing AI Application, part 4

## 14. Deliver It in Fifty Minutes

Spend time in proportion to risk, not diagram size. The pacing below is the chapter's own.

| Minutes | Move |
|---|---|
| 0–5 | Frame the outcome; ask what counts as slow and wrong, and who is most affected |
| 5–12 | Walk the critical path; show that "slow and sometimes wrong" is a set of failure modes |
| 12–18 | State the capture and no-capture lists: the first trade-off |
| 18–26 | Propose the tracing-first architecture and the two views |
| 26–32 | Size by collection policy; say why "what will we not collect?" comes first |
| 32–38 | Security and failure modes, each tied to a mitigation |
| 38–44 | Staged rollout, alert triggers, owners, the support workflow |
| 44–50 | Executive summary; name the riskiest assumption and the first rollout gate |

Defend four trade-offs. Full capture against privacy and cost: capture structure, keep a break-glass path. Head against tail sampling: prefer tail retention for slow and failed traces. Raw prompts against hashed metadata: store template ID, field presence, sanitized entity markers and fingerprints. Global dashboard against tenant views: build both, with a permission boundary.

- Repair the common weak answers on the spot. "Log everything and sort it out later" becomes a tiered capture strategy with named privacy and cost consequences.
- "Use tracing" becomes what is traced, how context propagates, and which layer each span isolates.
- "Sample 10 percent" becomes a question about the failure distribution. "Put it on one dashboard" becomes global health plus tenant-scoped debugging.
- "If the answer is wrong, the model is wrong" becomes a walk through auth, retrieval, prompt construction, tools and integrations.

> *"My design goal is to connect user-visible failures to technical causes without collecting more sensitive data than we need. I would instrument the full request path with correlation IDs, structured spans, and bounded metadata across authentication, retrieval, model calls, and tools. I would store raw prompts and customer content only through a narrow, audited escalation path, because the default should be privacy-preserving and cost-aware. For debugging, I would rely on template IDs, document references, timing, error classes, and outcome labels so support can separate auth, retrieval, model, and integration problems. I'd use a global operational view plus tenant-scoped views for authorised support, and I'd prefer selective retention for slow or anomalous traces over blind random sampling so we do not lose the one bad trace. The riskiest trade-off is observability depth versus privacy and cost, and my first production rollout gate would be proving that the system can consistently identify the root cause of real customer incidents without exposing unnecessary content or overwhelming the team."*

- Have two gap answers ready *(V2 gap note, supplementary)*.
- On build versus buy: buy the span plumbing, build the redaction and classification boundary, because "what counts as sensitive for this tenant" is business logic no vendor can own.
- On regulation: hashed prompts make a deletion request smaller, not trivial.
- A keyed hash tied to a user is still personal data under GDPR, so delete or unlink those fingerprints too, along with quarantine and break-glass records.
- The retention window should follow the customer's data-processing agreement.

## 15. Answer Every Cost and Latency Pivot With a Card

- Ten members of this group are the same system asked a cost or latency question.
- Each gets a card: the dominant driver, the cheapest lever, the metric that proves it, the move to refuse, and the line to say.
- Every card shares the playbook's customer-communication sentence: *"Acknowledge impact, show measured cause, provide immediate mitigation, then explain long-term prevention and success metric."*

### 15.1 LLM costs exploded after launch

| | |
|---|---|
| Dominant driver | Unknown until attributed: usually retries, agent loops, batch or eval jobs, or an integration loop |
| Cheapest lever first | Spend circuit breaker first; attribute by tenant and feature; cap output; pause batch and eval; downgrade premium routing; tenant quotas; then root cause |
| Metric that proves it | Cost per minute; tokens per request; model distribution; retry count; agent steps; tenant usage |
| Do not | Kill the whole feature without diagnosis |
| 60-second line | Contain, attribute, then diagnose. Keep low-cost safe paths online while disabling runaway paths. Budget guardrails must exist before launch. |

### 15.2 LLM cost increased 5× after rollout

| | |
|---|---|
| Dominant driver | Request shape: longer prompts, new RAG context, agent loops, eval jobs, retries, output verbosity, a provider price-tier change |
| Cheapest lever first | Cap max output length, pause expensive batch and eval jobs, route simple tasks to a smaller model, cap agent steps |
| Metric that proves it | Cost and tokens per request; requests by feature; retry count; model distribution; output tokens; eval and batch spend |
| Do not | Swap the model before breaking spend down by tenant, feature, model and prompt version |
| 60-second line | The increase likely comes from request shape rather than user count alone. I would isolate token growth, retries, agent steps, and batch jobs before changing the model. |

### 15.3 Latency jumped from 2 seconds to 20 seconds

| | |
|---|---|
| Dominant driver | A new reranker, larger context, a provider incident, cold starts, a tool timeout, or synchronous logging |
| Cheapest lever first | Roll back the prompt or reranker change, disable the optional tool, reduce top-k, activate the fallback provider |
| Metric that proves it | P95 and P99; first-token; retrieval, rerank, model and tool latency; timeout and retry rate |
| Do not | Guess, or raise the timeout |
| 60-second line | I would not guess. I would use traces to see whether the 18-second increase is retrieval, model, tool calls, or infrastructure. |

### 15.4 Executive demo is too slow

| | |
|---|---|
| Dominant driver | Unwarmed services, live external dependencies, an over-large prompt, no streaming, a poor network |
| Cheapest lever first | Warm services, pre-index documents, stream output, use a stable demo dataset, shorten the answer |
| Metric that proves it | First-token latency; retrieval and model latency; tool calls; cold-start count |
| Do not | Present demo numbers as production claims |
| 60-second line | For an executive demo, I would reduce live uncertainty while staying honest about production architecture and limitations. |

### 15.5 Customer complains the AI is too expensive

| | |
|---|---|
| Dominant driver | Premium-model overuse, verbose answers, no quotas, heavy batch jobs, low-value workflows |
| Cheapest lever first | Route simple tasks to a cheaper model, add quotas, trim prompts, cache safe repeated results |
| Metric that proves it | Cost by feature; active users; cost per outcome; model distribution; tokens per request |
| Do not | Defend the bill generically |
| 60-second line | I would not defend the bill generically. I would show cost by workflow and propose concrete reductions that preserve value. |

### 15.6 Prompt update increased token usage

| | |
|---|---|
| Dominant driver | Verbose instructions, duplicated rules, added few-shot examples, longer default output |
| Cheapest lever first | Roll back or trim the prompt; reduce examples; enforce an output max |
| Metric that proves it | Input and output tokens by prompt version; parse errors; retry count |
| Do not | Ship a prompt change without a cost-impact report |
| 60-second line | Prompt changes are production changes. I would version them and compare token usage and latency before rollout. |

### 15.7 Model provider latency became unstable

| | |
|---|---|
| Dominant driver | A provider incident, regional queueing, rate limiting, a network issue, with no deploy of ours |
| Cheapest lever first | Activate the fallback model or provider, reduce concurrency, degrade optional features |
| Metric that proves it | Provider latency by model and region; fallback rate; error codes; queue time |
| Do not | Wait blindly for the provider to recover |
| 60-second line | I would isolate provider latency from our own pipeline and use routing/fallback rules rather than waiting blindly. |

### 15.8 Cache hit rate dropped suddenly

| | |
|---|---|
| Dominant driver | A new prompt version invalidated the cache, a short TTL, changed normalisation, document churn |
| Cheapest lever first | Roll back the key change, adjust TTL, normalise queries, pre-warm a safe cache |
| Metric that proves it | Hit rate by cache type; invalidations; TTL; key cardinality; traffic mix |
| Do not | Scale capacity before inspecting the key |
| 60-second line | A cache hit drop is usually a keying, versioning, traffic, or invalidation issue; I would inspect those before scaling. |

- Two facts sharpen this card *(additions file, section A1)*. Prompt caching is a byte-exact prefix match, so one changed byte invalidates everything after it.
- A timestamp in the system prompt, unsorted JSON keys, a reordered tool list or a model swap each cause a silent miss.
- The cost incident adds the other half: cache changes need a security review too, because a key missing `role_scope` serves one role's answer to another.

### 15.9 Rate limits are throttling us at peak

| | |
|---|---|
| Dominant driver | Provider 429s mixed with limits from the team's own gateway |
| Cheapest lever first | Separate the two sources; retry with jitter plus a fallback model or region; shed non-interactive traffic to batch |
| Metric that proves it | 429s by source; fallback rate; queue depth; goodput at peak |
| Do not | Retry into the same wall |
| 60-second line | Separate provider 429s from our own limits first. Short term, jitter, fall back and shed batch traffic. Long term, capacity commitments, tenant-aware quotas, and queue non-urgent work. |

### 15.10 Streaming works but users abandon mid-answer

| | |
|---|---|
| Dominant driver | Tokens generated after the user has left, plus in-flight tool calls nobody will read |
| Cheapest lever first | Cancel the stream and any in-flight tool calls on abandon |
| Metric that proves it | Abandonment against first-token time and answer length; tokens generated after abandon |
| Do not | Treat cancellation as a UX nicety only |
| 60-second line | Measure abandonment against first-token time and answer length, and cancel the stream and in-flight tool calls on abandon. Where the provider stops generating on cancel, that stops us paying for tokens nobody read. |

Every strong answer on this page runs through four verbs in order. Measure by attributing cost and latency per stage, tenant and prompt version first. Route by matching model and path to risk. Bound steps, tokens, top-k, timeouts and budgets. Cache safely, with tenant, permission scope and version in the key.

---
