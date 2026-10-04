/**
 * Checkpoint items for module T2.4 (Retrieval: hybrid, rerank, query transformation)
 * in the /demo prototype.
 *
 * Sample content written for the prototype only. Scenarios are fictional.
 */

import type { AssessmentItem } from '../types'

export const T2_4_ITEMS: AssessmentItem[] = [
  {
    id: 't2-4-cp-q1',
    kind: 'multiple-choice',
    prompt: 'Which query is pure dense vector search most likely to handle poorly compared with keyword search?',
    options: [
      { id: 'a', text: 'How do I get a refund for a late delivery?' },
      { id: 'b', text: 'Error code ERR-4471 on invoice export' },
      { id: 'c', text: 'Ways to reduce churn among new customers' },
      { id: 'd', text: 'What is our policy on working from abroad?' },
    ],
    correctOptionId: 'b',
    explanation: 'Exact identifiers such as error codes carry little semantic meaning for an embedding model, so nearest neighbours may match similar-looking codes. Keyword search matches the exact string, which is why hybrid retrieval helps here.',
    skillId: 'retrieval-design',
    remediationModuleId: 't2-4',
  },
  {
    id: 't2-4-cp-q2',
    kind: 'multiple-choice',
    prompt: 'What is the main advantage of reciprocal rank fusion when merging keyword and vector results?',
    options: [
      { id: 'a', text: 'It retrieves more documents than either method alone' },
      { id: 'b', text: 'It removes the need for a reranker' },
      { id: 'c', text: 'It combines lists using ranks, so it needs no calibration between incompatible score scales' },
      { id: 'd', text: 'It guarantees the most relevant document is ranked first' },
    ],
    correctOptionId: 'c',
    explanation: 'Keyword scores and cosine similarities sit on different scales. Reciprocal rank fusion uses only each document\'s rank in each list, which makes it a robust default without score normalisation.',
    skillId: 'retrieval-design',
    remediationModuleId: 't2-4',
  },
  {
    id: 't2-4-cp-q3',
    kind: 'multiple-choice',
    prompt: 'Why is a cross-encoder reranker usually applied only to the top 20 to 100 candidates rather than the whole corpus?',
    options: [
      { id: 'a', text: 'Cross-encoders cannot score short documents' },
      { id: 'b', text: 'It scores each query and document pair jointly, so cost grows with every candidate scored' },
      { id: 'c', text: 'Cross-encoders only work with keyword results' },
      { id: 'd', text: 'Reranking the whole corpus would lower recall' },
    ],
    correctOptionId: 'b',
    explanation: 'A cross-encoder reads the query and document together, so nothing can be precomputed. That makes it accurate but expensive per pair, which is why it is applied to a short candidate list from a cheaper first stage.',
    skillId: 'retrieval-design',
    remediationModuleId: 't2-4',
  },
  {
    id: 't2-4-cp-q4',
    kind: 'multiple-choice',
    prompt: 'You add a query-rewriting step before retrieval. What is the best way to decide whether to keep it?',
    options: [
      { id: 'a', text: 'Check that the rewritten queries read more naturally' },
      { id: 'b', text: 'Compare recall at k and answer quality on a labelled query set, with and without the step' },
      { id: 'c', text: 'Keep it if latency stays under one second' },
      { id: 'd', text: 'Ask the model whether its rewrites improved retrieval' },
    ],
    correctOptionId: 'b',
    explanation: 'Query transformation can help or hurt depending on the query mix. Only a controlled comparison on labelled queries shows whether it improves retrieval, and latency is a separate constraint to check alongside it.',
    skillId: 'evaluation',
    remediationModuleId: 't4-2',
  },
  {
    id: 't2-4-cp-q5',
    kind: 'multiple-choice',
    prompt: 'Which metric best tells you whether the first retrieval stage is passing enough relevant material to the reranker?',
    options: [
      { id: 'a', text: 'Recall at the candidate depth, such as recall at 50' },
      { id: 'b', text: 'Precision at 1 after reranking' },
      { id: 'c', text: 'Average answer length' },
      { id: 'd', text: 'Embedding dimension' },
    ],
    correctOptionId: 'a',
    explanation: 'A reranker can only reorder what it receives. Recall at the candidate depth measures whether relevant documents make it into that list; precision after reranking measures a different stage.',
    skillId: 'evaluation',
    remediationModuleId: 't4-2',
  },
  {
    id: 't2-4-cp-q6',
    kind: 'scenario',
    prompt: 'What is the most likely cause, and the best first fix?',
    scenario: 'A fictional parts distributor runs vector-only search over 80,000 product sheets. Users searching for exact part numbers such as "HX-220-B" often get sheets for HX-220-A or HX-230-B ranked first. Conceptual queries such as "valve for high-pressure steam" work well.',
    options: [
      { id: 'a', text: 'The chunks are too large; halve the chunk size' },
      { id: 'b', text: 'Embeddings blur near-identical identifiers; add keyword retrieval and fuse the two result lists' },
      { id: 'c', text: 'The embedding model is too small; switch to the largest available model' },
      { id: 'd', text: 'Increase k from 10 to 100 so the right sheet is always included' },
    ],
    correctOptionId: 'b',
    explanation: 'Part numbers that differ by one character embed almost identically, while keyword search distinguishes them exactly. Hybrid retrieval fixes the identifier queries without harming the conceptual ones; a larger k only hides the ranking problem.',
    skillId: 'retrieval-design',
    remediationModuleId: 't2-4',
  },
  {
    id: 't2-4-cp-q7',
    kind: 'scenario',
    prompt: 'Which change most directly addresses the failure?',
    scenario: 'A fictional HR assistant answers policy questions. Users ask short questions such as "parental leave abroad?". Retrieval often returns the general parental leave policy but misses the international mobility policy, which holds the relevant rule. Both documents are indexed and chunked sensibly.',
    options: [
      { id: 'a', text: 'Add a query transformation step that expands the question into sub-queries, such as parental leave rules and working abroad rules, and merge the results' },
      { id: 'b', text: 'Remove the reranker to save latency' },
      { id: 'c', text: 'Re-embed the corpus with a different model without testing' },
      { id: 'd', text: 'Tell users to write longer questions' },
    ],
    correctOptionId: 'a',
    explanation: 'The question spans two topics, and a single short query embeds close to only one of them. Decomposing it into sub-queries retrieves both policies; the change should still be checked on a labelled set.',
    skillId: 'retrieval-design',
    remediationModuleId: 't2-4',
  },
  {
    id: 't2-4-cp-q8',
    kind: 'scenario',
    prompt: 'What should you conclude, and what do you do next?',
    scenario: 'You add a cross-encoder reranker to a fictional legal search tool. On 300 labelled queries, precision at 5 rises from 0.62 to 0.74, but recall at 50 from the first stage is only 0.58, and p95 latency rises by 400 milliseconds within a 3-second budget.',
    options: [
      { id: 'a', text: 'The reranker failed because recall did not change; remove it' },
      { id: 'b', text: 'Keep the reranker, and next improve first-stage recall because it now caps what the reranker can find' },
      { id: 'c', text: 'Rerank the top 500 instead of the top 50 to fix recall' },
      { id: 'd', text: 'Ship as is; precision is the only metric that matters' },
    ],
    correctOptionId: 'b',
    explanation: 'The reranker improved ordering within budget, so it earns its place. Recall at 50 is a property of the first stage, and at 0.58 it limits the ceiling; improving chunking or adding hybrid retrieval is the next lever. Reranking more candidates mainly adds latency.',
    skillId: 'evaluation',
    remediationModuleId: 't2-3',
  },
]
