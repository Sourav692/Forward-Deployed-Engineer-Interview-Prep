# Logistics Exceptions: Designing Around a Policy Gate

*Auto-resolving disruptions clears the backlog faster, while every action the assistant takes without a person has to stay inside a boundary the customer will be held accountable for.*

Work this design the way a forward-deployed round runs: clarifying questions first, then the design they force. Here the questions are the design, and one component, the Policy Gate, carries the system.

**Objectives:**

- turn four clarifying answers into four architectural decisions;
- unify streaming and batch carrier feeds without faking real-time;
- order the rules inside the Policy Gate so customs can never be auto-resolved;
- keep EU data in the EU with a shared control plane and regional data planes;
- size a low-DAU, high-stakes system by event throughput and correctness.

---

## Let Each Answer Move a Box

The scenario puts an FDE inside a mid-size logistics customer. The customer wants an assistant that watches the shipment pipeline. It detects customs holds, missed carrier scans and weather delays. It auto-resolves each disruption or drafts a fix for a human ops agent. It spans many carriers. Feeds are a mix of real-time and batch.

Four clarifying questions decide the design.

| Asked | Answer | Implication |
|---|---|---|
| **Data volume and freshness per carrier?** | Mixed. ~60% of carriers push real-time webhooks (scan events, status changes), ~200 events/s combined at peak. ~40%, mostly smaller regional carriers, drop CSV/EDI batch files every 2–6 hours, a few thousand records each | Ingestion needs **both** a streaming path and a scheduled batch path feeding the same pipeline |
| **Who are the users, and what scale?** | Internal only: the customer's ops team. ~150 agents across three shifts, ~40 concurrent at peak during shift handoff, each handling 30–50 cases a day | **Low-DAU, high-stakes-per-interaction.** Scale pressure comes from event throughput, not concurrent users |
| **Where is the auto-resolve vs human-approval boundary?** | Under $500 shipment value and high confidence: auto-resolve. **Customs/regulatory holds: always human, regardless of confidence.** Over $500, or below the confidence threshold: always human | **The core risk boundary.** A policy layer sits in front of every auto-resolution, with customs as a distinct always-gated path |
| **Regional or multi-tenant topology?** | One customer, one experience, across US, EU and APAC with different carriers per region; **EU data cannot leave the EU** | Rules out a single global deployment or data store |

Each answer moved a box. That adaptation is the signal. It starts with [the first ten minutes](/learn/ai-systems-design/sixty-minute-whiteboard/the-six-step-whiteboard-clock) of clarification.

Functionally, the assistant ingests carrier events and detects disruptions. It classifies them by type, value and confidence. It auto-resolves low-risk cases. Everything else becomes a draft for an agent to approve, edit or reject. A full audit trail covers all of it. The non-functional list starts with EU residency. Reliability matters, because a missed exception is a stuck shipment. Add low detection-to-draft latency, auditability and cost efficiency at bounded scale. New carriers must not need a core redeploy.

## Draw the Policy Gate as Its Own Component

```
Carriers (60% real-time, 40% batch)
        │
   ┌────┴────┐
Webhook   Batch File
Ingest    Ingest (EDI/CSV, scheduled)
   │         │
   └────┬────┘
        │
Event Normalization & Stream
        │
Disruption Detection Service
   (customs hold · missed scan · weather delay)
        │
Resolution Agent
 (drafts action + confidence score)
        │
   Policy Gate
 (value + confidence + always-human customs rule)
   │            │
Auto-Resolve   Human Approval Queue
   │            │  (ops agent: approve / edit / reject)
   └─────┬──────┘
         │
   Carrier / Ops Systems (execute the resolution)
         │
   Audit Log (every decision, automated or human)
```

The Policy Gate is a first-class component, not a side check inside the Resolution Agent. The customer said customs must never be bypassed. A rule hidden inside the agent cannot be tested or audited on its own. So the gate stands alone, where it can be both.

## Unify Streaming and Batch After Ingestion

A fake real-time interface for batch carriers helps no one. Polling a file drop every few seconds adds no freshness. It only adds infrastructure. Keep two ingestion paths. Converge them after ingestion.

Webhook events are validated, deduplicated and pushed onto the stream at once. Detection must be low-latency here. Batch files arrive on each carrier's schedule. Each is parsed and diffed against the last known state per shipment. Only changes enter the stream.

A missed scan on a batch carrier is detected late by design. Surface that latency to agents rather than hide it, because it changes how urgently they should act.

## Check Customs Before Anything Else

```
Resolution Agent output (action + confidence + shipment value + exception type)
            │
   Is exception type = customs/regulatory?
     │ Yes                    │ No
     ↓                        ↓
 Human Approval        value < $500 AND confidence ≥ threshold?
 Queue (always)          │ Yes                  │ No
                          ↓                      ↓
                     Auto-Resolve          Human Approval Queue
```

The customs check runs first and short-circuits everything else. This mirrors the customer's own framing: customs is a hard compliance boundary, not something that competes with a confidence score. Only after that check does the value and confidence rule apply. It is the same structure as deny-rules-first in access control, and as short-circuiting in [Scale, Reliability, and Security](/learn/ai-systems-design/design-framework/scale-reliability-and-security).

> **Warning: checking confidence before the customs carve-out builds the forbidden system.** If the gate asks "confident and under $500?" first, a high-confidence model could, in principle, auto-resolve a customs hold. That is exactly what the customer ruled out. State the ordering out loud in the round.

## Share the Logic, Isolate the Data

EU data cannot leave the EU, so one global deployment is out. Use a **shared control plane**: agent logic, model routing, policy definitions and UI, deployed identically in each region. Pair it with a **regional data plane** (event store, any vector store, audit log) that never replicates across regions.

```
        Shared Control Plane (logic, policy, UI — versioned identically)
              │                    │                    │
         US Region             EU Region             APAC Region
     (US carrier data,     (EU carrier data,     (APAC carrier data,
      US audit log)         EU audit log —        APAC audit log)
                             never leaves EU)
```

An agent in any region sees the same UI and the same policy; only storage is partitioned. Name the pattern, *shared logic, isolated data*, rather than just drawing three boxes.

## Size by Event Throughput and Correctness

Users do not constrain this system. Event throughput and correctness do. Keep detection and resolution services stateless behind a queue, with state in the event store and audit log. Queue-backed ingestion turns a regional weather event that hits many shipments at once into backlog, not overload.

Put an idempotency key on every auto-resolve action. A retry after a transient failure must never double-book or double-refund. Wrap carrier APIs in circuit breakers, so a flaky carrier degrades to "route to human" instead of piling up retries that delay every other exception.

Track time-to-detect separately for real-time and batch carriers. An average hides that a meaningful share are detected hours late by design. Watch approval-queue SLAs too. With 40 concurrent agents, a queue growing faster than they clear it at shift handoff is a capacity problem the AI cannot solve. Alert on queue depth, not just event latency.

## Make Every Decision Auditable and Explainable

Treat the audit log as a first-class store. It records every gate decision and agent action immutably, with the model's confidence and reasoning attached. Give carrier credentials least privilege: only the scopes needed to rebook or reschedule, never broad account access. Mirror residency at the application layer, so an EU agent's session cannot query US data by default, and the reverse.

Show *why* at the point of approval. An agent approving a black box under time pressure is how a wrong suggestion becomes a wrong human decision.

| Decision | Advantage | Trade-off |
|---|---|---|
| Unified stream (webhook + batch) | One detection code path; simpler to add carriers | Batch exceptions detected late by design, so must be surfaced |
| Policy Gate as a separate component | Independently testable; the customs rule cannot be bypassed by a confidence-score bug | Extra hop in the critical path |
| Regional data planes, shared control plane | Compliant by construction; consistent UX and policy | Cross-region reporting needs an aggregation layer that respects residency |
| Queue-backed ingestion | Absorbs bursts | Latency under normal load; backlog needs monitoring |
| Idempotent auto-resolve | Safe to retry | Every carrier integration must support idempotency keys; legacy ones may not, forcing some carriers to human-only |

## Worked Example: A Missed Scan on an EU Batch Carrier

A regional EU carrier drops its CSV file four hours after the last one. Batch ingest diffs it against the last known state and finds one shipment with no scan since yesterday. Only that change enters the EU stream, and the record never leaves the EU data plane. Detection flags a missed scan and records that it came from the batch path, so the agent sees it was detected late.

The Resolution Agent drafts a reschedule with high confidence on a $320 shipment. The gate first asks whether this is a customs hold. It is not. It then checks value and confidence: under $500 and above threshold, so it auto-resolves. The rebooking call carries an idempotency key, so a retry after a timeout cannot book twice. Every step, with the confidence and reasoning, lands in the EU audit log.

Change one fact and the path changes. Were the exception a customs hold, the first check would send it to a person regardless of the $320 value or the confidence. One boundary decides, and everything else feeds it correctly and acts on its verdict safely.

## Practise From the Architecture Prompt

The source includes a mock session that ran the four clarifying questions and stopped at the opening architecture prompt. It reads: "Walk me through your high-level architecture. What are the major components, and how does an event — say, a missed carrier scan — flow through the system from ingestion to either auto-resolution or a human agent's queue?" Use this lesson as the model answer, and practise picking up from exactly that prompt.

---

## Key Takeaways

- Four clarifying answers (mixed feeds, 150 internal users, a value and customs boundary, EU residency) each moved a box.
- The Policy Gate is its own component, so the customs rule is testable and auditable.
- Keep separate webhook and batch ingestion, converge after ingestion, and surface batch latency.
- Check customs first and short-circuit; only then apply the under-$500, high-confidence rule.
- A shared control plane with regional data planes keeps EU data in the EU by construction.
- Size by event throughput and correctness: queues, idempotent actions, circuit breakers, separate time-to-detect, and queue-depth alerts.
- Make the audit log first-class, scope carrier credentials tightly, and show the reasoning at approval.
- Practise answering from the mock's architecture prompt.

## Check Yourself

1. **Why must the customs check run before the value and confidence rule?**
   Customs is a hard compliance boundary. Checking confidence first would let a confident model auto-resolve a customs hold, which the customer ruled out.

2. **Why not make the batch carriers real-time?**
   Polling a file drop every few seconds makes the data no fresher, only the infrastructure more complex. Keep two paths, converge after ingestion, and surface the batch latency.

3. **What does the shared control plane and regional data plane pattern cost?**
   Cross-region reporting needs an aggregation layer that respects residency. In return, residency holds by construction and every region shares one UI and policy.

