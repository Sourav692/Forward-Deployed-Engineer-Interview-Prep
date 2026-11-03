# High-Volume Batch Inference and Document Pipelines, part 2

## 4. Size From the Deadline and the Tail

The first pass is always too optimistic: a queue, a few workers and a model endpoint. That works at average load. It ignores the deadline, the retry rate and the hard last 5%.

Derive the number live rather than reciting it. With 100,000,000 records and a window of 6 × 3,600 = 21,600 seconds, the base rate is about 4,630 records/second. That is only the floor. Adding 15% headroom for retries, stragglers and reconciliation gives a planning rate of about 5,320 records/second.

| Scenario | Records | Window | Base rate | With 15% headroom |
|---|---|---|---|---|
| Current batch | 100M | 6 hours | ~4,630 rps | ~5,320 rps |
| 10x growth | 1B | 6 hours | ~46,300 rps | ~53,200 rps |

The 10x row tests whether the design is fragile or absurdly overbuilt; nobody expects it tomorrow. Keep headroom and growth apart: headroom covers noise inside one batch, while growth covers next quarter's larger batch. State average, peak, growth and headroom rather than one point estimate.

Tokens set the real load. At 250 input plus 20 output tokens, each record costs 270 tokens before retries. I'd let that token figure, not the record count, drive partitioning and component choice.

Say the uncertainty out loud:

> *"At 100 million records, I would plan for about 4,630 records per second before retries. If the average prompt is smaller than expected, model throughput becomes easier; if the tail of large records is heavier, we need more headroom or more aggressive partitioning. I would size the system around the tail, not the mean."*

- The chapter treats cost only qualitatively. The V2 tutorial's author closes the gap with a live dollar formula, which is supplementary perspective and not chapter content.
- At 270 tokens a record and ~5,320 rps, the fleet sustains roughly 1.43M tokens/second.
- Across the window that is about 27B tokens for 100M records (100M × 270).
- Apply the per-million-token price for a cost per run, then divide by 100 for cost per million records.
- Retries of calls that ran re-spend the full 270 tokens each; a call rejected up front, such as a 429, generally costs nothing.
- At a 5% retry rate that is roughly 5% more spend. The 15% headroom is itself a cost line, and stragglers burn compute past the window.
- So the cost ceiling belongs inside the rate-limit coordinator's backoff behaviour, not in a separate finance conversation.

## 5. Draw the Architecture End to End

- Each layer owns a different kind of truth. The planner owns what "this batch" means.
- The queue owns who is working on what. The sink owns what has been published.
- Planner, manifest, forecaster and console are control-plane concerns that coordinate the run.
- Workers and sink are data-plane concerns that move records through the model into durable output.
- They scale and change at different rates, which is why they are drawn apart.

The system with its planes and trust boundaries *(own construction)*:

```mermaid
flowchart TD
    N0["Customer scheduler or API with idempotency key"]
    N1["Job planner freezes snapshot, model version, deadline, and policy"]
    N2["Partition manifest: ranges, attempts, checkpoints"]
    N3["ETA forecast against deadline"]
    N4["Operations console: status, pause, replay, contingency owner"]
    N5["Opaque lease IDs"]
    N6["Durable work queue with visibility timeout, retry, and dead letter"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N2 --> N5
    N5 --> N6

    %% Casebook colours: entry, reasoning, results, controls, and stopped paths.
    classDef cbInput fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0,N4 cbInput
    classDef cbPolicy fill:#fef3c7,stroke:#b45309,color:#78350f
    class N1,N2,N3 cbPolicy
    classDef cbReason fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N5 cbReason
    classDef cbAction fill:#dcfce7,stroke:#15803d,color:#14532d
    class N6 cbAction
```

```mermaid
flowchart TD
    N0["Durable work queue"]
    N1["Autoscaled inference workers read each range once"]
    N2["Chunk into batches, for example 64"]
    N3["Global and per-tenant rate/concurrency coordinator"]
    N4["External model with deadlines"]
    N5["Validate typed output"]
    N6["Bad output: quarantine"]
    N7["Valid output: idempotent sink keyed by job_id, record_id, model_version"]
    N8["Advance checkpoint only after sink write"]
    N9["Acknowledge or release queue lease"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    N5 --> N6
    N5 --> N7
    N7 --> N8
    N8 --> N9

    %% Casebook colours: entry, reasoning, results, controls, and stopped paths.
    classDef cbAction fill:#dcfce7,stroke:#15803d,color:#14532d
    class N0,N2,N6,N9 cbAction
    classDef cbReason fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1,N4,N7 cbReason
    classDef cbPolicy fill:#fef3c7,stroke:#b45309,color:#78350f
    class N3,N5,N8 cbPolicy
```

- Freeze the input snapshot before leasing work. Send opaque identifiers across that boundary.
- The coordinator owns grant/delay decisions and backpressure; external models can time out, return 429s, or return invalid output.

The source's control-plane and data-plane diagram:

```mermaid
flowchart TB
    subgraph CP["CONTROL PLANE"]
        API["Customer Scheduler / API"]
        Planner["Job Planner\n(system of record)"]
        Manifest["Partition Manifest\n(status, checkpoints)"]
        ETA["ETA Forecaster\n(progress/lag risk)"]
        Console["Operations Console\n(status, alerts, intervention)"]
    end
    subgraph DP["DATA PLANE"]
        Queue["Durable Work Queue\n(leases, retries)"]
        RateLimit["Rate-Limit Coordinator\n(quotas/backoff)"]
        Workers["Inference Workers\n(batch + invoke model)"]
        Checkpoint["Checkpoint Store"]
        Sink["Idempotent Result Sink"]
    end

    API -->|"snapshot input"| Planner
    Planner -->|"creates manifest"| Manifest
    Planner -.->|"status/alerts"| Console
    Manifest -->|"progress/risk"| ETA
    ETA -.->|"deadline forecast"| Console
    Manifest -->|"enqueue leases"| Queue
    Queue <-->|"leases, retries"| Workers
    Workers -->|"request capacity"| RateLimit
    RateLimit -->|"grant/delay tokens"| Workers
    Workers -->|"invoke model"| ExtModel(["External Model / Provider"])
    ExtModel -->|"predictions or error"| Workers
    Workers -->|"persist completed range"| Checkpoint
    Workers -->|"write final rows once"| Sink

    classDef trust stroke:#c0392b,stroke-width:2px,stroke-dasharray:4 2
    class ExtModel trust

    %% Casebook colours: entry, reasoning, results, controls, and stopped paths.
    classDef cbInput fill:#dbeafe,stroke:#2563eb,color:#172554
    class API,Console cbInput
    classDef cbReason fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class Planner,Workers,ExtModel cbReason
    classDef cbPolicy fill:#fef3c7,stroke:#b45309,color:#78350f
    class Manifest,ETA,RateLimit,Checkpoint cbPolicy
    classDef cbAction fill:#dcfce7,stroke:#15803d,color:#14532d
    class Queue,Sink cbAction
```

The components, with the failure behaviour of each *(the "Fails how" column is own construction)*:

| # | Component | Responsibility | State owned | Fails how |
|---|---|---|---|---|
| 01 | Job planner | Accepts the nightly run, freezes the input snapshot, and creates the batch plan | Run metadata, snapshot pointer, deadlines | Closed: a broken snapshot hash or unknown model version stops the run |
| 02 | Partition manifest | Lists balanced work units and their status | Partition IDs, ranges, attempts, checkpoints | Closed: a corrupted manifest is never guessed around |
| 03 | Durable work queue | Hands out partitions to workers with leases | Lease state, visibility timeout, retry eligibility | Degrades: an expired lease is reissued; dead-letter after too many attempts |
| 04 | Rate-limit coordinator | Shapes outbound calls to stay under quota | Token budget, concurrency budget | Degrades: slows leases rather than letting retries stampede |
| 05 | Autoscaled inference workers | Batch records and call the model | Ephemeral execution state | Degrades: a crash loses no committed work; the lease expires |
| 06 | Checkpoint store | Persists completed ranges and partial progress | Last successful offset, result hashes | Closed: a corrupted checkpoint fails the partition, never skips it |
| 07 | Idempotent result sink | Writes final classifications once per record | Final output by record key | Degrades: bounded buffer and backpressure, then circuit-break |
| 08 | ETA forecaster | Estimates completion and lag risk | Progress rate, remaining work, backlog | Degrades: a missing forecast is itself an alert |
| 09 | Operations console | Shows run status, warnings, and intervention controls | Human-facing incident and rollout state | Degrades: runbook and pager still work without it |

- Walk the happy path in seven steps. First, snapshot the input and build the manifest, recording dataset version, deadline and run policy.
- Second, split into partitions balanced by processing cost. Tenant, payload-size band or historical latency beats record count alone.
- Third, lease work to workers through the durable queue, so the planner never waits on any worker.
- Fourth, batch records and ask the rate-limit coordinator for capacity before calling the model.
- Fifth, checkpoint the completed range and write rows to the idempotent sink.
- Sixth, retry transient errors per policy and quarantine permanent ones with triage context.
- Seventh, reconcile the manifest and publish the completed dataset.

```mermaid
flowchart TD
    A["1. Snapshot input\nand build manifest"] --> B["2. Split into\nbalanced partitions"]
    B --> C["3. Lease work\nto workers"]
    C --> D["4. Batch and invoke model\nunder quotas"]
    D --> E["5. Checkpoint\nresult ranges"]
    E --> F{"Response outcome?"}
    F -->|"transient error"| G["6a. Retry per policy"]
    G --> D
    F -->|"permanent error"| H["6b. Quarantine\nwith triage context"]
    F -->|"success"| I["7. Reconcile manifest\nand publish dataset"]
    H --> I

    %% Casebook colours: entry, reasoning, results, controls, and stopped paths.
    classDef cbInput fill:#dbeafe,stroke:#2563eb,color:#172554
    class A,I cbInput
    classDef cbReason fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class B,F cbReason
    classDef cbAction fill:#dcfce7,stroke:#15803d,color:#14532d
    class C cbAction
    classDef cbPolicy fill:#fef3c7,stroke:#b45309,color:#78350f
    class D,E,G,H cbPolicy
```

Three trust boundaries carry the security story. After the planner freezes the snapshot, the run cannot drift if upstream data changes. The model call is external, so the worker assumes timeouts, throttling, malformed responses and partial failures. Publication must be idempotent, so replays cannot create duplicate classifications.

The MVP is planner, manifest, queue, worker fleet, checkpointing, idempotent sink and a basic ETA panel. Smarter rebalancing, historical throughput prediction and tenant-aware scheduling come later. The common mistake is treating those later items as the architecture itself. Draw the flow, but speak in obligations: every component protects deadline, cost, replayability or operator confidence.

## 6. Make Duplicate Work Harmless

A crashed worker will redo some work. The design choice is whether that is dangerous or harmless. A sink cannot duplicate a row it upserts by the same key.

Three records carry the durable state.

| Record | Key | Fields | Lifecycle |
|---|---|---|---|
| BatchJob | `id` | `input_snapshot`, `deadline`, `model`, `state` | `queued`, `running`, `paused`, `completed`, `failed`, `replaying` |
| Partition | `job_id + partition_id` | `range`, `lease`, `attempts`, `completed_count`, checkpoint | `available` → `leased` → `completed`; `retryable` on transient failure; `abandoned`/`dead_lettered` after too many attempts |
| InferenceResult | `job_id + record_id + model_version` | `output`, `status`, confidence | `pending` → `written` → `validated`; `failed` if rejected or unpersistable |

- The `input_snapshot` is an immutable pointer to the exact dataset version. It is the ownership boundary that makes replay possible.
- The result is keyed by business identity plus model version, never by worker or attempt.
- Be ready for "why not just `record_id`?" Without the model version, a rerun under a new model silently overwrites yesterday's answer and replay loses its meaning.

The API surface stays small.

| Endpoint | Contract |
|---|---|
| `POST /v1/batch-jobs` | Authenticated; validates manifest and model reference. Idempotency key, so a client retry after a timeout does not create two jobs. Same key with a different payload is a conflict, not a merge |
| `GET /v1/batch-jobs/{id}` | Read model: progress, partition counts, failure counts, deadline, model version, state, compact error summary. Unknown id and no access both return not-found, so a caller cannot tell whether a job it may not see exists |
| `POST /v1/batch-jobs/{id}/pause` | Stops new leases and preserves progress. Optimistic concurrency via ETag. Already terminal is a state conflict, not a pretend success. Retried pauses are harmless |
| `POST /v1/batch-jobs/{id}/replay-failures` | Privileged, because replay reconsumes capacity. Selector for all failed, a named subset, or after a checkpoint. Reused key returns the same replay outcome, never a second attempt |

- Idempotency applies at every write boundary, not only the sink. A duplicate create must not create a second job.
- A duplicate lease renewal must not invalidate the original lease. A duplicate result write overwrites the same logical record.
- A duplicate pause or replay request is harmless. Versioning matters for the same reason: when the model, schema or validation policy changes, old and new results must stay distinguishable.

- The smallest code path that proves the design is one worker loop.
- It claims a lease and reads the range once. It chunks records into batches of 64 and acquires tokens from the limiter before the call, because admission control belongs before the quota breach.
- It then validates output at a typed boundary and upserts by `record_id`.
- The checkpoint advances only after the sink write succeeds, which prevents false progress.
- The partition completes only after every batch succeeds. A `TransientError` retries with backoff.
- A `ValidationError` retries once without backoff and then surfaces as a data-quality problem.

```mermaid
flowchart TD
    Lease["queue.lease(job_id)\nclaim a partition"] --> Read["source.read(range)\nread records once"]
    Read --> Chunk["chunked(records, 64)"]
    Chunk --> Acquire["limiter.acquire(tokens)\nadmission control"]
    Acquire --> Invoke["model.classify_batch(batch)"]
    Invoke --> Validate["validate_output(raw)\ntyped boundary"]
    Validate -->|"valid"| Upsert["sink.upsert_many(key=record_id)\nidempotent write"]
    Upsert --> Advance["checkpoints.advance(partition, record_id)"]
    Advance -->|"more chunks"| Chunk
    Advance -->|"all chunks done"| Complete["queue.complete(partition)"]
    Invoke -->|"TransientError"| RetryT["queue.retry(backoff=True)"]
    Validate -->|"ValidationError"| RetryV["queue.retry(backoff=False)\nthen re-raise"]
    RetryT --> Lease
    RetryV --> Fail["surface data-quality problem"]

    %% Casebook colours: entry, reasoning, results, controls, and stopped paths.
    classDef cbAction fill:#dcfce7,stroke:#15803d,color:#14532d
    class Lease,Chunk,Upsert,Complete,RetryT,RetryV cbAction
    classDef cbReason fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class Read,Invoke cbReason
    classDef cbPolicy fill:#fef3c7,stroke:#b45309,color:#78350f
    class Acquire,Validate,Advance,Fail cbPolicy
```

Two tests prove it. The contract test repeats `POST /v1/batch-jobs` with the same key and confirms one job and one id. The failure-injection test crashes the worker after `upsert_many()` but before `complete()`. On retry the sink still holds one logical result per `record_id`. The source's assertion is that distinct `record_id` count equals row count.

The sketch deliberately omits multi-worker contention, logging, metrics, tracing, cancellation, authentication, throttling and dead-letter routing. That is acceptable only when each omission can be named and placed.

## 7. Scope Workers to Immutable Snapshots

The most important security control sits outside the model: every worker processes a versioned snapshot that cannot change beneath it. A retry against a mutable table cannot prove what it retried.

Snapshot immutability does three jobs at once. It removes ambiguity during retries, it makes evidence replayable after an incident, and it limits blast radius. A malformed or malicious tenant dataset touches only that tenant's snapshot, not a global table.

Keep raw payloads out of queue metadata. Messages carry only opaque identifiers, snapshot versions, partition keys and lease information. An exported or replayed queue then discloses nothing. Encrypt result and checkpoint stores and restrict them to least privilege. Checkpoint state reveals business data shape and partial outputs, so treat it as sensitive.

Record model version, code version, prompt or feature schema version and deployment identity for every run. That is how the team proves which artifact produced which result when a customer asks why today's classification differs from yesterday's.

- The chapter names no external framework, and the V2 author treats that as a gap.
- Their supplementary answer is to ask which framework applies before claiming compliance.
- With personal data, purpose limitation and data minimisation apply to snapshot and result retention.
- In healthcare, HIPAA's audit-control rule applies to the audit trail; in finance, rules such as SEC 17a-4 or SOX do.
- SOC 2 is a voluntary audit report that customers in any industry may ask for.
- They also propose a per-run "processing basis" field on `BatchJob`. Without a named framework to test them against, the controls are necessary but not sufficient.
