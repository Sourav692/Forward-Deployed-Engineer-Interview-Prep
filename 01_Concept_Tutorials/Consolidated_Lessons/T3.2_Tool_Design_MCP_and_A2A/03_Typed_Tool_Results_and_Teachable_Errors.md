# Typed Tool Results and Teachable Errors

*A tool should tell the agent exactly what went wrong so it can recover, but never so much about a refusal that it learns to work around the rule.*

◷ 6 min

A tool that returns a bare string forces the agent to guess what happened. Return one of five typed states instead, write errors that change the agent's next move, and keep [Tool Schema Design](02_Tool_Schema_Design.md) rule 7 in mind throughout.

**Objectives:**

- name the five result states and the failure caused by confusing each pair;
- explain why a denial should be a dead end for the model;
- write an error message that makes the next action different from the last.

---

## Return One of Five States

Give every tool a typed result with five possible states: `SUCCESS`, `EMPTY`, `UNAVAILABLE`, `DENIED` and `INVALID`. The source calls this the single change that fixes more agents than any other.

| What the agent needs to know | State |
|---|---|
| Did it work, and here is the answer? | `SUCCESS` |
| Did the search run fine but match nothing? | `EMPTY` |
| Is the system down, so try later? | `UNAVAILABLE` |
| Is this caller not allowed to do this? | `DENIED` |
| Was the input wrong, and what should change? | `INVALID` |

The support agent searches for an order and gets nothing back. With a bare string it cannot tell "no such order" from "the order database is down". With typed states it can.

## Keep Each Pair Apart

Two confusions cause most of the damage.

Mixing `EMPTY` with `UNAVAILABLE` causes retry storms during a real outage. An agent that reads an outage as "no results" keeps rewording the same query until its budget runs out.

Mixing `DENIED` with `INVALID` is subtler. An agent told its input was wrong tries a different input. That is right for a typo and wrong for a policy. It teaches the agent to work around the policy instead of respecting it.

The reference agent's ticket store makes the same split at the exception level. A `TransientError` is a temporary failure, such as a network blip or a 503, and is safe to retry. A `NotFoundError` is permanent: do not retry, and consider a fallback. A tool's failures are part of its contract, and a retry policy is only as good as this distinction.

## Never Explain a Denial to the Model

Suppose `issue_refund` returns `DENIED` with the message "refunds over $500 need manager approval". The model reads that as an instruction, not a wall. Next time it wants to refund $600, it issues two refunds of $300.

So make denials a dead end. Give the model no reason and no hint of a workaround. Record the full explanation in the trace, where a human reads it later. This asymmetry is deliberate, and interviewers like to probe it.

> **Warning: a helpful denial is an exploit.** Any detail about why a call was refused tells the model which boundary to step around. Explain denials to humans in the trace, never to the model in the result.

## Make Every Other Error Teachable

For every state except `DENIED`, the opposite holds. A tool's error message becomes the next thing the model reads, so it is part of the prompt.

A vague `"Error"` teaches nothing. The model tries the same call again, and an agent can loop on one failing call indefinitely. A specific message, such as "room 105 already booked 2025-04-22 to 2025-04-25", gives the model enough to choose a different room or different dates. Design each error so the model's next action differs from its last one.

The interview tutorial shows the other half of this. A deliberately flaky web-search tool returned "Error: Could not retrieve data. The API endpoint is currently unavailable." A plain planner-executor appended that string to its steps as if it were data. It then confidently reported Apple's R&D spend per employee as roughly $186,969, using an estimated headcount. Nothing told it an error string from a result string. Typed states fix that at the source. The tutorial's other fix, a verifier step that classifies each tool output before synthesis, is covered with the orchestration patterns.

## Version the Contract Between Components

The five result states are a contract between a tool and the agent. The same idea applies to every boundary inside the system: tool to agent, agent to agent, retrieval to answer step, gateway to application. Natural language is not a contract. A typed schema is.

Give each contract a version and change it the way you would change a public API:

- **Add, don't change.** New optional fields are safe. Renaming or removing a field, or changing what a value means, is a breaking change and needs a new version.
- **Carry the version in the payload,** so a consumer can tell which shape it received and refuse one it does not understand.
- **Run both versions during a change.** The producer emits the new version while consumers move over, then the old one is retired on a date.
- **Test the contract, not just the code.** A contract test runs each producer's real output against each consumer's schema in CI, so a breaking change fails the build instead of a production run.

A tool that silently renames `order_id` to `orderId` does not throw an error. The agent simply stops finding the order, and the failure looks like a model mistake.

## Worked Example: An Order Lookup During an Outage

The order database goes down for five minutes. Follow the support agent through two designs.

With a bare-string tool, `search_orders("A-1042")` returns `[]`. The agent concludes the order does not exist, rephrases, tries again, and burns its step budget. The customer is told there is no such order.

With typed results, the same call returns `UNAVAILABLE`. The agent stops searching and tells the customer the system is temporarily down. A minute later the customer asks for a $600 refund. The tool returns `DENIED` with no reason. The agent says it cannot complete the refund and hands off. The trace records "over the $500 approval limit" for the human who picks it up.

Same model, same prompt. The typed result decided whether the agent retried, stopped, or escalated.

---

## Key Takeaways

- Return one of five typed states so the agent knows what happened rather than guessing from a string.
- Confusing `EMPTY` with `UNAVAILABLE` causes retry storms; confusing `DENIED` with `INVALID` teaches policy workarounds.
- Keep denials opaque to the model and explained only in the trace.
- Write every other error so the next action differs from the last, and never let an error string pass as data.

## Check Yourself

1. **Why is confusing `EMPTY` and `UNAVAILABLE` dangerous during an outage?**
   The agent reads the outage as "no results" and keeps rewording its query, a retry storm that burns its whole budget.

2. **A refund tool returns "refunds over $500 need manager approval." What goes wrong?**
   The model treats the reason as an instruction and splits a $600 refund into two $300 refunds. Return a bare `DENIED` and keep the reason in the trace.

3. **What is the difference between a `TransientError` and a `NotFoundError`, and why should an agent care?**
   A transient error is temporary and safe to retry. Not-found is permanent, so retrying wastes budget; fall back instead.

## References

**Sources:** `ch05_tool_use_agent_computer_interface.md` (*Cracking Agentic AI System Design Interviews*, Ch. 5: "Typed Results: The Five States That Matter", including its note on never explaining a denial, summarised in our own words). `03_What_An_Agent_Actually_Is.md` (FDE Handbook, LLM Systems Foundations): "Component 1 — Tools" (the two exception types). `agent_fundamentals_and_advanced_agentic_systems_INTERVIEW_TUTORIAL.md`: §1.2 "Tool design — schemas and errors that teach the model to recover", §2 gotcha "A `flaky_web_search` tool teaches you nothing if the model doesn't check for the error string", and §7 self-check question 11.
