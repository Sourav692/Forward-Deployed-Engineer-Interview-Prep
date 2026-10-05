# T4.3 Observability and Production Diagnosis: Consolidated Lessons

These six lessons are the site's teaching copy of module T4.3 "Observability and production diagnosis". Each concept is taught once, in the house tutorial format, drawing only on repository sources. The site publishes them at `/learn/production-ai/observability-and-diagnosis`.

| # | Lesson | Site slug |
|---|---|---|
| 1 | [Logs, Metrics, and Traces](01_Logs_Metrics_and_Traces.md) | `logs-metrics-and-traces` |
| 2 | [The Run Trace](02_The_Run_Trace.md) | `the-run-trace` |
| 3 | [Standard Tracing and Customer-Facing Dashboards](03_Standard_Tracing_and_Customer_Facing_Dashboards.md) | `standard-tracing-and-customer-facing-dashboards` |
| 4 | [Production Monitoring: Metrics, Drift, and SLOs](04_Production_Monitoring_Metrics_Drift_and_SLOs.md) | `production-monitoring-metrics-drift-and-slos` |
| 5 | [Diagnosing Production Incidents](05_Diagnosing_Production_Incidents.md) | `diagnosing-production-incidents` |
| 6 | [Practise Observability and Diagnosis Interview Questions](06_Practise_Observability_and_Diagnosis_Interview_Questions.md) | `practise-observability-and-diagnosis` |

## Sources

- `01_Concept_Tutorials/FDE_Handbook/04_Enterprise_RAG/08_Observability.md` (own material).
- `01_Concept_Tutorials/FDE_Handbook/06_Cross_Cutting_Concerns/02_Observability_Standards_Failure_Patterns.md` and its duplicate `01_Concept_Tutorials/Production_and_Platform_Judgment/02-observability-standards-and-failure-patterns.md` (own material; the failure-pattern sections are taught in T4.6).
- `01_Concept_Tutorials/RAG_and_Agent_Topic_Guides/12_production_and_operations_INTERVIEW_TUTORIAL.md` (own material; its web-sourced interview answers in §4 are not reused). Its caching, routing and budget sections are taught in T4.5, its resilience sections in T4.6, and its red-teaming and guardrail sections in T4.7.
- `01_Concept_Tutorials/Cost_and_Latency_Optimization/` notes on the third-party *GenAI FDE Cost and Latency Optimization Playbook* (summarised in our own words; lessons 2, 4, 5 and 6 carry a credit line).

The source files stay in the repository unchanged. The site no longer publishes the four old T4.3 lessons separately; old URLs redirect to the matching lesson here. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.
