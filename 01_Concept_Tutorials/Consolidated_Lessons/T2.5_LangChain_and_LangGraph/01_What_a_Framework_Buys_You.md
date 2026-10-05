# What a Framework Buys You

*A framework writes the plumbing, but every layer it hides is a layer nobody can see when the hot path is slow or wrong.*

◷ 6 min

"Everyone uses it" is not a reason to adopt LangChain or LangGraph. Name what the framework adds, name what stays application code, and decide per pipeline whether the trade is worth it.

**Objectives:**

- say what LangChain, LlamaIndex and LangGraph are each for, in one line each;
- list what a framework gives you and what it never gives you;
- decide when to stay with a framework and when to write the pipeline yourself.

---

## Place Each Framework by Its Job

Three frameworks come up in almost every RAG or agent interview. They solve different problems. Pick by the shape of the job, not by popularity.

| Framework | Its job in one line | Reach for it when |
|---|---|---|
| LangChain | Connects loading, chunking, searching, prompting and answering behind one shared interface | The flow is a straight line of steps and you want ready-made integrations |
| LlamaIndex | Organises documents into rich nodes and retrieves from them well | Document question answering where retrieval accuracy is the hard part |
| LangGraph | Runs a workflow as a graph of nodes, edges and shared state | The flow branches, loops, pauses for a human or must survive a crash |

The GenAI Engineering notes put it as a rule of thumb. A flowchart with decision diamonds and arrows pointing backwards calls for LangGraph. If it is a straight line of boxes, a simple chain is enough. Many real systems combine them: LlamaIndex for indexing and retrieval, LangChain or LangGraph to orchestrate.

## Name What the Framework Adds

The FDE Handbook builds the same agent twice, once from scratch and once in LangGraph, over identical tools and safety code. Only the orchestration differs. That comparison shows exactly what the framework contributes.

It adds four things. State is declared, with reducers, so a list is never replaced by accident and state can be inspected between steps. Messages use the model's native format, so a real model slots in through tool binding and nothing else changes. Checkpointing persists state after every node, which gives crash recovery and human-in-the-loop pauses for free. And nodes compose: a node can itself be a graph.

LangChain's equivalent gain is one interface across every part. Retrievers, prompts, models and parsers all answer the same `invoke`, `batch` and `stream` calls. So FAISS can be swapped for Pinecone or Qdrant, or one model provider for another, without touching the rest of the pipeline.

## Name What Stays Application Code

A framework supplies a graph, not a guard. The step budget and the confirmation policy for risky tools are application code. So are the split between what to retry and what to fall back from, and the flag that marks a tool as destructive. They are the same code in a from-scratch loop and in a LangGraph graph.

Say this out loud in an interview. The weak answer to "why LangGraph?" is that people use it. The strong answer names the gains: declared state, the native tool-call message shape and checkpointing. Then it names what the team still owns: the budget and the confirmation policy.

> **Warning: a framework will not stop a runaway loop for you.** LangGraph follows a backward edge for as long as the routing function keeps choosing it. Its default recursion limit is a safety net, not a design. Write the iteration guard by hand, in every framework.

## Count the Cost at Scale

LangChain is strong for prototypes and costs more as traffic grows. The GenAI Engineering notes list six pains in large production systems.

| Pain | What it looks like |
|---|---|
| Hidden work | High-level chains hide what is slow or wrong, so debugging means reading library internals |
| Extra overhead | Wrapper objects on every call add latency |
| Changing API | Code breaks across versions (v0.0.x, v0.1.x, v0.2.x), so upgrades are risky |
| Little fine control | Custom scoring or unusual flows lead to subclassing and monkey-patching |
| Hard debugging | Deep stack traces, and observability needs extra callback setup |
| Dependency bloat | Many packages installed even when only a few are used |

The usual answer is staged. Prototype with the framework. Then replace the busy hot path with lean custom code where the numbers demand it.

## Decide Per Pipeline, Not Per Company

Go custom when latency is strict and wrapper overhead is unaffordable. Go custom when retrieval logic is bespoke, such as in-house scoring or multi-stage filtering that fights the framework. Go custom at high volume, when exact control over tokens and calls drives cost. Go custom when the team already knows the provider and vector-store SDKs well, or when a breaking change in a core dependency is unacceptable.

Keep the framework for fast prototypes, standard pipelines and small teams whose needs the ready-made integrations already cover. Unusual flows with parallel retrieval, human approval or loops are better in LangGraph or plain code than forced into a linear chain.

## Worked Example: Choosing for a Support Assistant

A customer wants a support assistant. Version one answers policy questions: retrieve, prompt, generate, return. That is a straight line, so a LangChain chain is enough, and its integrations get a demo running in a day.

Version two must rewrite a weak query and search again, and it must pause before issuing a refund. Now the flowchart has a decision diamond, a backward arrow and a pause. That is LangGraph's shape: a conditional edge for the retry, a checkpointer so the pause survives a restart, and an interrupt before the refund tool.

Version three serves heavy traffic, and profiling shows the retrieval wrapper is the slow step. Replace that one hot path with direct SDK calls and keep the graph around it. The framework decision was made three times, once per pipeline shape, and each time the deciding question was what the flow looks like and what it costs.

---

## Key Takeaways

- LangChain composes linear pipelines, LlamaIndex specialises in indexing and retrieval, and LangGraph runs branching, looping, pausable workflows.
- LangGraph adds declared state, native message shapes, checkpointing and composable nodes; LangChain adds one shared interface across every part.
- The step budget, confirmation policy, retry-versus-fallback split and destructive flags stay your code in any framework.
- At scale, hidden work, overhead, version churn, weak fine control, hard debugging and dependency bloat push teams to custom hot paths.
- Decide per pipeline: straight lines suit a chain, diamonds and backward arrows suit a graph, and strict latency or bespoke retrieval suit plain code.

## Check Yourself

1. **An interviewer asks "why LangGraph?". Give the strong answer.**
   It gives declared state with reducers, the model's native tool-call message shape, and checkpointing for pause and resume. It does not give a step budget or a confirmation policy; those are still my code, identical to a from-scratch loop.

2. **Name three signs a pipeline should leave LangChain for custom code.**
   Any three of: strict latency that cannot afford wrapper overhead, bespoke retrieval logic that fights the framework, high volume where exact token and call control drives cost, a team fluent in the raw SDKs, or no tolerance for breaking changes in a core dependency.

3. **What is the flowchart rule of thumb for chain versus graph?**
   Decision diamonds and arrows pointing backwards mean a graph. A straight line of boxes means a chain is enough.

## References

**Sources:** `05_Same_Loop_In_LangGraph.md` (FDE Handbook): "Why this matters", "What the framework buys you" and "Interview lens". `Module_02_RAG_Frameworks_Tools_Implementation.md`: Overview; Topic 1 "What goes wrong when using LangChain in big production systems?" and "When should I skip LangChain and build my own pipeline?"; Topic 2 "How is LlamaIndex different from LangChain in design?"; Topic 5 "When should I choose LangGraph over plain LangChain for production RAG?". `03_langgraph_fundamentals_INTERVIEW_TUTORIAL.md`: §2 "A cycle with no iteration guard loops forever".
