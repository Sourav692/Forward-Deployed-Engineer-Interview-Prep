# Validating LLM Judges

*A model judge is often the only scalable way to score open-ended output, yet until it is checked against humans it is an unmeasured instrument producing confident numbers.*

◷ 5 min

An LLM judge is a classifier, and an unvalidated classifier is not ground truth. Design the rubric so the judge must show its evidence. Then calibrate it against human labels before trusting any score; the gate in [Release Gates: Safety, Quality, and Cost](05_Release_Gates_Safety_Quality_and_Cost.md) depends on it.

**Objectives:**

- design a judge rubric with separate criteria, anchored levels and quoted evidence;
- validate a judge with Cohen's kappa and a position-bias check;
- explain why a judge must never grade its own model's answers.

---

## Treat the Judge as an Unvalidated Classifier

Open-ended output has no reference string to match, so a model judge is often the only option that scales. The danger is treating its verdicts as truth. Using an unvalidated judge as ground truth is the most common measurement error in this field.

A judge is a classifier like any other. Nobody would ship a classifier without measuring its accuracy. A judge deserves the same treatment, and its calibration figure should travel with every number it produces.

## Decompose, Anchor, and Demand Evidence

Three rules turn a judge prompt into a rubric.

**Score criteria separately.** Groundedness, completeness, correctness and format each get their own score. A single blended "quality" score tends to track length and fluency, not the property under test.

**Anchor every level with an example.** "3 means every claim is cited" is checkable. "3 means good" is not.

**Require evidence before the score.** The judge must quote the span that supports or contradicts each claim, then score. The quotation is what turns an impression into a check.

A simple pass-or-fail judge follows the same idea. In the SQL example from [Golden Sets and Sample Size](03_Golden_Sets_and_Sample_Size.md), the judge gets the generated query and the expected criteria. It answers yes or no with its reasoning. A yes can still carry a note: the query filtered correctly, but `SELECT *` was inefficient.

## Calibrate Against Humans Before Trusting a Score

Validation follows a fixed sequence.

1. Build a human-labelled calibration set of at least 100 cases.
2. Compute Cohen's kappa between the judge and the humans.
3. If kappa is below 0.60, the judge is not usable on its own; report its scores as unmeasured.
4. Check position bias: randomise the order of answers and compare verdicts.
5. If the bias exceeds 10 points, the judge is not usable either.
6. Otherwise, use the judge and report kappa next to every score it produces.

Kappa matters because raw agreement flatters. When one label dominates, a judge that always guesses the majority label looks excellent on raw agreement while adding no information. Kappa subtracts the agreement two random labellers would reach by chance:

```text
κ = (observed agreement − expected agreement) / (1 − expected agreement)
```

## Never Let a Model Judge Itself

A model rates its own output above an equally good answer from a different model. That self-preference is real and measurable. So never judge with the model that generated the answer.

Pairwise comparisons need one more safeguard. Present the two answers in both orders. If A wins in one order and loses in the other, record a tie, not a coin-flip win.

> **Warning: a calibration run can be too small to calibrate.** The enterprise RAG project calibrated its groundedness judge on 6 hand-labelled cases and reported 100% agreement with a mean absolute error of 0.033. The validation guidance used in this lesson asks for at least 100 labelled cases and a kappa of 0.60 or more. The two sources disagree on scale: treat a 6-case result as a working mechanism, not as proof the judge is reliable.

## Worked Example: Calibrating a Groundedness Judge

The enterprise RAG project scores groundedness with an LLM judge on every run. Its script, `calibrate_judge.py`, runs the real `GROUNDEDNESS_SYSTEM` prompt against hand-labelled cases. They span fully grounded, fabricated, wrong-date and partial answers. It reports agreement and mean absolute error against the human labels.

The live run scored 100% agreement and an error of 0.033. The mechanism is the right shape: the production prompt, real failure types, a human reference. To meet the validation bar, the next step is to grow the labelled set past 100 cases and compute kappa. Then check position bias wherever the judge compares answers, and confirm the judge is a different model from the generator.

The judge did not become trustworthy when it agreed with six labels. It becomes trustworthy when its error rate is measured on enough cases to mean something, and that figure is printed beside every score.

---

## Key Takeaways

- A model judge is an unvalidated classifier until measured against humans; its calibration figure travels with every score.
- A good rubric scores separate criteria, anchors each level with an example, and demands quoted evidence before a score.
- Validate with at least 100 human labels, kappa of 0.60 or more, and position bias of 10 points or less.
- Never judge with the generating model, and record order-dependent pairwise verdicts as ties.

## Check Yourself

1. **Why is raw agreement a weak way to validate a judge?**
   When one label dominates, always guessing it scores high agreement while adding no information. Kappa corrects for chance agreement.

2. **What is wrong with one blended quality score from a judge?**
   It tends to track length and fluency. Separate criteria with anchored levels measure what was intended.

3. **A judge prefers answer A when shown first and answer B when B is shown first. What do you record?**
   A tie. An order-dependent verdict carries no preference, and the bias itself should be measured.

## References

**Sources:** `ch12_validation_and_measurement.md` (*Cracking Agentic AI System Design Interviews*, Ch. 12): "Designing a Judge Rubric" and "Validating the Judge", summarised in our own words. `07_Evaluation_Golden_Sets_Judges.md` (FDE Handbook, Enterprise RAG): "Calibrating the judge". `Cross_Cutting_System_Design_Quick_Reference_v2.md`: §8 "LLM-as-Judge Evaluation".
