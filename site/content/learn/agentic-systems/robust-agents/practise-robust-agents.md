# Practise Robust Agent Interview Questions

*An answer that lists every safeguard still fails if it cannot say in what order they run and which failure each one stops.*

◷ 7 min

Interviewers rarely ask "what is memoization?"; they ask what stops the agent doing damage, and wait for an order and a reason. Answer each prompt below out loud first, then compare with the outline and reread the lesson it points to.

**Objectives:**

- answer the common robustness prompts in under a minute each;
- lead every answer with the order of checks and the failure each prevents;
- walk a failing call through the whole executor without notes.

---

## Lead With the Order, Then the Failure

Most robustness questions share one skeleton. Say where the check sits in the pipeline. Say which failure it stops. Say what happens on the way out: a pause, a retry, a fallback, or an escalation. Then, only if asked, name the code.

An answer without an order cannot be checked. "We have retries and approvals" leaves the interviewer to guess whether a cache hit can skip the approval. The outlines below follow the skeleton.

## Practise the Executor Questions

**1. "How do you make tool calls robust?"**
Give the executor's three sections in order, then fallback, then the two rules. The sentence that carries it: "Gate first, cache second, retry third, and the fallback goes through the same gate. Retry only what's transient, bound it, and never let a cache hit or a fallback route around the destructive check." → [The Confirmation Gate and Memoization](/learn/agentic-systems/robust-agents/the-confirmation-gate-and-memoization)

**2. "Why does the confirmation gate run before the cache?"**
So that every call meets the gate. A cache in front of it would let a repeated destructive request return a stale result without authorisation, silently overriding the gate. → [The Confirmation Gate and Memoization](/learn/agentic-systems/robust-agents/the-confirmation-gate-and-memoization)

**3. "What makes your confirmation gate more than decorative?"**
Three properties. Destructiveness is declared at registration, not judged per call. The default policy denies. A block raises a pause carrying the exact arguments, so a human can approve and the run resumes. → [The Confirmation Gate and Memoization](/learn/agentic-systems/robust-agents/the-confirmation-gate-and-memoization)

## Practise the Failure-Handling Questions

**4. "What is retryable and what is not?"**
A transient failure, such as a network blip, a 503 or a rate limit, is retried with backoff up to a fixed budget. A permanent failure, such as a missing record or a bad request, is raised at once for the caller to fall back or escalate. Retrying a permanent failure only hammers a dependency that has already said what is wrong. → [Retries and Fallbacks](/learn/agentic-systems/robust-agents/retries-and-fallbacks)

**5. "A tool fails with a 503 four times in a row. Walk through it with `retries=3` and a declared fallback."**
Three retries, each logged and each with a longer delay. The fourth failure exhausts the budget, so the executor logs `error` and raises. The fallback wrapper logs the switch, adapts the arguments, and calls the fallback through the same executor, gate and cache included. → [Retries and Fallbacks](/learn/agentic-systems/robust-agents/retries-and-fallbacks)

**6. "Why doesn't the fallback catch a confirmation pause?"**
A pause is not a failure. Falling back on it would let a blocked destructive call be replaced by an unblocked tool. → [Retries and Fallbacks](/learn/agentic-systems/robust-agents/retries-and-fallbacks)

## Practise the Concurrency and Telemetry Questions

**7. "When do you run tool calls in parallel?"**
"Independent reads fan out, and the latency becomes the max instead of the sum. Dependent steps stay sequential, and writes never race. A fan-out shares one rate limiter and has a join timeout, so a burst degrades into a partial answer rather than a throttled failure." → [Parallel and Sequential Tool Calls](/learn/agentic-systems/robust-agents/parallel-and-sequential-tool-calls)

**8. "The model emitted three tool calls at once. Do you just run them?"**
No. The parallel proposal is a signal that the calls are independent, not an authorisation. The system checks that none is destructive, that the combined rate-limit cost fits, and that a join timeout exists. → [Parallel and Sequential Tool Calls](/learn/agentic-systems/robust-agents/parallel-and-sequential-tool-calls)

**9. "Why did the agent close the wrong ticket?"**
Read the per-call trace: which search ran, what it returned, which ID the agent chose. Every call is a record of tool, arguments, status, latency, and result or error. The five statuses map one-to-one onto the executor's branches, so the trace is complete by construction. In production that is one span per call, under one span per turn, under one trace per conversation. → [Observability for Tool Calls](/learn/agentic-systems/robust-agents/observability-for-tool-calls)

## Practise the Guard-Check Questions

**10. "What stops the agent doing damage?"**
Not one big gate but eight independent checks. Arguments are validated against a schema before anything executes. Destructive actions are gated on approval every time and never served from cache. Non-destructive calls are memoized within a session. A failed call retries with backoff and then falls back, and the fallback faces the same checks. Every call is logged. Close with the line that none of them replaces another. → [The Eight Guard Checks](/learn/agentic-systems/robust-agents/the-eight-guard-checks)

**11. "Two tools could both handle this request. Which runs?"**
A deterministic rule decides, not the model. Prefer the non-destructive tool, then the best match, or use a declared priority per tool. The same intent always resolves to the same tool, and a destructive tool never runs silently on a tie. → [The Eight Guard Checks](/learn/agentic-systems/robust-agents/the-eight-guard-checks)

**12. "Your gate already blocks dangerous calls. Why validate arguments too?"**
A malformed argument to a non-destructive tool never meets the gate. Validation fails it fast as "invalid input, try again" instead of letting a downstream system choke on it. → [The Eight Guard Checks](/learn/agentic-systems/robust-agents/the-eight-guard-checks)

## Worked Example: Write the Executor From Memory

A common follow-up is "write `execute_tool` on the whiteboard". Build it in the order of the questions it asks.

Start with the gate. If the tool is destructive, ask the confirmation policy, defaulting to deny. On a refusal, log `blocked` and raise `ConfirmationRequired` with the arguments. Next, build a stable key from the tool name and the sorted arguments. On a hit, log `cache_hit` and return the cached result. Then loop. Run the tool and time it. On success, log `ok`, store the result in the memo, and return it. On an exception, retry only if it is transient and the budget remains, logging `retry` and sleeping a little longer each time. Otherwise log `error` and raise.

Then add the fallback wrapper around it. Re-raise a confirmation pause. On any other exception, log the switch, adapt the arguments, and call the fallback through the same executor.

Each branch logs, each check has a fixed place, and nothing is swallowed. An interviewer who sees that structure has seen the whole lesson set.

> **Warning: do not reverse the order under pressure.** Candidates who write the cache check first, because it looks like an optimisation, have just let a cached result answer a destructive request. Say the order out loud before writing a line.

---

## Key Takeaways

- Lead every robustness answer with where the check sits and which failure it stops.
- Executor questions come down to gate, cache, retry, then fallback through the same checks.
- Failure-handling answers separate transient from permanent failures and never treat a pause as a failure.
- Concurrency answers fan out only independent reads, behind a shared limiter and a join timeout.
- Guard-check answers name eight independent checks and say that none replaces another.

## Check Yourself

1. **In one sentence, how do you make tool calls robust?**
   Gate first, cache second, retry third, and the fallback goes through the same gate; retry only what is transient, bound it, and never let a cache hit or a fallback route around the destructive check.

2. **What are the two rules of the failure policy that never bend?**
   Never silently swallow a failure inside an agent loop, and never auto-retry a destructive call without re-checking the confirmation.

3. **Trace a proposed destructive call with a malformed argument through the pipeline. Where does it stop?**
   At argument validation. It is rejected as invalid input before it reaches the destructive gate, the cache or the tool.

## References

**Sources:** the "Interview lens" and "Checkpoint" sections of `01_Retry_Fallback_Memo_Confirm.md`, `03_Parallel_vs_Sequential.md`, `04_Observability_For_Tool_Calls.md` and `05_The_Eight_Guard_Checks.md` (FDE Handbook, Robust Agents). `05-guarding-tool-calls.md` (Production and Platform Judgment): "What to say if asked directly".
