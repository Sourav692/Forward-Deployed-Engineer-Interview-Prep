# Enterprise SDLC, Agile/Scrum & Cross-Functional Delivery (Round 2, P2)

Covers: *"Understanding the SDLC in large enterprises from requirements gathering through deployment and ongoing support: cross-functional teams (Product, Eng, QA, DevOps, Security), managing releases and production issues, Agile/Scrum."*

Built from: `01_Concept_Tutorials/FDE_Handbook/10/02` (six delivery stages), `01_Concept_Tutorials/FDE_Handbook/10/03` (14-day plan), `01_Concept_Tutorials/FDE_Handbook/10/04` (gates, deny rules, metrics), `01_Concept_Tutorials/FDE_Handbook/10/05` (RACI, structured comms, conflict resolved through an interface), `07_Last_Day_Revision/module-14` (release mechanics). What's new here is **classic enterprise SDLC vocabulary, Scrum mechanics, per-function friction points, and the "agentic SDLC" angle Blitzy sells.**

## 1. The 30-second opening

> "In an enterprise, the SDLC is less about writing code and more about passing gates owned by other people: product sign-off on requirements, security review, QA and UAT sign-off, a change-advisory slot, and a handover to support. My job as an FDE is to know those gates on day one, start the slow ones early (security and access especially), and make each sign-off cheap by bringing evidence instead of asking for trust."

## 2. Enterprise SDLC: stages, owners, gates

An enterprise SDLC (software development life cycle) is the sequence of steps a change goes through from "someone asked for it" to "it's live and supported." In big companies each step has an **owner** and a **gate**: an approval that must be signed before the work moves on. Your job as FDE is to know these gates early and make each one easy to pass.

### Quick glossary (terms used in this section)

- **BA (Business Analyst):** turns business needs into written requirements.
- **User story:** a requirement written from the user's view: "As a loan officer, I want X so that Y."
- **Acceptance criteria:** the conditions that must be true for a story to count as done.
- **NFRs (non-functional requirements):** how well the system must work, as opposed to what it does: speed, uptime, security, scale.
- **HLD / LLD:** high-level design (the big boxes and arrows) and low-level design (detailed classes, APIs, tables).
- **ARB (Architecture Review Board):** senior architects who approve designs before build.
- **Threat model:** a structured list of how the system could be attacked and how each risk is mitigated.
- **DPIA (Data Protection Impact Assessment):** a privacy review required when personal data is processed (GDPR and similar laws).
- **CI (continuous integration):** every code change is automatically built and tested.
- **Regression testing:** re-testing existing features to make sure the new change didn't break them.
- **UAT (User Acceptance Testing):** real business users try the system and confirm it meets their needs.
- **CAB (Change Advisory Board):** a group that approves production changes and schedules release windows.
- **Freeze window:** a period, such as month-end or holidays, when no production changes are allowed.
- **Runbook:** step-by-step instructions for operating the system and fixing known problems.
- **Hypercare:** a period of extra-close monitoring and fast support right after go-live.
- **L1 / L2 / L3 support:** support tiers. L1 is the service desk (first contact, known fixes), L2 is application support (deeper troubleshooting), L3 is the engineers or vendor who can change the code.
- **SLA (Service Level Agreement):** a committed response or resolution time.
- **KB article:** a knowledge-base entry so support can solve repeat issues themselves.

---

### Stage 1: Intake & requirements
- **What happens:** the business case is written; user stories, acceptance criteria and NFRs are defined.
- **Owner:** Product owner / BA.
- **Gate:** signed scope plus a **measurable success metric**. Per `01_Concept_Tutorials/FDE_Handbook/10/04`, refuse to start without one.
- **Your role as FDE:** run discovery and turn the executive's vision into concrete requirements.
- **Where it gets stuck:** vague outcomes like "make it better with AI."

### Stage 2: Architecture & design
- **What happens:** HLD and LLD are drawn up, reviewed by the ARB, and a threat model is written.
- **Owner:** Architect / ARB.
- **Gate:** ARB approval and a completed threat model.
- **Your role:** write the design proposal and a trade-off document explaining the choices.
- **Where it gets stuck:** the ARB often meets only monthly, so book the slot early.

### Stage 3: Security & compliance
- **What happens:** data is classified (public, internal, confidential, PII); vendor risk is assessed; a penetration-test plan and a DPIA are prepared.
- **Owner:** InfoSec / Risk team.
- **Gate:** security sign-off.
- **Your role:** **start this on day 1**, and answer security questionnaires quickly with evidence (certifications, architecture diagrams, data-flow docs).
- **Where it gets stuck:** this is usually the **longest** step in the whole SDLC.

### Stage 4: Build
- **What happens:** engineers work in sprints, review each other's code, and CI runs on every change.
- **Owner:** engineering teams.
- **Gate:** PR approvals, CI passing ("green"), test coverage at the required level.
- **Your role:** build, remove blockers, and pair with their engineers so they own the code afterwards.
- **Where it gets stuck:** missing environments or access permissions.

### Stage 5: Test
- **What happens:** QA runs system and integration testing, regression testing and performance testing.
- **Owner:** QA team.
- **Gate:** QA sign-off, with defects triaged by severity.
- **Your role:** provide realistic test data and fix defects quickly.
- **Where it gets stuck:** unstable test environments that fail for reasons unrelated to the code.

### Stage 6: UAT
- **What happens:** real business users try the system on realistic scenarios.
- **Owner:** business SME (subject-matter expert).
- **Gate:** UAT sign-off.
- **Your role:** train the users and collect and act on their feedback.
- **Where it gets stuck:** business users are busy with their day jobs, so book their time early.

### Stage 7: Release
- **What happens:** a change request is raised, the CAB approves it, a release window is booked, and a go/no-go meeting decides.
- **Owner:** release manager / DevOps.
- **Gate:** CAB approval, a rollback plan, and a runbook.
- **Your role:** bring release-readiness evidence (tests passed, rollback tested, monitoring ready).
- **Where it gets stuck:** freeze windows can delay a release by weeks.

### Stage 8: Hypercare
- **What happens:** 2–4 weeks of extra-close monitoring after go-live.
- **Owner:** FDE plus the support team.
- **Gate:** exit criteria are met (e.g. incident rate below a threshold, adoption above a target).
- **Your role:** stay on call and fix issues fast.

### Stage 9: Operate & support
- **What happens:** the system moves to business-as-usual support: L1 → L2 → L3.
- **Owner:** support team / SRE (site reliability engineering).
- **Gate:** runbook, SLAs and KB articles handed over.
- **Your role:** hand over cleanly, train L1/L2, then step back so the customer owns it.
- **Where it gets stuck:** knowledge that only exists in someone's head. Write it down.

---

### Extra steps in regulated industries (banks, insurers, healthcare)
- **SOX change segregation:** whoever writes the code must not be the person who deploys it (US Sarbanes-Oxley rules for financial reporting systems).
- **Model risk management:** banks must validate and document models before use (in the US this is SR 11-7 guidance).
- **Audit trails:** every change and decision must be traceable to who did it and why.
- **Data residency:** data must stay in specific countries or regions.

## 3. Agile/Scrum in an enterprise

| Ceremony | Purpose | FDE angle |
|---|---|---|
| Backlog refinement | Clarify and size stories | Bring the customer's PO; split stories by risk and value, not by layer |
| Sprint planning | Commit to a sprint goal | Commit against *their* team's capacity, including review capacity |
| Daily stand-up | Blockers | Raise external blockers (access, security) early. They don't fix themselves |
| Sprint review / demo | Show working software | Demo to the business against the agreed metric, not a feature list |
| Retrospective | Improve the process | Bring the customer in; fix the pain points in the collaboration |

| Concept | Know it |
|---|---|
| Definition of Ready / Done | DoD includes tests, security scan, docs, *deployed to QA*, not just "code merged" |
| Velocity / story points | Planning tool, not a performance metric |
| Scaled frameworks | SAFe (PI planning, release trains), common in banks and insurers |
| Kanban | Better suited to support, ops and FDE-style interrupt work: WIP limits, flow metrics |
| DORA metrics | Deploy frequency, lead time, change-failure rate, MTTR: the language a CTO uses for velocity |

**Handling mid-sprint escalations (a common question):**

| Escalation | Response |
|---|---|
| Production incident | Interrupt the sprint; incident process (`04_`) |
| Exec "urgent" feature | Swap scope, don't add it: "We can take this if X moves to the next sprint. Your call." The PO decides |
| Scope creep from a stakeholder | Back to the backlog and prioritised by the PO; change control on the signed scope (`01_Concept_Tutorials/FDE_Handbook/10/04`) |
| Recurring interrupts | Reserve 15–20% capacity as an interrupt buffer, or run a Kanban lane |

## 4. Cross-functional RACI (FDE engagement)

| Workstream | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| Requirements & success metrics | FDE + customer PO | Exec sponsor | Business SMEs | Eng teams |
| Architecture | FDE / architect | Customer chief architect | Security, DevOps | PO |
| Security & compliance review | Customer InfoSec | CISO | FDE (evidence) | Sponsor |
| Build / generation | Eng team + FDE | Eng manager | Architect | PO |
| Testing & QA | QA team | QA lead | FDE, Eng | PO |
| Release & deployment | DevOps / release mgr | Change manager (CAB) | FDE, Eng, Security | Business, support |
| Support after go-live | L1/L2 support | Support manager | FDE (L3 during hypercare) | Sponsor |
| Product feedback to vendor | FDE | FDE's own leadership | Customer users | Vendor product team |

## 5. Friction points by function (and how to defuse them)

| Function | What they fear | What they need from you | Move that works |
|---|---|---|---|
| **Product** | Building the wrong thing; scope creep | Clear trade-offs, the PO decides | Present options with costs; never decide priority for them |
| **Engineering** | "AI will replace us" / being saddled with code they don't understand | Ownership, readable PRs | Position them as reviewers and owners; small stacked PRs; pairing |
| **QA** | Untestable output, last-minute drops | Testable increments, test data, time | Involve QA in acceptance criteria during refinement; ship tests with the code |
| **DevOps / SRE** | Getting paged for something they don't understand | Runbooks, observability, rollback | Join their pipeline, use their alerts, hand over a tested rollback |
| **Security** | Data leakage, an unknown vendor, a supply chain risk | Evidence, early engagement | Day-1 kickoff; SOC 2 / ISO docs; threat model; least-privilege design; answer questionnaires fast |
| **Business / exec** | No ROI, disruption | Measured outcomes | Baseline on day 1; demo against the metric |

**Conflict pattern (from `01_Concept_Tutorials/FDE_Handbook/10/05`):** resolve conflicts between teams with an **interface** (an API contract, a schema, a SLA), not a meeting. Two teams arguing about a data format → agree a versioned contract and contract tests.

## 6. Managing releases & production issues: what to say

| Topic | Points | Repo pointer |
|---|---|---|
| Release strategy | Flags → shadow → canary → ramp; version prompts, configs and schemas; tested rollback; kill switch | `module-14` |
| Release readiness | Go/no-go checklist: tests, security, rollback tested, runbook, on-call, comms plan | `01_Concept_Tutorials/FDE_Handbook/10/04` |
| Production issues | Severity, IC, comms cadence, blameless RCA, regression test | `04_Incident_Triage...` |
| After the issue | Every incident becomes a test, an alert or a gate | `module-15` §8 |

**Prepare your own STAR story:** *"A release that went wrong."* Fill this in:

| S | T | A | R |
|---|---|---|---|
| <system, release, what broke> | <your responsibility> | <detect → mitigate (rollback?) → comms → RCA> | <impact contained to ___; the gate added so it won't recur> |

## 7. The Blitzy angle: the "agentic SDLC"

Blitzy describes its model as an **agentic SDLC**: *"Team lead does prompts, and teams start with code."* Know how it maps onto the traditional SDLC:

| Traditional SDLC stage | Where Blitzy fits | What changes for the enterprise |
|---|---|---|
| Requirements | WHY/WHAT/HOW prompt; Tech Spec | Requirements need to be **more precise, earlier**: vague prompts lead to wrong scope |
| Design | Agent Action Plan (AAP) review | Architecture review moves to *before* code exists. Effectively an ARB on the plan |
| Build | Asynchronous generation (days) | Sprint capacity shifts from writing code to **reviewing** it |
| Test | Compile + runtime validation in an isolated env; QA agents | The customer's QA still owns acceptance; test-suite quality becomes critical |
| Release | PR into the customer's pipeline | Unchanged: CAB, flags and canary still apply |
| Support | Project guide for the remaining 20%; knowledge graph updates on merge | Docs stay current, which helps L2/L3 |

**Trade-off to name:** *"Agentic SDLC moves the bottleneck from writing code to specifying and reviewing it. So Scrum adapts: refinement gets heavier because prompts and specs are the new stories, sprint planning has to budget reviewer hours, and DoD includes 'AAP approved' and 'project-guide items ticketed'. If the enterprise doesn't add review capacity, velocity just piles up as unmerged PRs."*

## 8. Ninety-second model answer

> "In large enterprises I think of the SDLC as a set of gates owned by different people: requirements signed by product with a measurable metric, architecture through the review board, security and compliance, QA and UAT sign-off, a CAB-approved release with a tested rollback, then hypercare and a clean handover to L1/L2/L3 support. As an FDE, I start the slow gates on day one (security and access especially) and make each sign-off cheap by bringing evidence.
>
> Inside that, teams usually run Scrum or SAFe. I adapt to their cadence: I bring their PO into refinement, plan against their review capacity, and handle mid-sprint escalations by swapping scope rather than adding it. For cross-functional work I use a RACI so each team knows who decides, and I resolve conflicts between teams with interfaces (contracts and SLAs) rather than meetings.
>
> With a platform like Blitzy, the bottleneck moves from writing code to specifying and reviewing it, so I'd adapt the process: heavier refinement, reviewer hours in sprint planning, and an AAP review as a gate in the Definition of Done."
