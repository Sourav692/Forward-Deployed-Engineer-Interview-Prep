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
  {
    module: 'retrieval-hybrid-rerank',
    items: [
      {
        id: 'q1',
        skillId: 'measurement',
        prompt: 'A support bot\'s top hit for a refund question is about refunds but never states the refund window. When you print the retrieved chunks, you see the sentence giving the window landed in the next chunk, and that chunk was not retrieved. What is the right fix?',
        options: [
          { id: 'a', text: 'Add a cross-encoder reranker over the top 20 so the right chunk rises to the top.' },
          { id: 'b', text: 'Tighten the generation prompt so the model makes better use of the context it was given.' },
          { id: 'c', text: 'Fix the chunking so the window sentence stays with its topic, then re-measure recall@5 on the failing questions.' },
          { id: 'd', text: 'Raise the similarity threshold so only the strongest matches reach the prompt.' },
        ],
        correctOptionId: 'c',
        explanation: 'The chunk holding the fact never reached the candidate set, so this is a recall failure caused by chunking. A reranker only reorders the candidates it is given and cannot add a missing one.',
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
        id: 'q3',
        skillId: 'query-transformation',
        prompt: 'A help-centre corpus changes rarely and gets a very high volume of queries. Short user questions keep missing the long, answer-shaped chunks that hold the answers. Which technique fits best?',
        options: [
          { id: 'a', text: 'HyDE, because writing a hypothetical answer for each query adapts at once to a changed corpus.' },
          { id: 'b', text: 'Multi-query rewriting, because the user\'s words differ from the document\'s.' },
          { id: 'c', text: 'Self-query retrieval, because the questions need structured metadata filters.' },
          { id: 'd', text: 'HyPE, because generating the questions each chunk answers at ingestion removes the model cost per query.' },
        ],
        correctOptionId: 'd',
        explanation: 'Short questions that fail to match long answer chunks are the gap HyDE and HyPE close. HyPE pays one batched model call per chunk at index time, so it suits high query volume over a fairly static corpus.',
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
        id: 'q5',
        skillId: 'control-loops',
        prompt: 'A support search covers a help-centre wiki, tickets and release notes. Answers from the existing documents are reliable, but new error codes appear before anyone documents them. The data is internal and must not be sent to a public search. Which control loop and fallback fit?',
        options: [
          { id: 'a', text: 'Self-RAG, because grading the final answer catches hallucination.' },
          { id: 'b', text: 'Adaptive RAG, so each question type gets its own retrieval strategy.' },
          { id: 'c', text: 'Corrective RAG-style grading that sends cases below the threshold to a human queue with the retrieved context attached.' },
          { id: 'd', text: 'Plain RAG with a larger top-k, since the corpus will eventually document the new codes.' },
        ],
        correctOptionId: 'c',
        explanation: 'Undocumented error codes are a coverage gap, and Corrective RAG is the loop for a corpus known to be incomplete. Because the data is internal, the low-confidence fallback goes to a human queue rather than a public web search.',
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
        id: 'q7',
        skillId: 'measurement',
        prompt: 'A team runs six retrieval strategies against a 22-document golden set. Every strategy scores recall@k of 1.00, and HyDE has a slightly higher mean reciprocal rank than the rest. What is the right conclusion?',
        options: [
          { id: 'a', text: 'Ship HyDE, since it has the highest mean reciprocal rank of the six.' },
          { id: 'b', text: 'Ship the combination of every strategy, since combining them cannot lower recall.' },
          { id: 'c', text: 'Drop the golden set, since a metric that every strategy maxes out is useless.' },
          { id: 'd', text: 'Treat the differences as noise, keep the harness and rerun it on a realistically sized corpus before promoting any strategy.' },
        ],
        correctOptionId: 'd',
        explanation: 'A tiny corpus makes every technique look perfect, so this table cannot justify any one of them. The value is that the harness exists, so the same comparison on a large corpus can decide whether a strategy earns its cost.',
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
