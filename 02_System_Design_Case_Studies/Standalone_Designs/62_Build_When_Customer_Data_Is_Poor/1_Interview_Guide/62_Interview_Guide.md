# Build an AI System When the Customer's Data Is Poor

*The customer wants value this quarter, and the data can only prove what it contains.*

◷ 26 min

Poor data changes what gets built first. It is no reason to refuse the work. The page answers a problem-decomposition interview prompt. It follows the scoping discipline of [G12](../../../Scenario_Packs_G01_G20/G12_Scoping_To_Deployed_Agent/4_Full_Design/G12_Full_Design.md) and the gating discipline of [G13](../../../Scenario_Packs_G01_G20/G13_Evaluation_And_Release_Gating/4_Full_Design/G13_Full_Design.md) without repeating them.

| Case | What the page adds |
|---|---|
| Build an AI System When the Customer's Data Is Poor | Sections 1 to 15: diagnosis, readiness scoring, the build-anyway decision, a worked warranty-claims design, evaluation with poor labels, the customer conversation, a phased plan, the script and the cost card |

- The source gives this case one prompt, eleven talking points and one closing line.
- It has no "likely follow-up" block, unlike most questions in the bank.
- Everything past those lines is assembled from other repo material or marked *(own construction)*.
- The worked example in sections 6 to 10 is entirely own construction, and every number in it is an assumption.

---

## 1. Refuse to Start With the Model

The prompt, verbatim from the question bank:

> "The customer wants an AI solution, but its data is incomplete, inconsistent, and poorly documented."

The source lists what a strong answer discusses: data-quality profiling, ownership, missingness, duplicates, and schema inconsistencies. It adds label quality, freshness and data contracts. It ends with human-in-the-loop correction, narrowing the initial use case, and whether AI is actually the right solution.

It also gives the conclusion to land on:

> "I would not begin with model selection. I would first determine whether the available data can support a measurable workflow improvement."

Say that sentence early. A model cannot be more reliable than the evidence it is given. A better model mostly produces more fluent answers from the same broken records. The interviewer is testing whether that instinct arrives before the architecture does.

The bank's list of mistakes to avoid applies with extra force here. "Starting with 'I would use RAG and agents'" is mistake one. "Discussing model accuracy without defining evaluation" is mistake five. Poor data makes both worse, because the labels that would define accuracy are themselves suspect.

## 2. Ask the Questions That Decide Whether Data Matters

Not every data problem blocks every use case. The clarifying questions find out which defects touch the decision the customer wants improved.

| QUESTION | WHAT CHANGES WITH THE ANSWER |
|---|---|
| Which decision or task should improve, and who makes it today? | Which fields matter; the rest of the data can stay poor |
| What does "poor" mean to the person saying it? Missing, wrong, or unfindable? | Whether the fix is collection, correction, or integration |
| Who owns each source, and who can fix it upstream? | Whether defects get repaired at source or patched downstream forever |
| Is there any trusted outcome record: approvals, refunds, audits? | Whether historical labels exist at all, and how far to trust them |
| How is the task done today without AI, and how long does it take? | The human baseline, which is the bar the system must beat |
| Which errors are tolerable, and which need a human? | Where confidence thresholds and review queues sit |
| What data may leave which boundary? | Whether scanned documents can go to a hosted model |
| Is a rules or reporting fix enough? | Whether AI is the right solution at all |

The last question comes from the source's list. Some "AI projects" are a missing dropdown on an entry form. Fixing the form beats building a model to guess what the dropdown would have said. Saying so is a signal of judgement, not a failure to sell.

The bank's reusable opening fits this case well. Clarify the outcome, user, workflow, constraints and success measure, then state assumptions. The difference here is one extra promise: "and I will measure the data before I trust it."

## 3. Split "Poor" Into Failure Types You Can Measure

"The data is bad" is not actionable. Eight distinct failure types hide inside it, and each has a different week-one measurement and a different remedy *(own construction, built on the source's talking points)*.

| FAILURE TYPE | SYMPTOM | MEASURE IN WEEK 1 | WHAT IT BLOCKS | REMEDY |
|---|---|---|---|---|
| Missing | Empty or placeholder fields ("N/A", "OTHER", 0) | Null and placeholder rate per field, per source | Any feature or answer that needs the field | Extract from free text or attachments; make the field required at entry |
| Wrong | Values present but false | Error rate on a 100-record sample checked by an SME | Trusting any single field without corroboration | Cross-check against a second source; flag, do not silently fix |
| Inconsistent labels | Same case, different label across teams or years | Agreement between two SMEs relabelling the same sample | Supervised training; historical labels as ground truth | Adjudicated relabel of a stratified sample; a written label guide |
| Stale | Correct once, not now | Age of last update against how fast the fact changes | Any answer about current state | Freshness per source; a staleness flag shown to users |
| Siloed or unjoinable | No shared key across systems | Join success rate on a sample | Any view spanning two systems | Entity resolution with a reviewed match table |
| Unstructured or scanned | The fact is in a PDF, photo or email | Share of records whose key fact is only in an attachment | Rules and reports; cheap retrieval | Extraction to a schema, with confidence and review |
| Biased or unrepresentative | History covers some segments, not others | Record counts by segment and period against current traffic | Any claim of accuracy outside the covered segments | Stratified sampling; explicit out-of-scope segments |
| Access-restricted | Data exists, but the project cannot use it | Sources with access granted versus requested | Everything downstream of that source | Escalate by day 3; design around the gap |

In my experience, two rows fool teams most often.

**Inconsistent labels are worse than missing labels.** A missing label is visibly missing. An inconsistent one looks like ground truth, gets trained on, and then scores the model's copied errors as correct. A routing case shows it. A fine-tune reported 94% accuracy against an 81% prompted baseline, then reached only ~78% in production. One of three compounding causes was that labels came from a previous version of the same system's routing decisions. The model learned the old system's errors, and evaluation marked them right. After deduplication, a split by time and a human-adjudicated relabel, the honest number came out near 83%. Production matched it within two points.

**Access restrictions are a data-quality problem in disguise.** The delivery framework in G12 treats data access as its own risk, with a mechanism attached: "Start day 1, escalate day 3". Data nobody can read has quality zero, whatever it contains.

## 4. Score Readiness in One Week

A readiness assessment turns "poor" into a number the customer can argue with. It also produces the decision memo that justifies what gets built. One week is enough if the scope is one decision, not the whole estate *(own construction)*.

| Day | Activity | Output |
|---|---|---|
| 1 | Confirm access; inventory sources, owners and refresh schedules | Source map with an owner per source |
| 2 | Profile every field the decision needs: nulls, placeholders, distinct values, duplicates, schema drift | Profile report per source |
| 3 | Pull a stratified sample of about 200 records; two SMEs label 100 independently | Measured label agreement |
| 4 | Test joins across systems; check freshness; count records by segment and period | Join rate, staleness, coverage by segment |
| 5 | Score the card; write the decision memo | Build, narrow, or not yet |

- Day 3 is the most important day. Relabelling by two SMEs measures label consistency directly, instead of asking someone whether the labels are good.
- Use Cohen's kappa rather than raw agreement: agreement corrected for what two random labellers would achieve by chance.
- Raw agreement overstates quality when one label dominates, because always guessing the majority class looks accurate.
- Set the floor for a judge at κ ≥ 0.60, and I'd use the same floor for a pair of humans.

The scorecard scores only the dimensions the target decision depends on *(own construction)*:

| DIMENSION | GREEN | AMBER | RED |
|---|---|---|---|
| Coverage of required fields | ≥ 90% populated | 60–90% | < 60% |
| Correctness on SME spot check | ≤ 5% wrong | 5–15% | > 15% |
| Label agreement (κ) | ≥ 0.75 | 0.60–0.75 | < 0.60 |
| Freshness versus rate of change | Within tolerance | Lagging, flaggable | Unknown or unbounded |
| Join rate across needed sources | ≥ 95% | 80–95% | < 80% |
| Access to needed sources | All live and verified | Requested, in progress | Refused or no owner |
| Segment coverage versus current traffic | All in-scope segments present | Gaps named and excludable | Main segment missing |
| Ownership and documentation | Named owner, known meaning | Owner known, meaning inferred | Nobody can say what a field means |

The thresholds are assumptions to adjust per domain. The decision rule is not. A red on a dimension the chosen design depends on means redesign or wait. A red on a dimension the design can route around means narrow the scope and say so in writing.

The delivery framework in G12 already has the slot for this week. It allocates days 3–4 to data readiness, and its gate is `data_access_granted`, signed by the customer SME. The scorecard raises the evidence bar behind that signature. Access being live is necessary. Access to data that scores red is not readiness.

## 5. Decide What to Build Anyway, or Say Not Yet

Poor data rules out some designs and barely affects others. Pick a design whose weakest input is one the data can supply *(own construction)*.

| DESIGN THAT TOLERATES POOR DATA | WHY IT TOLERATES IT | WHAT IT STILL NEEDS |
|---|---|---|
| Retrieval over a curated subset | Uses only documents someone vouched for; ignores the rest | An owner who curates, and a freshness flag |
| LLM-assisted extraction and normalisation, with review | Turns scanned or free-text records into structured fields; review catches errors | A schema, confidence scores, reviewer time |
| Rules plus an LLM | Rules handle the clean, high-volume cases; the model handles the messy tail | Rules owned by the business, not the model |
| Human-in-the-loop labelling loop | Every reviewed item becomes a trusted label | Reviewers whose corrections are captured, not typed around |
| Weak supervision | Several cheap, noisy labelling rules vote; the votes become a training signal | A small trusted set to measure the rules against |
| Synthetic data | Covers rare cases the history lacks | Real data to validate against; never the only evaluation |

- Weak supervision needs a gloss. Instead of hand-labelling every record, write several cheap labelling rules: a keyword match, a lookup table, a model's guess.
- Each rule is individually unreliable. Their combined votes, weighted by each rule's estimated accuracy, give a usable label at scale.
- Tools like Snorkel estimate those weights from where the rules agree and disagree; a small trusted sample checks the result.

Synthetic data carries the sharpest caveat. One rule for eval sets applies directly: "a small, real eval beats a synthetic one for customer-specific evaluation." Synthetic examples fill gaps in coverage. They cannot tell anyone how the system performs on this customer's records.

- Say "not yet" when three things line up: the target decision depends on a field that scores red, no design can route around it, and no human process exists that could generate the missing truth.
- The honest answer then is a data project with a date, not an AI project with a hope.
- The delivery framework's intake rule says the same thing about metrics: "Refuse to start. A two-week clock against an unmeasurable goal is worse than no clock."
