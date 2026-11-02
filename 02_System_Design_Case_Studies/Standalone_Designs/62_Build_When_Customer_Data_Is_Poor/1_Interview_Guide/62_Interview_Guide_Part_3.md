# Build an AI System When the Customer's Data Is Poor, part 3

## 13. Name the Failure Modes Before the Interviewer Does

Most failures in this case come from trusting data or labels more than the week-1 numbers justify *(own construction, except where attributed)*.

| FAILURE | HOW IT SHOWS UP | DEFENCE IN THE DESIGN |
|---|---|---|
| Training on inconsistent historical labels | High offline accuracy, lower production accuracy | Adjudicated relabel; the 94% → ~78% routing case as the warning |
| Random train and test split on repeated records | Offline numbers inflated by near-twins | Deduplicate; split by time and user |
| Defaulting a missing value | A guessed serial number presented as fact | Quarantine or flag; never default |
| Review done outside the tool | Corrections lost; labels never improve | Corrections only through the review queue |
| Automation bias in reviewers | Adjusters accept drafts they should question | Track agreement on seeded known-wrong drafts |
| Segment collapse | Good average, bad on scanned claims from one ERP | Per-stratum reporting in the gate |
| Schema drift at source | A new form version breaks extraction silently | Quality gates on schema; quarantine spikes alert |
| Synthetic data inflating metrics | Headline accuracy rises with no production change | Synthetic cases tagged and excluded from headline metrics |
| Upstream never fixed | The pipeline patches the same defects forever | Data contract with a named owner and a quarantine report |
| Scope creep into auto-decisions | Pressure to approve claims without review | Written non-goal; approval only after the phase 3 gate |

## 14. Deliver It in Forty-Five Minutes

The round rewards spending the first third on diagnosis. A candidate who draws the pipeline at minute three has skipped the part being tested *(own construction)*.

| Minutes | Move |
|---|---|
| 0–3 | Restate; say the source's closing line about not starting with model selection |
| 3–10 | Clarifying questions from section 2; pick the decision to improve |
| 10–17 | Split "poor" into failure types; describe the readiness week and the scorecard |
| 17–22 | Decide what to build anyway; name the "not yet" condition |
| 22–32 | Draw the pipeline: quality gates, extraction, normalisation, review queue, label store |
| 32–38 | Evaluation with poor labels: seed set, κ, sample size, strata, time split |
| 38–42 | The customer conversation and the phased plan |
| 42–45 | Failure modes; what would change the plan |

**The two-minute spoken answer.**

> "I wouldn't start with a model. I'd first find out whether the data can support a measurable improvement in one specific decision. So I'd pick that decision with the customer and spend a week measuring the data it depends on. That means null and placeholder rates, a join test across systems, freshness, and, most important, two experts relabelling the same hundred records so I know whether the historical labels are ground truth or noise. That gives me a scorecard. If the field the decision depends on is red and nothing can route around it, the honest answer is a data project first. Usually something can: extraction from documents doesn't need historical labels, and a review queue turns every correction into a trusted label. So phase one ships extraction with confidence scores and human review. Quality gates at ingestion quarantine bad records rather than defaulting them, and a data contract fixes the worst defects at source. Evaluation starts from a small adjudicated set, reported per segment and split by time. I'd say out loud that a set that small only catches large regressions. Every phase exits on a measured condition, and the system doesn't decide anything on its own until it has matched the experts in shadow mode."

**Likely follow-ups.** The source gives none for this question, so these are *(own construction)*, each with a one-line answer.

- *"The customer says there's no time for a readiness week."* Then scope it to two days on one decision; skipping it means discovering the same facts in production, more expensively.
- *"What if the experts themselves disagree?"* Their disagreement is a finding. Write a label guide, adjudicate, and measure κ again. A task humans cannot agree on cannot have an accuracy target.
- *"Can't a large model just handle messy data?"* It can read messy text well. It cannot recover a fact that is missing or wrong. It also cannot be evaluated against labels nobody trusts.
- *"How do you know the data is getting better?"* Quarantine rate, placeholder rate on new records and κ against adjudicated labels, tracked on the same dashboard as model quality.

## 15. Answer the Cost Pivot in Ten Minutes

The pivot is "what does all this review and relabelling cost, and how do you stop it growing?" There is no playbook drill for this case, so the card is a self-drill *(own construction)*.

| | |
|---|---|
| Dominant driver | Human time: SME relabelling and adjuster review; then extraction calls on scanned pages |
| Cheapest lever first | Route only low-confidence fields to review; hash content so unchanged scans are never re-extracted; label a stratified sample, not the backlog |
| Metric that proves it | Cost per correctly processed claim, including reviewer minutes; review rate per field; re-extraction rate |
| Do not | Label the entire history before shipping anything, or send every page to the largest model |
| 60-second line | The expensive resource here is expert time, not tokens. Spend it only where confidence is low, turn every minute of it into a reusable label, and never pay twice to extract the same page. |

The four verbs from the cost playbook apply in order. Measure cost per correctly processed claim, including reviewer minutes. Route easy fields to a cheap extractor and uncertain ones to people. Bound the review queue with per-field thresholds tuned from measured precision. Cache safely by content hash, so a re-sync never re-extracts an unchanged scan.

I'd expect review cost to fall on its own as labels accumulate. Thresholds can then be set from measured precision rather than caution. That is the economic argument for building the label store in phase 1 rather than later.

---

## Level calibration

The levels split on how far past the model the answer reaches: into the data, into the label loop, or into the customer's own source systems.

| Level | Sounds like | Missing |
|---|---|---|
| Senior | Refuses to start with model selection, runs the one-week readiness scorecard, and reads κ = 0.52 on failure codes as noise and κ = 0.81 on outcomes as a usable label. Builds quality gates that quarantine rather than default, extraction with per-field confidence, and a review queue for low-confidence fields. | How adjuster corrections become trusted labels, and what a 100-claim seed set can and cannot detect. |
| Staff | Runs the review queue as a label factory: corrections made in the tool, reviewer and time recorded, disagreements adjudicated, weak supervision on the failure-code field. Sizes the eval honestly, reports it per ERP source and attachment type, splits by time, and exits each phase on a measured condition with shadow mode before live drafts. | Fixing the defects at source, and telling the customer with measurements rather than adjectives. |
| Principal | Pushes a data contract onto both ERPs so serial number is required and one code list exists at entry, using the quarantine report as the evidence. Frames phase 0 as value the customer keeps without AI, writes the non-goals down, and says "not yet" when a red field blocks every route. | Whether the source owners will sign the contract, and the real scorecard thresholds, which only this customer's week-1 numbers can set. |

## Key Takeaways

- Start by testing whether the data can support a measurable improvement, not by picking a model.
- Clarifying questions find which data defects touch the decision being improved.
- "Poor" splits into eight failure types, each with its own week-one measurement and remedy; inconsistent labels are the most dangerous.
- A one-week readiness assessment produces a scorecard and a build, narrow or not-yet decision.
- Some designs tolerate poor data; say "not yet" only when a red field blocks every route.
- The worked warranty example turns measured defects into testable requirements.
- The architecture is a data-repair pipeline with a small decision layer on top.
- Quality gates at ingestion quarantine bad records instead of defaulting them, and data contracts fix defects at source.
- The review queue is a label factory, with deduplication, time splits and adjudication.
- The eval set starts small and trusted, is sized honestly, and is reported per stratum.
- Tell the customer with measurements, and frame phase 0 as value.
- Phases exit on measured conditions, with shadow mode before any live decision.
- Most failure modes come from trusting data or labels more than the numbers justify.
- The forty-five minutes front-load diagnosis; the spoken answer ends on shadow mode.
- The dominant cost is expert time, so spend it only where confidence is low and keep every correction.

## Check Yourself

1. **What sentence should open the answer?** "I would not begin with model selection. I would first determine whether the available data can support a measurable workflow improvement."
2. **Why ask whether a rules or form fix is enough?** Because some data problems are an entry-form defect, and fixing the form beats building a model to guess the missing value.
3. **Why are inconsistent labels worse than missing ones?** Missing labels look missing; inconsistent labels look like ground truth, get trained on, and make evaluation score copied errors as correct.
4. **What happens on day 3 of the readiness week, and why use kappa?** Two SMEs relabel the same sample; kappa corrects agreement for chance, so a dominant class cannot flatter it. The floor is 0.60.
5. **When is "not yet" the right answer?** When the decision depends on a red field, no design routes around it, and no human process can generate the missing truth.
6. **In the warranty example, why are outcomes usable as labels but failure codes are not?** Adjusters agree on outcomes at κ = 0.81 and on codes at only κ = 0.52.
7. **Where do quality gates sit, and what do they do with a bad record?** At ingestion, before extraction; they quarantine it with a reason and never default a value.
8. **What makes a review correction usable as a label?** It is made in the tool, on the field, with the original kept, the reviewer and time recorded, and disagreements adjudicated.
9. **What can a 200-case eval set detect at p = 0.8?** Nothing reliably smaller than about 11 points; a 5-point gain needs about 1,000 cases per arm.
10. **Why split the eval set by time rather than at random?** Random splits put near-identical records on both sides and inflate every number.
11. **How should the customer hear that their data is poor?** As measurements with a plan, with phase 0 framed as value they can use without AI.
12. **What must be true before the system shows live drafts?** Adjuster agreement in shadow mode clears the phase-3 bar, and minutes per claim are measurably down.
13. **What is the sixty-second cost answer?** Expert time is the expensive resource: spend it only on low-confidence fields, turn every minute into a label, and never re-extract an unchanged page.

## References

All paths are relative to the repository root.

| Section | Source |
|---|---|
| 1, 2 (last question), 5, 14 (opening) | Problem-decomposition interview prompts: this case's prompt, the reusable answer template, the mistakes to avoid |
| 10 | Same source, the evaluation-strategy prompt and its "What if there is no labelled data?" follow-up |
| 3, 9, 10 | Agentic system design notes on learning in agentic systems: dataset hygiene gates and the 94% → ~78% routing case |
| 4, 10 | Agentic system design notes on validation and measurement: Cohen's kappa and the 0.60 floor, sample-size arithmetic, stratification, datasheets |
| 3, 4, 5, 12 | Delivery operating model notes on scoping to production in two weeks, and on gates, risks and metrics: data-readiness days, `data_access_granted`, "start day 1, escalate day 3", refuse at intake, shadow mode |
| 8 | Enterprise RAG notes on the ingestion pipeline: quarantine not default, content hash, freshness and dead-letter records |
| 10 | Enterprise RAG notes on evaluation, golden sets and judges: the false-alarm label war story |
| 5, 10 | RAG and retrieval tutorial: eval set without labelled data |
| 8 | `05_FDE_Delivery_and_Scoping/Delivery_and_Collaboration/10. Cross Team Collaboration.md`: data contracts and two-phase delivery |
| 15 | `01_Concept_Tutorials/Cost_and_Latency_Optimization/`: the measure, route, bound, cache-safely sequence |

Related packs, for cross-reference rather than repetition: [G12 Scoping to Deployed Agent](../../../Scenario_Packs_G01_G20/G12_Scoping_To_Deployed_Agent/4_Full_Design/G12_Full_Design.md) for gates and intake refusal; [G13 Evaluation and Release Gating](../../../Scenario_Packs_G01_G20/G13_Evaluation_And_Release_Gating/4_Full_Design/G13_Full_Design.md) for the release gate; [G01 Enterprise Knowledge Assistant](../../../Scenario_Packs_G01_G20/G01_Enterprise_Knowledge_Assistant/4_Full_Design/G01_Full_Design.md) for messy enterprise documents and permission normalisation; [G06 NL Over Governed Data](../../../Scenario_Packs_G01_G20/G06_NL_Over_Governed_Data/4_Full_Design/G06_Full_Design.md) for governed metric definitions; [Decomposition Classics](../../Decomposition_Classics_67_68_69/) for the bank-fraud case built on inconsistent labels.

Sections 2 (all questions but the last), 3 (the table), 4 (procedure, scorecard, thresholds), 5 (design table, weak-supervision and not-yet rule), 6 to 9 (the warranty scenario, its numbers and architecture), 11 to 13, 14 (script, spoken answer, follow-ups) and 15 (the card) are own construction, built for this page from the sources' arguments. They are not source material.

### Fact-check sources (checked 27 Sep 2026)

- [Snorkel: Rapid Training Data Creation with Weak Supervision (Ratner et al., 2017)](https://arxiv.org/abs/1711.10160): labelling functions vote, and their accuracies are estimated without ground truth
- [Cohen (1960), A Coefficient of Agreement for Nominal Scales](https://doi.org/10.1177/001316446002000104): kappa as agreement corrected for chance
