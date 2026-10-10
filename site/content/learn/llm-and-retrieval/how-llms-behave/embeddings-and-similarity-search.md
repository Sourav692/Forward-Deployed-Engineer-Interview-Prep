# Embeddings and Similarity Search

*Searching by meaning finds text that shares no words with the question, but only when the question and the documents were turned into numbers the same way.*

◷ 5 min

Keyword search cannot see that two sentences mean the same thing. An embedding can, so learn what it is, how two embeddings are compared, and what silently breaks the comparison.

**Objectives:**

- explain what an embedding is and why similar meanings land close together;
- describe how cosine similarity ranks chunks at query time;
- name the two configuration slips that corrupt similarity scores without raising an error.

---

## Turn Text Into a Vector That Carries Meaning

An embedding turns a piece of text into a long list of numbers, called a vector. Texts with similar meaning get similar vectors. "How do I reset my password?" and "Steps to change my login credentials" share almost no words. Their vectors are still very close.

That closeness is the whole trick. A model that has learned meaning places related texts near each other in the same space. Searching by distance in that space is called semantic retrieval. It is much stronger than keyword search for natural-language questions.

## Embed the Corpus Once and Each Question at Query Time

A retrieval system uses embeddings at two moments. At indexing time, every chunk of every document is converted to a vector and stored. At query time, the user's question is converted to a vector too. The system then finds the stored chunks closest to the question vector and passes them to the language model as context.

Both moments must call the same model. A query vector and a document vector are only comparable when they live in the same space. The two calls differ in name only: one embeds a query, the other embeds a batch of documents, and both go to one model.

| Moment | What is embedded | How often | Where the vector goes |
|---|---|---|---|
| Indexing | Every chunk of the corpus | Once per chunk, and again when the model changes | The vector store |
| Query | The user's question | Once per request | Compared against the stored vectors |

## Compare Direction With Cosine Similarity

Cosine similarity measures how closely two vectors point the same way. It ignores the length of each vector and compares only the angle between them. That matters because an embedding's magnitude is not meaningful. Only its direction carries meaning.

Dot product is the other common comparison. Either way, the chunks with the highest scores become the context for the answer. How a vector store finds those chunks quickly over millions of vectors is covered in [Chunking and indexing](/learn/llm-and-retrieval/chunking-and-indexing).

> **Warning: two silent defaults break similarity.** Some vector stores default to Euclidean distance, not cosine; the interview tutorial's example is Chroma, whose index uses squared-L2 unless cosine is set when the collection is created. That setting cannot be changed later without reindexing. Separately, a wrapper called with no model argument can fall back to an older embedding model. Neither slip raises an error. Rankings just quietly change.

## Read Dimension as Cost, Not Quality

The number of values in a vector is its dimension. Dimension affects storage, compute cost and index performance, but not quality by itself. Two 768-dimension models can perform very differently. The model's architecture and training data matter far more than its dimension.

Higher dimensions mean more memory and slightly slower approximate nearest-neighbour search. The GenAI Engineering guide gives a rough guide: 384 to 768 dimensions is efficient for large collections, 768 to 1536 is the usual balance, and above 3000 costs more with diminishing returns.

## Worked Example: A Password Question With No Shared Words

A user types "How do I reset my password?" The help centre's article is titled "Steps to change my login credentials". A keyword engine scores the pair near zero, because "reset" and "password" never appear in the article.

With embeddings, the article was embedded at indexing time and the question is embedded at query time by the same model. Their vectors point in nearly the same direction, so cosine similarity is high and the article ranks first. Now change one thing: the corpus was embedded with model A and the question with model B. Both vectors may have the same dimension, but they come from different spaces. The score becomes meaningless, and the right article can fall out of the results with no error anywhere.

The example shows the two halves of the lesson. Embeddings find meaning that keywords miss, and that only holds while both sides share one model.

---

## Key Takeaways

- An embedding is a vector that places texts with similar meaning close together.
- Embed every chunk at indexing time and each question at query time, with the same model.
- Cosine similarity compares direction only; check the store's default distance metric.
- Dimension drives cost and speed, while the model's training drives quality.
- Similarity search beats keywords on paraphrase, but a model mismatch breaks it silently.

## Check Yourself

1. **Why does cosine similarity ignore vector length?**
   An embedding's magnitude carries no meaning; only its direction does. Comparing the angle ranks texts by closeness of meaning.

2. **A team switched vector stores and retrieval rankings changed, though the embeddings did not. What is the likely cause?**
   The new store uses a different default distance metric, such as Euclidean instead of cosine. Set the metric when the collection is created; changing it later means reindexing.

3. **Does a 1536-dimension model always beat a 768-dimension model?**
   No. Dimension changes storage, compute and index speed. Quality comes mainly from the model's architecture and training data, so test both on your own queries.

