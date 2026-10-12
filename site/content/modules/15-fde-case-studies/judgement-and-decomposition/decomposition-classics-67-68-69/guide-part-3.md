# Decomposition Classics: 911 Response Times, Bank Fraud, Medication Errors, part 3

## 8. Compare the Three Side by Side

The method repeats. The mission, the riskiest input and the human boundary change every time.

| | #67 911 response | #68 Bank fraud | #69 Medication errors |
|---|---|---|---|
| Hidden conflict in the mission | Speed vs. cost vs. equity | Catch rate vs. customer friction vs. regulatory approval | Safety vs. alert fatigue vs. nurse time |
| Riskiest input | Traffic sensors, thin where equity is judged | Labels, defined three ways | Administration records, which may not exist |
| First slice | Interval segmentation report | Single investigator queue | Retrospective dose reconciliation |
| Model, chosen last | Travel-time regression plus coverage optimisation | Explainable classifier on one fraud type | Rules first, risk ranking later |
| Language model's role | Summarise call notes, if triage is slow | Summarise case notes; help relabel | Extract missing fields, human-confirmed |
| Human boundary | Dispatcher keeps authority | Model risk signs before any decision changes | Pharmacist confirms before a nurse is alerted |
| Guardrail metric | Worst district's 90th percentile | False-positive rate on legitimate customers | Alerts per nurse per shift |
| Source curveball or likely one | GPS feed lost | A legacy system withheld | No bedside scanning |

Read the fifth row as a pattern. In none of the three is a language model the core. Each gets a bounded assisting role behind a human. That is the source's pattern made concrete: goal first, data second, model last.

## 9. Answer the Tier 2 Probes These Cases Invite

The source lists 27 Tier 2 probes. These six are the ones these three cases draw. Answers are *(own construction)*.

**"When do you route to human-in-the-loop?"** Route whenever the action is irreversible, regulated, or clinical. In all three cases that means always, for version one. The system recommends and the human decides. The design question is where the human sits: the dispatcher at the console, model risk at the gate, the pharmacist before the nurse.

**"How does auditing and logging drive HITL decisions?"** Log every recommendation with its reason, and every accept or override with the human's reason. Override clusters show where the system is wrong. Falling override rates, on cases later confirmed correct, are the evidence for widening automation.

**"What metrics matter beyond task success?"** Guardrail metrics that catch harm the headline hides. The worst district's percentile, false positives on legitimate customers, and alerts per nurse per shift. Each can worsen while the headline improves.

**"Design an evaluation harness."** Backtest on history first, then shadow, then a pilot against a matched comparison. Hold out a labelled set the model never trains on. For #68 the holdout is relabelled to the one definition. For #69 it is pharmacist-reviewed.

**"Graceful degradation when the model is unavailable?"** Each design keeps the existing process as the primary path. The dispatcher's standard view, the legacy fraud rules, and the pharmacy's order-time checks all stay live. The system adds a check; an outage removes the addition, never the baseline.

**"How do you detect goal drift?"** Watch the guardrail metrics, not only the target. A fraud model can raise its catch rate by declining more customers. A coverage optimiser can cut the average by abandoning the far districts. The guardrail metric is how drift shows up.

## 10. Open Each Case in Two Minutes

Each opener is *(own construction)*. Say it before drawing anything.

**#67.** "Before designing anything, I want to pin down what faster means. Response time can be improved on average while the outer districts get slower, so I'd ask whether the target is a citywide average or a percentile every district must meet. I'd also ask which interval counts. Time to scene has four parts: answering, triage, dispatch and travel. I'd assume the goal is the 90th percentile for priority-one calls, by district, with no new budget. The first thing I'd build isn't a model. It's a join of call records and GPS tracks that shows where the minutes go. If travel dominates, the lever is where idle ambulances wait. If triage dominates, it's a completely different project. Dispatchers keep authority throughout."

**#68.** "The hard part here isn't the model, it's that three systems each mean something different by fraud. So in the first 90 days I'd deliver two things. The first is one investigator queue across all three systems, with customers matched between them. That creates value on its own, because fraud that crosses systems becomes visible. The second is a relabelled sample with one agreed definition, and a shadow model on one fraud type validated against it. Nothing changes a decision until model risk signs off. I'd also be clear that unlabelled cases mean uninvestigated, not legitimate."

**#69.** "I'd start by asking what the system is allowed to do, and I'd propose it only flags risk for a clinician. It never changes an order. Next I'd want to measure the error rate, because incident reports undercount. The first slice reconciles ordered, dispensed and administered doses for a few time-critical drugs after surgery. Pharmacists review the flags. That gives a baseline and a precision figure before any alert reaches a ward. Precision matters because alert fatigue is itself a safety risk. Nurse schedules help find where errors cluster, by load and handover, never to rank nurses."

## 11. Answer the Cost Pivot in Ten Minutes

The source has no cost drill for these cases, so the card is *(own construction)*. It is grounded in two drivers from the cost playbook: agent steps and tool calls, and batch jobs and evaluation pipelines. The pivot to expect is "this is getting expensive, where does the money go?"

| | |
|---|---|
| Dominant driver | Not model calls. It is data engineering and human review time: joins, entity resolution, relabelling and pharmacist confirmation. Model spend is small because the core models are regressions, classifiers and rules. Language models run only on notes. |
| Cheapest lever first | Keep language models off the high-volume streams: GPS pings, transactions and dispensing events. Run them only on the narrow text tasks, in batch, with a small model. Spend human review on a stratified sample, not on every record. Reuse the relabelled set as the evaluation set. |
| Metric that proves it | Cost per investigated case (#68); pharmacist minutes per confirmed flag (#69); cost per recommendation accepted (#67); language-model calls per thousand events, which should stay near zero |
| Do not | Send every transaction, GPS ping or dispense event to a language model, or cut human review below the level that keeps precision safe |
| 60-second line | These systems are cheap in compute and expensive in people. The models that matter are small. The expensive part is building one trustworthy label, so spend review time on a stratified sample and reuse it for evaluation. Keep language models on notes, in batch, and off the event streams. |

The four verbs still generate the answer. Measure human-review minutes and model calls per case. Route high-volume events to rules and small models, and text to a language model only in batch. Bound review to a sample. Cache resolved entities and reconciled labels so no one pays twice.

---

## Level calibration

In all three cases the levels split on reach: the data and the lever at Senior, owners and gates at Staff, the organisation's long-term choices at Principal.

### #67: Faster 911 Response

| Level | Sounds like | Missing |
|---|---|---|
| Senior | Splits time to scene into answer, triage, dispatch and travel, joins call records to GPS tracks, and lets the slow segment choose the lever. | Who owns each feed, who signs off on moving units, and what happens when the GPS feed drops. |
| Staff | Names the EMS operations chief and the council as owners, guards the worst district's 90th percentile, caps utilisation, and keeps the standard dispatch view live in an outage. | Whether placement alone can close the gap, or the city needs more than software. |
| Principal | Treats the outcome log as the city's evidence base: override rates and district tails decide when to widen automation, and when to argue for new stations once the no-new-budget year ends. | Whether placement or capacity is the binding limit needs the city's own segment data. |

### #68: Unified Bank Fraud

| Level | Sounds like | Missing |
|---|---|---|
| Senior | Ships a single investigator queue on entity resolution, then a shadow model on one fraud type, and treats unlabelled cases as unknown, not legitimate. | The label is three teams' definitions, so reconciliation needs owners and a sign-off, not just a script. |
| Staff | Makes label reconciliation a workstream signed by senior investigators, gates each phase of the 90 days, and lets nothing change a decision until model risk signs. | What happens to the three legacy systems and their teams after day 90. |
| Principal | Frames the reconciled label as a bank-wide asset: one fraud definition, a reusable holdout, and a path to retire legacy rules as validated models earn trust. | Which system retires first depends on [losses by system] and vendor terms the design cannot see. |

### #69: Fewer Medication Errors

| Level | Sounds like | Missing |
|---|---|---|
| Senior | Reconciles ordered, dispensed and administered doses retrospectively, with weight-based and time-window rules that pharmacists review for precision. | Alert fatigue and governance: who approves thresholds, and how many alerts a nurse can take per shift. |
| Staff | Brings in the pharmacy and therapeutics committee, caps alerts per nurse per shift, pilots one ward against a matched ward, and keeps schedules aggregated by ward and shift. | Whether software is the right fix at all when administration records are missing. |
| Principal | Says plainly that bedside scanning may beat any model, protects honest incident reporting, and plans how flags spread across the network's wards. | The rollout order needs each ward's [baseline error rate], which only the first slice produces. |

## Key Takeaways

- The round scores clarifying and narrated reasoning, and it fails architecture-first answers and hand-waved evaluation.
- Six steps on a clock turn a vague prompt into a mission, owners, an input map, ordered workstreams, a walking skeleton and a live re-plan.
- The input map, with owner and quality-risk columns, is the tool that stops a model being chosen before its data is understood.
- Workstreams go in order of which unknown could kill the project, and in all three cases that is the data.
- #67 decomposes time to scene first, protects the worst district, and treats the model as regression plus optimisation.
- #68 delivers a single queue and one reconciled label in 90 days, with a shadow model that changes nothing until model risk signs.
- #69 lets the system only flag, measures the error rate before reducing it, and treats alert fatigue as a safety risk.
- Side by side, the mission, the riskiest input and the human boundary change, and the language model is never the core.
- The Tier 2 probes are answered with human boundaries, guardrail metrics, staged evaluation and existing processes as fallback.
- Each opener names the hidden conflict and the first slice within two minutes.
- The cost pivot lands on people, not tokens: sample human review and keep language models off the event streams.

## Check Yourself

1. **What are the two failure modes the source says eliminate candidates?** Jumping to architecture before clarifying scope, and hand-waving evaluation.
2. **What are the six steps, in order?** Clarify the mission; stakeholders and success metrics; map the inputs; decompose into workstreams sequenced by risk; walking-skeleton MVP; adapt live.
3. **Which two columns does this page add to the input map, and why?** "What it can answer," which ties data to the decision, and "quality risk," where curveballs land.
4. **In #67, why segment the interval before building anything?** The slow segment chooses the lever. If triage dominates, routing work is the wrong project.
5. **In #67, which metric protects equity?** The worst district's 90th-percentile time to scene, which must not rise.
6. **In #67, what changes when GPS disappears?** Travel estimates fall back to traffic sensors, which are thin in outer districts. The pilot stays in a sensor-rich district, and equity error bars widen.
7. **In #68, why is "unlabelled" not "legitimate"?** Unlabelled cases were never investigated, so treating them as negatives teaches the model that uninvestigated fraud is fine.
8. **In #68, what is the honest 90-day deliverable?** A single investigator queue plus a validated shadow model on one fraud type, not a production model deciding transactions.
9. **In #69, why is precision a safety property?** Low precision causes alert fatigue, and ignored alerts include the real ones.
10. **In #69, why must nurse schedules never rank nurses?** Surveillance discourages honest incident reporting, which the error measurement depends on.
11. **Across all three, what role does a language model play?** A bounded assisting role on free text, behind a human, never the core decision.
12. **What is the 60-second cost answer?** These systems cost people, not tokens. Sample human review, reuse the reviewed set for evaluation, and keep language models on notes in batch.

## References

### Fact-check sources (checked 27 Sep 2026)

- [AHRQ PSNet: Reporting Patient Safety Events](https://psnet.ahrq.gov/primer/reporting-patient-safety-events) — incident reports capture only a fraction of events compared with record review and observation
- [AHRQ PSNet: Culture of Safety](https://psnet.ahrq.gov/primer/culture-safety) — reporting depends on a blame-free environment; individual blame impairs safety culture
- [AHRQ PSNet: Factors influencing the reporting of medication errors and near misses among nurses](https://psnet.ahrq.gov/issue/factors-influencing-reporting-medication-errors-and-near-misses-among-nurses-systematic-mixed) — fear of blame and consequences is a barrier to nurses reporting medication errors

