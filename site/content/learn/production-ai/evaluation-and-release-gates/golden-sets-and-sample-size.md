# Golden Sets and Sample Size

*A golden set makes evaluation possible, but its labels and its size decide what the numbers can mean, and most suites are too small to see the gains they report.*

The dataset, not the harness, decides what an evaluation number means. Label each case so security and quality failures cannot be confused. Shape the set like real traffic, and size it for the smallest change it must detect; [Validating LLM Judges](/learn/production-ai/evaluation-and-release-gates/validating-llm-judges) then covers the cases no label can score.

**Objectives:**

- describe the fields of a golden-set case and what each one gates;
- explain how a mislabelled case produced a false security alarm, and the fix;
- estimate how many cases a suite needs to detect a given improvement.

---

## Label What Each Case Must and Must Not Do

A golden set is a fixed file of cases. Each case has a question, the principal who asks it, the retrieval strategy, and some mix of these fields.

| Field | Meaning | Effect when it fails |
|---|---|---|
| `expected_docs` | Documents that must all reach the context | Recall must be 1.0, or the case fails |
| `forbidden_docs` | Documents that must never be retrieved or cited | A leak; the whole run fails |
| `distractor_docs` | Allowed but irrelevant documents | A precision miss, tracked but not gating |
| `expect_refusal`, `must_contain` | Behavioural assertions | The case fails on behaviour |

In production, build the set with the customer's own experts: real questions with known-correct source documents. It is the artefact that makes the rest possible. The demo set has 22 synthetic cases. The mechanism is real and the scale is not, and the source says so plainly.

Golden sets are not only for RAG. A SQL-generating agent's case might ask "Show me Q3 sales for EMEA". It expects a `SELECT` query that filters on region and on the third quarter. The checks then cover correctness, valid syntax and efficiency.

## Keep "Forbidden" and "Irrelevant" Apart

One war story shows why the split between forbidden and distractor matters. The harness once reported the `bm25` strategy leaking contract `CT-VTX-001` to the account manager. She is allowed to read that contract. It was simply the wrong document for a pricing question.

The label had merged "unauthorised" with "irrelevant". The fix split the field in two: `forbidden_docs` gates, `distractor_docs` counts against precision. A test, `test_golden_set.py`, now asserts that every forbidden entry is genuinely denied by the policy engine, so the labels cannot drift again.

A false security alarm does more harm than none. It teaches people to ignore the alarm that is real.

## Cover Every Rule, Not Just Every Topic

A second story is about coverage. A test found that no security case ever exercised the `external_restriction` rule. For the contractor persona, the clearance rule always denied first, so the external rule never got a chance to fire.

The fix added a high-clearance external consultant, `u_dana_ext`, and case `S09`. In that case the external rule is the only thing between her and the contracts. A rule no case reaches is a rule nobody has tested.

## Shape the Set Like Real Traffic

Several habits decide whether a set describes the real system.

**Stratify, and report per stratum.** Slice cases by intent, tenant size, data recency or difficulty. An aggregate score hides a segment that collapsed.

**Include failure cases on purpose.** Refusals, escalations and "not enough evidence" cases belong in the set at a realistic share. Without them, the system is rewarded for always answering.

**Version it with a datasheet.** Record the collection window, filters, deduplication method, split strategy and label source.

**Refresh it on a schedule.** Compare it with the live request mix and measure drift. A score on a stale set describes a system nobody uses any more.

## Size the Suite for the Change It Must Detect

Most small reported improvements are not measurable, because most suites are small. A rule of thumb gives the cases needed per variant to detect a change of δ in a success rate near p:

```text
n ≈ 15.7 × p(1 − p) / δ²
```

| Baseline p | Change to detect | Cases needed per variant |
|---|---|---|
| 0.8 | 5 points | about 1,000 |
| 0.8 | 2 points | about 6,000 |
| 0.8 | about 11 points | 200 |

Read the last row backwards. A 200-case suite cannot reliably see anything smaller than about 11 points. A 3-point gain reported on such a suite is almost certainly noise.

There are two honest responses. Run a paired evaluation: both variants on the same cases, testing the per-case difference, which needs far fewer cases. Or accept that offline evaluation gates only large changes, and detect small ones in production experiments where the traffic exists.

> **Warning: a confident small gain on a small suite is usually noise.** Before celebrating a few points, compute the detectable difference for the suite's size. Saying this unprompted, with the arithmetic, is a rare and strong interview signal.

## Worked Example: Sizing a Suite for a Retrieval Change

A team has a 22-case golden set that passes 22/22, and a new retrieval strategy it believes is 5 points better on a baseline near 80%.

Run the arithmetic first. Detecting 5 points at p = 0.8 needs about 1,000 cases per variant. The 22-case set says almost nothing about strategy choice; its value is the leak gate, not the quality numbers. So the team pairs the comparison: both strategies on the same cases, per-case differences tested. It grows the set with the customer's experts, stratified by source type and persona, with refusal cases at a realistic share.

The suite did not need to be huge. It needed to be honest about what its size could show, and labelled so that a precision miss could never be read as a leak.

---

## Key Takeaways

- A golden-set case lists what must reach the context, what must never surface, and what is merely irrelevant; only the first two gate.
- Splitting forbidden from distractor labels, with a test that every forbidden entry is truly denied, stops false security alarms.
- Coverage means every rule is exercised by at least one case where it alone decides.
- Stratify, include failure cases, version with a datasheet, and refresh against live traffic.
- Size the suite with `n ≈ 15.7 × p(1 − p) / δ²`; a 200-case suite cannot see gains below about 11 points.

## Check Yourself

<details>
<summary>1. A case retrieves an allowed but irrelevant document. Does the run fail?</summary>

No. It is a distractor, counted as a precision miss. Only forbidden documents, retrieved or cited, fail the run.

</details>

<details>
<summary>2. Why was a high-clearance contractor persona added to the golden set?</summary>

Low-clearance contractors were always denied by the clearance rule first, so the external-restriction rule was never tested. The new persona makes it the only deciding rule.

</details>

<details>
<summary>3. Your 200-case suite shows a 3-point gain. What do you say?</summary>

That it is probably noise: at this size only changes of about 11 points are detectable. Use paired evaluation or a production experiment.

</details>

