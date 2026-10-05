# Module 2 – RAG Frameworks, Tools & Implementation (Beginner Guide + Keywords)

Oct 4, 2026 · @Sourav Banerjee

## Overview

This module is about the tools you actually use to build a RAG app: the frameworks that connect everything, the databases that store your vectors, and the tools that measure quality. Think of it as the toolbox after Module 1 taught you the ideas.

&#91;embedded content: RAG app steps, orchestration and evaluation · 5 steps\]

The five steps are the usual RAG flow. **LangChain** and **LlamaIndex** build it, a **vector database** stores and searches it, **LangGraph** adds decisions and loops around it, and evaluation tools like **RAGAS** score it.

Topics in this module:

- Topic 1: LangChain (Architecture and Components)
- Topic 2: LlamaIndex (Indexing and Retrieval Design)
- Topic 3: Vector Databases and Search Engines
- Topic 4: Evaluation Frameworks
- Topic 5: LangGraph (Stateful and Agentic Workflows)

**Bold keywords** throughout are the exact terms to use in interviews.

## Topic 1: LangChain (Architecture and Components)

**LangChain** is a toolkit that connects all the pieces of a RAG app (loading, chopping, searching, prompting, answering) so you do not write the plumbing yourself.

### What are the main parts of a LangChain RAG pipeline and how do they work together?

Think of it like an assembly line, where each station hands its output to the next one:

- **Document Loaders**: read raw content from PDFs, web pages, databases, **S3**, **Notion**. Output is a list of **Document** objects (text in `page_content` plus `metadata`).
- **Text Splitters**: cut big documents into small chunks (**RecursiveCharacterTextSplitter**, **TokenTextSplitter**).
- **Embedding Models**: turn text into number vectors (**OpenAI**, **HuggingFace**, **Cohere**) behind one common interface.
- **Vector Stores**: save and search those vectors (**Pinecone**, **Weaviate**, **FAISS**, **Chroma**, **Qdrant**). You call `.similarity_search()` and the ANN (approximate nearest neighbour) search is hidden.
- **Retrievers**: sit on top of the store and add extras like filtering, re-ranking, or multi-query expansion.
- **Chains + LLM**: (**RetrievalQA**, **ConversationalRetrievalChain**) paste the retrieved chunks and the question into a prompt and call the LLM.

One request flows like this: user question, then **Retriever** (embed the question, find top-k chunks), then **Prompt Template**, then **LLM**, then **Output Parser**, then answer.

### How does LangChain keep retrieval, prompting and generation separate (so I can swap parts)?

Every part follows a standard shape, so you can replace one without touching the rest.

- **Retrieval**: retrievers follow the **Runnable** interface (call `.invoke(query)`). Older code used `.get_relevant_documents()`. You can swap **FAISS** for **Pinecone** or **Qdrant** and nothing else changes.
- **Prompting**: **PromptTemplate** and **ChatPromptTemplate** have blanks like `{context}` and `{question}` filled at run time. Also **FewShotPromptTemplate** and example selectors. Prompts can be versioned on their own.
- **Generation**: every model (**OpenAI**, **Anthropic**, local, **HuggingFace**) is called the same way with `llm.invoke(prompt)`. **Output Parsers** turn raw text into JSON, lists or Python objects.
- Everything snaps together with the pipe style, called **LCEL** (LangChain Expression Language): `prompt | llm | output_parser`.

### What goes wrong when using LangChain in big production systems?

Great for prototypes, but at scale you hit real pain:

- **Hidden work**: high-level chains hide what is slow or wrong, so debugging means digging into library internals.
- **Extra overhead**: wrapper objects on every call add latency, which matters if you need very fast responses.
- **Changing API**: code breaks between versions (**v0.0.x**, **v0.1.x**, **v0.2.x**), so upgrades are risky.
- **Little fine control**: custom scoring or odd flows lead to subclassing and monkey-patching, which is fragile.
- **Hard debugging**: deep stack traces, and observability needs extra **callbacks** setup.
- **Dependency bloat**: lots of packages installed even if you use a few.

In simple words: prototype with LangChain, then replace the busy hot path with lean custom code if needed.

### How do I do multi-step (multi-hop) reasoning in LangChain?

The idea: break a hard question into small ones, search for each, then combine.

1. **Decompose**: an LLM splits the question into sub-questions (for example, "what caused the 2008 crisis?" and "how did governments respond?").
2. **Retrieve** for each sub-question, then remove duplicates or re-rank.
3. **Synthesize**: send all the evidence to the LLM for one final answer.

Modern LangChain builds this with **LCEL** and **Runnables** (`RunnablePassthrough`), not by subclassing the old `Chain` class (now legacy). If you need loops, branches, tool calls or agent decisions, use **LangGraph** instead (it models the flow as a state machine graph).

### How does LangChain remember the conversation in a chat-style RAG app?

Memory lets users say "what is the price?" without repeating which plan they meant. The main types:

| Memory type | What it does | Catch |
| --- | --- | --- |
| **ConversationBufferMemory** | Keeps the whole chat | Grows until it overflows the context window |
| **ConversationBufferWindowMemory** | Keeps only the last K turns | Forgets older context |
| **ConversationSummaryMemory** | LLM summarizes old turns | Extra LLM call = more latency and cost |
| **ConversationSummaryBufferMemory** | Recent turns word for word, older ones summarized | Best balance for long chats |

- **ConversationalRetrievalChain** first rewrites the question using the chat history ("What is the price?" becomes "What is the price of the Pro plan?") before searching. This **query reformulation** is key for good retrieval.
- In production, store memory in **Redis** or a database, not in Python objects, so it survives restarts and works across servers.

### How do I stream the answer token by token?

Streaming shows words as they are generated, so the user feels it is faster.

- Use `chain.stream(...)` for normal code and `chain.astream(...)` for async code (all components have `a`-prefixed async versions).
- In a web API, return a **FastAPI** `StreamingResponse` with `text/event-stream` (**SSE**, server-sent events).
- What streams: only the LLM's tokens. Retrieval and re-ranking happen first and cannot stream.
- Nice touch: send a "Searching documents..." message while retrieval runs, then start streaming.

### When should I skip LangChain and build my own pipeline?

Go custom when:

- You have **strict latency** needs and cannot afford wrapper overhead.
- Your retrieval logic is **custom** (own scoring, multi-stage filtering) and fights the framework.
- You run **high volume** and want exact control over tokens and API calls (cost).
- Your team already knows **FastAPI**, the **OpenAI SDK** and **Qdrant SDK** well.
- The flow is unusual: parallel retrieval, human-in-the-loop, loops (better in **LangGraph** or plain code).
- You cannot accept **breaking API changes** in a core dependency.

Keep LangChain for fast prototypes, standard pipelines, and small teams where its ready-made integrations cover most needs.

## Topic 2: LlamaIndex (Indexing and Retrieval Design)

**LlamaIndex** is a framework built mainly for organizing documents and retrieving from them well.

### How is LlamaIndex different from LangChain in design?

In one line: LlamaIndex is specialized for indexing and retrieval; LangChain is a general LLM app framework where RAG is one use case.

| Aspect | LlamaIndex | LangChain |
| --- | --- | --- |
| Core building block | **Node** (chunk with rich metadata and links) | **Document** (simpler) |
| Index types | Many specialized types | Mostly vector store wrappers |
| Retrieval depth | Deep, multi-stage, configurable | Standard top-k, extendable |
| Agents | Growing, focused on data agents | Mature, general-purpose |
| Best for | Complex document Q&A | General LLM apps with tools, memory |

Many real systems use both: **LlamaIndex** for indexing and retrieval, **LangChain** or **LangGraph** to orchestrate.

### What index types does LlamaIndex have and when do I use each?

- **VectorStoreIndex**: embeds chunks into a vector DB. Use for semantic search and RAG. The default in most production systems.
- **SummaryIndex** (formerly **ListIndex**): stores nodes in order, good for summarizing a whole collection, not for fast search.
- **TreeIndex**: a tree where parents are summaries of children. For very long documents, but rarely used in modern production.
- **KeywordTableIndex**: an inverted index on keywords. Good when exact terms matter (legal terms, product codes).
- **KnowledgeGraphIndex**: entities and their relationships. Good for relationship-heavy questions.

Modern production usually means **VectorStoreIndex** plus **hybrid retrieval** (vector + keyword), **node relationships** and **reranking**.

### How does LlamaIndex turn documents into nodes?

- **Readers** (**SimpleDirectoryReader** for local files, many others for PDF, Notion, Slack, databases) produce **Document** objects.
- A **NodeParser** converts them into **Nodes**: text, a `node_id`, metadata, and links to other nodes (**PREVIOUS**, **NEXT**, **PARENT**, **CHILD**, **SOURCE**).
- Links allow **small-to-big retrieval** (find a small chunk, then expand to its parent) and **sentence-window retrieval** (find a sentence, include the sentences around it).
- **MetadataExtractor** uses an LLM at ingestion time to add summaries, questions the chunk answers, and key entities, which makes retrieval more precise.
- Splitters: **SentenceSplitter** (keeps sentences whole), **TokenTextSplitter** (by token count), **SemanticSplitterNodeParser** (splits where the topic changes, using embedding similarity).

### How do I design hierarchical retrieval?

Idea: first find the right section, then the right detail inside it.

1. Use **HierarchicalNodeParser** with several chunk sizes (for example big section, medium, small paragraph).
2. Index only the small **leaf nodes** (`get_leaf_nodes`) in a **VectorStoreIndex**, but keep all levels in the **docstore**.
3. Wrap the retriever in **AutoMergingRetriever**. If enough small chunks from the same parent are retrieved, it swaps them for the full parent, giving the LLM richer context without noise.

Good for manuals with chapters and sections, or legal documents with articles and clauses.

### How does LlamaIndex handle smarter queries (query transformation, multi-step)?

- **HyDE** (Hypothetical Document Embeddings): the LLM writes a fake answer first, and that fake answer is used to search, since it often looks more like the real documents than the question does.
- **MultiStepQueryEngine**: breaks a hard question into steps, where each step retrieves and reasons before the next.
- **SubQuestionQueryEngine**: splits into sub-questions, sends each to the best index, then combines the answers.
- **RouterQueryEngine**: an LLM picks which engine suits the query (vector, summary or keyword).

These being built in is a big reason to pick LlamaIndex for complex retrieval.

### Should I use LlamaIndex's built-in vector storage or an external vector database?

|  | Built-in (**SimpleVectorStore**, in-memory) | External (**Qdrant**, **Pinecone**, **Weaviate**, **Chroma**, **Milvus**) |
| --- | --- | --- |
| Good | Very easy, great for prototypes, no extra infrastructure | Production-grade ANN, scaling, persistence, replication, tunable **HNSW** / **IVF** |
| Bad | Does not scale, fewer ANN options, you must set up persistence | More infrastructure and setup |

Even with an external DB, LlamaIndex keeps a **docstore** and a **storage context** for node metadata and relationships, separate from the vectors.

### When is LlamaIndex a better choice than LangChain?

- **Complex indexing**: many document types, hierarchical structure, LLM-based metadata extraction.
- **Sophisticated retrieval**: sub-question routing, mixing index types, knowledge graphs plus text.
- **Enterprise document Q&A** where answer accuracy matters more than app flexibility.
- **Built-in query tricks** like **HyDE** and step decomposition.

LangChain wins when you need agents calling tools and APIs, rich multi-turn memory, or several LLM features on one stack. The two are converging, so for pure document Q&A pick LlamaIndex, and for a broader LLM app with RAG pick LangChain.

## Topic 3: Vector Databases and Search Engines

A vector database stores your chunk embeddings and finds the closest ones to a query fast. This topic is about picking one, how it searches, and what hurts when it gets huge.

### How do FAISS, Pinecone, Weaviate and Milvus compare in real-world use?

| Tool | What it is | Good for | Watch out for |
| --- | --- | --- | --- |
| **FAISS** | A search library, not a database. Runs inside your app. Supports **IVF**, **HNSW**, **Product Quantization**. Saving to disk is manual. | Research, offline pipelines, local prototypes | No distribution, no built-in metadata filter, no server. You build scaling yourself |
| **Pinecone** | Fully managed service. Auto-scaling, metadata filtering, replication, dense + sparse (hybrid) search | Small teams, fast launch, little ops work | Proprietary, cost grows at scale, few low-level tuning knobs |
| **Weaviate** | Open source (self-host or cloud). Built-in hybrid (**BM25** + vector), schema-based, **REST** and **GraphQL** APIs | Hybrid search, structured metadata plus vectors, self-hosting | Schema design and setup are more work |
| **Milvus** | Open source, distributed. Many ANN options (**HNSW**, **IVF\_FLAT**, **IVF\_PQ**, **DiskANN**) | Hundreds of millions to billions of vectors | Complex to run, needs several supporting components |

### When should I pick a managed vector DB instead of self-hosting?

Choose **managed** (for example **Pinecone**) when:

- The team is small and has no infrastructure person.
- You need to ship quickly (running in minutes, not days).
- Compliance (**SOC2**, **GDPR**) lets data live with a vendor.
- Scale is moderate (roughly under 50M vectors).

Choose **self-hosted** when:

- **Data residency** rules (**HIPAA**, government, finance) keep data in your own environment.
- You are at 100M+ vectors and heavy traffic, where managed pricing gets much higher.
- You need custom **HNSW** settings, quantization or index types the vendor does not offer.
- You already run **Kubernetes** and have a team for it.

A common mix: managed for dev and staging, self-hosted for production.

### How do different vector DBs actually do the approximate nearest neighbour (ANN) search?

The algorithm decides speed, accuracy (recall) and memory use.

- **HNSW** (Hierarchical Navigable Small World): a multi-layer graph, like a map with highways and local roads. Very fast with high recall, but the whole graph must sit in RAM. Used by **Weaviate**, **Qdrant**, **Milvus** (option), **pgvector**. Knobs: `ef_construction` (build quality) and `ef_search` (query quality vs speed).
- **IVF** (Inverted File Index): groups vectors into clusters with **K-means** and only searches nearby clusters. Uses less memory, can use disk, but needs a training step. Used by **FAISS** and **Milvus**.
- **IVF\_PQ**: IVF plus **Product Quantization** (compression). Memory drops a lot, with a small accuracy loss. For very large sets.
- **DiskANN**: index lives on SSD instead of RAM, so billion-scale search works on normal hardware, with slightly higher latency. Used by **Milvus** and **Azure AI Search**.
- **Pinecone**: its own undisclosed algorithm, with no knobs for you to tune.

### How do metadata filtering and hybrid search differ across vector DBs?

**Metadata filtering** means limiting results by fields like document type, user ID, date or category. Three styles:

- **Post-filtering**: search first, filter after. Fast, but you can miss good results that were not in the first top-K. Typical with **FAISS** plus outside filtering.
- **Pre-filtering**: filter first, then search the remaining set. Respects filters, but can slow ANN when the filtered set is small or scattered.
- **Filter-aware ANN traversal**: the filter is built into the graph search itself. Keeps quality and avoids wasted work. Used by **Qdrant**, **Pinecone**, and **Weaviate** (depending on config).

**Hybrid search** means mixing dense vectors (meaning) with sparse keyword scoring (**BM25**):

- **Weaviate**: built in, with configurable fusion to merge scores.
- **Qdrant**: stores sparse and dense vectors together and combines scores.
- **Pinecone**: supports sparse-dense, but you must create the sparse vectors yourself before ingesting.
- **FAISS**: no keyword search, so pair it with **Elasticsearch**, **OpenSearch** or a **BM25** library and merge results in your code.
- **Milvus**: multiple vector fields combined; real BM25 usually needs an outside search engine.

### How would I test and compare vector DBs before choosing?

Use your own data, not vendor benchmarks. Steps:

1. **Write requirements**: target **QPS** (queries per second), max **P95 latency**, dataset size now and in 12 months, needed recall (95% or 99%), must-have features (hybrid, filtering, multi-tenancy).
2. **Build a realistic test set**: real documents, your real embedding model, your real metadata and filters.
3. **Measure indexing**: time to index 100k, 1M, 10M vectors; CPU and memory; how soon new vectors become searchable.
4. **Measure queries under load**: at 1x, 5x, 10x expected QPS, record **P50**, **P95**, **P99** latency, with and without filters.
5. **Measure recall**: compare ANN results to exact brute-force results. **Recall@K** = how many of the ANN top-K match the exact top-K, divided by K. Aim for at least 95% at your `ef_search` or `nprobe` setting.
6. **Measure operations**: setup effort, monitoring, update and delete speed, recovery time after a failure.

### What breaks when a vector DB grows to 100M+ embeddings?

- **Memory**: 100M vectors at 1536 dimensions is about 600GB raw, nearly 1TB with the **HNSW** graph. Fix with **sharding** (split across machines) and **INT8 quantization** (compress numbers).
- **Index build time**: building HNSW takes many hours, and switching embedding model means a full re-index. Fix with **incremental indexing**: new vectors go in a small flat index and merge into the main one later.
- **Updates and deletes**: HNSW cannot update in place. Use **logical deletes** plus regular **compaction**, with offline rebuilds in quiet hours.
- **Backup and recovery**: huge to copy. Stream changes to object storage and rebuild from the last checkpoint.
- **Schema changes**: new metadata, new embedding model or new chunking means re-indexing everything. Keep **versioned indexes** and shift traffic slowly with **index routing**.
- **Cost**: managed can reach tens of thousands of dollars per month at this size; self-hosted is cheaper but brings all the work above.

## Topic 4: Evaluation Frameworks

Evaluation means measuring, with numbers, whether your RAG system is good. Tools do this automatically so you do not rely on eyeballing answers.

### Which tools can automatically score a RAG system?

- **RAGAS**: the most popular open-source option. Metrics: **faithfulness** (is the answer backed by the retrieved text), **answer relevance**, **context precision**, **context recall**, **answer correctness**. It uses **LLM-as-judge** (another LLM gives the score). Works with **LangChain** and **LlamaIndex**.
- **TruLens**: evaluation plus tracing and monitoring. Known for the **RAG Triad**: groundedness, answer relevance, context relevance.
- **DeepEval**: open-source testing for LLM apps. Detects hallucination, bias and toxicity, has **G-Eval** metrics, and plugs into **pytest** so tests run in **CI/CD**.
- **LangSmith**: platform from the LangChain team for tracing, datasets, human feedback and automated evals. Best with LangChain apps.
- **Arize Phoenix**: open-source observability with embedding visualization, drift detection, retrieval analysis and production monitoring.

### How do I build an automatic evaluation pipeline instead of testing by hand?

Manual testing does not scale. An automated pipeline runs on every change and catches quality drops before users do.

1. **Build an evaluation dataset**: about 200 to 500 question-answer pairs with the correct source chunks. Keep it versioned (**LangSmith**, a database, or a CSV in git). Include tricky cases: out-of-scope, multi-hop and vague questions.
2. **Pick metrics and thresholds** with **RAGAS**, for example faithfulness 0.80, answer relevancy 0.75, context recall 0.70.
3. **Run the evaluation**: feed questions, generated answers, retrieved contexts and ground truth into RAGAS `evaluate()`.
4. **Fail on regression**: if any score is below its threshold, the build fails.
5. **Store and trend** the scores with a timestamp and **git commit hash**, so you can see what change helped or hurt.

### How is checking the retriever different from checking the generated answer?

They measure different layers, so measure them separately.

**Retrieval evaluation** asks: did we fetch the right chunks?

- Needs questions with labeled relevant chunk IDs. No LLM needed.
- **Recall@K**: share of the relevant chunks found in the top K.
- **Precision@K**: share of the top K that are really relevant.
- **MRR** (Mean Reciprocal Rank): how high the first correct result appears.
- **NDCG**: ranking-aware score that rewards putting the best chunk first.

**Generation evaluation** asks: is the answer good?

- Needs the retrieved context and the answer, plus ground truth or an LLM judge.
- **Faithfulness**: every claim is backed by the context.
- **Answer relevance**: it actually answers the question.
- **Factual correctness**: matches the ground truth.

Why both: good generation on poor retrieval means the LLM is making things up from memory; good retrieval with poor generation means the LLM ignored the right context. Only separate scores tell you which layer is broken.

### How do I run evaluation continuously inside CI/CD?

1. **Keep a versioned test set** (questions, ground-truth answers, expected sources, including edge cases), stored in git, **LangSmith** or a database.
2. **Run the pipeline in CI** on every question: retrieval, context building, generation. Save the outputs.
3. **Compute metrics** with **RAGAS** or **DeepEval** (faithfulness, answer relevance, context recall, answer correctness).
4. **Enforce thresholds**: the CI job fails if scores drop (for example faithfulness at least 0.80), so regressions never merge.
5. **Track history** with commit hash, timestamp and pipeline version.

Keep cost and speed under control: run a small dataset on pull requests, the full set on merges or **nightly builds**, and use cheaper judge models for routine runs.

## Topic 5: LangGraph (Stateful and Agentic Workflows)

**LangGraph** lets you build AI workflows as a graph (boxes and arrows), so you can have decisions, loops and pauses.

### What can LangGraph do that normal LangChain chains cannot?

A chain is a straight line. It struggles when you need:

- **Conditional branching**: do different things depending on a result.
- **Loops and retries**: search again if the first try was bad.
- **State** that lives and updates across steps.
- **Human-in-the-loop**: pause for a person to approve.
- **Parallel** steps.

LangGraph models the flow as a **directed graph**: **nodes** are steps, **edges** are the transitions (some conditional), and shared state travels through. Example: retrieve, check if the context is enough, rewrite the query and retry if not, generate, check faithfulness, regenerate if needed. Doing this with plain Python control flow is messy and cannot be viewed as a picture; in a graph it is clean.

### How does LangGraph keep shared state between steps?

- You define one **state** object with **TypedDict** or **Pydantic** (for example: query, retrieved chunks, answer, retry count).
- Each node reads the state, does its job, and returns only a partial update. LangGraph merges it into the global state.
- **Reducers** decide how to merge each field: overwrite, append to a list, or aggregate. You set them with `typing.Annotated`, for example `Annotated[list, operator.add]` means append instead of replace.
- **Checkpointing** saves state to **Redis**, a database or object storage. That enables long-running workflows, human approvals, and recovery after a crash.

### How would I build a self-correcting RAG graph with retrieval, query rewriting and generation?

Use **StateGraph** with these nodes: **retrieve**, **evaluate\_retrieval**, **rewrite\_query**, **generate**, **evaluate\_answer**.

1. Start at `retrieve`, then go to `evaluate_retrieval`.
2. A **conditional edge** (`add_conditional_edges`) checks the retrieval score. If it is low and retries remain, go to `rewrite_query` and back to `retrieve`. Otherwise go to `generate`.
3. After `generate`, go to `evaluate_answer`. If the **faithfulness** score is low and retries remain, loop back to `generate` with a stricter prompt. Otherwise finish at **END**.
4. Call `compile()` to get the runnable app.

A `retry_count` in the state stops infinite loops, and the state at each step can be logged for debugging.

### How does LangGraph handle branching, retries and failures?

- **Branching**: a routing function reads the state and returns the next node name (for example factual question goes to vector retrieval, summary question goes to summary retrieval, else hybrid).
- **Retries**: keep a counter in the state, and always set a maximum so loops end.
- **Failure recovery**: **checkpointing** saves state after each step, so a crashed run resumes from the last checkpoint instead of restarting. The same feature enables pause and resume for humans.
- **Parallel work**: fan-out with **Send** runs several retrievals or reasoning paths at once and merges results later.

### When should I choose LangGraph over plain LangChain for production RAG?

Choose **LangGraph** when you have:

- **Conditional logic**: routing by query type, retry on weak quality, different prompts by confidence.
- **Loops and self-correction**: agentic RAG that checks itself, or multi-hop that decides if it needs more info.
- **Explicit state** across turns or long workflows with checkpoints.
- **Human-in-the-loop**: approvals, moderation review queues.
- **Visibility**: the graph shows exactly what happened, with each node's input and output state logged.

Stay with a **LangChain chain** if the flow is a straight line (retrieve, prompt, generate, return) with no retries or state building.

Rule of thumb: if your flowchart has decision diamonds and arrows going backwards, use LangGraph. If it is a straight line of boxes, a simple chain is enough.
