# Protect the Endpoint From Abuse and Cost

*A public LLM endpoint should be easy for real users to call, yet every call spends real money, so its limits must count cost rather than requests.*

◷ 5 min

Request counts are the wrong unit for an LLM API, because one huge request can cost as much as fifty small ones. Layer authentication, token-aware limits and abuse checks on top of the contract from [Define the API Contract With Typed Schemas](/learn/engineering-foundations/apis-and-backend/define-the-api-contract-with-typed-schemas), and keep every counter where all instances can see it.

**Objectives:**

- list the defensive layers of a public LLM endpoint;
- design rate limits on requests, tokens and daily cost, with tiers and useful headers;
- enforce concurrency caps that hold across many API instances.

---

## Stack Defences in Layers

No single control stops abuse, because abusers vary. Stack them.

Start with **authentication**: an API key or a JWT on every request, so every call has an owner. Add **request validation** that blocks "prompt bombs", huge prompts sent to burn tokens. Always set **output limits** through `max_tokens`, whatever the user asks. Watch for **abuse patterns**: identical repeated requests, requests that always ask for the maximum tokens, or odd timing. Then review or suspend the account. For endpoints without accounts, add **bot detection** through CAPTCHA or behaviour checks.

## Rate-Limit on Three Dimensions

"100 requests per minute" treats a one-line question and a huge pasted document as equal. They are not: one huge request can cost as much as 50 small ones. A limit that counts requests alone cannot see cost.

Limit on three dimensions at once. Count **requests per minute**, **tokens per minute**, and a **daily cost budget** estimated from input and output token prices. Keep the counters in Redis with expiry. When any one is exceeded, return HTTP 429.

Give different plans different numbers: free, pro and enterprise tiers each get their own limits. Then tell clients where they stand. Return `X-RateLimit-Remaining-Tokens`, `X-RateLimit-Reset` and `Retry-After` headers. Put a clear error type in the 429 body: request limit, token limit, or daily budget exceeded. A client that knows which limit it hit can back off correctly.

| The question a client asks | What answers it |
|---|---|
| How many tokens do I have left? | `X-RateLimit-Remaining-Tokens` |
| When does my window reset? | `X-RateLimit-Reset` |
| How long should I wait? | `Retry-After` |
| Which limit did I hit? | The error type in the 429 body |

## Keep Limits in Shared State

Two problems arrive when many users start long AI tasks at once: too many expensive jobs run together, and shared state gets corrupted.

Cap concurrency with an `asyncio.Semaphore`, for example at most 50 LLM calls at a time. But a semaphore lives inside one process. A count kept in an in-memory dictionary only sees its own instance, so a limit enforced there is not a limit across the fleet. Use distributed state instead: Redis, database locks or distributed queues. Then a per-user count of active tasks holds across all API instances.

Make task execution stateless as well. Workers load state from the database and write results back. Any worker can then handle any task.

> **Warning: in-memory counters do not limit a fleet.** A rate or concurrency counter in a Python dictionary resets on restart and counts only one instance. Behind a load balancer with several instances, a user gets several times the intended limit.

## Worked Example: A Free-Tier User Pastes a Book

A free-tier user sends a prompt that is only one request but a very large number of tokens.

Authentication identifies the user from their API key. Validation checks the prompt size. Suppose it passes. The rate limiter checks three Redis counters. Requests per minute are fine. Tokens per minute are not: this one prompt exceeds the free tier's token budget.

The API returns 429. The body says "token limit". The headers show zero remaining tokens, the reset time and a `Retry-After`. The user's client waits instead of hammering the endpoint.

A pro user sends the same prompt and passes, because their tier has a larger token budget. Their request joins the shared per-user count of active tasks in Redis. That count is the same whichever API instance took the request. The request-count limit alone would have let the free-tier prompt through. Counting tokens and cost is what caught it.

---

## Key Takeaways

- Stack authentication, request validation, output limits, abuse-pattern detection and bot detection; no single control is enough.
- Limit requests per minute, tokens per minute and daily cost together, by tier, and explain a 429 through headers and an error type.
- Cap concurrency with a semaphore, but keep cross-instance counts in Redis, database locks or distributed queues, and keep workers stateless.

## Check Yourself

1. **Why is "100 requests per minute" not enough for an LLM endpoint?**
   One huge request can cost as much as 50 small ones. Limit tokens per minute and a daily cost budget as well.

2. **What should a 429 response tell the client?**
   Through headers, the remaining tokens, the reset time and how long to wait; through the body, which limit was hit: request, token or daily budget.

3. **An `asyncio.Semaphore` caps LLM calls at 50. Why can users still exceed their task limit?**
   The semaphore and any in-memory counts cover one process. Keep per-user counts in distributed state such as Redis so limits hold across all instances.

## References

**Sources:** `Module_10_Backend_FastAPI_Deployment.md` (GenAI Engineering Modules): LLM Serving APIs, "How do I stop people abusing a public LLM endpoint?", "How do I design rate limiting when requests vary in token size?" and "How do I keep things safe when many users start long AI tasks at once?".
