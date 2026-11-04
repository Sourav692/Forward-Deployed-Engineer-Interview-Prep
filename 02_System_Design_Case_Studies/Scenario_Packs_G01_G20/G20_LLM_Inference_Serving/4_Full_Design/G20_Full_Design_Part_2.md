# LLM Inference Serving: Batching, Routing and Failover, part 2

## 6. Batch Continuously, Not Statically

A GPU is efficient only when it multiplies many rows at once, so batching is the whole point. The question is when a batch forms and when it ends. Three answers exist.

| Strategy | How a batch forms | How it ends | Right for |
|---|---|---|---|
| Static | Wait for N requests | When the longest sequence finishes | Fixed-shape offline work only |
| Dynamic | Flush at N requests or after a max wait, such as 10 ms | When the batch's forward pass finishes | Fixed-shape models: embeddings, classifiers, rerankers |
| Continuous (iteration-level) | New sequences join at every decode step | Each sequence leaves the moment it finishes | Generative LLMs with variable output length |

- Static batching fails generative traffic because a batch finishes only when its longest member finishes.
- A 10-token answer batched with a 1,000-token answer waits for the long one, and its slot sits idle for 990 steps.
- Continuous batching fixes this by scheduling at the level of a single decode step.
- Every iteration, the scheduler removes finished sequences and admits waiting ones into the freed slots.

- Prefill complicates the picture. A long prompt's prefill can stall every decoding sequence in the batch for tens of milliseconds, which shows up as a per-token latency spike.
- Split long prefills into chunks and interleave them with decode steps. This trades a little first-token time for the new request against smooth streaming for everyone else.
- Say that trade aloud; it is the same throughput-versus-latency tension the tagline names.

Batch size is a knob, not a constant. Larger batches raise throughput and raise per-token latency. Tune it against the TPOT SLO, and let the scheduler cap concurrency when per-token latency drifts up.

## 7. Budget the KV Cache Before It Budgets You

The KV cache, not compute, usually caps how many sequences fit on a GPU. Every generated token adds keys and values for every layer, and they stay resident until the sequence ends.

The arithmetic, for the illustrative model (the architecture numbers are assumptions):

| Input | Assumed value |
|---|---|
| Layers | 32 |
| KV heads (grouped-query attention) | 8 |
| Head dimension | 128 |
| Bytes per value (fp16) | 2 |

- Per token: 2 (keys and values) × 32 × 8 × 128 × 2 bytes = 128 KiB.
- The anchor sequence of 1,250 tokens needs about 160 MB. Sixty-four of them need about 10 GB, which fits beside 16 GB of fp16 weights on an 80 GB card.
- Now raise the context to 8,000 tokens. One sequence needs about 1 GB, and a ~50 GB KV pool holds only ~50 sequences.
- Context length divides concurrency, which is why the router must track free KV rather than request counts.

- Reserving each sequence's maximum length up front wastes most of that memory, because most sequences stop early.
- Paged attention allocates KV in small fixed-size blocks, such as 16 tokens, on demand.
- Blocks need not be contiguous, so fragmentation mostly disappears. Blocks can also be shared.
- Requests with an identical system prompt point at the same prefix blocks, which is prefix caching at the serving layer.

When the pool fills anyway, the scheduler must choose a victim. Preempt the lowest-priority or youngest sequence. Recompute its KV later, which is vLLM V1's default, or, in engines that support it, swap it to CPU memory. Never let an allocation failure crash the replica, because that turns one long prompt into an outage for 64 callers.

## 8. Route by Free Capacity, Not by Turn

Round-robin assumes every request costs the same, and here none do. The answer to the follow-up "how do you determine which GPU has capacity?" is a capacity registry.

Each replica publishes its state on a heartbeat of about one second, and piggybacks it on every response. The state is free KV blocks, sequences running, sequences waiting, and health. The router scores a replica by the free KV left after reserving the new request's estimated tokens. Queue length breaks ties.

- Registry data is always slightly stale. If every router picks the single best replica, they all pick the same one and herd onto it.
- Sample two replicas at random and send to the better of the two.
- This "power of two choices" spreads load almost as well as perfect knowledge and tolerates stale data.
- The replica makes the final check. If it cannot fit the request, it rejects quickly and the router tries the next choice.

Prefix affinity layers on top. Hash the prompt's shared prefix, such as the system prompt, to a preferred replica, so its cached prefix blocks get reused. Override affinity when the preferred replica is hot. A cache hit is not worth a queue.

## 9. Fail Over Without Losing the Request Twice

A GPU fails in ways a process check cannot see. The process stays alive while the device throws memory errors or hangs mid-kernel. Health checks therefore need three layers.

| Check | Question it answers | Action on failure |
|---|---|---|
| Liveness | Is the process running? | Restart the process |
| Readiness | Is the model loaded and the scheduler accepting? | Remove from the registry; send no traffic |
| Deep probe | Can it generate one token inside, say, 200 ms? | Drain and evict; alert on repeated failure |

- A failed replica takes its KV cache with it, so in-flight sequences cannot continue elsewhere.
- The recovery depends on what the caller has already seen. If no token has streamed, retry the request from scratch on another replica.
- The caller sees only extra latency. If tokens have streamed, re-prefill the prompt plus the emitted tokens on a new replica and continue.
- Greedy decoding makes that continuation very likely to match, but not guaranteed, because batch size and GPU kernels can change the floating-point results.
- With sampling, the text may diverge. The honest alternative is an explicit error with the partial output, and the product decides which.

- Retries need a budget. When a zone degrades, naive retries multiply load just as capacity drops, which is a retry storm.
- Cap retries at a fixed share of traffic, such as 10%, with jittered backoff.
- Key them by `request_id` so a duplicate is detected, not re-run. Keep N+1 headroom per zone, and fail over between zones at the router.
- A new GPU replica often takes minutes to provision, pull the image and load weights, so headroom, not autoscaling, absorbs a sudden loss *(the cold-start driver, CORE_8 drivers file)*.

## 10. Admit Less Work Before the Queue Admits Too Much

An unbounded queue converts overload into latency for everyone, then into timeouts for everyone. Refuse work early and explicitly instead.

- Admission control sits at the gateway. Each tenant holds a token bucket charged by estimated tokens, not by request count, so one tenant's long prompts cannot starve another's short ones.
- The queue behind it is bounded, and a full queue returns 429 with a Retry-After header.
- The bound follows from Little's Law: a queue deeper than the SLO allows will only ever serve requests that have already failed their SLO.

- Backpressure flows upstream. Replicas signal saturation through the registry. The router stops sending, admission tightens, and the gateway rejects.
- Shed by priority. Interactive traffic stays and offline traffic moves to a batch tier, which the provider-limits scenario in G14 answers the same way *(additions file, section E)*.
- The same rule appears in G10 at batch scale: admission control belongs before the quota breach, not after.

## 11. Stream Every Token and Cancel on Disconnect

Streaming changes perceived latency, not total latency. A user reading the first sentence after 500 ms experiences a fast system, even if the answer takes seven seconds to finish.

Stream over server-sent events or a websocket, and flush per token. Watch for proxies that buffer responses; one buffering hop turns streaming back into a seven-second wait. Report TTFT and TPOT as separate SLOs, because they break for different reasons *(additions file, section D)*.

Cancellation is a cost control as well as a courtesy. When a caller disconnects, the sequence can keep decoding if any hop fails to pass the disconnect on, burning GPU time on tokens nobody reads *(additions file, section E)*. Propagate the disconnect to the scheduler, which evicts the sequence and frees its KV blocks at the next step.

## 12. Shrink It to One GPU for the Synchronous Variant

The one-GPU variant is the anchor with the distribution removed: one GPU, up to 100 inputs per batch, callers who block and wait. The whole design becomes intake, a batcher, the GPU and a way back to the right caller.

- The mechanism. The HTTP handler assigns a `request_id`, parks a future for it, and enqueues the request.
- A batcher thread flushes when it holds 100 requests or when the oldest has waited, say, 20 ms. The GPU worker runs the batch.
- The demultiplexer resolves each future by `request_id`, and the handler returns. A timeout on the future turns a stuck batch into an error rather than a hung connection.

- Say the arithmetic. Assume a full batch of 100 takes 200 ms. Maximum throughput is then 500 requests per second.
- At 400 rps the GPU runs at 80% and queues start to form in bursts.
- Latency is wait time plus queue time plus 200 ms. Synchronous callers each hold a connection, so by Little's Law 400 rps at ~0.3 s holds about 120 open connections.
- That is trivial until overload, when it grows without limit. Bound the queue at two batches, 200 requests, and return 503 with Retry-After beyond that.

One follow-up changes the answer. If the model generates variable-length output, a static batch of 100 finishes at its longest member. Move to continuous batching from section 6, even on one GPU.

## 13. Scale It to 100,000 Requests per Second

The 100,000-requests-per-second variant is the anchor at a scale where the request shape decides everything. Price it before drawing anything, using section 3's replica-seconds and the same assumed rates.

| Request shape | Input / output tokens | Replica-seconds each | Replicas at 100,000 rps and 70% |
|---|---|---|---|
| Chat answer | 1,000 / 250 | 0.15 | ~21,400 |
| Short completion | 200 / 20 | 0.018 | ~2,570 |
| Scoring, one token out | 500 / 1 | 0.0254 | ~3,630 |

The spread is almost an order of magnitude. The air-gapped chapter's pointer applies directly: expect numbers that produce an absurd replica count, and challenge the request mix instead of defending the count.

The architecture adds four things at this scale.

**Cells.** Split the fleet into independent cells of a few hundred replicas, each with its own router and registry. A global load balancer spreads traffic across cells and regions. A bad deployment or a hot tenant then damages one cell, not the service.

**Admission by tokens.** At 100,000 rps, request counts lie. Charge every tenant's bucket by estimated tokens, and shed the lowest priority first.

**Backpressure across layers.** Cells report saturation upward. The global balancer shifts traffic before a cell's queue deepens.

**Headroom over autoscaling.** New GPU replicas often take minutes to provision and load, so autoscaling follows the daily curve while reserved headroom absorbs bursts. Prefix caching and short output caps are the cheapest capacity at this size, because they cut replica-seconds per request directly.

## 14. Review the Junior Design Against the Anchor

The junior-design review is not a design question. It hands over a design and asks what to change, so the anchor becomes the rubric. Open with what works. Clarify the requirements the design assumed. Then name the top three risks by severity, not every flaw found.

The checklist:

| Look for | Why it breaks | Change it to |
|---|---|---|
| Static batches for generative output | Short answers wait for the longest in the batch | Continuous batching |
| Flush only when the batch is full | At low traffic, a request waits forever for company | Size-or-timeout flush |
| One global FIFO queue, unbounded | Overload becomes timeouts for everyone; no fairness | Bounded per-tenant admission, 429 early |
| Round-robin routing | Ignores memory; long prompts pile onto one GPU | Route by free KV, power of two choices |
| Sizing by GPU count | No link between traffic and capacity | Token work per request, Little's Law cross-check |
| Health check is a TCP ping | A hung GPU stays in rotation | Readiness plus a one-token probe |
| Unlimited retries | Retry storm when a zone degrades | Retry budget, jitter, `request_id` dedupe |
| No request ID through the pipeline | Responses can reach the wrong caller | Demux by `request_id` end to end |
| No cancellation | Abandoned requests burn GPU time | Propagate disconnect, free KV |
| Tokenizing on the GPU thread | CPU work stalls the most expensive resource | Tokenize at the gateway |
| One latency metric | Queue wait looks like a slow model | Separate TTFT, TPOT, queue wait and service time |

Deliver it as a conversation, not a verdict. A review that ranks three fixes and explains the failure each prevents shows seniority. Eleven findings read aloud shows only that the list was memorised.
