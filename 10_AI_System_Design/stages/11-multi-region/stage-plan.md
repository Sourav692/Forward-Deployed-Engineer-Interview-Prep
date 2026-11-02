# Stage 11 Plan: Global Multi-Region Platform

Prerequisite: [actual Stage 10 guide](../10-fine-tuning/guide.md), [state](../10-fine-tuning/stage-state.json), and [snapshot](../10-fine-tuning/architecture-after.md). Preserve the supplier workflow for Alice in Tenant A, plus Tenant B and Tenant C. The platform is hypothetical; prior executable slices and their limits are real repository artifacts.

Requirement: Assume Tenant A and B require EU-contained content, while C uses a separate US cell. EU recovery targets are RPO 60 seconds and RTO 600 seconds, subject to authorised failover.

Architecture delta: Add regional cells and tenant placement policy, EU secondary recovery capacity, replication by data class, regional profile eligibility, and usage reconciliation. Retain single-writer ownership, current policy, approved model lineage and stable operations.

| Module | Treatment | Depth, evidence, and boundary |
| --- | --- | --- |
| 1.2 Estimation and capacity planning | Revisited from [Stage 1](../01-mvp/guide.md) | D3: separate RPS, tokens/minute, concurrency, and recovery timing |
| 2.1 Networking fundamentals | Revisited from [Stage 1](../01-mvp/guide.md) | D2: DNS caching, ingress reachability, TLS and private endpoint boundaries |
| 3.1 Distributed system fundamentals | Revisited from [Stage 7](../07-reliability-consistency/guide.md) | D3: single writer per tenant and fencing before failover |
| 5.1 Rate limiting and admission control | Revisited from [Stage 5](../05-overload-fairness/guide.md) | D3: admission follows the surviving regional dependency budget |
| 5.4 Fair scheduling and workload prioritization | Revisited from [Stage 5](../05-overload-fairness/guide.md) | D2: retain tenant shares under degraded capacity |
| 5.5 AI workload management | Revisited from [Stage 5](../05-overload-fairness/guide.md) | D3: reserve token and slot capacity, not just app replicas |
| 7.2 AI gateway and provider management | Revisited from [Stage 9](../09-inference-gpu/guide.md) | D3: route only to eligible regional provider profiles before dispatch |
| 8.1 Document ingestion and indexing | Revisited from [Stage 3](../03-enterprise-knowledge/guide.md) | D3: rebuild indexes from replicated source versions and tombstones |
| 8.3 Enterprise retrieval governance | Revisited from [Stage 6](../06-enterprise-security/guide.md) | D3: current policy authority remains required during recovery |
| 9.1 LLM execution and inference fundamentals | Revisited from [Stage 9](../09-inference-gpu/guide.md) | D2: token phases and context mix affect regional slots |
| 9.2 Model serving architecture | Revisited from [Stage 9](../09-inference-gpu/guide.md) | D2: warm model readiness differs from a running VM |
| 9.3 Inference performance optimization | Revisited from [Stage 9](../09-inference-gpu/guide.md) | D1: optimisation changes require measured local evidence |
| 10.3 GPU infrastructure and scheduling | Revisited from [Stage 9](../09-inference-gpu/guide.md) | D1: reserve accelerator availability within allowed geography |
| 12.1 Scaling and traffic engineering | Revisited from [Stage 4](../04-application-scaling/guide.md) | D3: app headroom cannot hide provider bottlenecks |
| 12.2 Resilience and fault tolerance | Revisited from [Stage 7](../07-reliability-consistency/guide.md) | D3: RPO/RTO runbook and explicit fail-closed cases |
| 13.2 Enterprise AI security | Revisited from [Stage 6](../06-enterprise-security/guide.md) | D3: datasets, models, telemetry and egress follow residency policy |
| 13.3 Multi-tenant platform design | Revisited from [Stage 6](../06-enterprise-security/guide.md) | D3: trusted per-tenant home/allowed-region policy |
| 15.2 SRE and production operations | Revisited from [Stage 7](../07-reliability-consistency/guide.md) | D3: incident roles, promotion evidence and failback |
| 15.3 Performance and incident diagnosis | Revisited from [Stage 7](../07-reliability-consistency/guide.md) | D3: separate route, authority, replica and model readiness failures |
| 16.1 Container and orchestration architecture | Revisited from [Stage 9](../09-inference-gpu/guide.md) | D2: regional image/artifact pinning, readiness and drain |
| 16.2 Cloud networking and deployment | Taught at mapped depth | D2: regional ingress, service/private routes, region-contained data and deployment exercise |
| 17.1 AI unit economics | Taught at mapped depth | D3: cost per successful workflow with retries, failed spend, idle reserve and duplicate-safe usage evidence |
| 17.2 Infrastructure capacity planning | Taught at mapped depth | D2: regional peak and recovery capacity by app, tokens and slots; headroom exercise |

Study budget: six to eight hours integrated; D3 economics with D2 networking/capacity. Read in the five learning phases, predict the checkpoints, then run the lab and defend the decision. The integrated budget does not imply separate mastery of every revisited module.

Outcomes: Draw trust and residency boundaries; calculate recovery/capacity; build and debug usage and recovery guards; defend locality against availability.

Failure test and expected evidence are in the guide and executable test suite. Run Python tests, deterministic JavaScript cases, teaching parity/link checks, offline browser controls, design lint, curriculum validation, and clean-extraction tests. No real provider, training service, regional infrastructure, production identity, load test, or learner assessment is included.
