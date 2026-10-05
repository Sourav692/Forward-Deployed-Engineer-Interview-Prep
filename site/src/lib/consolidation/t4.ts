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
}
