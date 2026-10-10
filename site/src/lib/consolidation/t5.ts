/**
 * Retired lesson keys for T5 (ai-systems-design), merged into `RENAMED` in curriculum.ts.
 * Key: `<moduleSlug>/<lessonSlug>` of a lesson that was published and is now retired.
 * Value: the `<moduleSlug>/<lessonSlug>` that now teaches it, or `null` when withdrawn.
 * next.config.ts turns every entry into a permanent redirect. One file per track keeps
 * parallel consolidation PRs from editing the same lines.
 */
export const RENAMED_T5: Record<string, string | null> = {
  // T5.1 to T5.4 consolidated (.website_spec/consolidation/T5.md).
  'design-framework/the-12-part-framework':
    'design-framework/the-twelve-part-design-framework',
  'design-framework/the-15-principles':
    'design-framework/design-principles-as-tie-breakers',
  'design-framework/worked-example-travel-agent':
    'design-framework/reviewing-an-agent-architecture',
  'sixty-minute-whiteboard/the-60-minute-whiteboard-method':
    'sixty-minute-whiteboard/the-six-step-whiteboard-clock',
  'architecture-patterns/monolith-vs-microservices':
    'architecture-patterns/monoliths-microservices-and-the-evolution-model',
  'architecture-patterns/ch23-system-design-patterns':
    'architecture-patterns/orchestration-patterns-for-agents',
  'classic-ai-designs/enterprise-ai-assistant':
    'classic-ai-designs/enterprise-ai-assistant-integration-layers-at-scale',
  'classic-ai-designs/customer-support-assistant':
    'classic-ai-designs/customer-support-assistant-knowledge-actions-and-approval',
  'classic-ai-designs/coding-assistant':
    'classic-ai-designs/coding-assistant-context-engineering-under-300-ms',
  'classic-ai-designs/recruiting-platform':
    'classic-ai-designs/recruiting-platform-explainable-ranking-human-decisions',
  'classic-ai-designs/logistics-exception-handling':
    'classic-ai-designs/logistics-exceptions-designing-around-a-policy-gate',
  'classic-ai-designs/enterprise-rag-with-access-control':
    'classic-ai-designs/access-controlled-enterprise-rag',
  'classic-ai-designs/whiteboard-scripts-enterprise-rag-on-databricks':
    'classic-ai-designs/access-controlled-rag-on-databricks',
  'classic-ai-designs/agent-platform-for-non-technical-users':
    'classic-ai-designs/safe-workflow-automation-for-non-technical-users',
  'classic-ai-designs/scoping-doc-to-deployed-agent-in-two-weeks':
    'classic-ai-designs/delivering-an-agent-in-two-weeks-with-enforced-gates',
}
