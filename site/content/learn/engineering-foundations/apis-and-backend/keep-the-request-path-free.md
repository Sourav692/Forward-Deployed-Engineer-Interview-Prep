# Keep the Request Path Free

*An API that waits well can serve thousands of model calls at once, but one blocking call inside it stalls every request on the server.*

A FastAPI service in front of a model spends most of its time waiting, not computing. Decide where each kind of work runs before writing the first endpoint, then read [Structure the Service and Decide What to Build](/learn/engineering-foundations/apis-and-backend/structure-the-service-and-decide-what-to-build) for how the pieces fit together.

**Objectives:**

- choose between `async def` and plain `def` for an endpoint;
- say where self-hosted inference should run, and why not inside the API;
- move a minutes-long job out of the request and report its progress.

---

## Ask Where the Model Runs

The right shape for a model-backed endpoint depends on one question: is the model hosted by a provider, or by the team itself?

With an external LLM API such as OpenAI or Anthropic, the work is waiting on the network. That is called I/O-bound work. Use async endpoints with an async HTTP client such as `httpx.AsyncClient`. Never call a blocking library such as `requests` inside an async endpoint.

A self-hosted model is different. Its work is heavy CPU or GPU compute. Run it inside FastAPI and it blocks the event loop, the single scheduler that lets one process juggle many waiting requests. Move that compute out instead: to a separate inference service, to task-queue workers (Celery, Ray or Kafka consumers), or to a model server such as vLLM, TGI or Triton called over HTTP. The typical shape is an API layer, then an inference server, then GPU worker nodes.

## Match Async and Sync to the Work

Make an endpoint `async def` when it waits on I/O: LLM calls, database queries, vector search, HTTP calls and file reads. While one request waits, FastAPI serves the others.

Keep an endpoint a plain `def` when its work is CPU-only, or when it uses a library that cannot be awaited. FastAPI runs those in a thread pool automatically.

The dangerous case is the mixture. An event loop cannot serve anyone while one request holds it. Calling blocking code, such as `time.sleep()` or a synchronous database driver, inside `async def` therefore freezes the whole loop. That is worse than a plain sync endpoint. The rule of thumb: if the libraries have async versions, go async everywhere; if not, use sync endpoints.

> **Warning: one blocking call in an async endpoint stalls every request.** A sync database driver inside `async def` does not slow one user down. It stops the event loop, and every other request on that process waits behind it.

## Cap How Hard You Push the Upstream

Async makes it easy to fire many model calls at once. Neither the provider nor a self-hosted model server can absorb unlimited load. Put a semaphore or a rate limiter in front of the upstream so concurrency stays within what it can absorb. [Protect the Endpoint From Abuse and Cost](/learn/engineering-foundations/apis-and-backend/protect-the-endpoint-from-abuse-and-cost) extends this cap across many API instances.

## Hand Long Jobs to a Task Queue

Some work takes minutes: indexing a batch of documents, for example. FastAPI's built-in `BackgroundTasks` is only for very short jobs, such as sending an email after replying. For anything longer, use a real task queue such as Celery, with Redis as the broker, or ARQ.

The pattern has two endpoints. The first submits the job and returns at once with a `job_id` and a status URL. The second reports the job's state (PENDING, PROGRESS, SUCCESS) and its progress steps, such as parsing, embedding and indexing. The worker retries automatically on failure, for example three times.

## Worked Example: A Document Question-Answering Service

A team builds a service that answers questions over uploaded PDFs, using an external LLM.

The question endpoint is `async def`. It awaits the vector search and then the LLM call through `httpx.AsyncClient`. While one question waits on the provider, the same process serves dozens more. A semaphore keeps the number of in-flight LLM calls under the provider's limit.

The upload endpoint does not index the PDF itself. It submits a Celery job and returns a `job_id`. The client polls the status endpoint and watches the job move through parsing, embedding and indexing. If embedding fails, the worker retries.

Later the team swaps in a self-hosted model. The question endpoint barely changes: it now calls a vLLM server over HTTP instead of the provider. The GPU work never enters the API process. Every request path stays free because every slow thing either awaits or lives somewhere else.

---

## Key Takeaways

- Decide first whether the model is external (I/O-bound) or self-hosted (compute-bound), because that sets the endpoint's shape.
- Use `async def` for I/O and plain `def` for CPU-only or unawaitable work; never put blocking calls inside `async def`.
- Self-hosted inference belongs in a model server, inference service or queue workers, never in the API process.
- Cap concurrency to the upstream with a semaphore or rate limiter.
- Jobs that take minutes go to a task queue, with a `job_id`, a status endpoint and automatic retries.

## Check Yourself

<details>
<summary>1. An endpoint calls OpenAI and then writes to a database using a synchronous driver. It is declared <code>async def</code>. What goes wrong?</summary>

The sync driver blocks the event loop, so every other request on the process waits. Use an async driver, or make the endpoint a plain `def` so FastAPI runs it in a thread pool.

</details>

<details>
<summary>2. Why should a self-hosted model not run inside the FastAPI process?</summary>

Its CPU or GPU compute would block the event loop. Run it in a model server such as vLLM, TGI or Triton, an inference service, or queue workers, and call it over HTTP.

</details>

<details>
<summary>3. A request triggers ten minutes of indexing. What does the API return?</summary>

A `job_id` and a status URL, immediately. A second endpoint reports PENDING, PROGRESS or SUCCESS with progress steps, and the queue worker retries on failure.

</details>

