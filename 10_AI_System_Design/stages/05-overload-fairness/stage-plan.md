# Stage 5 Plan: Handle Overload and Fair Scheduling

Start from the actual Stage 4 snapshot/state and ADR-004. Retain ready app replicas/shared authority, immutable-cache/live-policy safety, authorised retrieval, durable jobs and epoch fencing, operation keys, model boundaries, and saved history. Tenant A's automated supplier workflow now floods a shared model budget used by Tenants B and C.

First-teach 5.1 admission/rate limits D3, 5.2 queueing D2, 5.3 backpressure D3, 5.4 fair scheduling D2, and 5.5 AI workload management D3. Revisit 4.1/4.2 from Stage 2, 6.2/12.1 from Stage 4 through changed overload constraints; avoid wholesale retutorials. Keep 7.2 AI gateway/provider management (Stage 9, D3) contextual and 9.3 inference optimisation (Stage 9, D1) deferred.

Add admission-controller, token/request/concurrency budgets, bounded per-tenant queues, weighted scheduling, explicit deadline/rejection/retry policy, and per-tenant signals. Use a single logical scheduler authority in the design; the executable admission gate uses SQLite transactions. Its durable worker integration uses actual Stage 2 Jobs; the browser model is a deterministic finite burst with equal one-second jobs and fixed slots, not a distributed GPU scheduler.

Five controls vary policy, Tenant A burst, fixed provider slots, unsafe fresh-key retry copies, and deadline. Compare FIFO, strict priority, RR, and WRR 2:1:1 with a 12-job/tenant queue cap. Track admitted/rejected/expired work, served counts, peak queue, and queue timeline without creating provider capacity. Separate the fluid arrival/service equations from finite-burst simulation.

Outcomes: reject before provider call when budgets do not fit; bound tokens/requests/concurrency atomically; deduplicate an operation; show noisy-neighbour and starvation cases; expire old work; never auto-retry unknown external effects; preserve zero extra capacity across scheduling policy changes. Include runnable Python tests, independent JS vectors, branchable walkthrough, two checkpoints, four Staff drills, snapshots/ADR and clean package. Estimated integrated study: seven to nine hours. Stop after Stage 5.
