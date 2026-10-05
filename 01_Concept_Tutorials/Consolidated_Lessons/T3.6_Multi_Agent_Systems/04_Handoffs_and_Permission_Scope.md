# Handoffs and Permission Scope

*Handing the next agent the whole conversation saves design work, but it costs tokens, dilutes focus, and can give an agent access the original request never had.*

◷ 7 min

The handoff, not the choice of specialists, is the hard part of multi-agent design. Pass a small, defined package that carries its permission scope, and treat each handoff as a durable step, building on the patterns in [Multi-Agent Coordination Patterns](02_Multi_Agent_Coordination_Patterns.md).

**Objectives:**

- sketch a reference architecture of triage plus specialists, and say why each agent is separate;
- list the fields of a good handoff package;
- explain why permission scope is carried rather than re-derived, and why a handoff must be replayable.

---

## Put Triage in Front of Proven Specialists

A common request is a system where specialist agents work across a knowledge base, a ticketing system, and a records system. The FDE Handbook's reference architecture has five agents. A triage agent receives the message and decides who owns it. Three specialists sit beside each other: Answer, Record, and Escalation. A Drafting agent turns their output into the reply.

| Agent | Job | Why it is separate |
|---|---|---|
| Triage | Decides which specialist owns the question at all | It is a router that sorts structured from open questions, one level up |
| Answer | Retrieves, grounds, and cites, or refuses cleanly | It is the single-agent retrieval design unchanged; its job is being right |
| Record | Writes to the ticketing or customer system through a fixed, reviewed set of operations, never an open query | The surface of what can happen stays a reviewed list |
| Escalation | Turns "the answer agent could not ground this" into a workflow action: a ticket, a queue, and the gathered context | Escalation is a real action with real effects, not a message |
| Drafting | Turns the answer and ticket state into a reply that suits the channel | Answer's job is being right; Drafting's job is saying it well for this channel |

The Answer and Drafting split is deliberate. A chat reply, a ticket comment, and a formal email differ in tone and length. Keeping them apart means a tone change never touches correctness logic.

Notice that the Answer agent is unchanged from a good single-agent design. Multi-agent did not replace it; it added triage in front and specialists beside it. What was already proven stays proven.

## Pass a Package, Not the Transcript

The naive design passes the entire conversation history to every agent. That is expensive. Each agent at hop N pays again for hops 1 to N-1, so cost grows faster than the number of hops. It also gives each agent more irrelevant context to filter, and it leaks information an agent has no need to see. Worst, nobody can say what any agent may depend on.

The better design makes every handoff a small, defined package.

```
handoff = {
  case_id,
  what_was_asked,
  what_was_attempted,
  why_it_was_insufficient,      # or: why access was denied
  what_was_already_gathered,    # so the next agent does not repeat work
  permission_scope,             # tenant, clearance, region, compartments: carried, not re-derived
}
```

The interview tutorial reaches the same answer from the code side. Its handoff state carries a `context_summary` field: what the next agent needs to know, without re-reading everything. Filtering messages by agent role is the other option it names. Either way, never pass the whole history to every agent by default.

The package also has a measurable quality. An agent that re-asks the user something already in the transcript, or re-runs a finished retrieval, is a sign the package is under-specified. [Failure Isolation and Evaluation](05_Failure_Isolation_and_Evaluation.md) turns that into a metric.

## Carry Permission Scope; Never Re-Derive It

When one agent hands a case to another, the receiving agent must never end up with broader access than the original request had. The same tenant, clearance, region, and compartment scope travels with the package, exactly.

An agent cannot be trusted to narrow access it was never told was narrow. An escalation agent that re-resolves the user's identity can reach a different, wider answer. One that runs under a service account has the service's access, not the user's. Either is a privilege-escalation path. So put the caller's resolved principal in the package and have every agent act under it.

The same rule appears in the insurer case study. The supervisor alone resolves which data assets a question may use, then hands the resolved list to the specialist. What passes is a trusted package, not a licence to go and find things.

> **Warning: a leak between agents is still a leak.** An escalation note visible to a wider audience, or a drafting agent given a chunk the answer agent should have dropped, is as serious as a leak in the main answer. Forbidden documents must not appear in any agent's context, any record it writes, or any reply it drafts.

## Make Every Handoff Replayable

A handoff is a state transition, and it must be safe to replay. A retried handoff must not create two tickets. A crash between two agents must not drop the case.

Treat the handoff as a step in a durable run. Give it an idempotency key, an identifier the receiver remembers so a repeat returns the first result instead of acting twice. Then checkpoint after it, so a restarted run resumes from the handoff rather than losing it. This is the same discipline that makes a durable workflow orchestrator trustworthy, applied at the agent boundary.

## Worked Example: Escalating an Ungrounded Billing Question

A customer of tenant A, in the EU region, asks why a fee appeared on their invoice. Triage routes it to the Answer agent. The Answer agent retrieves within the customer's scope but cannot ground an answer. The only relevant document is a contract restricted to the finance team.

The naive escalation forwards the whole transcript to the Escalation agent, which runs under a service account. It finds the restricted contract, quotes it in the ticket note, and the Drafting agent paraphrases it to the customer. Every step looked reasonable. The leak happened between agents.

The packaged escalation sends `case_id`, the question, the attempted retrieval, and "access denied to the only relevant source" as the reason it was insufficient. It also sends the documents already checked and the customer's `permission_scope` of tenant A, EU, and standard clearance. The Escalation agent acts under that scope. It creates one ticket with an idempotency key, routes it to the finance queue, and attaches the gathered context. The checkpoint after the handoff means a crash here resumes rather than drops the case. A retry returns the same ticket.

The package did two jobs at once. It told the next agent exactly what had happened, and it told it exactly how much it was allowed to see.

---

## Key Takeaways

- A reference architecture puts triage in front of proven specialists; Answer and Drafting stay separate so tone never touches correctness.
- Pass a small, defined package or a summary, not the full transcript, which costs more each hop and leaks context.
- Permission scope travels with the handoff and is never re-derived, or the receiver can gain access the request never had.
- A handoff is a durable step with an idempotency key and a checkpoint, so retries and crashes neither duplicate nor drop the case.
- The escalation example shows that a defined package is both a context contract and an access contract.

## Check Yourself

1. **Name the fields of a good handoff package.**
   The case ID, what was asked, what was attempted, why it was insufficient or why access was denied, what was already gathered, and the permission scope: tenant, clearance, region, and compartments.

2. **Why must permission scope be carried rather than re-derived?**
   A receiving agent that re-resolves identity, or runs as a service principal, can end up with wider access than the original request. Carrying the exact scope means an escalation never sees more than the question was allowed to.

3. **Why does your five-agent run cost more than five single calls?**
   Every agent receives the entire message history, so hop N pays again for every earlier hop. Pass a context summary at the handoff or filter messages by role.

## References

**Sources:** `02_Reference_Architecture_Handoffs.md` (FDE Handbook, Multi-Agent Systems): "A reference architecture", "The handoff is the hard part", and "Interview lens". `03_Failure_Isolation_And_Evaluation.md`: "Evaluating a multi-agent system" on handoff correctness and the security bar. `05_Case_Study_Supervisor_To_Deep_Agent.md`: "Why centralise asset resolution at the supervisor". `07_multi_agent_systems_INTERVIEW_TUTORIAL.md`: §1.3 "Handoff moves control without a central router" and the §2 gotcha "Passing full history to every agent is expensive and worse".
