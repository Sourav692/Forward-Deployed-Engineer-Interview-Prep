# Advanced Memory Architectures

*Richer memory structures answer harder questions or skip repeated work, but each adds a step that can misjudge what to keep or what to reuse.*

◷ 7 min

A fixed window and a key-value store cover most agents; these four architectures earn their cost only on specific questions. Learn each by the question it answers, building on the write and read rules in [Long-Term Memory: Write, Retrieve, and Forget](/learn/agentic-systems/memory-and-state/long-term-memory-write-retrieve-forget).

**Objectives:**

- explain MemGPT-style tiered memory, graph memory, skill libraries and Agent Workflow Memory in a sentence each;
- name the trade-off each makes against a simpler design;
- pick the right one for a given failure.

---

## Let the Model Page Its Own Context

A fixed sliding window keeps the last N messages by rule. MemGPT-style agents instead get tools to manage their own two-tier memory. **Core memory** is small and always visible. **Archival memory** is unbounded, like a disk, and older context is paged out to it.

The system prompt is rebuilt from the current core memory every turn. When the message window overflows, the oldest message is evicted to archival memory automatically. The model calls `archival_memory_search` itself when it needs something no longer visible.

```python
@tool
def core_memory_append(block: str, content: str) -> str:
    """Permanently remember something durable about the user or task."""
    main_context.core_memory[block] = (main_context.core_memory.get(block, "") + " " + content).strip()
    return f"Core memory[{block}] updated."

llm_with_tools = llm.bind_tools([core_memory_append, core_memory_replace, archival_memory_insert, archival_memory_search])
```

This is not a smarter retriever bolted on from outside. The model decides, mid-conversation, what is durable enough for core memory and what can be paged out.

| Option | Costs | Buys | Pick when |
|---|---|---|---|
| Fixed sliding window | Blind to which facts matter | Predictable, cheap, no extra tool calls | What must persist is predictable in advance |
| MemGPT self-editing tiers | Extra tool-call round trips; the model can misjudge what is durable | The agent separates durable facts from filler as it goes | What matters is unknown up front and depends on the conversation |

A fixed window bets that the last N messages are always the important ones. MemGPT bets that the model can tell the difference better than a fixed rule.

## Store Relations When Answers Need Several Hops

A flat memory store finds chunks that are textually similar to a question. Some questions need facts that no single chunk states together. Similarity search cannot join two facts that were never written side by side. Graph memory stores facts as `(subject, relation, object)` triples, so the agent can follow a chain of relations.

A memory-writer node uses structured output to turn conversational text into triples and adds them to a directed graph. A memory-reader node picks a starting entity, walks a bounded number of hops, and returns only the edges it walked as evidence.

```python
class ExtractedTriples(BaseModel):
    triples: list[Triple]     # (subject, relation, object)

memory_writer = llm.with_structured_output(ExtractedTriples)
# "Project Helios --built_by--> Atlas team", "Priya Chandran --leads--> Atlas team", ...
# traversal: Project Helios -> Atlas team -> Priya Chandran -> Marcus Webb (3 hops)
```

| Option | Costs | Buys | Pick when |
|---|---|---|---|
| Flat text or vector memory | Cannot chain relations that were never stated together | Simple; works with off-the-shelf embeddings | One retrieved chunk answers the question |
| Graph memory (triples plus traversal) | An extraction step, graph upkeep, harder to fit unstructured text | Multi-hop reasoning and an inspectable path instead of a similarity score | Answers combine facts never stated together |

## Worked Example: Who Manages the Team That Built Helios?

Ask "who manages the person who leads the team that built Project Helios?" Three separate facts answer it: Helios was built by the Atlas team, Priya Chandran leads the Atlas team, and Marcus Webb manages Priya Chandran. No sentence in memory contains all three.

A flat store returns the chunks that look most like the question, and none of them holds the whole chain. The graph reader starts at Project Helios and walks three edges: Helios to Atlas team, Atlas team to Priya Chandran, Priya Chandran to Marcus Webb. It returns those three edges as its evidence.

The notebook also lowers `max_hops` to 1. The agent then visibly admits the facts are insufficient instead of guessing. That is the case for graph memory in one sentence: the traversal path is a list of edges that can be printed and checked, not an opaque score.

## Remember Verified Skills, Not Just Facts

A Voyager-style agent remembers capabilities. Every solved sub-task becomes a persisted, named, tested Python function. Future tasks check the library before writing anything new.

A lookup step first asks whether an existing skill, or a composition of a few, already solves the task. Only on a miss does the agent generate new code. That code must pass sandboxed test cases before it joins the library.

```python
def solve_task(task_description):
    match = find_matching_skill(task_description, list_skills())   # reuse: true/false
    if match["reuse"]:
        return compose(match["skill_names"])          # zero new generation calls
    code = generate_new_skill(task_description)
    if verify_skill(code):                             # sandboxed exec + test cases
        add_skill(code)
    return code
```

In the notebook, task 3 was solved with zero new model calls by composing two existing skills. Task 4's newly generated function itself called two library skills. Composition compounds at both the orchestration layer and the generated-code layer.

## Reuse Workflows for Recurring Task Shapes

Agent Workflow Memory (AWM) sits between episodic memory and a skill library. Episodic memory remembers *that* something happened; a skill library remembers *code*. AWM remembers a generalised, reusable **sequence of tool calls** that solved a structurally similar task.

After a task succeeds, an abstraction step compresses the concrete tool-call trajectory into a template with placeholders such as `{entity}` and `{factor}`. Retrieval judges *structural* similarity to a new task. On a match, `adapt_and_execute` fills the placeholders and runs the whole plan in one model call, with no step-by-step re-planning.

```python
template = abstract_trajectory(trajectory)      # {"steps": [...], "placeholders": {"entity", "factor"}}
add_workflow(template)

matched = retrieve_workflow(new_task_description)     # structural match, or None
if matched:
    plan = adapt_and_execute(matched, new_task_description)   # one LLM call, full plan
else:
    plan = run_agent(new_task_description)          # fall back to step-by-step ReAct
```

A genuinely new task falls back to full step-by-step planning. If that succeeds, it can become a new template. So the library grows only on real repetition.

| Option | Costs | Buys | Pick when |
|---|---|---|---|
| Re-plan every task (plain ReAct) | Full multi-step reasoning on every call, repeats included | Always correct on genuinely new tasks | Task shapes rarely repeat |
| Reuse a workflow template or skill (AWM, Voyager) | Retrieval must judge structural similarity correctly, or it reuses the wrong plan | Near-zero extra generation on recurring task shapes | The same shape of task recurs with different values |

Workflow and skill memory pay off only on repetition. The honest pitch is "cheaper on the second occurrence", not "cheaper always".

> **Warning: a wrong match executes the wrong plan with full confidence.** A matched workflow runs in one shot instead of step-by-step tool calls. That means fewer hops, but a task that looks structurally similar and is not will run the wrong plan just as confidently. Add a fallback for a similar-but-wrong match, not only for no match.

## Pick the Architecture by the Question It Answers

| Question the agent keeps failing | Architecture to try first |
|---|---|
| What matters to keep is unknown until the conversation unfolds | MemGPT-style self-editing tiers |
| The answer needs two facts nobody wrote in the same sentence | Graph memory with bounded traversal |
| The agent rewrites the same code for a solved sub-task | Voyager-style verified skill library |
| The agent re-plans the same shape of task from scratch | Agent Workflow Memory templates |

All four change what is retrieved, not the model's weights. That makes them a cheaper lever than retraining when an agent keeps repeating work.

---

## Key Takeaways

- MemGPT-style agents edit their own core and archival memory, trading extra tool calls for model-judged durability.
- Graph memory stores triples so multi-hop questions get an inspectable traversal path instead of a similarity score.
- The Helios example needs three facts stated separately; only a traversal joins them.
- A Voyager-style skill library reuses verified code and generates only on a miss.
- Agent Workflow Memory reuses tool-call templates for recurring task shapes and falls back to full planning for new ones.
- Choose an architecture by the failure in front of you; each pays off only on its own kind of question.

## Check Yourself

1. **What did MemGPT add that a fixed sliding window lacks?**
   The model itself decides what is durable, through callable memory tools, and pages older context to archival memory it can search.

2. **When should you use graph memory instead of a vector store?**
   When an answer needs facts chained by relation that were never stated together, such as a three-hop management chain.

3. **What happens in an AWM system on a genuinely new task?**
   Retrieval finds no structural match, so the agent falls back to step-by-step planning; a success can then become a new template.

## References

**Sources:** `07_memory_and_state_INTERVIEW_TUTORIAL.md`: §1.9 "MemGPT-style tiered memory", §1.10 "Graph memory", §1.11 "Voyager-style skill libraries", §1.12 "Agent Workflow Memory"; §3 trade-offs "MemGPT self-editing memory vs. a fixed sliding window", "Graph memory vs. flat text/vector memory" and "Reusing a procedure/skill vs. re-planning from scratch every time"; §5.2 question 8 on workflow memory and termination.
