# Component and Trajectory Metrics

*An outcome score says whether the answer was right; only component and path metrics say why, and whether it was right by luck.*

◷ 5 min

A correct final answer is not proof of a healthy system. Score each component with a metric that points at one subsystem, then assert properties of the path the agent took, building on the layers in [The Evaluation Pyramid](/learn/production-ai/evaluation-and-release-gates/the-evaluation-pyramid).

**Objectives:**

- match each component metric to the subsystem it localises;
- explain why groundedness and correctness are different measurements;
- write trajectory assertions instead of a single reference path, safety assertions first.

---

## Give Each Subsystem Its Own Metric

A component metric answers one question: which subsystem is failing? Good ones are cheap, deterministic where possible, and tracked over time on their own.

| Worried question | Metric | What a drop points at |
|---|---|---|
| Did the agent pick the right tool? | Tool selection accuracy: share of steps matching the labelled tool | Tool descriptions, too many tools, routing |
| Were the arguments well formed? | Argument validity: share of calls passing schema validation first time | Schema design, missing enums, unstated units |
| Did the needed evidence come back? | Retrieval recall@k: share of required evidence in the top k | Index, chunking, query construction |
| Was the context mostly relevant? | Context precision: share of assembled context that mattered | Selection policy, dilution |
| Does each claim follow from the evidence? | Groundedness: share of claims supported by retrieved text | Synthesis, verification threshold |
| Did it take a sensible number of steps? | Step efficiency: steps taken over minimum steps needed | Planning, cycles that make no progress |
| Did it stop for the right reason? | Termination correctness: share of runs ending correctly | Loop bounds, stopping policy |

Each row maps a worry to one place in the code. A table like this turns a vague "quality dropped" into a named suspect.

## Rank Retrieval, Not Just Recall It

The enterprise RAG harness scores retrieval with three metrics. Recall@k asks whether every expected document reached the context. MRR, mean reciprocal rank, rewards putting the first right document near the top. nDCG, normalised discounted cumulative gain, discounts each relevant hit by its rank.

The harness uses binary relevance for nDCG. Each retrieved document is either in the case's expected set or not, discounted by `1/log2(rank+1)`. Graded relevance would need every case rewritten with a score per document. That is a content change, so the harness leaves it out and says so.

Two habits make these numbers trustworthy. `run_eval()` calls the real `RAGPlatform.ask()` for every case, with no mocked retrieval. `compare_strategies()` runs the same cases through several retrieval strategies on one shared platform. It returns one summary row per strategy, the artefact behind any claim that one strategy is measurably better.

## Separate Groundedness From Correctness

Groundedness and correctness sound alike and measure different things. Groundedness asks whether a claim is faithful to the retrieved sources. Correctness asks whether the claim matches reality. A claim can be fully supported by evidence and still be wrong, because the evidence itself was stale.

A source cannot vouch for facts it got wrong. So a system scored only on groundedness learns to repeat an outdated document with confidence. Track both, and name the difference when asked; interviewers probe it.

## Assert Properties of the Path

Outcome scores miss a whole class of failure. An agent can reach the right answer by a wasteful, unsafe or lucky route. Outcome-only scoring sees a pass and gives no warning before the luck runs out.

The obvious fix fails. Comparing each run against one reference path breaks immediately, because most tasks have several valid solutions. Every valid alternative would be marked as a failure.

Assert properties of the path instead. "Never call `issue_refund` before checking the order status" is one such assertion. Several correct strategies pass it, and a lucky but unsafe path still fails. Assertions like "stop within N steps of having enough evidence" catch waste the same way.

Write the safety assertions first. They are policy in executable form, they never go out of date, and they are the ones that matter during an incident. An evaluation plan that opens with safety rather than accuracy reads as the work of someone who has run a system with consequences.

> **Warning: a passing outcome score can hide an unsafe path.** If the refund was correct but issued before verification, the outcome metric passes and the system is one bad order away from an incident. Only a trajectory assertion catches that before it happens.

## Worked Example: Scoring a Refund Agent

Take a support agent that can look up orders and issue refunds. One evaluation case asks for a refund on a delivered order.

The outcome check passes: the refund was issued. The component metrics add detail. Tool selection matched the labels, and argument validity was first-time clean. The trajectory assertions add the decisive line. In one run, the agent called `issue_refund` before checking the order's status, and that run fails even though its outcome passed.

The outcome said the agent was right. The path said it was right by luck. That gap is why component and trajectory metrics sit below outcome evaluation in the pyramid.

---

## Key Takeaways

- Component metrics each point at one subsystem, which turns a quality drop into a named suspect.
- Retrieval is scored with recall@k, MRR and binary-relevance nDCG, on the real pipeline, with strategies compared on one shared platform.
- Groundedness measures faithfulness to sources and correctness measures agreement with reality; a stale source can pass one and fail the other.
- Trajectory assertions check properties of the path rather than one reference path, and safety assertions come first.

## Check Yourself

1. **Argument validity drops while tool selection accuracy holds steady. Where do you look first?**
   At schema design: missing enums or unstated units. The tool choice is right; the arguments are not.

2. **How can an answer be fully grounded yet wrong?**
   The supporting evidence was itself outdated or mistaken. Groundedness checks faithfulness to sources, not agreement with reality.

3. **Why not compare every run with a single reference trajectory?**
   Most tasks have several valid paths, so valid alternatives would fail. Assert properties instead, such as "no refund before the status check".

## References

**Sources:** `ch12_validation_and_measurement.md` (*Cracking Agentic AI System Design Interviews*, Ch. 12): "Component Metrics" and "Trajectory Evaluation", summarised in our own words. `07_Evaluation_Golden_Sets_Judges.md` (FDE Handbook, Enterprise RAG): "Three families, kept separate" and "The harness".
