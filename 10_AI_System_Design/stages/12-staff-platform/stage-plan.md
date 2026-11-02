# Stage 12 Plan: Staff-Level Platform Architecture

Prerequisite: [actual Stage 11 guide](../11-multi-region/guide.md), [state](../11-multi-region/stage-state.json), and [snapshot](../11-multi-region/architecture-after.md). Preserve the supplier workflow for Alice in Tenant A, plus Tenant B and Tenant C. The platform is hypothetical; prior executable slices and their limits are real repository artifacts.

Requirement: Assume four internal teams now copy supplier runtime and release logic, while Tenant A and B EU guarantees and Tenant C US placement must remain intact. Reduce duplicated operational work without centralising every request into one failure domain.

Architecture delta: Introduce versioned application manifests and a shared regional platform contract, not a forced microservice rewrite. Full manifests, change records and shadow evidence stay in the tenant's region. A global control plane checks contracts and publishes signed, versioned route generations on opaque tenant, app and profile IDs; it holds no customer content, policy or membership ([ADR-013](../../architecture/decisions/ADR-013-regional-authority-and-route-generations.md)). Route records live in each cell's Stage 11 authority store. The cell checks current eligibility before it applies a generation by compare-and-set, keeps a last-known-good generation, and rolls back only by writing a newer generation, so a rolled-back one never returns. Platform releases roll out cell by cell from a canary cell. Add adoption and exception review, explicit ownership, staged migration with a dual-run overlap, and a decision portfolio. Retain all previous policy, data, job, release, serving and recovery guarantees.

| Module | Treatment | Depth, evidence, and boundary |
| --- | --- | --- |
| 1.1 Requirements and architecture methodology | Revisited from [Stage 1](../01-mvp/guide.md) | D3: translate supplier and tenant constraints into platform acceptance criteria |
| 1.3 Design documentation and communication | Taught at mapped depth | D3: one-page decision record with evidence ledger and change record, plus a memo section for a named reader |
| 3.3 Distributed architecture patterns | Taught at mapped depth | D2: modular service, cell, event, and control-plane versus data-plane patterns with failure boundaries |
| 11.1 Fine-tuning fundamentals | Revisited from [Stage 10](../10-fine-tuning/guide.md) | D2: an adapter stays conditional on behaviour evidence |
| 11.2 Fine-tuning platform architecture | Revisited from [Stage 10](../10-fine-tuning/guide.md) | D1: model creation is a separate governed workflow behind the platform contract |
| 11.3 Distributed training infrastructure | Revisited from [Stage 10](../10-fine-tuning/guide.md) | D0: reminder only; training specialisation remains deferred |
| 14.1 Evaluation architecture | Revisited from [Stage 8](../08-evaluation-releases/guide.md) | D3: contract and outcome gates accompany migration comparisons |
| 14.3 Model and data lifecycle infrastructure | Revisited from [Stage 10](../10-fine-tuning/guide.md) | D2: the manifest pins model and data lineage; retirement follows descendants |
| 15.2 Site reliability engineering (SRE) and production operations | Revisited from [Stage 7](../07-reliability-consistency/guide.md) | D3: regional service level objective (SLO) and runbook ownership continue after centralisation |
| 16.2 Cloud networking and deployment | Revisited from [Stage 11](../11-multi-region/guide.md) | D2: deployment targets respect Stage 11 cell and network boundaries |
| 16.3 Internal AI developer platforms | Taught at mapped depth | D3: versioned app contract, paved workflow, per-cell route authority and a durable migration-controller slice |
| 17.1 AI unit economics | Revisited from [Stage 11](../11-multi-region/guide.md) | D3: per-success cost persists in showback and platform adoption |
| 17.2 Infrastructure capacity planning | Revisited from [Stage 11](../11-multi-region/guide.md) | D2: cell capacity is planned independently of developer onboarding |
| 17.3 Architecture economics | Taught at mapped depth | D3: three-year total cost of ownership (TCO) with dual-run overlap, break-even and sensitivity; opportunity value stays qualitative |
| 18.1 Architecture decision-making | Taught at mapped depth | D3: weighted options, hard-constraint veto, architecture decision record (ADR) and reversal triggers |
| 18.2 Platform evolution and migration | Taught at mapped depth | D3: inventory, bound shadow evidence, single-writer cutover, rollback with history, and retirement, with fault tests |
| 18.3 Technical leadership through system design | Taught at mapped depth | D3: ownership, review, incident authority, disagreement resolution and a scored capstone defence |

Study budget: eight to ten hours integrated; D3 design, economics, developer platform, migration and leadership. Read in the five learning phases, predict the three checkpoints, run the lab, write the decision-exercise ADR against its rubric, then run the capstone (solo path available). The integrated budget does not imply separate mastery of every revisited module.

Outcomes: write a one-page ADR in which every option gets a hard-constraint verdict and one vetoes the top score, plus a memo section for a named reader; build and debug a durable migration slice with bound, append-only evidence and rollback history; quantify three-year TCO with a dual-run overlap and its sensitivity; state where route authority lives and how cells behave in a control-plane outage; assign operating ownership and pass the capstone rubric.

Failure tests: injected pre-commit failure, lost acknowledgement, stale generation, stale evidence after another change moved the route, a later clean report trying to erase a mismatch, rollback of a rollback, re-application of a rolled-back generation, a signed generation that fails current eligibility, and inspection after revocation, all in the executable suite. Run Python tests, deterministic JavaScript cases, teaching parity and link checks, the SVG fit check, and offline browser controls. No real provider, training service, regional infrastructure, signed distribution, production identity, load test or learner assessment is included.
