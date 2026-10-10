# Budgets and Spend Guardrails

*A budget checked after the call only reports what was already spent, while a budget checked before the call can refuse, but it must refuse the right requests.*

◷ 7 min

Treat spend as an engineering constraint, not a monthly surprise. Put limits at every level where money can run away, check them before the paid call, and explain them to the customer as predictability rather than restriction.

**Objectives:**

- layer budgets by user, tenant, feature, request and agent run;
- enforce a token cap before the call with a real token count;
- handle a spend incident and explain cost trade-offs to an executive.

---

## Layer Budgets Where Spend Can Run Away

Spend escapes at several levels, so limits live at several levels. Set budgets per user, per tenant and per feature. Cap tokens per request. Cap agent steps and tool calls. Apply tenant-aware rate limits and quotas. Detect spend anomalies and expensive queries, such as long context, repeated retries or heavy tool use. Write model fallback rules, and require human approval for high-cost or high-risk actions.

Different deployments need different defaults. The playbook sketches five policies, summarised here.

| Deployment | Default policy |
|---|---|
| Free tier | Small model by default, a strict daily quota, no long-context agent workflows |
| Enterprise tenant | A contract budget, quota alerts, the premium model only for approved workflows, a monthly report |
| Internal employee assistant | Department budgets, approval for sensitive workflows, retention limits |
| High-risk workflow | A strong model, citations, human approval, a full audit trace, no broad cache |
| Executive demo | Warm paths, a seeded cache, capped traffic, a fixed dataset, a budget alert |

## Check the Budget Before the Paid Call

Even with routing and caching, one unbounded request can blow a cost envelope. The production-operations tutorial's `TokenBudget.check_budget()` estimates a request's tokens and rejects it before the model is called.

```python
within_budget, tokens = self.budget.check_budget(query)
if not within_budget:
    raise ValueError(f"Query exceeds token budget: {tokens} > {self.budget.max_per_request}")
```

The cap must fire before the call. A check after the call only reports what was spent.

The estimate must be real. The tutorial's `estimate_tokens` is `len(text.split()) * 1.3`, a word-count heuristic. A request can pass the check and then cost more than the budget implied. Swap in a real tokenizer such as `tiktoken`, or the provider's token-counting endpoint.

Reject over-budget requests explicitly, with a clear error. Silently truncating the input returns a degraded answer with no sign that anything was cut. When a legitimate request is rejected, look at the account's history, not just this one request's size, to tell it apart from abuse.

## Budget the Whole Agent Run

A per-call cap does not bound an agent. Track cumulative spend across the run, with a hard cap on total run cost, and record budget exhaustion as a trace event. A per-run budget that halts one runaway workflow is the same instinct as a spend circuit breaker for the whole system.

## Stop the Bleeding Before the Root Cause

When spend exceeds a week's budget in one day after a launch, the weak response is switching the whole feature off without diagnosis. The strong response trips the spend circuit breaker first. Then identify the top spend paths, cap output, pause batch and evaluation jobs, reduce premium routing and apply tenant quotas. Only then run root-cause analysis. Keep low-cost safe paths online while the runaway ones are off.

One tenant using far more than its peers needs a different first question: is this healthy adoption, abuse, a loop, a batch job or an integration bug? Support healthy growth, and throttle loops and abuse. Segment usage by API key, user, feature, time of day and prompt version to tell them apart.

The lesson from every case is the same: budget guardrails must exist before launch.

## Explain Trade-Offs as Options

Customers and executives hear cost changes as product changes. Frame them carefully.

Present a cost increase as a change in request shape: longer prompts, more retrieved context, extra tool calls and retries, separated so spend falls without losing useful quality. Present routing as using the premium model where it changes the outcome, not as a downgrade. Present caching as safe only when keys carry tenant and permission boundaries and invalidation follows document and access changes. For a CFO or procurement team, offer per-tenant budgets, cost ceilings, usage dashboards and routing rules, so spend is predictable.

The playbook's customer narrative has six steps. Acknowledge the business concern. Decompose it into measurable parts. Pick quick wins that keep security and quality. Present trade-offs as options, not absolutes. Tie each change to adoption, ROI, budget predictability or risk. Commit to measured follow-up with dashboards, thresholds and before-and-after numbers.

## Prove Readiness Before Launch

A pre-production review checks that the guardrails exist and work. Load-test with realistic traffic, documents, tenants and prompt sizes. Set latency and cost targets per workflow. Configure budgets, quotas, rate limits, token limits and agent limits. Validate permission-aware retrieval and cache isolation. Run prompt and model regression evaluations. Review dashboards and alerts. Test provider fallback, graceful degradation, batch budgets and retry behaviour. Write incident runbooks and customer templates. Review logging, caching and retention with security and compliance.

> **Warning: a word-count budget is not a cost control.** An estimate that is off by a third either lets expensive requests through or blocks legitimate ones. Use a real tokenizer before trusting the cap.

## Worked Example: A Multi-Tenant Platform With Budgets

A SaaS company wants GenAI features for every customer, with strict isolation and budget control. The weak design is one global token limit and a shared cache.

The strong design puts a tenant-aware gateway in front. Each request is authenticated, then checked against the tenant's budget, then sent to the cache or a model route. Data stays in a tenant-scoped plane, and cost is attributed per tenant and shown on dashboards. Tenants can choose model tiers within contract. Quota alerts warn before limits bite, and isolation tests prove the cache never crosses tenants.

`tenant_id` and the permission signature become first-class fields in every service. Budgets became a property of the architecture, not a line in the invoice.

---

## Key Takeaways

- Layer budgets by user, tenant, feature, request and agent run, with policies that differ by deployment type.
- Enforce token caps before the paid call, with a real tokenizer, and reject explicitly instead of truncating silently.
- Budget an agent's whole run, not just each call.
- In a spend incident, trip the breaker and contain the top paths first, then find the root cause; tell healthy adoption from runaway automation.
- Explain cost work to customers as options tied to business value, and check every guardrail before launch.

## Check Yourself

1. **Why must the token budget check run before the API call?**
   After the call, it can only report money already spent. Before the call, it can refuse the request.

2. **A request passed the token budget and still blew the per-request ceiling. Why?**
   The budget used a word-count estimate, not a real tokenizer. Swap in `tiktoken` or the provider's counting endpoint.

3. **Spend hit a week's budget in one day after launch. What do you do first?**
   Trip the spend circuit breaker, find the top spend paths, cap output, pause batch and evaluation jobs, cut premium routing and apply quotas. Keep cheap safe paths online, then run root-cause analysis.

