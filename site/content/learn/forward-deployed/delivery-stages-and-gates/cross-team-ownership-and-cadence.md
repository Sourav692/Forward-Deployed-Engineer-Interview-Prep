# Cross-Team Ownership and Cadence

*More meetings feel like more alignment, but coupled teams stay aligned through clear ownership, a tiered cadence and interfaces, not through volume of contact.*

The hard part of a cross-team AI platform is rarely the technology; it is aligning teams with different priorities and tightly coupled dependencies. Naming that first, then showing three mechanisms that address it, is what separates a senior answer from "we had a lot of syncs".

**Objectives:**

- assign ownership across workstreams with a RACI and exactly one accountable owner each;
- match communication frequency to altitude with a three-tier cadence;
- resolve a priority conflict with an interface rather than a loser.

---

## Map the Stakeholders and Their Definitions of Done

The source's example is a global data and AI platform producing seller and executive insights. Five groups were tightly coupled. Software teams owned upstream applications and APIs. Data engineering built ingestion and the lake. AI and ML engineers built forecasting and insight models. A project manager handled timelines and coordination. Business stakeholders defined success metrics and consumed the outputs.

Each group had a different stake and a different meaning of "done". Their dependencies were tight enough that one team's delay cascaded into the others. That coupling, not any single technical problem, was the main challenge.

## Give Every Workstream One Accountable Owner

A RACI removes ownership ambiguity. For each workstream it names who is Responsible for doing the work, who is Accountable for the outcome, who is Consulted before decisions and who is Informed after them.

| Workstream | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| Data ingestion | DE team | Data platform lead | Software teams | PM, business |
| Data modelling in the lake | DE team | Data platform lead | AI engineers | PM |
| ML forecasting models | AI engineers | ML lead | DE team, business | PM |
| API and data access | Software teams | Engineering manager | DE team | PM, business |
| Dashboards and insights | BI and AI team | Product owner | Business stakeholders | PM |
| Programme delivery | Project manager | Programme sponsor | All teams | Leadership |

A workstream with an unclear owner is where cross-team projects quietly stall. Exactly one accountable owner per deliverable sped up decisions and put accountability at every stage. The delivery gates in [Role-Gated Stage Gates](/learn/forward-deployed/delivery-stages-and-gates/role-gated-stage-gates) are the same idea with harder edges: a named role may sign, and no one else.

## Match Meeting Frequency to Altitude

The cadence had three tiers, each answering a different question. Daily asynchronous updates in a shared tracker covered progress, risks and blockers, keeping peers unblocked. A weekly cross-team sync dealt only with dependencies and decisions. A bi-weekly executive update covered impact, risks and progress, keeping leadership informed without pulling them into detail. Higher frequency carried more detail; lower frequency carried more altitude.

Four rules made it work. No status-only meetings: every interaction had to unblock or decide something. One source of truth: a single tracker, not five spreadsheets and a chat thread each claiming to be current. Write first: decisions were documented before discussion, so meetings resolved disagreements rather than drafting them. Fast escalation: blockers raised within 24 hours, because a dependency left for a week is how coupled work cascades into delay. That is the human version of the automatic day-3 escalation.

Bridging technical and business language mattered too. "Data delay affects forecast accuracy and seller decisions" lands with a business stakeholder; "the ingestion job failed" does not. The customer stayed engaged throughout instead of being briefed at delivery.

> **Warning: a meeting that only reports status is a written update with a calendar invite.** It costs everyone's time and decides nothing. Send the update; meet only to unblock or decide.

## Resolve Conflict With an Interface

The conflict was real. Software teams prioritised fast feature delivery. Data engineering and AI teams needed stable, high-quality data. Neither was wrong; they were optimising for different stages of the same pipeline.

Two mechanisms resolved it without a loser. Data contracts turned an ownership argument into an interface agreement. Two-phase delivery balanced speed and reliability: phase one shipped a reliable core dataset, and phase two layered advanced features once the base was stable. The shape matches narrowing a first build to prove a model before expanding, and a staged rollout: earn trust on a stable core, then extend.

## Worked Example: Answering the Cross-Team Question

The prompt: "Tell me about a time you led a cross-team data or AI project with multiple stakeholders. How did you ensure alignment, ownership and communication?"

Open by naming the real difficulty: five groups with conflicting priorities and coupled dependencies. Show the RACI and the rule of one accountable owner. Describe the three-tier cadence and the four rules. Then tell the conflict, speed against data stability, and how data contracts and two phases resolved it. Execution followed RACI ownership, with dependency tracking visible to everyone and integration checkpoints before divergence got expensive.

Close on outcomes. The platform improved demand forecasting and reduced stockouts and wastage. More valuable still, it left a repeatable collaboration model that other programmes reused without rebuilding the RACI and cadence. "I built a way of working other teams now reuse" meets the senior bar in a way "I built a platform" does not.

---

## Key Takeaways

- Name the coupling between stakeholder groups before any technical detail.
- A RACI with exactly one accountable owner per workstream removes the ambiguity where projects stall.
- A three-tier cadence matches frequency to altitude; no status-only meetings, one source of truth, write first, escalate within 24 hours.
- Resolve priority conflicts with interfaces such as data contracts and phased delivery, so nobody has to lose.
- The most senior outcome is a collaboration model others reuse.

## Check Yourself

1. **What does each letter of RACI mean, and why does "exactly one A" matter?**
   Responsible, Accountable, Consulted, Informed. One accountable owner per workstream means decisions have a clear owner and nothing stalls in ambiguity.

2. **What question does each tier of the cadence answer?**
   Daily async keeps peers unblocked; the weekly sync resolves cross-team dependencies; the bi-weekly executive update keeps leadership informed without detail.

3. **How was the speed-versus-stability conflict resolved without a loser?**
   Data contracts turned it into an interface agreement, and two-phase delivery shipped a reliable core first, then advanced features.

