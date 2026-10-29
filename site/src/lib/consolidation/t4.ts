/**
 * Retired lesson keys for T4 (production-ai), merged into `RENAMED` in curriculum.ts.
 * Key: `<moduleSlug>/<lessonSlug>` of a lesson that was published and is now retired.
 * Value: the `<moduleSlug>/<lessonSlug>` that now teaches it, or `null` when withdrawn.
 * next.config.ts turns every entry into a permanent redirect. One file per track keeps
 * parallel consolidation PRs from editing the same lines.
 */
export const RENAMED_T4: Record<string, string | null> = {
  // T4.1, T4.2, T4.4 consolidated (canonical-homes spec, "Consolidated modules").
  'enterprise-rag-in-production/why-enterprise-changes-the-problem':
    'enterprise-rag-in-production/why-access-control-shapes-enterprise-rag',
  'enterprise-rag-in-production/access-control-abac': 'enterprise-rag-in-production/the-seven-access-rules',
  'enterprise-rag-in-production/ingestion-pipeline': 'enterprise-rag-in-production/permission-aware-ingestion',
  'enterprise-rag-in-production/the-query-graph': 'enterprise-rag-in-production/the-security-first-query-graph',
  'enterprise-rag-in-production/output-guardrails': 'enterprise-rag-in-production/output-guardrails-and-refusals',
  'evaluation-and-release-gates/evaluation-golden-sets-judges': 'evaluation-and-release-gates/golden-sets-and-sample-size',
  'evaluation-and-release-gates/ch12-validation-and-measurement': 'evaluation-and-release-gates/the-evaluation-pyramid',
  'security-tenancy-prompt-injection/prompt-injection-egress-tenancy':
    'security-tenancy-prompt-injection/prompt-injection-and-egress-control',
  'security-tenancy-prompt-injection/identity-secrets-tenant-fairness':
    'security-tenancy-prompt-injection/identity-verification-with-sso-and-oidc',
  'security-tenancy-prompt-injection/identity-secrets-and-tenant-fairness':
    'security-tenancy-prompt-injection/identity-verification-with-sso-and-oidc',
  'security-tenancy-prompt-injection/cross-cutting-system-design-quick-reference-v2':
    'security-tenancy-prompt-injection/practise-security-and-tenancy',
  // T4.3, T4.5–T4.8 consolidated (.website_spec/consolidation/T4-operations-scale.md).
  'observability-and-diagnosis/observability': 'observability-and-diagnosis/the-run-trace',
  'observability-and-diagnosis/observability-standards-failure-patterns':
    'observability-and-diagnosis/standard-tracing-and-customer-facing-dashboards',
  'observability-and-diagnosis/observability-standards-and-failure-patterns':
    'observability-and-diagnosis/standard-tracing-and-customer-facing-dashboards',
  'observability-and-diagnosis/production-and-operations-interview-tutorial':
    'observability-and-diagnosis/practise-observability-and-diagnosis',
  'cost-and-latency/core-8-drivers-memorize': 'cost-and-latency/the-eight-cost-and-latency-drivers',
  'cost-and-latency/cram-sheet-full-playbook': 'cost-and-latency/why-cost-and-latency-decide-production',
  'cost-and-latency/cram-sheet-s15-s16': 'cost-and-latency/practise-cost-and-latency',
  'cost-and-latency/additions-beyond-playbook': 'cost-and-latency/latency-prefill-decode-streaming-and-the-tail',
  'cost-and-latency/cost-latency-cicd-rigor-and-build-vs-buy': 'cost-and-latency/caching-in-genai-systems',
  'cost-and-latency/module-09-caching-in-genai-systems': 'cost-and-latency/caching-in-genai-systems',
  'scaling-and-reliability/scaling-to-20m-documents': 'scaling-and-reliability/what-breaks-at-twenty-million-documents',
  'agentops/prompt-versioning-rollout-rollback': 'agentops/prompt-versioning-rollout-and-rollback',
  'agentops/agentops-on-databricks': 'agentops/prompt-versioning-rollout-and-rollback',
  'agentops/enterprise-rag-on-databricks': 'enterprise-rag-in-production/why-access-control-shapes-enterprise-rag',
  'agentops/multi-channel-and-hitl-escalation': 'agentops/channel-adapters-and-human-escalation',
  'agentops/red-teaming': 'agentops/red-teaming-and-layered-guardrails',
  'agentops/infra-and-cicd': 'agentops/infrastructure-as-code-and-the-release-pipeline',
  'agentops/production-and-platform-judgment-agentops-on-databricks': 'agentops/prompt-versioning-rollout-and-rollback',
  // The Databricks lessons left the site on 29 October 2026 (a future addition in the
  // production plan); their URLs go to the vendor-neutral lessons on the same ground.
  'agentops/agentops-mapped-to-databricks': 'agentops/prompt-versioning-rollout-and-rollback',
  'agentops/enterprise-rag-on-a-governed-lakehouse': 'enterprise-rag-in-production/why-access-control-shapes-enterprise-rag',
  'agentops/enterprise-rag-on-a-governed-lakehouse-running-and-auditing': 'enterprise-rag-in-production/why-access-control-shapes-enterprise-rag',
  'model-adaptation-and-serving/ch08-learning-in-agentic-systems': 'model-adaptation-and-serving/four-learning-surfaces',
}
