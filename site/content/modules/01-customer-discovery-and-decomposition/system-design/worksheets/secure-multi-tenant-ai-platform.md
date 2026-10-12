# Secure Multi-Tenant AI Platform - Case Study Worksheet

## 1. Interview prompt
As the FDE, design a GenAI **Secure Multi-Tenant AI Platform**. A single application serves 500 enterprise tenants. Each one needs its data kept apart, steady performance, and control over the region its data lives in. The failure to fear most is a query that runs without its tenant predicate.

## 2. Clarify the customer problem
- Which classes of data are in scope, and which are out?
- What proof of isolation will auditors ask for?
- Is regional placement a hard rule, or an exception a few customers ask for?
- When they say "predictable performance", do they mean latency, throughput or fair sharing?
- Which tenants can run on shared infrastructure, and which must have their own?

## 3. Users and workflows
| User | Workflow | Current pain | AI assist opportunity | Human approval needed? |
|---|---|---|---|---|
| Tenant end user |  |  |  |  |
| Tenant administrator |  |  |  |  |
| Platform operator |  |  |  |  |
| Security / compliance auditor |  |  |  |  |

## 4. Requirements
### Functional
-
-
-

### Non-functional
- Latency target:
- Availability target:
- Cost budget:
- Security/privacy constraints:
- Audit/compliance requirement:

## 5. Data and integration map
| Data source | Format | Owner | Freshness | Permission model | Risk |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## 6. Proposed architecture
Pick a rendered diagram as your starting point and adapt it to this case. Cover each part below:
- Identity and tenant context:
- Policy and region:
- Quota and admission:
- Partitioned storage:
- Audit:
- Monitoring:

## 7. Evaluation plan
| Metric | Good threshold | Bad threshold | Test dataset | Owner |
|---|---:|---:|---|---|
| Cross-tenant incidents | None | One or more | Incident records and audit logs | Security team |
| Isolation-test pass rate | Every test passes | A single failure | Attack-style isolation suite | Security engineering |
| Per-tenant p95 latency | Inside the SLO | Stays over the SLO | Request telemetry split by tenant | SRE |
| Cost per tenant | Inside the expected band | Over the band | Usage-based billing data | Finance and platform |

## 8. Failure modes
- A query runs with no tenant predicate
- A cache key leaves out the tenant id
- Payload metadata leaks through a shared queue
- Vector search returns a neighbouring tenant's content
- One tenant uses up the shared quota
- A region fails, or traffic lands in the wrong region

## 9. Rollout plan
1. Begin with internal test tenants and nobody else.
2. Run the adversarial isolation suite; a failure stops progress.
3. Admit a few small shared tenants on tight quotas.
4. Check latency, cost and support load.
5. Offer the dedicated tier only when thresholds justify it.
6. Watch incidents and rehearse failover.

## 10. Weak vs strong answer
**Weak:** "I'd add a tenant_id column to every table and switch on row-level security."

**Strong:** "I'd take tenant context from verified identity and freeze it. I'd keep the control plane apart from the data plane. Row, object, cache, queue, log, vector and key layers would each enforce isolation on their own. A missing predicate fails closed, and no rollout stage passes without the adversarial isolation suite."

## 11. Candidate scorecard
| Area | 1 | 3 | 5 | Score |
|---|---|---|---|---|
| Problem framing | Starts with tools | Names some tenants and metrics | Shares by default; clear path for exceptions |  |
| Architecture | Generic service boxes | Sensible components | Splits control and data planes; fails closed |  |
| Evaluation | Isolation left vague | A few basic tests | Adversarial suite used as a gate |  |
| Production thinking | Stops at the demo | Some monitoring | Limits blast radius; rollback and drills |  |
| Communication | Dumps technical detail | Mostly clear | Opens with outcome and risk |  |
