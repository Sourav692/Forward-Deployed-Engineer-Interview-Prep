# High-Volume Batch Inference and Document Pipelines

*Finish a hundred million records before the business day starts, without paying twice for any of them or losing the ability to replay the night.*

◷ 35 min

Throughput is not the hard part of this system. The hard part is the decision at 4 a.m., when the job is behind and someone has to choose what ships. This page consolidates the group's prompts into one read for the day before. The anchor is the nightly classification batch, and every other member is a delta on it.

| Case in the group | What it contributes here |
|---|---|
| #21 High-Volume Batch Inference System, 100M records before 6 a.m. (anchor) | Sections 1 to 12 and 14: the design, requirements, sizing, failure policy, evaluation, rollout and delivery |
| #49 OpenAI-style practice prompt Q5, Enterprise Document-Processing Platform (bank, millions of documents) | Section 13: extraction schema, confidence, human review and format drift on the same spine |
| #42 Nightly PDF summarisation is too expensive (playbook drill) | Section 15, first card |
| #116 §15 scenario 13, batch embedding job became too expensive | Section 15, second card |

Sections and tables marked *(own construction)* were built for this page from the sources' arguments and are not in the sources verbatim.

---

## 1. Restate the Throughput Prompt as a Recovery Problem

The prompt sounds simple: classify 100 million records every night before 6:00 a.m. The room splits three ways at once. The business owner says, "We just need classifications ready by morning." The data platform lead says, "Only if it doesn't break the warehouse." The on-call engineer says, "Only if we can rerun it safely when the model or upstream feed fails."

That disagreement is the real problem, not the throughput number. So restate the target before drawing anything.

> *"Complete a replayable, cost-controlled batch by deadline with clear recovery decisions when behind schedule."*

Lead with that sentence verbatim. Interviewers use it as a checkpoint. It tells them whether the candidate is solving the business problem or only the throughput problem.

The technology-neutral opening does the same work in a longer form:

> *"We need a nightly batch inference system that classifies about 100 million records and finishes before 6:00 a.m. The design has to account for model rate limits, cost constraints, and downstream capacity so the output is usable by morning. I'd first clarify who consumes the results, what happens if we're behind schedule, and what replay and audit requirements exist before choosing the execution architecture."*

The weak version names tools: *"We should build a batch classifier with a fast inference service and a scheduler."* The corrected version names value: *"The customer needs reliable nightly classification results delivered before business users need them, with predictable cost and a clear recovery path when the batch falls behind."*

Map the stakeholders next. Each one hires the platform for a different job, and naming them settles who owns which decision.

| User | Workflow | Current pain | What the system gives them | Owns which decision |
|---|---|---|---|---|
| Morning operations team (end user) | Consumes classifications before planning and outreach | Output late or untrusted | Usable results by 6 a.m., with explicit status | Not retry semantics |
| On-call data platform engineer (operator) | Restarts failed jobs, checks lag, judges whether a partial run is safe | Alert fatigue, manual cleanup, unclear rerun safety | Bounded replay, a forecast, a runbook | Not whether stale output is acceptable for a campaign |
| Model owner | Versions and approves the model | Input contract drift, wrong artifact in production | Version pinning, the approved artifact per run | Not the downstream SLA |
| Security owner | Reviews access to source records, outputs, logs | Sensitive data in queues and checkpoints | Opaque identifiers, encryption, audit trail | Access and retention |
| Business sponsor | Justifies the recurring cost | A nightly fire drill | A predictable process at a known unit cost | The contingency policy, jointly with operations |

The business does not decide batch retry semantics. The on-call engineer does not decide whether a stale classification is acceptable. The model owner does not own the downstream SLA. That division keeps the design aligned with reality rather than with one enthusiastic stakeholder.

## 2. Ask the Partial-Result Question First

The brief is incomplete on purpose. The interviewer may confirm the volume and the deadline, then stop. That is the test, not a trap.

Protect the one constraint that most changes the architecture. **Can the batch be partial, or must it be all-or-nothing?** A late but correct job can be rerun or explained. A job that silently drops or duplicates records is much harder to trust. The partial-result answer sets the retry strategy, the checkpoint cadence and how much to spend on the last 10%.

| Question | Design axis it unlocks |
|---|---|
| Who consumes the output, and what breaks if it is late? | SLA: whether the deadline is hard, soft or tiered by segment |
| Can the batch be partial, or must it be all-or-nothing? | Retry strategy, checkpointing, downstream handoff |
| What happens when the job is behind at 4 a.m.? | The recovery decision: speed up, reduce scope, fallback model, or partial results |
| How often does the model change, and who approves it? | Version pinning, validation and rollout control |
| What downstream system receives the classifications, and what can it absorb? | Sink capacity, so inference finishing does not overwhelm the consumer |
| What audit, retention or residency constraints apply? | Storage, logging and data movement |
| Are records pre-partitioned by tenant, region or date? | Whether ingestion becomes part of the design |
| How many tokens per record, and is the tail heavy? | Batching, rate limiting, throughput planning and cost exposure |
| Native batch APIs? Global and per-tenant rate limits? | A simple worker pool versus a submission scheduler |
| Does downstream need ordering, or only exactly-once logical results? | Checkpointing, output naming, safe partition replay |
| Is there a hard cost ceiling, and which degraded mode is preferred? | Keeps the design from becoming an uncontrolled compute bill |

When an answer is withheld, state the assumption and keep moving. The reusable form:

> *"Given the missing details, I'm going to assume the records are independently partitionable, partial results are only useful if they're explicit and auditable, and the highest-risk constraint is finishing by the deadline without duplicates. That means I'll prioritise shardable work, checkpointed progress, idempotent writes, and rate limiting before I optimise for cost or advanced scheduling. If any of those assumptions are wrong, the design changes in specific ways, so I'd want to validate them early."*

Assumptions carry risk too, so name it. If one record depends on another's result, naive parallelism breaks correctness. If a tenant expects strict completion, a degraded mode that skips low-priority work breaks the contract. If the provider's batch API has different semantics from synchronous calls, a naive retry loop duplicates output.

## 3. State Requirements as Testable Constraints

Split what the system must do from how well it must do it. "Batch the model calls" is a feature. "Finish by deadline" is a constraint. "Scale workers up and down" is a mechanism, not an outcome.

**Functional requirements.**

| # | Requirement |
|---|---|
| F1 | Freeze a nightly input snapshot, partition it, classify every record under quota, and publish usable output before the deadline |
| F2 | Partition work into independent, balanced units so the system scales by parallelism rather than by heroics |
| F3 | Schedule and autoscale workers, batching model calls where the provider supports it |
| F4 | Rate-limit globally and per tenant, so retries never stampede the provider into self-inflicted throttling |
| F5 | Checkpoint progress and write idempotently, so a replay never produces duplicate logical results |
| F6 | Forecast completion continuously and invoke a pre-agreed contingency mode when the deadline is at risk |
| F7 | Retry transient errors with backoff; quarantine permanent ones with triage context |
| F8 | Expose pause and replay-failures as authorised, idempotent operations |

**Non-functional requirements.**

| Constraint | Stated so it can be tested |
|---|---|
| Latency | `RPS = (N_records / T_window) × (1 + h)`. 100M records in a 6-hour window is about 4,630 records/sec, or 5,320 with 15% headroom. The budget covers queueing, batching, writeback, validation and reconciliation, not only inference |
| Availability | The pipeline accepts and processes work throughout its window; sized against the tail of large or slow records, not the mean, because the slowest few percent of records (stragglers) decide when the batch finishes |
| Correctness | No missing or duplicate logical results; bounded replay from durable checkpoints after any crash |
| Quality | An agreed error rate, confidence threshold or validation pass rate before publishing |
| Freshness | Results available downstream within an agreed time after the source closes |
| Security | Inputs, prompts and outputs protected per the customer's access and retention rules across every hop |
| Compliance | An auditable record of which snapshot, model version and partition produced every classification |
| Cost | Cost per million records measured; retries, which re-spend full tokens per retried record (5% retries ≈ 5% more spend; a retry storm can double it), and stragglers, which keep workers warm, watched as cost lines |

Prioritise with a strict ladder when answers are partial. **Must:** independent partitioning, deadline protection, idempotent writes, restartable execution. **Should:** autoscaling, batching where it helps, global plus per-tenant limits. **Could:** ranking low-value records, richer per-customer scheduling, manual override tooling.

Fence the MVP explicitly. It excludes cross-job optimisation across unrelated workloads and any per-record interactive feedback loop. It also excludes a training pipeline in the batch path, arbitrary ad hoc queries, and optimal cost in every failure mode. More responsibilities make deadline risk harder to reason about.

Every component then traces to a named requirement:

| Requirement | Design element |
|---|---|
| Partition work independently | Input sharding, partition metadata, and per-shard task queues |
| Schedule and autoscale workers | Queue depth monitoring, worker pool, and autoscaling policy |
| Batch model calls where appropriate | Request bundling layer and provider batch submission path |
| Rate-limit globally and by tenant | Central admission controller and tenant quota enforcement |
| Checkpoint progress and write idempotently | Durable checkpoint store and idempotent output sink |
| Forecast completion and invoke contingency plans | Progress estimator and alerting / fallback controller |
| Finish by deadline | Scheduling policy that favors the critical path |
| No missing or duplicate logical results | Idempotency keys, replay-safe writes, and reconciliation checks |
| Bounded cost | Spend guardrails, batch sizing policy, and degraded-mode rules |
| Restart without full replay | Partition-level checkpoints and resumable task state |
