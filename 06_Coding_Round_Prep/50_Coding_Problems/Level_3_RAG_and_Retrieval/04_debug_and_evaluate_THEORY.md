# Debug and evaluate: the ideas behind problems 25, 29

When a customer says "the assistant gives bad answers", you need evidence, not guesses. These two
problems build that evidence: one finds where retrieval is weak, and the other builds a fair set of
questions to measure the system with.

## Retrieval first, model second

A RAG answer has two stages: find the chunks, then write the answer from them. When the answer is
bad, check the first stage before blaming the second.

Why it matters: if the search returned nothing useful, no model can write a good answer, and
switching to a bigger model only wastes money. Looking at the retrieved chunks and their scores
usually shows the real cause in minutes: a missing document, a stale index, or a permission filter
that hid the right file.

> Say it like this: "When RAG fails, I look at what was retrieved before I blame the model."

## Confidence signals and thresholds

The retriever's best score is a rough signal of how well it found a match. A threshold is the
cut-off below which we call the match weak. No results at all is the strongest warning sign.

Why it matters: weak retrieval is when the model is most likely to make things up. Flagging these
queries tells you where to add documents or fix search. But raw scores are often not calibrated, so
a threshold that works for one retriever or one customer may be wrong for another. Test the
threshold on real examples before trusting it.

> Say it like this: "I flag queries with no results or a weak best score, and I check the threshold on real data because raw scores are rarely calibrated."

## Results that explain themselves

A useful output says not just what was flagged but why. "q7: no results" and "q7: low score" point to
different fixes.

Why it matters: "no results" usually means missing content or a filter that is too strict. "Low
score" usually means the content exists but is worded differently, so better chunking or hybrid
search might help. Returning the reason saves a second round of digging.

> Say it like this: "I return a reason with every flag, because each reason leads to a different fix."

## Coverage over volume

An evaluation set is a fixed list of test questions used to measure the assistant. Coverage means
every important area is in it. Stratified sampling means taking examples from each group (each
category) instead of drawing at random from the whole pile.

Why it matters: a customer's logs might be 80 percent IT questions. A random sample of 100 then has
almost no finance questions, so a finance failure goes unnoticed. Taking up to N from each category
gives a small, balanced set that tests every area.

> Say it like this: "A small balanced eval set is more useful than a big lopsided one, so I sample per category."

## Reproducibility

Reproducible means the same input gives the same output every time. For sampling, that means no
unseeded randomness.

Why it matters: you test version A, change the prompt, and test version B. If the eval set changed
between runs, you cannot tell whether the score moved because of your change or because of the new
questions. A fixed, versioned set makes before-and-after comparisons honest.

> Say it like this: "I keep the eval set fixed and versioned, so a change in score means a change in the system, not in the test."

## How the problems use these ideas

- **Problem 25, Find Low-Confidence Retrievals:** retrieval first, confidence thresholds, and
  returning a reason with each flagged query.
- **Problem 29, Sample an Evaluation Set by Category:** coverage over volume through per-category
  sampling, an "unknown" bucket for missing categories, and a reproducible result.

## Using an AI assistant on these problems

- Tell the AI to check for an empty scores list before calling `max`. It is the most common crash on
  this problem, and the happy-path test will not catch it.
- Ask for the exact boundary rule ("equal to the threshold is fine") and check `<` versus `<=`.
- Say "no random module" for sampling. AI assistants reach for `random.sample` by default, which makes
  every run different.
- Ask for categories in first-seen order. Otherwise the AI may sort them alphabetically, which is
  fine but not what you asked, and a sign it is not following the spec closely.

## Words to know

| Term | Plain meaning |
| --- | --- |
| Threshold | A cut-off value that splits good from weak. |
| Calibrated | When a score of 0.7 means the same confidence everywhere. |
| Evaluation set | A fixed list of test questions used to measure the system. |
| Coverage | How many of the important areas the tests include. |
| Stratified sampling | Picking examples from each group, not from the whole pile at once. |
| Reproducible | Gives the same result every time for the same input. |
| Hallucination | When the model states something that is not in its sources. |
