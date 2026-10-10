# Delivering an Agent in Two Weeks with Enforced Gates

*A two-week delivery clock rewards speed, while every gate that can be ticked by whoever is in a hurry turns speed into unverified risk.*

◷ 12 min

Taking a customer from scoping doc to deployed agent in two weeks is an operating-model question, not a software architecture question. Design the pipeline so each gate is a decision enforced in code, signed by a named authority, and pace the round with [the six-step whiteboard clock](/learn/ai-systems-design/sixty-minute-whiteboard/the-six-step-whiteboard-clock).

**Objectives:**

- frame the round on enforced gates rather than pipeline shape;
- refuse engagements whose success metrics cannot be measured;
- model delivery as a state machine of role-gated sign-offs that cannot be skipped;
- measure reuse from an accelerator library as the test of a productised process;
- treat stalls and a no-go as first-class, visible outcomes.

---

## Frame the Round on Gates, Not Boxes

The prompt is "Design a delivery framework that takes a customer from scoping doc to deployed AI agent in under 2 weeks." Say one sentence early. This is an operating-model question. Anyone can draw a pipeline with seven boxes. The signal is whether each box is a real, enforced gate or just a status someone reports honestly. The design makes the gates code, not trust.

That sentence names the real test. The test is repeatability, not cleverness. It also shows why this problem differs from the RAG and workflow-platform designs, and sets up the deep dive.

Five clarifying questions change the design. Is "2 weeks" a hard SLA or a target? That decides whether a gate failure means slipping the date or aborting and re-scoping. Who owns the go/no-go decision: the FDA, the account team or the customer? That decides the role allowed to sign the success-metrics gate. What is genuinely reusable across customers? The accelerator library only works if most of what is needed already exists, which is truer for the 50th customer of a proven type than for a new one.

What happens if a hard gate genuinely fails, for example a security review finding a real blocker: pause or terminate? Is this for one team or an org-wide standard? That decides whether the library is a shared, versioned asset or tribal knowledge. Then scope it. Design the pipeline as a state machine with named, role-gated checkpoints and a reusable asset library behind each stage. The infrastructure-provisioning layer under "configure, do not code" is a system in its own right; name what it must do and move on.

## Refuse What Cannot Be Measured

The anchor case is Northwind Logistics: a Tier-1 support triage agent over Zendesk, Confluence and Salesforce. Two success metrics are agreed at intake, in writing, before day 1. First-response time is under 5 minutes on the top 3 ticket categories. Zero-edit sends reach 60% of eligible tickets by week 4.

Both can be measured directly from ticket timestamps and edit history; neither is "the agent should be helpful". If a metric cannot be measured that cleanly, intake refuses the engagement instead of starting a clock against it. A two-week clock cannot be met against a target nobody can measure.

Say this before drawing a single box. It is cheap. It is also the highest-signal move in the whole design. The two-week clock is a consequence of readiness, not a target to chase.

Write the nouns: engagement, stage, gate, principal with a role, artefact, accelerator asset, escalation and metric. Then narrate one engagement. A scoping request arrives. Intake checks it is measurable and has an SME assigned, or refuses it. Accepted, it enters day 1 at Scoping. Each of the next six stages sits behind a named gate, signed only by the role authorised for that gate. The FDA cannot sign the security gate, however senior. Each stage pulls what it needs from the library before building anything custom. On day 14, if the metrics were met, the sponsor signs go/no-go, and the agent deploys with a runbook and dashboards.

## Label Every Gate With Who Signs It

```
 SCOPING ──> gate:security_review ──> DATA READY ──> gate:data_access ──> CONFIGURE
  (1-2)         (security reviewer)     (3-4)           (customer SME)      (5-7)
                                            |
                                   day 3, still pending?
                                   AUTO-ESCALATE
                                            v
      gate:golden_set ──> EVALUATE ──> gate:eval_baseline ──> SHADOW
       (customer SME)       (8-9)          (FDA)              (10-11)
                                                                   |
      gate:rollback_tested ──> LIMITED PROD ──> gate:success_metrics ──> GO/NO-GO
             (FDA)                (12-13)            (sponsor)              (14)
                                                                                |
                                                                          DEPLOYED
```

This is the same decision shape as the RAG design's ABAC engine: a named rule, a role check, deny overrides and an explicit reason. A gate sign-off and a document-access decision are the same kind of problem. Is the person asking actually authorised to say this is true?

No code path jumps a stage. `advance_stage()` only ever moves to the immediate next one, just as the RAG design has no path that queries the vector store without the ACL filter. The property is not a rule people follow; it is a rule the code cannot violate.

## Make a Gate a Decision, Not a Checkbox

Announce the risk. The pipeline shape is easy. Seven stages in order is not hard. The hard parts are making "done" mean something checkable instead of "time passed", and making the library real enough that week two does not turn into bespoke code.

A naive gate is a checkbox, "security review complete", that anyone can tick. An enforced gate is `sign_off(gate, signer, evidence)` with three conditions. The signer's role must be in the gate's allowed roles, with deny overrides. The evidence must be non-empty, because "approved" is not evidence. And every earlier gate must already be passed, so nothing is signed out of order.

A checkbox is a status; a gate is a decision with a named authority behind it. An FDA closing their own security gate is the delivery version of an LLM enforcing its own access control. The person closest to the work is not automatically the person authorised to certify it is safe.

Risk mitigation becomes automatic too. The plan's rule "data access delays: start day 1, escalate day 3" is not a tracker note. `check_escalation_triggers()` runs a real check: if the data-access gate is still pending on day 3, the system raises the escalation once. It lands in the engagement's permanent event log whether anyone was watching or not.

> **Warning: a status anyone can set is not a control.** If the person under deadline pressure can mark a gate passed, the gate measures honesty, not readiness. Bind each gate to an allowed role and to evidence, and block every later stage until it passes.

## Measure Reuse to Prove the Process Is Productised

Every stage needs assets: a connector, a prompt template, a guardrail policy. Pulling one from the library records it as reused. Building one because it is missing records it as custom, and logs it. The reuse rate is reused pulls divided by total pulls.

"Productised process, not bespoke heroics" is the whole thesis of this problem type. A number makes it testable rather than a slide bullet. On Northwind the rate is 83%: 5 of 6 assets came straight from the library, and one guardrail policy was custom. Tracked across engagements, that ratio shows whether the framework works or is quietly sliding back to bespoke code.

Be honest about what the library is. It is a list of names. Its entries are named assets, such as `zendesk_connector` and `golden_set_harness`, not the connector code or the eval harness itself. A real harness exists in the RAG design and could be wired into the Evaluate stage instead of asserting a score. That wiring is not done yet. The gate mechanism is real; the number behind one piece of evidence currently is not.

## Name Which Mitigations Are Real

The plan names four risks. The reference build implements some and not others.

| Risk | Mitigation | Built? |
|---|---|---|
| Data access delays | Escalate automatically on day 3 | Yes, a real check |
| Scope creep | Change control on the signed scope | No; would reuse the sign-off pattern as a `request_scope_change()` needing the sponsor role |
| Unmeasurable success criteria | Refuse to start | Yes, in `intake()` |
| No customer SME | Contractual prerequisite | Yes, in `intake()` |

The sources disagree with themselves here. The table marks three of four as built, while the closing summary says two of four mitigations are automatic checks in code. One reading is that two are automatic and one is an intake refusal, but the script does not say so. Either way, showing three real and naming the fourth gap beats claiming four and being caught out on a follow-up.

## Treat a Stall as a Visible Outcome

| Fails | Behaviour |
|---|---|
| A hard gate is genuinely denied, not late | The engagement stays at its stage; the failure is a first-class logged event, not a silent stall |
| The wrong person attempts a sign-off | Denied and logged; state unchanged, with no partial progress |
| The golden set never gets customer sign-off | Evaluate is permanently blocked; this is a customer-side failure the framework surfaces, not routes around |
| Success metrics are not met by day 14 | The go/no-go gate does not pass; "no-go" is a legitimate outcome, not a framework failure |

The framework does not guarantee every engagement deploys in 14 days. It guarantees that when one does not, everyone knows which gate stopped it and why, never a vague "it is taking longer than expected". Some engagements should not be two weeks at all, and knowing which to reject is part of the design.

Scale is about the portfolio, not chunks. The equivalent of "10 million chunks" here is one FDA running six engagements at once. The state machine does not change with portfolio size; it is the same gates per engagement. The hard part is capacity: how many engagements one person carries before gates queue behind their calendar rather than the customer. That needs real engagement-duration data before designing it, just as embedding-cache hit rates need real query logs.

## Close on a Narrow Rollout

Summarise in three sentences. A seven-stage pipeline blocks every transition behind a named, role-gated decision, not a status field. Reusable assets are pulled before anything is built custom, and that ratio is tracked as the measure of repeatability. Named risk mitigations run as checks in code, not reminders, and the gaps are stated plainly.

| Decision | Chose | Would revisit if |
|---|---|---|
| Role-gated sign-off over self-certification | Six named gates, six named authorities | A single-person delivery team where role separation is impossible; then gates compress, not disappear |
| Hard refusal at intake over "start and hope" | Refuse unmeasurable or no-SME requests | A strategic customer where the business accepts the risk; then intake needs an explicit override with its own sign-off |
| Automatic escalation over manual tracking | Day-3 auto-escalation on data access | Mitigations multiply and a dashboard becomes clearer; then a rules engine, not hard-coded checks |

For the forward-deployed close, rolling this out internally does not start with all seven stages. Pick the two gates most often skipped under deadline pressure, which in the author's experience are the golden-set sign-off and the rollback test. Make just those structurally unskippable first. That proves gates as code change behaviour, not just documentation, before anyone argues about the other five.

Questions for the interviewer's company: is the accelerator library code, templates or tribal knowledge? Where has the two-week target actually broken down, and at which gate? Who owns go/no-go in practice? How many engagements does one forward-deployed person carry at once? The artefact to show is the gate-failure demo: the same senior person, in the wrong role, is denied, not warned. It is backed by 17 deterministic gate-enforcement tests with no LLM.

## Worked Example: Day 3 at Northwind

Northwind passes intake: both metrics are measurable and an SME is assigned. Days 1 to 2 are Scoping, and the security reviewer signs `security_review` with evidence attached. Data Ready begins, but on day 3 the `data_access` gate is still pending with the customer SME.

`check_escalation_triggers()` fires once and writes the escalation to the event log, with nobody needing to remember. Impatient, the FDA tries to sign `data_access`. The role check denies it, logs it and leaves the state unchanged. The engagement has not slipped silently; it is visibly stuck at a named gate for a named reason.

When the SME signs, Configure pulls five of six assets from the library and builds one guardrail policy custom: 83% reuse. On day 14, the sponsor checks first-response time and zero-edit sends against the agreed numbers. A pass deploys with a runbook and dashboards; a miss is a legitimate no-go. Either way, the outcome traces to gates and evidence, not to time passed.

| Line that carries the round | Point it makes |
|---|---|
| A gate is a decision with a named authority | Role-gated sign-off |
| No code path skips a stage | Structural enforcement |
| Refuse an engagement with no measurable metric | Readiness drives the clock |
| The reuse ratio measures a productised process | Accelerator library |
| An automatic escalation beats a tracker reminder | Risk mitigation |
| A day-14 no-go is a legitimate outcome | Failure behaviour |

---

## Key Takeaways

- Frame the round as an operating-model question: are the gates enforced, or just reported?
- Refuse engagements without measurable metrics or an SME; readiness drives the clock.
- Each gate names who signs it, and `advance_stage()` cannot skip a stage.
- A sign-off needs the right role, real evidence and every earlier gate passed; escalations fire automatically.
- The reuse rate, 83% on Northwind, measures whether the process is productised.
- State which mitigations are built, and note that the source counts them inconsistently.
- Denials, stalls and a no-go are logged, visible outcomes; scale is portfolio capacity, not data volume.
- Close by making the two most-skipped gates unskippable first.

## Check Yourself

1. **Why can the FDA not sign the security gate?**
   The person closest to the work is not automatically authorised to certify it is safe. Each gate allows only named roles, with deny overrides.

2. **What does the 83% reuse rate measure on Northwind?**
   5 of 6 assets came from the accelerator library and one guardrail policy was custom. Tracked across engagements, it shows whether delivery stays productised.

3. **Is a day-14 no-go a failure of the framework?**
   No. It is a legitimate outcome; the framework's job is to show exactly which gate stopped the engagement and why.

