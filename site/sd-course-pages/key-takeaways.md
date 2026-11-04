## 00_enterprise_overview/01_understand_the_problem.md

- A tenant is one customer organisation with its own users, policy, data, budget and approved processing regions. Shared infrastructure must never expose one user's private history or restricted evidence to another user or tenant.
- Drafting from supplied text, answering from enterprise policy and preparing a long document are three paths with different completion contracts. They need supplied text, current authorised evidence and durable background execution respectively.
- The planning targets come from separate teaching workloads, not one deployment's measurements. The pilot assumes 200 requests per eight-hour day, a brief 0.5 requests/second peak and a healthy p95 below five seconds.
- RPO bounds the acceptable data-loss window and RTO bounds the restoration interval. A regional switch is complete only when permitted customer work can succeed, not when a route changes.

## 00_enterprise_overview/02_learn_and_design.md

- The target architecture joins four paths, namely customer requests, document ingestion, quality and model changes, and platform and regional control. Each box is a logical responsibility first, so several roles can share one application and durable jobs can start on a database-backed queue.
- Search relevance does not establish permission. Trusted retrieval and current policy must stop restricted content before it reaches the model, because a model instruction cannot repair an unauthorised data transfer.
- Tenants A and B stay in EU cells with an EU recovery target, and Tenant C has a US home. The global placement directory holds no customer content, and an EU secondary becomes a writer only after exclusive ownership and current eligibility are verified.

## 00_enterprise_overview/03_observe_and_experiment.md

- Alice's request passes identity and region checks, bounded admission, retrieval of current permitted versions and an approved model route with a reserved budget. The answer commits before saved success, and with no permitted current evidence the platform refuses a grounded answer.
- A lost response can mean the provider already executed and charged. Inspect the original operation by its stable scoped key, because a new key or another provider duplicates work and cost without resolving the original outcome.
- At 60 requests/second and 1,000 tokens per request, token demand is 3.6 million tokens a minute, and two active seconds per request need about 120 slots. A bigger application fleet cannot fix a provider token quota below that.
- One replica at an assumed 20 requests/second, planned at 70% utilisation, supplies 14, so 60 requests/second needs five replicas. Database, search, request quota, token quota and ready model capacity remain separate bottlenecks.

## 00_enterprise_overview/04_think_like_a_staff_engineer.md

- Self-hosted inference and fine-tuning are conditional paths. Start with an approved hosted adapter and simpler prompt and retrieval changes, and add infrastructure only when a concrete requirement changes the earlier design.
- Configuration and execution stay separate. A control-plane outage can freeze changes while an eligible regional runtime keeps serving, but an unavailable current policy or mandatory audit service still blocks protected disclosure.
- Rolling back to a route that has lost data approval would restore forbidden processing. Re-evaluate current eligibility, then use a permitted alternative or remain unavailable.
- The executable slices are local Python and SQLite exercises. They do not establish a deployed platform, real GPUs, model training, provider processing geography or measured service objectives.

## 00_enterprise_overview/05_validate_and_carry_forward.md

- Alice's complete outcome is a permitted current policy answer, a prepared supplier reply and a committed saved result she can reopen.
- The first build is the smallest saved-draft path, not every target component. Each later pressure earns the next change, such as long work earning durable jobs and one tenant flooding shared capacity earning bounded admission and fair scheduling.
- As the system grows, five things must stay true. They are trusted current access, tenant boundaries, bounded capacity, approved releases and routes, and honest durable outcome reporting.

## 01_mvp/01_understand_the_problem.md

- The smallest useful outcome has four properties. A trusted identity identifies Alice, a server submits approved text to a model, the answer is saved before success is reported, and a later read returns only her own request.
- Commit a `processing` row, call the provider with no database write transaction open, then commit `completed` with the answer. Only then return success, and return a storage error if the final write fails.
- A database transaction cannot include an independent hosted model. A failed final write can leave an answer the provider generated and charged for but the database never recorded, so keep the request ID and do not retry automatically.
- The five-second p95 is a proposed SLO for valid authorised requests from server receipt to final response, with timeouts counted as failures. Track rejection rate separately so fast rejections cannot make latency look healthy.

## 01_mvp/02_learn_and_design.md

- The baseline is one API process with synchronous JSON and SQLite. Gateway, identity and model adapter stay as code boundaries inside one application, because separate services would add network failure paths without helping this workload.
- Derive `(tenant_id, user_id)` from trusted identity, never from the request body or model output, and apply both to every history query. Another tenant's request returns the same `404` as a missing one.
- The unique key `(tenant_id, user_id, request_key)` arbitrates duplicates. The same key and prompt after completion returns `200` with no new model call, a changed prompt returns `409 key_conflict`, and a processing or failed duplicate returns `409` for inspection.
- The deadline hierarchy is provider four seconds, app 4.5, ingress 5.5 and client six. Cancelling a local wait does not prove the provider stopped computing or billing.

## 01_mvp/03_observe_and_experiment.md

- Request rate, concurrency and tokens are different limits. At a 0.5 requests/second peak and 1,500 tokens per request, demand is 45,000 tokens a minute, which uses 90% of an illustrative 50,000 token quota but only 50% of a 60 requests/minute quota.
- Little's law gives about 1.31 requests in flight at 0.5 requests/second and 2.62 seconds each. That is a stable-regime mean, not a safe hard concurrency limit.
- A healthy request sums to 2,620 ms, and a late provider at a 4,000 ms deadline returns `504` at 4,120 ms. A shorter deadline can cut waiting while raising failures, and summing component p95 values does not give end-to-end p95.
- If generation succeeds but the final update fails, the row stays `processing` and the API returns `503`. Keep the row and inspect it, because deleting it and retrying with a new key can repeat charged work and hide the evidence.

## 01_mvp/04_think_like_a_staff_engineer.md

- Each signal points at a boundary. A `401` with no row means identity, a `503` after a provider call with a `processing` row means final storage, and fast server timing with a slow client points at DNS, connection or TLS.
- Record request ID, outcome, elapsed time, provider and database durations and usage, but never bearer tokens or raw prompts and answers. Compare provider attempts with completed commits to find gaps.
- Split a role into its own service only when its workload, team ownership or isolation requirement justifies the operational cost. One application keeps the acknowledgement contract easy to inspect, at the price of a shared failure domain.
- Streaming improves time to first visible text but not total generation and persistence. Tokens sent before the answer commit must be labelled provisional, with a distinct saved-completion event and a history lookup after a disconnect.

## 01_mvp/05_validate_and_carry_forward.md

- The accepted design is a synchronous single-application MVP, a teaching baseline rather than deployment approval. It carries forward the request schema, scoped history, adapter interface, no-automatic-retry rule and commit-before-success contract.
- Durable jobs come next only when a long task blocks interactive requests or must survive a worker crash.
- A shorter provider deadline does not prove a better SLO. It can replace slow completions with failures, so count errors and measure the actual request population.
- The lab cannot prove identity, TLS or hosted-provider behaviour, because those boundaries are simulated or absent. They need separate integration checks before a real pilot.

## 02_distributed_execution/01_understand_the_problem.md

- Document preparation takes an illustrative 20 seconds, which breaks the interactive waiting budget, and in-memory progress dies with the process. Add a durable job path and keep the short drafting API for supplied text.
- Alice should receive a durable job identifier within an illustrative 300 ms. That acceptance latency is not a completion promise.
- Crash position decides recovery. A restart erases an in-process thread, removing a message before saving its result loses the only record, and a crash after saving but before acknowledging lets another worker receive the same job.
- A lease is temporary authority that expires while the old worker may still be alive. At-least-once delivery means repeats happen, so side effects still need protection.

## 02_distributed_execution/02_learn_and_design.md

- `POST /jobs` commits a `queued` row and only then returns `202` with a job ID. `202` means accepted for processing, not finished, and because the queue and job record are the same row there is no gap between saving and publishing.
- `claim(now)` runs `BEGIN IMMEDIATE`, increments the epoch and attempt count, sets a lease and commits. Completion must match job ID, epoch, active state, unexpired lease and deadline, so a paused worker holding an old epoch cannot overwrite newer work.
- Commit the result before acknowledging delivery so redelivery finds the saved completion. An expired lease after an external start becomes `unknown` with no automatic retry, because the epoch fences database writes, not remote calls.
- Trusted code checks each proposed tool against an allowlist, schema, tenant scope, remaining time and a three-step limit. Only `extract`, `validate` and `draft` are allowed, `send_email` is rejected, and a restart resumes from the durable checkpoint.

## 02_distributed_execution/03_observe_and_experiment.md

- At six jobs a minute and 20 seconds each, Little's law gives two jobs in flight. Two workers supply exactly six a minute with no headroom, while three give nine a minute at about 67% utilisation.
- Twelve simultaneous jobs on three workers finish in waves at 20, 40, 60 and 80 seconds, leaving 10 seconds of margin under a 90-second deadline. Return the job identifier and poll with backoff rather than tying the job to a 30-second browser timeout.
- Polling is load too. Five state writes per job give about 0.5 writes a second, but 100 clients polling every second add 100 reads a second, which more generation workers cannot fix.
- A shorter lease speeds recovery but risks false takeovers during pauses. A crash before an external effect allows redelivery once the lease expires, while a crash after the external-start marker leaves the job `unknown`.

## 02_distributed_execution/04_think_like_a_staff_engineer.md

- When the oldest job's age rises, compare arrival and completion rates first. A growing queue with idle workers suggests a claim or configuration failure, while busy workers at a dependency limit need demand control rather than more claimers.
- Fix the poison input or tool bug before replaying a dead job. Keep an unknown job's operation identity and provider evidence instead of deleting the row to make dashboards green.
- `async` overlaps waiting work but does not make a task survive its process. Committing the job before acknowledging acceptance and claiming it with bounded authority addresses lost work, at the cost of more queue state to operate.
- Saved job state and the scoped key stop a repeated delivery from redoing completed work. They cannot prove a separate provider ran once, because a crash after its call but before the commit leaves uncertainty.

## 02_distributed_execution/05_validate_and_carry_forward.md

- `202` establishes only durable acceptance, not completed generation. Keep transactions short so no write lock is held over slow external work.
- Retry is safe only for pure work before any external effect, within bounded attempts and the job deadline. An epoch protects local writes against a stale owner, not external actions.
- Trusted tool policy, step, time and attempt budgets, and persistent state stop an agent loop. Later document ingestion can reuse these durable jobs if it keeps trusted scope, replay-safe writes, job status and uncertainty boundaries.

## 03_enterprise_knowledge/01_understand_the_problem.md

- Copying every supplier document into a search index and feeding the top hits to the model fails three ways. A newer policy may replace the indexed paragraph, a deleted document may stay searchable, and a restricted note may outrank the readable policy.
- Asking the model to hide a restricted paragraph after it receives the text is already too late. The trusted retrieval path decides which text may cross the hosted-model boundary.
- Alice needs a cited answer from the current authorised policy, or an honest refusal when no authorised evidence exists.
- A tombstone records a deletion with its newer version, so a late older event cannot bring the document back. A citation lets a reader inspect the evidence but does not prove the generated claim follows from it.

## 03_enterprise_knowledge/02_learn_and_design.md

- Ingestion makes two promises. Preserve immutable source bytes under a tenant, document and version identity, then publish a visible version only once every required passage is ready. A failure between them leaves an orphan object, never a half-built document.
- A repeated version with the same body is a no-op, and the same identity with different text is a conflict. An older event can never replace a newer published version or tombstone.
- Lexical full-text search (SQLite FTS5 with BM25 ranking) is the baseline because supplier names, identifiers and explicit policy wording matter. Semantic or hybrid retrieval waits until an authorised relevance set shows which lexical misses matter.
- Apply tenant, current-version, deleted-state and reader filters before the result limit, so restricted high-scoring hits cannot fill the final context. A prompt is not an access-control mechanism.

## 03_enterprise_knowledge/03_observe_and_experiment.md

- Search returns ranked candidates, then the context builder rechecks current version, tombstone and readers before any text leaves trusted code. Revoked, deleted or stale evidence is removed, and no remaining evidence means no grounded answer.
- After a tombstone at version 3 commits, a late version-2 upsert may leave an orphan blob but cannot restore the visible pointer or searchable passages.
- At 1,000 documents, 10 chunks each and 500 tokens a chunk, the corpus holds 10,000 chunks and five million chunk tokens. Hypothetical 768-dimension float32 vectors would need about 29.3 MiB raw, before index overhead and replicas.
- Text extraction at 20 seconds a document for 200 changes an hour needs 4,000 worker-seconds an hour, more than one worker's 3,600. Find the bottleneck in each pipeline stage, not only the final model call.

## 03_enterprise_knowledge/04_think_like_a_staff_engineer.md

- Separate "not ingested", "not relevant" and "not allowed" internally, but keep external errors from revealing that a restricted document exists.
- If Alice gets an old policy, inspect the connector cursor, the published version and the final context citation before blaming generation. Never use a stale search copy as the sole authority for immediate revocation.
- Preserving bytes is not publishing. When chunk publication fails, keep the prior visible generation, fail or retry the durable job, and clean up the orphan object later under policy.
- Source IDs give traceability, not entailment. A cited passage can still be irrelevant, stale or misrepresented, so evaluate retrieval separately from grounded answer quality and refuse when no authorised passage exists.

## 03_enterprise_knowledge/05_validate_and_carry_forward.md

- Each tenant, document and version object and its content is immutable. The current publication pointer is not.
- A relevant hit is unusable when it belongs to the wrong tenant, the reader is not allowed, or the document is deleted or no longer the current version. Re-fetch stored text, because a caller can forge a hit body.
- The local fixture does not prove real connector freshness, distributed publication, model faithfulness or physical erasure.
- A cache hit can never grant access. Any caching added for scale must keep the authoritative version and permission checks and citeable source identities.

## 04_application_scaling/01_understand_the_problem.md

- At 25 ms of app CPU a request, one core tops out at an idealised 40 requests a second, so the illustrative 100 requests/second peak cannot fit on it.
- Copying the app and its local database file to four hosts creates four separate histories and duplicate-operation domains. Replicas help only when they share the right authoritative state.
- Caching final answers by question text alone fails because Tenant B can ask Alice's words with different permissions or policy versions. A fast wrong or unauthorised answer is not a successful scale-out.
- A health probe does not prove every dependency can meet its SLO. Autoscaling takes time to start replicas and cannot raise a provider quota.

## 04_application_scaling/02_learn_and_design.md

- Stateless replicas keep durable requests, jobs and source metadata in a shared relational service such as PostgreSQL. Sticky routing can help locality but cannot be the only way Alice finds her history. Avoid casual dual writes during the migration.
- Cache exact passage bytes under `(tenant, document, source version, chunk)` and run the current policy, version and tombstone check before returning cached text. Never cache authentication, permission decisions, ranking or final answers.
- TTL bounds reuse and memory freshness, not authorisation. A one-second-old entry can already be forbidden. If the cache fails, bypass it to the authoritative store, but never use the cache as an access fallback when authority is down.
- Scale-out is a control loop with delay. Readiness keeps cold replicas out of routing, scale-in drains bounded in-flight requests, and baseline headroom covers bursts shorter than the controller's reaction time.

## 04_application_scaling/03_observe_and_experiment.md

- At 25 ms CPU and a 70% utilisation target, a replica plans for 28 RPS. Serving 100 RPS needs `ceil(100 / 28) = 4` replicas, giving 112 planned RPS before database and provider limits.
- With two authoritative checks and four passage fetches a request, a 500-query/second database permits about 83.33 RPS. An 80% passage hit rate cuts reads to 2.8 a request and lifts that to about 178.57 RPS. The trusted checks never shrink with hit rate.
- Planned capacity is the minimum of the app, database and provider budgets in the same units. With the provider at 60 RPS, capacity stays 60 however many replicas run, and extra replicas only add waiting, connections and retries.
- Request counts hide token demand. At 1,500 tokens a request and 100 RPS, demand reaches 150,000 tokens a second, or nine million a minute, before retries.

## 04_application_scaling/04_think_like_a_staff_engineer.md

- Stateless means no replica owns the only copy of session, operation or history state. Losing its expendable cache changes cost or latency, never correctness.
- When p95 rises, find the waiting time before scaling. DB pool waits with low CPU suggest connection contention, provider waits with low CPU suggest dependency capacity, and a miss spike just after scaling may be warmup.
- A high hit rate is not a safety metric, so also count rejected stale or forbidden cache lookups. If authoritative storage fails, return the established error path rather than promote stale cache contents into authority.
- Starting each new replica with its own copy of the SQLite file creates independent authorities for history, keys and worker leases. Migrate with a controlled writer cutover and reconciliation, not casual dual writes.

## 04_application_scaling/05_validate_and_carry_forward.md

- A replica may lose its expendable cache, never the only copy of operation or history state.
- The two authoritative checks are never multiplied by the hit rate, because a content hit does not remove trusted policy or version work.
- TTL bounds how long content is reused, the version identifies the content, and live policy controls access.
- The limiting capacity is the minimum of the compatible app, database, provider and other binding budgets in the same units. Actual database throughput, load balancing, autoscaling and production p95 remain unmeasured.

## 05_overload_fairness/01_understand_the_problem.md

- If a shared path finishes six equal-cost jobs a second but receives ten, backlog grows by four a second. A bigger queue delays the failure without adding service capacity, and long waits trigger client retries that add demand.
- A single global FIFO queue lets one tenant's large burst occupy the whole useful waiting window while smaller tenants miss their deadlines. Overall completion rate can look healthy while B and C get no timely service.
- A token bucket bounds arrivals over time but not long requests still in flight. A concurrency limit bounds simultaneous provider calls but not tokens a minute. Fair scheduling shares existing capacity and creates none.

## 05_overload_fairness/02_learn_and_design.md

- Keep separate budgets for tenant requests, global requests, model tokens and concurrent provider calls. The guard checks them all and records the reservation in one transaction, and only a fresh `accepted` reservation authorises a provider call.
- Reserve known input plus an upper bound on output tokens before generation. Release a concurrency slot only when termination is known, because a local timeout does not prove the provider stopped computing or billing.
- Bound each tenant's queue, expire unstarted work past its deadline and carry one overall deadline through every hop. Retries keep the same operation key and a capped attempt count, with jittered backoff at one controlled layer.
- Weighted round-robin at 2:1:1 gives continuously backlogged tenants 50%, 25% and 25% of dispatches and skips empty queues. Equal job counts are not equal token shares when job sizes vary.

## 05_overload_fairness/03_observe_and_experiment.md

- At 10 arrivals and 6 completions a second, a 12-job buffer fills in about three seconds. Little's law, `L=λW`, relates average count, throughput and time in a stable system but proves nothing about tail latency, fairness or sustained overload.
- Rate, tokens and concurrency each cap throughput on their own. A 10,000-token/s quota at 2,000 tokens a job allows only about five jobs a second, and 12 slots of two-second calls give six.
- Three nested layers each making three attempts can turn one request into `3³=27` downstream attempts. Bound the total attempt budget and keep stable operation keys.
- In the noisy-tenant lab, three slots and a four-second deadline allow at most 12 completions under any policy. FIFO gives A all 12, WRR gives 6/3/3, and only adding slots raises the total.

## 05_overload_fairness/04_think_like_a_staff_engineer.md

- Track offered, admitted, rejected, expired and completed counts per tenant and workload class. A healthy global throughput graph can hide B or C receiving zero timely service.
- Request counts hide token cost and slot time, so bound request rate, reserved tokens, simultaneous calls, queued work and the deadline separately. Limits need shared authority, or per-replica counters multiply them.
- Lease expiry fences local completion authority but does not prove the remote model stopped. Keep the unknown reservation and reconcile with provider evidence, because releasing slots early can oversubscribe the provider and duplicate work.
- Inspect the binding resource before changing weights. More replicas cannot alter a fixed provider quota, and stale permission authority is never a degradation strategy.

## 05_overload_fairness/05_validate_and_carry_forward.md

- Weighted round-robin changes how existing eligible service is allocated, not physical provider throughput.
- A finite burst can stop and drain. Persistent arrivals above departures keep growing the backlog unless work is rejected.
- A token estimate is safe only if it covers the allowed input and output envelope under the real provider's counting rules.
- An unknown reservation means external termination is not established, so releasing or retrying it requires reconciliation.

## 06_enterprise_security/01_understand_the_problem.md

- A tenant claim in a header such as `X-Tenant: A` is caller input, not authority. A gateway that forwards it as scope turns a guessed citation into cross-tenant access, and a model instruction cannot undo text already retrieved.
- Revocation is a separate failure. A long-lived token or a cached allow can outlive the policy that removed Alice, so freshness has to be decided before any security product is chosen.
- Returning sensitive text after a failed audit write leaves no durable disclosure record. A security audit is durable metadata about protected source IDs, not a raw prompt dump or an ordinary debug log.
- Authentication, authorisation, delegated capability, data/control separation and security audit are distinct boundaries. A verified signature says who called, while current membership and resource policy say what that account may do now.

## 06_enterprise_security/02_learn_and_design.md

- A decodable token is not a verified identity. Verification pins issuer, expected audience, approved algorithms and key source and checks expiry and not-before, so a token meant for another service fails.
- Tenant and subject come only from verified identity plus authoritative membership, with spoofable headers stripped at the gateway. Before returning context, check membership, policy epoch, action, source version and readers, and deny when authority is missing or older than the simulator's 30-second limit.
- Shared tables with tenant predicates are cheap, but one missing predicate exposes another tenant. Test list, item, search, cache, job status, export and audit paths with a foreign identity, because restore, export and support tools can bypass the request predicate.
- Retrieved text is evidence, never authority, so tool policy stays outside document data and tool calls are checked against allowlists. Private routes and mTLS reduce exposure and identify workloads, but neither authorises a tenant resource.

## 06_enterprise_security/03_observe_and_experiment.md

- Audit must commit before disclosure. That commitment records the decision and protected source references, but it does not prove the model call ran and is not atomic with it.
- Revocation delay adds up across steps. With 20 seconds of source polling lag, five seconds of publication and 30 seconds of snapshot reuse, the worst case can approach 55 seconds, not 30.
- At 100 protected retrievals a second and 400-byte events, raw audit payload is about 3.22 GiB a day and 96.6 GiB over 30 days. Logging full prompts would enlarge both storage and sensitive-data exposure.
- Identity and policy are independent gates. At a policy age of 30 seconds the toy policy expires and a valid signature still gets no context, and audit-before-disclosure makes audit availability part of the route's availability.

## 06_enterprise_security/04_think_like_a_staff_engineer.md

- Measure authentication rejections by bounded reason, retired or unknown key rates, policy observation lag, epoch mismatches, cross-tenant attempts, audit commit failures and denied provider destinations. Protect audit read access so a support operator never inherits a platform-wide dump permission.
- Internally, separate expired identity, missing membership, revoked document and stale policy as denial reasons. Externally, never confirm that another tenant's document exists.
- A valid, unexpired signature does not authorise retrieval for a user removed yesterday. Membership, audience, policy epoch and resource access are checked separately, and stale or missing authority denies instead of promoting a cached allow.
- Private subnets and mTLS do not replace per-resource checks. An allow audit event records a decision at a defined boundary and does not prove the provider processed the request once.

## 06_enterprise_security/05_validate_and_carry_forward.md

- Trusted tenant scope is verified identity plus current membership, never caller headers or model output. An audience limits which service may consume a credential, and that service still needs action and resource scope.
- Policy age and token expiry are tracked separately because a still-valid identity assertion can outlive current access.
- Audit may hold protected identifiers, action, decision and provenance metadata under controlled access. It never holds raw bearer tokens or source bodies.
- Production OIDC, private routes, mTLS, secret storage, row-level security and a global immediate revocation guarantee are not demonstrated by the local fixtures.

## 07_reliability_consistency/01_understand_the_problem.md

- A primary can acknowledge a write that a lagging replica does not yet hold. Reading that copy without a freshness requirement returns "not found" for an answer that is already durable.
- Reissuing generation with a new operation key can charge twice. After a lost response, the client cannot tell from the timeout alone whether the commit happened.
- Recovery rules depend on the data class, not on whether another server can respond. Serving protected context from a stale membership replica turns an availability fallback into an access regression.
- A circuit breaker limits attempts but does not repair the dependency or prove remote cancellation. A transactional outbox commits intent with local state, and its delivery can still repeat.

## 07_reliability_consistency/02_learn_and_design.md

- Consistency is chosen per data class. Membership and permissions need current authority with no stale allow fallback, saved history needs at least the acknowledged version, and search projections may lag behind a current-version gate.
- With asynchronous acknowledgement, losing the primary can strand acknowledged writes. For three voting nodes a majority is two, but a quorum count alone does not give linearizability without epochs, ordering, durable acknowledgement and the read protocol.
- The result and its outbox row commit in one local transaction, which is not exactly-once model execution. A watermark covers only a contiguous applied prefix, so event 2 arriving before event 1 leaves it at zero.
- One remaining deadline spans queue wait, policy, retrieval, provider work and commit, with time reserved for final persistence and audit. Retries stay inside that budget, and the breaker admits one half-open probe after its cooldown.

## 07_reliability_consistency/03_observe_and_experiment.md

- In the illustrative 1,220 ms serial path, a 500 ms queue wait is more than six times the 80 ms retrieval, so tuning an index may miss the dominant delay. Component p95 values cannot be summed into an end-to-end p95.
- A 99.9% success objective allows 1,000 failures per million eligible requests, while a 99.9% time-based objective over 30 days allows 43.2 minutes. A 1% error rate against a 0.1% allowance burns budget ten times too fast.
- Recovery time objective is how long recovery may take, and recovery point objective is how much committed data may be lost. An asynchronous replica can lose unreplicated acknowledged writes on promotion.
- A replica serves saved history only when it covers the acknowledged minimum, and authority reads always use the primary. With 200 ms reserved for required work, 1,000 ms remaining gives an 800 ms allowance and 200 ms gives none.

## 07_reliability_consistency/04_think_like_a_staff_engineer.md

- Classify the symptom first. For a missing saved answer, inspect the primary commit under the same scoped key and compare the acknowledged minimum with the projection watermark, and never regenerate because a lagging replica returned empty.
- Before promoting a primary, fence old writers and assess possible lost commits. A restart is not a runbook, which ends with evidence such as restored authority, a reconciled outbox, no unexpected duplicate effects and a documented customer-impact window.
- Read replicas suit saved history only past the acknowledged minimum version. Membership, permissions, worker ownership and quota reservations keep their authoritative contract.
- Retrying a timed-out call through another provider is a new external attempt that may duplicate work or charges. When latency rises while provider time is unchanged, look first at waits such as tenant queues, pool acquisition and connection setup.

## 07_reliability_consistency/05_validate_and_carry_forward.md

- A saved answer can be missing on a replica because its commit is not yet applied there. Use the trusted minimum version or read the primary.
- The outbox makes the result and local notification intent atomic. It does not make external delivery or model execution atomic.
- A contiguous watermark excludes missing earlier events even when later ones have arrived. A lost response is not proof that no external work happened, so unknown provider state is kept.
- Real consensus, replication, database promotion, restore and production error or latency objectives remain untested.

## 08_evaluation_releases/01_understand_the_problem.md

- A fast, available answer can still apply the wrong rule or answer a foreign tenant's question. Infrastructure health cannot detect those regressions, so changes need versioned evaluation and release decisions.
- A high average can hide a known violation. A candidate that handles five ordinary cases and one refusal correctly but discloses one foreign-tenant case must not pass on its aggregate.
- Score gains from longer prompts, larger output budgets or a different dataset make cost and latency comparisons invalid. A model name alone omits the prompt, retrieval, source and evaluator versions.
- A canary controls exposure but is neither risk-free nor necessarily statistically decisive. Shadow traffic avoids candidate business actions but still costs inference and needs authorised data handling.

## 08_evaluation_releases/02_learn_and_design.md

- A release bundle names the prompt template, retrieval configuration, index generation, model revision, security policy, dataset digest, evaluator and gate-policy version. A mutable alias such as "latest" is not evidence.
- The teaching gate needs at least 95% case correctness, zero known safety violations, fixture p95 at most 2,000 ms and mean cost at most three units. Missing or duplicate cases and mismatched versions fail closed, and the controller accepts only `teaching-gate-v1`.
- Known access or refusal violations block release even when a relaxed aggregate passes. Zero failures across eight authored cases does not prove zero production risk.
- Canary assignment hashes `(tenant, user)` so it stays sticky. Promotion is a compare-and-swap on a durable pointer with an expected generation, so a stale command fails instead of overwriting a newer decision.

## 08_evaluation_releases/03_observe_and_experiment.md

- One wrong normal answer gives `7/8 × 100 = 87.5%` and fails the 95% gate. One foreign-tenant answer gives the same score but stays blocked at an 80% threshold because its safety count is one.
- With one 3,000 ms label among seven 1,000 ms labels, nearest-rank p95 is rank `ceil(0.95×8)=8` and reports 3,000 ms. On so small a set p95 is the maximum, not a latency SLO.
- Splitting 100 live requests a second between canary and stable still makes 100 calls. A 10% independent shadow adds about ten more, giving 110 before retries against the hypothetical 120-RPS provider budget.
- Routing rollback controls future requests only. A committed canary answer keeps its original operation identity and is not erased or rerun with the old model.

## 08_evaluation_releases/04_think_like_a_staff_engineer.md

- Separate infrastructure failure, retrieval miss or staleness, unsupported answer, access violation and cost or latency regression. A changed corpus, evaluator, timeout or refusal population can invalidate an apparent model comparison.
- For a suspected leak, stop affected exposure and keep restricted evidence under incident access controls. Never roll back tenant membership, audit policy or source tombstones to match an old evaluation snapshot.
- Choosing a model at random for every retry mixes versions within one user's experience and confuses attribution. Canaries use a stable experiment unit and log bundle and cohort with each result.
- Withdrawing an active canary keeps the current stable release, while reverting a completed promotion moves to its previous approved version. If that old model is no longer approved for a tenant, refusal may be safer than automatic fallback.

## 08_evaluation_releases/05_validate_and_carry_forward.md

- A report binds the exact bundle, dataset, evaluator and approved gate settings. Slices matter because a global score can hide access, refusal or tenant-specific regressions.
- Synthetic cost and latency values prove only that the deterministic gate logic handles those labels, not real model performance.
- Shadow traffic costs extra authorised inference and data handling, and it can cause side effects unless the execution path is constrained.
- Rollback preserves current safety authority, committed result identity and evidence of unknown external effects.

## 09_inference_gpu/01_understand_the_problem.md

- A required data path, a reproducible model revision, rising time to first token at an unchanged request rate and long contexts filling memory are different reasons to change architecture. Each needs its own evidence.
- Prefill reads the input once and decode produces each next token from prior attention state. The KV cache holds that key/value state and is inference state, never an authorisation or content cache.
- Time to first token (TTFT) and inter-token latency (ITL) measure different things. Good first-token timing does not prove a saved success, and high aggregate throughput can coexist with poor per-user token latency.
- The Model Gateway stays responsible for approved routes. An uncertain hosted call is never replaced with an automatic second call because another GPU or endpoint is free.

## 09_inference_gpu/02_learn_and_design.md

- The gateway binds trusted principal, operation key, source policy, approved bundle and provider profile before dispatch. The serving engine only runs generation, and an unregistered route never becomes a destination from user or model text.
- Validate input plus requested output against the model context and the profile's output maximum, then reserve shared token, request and concurrency budgets before transport. Only a fresh grant permits a new provider attempt.
- A lower per-token price does not justify self-hosting. Weigh quality, tenant policy, burst headroom, operations and actual utilisation, and treat a self-hosted route as a new evaluated bundle rather than an endpoint alias.
- Weight fit is not request fit, because KV state grows with cached tokens and active sequences. A started process is not ready until the intended model revision and supported request envelope are, so route work only then.

## 09_inference_gpu/03_observe_and_experiment.md

- In the worked example, 8 billion FP16 parameters need about 14.90 GiB and each cached token costs 128 KiB of KV per sequence. Eight sequences at 4,096 tokens add 4 GiB, and a 4 GiB reserve brings the total to about 22.90 GiB against 24.
- At 8,192 cached tokens KV reaches 8 GiB and the total about 26.90 GiB, over budget. Four-bit weights shrink weights to about 3.73 GiB but leave KV in FP16, and a "within" result proves no speed or quality.
- With 300 ms of queue and retrieval, 200 ms of prefill and 300 tokens at 30 ms each, the answer takes about 9.5 seconds before persistence. A first token near 500 ms does not establish a five-second saved-answer SLO.
- After a dispatched request times out, the gateway never retries on a spare self-hosted route under a new operation identity. It preserves the unknown outcome and uses a documented reconciliation contract.

## 09_inference_gpu/04_think_like_a_staff_engineer.md

- Record bundle, model and engine identity, queue wait, input and output tokens, TTFT, ITL, total completion and memory occupancy. GPU utilisation without queue, token and phase context is not a serving SLO.
- When TTFT rises, separate admission wait, cold loading, prefill and network setup. When streaming stalls, inspect decode scheduling, active sequences, memory pressure and communication rather than app CPU.
- If a full model and its peak request state fit one device, independent replicas may serve separate work better than tensor parallelism. Sharding adds communication and coordinated readiness, so never divide all memory and latency by the device count.
- Same-key replay after a release change returns the original committed result and bundle, after current access checks on its original evidence. If that access is revoked, deny replay rather than substitute other evidence.

## 09_inference_gpu/05_validate_and_carry_forward.md

- KV memory depends on the K and V count, layers, KV heads, head dimension, bytes per element, total cached tokens and active sequences. Reducing weight bits does not change the cached representation.
- Route work only when the approved model, engine and supported envelope are ready, not merely when a container runs. Drain on replacement without erasing unknown outcomes.
- Another provider is safe after a timeout only under explicitly approved data and behaviour rules with known-outcome or reconciliation semantics.
- Memory and control arithmetic leave actual inference and GPU performance, deployment, tokenisation, network privacy and production cost untested.

## 10_fine_tuning/01_understand_the_problem.md

- The trigger is behaviour, not facts. The approved model produces valid facts in the wrong structure, and any new model must fix that without absorbing restricted supplier documents or bypassing the serving gate.
- The illustrative trial has 10,000 training examples, 1,000 validation examples and 200 test examples frozen before experiments. Production approval needs at least 196/200 schema passes, zero known safety violations and human review of critical escalation cases.
- Try the approved prompt, schema-constrained generation and prompt examples first, and keep retrieval for changing supplier policy and citations. Fine-tune only if repeated behaviour misses survive those cheaper steps, since lower training loss cannot meet the acceptance gate.

## 10_fine_tuning/02_learn_and_design.md

- Prompting changes behaviour without touching the model, retrieval supplies authorised current text, and fine-tuning adjusts parameters. A LoRA adapter learns low-rank updates on a pinned base model but still needs base weights, data handling and serving compatibility checks.
- Model weights cannot implement per-document revocation. Never put confidential supplier facts into a training corpus because the user could retrieve them, since training approval is a separate purpose and scope.
- A dataset version is an immutable manifest, and all examples from one supplier or thread go into one split before freezing. A mutable registry alias is a pointer, not evidence, and approval and deployment are separate states.
- A 199/200 schema score cannot promote a candidate that exposes one restricted supplier name. The known safety violation blocks the gate on its own, and a `202` for a job promises persisted intent, never training or approval.

## 10_fine_tuning/03_observe_and_experiment.md

- At 800 tokens per example, 10,000 examples are 8 million tokens per epoch and 24 million over three epochs. At an assumed 2,000 tokens per second that is about 3.33 hours, or $13.33 at an invented $4 per device-hour, before setup and retries.
- Training memory includes activations, gradients and optimiser state as well as weights, so the inference KV worksheet cannot size a trainer. Reserve training capacity separately from latency-sensitive serving.
- The gate accepts at least 196 schema passes, exactly zero known safety failures and a report bound to the candidate's identity. A safety failure gives `quality gate blocked`, a report for another artefact gives `report identity mismatch`, and the live pointer stays unchanged.
- If a lost worker logged step 200 but only step 100 has a verified checkpoint, recovery restarts from step 100 and may repeat work. Inspect a remote run of unknown status before submitting another billed job.

## 10_fine_tuning/04_think_like_a_staff_engineer.md

- Classify failures before tuning. A stale supplier rule needs current authorised retrieval, formatting may yield to prompts and schema constraints, and only stable residual misses justify a bounded adapter challenger against the frozen baseline.
- Reproducibility means resolving a friendly model name to immutable base, adapter, tokeniser, dataset, recipe, serving, evaluator and test identities. A seed does not prove identical floating-point execution across hardware.
- Real training resume needs compatible code, input position, optimiser, scheduler and random state, not a newer log line. Frequent checkpoints cut recomputation but cost I/O and storage.
- Deleting a dataset row does not erase learned parameters. Trace descendants through lineage, quarantine them, retrain from an approved clean snapshot, and never promise selective forgetting.

## 10_fine_tuning/05_validate_and_carry_forward.md

- A factual supplier-policy error is fixed through current authorised retrieval and source freshness, not by changing model parameters automatically.
- Split by supplier or thread, because near-duplicate examples across splits inflate reported generalisation. A checkpoint is recoverable training state, not a deployable release.
- Even 99% schema success cannot override one known safety failure. After a release rollback, saved operation identity, current access policy, audit requirements and uncertain external outcomes stay unchanged.

## 11_multi_region/01_understand_the_problem.md

- Residency is an approved placement constraint on named data classes and processing. Tenant A and B content, embeddings, prompts, outputs, adapters, logs and backups stay in EU-primary or EU-secondary, and an endpoint's location proves nothing about where a provider processes or logs.
- A healthy US endpoint picked by a global load balancer may break placement, lack the approved adapter, read stale permission or generate a second charged answer. A health check cannot decide those questions.
- The recovery point objective (RPO) bounds how much saved work may be lost, here 60 seconds or less. The recovery time objective (RTO) bounds incident start to validated customer success, here 600 seconds.
- Recovery needs authorised data, current policy, one proven writer and ready model capacity in the allowed geography. The global directory holds only opaque tenant handles and placement revisions, and access checks stay regional.

## 11_multi_region/02_learn_and_design.md

- Each tenant has one home writer cell with a warm same-geography secondary. Every-region writes and synchronous replication of bulk tenant data are rejected, and Tenants A and B have no permitted US failover.
- Writer authority, policy, approvals and deletion tombstones sit in an EU-only authority store on a 2-of-3 quorum. A lease lapses 20 seconds after its last renewal, and each new lease raises the epoch, the fencing token stores use to reject older writes.
- Promotion waits out epoch 7's lease plus a drift margin, takes epoch 8, installs it in every store and confirms each refuses an epoch 7 probe. An unreachable writer is not a fenced writer, and a lost quorum fails closed even past the RTO.
- The EU residency hostname resolves only to EU ingress, where its TLS key lives. Geo-routing on a shared hostname is rejected because user location would decide where A/B content is decrypted, and a 20-second TTL plus a 5-second update fits the 30-second convergence budget.

## 11_multi_region/03_observe_and_experiment.md

- Planned sequential recovery is 360 seconds (detection 60, fencing 30, restore 180, routing 30, validation 60) against the 600-second RTO. A 600-second model load makes it 780 seconds and misses the objective.
- Bound copy loss at isolation as last renewal plus lease duration minus watermark. A renewal at 10:00:40 and a watermark at 10:00:25 give 35 seconds, inside the 60-second RPO, and the bound does not measure what was actually lost.
- A 60 RPS peak of 1,000-token, two-second requests needs 5 replicas, 3.6 million tokens per minute and 120 active slots. A 2-million-token quota admits about 33 RPS, so reject the rest at admission, because extra replicas cannot beat the quota.
- Cost per success divides total spend by completed workflows. With $17,500 fixed and 1,250,000 attempts at $0.004 it is $0.028125, while dividing by the 1,000,000 accepted requests gives $0.0225 and hides completion failure.

## 11_multi_region/04_think_like_a_staff_engineer.md

- Different tenants can be active in different regions, but each tenant has one writer at a time. Global active-active for one tenant adds conflict resolution, shared quota and operation deduplication, and copies A/B content outside the EU.
- The RTO runs to validated customer success, not to the DNS change. A ten-minute model load misses the 600-second objective before traffic moves, so report the miss and keep the adapter warm or agree a longer RTO.
- Before failback, reconcile or discard EU-primary's quarantined writes, rebuild its stores, indexes and caches from the new authority, and move the lease once through the quorum. Never reverse DNS while both regions accept writes.
- A late provider invoice becomes an adjustment against the original attempts and never silently replaces the earlier figure. At zero successes unit cost is undefined, not zero.

## 11_multi_region/05_validate_and_carry_forward.md

- An RPO of 60 seconds allows up to 60 seconds of acknowledged writes to be lost. The bound is last renewal plus the 20-second lease minus the watermark, frozen at isolation, because a partitioned primary can acknowledge until its lease expires.
- Promotion order is lease expiry plus drift margin, a new quorum lease, the new epoch installed with every store refusing the old one, and EU-primary's stores quarantined. Then come allowed destination, current policy, approval generation, audit, artefacts and capacity.
- A 60 RPS workload is limited by token and request quotas, active slots, database and search, network and model readiness, not by app replicas alone.
- The usage ledger counts a twice-delivered attempt once and rejects a record that changes an existing attempt's cost as conflicting evidence for investigation.

## 12_staff_platform/01_understand_the_problem.md

- Four teams copying route configuration and rollout scripts caused the problem. One copy skipped the EU placement pre-check and another changed the model alias without binding evaluation evidence.
- The platform needs shared contracts and a migration path, not a replacement of every component. Every existing guarantee carries forward unchanged, and centralising cannot make prompt text enforce access or repair an unknown provider result.
- An adoption candidate needs a named owner, approved cell, evaluated bundle, request budget, retention policy and observable outcome. Success means a new app follows a supported workflow without editing shared runtime code, and rollback cannot restore a forbidden model or the wrong region.
- Acceptance requires every seeded cross-tenant, residency or approval violation to reject, a lost cutover acknowledgement to leave inspectable state, and an injected pre-commit failure to change neither route nor generation.

## 12_staff_platform/02_learn_and_design.md

- Separate a control plane that checks contracts and publishes configuration from regional data planes that serve requests. Choose regional platform services with versioned contracts, and reject one global request service for its blast radius and residency coupling.
- Hard constraints such as residency and current access remove an option before weighted scoring, and no score rescues it. Route apply against the authority is a command, while showback usage is an event delivered at least once and deduplicated by event ID.
- Route records live in each region's authority store. A cell verifies a signed generation, rejects unsigned or older ones, checks current eligibility because a signature proves origin and not permission, then applies it by compare-and-set (CAS).
- An emergency rollback writes a new local generation N+2 carrying N's route, so a returning control plane's N+1 is refused as older. A manifest never supplies provider credentials, raw datasets or a destination URL, since server policy decides eligibility.

## 12_staff_platform/03_observe_and_experiment.md

- A strangler migration routes selected new work through the new contract while the old path serves the rest, with one authoritative writer and stable operation IDs. A route rollback cannot undo a destructive schema migration, erase a tombstone or revoke a remote side effect.
- Shadow evidence is append-only and bound to its baseline route and generation, so a route change makes it stale. Zero mismatches in 100 representative samples bounds the mismatch rate below about 3% at 95% confidence, by the rule of three.
- With no overlap, $60,000 of migration against a $4,000 monthly saving breaks even at 15 months. A six-month dual-run overlap moves break-even to month 33 and cuts the three-year saving from $84,000 to $12,000.
- Rollback still checks current eligibility. If the previous model's data approval is revoked, block the rollback and choose another approved route, because a historical pointer is not present permission.

## 12_staff_platform/04_think_like_a_staff_engineer.md

- Keep one named accountable owner per decision. When nobody rolled back a degrading canary for 40 minutes, the fix was a runbook line making the release owner the sole pilot rollback decider until an incident commander takes over.
- If Tenant B's regulator forbids control records outside the EU, that hard constraint vetoes the global control plane even though it would have scored 4.1. Among the survivors, a separate EU control plane scores 3.4 against 2.6 for templates.
- An exhausted error budget pauses risky rollout but never disables authorisation. Centralising contracts does not move regional on-call, because each cell's SRE owner still owns recovery.
- Accepted ADRs stay immutable apart from supersession metadata. A new decision records the changed assumptions and references the old one rather than rewriting history.

## 12_staff_platform/04b_staff_interview_practice.md

- Centralise validation and contracts while data and execution stay in regional cells. A control-plane outage freezes new cutovers but not authorised work, and rollback still works through a local N+2 if the previous route is currently eligible.
- Independent dual writes to old and new databases can fork saved answers and operation keys. Prefer one writer, additive schema changes and replayable projections, because a route rollback cannot restore a dropped column.
- The payback case turns on the overlap. Six months gives break-even at month 33 and $12,000 saved over three years, while ten months moves break-even to month 45 and costs $36,000 more.
- The capstone's mandatory rule is never to trade residency or current access for availability. Zero data loss for acknowledged answers needs a synchronous commit to a second EU location, which adds cross-site latency to every write.

## 12_staff_platform/05_validate_and_carry_forward.md

- An eventual event consumer cannot decide a cutover because it may act on stale policy or a stale generation. Cutover needs the current authoritative value through a CAS and an eligibility check.
- If an approval is revoked after the control plane signs N+1 but before a cell pulls it, the cell's eligibility check rejects N+1 and keeps N.
- At the baseline inputs each overlap month adds three months to break-even. That is one month of delay plus $8,000 of extra cost that takes two months of $4,000 savings to repay.
- A one-page ADR holds context, options, decision, consequences, reversal criteria and evidence marked measured, assumed or proposed. For a data protection officer, lead with what stays where and keep the same facts.

## architecture_decisions/adr_001_synchronous_mvp.md

- Start with one synchronous AI App Service on SQLite, with gateway, identity, model adapter and telemetry as logical roles inside the process. A `201` returns only after the `completed` row commits, with no streaming and no automatic model retry.
- A direct browser-to-model request is rejected because it exposes credentials and policy and splits the saved-answer contract. A job queue with workers is deferred until a long-running task needs durable execution.
- No transaction spans the database and the provider, so a crash can leave a `processing` row after the provider has answered. Multi-host deployment, measured write contention or work that must survive worker loss reopens the decision.

## architecture_decisions/adr_002_durable_execution.md

- Long document work moves to a SQLite-backed job queue. The API commits queued state before accepting, and workers claim a job with an epoch and lease, retry safe failures at most three times and commit only while their epoch is current.
- A web-process thread is rejected because it overlaps work without persisting it. A broker plus relational job store is kept for measured deployment needs, since it adds publication and acknowledgement boundaries.
- A local epoch does not fence external actions, so model execution and billing are not exactly once, and expired rows with started effects become unknown. Measured contention or a need for worker isolation reopens the queue choice.

## architecture_decisions/adr_003_versioned_retrieval.md

- Retrieval filters by tenant, current version, deletion and reader policy before the final top-k, then rechecks policy and version when building model context. Answers cite exact document, version and passage identifiers, and no authorised evidence means no grounded answer.
- Lexical FTS5 search is chosen over semantic vectors and hybrid retrieval for a small corpus of explicit policies and identifiers. A broad unfiltered index is rejected because it can expose restricted or deleted material before generation.
- Citation identity proves provenance, not that the answer follows from the source. An authorised query set showing concrete lexical misses reopens the search representation.

## architecture_decisions/adr_004_stateless_scale_and_cache.md

- Scale with ready stateless app replicas behind a load-balancing role and one shared relational authority, such as PostgreSQL, for requests, jobs and source metadata. Per-replica caches hold only immutable passages keyed by tenant, document, version and chunk.
- Copying local SQLite files per host is rejected because it would fork history, operation keys, job claims and source authority. Query-only answer caching is ruled out because it could leak or serve stale policy.
- Every cache hit still reads current policy, version and tombstone, and an authority outage may never fall back to cached permission. Cache scope reopens only with a documented policy, version and model dependency contract.

## architecture_decisions/adr_005_bounded_fair_dispatch.md

- A tenant burst is handled with bounded per-tenant queues and work-conserving weighted round robin at hypothetical weights 2:1:1, FIFO within each tenant. A provider call needs a fresh atomic reservation of request credits, token credits and a global concurrency slot.
- Bigger replicas or a larger global queue are rejected because neither adds provider request, token or concurrency capacity. FIFO, strict priority and plain round robin were compared under the same equal-cost assumptions.
- Slots settle only on known completion, so a crash may strand one conservatively and unknown outcomes wait for reconciliation. Variable token or compute cost needs a cost-aware policy, and the binding budget is fixed before app replicas scale.

## architecture_decisions/adr_006_trusted_enterprise_boundaries.md

- Deployment verifies identity against bounded issuer, audience, key, type and expiry rules, then binds tenant and subject to live membership and policy epoch. Caller identity headers are stripped and services pass a narrowly scoped capability over authenticated channels.
- The pooled-predicate baseline stays, and schema, database or dedicated-plane isolation becomes an explicit per-tenant deployment decision rather than an assumed label. Private routing or mTLS never replaces resource checks, and document or model text is never authorisation.
- Protected retrieval disclosure is durably audited first, and an audit failure blocks the route. Later consistency and failover choices must never make a stale cache or a failover replica an authorisation authority.

## architecture_decisions/adr_007_consistency_and_recovery.md

- Policy, budget and ownership decisions always read current authority, while saved-answer history may read an eligible projection with primary fallback. Result persistence and outbox intent commit atomically, and projections apply duplicate-safe updates behind a contiguous watermark.
- Stale-authority fallback and blind retry or failover are rejected because an outage would grant stale permission and a lost response would trigger duplicate attempts. A lost acknowledgement reuses the stable scoped operation key instead.
- Real replication needs writer fencing, acknowledgement durability, RPO/RTO, minimum-version reads and tested restore and promotion, and quorum counts alone are not consensus. Old writers are fenced before promotion and evidence is reconciled before deletion.

## architecture_decisions/adr_008_versioned_quality_releases.md

- Each quality report binds to immutable prompt, retriever, index, model, policy, dataset digest, evaluator and gate versions. Zero known safety violations is a gate on its own, and a generation-checked release pointer moves stable eligible cohorts through canaries.
- Global immediate replacement is rejected because a healthy request path can still return a wrong supplier rule or an unauthorised answer after a prompt, retrieval or model change. A fixture pass is not production approval.
- Withdrawing a canary keeps the current stable, and reverting a promotion restores the prior approved stable. Routing rollback never rewrites saved answers, source tombstones, current permissions or unknown effects. Check source, evaluator or population changes before blaming a model.

## architecture_decisions/adr_009_approved_inference_boundaries.md

- A logical Model Gateway picks an approved bundle and profile before dispatch and keeps a stable durable operation identity. New calls need a fresh budget grant, and user flags cannot downgrade the private-route requirement.
- Self-hosting, whether one device, several replicas or tensor and pipeline sharding, stays an evaluated option rather than an automatic substitute for the approved hosted route. A memory fit does not prove speed, quality, isolation or real allocation success.
- Unknown transport outcomes keep conservative reservations and never trigger an automatic alternate-provider call. A completed same-key replay keeps its original bundle and revalidates all original evidence, so a partly revoked source set cannot reveal the old answer.

## architecture_decisions/adr_010_governed_model_customisation.md

- Data-to-model lineage is immutable, and a tenant adapter is an independently approved, bounded challenger to prompt validation and authorised retrieval. Training completion creates a candidate in the Model Registry, never a live route.
- Full tuning is deferred without evidence because it brings more training state and operating cost. The adapter trial carries its own cost in dataset governance, evaluation, serving compatibility and retirement.
- Previous approved serving stays until every new eligibility gate passes, and rollback never touches current permissions, tombstones or unknown external effects. Changed behaviour requirements, poor adapter quality, revoked data purpose, a changed base model or tokeniser, or measured cost reopens it.

## architecture_decisions/adr_011_residency_aware_regional_cells.md

- Each tenant gets a home cell and a warm same-geography recovery target, with one writer per tenant. Tenants A and B sit in EU-primary with EU-secondary for recovery, and Tenant C sits in US-home.
- Global multi-writer is rejected without a requirement because of conflicts, global quotas, policy freshness and residency. Backup only cannot meet the assumed recovery target, and synchronous cross-region authority is left to a separate decision for its latency and partition cost.
- Asynchronous copies may lose acknowledged operation evidence within the 60-second planning RPO, so the uncertain interval is held, not redispatched. A zero-loss requirement, a failed recovery target or justified global concurrent writes reopens it.

## architecture_decisions/adr_012_versioned_regional_platform_contracts.md

- An application manifest, a desired-state control plane and a durable migration controller enforce shared contracts, while customer execution stays in approved regional cells. Platform owns enforcement, app teams own task behaviour, security and data owners own access, and SRE owns recovery.
- One global request service is rejected for its residency coupling and global blast radius. Library templates alone let versions drift and duplicate policy in apps, and a full microservice rewrite is deferred until a measured need.
- Adoption runs inventory, manifest validation, eligible read-only shadows, a one-app pilot and one generation-checked route switch. ADR-013 replaces its economics, because the 15-month break-even and $84,000 three-year saving hold only if old paths stop on day one.

## architecture_decisions/adr_013_regional_authority_and_route_generations.md

- Tenant A and B policy, membership and writer-ownership records live in an EU-only authority store, consensus-replicated across EU-primary, EU-secondary and a witness that holds votes, not content. The global control plane publishes signed route generations and is never authority.
- Reachability or a health check never counts as fencing. Writer ownership is a quorum lease whose epoch rises on every grant, and the new writer confirms that each store it will use refuses a write carrying the old epoch.
- If the quorum is lost the cell fails closed, even when recovery misses its time objective. Dual-run overlap is a tracked cost that moves break-even to month 33 at six months, and an overlap past seven months reopens the decision.

