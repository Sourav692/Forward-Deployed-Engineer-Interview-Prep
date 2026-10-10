# Design Principles as Tie-Breakers

*Principles justify decisions only when they are applied in the moment; recited as a list, they justify nothing.*

◷ 7 min

The framework says what to cover; principles decide what to choose inside each part. Learn the fifteen through their AI-system applications, then narrate them inside the decisions made while walking [The Twelve-Part Design Framework](/learn/ai-systems-design/design-framework/the-twelve-part-design-framework).

**Objectives:**

- give the AI-system application of each of the fifteen principles;
- hold the principles in memory with the SCALED mnemonic and its outer ring;
- narrate a decision so the principle is implicit, and work the eight evaluation lenses in order.

---

## Apply Each Principle to an AI System

A generic principle is not what an interviewer listens for; the applied version is. Each row below pairs a principle with the AI-system decision it justifies.

| # | Principle | Applied to an AI system |
|---|---|---|
| 1 | Simplicity | Start with a single-agent RAG pipeline before any multi-agent architecture |
| 2 | Separation of concerns | Ingestion, embedding, retrieval and generation as independent services |
| 3 | Loose coupling | The embedding service does not depend on the LLM service |
| 4 | High cohesion | All prompt templates and prompt management in one module |
| 5 | Scalability | Scale vector search independently of LLM inference |
| 6 | Reliability | Retry transient LLM failures; fall back to a secondary model |
| 7 | Fault tolerance | If reranking fails, return the retrieved documents instead of failing |
| 8 | Availability | Inference endpoints across multiple regions |
| 9 | Performance | Cache embeddings and frequent answers |
| 10 | Security by design | Encrypt vector stores, authenticate APIs, redact before prompting |
| 11 | Observability | Track retrieval precision, tokens, latency, hallucination rate and model errors |
| 12 | Extensibility | One interface that swaps model providers with minimal change |
| 13 | Cost optimisation | A small model for routing, a large one only for complex requests |
| 14 | Data consistency | Refresh embeddings when sources change; version the index |
| 15 | Maintainability | Modular services, clear APIs, automated tests, infrastructure as code |

## Earn Complexity, and Keep Parts Apart

The first four principles shape structure. Simplicity says complexity must be earned by a real requirement. A single-agent RAG pipeline is easier to reason about, test and debug than an orchestrator not yet needed. It also gives a clean baseline to point back to when someone asks why a component exists. This is the principle that argues against multi-agent architectures as a starting point.

Separation of concerns lets ingestion, embedding, retrieval and generation be scaled, tested or redeployed alone. It also isolates failure: an embedding outage need not take down generation if the two were never coupled. Loose coupling goes one step further. The embedding service should not know which LLM provider is called, and the LLM service should not care how embeddings were made. That independence lets either side be replaced without a coordinated rewrite.

High cohesion keeps together what changes together. Scattered prompt templates turn one prompt change into a multi-file hunt. Keep templates, versioning and injection logic in one place to look and one place to test.

## Scale, Recover, and Degrade by Design

Scalability means scaling parts by their own profile. Vector search is bound by I/O and index size; inference is bound by compute. Bundle them into one scaling unit and one gets over-provisioned to satisfy the other.

Reliability plans for the timeouts and malformed responses every production LLM call eventually produces. Retries with backoff handle transient failures, and a secondary model takes over when the primary is down. Fault tolerance is its companion: a failure in a non-critical stage should not fail the request. If reranking fails, the raw retrieved documents are degraded but usable, which beats an error.

Availability is expressed in nines and bought with redundancy. Inference endpoints in several regions mean one region's outage, maintenance window or capacity crunch does not take the service offline.

## Spend Less, Protect Early, and Watch Closely

Performance and cost are usually the same lever. Every recomputed embedding and every FAQ answered from scratch is latency and money spent for nothing. Caching turns the expensive path into the exception. Routing simple lookups to a small model and reserving the large one for complex requests can cut inference spend by an order of magnitude with little quality loss on the easy cases.

Security by design is cheaper than security retrofitted. Adding it after launch means auditing every place a document or prompt has already touched. Building it in means sensitive data never has a window of exposure.

Observability matters more for LLM systems because they fail in new ways. A technically successful call can hallucinate, and retrieval can quietly return the wrong documents. Tracking retrieval precision, tokens, latency, hallucination rate and model errors turns "the answers feel worse lately" into a specific, fixable regression.

## Plan for Change

The last three principles assume the system will change. Extensibility matters because this quarter's best model is rarely next quarter's. An interface that swaps providers by configuration avoids lock-in to a decision made under different constraints.

Data consistency guards against a subtle, silent failure. An embedding that no longer matches its source makes the system retrieve and answer confidently from stale content. Refresh embeddings on source change and version the vector index. Maintainability accepts that the system shipped is rarely the one running a year later. Modular services, clear APIs, automated tests and infrastructure as code make the next change safe instead of risky.

> **Warning: reciting principles scores nothing.** A list of fifteen names sounds rehearsed and justifies no decision. Use a principle only as the reason for a specific choice, at the moment that choice is made.

## Hold Fifteen Principles With SCALED

Fifteen items is too many to hold mid-conversation. SCALED compresses the six core design goals into six letters: Simplicity, Cohesion and coupling, Availability, Latency (performance), Extensibility, and Durability and data consistency.

The remaining concerns are not a seventh spoke. Security, observability, reliability, cost and maintainability form an outer ring that applies to every one of the six. Treating them as a lens on each spoke, rather than a separate category, is what keeps them from being forgotten.

## Narrate Decisions, Not Principles

A strong candidate narrates decisions and leaves the principle implicit in the reasoning. For "design an AI-powered customer support chatbot", each line below carries one principle without naming it.

| Principle | What it sounds like |
|---|---|
| Simplicity | "I'll start with a single-agent RAG architecture because it meets the current requirements." |
| Scalability | "The retrieval service and the inference layer will scale independently." |
| Reliability | "If the primary LLM is unavailable, requests fail over to a backup model." |
| Performance | "I'll cache frequent responses and reuse embeddings to reduce latency." |
| Security | "Sensitive customer data is masked before it enters any prompt." |
| Observability | "I'll monitor latency, retrieval quality, token usage and hallucination rate." |
| Cost | "Simple queries use a smaller model; complex ones route to a more capable one." |

When evaluating any design, work eight lenses in order: requirements, architecture, scalability, reliability, performance, security, observability, and cost and evolution. The fixed order is what makes an answer sound structured rather than improvised.

## Worked Example: Choosing Between Two Working Designs

Two designs for the support chatbot both meet the requirements. In the first, the embedding code calls the LLM provider's SDK directly. In the second, embedding and generation are separate services behind their own interfaces.

"I chose the second" is a guess. "I chose the second because it keeps the embedding service decoupled from the model provider, which we will want when we switch vendors" is a decision with a reason. The principle, loose coupling, is never named. It is the reason.

That is the job of a principle in a design round. It is a tie-breaker that can be named when two designs both work.

---

## Key Takeaways

- Each principle is tested through its AI application, not its generic slogan.
- Simplicity, separation, loose coupling and cohesion shape structure; simplicity argues against starting multi-agent.
- Scale components by their own profile, plan for LLM failures and degrade non-critical stages.
- Caching and routing cut latency and cost together; security is cheaper built in; observability catches failures unique to LLMs.
- Extensibility, data consistency and maintainability assume the system will change.
- SCALED holds six goals, with security, observability, reliability, cost and maintainability as a ring around all six.
- Narrate decisions so the principle is implicit, and evaluate designs through eight lenses in a fixed order.

## Check Yourself

1. **Which principle argues against a multi-agent architecture as a starting point, and why?**
   Simplicity. Complexity must be earned by a requirement, and a single agent is easier to test and debug and gives a clean baseline.

2. **Why are security, observability, reliability, cost and maintainability not a seventh SCALED spoke?**
   They apply to every one of the six goals. They form an outer ring, a lens applied to each spoke.

3. **Give the fault-tolerance application for a RAG pipeline.**
   If reranking fails, return the retrieved documents in their original order instead of failing the whole request.

