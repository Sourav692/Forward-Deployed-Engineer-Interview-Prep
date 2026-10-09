# Prepare Documents for RAG: the ideas behind problems 11, 19, 20

A RAG system (retrieval-augmented generation: the model answers using passages fetched from your documents) is only as good as the text you put into its index. These three problems sit in the ingestion step, between a raw document and the search index. Mistakes made here do not show up as errors. They show up weeks later as wrong or incomplete answers.

## Chunking and overlap

**What it is.** Chunking means cutting a long document into small pieces that can be searched and fed to a model. Overlap means each piece repeats a few words from the end of the one before it.

**Why it matters.** The retriever returns whole chunks, so a chunk is the unit of meaning the model sees. If a policy says "Refunds are allowed within 30 days" and the cut falls after "allowed", neither chunk holds the full rule. Overlap keeps that sentence whole in at least one chunk. Too much overlap, though, means more chunks to store and embed, which costs money and can return near-copies in search results.

> Say it like this: "I chunk with a small overlap so a rule split across a boundary still lives whole in one chunk, and I tune the size against real questions."

## Tokens versus words

**What it is.** Models measure text in tokens, which are word pieces. One word can be one token or several.

**Why it matters.** A model's context limit and its price are both counted in tokens. Chunking by words is fine for an interview, but in production a chunk of "300 words" might be 400 tokens in English and far more in code or another language. Counting with the model's own tokenizer avoids chunks that are too big to fit.

> Say it like this: "Words are fine for the whiteboard, but production chunking should count tokens with the model's tokenizer."

## Partial success instead of all or nothing

**What it is.** When a job has many parts, some can succeed while others fail. Partial success means keeping the good parts and clearly recording the failed ones.

**Why it matters.** A 200-page contract with two unreadable pages should not be thrown away, and it should not be indexed as if it were complete either. If the assistant later says "the contract does not mention penalties", that may only be true because page 47 failed OCR. Recording failed pages lets you retry them and lets the product say "198 of 200 pages indexed".

> Say it like this: "I keep the good pages, list the failed ones, and never let the product claim full coverage when pages are missing."

## Check the step before you

**What it is.** A validation step re-checks the output of an earlier step with a separate, simple test. This is sometimes called defence in depth: more than one layer of protection.

**Why it matters.** Redaction tools miss things, especially odd formats. Once an email address is inside an embedding or sent to a model provider, you cannot pull it back. A cheap regex check after redaction catches the obvious leaks before that point, and counting how often it fires tells you how good the redaction step really is.

> Say it like this: "Redaction and redaction checking are two separate steps, so a failure in the first is caught and measured by the second."

## Fail loudly on bad settings

**What it is.** When a caller passes values that make no sense, the function raises a clear error instead of guessing.

**Why it matters.** With overlap equal to chunk size, a sliding window never moves forward, which can loop forever or crash with a confusing message deep inside a pipeline. Raising `ValueError` with a plain message at the start turns a 3am mystery into a one-line fix.

> Say it like this: "If the settings can't work, I reject them up front with a clear message rather than produce something strange."

## How the problems use these ideas

- **Problem 11, Chunk Documents with Overlap.** Uses chunking and overlap directly, rejects bad settings up front, and opens the tokens versus words conversation for production.
- **Problem 19, Partial Document Ingestion.** Is all about partial success: good pages go forward, failed pages are listed for retry, and results with no page number are skipped because they cannot be retried.
- **Problem 20, PII Redaction Validation.** Is a "check the step before you" guard that runs after redaction and before embedding.

## Using an AI assistant on these problems

- Give the exact signature and the edge rules in the prompt, for example "stop after the chunk that holds the last word". Without that rule, assistants often add a tiny repeated tail chunk.
- After the AI answers, run the example from the problem by hand in your head before you run the checks. A one-line trace often catches an off-by-one.
- For regex work, ask the AI to explain each part of the pattern in plain words, then test it on both a real email and a placeholder like `[EMAIL]`.
- Watch for code that uses `result["text"]` instead of `.get()`. Ingestion data is messy, and one missing key should not crash the run.
- Ask the AI for two extra test cases it thinks would break your function. Keep the good ones.

## Words to know

| Term | Plain meaning |
| --- | --- |
| RAG | The model answers using passages fetched from your own documents. |
| Chunk | A small piece of a document that is searched and shown to the model. |
| Overlap | Words repeated at the start of a chunk from the end of the previous one. |
| Token | A word piece. Models count limits and cost in tokens. |
| OCR | Turning a scanned image of text into real text. |
| Embedding | A list of numbers that represents the meaning of a piece of text, used for search. |
| PII | Personal data that can identify someone, like an email or phone number. |
| Redaction | Replacing sensitive text with a placeholder such as `[EMAIL]`. |
