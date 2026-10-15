/** Canonical root sources. Split lessons share a case; lesson/progress IDs stay unchanged. */
const root = '01_Concept_Tutorials/Consolidated_Lessons/T5.4_Casebook_Classic_AI_Designs'

export const EXPLORERS = [
  { id: 'enterprise-assistant', lessons: ['enterprise-ai-assistant-integration-layers-at-scale'], stem: 'enterprise_assistant' },
  { id: 'customer-support', lessons: ['customer-support-assistant-knowledge-actions-and-approval'], stem: 'customer_support' },
  { id: 'coding-assistant', lessons: ['coding-assistant-context-engineering-under-300-ms'], stem: 'coding_assistant' },
  { id: 'recruiting-platform', lessons: ['recruiting-platform-explainable-ranking-human-decisions'], stem: 'recruiting_platform' },
  { id: 'logistics-exceptions', lessons: ['logistics-exceptions-designing-around-a-policy-gate'], stem: 'logistics_exceptions' },
  { id: 'enterprise-rag', lessons: ['access-controlled-enterprise-rag', 'access-controlled-enterprise-rag-retrieval-and-release'], stem: 'enterprise_rag' },
  { id: 'databricks-rag', lessons: ['access-controlled-rag-on-databricks', 'access-controlled-rag-on-databricks-testing-and-operations'], stem: 'databricks_rag' },
  { id: 'workflow-automation', lessons: ['safe-workflow-automation-for-non-technical-users'], stem: 'workflow_automation' },
  { id: 'two-week-delivery', lessons: ['delivering-an-agent-in-two-weeks-with-enforced-gates'], stem: 'two_week_delivery' }
].map(({ stem, ...entry }) => ({ ...entry, source: `${root}/${stem}_explorer.json`, html: `${root}/${stem}_fde_explorer.html` }))
