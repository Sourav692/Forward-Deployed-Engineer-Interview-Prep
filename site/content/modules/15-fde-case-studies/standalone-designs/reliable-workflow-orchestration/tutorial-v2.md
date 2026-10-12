# Chapter 13: Design a Reliable Workflow Orchestration System

*Source: THE FORWARD DEPLOYED ENGINEER SYSTEM DESIGN INTERVIEW: 20 REAL-WORLD AI SYSTEM DESIGN INTERVIEWS — Chapter 13*

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

- The customer prompt: coordinate document approval, payment, email, and three internal systems when any step may fail or wait for days.
- Stakeholders immediately disagree on what matters:
  - Business sponsor wants the process to "just finish."
  - Operations lead wants retries, visibility, and rollback hooks.
  - Application team wants to avoid a brittle chain of point-to-point integrations.
  - Auditor wants evidence of who approved what, when, and under which controls.
- First move is not technology — restate the problem in one sentence without committing to a product shape.
- Feature-first restatement (weak): "We need an orchestrator that can call email, payment, and three APIs" — true but centres plumbing, not the customer's result.
- Outcome-first restatement (strong): "Execute long-running business processes exactly once at the business-effect level, with visible state and compensation when a step fails."
  - Immediately implies: idempotency, durable state, retries, human approval pauses, auditability, compensating actions.
  - Reveals the hidden problem: the system protects a business transaction stretched across time, not just messages in motion.
- Speaking this way demonstrates the core FDE habit hiring teams look for: translating ambiguous customer language into a measurable technical objective.

### Stakeholder Map and Jobs-to-Be-Done

- Four stakeholder groups, mapped by job-to-be-done rather than role (treating them as the same optimises the wrong part of the system):
  - **Workflow participants** — job: "review and decide without losing context."
  - **Operations teams** — job: "see what is stuck, why it is stuck, and how to safely recover it."
  - **Application developers** — job: "integrate a system once without inventing custom retry logic for every edge case."
  - **Auditors** — job: "reconstruct the decision trail and verify the controls."
- Each group values a different form of reliability: users want clarity, operators want recoverability without breaking integration boundaries, auditors want traceability.
- A good FDE answer serves all four without letting any one of them dominate the design.

### The Two-Minute Opening Answer

- Model opening answer for a live interview:
  - "The customer wants a workflow orchestration system for document approval, payment, email, and three internal systems where any step may fail or pause for days. I would first clarify whose workflow matters, what business event counts as success, and which steps need human approval versus automatic execution. My working outcome is to complete each business process exactly once at the business-effect level, keep the current state visible to users and operators, and define compensating actions for partial failure. I'll assume we need durable state, retries, audit history, and the ability to resume after worker crashes unless you tell me otherwise. From there I'd estimate volume, latency, and failure tolerance, then design the orchestration, security, and observability around that."
- This answer restates the prompt, names the users, identifies the outcome, and states assumptions when information is missing — the right compression strategy under interview time pressure: fewer questions, higher leverage.

### Highest-Leverage Discovery Questions

- Do not interrogate every subsystem equally — ask the questions that collapse uncertainty fastest.
- **Clarify the business finish line:**
  - What event means the workflow succeeded?
  - Is success defined by all technical steps completing, or by the business effect being applied once?
  - Which failures require rollback, and which require compensation?
- **Identify the workflow shape:**
  - Is the process fully automatic, human-in-the-loop, or mixed?
  - Which steps can wait minutes, hours, or days?
  - Can a workflow branch, re-enter, or be cancelled midstream?
- **Determine blast radius and ownership:**
  - Who owns each internal system integration?
  - Which team receives alerts when the workflow stalls?
  - Who is authorised to resume, re-run, or override a case?
- **Pin down trust and compliance requirements:**
  - What evidence must be retained for audits?
  - Which actions require approval logs or signature trails?
  - Are there residency, retention, or data-minimisation constraints?
- If the interviewer withholds information, say so explicitly and convert ambiguity into a documented assumption — e.g., "I don't know yet whether payment is the final business effect or just one step in a larger approval chain, so I'm going to assume payment can be retried safely only if the provider supports idempotency keys and we can prove a single business effect with a durable workflow record."

### The Assumption Ledger

- An assumption ledger is a working list of what you treat as true until the customer confirms otherwise — not a formal artifact for its own sake.
- A useful ledger entry has four parts:
  - **Assumption**: what you believe is true for now
  - **Impact**: why the assumption matters to the design
  - **Verification**: how you would confirm it
  - **Owner or follow-up**: who can answer it or when it must be resolved
- Example entry 1:
  - Assumption: payment provider supports idempotency keys
  - Impact: determines whether retries can be safe without duplicate charges
  - Verification: ask the payment owner or inspect provider docs
  - Owner or follow-up: payment integration team before final design
- Example entry 2:
  - Assumption: workflow participants can tolerate a multi-day pause
  - Impact: influences state retention, expiration, and notification strategy
  - Verification: confirm with the business sponsor and support team
  - Owner or follow-up: product owner before capacity planning
- Discovery is always a mix of facts and temporary guesses — unrecorded guesses silently become design decisions. Showing you can separate verified requirements from assumptions is often more valuable in interview than naming a specific product.

> 🎯 **Interview Pointer:** Interviewers often probe whether you can keep discovery honest under time pressure — having a crisp four-part ledger format ready (assumption / impact / verification / owner) is a fast way to show discipline without slowing the conversation down.

### Turning Discovery into Scope, Risks, and Success

- Discovery is not a warm-up — it defines the system. By the end you should have four artifacts in your head or on the board:
  - **Scope**: which workflows are in and which are out
  - **Assumptions**: what you are temporarily treating as true
  - **Risks**: where duplicates, data loss, or unauthorised actions can happen
  - **Owners**: who owns each integration, approval, escalation, and support path
- Success must be measurable in business language, not infrastructure language — not "messages processed" or "tasks retried," but completed workflows, duplicate-prevention rate, compensation success rate, mean time to detect stuck cases, and operator ability to explain any case start to finish.
- Simple interview-sized success metric: the business effect happened once, the user can see the current state, and every exception has a defined compensation or escalation path.

### Stakeholder Map in Practice

- Worked example: the workflow approves a contract, triggers payment, sends a notification email, and updates three internal systems.
  - The end user is the participant waiting on approval or payout, not "the API."
  - The operator is the person on call when a worker crashes after payment succeeds.
  - The security owner decides who can resume or override a stalled case.
  - The executive sponsor cares that the process is predictable, compliant, and not manually reconstructed from spreadsheets.
- A good FDE answer shows you can serve all four without letting any one dominate.

### The Interview Signal Hiring Teams Listen For

- The panel is not only testing whether you can sketch architecture — they test whether you can move from customer pain to technical leverage without getting trapped in generic platform talk.
- Strongest candidates make the problem concrete, name the people involved, state the assumptions, and define success in terms the customer would recognise.
- Architecture should start only after you can say whose workflow changes and how success will be measured — otherwise you are still describing software, not designing a system that supports the business.
