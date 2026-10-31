/**
 * Module checkpoints (DATA-10): 6 to 10 multiple-choice questions per module, passed at
 * 70 % (`CHECKPOINT_PASS` in `progress/rules.ts`). A checkpoint result feeds interview
 * readiness and the revision queue.
 *
 * Product configuration, not lesson content (plan A2, PM-04): questions test the
 * module's own lessons and must be grounded in them. The owner writes or reviews every
 * checkpoint before it ships. Data only, with no runtime imports, so the check scripts
 * can read it under plain `node`. `check:curriculum` validates the shape.
 *
 * Server code only: client islands get a module's items as props and a `checkpoint`
 * flag on `ModuleInput`, so lesson and module pages never ship every question.
 */

export type CheckpointItem = {
  /** Unique within its checkpoint. Stored in attempts; never change once shipped. */
  id: string
  /** Groups items in the result breakdown. */
  skillId: string
  prompt: string
  options: { id: string; text: string }[]
  correctOptionId: string
  /** Why the correct option is right, shown after submitting. */
  explanation: string
}

export type Checkpoint = {
  /** Module slug. One checkpoint per module. */
  module: string
  items: CheckpointItem[]
}

export const CHECKPOINTS: Checkpoint[] = [
  // T2.4 pilot, drafted from the module's seven lessons: every answer rests on a quoted
  // lesson sentence, listed in the DATA-10 PR for owner review.
  // Since the AI Engineering integration this module is course module M17. On 31 October 2026
  // items q1, q3, q5 and q7 (chunking, HyPE, corrective RAG, measurement: now taught in M13,
  // M16, M29 and M11) gave way to q9 to q12, drafted from M17's search-modes and fusion lessons.
  {
    module: 'retrieval-hybrid-rerank',
    items: [
      {
        id: 'q9',
        skillId: 'search-modes',
        prompt: 'The Larkspur assistant retrieves with plain similarity search at k=3. Asked about a product Larkspur does not sell, it still answers from three unrelated handbook chunks. What is the first defence?',
        options: [
          { id: 'a', text: 'Raise k to 10 so the model sees enough context to notice nothing matches.' },
          { id: 'b', text: 'Switch to MMR so the three chunks at least differ from each other.' },
          { id: 'c', text: 'Add multi-query retrieval so the question is reworded several ways.' },
          { id: 'd', text: 'Retrieve with a score threshold, so only chunks above a tuned relevance cut-off reach the prompt, possibly none.' },
        ],
        correctOptionId: 'd',
        explanation: 'Similarity search always returns k chunks, however far away they are. A score threshold is the first defence: it can return nothing, so a question the index cannot answer gets no false evidence.',
      },
      {
        id: 'q2',
        skillId: 'hybrid-and-fusion',
        prompt: 'Dense search ranks document A first and document B second. BM25 ranks document C first and document B second, and A does not appear in the BM25 list. Using reciprocal rank fusion with the conventional k of 60, which document comes out on top, and why?',
        options: [
          { id: 'a', text: 'B, because it collects credit from both lists, and at k=60 a first place earns barely more than a second, so agreement outweighs one top spot.' },
          { id: 'b', text: 'A, because the dense retriever\'s first place carries the highest similarity score.' },
          { id: 'c', text: 'C, because a rare-token match in BM25 is stronger evidence than a semantic match.' },
          { id: 'd', text: 'It cannot be decided until both score sets are normalised to 0 to 1.' },
        ],
        correctOptionId: 'a',
        explanation: 'RRF ignores raw scores and adds up 1 / (k + rank) from every list a document appears in. At k=60 rank 1 is worth only slightly more than rank 2, so two second places beat one first place.',
      },
      {
        id: 'q10',
        skillId: 'search-modes',
        prompt: 'In a Chroma store set to cosine, similarity_search_with_score gives the best chunk 0.35375, and you plan to keep chunks with score_threshold=0.3 in the similarity_score_threshold mode. What is true?',
        options: [
          { id: 'a', text: '0.35375 is a distance, where lower is closer; as a relevance score it is 1 - 0.35375 = 0.64625, which the threshold mode compares against 0.3.' },
          { id: 'b', text: '0.35375 is a relevance score, so the chunk only just clears the 0.3 threshold.' },
          { id: 'c', text: 'Both methods return the same number, so the threshold can be tuned from either.' },
          { id: 'd', text: 'Chroma uses cosine by default, so the threshold carries over unchanged to any embedding model.' },
        ],
        correctOptionId: 'a',
        explanation: 'similarity_search_with_score returns a distance (lower is closer); the threshold mode uses a relevance score (higher is closer), which for cosine is 1 - distance. A threshold belongs to one embedding model and one distance function, and Chroma uses Euclidean distance unless told otherwise.',
      },
      {
        id: 'q4',
        skillId: 'reranking-and-filtering',
        prompt: 'You turn on MMR with k=4 and turn λ down to favour diversity, but the results still match plain similarity search, near-duplicates included. What is the most likely cause?',
        options: [
          { id: 'a', text: 'λ is still too high; set it to 0 so diversity is the only criterion.' },
          { id: 'b', text: 'fetch_k is set to about the same value as k, so there is no wider pool of alternatives to choose from.' },
          { id: 'c', text: 'MMR cannot act on chunks that overlap heavily, so the near-duplicates must be removed at indexing.' },
          { id: 'd', text: 'k is too small; MMR needs a k of around 20 before it can diversify.' },
        ],
        correctOptionId: 'b',
        explanation: 'MMR picks its diverse set from the fetch_k candidates, so if fetch_k barely exceeds k there is nothing to trade and λ makes no difference. Set fetch_k to several times k, such as 20 for a k of 3.',
      },
      {
        id: 'q11',
        skillId: 'hybrid-and-fusion',
        prompt: 'You fuse dense and BM25 results with weighted score fusion: min-max normalise each list per query, then rank by alpha * vector + (1 - alpha) * bm25. A user asks a question the corpus cannot answer. What do the fused scores look like?',
        options: [
          { id: 'a', text: 'All close to 0, because no chunk is relevant to either retriever.' },
          { id: 'b', text: 'Confident: the best chunk in each list still gets 1.0, because min-max is relative to the current query\'s results.' },
          { id: 'c', text: 'Undefined, because min-max fails when every score is low.' },
          { id: 'd', text: 'Exactly alpha for the top chunk, since only the dense side can score an unanswerable question.' },
        ],
        correctOptionId: 'b',
        explanation: 'Min-max maps the best chunk to 1.0 and the worst to 0.0 for every query, even when nothing is relevant, so an unanswerable question produces confident-looking scores. The same alpha also weighs the two retrievers differently from one question to the next.',
      },
      {
        id: 'q6',
        skillId: 'production-pipelines',
        prompt: 'On a shared platform, a restricted user keeps getting thin or empty context even though their own documents contain good answers. The pipeline retrieves and reranks a top 6 across the whole corpus, then removes the documents the user cannot see. What should change?',
        options: [
          { id: 'a', text: 'Enforce access first: build the keyword index over the user\'s authorised pool and rerank after access enforcement.' },
          { id: 'b', text: 'Raise the reranker\'s output from 6 to 20 so that more permitted documents survive the post-filter.' },
          { id: 'c', text: 'Swap the LLM reranker for a local cross-encoder so it can score more candidates.' },
          { id: 'd', text: 'Add multi-query rewriting so retrieval finds more paraphrases of the question.' },
        ],
        correctOptionId: 'a',
        explanation: 'Reranking before the access filter ranks documents the user cannot see, wastes top-k slots and leaves them a thin context. Reranking after access enforcement makes their top 6 the best of their own documents.',
      },
      {
        id: 'q12',
        skillId: 'hybrid-and-fusion',
        prompt: 'An EnsembleRetriever fuses dense and BM25 with weights 0.7 and 0.3 and the default constant of 60. For an exact-ID question the dense retriever misses the ID chunk entirely, and BM25 ranks it first. Where does it land?',
        options: [
          { id: 'a', text: 'First, because BM25 ranked it first and RRF rewards the top of any list.' },
          { id: 'b', text: 'Tied with the dense first place, because RRF ignores the weights.' },
          { id: 'c', text: 'Below every chunk the dense retriever returns at rank 82 or better, since 0.3 / 61 is smaller than 0.7 / (60 + 82).' },
          { id: 'd', text: 'Nowhere, because EnsembleRetriever drops chunks that only one retriever returns.' },
        ],
        correctOptionId: 'c',
        explanation: 'RRF adds w / (60 + rank) per retriever. A chunk only BM25 returns, at rank 1 with weight 0.3, scores 0.3 / 61 = 0.0049, less than any dense result down to rank 82. With equal weights it would tie the dense first place, so weights decide whether a BM25-only hit can surface.',
      },
      {
        id: 'q8',
        skillId: 'hybrid-and-fusion',
        prompt: 'You are adding BM25 alongside dense search so that a ticket ID such as MRD-5031 stops returning the MRD-5030 guide. The dense side already searches with several rewrites of the question. Which design keeps exact IDs findable?',
        options: [
          { id: 'a', text: 'Add the BM25 score directly to the dense similarity score so an exact match lifts the total.' },
          { id: 'b', text: 'Keep hyphenated IDs as single tokens in the keyword index, and send BM25 only the original question and any sub-questions.' },
          { id: 'c', text: 'Split IDs on the hyphen so that MRD and 5031 each match, and feed every rewrite to BM25 as well.' },
          { id: 'd', text: 'Skip BM25 and move to a stronger embedding model that separates similar codes.' },
        ],
        correctOptionId: 'b',
        explanation: 'BM25 finds MRD-5031 because the token is rare, so splitting it on the hyphen destroys that signal and paraphrased rewrites dilute it. Keeping IDs whole and giving BM25 only the original question and sub-questions protects the exact match.',
      },
    ],
  },
]

export const getCheckpoint = (moduleSlug: string): Checkpoint | undefined =>
  CHECKPOINTS.find((c) => c.module === moduleSlug)
