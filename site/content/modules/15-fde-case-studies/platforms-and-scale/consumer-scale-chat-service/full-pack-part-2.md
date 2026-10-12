# Consumer-Scale Chat Service, part 2

## 6. Stream Every Answer and Cancel the Ones Nobody Reads

Stream every answer, and treat the closed connection as a cost signal. Streaming buys perceived latency, not real latency. The production study guide makes the point: total generation time is unchanged, but the first token arrives in well under a second instead of after the whole answer.

Use Server-Sent Events for the chat stream. The traffic is one-way from server to client after the request, SSE runs over plain HTTP, so it passes most proxies that don't buffer, and the browser's EventSource reconnects on its own. Keep WebSockets for the paths that genuinely need both directions at once, such as voice. Each stream carries a message ID, so a reconnect resumes from the persisted partial answer instead of regenerating it *(own construction)*.

A user who leaves mid-answer is still costing GPU time. The cost additions name this scenario: *"cancel the stream + any in-flight tool calls on abandon — otherwise you pay for tokens nobody read."* The gateway detects the closed connection and sends a cancel to the inference request. That frees the batch slot and its KV cache and stops any tool call in flight. The Stop button uses the same path. Measure abandonment against first-token time and answer length, because a rising abandon rate is often a first-token problem in disguise. G14's card 15.10 carries the same lesson.

## 7. Route by Tier and Task, and Count What a Cascade Costs

Route on two axes: the user's tier and the turn's difficulty. The tier sets which models a user may reach and at what quota. The task sets which of those models a turn actually needs. A greeting does not need the premium model; a long proof might.

The cost additions quantify the lever. On Claude's current price list, output costs five times input on every tier; other vendors' ratios differ. A router that moves 80% of traffic from Opus 5.5 ($4/$20 per million input/output tokens) to Haiku 4.5 ($1/$5) is a ~4× unit-cost cut on that slice (list prices as of Sep 2026). That single sentence is what "model routing" is worth, and it belongs in the answer.

Then name the trade-off most candidates miss. Prompt caches are scoped to a model, so a cheap-to-medium-to-premium cascade means separate cold prefixes. On a chat product whose input is mostly repeated history, a cascade can forfeit more in cache than it saves in price. The additions give the rule: measure one strong model at lower effort before building the cascade. Route at the start of a conversation where possible, and keep a conversation on one model unless the user changes it *(own construction)*.

## 8. Limit Per User, Queue Fairly Per Tier

A rate limit and a fair queue answer different questions, and a consumer service needs both. G07 section 7 draws the line. A rate limit decides whether this request may proceed at all. A fair queue decides in what order admitted requests are served under load.

Put a token bucket per user at the gateway, sized by tier: messages per window and tokens per day. Count tokens, not only requests, because one long request can cost as much as, say, fifty short ones. Behind admission, feed a weighted fair queue per tier into the shared inference pools. A free-tier surge then waits longer, and paid users keep their latency *(own construction, from G07's weighted-fair-queuing argument)*.

Separate the two kinds of 429 when load spikes. The additions say it plainly: *"Separate provider 429s from your own gateway limits."* A self-inflicted limit is a policy decision. A provider or pool limit is a capacity event. Short term, retry with jitter onto a fallback model or region and shed non-interactive traffic. Long term, buy capacity and queue non-urgent work rather than retrying into the same wall. Abuse is a rate-limit problem too: per-account and per-IP limits, anomaly detection on bursts, and stricter quotas on new or unverified accounts *(own construction)*.

## 9. Moderate Both Directions and Treat Every File as Untrusted

Moderate input before it reaches a GPU and output before it reaches a screen. The production guide's rule settles why both: the model can repeat something sensitive the user said two turns ago, so an input-only check never catches it. Input moderation buys half the cost; input plus output buys the multi-turn catch. A consumer chat product is multi-turn by definition.

Input moderation runs as a fast classifier at the gateway, before admission, so a blocked message never spends GPU time. Output moderation runs on the stream in chunks and can halt it mid-answer with an explanation. Moderation APIs score a fixed set of categories, and at default thresholds milder or app-specific abuse can still pass. The guide names two independent layers, the model's trained refusals and the moderation classifier, and neither substitutes for an app-specific policy. Track false positives as closely as false negatives, because over-blocking is a product failure users notice first *(own construction)*.

Files and tools carry indirect prompt injection, which the question bank lists as a Tier 2 probe. An uploaded PDF or a fetched web page is data, and data must not gain the authority of instructions. Store uploads in object storage, scan them, parse asynchronously, then chunk and embed per user. Retrieval over them is filtered by `user_id` at query time, the same two-layer idea as G01 section 6. Tool steps are capped per turn. The code sandbox runs with no network and no credentials, and is destroyed after the session *(own construction)*.

## 10. Keep the Prefix Stable and the Conversation on a Warm Replica

Chat is the best case for prefix caching, because each turn is the previous turn plus a little. The cost additions give the mechanism: cache matching is byte-exact on the prefix, rendered in the order tools, then system, then messages. One changed byte invalidates everything after it.

Build the prompt so the stable parts come first and never move. Freeze the system prompt per version. Order the tool list deterministically. Put timestamps, request IDs and the user's new message after the last cache breakpoint. The additions list the silent invalidators behind a sudden cache-hit drop: a `datetime.now()` in the system prompt, unsorted JSON keys, a tool list whose order varies, a prompt-version bump, a model swap. Prove it with the cache-read token counter, not by guessing.

A cache is only warm on the machine that holds it. Route every turn of a conversation to the replica that served the previous one, so its KV cache still holds the history *(own construction)*. Session affinity trades some load-balancing freedom for a large cut in prefill work. When the replica is gone, the turn still succeeds, only slower, because the new replica must prefill the whole history again. Summarisation interacts with caching too: rewriting the summary changes the prefix, so fold history in large steps rather than every turn.

## 11. Serve From Many Regions and Fail Over Cold, Not Closed

Serve each user from the nearest healthy region, and let a regional failure cost latency, not availability. GeoDNS or anycast sends the client to a regional edge. Each region runs its own gateway, services and inference pools, so one region's failure does not queue behind another's *(own construction)*.

Give each user a home region for the conversation store and replicate it asynchronously to a second region. A failover then reads slightly stale history rather than none. Keep the control plane central for policy and regional for enforcement, the balance G07 section 8 argues for. Residency rules can pin some users' data to a region, which the region map in the control plane records.

Failover is cold by nature. The new region has no KV cache for the conversation and may have less capacity. Accept the slower first turn, shed the free tier before the paid tier, and use a circuit breaker on a sick pool so requests stop paying to rediscover a failure. The production guide gives the breaker's three states: closed, open after repeated failures, half-open for one probe. A model outage degrades to another model in the same tier; it never degrades to an error page if any healthy model remains.

## 12. Measure What Users Feel and Gate What Ships

Measure time to first token, not only total latency, because first-token time is what a chat user feels. G14's triage section decomposes a slow request by stage: queue wait, prefill, decode, moderation, tools. That trace is the first tool when latency moves. Record stage timings, token counts, cache reads, abandonment and moderation outcomes, and keep message text out of telemetry by default, per G14 section 2.

The question bank's second failure mode is hand-waving evaluation. Tie every design choice to a number *(own construction)*.

| Worry | Metric that answers it |
|---|---|
| Does it feel fast? | Time to first token p50/p95 by tier and region |
| Is it answering well? | Thumbs-down rate, regenerate rate, edit-and-resend rate |
| Is caching working? | Cache-read share of input tokens; hit rate by prompt version |
| Is moderation calibrated? | False-positive rate on a labelled sample; false negatives from red-team runs |
| Are users leaving mid-answer? | Abandonment against first-token time and answer length |
| Is it affordable? | Cost per daily active user by tier; tokens generated after abandon |
| Is it isolated? | Cross-user read tests at zero, run before every release |

Ship model and prompt changes through a release gate with a canary slice, as G13 designs it. A system prompt change is a release, because it also changes the cache prefix and the cost line.

## 13. Answer the Anthropic Wording the Same Way

"Design the Claude chat service" is the same prompt as "Design ChatGPT", and the design above answers it unchanged. The sheet records no content delta. The emphasis differs, and saying so shows the candidate read the room *(own construction)*.

The question bank frames the Anthropic questions directly: *"AI/ML framing, but they fundamentally test distributed-systems fundamentals: batching, queuing, load balancing."* The neighbouring Anthropic prompts are inference batching, GPU routing and a 100,000-requests-per-second token service. Those are group G20 in the sheet. For #78, then, spend more of the hour on sections 3, 8, 10 and 11: the Little's Law sizing, the fair queue, continuous batching with session affinity, and failover. Expect the follow-ups "how do you determine which GPU has capacity?" and "how do you handle failover?" from the batching prompt in the same bank.

The Tier 2 safety probe applies with extra weight here: circuit breakers, rate limiting and graceful degradation when the model is unavailable. Have section 11's degradation ladder ready as a spoken list.
