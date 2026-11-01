# Diagnosing Low Adoption

*A technically ready system invites more technical fixes, but when nobody uses it the cause is usually workflow, trust or incentives, not the model.*

"It launched; nobody uses it" is an interview prompt and a common field reality. Investigate whether the product solves a pain worth solving, inside the way people already work, before touching the model.

**Objectives:**

- run a structured investigation when a working system is not adopted;
- separate product-fit causes from quality and friction causes;
- plan adoption measurement before launch rather than after.

---

## Investigate Fit Before Quality

The question bank's scale-up case ends with the follow-up: the system is technically ready but users are not adopting it; what should be investigated? Its list has nine items, and they fall into three groups.

| Question behind the symptom | What to investigate |
|---|---|
| Is this worth using at all? | Whether the problem is important enough; whether the product solves the user's actual pain point |
| Does it fit how people work? | Workflow fit, integration friction, training and onboarding, incentives |
| Is it good enough to rely on? | User trust, response quality, latency |

Start at the top. A fast, accurate assistant for a problem nobody feels will not be adopted, and no amount of quality work changes that. Only once the first two rows check out is a quality or latency fix likely to move usage.

> **Warning: improving the model is the default reaction and often the wrong one.** If the tool sits outside the workflow, or using it earns nobody anything, a better model leaves adoption where it was.

## Plan Adoption Measurement From the Start

Adoption is easier to diagnose when it was planned for. The bank lists change management and adoption measurement among the things to cover when scaling a prototype from 100 to 100,000 users. Its rollout questions ask, before launch, how adoption and business impact will be measured.

The account-research case shows what that looks like. Its success metrics include seller adoption and time saved alongside brief accuracy and citation coverage. Measuring adoption next to quality makes the gap visible early: high accuracy with low adoption points straight to fit or friction.

## Worked Example: The Unused Account-Brief Assistant

An account-brief assistant for sales reps passes its accuracy tests, but few reps open it. Walk the table top to bottom.

Is the problem important enough? Reps do spend time preparing for meetings, so the pain is real. Does it fit the workflow? The briefs live in a separate tool, while reps prepare inside the CRM. That is integration friction. Are there incentives? Nothing in the reps' targets rewards preparation time saved. Training? Reps were never shown when a brief is ready.

The diagnosis is fit and friction, not quality. The next steps are to surface briefs inside the CRM and to brief sales managers, and the success metric stays seller adoption next to brief accuracy. The model was never the bottleneck.

---

## Key Takeaways

- Investigate low adoption in order: is the problem worth solving, does the tool fit the workflow, and only then is it good enough.
- Workflow fit, integration friction, onboarding and incentives cause more non-adoption than model quality.
- Plan adoption measurement before launch, next to quality metrics, so the gap shows early.

## Check Yourself

<details>
<summary>1. Name three of the nine adoption causes the bank lists.</summary>

Any three of: problem importance, workflow fit, user trust, response quality, latency, training and onboarding, incentives, integration friction, and whether it solves the actual pain point.

</details>

<details>
<summary>2. Why investigate fit before quality?</summary>

A high-quality tool for an unimportant problem, or one outside the workflow, still goes unused. Quality fixes help only once fit is confirmed.

</details>

<details>
<summary>3. What does high accuracy with low adoption suggest?</summary>

A fit, friction, trust or incentive problem rather than a model problem.

</details>

