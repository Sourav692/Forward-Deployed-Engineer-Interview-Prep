/**
 * Retired lesson keys for T2 (llm-and-retrieval), merged into `RENAMED` in curriculum.ts.
 * Key: `<moduleSlug>/<lessonSlug>` of a lesson that was published and is now retired.
 * Value: the `<moduleSlug>/<lessonSlug>` that now teaches it, or `null` when withdrawn.
 * next.config.ts turns every entry into a permanent redirect. One file per track keeps
 * parallel consolidation PRs from editing the same lines.
 */
export const RENAMED_T2: Record<string, string | null> = {
  // T2.1 How LLMs behave consolidated into three lessons.
  'how-llms-behave/module-01-embeddings': 'how-llms-behave/embeddings-and-similarity-search',
  // T2.2 RAG from first principles consolidated into six lessons.
  'rag-from-first-principles/what-rag-actually-is': 'rag-from-first-principles/what-rag-is-and-when-to-use-it',
  'rag-from-first-principles/module-01-rag-fundamentals-core-components':
    'rag-from-first-principles/the-rag-pipeline-end-to-end',
  // Module 2 is mostly framework material, now taught in T2.5.
  'rag-from-first-principles/module-02-rag-frameworks-tools-implementation':
    'langchain-and-langgraph/what-a-framework-buys-you',
  // T2.3 Chunking and indexing consolidated into eight lessons.
  'chunking-and-indexing/chunking-lab-and-drills': 'chunking-and-indexing/chunking-by-document-type',
  'chunking-and-indexing/chunking-reference-by-doc-type': 'chunking-and-indexing/chunking-by-document-type',
  'chunking-and-indexing/parent-document-retrieval-interview-tutorial':
    'chunking-and-indexing/retrieve-small-return-large',
  'chunking-and-indexing/chunking-retrieval-fusion': 'chunking-and-indexing/why-retrieval-needs-chunks',
  'chunking-and-indexing/module-09-memory-databases-caching-for-genai-systems':
    'chunking-and-indexing/choosing-a-database-and-vector-store',
  // T2.4 Retrieval consolidated into seven lessons.
  'retrieval-hybrid-rerank/rag-and-retrieval-interview-tutorial': 'retrieval-hybrid-rerank/practise-retrieval',
  'retrieval-hybrid-rerank/advanced-rag-techniques-interview-tutorial':
    'retrieval-hybrid-rerank/retrieval-control-loops',
  'retrieval-hybrid-rerank/rag-retrieval-strategies': 'retrieval-hybrid-rerank/production-retrieval-pipelines',
  'retrieval-hybrid-rerank/retrieval-hybrid-rerank': 'retrieval-hybrid-rerank/hybrid-search-and-rank-fusion',
  // T2.5 Frameworks consolidated into eight lessons.
  'langchain-and-langgraph/langchain-foundations-interview-tutorial':
    'langchain-and-langgraph/composing-pipelines-with-langchain',
  'langchain-and-langgraph/langgraph-fundamentals-interview-tutorial':
    'langchain-and-langgraph/modelling-workflows-as-state-graphs',
  'langchain-and-langgraph/same-loop-in-langgraph': 'langchain-and-langgraph/the-tool-calling-loop-in-langgraph',
}
