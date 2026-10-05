# Monoliths, Microservices, and the Evolution Model

*A monolith buys simplicity and speed at the cost of shared fate, while microservices buy independence at the cost of a network between every part.*

◷ 8 min

"Monolith or microservices?" is not a loyalty test; it is a sequencing question. Start as a modular monolith and extract a service only when a named pressure justifies it, the same restraint the simplicity principle asks for in [Design Principles as Tie-Breakers](/learn/ai-systems-design/design-framework/design-principles-as-tie-breakers).

**Objectives:**

- list what a monolith gives for free and what it costs as it grows;
- list what microservices buy and the infrastructure they demand;
- apply the same trade-off to an AI platform and name the pressures that justify extracting a service.

---

## Weigh What Togetherness Gives a Monolith

A monolith is the whole application built, deployed and scaled as one unit. Every capability is a module inside one boundary, usually backed by one shared database and shipped as one artefact.

```
Monolithic Application
+----------------------------------------------------+
| Authentication          Product Catalog             |
| Shopping Cart           Payment                      |
| Inventory               Order Management             |
| Notification            Reporting                    |
+----------------------------------------------------+
                          |
                   Single Database
```

There is no network hop between modules. A request moves from module to module as a plain function call, and the whole thing scales, deploys and fails together. That togetherness has four benefits. Development is simple: one project, with controller, service, repository and database all in-process. Deployment is one build with nothing to coordinate. Debugging follows one process, so a debugger traces login, cart, payment and order without crossing a service boundary. Performance is better because a function call costs microseconds and a REST call between services costs milliseconds.

## Count What a Monolith Costs as It Grows

The same togetherness turns into four costs. Scaling is coarse: if only Payment is overloaded, everything still has to scale. The codebase grows large, and as a team goes from 10 to 100 to 1,000 developers, merge conflicts multiply and build and test times climb. Failure is shared, so a memory leak in one module crashes the whole application. Releases slow down, because changing a notification template can mean redeploying everything.

## Weigh What Independence Gives Microservices

Microservices are independent services, each owning one business capability: its logic and its data. They meet the outside world through a shared API gateway and talk to each other over REST, gRPC, messaging or events.

```
                              API Gateway
                                   |
   -----------------------------------------------------------------
   |         |         |          |          |            |
  Auth    Product     Cart     Payment     Orders     Notification
 Service  Service    Service   Service     Service      Service
   |         |         |          |          |            |
   DB        DB        DB         DB         DB           DB
```

Independence buys five things. Payment can run five instances while Product stays as it was. Search can ship without redeploying Authentication or Orders. Payments, Orders, Search, AI and Platform teams can each own a service and a release schedule. When Notification fails, Payments, Orders and Search keep running. Each service can also pick its own technology, such as Java for authentication, Python for search and the AI agent, Go for recommendation and C# for billing.

## Count the Infrastructure Independence Demands

Independence puts a network between every pair of parts, and a network fails in ways a function call never does. Distributed transactions appear: if Shipping fails after Payment succeeded, compensation logic is needed, which is the saga pattern. Data consistency gets harder, because each service owns its database and a cross-service join is no longer a query.

Debugging changes too. One request travels user, gateway, auth, order, payment and notification, so distributed tracing becomes essential. Finally, operations grow. Service discovery, a gateway, load balancing, observability, tracing, circuit breakers, retries and rate limiting are all infrastructure the monolith never asked for.

| Aspect | Monolith | Microservices |
|---|---|---|
| Deployment | Single | Independent |
| Scaling | Entire application | Individual services |
| Codebase | One large | Multiple smaller |
| Database | Usually shared | Per service |
| Communication | Function calls | REST, gRPC, messaging |
| Fault isolation | Lower | Higher |
| Development speed (small teams) | Faster | Slower, initially |
| Operational complexity | Lower | Higher |
| Best for | Startups, MVPs, small products | Large enterprise systems |

> **Warning: microservices are not a default.** Splitting early buys network failures, sagas and tracing before any team or scaling pressure needs independence. Choose a monolith when speed and simplicity matter more: an MVP, fewer than 10–15 developers, fast-changing requirements and modest scale.

## Apply the Same Trade-off to an AI Platform

The trade-off repeats one layer up. A monolithic AI assistant packs authentication, prompt building, RAG, embeddings, vector search, LLM calls, tool calls and logging into one process. That suits a proof of concept, an internal chatbot, a small team and limited scale.

```
Monolithic AI Assistant                    Microservices AI Platform
+------------------------------+                    API Gateway
| Authentication                |                        |
| Prompt Builder                |     -----------------------------------------
| RAG                           |     |        |        |         |          |
| Embedding Generation          |   Auth   Prompt    Agent     Model     Observability
| Vector Search                 |         Mgmt       Orch.    Gateway
| LLM Calls                     |                       |
| Tool Calls                    |          -----------------------------
| Logging                       |          |        |         |        |
+------------------------------+        RAG     Embedding    Tool    Memory
                                        Service   Service   Service  Service
                                                     |
                                             Vector Database
```

A microservices AI platform lets prompt management, agent orchestration, the model gateway and observability evolve independently. Its orchestrator calls RAG, embedding, tool and memory services that share one vector database, each possibly owned by a different team.

The three project designs behind this handbook's whiteboard scripts are each a modular monolith. Each is one Python package with clean module boundaries such as `authz/`, `ingest/`, `retrieval/` and `graph/`, with no network hops between them. Each also says which boundaries would become services first at scale. That is the honest shape for what they are.

## Extract Services When a Named Pressure Arrives

Choose microservices when independence matters more than simplicity. That means modules with different scaling needs, several teams that must work independently, independent deployment that matters, required fault isolation, or a system that has outgrown one codebase.

The two shapes are stages, not a one-time choice. Most real systems move from one towards the other as specific pressures build. Traffic grows unevenly across modules, the team splits into squads, and release cadence starts to matter more than raw simplicity.

```
 Modular Monolith  ── extract clear business boundaries ──►  Microservices
 MVP · small team          (Payments · Search · AI)          Multiple teams
 < 15 devs                    as they emerge                 independent scale

        growing traffic · growing team size · growing need for independent releases →
```

Start as a modular monolith: boundaries already clean, just not yet behind a network. Extract a service only when a concrete pressure justifies it. Payments may need independent compliance controls. Search may need its own scaling curve. The AI team may need to ship without waiting on everyone else's release train.

## Worked Example: Answering "Which Would You Choose?"

The interviewer asks which architecture suits a new AI assistant product. A loyalty answer picks a side. A sequencing answer sounds like this:

> *"I don't view monoliths and microservices as competing approaches — they're stages in a system's evolution. For a new product I'd start with a well-structured modular monolith because it minimises operational complexity and enables rapid iteration. As the product matures, traffic grows and teams expand, I'd identify clear business boundaries — Payments, Search, AI — and gradually extract them into microservices. That avoids premature complexity while keeping a path to independent scaling and deployment when the business justifies it."*

The answer names the starting shape, the pressures that would change it and the first boundaries to extract. That shows judgement rather than an assumption that microservices are always better.

---

## Key Takeaways

- A monolith gives simple development, easy deployment, easy debugging and in-process speed.
- It costs coarse scaling, a growing codebase, shared failure and slow releases.
- Microservices give independent scaling, deployment, team ownership, fault isolation and technology choice.
- They demand network handling, sagas, per-service data, distributed tracing and a stack of operational infrastructure.
- The same trade-off applies to AI platforms; a modular monolith is the honest shape for a prototype.
- Treat the choice as a sequence: start modular and extract on named pressure.

## Check Yourself

1. **Name four things a monolith gives for free and four it costs at scale.**
   Free: simple development, easy deployment, easy debugging, function-call speed. Costs: whole-application scaling, a large codebase, a single point of failure, slow releases.

2. **What is a modular monolith, and why start there?**
   One deployable with clean internal boundaries that are not yet network boundaries. It keeps operations simple while leaving a clear path to extract services later.

3. **Give three pressures that justify extracting a specific service.**
   Payments needs independent compliance controls; Search needs its own scaling curve; the AI team needs to ship without waiting on a shared release train.

## References

**Sources:** `01_Concept_Tutorials/FDE_Handbook/02_System_Design_Fundamentals/03_Monolith_vs_Microservices.md`: "Why this matters", "Monolithic architecture", "Microservices architecture", "Side by side", "The same trade-off in an AI system", "When to choose which", "The evolution model" and "Interview lens".
