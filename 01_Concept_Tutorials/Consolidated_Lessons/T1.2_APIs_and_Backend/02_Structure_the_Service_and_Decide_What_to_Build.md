# Structure the Service and Decide What to Build

*Clean layers and a single codebase keep a service easy to change, while every extra service or home-built component adds work that the customer never asked for.*

◷ 5 min

Most AI backends do not need microservices or home-grown infrastructure. Give each layer one job, create shared clients once, and spend engineering time only on what is specific to the customer; [Keep the Request Path Free](01_Keep_the_Request_Path_Free.md) covers what runs where at request time.

**Objectives:**

- lay out the layers of a FastAPI service and say what each one owns;
- wire expensive clients through a lifespan handler and dependency functions;
- decide when to split a modular monolith, and apply the build-or-buy question.

---

## Give Each Layer One Job

A layered architecture splits the service by responsibility. Each layer has one job.

| Layer | Its job |
|---|---|
| `api/routes` | Thin, HTTP-only handlers built with `APIRouter`: validate, delegate, return |
| `services` | The real logic, such as an LLM service or a RAG service that searches, builds a prompt and generates |
| `prompts` | Prompt templates plus a `PromptBuilder` |
| `models/schemas` | Pydantic request and response shapes |
| `core` | Configuration and dependencies |

The payoff is independent change. Swap the LLM provider without touching routes. Edit prompts without touching logic. Test each layer on its own.

## Create Expensive Clients Once and Inject Them

An LLM client, an embedding client, a vector store such as Qdrant and a database pool are all costly to build. Create them once at startup in FastAPI's `lifespan` handler, and clean them up on shutdown.

Then write small dependency functions, such as `get_llm_client` and `get_vector_store`, and attach them to endpoints with `Depends()`. An endpoint never constructs its own client; it asks for one. That is loose coupling. In tests, inject mocks. To swap the vector store, change one function.

## Start as a Modular Monolith

Begin with one codebase organised into modules: retrieval, generation and ingestion, each with its own router, service and models. Modules talk through clean interfaces, never through each other's databases. Most teams should stop here.

Split into microservices only when one of three pains appears: teams block each other's deploys, one part needs very different scaling, or technology needs differ. The common split points follow those pains. The ingestion service is slow and CPU-heavy. The query service needs low latency and many instances. An LLM proxy service centralises rate limiting and cost tracking. Microservices add operational complexity, so use them only when the monolith hurts more.

> **Warning: splitting early buys complexity, not speed.** Every microservice adds deployment, networking and monitoring work. Split a module out only when a named pain, such as blocked deploys or divergent scaling, already costs more.

## Buy the Undifferentiated Layers, Build the Customer's Logic

One question decides build versus buy: does this component encode something specific to this customer's business?

| Layer | Default | Build only when |
|---|---|---|
| Identity and login | The customer's own identity provider | Never; it is a solved problem someone else owns |
| Secrets storage | A managed vault | Almost never; home-built security infrastructure is a red flag |
| Search or vector index | A managed search product | Self-host only at very large scale, or when data cannot legally leave an environment |
| Monitoring | An existing, standards-compatible platform | A thin custom layer for missing domain fields, on top rather than instead |
| Permission rules, retrieval tuning, prompt design, business workflows | — | Always build; nothing off the shelf encodes this customer's data, policy and process |

The line is neither "build everything to prove capability" nor "buy everything to move fast". Identity, secrets and search are vendor problems. Permission logic, retrieval tuning and workflow behaviour exist only because of who the customer is. That is where engineering time belongs.

## Worked Example: Growing a RAG Service

A team starts a RAG service as a modular monolith with three modules. Each has a thin router, a service and Pydantic schemas. The lifespan handler builds the LLM client, the Qdrant client and the database pool once, and every route receives them through `Depends()`.

They log in through the customer's identity provider, keep keys in a managed vault, and use a managed vector index. Their own code is the permission rules, the retrieval tuning and the prompts.

Six months in, document ingestion has grown slow and CPU-heavy, and it competes with low-latency queries. That is a real scaling difference, so ingestion becomes its own service. Query stays put. Because modules only ever spoke through interfaces, the split moves code rather than rewriting it. The structure made the one justified split cheap, and the build-or-buy line kept the team's time on what only it could write.

---

## Key Takeaways

- Split the service into routes, services, prompts, schemas and core, so each can change and be tested alone.
- Build expensive clients once in `lifespan` and hand them to endpoints with `Depends()`.
- Start as a modular monolith; split out ingestion, query or an LLM proxy only for blocked deploys, divergent scaling or different technology.
- Buy identity, secrets, search and monitoring; always build the permission rules, retrieval tuning, prompts and workflows.

## Check Yourself

1. **Where does a prompt template live, and what does that buy you?**
   In the `prompts` layer, with a `PromptBuilder`. Prompts can change without touching service logic or routes.

2. **Name three signals that justify splitting a monolith into microservices.**
   Teams block each other on deploys, one part needs very different scaling, or technology needs differ.

3. **Apply the build-or-buy question to a vector index and to a permission policy.**
   A vector index encodes nothing customer-specific, so buy a managed one unless scale or data-residency law forces self-hosting. A permission policy exists only because of this customer, so build it.

## References

**Sources:** `Module_10_Backend_FastAPI_Deployment.md` (GenAI Engineering Modules): FastAPI Architecture, "How do I wire up embeddings, vector search and the LLM with dependency injection?", "How do I separate routes, business logic and prompts?" and "How do I break up a big service into modules or microservices?". `03_Caching_Streaming_CICD_BuildVsBuy.md` (FDE Handbook, Cross-Cutting Concerns): §7 "Build vs buy — the one question".
