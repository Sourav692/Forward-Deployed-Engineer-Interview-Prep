# The Evaluation Pyramid

*One headline number is cheap to report and useless for repair, so measure every layer separately and never let a safety failure hide inside an average.*

◷ 5 min

"It works on my question" is not evidence, and a single success rate is barely more. Measure each layer of the system on its own, cheapest first, and keep quality and security in separate columns; [Component and Trajectory Metrics](/learn/production-ai/evaluation-and-release-gates/component-and-trajectory-metrics) then names the metric for each layer.

**Objectives:**

- explain why a single accuracy figure cannot localise a regression;
- describe the six layers of the evaluation pyramid and how cost and volume change up it;
- name the three families an enterprise RAG harness scores, and why they are never averaged.

---

## Stop Trusting One Number

Picture an operations agent whose success rate falls from 84% to 76% after a release. Something broke, but what? The cause could sit in retrieval, a tool schema, the planner, the way context is assembled, or the model itself. That is five hypotheses and one number. A single figure cannot tell five causes apart.

The number is still worth having. It shows that something moved. It cannot show where to look, so pair it with measurements that can. Treat measurement as part of the system's infrastructure, not a report written after the fact. A team that cannot measure quality, latency and cost per run is running a demo that happens to sit in production.

## Build the Pyramid From the Cheap Layers Up

The fix is to measure independently at every layer, starting where measurement is cheapest. Each layer up the pyramid costs more per case and runs on fewer cases.

| Layer | What it checks | Typical volume and cost |
|---|---|---|
| Unit assertions | Tools, schemas and parsers behave | Thousands of cases, microseconds each |
| Component metrics | Retrieval, tool choice and arguments | Hundreds of cases, milliseconds each |
| Trajectory evaluation | The path taken was valid and efficient | Hundreds of cases, seconds each |
| Outcome evaluation | The task actually succeeded | Tens to hundreds of cases, plus a judge |
| Human review | A stratified sample, read by experts | Tens of cases, minutes of expert time each |
| Production sampling | Live traffic and user feedback | Continuous |

The shape follows from the cost. Expensive layers cannot run on everything, so cheap layers must catch most defects before the expensive ones ever run. The payoff is diagnosis. With every layer measured, a regression shows up in one row, not just in the headline.

## Keep the Families Apart

An enterprise RAG harness makes the same move at a coarser grain. It scores three families and keeps them separate.

| Worried question | Family | Metrics |
|---|---|---|
| Did the right document reach the context? | Retrieval | recall@k, MRR, nDCG |
| Did the answer use it honestly? | Generation | Groundedness, refusal correctness |
| Did a forbidden document ever surface? | Security | Leak rate, which must be exactly 0 |

Retrieval and generation stay apart for the same reason the pyramid has layers. When an answer is wrong, the team needs to know which half broke. Security stays out of every average for a stronger reason. A leak averaged into a weekly quality score becomes "pretty good this week". A leak counted on its own is an incident.

So quality is a metric to track and improve, while security is a gate that blocks a release. [Release Gates: Safety, Quality, and Cost](/learn/production-ai/evaluation-and-release-gates/release-gates-safety-quality-and-cost) builds the gate.

> **Warning: an aggregate can improve while a user group collapses.** The pyramid localises regressions by layer, but a mean also hides them by segment. Report per segment as well as per layer, or a real gain for most users will mask a serious loss for one.

## Worked Example: Localising the 84-to-76 Drop

Return to the operations agent. The headline success rate has fallen eight points. Read down the pyramid instead of guessing.

Suppose the unit assertions all pass, so tools and parsers are fine. Component metrics show tool-selection accuracy unchanged, but argument validity, the share of calls that pass schema validation first time, has dropped. That metric points at schema design: a missing enum or an unstated unit. Trajectory and outcome scores then fall as a consequence, not as a cause.

In a one-number world the same drop starts a week of guessing across five subsystems. With the pyramid, it points at one schema. That is the purpose of every layer: turn "something got worse" into "this got worse".

---

## Key Takeaways

- A single success rate detects a regression but cannot say which of several subsystems caused it.
- The pyramid measures each layer separately, with cheap, high-volume checks at the bottom catching most defects.
- An enterprise harness scores retrieval, generation and security as three families, never blended.
- Quality is tracked as a metric; security is enforced as a gate that blocks release.

## Check Yourself

1. **A success rate drops from 84% to 76%. Why is that number alone not enough to act on?**
   It cannot distinguish retrieval, tool schema, planning, context assembly or model changes as the cause. Per-layer measurements are needed to localise it.

2. **Why do volume and cost move in opposite directions up the pyramid?**
   Higher layers, such as judged outcomes and human review, cost far more per case, so they can only run on a small sample. The cheap lower layers must catch most defects first.

3. **Why is leak rate never averaged with groundedness or recall?**
   Averaging would let a leak hide inside an acceptable overall score. A leak is an incident, so it is scored as a pass-or-fail gate.

## References

**Sources:** `ch12_validation_and_measurement.md` (*Cracking Agentic AI System Design Interviews*, Ch. 12): opening section and "The Evaluation Pyramid", summarised in our own words. `07_Evaluation_Golden_Sets_Judges.md` (FDE Handbook, Enterprise RAG): "Why this matters" and "Three families, kept separate".
