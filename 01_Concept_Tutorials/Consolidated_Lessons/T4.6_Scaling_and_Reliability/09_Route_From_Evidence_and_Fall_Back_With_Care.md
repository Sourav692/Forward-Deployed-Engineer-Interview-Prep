# Route From Evidence and Fall Back With Care

*A routing table chosen from a benchmark leaderboard is a guess. A fallback model that "should be about as good" is a second guess, made at the worst possible moment.*

◷ 7 min

[Model Routing and Prompt Discipline](../T4.5_Cost_and_Latency/04_Model_Routing_and_Prompt_Discipline.md) shows how to send easy requests to cheaper models. This lesson covers how a gateway decides those routes from evidence, how it handles each kind of provider failure, and why the model you fall back to must pass the same tests as the one it replaces.

**Objectives:**

- set a quality bar per task class and route only to models that pass it;
- re-evaluate routes when a provider, model version or traffic mix changes;
- classify provider failures and respond to each class differently;
- test fallback models against the same acceptance criteria as primaries.

---

## Route From Evaluation, Not Reputation

Every task class the gateway serves, such as `support-answer`, `extract-invoice` or `summarise-ticket`, needs three things:

1. **An evaluation set** drawn from that task's real traffic.
2. **A bar:** the minimum score, plus safety checks that must pass outright.
3. **A candidate list:** each model's score, cost and latency on that set.

The router may send the task to any model that clears the bar, choosing the cheapest or fastest that does. A model that tops a public leaderboard but misses the bar on your invoices is not a candidate for invoices.

Log the **route reason** on every call: which task class, which candidates qualified and why this one was picked. When quality drops, the first question is whether routing changed, and the log answers it.

## Re-Evaluate When Anything Moves

A route is only as good as the evidence behind it, and evidence ages. Re-run the task's evaluation when:

- the provider releases a new version behind the same model name;
- you add or remove a candidate model;
- the traffic mix shifts, for example a new customer segment with longer documents;
- the prompt or tools for the task change.

Pin model versions where providers allow it, so a silent update cannot move your quality. When you choose to upgrade, the evaluation is the gate.

## Classify the Failure Before Reacting

Providers fail in different ways, and each calls for a different response.

| Failure class | Example signal | Response |
|---|---|---|
| Outage or timeout | Connection error, 5xx, no response | Retry with backoff inside a breaker, then fall back |
| Rate limit | 429 with a retry-after | Wait as told or shift load. Never hammer the same provider |
| Invalid output | Schema validation fails | Repair once or retry with the error, then escalate |
| Refusal | The model declines the request | Do not silently try another model. Treat as a signal to review |
| Policy denial | Your own policy blocks the request or data | Stop. Return the reason code. Never retry elsewhere |

The last two rows matter most. If a request was refused by one model or blocked by your policy, sending it to another model is a way around a safety control. The gateway must not do that. A policy denial means the request is not allowed anywhere. A refusal needs a human to look at why, not a more obliging model.

## Treat the Fallback as a Different System

When the primary model is down, the gateway falls back to a secondary, as [Failover, Graceful Degradation, and Kill Switches](05_Failover_Graceful_Degradation_and_Kill_Switches.md) describes. The common mistake is assuming the secondary behaves the same. It usually does not:

- It may not support the same tool-calling format or structured output.
- Its context window may be smaller, so long requests are truncated.
- Its quality on your task may be well below the primary's.
- Its refusal behaviour and tone may differ.

So the fallback for each task must:

1. **Meet the task's required capabilities.** If it cannot, it is not a fallback for that task.
2. **Pass the same evaluation set,** perhaps against a lower bar that the business has agreed for degraded mode.
3. **Be tagged in the response and the trace,** so users can be told and analysts can separate fallback traffic.

Test fallbacks on a schedule, not only when the primary fails. A fallback that last worked six months ago is a hope.

## Worked Example: The Invoice Extractor's Bad Afternoon

The `extract-invoice` task routes to model A, which scores 97% on 400 labelled invoices. Model B is the fallback, last tested at 95% with the same schema.

1. **Silent update.** Model A's provider ships a new version under the same alias. The route-reason logs show no change, but the nightly evaluation of the pinned version is fine and the alias version scores 91%. The team had pinned the version, so production never moved. They hold the alias upgrade.
2. **Outage.** At 14:00, model A times out repeatedly. The breaker opens and traffic falls back to model B, tagged `fallback=true`.
3. **Capability gap.** Thirty invoices are over 60 pages. Model B's context is smaller. Instead of truncating them, the gateway returns `CAPABILITY_UNAVAILABLE: context_200k` for those, and the application queues them for later.
4. **Recovery.** At 15:10 the breaker half-opens, a probe succeeds, and traffic returns to model A. The queued long invoices are processed.

No invoice was extracted from a truncated document, and every fallback answer was labelled.

---

## Key Takeaways

- Route each task class to models that clear its evaluation bar, and log the route reason on every call.
- Re-evaluate when a model version, the candidate list, the traffic mix or the task's prompt changes. Pin versions so updates are your choice.
- Classify failures: retry outages, respect rate limits, repair invalid output, and never route around a refusal or a policy denial.
- A fallback model is a different system. It must meet the task's capabilities and pass its evaluation, and its answers are tagged.
- Test fallbacks on a schedule, not only during an outage.

## Check Yourself

1. **What makes a model a valid route for a task?**
   It clears that task's evaluation bar and safety checks on traffic like the task's own, at an acceptable cost and latency.

2. **A model refuses a request. Should the gateway try another model?**
   No. That routes around a safety behaviour. Return the refusal and flag it for review. The same applies to a policy denial, which means the request is not allowed anywhere.

3. **Why tag fallback responses?**
   So users can be told the answer came from a degraded path, and so quality analysis can separate fallback traffic from the primary.

## References

**Sources:** written for this site. Related lessons: [Model Routing and Prompt Discipline](../T4.5_Cost_and_Latency/04_Model_Routing_and_Prompt_Discipline.md), [Retries, Circuit Breakers, and Bulkheads](04_Retries_Circuit_Breakers_and_Bulkheads.md), [Failover, Graceful Degradation, and Kill Switches](05_Failover_Graceful_Degradation_and_Kill_Switches.md) and [What a Model Gateway Owns](08_What_a_Model_Gateway_Owns.md). The worked example's figures are illustrative.
