# The Technical Implementation Flow

*A design that worked first time is easy to present, but a technical listener learns more about judgement from the designs that failed.*

◷ 4 min

A technical peer does not want the pitch. They want the evolution: what was tried, why it broke, and why each tool won. Tell the build as a sequence of stages and pivots, not as a finished diagram.

**Objectives:**

- give the eight-part structure of an implementation flow;
- explain why the flow shows stages and pivots instead of one up-front design;
- state results honestly, including what to verify next.

---

## Tell the Build as Stages, Not a Final Diagram

The implementation flow serves a technical audience that wants the architecture's evolution. A single final diagram hides the decisions that produced it. A sequence of stages shows them.

Why three stages, not one design up front? Because the first design failed in real testing, and the second pivot happened for a different reason than the first. That shows iterative judgement, not a plan that happened to work first time.

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

Part 3 carries the most judgement. A pivot explained as "we needed a better model" says little. A pivot explained as an architectural fix for a named failure says a lot.

## State Results Honestly

Part 8 follows the habits in [Proof versus Knowledge](02_Proof_versus_Knowledge.md): give each result with what it does not prove, such as an adoption increase reported as a correlational signal, not a controlled experiment.

## Worked Example: Filling In the Structure

Take a governed multi-agent data assistant built in a fixed time box, and fill in the parts as a template. The details below are placeholders for a real project, using the two failure types the handbook names.

Suppose the first design fails in real testing on context bloat. Part 3 names that failure and the architectural change that fixed it. Suppose the second pivot happens for a different reason, tool confusion. Part 3 names that one too, with its own fix. Neither fix is "we switched to a better model".

Part 4 then explains why each tool won, against what alternatives, in a requirement-and-fit table. Part 6 names the managed feature or legacy API the build could not use and what was traded. Part 8 reports any adoption increase as correlational.

A listener who hears this knows how the speaker reasons when a design breaks. That is what the format is for.

> **Warning: do not hide the failed stages.** Presenting only the final design removes the evidence of judgement the format exists to show. The failed first design is the most useful part of the story, not an embarrassment.

---

## Key Takeaways

- Tell a technical audience the build as stages and pivots, because the failures show judgement.
- Follow the eight parts, giving the most care to why each pivot happened.
- State every result with what it does not prove, and name what to verify next.

## Check Yourself

1. **Why show three stages instead of one design up front?**
   The first design failed in real testing and the second pivot happened for a different reason. That shows iterative judgement rather than a plan that worked first time.

2. **What should the "why each pivot happened" part contain?**
   The specific failure, such as context bloat or tool confusion, and why the fix was architectural rather than a better model.

3. **How should a post-rollout adoption increase be reported?**
   As a correlational signal, not a controlled experiment, and said exactly that way if pressed.

## References

**Sources:** `01_Deep_Dive_And_Conversational_Formats.md` (FDE Handbook, Telling the Story): "Format 3 — The technical implementation flow" and "Choosing the format". The worked example follows the stages and failures that section names; the insurer and lender flows themselves are kept privately, outside the repository.
