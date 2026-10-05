# Decomposing a Solution Into Workstreams

*One box labelled "the AI" is quick to draw, but a system that cannot be split into parts cannot be estimated, owned, tested or debugged.*

◷ 5 min

Decomposition is not listing technologies; it is cutting the workflow into steps that each have one job, one owner and one way to fail. It starts only after [The Discovery Conversation](01_The_Discovery_Conversation.md) has fixed the user and the outcome.

**Objectives:**

- break an AI workflow into components that follow the business process;
- separate read actions from write actions and place human gates between them;
- split a quality or latency complaint into layers that can be measured one at a time.

---

## Follow the Workflow, Not the Model

Decompose along the path a request takes through the business. The question bank's customer-support agent shows the shape: intent classification, customer authentication, knowledge retrieval, account lookup, a resolution recommendation, tool execution, human escalation, and a conversation summary written back to the CRM.

The model appears in only some of those steps. Most of them are integration, identity and record-keeping work. A part that is not on the diagram never gets an owner or an estimate. So the decomposition is also the first draft of the work plan.

Document processing follows the same rule. A bank extracting data from millions of documents needs ingestion, file validation, document classification, OCR or multimodal extraction, schema-constrained output, confidence scoring, validation against business rules, human review, correction feedback, audit storage, and reprocessing with model versioning. Around those sit the operational questions: batch or online, idempotency, retries, data lineage and document-format drift.

## Separate Reading From Acting

Every component either reads something or changes something. Keep the two apart. A wrong read produces a bad draft. A wrong write issues a refund, restarts a service or updates a customer record.

The bank's principle for workflow agents states it plainly: assume the model will sometimes make the wrong decision, and design so the blast radius is limited. That turns into concrete parts. Tool schemas, read-versus-write separation, idempotency, approval gates, permissions, timeouts and retries, a guard against non-termination, observability, and replay and recovery.

> **Warning: a write-capable tool with no approval gate makes every model error a business error.** Start read-only or assistive. Add write actions one at a time, behind a gate, once evaluation shows the read path is reliable.

## Split a Complaint Into Layers

Decomposition is also how to debug. A complaint such as "answers are unreliable" or "responses are slow" covers several distinct failures. Each layer needs its own measurement.

For a RAG assistant with poor answers, the bank separates seven failure layers: retrieval, context assembly, reasoning or synthesis, prompt or instruction, output format, evaluation, and user experience. Measure them separately: recall@k and precision@k for whether the right passages came back, MRR or nDCG for whether they ranked high, then citation correctness, context sufficiency, answer faithfulness, answer relevance, abstention quality and end-to-end task success.

For a latency complaint, first ask which latency: time to first token, time between tokens, total completion time, or what the user perceives. Then split the path into client and network, authentication, middleware, retrieval, prompt construction, model prefill, token generation, tool calls, post-processing and streaming. Check token counts, retrieval p95 and p99, retry rates, rate-limit throttling, traffic patterns, model version, prompt changes, cache hit rates and regional routing.

## Name the Kind of Problem Before the Fix

"Would you fine-tune the model?" is a common follow-up. The bank's answer is to classify the problem first, because each class has a different fix.

| What is going wrong | Kind of problem | Where the fix usually lives |
|---|---|---|
| The model does not know the fact | Knowledge | Retrieval or better data access |
| The model knows but behaves wrongly | Behaviour | Prompting, fine-tuning or structured output |
| The answer was right last month | Freshness | Indexing and the data pipeline |
| The user saw something they should not | Permission | Access-control-aware retrieval |

Fine-tuning addresses only the second row. Proposing it for the other three spends weeks on the wrong layer.

## Worked Example: An Agent Across Salesforce, SAP, Jira and Email

A customer wants an agent that reads incoming requests and acts across Salesforce, SAP, Jira and email. Decompose it before choosing a framework.

Reading the request is intent classification. Each target system becomes a tool with a schema, and each tool is tagged read or write. The agent's progress is persisted state, so a crash can be replayed rather than restarted. Write tools sit behind approval gates and per-user permissions, with idempotency so a retry never acts twice. Timeouts, retries and a step limit stop the agent from looping. Every tool call is logged so a failure can be traced and replayed. Retrieved email content is treated as untrusted input, because prompt injection can arrive through it.

Then answer the bank's follow-up, "Should the agent issue a refund automatically?", from the decomposition rather than from instinct. A refund is a write with money attached. It belongs behind a human approval gate until evaluation proves the read path and the policy check are reliable. The decomposition made that answer obvious.

---

## Key Takeaways

- Decompose along the business workflow; most parts are integration, identity and record-keeping, not the model.
- Keep read actions and write actions apart, and put write actions behind gates so model errors stay contained.
- Split any quality or latency complaint into layers and measure each layer on its own.
- Classify a problem as knowledge, behaviour, freshness or permission before proposing a fix.

## Check Yourself

1. **Why does a missing component on the decomposition diagram cause a delivery problem, not just a design problem?**
   A part that is not drawn gets no owner and no estimate. The decomposition is the first draft of the work plan.

2. **A customer says their RAG assistant gives unreliable answers. What is the first thing to separate?**
   Whether the failure is in retrieval, context assembly, synthesis, the prompt, the output format, the evaluation or the user experience. Measure retrieval with recall@k and precision@k before touching the model.

3. **When is fine-tuning the right fix?**
   When the problem is behaviour: the model has the knowledge but responds in the wrong way or format. Knowledge, freshness and permission problems are fixed in retrieval, the data pipeline or access control.

## References

**Sources:** `03_Practice_Worksheets_and_Keys/Problem_Decomposition_Bank/FDE_Problem_Decomposition_Question_Bank.md`: cases 2 "Customer-Support Agent", 5 "Enterprise Document-Processing Platform", 6 "AI Agent for Enterprise Workflow Automation", 9 "Latency Regression in an LLM Application" and 10 "RAG System with Poor Answer Quality".
