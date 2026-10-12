# High-Volume Batch Inference and Document Pipelines, part 4

## 13. Extend the Anchor to the Bank Document Platform

Member #49 is an OpenAI-style practice prompt, Q5: *"A bank processes millions of financial documents and wants to extract structured data using AI."* It is the same spine with a different payload. Records become documents, and a label becomes a schema.

The source lists the decomposition. It runs ingestion, file validation, document classification, OCR or multimodal extraction, schema-constrained output, and confidence scoring. It continues with validation against business rules, human review, correction feedback, audit storage, and reprocessing with model versioning. It asks for discussion of batch versus online processing, idempotency, retry behaviour, data lineage, model versioning and document-format drift.

Map each stage onto the anchor rather than drawing a new system *(own construction)*.

| Q5 stage | Where it lives on the anchor | What is new |
|---|---|---|
| Ingestion, file validation | Job planner and snapshot | A document hash and file-type check before a document enters the manifest; corrupt files quarantined, never retried |
| Document classification | First worker pass | Routes each document to its extraction schema; low confidence goes to review, not to a guess |
| OCR or multimodal extraction | Inference workers | Page-level cost dominates, so partition by page count band, not document count |
| Schema-constrained output | `validate_output()` typed boundary | The schema is the contract; a field that fails type or range is rejected, never stored |
| Confidence scoring, business-rule validation | After the typed boundary | Rules such as totals reconciling or dates in range catch plausible-but-wrong extraction |
| Human review, correction feedback | New lane off the sink | A review queue for low-confidence and rule-failed fields; corrections become labelled evaluation data |
| Audit storage, data lineage | `InferenceResult` plus snapshot pointer | Every field traces to document hash, page, model version and reviewer |
| Reprocessing, model versioning | `replay-failures` and `model_version` in the key | Reprocess a cohort under a new model without overwriting the old answers |

Batch versus online is a per-workflow decision. Bulk backfills and nightly statements are batch, which buys throughput and quota smoothing. A document a customer uploads while waiting needs an online path with its own latency budget. The two paths can share the extraction schema and the typed boundary *(own construction)*.

The likely follow-up is *"How would you handle a new document format appearing without warning?"* The answer *(own construction)* has four parts. Detect it: classification confidence drops, and schema-validation and business-rule failure rates rise for one cohort. Contain it: fail that cohort to the review queue rather than publishing low-confidence fields. Recover: add the format to the classifier and schema, then replay only the quarantined cohort through `replay-failures`. Prevent: monitor confidence and rejection rates by source and template, because format drift is a data-quality incident, not a model bug.

## 14. Deliver It in Fifty Minutes

Open with the outcome, then ask the judgment question. If everything cannot be perfect, what matters most: deadline, accuracy, cost or safe replay? That one question prevents overbuilding the wrong axis.

> *"I'll first pin down the batch deadline, correctness tolerance, and failure recovery expectations. Then I'll estimate throughput and identify the bottlenecks that actually threaten the schedule. After that I'll propose a partitioned ingestion and inference pipeline with idempotent writes, monitoring, and a deliberate fallback path if we're behind at 4 a.m."*

| Minutes | Phase |
|---|---|
| 0–5 | Discovery: size, deadline, freshness, quality bar, retry policy, whether partial output is useful (sections 1 and 2) |
| 5–10 | Estimation: 4,630 and 5,320 rps, tokens per record, where margin is thin (section 4) |
| 10–18 | Architecture: control plane, manifest, workers, checkpoints, sink (section 5) |
| 18–25 | Normal run, then a degraded run: worker failure, hot partition, throttling, falling behind (sections 6 and 8) |
| 25–32 | Trade-offs (section 10) |
| 32–38 | Security and operations, each control tied to a failure mode (section 7) |
| 38–45 | Follow-up drill: 4 a.m., rebalancing, paying twice, partial publish (section 9) |
| 45–50 | Close in ninety seconds, name the riskiest trade-off, specify the first rollout gate (section 12) |

Running out of time before the trade-offs or the failure drill is how a technically strong answer scores as not interview-strong.

The two-minute spoken answer, from the answer key:

> *I would not start with the model. The prompt sounds like a throughput problem — classify 100 million records every night before 6 a.m. — but the room splits three ways immediately: the business owner wants classifications by morning, the platform lead wants the warehouse intact, and the on-call engineer wants to rerun safely when something fails. That disagreement is the real problem, so I would restate the target as completing a replayable, cost-controlled batch by deadline with clear recovery decisions when behind schedule. The first question I need answered is whether partial results have value, because that one answer determines retry strategy, checkpointing cadence, and how much money to spend on the last ten percent. On sizing, 100 million records across a six-hour window is about 4,630 records per second, and with fifteen percent headroom for retries and stragglers, roughly 5,320 — and I would size from the tail of large records, not the mean. Architecturally, a planner freezes an immutable snapshot, a manifest splits it into partitions balanced for processing cost rather than row count, a durable queue hands out leases, and a rate-limit coordinator holds backpressure so tightening quota slows leases instead of triggering a retry storm. Checkpoints make recovery bounded and the sink upserts on the record key so replay cannot duplicate. The failure I would rehearse out loud is being 45% complete at 4 a.m., and the answer is that the contingency mode — narrow scope, cheaper model, or partial output with explicit status — was agreed with a named owner before launch.*

The ninety-second architecture summary, from the V2 tutorial:

> *"We have a nightly batch that must classify all records before the business deadline, so I would prioritize replayability, clear ownership, and deadline-aware recovery over exotic optimization. I'd partition the input into deterministic shards, track each shard in a durable manifest, and run workers that call either a provider API or a self-hosted model depending on the cost, latency, and control constraints. Every write would be idempotent, every shard would checkpoint progress, and every retry would be safe to rerun. I'd monitor shard lag, provider throttling, queue age, and downstream sink health so we can detect whether we're on track by the middle of the window. If we're behind at 4 a.m., I'd first identify the bottleneck, then decide whether to split hot partitions, raise concurrency, or switch the remaining work to a fallback model if the quality policy allows it. The main trade-off is between throughput and flexibility: larger batches improve efficiency, but smaller, deterministic units make recovery safer. I'd start rollout with a small representative slice, verify stable throughput and idempotent replay, and only then expand to the full nightly workload."*

The three answer tiers, from the answer key. The weak answer builds a batch classifier with an inference service and a scheduler and runs it nightly. It names tools instead of value and says nothing about snapshots, 4 a.m. or replay. The average answer partitions, runs workers with retries, checkpoints and alerts when late. It treats "alert when late" as a recovery plan and never shapes calls against quota. The strong answer freezes a snapshot and balances partitions by processing cost. It leases durably, holds backpressure in a coordinator, checkpoints for bounded replay, upserts by record key, and agrees contingency modes before the run is ever late.

The lines that carry the round *(own construction from the sources' arguments)*:

1. *"Throughput is not the hard part. The decision at 4 a.m. is."*
2. *"Can the batch be partial? That one answer sets retry, checkpointing and the spend on the last ten percent."*
3. *"4,630 records a second is the floor. 5,320 with headroom. Size from the tail, not the mean."*
4. *"Backpressure lives in the rate-limit coordinator. Quota tightening slows leases, it does not trigger a retry storm."*
5. *"The checkpoint advances only after the sink write succeeds."*
6. *"Upsert on job, record and model version. Duplicate work becomes harmless instead of dangerous."*
7. *"Fail closed on the snapshot hash, the model version and the checkpoint. Degrade on everything else."*
8. *"The contingency mode has a named owner before launch, not after the first miss."*

The follow-ups arrive in a predictable order.

| Follow-up | Answer |
|---|---|
| What do you do at 4 a.m. with 45% done? | Identify the bottleneck, then pull the smallest lever: concurrency if there is headroom, split hot partitions, fallback model, or publish the subset that meets the bar. Make the decision explicit; never leave the batch in limbo |
| How do you rebalance a hot partition? | Detect through lag, runtime histograms and queue age; split with a deterministic key; move only the unprocessed remainder and record new ownership in the manifest |
| How do you avoid paying twice after a timeout? | Treat the timeout as ambiguous; idempotency keys, durable checkpoints and write-side dedup; record progress at commit boundaries, not only at job end |
| When are partial results publishable? | Only under a partial-acceptance policy the customer defined; label completeness; all-or-nothing when downstream cannot handle mixed vintages |
| Why is the result keyed by model version too? | So a rerun under a new model does not silently overwrite yesterday's answer, and replay stays meaningful across model changes |
| Where does the cost ceiling live? | In the rate-limit coordinator's backoff and the degraded-mode rules, not in a separate finance report |
| What if the provider's batch API behaves differently from synchronous calls? | Retries can duplicate output; the idempotent sink absorbs it, and the submission scheduler replaces the naive worker pool |
| How does a new document format get handled? (#49) | Detect by confidence and rejection rates per cohort; route to review; add to classifier and schema; replay only that cohort |
