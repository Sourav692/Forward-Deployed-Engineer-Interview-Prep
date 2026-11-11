# What a Model Gateway Owns

*When every team calls model providers directly, every team re-solves keys, quotas, retries, logging and policy, and each solves them a little differently.*

A model gateway is the single service every application uses to reach a model. The practise lesson for this module designs one for a single support agent: guardrails, cache, router, retries, fallback. This lesson steps back to the platform view. It covers what the gateway is responsible for across many teams, and the stable internal contract that lets applications stop caring which provider answers.

**Objectives:**

- list the duties a model gateway takes off application teams;
- explain why direct provider calls per team cause drift and incidents;
- design a stable internal request that names the task, not the provider;
- use capability negotiation so missing features fail loudly instead of silently.

---

## See What Goes Wrong Without One

Picture six teams, each calling two providers with their own SDK code. Within a year:

- API keys sit in six services, and rotating one takes six changes.
- One team retries without backoff and burns the shared quota for everyone.
- Usage cannot be attributed, so the monthly bill arrives as one number.
- A provider deprecates a model, and four teams discover it in production.
- Logging differs per team, so an incident review cannot compare runs.
- The data-protection rule "no customer data to provider X" is enforced in two services and forgotten in four.

That last item is the worst kind of drift: a policy that exists on paper and not in code.

## List the Gateway's Duties

| Duty | What the gateway does |
|---|---|
| Access and credentials | Holds provider keys. Applications authenticate to the gateway, never to providers |
| Policy | Enforces which data may go to which provider and region, and which teams may use which models |
| Routing | Chooses provider and model per request from the task, risk and budget |
| Quotas and fairness | Applies per-team and per-tenant limits so one caller cannot starve others |
| Resilience | Retries, circuit breakers and fallback, as in [Retries, Circuit Breakers, and Bulkheads](/learn/production-ai/scaling-and-reliability/retries-circuit-breakers-and-bulkheads) |
| Normalisation | Presents one request and response shape, including errors and stop reasons, whatever the provider |
| Telemetry and cost | Records model, version, tokens, latency and cost per call, tagged by team, tenant and task |
| Lifecycle | Pins model versions, announces deprecations, and moves callers in a controlled way |

The gateway does not own the application's prompt or business logic. It owns everything about reaching a model safely.

## Design a Stable Internal Contract

The worst gateway is a thin proxy that passes provider-specific requests straight through. Applications still name `provider-x/model-y` and still depend on its quirks. Instead, define a request that describes the job:

```
task:          "support-answer"
risk_tier:     2
latency_budget_ms: 3000
max_cost_usd:  0.02
required:      [tool_calling, json_output, context_128k]
data_class:    customer_personal
messages:      [...]
tools:         [...]
```

The gateway maps `task` and the constraints to a concrete model. The application never names a provider. When a better or cheaper model appears, the platform team changes the mapping, runs the evaluations for that task, and every caller moves without a code change.

## Negotiate Capabilities, Never Drop Them

Providers differ. One supports structured output with a JSON schema, another only "JSON mode". One allows 200,000 tokens of context, another 32,000. One returns tool calls in parallel, another one at a time.

If a request asks for something the chosen model cannot do, a careless gateway quietly drops it: the schema is ignored, the context is truncated, the tools are stripped. The application gets a plausible answer that silently broke its own assumptions.

Instead, the `required` list is a contract. The gateway only routes to models that support every required capability. If none is available, for example because the only qualifying provider is down, it returns a clear error such as `CAPABILITY_UNAVAILABLE: json_schema`. The application can then degrade on purpose. A loud failure is better than a quiet wrong answer.

## Worked Example: Moving Six Teams Behind a Gateway

A company moves its six teams onto one gateway over a quarter.

1. **Inventory.** List every direct provider call, its model, and the data it sends. Two services turn out to send customer data to a provider the data-protection team had excluded.
2. **Contract.** Define the task-based request and the capability list. Each team maps its calls to a task name.
3. **Policy.** The gateway refuses `customer_personal` data for the excluded provider. The two services are fixed by moving them behind the gateway, without a code change of their own.
4. **Lifecycle.** A provider announces a deprecation. The platform team re-points the `summarise-ticket` task to a new model, runs that task's evaluation set and switches it. Callers see no change except the version in their traces.

The gateway did not make any team's prompts better. It made policy, cost and change management something the platform does once.

---

## Key Takeaways

- A model gateway is the single path from applications to models, and it owns access, policy, routing, quotas, resilience, normalisation, telemetry and model lifecycle.
- Direct provider calls per team lead to scattered keys, quota fights, unattributed cost and policy drift.
- Applications send a task-based request with constraints. They never name a provider.
- Required capabilities are a contract. The gateway routes only to models that meet them and fails loudly when none can.
- The gateway owns how models are reached, not the application's prompts or business logic.

## Check Yourself

<details>
<summary>1. Why is a pass-through proxy not a real gateway?</summary>

Applications still name providers and depend on their quirks, so changing a model still means changing every caller. The value comes from a task-based internal contract.

</details>

<details>
<summary>2. What is capability negotiation, and what does it prevent?</summary>

The request lists required capabilities and the gateway routes only to models that have them. It prevents silent degradation, such as a schema being ignored or context truncated without the application knowing.

</details>

<details>
<summary>3. Which gateway duty closes the "no customer data to provider X" gap?</summary>

Policy. The gateway checks the request's data class against the provider and region rules on every call, so the rule is enforced once for every team.

</details>

## References

**Sources:** It extends the request-path design in [Practise Scaling and Reliability Interview Questions](/learn/production-ai/scaling-and-reliability/practise-scaling-and-reliability) and the casebook's production LLM gateway design to the platform level.

