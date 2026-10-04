/**
 * Skills and competency areas. A skill's proficiency (0–4) is derived from evidence:
 * checkpoints, exercises, mocks and projects tagged with its id.
 */
import type { Competency, Skill } from '../types'

export const COMPETENCIES: Competency[] = [
  { id: 'engineering', title: 'Engineering foundations', skillIds: ['python-services', 'data-sql', 'distributed-systems'] },
  { id: 'llm-retrieval', title: 'LLMs and retrieval', skillIds: ['llm-behaviour', 'retrieval-design'] },
  { id: 'agents', title: 'Agentic systems', skillIds: ['agent-design', 'agent-reliability'] },
  { id: 'production', title: 'Production AI', skillIds: ['evaluation', 'observability', 'security', 'cost-latency'] },
  { id: 'design', title: 'Systems design', skillIds: ['design-method', 'architecture-tradeoffs'] },
  { id: 'fde', title: 'Forward deployed delivery', skillIds: ['discovery-scoping', 'delivery-adoption', 'customer-debugging'] },
  { id: 'communication', title: 'Communication', skillIds: ['storytelling', 'exec-communication'] },
]

const skill = (id: string, title: string, competencyId: string, moduleIds: string[]): Skill => ({
  id,
  title,
  competencyId,
  moduleIds,
})

export const SKILLS: Skill[] = [
  skill('python-services', 'Typed, tested Python services', 'engineering', ['t1-1', 't1-2', 't1-4', 't1-6']),
  skill('data-sql', 'Analytical SQL and data modelling', 'engineering', ['t1-3']),
  skill('distributed-systems', 'Idempotency, queues and consistency', 'engineering', ['t1-5', 't4-6']),
  skill('llm-behaviour', 'LLM behaviour, tokens and cost', 'llm-retrieval', ['t2-1', 't2-6']),
  skill('retrieval-design', 'Retrieval and chunking design', 'llm-retrieval', ['t2-2', 't2-3', 't2-4', 't4-1']),
  skill('agent-design', 'Agent loops, tools and memory', 'agents', ['t3-1', 't3-2', 't3-3', 't3-4']),
  skill('agent-reliability', 'Guards, retries and workflows', 'agents', ['t3-5', 't3-7']),
  skill('evaluation', 'Evaluation and release gates', 'production', ['t4-2', 't4-7']),
  skill('observability', 'Tracing, SLOs and diagnosis', 'production', ['t4-3']),
  skill('security', 'Threat models, tenancy and injection', 'production', ['t4-4', 't4-1']),
  skill('cost-latency', 'Cost and latency engineering', 'production', ['t4-5', 't4-8']),
  skill('design-method', 'Structured design answers', 'design', ['t5-1', 't5-2', 't0-3']),
  skill('architecture-tradeoffs', 'Patterns and trade-offs', 'design', ['t5-3', 't5-4', 't5-5']),
  skill('discovery-scoping', 'Discovery, decomposition and scoping', 'fde', ['t6-1', 't6-2', 't6-4']),
  skill('delivery-adoption', 'Delivery gates and adoption', 'fde', ['t6-3', 't6-5']),
  skill('customer-debugging', 'Debugging in customer environments', 'fde', ['t6-6']),
  skill('storytelling', 'Grounded project stories', 'communication', ['t7-1', 't7-2', 't7-3', 't7-4']),
  skill('exec-communication', 'Executive communication', 'communication', ['t7-5']),
]
