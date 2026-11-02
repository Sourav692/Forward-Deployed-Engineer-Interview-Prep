# Logistics Exception Handling and Shipment Rerouting Agent, part 3

## 13. Deliver It in Sixty Minutes

Spend the hour on the four questions, the gate and the evaluation plan. The ingestion split and the regional planes are shorter. The queue technology is a sentence.

| Minutes | Phase |
|---|---|
| 0–8 | Clarify: the four questions and each one's implication (section 1) |
| 8–12 | Requirements and the throughput arithmetic (sections 2 and 3) |
| 12–22 | The diagram and the missed-scan walk from ingestion to verdict (section 4) |
| 22–35 | Deep dives: ingestion, the gate ordering, regional planes (sections 5 to 7) |
| 35–45 | Reliability and governance (sections 8 and 9) |
| 45–55 | Evaluation plan and staged rollout (section 10) |
| 55–60 | Close: trade-offs and the one non-negotiable (section 12) |

The two-minute spoken answer *(own construction from the source's summary)*:

> *This is a modest-scale, high-stakes system: 150 ops agents, not millions of users, so the pressure comes from event throughput and correctness. Carriers report two ways, about 60% by real-time webhook at around 200 events a second and 40% by batch drops every two to six hours, so I ingest both and converge them after ingestion into one normalised stream, diffing batch drops against last known state and surfacing their lateness instead of hiding it. Detection classifies customs holds, missed scans and weather delays, and only exceptions reach the Resolution Agent, which drafts an action with a confidence score and reasons but never executes anything. That decision belongs to the Policy Gate, a separate component: customs and regulatory holds go to a human first and always, and only then does the rule apply that under $500 with confidence that meets the threshold auto-resolves. Auto-resolve actions carry idempotency keys and sit behind circuit breakers that fall back to a human. The customer requires EU data to stay in the EU, which is stricter than GDPR, so I run a shared control plane with regional data planes. Every verdict and action goes to an immutable audit log, and every draft shows why. I would prove it offline on replayed history, then in shadow mode, then with staged auto-resolve, with a zero on customs auto-resolutions as a release gate.*

The lines that carry the round *(own construction from the source's arguments)*:

1. *"The questions are the design. Each answer moved a box."*
2. *"Scale comes from event throughput, not users."*
3. *"The agent proposes. The gate decides."*
4. *"Customs first. A confidence score cannot outvote a rule it is never compared with."*
5. *"Converge after ingestion, and surface batch lateness instead of averaging it away."*
6. *"Shared logic, isolated data."*
7. *"A flaky carrier degrades to a human, not a retry storm."*
8. *"Tie every choice to how I would evaluate it."*

The follow-ups arrive in a predictable order. Several are the source bank's Tier 2 probes.

| Follow-up | Answer |
|---|---|
| Why not embed the customs check in the Resolution Agent? | Then a confidence-score bug or a mislabelled type can bypass it. A separate gate is independently testable and auditable, and it takes the type from detection, not from the agent |
| Why not poll batch carriers every few seconds? | The data gets no fresher, only the infrastructure more complex. Converge after ingestion and surface the lateness |
| A storm disrupts thousands of shipments at once. What happens? | The queue absorbs the burst into backlog; detection scales out statelessly; queue-depth alerts fire; the approval queue is the human bottleneck, so prioritise by value and deadline |
| How do you handle tool failures, retries and idempotency? | Idempotency key on every side effect; retry budgets with backoff; circuit breaker to a human fallback |
| When do you route to a human? | Customs always; over $500; below the threshold; any missing field; any open circuit |
| How does auditing drive HITL decisions? | Edit and reject rates per type from the audit log decide where the threshold sits and which types stay human-only |
| How do you report across regions? | An aggregation layer that ships metrics, not raw EU records |
| A legacy carrier cannot accept idempotency keys. | That carrier goes human-only regardless of confidence. Say the cost plainly |
| How do you know it is working? | Section 10: recall per type, the customs invariant at zero, calibration, draft acceptance, outcome joins, a holdout for reroutes |
| Agentic or deterministic workflow? | Deterministic for the pipeline and the gate; the model only drafts. The agent is an execution graph with a budget, not an open loop |

Repair the common weak answers on the spot. "The model decides whether to auto-resolve" becomes the agent proposes and the gate decides. "Check confidence, and customs is just low confidence" becomes customs first, as a rule. "One global deployment with an EU flag" becomes regional data planes. "Average time-to-detect" becomes split by feed type. "We'll monitor it" becomes the evaluation plan with a release gate.

## 14. Answer the Cost Pivot in Ten Minutes

No ready-made drill covers this group, so the card below is own construction. It draws on the throughput arithmetic of section 3 and on the agent-steps and retries cost drivers. The pivot to expect is "the bill is climbing, and drafts are taking too long during a storm."

| | |
|---|---|
| Dominant driver | Agent steps and carrier tool calls per exception, multiplied by retries against flaky carrier APIs during a disruption burst, plus any model call placed on routine scan events |
| Cheapest lever first | Keep the model off the event stream: rules and a small classifier for detection, the Resolution Agent only on detected exceptions. Cache shipment and route lookups within a case; cap agent steps and carrier calls per exception; retry budgets with circuit breakers; deterministic templates for the common missed-scan rebook; small model for routine drafts, strong model only for over-$500 and customs drafts a human will read |
| Metric that proves it | Model calls per detected exception; cost per resolved exception by type; carrier calls and retries per case; time-to-draft p95 split by feed type; approval-queue depth |
| Do not | Send every carrier event to the LLM, or retry a flaky carrier API until the storm passes |
| 60-second line | Most events are routine scans, so the model belongs behind detection, not on the stream. Cost should scale with disruptions, not with events. Bound each exception's steps and carrier calls, template the common rebook, cap retries with a breaker that falls back to a human, and spend the strong model only on drafts a human will read. |

During a storm, latency matters as much as cost. The batch path is slow by design, and no model choice changes that. Latency on the real-time path is detection plus drafting plus the queue, and a burst lands in the queue. The latency answer is backlog prioritisation by value and deadline, plus stateless scale-out of detection, not a faster model.

A strong cost answer follows four verbs in order. Measure, by tracing model calls, carrier calls and retries per exception first. Route, sending detection to rules, routine drafts to a small model, and high-stakes drafts to a strong one. Bound, with step caps, carrier-call budgets, retry budgets and breakers. Cache safely, with shipment state keyed on the event version so a stale lookup never drives a reroute.

---

## Level calibration

Every level can draw the agent and the approval queue; the level shows in where the customs rule lives and how far the answer reaches across regions, carriers and approvers.

| Level | Sounds like | Missing |
|---|---|---|
| Senior | Converges webhook and batch feeds after ingestion, keeps the model behind cheap detection, and puts an independent gate before every action: customs first, then under $500 with confidence that meets the threshold. Executes with idempotency keys and circuit breakers that fall back to a human. | Approval-queue SLAs at shift handoff, drafts that explain themselves, and an evaluation plan with release gates. |
| Staff | Adds the operational layer: regional data planes behind one shared control plane, residency enforced in the application too, queue-depth alerts for about 40 concurrent agents, and offline, shadow, then staged rollout with zero customs auto-resolves as a release gate. Says plainly that a carrier without idempotency goes human-only. | The stakeholder map when SAP, weather and 500 regional managers join, and how audit data should move the threshold over time. |
| Principal | Owns the gate as a versioned control-plane asset, so a threshold change is a release with an audit entry, and lets edit and reject rates from the audit log decide which exception types ever earn auto-resolve. Sequences the rerouting expansion by risk, data quality first, with success metrics agreed with each owning group before the build. | The confidence threshold and the shadow agreement target, which need replayed history and the ops lead's sign-off; reroute benefit needs a matched holdout. |

## Key Takeaways

- The four clarifying answers are the design, and each one moved a box.
- Requirements are stated so a test can fail them, and the customs rule is an invariant, not a threshold.
- The system is sized by event throughput, so the model sits behind detection and scales with disruptions, not scans.
- One diagram shows two ingestion paths, one pipeline, and a gate before anything acts.
- Batch and streaming converge after ingestion, and batch lateness is surfaced rather than averaged away.
- The Policy Gate is its own component and checks customs first, before value and confidence.
- A shared control plane with regional data planes keeps EU data in the EU behind one experience.
- Idempotency keys, circuit breakers, split time-to-detect and queue SLAs make actions safe and failures visible.
- The audit log is a first-class store, and every draft explains itself at the point of approval.
- Evaluation is raised unprompted: replay offline, shadow, then staged auto-resolve, with the customs invariant as a release gate.
- The rerouting variant is the same system: SAP, weather and 500 managers map onto ingestion, detection and the approval surface.
- Every decision carries a named trade-off, and the Policy Gate is the one non-negotiable.
- The hour goes to the questions, the gate and the evaluation plan.
- The cost pivot is answered by keeping the model off the stream and bounding each exception's steps, calls and retries.

## Check Yourself

1. **For each of the four clarifying answers, which box did it move?** Mixed feeds moved ingestion to two paths; low DAU moved sizing to event throughput; the auto-versus-human rule created the Policy Gate with a customs path; EU residency created regional data planes.
2. **Why is the Policy Gate a separate component, and what is the ordering inside it?** A separate gate is independently testable and auditable and cannot be bypassed by a confidence-score bug. Customs runs first and short-circuits; only then does under $500 with confidence that meets the threshold auto-resolve.
3. **Why does the gate take the exception type from detection, not from the agent?** An agent that mislabels a customs hold as a weather delay could otherwise route itself around the customs rule.
4. **Why not force batch carriers onto a real-time interface?** Polling a file drop does not make the carrier report sooner; it only adds infrastructure. Converge after ingestion and surface the lateness.
5. **What does the shared-control-plane, regional-data-plane pattern cost?** Cross-region reporting needs an aggregation layer that ships metrics, not raw EU records.
6. **Why track time-to-detect separately for batch carriers?** An average hides that a meaningful share of exceptions are detected hours late by design, not by failure.
7. **What happens when a carrier API turns flaky mid-storm?** The circuit breaker opens and those cases route to a human instead of piling up retries behind every other exception.
8. **What is the release-gating evaluation for this system?** Detection recall per type must not drop, customs auto-resolutions must stay at zero on adversarial cases, and the residency test must pass.
9. **Why does a reroute need a holdout to evaluate?** The route not taken is never observed, so benefit is measured against comparable exceptions handled the old way.
10. **How do SAP, weather APIs and 500 warehouse managers map onto the anchor?** SAP is the system of record and a batch-style source; weather is a streaming detection signal; the managers are the approval surface, reached in their own regional systems.
11. **What is the sixty-second cost answer?** Keep the model behind detection so cost scales with disruptions, bound steps, carrier calls and retries per exception, template the common rebook, and spend the strong model only on drafts a human reads.

## References

All paths are relative to the repository root.

| Section | Source |
|---|---|
| 1, 2, 4, 5, 6, 7, 8, 9, 12 | `02_System_Design_Case_Studies/Classic_Design_Walkthroughs/Handbook_Casebook/05_Logistics_Exception_Handling.md` (the anchor) |
| 1, 2, 4 to 9, 12 | `02_System_Design_Case_Studies/Classic_Design_Walkthroughs/System_Design_Course/AI Logistics Exception-Handling Assistant Design.md` (older source of the anchor, with the same figures and fuller reliability and governance text) |
| 1 (the open architecture prompt) | `02_System_Design_Case_Studies/Classic_Design_Walkthroughs/System_Design_Course/Mock - AI Exception-Handling Assistant.md` (the captured mock, stage 1 only) |
| 10, 11, 13 (Tier 2 follow-ups) | Problem decomposition question bank (this repo): the logistics prompt, its failure modes, follow-up probes and six-step framework |
| 14 | `01_Concept_Tutorials/Cost_and_Latency_Optimization/CORE_8_DRIVERS_MEMORIZE.md`, drivers 5 (agent steps and tool calls) and 6 (retries) |
| 3, 10, 11 (the mapping), 14, and every item marked own construction | Built for this page from the sources' arguments; not source material |
| Cross-references | G03 (deny-first gate), G07 (tenancy ladder), G15 (channel adapters) in this folder |

### Fact-check sources (checked 27 Sep 2026)

- [European Commission: Rules on international data transfers](https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/rules-international-data-transfers_en): GDPR allows transfers out of the EU with safeguards, so "EU data stays in the EU" is the customer's rule
