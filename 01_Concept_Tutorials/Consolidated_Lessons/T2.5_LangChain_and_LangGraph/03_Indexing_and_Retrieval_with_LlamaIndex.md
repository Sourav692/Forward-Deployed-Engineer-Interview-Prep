# Indexing and Retrieval with LlamaIndex

*Rich nodes and built-in query engines make hard document retrieval easy to express, but they tie the index design to one framework's vocabulary.*

◷ 5 min

LlamaIndex is not a second LangChain. It is specialised for organising documents and retrieving from them. LangChain is a general application framework where RAG is one use case, and [What a Framework Buys You](01_What_a_Framework_Buys_You.md) places the two side by side.

**Objectives:**

- describe how LlamaIndex turns documents into linked nodes;
- choose an index type for a retrieval need;
- explain hierarchical retrieval and the built-in query engines.

---

## Build on Nodes, Not Plain Documents

LangChain's unit is a `Document`: text plus metadata. LlamaIndex's unit is a node, a chunk with rich metadata and links to its neighbours. That difference drives everything else in the framework.

| Aspect | LlamaIndex | LangChain |
|---|---|---|
| Core building block | Node: chunk with rich metadata and links | Document: simpler |
| Index types | Many specialised types | Mostly vector store wrappers |
| Retrieval depth | Deep, multi-stage, configurable | Standard top-k, extendable |
| Agents | Growing, focused on data agents | Mature, general-purpose |
| Best for | Complex document question answering | General LLM apps with tools and memory |

Readers, such as `SimpleDirectoryReader` for local files, produce documents. A node parser converts them into nodes, each with text, a `node_id`, metadata, and links named PREVIOUS, NEXT, PARENT, CHILD and SOURCE. Splitters include `SentenceSplitter`, which keeps sentences whole, `TokenTextSplitter`, which splits by token count, and `SemanticSplitterNodeParser`, which splits where embedding similarity shows the topic changing.

The links are what make two retrieval tricks possible. Small-to-big retrieval finds a small chunk, then expands to its parent. Sentence-window retrieval finds one sentence, then includes the sentences around it. A metadata extractor can also call a model at ingestion time to add a summary, the questions a chunk answers, and its key entities, which sharpens retrieval later.

## Choose the Index by the Question

Each index type answers a different kind of question. Pick by what users will ask.

| What users ask | Index | Notes |
|---|---|---|
| Semantic questions over a corpus | `VectorStoreIndex` | Embeds chunks into a vector database; the production default |
| "Summarise all of this" | `SummaryIndex` (formerly `ListIndex`) | Stores nodes in order; not for fast search |
| Questions over very long documents | `TreeIndex` | Parents summarise children; rarely used in modern production |
| Exact terms such as legal terms or product codes | `KeywordTableIndex` | An inverted index on keywords |
| Questions about relationships | `KnowledgeGraphIndex` | Entities and the links between them |

Modern production usually means a `VectorStoreIndex` plus hybrid retrieval (vector and keyword together), node relationships and reranking. Those techniques are taught framework-free in [T7.1 Retrieval: hybrid, rerank, query transformation](/learn/llm-and-retrieval/retrieval-hybrid-rerank).

## Retrieve the Section, Then the Detail

Hierarchical retrieval finds the right section first, then the right detail inside it. A small chunk matches a question precisely but carries little context. A whole section carries context but matches loosely. Hierarchy gets both.

The recipe has three steps. Parse with `HierarchicalNodeParser` at several chunk sizes, such as section, medium and paragraph. Index only the small leaf nodes in a `VectorStoreIndex`, but keep every level in the docstore. Wrap the retriever in `AutoMergingRetriever`: when enough small chunks from one parent are retrieved, it swaps them for the full parent. The model then gets richer context without the noise of many fragments.

This suits manuals with chapters and sections, and legal documents with articles and clauses.

## Use the Built-In Query Engines

LlamaIndex ships smarter query handling, which is a main reason to choose it for complex retrieval. HyDE (hypothetical document embeddings) has the model write a fake answer first and searches with that, because a fake answer often resembles the real documents more than the question does. `MultiStepQueryEngine` breaks a hard question into steps that each retrieve and reason before the next. `SubQuestionQueryEngine` splits a question into sub-questions, sends each to the best index, and combines the answers. `RouterQueryEngine` lets a model pick the engine, vector, summary or keyword, that suits the query.

> **Warning: the built-in vector store is for prototypes.** `SimpleVectorStore` lives in memory. It is easy and needs no infrastructure, but it does not scale, offers fewer search options, and needs persistence set up by hand. Production uses an external store such as Qdrant, Pinecone, Weaviate, Chroma or Milvus, with tunable HNSW or IVF indexes. Even then, LlamaIndex keeps its own docstore and storage context for node metadata and relationships, separate from the vectors.

## Worked Example: A Contract Question-Answering Service

A legal team wants answers over contracts organised into articles and clauses. Questions name exact clause terms and also ask "what does the termination section say overall?".

Parse each contract hierarchically, article, clause and paragraph. Index the paragraph leaves in a `VectorStoreIndex` backed by an external store, and keep the articles in the docstore. Auto-merging retrieval returns a whole clause when several of its paragraphs match. Add a `KeywordTableIndex` for exact clause terms, and let a `RouterQueryEngine` send each question to the vector or keyword index.

Every piece of that design is an index or engine LlamaIndex already ships. That is the case for choosing it: enterprise document question answering where retrieval accuracy matters more than application flexibility.

---

## Key Takeaways

- LlamaIndex's node carries metadata and links, enabling small-to-big and sentence-window retrieval.
- Pick the index by the question: vector for meaning, summary for whole collections, keyword for exact terms, knowledge graph for relationships.
- Hierarchical retrieval indexes small leaves, keeps every level, and auto-merges to the parent when many leaves match.
- Built-in engines cover HyDE, multi-step, sub-question and routed queries; the in-memory store is for prototypes only.
- Choose LlamaIndex for complex document question answering and LangChain for broader apps with tools and memory; many systems use both.

## Check Yourself

1. **What do node links make possible that plain chunks do not?**
   Small-to-big retrieval, which expands a matched chunk to its parent, and sentence-window retrieval, which adds the sentences around a matched one.

2. **Describe auto-merging retrieval in two sentences.**
   Index only the small leaf nodes but keep every level in the docstore. When enough leaves from the same parent are retrieved, swap them for the parent.

3. **When does LangChain win over LlamaIndex?**
   When the app needs agents calling tools and APIs, rich multi-turn memory, or several LLM features on one stack. For pure document question answering, LlamaIndex is the stronger fit.

## References

**Sources:** `Module_02_RAG_Frameworks_Tools_Implementation.md`: Topic 2 "LlamaIndex (Indexing and Retrieval Design)", all seven questions: design differences, index types, documents to nodes, hierarchical retrieval, query transformation, built-in versus external vector storage, and when LlamaIndex beats LangChain.
