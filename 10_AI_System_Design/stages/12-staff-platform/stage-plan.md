# Stage 12 Plan: Staff-Level Platform Architecture

Prerequisite: [actual Stage 11 guide](../11-multi-region/guide.md), [state](../11-multi-region/stage-state.json), and [snapshot](../11-multi-region/architecture-after.md). Preserve the supplier workflow for Alice in Tenant A, plus Tenant B and Tenant C. The platform is hypothetical; prior executable slices and their limits are real repository artifacts.

Requirement: Assume four internal teams now copy supplier runtime and release logic, while Tenant A/B EU guarantees and Tenant C US placement must remain intact. Reduce duplicated operational work without centralising every request into one failure domain.

Architecture delta: Introduce versioned application manifests and a shared regional platform contract, not a forced microservice rewrite. Add adoption/exception review, explicit ownership, staged migration and a decision portfolio. Retain all previous policy, data, job, release, serving and recovery guarantees.

| Module | Treatment | Depth, evidence, and boundary |
| --- | --- | --- |
| 1.1 Requirements and architecture methodology | Revisited from [Stage 1](../01-mvp/guide.md) | D3: translate supplier/customer constraints into platform acceptance criteria |
| 1.3 Design documentation and communication | Taught at mapped depth | D3: reviewable design memo, evidence ledger, audience-specific defence and change record |
| 3.3 Distributed architecture patterns | Taught at mapped depth | D2: modular service, cell, event and control/data-plane patterns with failure boundaries |
| 11.1 Fine-tuning fundamentals | Revisited from [Stage 10](../10-fine-tuning/guide.md) | D2: adapter remains conditional on behaviour evidence |
| 11.2 Fine-tuning platform architecture | Revisited from [Stage 10](../10-fine-tuning/guide.md) | D1: model creation is a separate governed workflow behind the platform contract |
| 11.3 Distributed training infrastructure | Revisited from [Stage 10](../10-fine-tuning/guide.md) | D0: D0 reminder only; training specialisation remains deferred |
| 14.1 Evaluation architecture | Revisited from [Stage 8](../08-evaluation-releases/guide.md) | D3: contract and outcome gates accompany migration comparisons |
| 14.3 Model and data lifecycle infrastructure | Revisited from [Stage 10](../10-fine-tuning/guide.md) | D2: manifest pins model/data lineage; retirement follows descendants |
| 15.2 SRE and production operations | Revisited from [Stage 7](../07-reliability-consistency/guide.md) | D3: regional SLO/runbook ownership continues after centralisation |
| 16.2 Cloud networking and deployment | Revisited from [Stage 11](../11-multi-region/guide.md) | D2: deployment targets must respect Stage 11 cell/network boundaries |
| 16.3 Internal AI developer platforms | Taught at mapped depth | D3: versioned app contract, paved workflow and durable migration-controller slice |
| 17.1 AI unit economics | Revisited from [Stage 11](../11-multi-region/guide.md) | D3: per-success cost persists in showback and platform adoption |
| 17.2 Infrastructure capacity planning | Revisited from [Stage 11](../11-multi-region/guide.md) | D2: cell capacity is planned independently of developer onboarding |
| 17.3 Architecture economics | Taught at mapped depth | D3: three-year TCO, break-even, sensitivity and opportunity-cost exercise |
| 18.1 Architecture decision-making | Taught at mapped depth | D3: weighted options, hard constraints, ADR portfolio and reversal triggers |
| 18.2 Platform evolution and migration | Taught at mapped depth | D3: inventory, shadow, single-writer cutover, rollback and retirement with fault tests |
| 18.3 Technical leadership through system design | Taught at mapped depth | D3: ownership, review, incident authority, disagreement resolution and capstone defence |

Study budget: eight to ten hours integrated; D3 design, economics, developer platform, migration and leadership. Read in the five learning phases, predict the checkpoints, then run the lab and defend the decision. The integrated budget does not imply separate mastery of every revisited module.

Outcomes: Write and defend a decision memo; build/debug a durable migration slice; quantify three-year TCO and sensitivity; assign operating ownership; audit coverage and gaps.

Failure test and expected evidence are in the guide and executable test suite. Run Python tests, deterministic JavaScript cases, teaching parity/link checks, offline browser controls, design lint, curriculum validation, and clean-extraction tests. No real provider, training service, regional infrastructure, production identity, load test, or learner assessment is included.
