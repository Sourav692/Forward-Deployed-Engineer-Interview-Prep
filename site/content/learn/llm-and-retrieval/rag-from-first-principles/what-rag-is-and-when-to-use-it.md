# What RAG Is and When to Use It

*Retrieval closes the gap between what a model learned and what a company knows, but in an enterprise the right answer depends on who is asking.*

RAG is not a clever model trick. It is two boxes, find then answer, and the enterprise version is hard because different people may read different documents.

**Objectives:**

- draw retrieval-augmented generation as two boxes and say what each one does;
- choose between prompting, RAG and fine-tuning for a knowledge gap;
- explain why access control shapes the retrieval path in an enterprise.

---

## Close the Gap Between Training Data and Company Knowledge

A language model knows what was in its training data. It does not know a company's incident post-mortems, its customer contracts, or the ticket someone filed this morning. Almost every enterprise AI system exists because of that gap.

Retrieval-augmented generation, or RAG, closes it. Before answering, the system finds the relevant documents, pastes them into the prompt, and tells the model to answer using only those. The model answers from facts it was handed, not from guesswork.

```
  User question
       |
       v
  [ find relevant documents ]      <- retrieval
       |
       v
  [ question + documents -> LLM ]  <- augmented generation
       |
       v
   Answer + citations
```

That is the whole idea. Everything else in RAG is about making those two boxes work when the corpus is big, messy, and not readable by everyone. When a design discussion gets complicated, return to one question: which box is failing, and what is going wrong inside it?

## Pick RAG for Facts, Fine-Tuning for Behaviour

RAG is one of three ways to close a knowledge gap, and each fits a different gap. Use RAG when the gap is fresh or frequently changing factual knowledge. Use fine-tuning when the gap is about the output's format or behaviour, not facts. Use prompting alone when the model already knows the domain and only needs steering.

| What is missing? | First tool to reach for |
|---|---|
| Facts that are new, private, or change often | RAG |
| A format, style or behaviour the model will not produce | Fine-tuning |
| Nothing: the model knows the domain but needs direction | Prompting |

RAG is also not free accuracy. Grounding the model in retrieved evidence reduces hallucinations but does not remove them. Reliability still depends on retrieval quality, prompt design and output validation.

## Design for Different Answers to the Same Question

A demo RAG app has one user and one folder of documents. An enterprise is different on every axis.

| Demo RAG | Enterprise RAG |
|---|---|
| Everyone sees everything | Every user sees a different slice |
| One data source | Confluence, Zendesk, Salesforce, a wiki and contracts |
| A wrong answer is mildly annoying | A wrong answer is a contractual admission or a leaked salary |
| "It works on my question" | It must work measurably on 10,000 questions |
| No audit | "Prove this user never saw that document" |

The hardest row is the first. A Tier-1 support agent asks: "Why did Vertex Financial lose data in March, and do they get service credits?" The honest answer lives in three documents. The agent may read the ticket. The incident post-mortem is confidential to engineering. The customer contract is confidential to sales and legal.

So the correct answer differs for four people.

```
   Same question, four roles:

   Tier 1 agent    ->  "Platform-side backlog. Credits go to the account manager."
   Tier 3 engineer ->  "Cardinality explosion in ws_lmb_eu_077 saturated compaction."
   Account manager ->  "Below 99.5% means a 25% credit under their MSA."
   Contractor      ->  "I can't answer that."
```

> **Warning: these are not one answer with parts blacked out.** They are different answers built from different evidence. Access control is not a feature to bolt on after the RAG works. It decides which documents the first box may find, so it shapes the whole retrieval path. The production design is covered in [Enterprise RAG in production](/learn/production-ai/enterprise-rag-in-production).

## Worked Example: Answering "Explain RAG" in an Interview

"Explain RAG" is a warm-up question, and the trap is answering it as one. A weak answer stops at "retrieve, then generate". A strong answer draws the two boxes, then says at once what changes when the corpus is enterprise-scale and permissioned. That is the question the interviewer is about to ask next.

The FDE Handbook gives the line that carries it: "RAG is retrieve-then-generate. The enterprise problem is that the correct answer is different for different people, so access control has to shape the retrieval path — it can't be bolted on after." Add the Vertex Financial case as evidence, and the answer moves from definition to design.

The example shows the lesson's shape. The idea is simple, and the engineering lives in who may retrieve what.

---

## Key Takeaways

- RAG finds relevant documents first, then asks the model to answer from them, ideally with citations.
- Use RAG for fresh or private facts, fine-tuning for format or behaviour, and prompting when the model only needs steering.
- Grounding reduces hallucinations but does not remove them.
- In an enterprise, the correct answer depends on who asks, so access control shapes retrieval from the start.

## Check Yourself

1. **What are the two boxes of RAG?**
   Retrieval finds the passages relevant to a question from a corpus too large for the prompt. Augmented generation asks the model to answer using those passages, ideally with citations.

2. **A model keeps answering in the wrong format, though it knows the facts. RAG or fine-tuning?**
   Fine-tuning. The gap is behaviour or format, not facts. RAG fits fresh or frequently changing factual knowledge.

3. **In the Vertex Financial case, why is "the same answer with bits blacked out" the wrong mental model?**
   Each role is entitled to different evidence, so each gets a genuinely different answer. Retrieval must be shaped by permissions before anything is found.

