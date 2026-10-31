# Deterministic Context Assembly

*A context that is rebuilt freely each step adapts to anything, but only a fixed layout can be cached, reconstructed and protected from losing its own instructions.*

The order of a prompt is not cosmetic. Assemble each step's context in fixed sections with fixed budgets, and apply the four operations from [The Four Context Operations](/learn/production-ai/context-engineering/the-four-context-operations) inside those sections only.

**Objectives:**

- lay out a sectioned context with a budget per section;
- explain what a fixed order buys for caching and debugging;
- trim an overflowing section without losing instructions.

---

## Assemble in Fixed Sections With Fixed Budgets

Build every step's context in the same section order. Give each section its own token budget. When something must go, cut inside a section, never across the whole window.

Here is the ops agent's layout, top to bottom.

| Order | Section | Budget | Can it be evicted? |
|---|---|---|---|
| 1 | System instructions and policy | Fixed, 800 tokens | Never |
| 2 | Tool schema, filtered to this caller | Fixed, 1,200 tokens | No, fixed |
| 3 | Durable facts and user profile | Up to 600 tokens | Within its cap |
| 4 | Retrieved evidence for this step | Up to 5,000 tokens | Within its cap |
| 5 | Compressed summary of history | Up to 1,500 tokens | Within its cap |
| 6 | Recent turns, word for word | Up to 3,000 tokens | Within its cap |
| 7 | The current goal, restated | Fixed, 200 tokens | Never |

## Order the Stable Parts First for Caching

Providers can cache a prompt prefix only when it is byte-identical across requests. Put the instructions and the tool schema first, and never insert anything above them. A large share of input tokens then becomes cheap cache hits.

A single changing token near the top breaks the match for everything below it. So the stable sections go first, and the per-step sections go after.

## Use the Fixed Order to Reconstruct Any Step

A deterministic assembler is also a debugging tool. Given the trace, it can rebuild exactly what the model saw at any step. A question like "why did it do that?" becomes something to read, not something to guess.

## Trim Inside a Section, Leaving a Marker

When a section exceeds its cap, trim proportionally inside that section. Leave an explicit marker such as "[...240 tokens omitted...]". The model, and anyone reading the trace, can then see that content existed and was cut. Never let content vanish as though it was never there.

## Worked Example: Retrieval Overflows on One Step

On a long step, the ops agent's retriever returns more evidence than the 5,000-token cap allows.

A global rule would cut from the front of the whole window until it fits. Instead, the assembler trims only the evidence section. It trims proportionally inside that section and leaves a marker such as "[...240 tokens omitted...]". The policy, the tool schema and the restated goal are untouched. The prefix stays byte-identical, so it still hits the cache.

Overflow is now a local event with a visible footprint, not a silent change to what the agent is allowed to do.

> **Warning: global truncation deletes your instructions.** The most common context bug is "if too long, drop from the front". The system instructions live at the front. A long run then quietly loses its policy, its tool guidance and its safety rules, and becomes a general assistant holding production credentials. Being careful does not fix this; structure does. Mark the instructions and the current goal as non-evictable, and evict only inside the other sections.

---

## Key Takeaways

- Build each step's context in a fixed section order, with a fixed token budget per section.
- Stable sections first make the prefix byte-identical, which makes it cacheable.
- A deterministic assembler lets you reconstruct exactly what the model saw at any step from the trace.
- Trim inside an overflowing section with an explicit omission marker, and never evict instructions or the current goal.

## Check Yourself

1. **Why do the instructions and tool schema go first?**
   Prefix caching needs a byte-identical prefix, and those two sections are the stable ones.

2. **Which two sections in the layout are never evicted?**
   The system instructions and policy, and the restated current goal.

3. **What does "drop from the front when too long" do to a long-running agent?**
   It deletes the system instructions first, so the agent loses its policy and safety rules while keeping its credentials.

