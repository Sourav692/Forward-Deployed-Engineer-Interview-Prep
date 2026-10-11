# Practise API and Backend Interview Questions

*A backend answer that names FastAPI, Redis and SSE still fails if it never says what each piece protects against.*

Interviewers rarely ask what `Depends()` does; they ask you to design the API for an LLM feature and listen for where cost, failure and latency are handled. Answer each prompt below out loud first, then compare with the outline and reread the lesson it points to.

**Objectives:**

- answer the common backend prompts for an LLM feature in under a minute each;
- lead every answer with the risk the design controls;
- talk through a full API design for an LLM feature.

---

## Lead With the Risk, Then the Mechanism

Most backend questions about LLM features share one skeleton. Name the risk: a frozen event loop, an uncapped bill, a confusing response, a wrong cached answer. Name the control that stops it. Only then name the tool. "We'd use Redis" says nothing until it is clear that Redis holds the counters that every instance must share.

## Practise the Request-Path Questions

**1. "How do you handle lots of LLM requests without freezing the server?"**
Ask where the model runs. External APIs are I/O-bound, so use `async def` with an async client such as `httpx.AsyncClient`. Self-hosted models are compute-bound, so move inference to a model server such as vLLM, TGI or Triton, or to queue workers. Cap upstream concurrency with a semaphore or rate limiter. → [Keep the Request Path Free](/learn/engineering-foundations/apis-and-backend/keep-the-request-path-free)

**2. "Which endpoints should be async and which sync?"**
Async for I/O waits; plain `def` for CPU-only work or unawaitable libraries, which FastAPI runs in a thread pool. Never call blocking code inside `async def`. → [Keep the Request Path Free](/learn/engineering-foundations/apis-and-backend/keep-the-request-path-free)

**3. "How do you run document indexing that takes minutes?"**
Not with `BackgroundTasks`, which is for very short jobs. Submit to a task queue such as Celery with Redis, return a `job_id` and status URL, report PENDING, PROGRESS and SUCCESS, and let the worker retry. → [Keep the Request Path Free](/learn/engineering-foundations/apis-and-backend/keep-the-request-path-free)

## Practise the Structure Questions

**4. "How do you separate routes, business logic and prompts?"**
Routes are thin HTTP handlers. Services hold the logic. Prompts live in templates with a builder. Schemas are Pydantic. Core holds configuration and dependencies. Clients are built once in `lifespan` and injected with `Depends()`, so tests can swap in mocks. → [Structure the Service and Decide What to Build](/learn/engineering-foundations/apis-and-backend/structure-the-service-and-decide-what-to-build)

**5. "Would you build this as microservices?"**
Start as a modular monolith. Split only for blocked deploys, very different scaling or different technology; the usual split points are ingestion, query and an LLM proxy. → [Structure the Service and Decide What to Build](/learn/engineering-foundations/apis-and-backend/structure-the-service-and-decide-what-to-build)

**6. "What would you build and what would you buy?"**
Buy identity, secrets, search and monitoring. Build the permission rules, retrieval tuning, prompts and workflows, because only they encode this customer's business. → [Structure the Service and Decide What to Build](/learn/engineering-foundations/apis-and-backend/structure-the-service-and-decide-what-to-build)

## Practise the Contract and Protection Questions

**7. "How do you validate prompts, files and token limits?"**
Pydantic limits on length, `max_tokens` and `temperature`, plus a validator against whitespace prompts. Check upload type and size. Reject bodies over the size limit with 413 and over-long prompts, counted with `tiktoken`, with 400. Always cap `max_tokens` at a configured maximum. → [Define the API Contract With Typed Schemas](/learn/engineering-foundations/apis-and-backend/define-the-api-contract-with-typed-schemas)

**8. "How do you stop people abusing a public LLM endpoint?"**
Layers: authentication by API key or JWT, request validation, output limits, abuse-pattern detection and bot detection. Rate-limit requests per minute, tokens per minute and daily cost, by tier, with explanatory 429 headers and body. Keep counters in Redis so limits hold across instances. → [Protect the Endpoint From Abuse and Cost](/learn/engineering-foundations/apis-and-backend/protect-the-endpoint-from-abuse-and-cost)

## Practise the Streaming and Caching Questions

**9. "How do you build a streaming chat endpoint?"**
SSE through `StreamingResponse` with token, done and error events. The status code cannot change once streaming starts, so errors travel in the stream. Set `X-Accel-Buffering: no` for nginx. Keep sessions server-side in Redis with a TTL, trimmed to a context budget. → [Build a Streaming Chat Endpoint](/learn/engineering-foundations/apis-and-backend/build-a-streaming-chat-endpoint)

**10. "Would you add a semantic cache?"**
Start exact-match. A semantic cache risks confidently wrong answers for questions that are close in wording but need different answers, and it must never match across permission scopes. → [Cache Answers Without Serving Wrong Ones](/learn/engineering-foundations/apis-and-backend/cache-answers-without-serving-wrong-ones)

> **Warning: do not describe streaming as a speed-up.** Streaming cuts perceived latency, not total latency. Saying it makes the system faster invites the follow-up that exposes the gap.

## Worked Example: Design the API for an LLM Feature

The prompt: "Design the API for a document question-answering feature."

Open with the request path. The question endpoint is async because it waits on vector search and an external LLM. Uploads go to a task queue and return a `job_id`. A semaphore caps calls to the provider.

Then the contract. A Pydantic model validates the prompt, `tiktoken` counts it, and `max_tokens` is capped. The response follows one schema with `full_text`, `citations`, `tool_outputs` and `metadata`.

Then protection. Every request carries an API key. Limits count requests, tokens and daily cost per tier in Redis, and a 429 explains itself.

Then the chat experience. The grade check runs first, then the answer streams over SSE, with errors sent as events. Sessions live in Redis with a TTL.

Close with caching and the build line. Use exact-match caching first, in front of retrieval and generation. Buy the vector index; build the permission rules. Each part of the answer named the risk before the tool, which is what the interviewer is listening for.

A line worth keeping, in paraphrase of the handbook's interview lens: start with exact-match caching because a similarity cache can serve a confident wrong answer and must never cross permission scopes; treat streaming as a channel decision that runs only after the "can I answer?" check, since retracting a streamed answer is worse than refusing cleanly.

---

## Key Takeaways

- Lead every backend answer with the risk, then the control, then the tool.
- Request-path answers turn on where the model runs; structure answers start from a modular monolith and the build-or-buy line.
- Contract and protection answers count tokens and cost, not just requests, and keep shared counters in Redis.
- Streaming and caching answers name their traps: no retraction after the first token, and no semantic hit across permission scopes.

## Check Yourself

1. **An interviewer asks how you would protect a public LLM endpoint. What are the first three layers you name?**
   Authentication by API key or JWT, request validation against prompt bombs, and token-aware rate limiting on requests, tokens and daily cost.

2. **What is wrong with "streaming makes the system faster"?**
   Streaming lowers perceived latency only; total generation time is unchanged.

3. **In a full API design, why mention the grade check before streaming?**
   Because the decision to answer must be settled before the first token; retracting a streamed answer is worse than a clean refusal.

