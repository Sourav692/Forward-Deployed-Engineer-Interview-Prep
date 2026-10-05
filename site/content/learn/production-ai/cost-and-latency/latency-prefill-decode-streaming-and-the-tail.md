# Latency: Prefill, Decode, Streaming, and the Tail

*Streaming makes an answer feel fast without making it finish sooner, so know which kind of slow is hurting before choosing the fix.*

◷ 6 min

"It is slow" names at least three different problems. A frozen screen, an answer that starts and then drags, and a multi-step agent with an awful worst case each have a different cause and a different fix.

**Objectives:**

- tell time to first token from completion time, and tie each to input or output size;
- explain why tail latency compounds across agent steps;
- use streaming as a perceived-latency tool, decide when it is hiding a real problem, and cancel work nobody will read.

---

## Separate Prefill From Decode

Inference has two phases. **Prefill** reads the whole prompt in parallel and sets the time to first token (TTFT), which grows with input tokens. **Decode** produces one token at a time and sets tokens per second and total time, which grow with output tokens.

So the two symptoms point to different places. "The screen looks frozen" means look at prompt size, retrieval and queueing. "It starts fast, then drags" means look at output length. A bloated prompt is a first-token problem and a cost problem. A verbose answer is a completion-time problem. Confusing the two is the most common junior mistake.

Monitor first-token latency separately from total latency for the same reason. A single latency number cannot say which phase grew.

## Expect the Tail to Compound

If one agent step has a P95 of 1 second, five sequential steps do not have a P95 of 5 seconds. They are worse, because all five must be fast at once. For independent steps, the end-to-end P95 drifts toward the sum of higher percentiles. A six-step agent with a "fine" per-call P95 can have a terrible end-to-end P95.

Parallelising read-only calls helps twice. It saves the sum, and it collapses the tail. This is the numerical case for step budgets and for replacing open-ended agent loops with bounded execution graphs.

## Stream for Perception, Not for Speed

Streaming shows output as it is generated. It lowers perceived latency, not real latency. Total generation time is unchanged; the user just sees the first token far sooner. Streaming does not reduce compute cost either. It is a UX optimisation, not a substitute for backend work.

Not every model call streams by default. In the production-operations tutorial, every model exposes a streaming method, but the default implementation yields the final result once. True token-by-token streaming needs the provider to support it.

Streaming is a channel decision. Live chat needs a sub-second first response; an async email reply has minutes. The retrieve-and-answer pipeline is the same either way. Only the final step decides whether to stream.

Decide whether to answer before the first token streams. A partly streamed answer that is then retracted is worse than a clean refusal up front. Streaming applies only to the final answer, after the "should I answer at all" check has run.

## Use the Streaming Toolkit Deliberately

The playbook's streaming tactics map one-to-one onto the latency symptoms.

| Symptom | Tactic |
|---|---|
| Nothing appears for a while | Stream early, shrink the prompt, warm connections |
| The answer takes too long to finish | Limit output, parallelise safe steps, call fewer tools |
| The wait feels long even when it is not | Progress states, partial results, a skeleton UI |
| The full answer is long | A concise default with "show details" |
| The job takes minutes | An async job with status, notification and a downloadable result |
| A dependency hangs | Per-component and global timeout budgets |

Streaming hides a real problem when retrieval or tools take 10 seconds before any token appears. It also hides an answer that is simply too verbose. It hides agent loops that keep running after the user stopped caring. And it hides low-confidence content streamed before it was checked.

## Cancel What Nobody Reads

When a user abandons a streaming answer, cancel the stream and any tool calls still running. Otherwise the system pays for tokens nobody read. Log the cost of cancelled work. The playbook treats cancellation as a UX feature; it is also a cost control.

Measure abandonment against first-token time and answer length. Users leaving mid-answer is a signal about both.

## Quote Cost per Successful Task

Latency and cost trade against each other, so compare options on the right unit. A cheaper model that needs two turns, a retry or a human correction is not cheaper. Quote cost per resolved ticket, per accepted suggestion or per processed document, not per request.

> **Warning: streaming can make a slow system look healthy.** If first-token time is fine but retrieval and tools still take seconds before generation, users wait anyway. The trace waterfall, not the streaming UI, says where the time went.

## Worked Example: A Sub-Three-Second Sales Assistant

A sales team wants live answer suggestions during calls, in under 3 seconds. The weak design is a large model with a live CRM lookup on every request.

The strong design moves work off the critical path. Before the call, account context is precomputed. During the call, a small prompt goes to a fast model, which streams short bullet suggestions. After the call, a summary and the CRM update run asynchronously. If a step times out, the assistant falls back gracefully.

Prefill stays short because the prompt is small. Decode stays short because the output is a few bullets. The tail stays bounded because nothing slow runs synchronously. A sub-3-second target is a workflow design problem, not just a model choice.

---

## Key Takeaways

- Prefill sets time to first token and scales with input; decode sets completion time and scales with output.
- Sequential steps compound tail latency, so parallelise read-only calls and bound agent paths.
- Streaming improves perceived latency only, is a per-channel choice, and must start after the decision to answer.
- Match each latency symptom to a specific tactic, and recognise when streaming hides a slow backend.
- Cancel abandoned streams and their tools, and compare options on cost per successful task.

## Check Yourself

1. **Users say the screen freezes before any text appears. Where do you look first?**
   At prefill: prompt size, retrieval time before generation, and queueing. Output length does not affect first-token time.

2. **Why must the "can I answer?" decision come before streaming starts?**
   Retracting a partly streamed answer is a worse experience than a clean up-front refusal.

3. **A cheaper model halves the cost per request but doubles retries and human corrections. Is it cheaper?**
   Not necessarily. Compare cost per successful task, which includes the extra turns, retries and corrections.

## References

**Sources:** `ADDITIONS_BEYOND_PLAYBOOK.md`: §B1 prefill versus decode, §B2 tail latency, §B4 cost per successful task, §E streaming abandonment. `CRAM_SHEET_FULL_PLAYBOOK.md` (notes on the third-party *GenAI FDE Cost and Latency Optimization Playbook*): §3 first-token and total-response rows, §10 streaming and UX, §16 case 6. `CORE_8_DRIVERS_MEMORIZE.md`: driver 2. `03-cost-latency-cicd-rigor-and-build-vs-buy.md` (Production and Platform Judgment): §2 token streaming. `12_production_and_operations_INTERVIEW_TUTORIAL.md`: §1.2 streaming and its token-level limits. Playbook content is summarised in new words.
