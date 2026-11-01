# Practise Cost and Latency Interview Questions

*Every incident and case reuses the same few moves, so practise the moves rather than memorising fifteen separate answers.*

Cost and latency questions come as incidents ("it got slow") and as design cases ("build it under a budget"). Answer each one below aloud, then compare; every answer uses only the concepts from the earlier lessons in this module.

**Objectives:**

- answer any cost or latency incident with the same debugging sequence;
- spot the weak move and the strong move in a design case;
- state the fix, its risk and the metric that proves it, in under a minute.

---

## Learn the Four Verbs

Every strong answer in the playbook does four things. **Measure**: trace and attribute spend before changing anything. **Route**: match the model and path to the request's risk. **Bound**: cap steps, tokens, top-k, timeouts and budgets. **Cache safely**: put tenant, permission and version in the key.

The weak answer is always the same move too: change one knob without measuring. A bigger model, a longer context, a faster model, one global limit or a premium model everywhere are all versions of it.

## Answer the Incidents

**"Cost rose five times after rollout, but users grew only a little."**
Suspect request shape, not user count. Measure first. Break spend down by tenant, feature, model and prompt version, compare before and after, and read the costliest traces. Likely causes are longer prompts, new RAG context, an agent loop, an evaluation job, retries, verbose output or a provider price change. Now: cap output, pause batch and evaluation jobs, route simple tasks down and cap agent steps. Later: budgets, anomaly alerts, prompt token regression tests and a cost dashboard by request path.

**"Latency jumped from 2 seconds to 20 after a deploy."**
Do not guess. Compare a trace waterfall before and after to see whether the extra 18 seconds are retrieval, model, tools or infrastructure. Roll back the prompt or reranker change, disable an optional tool, reduce top-k or switch to the fallback provider. Add per-component latency budgets and canary deploys.

**"RAG retrieval slowed after more documents were added."**
More documents change retrieval economics. Filter earlier. Tune the index. Remove duplicate chunks before buying hardware. Next time, benchmark at the projected corpus size.

**"The agent keeps calling the same tool and times out."**
It is a control-loop bug. Add step budgets. Cache the tool result. Improve the tool schema or routing, and add explicit stopping criteria. Test for loops.

**"One tenant uses far more than comparable tenants."**
Separate healthy adoption from runaway automation, abuse or an integration loop. Scale up healthy use; throttle loops and abuse. Add tenant budgets and contract-aligned quotas.

**"The executive demo is too slow."**
Warm services, pre-index documents, stream output, use a stable dataset and shorten the answer. Reduce live uncertainty while staying honest about production architecture.

**"The customer says the AI is too expensive."**
Do not defend the bill in general. Show cost by workflow. Find the low-value, high-cost paths. Propose cuts that keep the value.

**"Vector database latency rose while model latency stayed flat."**
Check corpus growth, filter selectivity, top-k, shard load and tenant hot spots.

**"The reranker improved quality but doubled latency."**
Reranking should be conditional. Ablate by query type and gate it to ambiguous or high-value queries with fewer candidates. Watch quality gained per millisecond.

**"A prompt update raised token usage."**
Prompt changes are production changes. Diff the templates. Compare tokens by version. Roll back or trim, and add prompt token checks to CI.

**"Provider latency became unstable with no deploy."**
Separate provider latency from our pipeline by model and region. Use the fallback route and reduce concurrency instead of waiting. Test fallback prompts and schema compatibility in advance.

**"The cache hit rate dropped suddenly."**
Usually keying, versioning, traffic mix or invalidation. Compare keys before and after the deploy and inspect invalidation events. In a provider prefix cache, look for a timestamp or an unstable ordering in the prefix.

**"The batch embedding job became too expensive."**
Compare documents changed with documents embedded. Pause the full job. Switch to incremental indexing with a content-hash cache. Deduplicate.

**"A long context window made answers worse."**
Long context is a tool, not a strategy. Test whether retrieval with less evidence is both faster and more faithful, and set context budgets per workflow.

**"A tool-calling workflow times out."**
It is not always an LLM problem. Set tool timeouts, parallelise read-only calls, and turn slow side effects into async jobs while keeping the user informed.

## Spot the Weak and Strong Move in a Case

| Case | Weak move | Strong move |
|---|---|---|
| Legal RAG under a strict budget, cited answers in under 8 s | Strongest model with all documents in a long context | Permission-aware RAG, calibrated top-k, citations, routing by risk, reranking only ambiguous queries |
| Support chatbot at 10,000 daily users | Same model plus browser caching | Intent router, safe FAQ cache, small classifier, tools only for account data, concise defaults |
| Agentic CRM at 30 to 45 s | A faster model without reading traces | Trace, cap steps, cache, parallelise reads, precompute, deterministic routes |
| Multi-tenant platform with budgets | One global limit and a shared cache | Per-tenant budgets, permission-aware cache, tenant observability, isolation tests |
| Nightly PDF summaries | Premium model on every PDF every night | Hashing, change detection, deduplication, a cheaper model, batch, sampled evaluation |
| Real-time sales assistant under 3 s | Large model plus a live CRM call per request | Precompute before the call, small prompt and streaming during it, async enrichment after |
| Costs exploded after launch | Turn the whole feature off | Spend breaker, attribution, caps and quotas, then root-cause analysis |

## Handle the Follow-Ups

**"Rate limits are throttling us at peak."**
Separate the provider's 429 errors from our own gateway limits. Short term, retry with jitter, use a fallback model or region, and move non-interactive work to batch. Long term, buy capacity commitments, add tenant-aware quotas and queue non-urgent work instead of retrying into the same wall.

**"Production cost is fine, but the evaluation bill tripled."**
LLM judges are inference too. Sample instead of running the full set, use a cheaper judge audited by a strong one, run only on changed prompts and models, and cache judge calls.

**"When would you not add a semantic cache at all?"**
When queries rarely repeat in any form. An embedding lookup per request is not worth a near-zero hit rate.

**"The interviewer asks for a figure you are unsure of."**
State the mechanism and the measurement instead of inventing a number. For example: prompt caching should cut input cost on a repeated prefix sharply and remove most prefill time, and the cached-read token counter in our traces will confirm it.

> **Warning: the trade-off is the answer.** Naming a fix without its cost scores as a junior answer. Less context hurts weak retrieval, fewer chunks hurt recall, less reranking hurts precision, tight agent budgets block complex work, and fewer retries hurt availability.

## Worked Example: A Real Incident in Six Steps

Tell one incident in the playbook's six-step shape. Frame it: the system was useful, but cost and latency were not production-ready. Decompose the path into retrieval, reranking, inference, tools, retries, caching and post-processing.

Identify the driver: repeated retrieval and agent tool loops, not the base model. Fix it safely with step limits, caching inside the request, a smaller model for simple tasks and an output cap. Prove it with P95 latency, cost per request, evaluation scores, cache hit rate and user success, before and after. Prevent recurrence with budgets, alerts, token regression checks and a dashboard by tenant and feature.

The story lands because each step names a measurement, not an opinion.

---

## Key Takeaways

- Measure, route, bound and cache safely: four verbs generate every strong answer.
- Answer incidents by asking what changed, reading traces and stating immediate and long-term fixes.
- In design cases, the weak move changes one knob; the strong move routes by risk, bounds the workflow and caches with permissions.
- When unsure of a number, give the mechanism and the measurement that would confirm it.

## Check Yourself

<details>
<summary>1. What do all the weak answers in the playbook's cases have in common?</summary>

They change one knob, such as a bigger or faster model or a global limit, without measuring where cost or latency actually comes from.

</details>

<details>
<summary>2. Name the four verbs and one action for each.</summary>

Measure: build a trace waterfall. Route: send simple tasks to a smaller model. Bound: cap agent steps. Cache safely: key on tenant and permission.

</details>

<details>
<summary>3. Why is "reduce top-k" alone an incomplete answer to slow retrieval?</summary>

It risks recall and misses the bigger levers: filtering earlier, index parameters, duplicates and testing at real corpus size.

</details>

