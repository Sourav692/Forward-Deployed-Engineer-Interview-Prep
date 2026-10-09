# Rank and search: the ideas behind problems 21, 22, 27

A RAG system answers from whatever the retriever hands it. These three problems cover the three
places where the retriever decides what to hand over: the query that goes in, the score that
compares a query with a document, and the final order of the results.

## Cosine similarity

An embedding turns a piece of text into a list of numbers, called a vector. Cosine similarity
measures whether two vectors point in the same direction. It gives 1 for the same direction, 0 for
unrelated, and it ignores how long the vectors are.

Why it matters: it is the most common way to say "this chunk means something close to the
question". It breaks in two quiet ways. An all-zero vector (often from an empty document) causes a
divide by zero. Two vectors of different lengths usually mean two different embedding models got
mixed, and their numbers cannot be compared at all.

> Say it like this: "Cosine tells me if two vectors point the same way; I guard against zero vectors and reject mismatched lengths because that means mixed models."

## Hybrid ranking

Hybrid ranking mixes two kinds of search. Vector search finds text with the same meaning, even with
different words. Keyword search finds exact words, which matters for names, codes, and product IDs.
A weighted sum combines them into one score.

Why it matters: "refund policy" and "money back rules" match on meaning, but "error E-404" needs an
exact word match. Using both covers both. The catch is scale: if keyword scores run from 0 to 30
and vector scores from 0 to 1, the keyword score drowns out the other, and the weights mean nothing.

> Say it like this: "A weighted sum only makes sense when both scores are on the same scale, so I ask whether they are calibrated before I trust the mix."

## Stable, explainable ordering

A stable sort keeps items that tie in the order they arrived. Python's `sorted` is stable. An
explainable ranking is one where you can say why document A beat document B.

Why it matters: when a customer asks "why did it answer from this old file?", you need to show the
scores and the rule. Random tie-breaking makes the same question give different answers on
different runs, which makes debugging and testing very hard.

> Say it like this: "I keep ranking deterministic, so the same question always gives the same order and I can explain any result."

## Light query cleaning

Query cleaning (also called normalisation) tidies the user's text before search: lowercase, trim
spaces, remove stray punctuation. Light means doing only what is safe and leaving the meaning alone.

Why it matters: "Refund Policy???" and "refund policy" should find the same documents. But cleaning
too hard breaks things. Removing every punctuation mark turns `E-404` into `e404` and `v2.1` into
`v21`, and now keyword search misses the exact document the user needed.

> Say it like this: "I keep query cleaning conservative and only make it stronger when retrieval tests show it helps."

## Prototype first, then scale

Scanning every document and scoring it one by one is called brute force. It is simple and correct,
and fine for a few thousand documents in a demo.

Why it matters: an FDE often needs a working prototype in a day. Brute force gets you there with no
infrastructure. For millions of chunks you move to a vector index, which finds close neighbours
without checking everything, and adds filters for tenant and permissions.

> Say it like this: "This brute-force search is right for a prototype or a test harness; in production I would use a vector index with tenant filters."

## How the problems use these ideas

- **Problem 21, Rank Retrieved Documents:** hybrid ranking with a weighted sum, stable ordering for
  ties, and the scale question you must ask before trusting the weights.
- **Problem 22, Top-K Search over Embeddings:** cosine similarity with guards for zero vectors and
  mismatched lengths, and a clear "prototype only" boundary.
- **Problem 27, Clean a Search Query:** light query cleaning that removes noise from the edges of
  words but keeps codes and version numbers intact.

## Using an AI assistant on these problems

- Ask for the exact tie rule ("ties keep input order") in the prompt. Otherwise the AI may add a
  second sort key you did not want.
- Say "standard library only, no numpy" for the cosine problem. AI assistants reach for numpy by
  habit, and then you have to explain a dependency you never needed.
- For query cleaning, give the AI one example that must survive, like `E-404` becoming `e-404`. Without
  it, the AI almost always uses `str.translate` and deletes all punctuation.
- Read the sort direction in the AI's code. A missing `reverse=True` is the most common bug, and it
  passes a one-item test.
- If the AI adds normalisation, stopword removal, or stemming you did not ask for, remove it and
  say why: unmeasured changes to retrieval are a risk.

## Words to know

| Term | Plain meaning |
| --- | --- |
| Embedding | A list of numbers that stands for the meaning of a piece of text. |
| Vector | Another word for that list of numbers. |
| Cosine similarity | A score from how closely two vectors point the same way. |
| Hybrid search | Using meaning-based and keyword-based search together. |
| Top-k | The k best results, for example the top 5. |
| Calibrated score | A score where the same number means the same confidence across systems. |
| Stable sort | A sort that keeps tied items in their original order. |
| Vector index | A database structure that finds close vectors fast without checking every one. |
