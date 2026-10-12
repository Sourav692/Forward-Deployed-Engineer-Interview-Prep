# Scoping Doc to Deployed Agent in Two Weeks, part 3

## 11. Treat a Stalled Engagement as a Visible Outcome

The framework does not guarantee every engagement deploys in 14 days. It guarantees that when one does not, everyone knows which gate stopped it and why.

| Fails | Behaviour |
|---|---|
| A hard gate genuinely fails, not late but denied | The engagement stays at its current stage; the failure is a first-class event, not a silent stall |
| The wrong person attempts a sign-off | Denied, logged, state unchanged; no partial progress |
| The golden set never gets customer sign-off | Evaluate is blocked; a customer-side failure the framework surfaces rather than routes around |
| Success metrics are not met by day 14 | The go/no-go gate does not pass; "no-go" is a legitimate outcome |

Scale here is not ten million chunks. It is one FDA running six engagements at once. The state machine does not change with portfolio size; capacity does. Gates start queueing behind a person's calendar rather than the customer. Designing that needs real engagement-duration data first, the same way embedding-cache hit rates need real query logs.

## 12. Read the Northwind Numbers Honestly

Five metrics are computed on demand from the engagement's own history, never tracked separately.

| Metric | What it tells | Northwind demo |
|---|---|---|
| Time-to-first-value | How long until the customer saw anything real | 1 day |
| Eval score at handover | The number true when responsibility transferred | 0.83 |
| Human-approval override rate | Falling means trust earned; flat means not ready for less supervision | 0.27 |
| Week-4 retention | Whether the deployed thing is still used a month later | `None` until recorded, never a fake `0.0` |
| Accelerator reuse rate | Productised process versus bespoke heroics | 0.83 |

The run also shows 6 of 6 gates passed, `deployed True` on day 14, and one escalation, auto-raised on day 3 and resolved when the gate passed. The project has 17 gate-enforcement tests, deterministic, with no LLM anywhere.

Read these as one engagement, run once. The eval score and time-to-value are demo-scripted, not measured on a real delivery. What is proven is that the pipeline enforces its own gates. Saying so before the interviewer asks is itself the signal.

## 13. Read #65 as the Same Case in Prose

#65 is not a second design. It is the anchor's Northwind running case, written three ways, and each adds something to rehearse.

| Source in #65 | What it adds beyond the anchor script |
|---|---|
| Module 10 doc 3, Scoping to Production in Two Weeks | The fourteen-day table with exit conditions, the trust-ladder link to Module 05, the one-breath restatement |
| `projects/03_enterprise_realtime_capstones/04_fde_delivery_framework/data/case_study.json` | The two success metrics verbatim, the three connectors, the SME id |
| AI_Engineer `INTERVIEW_SCRIPT.md` | Identical to the anchor; the anchor was lifted from it, so reading one covers both |
| The code project (`run_engagement_demo.py`, `demo_gate_failure.py`, 17 tests) | The evidence strings and figures in section 5, and the negative-control demo |
| Module 10 doc 4 and `docs/05` | The five metrics, the two gate pairs, the evidence-bar critique, credentials, residency and tenancy |

The negative-control demo is the most persuasive artefact in the group. It shows intake refusing an unmeasurable request, then three denials: `wrong_role`, `no_evidence` and `prior_gate_incomplete`. It then attempts a stage skip that has no code path, and the day-3 escalation fires by itself. A demo of things being stopped proves more than a demo of things working.

## 14. Deliver It in Sixty Minutes

Write the time budget in the corner of the board.

| Minutes | Phase |
|---|---|
| 0–8 | Clarify and scope |
| 8–15 | High-level pipeline |
| 15–35 | Deep dive: gates and the reuse system |
| 35–45 | Cross-cutting: risk mitigation, metrics, CI/CD parallels |
| 45–55 | Failure modes and scale, portfolio not chunks |
| 55–60 | Close: trade-offs and what to build first |

Announce the risk before the deep dive. Seven stages in order is not a hard problem. The hard part is making "done" mean something checkable instead of "time passed", and making the library real enough that week two does not turn into bespoke code.

Summarise in three sentences at minute 55:

> *"A seven-stage pipeline where every transition is blocked behind a named, role-gated decision, not a status field. Reusable assets are pulled before anything is custom-built, and that ratio is tracked as the actual measure of whether the process is repeatable. Two of four named risk mitigations are automatic checks in code, not reminders on a tracker — and I can tell you exactly which two aren't, yet."*

The source's summary says two of four, while its own risk table marks three of four as built. Quote the table: the day-3 escalation, unmeasurable-metric refusal and SME refusal are built, and change-control is not.

| Decision | Chose | Would revisit if |
|---|---|---|
| Role-gated sign-off over self-certification | Six named gates, six named authorities | A single-person delivery team where role separation is impossible; gates compress, they do not disappear |
| Hard refusal at intake over "start and hope" | Refuse unmeasurable or SME-less requests | A strategic customer the business accepts anyway; add an explicit override with its own sign-off |
| Automatic escalation over manual tracking | Day-3 auto-escalate on data access | Mitigations multiply and a dashboard is clearer than N checks; then it becomes a rules engine |

Close forward-deployed. Week one of an internal rollout is not all seven stages. Pick the two gates most often skipped under deadline pressure, the golden-set sign-off and the rollback test, and make only those structurally unskippable. That proves gates as code change behaviour before anyone argues about the other five.

The lines that carry the round:

1. "A gate is a decision with a named authority behind it, not a checkbox anyone can tick."
2. "There's no code path that skips a stage — the same way the RAG project has no code path that skips the ACL filter."
3. "Refuse to start an engagement with no measurable success metric — the two-week clock is a consequence of readiness, not a target."
4. "The reuse-vs-custom ratio is the actual measure of 'productised process,' not a slide bullet."
5. "An automatic escalation on day 3 beats a reminder on a tracker — it fires whether anyone was watching or not."
6. "A 'no-go' at day 14 is a legitimate outcome, not a failure of the framework."
7. "Some engagements shouldn't be two weeks — knowing which to reject is part of the design, not a gap in it."

Questions to ask them: what the accelerator library looks like today, whether code, templates or tribal knowledge; where the two-week target actually broke and at which gate; who owns go/no-go in practice; and how many engagements one Forward Deployed Architect carries at once.

## 15. Answer the Pilot-Spend Pivot in Ten Minutes

The pivot after a good answer is "who pays for the pilot, and what stops it running away?" There is no playbook drill for this group, so the answer is the self-drill card.

| | |
|---|---|
| Dominant driver | Evaluation and logging overhead during the pilot, plus an unbounded agent in front of real tickets |
| Cheapest lever first | Agree cost per resolved ticket at intake alongside the quality metrics; sampled evals not full-corpus; step and token caps from day one; budget alert per pilot |
| Metric that proves it | Cost per resolved ticket vs the intake baseline; eval spend per day; P95 |
| Do not | Instrument cost after the pilot proves value |
| 60-second line | Cost is a success metric agreed at intake, not a cleanup after go-live. Cap the agent, sample the evals, and report cost per resolved ticket in the same dashboard as quality. |

The card fits the framework without a new box *(own construction)*. Cost per resolved ticket becomes a third success metric at intake, so the refusal rule covers it: no baseline, no clock. `cost_attribution_dashboard` is already in the library, so it is pulled on day 1, not built on day 13. And `success_metrics_met` then certifies cost alongside first-response time and zero-edit sends.

Every strong cost answer follows four verbs in order. Measure cost per resolved ticket from day 1. Route only the top 3 categories to the agent. Bound steps, tokens and eval volume. Cache safely, never across customers.

---

## Key Takeaways

- The round is an operating-model question, and speed is a side effect of reuse and hard gates.
- Five clarifying questions each change a box: SLA or target, go/no-go owner, reusability, hard failure, scope of adoption.
- The requirements are the scoping document: two measurable metrics, a named SME, named sources, constraints and stated non-goals.
- Two systems share the board: the gated delivery pipeline, and the triage agent it produces.
- Fourteen days run in a fixed order, and each stage exits only when a checkable thing is true.
- Every gate is a decision by an allowed role, with evidence, in order, and seniority is not an override.
- Intake refuses rather than starting a clock against something unmeasurable.
- The accelerator reuse rate, 83% on Northwind, turns "productised" into a number.
- Risk mitigations are checks in code, with change-control named as the honest gap.
- A real gate still needs an evidence bar with a required shape, and the delivery process meets the same security bar as the product.
- A stalled engagement names its gate, and scale means FDA capacity, not data volume.
- The Northwind numbers are one engagement run once; the proof is that the gates enforce themselves.
- #65 is the anchor's running case in prose, code and verified output.
- The hour goes to gates and reuse, and the close makes two gates unskippable first.
- Pilot cost is a success metric agreed at intake, capped, sampled and reported beside quality.

## Check Yourself

1. **Why is "work faster" the trap?** Two weeks is achievable only if most of the work existed before the customer arrived; speed has to come from the library and the gates.
2. **Name the seven stages, their days, and what blocks each.** Scoping 1–2, data readiness 3–4, configure 5–7, evaluate 8–9, shadow 10–11, limited production 12–13, go/no-go 14; blocked in turn by security review, data access, golden set, eval baseline, rollback tested, success metrics.
3. **State the three deny rules.** `wrong_role`, `no_evidence`, `prior_gate_incomplete`, deny overriding, every attempt logged.
4. **What separates `golden_set_signed_off` from `eval_baseline_met`?** The first certifies the test is representative, signed by the SME; the second certifies the agent passed it, signed by the FDA.
5. **Why refuse at intake instead of warning?** A clock against an unmeasurable goal is worse than no clock, and an engagement without an SME cannot pass the two SME gates, so nothing after them.
6. **What does the reuse rate measure, and what is Northwind's?** Reused pulls over total pulls; 83%, five of six, with one custom guardrail policy.
7. **How can a structurally real gate still be a rubber stamp?** Free-text evidence cannot prove adversarial testing happened; require a checklist.
8. **What breaks first at scale?** FDA capacity, with gates queueing behind a calendar rather than the customer.
9. **Which risk mitigation is not built?** Scope-creep change-control, which would reuse `sign_off()` with the sponsor role.
10. **What is the sixty-second pilot-spend answer?** Cost is a success metric agreed at intake: cap the agent, sample the evals, report cost per resolved ticket beside quality.

## References

All paths are relative to the repository root.

| Section | Source |
|---|---|
| 1, 2, 4, 6, 7, 8, 9, 11, 14 | `02_System_Design_Case_Studies/Classic_Design_Walkthroughs/Handbook_Casebook/whiteboard_scripts/04_Scoping_Doc_To_Deployed_Agent_In_Two_Weeks.md` (the anchor, #9) |
| 1, 3, 4, 5, 8 | `01_Concept_Tutorials/FDE_Handbook/10_FDE_Delivery_Operating_Model/03_Scoping_To_Production_In_Two_Weeks.md` (#65) |
| 3 | `projects/03_enterprise_realtime_capstones/04_fde_delivery_framework/data/case_study.json` (#65) |
| 3, 5, 8, 12, 13 | `05_FDE_Delivery_and_Scoping/Delivery_Framework/` — `INTERVIEW_SCRIPT.md`, `README.md`, `scripts/run_engagement_demo.py`, `src/delivery_framework/accelerators.py` (#65) |
| 6, 9, 10, 12 | `01_Concept_Tutorials/FDE_Handbook/10_FDE_Delivery_Operating_Model/04_Gates_Risks_Metrics.md`; `05_FDE_Delivery_and_Scoping/Delivery_Framework/docs/05-security-gate-depth-and-tenant-scale.md` |
| 15 | `CASE_STUDY_INDEX.xlsx`, Drill Add-ons tab, self-drill row for #9 |
| 3 (MoSCoW split, agent requirements, non-functional table), 4 (triage agent diagrams, component failure column), 15 (fit to the framework), and every item marked own construction | Built for this page from the sources' arguments; not source material |

### Fact-check sources (checked 27 Sep 2026)

- [Demo script `run_engagement_demo.py` (pinned companion revision)](https://github.com/Sourav692/ai-engineering-demystified-14-projects/blob/db71e98600bf98c145b6172968da489e05220352/projects/03_enterprise_realtime_capstones/04_fde_delivery_framework/scripts/run_engagement_demo.py) — the 0.83 eval score, "verified <2min" rollback and week-2 metrics are hard-coded evidence strings, not measurements
- [Gate definitions `gates.py` (pinned companion revision)](https://github.com/Sourav692/ai-engineering-demystified-14-projects/blob/db71e98600bf98c145b6172968da489e05220352/projects/03_enterprise_realtime_capstones/04_fde_delivery_framework/src/delivery_framework/gates.py) — the customer SME signs two gates; the FDA signs the eval and rollback gates
- [Zendesk: Announcing the removal of API tokens](https://support.zendesk.com/hc/en-us/articles/10851263566234-Announcing-the-removal-of-API-tokens-as-an-authentication-method-for-API-requests) — API tokens are all-or-nothing; no new tokens from 27 Oct 2026, all off 30 Apr 2027
- [Zendesk: Creating and using OAuth tokens with the API](https://developer.zendesk.com/documentation/authentication/creating-and-using-oauth-tokens-with-the-api/) — read-only access needs the OAuth `read` scope
- [Atlassian: Scoped API tokens in Confluence Cloud](https://support.atlassian.com/confluence/kb/scoped-api-tokens-in-confluence-cloud/) — Confluence supports scoped tokens
