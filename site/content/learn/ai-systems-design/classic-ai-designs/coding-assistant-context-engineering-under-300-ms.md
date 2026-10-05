# Coding Assistant: Context Engineering Under 300 ms

*More repository context makes suggestions better, while every extra token and model hop eats a latency budget of 300 milliseconds.*

◷ 8 min

A coding assistant is not one call to a big model. It is a retrieval-augmented, context-engineered system that spends latency and money only where they buy accuracy.

**Objectives:**

- explain why "must feel instant" plus "must understand my repository" makes this a context-engineering problem;
- place the semantic cache, retrieval and model router on the request path;
- draw context engineering as a funnel and route models by task;
- decompose the 300 ms budget and validate output before it reaches the IDE.

---

## Let Two Requirements Set the Problem

The prompt asks for an assistant like GitHub Copilot inside the IDE. It does real-time completion, code explanation, unit-test generation, bug fixing, refactoring and developer Q&A. The design must show how context engineering, semantic retrieval, model routing, semantic caching and output validation keep suggestions fast, accurate and safe.

Two requirements pull against each other. Suggestions must feel instant, and they must understand the whole repository. Together they make this a context-engineering problem as much as a distributed-systems one.

| Question | Answer | What it decides |
|---|---|---|
| Cloud or local? | Both exist | Where inference happens; the privacy story |
| Real-time as the user types? | Yes | The latency budget is set before anything else: **< 300 ms** |
| Which IDEs and languages? | VS Code, IntelliJ, Visual Studio; mainstream languages | A thin, IDE-agnostic extension talking to a shared backend |
| Whole repository or current file? | The whole repo, within reason | Context engineering is the hard problem |
| Private models and on-prem for enterprise? | Yes | Security and deployment shaped from day one |

The functional list covers single- and multi-line completion, explanation, and test, doc and commit-message generation. It adds refactoring, error fixing, Q&A, codebase search, multiple languages and workspace awareness. The non-functional list starts with < 300 ms autocomplete. Accuracy, low hallucination, availability, enterprise security, millions of developers, personalisation and cost follow.

## Check the Cache First, Retrieve on a Miss, Route by Task

```
IDE Extension
│
Authentication Service
│
API Gateway / Load Balancer
┌──────────────┴──────────────┐
Context Collection      User Preferences
└──────────────┬──────────────┘         Conversation Memory
               │  ◄──────────────────────────────┘
        Context Builder
               │
        Semantic Cache
        ┌──────┴──────┐
    Cache Hit      Cache Miss
        │              │
        │        Embedding Service
        │              │
        │        Vector Database
        │              │
        │        Relevant Code Retrieval
        └──────┬────────┘
          Prompt Builder
               │
          Model Router
        ┌──────┴──────┐
Small Fast Model   Large Reasoning Model
        └──────┬──────┘
        Output Validation
               │
          IDE Suggestions
```

The semantic cache carries the latency design. The common case is a completion the assistant has effectively seen before. A hit skips embedding, retrieval and often the large model entirely.

## Trace One Keystroke to an Accepted Suggestion

The user types `def calculate_total(items):`, and the extension detects the cursor position. Context collection gathers the current function, file, open tabs, imports and repo structure. It adds cursor location, language, recent edits and compiler errors. It selects only what is relevant, never the whole repository.

Semantic code search then finds similar functions, existing helpers, internal APIs and conventions. That prevents duplicate implementations and encourages reuse. Prompt construction combines system instructions, the request, current code, retrieved snippets, language, framework, conventions and relevant docs. The router picks a model by task complexity, and the model generates.

Output validation runs next. It parses the code, checks syntax and formatting, and applies security filters. It also detects hallucinated APIs and removes unsafe patterns. Invalid or low-confidence output is regenerated or suppressed. The result streams inline. The developer accepts, partially accepts, rejects or asks for alternatives, and that feedback drives personalisation.

> **Warning: a suggestion that compiles can still call an API that does not exist.** The model writes plausible code, not verified code. Validation must check calls against the real codebase and drop or regenerate anything that references invented functions.

## Engineer Context as a Funnel

Not every context signal is worth its token cost. Context engineering narrows in stages.

```
Full Repository & Workspace (potentially millions of tokens)
                    │  ✕ unrelated files
Relevant Signals (current file, imports, open tabs, cursor, recent edits)
                    │  ✕ distant history
Compressed & Ranked Context (semantic search + prioritisation)
                    │
Final Prompt (fits the model's context window)
```

Include only what materially improves the response. Semantic search makes "calculate tax" retrieve `compute_gst()`. Keep prompt templates per task (completion, tests, bug fix, refactor, docs, explain) and version them for safe experimentation and rollback. Cache boilerplate, standard algorithms and popular API usage. Manage the window by retrieving only relevant files, chunking intelligently, compressing history and prioritising nearby code.

## Route Models by Task

Routing is the same trade as context collection: spend latency only where it buys accuracy.

| Task | Model |
|---|---|
| Next-word completion | Small, low-latency |
| Multi-line completion | Medium |
| Code explanation | Larger reasoning |
| Bug fixing | Larger reasoning |
| Refactoring | Larger reasoning |
| Architecture questions | Most capable |

## Decompose the Latency Budget

A target only becomes a design when you split it. Allow ~10 ms for the cache check and ~40 ms for context assembly. Give ~200 ms to streamed model inference and ~50 ms to validation. The cheap steps stay cheap, most of the budget goes to inference, and validation runs in the margin.

Scaling to millions of developers keeps the same shape. Run stateless API servers behind load balancers. Shard vector databases across regions and repositories. Autoscale GPU inference clusters to absorb bursty keystroke demand. Stream responses, which lowers perceived latency even when total latency is unchanged. Deploy across regions so inference sits near developers, with static assets on a CDN. Add rate limiting and batching.

## Protect Source Code From the First Question

Source code is the most sensitive asset in the pipeline. Never train foundation models on private enterprise code without explicit consent. Encrypt in transit and at rest. Enforce repository-level access control and respect organisational permissions during retrieval. Mask secrets and credentials before sending context. Support private deployment for regulated industries, and keep audit logs.

| Decision | Pros | Cons |
|---|---|---|
| Small model | Fast, inexpensive | Lower reasoning quality |
| Large model | Better suggestions | Latency and cost |
| Full repository context | Richer understanding | Token usage |
| Retrieved context only | Cheaper, faster | May miss relevant information |
| Cloud inference | Easy to scale | Privacy |
| Local inference | Privacy | Limited by local hardware |

## Prepare the Three Follow-Ups

**"How do we avoid leaking customer code?"** Isolate by tenant and never train on private repositories without permission. Retrieve only what the user may access, mask sensitive information before prompting, and offer private or on-prem deployment with strict access control and audit.

**"How do we get below 300 ms?"** Use a lightweight model for inline completion and stream tokens over persistent IDE connections. Cache embeddings and frequent completions, and index in the background. Run inference near users, limit retrieved context, and use speculative decoding where supported.

**"How do we personalise?"** Learn coding style and prioritise project-specific APIs. Feed accepted and rejected suggestions back, respect repository standards and lint rules, and tailor prompts to developer and team preferences. Keep raw source protected throughout, and refine retrieval on feedback.

## Worked Example: Completing `calculate_total`

A developer types `def calculate_total(items):` in a repository that already has a tax helper. The cache check takes about 10 ms and misses, because this file is new. Context assembly takes about 40 ms. It keeps the current file, its imports and the open tabs, and drops unrelated files. Semantic search over the repository index surfaces the existing `compute_gst()` helper.

The task is a multi-line completion, so the router picks the medium model. Inference streams in roughly 200 ms, and the first tokens appear sooner. Validation spends about 50 ms parsing the code and confirming that `compute_gst()` really exists. The suggestion reuses the helper instead of writing a second tax function.

Each piece of the design paid for itself in one keystroke. The funnel found the helper, the router avoided the large model, and validation guarded against an invented API.

---

## Key Takeaways

- "Instant" plus "whole repository" makes this a context-engineering problem with a < 300 ms budget.
- Check the semantic cache first; a hit skips embedding, retrieval and often the large model.
- Collect only relevant signals, retrieve similar code, build the prompt, route, generate, then validate before streaming.
- Context engineering is a funnel from millions of tokens down to a prompt that fits the window.
- Route small models to completions and larger reasoning models to explanation, bug fixing, refactoring and architecture.
- Split the budget into ~10 ms cache, ~40 ms context, ~200 ms streamed inference and ~50 ms validation.
- Treat source code as the most sensitive asset: no training without consent, permission-aware retrieval, secret masking and private deployment.
- Have answers ready on code leakage, getting under 300 ms, and personalisation.

## Check Yourself

1. **Why is the semantic cache placed before embedding and retrieval?**
   The common case is a completion already effectively seen. A hit there skips embedding, retrieval and often the large model, which is how the design stays fast.

2. **Decompose the 300 ms budget.**
   About 10 ms cache check, 40 ms context assembly, 200 ms streamed inference and 50 ms validation.

3. **Why does output validation check for hallucinated APIs?**
   The model produces plausible code, not verified code. A call to a function that does not exist would compile in the developer's head and fail in their build.

## References

**Sources:** `02_System_Design_Case_Studies/Classic_Design_Walkthroughs/Handbook_Casebook/03_Coding_Assistant.md`: "The prompt", Steps 1 to 5 (problem space; cache first, retrieve on a miss, route by task; the request flow; context engineering and model routing; scaling under 300 ms), "Security", "Trade-offs", "Follow-ups to have ready" and "Summary".
