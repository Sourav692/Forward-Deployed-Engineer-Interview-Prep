# Govern AI Systems by Risk Tier

*The same controls on every AI feature either smother the harmless ones or leave the dangerous ones under-protected. Governance should scale with what can go wrong.*

◷ 7 min

A company with one chatbot can review it by hand. A company with forty AI features, some internal summarisers and some agents that move money, cannot give each the same treatment. Governance that works sorts systems by risk, attaches controls to each tier, and makes sure every system has a person who answers for it. This lesson shows how to build that structure without turning it into paperwork nobody reads.

**Objectives:**

- keep an inventory of every production AI system with the fields that matter;
- assign each system a risk tier and map tiers to required controls;
- name the human owners, including who can switch a system off;
- give affected users transparency and a way to get a decision corrected.

---

## Start With an Inventory

You cannot govern what you have not listed. Keep one inventory of every AI system in production, including the small ones a team shipped without telling anyone. For each, record:

| Field | Example |
|---|---|
| Name and purpose | Refund assistant: drafts and issues refunds up to £200 |
| Business owner and technical owner | Head of Support; Payments platform lead |
| Users and affected people | Support agents; customers who receive refunds |
| Data it reads and writes | Order history, customer contact details, refund records |
| Models and providers | Hosted model via the company gateway, pinned version |
| Actions it can take | Create refund, send email |
| Risk tier | Tier 3 |
| How to disable it | Feature flag `refund_assistant_enabled`, owned by Payments on-call |
| Last review | 4 November 2026 |

The inventory is also how you answer the questions that arrive after an incident or from an auditor: which systems use this provider, which ones touch health data, which ones can send email.

## Sort Systems Into Risk Tiers

A tier reflects what happens when the system is wrong, not how advanced it is. Three questions place most systems:

1. **Does it act, or only advise?** A system that drafts text for a person to check is lower risk than one that sends, pays or deletes.
2. **Who is affected, and how much?** Internal convenience is lower risk than decisions about customers' money, health, employment or legal position.
3. **Can the harm be undone?** A wrong summary is corrected tomorrow. A wrong payment or a leaked record is not.

A simple scale is enough:

| Tier | Typical system | Required controls |
|---|---|---|
| 1 | Internal drafting and search over non-sensitive data | Inventory entry, owner, basic logging |
| 2 | Customer-facing answers, sensitive data read | Tier 1, plus an evaluation set, release gate, access controls, a user-facing disclosure |
| 3 | Actions with external effect, such as payments or messages sent | Tier 2, plus scoped authority, human approval above thresholds, audit log, kill switch, red-team before launch |
| 4 | Decisions with legal or significant effect on people | Tier 3, plus documented impact assessment, legal review, a route to human review of any decision |

The point is proportion. Tier 1 systems should ship in days. Tier 3 and 4 systems carry the controls that the other lessons in this track describe, and nobody argues about whether they apply.

Regulation is moving the same way. The EU AI Act sorts systems by risk category and attaches obligations to the higher ones. Your tiers do not need to match any law exactly, but a tier scheme makes it far easier to show which of your systems a new rule touches.

## Name the People Who Answer for It

"The model did it" is not accountability. Every system in the inventory needs named people, recorded by role so the entry survives staff changes:

- A **business owner** who decides what the system is for and accepts its residual risk.
- A **technical owner** who keeps it running, evaluated and patched.
- An **on-call path** that can act at 3 a.m.

Write down who may take each operational action, because an incident is the wrong time to find out:

| Action | Who may do it |
|---|---|
| Disable one tool, such as sending email | Technical owner or on-call |
| Roll back to the previous version | Technical owner or on-call |
| Switch the whole system off | On-call, business owner informed |
| Notify affected customers | Business owner, with legal and communications |

A disable switch that only the original developer knows about is not a control. Test it, as [Failover, Graceful Degradation, and Kill Switches](../T4.6_Scaling_and_Reliability/05_Failover_Graceful_Degradation_and_Kill_Switches.md) recommends for kill switches generally.

## Give People Transparency and Recourse

People affected by an AI system should know when they are dealing with one, and should have a way to challenge what it did.

- **Disclosure.** Tell users when content or a decision came from an AI system. Say what it can and cannot do.
- **Proposal or action.** Make it clear whether the system suggested something for a person to approve or did it directly.
- **Correction.** Give users a way to report a wrong answer or decision, and route it to a person who can fix it. In tier 4, any decision can be reviewed by a human on request.
- **Learning from it.** Corrections feed the evaluation set, so the same mistake becomes a regression test.

## Worked Example: Tiering Three Features

A retailer has three AI features.

- **Meeting-notes summariser** for staff. It advises, affects only staff convenience, and its errors are easy to spot. Tier 1: inventory entry and an owner, shipped in a week.
- **Product-question assistant** on the website. It advises, but customers rely on its answers about returns and safety. Tier 2: an evaluation set covering safety questions, a release gate, a clear "AI assistant" label and a "this answer was wrong" button.
- **Refund assistant** that issues refunds up to £200. It acts, affects customers' money, and payments are hard to reverse. Tier 3: scoped authority per customer, approval above the limit, an audit log, a tested disable flag owned by Payments on-call, and a red-team exercise before launch.

When a new consumer-protection rule arrives about automated refunds, the inventory shows in one query that only the refund assistant is affected.

---

## Key Takeaways

- Keep one inventory of every production AI system, with owners, data, models, actions, tier and the disable path.
- Tier by what happens when the system is wrong: whether it acts, who is affected and whether harm can be undone.
- Map each tier to required controls, so low-risk systems ship fast and high-risk ones carry full controls.
- Name a business owner, a technical owner and an on-call path, and write down who may disable, roll back or notify.
- Disclose AI use, show whether the system proposed or acted, and give people a route to correction.

## Check Yourself

1. **What three questions place a system in a risk tier?**
   Does it act or only advise, who is affected and how seriously, and can the harm be undone.

2. **Why record owners by role rather than by name?**
   People move on. A role keeps the entry valid, and the inventory still says who answers for the system after a reorganisation.

3. **An incident needs one tool disabled at 3 a.m. What must already be true?**
   The tool has its own tested disable switch, the on-call path is allowed to use it, and that permission is written down in the inventory.

## References

**Sources:** written for this site. Related lessons: [Failover, Graceful Degradation, and Kill Switches](../T4.6_Scaling_and_Reliability/05_Failover_Graceful_Degradation_and_Kill_Switches.md) and [Red Teaming and Layered Guardrails](06_Red_Teaming_and_Layered_Guardrails.md). Public references: the EU AI Act (Regulation (EU) 2024/1689) for risk-based obligations, and the NIST AI Risk Management Framework (AI RMF 1.0) for the govern, map, measure and manage functions.
