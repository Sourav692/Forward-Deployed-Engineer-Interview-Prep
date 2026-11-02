# Secure Multi-Tenant AI Platform, part 4

## 12. Deliver It in Fifty Minutes

Spend time in proportion to risk. Isolation, export and delete, quotas, regional controls and rollback deserve the depth; a row of generic services does not.

| Minutes | Phase |
|---|---|
| 0–5 | Frame the outcome: shared platform, 500 tenants, defensible isolation, predictable performance, regional controls (section 1) |
| 5–12 | Discovery and assumptions: data classes by region, BYOK, hard delete, burst pattern, what "predictable" means, the highest-risk tenant action (sections 1 and 2) |
| 12–18 | Rough sizing, proportional to risk: tenant count, peak concurrency per tenant, request size, storage growth, export and delete frequency (section 3) |
| 18–28 | Core architecture: where tenant context is attached, verified and impossible to bypass (sections 4 to 6) |
| 28–35 | Defend the trade-offs, each tied to a customer outcome, an operational burden and a failure mode (below) |
| 35–42 | Failure cases and controls: why a row tag is not enough, export and delete, noisy neighbours, the dedicated threshold (sections 7 to 9) |
| 42–46 | Delivery and operability: staged rollout, kill switches, tenant migration, support tooling (sections 10 and 11) |
| 46–50 | Executive summary: what was built, why it is the right default, who gets dedicated, and the first production gate |

A sample exchange at minute zero: the interviewer says "start from minute zero, what do you say?" and the candidate frames the outcome and the cheapest-safe-shared assumption. The probe follows: "what if your cheapest-shared assumption is wrong?" The answer is to change the control boundary as well as the capacity. Test whether any customer needs strict residency or dedicated inference, and bias the architecture toward stronger isolation if so.

The ninety-second architecture summary:

> *"I'd default to a shared platform because it gives the best cost and operational leverage across 500 enterprise customers. Each request carries authenticated tenant context; that context is enforced at the application boundary, in the data layer, and in storage and queue paths. I'd use namespace-level isolation plus network policy and quotas for the common case, with reserved inference capacity for premium or burst-sensitive customers and dedicated clusters or databases only when risk or performance requires it. The control plane would manage policy and rollout, while regional enforcement would preserve residency and latency constraints. Defence in depth is the point, one control alone is not enough. I'd verify tenant isolation with adversarial tests, monitor for cross-tenant access attempts, and define a clear export/delete workflow that spans all tenant-owned data stores."*

The two-minute spoken answer:

> *I would not start with the model. I would start by separating the feature they asked for, one AI application for 500 tenants, from the business result, which is a cost-efficient shared platform with defensible isolation plus a dedicated path for the exceptions. Four stakeholders mean four definitions of success, so I would clarify which data classes are in scope, whether regional controls are hard requirements, what predictable performance means, and which failure is most expensive. My default is shared-by-default with tiered isolation. The non-negotiable rule is that tenant context comes from verified identity, never the request body, is established once, and becomes immutable. The control plane federates identity, resolves the tenant directory, evaluates policy, schedules the region, and selects keys; the data plane admits at the gateway, applies quotas before expensive inference, and reads and writes only tenant-scoped resources. Seven isolation layers enforce independently, row, object, cache, queue, log, vector index, and key, so a single missed check is not a breach, and a missing tenant predicate fails closed rather than reading whatever matches. I would size for load shape rather than the average, since 20x skew means a few tenants drive peak. I would gate the rollout on an adversarial isolation suite, then internal tenants, small shared tenants, and finally a dedicated tier justified by measurable thresholds. Success is not elegance; it is adoption, an improved workflow, and an operations team that can support it.*

The delivery close, in ninety seconds:

> *"I would deliver this platform in four steps: internal tenants, adversarial isolation testing, small shared tenants, then a dedicated tier for customers whose policy or economics justify it. I would track isolation-test pass rate, cross-tenant incidents, per-tenant p95 latency, quota rejections, cost per tenant, and regional failover time, while separating technical health from adoption and business outcomes. The rollout would have named owners, explicit go/no-go gates, rollback triggers, training, support, and documentation. The system is successful only when users adopt it, the workflow improves, and the operating team can support it."*

Defend four trade-off pairs, each with a balanced verdict.

| Pair | Default | Verdict |
|---|---|---|
| Shared database vs database per tenant | Shared: cost, fleet simplicity, product reuse; raises the bar on filtering, backup, export/delete and containment | Shared by default, with a pathway to dedicated storage when isolation, regulatory or performance needs justify the cost |
| Namespace vs cluster isolation | Namespace with strong network policy, admission control, resource quotas and service identity | In this design, namespace is the default; dedicated clusters are the premium or exception path |
| Central vs regional control plane | Central policy is simpler and consistent but can become a latency and residency problem | Central policy definition with regional enforcement, unless residency or availability forces local control |
| Pooled vs reserved inference capacity | Pooled fits the shared-platform goal; needs backpressure, quotas and admission control | Mature platforms support both in a tiered model; the trade-off is cost and fairness |

The follow-ups arrive in a predictable order.

| Follow-up | Answer |
|---|---|
| Why is tenant_id on every row insufficient? | It is one line of defence. It does not protect caches, blob stores, indexes, background jobs, analytics or admin tooling, and it fails if a developer omits the predicate once. A secure system needs enforced policy in multiple layers, not a convention in application code |
| How does a tenant export and delete all its data? | A tenant inventory and a deletion workflow spanning every store; export as a complete package with ownership and time bounds; deletion as a coordinated, verified, auditable job; backup semantics by retention policy |
| How do you contain a noisy neighbour? | Quotas, rate limits, concurrency caps and workload classification first; then admission control before inference, queue partitioning, reserved capacity, circuit breakers. Bug-caused noise gets a kill switch; legitimate burst gets fairness |
| When does a customer move to dedicated infrastructure? | When shared tenancy no longer meets risk, performance or operational requirements at acceptable cost: residency constraints, strict latency SLOs, contention-intolerant workloads, a customer policy demanding a harder boundary. Measurable thresholds and an exception review path, never "big customers" |
| What if the cheapest-shared assumption is wrong? | Change the control boundary as well as the capacity: test for residency or dedicated-inference needs and move toward stronger isolation |
| How do you prove deletion? | A verification pass across every store in the tenant inventory, an auditable completion record, and the retention exceptions named up front |
| What breaks under a noisy neighbour? | Shared worker pools and model backends saturate, queue depth and p95 rise for neighbours, and the fix is admission control and fair queuing, not autoscaling alone |

Repair the weak answers on the spot. "I'd just put tenant_id on every query" becomes the enforcement stack and the failure mode of a missed predicate. "I'd isolate everything" becomes a question about what everything costs, then the shared default with an exception path. "The control plane can be centralised for all cases" becomes policy management separated from residency and regional execution. "We'll autoscale if latency rises" becomes capacity planning, queue control, fairness and reserved tiers as different things. "Deletion is just a database delete" becomes every place tenant data can exist, with retention and backup constraints. "Noisy neighbours are rare" becomes a containment plan before the incident.

The lines that carry the round:

1. *"Tenant context comes from verified identity, never the request body, is established once, and becomes immutable."*
2. *"The control plane decides; the data plane enforces."*
3. *"Seven layers enforce independently, so one missed check is not a breach."*
4. *"A missing tenant predicate fails closed. It never reads whatever matches."*
5. *"The store refuses to return a row unless the request is already tenant-scoped."*
6. *"Security defects fail closed; capacity pressure degrades; metadata leaks quarantine."*
7. *"Size for the load shape, not the average. 20x skew means a few tenants drive peak."*
8. *"Pay the isolation premium only where a requirement demands it."*
9. *"A cache hit across tenants is a security incident, not a performance bug."*
10. *"Blast radius is the design unit."*

Practise it three ways:

- ten minutes answering aloud, then cut every sentence that does not change a design decision
- a pair mock where the partner interrupts on "secure", "scale" and "optimised" until the mechanism is named
- one enforcement point (row-level authorisation, tenant-scoped export and delete, or per-tenant rate limiting) written with tests, failure handling and a rollback plan

## 13. Answer the Cost Pivot in Ten Minutes

The interviewer's pivot after a good design is budgets: a SaaS company wants GenAI features across customers with strict tenant isolation and budget controls. Answer it in the same sitting with the same architecture, because the budget check is already in the request path.

| | |
|---|---|
| Ask | How are tenants isolated today? Which budgets are contractual? Can tenants choose model tiers? What data retention and audit policies apply? How is billing reported? |
| Dominant driver | Uncontrolled spend with no attribution, and a shared cache that leaks across tenants |
| Weak move | Add a global token limit and a shared cache |
| Strong move | Tenant-aware gateway, per-tenant budgets, permission-aware cache, tenant-specific observability, model-routing policy, quota alerts, isolation tests |
| Path | tenant gateway → auth → budget check → cache/model route → tenant-scoped data plane → cost attribution → dashboards |
| Trade-off | Caching and routing are powerful but dangerous without tenant keys and budget ownership |
| Metrics that prove it | Cost per tenant, quota usage, cross-tenant access tests, cache hit rate by tenant, P95 latency |
| Recommendation | Make `tenant_id` and `permission_signature` first-class across every service |

The sixty-second line: make tenant_id and permission_signature first-class in every service, and because budgets are contractual, meter before the call, not after.

The second pivot is the §15 scenario where one tenant has unusually high usage. Distinguish healthy adoption from runaway automation first, because the response differs. Ask whether it is legitimate adoption, abuse, a loop, a batch job or an integration bug. The causes are an automated integration loop, heavy document processing, a power-user workflow or a missing quota. Segment usage by API key, user, feature, time of day and prompt version. Watch cost per tenant, cost per user, request source, tokens per request, batch jobs and agent steps. Now: a tenant rate limit, a conversation with the customer, and a pause on the suspicious workflow if necessary. Later: tenant budgets, a usage dashboard, anomaly alerts and integration safeguards. Prevent with contract-aligned quotas and notifications.

> *"I would first distinguish healthy adoption from runaway automation. The response differs: support scale-up for healthy usage, throttle loops or abuse."*

Every strong cost answer follows four verbs in order. Measure, by tracing and attributing first. Route, matching model and path to risk. Bound, with limits on steps, tokens, top-k, timeouts and budgets. Cache safely, with tenant, permission and version in the key. Deliver it in six moves: frame the business impact, decompose the path, name the largest measured driver, fix safely, prove with before and after, prevent recurrence.
