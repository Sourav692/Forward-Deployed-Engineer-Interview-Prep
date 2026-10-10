# The Technical Implementation Flow

*A design that worked first time is easy to present, but a technical listener learns more about judgement from the designs that failed.*

◷ 8 min

A technical peer does not want the pitch. They want the evolution: what was tried, why it broke, and why each tool won. Tell the build as a sequence of stages and pivots, not as a finished diagram, and keep the results honest in the way [Proof versus Knowledge](/learn/communication-and-behavioural/telling-the-build-story/proof-versus-knowledge) describes.

**Objectives:**

- give the eight-part structure of an implementation flow;
- tell a forced pivot apart from planned scope, and say which is which;
- fill in all eight parts from one real project, including the parts it does not document.

---

## Tell the Build as Stages, Not a Final Diagram

The implementation flow serves a technical audience that wants the architecture's evolution. A single final diagram hides the decisions that produced it. A sequence of stages shows them.

Why stages, not one design up front? In the handbook's flows, the first design failed in real testing, and the second pivot happened for a different reason than the first. That shows iterative judgement, not a plan that happened to work first time.

## Follow the Eight-Part Structure

The handbook's insurer and lender flows share one structure.

| # | Part | What it contains |
|---|---|---|
| 1 | The story in brief | The business problem in a paragraph; what you led; the time box |
| 2 | Architecture evolution in stages | A diagram of each stage and the pivot between them |
| 3 | Why each pivot happened | The specific failure, such as context bloat or tool confusion, and why the fix was architectural rather than a better model |
| 4 | Why each tool, specifically | What it was evaluated against and why it won, as a table of requirement and why this fit |
| 5 | The components and their trade-offs | For every specialist or service, one row: role, tools, and the trade-off it represents |
| 6 | The constraint that shaped the build | The managed feature you could not use, the legacy API, or the compliance rule, and what you traded to work around it |
| 7 | Full stack | A table |
| 8 | Results, stated honestly, and what you would verify next | Including what the evidence does not show |

Part 3 carries the most judgement. A pivot explained as "we needed a better model" says little. A pivot explained as an architectural fix for a named failure says a lot. Part 8 follows the habits in [Proof versus Knowledge](/learn/communication-and-behavioural/telling-the-build-story/proof-versus-knowledge): every result comes with what it does not prove.

## Separate a Pivot From Planned Scope

Not every stage change is a pivot. A pivot is a change a documented failure forced. Planned scope is a change intended before anything broke.

A listener cannot learn how a builder reacts to failure from a change planned before anything failed. Calling planned scope a pivot also invites the follow-up "what broke?", with no honest answer ready.

Label each stage change as one or the other. For every pivot, name the failure and the fix. For planned scope, say it was planned, and move the judgement story to the failures found inside the stage.

## Worked Example: The Enterprise RAG Platform, Part by Part

Take the [Enterprise RAG platform](https://github.com/Sourav692/ai-engineering-demystified-14-projects/tree/db71e98600bf98c145b6172968da489e05220352/projects/03_enterprise_realtime_capstones/01_enterprise_rag_platform) from the companion course. Every fact below comes from its files at the pinned revision.

**Part 1, the story.** Meridian Cloud is a B2B observability company whose staff share one knowledge base. Not everyone may read everything, so one question has different correct answers for different people. "Why did Vertex Financial lose data in March, and do they get service credits?" gets five answers. A Tier-1 agent gets the backlog. A Tier-3 engineer gets the root cause. An account manager gets the credit tiers. An external contractor and anyone in another tenant get nothing. The project records no time box and no team size. Fill those from the real record; never estimate them.

**Part 2, the stages.** Stage A is the local build: LangGraph for orchestration, ChromaDB for vectors, OpenAI, and a hand-written policy engine. Stage B is a gap-closing pass driven by the project's own coverage map. It raised retrieval pool sizes from 12/12/20 to 40/40/50, added the nDCG ranking metric, and added a second synthetic data connector. Stage C rebuilds the same problem on Databricks, where most hand-built machinery becomes a platform feature. The project also has whiteboard designs for structured data, multi-agent orchestration and agent operations. Those were never built, so they are not stages.

**Part 3, the pivots.** Here the format's honesty matters most. Stages B and C were planned. The README calls them "two versions, on purpose". So the judgement story sits in the failures found inside each stage. In stage A, the evaluation harness caught three. A false security alarm came from mixing "unauthorised" and "irrelevant" in one label, so the label was split in two. A shadowed rule was never exercised by any security case, so a persona and a case were added for it. A flaky gate sometimes refused and sometimes answered, so security cases now gate only on leaks, which the policy engine decides with no model involved. In stage B, an unscoped reset wiped another tenant's corpus. A reset combined with incremental sync skipped re-embedding 21 of 22 documents. A new column needed a real schema migration. Stage C produced the one forced redesign. The search index will not build on a table that carries a row filter or column mask, which the author "only found by trying". That forced the data into an ungoverned base table plus a governed view. The project's own verdict on the stage C findings: "Nothing structural — the two-layer architecture stands." No fix in any stage was a better model.

**Part 4, the tools.** Each choice names what it beat. Attribute-based access control beat role-based: one embargo rule in the first is "a combinatorial explosion of roles" in the second. Pre-filtering inside a tenant partition beat post-filtering, which turned one user's top six results into a top two and leaked through result counts. Keyword search joins vector search because embeddings blur IDs like `MRD-5031` and `MRD-4290`. Reciprocal Rank Fusion merges the two, because ranks compare where raw scores do not. An LLM reranker beat a cross-encoder for being explainable with no model hosting. On Databricks, the Storage-Optimized endpoint won at about 7× lower cost, with SQL filters a security reviewer can read. One gap: the project gives no reason for ChromaDB, and says the vector database choice "is close to irrelevant".

**Part 5, the components.** The graph runs authorise, plan, retrieve, enforce, grade, then generate or refuse, then verify. A reranker runs after enforcement, so a restricted user's results are the best of their own authorised pool. Access control is two layers: "The filter makes retrieval cheap. The post-check makes it correct." The post-check reads a separate SQLite catalog, so it is a genuinely independent source of truth.

**Part 6, the constraint.** Databricks Vector Search does not enforce Unity Catalog row filters or column masks. The answer is two layers: a filter on the index, then a re-read of the governed view on behalf of the user. The trade is an ungoverned base table: granting anyone read access to it "bypasses the whole access model". Two parts of that design were not run end to end: on-behalf-of-user auth and the managed reranker. Say so.

**Part 7, the stack.** Python 3.12, LangGraph, ChromaDB, OpenAI's `text-embedding-3-small`, `gpt-4o-mini` as both the fast and the synthesis model, BM25 keyword search and a SQLite catalog. On Databricks: Mosaic AI Vector Search, managed embeddings and reranking, the Agent Framework, and MLflow tracing and evaluation.

**Part 8, the results.** On 22 documents and 22 test cases, the default strategy passes 22 of 22 with zero leaks and a median latency of 10.7 seconds. State three limits with it. The full table predates the pool-size change, and only a 10-case spot check followed. At 22 documents, the differences between retrieval strategies are noise. The demo does not show production scale, a real secrets vault, or a live serving surface. The number that matters is the zero-leak column.

A listener who hears this knows which changes were planned, which were forced, and what the evidence does not cover. That is what the format is for.

> **Warning: do not hide the failed stages.** Presenting only the final design removes the evidence of judgement the format exists to show. The failures found while building are the most useful part of the story, not an embarrassment.

---

## Key Takeaways

- Tell a technical audience the build as stages and pivots, because the failures show judgement.
- Follow the eight parts, giving the most care to why each pivot happened, and state results with what they do not prove.
- Call a stage change a pivot only when a documented failure forced it; label planned scope as planned.
- Fill every part from the project's record, and show the parts it does not document as gaps.

## Check Yourself

1. **Why show stages instead of one final design?**
   A final diagram hides the decisions that produced it. Stages show the failures and fixes, which is the evidence of judgement a technical listener wants.

2. **When does a stage change count as a pivot?**
   Only when a documented failure forced it. A change planned before anything broke is scope, and should be called that.

3. **In the Enterprise RAG platform, what forced the one structural change in the Databricks rebuild?**
   The search index would not build on a table with a row filter or column mask. That forced an ungoverned base table plus a governed view.

4. **How do you present the 22-of-22 pass result?**
   With its limits: 22 documents make strategy differences noise, the full table predates a configuration change, and scale is not demonstrated. The zero-leak result is what matters.

## References

**Sources:** The worked example uses the companion [Enterprise RAG platform](https://github.com/Sourav692/ai-engineering-demystified-14-projects/tree/db71e98600bf98c145b6172968da489e05220352/projects/03_enterprise_realtime_capstones/01_enterprise_rag_platform) at revision `db71e98`: [`README.md`](https://github.com/Sourav692/ai-engineering-demystified-14-projects/blob/db71e98600bf98c145b6172968da489e05220352/projects/03_enterprise_realtime_capstones/01_enterprise_rag_platform/README.md), [`INTERVIEW_SCRIPT.md`](https://github.com/Sourav692/ai-engineering-demystified-14-projects/blob/db71e98600bf98c145b6172968da489e05220352/projects/03_enterprise_realtime_capstones/01_enterprise_rag_platform/INTERVIEW_SCRIPT.md), [`INTERVIEW_SCRIPT_DATABRICKS.md`](https://github.com/Sourav692/ai-engineering-demystified-14-projects/blob/db71e98600bf98c145b6172968da489e05220352/projects/03_enterprise_realtime_capstones/01_enterprise_rag_platform/INTERVIEW_SCRIPT_DATABRICKS.md), [`docs/03-theory-databricks.md`](https://github.com/Sourav692/ai-engineering-demystified-14-projects/blob/db71e98600bf98c145b6172968da489e05220352/projects/03_enterprise_realtime_capstones/01_enterprise_rag_platform/docs/03-theory-databricks.md), [`docs/05-src-modules-reference.md`](https://github.com/Sourav692/ai-engineering-demystified-14-projects/blob/db71e98600bf98c145b6172968da489e05220352/projects/03_enterprise_realtime_capstones/01_enterprise_rag_platform/docs/05-src-modules-reference.md), [`docs/07-system-design-coverage-map.md`](https://github.com/Sourav692/ai-engineering-demystified-14-projects/blob/db71e98600bf98c145b6172968da489e05220352/projects/03_enterprise_realtime_capstones/01_enterprise_rag_platform/docs/07-system-design-coverage-map.md), `pyproject.toml` and `src/enterprise_rag/config.py`.

