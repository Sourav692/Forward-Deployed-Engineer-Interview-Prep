---
title: "Practise AI engineering in the field"
subtitle: "Twenty-four practice questions on tool calling, conversation state, retrieval, grounded answers, MCP, evaluation, prompt injection and execution limits, each answered as a field design."
track: Building Inside the Customer's Estate
module_group: AI delivery
module_code: T21.5
module_name: Shipping RAG and agents into a customer's estate
lesson: 9
lessons: ["Inputs as they really arrive", "Extraction you can trust", "Permissions, deletions and citations", "Agents that touch business systems", "Evaluating on the customer's work", "Untrusted content in customer data", "Voice and multimodal in operations", "Practise AI delivery", "Practise AI engineering in the field"]
level: intermediate
reading_time: "30 min"
source: "Forward Deployed Engineering track"
author: Sourav Banerjee
last_updated: "20 November 2026"
tags: [practice, interview, AI system design, tool calling, memory, retrieval, citations, MCP, evaluation, prompt injection, guardrails]
---

## How to use this practice

Each question puts you in a customer's estate. Some describe a fault in a running system and ask you to diagnose it; others ask you to build a part of one. Say aloud what you would build, check and tell the customer, then compare with the outline. The deep dives linked under each heading teach the engineering.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Keeping tool checks in code, and chat state inside a budget and across sessions.
> - Choosing chunking, search mode and citation rules, and declining when no passage supports a claim.
> - Exposing a system through MCP with the user's permissions, an audit log and a stable error contract.
> - Building evaluation sets, metrics, judges and fair release comparisons.
> - Containing instructions hidden in inputs, and capping an agent's time, tokens, cost and calls.

## Tool calling and conversation state

Taught in [defining tools and binding them to a model](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p06_agent_foundations/m22_agent_loop_and_tools/03_defining_tools_and_binding_them_to_a_model.md), [tool schema design](../../../../01_Concept_Tutorials/Consolidated_Lessons/T3.2_Tool_Design_MCP_and_A2A/02_Tool_Schema_Design.md), [trimming, windowing and summary memory](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p09_memory_layer/m33_short_term_memory_conversation_state/03_trimming_windowing_and_summary_memory.md), [the four context operations](../../../../01_Concept_Tutorials/Consolidated_Lessons/T3.3_Context_Engineering_and_Orchestration/04_The_Four_Context_Operations.md) and [build a streaming chat endpoint](../../../../01_Concept_Tutorials/Consolidated_Lessons/T1.2_APIs_and_Backend/05_Build_a_Streaming_Chat_Endpoint.md).

<details>
<summary>Practice question 1. Wenlock Housing wants its tenant assistant to book repair visits through a tool. Which checks live in the prompt and which in code?</summary>

- **Answer:** The model chooses the tool and fills fault category, description and slot. Code checks the rest before the call: the tenant is signed in, the property comes from their session, the category is listed, the slot is free, and no open job covers the fault. The prompt describes the tool and grants nothing. A failed check returns an error the model can act on, such as "slot taken, here are three free ones".
- **Trade-off:** Checks in code take engineering for every tool. Checks in the prompt are cheap, and the model will skip one eventually.
- **Follow-up to expect:** "The model invents a property ID." The property never comes from the model, so there is nothing for it to invent.

</details>

<details>
<summary>Practice question 2. Wenlock's tenants hold long chats about repairs. Design how the chat endpoint keeps state, stays inside the context limit, streams, and survives provider errors.</summary>

- **Answer:** Store each conversation on the server: messages, tool results and pinned facts (tenant, property, open job). Assemble every request the same way: system prompt, pinned facts, a summary of older turns and the latest turns, counted against a token budget. Stream tokens with server-sent events. If the provider fails before the first token, retry once. If it fails mid-stream, send an error event and let the client offer a retry. A booking already made stays recorded.
- **Trade-off:** Server-side state needs storage and deletion rules. Browser-held history can be tampered with.
- **Follow-up to expect:** "The provider rate-limits you at peak." Back off with jitter, and fail over only to a model that passed the same evaluation.

</details>

## Long conversations and sessions

Taught in [trimming, windowing and summary memory](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p09_memory_layer/m33_short_term_memory_conversation_state/03_trimming_windowing_and_summary_memory.md), [threads, checkpoints and memory optimisations](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p09_memory_layer/m33_short_term_memory_conversation_state/06_langgraph_threads_checkpoints_and_memory_optimisations.md) and [session, semantic, episodic and procedural memory](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p09_memory_layer/m34_long_term_agentic_memory/02_session_semantic_episodic_and_procedural_memory_on_sqlite.md).

<details>
<summary>Practice question 3. Early in a long chat, a Saltram Energy customer says they are on a prepayment meter and cannot use direct debit. Thirty turns later the assistant offers direct debit. Diagnose and fix it.</summary>

- **Answer:** Older turns were summarised to save context, and the summary dropped the constraint. A free-text summary keeps what the model judges important, not what the business must honour. Extract constraints and key facts into a structured state record as they appear: payment method, vulnerability flags, accessibility needs. Send that record with every request, outside the summary. Add a code check that blocks offers the record rules out, and add this conversation to the regression set.
- **Trade-off:** A state record needs a schema someone keeps current. A larger context window delays the loss without preventing it.
- **Follow-up to expect:** "The customer changes their mind later." Update the field, keep the turn it came from, and let the newest value win.

</details>

<details>
<summary>Practice question 4. Design the state Saltram's support assistant keeps within a chat, across sessions and across channels.</summary>

- **Answer:** Three layers. Within a session: the messages, trimmed to a token budget. Per case: a structured record keyed by case ID, holding account, verified identity, issue, steps tried, promised callbacks and constraints. Per customer: preferences and flags the customer agreed to store, with a retention period. Checkpoint the case record after each step, so a dropped chat resumes where it stopped. Identity verification expires after a set time and must be repeated.
- **Trade-off:** Long-term memory gives continuity and holds personal data. Keep only what the customer would expect, with a way to delete it.
- **Follow-up to expect:** "The customer moves from chat to phone." The phone agent loads the case record by account, not the chat transcript.

</details>

## Retrieval

Taught in [choosing chunk size empirically](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p04_rag_foundations/m12_chunking/04_choosing_chunk_size_empirically_retrieval_quality_faithfulness_latency.md), [embedding fundamentals](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p04_rag_foundations/m13_embeddings/01_embedding_fundamentals_similarity_metrics_and_model_selection.md), [incremental indexing](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p04_rag_foundations/m14_vector_stores/05_incremental_indexing_indexing_api_and_record_manager.md), [dense, sparse and hybrid retrieval](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p05_retrieval_quality_and_rag_apps/m16_retrievers_hybrid_search/02_dense_sparse_hybrid_retrieval_with_bm25_and_ensembleretriever.md), [two-stage retrieval](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p05_retrieval_quality_and_rag_apps/m18_reranking_post_retrieval/01_two_stage_retrieval_retrieve_wide_rerank_narrow.md), [answers with sources and per-claim citations](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p05_retrieval_quality_and_rag_apps/m19_end_to_end_rag_systems/02_answers_with_sources_and_per_claim_citations.md), [output guardrails and refusals](../../../../01_Concept_Tutorials/Consolidated_Lessons/T4.1_Enterprise_RAG_in_Production/06_Output_Guardrails_and_Refusals.md) and [permissions, deletions and citations](03_Permissions_Deletions_and_Citations.md).

<details>
<summary>Practice question 5. Hexham Water has 3,000 operating procedures full of numbered steps and tables. Design the chunking, embeddings and index.</summary>

- **Answer:** Split on headings, keep each numbered procedure whole where it fits, and keep each table as one chunk with its header row. Prefix chunks with document title and section path. Test three chunk sizes, such as 300, 600 and 1,000 tokens, on labelled questions and keep the best. Choose the embedding model by the same test and record its version. Store document ID, version and access list as metadata, and re-embed only documents whose hash changed.
- **Trade-off:** Larger chunks keep procedures whole but blur the match. Smaller ones split steps.
- **Follow-up to expect:** "You want to change the embedding model." Build a second index, compare on the same set, and switch by alias.

</details>

<details>
<summary>Practice question 6. Hexham's engineers search by asset codes such as PS-0417 and by plain descriptions of faults. Which retrieval do you build?</summary>

- **Answer:** Asset codes need keyword search, because embeddings blur exact tokens. Plain descriptions need vector search. Run both, merge with reciprocal rank fusion, rerank the top 50 with a cross-encoder and pass the top 5 to the model. Keep hybrid only if it beats the better single mode on a labelled set split into codes, descriptions and mixed questions.
- **Trade-off:** Reranking adds latency to every query. Weigh it against the recall gain.
- **Follow-up to expect:** "The latency budget is one second." Rerank fewer candidates, or skip reranking when a query matches an asset code exactly.

</details>

<details>
<summary>Practice question 7. Hexham's assistant must cite its sources, decline when unsure, and hide procedures restricted to treatment works staff. Design it.</summary>

- **Answer:** Filter by the user's access list inside the search, before ranking. The model answers only from retrieved passages, with a passage ID on every claim, and code checks each ID was retrieved for this user. If no passage clears a threshold set on the evaluation set, or a citation fails, decline and name the procedure owner.
- **Trade-off:** A strict threshold declines some answerable questions. A loose one invents procedures at a water treatment site.
- **Follow-up to expect:** "A restricted procedure holds the best answer." The user never sees it or learns it exists. The assistant says it found nothing it can share.

</details>

## Grounded answers

Taught in [answers with sources and per-claim citations](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p05_retrieval_quality_and_rag_apps/m19_end_to_end_rag_systems/02_answers_with_sources_and_per_claim_citations.md), [reliable RAG with relevance and hallucination checks](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p08_agentic_rag/m32_reliability_feedback/01_reliable_rag_relevance_checks_hallucination_checks_source_highlighting.md) and [permissions, deletions and citations](03_Permissions_Deletions_and_Citations.md).

<details>
<summary>Practice question 8. Kelmscott Legal's contract assistant retrieves the right clauses, yet its answers contain claims those clauses do not make. Diagnose it.</summary>

- **Answer:** Retrieval works, so look at generation. Read the traces. Are the passages in the prompt in full? Does the prompt allow general knowledge? Is the model joining clauses and adding its own inferences? Then fix it: answer only from passages, require a passage ID for every claim, and run a grounding check that compares each sentence with its cited passage. Drop or flag unsupported sentences. Measure the unsupported-claim rate on a labelled set before and after.
- **Trade-off:** A grounding check adds a model call per answer. Without one, the lawyers find the errors.
- **Follow-up to expect:** "The extra claim happens to be true." It is still unsupported. True claims without sources teach users to trust the false ones.

</details>

<details>
<summary>Practice question 9. Design Kelmscott's answers so that every claim is tied to a passage and the assistant declines when nothing supports one.</summary>

- **Answer:** The output is a list of claims, each with its text, one or more passage IDs and a quoted span. Code checks that each quote appears word for word in its passage and that the passage was retrieved for this user. Claims that fail are removed. If no claim survives, or the best retrieval score is under the threshold, the assistant says it cannot find this in the contracts the user can access and lists the closest documents. The interface shows each claim beside its clause.
- **Trade-off:** Exact quotes make answers stiffer to read. They let a lawyer check a claim in seconds.
- **Follow-up to expect:** "Two clauses conflict." Show both, cited, and say they conflict. Do not pick one.

</details>

## MCP and tool contracts

Taught in [MCP foundations](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p11_agent_protocols/m38_mcp_foundations/00_overview.md), [building an MCP server](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p11_agent_protocols/m38_mcp_foundations/02_building_an_mcp_server.md), [prompts and resources](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p11_agent_protocols/m38_mcp_foundations/05_prompts_and_resources.md), [delegated authority and zero ambient authority](../../../../01_Concept_Tutorials/Consolidated_Lessons/T4.4_Security_Tenancy_and_Prompt_Injection/08_Delegated_Authority_and_Zero_Ambient_Authority.md), [typed tool results and teachable errors](../../../../01_Concept_Tutorials/Consolidated_Lessons/T3.2_Tool_Design_MCP_and_A2A/03_Typed_Tool_Results_and_Teachable_Errors.md) and [agents that touch business systems](04_Agents_That_Touch_Business_Systems.md).

<details>
<summary>Practice question 10. Tavistock Freight wants its shipment system available to three different AI assistants. How do you structure it with the Model Context Protocol (MCP)?</summary>

- **Answer:** Build one MCP server in front of the shipment system. Actions become tools with typed schemas, such as looking up a shipment. Read-only reference data, such as depot lists, becomes resources a client can load as context. Each assistant runs an MCP client that discovers and calls the tools. The server owns the connection, validation and logging, so no assistant holds the system's credentials.
- **Trade-off:** One server is one place to secure and test, and one team owns every change.
- **Follow-up to expect:** "Why not hand them the REST API?" The API still sits underneath. MCP saves a custom integration per assistant.

</details>

<details>
<summary>Practice question 11. A Tavistock depot clerk may see only their own depot's shipments. How does the MCP server respect that?</summary>

- **Answer:** The client sends the user's token from Tavistock's identity provider, scoped to this server. The server validates it and calls the shipment system as that user, or applies their depot filter in code on every call. No shared service account has full access. Results are filtered before they return, so the model never sees another depot. The audit log records user, tool, arguments and result.
- **Trade-off:** Per-user tokens need refresh and revocation. A service account turns the assistant into a way round access control.
- **Follow-up to expect:** "The token expires mid-task." Return a typed authentication error and ask the user to sign in again. Never fall back to a service account.

</details>

<details>
<summary>Practice question 12. Design Tavistock's "request delivery change" tool: its schema, its errors, its audit trail and how you change it later.</summary>

- **Answer:** Schema: shipment ID, new date, an address ID from the customer's saved list, and a reason from a fixed list. Typed errors: not found, not allowed, outside the change window, conflict and upstream unavailable, each with an actionable message and a retryable flag. Audit: user, tool version, arguments, result and request ID. Changes: add only optional fields, and ship a breaking change as a new tool while the old one runs for an agreed period.
- **Trade-off:** Versioning slows change. Silent changes break assistants you do not own.
- **Follow-up to expect:** "A client sends a field you removed." Reject it with a typed error naming the field.

</details>

## Tool loops and MCP tools

Taught in [the manual tool loop](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p06_agent_foundations/m22_agent_loop_and_tools/04_the_manual_tool_loop_and_the_augmented_llm_in_langgraph.md), [tool schema design](../../../../01_Concept_Tutorials/Consolidated_Lessons/T3.2_Tool_Design_MCP_and_A2A/02_Tool_Schema_Design.md), [typed tool results and teachable errors](../../../../01_Concept_Tutorials/Consolidated_Lessons/T3.2_Tool_Design_MCP_and_A2A/03_Typed_Tool_Results_and_Teachable_Errors.md), [building an MCP server](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p11_agent_protocols/m38_mcp_foundations/02_building_an_mcp_server.md) and [agents that touch business systems](04_Agents_That_Touch_Business_Systems.md).

<details>
<summary>Practice question 13. Skipton Rail's operations agent checks train faults and raises work orders. Describe its tool loop, with the argument and permission checks.</summary>

- **Answer:** Send the messages and tool definitions to the model. If it returns a tool call, validate the arguments against the schema, then check this user may take this action on this asset. Run the tool, return a typed result and loop. Stop when the model gives a final answer or a limit is reached. A write action, such as raising a work order, needs the user's confirmation before it runs. Each step logs the call, the check result and the outcome.
- **Trade-off:** Checking every call adds latency. Unchecked tools act with whatever access the service account has.
- **Follow-up to expect:** "The model calls a tool that does not exist." Return an error listing the valid tools, and count the step towards the limit.

</details>

<details>
<summary>Practice question 14. Design an MCP server for Skipton with one tool to look up assets and one to raise tickets.</summary>

- **Answer:** The lookup tool takes an asset ID or location code and returns status, open faults and the last inspection date. It is read-only. The ticket tool takes an asset ID, a fault category from a fixed list, a severity and a description, and returns a ticket ID. It writes, so it requires an idempotency key. Depot lists and fault categories are resources. The server calls the maintenance system with the user's identity and logs every call.
- **Trade-off:** Two narrow tools are easier to secure than one general query tool. They also cover fewer requests.
- **Follow-up to expect:** "Engineers want to close tickets too." Add a separate close tool with its own permission rather than a status field on the raise tool.

</details>

<details>
<summary>Practice question 15. Design authorisation and audit for Skipton's MCP server.</summary>

- **Answer:** Authorise every call in the server. The user's token gives identity and role, and a policy maps role to tools and scope: signallers may look up any asset, depot engineers raise tickets for their own depot only, and severity 1 tickets need a supervisor. Deny by default. Log each call with time, user, role, tool, tool version, arguments, decision, result and request ID. Write the log to an append-only store Skipton's security team can query, and keep it for the agreed period.
- **Trade-off:** A fine-grained policy is more to maintain. Coarse roles let an engineer raise tickets for another depot.
- **Follow-up to expect:** "Who did the agent act for?" The log names the human user, with the agent as the client. An action is never logged as the agent's alone.

</details>

<details>
<summary>Practice question 16. Skipton's assistants break whenever the MCP server changes. Design its error contract and compatibility tests.</summary>

- **Answer:** Every error returns a code from a fixed list (invalid argument, not found, forbidden, conflict, rate limited, upstream unavailable), a message the model can act on, and a retryable flag. Contract tests run on every build: each tool's schema against a stored snapshot, each error code triggered by a known input, and recorded requests from every client version still in use replayed against the new server. A breaking change fails the build.
- **Trade-off:** Snapshots need updating for each intended change. Without them, a renamed field breaks every client without warning.
- **Follow-up to expect:** "The maintenance system returns a new error." Map it to an existing code, or add a code in a new version. Never pass raw upstream errors through.

</details>

## Evaluation

Taught in [golden sets and sample size](../../../../01_Concept_Tutorials/Consolidated_Lessons/T4.2_Evaluation_and_Release_Gates/03_Golden_Sets_and_Sample_Size.md), [component and trajectory metrics](../../../../01_Concept_Tutorials/Consolidated_Lessons/T4.2_Evaluation_and_Release_Gates/02_Component_and_Trajectory_Metrics.md), [validating LLM judges](../../../../01_Concept_Tutorials/Consolidated_Lessons/T4.2_Evaluation_and_Release_Gates/04_Validating_LLM_Judges.md) and [evaluating on the customer's work](05_Evaluating_on_the_Customers_Work.md).

<details>
<summary>Practice question 17. Build the evaluation set for Wenlock's repairs assistant.</summary>

- **Answer:** Sample 400 real conversations from the last year, stratified by fault type, channel and outcome. Over-sample rare harmful cases: gas smells, damp in a child's bedroom, vulnerable tenants. Add cases where the right action is to escalate or decline. Repairs staff label the right booking or reply. Freeze a test split and tune prompts on a separate set.
- **Trade-off:** Stratifying needs staff time. A random sample misses the rare cases that matter most.
- **Follow-up to expect:** "How many cases per slice?" Enough to see the failure rate you care about. If 5% of gas cases fail, 60 cases give a better than 95% chance of seeing at least one failure.

</details>

<details>
<summary>Practice question 18. Tavistock's agent changes deliveries for customers. What do you measure to say it works?</summary>

- **Answer:** Three layers. Output quality: each reply is accurate and grounded. Task success: the right change was made, checked against the shipment system, not the transcript. Business outcome: fewer depot calls and failed deliveries against a pre-launch baseline. Report all three. A good reply that changes nothing is a failure.
- **Trade-off:** Business outcomes lag and have other causes. Output quality is quick and proves little alone.
- **Follow-up to expect:** "Calls fell but complaints rose." Check task success on the complaint cases first. The agent may be confirming changes it never made.

</details>

<details>
<summary>Practice question 19. Tavistock's agent fails 18 of 200 test tasks. How do you find out where it fails?</summary>

- **Answer:** Trace each failure through its stages: intent, tool choice, arguments, tool result, reply. Tag the first stage that went wrong. Suppose 9 fail at argument filling, 5 at shipment system errors and 4 at the reply. Fix argument filling first, since it holds half the failures. Re-run the whole set after each fix.
- **Trade-off:** Stage tags need full traces and a person's time. One end-to-end score cannot say what to fix.
- **Follow-up to expect:** "Two stages failed in one task." Tag the first. The later failure often follows from it.

</details>

<details>
<summary>Practice question 20. Wenlock wants a model to score accuracy and empathy on 5,000 chats a week. How do you make that score trustworthy?</summary>

- **Answer:** Write a rubric with anchored scores. Two staff label the same 200 chats, and you measure their agreement. Run the judge on those 200 and compare it with staff, criterion by criterion. Use it only where it agrees with staff about as well as they agree with each other. Keep people on a weekly sample, re-check the judge after any model or rubric change, and run the judged set as a regression test each release.
- **Trade-off:** Calibration costs staff days. An uncalibrated judge gives confident, empty numbers.
- **Follow-up to expect:** "The judge and staff disagree on empathy." Keep empathy with people and use the judge for accuracy only.

</details>

## Evaluating an operations agent

Taught in [component and trajectory metrics](../../../../01_Concept_Tutorials/Consolidated_Lessons/T4.2_Evaluation_and_Release_Gates/02_Component_and_Trajectory_Metrics.md), [validating LLM judges](../../../../01_Concept_Tutorials/Consolidated_Lessons/T4.2_Evaluation_and_Release_Gates/04_Validating_LLM_Judges.md), [release gates for safety, quality and cost](../../../../01_Concept_Tutorials/Consolidated_Lessons/T4.2_Evaluation_and_Release_Gates/05_Release_Gates_Safety_Quality_and_Cost.md) and [evaluating on the customer's work](05_Evaluating_on_the_Customers_Work.md).

<details>
<summary>Practice question 21. Write the rubric Skipton's reviewers use to score the operations agent.</summary>

- **Answer:** Score each run on five criteria, each from 1 to 3 with written anchors: correct asset, right fault category and severity, safety steps stated where the procedure requires them, ticket fields complete, and an explanation an engineer can follow. Safety is pass or fail: a miss fails the run whatever the other scores. Two reviewers score the first 50 runs, compare, and rewrite anchors where they disagree. After that, one reviewer per run, with 10% scored twice.
- **Trade-off:** Anchored scales take time to write. Unanchored scores drift between reviewers.
- **Follow-up to expect:** "Reviewers disagree on severity." Add worked examples to the anchor from Skipton's own severity guide.

</details>

<details>
<summary>Practice question 22. Skipton has a new prompt for the agent. How do you decide whether it is better than the current one?</summary>

- **Answer:** Run both versions on the same 150 tasks, five times each, because the agent's output varies between runs. Score with the rubric and the task checks. Report each task's pass rate over its five runs, and the overall rate with a confidence interval. Ship only if the new version loses nothing on safety cases and is better or equal overall beyond the noise. Read every task that flipped from pass to fail.
- **Trade-off:** 1,500 runs cost money and a day of waiting. One run each mistakes noise for improvement.
- **Follow-up to expect:** "The new version wins by 2 points." Check whether the intervals overlap. If they do, it has not been shown to be better.

</details>

## Prompt injection

Taught in [prompt injection and egress control](../../../../01_Concept_Tutorials/Consolidated_Lessons/T4.4_Security_Tenancy_and_Prompt_Injection/03_Prompt_Injection_and_Egress_Control.md) and [untrusted content in customer data](06_Untrusted_Content_in_Customer_Data.md).

<details>
<summary>Practice question 23. Hexham's assistant reads procedures, contractor emails and asset notes, and can raise work orders. Where can injected instructions enter, and how do you contain them?</summary>

- **Answer:** Inputs: the user's question, retrieved procedures, contractor emails, asset notes and tool results. Treat all but the user's own question as data. Contain it in layers: mark untrusted text, give the model the fewest tools, have the user confirm each work order, check arguments in code, and block links and email to unlisted domains. Test with planted instructions in every input, asserting on tool calls.
- **Trade-off:** Confirmation adds a click. Without it, an email can raise jobs.
- **Follow-up to expect:** "Can you filter injections out?" Filters catch known patterns only. Design so a successful injection can do little harm.

</details>

## Execution limits

Taught in [the eight guard checks](../../../../01_Concept_Tutorials/Consolidated_Lessons/T3.5_Robust_Agents/05_The_Eight_Guard_Checks.md) and [budgets and spend guardrails](../../../../01_Concept_Tutorials/Consolidated_Lessons/T4.5_Cost_and_Latency/07_Budgets_and_Spend_Guardrails.md).

<details>
<summary>Practice question 24. Design an execution controller for Saltram's billing agent with limits on time, tokens, cost and tool calls.</summary>

- **Answer:** The controller wraps the agent loop and checks limits before each step: 120 seconds per task, 60,000 tokens, 40 pence of model spend, 15 tool calls, and no more than two repeats of the same call with the same arguments. Set each limit from the distribution of successful runs, with headroom. On a breach, stop, save the state and hand the case to a person with the trace. Emit a metric per breach type and alert when breaches rise.
- **Trade-off:** Tight limits stop some long valid tasks. Loose ones let a looping agent spend for minutes.
- **Follow-up to expect:** "One customer's tasks always hit the limit." Read their traces. Their account may need a different path, not a higher limit.

</details>

## References

1. The lessons linked under each heading, in this module and in the AI Engineering and Production AI deep dives.

## Key takeaways

- The model proposes tool calls. Code validates arguments and permissions and decides whether they run.
- Keep constraints in a structured state record, not in a summary.
- Choose chunking and search mode by testing on labelled questions, and tie each claim to a quoted passage.
- An MCP server acts as the user, logs every call and returns typed errors under test.
- Measure output, task and outcome, tag each failure's stage, and compare releases on repeated runs.
- Treat every input except the user's own words as data, and cap time, tokens, cost and calls.

## Check yourself

<details>
<summary>1. In practice question 17, why do 60 cases give a better than 95% chance of seeing a 5% failure?</summary>

All 60 pass with probability 0.95 to the power 60, about 0.046, leaving about 95.4% for at least one failure.

</details>

<details>
<summary>2. In practice question 19, why fix argument filling first?</summary>

It accounts for 9 of the 18 failures, half the total. The shipment system errors account for 5 and the replies for 4.

</details>

<details>
<summary>3. In practice question 3, why does a larger context window not fix the problem?</summary>

The conversation can still grow past it, and the summary will drop the constraint then. Only a record sent with every request keeps it.

</details>

<details>
<summary>4. In practice question 22, how many runs does the comparison take, and why repeat them?</summary>

150 tasks, five runs each, for two versions: 1,500 runs. The agent's output varies, so one run per task cannot separate a real gain from noise.

</details>
