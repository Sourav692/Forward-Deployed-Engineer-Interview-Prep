# Context Rot and Sub-Agent Isolation

*More context feels safer, but accuracy falls as the window fills, so giving subtasks their own window trades auditability for quality and cost.*

A fuller window is not a better-informed model. Keep the parent's context small by isolating subtasks, and keep their traces so nothing becomes unexplainable; [Deterministic Context Assembly](/learn/agentic-systems/context-engineering/deterministic-context-assembly) covers the layout this protects.

**Objectives:**

- explain context rot and why the middle of the window suffers most;
- decide when to isolate a subtask and when to share context;
- name what isolation costs and how to pay for it.

---

## Expect Accuracy to Fall as the Window Fills

Model accuracy drops as the context window fills. The drop is uneven. Information in the middle of the window is recalled less reliably than information near either end.

So a run given three well-chosen observations often beats the same run given twelve. Extra material is not free even when it fits: it pushes useful content toward the middle and dilutes it.

## Isolate Subtasks Whose Workings Nobody Needs

Picture three research subtasks run in one shared context. The parent accumulates tens of thousands of tokens of intermediate steps. It then resends all of them on every later step.

Run the same subtasks in isolation instead. Each gets its own window. The parent receives one short conclusion from each and grows by about 1,000 tokens in total. On a real ten-step run, isolation typically cuts billed input tokens by an order of magnitude.

Isolate when a subtask's intermediate steps are not needed downstream. That is the common case for research, verification and extraction. Share context only when steps must reason across each other's intermediate results. That is rarer than it feels.

## Keep the Sub-Agent's Trace

Isolation gives up one thing: auditability across the boundary. The parent sees a conclusion, not the reasoning. If that conclusion is wrong, nothing in the parent's context explains why.

Store each sub-agent's full trace and link it from the parent's span. The wrong conclusion is then one click from its cause.

## Worked Example: The Agent That Dropped Its Policy at Step Nine

This incident involves the same internal ops agent with write access to a configuration service.

On short runs it behaved correctly. Past about eight steps, it began approving changes its own policy forbade. These included production edits outside the approved change window.

The context builder truncated from the front once the total grew too long. The safety policy sat at the front. By step nine the policy had been cut entirely. The model was then a general assistant holding production credentials.

The test suite used only short scenarios, so every test passed. The bug lived only in runs long enough to trigger compaction.

The fix had four parts. The context was assembled in sections, with the instructions marked non-evictable. Eviction happened only inside sections. An assertion checked that every rendered context contained the policy hash. A new standing rule required any agent with write access to be tested on runs that deliberately exceed the compaction threshold.

The incident shows why both lessons matter together. Long runs are exactly where context rot and truncation bite. They are also where short test suites never look.

> **Warning: short evaluations hide long-run failures.** If every scenario finishes before compaction starts, the eviction path is never exercised. Test agents with write access on runs that cross the threshold on purpose.

---

## Key Takeaways

- Accuracy degrades as the window fills, and the middle suffers most, so fewer well-chosen observations can beat more.
- Isolate subtasks whose intermediate steps are not needed later; it can cut billed input tokens by an order of magnitude.
- Isolation costs auditability, so store each sub-agent's trace and link it from the parent's span.
- Long runs need their own tests, with assertions that the policy survives compaction.

## Check Yourself

1. **Why can three observations beat twelve?**
   Accuracy falls as the window fills, and material in the middle is recalled less reliably, so extra observations dilute the useful ones.

2. **When should a subtask share the parent's context instead of being isolated?**
   Only when steps must reason across each other's intermediate results.

3. **An agent behaves well on short runs and breaks policy on long ones, while every component tests clean. What do you check first?**
   Reconstruct exactly what the model saw at the failing step, then check whether instructions were evicted, then consider context rot.

