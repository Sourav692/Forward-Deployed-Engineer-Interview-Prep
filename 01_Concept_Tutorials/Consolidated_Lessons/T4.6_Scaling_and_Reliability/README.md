# T15.11 Scaling and Reliability: Consolidated Lessons

These six lessons are the site's teaching copy of module T15.11 "Scaling and reliability". Each concept is taught once, in the house tutorial format, drawing only on repository sources. The site publishes them at `/learn/production-ai/scaling-and-reliability`.

| # | Lesson | Site slug |
|---|---|---|
| 1 | [What Breaks at Twenty Million Documents](01_What_Breaks_at_Twenty_Million_Documents.md) | `what-breaks-at-twenty-million-documents` |
| 2 | [Scaling the Index and Access Control](02_Scaling_the_Index_and_Access_Control.md) | `scaling-the-index-and-access-control` |
| 3 | [Capacity, Latency, and Cost at Scale](03_Capacity_Latency_and_Cost_at_Scale.md) | `capacity-latency-and-cost-at-scale` |
| 4 | [Retries, Circuit Breakers, and Bulkheads](04_Retries_Circuit_Breakers_and_Bulkheads.md) | `retries-circuit-breakers-and-bulkheads` |
| 5 | [Failover, Graceful Degradation, and Kill Switches](05_Failover_Graceful_Degradation_and_Kill_Switches.md) | `failover-graceful-degradation-and-kill-switches` |
| 6 | [Practise Scaling and Reliability Interview Questions](06_Practise_Scaling_and_Reliability_Interview_Questions.md) | `practise-scaling-and-reliability` |

## Sources

- `01_Concept_Tutorials/FDE_Handbook/06_Cross_Cutting_Concerns/06_Scaling_To_20M_Documents.md` (own material). Its §7 chunking by document type and §8 parent-child chunking belong to T6.2 Chunking and indexing and are not taught here.
- `01_Concept_Tutorials/FDE_Handbook/06_Cross_Cutting_Concerns/02_Observability_Standards_Failure_Patterns.md` and `01_Concept_Tutorials/Production_and_Platform_Judgment/02-observability-standards-and-failure-patterns.md`: failover, degradation, bulkhead and kill-switch sections (own material).
- `01_Concept_Tutorials/RAG_and_Agent_Topic_Guides/12_production_and_operations_INTERVIEW_TUTORIAL.md`: retry, fallback, degradation and circuit-breaker sections and the mock gateway design (own material; web-sourced interview answers not reused).
- `01_Concept_Tutorials/Cost_and_Latency_Optimization/CRAM_SHEET_FULL_PLAYBOOK.md` (notes on the third-party *GenAI FDE Cost and Latency Optimization Playbook*, summarised in our own words; lesson 3 carries a credit line) and `ADDITIONS_BEYOND_PLAYBOOK.md` (Little's Law).

The source files stay in the repository unchanged. The old lesson "Scaling to Twenty Million Documents" now redirects here. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.
