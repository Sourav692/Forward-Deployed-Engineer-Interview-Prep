# Context, Memory, and Tool Patterns

*Every token and every tool call an agent spends buys capability, but unbudgeted context degrades the model and unguarded tools expose the environment.*

◷ 5 min

The context window is a scarce resource that degrades sharply when overloaded, and the boundary between a probabilistic model and deterministic systems is where most damage happens. Budget the window with context and memory patterns, then put every action behind tool patterns, after choosing a shape from [Orchestration Patterns for Agents](/learn/ai-systems-design/architecture-patterns/orchestration-patterns-for-agents).

**Objectives:**

- keep context deterministic and small with assembly, isolation and typed compaction;
- choose memory patterns that avoid duplicate retrieval and stale contradictions;
- put tool calls behind a gateway with typed results, projection, idempotency, tool retrieval and an action selector.

---

## Assemble Context in a Fixed Order

The window is finite and expensive, and an overloaded window makes the model worse, not just slower. Three patterns keep it under control.

A context assembler builds the prompt in a fixed section order, with a token budget per section. Because the order never changes, the prompt is deterministic, can be cached and can be reconstructed later. Watch each section's share of tokens and how often sections get evicted.

Sub-agent isolation hands a subtask that would flood the parent's window to a child with its own window. The child returns only a summary, so the parent grows by hundreds of tokens instead of thousands. Measure parent growth per subtask.

Structured compaction shrinks a long history into typed records rather than a prose summary. Typed records survive being compacted again, whereas prose drifts each time. Measure how many facts survive successive compactions.

## Store Memory So It Cannot Contradict Itself

Three memory patterns deal with where facts live and how they stay consistent. Memory tiering puts each kind of query in the store that suits it, and is judged by retrieval precision per tier.

An evidence ledger serves parallel workers that would otherwise fetch the same sources again and again. They record what has been retrieved, which removes the duplicate cost. Watch the duplicate-source rate.

Predicate normalisation handles contradictions. Similarity search cannot tell which of two conflicting facts is current. Normalising how facts are stated lets a newer fact replace an older one about the same thing by construction. Watch the contradiction rate in the store.

## Put Every Action Behind a Tool Gateway

The model must never touch the environment directly. Without a boundary, the main failure is unconstrained access. A tool gateway is that boundary, and it runs seven steps in order: authorise, validate, bound, execute, classify, project and observe. It becomes the single place for security and cost control. Watch the denial rate and the share of valid arguments.

A typed result separates facts that look alike. "Nothing found" and "the service is down" are different facts; collapsing them into an empty response triggers retry storms. A typed status removes them, and the status mix per tool shows the health of each.

Projection trims what a tool returns. When another team's upstream schema grows, an unprojected payload grows the context with it. Projection decouples token cost from other teams' changes. Measure payload bytes per tool.

## Make Tool Use Safe to Repeat and Hard to Hijack

An idempotency key protects writes that retries and checkpoint restores would otherwise repeat. Writes become safe to retry, and the duplicate-effect rate shows it works.

Tool retrieval keeps the advertised list short. Tool selection gets worse once an agent sees more than about 40 tools. Retrieving only the relevant tools fixes that; measure selection accuracy and retrieval recall.

An action selector replaces free-form tool calls with a choice from a fixed set. Injected text can then no longer invent an action. Track the rate of invalid action attempts.

| Worry | Pattern | Signal |
|---|---|---|
| Is the prompt the same shape every time? | Context assembler | Token share per section; evictions |
| Is a subtask flooding the parent's window? | Sub-agent isolation | Parent growth per subtask |
| Does compaction lose facts? | Structured compaction | Fact retention across compactions |
| Are parallel workers re-fetching the same sources? | Evidence ledger | Duplicate-source rate |
| Can the store hold two contradictory facts? | Predicate normalisation | Contradiction rate |
| Can the model act without a check? | Tool gateway | Denial rate; argument validity |
| Do "empty" and "down" look the same? | Typed result | Status mix per tool |
| Is another team's schema inflating context? | Projection | Payload bytes per tool |
| Can a retry apply a write twice? | Idempotency key | Duplicate-effect rate |
| Is the tool list too long to choose from? | Tool retrieval | Selection accuracy; recall |
| Can injected text invent an action? | Action selector | Invalid action attempts |

> **Warning: an empty result is not an unavailable service.** If a tool returns the same thing for "no matching records" and "dependency down", the agent retries real empties and trusts false ones. Return a typed status so each case gets the right handling.

## Worked Example: An Ops Agent Querying Logs

An ops agent calls a log-search tool. The upstream log service adds many new fields in a release. Without projection, every call now drags those fields into the window, and cost rises because of another team's change. With projection, the gateway returns only the fields the agent uses, and payload bytes per tool stay flat.

Later the log service has an outage. Without a typed result, the tool returns an empty list and the agent concludes there were no errors. With one, it returns an "unavailable" status. The agent then reports that it could not check, instead of reporting a false all-clear.

Both fixes live in the gateway. Each has a number that would have shown the problem before a user did.

---

## Key Takeaways

- A context assembler, sub-agent isolation and structured compaction keep the window deterministic, small and stable.
- Memory tiering, an evidence ledger and predicate normalisation put facts in the right store, without duplicates or contradictions.
- A seven-step tool gateway, typed results and projection make the tool boundary the single control point.
- Idempotency keys, tool retrieval and an action selector make tool use repeatable and resistant to injection.

## Check Yourself

1. **Why compact history into typed records instead of a prose summary?**
   Typed records stay stable when compacted again. Prose summaries drift with each pass and lose facts.

2. **What are the seven steps of a tool gateway, in order?**
   Authorise, validate, bound, execute, classify, project and observe.

3. **Roughly where does tool selection start to degrade, and what fixes it?**
   Past about 40 tools. Tool retrieval advertises only a short, relevant list.

