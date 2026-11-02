# Logistics Exception Handling and Shipment Rerouting Agent, part 2

## 6. Put Customs First in the Policy Gate

The gate is its own component, not a side-check inside the Resolution Agent. The customer said it must never be bypassed for customs, so it must be testable and auditable on its own.

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

The diagram is the source's. In this design the exception type comes from the detection service, not from the agent's output, and a missing or unknown type goes to the Human Approval Queue like a customs hold.

**The customs check runs first and short-circuits everything else.** A confidence score cannot outvote a rule it is never compared with. This mirrors the customer's framing: customs is a hard compliance boundary and never competes with a confidence score. Only after that check does the value-and-confidence rule apply.

State the ordering out loud. A candidate who checks confidence before the customs carve-out has built a system where a high-confidence model could, in principle, auto-resolve a customs hold, the one outcome the customer ruled out. It is the same structure as deny-rules-first in the Tool-Using Agent with Safety Controls tool gateway, and the same short-circuit logic.

Three details make the gate trustworthy *(own construction)*. Take the exception type from the detection service, not from the agent's own output. An agent that mislabels a customs hold as a weather delay must not be able to talk its way past the gate. Fail closed on any missing field: no value, no type or no confidence routes to a human. Keep the policy definitions in the control plane under version control, so a threshold change is a release with an audit entry, not a config edit.

## 7. Share the Logic, Isolate the Data by Region

The customer requires EU data to stay in the EU, so a single global deployment is out. That is their rule, stricter than GDPR, which allows transfers with safeguards. The pattern has two halves. A shared control plane holds agent logic, model routing, policy definitions and the UI, deployed identically in each region. A regional data plane holds the event store, any vector store and the audit log, and never replicates across regions.

```
        Shared Control Plane (logic, policy, UI — versioned identically)
              │                    │                    │
         US Region             EU Region             APAC Region
     (US carrier data,     (EU carrier data,     (APAC carrier data,
      US audit log)         EU audit log —        APAC audit log)
                             never leaves EU)
```

An ops agent in any region sees the same UI and the same policy. Execution, storage, model calls, telemetry and support access are partitioned by region. Name the pattern (*shared logic, isolated data*) instead of only drawing three boxes. It is the tenancy ladder from the Secure Multi-Tenant AI Platform case, applied at the region level instead of the customer level.

Mirror residency at the application layer too. An EU agent's session cannot query US shipment data, and vice versa, by default. Storage isolation alone leaves the application free to join across regions.

The cost of the pattern is reporting. Cross-region analytics needs an aggregation layer that respects residency. The source's example is aggregated metrics only, with no raw EU data leaving.

## 8. Make Every Action Safe to Retry and Every Carrier Safe to Lose

Reliability here means two things. A missed exception is a shipment sitting stuck. A duplicated action is a double-booking or a double refund. The design guards against both.

Keep detection and resolution stateless behind a queue, with state in the event store and audit log. Put a queue in front of detection. A regional weather event that disrupts many shipments at once then smooths into backlog instead of overwhelming detection.

Give every auto-resolve action an idempotency key. A client that times out cannot tell a failed rebooking from a slow one, so it retries. The key lets the retry return the first result instead of booking twice. Legacy carrier APIs that cannot honour a key carry a real cost: those carriers may be forced into human-only handling regardless of confidence.

Wrap carrier API calls in circuit breakers. A flaky carrier should degrade to "route to human", not pile up retries that delay every other exception behind it.

Track time-to-detect separately for real-time and batch carriers. An average hides that a meaningful share of exceptions are detected hours late by design, not by failure.

Put SLAs on the approval queue. With 40 concurrent agents, a queue that grows faster than agents clear it during shift handoff is a capacity problem the AI cannot solve. Alert on queue depth, not only event latency.

## 9. Audit Every Decision and Explain Every Draft

This customer's compliance posture depends on traceability. Every auto-resolved action and every human decision must be reconstructable.

Treat the audit log as a first-class store, not a side effect. It records every gate verdict, whether customs to human or value-and-confidence to auto or human. It records every ops agent action: approve, edit or reject. Each entry is immutable and carries the model's confidence and reasoning trace.

Hold least-privilege carrier credentials. The execution path holds only the scopes needed to rebook or reschedule, never broad account-level credentials.

Enforce regional access control at the application layer, as section 7 describes.

Require explainability at the point of approval. The draft shown to an ops agent must say why the model proposed it: which signals, which confidence. An agent approving a black box under time pressure is how a wrong suggestion becomes a wrong human decision too. Human review is a control only when the human can see what they are reviewing.

## 10. Evaluate It Before Anyone Asks

The rerouting prompt ends "how do you build it, and **how do you evaluate it**?" The source bank names hand-waved evaluation as the second failure mode of the round, and says most candidates fumble "how do you know your AI system is actually working well?" Tie every design choice back to how it would be evaluated, and raise the plan unprompted.

The plan below is own construction, built on the anchor's components. Each layer of the design gets one question and one instrument.

| What could go wrong | First evaluator |
|---|---|
| Did detection catch the disruption at all? | Recall per exception type on a labelled replay of historical shipments |
| Did it flag routine scans as disruptions? | Precision per type; false-alarm rate per agent shift |
| Would the gate ever auto-resolve a customs hold? | Invariant test: adversarial customs cases with forced high confidence; required result zero |
| Is the confidence score honest? | Calibration curve on the replay set; error rate of auto-resolved cases at or above the threshold |
| Are drafts good enough to approve? | Approve-unedited, approve-edited and reject rates per exception type |
| Did the resolution unstick the shipment? | Outcome join: delivered within the revised ETA, from SAP, days later |
| Does a retry ever double-book? | Fault-injection test: kill the executor mid-call, replay, count bookings |
| Can an EU record reach a US session? | Residency test from every region's session, on every release |
| Is batch lateness hidden? | Time-to-detect p50/p95 split by feed type |

Run it in three stages *(own construction)*. **Offline first.** Replay months of historical shipment and weather data through detection and the agent. Compare against what the ops team did. This builds the golden set and calibrates the threshold before anything touches a carrier.

**Shadow second.** The agent drafts for live exceptions, but humans act on everything. Compare its draft with the human decision per exception type. Auto-resolve is not switched on until the agreement rate on sub-$500 cases clears a target agreed with the ops lead.

**Staged auto-resolve third.** Enable it for one region and one well-integrated carrier first, on missed scans on known routes, the source's own example. Watch outcome and reversal rates. Then widen.

Rerouting has one evaluation trap. The route not taken is never observed, so "the reroute helped" cannot be read off a single shipment. Measure it against a matched holdout of comparable exceptions handled the old way, on delay hours and cost per exception.

Gate every release on the same suite. Detection recall must not drop, the customs invariant must hold at zero, and the residency test must pass. Fluency of the drafts is not on the list.

## 11. Map the Stakeholder Surface for the Rerouting Variant

The rerouting prompt is the same system with three different nouns. It says: *"A logistics firm wants an AI agent to handle automated shipment rerouting. They have SAP data, real-time weather APIs, and 500 warehouse managers on different regional systems."* The source bank says it tests three things: multi-system data unification, stakeholder surface area, and whether evaluation is first-class. Section 10 covers the last. This section covers the first two.

Map the anchor onto the prompt before drawing anything new *(own construction)*.

| Rerouting-prompt noun | Where it lands in the anchor | What changes |
|---|---|---|
| SAP data | The system of record behind "carrier / ops systems" and the event store | SAP becomes an ingestion source *and* an execution target; changes arrive by change feed or batch extract, so the batch-diff path applies |
| Real-time weather APIs | A detection signal for "weather delay", on the streaming path | Weather is predictive, so detection can flag a shipment *before* a scan is missed; forecasts need a freshness stamp |
| 500 warehouse managers | The human approval surface, larger than the anchor's 150 agents | Still low-DAU; the approvers sit in different tools, so the draft must reach them where they work |
| Different regional systems | The regional data planes of section 7 | One adapter per regional system, behind one normalised schema |
| Automated rerouting | The auto-resolve action | A reroute is a side effect: idempotency key, least-privilege scope, gate before execution |

Narrate the source's six-step framework over it, because the round scores the narration.

1. **Clarify the mission.** Is the goal on-time delivery, cost, or fewer manual touches? Who is the primary user: the warehouse manager or a central ops desk?
2. **Name stakeholders and success metrics.** Warehouse managers approve reroutes. Central logistics owns the SAP integration. Regional IT owns each regional system. Customs and compliance own the always-human rule. Each group calls success by a different number, and the metrics must be agreed before the build.
3. **Map the inputs.** What data exists, what shape, who owns it, how fresh? SAP is authoritative but batchy. Weather is fresh but probabilistic. Regional systems differ in schema and in whether they accept writes at all.
4. **Decompose into workstreams and sequence them by risk.** Data ingestion and quality comes first, because a reroute on a wrong shipment state is the worst failure. The agent and gate come second. The manager-facing surface comes third.
5. **Ship a walking skeleton.** Build the thinnest path from one SAP extract and one weather feed to one region's managers, even with a mocked agent. It proves the integration story before the model matters.
6. **Adapt live.** Expect "you lost access to the weather feed". Re-derive without defending the old plan. Weather-driven detection falls back to scan-driven detection, and the draft says weather data was unavailable.

The data-unification probe from the same bank asks how to unify customer data split across SAP, Salesforce and Postgres for an agent. Give the anchor's answer: normalise into one event schema per region at ingestion, and never let the agent query three systems of record live.

## 12. Weigh the Trade-offs Out Loud

Every decision in the design costs something. Name each cost.

| Decision | Advantage | Trade-off |
|---|---|---|
| Unified stream (webhook + batch) | One detection code path; simpler to add carriers | Batch exceptions detected late by design, so surface the lag |
| Policy Gate as a separate component | Independently testable; customs rule cannot be bypassed by a confidence-score bug | Extra hop in the critical path |
| Regional data planes, shared control plane | Compliant by construction; consistent UX and policy | Cross-region reporting needs an aggregation layer that respects residency |
| Queue-backed ingestion | Absorbs bursts | Latency under normal load; backlog needs monitoring |
| Idempotent auto-resolve | Safe to retry | Every carrier integration must support idempotency keys; legacy ones may not, forcing some carriers to human-only |

The source sums up the table: **The design centres on one non-negotiable: the Policy Gate. Everything else feeds it correctly and acts on its verdict safely.**
