# LLM Inference Serving: Batching, Routing and Failover, part 3

## 15. Walk the Latency Stack When It Gets Slow

#74 asks for the full stack: tokenization, network, batch size, KV cache, post-processing. G14 section 12 answers it from the application's traces. This section answers it from inside the serving layer. First ask which latency is slow: first token, per token, or total *(from question 9 of the decomposition questions file)*.

| Layer | Symptom | Likely cause | Check |
|---|---|---|---|
| Tokenization | Slow before the request reaches a queue | Long inputs tokenized on a starved CPU pool | Gateway span time; CPU saturation |
| Network | Slow for one region or client | Cross-region hop, TLS setup, a buffering proxy | Client-to-gateway span; TTFT by region |
| Queue wait | TTFT slow only at peak; p99 up, p50 flat | Utilisation past the knee | Queue wait against service time |
| Batch size | TPOT slow while throughput looks healthy | Batches too large for the per-token SLO | TPOT against running sequences |
| Prefill | TTFT slow on long prompts | Prompt growth, prefills stalling decode | TTFT by input tokens; chunked prefill on or off |
| KV cache | Latency spikes, preemptions | Pool full; low prefix-cache hit rate | KV use, preemption count, prefix hit rate |
| Decode | Starts fast, then drags | Output length grew | Output tokens per request |
| Post-processing | Gap after the last token | Safety filter, schema validation, detokenization | Span after final token |

The rule from the additions file carries the diagnosis. A frozen screen points at the prompt, the queue or prefill. An answer that starts fast then drags points at output length. The peak-only follow-up gets the answer from G14. Separate queue wait from service time, then add admission control and shed non-interactive traffic.

## 16. Deliver It in Forty-Five Minutes

The hour belongs to batching, routing and failover, because those are the words in the prompt. Spend it in this order *(own construction)*.

| Minutes | What to say |
|---|---|
| 0–5 | Request shape questions; prefill versus decode; state the assumptions |
| 5–10 | Requirements with numbers; TTFT, TPOT, goodput |
| 10–15 | Sizing: replica-seconds, 214 replicas, Little's Law cross-check |
| 15–25 | The diagram: admit, route, batch per replica |
| 25–32 | Continuous batching and the KV budget |
| 32–38 | "Which GPU has capacity?" and failover |
| 38–43 | Admission, backpressure, streaming, cancellation |
| 43–45 | The cost pivot and what would prove the design wrong |

The two-minute summary to rehearse:

> *"I'd treat each GPU as a stateful server with a memory budget. Requests are tokenized at the gateway and admitted against per-tenant token buckets, with a bounded queue that returns 429 early. A router picks a replica from a capacity registry of free KV blocks. It uses power-of-two choices so stale data doesn't cause herding, and prefix affinity so shared prompts reuse cache. Each replica runs continuous batching on a paged KV pool, with chunked prefill so long prompts don't stall streams. A three-layer health check evicts bad GPUs. Un-streamed requests retry under a budget, and streamed ones re-prefill or fail explicitly. At a thousand requests a second with this shape, that's about 214 replicas plus N+1 per zone. The metric that would prove me wrong is goodput, not throughput."*

## 17. Answer the Cost Pivot in Ten Minutes

The pivot after a good design is "the GPU bill is too high." There is no playbook drill for this group, so the card is *own construction*. It is built from the output-token and cold-start drivers and the additions file.

| | |
|---|---|
| Dominant driver | GPU time wasted in half-empty batches, long outputs, and KV memory that caps concurrency |
| Cheapest lever first | Continuous batching to raise occupancy; cap `max_tokens`; prefix caching for shared prompts; quantize to fit more sequences per GPU; move non-interactive traffic to an off-peak batch tier |
| Metric that proves it | Goodput per GPU-hour; cost per million output tokens; batch occupancy; KV utilisation; queue wait p95 |
| Do not | Buy more GPUs before measuring batch occupancy and KV use |
| 60-second line | A GPU is paid for by the hour, so idle slots are the bill. Fill batches continuously, cap output, reuse prefixes, quantize to fit more sequences, and push anything non-interactive to a cheaper tier. Prove it with goodput per GPU-hour. |

Decode was two-thirds of the anchor's replica-seconds in section 3, so output length is the first number to cut. Cancellation on disconnect is the second, because it recovers tokens nobody reads. Every strong cost answer follows four verbs in order. Measure, with occupancy and goodput. Route, sending offline work to the batch tier. Bound, with output caps and admission. Cache safely, sharing prefix blocks only for identical prefixes.

---

## Level calibration

Every level can draw a queue in front of GPUs; the level shows in whether each GPU is treated as a stateful server with a memory budget, and how far the plan reaches past one cell.

| Level | Sounds like | Missing |
|---|---|---|
| Senior | Asks for input and output tokens first, prices a request at 0.15 replica-seconds and provisions about 214 replicas, cross-checked with Little's Law. Routes by free KV with power-of-two choices, batches continuously with chunked prefill and paged KV, and retries unstreamed work under a budget. | Tenant fairness under overload, the contract after a mid-stream failure, and how rollouts and autoscaling live with minutes-long cold starts. |
| Staff | Adds the operating rules: token-weighted tenant buckets with a bounded queue that returns 429 early, backpressure from replica to gateway, N+1 headroom per zone, drain-and-canary rollouts, and an explicit choice between re-prefill and a partial error. Reports goodput, TTFT, TPOT and queue wait separately. | How the fleet is partitioned so one bad deploy or hot tenant cannot hurt everyone, and how request shape drives the capacity plan. |
| Principal | Splits the fleet into independent cells behind a global balancer, prices the request mix before any fleet size, since chat, short completion and scoring differ almost tenfold at 100,000 rps, and challenges the profile rather than buying hardware. Sets goodput per GPU-hour as the cost measure and moves offline work to a batch tier. | Measured prefill and decode rates, KV use and token distributions for the real model; every replica count here rests on assumed throughput. |

## Key Takeaways

- Request shape comes first, because prefill and decode price input and output tokens differently.
- Requirements name TTFT, TPOT, goodput and a utilisation ceiling, each with a number a test can fail.
- Sizing converts requests to replica-seconds, then cross-checks concurrency with Little's Law, and the larger answer wins.
- The architecture admits globally, routes by capacity, and batches locally where memory is visible.
- Tokenization runs on CPU at the gateway so admission and routing can use real token counts.
- Continuous batching lets each sequence leave when it finishes, and chunked prefill protects streaming.
- KV memory divides concurrency by context length, and paged blocks remove fragmentation and share prefixes.
- The router picks by free KV with power-of-two choices, and the replica makes the final check.
- Failover needs a deep health probe, a retry budget, and a rule for requests that have already streamed.
- Admission refuses work early by tokens per tenant, and backpressure flows upward to the gateway.
- Streaming fixes perceived latency, and cancellation on disconnect saves real GPU time.
- The single-GPU variant is size-or-timeout batching, futures keyed by request ID, and a bounded queue.
- At 100,000 rps the request mix swings the fleet by an order of magnitude, so price it before drawing it.
- A design review ranks three fixes by severity, using the anchor as the rubric.
- Latency diagnosis first asks which latency, then walks tokenization, network, queue, batch, prefill, KV, decode and post-processing.
- The forty-five minutes go to batching, routing and failover, closed by the two-minute summary.
- The cost pivot is answered with occupancy, output caps, prefix reuse and a batch tier, proven by goodput per GPU-hour.

## Check Yourself

1. **Why does input length hurt first-token time while output length hurts total time?** Prefill processes the whole prompt in parallel and sets time to first token; decode generates one token at a time and sets streaming speed and total time.
2. **Size the anchor aloud.** 1,000 ÷ 20,000 + 250 ÷ 2,500 = 0.15 replica-seconds; × 1,000 rps = 150; ÷ 0.7 ≈ 214 replicas. Little's Law gives ~7,000 in flight, ~110 replicas of slots, so compute binds.
3. **Why does static batching fail generative traffic?** A batch ends when its longest sequence ends, so short answers wait and their slots sit idle.
4. **How does context length change concurrency?** At 128 KiB a token, an 8,000-token sequence needs about 1 GB of KV, so a ~50 GB pool holds about 50 sequences.
5. **How is "which GPU has capacity?" answered?** Replicas heartbeat free KV, running and waiting counts to a registry. The router samples two, picks the better one, and the replica rejects quickly if the request does not fit.
6. **A GPU dies mid-generation. What happens to its requests?** Un-streamed ones retry from scratch elsewhere. Streamed ones re-prefill prompt plus emitted tokens, likely but not guaranteed to match under greedy decoding, or fail explicitly with the partial output.
7. **Why charge admission by tokens rather than requests?** One tenant's long prompts cost many times another's short ones, so request counts let a heavy tenant starve light ones.
8. **In #75, why bound the queue at two batches?** A deeper queue only serves requests that have already missed the SLO, and synchronous callers hold a connection each while they wait.
9. **What is the first question for #77?** What each request is. A chat answer and a one-token score differ by almost an order of magnitude in fleet size.
10. **Name three findings to lead a #79 review with.** Static batching for generative output, an unbounded global FIFO, and round-robin routing that ignores memory.
11. **Latency is fine at p50 and bad at p99 only at peak. Where to look?** Queueing: separate queue wait from service time, then tighten admission and shed non-interactive work.
12. **What is the cost card's 60-second line?** A GPU is paid for by the hour, so idle slots are the bill. Fill batches continuously, cap output, reuse prefixes, quantize, push non-interactive work to a cheaper tier, and prove it with goodput per GPU-hour.

## References

### Fact-check sources (checked 27 Sep 2026)

- [NVIDIA H100 datasheet](https://resources.nvidia.com/en-us-gpu-resources/h100-datasheet-24306) — the assumed 20,000 tok/s prefill for an 8B model needs H100-class compute
- [Hugging Face tokenizers: Decoders](https://huggingface.co/docs/tokenizers/api/decoders) — streaming decode must buffer partial characters
- [Agrawal et al. 2024, Sarathi-Serve](https://arxiv.org/abs/2403.02310) — a long prefill stalls co-batched decodes; chunked prefill fixes it
- [vLLM docs: Optimization and Tuning](https://docs.vllm.ai/en/latest/configuration/optimization.html) — V1 preempts by recompute by default; chunked prefill
- [Kwon et al. 2023, PagedAttention](https://arxiv.org/abs/2309.06180) — KV memory caps concurrency; max-length reservation wastes memory; paged, non-contiguous blocks
- [vLLM API: CacheConfig](https://docs.vllm.ai/en/latest/api/vllm/config/cache.html) — default KV block size of 16 tokens
- [Mitzenmacher 2001, The Power of Two Choices in Randomized Load Balancing](https://dl.acm.org/doi/10.1109/71.963420) — two random choices spread load almost as well as full information
- [Mitzenmacher 2000, How Useful Is Old Information?](https://perso.ens-lyon.fr/loris.marchal/scheduling/Mitzenmacher.pdf) — two choices tolerate stale load data
- [Thinking Machines 2025, Defeating Nondeterminism in LLM Inference](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/) — greedy output can differ across batch sizes and kernels
- [NVIDIA blog: Reducing cold-start latency with Run:ai Model Streamer](https://developer.nvidia.com/blog/reducing-cold-start-latency-for-llm-inference-with-nvidia-runai-model-streamer) — weight loading alone can take seconds; provisioning is what takes minutes
- [Azure SDK blog: Load models up to 6x faster with Run:ai Model Streamer](https://devblogs.microsoft.com/azure-sdk/eliminate-llm-cold-starts-load-models-up-to-6x-faster-with-azure-blob-storage-and-runai-model-streamer/) — faster weight streaming for cold starts
- [vLLM docs: OpenAI-compatible server](https://docs.vllm.ai/en/stable/serving/openai_compatible_server/) — the engine aborts a request when the client disconnects
- [vLLM issue #10087](https://github.com/vllm-project/vllm/issues/10087) — abort breaks when middleware fails to pass the disconnect on

