# Chapter 13: Design a Reliable Workflow Orchestration System, part 2

## 2. Clarifying Questions, Requirements, and Constraints

### Choosing Which Unknowns to Pay For

- The first design move is not architecture — it's choosing which unknowns are worth paying for in the interview.
- The interviewer may answer only half your questions; the best candidate does not try to eliminate all ambiguity. Instead:
  - Identify the few decisions that would materially change the design.
  - Protect the highest-risk constraint: preventing duplicate business effects when steps fail, wait, or resume out of order.

### The Question Tree for Discovery

- A compact question tree keeps the conversation sharp, and each question maps to a concrete design consequence:
  - What is the exact step order, and which steps can branch or be skipped? → determines whether you're building a straight-line job runner or a true state machine.
  - Which actions are reversible, and which are irreversible once they succeed? → tells you where compensation is safe vs. where retries need care.
  - How long can a workflow remain active before it must time out, archive, or be cancelled? → shapes storage and timer design (in-memory state or a short-lived queue can't support week-long waits).
  - Where does human approval enter, and how long can that approval reasonably wait? → affects how suspended states, reminders, escalations, and abandoned cases are modelled.
  - Do the external systems support idempotency keys, replay protection, or a unique business reference? → decides whether retries are safe or the orchestration layer must build its own deduplication envelope.
  - Can workflow definitions change while older instances are still running, and if so, how do we keep those instances compatible? → becomes critical the moment a new approval step is requested while 10,000 old workflows are in flight.
- When the interviewer answers only half the questions, do not freeze — make explicit assumptions and attach them to risk.
  - Safest anchor assumption for this prompt: payment is the highest-risk irreversible action, so the design must defend against duplicate payment even if everything else degrades.

### From Discovery to Requirements

- Convert the conversation into a prioritised set of requirements, not a shopping list — must/should/could framing:
  - **Must**: durable state machine, persisted transition history, idempotent activity execution, retry and timeout policies, human signals and timers, saga compensation, operator recovery.
  - **Should**: workflow-definition versioning that allows compatible evolution of running instances.
  - **Could**: richer analytics, custom dashboards, or user-configurable branching rules if they do not threaten correctness.
- Why each must-have exists:
  - Durable state machine — survives process death and pauses across long gaps.
  - Persisted transition history — lets an operator inspect what happened, and a restarted worker reconstruct intent without guessing.
  - Idempotent activity execution — retries are inevitable, and retries without deduplication are duplicate side effects with better branding.
  - Retry and timeout policies — external systems fail, slow down, and sometimes never answer.
  - Human signals and timers — approval is often a business event, not an API callback.
  - Saga compensation and operator recovery — some steps can be undone and some must make that difference explicit.

### Functional vs Nonfunctional Requirements

- Functional: the system moves through approval, payment, notification, and internal updates.
- Nonfunctional: it must keep running through process crashes and even region failures, preserve inspectable history, avoid duplicate payment, and evolve without breaking workflows already in progress.
- Mixing the two categories blurs trade-offs; separating them clarifies what the system does vs. how safely it must do it.
- Nonfunctional requirements stated as measurable outcomes:
  - "Survive process and region failures" = workflow resumes after worker loss and site-level outage without losing committed state.
  - "No duplicate payment" = the payment effect is protected by a business key, durable deduplication, or a provider-side idempotency mechanism used consistently.
  - "Inspectable history" = every transition, retry, approval signal, timeout, and compensation event is persisted in queryable form.
  - "Compatible evolution of running instances" = a workflow definition change must not strand older executions or reinterpret their state machines mid-flight.

### Constraints vs Preferences

- A constraint narrows the safe design space; a preference improves usability but can bend.
- In this prompt:
  - Irreversible payment handling — constraint, not preference.
  - Human approval latency — constraint if the business genuinely waits days, preference if approvals normally happen within hours.
  - Workflow versioning — constraint once the customer admits in-flight cases will survive a deployment.
  - A nice dashboard — preference.
- Naming which is which out loud shows the candidate can protect the architecture from scope creep.

> 🎯 **Interview Pointer:** When interviewers introduce a new "nice to have" mid-interview, explicitly classify it as constraint or preference before reacting — this single habit is one of the clearest signals of architectural discipline under pressure.

### What the MVP Will Not Support

- Explicit non-goals prevent solution sprawl:
  - No arbitrary user-authored branching logic, multi-tenant visual rule builders, or global exactly-once delivery across every downstream system.
  - No attempt to make all actions reversible — payment and some external writes are not safely reversible in the general case.
  - No infinite retention for transition history — retention should be explicit and policy-driven.
  - No single universal compensation strategy — some steps will need manual recovery.
- A reliable orchestration system earns trust by doing a few hard things well, not by pretending to be a full business-process platform on day one.

### Requirement-to-Component Traceability

- A concise traceability table is the bridge from requirements to architecture, and later from architecture to implementation and operations:

| Requirement | Primary component(s) |
|---|---|
| Durable state machine | Workflow engine, persisted workflow store |
| Persisted transition history | Event/history store, audit log |
| Idempotent activity execution | Activity executor, deduplication keys, provider idempotency adapter |
| Retry and timeout policies | Scheduler, timer service, retry policy engine |
| Human signals and timers | Signal intake, approval queue, deadline manager |
| Saga compensation and operator recovery | Compensation handlers, admin console, manual override path |
| Survive process and region failures | Replicated storage, replayable execution model, failover procedures |
| No duplicate payment | Payment guardrail, unique business reference, payment ledger check |
| Inspectable history | Query API, history viewer, event export |
| Compatible evolution | Versioned workflow definitions, migration rules, compatibility gates |

### The Assumption Discipline an FDE Needs

- Best interview answer does not pretend certainty where none exists: "I am assuming payment is irreversible, approvals may wait for days, and workflow definitions will change while old instances remain active. Under those assumptions, I will optimise for durable state, explicit history, idempotent side effects, and version compatibility."
- A strong FDE shows discovery, prioritisation, and delivery discipline at the same time — translating incomplete customer input into a system that is safe enough to ship, narrow enough to reason about, and flexible enough to grow.
- Next step: requirements turn into scale estimates and SLOs, where the architecture starts to harden.
