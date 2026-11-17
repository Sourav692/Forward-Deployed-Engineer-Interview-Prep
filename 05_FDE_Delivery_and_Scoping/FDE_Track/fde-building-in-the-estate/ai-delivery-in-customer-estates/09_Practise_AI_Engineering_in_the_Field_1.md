---
title: "Practise AI engineering in the field, part 1"
subtitle: "Thirteen practice questions on tool calling, conversation state, retrieval, MCP, evaluation and prompt injection, each answered as a field design."
track: Building Inside the Customer's Estate
module_group: AI delivery
module_code: T21.5
module_name: Shipping RAG and agents into a customer's estate
lesson: 9
lessons: ["Inputs as they really arrive", "Extraction you can trust", "Permissions, deletions and citations", "Agents that touch business systems", "Evaluating on the customer's work", "Untrusted content in customer data", "Voice and multimodal in operations", "Practise AI delivery", "Practise AI engineering in the field, part 1", "Practise AI engineering in the field, part 2"]
level: intermediate
reading_time: "16 min"
source: "Forward Deployed Engineering track"
author: Sourav Banerjee
last_updated: "17 November 2026"
tags: [practice, interview, AI system design, tool calling, retrieval, MCP, evaluation, prompt injection]
---

## How to use this practice

Each question puts you in a customer's estate. Say aloud what you would build, check and tell the customer, then compare with the outline. The deep dives linked under each heading teach the engineering.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Keeping tool checks in code and chat state inside a budget.
> - Choosing chunking, search mode and citation rules.
> - Exposing a system through MCP with the user's permissions.
> - Building evaluation sets, metrics and judges.
> - Containing instructions hidden in inputs.

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

## Retrieval

Taught in [choosing chunk size empirically](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p04_rag_foundations/m12_chunking/04_choosing_chunk_size_empirically_retrieval_quality_faithfulness_latency.md), [embedding fundamentals](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p04_rag_foundations/m13_embeddings/01_embedding_fundamentals_similarity_metrics_and_model_selection.md), [incremental indexing](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p04_rag_foundations/m14_vector_stores/05_incremental_indexing_indexing_api_and_record_manager.md), [dense, sparse and hybrid retrieval](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p05_retrieval_quality_and_rag_apps/m16_retrievers_hybrid_search/02_dense_sparse_hybrid_retrieval_with_bm25_and_ensembleretriever.md), [two-stage retrieval](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p05_retrieval_quality_and_rag_apps/m18_reranking_post_retrieval/01_two_stage_retrieval_retrieve_wide_rerank_narrow.md), [answers with sources and per-claim citations](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p05_retrieval_quality_and_rag_apps/m19_end_to_end_rag_systems/02_answers_with_sources_and_per_claim_citations.md), [output guardrails and refusals](../../../../01_Concept_Tutorials/Consolidated_Lessons/T4.1_Enterprise_RAG_in_Production/06_Output_Guardrails_and_Refusals.md) and [permissions, deletions and citations](03_Permissions_Deletions_and_Citations.md).

<details>
<summary>Practice question 3. Hexham Water has 3,000 operating procedures full of numbered steps and tables. Design the chunking, embeddings and index.</summary>

- **Answer:** Split on headings, keep each numbered procedure whole where it fits, and keep each table as one chunk with its header row. Prefix chunks with document title and section path. Test three chunk sizes, such as 300, 600 and 1,000 tokens, on labelled questions and keep the best. Choose the embedding model by the same test and record its version. Store document ID, version and access list as metadata, and re-embed only documents whose hash changed.
- **Trade-off:** Larger chunks keep procedures whole but blur the match. Smaller ones split steps.
- **Follow-up to expect:** "You want to change the embedding model." Build a second index, compare on the same set, and switch by alias.

</details>

<details>
<summary>Practice question 4. Hexham's engineers search by asset codes such as PS-0417 and by plain descriptions of faults. Which retrieval do you build?</summary>

- **Answer:** Asset codes need keyword search, because embeddings blur exact tokens. Plain descriptions need vector search. Run both, merge with reciprocal rank fusion, rerank the top 50 with a cross-encoder and pass the top 5 to the model. Keep hybrid only if it beats the better single mode on a labelled set split into codes, descriptions and mixed questions.
- **Trade-off:** Reranking adds latency to every query. Weigh it against the recall gain.
- **Follow-up to expect:** "The latency budget is one second." Rerank fewer candidates, or skip reranking when a query matches an asset code exactly.

</details>

<details>
<summary>Practice question 5. Hexham's assistant must cite its sources, decline when unsure, and hide procedures restricted to treatment works staff. Design it.</summary>

- **Answer:** Filter by the user's access list inside the search, before ranking. The model answers only from retrieved passages, with a passage ID on every claim, and code checks each ID was retrieved for this user. If no passage clears a threshold set on the evaluation set, or a citation fails, decline and name the procedure owner.
- **Trade-off:** A strict threshold declines some answerable questions. A loose one invents procedures at a water treatment site.
- **Follow-up to expect:** "A restricted procedure holds the best answer." The user never sees it or learns it exists. The assistant says it found nothing it can share.

</details>

## MCP and tool contracts

Taught in [MCP foundations](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p11_agent_protocols/m38_mcp_foundations/00_overview.md), [building an MCP server](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p11_agent_protocols/m38_mcp_foundations/02_building_an_mcp_server.md), [prompts and resources](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p11_agent_protocols/m38_mcp_foundations/05_prompts_and_resources.md), [delegated authority and zero ambient authority](../../../../01_Concept_Tutorials/Consolidated_Lessons/T4.4_Security_Tenancy_and_Prompt_Injection/08_Delegated_Authority_and_Zero_Ambient_Authority.md), [typed tool results and teachable errors](../../../../01_Concept_Tutorials/Consolidated_Lessons/T3.2_Tool_Design_MCP_and_A2A/03_Typed_Tool_Results_and_Teachable_Errors.md) and [agents that touch business systems](04_Agents_That_Touch_Business_Systems.md).

<details>
<summary>Practice question 6. Tavistock Freight wants its shipment system available to three different AI assistants. How do you structure it with the Model Context Protocol (MCP)?</summary>

- **Answer:** Build one MCP server in front of the shipment system. Actions become tools with typed schemas, such as looking up a shipment. Read-only reference data, such as depot lists, becomes resources a client can load as context. Each assistant runs an MCP client that discovers and calls the tools. The server owns the connection, validation and logging, so no assistant holds the system's credentials.
- **Trade-off:** One server is one place to secure and test, and one team owns every change.
- **Follow-up to expect:** "Why not hand them the REST API?" The API still sits underneath. MCP saves a custom integration per assistant.

</details>

<details>
<summary>Practice question 7. A Tavistock depot clerk may see only their own depot's shipments. How does the MCP server respect that?</summary>

- **Answer:** The client sends the user's token from Tavistock's identity provider, scoped to this server. The server validates it and calls the shipment system as that user, or applies their depot filter in code on every call. No shared service account has full access. Results are filtered before they return, so the model never sees another depot. The audit log records user, tool, arguments and result.
- **Trade-off:** Per-user tokens need refresh and revocation. A service account turns the assistant into a way round access control.
- **Follow-up to expect:** "The token expires mid-task." Return a typed authentication error and ask the user to sign in again. Never fall back to a service account.

</details>

<details>
<summary>Practice question 8. Design Tavistock's "request delivery change" tool: its schema, its errors, its audit trail and how you change it later.</summary>

- **Answer:** Schema: shipment ID, new date, an address ID from the customer's saved list, and a reason from a fixed list. Typed errors: not found, not allowed, outside the change window, conflict and upstream unavailable, each with an actionable message and a retryable flag. Audit: user, tool version, arguments, result and request ID. Changes: add only optional fields, and ship a breaking change as a new tool while the old one runs for an agreed period.
- **Trade-off:** Versioning slows change. Silent changes break assistants you do not own.
- **Follow-up to expect:** "A client sends a field you removed." Reject it with a typed error naming the field.

</details>

## Evaluation

Taught in [golden sets and sample size](../../../../01_Concept_Tutorials/Consolidated_Lessons/T4.2_Evaluation_and_Release_Gates/03_Golden_Sets_and_Sample_Size.md), [component and trajectory metrics](../../../../01_Concept_Tutorials/Consolidated_Lessons/T4.2_Evaluation_and_Release_Gates/02_Component_and_Trajectory_Metrics.md), [validating LLM judges](../../../../01_Concept_Tutorials/Consolidated_Lessons/T4.2_Evaluation_and_Release_Gates/04_Validating_LLM_Judges.md) and [evaluating on the customer's work](05_Evaluating_on_the_Customers_Work.md).

<details>
<summary>Practice question 9. Build the evaluation set for Wenlock's repairs assistant.</summary>

- **Answer:** Sample 400 real conversations from the last year, stratified by fault type, channel and outcome. Over-sample rare harmful cases: gas smells, damp in a child's bedroom, vulnerable tenants. Add cases where the right action is to escalate or decline. Repairs staff label the right booking or reply. Freeze a test split and tune prompts on a separate set.
- **Trade-off:** Stratifying needs staff time. A random sample misses the rare cases that matter most.
- **Follow-up to expect:** "How many cases per slice?" Enough to see the failure rate you care about. If 5% of gas cases fail, 60 cases give a better than 95% chance of seeing at least one failure.

</details>

<details>
<summary>Practice question 10. Tavistock's agent changes deliveries for customers. What do you measure to say it works?</summary>

- **Answer:** Three layers. Output quality: each reply is accurate and grounded. Task success: the right change was made, checked against the shipment system, not the transcript. Business outcome: fewer depot calls and failed deliveries against a pre-launch baseline. Report all three. A good reply that changes nothing is a failure.
- **Trade-off:** Business outcomes lag and have other causes. Output quality is quick and proves little alone.
- **Follow-up to expect:** "Calls fell but complaints rose." Check task success on the complaint cases first. The agent may be confirming changes it never made.

</details>

<details>
<summary>Practice question 11. Tavistock's agent fails 18 of 200 test tasks. How do you find out where it fails?</summary>

- **Answer:** Trace each failure through its stages: intent, tool choice, arguments, tool result, reply. Tag the first stage that went wrong. Suppose 9 fail at argument filling, 5 at shipment system errors and 4 at the reply. Fix argument filling first, since it holds half the failures. Re-run the whole set after each fix.
- **Trade-off:** Stage tags need full traces and a person's time. One end-to-end score cannot say what to fix.
- **Follow-up to expect:** "Two stages failed in one task." Tag the first. The later failure often follows from it.

</details>

<details>
<summary>Practice question 12. Wenlock wants a model to score accuracy and empathy on 5,000 chats a week. How do you make that score trustworthy?</summary>

- **Answer:** Write a rubric with anchored scores. Two staff label the same 200 chats, and you measure their agreement. Run the judge on those 200 and compare it with staff, criterion by criterion. Use it only where it agrees with staff about as well as they agree with each other. Keep people on a weekly sample, re-check the judge after any model or rubric change, and run the judged set as a regression test each release.
- **Trade-off:** Calibration costs staff days. An uncalibrated judge gives confident, empty numbers.
- **Follow-up to expect:** "The judge and staff disagree on empathy." Keep empathy with people and use the judge for accuracy only.

</details>

## Prompt injection

Taught in [prompt injection and egress control](../../../../01_Concept_Tutorials/Consolidated_Lessons/T4.4_Security_Tenancy_and_Prompt_Injection/03_Prompt_Injection_and_Egress_Control.md) and [untrusted content in customer data](06_Untrusted_Content_in_Customer_Data.md).

<details>
<summary>Practice question 13. Hexham's assistant reads procedures, contractor emails and asset notes, and can raise work orders. Where can injected instructions enter, and how do you contain them?</summary>

- **Answer:** Inputs: the user's question, retrieved procedures, contractor emails, asset notes and tool results. Treat all but the user's own question as data. Contain it in layers: mark untrusted text, give the model the fewest tools, have the user confirm each work order, check arguments in code, and block links and email to unlisted domains. Test with planted instructions in every input, asserting on tool calls.
- **Trade-off:** Confirmation adds a click. Without it, an email can raise jobs.
- **Follow-up to expect:** "Can you filter injections out?" Filters catch known patterns only. Design so a successful injection can do little harm.

</details>

## References

1. The lessons linked under each heading, in this module and in the AI Engineering and Production AI deep dives.

## Key takeaways

- The model proposes tool calls. Code decides whether they run.
- Choose chunking and search mode by testing on labelled questions.
- An MCP server acts as the user and returns typed errors.
- Measure output, task and outcome, and tag each failure's stage.
- Treat every input except the user's own words as data.

## Check yourself

<details>
<summary>1. In practice question 9, why do 60 cases give a better than 95% chance of seeing a 5% failure?</summary>

All 60 pass with probability 0.95 to the power 60, about 0.046, leaving about 95.4% for at least one failure.

</details>

<details>
<summary>2. In practice question 11, why fix argument filling first?</summary>

It accounts for 9 of the 18 failures, half the total. The shipment system errors account for 5 and the replies for 4.

</details>
