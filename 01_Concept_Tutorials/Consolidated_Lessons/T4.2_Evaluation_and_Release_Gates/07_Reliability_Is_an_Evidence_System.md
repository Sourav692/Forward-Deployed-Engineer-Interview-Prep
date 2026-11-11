# Reliability Is an Evidence System

*One good demo proves the system can work. Reliability is the claim that it works often enough, for the right people, and fails safely when it does not. That claim needs evidence.*

◷ 6 min

Traditional software is reliable when the same input gives the same correct output and the service stays up. An AI system adds a probabilistic core: the same input can give different outputs, some good and some not. You cannot prove such a system correct by trying it a few times. You can only collect enough evidence, from enough places, to say how it behaves and how it fails. This lesson frames reliability that way and shows where each piece of evidence comes from.

**Objectives:**

- explain why one good output is not evidence of reliability;
- define reliability targets from the user's outcome, set by the cost of failure;
- list the evidence sources that together support a reliability claim;
- treat reliability as continuous rather than a launch milestone.

---

## Treat the Output as a Distribution

Ask a support assistant the same question ten times and you get ten answers. Nine may be right, one may cite the wrong policy. The question is not whether the system can answer correctly. It plainly can. The question is how often it answers correctly, on which kinds of question, and what happens on the other runs.

So reliability is a property of a **distribution of behaviour**, measured over many cases and many runs. That is why [Golden Sets and Sample Size](03_Golden_Sets_and_Sample_Size.md) insists on enough cases to detect a change, and why [The Evaluation Pyramid](01_The_Evaluation_Pyramid.md) warns against trusting one number.

Variation also comes from outside the model. Retrieval returns different chunks after a re-index. A tool times out. A provider updates a model version behind the same name. A reliable system is one whose whole pipeline was measured, not just its prompt.

## Define Reliability From the User's Outcome

"Accuracy" is rarely what users care about. Start from what a person needs from the system, then choose measures that track it.

| User outcome | Reliability measure | Target set by |
|---|---|---|
| Gets a correct, sourced answer | Grounded-and-correct rate on the golden set | How costly a wrong answer is |
| Never sees another customer's data | Cross-tenant leaks in the access suite | Zero, because one leak blocks release |
| Gets an answer fast enough to keep using it | p95 end-to-end latency | What users tolerate in this channel |
| Has risky actions stopped or checked | Unsafe-action rate; approvals triggered correctly | The harm of a wrong action |
| Can finish the task | Task completion rate | The business case for the system |

Targets follow consequences. An internal search tool might accept 85% grounded answers. A tool that drafts medical letters needs far more, plus a human check. A safety measure such as leaks or unauthorised actions has a target of zero and is a gate, not a score, as [Release Gates: Safety, Quality, and Cost](05_Release_Gates_Safety_Quality_and_Cost.md) explains.

## Collect Evidence From Every Layer

No single test supports a reliability claim. Each source catches failures the others miss.

- **Offline evaluation** on golden sets shows quality and safety before release.
- **Security testing and red teaming** show what an attacker can make the system do.
- **Guardrails and policy checks** at runtime show what was blocked and why.
- **Traces and observability** show what happened on real requests.
- **Online evaluation and user feedback** show whether quality holds on live traffic.
- **Incident records** show how the system failed in practice and how fast it recovered.

The claim "this system is reliable enough for its users" is the sum of these. When one source is missing, the claim has a hole. A system with excellent offline scores and no tracing cannot explain its first production failure.

## Keep Collecting After Launch

Reliability is not a box ticked at launch. Inputs drift, documents change, providers update models, and users find new ways to ask. Each change can move the distribution.

Keep the loop running: production failures become new golden cases, incidents add regression tests, and each release is measured against the same evidence as the first. The readiness review in the next lesson, [Run a Readiness Review](08_Run_a_Readiness_Review.md), is where that evidence is read before each significant release.

## Worked Example: "Is It Reliable?"

A product manager asks whether the claims assistant is reliable enough to open to all customers.

A weak answer: "We tested it and it works well."

An evidence answer:

- On 600 golden cases, 94% are grounded and correct. The lowest stratum, multi-policy questions, is at 88% against a target of 90%.
- The access suite shows zero cross-tenant leaks across 200 attack cases.
- p95 latency is 4.1 seconds against a 5-second target in chat.
- A two-week pilot with 40 users shows a 91% task-completion rate, and the three escalated incidents all came from one document type that had stale versions.

The recommendation follows from the evidence: open to all customers except for multi-policy claims, fix the stale-document ingestion, and re-measure that stratum before including it.

---

## Key Takeaways

- An AI system's behaviour is a distribution. One good output proves only that it can work.
- Variation comes from the whole pipeline: retrieval, tools, providers and data, not just the model.
- Define reliability from the user's outcome and set each target by the cost of failure. Safety measures are gates with a target of zero.
- Evidence comes from offline evaluation, red teaming, runtime guardrails, traces, online evaluation and incidents. A missing source leaves a hole in the claim.
- Reliability is continuous: production failures feed back into the evidence for the next release.

## Check Yourself

1. **Why is "we tried it and it worked" not evidence of reliability?**
   It samples one point from a distribution. Reliability is how often the system behaves well across many cases and runs, and what happens on the runs where it does not.

2. **How do you choose a reliability target?**
   Start from what the user needs, pick a measure that tracks it, and set the target by how costly a failure is. Safety measures such as leaks get a target of zero and act as gates.

3. **A system has strong offline scores but no tracing. What is missing from its reliability claim?**
   Evidence from real requests. Without traces you cannot see how it behaves in production or explain a failure when it happens.

## References

**Sources:** written for this site. It frames the measurement lessons in this module: [The Evaluation Pyramid](01_The_Evaluation_Pyramid.md), [Golden Sets and Sample Size](03_Golden_Sets_and_Sample_Size.md) and [Release Gates: Safety, Quality, and Cost](05_Release_Gates_Safety_Quality_and_Cost.md). The worked example's figures are illustrative.
