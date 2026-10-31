# The Four Context Operations

*The context window is the only thing the model sees, but it is small, so every token in it should be there by decision rather than by default.*

Context engineering is not about writing a better prompt. It is about deciding what enters the model's window at each step, under a fixed token budget, and every technique for that reduces to four operations.

**Objectives:**

- define context engineering and say why it displaced prompt engineering;
- name the four context operations and the rule for each;
- explain why compression must be visible to the people running the system.

---

## Treat the Window as a Budget

At each step, the model decides using only what sits in its context window. The window has a fixed size. So filling it is a spending decision, made either on purpose or by accident.

Context engineering is making that decision on purpose. It took over from prompt engineering as the core skill because a structural decision outweighs a local one. Schema design displaced query tuning in databases for the same reason. A well-worded instruction cannot help if the evidence the model needs never reached the window.

## Learn the Four Operations

Every context strategy is some mix of four moves.

| Operation | What it does | Rule |
|---|---|---|
| Write | Keeps information outside the window: a scratchpad, run state, long-term memory | Write early |
| Select | Pulls in only what the current step needs | Select per step, not per run |
| Compress | Shrinks material that must stay but need not stay word for word | Choose deliberately what to lose |
| Isolate | Gives a subtask its own window and returns only its conclusion | The strongest and least used lever |

**Write early.** Anything not written outside the window is gone once a compaction pass removes it. It cannot be recovered afterwards.

**Select per step.** A tool result that mattered at step 2 is usually noise by step 7. Selecting once for the whole run carries that noise forward.

**Compress deliberately.** Compression always loses something, so pick what. Extracting into a structured record beats a prose summary, and a prose summary beats blind truncation.

**Isolate.** A subtask whose intermediate steps nobody needs later can run in its own window. [Context Rot and Sub-Agent Isolation](/learn/production-ai/context-engineering/context-rot-and-sub-agent-isolation) covers when and how.

## Make Compression Observable

Some frameworks compress automatically. The deep-agent summarisation middleware, for example, fires once history crosses a token or message threshold. Neither the user nor the agent triggers it. Old turns simply disappear from the message list, with no call in the application code to explain why.

That silence causes two opposite symptoms with one root cause. Cost and latency spike on long conversations. Or the agent forgets something said 40 turns ago. Log or trace the summarisation event itself. Do not assume the message count in state reflects the full history.

## Worked Example: A Ten-Step Investigation

The ops agent is asked why a config change failed. Over ten steps it reads logs, diffs two configs and checks a change calendar.

It *writes* the change ID and the user's goal to run state at step 1, so no compaction can lose them. At each step it *selects* only the log lines for the service it is checking now. When history grows, it *compresses* old steps into a structured record: service, finding, and timestamp. The change-calendar check needs dozens of lookups, so it *isolates* that subtask and receives one line back: "Change was outside the approved window."

Each operation answered a different question. What must survive? What does this step need? What can be lost? What can run elsewhere? Asking all four at every step is context engineering.

> **Warning: a compaction you cannot see is a bug nobody can find.** If compression runs without a trace event, a forgotten fact looks like a model failure. Instrument it before you need it.

---

## Key Takeaways

- Context engineering is choosing what enters a fixed-size window at each step, and it beats prompt wording because the structural choice dominates.
- Write early, select per step, compress deliberately and isolate subtasks whose intermediate steps are not needed later.
- Prefer structured extraction to prose summaries, and prose summaries to blind truncation.
- Automatic summarisation must emit a trace event, or its effects look like random forgetting.

## Check Yourself

1. **Name the four context operations.**
   Write, select, compress and isolate.

2. **Why "select per step" rather than once per run?**
   A result that mattered early is usually noise later, so a per-run selection carries stale material into every step.

3. **An agent's cost spikes on long conversations, and it also forgets early facts. What single cause fits both?**
   Automatic summarisation firing silently past a threshold. Trace the summarisation event to confirm.

