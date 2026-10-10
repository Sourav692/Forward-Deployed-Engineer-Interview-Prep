# Estimates People Can Trust

*A single confident number sounds decisive, but an estimate others can check is a range with its assumptions and risks in plain view.*

◷ 5 min

Precision early in a project is usually invented. A trustworthy estimate is one another engineer can read, question and challenge, built from the scoped first release in [Shrinking to a First Release](/learn/forward-deployed/scoping-an-fde-project/shrinking-to-a-first-release).

**Objectives:**

- break scope into deliverables and sort each by how well it is known;
- give a range with best, expected and risk cases, and say what moves it;
- re-estimate openly when an assumption fails, and speak clearly under uncertainty.

---

## Break the Work Into Deliverables

Estimate deliverables, not the project as a whole. The guide's breakdown starts with product clarification and technical design. It then covers the front end, the back end and data, and integrations and infrastructure. The AI workflow with its quality testing comes next. Admin and operations, and testing, rollout and monitoring, close the list. Each can be estimated and challenged on its own.

## Separate What Is Known From What Is Guessed

Each deliverable falls into one of three kinds, and each kind is handled differently.

| Kind | Example | How to handle it |
|---|---|---|
| Known | A standard dashboard with login | Estimate from experience |
| Known unknown | Whether the payment provider supports the refund rules | Research it, or run a short technical test (a spike) |
| Unknown unknown | A surprise limit in a vendor's system | Hold a buffer, and connect to risky systems early |

## Give a Range and Say What Moves It

"21 working days" early in a project is false precision. "Three to five weeks" is more honest, provided the lead can say what keeps it near three and what pushes it to five. Think in three cases. In the best case, the known path works. The expected case includes normal rework and review. In the risk case, a major assumption fails or scope grows. The range should narrow as the team learns and integrates.

Write the assumptions next to the range. Here is a usable estimate. For one experienced engineer, the MVP is about three to five weeks. That assumes hosted login, hosted payment checkout and an existing design system. A production pilot is about six to eight weeks. The largest unknowns are the refund rules and the door-access integration.

## Re-Estimate When a Fact Changes

Never defend a number whose assumptions have failed. Re-estimate after the first integration, after a spike, when scope changes, or when the target moves from demo to pilot. Explain the change in terms of work. The estimate moved from four weeks to six because the new requirement adds custom permissions and a data migration. Then offer the trade-off.

> **Warning: "this should take about three weeks" hides the one risk that matters.** A stronger version names it: the core workflow is likely three to four weeks, the biggest risk is payment reconciliation, so run a two-day spike on it before committing to a final date.

## Speak Plainly When Uncertain

Avoid both "it depends" and fake certainty. Give the current range, the assumption behind it, and the next piece of evidence that will narrow it.

| Situation | A clear way to say it |
|---|---|
| Early estimate | It is a rough range on today's scope, expected to narrow after the integration test. |
| Missing requirement | The timeline hinges on whether the agent only reads data or can act on accounts, because those carry different risk. |
| Scope increase | It can go in, but it adds permissions and support work, so the date moves or something else comes out. |
| Technical risk | The vendor API is the main unknown; test it first rather than hide it in a buffer. |
| Estimate change | An assumption changed; here is the new work and the trade-off. |

## Worked Example: Estimating the Class-Booking MVP

A stakeholder asks how long the class-booking MVP will take. Break it down. Login and checkout are hosted, so they are known. The booking workflow with waitlists is known but has many states. The refund rules are a known unknown: the payment provider may not support them. Door access is a known unknown too.

The answer: three to five weeks for one experienced engineer, assuming hosted login, hosted checkout and an existing design system. The best case holds if the provider handles the refund rules. The risk case applies if it does not, or if door access joins the first release. A spike on refunds comes first, and the range is reissued after it.

Note a disagreement inside the source. The guide's later booking case study, in [Scoping in Practice](/learn/forward-deployed/scoping-an-fde-project/scoping-in-practice), sizes a single-location booking MVP at six to ten weeks. That version adds memberships, an admin portal and operations work, so the two figures rest on different scope. The gap is itself the lesson: a number means little without its assumptions.

---

## Key Takeaways

- Estimate deliverables one by one so each can be challenged.
- Sort work into known, known unknown and unknown unknown, and treat each differently.
- Give a range with best, expected and risk cases, and write the assumptions beside it.
- Re-estimate openly when facts change, and explain the change as work and trade-offs.
- Under uncertainty, state the range, the assumption and the next piece of evidence.

## Check Yourself

1. **How should a known unknown be handled differently from an unknown unknown?**
   A known unknown gets research or a short spike. An unknown unknown gets a buffer and early connection to the risky systems.

2. **Why is "21 working days" a weak early estimate?**
   It claims precision the team does not have. A range with stated assumptions is more honest and easier to challenge.

3. **The scope grows mid-project. What should the lead say?**
   That it can be added, but it costs time, people or another item. Then re-estimate and explain the change as added work.

