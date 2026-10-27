# Design a Reliable Workflow Orchestration System

## Table of Contents

- [1. The Customer Problem and Discovery](#1-the-customer-problem-and-discovery)
  - [From Feature Request to Customer Outcome](#from-feature-request-to-customer-outcome)
  - [Stakeholder Map and Jobs-to-Be-Done](#stakeholder-map-and-jobs-to-be-done)
  - [The Two-Minute Opening Answer](#the-two-minute-opening-answer)
  - [Highest-Leverage Discovery Questions](#highest-leverage-discovery-questions)
  - [The Assumption Ledger](#the-assumption-ledger)
  - [Turning Discovery into Scope, Risks, and Success](#turning-discovery-into-scope-risks-and-success)
  - [Stakeholder Map in Practice](#stakeholder-map-in-practice)
  - [The Interview Signal Hiring Teams Listen For](#the-interview-signal-hiring-teams-listen-for)
- [2. Clarifying Questions, Requirements, and Constraints](#2-clarifying-questions-requirements-and-constraints)
  - [Choosing Which Unknowns to Pay For](#choosing-which-unknowns-to-pay-for)
  - [The Question Tree for Discovery](#the-question-tree-for-discovery)
  - [From Discovery to Requirements](#from-discovery-to-requirements)
  - [Functional vs Nonfunctional Requirements](#functional-vs-nonfunctional-requirements)
  - [Constraints vs Preferences](#constraints-vs-preferences)
  - [What the MVP Will Not Support](#what-the-mvp-will-not-support)
  - [Requirement-to-Component Traceability](#requirement-to-component-traceability)
  - [The Assumption Discipline an FDE Needs](#the-assumption-discipline-an-fde-needs)
- [3. Scale Estimates, SLOs, and Capacity](#3-scale-estimates-slos-and-capacity)
  - [Start with the Load That Breaks the First Draft](#start-with-the-load-that-breaks-the-first-draft)
  - [Working Assumptions and Activity Rate](#working-assumptions-and-activity-rate)
  - [Separate Workflow State from Payloads](#separate-workflow-state-from-payloads)
  - [Estimating Event-History Storage](#estimating-event-history-storage)
  - [Estimating Task-Queue Throughput](#estimating-task-queue-throughput)
  - [Sensitivity at 10x Growth](#sensitivity-at-10x-growth)
  - [Latency Budgets and Workflow SLOs](#latency-budgets-and-workflow-slos)
  - [Retry Math Is Not Compensation](#retry-math-is-not-compensation)
  - [Which Estimate Should Drive the Architecture](#which-estimate-should-drive-the-architecture)
  - [Communicating Uncertainty Like an Operator](#communicating-uncertainty-like-an-operator)
- [4. Architecture and End-to-End Flow](#4-architecture-and-end-to-end-flow)
  - [System Boundary and Customer Outcome](#system-boundary-and-customer-outcome)
  - [Component Map: Control Plane vs Data Plane](#component-map-control-plane-vs-data-plane)
  - [Top-Down Architecture and Trust Boundaries](#top-down-architecture-and-trust-boundaries)
  - [State Ownership and Consistency](#state-ownership-and-consistency)
  - [Sequence Diagram: Happy Path](#sequence-diagram-happy-path)
  - [Failure-Path Overlay: Worker Crash After Payment](#failure-path-overlay-worker-crash-after-payment)
  - [End-to-End Flow, Step by Step](#end-to-end-flow-step-by-step)
  - [Synchronous and Asynchronous Boundaries](#synchronous-and-asynchronous-boundaries)
  - [Queues, Backpressure, Caches, and Policy Placement](#queues-backpressure-caches-and-policy-placement)
  - [Why This Decomposition Matters](#why-this-decomposition-matters)
- [5. Data Model, APIs, and Working Code](#5-data-model-apis-and-working-code)
  - [The Smallest Safe Slice of the System](#the-smallest-safe-slice-of-the-system)
  - [Core Durable Records](#core-durable-records)
  - [API Contracts](#api-contracts)
  - [The Implementation Slice That Proves the Design](#the-implementation-slice-that-proves-the-design)
  - [What the Whiteboard Version Omits on Purpose](#what-the-whiteboard-version-omits-on-purpose)
  - [Tests That Make the Design Believable](#tests-that-make-the-design-believable)
  - [Why This Answer Sounds Credible in an Interview](#why-this-answer-sounds-credible-in-an-interview)
- [6. Security, Reliability, and Failure Handling](#6-security-reliability-and-failure-handling)
  - [The Uncomfortable Question That Anchors This Section](#the-uncomfortable-question-that-anchors-this-section)
  - [Threat Model Before Failure Policy](#threat-model-before-failure-policy)
  - [Failure Policies Are Design Decisions, Not Afterthoughts](#failure-policies-are-design-decisions-not-afterthoughts)
  - [Failure Drill: Worker Crashes After Payment Succeeds](#failure-drill-worker-crashes-after-payment-succeeds)
  - [Failure Drill: Email Succeeds but CRM Fails](#failure-drill-email-succeeds-but-crm-fails)
  - [Failure Drill: Approval Waits Seven Days](#failure-drill-approval-waits-seven-days)
  - [Failure Drill: Definition Changes While Instances Run](#failure-drill-definition-changes-while-instances-run)
  - [Failure Drill: External API Times Out Indefinitely](#failure-drill-external-api-times-out-indefinitely)
  - [Evidence the Interviewers Want to Hear](#evidence-the-interviewers-want-to-hear)
  - [Interview-Sized Code Sketch: No-Double-Charge Invariant](#interview-sized-code-sketch-no-double-charge-invariant)
  - [What to Say When the Interviewer Pushes on Trade-offs](#what-to-say-when-the-interviewer-pushes-on-trade-offs)
- [7. Delivery Plan, Observability, and Business Impact](#7-delivery-plan-observability-and-business-impact)
  - [Start with One Workflow, Not the Whole Platform](#start-with-one-workflow-not-the-whole-platform)
  - [Determinism and Crash Recovery as the First Gate](#determinism-and-crash-recovery-as-the-first-gate)
  - [Operator Visibility Before Broadening Scope](#operator-visibility-before-broadening-scope)
  - [Version Workflows Instead of Mutating Them](#version-workflows-instead-of-mutating-them)
  - [Rollout Scorecard: Six Metric Layers](#rollout-scorecard-six-metric-layers)
  - [Phased Rollout: Owners, Exit Criteria, Rollback Triggers](#phased-rollout-owners-exit-criteria-rollback-triggers)
  - [Connect the Dashboard to the User Journey](#connect-the-dashboard-to-the-user-journey)
  - [Core Product vs Adapter vs Configuration vs Shared Service](#core-product-vs-adapter-vs-configuration-vs-shared-service)
  - [Train Operators Before the First Wide Rollout](#train-operators-before-the-first-wide-rollout)
  - [The Risk Register Should Be Owned, Not Implied](#the-risk-register-should-be-owned-not-implied)
- [8. Interview Walkthrough, Trade-Offs, and Practice](#8-interview-walkthrough-trade-offs-and-practice)
  - [Minute-Zero Opening: Lead with the Business Effect](#minute-zero-opening-lead-with-the-business-effect)
  - [A Practical 50-Minute Answer Plan](#a-practical-50-minute-answer-plan)
  - [Keeping the Conversation at the Right Depth](#keeping-the-conversation-at-the-right-depth)
  - [Trade-off Framing to Defend](#trade-off-framing-to-defend)
  - [Follow-up Drills and Strong Answers](#follow-up-drills-and-strong-answers)
  - [Common Weak Answers and How to Repair Them](#common-weak-answers-and-how-to-repair-them)
  - [Scoring Rubric for Self-Evaluation](#scoring-rubric-for-self-evaluation)
  - [A 90-Second Architecture Summary](#a-90-second-architecture-summary)
  - [Practice Loop: Solo, Pair, Implementation](#practice-loop-solo-pair-implementation)
- [Coverage Notes](#coverage-notes)
  - [My Perspective on the Gaps](#my-perspective-on-the-gaps)

## 1. The Customer Problem and Discovery

### From Feature Request to Customer Outcome

- Here is the ask: a single process has to drive a document sign-off, a payment, an email and updates in three in-house systems. Any one of those steps may break, or may sit idle for days.
- The people around the table want different things from day one:
  - The business sponsor simply wants every case to reach the end.
  - The operations lead asks for retries, a clear view of each case and a way to roll back.
  - The application team does not want yet another fragile web of direct integrations.
  - The auditor needs proof of each approval: who gave it, at what time and under which control.
- Resist naming a tool first. Put the problem into a single sentence that does not yet pick a product.
- A weak, feature-led version: "Let's build an orchestrator that calls the payment, email and three internal APIs". It is accurate, yet it puts the wiring ahead of the result the customer actually wants.
- A strong, outcome-led version: "apply each business effect of a long-running process exactly once, keep its state visible, and compensate when a step fails."
  - That one line already demands idempotency, durable state, retries, pauses for human approval, auditability and compensating actions.
  - It also exposes what the job really is. We guard a business transaction spread over days, not a stream of messages.
- Framing it like this shows the habit panels hire FDEs for: you take vague customer words and turn them into a goal you can measure.

### Stakeholder Map and Jobs-to-Be-Done

- Group the four stakeholder sets by the job each needs done, not by title. Lump them together and you will optimise the wrong part of the system.
  - **Workflow participants** — they need to "look at a case and decide, with the full context in front of them."
  - **Operations teams** — they need to "spot stuck cases, learn the cause and bring each one back safely."
  - **Application developers** — they need to "connect a system once, without writing bespoke retry code for every corner case."
  - **Auditors** — they need to "rebuild the trail of decisions and check that each control held."
- Reliability means something different to each. Participants want clarity. Operators want to recover cases without crossing integration boundaries. Auditors want a trail they can follow.
- A strong answer meets every group's need, and no single group gets to steer the whole design.

### The Two-Minute Opening Answer

- An opening you could say out loud in the room:
  - "So we have a document sign-off, a payment, an email and three in-house systems to coordinate, and each step might fail or stall for days. First I'd pin down whose workflow this is, which business event counts as done, and which steps need a person to approve and which run on their own. My working goal: apply each business effect of a long-running process exactly once, keep its state visible, and compensate when a step fails. Unless you say otherwise, I'll take durable state, retries, an audit history and recovery from worker crashes as given. Next I'd size the volume, the latency and how much failure we can absorb. Then I'd build the orchestration, security and observability on top of those numbers."
- In under two minutes that opening repeats the ask, names who it serves, sets the goal and flags each assumption where facts are missing. Under time pressure this is how you compress: ask fewer questions, and make each one count.

### Highest-Leverage Discovery Questions

- You do not need equal depth on every subsystem. Pick the questions that remove the most doubt per minute.
- **Clarify the business finish line:**
  - Which event tells us the workflow is done?
  - Do we count success when every technical step finishes, or when the business effect lands exactly once?
  - For each kind of failure, do we roll back or compensate?
- **Identify the workflow shape:**
  - Does it run with no humans, with a person in the loop, or a blend?
  - Which steps may pause for minutes, which for hours and which for days?
  - Can a case fork, loop back to an earlier step or get cancelled halfway?
- **Determine blast radius and ownership:**
  - Which team owns each internal integration?
  - Whose pager goes off when a case stalls?
  - Who has the authority to resume, rerun or override a case?
- **Pin down trust and compliance requirements:**
  - Which evidence must we keep for audit?
  - Which actions need an approval log or a signature trail?
  - Do residency, retention or data-minimisation rules apply?
- When the interviewer holds facts back, say that openly and record the gap as an assumption. For example: "I can't tell yet if payment is the final business effect or only one link in a longer approval chain. So I'll treat a payment retry as safe only when the provider honours idempotency keys and a durable workflow record proves the effect landed once."

### The Assumption Ledger

- Think of the assumption ledger as a running list of things you treat as true until the customer says otherwise. It is a working tool, not paperwork.
- Every entry worth writing has four fields:
  - **Assumption**: the belief you are acting on for now
  - **Impact**: how the design changes if it holds or fails
  - **Verification**: the step that would confirm it
  - **Owner or follow-up**: the person who can answer, or the deadline for an answer
- First example:
  - Assumption: the payment provider accepts idempotency keys
  - Impact: decides if a retry can run without charging twice
  - Verification: check the provider docs or ask whoever owns payments
  - Owner or follow-up: the payment integration team, before the design is final
- Second example:
  - Assumption: participants can live with a pause of several days
  - Impact: shapes how long state is kept, when cases expire and how people get notified
  - Verification: check with the business sponsor and the support team
  - Owner or follow-up: the product owner, ahead of any sizing work
- Every discovery blends confirmed facts with provisional guesses. A guess nobody writes down quietly turns into a design decision. In an interview, splitting checked requirements from assumptions often earns more credit than naming a particular product.

> **Interview pointer:** Panels like to test whether your discovery stays honest when the clock is running. Keep the four-field ledger (assumption, impact, verification, owner) ready to use. It shows rigour and costs you almost no time.

### Turning Discovery into Scope, Risks, and Success

- Discovery is where the system gets its shape, so treat it as real design work. When it ends, you should hold four outputs, in your head or on the whiteboard:
  - **Scope**: the workflows we will handle and the ones we will not
  - **Assumptions**: the beliefs we act on until someone confirms them
  - **Risks**: the places where duplicates, lost data or unauthorised actions could creep in
  - **Owners**: the named owner of every integration, approval, escalation and support route
- Describe success the way the business would, not the way infrastructure would. Skip "messages processed" and "tasks retried". Measure the count of completed workflows. Add the duplicate-prevention rate, the compensation success rate and the mean time to detect stuck cases. Also check that an operator can walk through any case from its first step to its last.
- A success test small enough for an interview: the business effect landed once, the user sees where the case stands, and each exception leads to a known compensation or escalation.

### Stakeholder Map in Practice

- Take a concrete case. A contract gets approved, a payment fires, an email goes out and three internal systems get updated.
  - The end user is a real person waiting for an approval or a payout. It is not "the API".
  - The operator is whoever is on call when a worker dies just after the payment went through.
  - The security owner rules on who may resume or override a stuck case.
  - The executive sponsor wants a process that behaves predictably, passes compliance and never has to be pieced back together from spreadsheets.
- Again, the aim is to serve all four groups while none of them takes over the design.

### The Interview Signal Hiring Teams Listen For

- Panels check more than your diagrams. They watch whether you can go from a customer's pain to real technical leverage without sliding into vague platform talk.
- The best candidates make the problem specific. They name the people, state their assumptions out loud and describe success in words the customer would use.
- Draw the architecture only once you can say whose workflow is changing and how success gets measured. Before that point, you are listing software features, not designing a system the business can rely on.
