# T4.3 Frameworks: LangChain and LangGraph: Consolidated Lessons

These eight lessons are the site's teaching copy of module T4.3 "Frameworks: LangChain and LangGraph". Each concept is taught once, in the house tutorial format, drawing only on four repository sources. The site publishes them at `/learn/llm-and-retrieval/langchain-and-langgraph`.

| # | Lesson | Site slug |
|---|---|---|
| 1 | [What a Framework Buys You](01_What_a_Framework_Buys_You.md) | `what-a-framework-buys-you` |
| 2 | [Composing Pipelines with LangChain](02_Composing_Pipelines_with_LangChain.md) | `composing-pipelines-with-langchain` |
| 3 | [Indexing and Retrieval with LlamaIndex](03_Indexing_and_Retrieval_with_LlamaIndex.md) | `indexing-and-retrieval-with-llamaindex` |
| 4 | [Modelling Workflows as State Graphs](04_Modelling_Workflows_as_State_Graphs.md) | `modelling-workflows-as-state-graphs` |
| 5 | [The Tool-Calling Loop in LangGraph](05_The_Tool_Calling_Loop_in_LangGraph.md) | `the-tool-calling-loop-in-langgraph` |
| 6 | [Checkpoints, Interrupts, and Human Approval](06_Checkpoints_Interrupts_and_Human_Approval.md) | `checkpoints-interrupts-and-human-approval` |
| 7 | [Retries, Fan-Out, and Streaming](07_Retries_Fan_Out_and_Streaming.md) | `retries-fan-out-and-streaming` |
| 8 | [Practise Framework Interview Questions](08_Practise_Framework_Interview_Questions.md) | `practise-framework-interview-questions` |

## Sources

- `01_Concept_Tutorials/RAG_and_Agent_Topic_Guides/01_langchain_foundations_INTERVIEW_TUTORIAL.md` (own material; its §4 answers cite external interview guides, and the one lesson that uses them summarises the ideas in our own words and carries a credit line).
- `01_Concept_Tutorials/RAG_and_Agent_Topic_Guides/03_langgraph_fundamentals_INTERVIEW_TUTORIAL.md` (own material; the same note applies to its §4).
- `01_Concept_Tutorials/FDE_Handbook/01_LLM_Systems_Foundations/05_Same_Loop_In_LangGraph.md` (own material).
- `01_Concept_Tutorials/GenAI_Engineering_Modules/Module_02_RAG_Frameworks_Tools_Implementation.md`, Topics 1 (LangChain), 2 (LlamaIndex) and 5 (LangGraph) (own material). Its Topic 3 on vector databases belongs to T6.2 and its Topic 4 on evaluation is not taught here.

The source files stay in the repository unchanged. The site no longer publishes the first three as separate lessons; old URLs redirect to the matching lesson here.

Every claim, number and code idea in these lessons comes from the four sources. Each lesson ends with a Sources line naming the sections it used. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.
