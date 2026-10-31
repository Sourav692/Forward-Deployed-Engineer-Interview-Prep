/**
 * Retired lesson keys for T2 (llm-and-retrieval), merged into `RENAMED` in curriculum.ts.
 * Key: `<moduleSlug>/<lessonSlug>` of a lesson that was published and is now retired.
 * Value: the `<moduleSlug>/<lessonSlug>` that now teaches it, or `null` when withdrawn.
 * next.config.ts turns every entry into a permanent redirect. One file per track keeps
 * parallel consolidation PRs from editing the same lines.
 */
export const RENAMED_T2: Record<string, string | null> = {
  // T2.1 How LLMs behave consolidated into three lessons.
  'how-llms-behave/module-01-embeddings': 'embeddings-and-model-selection/embedding-fundamentals-similarity-metrics-and-model-selection',
  // T2.2 RAG from first principles consolidated into six lessons.
  'rag-from-first-principles/what-rag-actually-is': 'rag-from-first-principles/the-knowledge-problem-hallucination-freshness-context-window-growth-rag-vs-fine',
  'rag-from-first-principles/module-01-rag-fundamentals-core-components':
    'rag-from-first-principles/the-rag-lifecycle-and-a-measured-baseline',
  // Module 2 is mostly framework material, now taught in T2.5.
  'rag-from-first-principles/module-02-rag-frameworks-tools-implementation':
    'rag-from-first-principles/your-first-langchain-rag-with-chroma',
  // T2.3 Chunking and indexing consolidated into eight lessons.
  'chunking-and-indexing/chunking-lab-and-drills': 'chunking-and-indexing/splitter-fundamentals-character-recursive-token-and-structure-aware',
  'chunking-and-indexing/chunking-reference-by-doc-type': 'chunking-and-indexing/splitter-fundamentals-character-recursive-token-and-structure-aware',
  'chunking-and-indexing/parent-document-retrieval-interview-tutorial':
    'advanced-indexing-strategies/parent-document-retrieval-in-memory-and-on-postgres',
  'chunking-and-indexing/chunking-retrieval-fusion': 'chunking-and-indexing/splitter-fundamentals-character-recursive-token-and-structure-aware',
  'chunking-and-indexing/module-09-memory-databases-caching-for-genai-systems':
    'vector-stores-and-index-operations/managed-stores-astra-db-and-pinecone',
  // T2.4 Retrieval consolidated into seven lessons.
  'retrieval-hybrid-rerank/rag-and-retrieval-interview-tutorial': 'retrieval-hybrid-rerank/retrieval-hybrid-rerank-interview-questions',
  'retrieval-hybrid-rerank/advanced-rag-techniques-interview-tutorial':
    'self-correcting-rag-crag-and-self-rag/corrective-rag-in-langgraph-with-web-search-fallback',
  'retrieval-hybrid-rerank/rag-retrieval-strategies': 'retrieval-hybrid-rerank/retriever-patterns-compared-hybrid-rerank-on-databricks-vector-search',
  'retrieval-hybrid-rerank/retrieval-hybrid-rerank': 'retrieval-hybrid-rerank/fusion-retrieval-score-normalisation-vs-rank-fusion',
  // T2.5 Frameworks consolidated into eight lessons.
  'langchain-and-langgraph/langchain-foundations-interview-tutorial':
    'lcel-runnables-and-chains/lcel-and-the-runnable-interface',
  'langchain-and-langgraph/langgraph-fundamentals-interview-tutorial':
    'langchain-and-langgraph/state-graphs-and-reducers',
  'langchain-and-langgraph/same-loop-in-langgraph': 'the-agent-loop-and-tool-calling/the-manual-tool-loop-and-the-augmented-llm-in-langgraph',
  // 2026-10-31: replaced by the RAG & Agents Engineering course (AI Engineering integration).
  'how-llms-behave/embeddings-and-similarity-search': 'embeddings-and-model-selection/embedding-fundamentals-similarity-metrics-and-model-selection',
  'how-llms-behave/choosing-and-changing-embedding-models': 'embeddings-and-model-selection/embedding-fundamentals-similarity-metrics-and-model-selection',
  'how-llms-behave/context-windows-temperature-and-token-limits': 'llm-provider-apis-and-model-selection/calling-commercial-llm-apis-openai-and-gemini',
  'rag-from-first-principles/what-rag-is-and-when-to-use-it': 'rag-from-first-principles/the-knowledge-problem-hallucination-freshness-context-window-growth-rag-vs-fine',
  'rag-from-first-principles/the-rag-pipeline-end-to-end': 'rag-from-first-principles/the-rag-lifecycle-and-a-measured-baseline',
  'rag-from-first-principles/ingestion-and-preprocessing': 'document-ingestion-and-metadata-design/the-document-abstraction-and-metadata-design',
  'rag-from-first-principles/grounded-generation': 'end-to-end-rag-systems/environment-setup-and-a-complete-rag-system',
  'rag-from-first-principles/evaluating-retrieval-and-generation-separately': 'rag-from-first-principles/the-rag-lifecycle-and-a-measured-baseline',
  'rag-from-first-principles/practise-rag-fundamentals': 'rag-from-first-principles/rag-from-first-principles-interview-questions',
  'chunking-and-indexing/why-retrieval-needs-chunks': 'chunking-and-indexing/splitter-fundamentals-character-recursive-token-and-structure-aware',
  'chunking-and-indexing/chunking-by-document-type': 'chunking-and-indexing/splitter-fundamentals-character-recursive-token-and-structure-aware',
  'chunking-and-indexing/how-vector-search-works': 'vector-stores-and-index-operations/embedded-stores-chroma-and-faiss',
  'chunking-and-indexing/choosing-a-database-and-vector-store': 'vector-stores-and-index-operations/managed-stores-astra-db-and-pinecone',
  'chunking-and-indexing/vector-indexes-in-production': 'vector-stores-and-index-operations/index-operations-create-query-update-delete-persist',
  'chunking-and-indexing/retrieve-small-return-large': 'advanced-indexing-strategies/parent-document-retrieval-in-memory-and-on-postgres',
  'chunking-and-indexing/advanced-index-structures': 'advanced-indexing-strategies/hierarchical-indices-summary-tier-and-detail-tier',
  'chunking-and-indexing/practise-chunking-and-indexing': 'chunking-and-indexing/chunking-and-indexing-interview-questions',
  'retrieval-hybrid-rerank/measuring-and-diagnosing-retrieval': 'rag-from-first-principles/the-rag-lifecycle-and-a-measured-baseline',
  'retrieval-hybrid-rerank/hybrid-search-and-rank-fusion': 'retrieval-hybrid-rerank/fusion-retrieval-score-normalisation-vs-rank-fusion',
  'retrieval-hybrid-rerank/query-transformation': 'query-transformation-and-routing/query-rewriting-and-expansion',
  'retrieval-hybrid-rerank/reranking-and-post-retrieval-filtering': 'post-retrieval-optimisation-and-reranking/cross-encoder-reranking-in-a-rag-chain',
  'retrieval-hybrid-rerank/retrieval-control-loops': 'self-correcting-rag-crag-and-self-rag/corrective-rag-in-langgraph-with-web-search-fallback',
  'retrieval-hybrid-rerank/production-retrieval-pipelines': 'retrieval-hybrid-rerank/retriever-patterns-compared-hybrid-rerank-on-databricks-vector-search',
  'retrieval-hybrid-rerank/practise-retrieval': 'retrieval-hybrid-rerank/retrieval-hybrid-rerank-interview-questions',
  'langchain-and-langgraph/what-a-framework-buys-you': 'rag-from-first-principles/your-first-langchain-rag-with-chroma',
  'langchain-and-langgraph/composing-pipelines-with-langchain': 'lcel-runnables-and-chains/lcel-and-the-runnable-interface',
  'langchain-and-langgraph/indexing-and-retrieval-with-llamaindex': 'framework-fluency-llamaindex/simple-pdf-and-csv-rag-in-llamaindex',
  'langchain-and-langgraph/modelling-workflows-as-state-graphs': 'langchain-and-langgraph/state-graphs-and-reducers',
  'langchain-and-langgraph/the-tool-calling-loop-in-langgraph': 'the-agent-loop-and-tool-calling/the-manual-tool-loop-and-the-augmented-llm-in-langgraph',
  'langchain-and-langgraph/checkpoints-interrupts-and-human-approval': 'langgraph-runtime-persistence-hitl-and-streaming/interrupts-and-human-in-the-loop',
  'langchain-and-langgraph/retries-fan-out-and-streaming': 'langgraph-runtime-persistence-hitl-and-streaming/async-and-streaming',
  'langchain-and-langgraph/practise-framework-interview-questions': 'langchain-and-langgraph/langchain-and-langgraph-interview-questions',
}
