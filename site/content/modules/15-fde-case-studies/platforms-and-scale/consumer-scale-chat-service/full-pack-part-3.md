# Consumer-Scale Chat Service, part 3

## 14. Deliver It in Sixty Minutes

Spend the hour on state, streaming, admission and cost, because those are the parts a generic answer skips. The model choice is a sentence.

| Minutes | Phase |
|---|---|
| 0–7 | Clarify: the six questions and the stated assumptions (section 1) |
| 7–12 | Requirements and the sizing arithmetic aloud (sections 2 and 3) |
| 12–20 | The diagram and one message walked end to end (section 4) |
| 20–40 | Deep dive: conversation state, streaming and cancel, routing, limits (sections 5 to 8) |
| 40–50 | Safety, caching, regions (sections 9 to 11) |
| 50–60 | Metrics, the release gate, the cost pivot (sections 12 and 15) |

The two-minute spoken answer *(own construction)*:

> *I would start by saying the model is stateless and the product is not. At 100 million daily users and ten messages each, peak is around 35,000 messages a second, and with eight-second answers that is about 280,000 open streams — so admission, streaming and cost dominate. A streaming gateway holds each SSE connection and does auth, per-user token-bucket limits, tier quotas and input moderation before anything reaches a GPU. The conversation service stores every message durably, sharded by user, and persists partial answers so a reconnect resumes. A context builder sends only what the turn needs: a frozen system prompt, a rolling summary, recent turns and user memory, in a prefix-stable order so prompt caching works. A router picks the model by tier and task, and a fair queue per tier feeds inference pools that batch continuously and keep each conversation on a warm replica. Output moderation runs on the stream and can halt it. When the client leaves, the gateway cancels generation and tool calls, because tokens nobody reads still cost money. Each region is independent, with a home region for history and cold failover. I would prove it with time to first token, regenerate and abandon rates, moderation error rates and cost per daily active user.*

The lines that carry the round *(own construction)*:

1. *"The model is stateless and the product is not."*
2. *"Store everything, send little."*
3. *"Streaming buys perceived latency, not real latency."*
4. *"Cancel on abandon. Tokens nobody reads still cost money."*
5. *"A rate limit decides whether; a fair queue decides in what order."*
6. *"Prefix caching is a byte-exact prefix match. Stable first, volatile last."*
7. *"A cascade forfeits the cache. Measure one model at lower effort first."*
8. *"Failover is cold, not closed."*

The follow-ups come from the question bank's Tier 2 probes and the neighbouring prompts.

| Follow-up | Answer |
|---|---|
| Stateless or stateful servers? | Stateless services with state in the conversation store; the only affinity is soft, for the KV cache |
| How do you handle a model outage? | Circuit breaker on the pool, fallback model in the same tier, shed free tier first, never an error page while a healthy model remains |
| How do you stop a runaway tool loop? | Step cap per turn, per-tool timeouts, cancel on abandon |
| How do you keep long-term memory from getting polluted? | Stable keys that overwrite, pruned episodic records, user-visible and erasable memory, `user_id` from auth only |
| Prompt injection through a file or web page? | Treat content as data, not instructions; user-scoped retrieval; sandbox with no credentials; output moderation |
| How do you version and roll back prompts? | Versioned system prompts behind the release gate with a canary slice; a prompt bump is also a cache and cost event |
| Which GPU has capacity? | The scheduler tracks per-replica queue depth and free KV memory, and prefers the replica already holding the conversation |
| How would you know it works? | The metric table in section 12, tied to each design choice |

## 15. Answer the Cost Pivot in Ten Minutes

The interviewer's pivot is "the bill is growing faster than users." No ready-made drill covers this group, so the card below is a self-drill *(own construction)*, grounded in the main cost drivers.

| | |
|---|---|
| Dominant driver | Input tokens re-sent every turn as history grows, and output tokens at consumer volume, including tokens generated after the user has left |
| Cheapest lever first | Prefix-stable prompt with session affinity so history is a cache read; summarise history in large steps; short default answers with expansion on demand; route easy turns and the free tier to a small model; cancel on abandon |
| Metric that proves it | Cost per daily active user by tier; cache-read share of input tokens; output tokens per answer; tokens generated after abandon; time to first token p95 |
| Do not | Re-send the full history every turn, or build a three-model cascade that forfeits the prompt cache |
| 60-second line | Chat cost is history times turns plus answers nobody finished. Keep the prefix stable so history is a cache read, summarise in steps, keep answers short by default, route easy turns down, and cancel the moment the user leaves. |

Two cost drivers explain almost every surprise here. Input tokens grow with the conversation: teams count the user's question and ignore the system prompt and hidden history, so the bill rises with flat traffic. Output tokens grow with verbosity: teams measure requests, not generated tokens. Streaming improves perceived latency but does not reduce total compute cost. Quote cost per successful conversation rather than per request, as the additions insist: a cheaper model that needs a regenerate is not cheaper.

Every strong cost answer follows four verbs in order. Measure tokens and stage timings first. Route model to tier and task. Bound history, answer length and tool steps. Cache safely, with a stable prefix and the user's scope in every key.

---

## Level calibration

Every level can put a gateway in front of a model pool; the level shows in how the answer handles conversation state, cost and failure at this size.

| Level | Sounds like | Missing |
|---|---|---|
| Senior | Says the model is stateless and the product is not, sizes 100M daily users down to about 280,000 open streams, and walks admit, assemble, stream, persist: gateway quotas and input moderation, a durable conversation store, a bounded context builder, and SSE that cancels on abandon. | Fairness between tiers under overload, cache-aware routing, and what a regional failover costs. |
| Staff | Adds the operational judgement: a rate limit decides whether and a fair queue decides when, a byte-exact stable prefix with soft session affinity, a cascade weighed against the cache it forfeits, and cold failover that sheds the free tier first. Treats a system-prompt change as a release that also moves cache and cost. | Who owns quotas, prompts and moderation thresholds as policy, and how deletion and residency hold across every store. |
| Principal | Keeps policy central and enforcement regional, steers by cost per daily active user and cost per successful conversation, and makes memory the user can inspect and erase a product commitment. Plans how files, search, a code sandbox and later voice join without widening the trust boundary. | Real per-replica throughput, KV memory and traffic shape; every sizing figure here is a placeholder until measured. |

## Key Takeaways

- Clarify the product and state the assumptions before drawing, because "Design ChatGPT" gives nothing else.
- Requirements are testable: first token under a stated p95, zero cross-user reads, moderation error rates measured.
- The sizing walk from daily users to open streams to replicas shows why admission, streaming and caching are mandatory.
- One diagram shows admit, assemble, stream, persist, with boundaries at the gateway, the stores and the context builder.
- Store every message durably, and send the model only a summary, recent turns and user-scoped memory.
- Stream with SSE, persist partial answers, and cancel generation and tools when the client leaves.
- Route by tier and task, and count the prompt cache a cascade forfeits.
- A per-user token bucket decides admission; a weighted fair queue per tier decides order.
- Moderate input and output, and treat every file and fetched page as untrusted data.
- Keep the prefix byte-stable and each conversation on a warm replica, so history is a cache read.
- Serve per region with a home region for history; failover is cold, not closed.
- Measure time to first token, regenerate and abandon rates, and cost per daily active user, and gate every prompt change.
- The Anthropic wording is the same design, with more time on batching, queuing and failover.
- The hour goes to state, streaming, admission and cost.
- The cost pivot is a stable prefix, stepped summaries, short answers, routing down and cancel on abandon.

## Check Yourself

1. **Why is "the model is stateless and the product is not" the opening line?** It names where the design effort goes: conversation state, streaming and admission, with the model as one dependency.
2. **Walk the sizing from 100M daily users to open streams.** 1B messages a day, about 11,600/s average, about 35,000/s at a 3× peak; at 8 s per answer, Little's Law gives about 280,000 open streams.
3. **Why does time to first token depend on history length?** Prefill processes the whole prompt before the first token, and history is most of the prompt.
4. **What does the context builder send on turn 40 of a conversation?** The frozen system prompt, a rolling summary, the recent turns, relevant user memory and file chunks, then the new message, in that order.
5. **Why SSE rather than WebSockets for chat?** The stream is one-way after the request. SSE runs over plain HTTP, so it passes most proxies that don't buffer, and the browser's EventSource reconnects on its own.
6. **What happens when a user closes the tab mid-answer?** The gateway cancels the inference request and any tool call, freeing the batch slot and KV cache; the partial answer is already persisted.
7. **Why can a model cascade raise cost on a chat product?** Prompt caches are scoped to a model, so each model in the cascade starts cold on a prompt that is mostly repeated history.
8. **How do a rate limit and a fair queue differ?** The limit decides whether a request may proceed; the queue decides the order admitted requests are served under load.
9. **Why moderate output as well as input?** The model can repeat something sensitive from an earlier turn, which an input-only check never sees.
10. **Name three silent prefix-cache invalidators.** A timestamp in the system prompt, unsorted JSON keys, a tool list whose order varies (also a prompt-version bump or a model swap).
11. **What changes when the prompt is "Design the Claude chat service"?** Nothing in the design; more time goes to batching, queuing, GPU capacity and failover.
12. **What is the sixty-second cost answer?** Chat cost is history times turns plus answers nobody finished: stable prefix, stepped summaries, short answers, route down, cancel on abandon.

## References

### Fact-check sources (checked 27 Sep 2026)

- [Artificial Analysis LLM leaderboard (TTFT column)](https://artificialanalysis.ai/leaderboards/models): real first-token times are hundreds of ms to over a second, not milliseconds
- [WHATWG HTML Standard: Server-sent events](https://html.spec.whatwg.org/multipage/server-sent-events.html): SSE over plain HTTP, EventSource auto-reconnect, proxies that drop idle connections
- [vLLM docs: OpenAI-compatible server](https://docs.vllm.ai/en/stable/serving/openai_compatible_server/): disconnect aborts the request and frees its slot; KV reuse is compute, not a per-token price, when self-hosted
- [vLLM issue #10087](https://github.com/vllm-project/vllm/issues/10087): abort on disconnect can break behind middleware, so cancellation must be propagated
- [Claude docs: Models overview](https://platform.claude.com/docs/en/about-claude/models/overview): Opus 5.5 is the current Opus; Opus 5 is legacy
- [Claude docs: Pricing](https://platform.claude.com/docs/en/about-claude/pricing): Opus 5.5 $4/$20 and Haiku 4.5 $1/$5 per million tokens (4×); output is 5× input on every Claude tier
- [Claude docs: Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching): caches are per model, exact-prefix matched in tools → system → messages order, and broken by volatile content
- [OpenAI API docs: Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching): exact-prefix matching and per-model caches on another vendor
- [OpenAI API docs: Moderation](https://developers.openai.com/api/docs/guides/moderation): moderation returns category scores; thresholds and policy are the app's job

