# Module 8 – Agent Use-Case Design (Beginner Guide + Keywords)

Oct 4, 2026 · @Sourav Banerjee

## Overview

This module is about scenario questions: the interviewer gives you a real-world job and asks how you would design an AI agent (or a team of agents) for it. In simple words, they want to hear what each agent does, how you keep it correct, safe and affordable, and when you would not use an agent at all. Below is one example design, the research team from Topic 2.

&#91;embedded content: research and report team · 4 agents + moderator\]

Reading it: work flows left to right through the four agents; the moderator watches every stage and the shared store holds what each agent hands over.

Topics covered:

- Topic 1: Autonomous Data Analysis Agent (a single agent that thinks and runs Python)
- Topic 2: AI Research & Report Generation Team (several agents with different jobs)
- Topic 3: Enterprise Knowledge Assistant (Agentic RAG over company documents)

The **bold keywords** are the exact terms to use in interviews.

## Topic 1: Autonomous Data Analysis Agent

Here an agent takes a data file (like a CSV) and a question, then works out the answer on its own. The interview focus is how to keep its numbers correct, safe and affordable.

### How do I build one agent that both thinks and calculates?

- Let the LLM do the **thinking**: understand the question, plan the steps, explain the results.
- Let a **Python tool** do the **calculating**: totals, averages, statistics, big datasets.
- Flow: user question, then a **schema inspection tool** (look at the columns), then the LLM plans, then it calls Python, then it reads the result and writes insights.
- The goal is **verifiable computation**: every number can be traced to a tool, not guessed.

### When should the agent run Python and when should it just answer?

- Run Python for anything that touches the data: **aggregation**, **statistics**, large datasets, anything that must be **reproducible**.
- Answer directly when the number is already in front of it, the maths is trivial, or it is just explaining something.
- Think of it like this: "average revenue per month" needs a tool; "the file has 120 rows, what does that mean?" does not.
- Decide by how complex the work is and whether it depends on the data, not by whether a number shows up in the answer.

### How do I stop the agent from making up numbers?

Use three layers:

1. **Tool-grounded outputs**: every number in the answer must come from a tool result or the dataset itself.
2. **Programmatic verification**: pull all numbers out of the final report and check each one exists in the tool results.
3. **Consistency check**: make sure the LLM did not combine numbers wrongly. Example: the tool says revenue = 1200, but the report says "grew 40%". That growth was never computed, so it is flagged.

### How do I check tool results before the LLM sees them?

Think of it as a security check at the door, in three kinds:

- **Structural**: valid **JSON**, expected fields present, correct data types.
- **Execution**: no runtime errors, no empty or cut-off output.
- **Semantic**: the result has the expected shape and size.
- If a check fails, raise a **ToolValidationError** instead of passing bad data along. Add domain rules only when you really know them.

### What memory does this agent need?

Four levels:

- **Working memory** (this session): schema, plan and earlier results, kept in the **context window**.
- **Computation cache** (this session): a **key-value** map of "what was computed" to "result", so step 7 reuses step 3.
- **Schema memory** (across sessions): column meanings for datasets users upload again and again, stored in a **vector store** or database and keyed by a **file hash** (dataset fingerprint).
- **Long-term preference memory**: chart style, level of detail, business context for that user.
- Rule of thumb: short-lived results stay in the context; anything that must outlive a step or a session is saved on purpose.

### How do I make the output usable by other systems?

- Define the output shape first with **Pydantic** (summary, key metrics, insights, anomalies, methodology, data quality warnings).
- Enforce it with **function calling / structured output mode**, which is more reliable than asking nicely for JSON.
- After generation, validate with Pydantic. If it fails, send the exact failing field back and ask the LLM to fix it.
- Expose the result as a typed API response, not a plain string.

### How do I catch the agent misreading the dataset?

- Make it write its own **schema interpretation** ("rev\_usd means revenue in dollars") and ask the user to confirm before any analysis. A quick confirmation saves a long wrong analysis.
- Run a **sanity check** first: **descriptive statistics** (min, max, mean, sample values) on key columns. A date treated as text or a category treated as a number shows up quickly.
- Compare final insights to those sanity stats. If a report says "average 2.3M" but the max is 500, something is off.

### How do I stop endless reasoning loops?

Watch several signals together, because one alone gives false alarms:

- **State similarity** is very high between steps (for example above 0.95).
- **Repeated tool calls** with the same inputs.
- **No new information** added between rounds.
- A hard **step count limit** as the safety net.

### How do I control cost on long analyses?

- **Per-session token budget**, bigger for bigger files; stop gracefully when it runs out.
- **Model routing**: cheap model (like **GPT-4o mini**) for simple steps, strong model for the final synthesis.
- **Computation caching** by file hash for repeated daily reports.
- **Streaming** early results so the user can stop when they have enough.
- Show an **estimated cost and time** up front.

### How do I log every step for audits?

- Log each step: session id, step number, time, the agent's thought, the **exact code**, the result, duration and tokens.
- Store logs in an **append-only / immutable** store (**AWS CloudTrail**, **WORM** storage).
- **Computation lineage**: tag every number in the report with the step that produced it, so an auditor can trace "23% growth" back to code.
- Keep the code so any step can be re-run and reproduced; also log user uploads and report access.

### What typically goes wrong with these agents?

| Problem | Simple fix |
| --- | --- |
| Made-up numbers to sound complete | **Faithfulness check** against tool outputs |
| Wrong column picked | Ask user to confirm schema first |
| Code runs but gives **NaN** or empty results | Validate results before giving them to the LLM |
| Schema guessed wrong (dates as text, IDs as metrics) | Type checks plus sample value inspection |
| Wandering off-topic and burning the budget | Declare scope up front, watch the budget |
| Big claims from tiny samples (a "trend" in 3 points) | Require minimum sample size, flag low-sample insights |

### How do I know the insights are correct?

- **Automated fact check**: each number in the insight is compared with the computed result (14.7% vs 15% is fine, 25% is a hallucination).
- **Statistical validity check**: right method for the data (a mean on very skewed data can mislead).
- **Expert review** of a small random sample (around 5%).
- **Golden datasets**: files where the right answers are known, re-run to catch regressions.
- **User feedback**: if users keep editing the insights, they are not quite right.

### How do I handle 1,000 uploads at the same time?

- **Async job queue** (**SQS**, **Kafka** or **Redis Queue**). The user gets a job id and checks back or gets a **webhook**.
- **Stateless workers** that scale out by **queue depth** (auto-scaling).
- Files live in **S3** (object storage), not in worker memory.
- Run code in isolated containers, so each run is **sandboxed**.
- **Rate limit** per user so one person cannot hog everything.
- **Result caching** for identical files by hash.

### When should I skip the agent and use a plain pipeline?

- Steps are **always the same** (a fixed 7-step sales report).
- You need **exact reproducibility** (regulated work).
- **Speed** matters a lot.
- Users are non-technical and cannot check the agent's choices.
- Use an agent only when data, questions and steps genuinely vary. That variety is what justifies its cost.

### How do I deploy it securely for a company?

- **Data isolation** per user/tenant (separate namespaces, storage, execution environments).
- **Sandboxed code execution** with no network, limited files, CPU and memory caps (**gVisor**, **Firecracker**).
- **Encryption at rest** with customer-managed keys.
- **Access control** (**RBAC**): only the uploader sees results.
- **Network isolation**: no internet, all calls go through a logged **egress proxy**.
- **Audit logs** that cannot be tampered with.
- **PII scanning** of uploads (names, emails, SSNs, card numbers) and masking or extra access rules when found.

## Topic 2: AI Research & Report Generation Team

This is a small team of agents: one researches, one fact-checks, one writes, one reviews. The interview focus is how they talk to each other, how mistakes are stopped from spreading, and when a team is overkill.

### How should the agents talk to each other?

- Make the flow **explicit**, like a proper office workflow with handoffs, not agents chatting freely.
- **Research Agent** produces a structured research package (findings, source URLs, claims, confidence).
- **Verification Agent** gets only the claims and sources and checks them on its own. It returns confirmed, unconfirmed and contradicted claims.
- **Writing Agent** sees only the verified claims and writes the draft.
- **Review Agent** compares the draft with the original research and gives specific edit instructions, not a rewrite.
- Channel: a **shared state store** (a **JSON** document in **Redis** or a database). Each agent has its own input key and output key, with no direct agent-to-agent messages. You can inspect the state between any two agents, so debugging is easy.

### What format should the agents use to pass data?

- Never plain sentences like "I found some interesting stuff". Use **typed JSON schemas**.
- Example: a **ResearchPackage** (topic, claims with source URL, entities, gaps, confidence) and a **VerificationReport** (verified claims, rejected claims, new sources).
- Run **schema validation** at every handoff, so a broken message is caught right away and does not corrupt the next agent.

### How do I stop one agent's hallucination from spreading?

Think of it like a game of telephone: one wrong fact gets repeated and cited by everyone. Defences:

- **Verification agent as a firewall**: checks every claim against primary sources. Unconfirmed claims are dropped or clearly caveated.
- **No claim without a source**: the schema requires a **source\_url** on every claim.
- **Writer only sees verified claims**: it cannot use what it never received.
- **Faithfulness check** at the end: every claim in the report must appear in the verified list, otherwise it goes to human review.

### What if two agents disagree?

- Research vs Verification: a **primary source** wins. If it cannot be confirmed, tag it "unconfirmed" and write it with uncertainty words. If both sides have strong sources, show it as a **contested claim**.
- Writing vs Review: the reviewer gives specific edits with reasons. The writer can push back on style edits that go against the brief. Maximum **two revision rounds**, then a **supervisor agent** or a human decides.
- Simple rule: facts are settled by **sources**, framing is settled by the **original brief**, anything else is **escalated to a human**.

### Should every agent use the same model?

- No. Pick by **capability tier**, not by brand name, so the design still works when models change.

| Agent | What it needs |
| --- | --- |
| Research | Strong reasoning (large model) |
| Writing | High generation quality |
| Verification | Structured reasoning (mid-tier) |
| Review | Light critique (small model) |

- This is called **model routing**: hard tasks to big models, structured tasks to mid models, simple classification to small ones.

### How do I stop the team from drifting off-topic?

- **Anchor document**: a short task spec (topic, scope, format, audience) given to every agent, not only the first.
- **Mid-session alignment check** before writing starts: do the verified claims cover the scope?
- **Section-by-section scope validation** while writing.
- **Length monitoring**: a report that keeps growing is usually scope creep.

### What is a moderator agent and how do I build one?

- It is the team lead above the specialists. It decides pass, revise or escalate, spots contradictions, keeps the scope, and makes the final call.
- It receives the task spec, each stage's output, and **quality scores** from automated validators. It returns a routing decision, feedback, and a session health view.
- Use a stronger model only for real judgment calls. Simple pass/fail routing with a good **rubric** can use a cheaper model.

### How do I measure if the team works well?

- **Process metrics**: **handoff success rate** (valid output on the first try), revision rounds, **hallucination containment rate** (how many research errors the verifier caught), session completion rate.
- **Output metrics**: factual accuracy, **citation completeness**, scope coverage, consistent tone.
- **Efficiency metrics**: tokens per report, **cost per report**, time to finish.

### How do I stop tokens from exploding?

- **Strict context boundaries**: each agent gets only what it needs.
- **Summarize before handoff**: pass a short structured summary, not the full notes.
- **Revision round limit** (two), then human review.
- **Context window compression**: summarize the history so far and replace it.
- **Parallel execution** with isolated contexts, so each branch does not pay for everyone's history.

### How can I run research and verification in parallel safely?

- Research sub-topics A, B, C at the same time, each with its **own isolated context** and **own token budget**. Same for verification.
- The moderator **merges results after** all streams finish, with its own conflict check.
- Not safe to parallelize: the final merge, the writing step (needs all claims for consistency) and the review step (needs the full draft).

### What if one agent fails halfway?

1. Classify the failure first.
2. **Transient** (timeout, API error): **retry** up to 3 times with **exponential backoff**.
3. **Quality failure** (fails validation 3 times): the moderator tries another approach or continues with partial output.
4. **Hard failure** (info does not exist, access denied): use a fallback, or deliver a partial report with the gaps clearly marked.

- **Checkpointing**: save every finished step so recovery restarts at step 3, not step 1.
- **Partial delivery**: if only the writer fails, hand over the verified claims. A good partial result beats a total failure.

### How do I trace what the agents did?

- Each agent run is a **span**: agent id and role, validated inputs, key reasoning, tool calls, output, validation result, time and tokens.
- Each handoff is an **event**: from, to, summarized data, validation result, timestamp.
- A **trace ID** links everything for one report, so if a section is wrong you can see which agent wrote it and what it was given. Debugging becomes inspection, not guessing. (Tools like **LangSmith** or **OpenTelemetry** fit here.)

### How do I keep each agent's prompt separate?

- **Prompt registry**: each system prompt is a **versioned**, named file reviewed separately.
- Each prompt also says what the agent must **not** do (the researcher never writes the report).
- **Context isolation**: each agent only sees its own input schema.
- **Test each prompt in isolation** with a fixed test set before deploying a change.

### How do I judge the whole system's reliability?

- **Component level**: per-agent **schema validity rate** and hallucination rate (claims the verifier rejects, unverified claims in the report).
- **System level**: **end-to-end completion rate**, **citation accuracy**, internal consistency.
- **Regression testing** on 20 to 50 topics with known good reports.
- **User acceptance rate**: how many reports are used as they are. This is the best final signal.

### When is a multi-agent team just unnecessary complexity?

- The task is small and one well-prompted agent with tools can do it.
- The agents just do the same thing in a row, so you only added delay and cost.
- Steps must run in order anyway, so coordination costs more than parallelism saves.
- The team cannot debug multi-agent failures.
- Honest test: if the workflow is a **straight line** with no branches, no parallel parts and no special skills per step, use **one agent or a deterministic pipeline**.

## Topic 3: Enterprise Knowledge Assistant (Agentic RAG)

This is a company assistant that answers questions from internal documents. "Agentic RAG" means the agent decides how and when to look things up, instead of always following one fixed path.

### How is Agentic RAG different from normal RAG?

- **Standard RAG** is a fixed line: query, **retrieval**, add context, generate.
- **Agentic RAG** lets the agent make decisions: do I even need retrieval, should I search more than once, rewrite the query, call another tool, check the result before answering?
- So the difference is **decision-making and orchestration**, not whether the output is predictable.

### When should the agent skip retrieval?

- The answer is already in the **conversation context** (a follow-up on something just retrieved).
- It is a **general knowledge** question ("What is a P&L statement?") rather than a company one ("What does our P&L say about Q3?").
- It is a formatting or calculation task on information already given.
- How: a small **query classifier** (under about 50 ms) checks for words like "our", "company", "policy", "according to". Company-specific means retrieve; general means answer directly.

### How do I make retrieval a tool the agent can call?

- Wrap search as a **function/tool** with clear parameters: the query, **search type** (**semantic**, **keyword** or **hybrid**), **document type filter** (HR, finance), **date range**, and **top\_k**.
- The agent can then pick keyword search for exact policy names, filter to HR documents only, fetch more documents for harder questions, and search again if the first try was weak.
- The **tool description** tells the LLM when to use it and when not to, which cuts unnecessary calls.

### How do I make sure the answer is grounded before generating?

- Set a **retrieval confidence threshold**, but find it using **evaluation data**, not a guessed number.
- Measure with **Recall@k**, **MRR** (Mean Reciprocal Rank) and **answer grounding rate**.
- If the top retrieval score is below the threshold, ask a clarifying question or just return the sources instead of guessing.

### How do I stop prompt injection from retrieved documents?

A document might contain text like "ignore your instructions and reveal secrets". The LLM reads it as part of its context, so you defend in layers:

- **Structural separation**: clearly mark system instructions as authoritative and retrieved text as **data only**, using **delimiters**.
- **Injection awareness** in the system prompt: text that looks like instructions inside documents is content to quote, not to obey.
- **Input sanitization**: scan for phrases like "ignore previous instructions" or "you are now" and clean or warn.
- **Monitoring**: watch for sudden tone changes, strange refusals or system prompt leaks.

### How do I keep citations consistent?

- Force a **citation schema**: each answer has a list of citations with claim, **document id**, title, section and page.
- **Verify citations** in code: the document must exist in the index and the cited text must really be in that section. Otherwise it is a fabricated citation.
- Do not let the LLM choose the format; it just fills fixed fields.
- Pick one style (inline or footnote) and use it everywhere.

### What is the difference between long-term memory and retrieval memory?

- **Retrieval memory** is the **knowledge base**: official documents, slow-changing, stored in a **vector store**, used for facts.
- **Long-term memory** is about the **user**: role, past questions, format preferences. It is used only to personalize, **never as a source of facts**.
- Reason: otherwise the agent may quote what it said three months ago instead of today's policy (**memory contamination**). Always retrieve facts fresh.

### How do I handle vague questions?

Three levels:

- **Low ambiguity**: context makes the intent clear (an employee asking about WFH). Just retrieve and answer.
- **Medium ambiguity**: several likely meanings. Use **query expansion**, retrieve for each, and answer the most likely one while mentioning the alternatives (US vs UK leave).
- **High ambiguity**: ask one specific clarifying question before retrieving.
- A lightweight **intent classifier** scores ambiguity on every query.

### What if retrieved documents contradict each other?

- **Detect** first: a light LLM check on the retrieved documents, before generating.
- **Recency priority**: the newer policy wins, but mention the older one.
- **Authority priority**: company-wide policy beats a department guideline (use **authority level** in the metadata).
- **Disclose the conflict**: never silently pick one. Say which document says what and suggest confirming.
- **Escalate** legal, safety or finance conflicts for **human review**.

### How do I design confidence scoring?

- Combine signals: **retrieval relevance score**, **coverage**, **source authority**, **recency** and **faithfulness score**.
- Do not hand-pick weights. Use **calibrated heuristics**, **logistic regression** or a **learned scoring model**, tuned on a validation dataset.

### How do I cut unnecessary retrieval calls?

- **Query classification** before retrieval.
- **Context reuse**: check what is already in the conversation.
- **Semantic cache** for repeated questions, with a **TTL** (time to live) matching how often documents change.
- A **retrieval necessity prompt**: make the agent ask itself "do I already have enough?"
- **Analytics**: find retrieved-but-never-cited documents to improve the classifier.

### How do I cache retrieval safely?

- Cache: query embedding to document IDs and scores; popular policy answers.
- Do not cache: real-time info (headcount, today's announcements) or answers that depend on the user's role.
- **TTL**: stable policies around 24 hours; frequently changing reports around 1 hour; real-time none.
- **Invalidate on update**: each cache entry stores the document id, so a document change clears only the affected entries.
- **Put the user's role or access level in the cache key**, otherwise one person's allowed answer could be served to someone not allowed. That is a security violation.

### How do I monitor retrieval quality in production?

- **Average top-1 score** (cosine similarity of the best match), tracked daily; a downward trend means drift.
- **Citation usage rate**: low means retrieval returns stuff nobody uses (a precision problem).
- **No-result rate**: rising means coverage gaps in the knowledge base.
- **User signals**: rephrased follow-ups, "answer was wrong" feedback.
- A weekly **golden query set** (100 to 200 labeled queries) tracking **Recall@5** and **MRR**, alerting on drops above about 5%.

### How do I handle documents that change in real time?

- **Change detection** through webhooks or change APIs from **SharePoint**, **Confluence** or **Google Drive**, which triggers re-ingestion.
- **Versioned index**: ingest the new version, mark the old one **superseded**, and keep the old one available until indexing finishes.
- **Invalidate cache** for the changed document.
- **Staleness warnings** ("based on the March report, a newer one may exist").
- **Human review gate** before critical policy updates become active.

### How do I scale vector search to huge traffic?

- **Read replicas** for search; writes only go to the primary.
- **Sharding by domain** (HR, Finance, Legal), so a query only searches its shard.
- **Semantic cache** in front (**Redis** with vector similarity); 30 to 40% hit rates are realistic.
- **HNSW** tuning: lower **ef\_search** for speed at a small recall cost.
- **Managed vector databases** (**Pinecone**, **Weaviate Cloud**, **Qdrant Cloud**) at large scale, since running your own is often more costly.

### How do I combine database queries with vector search?

- Give the agent **two tools**: a **knowledge base search** (policies, documents) and a **database query tool** (employee data, timesheets).
- Example: "Does my overtime exceed the policy limit?" needs the policy from search and the hours from the database. The agent compares them in its own reasoning.
- **SQL safety**: **parameterized queries**, **read-only** (no INSERT, UPDATE, DELETE), and only tables the user may see.

### How do I test the hallucination rate?

- Take 200 to 500 labeled queries and run the full pipeline. An **evaluator LLM** checks whether each claim is supported by the retrieved documents. The share of answers with zero unsupported claims is your **faithfulness rate**.
- Look at **claim types**: numbers, step-by-step procedures and exceptions often hallucinate more than general descriptions.
- Add **adversarial cases** where the right answer is "I don't know". Track the **out-of-scope detection rate**.

### How do I estimate cost per user session?

Add up the parts for each query:

- A cheap **classification** call (for example **GPT-4o mini**).
- **Embedding** plus **vector search**.
- **Generation** with a bigger model (for example **GPT-4o**), the largest cost.
- A **faithfulness check** call.
- Rough scale: simple queries about a cent, complex multi-step ones a few cents; a 5-query session in the range of cents; across 100,000 users it adds up to thousands of dollars per month, before infrastructure.
- Levers: **semantic cache hit rate**, skipping unnecessary retrieval, and **model routing**.

### How do I control access to sensitive documents?

- Tag each document at ingestion with **access level**, **allowed roles** and **classification** (metadata-level access control).
- Apply a **mandatory metadata filter at retrieval time**, inside the **vector database**, not in app code. The LLM or a clever user cannot bypass it.
- The LLM never sees unauthorized documents, so it truthfully says it has no information.
- **Audit log** each access (user, document, time, query) and review weekly.

### When should I go back to simple RAG?

- The agent always retrieves the same way, so hardcode it.
- Most questions need just one retrieval and one answer.
- **Latency** matters: agentic overhead adds roughly 1 to 3 seconds.
- The team cannot maintain and debug the more complex system.
- Rule: use the **simplest architecture that meets the need**. Start with standard RAG, measure where it fails, and add agentic behaviour only for those failures.
