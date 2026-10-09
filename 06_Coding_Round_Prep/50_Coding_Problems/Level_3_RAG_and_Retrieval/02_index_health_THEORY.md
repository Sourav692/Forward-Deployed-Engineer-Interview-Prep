# Index health: the ideas behind problems 23, 24, 26

The vector index is the assistant's memory. If the wrong records get in, if old records never get
refreshed, or if loading fails halfway, the answers go wrong even when the search code is perfect.
These three problems guard the index: what goes in, when it is refreshed, and how it is loaded.

## Freshness

Freshness means the index holds the current version of each document. A record is stale when the
source changed after its embedding was made.

Why it matters: an HR policy changes the leave allowance from 20 to 25 days. If the index still
holds the old embedding, the assistant confidently says 20. The search worked, the model worked, and
the answer is still wrong. Freshness is part of answer quality.

> Say it like this: "A RAG answer can be wrong even when retrieval works, if the index is stale, so I track when each document was embedded."

## Fail safe on missing data

When a value you need is missing, pick the outcome that does the least harm. For freshness, the safe
side is "re-embed it". For access control, the safe side is "nobody can see it".

Why it matters: a common bug is `doc.get("updated_at", 0)`. It looks harmless, but it quietly treats
"we do not know when this changed" as "it never changed", so the document is never refreshed.
Re-embedding one extra document costs a little; a wrong answer costs the customer's trust.

> Say it like this: "When a timestamp or permission is missing, I choose the safe side on purpose instead of letting a default value decide."

## Validate before you write

Check every record against the rules before it enters the index. Collect all the problems, not just
the first, and reject the record if any rule fails.

Why it matters: a vector record carries the tenant (which customer owns it), the roles (who can see
it), the source, and the model name. A record with no tenant could show up in another customer's
search. A vector of the wrong length, usually from a different embedding model, breaks search or
silently returns nonsense. Fixing a bad record after it is in the index is much harder than stopping
it at the door.

> Say it like this: "Metadata in RAG is not decoration; it controls who can see a chunk, so I reject records that are missing it before they reach the index."

## Batching

Batching means splitting a big job into smaller groups that the API accepts in one call. The order
is kept so results can be matched back to the right documents.

Why it matters: embedding APIs limit how many items, and how many tokens, one request may carry. A
customer uploading 20,000 files needs the job split. Fixed-size batches are the simplest start. Real
pipelines also limit by tokens, because ten tiny items and ten huge items are very different loads.

> Say it like this: "Fixed-size batches are my baseline; in production I batch by tokens too and save progress so I can retry only the batch that failed."

## Checkpoints and retries

A checkpoint is a saved note of how far a job got. A retry runs a failed step again. Together they
let a long job recover without starting over.

Why it matters: if batch 140 of 400 fails because the API had a hiccup, you want to retry batch 140,
not re-embed the first 139 again (which costs money and time). Retrying must be safe to repeat, so
writing the same record twice must not create two copies.

> Say it like this: "I save a checkpoint after each batch and make writes safe to repeat, so a failure costs one batch, not the whole job."

## How the problems use these ideas

- **Problem 23, Detect Stale Embeddings:** freshness, plus failing safe when a timestamp is missing
  (re-embed rather than assume it is fine).
- **Problem 24, Validate an Embedding Record:** validate before you write, collect every error, and
  treat missing roles as a hard failure.
- **Problem 26, Batch Documents for Embedding:** batching with order kept, a clear error for a bad
  batch size, and the checkpoint and retry story for production.

## Using an AI assistant on these problems

- Spell out the missing-value rule in the prompt ("missing timestamp means stale"). If you leave it
  out, the AI will pick a default like 0 and hide the decision from you.
- Ask for "equal timestamps are fresh" explicitly, then check the AI used `>` and not `>=`.
- For validation, ask the AI to "collect all errors, do not stop at the first". AI code often returns
  early, which makes ingestion logs much less useful.
- For batching, test the empty list and the last short batch yourself. AI code sometimes drops the
  final partial batch or returns `[[]]` for empty input.
- Push back if the AI writes a generator or a class when a list comprehension does the job.

## Words to know

| Term | Plain meaning |
| --- | --- |
| Stale | Built from an older version of the source than the one that exists now. |
| Re-embed | Make a new embedding for a document after it changed. |
| Tenant | One customer in a system shared by many customers. |
| Roles | The groups of people allowed to see a document. |
| Ingestion | The job that loads documents into the index. |
| Batch | A group of items sent to an API in one call. |
| Checkpoint | A saved marker of how far a long job got. |
| Content hash | A short fingerprint of the text, used to tell if it really changed. |
