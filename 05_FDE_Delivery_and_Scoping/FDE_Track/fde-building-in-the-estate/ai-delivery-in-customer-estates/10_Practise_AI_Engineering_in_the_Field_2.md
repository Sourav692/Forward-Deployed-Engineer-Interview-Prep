---
title: "Practise AI engineering in the field, part 2"
subtitle: "Eleven practice questions on conversation state, grounded answers, tool loops, MCP tools, evaluating an operations agent and execution limits."
track: Building Inside the Customer's Estate
module_group: AI delivery
module_code: T21.5
module_name: Shipping RAG and agents into a customer's estate
lesson: 10
lessons: ["Inputs as they really arrive", "Extraction you can trust", "Permissions, deletions and citations", "Agents that touch business systems", "Evaluating on the customer's work", "Untrusted content in customer data", "Voice and multimodal in operations", "Practise AI delivery", "Practise AI engineering in the field, part 1", "Practise AI engineering in the field, part 2"]
level: intermediate
reading_time: "15 min"
source: "Forward Deployed Engineering track"
author: Sourav Banerjee
last_updated: "17 November 2026"
tags: [practice, interview, AI system design, memory, citations, MCP, evaluation, guardrails]
---

## How to use this practice

Some of these questions describe a fault in a running system and ask you to diagnose it. Others ask you to build a part of one. Answer aloud as you would to the customer's engineers, then compare with the outline. The deep dives linked under each heading teach the engineering in full.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Keeping customer constraints alive across long conversations and sessions.
> - Tying every claim to a passage, and declining when none supports it.
> - Running a tool loop with argument and permission checks.
> - Designing MCP tools with authorisation, audit and a stable error contract.
> - Scoring an operations agent with people and comparing releases fairly.
> - Capping an agent's time, tokens, cost and calls.

## Conversation state

Taught in [trimming, windowing and summary memory](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p09_memory_layer/m33_short_term_memory_conversation_state/03_trimming_windowing_and_summary_memory.md), [threads, checkpoints and memory optimisations](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p09_memory_layer/m33_short_term_memory_conversation_state/06_langgraph_threads_checkpoints_and_memory_optimisations.md) and [session, semantic, episodic and procedural memory](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p09_memory_layer/m34_long_term_agentic_memory/02_session_semantic_episodic_and_procedural_memory_on_sqlite.md).

<details>
<summary>Practice question 1. Early in a long chat, a Saltram Energy customer says they are on a prepayment meter and cannot use direct debit. Thirty turns later the assistant offers direct debit. Diagnose and fix it.</summary>

- **Answer:** Older turns were summarised to save context, and the summary dropped the constraint. A free-text summary keeps what the model judges important, not what the business must honour. Extract constraints and key facts into a structured state record as they appear: payment method, vulnerability flags, accessibility needs. Send that record with every request, outside the summary. Add a code check that blocks offers the record rules out, and add this conversation to the regression set.
- **Trade-off:** A state record needs a schema someone keeps current. A larger context window delays the loss without preventing it.
- **Follow-up to expect:** "The customer changes their mind later." Update the field, keep the turn it came from, and let the newest value win.

</details>

<details>
<summary>Practice question 2. Design the state Saltram's support assistant keeps within a chat, across sessions and across channels.</summary>

- **Answer:** Three layers. Within a session: the messages, trimmed to a token budget. Per case: a structured record keyed by case ID, holding account, verified identity, issue, steps tried, promised callbacks and constraints. Per customer: preferences and flags the customer agreed to store, with a retention period. Checkpoint the case record after each step, so a dropped chat resumes where it stopped. Identity verification expires after a set time and must be repeated.
- **Trade-off:** Long-term memory gives continuity and holds personal data. Keep only what the customer would expect, with a way to delete it.
- **Follow-up to expect:** "The customer moves from chat to phone." The phone agent loads the case record by account, not the chat transcript.

</details>

## Grounded answers

Taught in [answers with sources and per-claim citations](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p05_retrieval_quality_and_rag_apps/m19_end_to_end_rag_systems/02_answers_with_sources_and_per_claim_citations.md), [reliable RAG with relevance and hallucination checks](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p08_agentic_rag/m32_reliability_feedback/01_reliable_rag_relevance_checks_hallucination_checks_source_highlighting.md) and [permissions, deletions and citations](03_Permissions_Deletions_and_Citations.md).

<details>
<summary>Practice question 3. Kelmscott Legal's contract assistant retrieves the right clauses, yet its answers contain claims those clauses do not make. Diagnose it.</summary>

- **Answer:** Retrieval works, so look at generation. Read the traces. Are the passages in the prompt in full? Does the prompt allow general knowledge? Is the model joining clauses and adding its own inferences? Then fix it: answer only from passages, require a passage ID for every claim, and run a grounding check that compares each sentence with its cited passage. Drop or flag unsupported sentences. Measure the unsupported-claim rate on a labelled set before and after.
- **Trade-off:** A grounding check adds a model call per answer. Without one, the lawyers find the errors.
- **Follow-up to expect:** "The extra claim happens to be true." It is still unsupported. True claims without sources teach users to trust the false ones.

</details>

<details>
<summary>Practice question 4. Design Kelmscott's answers so that every claim is tied to a passage and the assistant declines when nothing supports one.</summary>

- **Answer:** The output is a list of claims, each with its text, one or more passage IDs and a quoted span. Code checks that each quote appears word for word in its passage and that the passage was retrieved for this user. Claims that fail are removed. If no claim survives, or the best retrieval score is under the threshold, the assistant says it cannot find this in the contracts the user can access and lists the closest documents. The interface shows each claim beside its clause.
- **Trade-off:** Exact quotes make answers stiffer to read. They let a lawyer check a claim in seconds.
- **Follow-up to expect:** "Two clauses conflict." Show both, cited, and say they conflict. Do not pick one.

</details>

## Tool loops and MCP tools

Taught in [the manual tool loop](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p06_agent_foundations/m22_agent_loop_and_tools/04_the_manual_tool_loop_and_the_augmented_llm_in_langgraph.md), [tool schema design](../../../../01_Concept_Tutorials/Consolidated_Lessons/T3.2_Tool_Design_MCP_and_A2A/02_Tool_Schema_Design.md), [typed tool results and teachable errors](../../../../01_Concept_Tutorials/Consolidated_Lessons/T3.2_Tool_Design_MCP_and_A2A/03_Typed_Tool_Results_and_Teachable_Errors.md), [building an MCP server](../../../../01_Concept_Tutorials/RAG_Agents_Engineering/p11_agent_protocols/m38_mcp_foundations/02_building_an_mcp_server.md) and [agents that touch business systems](04_Agents_That_Touch_Business_Systems.md).

<details>
<summary>Practice question 5. Skipton Rail's operations agent checks train faults and raises work orders. Describe its tool loop, with the argument and permission checks.</summary>

- **Answer:** Send the messages and tool definitions to the model. If it returns a tool call, validate the arguments against the schema, then check this user may take this action on this asset. Run the tool, return a typed result and loop. Stop when the model gives a final answer or a limit is reached. A write action, such as raising a work order, needs the user's confirmation before it runs. Each step logs the call, the check result and the outcome.
- **Trade-off:** Checking every call adds latency. Unchecked tools act with whatever access the service account has.
- **Follow-up to expect:** "The model calls a tool that does not exist." Return an error listing the valid tools, and count the step towards the limit.

</details>

<details>
<summary>Practice question 6. Design an MCP server for Skipton with one tool to look up assets and one to raise tickets.</summary>

- **Answer:** The lookup tool takes an asset ID or location code and returns status, open faults and the last inspection date. It is read-only. The ticket tool takes an asset ID, a fault category from a fixed list, a severity and a description, and returns a ticket ID. It writes, so it requires an idempotency key. Depot lists and fault categories are resources. The server calls the maintenance system with the user's identity and logs every call.
- **Trade-off:** Two narrow tools are easier to secure than one general query tool. They also cover fewer requests.
- **Follow-up to expect:** "Engineers want to close tickets too." Add a separate close tool with its own permission rather than a status field on the raise tool.

</details>

<details>
<summary>Practice question 7. Design authorisation and audit for Skipton's MCP server.</summary>

- **Answer:** Authorise every call in the server. The user's token gives identity and role, and a policy maps role to tools and scope: signallers may look up any asset, depot engineers raise tickets for their own depot only, and severity 1 tickets need a supervisor. Deny by default. Log each call with time, user, role, tool, tool version, arguments, decision, result and request ID. Write the log to an append-only store Skipton's security team can query, and keep it for the agreed period.
- **Trade-off:** A fine-grained policy is more to maintain. Coarse roles let an engineer raise tickets for another depot.
- **Follow-up to expect:** "Who did the agent act for?" The log names the human user, with the agent as the client. An action is never logged as the agent's alone.

</details>

<details>
<summary>Practice question 8. Skipton's assistants break whenever the MCP server changes. Design its error contract and compatibility tests.</summary>

- **Answer:** Every error returns a code from a fixed list (invalid argument, not found, forbidden, conflict, rate limited, upstream unavailable), a message the model can act on, and a retryable flag. Contract tests run on every build: each tool's schema against a stored snapshot, each error code triggered by a known input, and recorded requests from every client version still in use replayed against the new server. A breaking change fails the build.
- **Trade-off:** Snapshots need updating for each intended change. Without them, a renamed field breaks every client without warning.
- **Follow-up to expect:** "The maintenance system returns a new error." Map it to an existing code, or add a code in a new version. Never pass raw upstream errors through.

</details>

## Evaluating an operations agent

Taught in [component and trajectory metrics](../../../../01_Concept_Tutorials/Consolidated_Lessons/T4.2_Evaluation_and_Release_Gates/02_Component_and_Trajectory_Metrics.md), [validating LLM judges](../../../../01_Concept_Tutorials/Consolidated_Lessons/T4.2_Evaluation_and_Release_Gates/04_Validating_LLM_Judges.md), [release gates for safety, quality and cost](../../../../01_Concept_Tutorials/Consolidated_Lessons/T4.2_Evaluation_and_Release_Gates/05_Release_Gates_Safety_Quality_and_Cost.md) and [evaluating on the customer's work](05_Evaluating_on_the_Customers_Work.md).

<details>
<summary>Practice question 9. Write the rubric Skipton's reviewers use to score the operations agent.</summary>

- **Answer:** Score each run on five criteria, each from 1 to 3 with written anchors: correct asset, right fault category and severity, safety steps stated where the procedure requires them, ticket fields complete, and an explanation an engineer can follow. Safety is pass or fail: a miss fails the run whatever the other scores. Two reviewers score the first 50 runs, compare, and rewrite anchors where they disagree. After that, one reviewer per run, with 10% scored twice.
- **Trade-off:** Anchored scales take time to write. Unanchored scores drift between reviewers.
- **Follow-up to expect:** "Reviewers disagree on severity." Add worked examples to the anchor from Skipton's own severity guide.

</details>

<details>
<summary>Practice question 10. Skipton has a new prompt for the agent. How do you decide whether it is better than the current one?</summary>

- **Answer:** Run both versions on the same 150 tasks, five times each, because the agent's output varies between runs. Score with the rubric and the task checks. Report each task's pass rate over its five runs, and the overall rate with a confidence interval. Ship only if the new version loses nothing on safety cases and is better or equal overall beyond the noise. Read every task that flipped from pass to fail.
- **Trade-off:** 1,500 runs cost money and a day of waiting. One run each mistakes noise for improvement.
- **Follow-up to expect:** "The new version wins by 2 points." Check whether the intervals overlap. If they do, it has not been shown to be better.

</details>

## Execution limits

Taught in [the eight guard checks](../../../../01_Concept_Tutorials/Consolidated_Lessons/T3.5_Robust_Agents/05_The_Eight_Guard_Checks.md) and [budgets and spend guardrails](../../../../01_Concept_Tutorials/Consolidated_Lessons/T4.5_Cost_and_Latency/07_Budgets_and_Spend_Guardrails.md).

<details>
<summary>Practice question 11. Design an execution controller for Saltram's billing agent with limits on time, tokens, cost and tool calls.</summary>

- **Answer:** The controller wraps the agent loop and checks limits before each step: 120 seconds per task, 60,000 tokens, 40 pence of model spend, 15 tool calls, and no more than two repeats of the same call with the same arguments. Set each limit from the distribution of successful runs, with headroom. On a breach, stop, save the state and hand the case to a person with the trace. Emit a metric per breach type and alert when breaches rise.
- **Trade-off:** Tight limits stop some long valid tasks. Loose ones let a looping agent spend for minutes.
- **Follow-up to expect:** "One customer's tasks always hit the limit." Read their traces. Their account may need a different path, not a higher limit.

</details>

## References

1. The lessons linked under each heading, in this module and in the AI Engineering and Production AI deep dives.

## Key takeaways

- Keep constraints in a structured state record, not in a summary.
- Tie each claim to a quoted passage, check it in code, and decline when none survives.
- Validate arguments and permissions on every tool call, and confirm writes.
- MCP tools need per-call authorisation, an append-only audit log and a fixed error contract under test.
- Compare releases on repeated runs, with safety as a hard gate.
- Cap time, tokens, cost and calls, and hand breaches to a person.

## Check yourself

<details>
<summary>1. In practice question 1, why does a larger context window not fix the problem?</summary>

The conversation can still grow past it, and the summary will drop the constraint then. Only a record sent with every request keeps it.

</details>

<details>
<summary>2. In practice question 10, how many runs does the comparison take, and why repeat them?</summary>

150 tasks, five runs each, for two versions: 1,500 runs. The agent's output varies, so one run per task cannot separate a real gain from noise.

</details>
