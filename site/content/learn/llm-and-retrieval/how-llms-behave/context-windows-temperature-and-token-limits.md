# Context Windows, Temperature, and Token Limits

*More context gives the model more evidence to use, but every token competes for a fixed window and the middle of a long prompt is read least reliably.*

◷ 5 min

A bigger context window is not a licence to send everything. Budget the window, set randomness for the job, and cap the answer, because these three settings decide much of what the model does with the text it receives.

**Objectives:**

- budget a context window across system prompt, retrieved text, chat history and question;
- explain the "lost in the middle" effect and what it means for ordering;
- set temperature and the answer-length cap for factual answers.

---

## Budget the Context Window Like Money

Every language model has a maximum context window, measured in tokens; the GenAI Engineering guide gives 8k, 32k and 128k as examples. The system prompt, the retrieved chunks, the chat history and the question must all fit inside it, along with room for the answer. A token spent on one of them cannot be spent on another.

The arithmetic bites quickly. With 500-token chunks and a 4k window, only about 6 to 7 chunks fit, so taking 20 is not possible. Chunk size decides how many chunks fit: smaller chunks give variety, larger chunks give depth. Chat history competes for the same space, so summarise old turns rather than carry them verbatim.

| Competes for the window | How to keep it in budget |
|---|---|
| System prompt | Keep the instruction focused |
| Retrieved chunks | Rank them and include only the best |
| Chat history | Summarise older turns |
| The answer itself | Leave room under the model's limit |

## Put the Important Text at the Edges

Bigger is not always better. Language models use the start and end of the context more reliably than the middle. The guide calls this the "lost in the middle" effect.

Two practices follow. Put the important instructions at the top and the bottom of the prompt. Rank retrieved chunks so the best ones are included, and do not pad the middle with weak ones that dilute the strong. The full prompt template for grounded answers is in [RAG from first principles](/learn/llm-and-retrieval/rag-from-first-principles).

## Set Temperature for the Job

Temperature controls randomness in the model's choice of words. For question answering over documents, use 0 or 0.1, which gives factual and consistent answers. Higher values suit brainstorming, not Q&A.

Temperature is also one of the levers for faithfulness. The guide's list for improving it includes lower temperature, alongside better retrieval and prompts that demand citations.

> **Warning: a long context does not mean a read context.** A model can receive the right passage and still not use it well, because the passage sat in the middle of a long prompt. Adding more chunks to "make sure" the answer is there can push the best one into the zone the model reads least reliably.

## Cap the Answer Length Deliberately

The `max_tokens` setting caps how long the answer can be. Too low cuts answers off mid-sentence. Too high wastes money. The guide suggests about 300 to 600 tokens for factual answers. Always keep prompt tokens plus response tokens within the model's limit.

## Worked Example: Fitting a Support Answer Into 4k Tokens

A support assistant runs on a model with a 4k-token window. The retriever returns 20 candidate chunks of 500 tokens each, which is 10,000 tokens and cannot fit.

Budget it instead. Reserve about 500 tokens for the answer, in the 300-to-600 range for a factual reply. Keep the system prompt short and put its key rule, "answer only from the context", at both the top and the bottom. Summarise the earlier conversation into a few lines. That leaves room for about 6 chunks. Rank the 20 candidates and keep the best 6, ordered so the strongest are not buried in the middle. Set temperature to 0.

Each setting answered one question about the window. What fits, where the model will look, how random the wording is, and how long the reply may run.

---

## Key Takeaways

- The system prompt, chunks, history, question and answer all share one fixed window, so rank and trim.
- Models read the start and end of a long context more reliably than the middle.
- Use temperature 0 or 0.1 for factual answers over documents.
- Cap the answer with `max_tokens`, and keep prompt plus response within the model's limit.

## Check Yourself

1. **With 500-token chunks and a 4k window, why can you not simply retrieve 20 chunks?**
   Twenty chunks is 10,000 tokens. Only about 6 to 7 fit alongside the prompt, history and answer, so rank and keep the best.

2. **What is the "lost in the middle" effect, and what do you change because of it?**
   Models use the start and end of the context more reliably than the middle. Put key instructions at the top and bottom, and avoid padding with weak chunks.

3. **What temperature suits a document Q&A system, and why?**
   0 or 0.1. Low randomness gives factual, consistent answers; higher values suit brainstorming.

