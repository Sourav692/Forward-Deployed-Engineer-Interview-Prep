# Scoping in Practice

*Each new request feels unique, but the same scoping steps repeat every time, and judgement grows from running them on many requests rather than memorising one design.*

Two worked cases and one timed exercise show the whole method from [Problem, Goal, and Definition of Done](/learn/forward-deployed/scoping-an-fde-project/problem-goal-and-definition-of-done) onwards in one pass. A checklist closes the module: run it before giving anyone a date.

**Objectives:**

- scope a consumer product request from business question to staged estimate;
- scope an AI support request by narrowing risk, separating data sources and earning autonomy;
- run the 30-minute practice exercise and the pre-estimate checklist.

---

## Scope a Product Request: Class Booking

The request: a class-booking product with web and mobile apps, payments, memberships, community features, movement feedback and automatic physical access. It sounds like a few screens and becomes scheduling, payments, operations and physical-world limits.

**Ask what the business really is.** Is the aim discovering classes, filling studios, selling subscriptions or AI instruction? One studio or many? Do instructors, schedules and payment rules already exist? Is AI coaching needed at launch?

**Map the system.** The customer side covers discovery, schedule, booking, payment, membership and profile. The operations side covers classes, capacity, refunds, instructors, locations and support. The platform side covers login, notifications, analytics, mobile release, security and monitoring.

**Find the assumptions that could double the work.** How complex are the membership, cancellation, refund and waitlist rules? Does "AI coaching" mean generic tips, pose detection or live computer vision? How does door access reach physical devices? Are fully native apps needed, or will one shared codebase do?

**Draw a hard line around version 1.** A responsive site, hosted login, schedule, booking, hosted checkout, simple memberships, email confirmation and an admin portal, for one location. Native apps, community, live coaching and door automation wait until one location can win customers, take payment, run classes and handle support reliably.

**Estimate by stage**, for one experienced full-stack engineer with modern tools:

| Stage | Rough size | Main assumption |
|---|---|---|
| Visual prototype | 1 to 2 weeks | Fake data, no real operations |
| Booking MVP | 6 to 10 weeks | One location, hosted services, simple rules |
| Production pilot | 3 to 6 months | Admin, support, monitoring, refunds, mobile, reliability |
| Full vision | 6 to 12+ months, with a team | Movement feedback, community, hardware, many locations |

Say it so the team can act: the website is not the main effort; booking, payment, membership, operations, mobile and physical access are. Aim for six to ten weeks for a single-location web MVP, then re-estimate mobile, coaching and access after short spikes. The lesson: estimate the system behind the product, and keep the MVP apart from the long-term vision.

## Scope an AI Request: A Support Copilot

The request: too many tickets, so build an agent that answers customers and completes common tasks. Several projects hide here, each with a different risk. Drafting a reply for an employee is lowest. Sending straight to a customer is higher. Changing an order or refunding money is higher still. Treat each as a separate scope decision.

**Sit with the current workflow.** Watch agents resolve real tickets; build against the real clicks, hand-offs, workarounds and exceptions, not the official diagram. Ask where tickets arrive, how they are sorted, which systems agents open, which steps need judgement, which are policy-driven, which categories are high-volume and low-risk, and which mistakes cause financial, legal or customer harm. Expect copy-pasting, missing data, hidden spreadsheets and manual approvals.

**Pick one low-risk, high-volume case.** If order-status questions are about 30 percent of volume, they are repetitive, measurable and read-only: a sensible pilot. Refunds and fraud are not. A target: draft a sourced reply for order-status tickets, cut handling time by 40 percent, and hold factual accuracy above 95 percent on an approved test set.

**Write the boundary.** In scope: order-status tickets, read-only order lookup, a draft reply with sources, human approval. Out of scope: refunds, address changes, cancellations, fraud, and sending directly to customers. Fallback: low-confidence or unsupported cases stay in the existing queue.

**Keep live data apart from reference knowledge.**

| Source | Purpose | How it is used | Main risk |
|---|---|---|---|
| Order system | Current order and shipping state | Live lookup | Wrong customer, or a stale answer |
| Support policy | Approved explanations and escalation rules | Document search | An outdated or irrelevant passage |
| Customer message | What the customer wants | Input to the AI | Unclear wording or embedded instructions |
| Ticket history | Earlier contacts and promises | Background context | Too much personal data exposed |

**Keep the escape hatch.** The flow runs: receive the ticket, find the intent, check eligibility, fetch order and policy, draft with sources, human review, send, log. Unsupported, low-confidence or rejected drafts return to the manual queue. A safe pilot keeps people involved and the old path alive.

**Build the test set before connecting anything.** Gather realistic tickets: routine ones, missing data, policy exceptions, angry wording, unsafe requests and must-escalate cases, with customer data protected. Judge six things: the right policy found, a factually correct draft, the right choice to answer, ask or escalate, rules followed, clarity and usefulness, and real time saved without extra review work.

**Estimate the pilot, not the dream.**

| Workstream | Rough effort | Key assumption |
|---|---|---|
| Workflow understanding and data access | 1 week | The customer supplies experts and test access quickly |
| Core agent and order lookup | 1 to 2 weeks | The order API is documented and stable |
| Policy document search | 1 week | Policies are current and in one place |
| Testing and improvement | 1 to 2 weeks | Past examples exist |
| Support-platform integration | 1 to 2 weeks | The platform supports draft workflows |
| Pilot rollout and monitoring | 1 week | A small group, with human review kept |

In total, about five to eight weeks for a small team. The biggest risks are customer data access, the support-platform integration and policy quality. Fully automatic actions are excluded and would need their own safety phase.

**Earn autonomy in stages:** offline on past tickets; shadow, drafting while agents work normally; assisted, with a small group reviewing drafts; expanded, as quality and operations hold; and autonomous only for narrow, reversible actions with strong controls. The lesson: make the workflow clear, measurable, narrow and safe before making the agent powerful.

> **Warning: "answer customers and complete tasks" is three projects with three risk levels.** Scoping it as one hides the jump from drafting for an employee to moving a customer's money.

## Practise: A Delivery Model in 30 Minutes

A property-management company wants an assistant that answers tenant questions, schedules maintenance and flags urgent requests. Work on paper in six timed parts.

1. **Clarify (5 minutes).** Users, the most painful workflow, the outcome that matters, which requests are high-volume and low-risk, which actions could harm.
2. **Draw the system (10 minutes).** Entities: tenant, property, unit, request, vendor, appointment, lease. States: new, triaged, scheduled, assigned, completed, escalated. Integrations: property system, calendar, text, email, vendor system. Roles: tenant, coordinator, technician, manager, admin.
3. **Find failure points (5 minutes).** At least one each for data (the wrong tenant), scheduling (a double-booked technician), safety (a gas leak treated as routine), communication (the wrong appointment time) and AI (an invented lease rule).
4. **Define the MVP (5 minutes).** Answer approved policy questions, sort maintenance requests, spot emergency keywords, and draft work orders for staff approval. Exclude auto-dispatching vendors, complex lease disputes, and closing emergencies without a person.
5. **Estimate (10 minutes).** A table of workstream, range, assumption and risk for discovery, the knowledge assistant, request sorting, the work-order integration and the pilot.
6. **Give the lead answer.** Restate the outcome, name the MVP, give the range, state assumptions, name the top risks, explain the first technical test, and describe rollout and the success measure.

A short model answer: a staff-assisted pilot at one property, not a fully automatic agent, for about six to nine weeks, assuming usable APIs and central policies. Week one tests the property API and builds an emergency test set. Success means routine handling time falls while emergency detection stays above the agreed level.

Keep practising by taking apart two products a week. Save the first scope and estimate, then revisit it after learning more.

## Check Before Giving Any Date

Run this list before a date reaches a team or a customer:

- [ ] **Problem** being solved, and the **users** who feel it
- [ ] **Success** as a measurable outcome, and the **definition of done**: prototype, MVP, pilot or production
- [ ] **Surfaces**, **entities**, **states** and end-to-end **workflows**
- [ ] **Integrations** with outside systems, and **failure modes**
- [ ] **AI uncertainty**: which behaviour is judgement-based
- [ ] **Production needs**: scale, speed, cost, security, reliability
- [ ] **Hidden work**: login, admin, migration, testing, monitoring, support
- [ ] **Unknowns** needing research or a spike
- [ ] **MVP**: the smallest useful and safe version
- [ ] **Estimate** range with its supporting assumptions
- [ ] **Plan**: milestones, dependencies, critical path, ownership
- [ ] **Rollout**: pilot, feature flag, alerts, rollback
- [ ] **Measure**: whether the original outcome improved

The customer usually knows the outcome they want. The FDE's job is to turn it into a route that can be built.

---

## Key Takeaways

- For a product request, find the real business, map the system, flag doubling assumptions, fence version 1, and estimate by stage.
- For an AI request, split it by risk level, pick a read-only high-volume pilot, separate live data from reference knowledge, test first and earn autonomy.
- Practise on a clock with six fixed parts, and revisit old estimates to build judgement.
- Run the pre-estimate checklist before any date leaves the team.

## Check Yourself

<details>
<summary>1. Why are order-status questions a good first pilot for a support copilot?</summary>

They are high-volume, repetitive, measurable and read-only. Refunds and fraud carry far more risk.

</details>

<details>
<summary>2. Why keep the order system and the support policy as separate sources?</summary>

One is live state needing exact lookup, the other is reference text needing search. They fail differently: a wrong or stale order versus an outdated passage.

</details>

<details>
<summary>3. In the class-booking case, what should be re-estimated after short spikes?</summary>

Mobile apps, AI coaching and automatic door access, once a single-location web MVP is scoped at six to ten weeks.

</details>

