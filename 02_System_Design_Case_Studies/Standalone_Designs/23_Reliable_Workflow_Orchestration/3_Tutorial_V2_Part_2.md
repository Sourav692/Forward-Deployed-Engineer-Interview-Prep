# Design a Reliable Workflow Orchestration System, part 2

## 2. Clarifying Questions, Requirements, and Constraints

### Choosing Which Unknowns to Pay For

- Skip the boxes and arrows at first. Start by picking which open questions deserve scarce interview time.
- Expect the interviewer to answer only some of what you ask. Strong candidates live with some ambiguity and instead:
  - Find the handful of choices that would reshape the design if they went the other way.
  - Guard the riskiest constraint first: no business effect may happen twice when a step fails, pauses, or comes back in the wrong order.

### The Question Tree for Discovery

- Keep discovery questions few and pointed, each tied to a concrete design choice:
  - In what order do the steps run, and can any of them branch or be skipped? → The answer tells you if a simple sequential runner will do, or if you need a real state machine.
  - Which steps can be undone after they succeed, and which cannot? → This marks where compensation is safe and where retries need extra caution.
  - What is the longest a workflow may stay open before it times out, gets archived or is cancelled? → Storage and timers follow from this; week-long waits rule out in-memory state and short-lived queues.
  - At what point does a person approve, and how long may that approval sit? → This drives how you model paused states, reminders, escalations and cases nobody comes back to.
  - Do the downstream systems accept idempotency keys, block replays, or take a unique business reference? → If yes, retries are safe; if not, the orchestrator has to wrap each call in its own deduplication layer.
  - If a definition changes mid-flight, how do older running instances stay compatible? → This bites the moment someone wants a new approval step while 10,000 old workflows are live.
- Partial answers are no reason to stall. State your assumptions out loud and tie each one to the risk it covers.
  - The safest anchor here is that payment is the riskiest step and cannot be reversed. Whatever else degrades, the design must still block a second payment.

### From Discovery to Requirements

- Turn what you learned into a ranked list, not a wish list, sorted into must, should and could:
  - **Must**: durable state machine, persisted transition history, idempotent activity execution, retry and timeout policies, human signals and timers, saga compensation, operator recovery.
  - **Should**: versioned workflow definitions, so running instances can evolve without breaking.
  - **Could**: deeper analytics, bespoke dashboards, or branching rules users configure themselves, as long as none of them puts correctness at risk.
- The reason behind each must-have:
  - Durable state machine: the workflow outlives a crashed process and waits out long pauses.
  - Persisted transition history: operators can see what happened, and a restarted worker recovers its intent from the record instead of guessing.
  - Idempotent activity execution: retries will happen. A retry with no deduplication is a duplicate side effect under a nicer name.
  - Retry and timeout policies: outside systems break, slow down, and sometimes stay silent forever.
  - Human signals and timers: an approval usually arrives as a business event, not as an API callback.
  - Saga compensation and operator recovery: some steps can be reversed and some cannot, and the design has to show which is which.

### Functional vs Nonfunctional Requirements

- Functional: each case goes from approval to payment, then on to notifications and internal record updates.
- Nonfunctional: it keeps going through process crashes and even a lost region, keeps a history people can inspect, never pays twice, and changes without breaking workflows already under way.
- Keep the two lists apart. Mixed, they hide trade-offs; split, they show what the system does and how safely it must do it.
- Each nonfunctional requirement, restated as an outcome you can measure:
  - "Survive process and region failures" = after losing a worker or a whole site, the workflow picks up again with no committed state lost.
  - "No duplicate payment" = a business key, durable deduplication or the provider's idempotency mechanism guards the payment, and the same guard is used every time.
  - "Inspectable history" = transitions, retries, approval signals, timeouts and compensation events all land in durable, queryable storage.
  - "Compatible evolution of running instances" = changing a workflow definition leaves no older execution stranded, and no running state machine gets reinterpreted halfway through.

### Constraints vs Preferences

- Constraints shrink the set of safe designs. Preferences make the system nicer to use, but they can give way.
- For this prompt:
  - Irreversible payment handling: a constraint.
  - Human approval latency: a constraint if the business waits days, a preference if approvals usually land within hours.
  - Workflow versioning: a constraint as soon as the customer confirms that in-flight cases will outlive a deployment.
  - A polished dashboard: a preference.
- Saying the label aloud for each item shows you can keep scope creep out of the architecture.

> 🎯 **Interview Pointer:** If the interviewer adds a "nice to have" partway through, label it as a constraint or a preference before you respond to it. That shows architectural discipline under pressure.

### What the MVP Will Not Support

- Stating non-goals up front stops the solution from spreading:
  - No branching logic written freely by users, no multi-tenant visual rule builders, and no promise of exactly-once delivery to every downstream system.
  - No effort to make every action reversible. In general, payment and some external writes cannot be safely undone.
  - No keeping transition history forever. A clear policy sets how long it is retained.
  - No one compensation strategy that fits every step. Some failures will need a person to recover them.
- Trust in an orchestration system comes from handling a few hard problems well. Posing as a complete business-process platform on day one does not earn it.

### Requirement-to-Component Traceability

- A short traceability table links each requirement to the parts that deliver it. Later it links those parts to implementation and operations:

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

- A strong answer admits what it does not know: "My assumptions are that payment can't be reversed, approvals can sit for days, and definitions will change while old instances are still live. Given that, I'll optimise for durable state, a clear history, idempotent side effects and version compatibility."
- Strong FDEs discover, prioritise and keep delivery disciplined all at once. From patchy customer input they build a system that is safe to ship, small enough to reason about, and open to growth.
- What comes next: the requirements become scale estimates and SLOs, and the architecture begins to firm up.
