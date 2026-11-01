# Failover, Graceful Degradation, and Kill Switches

*Degrading quietly keeps the system up and hides that answers got worse, so every fallback must be planned in advance and announced when it fires.*

A circuit breaker knows when to stop calling a provider, but not where to go instead. Plan the next rung down before the outage, label every answer that came from it, and keep one blunt control that stops everything when no rung is safe.

**Objectives:**

- build a degradation ladder from retry to fallback to a labelled degraded answer;
- design multi-provider failover that tells the user and respects the customer's preference;
- tell a kill switch apart from a staged rollout, and know when degradation is dangerous.

---

## Fail Over to a Backup, Not a Longer Wait

A circuit breaker handles a provider that is glitching right now: stop hammering it and try again soon. It is not built for a longer outage. If the provider is down for 20 minutes, the breaker keeps waiting and probing with nothing coming back.

A longer outage needs a backup provider, not a pause-and-retry loop. Three pieces make that work.

**Have the backup ready.** Do not build a system that only knows one AI provider. Set it up to call a second provider, or a smaller model, if the first is really down. Decide this in advance, not mid-outage. An LLM client behind one interface is the seam that makes the swap possible.

**Tell the user when it switches.** Say something like "this answer used a backup system and may be less accurate", rather than pretending all is normal.

**Let the customer choose.** Some customers care more about accuracy than speed and would rather wait for the primary. Make it a per-customer setting, not one rule for everyone.

## Tag Every Answer With Its Source

The production-operations tutorial's `FallbackLLM` tries a primary call. On any exception it switches to a secondary call and tags the response with its source.

```python
class FallbackLLM:
    def invoke(self, prompt: str) -> dict:
        try:
            return {"text": self.primary_call(prompt), "source": "primary"}
        except Exception:
            return {"text": self.fallback_call(prompt), "source": "fallback"}
```

The `source` field matters as much as the fallback. When traffic silently shifts to the backup, cost and quality shift with it. Logging which model answered is the only way to see that drift.

Fallbacks are not automatically compatible. A backup model may use a different tool-calling format or structured-output contract. Give the fallback path its own validation, and test fallback prompts and schemas before the outage.

## Degrade One Layer at a Time, and Say So

The same instinct applies below the model. If retrieval combines dense and keyword search and one becomes unavailable, do not fail the request. Fall back to the method that still works, and tell the user the answer used a narrower method than usual. When both methods already exist separately, this is a small wiring gap: an explicit fallback at the call site plus a disclosure in the response. The handbook's query graph already degrades query expansion to dense-only search; this extends it one layer down.

## Put a Guaranteed Floor Under Everything

When every retry and fallback is exhausted, the last line of defence is to never let an exception escape. Return a clearly labelled, still-useful response instead of a stack trace.

```python
def safe_answer(question, llm_call, cached_context=None) -> dict:
    try:
        return {"answer": llm_call(question), "degraded": False}
    except Exception as exc:
        return {"answer": f"[DEGRADED] {cached_context or 'please try again shortly.'}",
                "degraded": True, "error": str(exc)}
```

Together these form a degradation ladder. Retry the primary with backoff. When retries are exhausted or the breaker trips, call the fallback model. If that fails too, return the labelled degraded answer. Each rung is tagged so the trace shows which rung served the request.

## Choose Degradation for Humans, Failure for Machines

Graceful degradation is not always right.

| Option | Costs | Buys | Pick when |
|---|---|---|---|
| Graceful degradation | Risk of quietly serving worse answers without enough visibility | The pipeline never crashes visibly; the user gets something | User-facing flows where availability matters more than a perfect answer |
| Hard failure | A visible error the caller must handle | An unambiguous signal that something is broken | Internal or automated pipelines where silent degradation would corrupt downstream state |

Degrade gracefully in front of a human; fail loudly in front of a machine.

Degradation is actively dangerous for an agent that acts on the degraded result as if it were real. Booking against a cached, stale price is the classic case. An agent's degraded inputs must block actions, not just change wording.

## Keep a Kill Switch Separate From Rollout

A staged rollout is a graceful, deliberate state change. Someone decides to move a workflow forward or back a stage: draft, test, shadow, live, autonomous. An incident needs something else: an emergency override that stops everything for a workflow or tenant, immediately, whatever is already running.

A kill switch differs in three ways. It halts everything in scope, including work already mid-flight, not just new work. It needs its own path that reaches into active execution, because a rollout demotion may only affect future authorisation checks and let work already past them continue. And it must be one fast flip a human can pull under pressure, not a role-gated, multi-step approval. That is the opposite instinct from a staged rollout. Say so if asked whether they are the same thing.

> **Warning: a fallback nobody can see is a silent quality regression.** If the backup answers for an hour and nothing records it, every quality and cost metric for that hour is misattributed to the primary. Tag the source on every response and surface it in the trace.

## Worked Example: The Twenty-Minute Provider Outage

The primary model provider goes down for 20 minutes during business hours. Retries with backoff fail on the first requests. After three failures, the breaker opens and new calls stop hitting the provider at all.

The fallback path takes over with a smaller model from a second provider, chosen weeks earlier and tested with the same prompts and schemas. Each answer carries `source: fallback` and a note that a backup system was used. One regulated customer has opted to wait for the primary; their requests queue with a status message instead. Dense retrieval stays up; had it failed, keyword search would have answered with a disclosure. An agent workflow that books orders sees the degraded flag and pauses bookings rather than acting on weaker answers.

When the breaker's probe succeeds, traffic returns to the primary. The trace shows exactly which requests the fallback served, so quality and cost reports stay honest. Nobody needed the kill switch, but it was one flip away.

---

## Key Takeaways

- A circuit breaker cannot fail over; a longer outage needs a backup provider chosen in advance, a user-facing disclosure and a per-customer preference.
- Tag every answer with the model that produced it, and validate fallback schemas separately.
- Degrade one component at a time, such as retrieval to a single method, and disclose it.
- Build a ladder of retry, fallback and a labelled degraded answer so no exception reaches the user.
- Degrade for humans and fail loudly for machines; never let an agent act on degraded data.
- A kill switch halts in-flight work with one fast flip, which a staged rollout cannot do.

## Check Yourself

<details>
<summary>1. Why is a circuit breaker not enough for a 20-minute provider outage?</summary>

It only stops and probes the same provider. Without a backup provider it has nowhere to send traffic, so requests keep failing.

</details>

<details>
<summary>2. Why tag a fallback response with its source?</summary>

So cost and quality accounting knows the primary did not answer. Otherwise drift during the outage is invisible and misattributed.

</details>

<details>
<summary>3. Name two properties a kill switch needs that a rollout demotion lacks.</summary>

It stops work already in flight, not only new runs; and it is a single fast flip, not a role-gated multi-step approval.

</details>

