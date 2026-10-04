/**
 * Sample lesson bodies for Track T2 (LLM and retrieval), written for the /demo
 * prototype. They show the house lesson shape and tone; they are not final curriculum.
 */
import type { Lesson } from '../../types'

export const LESSONS_T2: Lesson[] = [
  // ── T2.1 How LLMs behave, for engineers ──────────────────────────────────
  {
    id: 't2-1-l1',
    moduleId: 't2-1',
    order: 1,
    title: 'Tokens, Context Windows and What They Cost',
    tagline: 'A longer context buys the model more evidence at the cost of latency, spend and attention spread thinner.',
    readingMin: 6,
    objectives: [
      'Estimate token counts for typical inputs and outputs',
      'Explain why context is billed and slowed, not free',
      'Size a prompt budget before writing the prompt',
    ],
    sections: [
      {
        heading: 'Count tokens, not characters',
        body: 'Models read and write tokens, which are sub-word pieces. English prose averages roughly four characters per token, but code, numbers and non-English text tokenise less efficiently. Every request is billed on input tokens plus output tokens, and output tokens usually cost several times more per token than input. Latency follows the same split: input is processed in parallel, output is generated one token at a time.',
      },
      {
        heading: 'Treat the context window as a budget',
        body: 'The context window is the maximum number of tokens the model can see at once, including system prompt, history, retrieved documents and the answer it is writing. Filling it is legal but rarely wise. Long inputs raise cost linearly, raise time to first token, and make it harder for the model to use facts buried in the middle. Decide what each request actually needs and spend tokens there.',
      },
    ],
    workedExample: {
      title: 'Pricing a support assistant',
      body: 'A 40-person support team expects 6,000 questions a day. Each request carries a 600-token system prompt, 2,400 tokens of retrieved articles and a 300-token answer. That is 3,000 input and 300 output tokens per call, or 18 million input and 1.8 million output tokens a day. If output costs four times input, the output share is 7.2 million input-equivalent tokens, so trimming retrieval from eight chunks to five saves more than shortening answers would.',
    },
    warning: 'Treating context as free is the most common cost mistake. Doubling retrieved chunks doubles most of the bill and often lowers answer quality rather than raising it.',
    takeaways: [
      'Cost and latency scale with tokens in and tokens out, priced differently.',
      'The context window is a ceiling, not a target.',
      'Do the token arithmetic before choosing a model or a chunk count.',
    ],
    checkYourself: [
      'Why does output length usually dominate latency more than input length?',
      'What sits inside the context window besides the user question?',
      'How would you cut cost by 30 percent without changing the model?',
    ],
    referenceIds: ['ref-lost-middle'],
  },
  {
    id: 't2-1-l2',
    moduleId: 't2-1',
    order: 2,
    title: 'Sampling and Embeddings in Practice',
    tagline: 'Lower temperature buys repeatability at the cost of variety, and it never buys correctness.',
    readingMin: 7,
    objectives: [
      'Describe what temperature and top-p actually change',
      'Explain what an embedding captures and what it misses',
      'Pick sampling settings by task rather than by habit',
    ],
    sections: [
      {
        heading: 'Separate randomness from accuracy',
        body: 'At each step the model produces a probability distribution over the next token. Temperature reshapes that distribution: low values sharpen it towards the most likely token, high values flatten it. Top-p limits sampling to the smallest set of tokens whose probabilities sum to p. Neither setting adds knowledge. A wrong answer at temperature 0 is simply the same wrong answer every time, which is useful for testing and misleading if you mistake it for reliability.',
      },
      {
        heading: 'Use embeddings for similarity, not truth',
        body: 'An embedding model maps text to a fixed-length vector so that semantically similar texts land close together. That makes it good for search, clustering and deduplication. It does not encode exact identifiers well, it compresses long passages into one point, and two contradictory statements about the same topic can sit very close. Embeddings find candidates; something else has to judge them.',
      },
    ],
    workedExample: {
      title: 'Choosing settings for two features',
      body: 'A regional insurer runs a claims-summary feature and a marketing-copy drafter. For summaries, the team sets temperature to 0.1 so reviewers see stable wording across reruns and regression tests can diff outputs. For copy, they use 0.8 and generate three variants per request. Running the same 200 summaries twice showed 97 percent identical outputs at 0.1, compared with 12 percent at 0.8, but factual error rates were the same in both runs.',
    },
    warning: 'A common temperature myth is that setting it to zero stops hallucination. It only makes the output deterministic; grounding and evaluation are what reduce errors.',
    takeaways: [
      'Temperature controls variety, not truthfulness.',
      'Embeddings measure closeness of meaning, not correctness or exact match.',
      'Choose sampling settings per feature and record them with the eval results.',
    ],
    checkYourself: [
      'What does temperature 0 guarantee, and what does it not guarantee?',
      'Why might an embedding search miss a policy number?',
      'When would you deliberately raise temperature in a production feature?',
    ],
    referenceIds: ['ref-bm25', 'ref-canonical-handbook'],
  },

  // ── T2.2 RAG from first principles ──────────────────────────────────────
  {
    id: 't2-2-l1',
    moduleId: 't2-2',
    order: 1,
    title: 'The RAG Pipeline End to End',
    tagline: 'Retrieval buys fresh, citable answers at the cost of a second system whose failures look like model failures.',
    readingMin: 7,
    objectives: [
      'Name the stages of a RAG pipeline in order',
      'Locate where each class of failure originates',
      'Explain why retrieval quality caps answer quality',
    ],
    sections: [
      {
        heading: 'Walk the pipeline in two halves',
        body: 'Offline, you ingest documents, clean them, split them into chunks, embed the chunks and write them to an index with metadata. Online, you take the question, optionally rewrite it, retrieve candidate chunks, optionally rerank them, assemble a prompt with the best few, and ask the model to answer with citations. Each stage has its own inputs, outputs and failure modes, and each can be evaluated on its own.',
      },
      {
        heading: 'Debug retrieval before blaming the model',
        body: 'If the right passage never reaches the prompt, no model can answer correctly. So when an answer is wrong, first check whether the supporting chunk was retrieved. If it was not, the fault is in chunking, indexing or ranking. If it was retrieved but ignored, the fault is in prompt assembly or generation. Saying this split out loud in an interview shows you can isolate faults rather than guess.',
      },
    ],
    workedExample: {
      title: 'Tracing a wrong answer',
      body: 'A 120-person engineering firm asks its handbook assistant how many days of parental leave staff receive, and gets 10 instead of 20. The trace shows the top five chunks: four from a superseded 2022 policy and one from the current policy ranked fifth. The model followed the majority. The fix is not a better prompt; it is a metadata filter on document status plus a freshness field, which moves the current policy to rank one in 48 of 50 test questions.',
    },
    warning: 'Teams often tune prompts for weeks when the real defect is that the right chunk was never retrieved. Log retrieved chunk ids with every answer so you can tell the two apart.',
    takeaways: [
      'RAG is an ingestion pipeline plus a query pipeline, each testable alone.',
      'Answer quality is capped by retrieval quality.',
      'Always check whether the evidence reached the prompt before changing the prompt.',
    ],
    checkYourself: [
      'List the offline and online stages of a RAG system.',
      'How would you tell a retrieval failure from a generation failure?',
      'What should be logged on every request to make that diagnosis possible?',
    ],
    referenceIds: ['ref-rag-paper', 'ref-ragas'],
  },
  {
    id: 't2-2-l2',
    moduleId: 't2-2',
    order: 2,
    title: 'When RAG Is the Wrong Tool',
    tagline: 'Retrieval is cheap to prototype but fails on questions that need computation, live state or exact records.',
    readingMin: 5,
    objectives: [
      'Recognise questions that retrieval cannot answer well',
      'Choose between RAG, tool calls, SQL and fine-tuning',
      'Justify the choice in one sentence to a customer',
    ],
    sections: [
      {
        heading: 'Classify the question before choosing the pattern',
        body: 'RAG suits questions whose answer is written down somewhere in prose: policies, manuals, past tickets. It struggles when the answer must be computed (total spend last quarter), read from live state (current order status), or drawn from structured records with exact filters. Those need a SQL query, an API call or a tool, with the model deciding which to call and phrasing the result.',
      },
      {
        heading: 'Match the pattern to the data shape',
        body: 'If the data lives in tables, query the tables. If it changes by the minute, call the system of record. If the model needs a consistent style or format rather than new facts, consider fine-tuning or few-shot examples. Many real systems combine these: retrieval for policy text, a tool for account data, and a prompt that merges both into one answer.',
      },
    ],
    workedExample: {
      title: 'Splitting a mixed request',
      body: 'A logistics customer wants an assistant that answers questions such as "Which of my 300 shipments are late, and what does our contract say about penalties?" Embedding shipment rows would retrieve similar-looking rows, not the 14 that are actually late. The design instead routes the first half to a SQL tool that filters on delivery date, and the second half to retrieval over contract clauses. The model receives 14 rows and two clauses and writes one answer.',
    },
    warning: 'Using RAG for problems that need tools or SQL produces confident answers built from the wrong rows. If the question contains a count, a total or the word "current", check whether a query would serve it better.',
    takeaways: [
      'Retrieval answers questions about written text, not computed or live facts.',
      'Route structured questions to SQL or tools and keep retrieval for prose.',
      'Hybrid designs that combine retrieval and tools are normal, not exotic.',
    ],
    checkYourself: [
      'Give two questions RAG would answer badly and say why.',
      'What signals in a customer request suggest a SQL tool instead?',
      'When would fine-tuning be a better fit than retrieval?',
    ],
    referenceIds: ['ref-react', 'ref-rag-paper'],
  },

  // ── T2.3 Chunking and indexing ──────────────────────────────────────────
  {
    id: 't2-3-l1',
    moduleId: 't2-3',
    order: 1,
    title: 'Chunking by Document Type',
    tagline: 'Smaller chunks buy precise matches at the cost of losing the context that makes a passage meaningful.',
    readingMin: 7,
    objectives: [
      'Explain the precision and context trade-off in chunk size',
      'Pick a chunking strategy for prose, tables, code and transcripts',
      'Attach metadata that keeps chunks traceable',
    ],
    sections: [
      {
        heading: 'Split along the structure the author used',
        body: 'Fixed-size windows are a reasonable default for undifferentiated prose, usually a few hundred tokens with a small overlap. Most business documents have better boundaries: headings in manuals, clauses in contracts, functions in code, speaker turns in transcripts. Splitting on those keeps each chunk about one thing, which helps both embedding quality and citation. Tables need special handling, because a row without its header is meaningless.',
      },
      {
        heading: 'Carry context into every chunk',
        body: 'A chunk that says "this limit is 30 days" is useless without knowing which limit. Prepend the document title and section path to each chunk before embedding, and store source id, page, date and access group as metadata. That costs a few tokens per chunk and makes filtering, deduplication and citation possible later.',
      },
    ],
    workedExample: {
      title: 'Three corpora, three strategies',
      body: 'A mid-sized bank indexes 5,000 policy PDFs, 800 rate tables and 2,000 call transcripts. Policies are split by heading, capped at 500 tokens with the section path prepended. Each rate table row is rendered as a sentence that repeats the column names. Transcripts are split into windows of six speaker turns. On a 150-question test set, recall at 5 rose from 0.61 with uniform 400-token chunks to 0.83 with the per-type strategy.',
    },
    warning: 'Using one chunk size for every document is the default mistake. It slices tables away from headers and merges unrelated clauses, and no reranker can repair that downstream.',
    takeaways: [
      'Chunk boundaries should follow document structure where it exists.',
      'Prepend titles and section paths so each chunk stands alone.',
      'Measure recall per document type, not only in aggregate.',
    ],
    checkYourself: [
      'Why does a very small chunk size often hurt answer quality?',
      'How would you chunk a spreadsheet of product prices?',
      'Which metadata fields would you store for later filtering and citation?',
    ],
    referenceIds: ['ref-rag-paper', 'ref-ragas'],
  },
  {
    id: 't2-3-l2',
    moduleId: 't2-3',
    order: 2,
    title: 'Choosing and Maintaining an Index',
    tagline: 'Approximate vector indexes buy speed at scale at the cost of some recall and a rebuild whenever the embedding model changes.',
    readingMin: 6,
    objectives: [
      'Compare exact, approximate and lexical indexes',
      'Plan for re-indexing when content or models change',
      'Estimate index size from corpus size',
    ],
    sections: [
      {
        heading: 'Start exact and move to approximate when it hurts',
        body: 'Below a few hundred thousand vectors, brute-force search is often fast enough and has perfect recall. Beyond that, approximate nearest neighbour structures such as HNSW graphs trade a little recall for large speed gains, with parameters that tune the balance. A lexical index such as BM25 sits alongside for exact terms. Postgres with a vector extension covers many early projects without a new datastore.',
      },
      {
        heading: 'Design the update path on day one',
        body: 'Documents change, get deleted and gain new permissions. Store a content hash per chunk so you re-embed only what changed, and handle deletes explicitly so retired text stops appearing. Changing the embedding model means re-embedding the whole corpus, because vectors from different models are not comparable. Budget that rebuild as a planned operation, not an emergency.',
      },
    ],
    workedExample: {
      title: 'Sizing a corpus',
      body: 'A legal team has 40,000 documents averaging 12 chunks each, so 480,000 chunks. At 1,024 dimensions stored as 4-byte floats, raw vectors take about 2 GB, and an HNSW graph adds a further 30 to 50 percent. Re-embedding everything at 2,000 chunks per minute takes four hours, which fits in a weekend window. Hashing chunks cuts the nightly update to the roughly 1 percent that changes, about 4,800 chunks.',
    },
    warning: 'Forgetting deletes is a quiet failure: retired policies keep surfacing for months. Test that a removed document disappears from results within your stated freshness window.',
    takeaways: [
      'Exact search is fine at small scale; approximate indexes trade recall for speed.',
      'Hash chunks to make incremental updates cheap.',
      'An embedding model change is a full re-index, so plan it.',
    ],
    checkYourself: [
      'At what point would you move from brute-force to an approximate index?',
      'Why can you not mix vectors from two embedding models in one index?',
      'How would you verify that deletes are honoured?',
    ],
    referenceIds: ['ref-bm25', 'ref-ddia'],
  },

  // ── T2.4 Retrieval: hybrid, rerank, query transformation ────────────────
  {
    id: 't2-4-l1',
    moduleId: 't2-4',
    order: 1,
    title: 'Measuring Retrieval Before Tuning It',
    tagline: 'A labelled retrieval set costs a day of work and saves weeks of tuning by intuition.',
    readingMin: 6,
    objectives: [
      'Build a small labelled set of question and passage pairs',
      'Compute recall at k and mean reciprocal rank',
      'Set a recall target tied to the product requirement',
    ],
    sections: [
      {
        heading: 'Label fifty questions before changing anything',
        body: 'Collect real or realistic questions and, for each, mark which chunks contain the answer. Fifty to two hundred pairs are enough to see large effects. Include hard cases: questions with identifiers, synonyms the documents do not use, and questions with no answer. This set is the yardstick for every later change to chunking, embeddings or ranking.',
      },
      {
        heading: 'Measure recall before tuning k',
        body: 'Recall at k asks whether any correct chunk appears in the top k results. Mean reciprocal rank rewards putting it near the top. Because the model only sees what you pass it, recall at the k you actually send is the number that matters. Say the metric out loud first in an interview: "I would target recall at 5 of 0.9 on a labelled set before touching the prompt."',
      },
    ],
    workedExample: {
      title: 'Setting a target',
      body: 'A 30-person compliance team needs answers grounded in the correct regulation clause. On 120 labelled questions, dense retrieval scores recall at 5 of 0.72 and MRR of 0.51. Errors cluster in questions citing clause numbers such as 4.3(b). The team sets a target of 0.90 recall at 5 and treats every later change as an experiment against this set, keeping only changes that move the number.',
    },
    warning: 'Having no retrieval metrics means every change is judged by a handful of anecdotes. You will ship regressions without noticing and drop improvements that looked unimpressive on one query.',
    takeaways: [
      'A small labelled set is the cheapest tool in retrieval work.',
      'Recall at the k you send is the metric that caps answer quality.',
      'Tie the target to what the product needs, then measure every change against it.',
    ],
    checkYourself: [
      'What is the difference between recall at k and MRR?',
      'Which hard cases should a retrieval test set include?',
      'How many labelled pairs do you need to start, and why is that enough?',
    ],
    referenceIds: ['ref-ragas', 'ref-bm25'],
  },
  {
    id: 't2-4-l2',
    moduleId: 't2-4',
    order: 2,
    title: 'Hybrid Retrieval and Reranking',
    tagline: 'Hybrid retrieval buys recall on exact terms at the cost of a second index to keep fresh.',
    readingMin: 8,
    objectives: [
      'Combine lexical and dense results with rank fusion',
      'Place a reranker on a bounded candidate set',
      'Budget the latency each stage adds',
    ],
    sections: [
      {
        heading: 'Fuse lexical and dense results',
        body: 'Dense retrieval handles paraphrase; BM25 handles exact tokens such as product codes, names and clause numbers. Run both, take the top 50 or so from each, and merge with reciprocal rank fusion, which scores each document by summing one over a constant plus its rank in each list. Fusion needs no score calibration and is a strong default.',
      },
      {
        heading: 'Rerank a shortlist, not the corpus',
        body: 'A cross-encoder reranker reads the query and passage together and scores relevance far more accurately than vector distance, but it costs a model call per pair. Apply it to the fused top 30 to 50 and keep the best 5. Reranking everything multiplies latency and cost without improving recall, because the reranker cannot rescue documents that were never retrieved.',
      },
    ],
    workedExample: {
      title: 'Closing the clause-number gap',
      body: 'Continuing the compliance example, adding BM25 and fusing it with dense results raises recall at 5 from 0.72 to 0.84, with the clause-number questions accounting for most of the gain. A reranker over the fused top 40 lifts recall at 5 to 0.91 and MRR to 0.74. The added latency is about 40 ms for BM25 and 180 ms for reranking, within a 2-second budget for the whole request.',
    },
    warning: 'Reranking everything is a common overreach. Bound the candidate set, measure what the reranker adds over fusion alone, and drop it if the gain does not justify the latency.',
    takeaways: [
      'Lexical and dense retrieval fail on different questions, so combine them.',
      'Reciprocal rank fusion is simple and robust.',
      'Rerankers improve ordering within a shortlist; they cannot fix missing candidates.',
    ],
    checkYourself: [
      'Why does BM25 beat embeddings on identifiers?',
      'How does reciprocal rank fusion combine two lists without calibrating scores?',
      'How large should the candidate set be before reranking, and what drives that choice?',
    ],
    referenceIds: ['ref-bm25', 'ref-rerank'],
  },
  {
    id: 't2-4-l3',
    moduleId: 't2-4',
    order: 3,
    title: 'Query Transformation',
    tagline: 'Rewriting the query buys recall on vague or compound questions at the cost of an extra model call per request.',
    readingMin: 6,
    objectives: [
      'Name the main query transformation techniques',
      'Decide when a rewrite step earns its latency',
      'Evaluate a rewrite against the labelled set',
    ],
    sections: [
      {
        heading: 'Rewrite only the questions that need it',
        body: 'User questions are often short, conversational or dependent on earlier turns. A rewrite step can resolve pronouns from chat history, expand abbreviations, or split a compound question into sub-queries that are retrieved separately. Another technique generates a hypothetical answer and embeds that, which sometimes lands closer to the target passage than the question does.',
      },
      {
        heading: 'Gate the rewrite on a measurable gain',
        body: 'Each rewrite adds a model call, typically a few hundred milliseconds, and can drift from what the user meant. Run it against the labelled set, and look at results per question type. If it helps follow-up questions and hurts direct ones, apply it only when the conversation has prior turns. Keep the original query in the retrieval mix as a safety net.',
      },
    ],
    workedExample: {
      title: 'Resolving follow-ups',
      body: 'A 60-person HR team finds that 35 percent of assistant questions are follow-ups such as "and for part-time staff?". Raw retrieval on those scores recall at 5 of 0.48. A rewrite step that folds in the previous question raises it to 0.86. On first-turn questions the rewrite changes nothing, so the team runs it only when history exists, saving roughly 250 ms on two thirds of requests.',
    },
    warning: 'Adding query rewriting without measuring it is a quiet source of drift. Rewrites can introduce terms the user never said and retrieve confidently wrong passages.',
    takeaways: [
      'Rewrite steps help most with follow-ups and compound questions.',
      'Every rewrite costs a model call and some fidelity to the user.',
      'Apply rewrites conditionally and keep the original query in play.',
    ],
    checkYourself: [
      'Which kinds of question benefit most from query rewriting?',
      'How would you decide to apply a rewrite only to some requests?',
      'What risk does a hypothetical-answer embedding introduce?',
    ],
    referenceIds: ['ref-ragas', 'ref-rag-paper'],
  },

  // ── T2.5 Frameworks: LangChain and LangGraph ────────────────────────────
  {
    id: 't2-5-l1',
    moduleId: 't2-5',
    order: 1,
    title: 'Reading Framework Code as Plain Concepts',
    tagline: 'Frameworks buy speed on common patterns at the cost of indirection you must see through to debug.',
    readingMin: 6,
    objectives: [
      'Map framework abstractions to the underlying calls',
      'Trace a chain to the exact prompt sent to the model',
      'Decide when to drop to plain code',
    ],
    sections: [
      {
        heading: 'Translate each abstraction into a function call',
        body: 'A retriever is a function from query to documents. A prompt template is string formatting. A chain is function composition. An output parser is validation on the model response. When you read LangChain code, rename each piece in your head to that plain concept. You can then reason about it, test it and replace it without learning every class in the library.',
      },
      {
        heading: 'Inspect the final prompt, always',
        body: 'Framework defaults add system text, formatting instructions and history you did not write. Turn on tracing or log the exact messages sent to the model. Many surprising behaviours, such as answers in the wrong format or ignored context, come from a default template rather than from the model. Knowing how to find that prompt is the most useful framework skill.',
      },
    ],
    workedExample: {
      title: 'Finding a hidden instruction',
      body: 'A small product team sees its summariser ignore a 150-word length limit about half the time. Logging the outgoing messages shows the framework appended 400 tokens of format instructions after the team\'s own prompt, so the length limit sat in the middle of a long system message. Moving the limit to the end and removing the unused parser brings compliance on 100 test documents from 52 to 94 percent.',
    },
    warning: 'Framework tours instead of concepts leave you able to name classes but not to debug. In an interview, explain the underlying data flow first and mention the library second.',
    takeaways: [
      'Every framework abstraction maps to a plain function you could write.',
      'The exact outgoing prompt is the first thing to inspect.',
      'Use the framework where it saves time and step outside it where it hides behaviour.',
    ],
    checkYourself: [
      'What plain concept does a chain correspond to?',
      'How would you find the exact prompt a framework sent?',
      'Name one situation where plain code beats the framework.',
    ],
    referenceIds: ['ref-canonical-handbook'],
  },
  {
    id: 't2-5-l2',
    moduleId: 't2-5',
    order: 2,
    title: 'State Graphs with LangGraph',
    tagline: 'An explicit state graph buys control and resumability at the cost of more upfront design than a single chain.',
    readingMin: 7,
    objectives: [
      'Model a workflow as nodes, edges and shared state',
      'Add conditional routing and a human checkpoint',
      'Explain when a graph is worth the extra structure',
    ],
    sections: [
      {
        heading: 'Define the state before the nodes',
        body: 'In LangGraph, each node is a function that reads a shared state object and returns updates to it. Edges decide which node runs next, and conditional edges choose based on the state. Start by writing down the state fields: the question, retrieved documents, a draft, a review flag. Once the state is clear, the nodes become small and testable.',
      },
      {
        heading: 'Use checkpoints for loops and approvals',
        body: 'Graphs can loop, for example retrying retrieval when a grader finds the evidence weak, and can pause for a human approval before an action. A checkpointer persists state between steps, so a paused run can resume later or be replayed when debugging. Cap every loop with a maximum iteration count stored in state.',
      },
    ],
    workedExample: {
      title: 'A refund workflow',
      body: 'A 25-person e-commerce support team builds a graph with four nodes: classify the request, look up the order, draft a reply, and request approval for refunds above 100 units of currency. A conditional edge skips approval for small refunds. Over a week of 1,200 tickets, 9 percent reach the approval node, and the checkpointer lets agents resume those runs after review without repeating the lookup.',
    },
    warning: 'Reaching for a graph when a three-step chain would do adds structure without benefit. Use a graph when you need branching, loops, persistence or human checkpoints.',
    takeaways: [
      'A graph is nodes, edges and shared state; design the state first.',
      'Conditional edges and checkpoints are the main reasons to choose a graph.',
      'Bound every loop explicitly.',
    ],
    checkYourself: [
      'What belongs in graph state, and what should stay outside it?',
      'Why does a checkpointer matter for human approval steps?',
      'When is a plain chain the better choice?',
    ],
    referenceIds: ['ref-react', 'ref-canonical-handbook'],
  },

  // ── T2.6 ML fundamentals for applied engineers ──────────────────────────
  {
    id: 't2-6-l1',
    moduleId: 't2-6',
    order: 1,
    title: 'Baselines Before Models',
    tagline: 'A cheap baseline costs an afternoon and tells you whether an LLM is worth its price.',
    readingMin: 5,
    objectives: [
      'Build a rules or classical baseline for a classification task',
      'Compare an LLM against the baseline on cost and quality',
      'Explain the result to a non-technical stakeholder',
    ],
    sections: [
      {
        heading: 'Start with the simplest thing that could work',
        body: 'For routing, tagging or triage, try keyword rules, a majority-class guess and a logistic regression on TF-IDF features before calling a large model. These baselines are fast, cheap and explainable. They set the floor the LLM must beat and often reveal that the labels themselves are noisy, which no model will fix.',
      },
      {
        heading: 'Compare on quality, cost and latency together',
        body: 'Report each option on the same held-out set with the same metric, alongside cost per thousand requests and median latency. A model that gains three points of accuracy at fifty times the cost may still be right, but that is a business decision the customer should make with the numbers in front of them.',
      },
    ],
    workedExample: {
      title: 'Ticket routing',
      body: 'A regional utility routes 9,000 emails a week into 12 queues. A majority-class guess scores 31 percent accuracy, a TF-IDF logistic regression scores 84 percent, and a prompted LLM scores 89 percent. The classifier costs almost nothing and answers in 5 ms; the LLM costs about 40 units per week and takes 900 ms. The team uses the classifier, and sends only its low-confidence 15 percent to the LLM, reaching 88 percent overall.',
    },
    warning: 'Skipping a cheap baseline leaves you unable to say whether the LLM adds value. It also hides label problems that would cap any model.',
    takeaways: [
      'Baselines set the floor and often expose bad labels.',
      'Compare options on quality, cost and latency at once.',
      'Cascades that send only hard cases to an LLM are often the best design.',
    ],
    checkYourself: [
      'Which three baselines would you try first for a text classification task?',
      'How would you present a cost and accuracy trade-off to a customer?',
      'What is a cascade, and when does it pay off?',
    ],
    referenceIds: ['ref-canonical-handbook'],
  },
  {
    id: 't2-6-l2',
    moduleId: 't2-6',
    order: 2,
    title: 'Metrics and Overfitting',
    tagline: 'A single accuracy number is easy to report but hides the errors that matter most to the customer.',
    readingMin: 7,
    objectives: [
      'Choose precision, recall or F1 based on error costs',
      'Keep a held-out set that tuning never touches',
      'Recognise overfitting to a prompt or eval set',
    ],
    sections: [
      {
        heading: 'Pick the metric from the cost of each error',
        body: 'Precision is the share of positive predictions that are correct; recall is the share of true positives you found. If missing a case is expensive, as with fraud or safety, favour recall. If a false alarm is expensive, as with automated refunds, favour precision. On imbalanced data, accuracy is misleading because predicting the majority class scores well while catching nothing.',
      },
      {
        heading: 'Hold out data you never tune on',
        body: 'Overfitting means a system performs well on the data it was tuned on and worse on new data. It applies to prompts and few-shot examples as much as to trained models. Split your labelled data into a development set for iteration and a test set you score only at milestones. If the two diverge sharply, you have tuned to the development set.',
      },
    ],
    workedExample: {
      title: 'Fraud flags',
      body: 'An online marketplace has 2,000 labelled transactions, 40 of them fraudulent. A model that flags nothing scores 98 percent accuracy and zero recall. A tuned prompt reaches 0.85 recall and 0.40 precision on the development set, but 0.70 recall on the untouched test set, showing that several few-shot examples had been chosen to fix specific development cases. Replacing them with generic examples gives 0.78 on both sets.',
    },
    warning: 'Reporting accuracy on imbalanced data is a classic mistake, and so is iterating on the test set until it looks good. Both produce numbers that will not hold in production.',
    takeaways: [
      'Choose the metric from the business cost of each error type.',
      'Accuracy misleads on imbalanced data.',
      'Prompts overfit too; keep a test set you rarely look at.',
    ],
    checkYourself: [
      'When would you favour recall over precision?',
      'Why does accuracy mislead on a 2 percent positive class?',
      'How can a prompt overfit, and how would you detect it?',
    ],
    referenceIds: ['ref-ragas', 'ref-canonical-handbook'],
  },
]
