# Secure Multi-Tenant AI Platform

*One application serving 500 tenants: shared enough to be affordable, isolated enough that a missing predicate is impossible rather than unlikely.*

The dangerous failure is not a bad answer. It is a query, cache lookup, queue message or export that runs without a tenant predicate and reads whatever matches. This page consolidates the group's prompts into one read for the day before. It holds the chapter 2 worksheet and answer key, the tutorial's high-yield sections, the two cost scenarios and the cross-tenant leak incident. The two-layer enforcement mechanics are owned by G01 section 6 and referenced here rather than repeated.

| Case in the group | What it contributes here |
|---|---|
| #16 Secure Multi-Tenant AI Platform (anchor, book ch 2) | Sections 1 to 12: the design, requirements, sizing, enforcement, evaluation, rollout and delivery |
| #41 Multi-tenant GenAI platform with per-customer budgets | Section 13, the cost drill card |
| #108 One tenant has unusually high usage | Section 13, the §15 scenario answer |
| #85 Cross-tenant retrieval leak through a missing metadata filter | Section 14, the incident walked through with its telemetry |

---

## 1. Separate the Feature From the Business Result

Open with the outcome, not the topology. The feature asked for is one AI application for 500 enterprise tenants. The business result is a cost-efficient shared platform with defensible isolation, plus a dedicated path for the exceptions. Opening with Kubernetes, a vector database and a model gateway signals feature-first thinking, and that is the tell an FDE interviewer listens for.

> *"Support 500 enterprise tenants preserving isolation, predictable performance and regional controls. I'd clarify shared versus dedicated tenants, cross-region data limits, and success criteria per stakeholder. Default: a shared control plane with tenant-aware data and inference paths, strong authorisation at every boundary, and an escape hatch for premium tenants that need dedicated infrastructure."*

The headline ask hides a disagreement between four stakeholders about what isolation and success mean. Map the people before the boxes.

| Stakeholder | Job to be done | What they want |
|---|---|---|
| Tenant end user | Summarise internal content and answer questions without exposing anyone else's data | Fast, reliable, useful, no cross-tenant exposure |
| Tenant administrator | Configure policy once and roll it out safely | Control over access, configuration, usage and regional placement; onboarding without platform tickets |
| Platform operator | Run one shared fleet without noisy neighbours dominating it | A control plane that is observable, supportable and cheap at scale |
| Security and compliance auditor | Prove access and residency constraints are enforced consistently | Evidence: policies, logs, boundaries, retention rules, isolation guarantees that hold under failure |

Only about six questions fit a forty-five-minute interview, so ask the ones that change the architecture. Each should produce scope, assumptions, risks and owners.

| Question to ask | What the answer decides |
|---|---|
| Which tenant data classes are in scope, and which are explicitly out for the first release? | The trust surface of the MVP |
| Are regional controls hard requirements, soft preferences or customer-specific exceptions? | Routing, storage, backup and logging design |
| What does "predictable performance" mean: throughput, latency, queue time or fairness across tenants? | Whether the answer is capacity, quotas, or a fair scheduler |
| Which tenants can share infrastructure, and which need a dedicated tier? | One universal topology with tiered isolation, or a hybrid with an explicit premium tier |
| What evidence do auditors need: logs, policy snapshots, access reviews or data lineage? | The audit pipeline's schema and retention |
| Which failure is most expensive: leakage, unavailability, slow inference or misrouted regional traffic? | Where the hour is spent |
| Do customers bring their own identity provider and their own keys, and is deletion hard or best-effort? | Federation, key management and the deletion workflow |
| What is the workload shape, steady, bursty, skewed or mixed, and what noisy-neighbour tolerance is acceptable? | Quotas, admission control, queue isolation, reserved capacity |

The three answer tiers show what the opening buys. The weak answer uses microservices and Kubernetes, puts a tenant_id column on every row and adds row-level security. It is solution-first, names no customer outcome, and treats one row label as the whole enforcement stack. The average answer builds a shared platform with per-tenant authorisation, quotas, regional routing, audit logging and per-tenant latency monitoring. It never says where tenant context originates, never makes every isolation layer agree, and never defines when a customer graduates to dedicated infrastructure. The strong answer defaults to shared because pooled economics are the point across 500 tenants. It derives tenant context once from verified identity, never from the request body, and makes it immutable. The control plane decides policy, region, quota and key; the data plane enforces at the gateway, the services and every store. Seven layers enforce independently, a missing predicate fails closed, and an adversarial isolation suite gates every external tenant.

State assumptions if the interviewer withholds answers, and choose the ones that protect the most dangerous failure. Assume tenants bring their own identity provider. Assume regional restrictions apply to stored data and inference logs. Assume premium customers may pay for dedicated capacity. Assume model selection is already approved. Have the line for interviewer silence ready:

> *"If we do not know tenant variability yet, I will assume the shared tier must support most customers, but I will design an explicit dedicated path for customers with stricter residency or performance needs."*

## 2. State Requirements as Testable Constraints

Split the conversation into four buckets, functional requirements, non-functional requirements, explicit exclusions and hard constraints, because the trap here is premature certainty. The interviewer only answers half the questions.

The functional requirements are ordered by value, and the order matters: the control plane is foundational and the dedicated tier is an escape hatch, not a default.

1. **Tenant-aware control plane.** Onboard tenants, assign policies, provision configuration, manage keys, record admin actions.
2. **Isolated data-plane request path.** Every request carries tenant identity, policy context and authorisation through the whole call chain.
3. **Per-tenant policy, quotas, keys and configuration** without bespoke code paths per customer.
4. **Regional routing and retention controls.** Direct requests and artifacts to the correct region; retain or delete per tenant policy.
5. **Auditable administration.** Answer who changed what, when, under which tenant context.
6. **Dedicated deployment tier where justified.** An explicit escape hatch for exceptional customers.

The first five are must-haves, because each protects a highest-risk failure mode. Richer quota tuning and broader automation are should-haves. Advanced tenant analytics and convenience workflows are could-haves, and a could-have never expands the core design or delays launch. If a tenant's must-have cannot be satisfied safely in the shared tier, that is the justification for the dedicated path.

Exclude these from the MVP unless the interviewer pushes, because each expands the trust surface or the support burden:

- arbitrary tenant-managed plugin execution inside the core platform
- cross-region active-active writes for every tenant
- fully custom per-tenant runtime stacks
- unlimited per-request model swapping
- manual exception handling for every onboarding request
- ad hoc shared-secret administration outside the control plane

The safety goals are stated as measurable constraints, and so are the operating constraints.

| Constraint | Stated so it can be tested |
|---|---|
| Zero cross-tenant reads or writes | No exposure of another tenant's data, prompts, embeddings, outputs, logs or admin state through authorised or accidental paths. Tenant context derives from verified identity, never the request body |
| Bounded resource contention | One tenant's workload cannot cause unbounded latency or throughput collapse for others. Shared infrastructure shares constraints |
| Tenant-scoped blast radius | A failed deploy, bad policy or revoked credential affects only the minimum necessary tenant set |
| Latency | Per-tenant p95 measured and alerted separately. A 2-second budget forces fewer hops and more caching; a 15-second budget permits durable queues and async work |
| Availability | Sized for load shape, not average. 200 QPS peak with 20x skew makes any uniform-tenant assumption unsafe |
| Compliance | Append-only audit of tenant, actor, action, resource and decision, retained per tenant policy |
| Cost | `C_tenant = C_fixed/N + C_usage + C_isolation`. Pay the isolation premium only where a requirement demands it |

Every requirement then needs the component that enforces it. If a requirement has no component it is probably not real yet, and if a component has no requirement it is probably scope creep. Say that out loud when presenting the table.

| Requirement | Primary component or mechanism |
|---|---|
| Tenant-aware control plane | Tenant registry, provisioning workflow, admin API |
| Isolated data-plane request path | Auth gateway, request context propagation, policy enforcement point |
| Per-tenant policy, quotas, keys, and configuration | Policy store, quota service, secrets management, config service |
| Regional routing and retention controls | Traffic router, region-aware storage, retention scheduler |
| Auditable administration | Append-only audit log, admin event pipeline |
| Dedicated deployment tier | Separate cluster or namespace boundary with tenant-specific capacity |
| Zero cross-tenant reads or writes | Authorisation checks, row-level or object-level isolation, test gates |
| Bounded resource contention | Quotas, admission control, queue isolation, autoscaling limits |
| Tenant-scoped blast radius | Deployment partitions, scoped rollout, tenant-level feature flags |
| Safe onboarding and offboarding | Provisioning workflows, deletion jobs, verification checks |

## 3. Size for the Load Shape, Not the Average

A design that is plausible at average traffic fails exactly when customers feel pain. Size for average, peak, growth and skew, with round numbers whose only job is to force decisions: 500 tenants, 50,000 active users, 200 QPS peak, 20x workload skew.

At 200 QPS across 500 tenants the average tenant looks trivial at 0.4 QPS. With 20x skew a few large tenants drive a material share of peak. So no uniform-tenant assumption is safe for queue sizing, cache partitioning, rate limiting, retry policy or noisy-neighbour protection. The most consequential estimate is usually the shape of peak concurrency after retries, fan-out and long-tail latency, not raw QPS. Targeting exactly the naive peak is already broken. Reserve headroom for tenant concentration, retried requests, failover overhead, deploy-time capacity loss and growth before the next tuning cycle.

Pair pooled capacity with four per-tenant controls. A token quota caps monthly or hourly usage to protect spend and fairness. A concurrency quota stops one tenant saturating worker pools or model backends. A burst quota allows short spikes without immediate throttling. Reserved capacity protects contractual performance for premium tenants. Name the trade-off: quotas too tight produce artificial customer-visible failures, quotas too loose let one tenant consume the shared budget.

Anchor SLOs in the customer workflow rather than in what the platform team prefers to measure:

- availability as successful requests or job completions over a window
- latency as end-to-end response time or completion time
- freshness as time from source update to model-visible update
- quality as task success rate and grounded-answer rate
- security indicators as authorisation failures, policy denials and blocked cross-tenant attempts
- cost per request, per tenant and per successful task

Tie one to a workflow aloud. If this powers support agents, the latency budget must preserve the agent's interaction loop, or a technically successful response arrives functionally useless.

The unit economics settle the shared-versus-dedicated argument.

```
C_tenant = C_fixed / N + C_usage + C_isolation
```

The first term is shared platform cost spread across N tenants. The second is the variable cost a tenant directly drives in tokens, storage, retrieval, egress and compute. The third is the premium for stronger separation: dedicated pools, stricter network boundaries, regional duplication, customer-specific encryption, extra compliance controls. Pooled economics win when most tenants can share safely; pay the isolation premium only where the requirement demands it.

| Assumption | Current illustrative case | 10x growth case |
|---|---|---|
| Tenants | 500 | 5,000 |
| Active users | 50,000 | 500,000 |
| Peak QPS | 200 | 2,000 |
| Skew | 20x | 20x or worse |
| Shared capacity strategy | pooled plus quotas | pooled plus stricter partitioning |
| Isolation posture | shared by default, dedicated for exceptions | more dedicated pools, more explicit regional controls |

What changes at 10x is not the table but the dominant risk. Noisy neighbours, cache churn and operational complexity shift the architecture from one shared tier with guardrails to tiered tenancy with explicit partitioning. Define the per-region recovery objective before the happy path too, since RPO and RTO decide replication, failover routing and queue durability. And define the missing-tenant-predicate drill up front: can a request, query, export, cache lookup or admin action cross a tenant boundary if a filter is omitted? A design without that test is incomplete.

> *"I will size for average, peak, and growth; reserve headroom for skew and failover; give each tenant token and concurrency quotas; and tie latency and availability targets to the customer's workflow. I prefer pooled economics for the common case, but I will pay for stronger isolation when the risk, performance, or regional requirement justifies it."*
