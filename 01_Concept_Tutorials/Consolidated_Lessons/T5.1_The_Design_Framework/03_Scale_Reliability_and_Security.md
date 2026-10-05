# Scale, Reliability, and Security

*Every technique that removes a bottleneck or contains a failure adds its own cost, so name the cost in the same breath as the technique.*

◷ 10 min

The last four parts of a design are not a list of best practices; they are answers to "what breaks first?" and "what happens when it fails?". Name the bottleneck before the technique, assume every dependency fails, and close every choice with its trade, building on [Architecture, Data, and Request Flow](02_Architecture_Data_and_Request_Flow.md).

**Objectives:**

- match each scaling technique to the bottleneck it removes and the cost it adds;
- explain circuit breakers, and tell reliability apart from availability;
- name the security controls an AI system adds, and phrase every choice as a trade-off.

---

## Name the Bottleneck Before the Technique

Part 9 is scalability. A technique named without a bottleneck sounds memorised. Say what breaks first, then what removes it, then what that removal costs.

| Technique | Removes | Cost |
|---|---|---|
| Horizontal scaling | The single-machine ceiling | Requires stateless services |
| Auto scaling | Manual capacity management | Tune warm-up and cooldown, or scaling arrives after the spike |
| Load balancing | Uneven instance load | Least-connections or latency-aware usually beats round-robin |
| Caching (edge, gateway, app, DB) | Load on the layer behind | Another invalidation problem per layer |
| Sharding | Write volume or dataset size beyond one node | Cross-shard queries |
| Read replicas | Read pressure on the write node | Replication lag; say which reads must hit the primary |
| Message queues | Producers waiting on consumers | Eventual processing |
| Event-driven architecture | Synchronous coupling and fan-out latency | Eventual consistency, harder end-to-end debugging |
| CDN | Origin load and geographic latency | The cheapest win; mention it first |

## Make Services Stateless First

Statelessness is the prerequisite for scaling, not a nice-to-have. A load balancer may send each of a user's requests to a different instance. If an instance keeps request state locally, such as a session, a cart or a half-uploaded file, a request landing elsewhere breaks. An instance cannot serve a request whose state lives on another instance.

So push that state into shared stores: Redis or a database for sessions, a signed JWT the client carries, object storage instead of local disk. Any instance can then serve any request. That interchangeability gives near-linear scaling and safe rolling deploys.

## Add the AI Scaling Levers

AI systems have their own levers. Model routing sends simple requests to small fast models and hard ones to frontier models, often an order-of-magnitude cost cut. A semantic cache reuses answers for similar queries at a conservative threshold. Multi-region vector databases keep retrieval near users and survive a region loss, at a rebuild and lag cost.

Token optimisation trims prompts, compresses history and retrieves selectively, because tokens are both the latency budget and the bill. Request batching groups embedding and inference calls for GPU utilisation, buying a large per-request gain for milliseconds of queueing.

The last lever is short-circuiting: stop the pipeline the moment a step already satisfies the task. It is boolean short-circuit evaluation, where `a && b` skips `b` once `a` is false, applied to orchestration. It shows up in five places:

- a cache hit or guardrail check that skips the LLM entirely;
- a verifier failing early in a planner, retriever, verifier and synthesiser chain, so later agents never spend tokens on doomed input;
- a tool loop that stops when a result meets the success criteria, not at the step budget;
- a parallel ensemble that returns once N of M agree;
- a policy filter that blocks unsafe input before any tool or model runs, so no reasoning chain can justify an irreversible action.

Implement it with confidence thresholds between steps, conditional edges in the orchestrator graph, or a circuit breaker. The skill is choosing the checkpoint. Too early loses correctness; too late loses the cost, latency and safety benefit.

## Assume Every Dependency Fails

Part 10 describes what happens when each dependency fails.

| Technique | Protects against | Detail |
|---|---|---|
| Retry with backoff and jitter | Transient failures | Only for idempotent operations; cap attempts or retries become a self-inflicted DoS |
| Circuit breakers | Cascading failure | See the next section |
| Timeouts | Whole-system hangs | An explicit deadline on every network call; propagate a shrinking budget downstream |
| Dead-letter queues | Losing failed work | Park repeated failures for inspection and replay |
| Multi-AZ | Losing one data centre | The most common real-world failure |
| Multi-region failover | Losing a region | State the RTO, how traffic shifts and how data replicates |
| Health checks | Routing to sick instances | Readiness must check real dependencies |
| Leader election | Duplicate singleton work | Consensus systems such as etcd or ZooKeeper |
| Graceful degradation | Total failure under stress | Keep search working if personalisation or reviews are down |
| Backup and restore | Data loss | Rehearse the restore |
| Chaos testing | Assumed resilience | Turns it into verified resilience |

## Fail Fast With a Circuit Breaker

A circuit breaker wraps a dependency call and tracks its failure rate through three states. When closed, calls go through and failures are counted. Once failures cross a threshold it opens, and every call fails instantly for a cooldown window without touching the dependency. After the cooldown it goes half-open and lets a few trial requests through; success closes it, failure reopens it.

A timeout alone does not prevent the cascade. A timeout still makes every caller wait the full deadline on every request to a dead dependency, holding a thread each time. Under load that exhausts the caller's own pool and takes down a healthy service. Failing fast breaks the cascade, and the cooldown lets the dependency recover instead of meeting retry traffic the instant it answers.

> **Warning: retries without idempotency or a cap make outages worse.** Retrying a non-idempotent write can apply it twice, and uncapped retries against a struggling dependency become a self-inflicted denial of service. Retry only idempotent operations, cap the attempts, and let a circuit breaker stop the traffic.

## Tell Reliability From Availability

These are different targets bought with different techniques. Availability is whether the system responds. It is measured in nines and won by redundancy: multi-AZ, multi-region, health checks and load balancing route around something that is down.

Reliability is whether the response is correct and no data is lost, even mid-failure. It is won by containment: timeouts, circuit breakers, retries and dead-letter queues stop one failure from corrupting or cascading. A system can be highly available and unreliable, fast but sometimes wrong. It can be reliable and unavailable, correct when up but often down.

Backup and restore is reliability's safety net, bounded by RPO. Multi-region failover is availability's, bounded by RTO. Naming which technique buys which property separates a checklist from a design.

## Protect It and Say How You Would Prove It

Part 11 covers security and governance. The traditional controls still apply.

| Control | What to say |
|---|---|
| Authentication | Federate with an IdP; short-lived credentials; never build password handling from scratch |
| Authorisation | Least-privilege roles or attribute-based rules, checked at the service, not only the UI or gateway |
| Encryption | Managed keys with rotation at rest; TLS everywhere and mTLS between services in transit |
| Secrets management | A vault with rotation and audited access; prefer dynamically issued credentials |
| Audit logs | Immutable, timestamped, retained per policy |
| Rate limiting | Per user, IP and tenant; for AI, meter tokens and cost too |
| API security | Validation, schema enforcement, injection and SSRF defence; deprecate old paths deliberately |
| PII protection | Classify, minimise and mask in logs; make export and deletion first-class features |
| Compliance | Map obligations to controls and evidence; automate evidence collection |

AI adds its own controls. Treat retrieved documents and tool output as untrusted data, never instructions. Separate system, user and retrieved content, and constrain what tools can do. Put guardrails on input and output that fail closed for anything moving money or changing a booking. Screen content with moderation and log the decisions so false positives can be tuned.

The control most often missed is the tool permission check. Authorise every tool call against the calling user's entitlements, not the agent's. An agent must never act beyond the person it serves. Add output validation, with schema checks, grounding, and human confirmation for anything transactional. Mask PII before prompts, logs, traces and third-party providers. Track model versions, prompts, evaluations and approvals, so "which model and prompt produced this?" has an answer.

## Close on Trades, Not Tools

Part 12 is where senior candidates stand out. Do not name a technology; name its trade. Instead of "we use Redis", say that Redis takes read latency from hundreds of milliseconds to single digits but brings cache-consistency challenges. Now invalidation, stale reads and cache-wide eviction need answers. Instead of "we use Kafka", say it improves throughput and decouples services but adds operational complexity: partition management, consumer lag and eventual consistency.

Then name future improvements with their costs. Multi-region brings replication complexity and write conflicts. Event sourcing gives perfect auditability at higher storage and read complexity. Active-active removes failover delay but demands conflict-free data design. Others worth naming are layered caching, AI cost optimisation and model distillation. Autonomous agents raise the bar on guardrails and human-in-the-loop.

Active-active deserves a full answer. Active-passive keeps one region live and a standby replicating. Losing the primary means detecting the failure, promoting the standby and repointing traffic, which is real downtime measured by RTO. Active-active removes that step: every region already serves traffic, so the global load balancer simply stops routing to a lost one.

The price lands on the data layer. When two or more regions accept writes to the same data, something must reconcile concurrent writers. There are three ways out. Partition writes by region so they never overlap, the AMER, EMEA and APJ pattern. Use CRDTs or last-writer-wins for data genuinely written from several regions. Or accept eventual consistency and resolve conflicts in application logic. There is also a capacity cost: every live region must carry real traffic plus headroom for a failed region's load.

## Worked Example: Losing the Flight Supplier at Peak

The travel assistant's flight supplier starts timing out during a sale. Without a breaker, every search waits the full deadline and holds a thread, and the search service exhausts its pool. A healthy service is now down because of someone else's outage.

With a breaker, the failure rate crosses the threshold and the breaker opens. Searches now fail instantly for that supplier and return partial results from the others, as the data flow promised. After the cooldown, a few trial calls go through; when they succeed, the breaker closes.

The availability story is separate. The search service stayed up through redundancy. The reliability story is that no booking was corrupted, through containment. Say both, and say which technique bought which.

---

## Key Takeaways

- Name the bottleneck first, then the technique that removes it, then its cost.
- Statelessness is the prerequisite for horizontal scaling and safe rolling deploys.
- AI scaling levers include routing, semantic caching, token optimisation, batching and short-circuiting at a well-chosen checkpoint.
- Assume every dependency fails and say what happens; retry only idempotent work with a cap.
- A circuit breaker fails fast through closed, open and half-open states, stopping the cascade a timeout alone allows.
- Availability is won by redundancy and reliability by containment; name which technique buys which.
- AI security authorises every tool call against the user, treats retrieved content as data and fails closed on transactions.
- Close every choice as a trade, and give active-active its data-layer and capacity price.

## Check Yourself

1. **Why does a timeout alone not stop a cascading failure?**
   Every caller still waits the full deadline and holds a thread per request. Under load that exhausts the caller's pool and takes down a healthy service. A circuit breaker fails fast instead.

2. **Assign two techniques each to reliability and availability.**
   Availability: multi-region failover and health checks, which route around what is down. Reliability: circuit breakers and dead-letter queues, which stop a failure from corrupting or cascading.

3. **Whose entitlements should an agent's tool call be checked against?**
   The calling user's, never the agent's own. An agent must never act beyond the person it serves.

## References

**Sources:** `01_Concept_Tutorials/FDE_Handbook/02_System_Design_Fundamentals/01_The_12_Part_Framework.md`: §9 Scalability Strategy (including "Why statelessness is the prerequisite", "For AI" and "Short-circuiting in agentic design"), §10 Reliability and Availability (including "How a circuit breaker actually works" and "Reliability and availability are different targets"), §11 Security and Governance, §12 Trade-offs and Future Improvements (including "Active-active vs active-passive").
