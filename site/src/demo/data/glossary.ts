/**
 * Sample glossary for the /demo prototype. Original short definitions written for the
 * prototype only. Sorted alphabetically by term.
 */
import type { GlossaryTerm } from '../types'

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'abac',
    term: 'ABAC',
    expansion: 'Attribute-based access control',
    definition:
      'An access model that decides permissions from attributes of the user, the resource and the context, such as department, sensitivity label or region. It suits retrieval systems where group lists alone are too coarse.',
    moduleIds: ['t4-4'],
  },
  {
    id: 'agent-loop',
    term: 'Agent loop',
    definition:
      'The cycle in which a model reads the current state, chooses a tool or answer, the runtime executes the tool and feeds the result back. Production loops add a step budget, timeouts and an escalation path.',
    moduleIds: ['t3-1', 't3-5'],
  },
  {
    id: 'bm25',
    term: 'BM25',
    expansion: 'Best Match 25',
    definition:
      'A keyword ranking function that scores documents by term frequency and rarity, adjusted for document length. It remains a strong baseline for exact terms such as product codes and names.',
    moduleIds: ['t2-4'],
  },
  {
    id: 'canary-release',
    term: 'Canary release',
    definition:
      'Rolling a change out to a small share of traffic first and comparing its metrics with the existing version before widening. It limits the blast radius of a bad model or prompt change.',
    moduleIds: ['t4-2', 't4-6'],
  },
  {
    id: 'chunking',
    term: 'Chunking',
    definition:
      'Splitting documents into retrievable passages before embedding and indexing. Chunk size and boundaries, such as headings or paragraphs, strongly affect retrieval quality.',
    moduleIds: ['t2-3'],
  },
  {
    id: 'context-window',
    term: 'Context window',
    definition:
      'The maximum number of tokens a model can consider in one request, covering instructions, retrieved text, history and output. Filling it is not free: cost and latency grow and relevant facts can be overlooked.',
    moduleIds: ['t2-2', 't4-5'],
  },
  {
    id: 'degradation-ladder',
    term: 'Degradation ladder',
    definition:
      'A planned sequence of fallbacks a system steps down when a dependency fails or load spikes, for example from full generation to cached answers to search results only. It keeps the service useful rather than failing outright.',
    moduleIds: ['t4-6'],
  },
  {
    id: 'embedding',
    term: 'Embedding',
    definition:
      'A dense vector representation of text in which semantically similar passages sit close together. Embeddings power vector search but can miss exact identifiers that keyword search catches.',
    moduleIds: ['t2-2', 't2-3'],
  },
  {
    id: 'fde',
    term: 'FDE',
    expansion: 'Forward Deployed Engineer',
    definition:
      'An engineer who works directly with customers to scope, build and ship software inside their environment. The role blends engineering depth with discovery, delivery and communication.',
    moduleIds: ['t6-1', 't6-3'],
  },
  {
    id: 'fine-tuning',
    term: 'Fine-tuning',
    definition:
      'Further training a pretrained model on task-specific examples to change its behaviour or format. It is usually a later step after prompting and retrieval, because it costs more to iterate and does not add fresh knowledge reliably.',
    moduleIds: ['t2-2'],
  },
  {
    id: 'golden-set',
    term: 'Golden set',
    definition:
      'A curated set of inputs with expected outputs or reference evidence used to evaluate a system repeatably. It should reflect real user questions, including hard and adversarial cases.',
    moduleIds: ['t4-2'],
  },
  {
    id: 'groundedness',
    term: 'Groundedness',
    definition:
      'The degree to which an answer is supported by the retrieved sources rather than the model\'s own assumptions. A grounded answer can still be wrong if retrieval found the wrong source.',
    moduleIds: ['t4-2', 't2-2'],
  },
  {
    id: 'hybrid-retrieval',
    term: 'Hybrid retrieval',
    definition:
      'Combining keyword search such as BM25 with vector search and merging the results, often by reciprocal rank fusion. It captures both exact matches and paraphrases.',
    moduleIds: ['t2-4'],
  },
  {
    id: 'idempotency',
    term: 'Idempotency',
    definition:
      'The property that repeating an operation has the same effect as doing it once. Agents and retries make idempotency keys essential for side-effecting tools such as payments.',
    moduleIds: ['t3-5', 't4-6'],
  },
  {
    id: 'kv-cache',
    term: 'KV cache',
    expansion: 'Key-value cache',
    definition:
      'Stored attention keys and values from earlier tokens so a model does not recompute them for each new token. Reusing it across requests with a shared prefix cuts latency and cost.',
    moduleIds: ['t4-5'],
  },
  {
    id: 'llm-as-judge',
    term: 'LLM-as-judge',
    definition:
      'Using a language model to grade outputs against a rubric, such as groundedness or helpfulness. It scales evaluation but must be calibrated against human labels and checked for bias.',
    moduleIds: ['t4-2'],
  },
  {
    id: 'mcp',
    term: 'MCP',
    expansion: 'Model Context Protocol',
    definition:
      'An open protocol for exposing tools, resources and prompts to model applications through a standard client and server interface. It lets one integration serve many agent hosts.',
    moduleIds: ['t3-1'],
  },
  {
    id: 'p95-latency',
    term: 'p95 latency',
    definition:
      'The response time below which ninety-five per cent of requests complete. It reveals tail slowness that averages hide, and is a common basis for latency targets.',
    moduleIds: ['t4-3', 't4-5'],
  },
  {
    id: 'prompt-injection',
    term: 'Prompt injection',
    definition:
      'An attack in which text supplied by a user or a retrieved document tries to override the system\'s instructions. Defences treat such text as data and enforce permissions outside the model.',
    moduleIds: ['t4-4'],
  },
  {
    id: 'rag',
    term: 'RAG',
    expansion: 'Retrieval-augmented generation',
    definition:
      'A pattern that retrieves relevant passages from a corpus and supplies them to the model as context for its answer. It keeps answers current and citable without retraining the model.',
    moduleIds: ['t2-2', 't4-1'],
  },
  {
    id: 'recall-at-k',
    term: 'recall@k',
    definition:
      'The share of relevant documents that appear in the top k retrieved results. It measures whether retrieval gives the model a chance to answer correctly.',
    moduleIds: ['t2-4', 't4-2'],
  },
  {
    id: 'reranker',
    term: 'Reranker',
    definition:
      'A model, often a cross-encoder, that rescores a shortlist of retrieved candidates against the query for finer ordering. It trades extra latency for better precision at the top.',
    moduleIds: ['t2-4'],
  },
  {
    id: 'sli',
    term: 'SLI',
    expansion: 'Service level indicator',
    definition:
      'A measured signal of service health, such as the fraction of requests answered within four seconds. SLIs are the numbers that SLOs set targets for.',
    moduleIds: ['t4-3'],
  },
  {
    id: 'slo',
    term: 'SLO',
    expansion: 'Service level objective',
    definition:
      'A target for an SLI over a time window, such as ninety-nine per cent of requests under four seconds over thirty days. The gap to one hundred per cent is the error budget.',
    moduleIds: ['t4-3', 't4-6'],
  },
  {
    id: 'star',
    term: 'STAR',
    expansion: 'Situation, task, action, result',
    definition:
      'A structure for behavioural answers that sets the scene, states your responsibility, describes what you did and quantifies the outcome. Strong answers spend most time on action and result.',
    moduleIds: ['t7-1'],
  },
  {
    id: 'tenancy',
    term: 'Tenancy',
    definition:
      'How a platform separates the data and resources of different customers. Options range from shared stores with tenant filters to fully dedicated stacks per tenant.',
    moduleIds: ['t4-4', 't4-6'],
  },
]
