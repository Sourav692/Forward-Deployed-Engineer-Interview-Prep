# Practise RAG Fundamentals Interview Questions

*A short definition of RAG answers the warm-up, but the follow-ups test whether a candidate can name the failing box, the constraint, and the measurement.*

◷ 6 min

RAG fundamentals questions are rarely about the definition. They probe whether a candidate can locate a failure, respect a customer's constraints, and prove a change helped, using lessons 1 to 5 of this module.

**Objectives:**

- answer the common RAG fundamentals questions with a decision, not a definition;
- handle customer-constraint questions as a forward-deployed engineer would;
- describe two take-home builds that demonstrate the skills.

---

## Lead With the Two Boxes, Then the Constraint

Every answer here follows one shape. Name the box, retrieval or generation, then the constraint that matters, then how it would be measured. Interviewers ask "explain RAG" to hear the follow-up the candidate volunteers, as [What RAG Is and When to Use It](/learn/llm-and-retrieval/rag-from-first-principles/what-rag-is-and-when-to-use-it) showed.

## Answer the Foundation Questions

**Explain RAG.** Retrieve, then generate: find the relevant passages, then have the model answer from them with citations. Add at once that the enterprise problem is different answers for different people, so access control shapes the retrieval path.

**Prompting, RAG or fine-tuning: which fits a knowledge gap?** RAG for fresh or frequently changing facts. Fine-tuning for output format or behaviour. Prompting alone when the model already knows the domain and only needs steering.

**Why do ingestion and query run at different times?** Ingestion is offline, batched and re-runnable; the query flow has a user waiting and a latency budget. Expensive work moves offline.

**Where do authorise and enforce sit?** Authorise is first, before any search. Enforce is just before generation, re-checking every retrieved chunk against the full policy.

## Answer the Debugging Questions

**A RAG system returns a confident, wrong answer. How should it be debugged?** Print the retrieved chunks first. Irrelevant chunks mean a retrieval problem: chunking, the embedding model or the index. Relevant chunks with a wrong answer mean the prompt, or the model ignoring context. Check whether the answer used the context at all or came from the model's own memory. Telling these apart within a minute is the strong answer.

**The top retrieved chunk is on the right topic but does not answer the question. What is wrong?** Likely chunk granularity: the chunk is about the topic but lacks the specific fact. Check chunk size, and consider metadata filtering or reranking to surface the exact passage.

**The demo works on the test documents and fails on the customer's. Why?** Take a sample of the customer's failing queries and documents through the pipeline stage by stage. Inspect loader output, chunk boundaries and retrieved documents, and compare their structure with the test corpus. Structural mismatch is the most common cause.

## Answer the Customer-Constraint Questions

**The customer cannot send data to a third-party model API.** Self-host both the embedding model and the language model, or deploy them in their cloud. Run the vector store inside their network. Loaders, chunking and vector store logic do not change; only the model endpoints do. State the trade-off up front: a lower ceiling on model quality and more infrastructure to own. Offer a scoped two-week plan, not a promise of parity with a hosted frontier model.

**Their compliance team asks where document text is sent.** Name every hop. The loader runs locally. The embedding call is external unless self-hosted. Say where the vector store is hosted and in which region. The model call is external unless self-hosted. Flag the hops that need a signed data processing agreement.

**The customer asks for 99% retrieval accuracy.** Reframe around a metric they accept, such as recall@k on their own labelled examples. Be honest that no retrieval system hits 99% on open-ended natural language, and set that expectation before building.

**They want a citation in every answer.** Carry chunk metadata, source file and page, through the pipeline. Have the prompt cite by chunk ID, and verify in code that each cited ID exists.

**They have no labelled data and no time to label.** Mine their support tickets or FAQ for real questions with known answers. Or ask three or four power users for ten questions each. A small real set beats a synthetic one for this customer.

> **Warning: do not promise what the evaluation has not shown.** Each constraint question has a trap answer that promises parity, accuracy or speed without a measurement. Name the trade-off and the metric first, then the plan.

## Worked Example: "Build Search Over Our Internal Docs"

The interviewer says, "Design and optimise a RAG system to search our internal docs." Walk the pipeline in order and name one decision per stage.

Pick loaders per document type, and normalise to one document shape. Choose a chunk size, backed by an evaluation rather than a default. Choose the embedding model on real queries. Add hybrid search if the corpus has codes or IDs, and reranking if the latency budget allows. Require citations so answers can be checked. Then volunteer two things a weak answer omits. First, where to measure: a labelled set scored on recall@k and faithfulness. Second, how the system degrades under load or when the answer is not in the corpus.

The example is the shape of every answer above. One decision per box, plus the measurement that proves it.

## Practise by Building

Two take-home tasks from the interview tutorial make strong practice. First, build a naive RAG pipeline over a small document set with 15 labelled queries and report recall@5 and mean reciprocal rank. Add one improvement, such as chunk size, hybrid search or reranking, report the change with numbers, and state when not to ship it. Second, given five mixed-format documents and no labelled queries, build a working retrieval slice in a time-boxed session. Write a one-page evaluation plan using only what a customer would realistically provide, and list what was deliberately faked or scoped out.

---

## Key Takeaways

- Answer every RAG question by naming the box, the constraint and the measurement.
- Foundation questions test the two boxes, the RAG-or-fine-tuning choice, and where authorise and enforce sit.
- Debugging questions test whether you read the retrieved chunks before blaming the model.
- Customer-constraint questions test honest trade-offs: self-hosting, data hops, accuracy targets and citations.
- A design answer names one decision per stage, then where it would be measured.

## Check Yourself

1. **Your RAG system is confidently wrong. What is the first thing to look at?**
   The retrieved chunks. Irrelevant chunks point to retrieval; relevant chunks with a wrong answer point to the prompt or the model.

2. **A customer cannot send data to an external model API. What changes in the architecture?**
   Only the model endpoints: both the embedding model and the language model run self-hosted or in their cloud. Loaders, chunking and vector store logic stay the same, with a lower model-quality ceiling.

3. **How do you respond to a demand for 99% retrieval accuracy?**
   Reframe it as recall@k on the customer's own labelled examples, and say before building that open-ended queries will not reach 99%.

