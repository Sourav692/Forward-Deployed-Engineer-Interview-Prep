# The Agent-Computer Interface

*A bigger model is the tempting fix for a failing agent, but most tool failures are interface bugs that no model can reason its way around.*

A failing tool call is rarely the model's fault. Fix the surface the agent sees before touching the model, and read [Tool Schema Design](/learn/production-ai/tool-design-mcp-a2a/tool-schema-design) for the concrete rules.

**Objectives:**

- define the agent-computer interface and say why it caps an agent's reliability;
- name the five reasons a tool call fails, and which one is a model problem;
- explain why a tool's description and its `destructive` flag are design decisions, not details.

---

## Treat the Tools as the Agent's Whole World

An agent cannot use what it cannot see. Its tools, their schemas, the results they return, and the rules about who may call what make up everything it can perceive and touch. Together that surface is called the **agent-computer interface** (ACI). It sets a ceiling on reliability: no amount of reasoning recovers information the interface never gave.

Picture a support agent that looks up orders and issues refunds. Suppose `search_orders` returns `null` both when no order matches and when the database is down. The agent cannot tell those apart unless the tool says so, explicitly, on every call.

So design each tool as a public API for a partner who will never read your docs and can never ask a follow-up question. Whatever that partner needs to know must be in the name, the description, the arguments, and the result.

## Diagnose the Interface Before Blaming the Model

When `issue_refund` fails, there are five possible reasons.

| What went wrong | Whose bug |
|---|---|
| The agent picked the wrong tool, such as `cancel_order` instead of `issue_refund` | Interface |
| The right tool got bad arguments, such as a string where a number was needed | Interface |
| The call looked valid but was not, such as a refund larger than the amount paid | Interface |
| The call worked, but the result was unusable, such as a huge JSON blob | Interface |
| The model simply made a mistake | Model |

Only the last row is a model problem, and it becomes rare once the first four are fixed. The practical rule from the source: if refund calls succeed less than about 90% of the time, fix the interface before reaching for a bigger model.

**Say it like this:** "I'd check the interface before blaming the model. Four of the five ways a tool call fails are design bugs."

## Declare What Each Tool Is at Registration

The FDE Handbook's companion agent defines a tool as four fields:

```python
@dataclass
class Tool:
    name: str            # unique id the agent references
    description: str     # what the model reads to pick a tool
    func: Callable       # the actual implementation
    destructive: bool = False   # True -> requires confirmation before running
```

Three fields are obvious. The fourth is the first safety decision in any agent, and it happens when the tool is registered, not when it is called. `search_tickets` only reads. `close_ticket` writes irreversibly. The tool declares which kind it is, and the loop treats the two differently from then on.

Why put the flag on the tool rather than ask the brain to check? A brain that is wrong cannot be trusted to notice it is about to do damage. The flag lives where the brain's mistakes cannot reach it.

## Write the Description as a Prompt

Tools sit in a **registry**, a name-to-tool lookup. Its `specs()` method returns each tool's name, description and `destructive` flag. That list is the tool-calling interface. When people say "the model chose a tool", they mean the model was shown this list and emitted one entry's name plus arguments.

The description is therefore prompt engineering. It is the only thing the model has to go on when it picks. The interview tutorial says the same thing from the other side: a description is the only thing standing between the model calling the tool correctly and the model guessing.

Errors belong to the contract too. The Handbook's ticket store raises two exception types, one for temporary failures and one for permanent ones. [Typed Tool Results and Teachable Errors](/learn/production-ai/tool-design-mcp-a2a/typed-tool-results-and-teachable-errors) shows why that split matters so much.

> **Warning: a bigger model does not fix a vague interface.** Swapping in a stronger model hides interface bugs for a while and raises the cost of every call. The four interface failures stay exactly where they were.

## Worked Example: The Refund That Kept Failing

The support agent's refund success rate sits at 70%. The team's first instinct is a larger model.

Walk the five causes instead. Traces show the agent sometimes calls `cancel_order` when the customer says "cancel my refund request", which is a naming and description problem. Some calls send `"50"` as a string, which is a schema problem. A few refunds exceed what the customer paid, which only a server-side check can catch. And the order lookup returns every field of the order record, so the agent loses the amount it needs in the noise.

Each fix is an interface fix: a clearer description that says when not to use the tool, a typed amount, a validation rule, and a trimmed result. The model never changed. That is the point of the ACI: the reliability ceiling was set by the interface, so the interface is where it rises.

---

## Key Takeaways

- The agent-computer interface is everything the agent can see and touch, and it caps how reliable the agent can be.
- Four of the five reasons a tool call fails are interface bugs; below about 90% success, fix the interface first.
- Declare whether a tool is destructive when it is registered, so a wrong brain cannot skip the check.
- The registry's `specs()` list is what the model sees, so every description is a prompt.

## Check Yourself

1. **Name the five reasons a tool call can fail. Which one is a model problem?**
   Wrong tool, right tool with bad arguments, a call that looked valid but was not, a result too large or messy to use, and a plain model mistake. Only the last is the model's fault.

2. **Why is `destructive` a field on `Tool` rather than a check the brain performs?**
   The decision is made once, at registration. A brain that is wrong cannot be relied on to notice it is about to do something irreversible, so the loop enforces the flag instead.

3. **What does "the model chose a tool" mean mechanically?**
   The model was shown the registry's `specs()` list of names, descriptions and flags, and emitted one tool's name plus arguments.

