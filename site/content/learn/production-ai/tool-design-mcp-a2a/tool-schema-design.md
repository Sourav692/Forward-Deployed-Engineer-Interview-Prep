# Tool Schema Design

*A loose schema is quicker to write, but every constraint left out is a mistake the model is still free to make.*

Most tool failures are fixed in the schema, not the prompt. Apply eight rules to every tool, building on [The Agent-Computer Interface](/learn/production-ai/tool-design-mcp-a2a/the-agent-computer-interface), and let structure do the work that instructions cannot guarantee.

**Objectives:**

- apply the eight schema rules to a real tool;
- explain why an enum or a bound beats an instruction in the description;
- say why schema-constrained output is safer than parsing free text.

---

## Apply Eight Rules to Every Tool

Take `issue_refund` and `search_orders` from the support agent. Each rule below closes one gap the model would otherwise fall into.

| Rule | Before | After |
|---|---|---|
| 1. Name the action | `ordersV2Query` | `search_orders`, the verb a person would say |
| 2. Say when not to use it | No guidance | "Finds orders. For refunds, call `issue_refund` instead." |
| 3. Constrain every field | `status: string` | `status` as an enum of `open`, `shipped`, `delivered`, `cancelled` |
| 4. Put units in the name | `timeout` | `timeout_seconds` |
| 5. Keep arguments flat, at most six | A nested `filters` object | Flat `order_id`, `reason`, `amount_cents` |
| 6. Return small results | The full 40-field order record | The six fields the agent needs |
| 7. Make errors teachable | `400 Bad Request` | "`end_date` is before `start_date`; send a later end date" |
| 8. Make writes idempotent | Two calls refund twice | The same idempotency key returns the same result, and refunds once |

Rule 4 has a concrete story behind it. Without units in the name, the same model sends milliseconds one day, seconds the next and minutes the day after. Rule 8 alone prevents the incident where an agent retries a refund and pays the customer twice.

## Constrain Instead of Instruct

A constraint removes a whole class of error. An enum cannot hold a status that does not exist. A bound cannot accept a negative refund. Each one is a mistake the model can no longer make, however it reads the description.

A description, by contrast, only asks. The model may follow it most of the time. So push every rule that can be expressed as a type, an enum or a range into the schema, and keep the description for what cannot: when to use the tool, and when not to.

The interview tutorial describes how frameworks build this: a typed function, often a Pydantic model with a description on each field, is turned into a JSON schema and sent to the model's function-calling interface. The mechanism matters less than the habit. Describe every argument, and type every argument.

## Prefer Schema-Constrained Output to Parsed Text

The same principle applies to what the model sends back. A prompt that says "return ONLY valid JSON" is followed probabilistically. Sometimes the model adds a preamble or trailing prose, and the parser throws.

The interview tutorial's planner hit exactly this. Its fix was scaffolding: retry twice, re-prompt with a stricter reminder, and fall back to a hard-coded plan so the graph never crashes. It works, but it is scaffolding around a weak guarantee.

Schema-constrained decoding, where the provider enforces the schema during generation, mostly removes the need for it. Use it where the provider supports it, and keep the retry and fallback only as a backstop.

> **Warning: a deprecation warning is a future break.** The interview tutorial's notebook output shows Pydantic warning that `max_items` is deprecated in favour of `max_length` on list fields. Today it still works through a compatibility shim. That shim is not permanent, so fix schema warnings when they appear.

## Worked Example: Rewriting `issue_refund`

The first draft of the refund tool takes `ordersV2Refund(data: object)`. The description says "Handles refunds." The result is the whole order record.

Apply the rules in order. Rename it `issue_refund`. Say it is for refunds on existing orders and must not be used to cancel an order. Replace the nested object with three flat fields: `order_id`, `reason` as an enum, and `amount_cents` as a bounded integer. Return only the refund id, the amount and the new status. Turn errors into sentences that say what to change. Require an idempotency key.

Before the rewrite, the model could send a string amount, a refund reason nobody handles, or a call that runs twice. After it, those mistakes are impossible, not just discouraged. The schema now carries rules the description could only request.

---

## Key Takeaways

- Eight rules cover most tool failures: clear verb names, negative guidance, constrained fields, units, flat arguments, small results, teachable errors and idempotent writes.
- A constraint removes a mistake entirely, while a description only asks the model to avoid it.
- Schema-constrained output beats parsing free text, which needs retry and fallback scaffolding to be safe.

## Check Yourself

<details>
<summary>1. Why name a field <code>timeout_seconds</code> rather than <code>timeout</code>?</summary>

Without units, the same model will send different units on different days. The name makes the unit part of the contract.

</details>

<details>
<summary>2. What does rule 8 prevent?</summary>

A retried refund paying the customer twice. With an idempotency key, a repeated call returns the first call's result.

</details>

<details>
<summary>3. The prompt says "return only valid JSON", yet parsing still fails sometimes. Why, and what is the fix?</summary>

Instruction-following through prompt text is probabilistic. Use schema-constrained decoding where available, and keep a retry with a fallback as a backstop.

</details>

