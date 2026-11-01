# The Eight Cost and Latency Drivers

*Every lever that cuts cost or latency also cuts something else, so learn each driver together with what its fix puts at risk.*

The playbook lists 18 cost drivers and 17 latency drivers, but only a few deserve memory. Seven appear on both lists, and one more runs silently in the background; learn those eight in the order a request travels, as set out in [Why Cost and Latency Decide Production](/learn/production-ai/cost-and-latency/why-cost-and-latency-decide-production).

**Objectives:**

- recite the eight drivers in request-path order and derive them live;
- name, for each driver, the signal that exposes it and the fix that controls it;
- state the risk each fix carries before an interviewer asks.

---

## Walk the Request Path

Remember the path, not a list. Context goes in, retrieval runs, a reranker sorts, agent steps call tools, and generation comes out. Retries loop back, and logging runs alongside. Off the request path entirely, batch and evaluation jobs spend in the background.

```
prompt/context in → retrieval → rerank → agent steps & tools → generation out
                                                    ↑                ↓
                                                 retries         logging
                     (off the request path: batch and evaluation jobs)
```

Draw that, and the eight drivers fall out of it. Deriving them live is what the interviewer is scoring.

## Shrink the Context Going In

**Input tokens and long context.** Long system prompts, retrieved chunks, chat history and tool results all count. Teams count the user's question and forget the rest. The tell is a bill that rises while traffic is flat, often with worse answers, because irrelevant context distracts the model.

Trim and compress prompts, summarise history, retrieve only relevant sections, deduplicate, and cache the static parts of the prompt. Watch input tokens, prompt version and first-token latency. The risk: less context lowers accuracy when retrieval is weak, so this fix needs good ingestion and retrieval behind it.

**Output tokens.** Verbose answers and reasoning-heavy tasks drive cost, and teams measure requests instead of generated tokens. The tell is long answers dominating per-request cost, or a stream that starts quickly and then drags. Set a maximum length, use concise templates and structured output, and default to short answers with detail on request. The risk: limits that are too tight cut answers off.

## Tune Retrieval and Reranking

**Retrieval and vector search.** Search, metadata filters, query rewriting and hybrid search look cheap until volume and tenant count grow, because storage and queries scale with both. The tell is a rising vector database bill and latency after adding documents. Filter before searching, tune top-k, batch reads, tune the index and cache results. Test retrieval at the target corpus size. The risk: too few chunks give incomplete answers, and over-tuning the index lowers recall.

**Reranking.** A cross-encoder or LLM scoring step buys quality and quietly multiplies cost and latency. The tell is one request triggering many reranker scores, with good answers and a slow pipeline. Rerank only ambiguous or high-stakes queries, score fewer candidates, or use a lighter model. Track quality gained per millisecond added. The risk is lower precision. If reranking helps only a fifth of queries, it should not tax all of them.

## Bound the Agent and Its Retries

**Agent steps and tool calls.** One user request becomes 5 to 20 sub-requests, and the LLM is not the only bill. Search, CRM, OCR, parsing and rerank APIs add fees. The tell is cost per request varying wildly by path, or an agent that seems to think forever. Cap steps, budget tool calls, allowlist tools, route deterministically where possible, cache tool results and use a smaller planning model. Parallelise only safe read-only calls. The risk: strict limits can block legitimate complex workflows, and cached tool results raise freshness and security issues.

**Retries.** Timeouts, parse failures, provider errors and safety re-prompts all retry, and none of it shows in product metrics unless traced. The tell is cost spiking during incidents. Use idempotency, retry budgets, backoff, schema validation and fallback models. Avoid output schemas so complex they cause the retries. The risk: too few retries lower availability.

## Watch the Spend Nobody Sees

**Logging and tracing.** Full prompts, completions and traces are necessary for debugging, so nobody questions them. Storage grows, privacy risk grows, and synchronous writes sit on the hot path. Sample, redact, set retention, prefer metrics to raw payloads and log asynchronously. The risk: less detail slows incident analysis.

**Batch and evaluation jobs.** This one is cost-only, and it is the classic surprise. Summarisation, enrichment, embedding, migrations, regression tests and judge models run where no user sees them. The tell is a monthly bill spike after a data refresh. Process incrementally, schedule off-peak, budget queues, sample evaluation sets and use cheaper judges on deltas only. The risk: longer processing windows, and thin evaluation coverage that misses regressions. Re-embedding unchanged documents is a pipeline design bug.

## Add the Two Latency-Only Drivers

Two latency causes have no cost twin, and candidates often miss them. **Cold starts** make the first request after idle slow; minimum replicas, warmers and keep-alive fix it at the price of idle capacity. **Sequential design** makes each step wait for the last when it did not need to. Parallelise independent calls and prefetch, but never parallelise unsafe side effects.

If pushed past the eight, name the rest briefly and hand the question back to method. The cost list adds embedding generation, multi-step reasoning, streaming, fine-tuning, GPU hosting and human review. The latency list adds inference time, network, database and permission checks. Then say that spend and a trace waterfall, not memory, pick the driver.

> **Warning: logging and caching are where cost work becomes privacy work.** Cutting the observability bill by sampling, or cutting latency by caching, changes what sensitive data is stored and who can see it.

## Worked Example: The 60-Second Recital

Asked "why is our assistant slow and expensive?", decompose instead of listing. Latency is auth, routing, retrieval, reranking, prompt build, queueing, inference, tools, post-processing and network. Cost is input tokens, output tokens, embeddings and retrieval, reranking, tools, infrastructure, and logging and evaluation.

Next, name the multipliers that surprise teams: retries, agent loops, long outputs, repeated retrieval, and evaluation and batch jobs in the background. Then point at measurement. Attribute spend by tenant, feature, model and prompt version, build a trace waterfall, and fix the largest measured driver.

Finally, state what each fix costs. Less context hurts weak retrieval. Fewer chunks hurt recall. Less reranking hurts precision. Tighter agent budgets block complex work. Fewer retries hurt availability. That last step is the one most candidates skip, and it is the point of the exercise.

---

## Key Takeaways

- Learn the drivers in request-path order so they can be derived, not recited.
- Context and output tokens drive both bills; trim them, but only as far as retrieval quality allows.
- Retrieval and reranking should be filtered, tuned at real corpus size and gated by need.
- Agents need step and tool budgets, and retries need budgets and tracing, because both multiply silently.
- Logging and batch or evaluation jobs are hidden spend; cold starts and sequential design are latency-only.

## Check Yourself

<details>
<summary>1. Which drivers appear on both the cost and the latency list, and why does that matter?</summary>

Input context, output tokens, retrieval, reranking, agent steps and tools, retries, and logging. One fix to them improves both answers to "why is it expensive?" and "why is it slow?".

</details>

<details>
<summary>2. Why are retries called invisible?</summary>

Product metrics count requests, not attempts. Unless traces record retries, a cost spike during an incident has no visible cause.

</details>

<details>
<summary>3. A nightly job's embedding bill tripled after a document refresh. What is the first comparison to make?</summary>

Documents changed against documents embedded. Re-embedding unchanged content means the pipeline lacks change detection.

</details>

