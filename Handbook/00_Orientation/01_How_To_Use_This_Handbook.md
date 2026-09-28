# How To Use This Handbook

> **Level** 🟢 Foundations · **Module** 00 · **Doc** 1 of 3 · **Time** ~10 min
> **Prerequisites:** none
> **Source material:** new for the handbook

## What this is

A handbook is not a reading list. It is a sequence in which each thing you learn is the thing the next section assumes. This one is built so that a reader with Python and a little LLM API experience can go from "what is RAG?" to designing, building, securing and narrating an enterprise agentic system — and can stop at any level with a coherent, usable skill set.

Three principles shaped it:

1. **Grounded in implementations.** Concepts in Levels 1–3 point to implementations at the immutable companion-course revision recorded in [`COMPANION_COURSE.md`](../../COMPANION_COURSE.md). When the text says "the post-check re-runs the full policy on every candidate", there is a function and test you can inspect without duplicating that source tree here.
2. **Problem before solution.** Every document opens with *why this matters* — the failure the concept prevents — before it explains the concept. If you understand the failure, you can reconstruct the solution under pressure. If you memorise the solution, you cannot.
3. **Honest about what is proven.** The source projects were built with a discipline called the *coverage map*: for every claim the design makes, is it demonstrated in code, or is it cheat-sheet knowledge? That discipline runs through the handbook and gets its own treatment in Module 11.

## The four levels

```
 🔴 LEVEL 4  Design Mastery & the FDE Role       09 Casebook · 10 Delivery · 11 Story
     ▲       "run the whole interview; run the whole engagement"
 🟠 LEVEL 3  Scale, Security, Operations         06 Cross-cutting · 07 Multi-agent · 08 AgentOps
     ▲       "make it survive many tenants, many documents, many months"
 🟡 LEVEL 2  Building Production Systems         03 Robust agents · 04 Enterprise RAG · 05 Agent platforms
     ▲       "make it correct, safe and evaluable for one customer"
 🟢 LEVEL 1  Foundations                         00 Orientation · 01 LLM systems · 02 System design
             "understand the two boxes: retrieve, and act"
```

Each level is a plateau. Finishing Level 1 means you can explain RAG and agents from first principles and hold a structured design conversation. Finishing Level 2 means you can build something an enterprise would run. Level 3 makes it survive scale and time. Level 4 makes you the person who leads the engagement and tells the story afterwards.

## Anatomy of a document

Every document has the same shape, so you always know where you are:

```
# Title
> Level · Module · Doc i of n · Time
> Prerequisites
> Source material

## Why this matters            ← the failure this prevents
## (concept sections)          ← diagrams, tables, code pointers
## Interview lens              ← how it is tested; the line that carries it
## In the code                 ← where it lives in the pinned companion revision
## Checkpoint                  ← can you answer these without looking?
**Next →**
```

Two of those sections deserve a word.

**Interview lens.** Most of this material was originally written to prepare for AI engineering and FDE design rounds. That framing has been kept deliberately: an interview is a compressed version of the real job — explain a design, defend its trade-offs, say what you would do at 10× scale — and the sentences that carry an interview are the sentences that carry a design review with a customer's security team.

**Checkpoint.** These are not comprehension questions. They are the questions an interviewer or a senior colleague would ask. If you cannot answer them from memory, re-read; the next document assumes you can.

## Three ways to read

**Linear.** Start at Module 00, end at Module 11. Roughly 35–45 hours of reading and interview practice. This is the right path if you are new to the field or want the complete picture.

**By role.** The [root README](../README.md) gives three tracks. They skip nothing essential; they reorder to reach your role's core material sooner. The FDE track, for example, goes to Module 02 (system design) and Module 10 (delivery) before the deep technical modules, because an FDE's first day is a scoping conversation, not a chunking strategy.

**By question.** You have a specific gap — "how does ABAC differ from RBAC?", "when is multi-agent justified?" — and want the answer. Use [Appendix A · Glossary](../99_Appendices/A_Glossary.md), which links every term to the document that explains it.

## Labs and implementation references

The dedicated FDE interview-labs module is included under
`FDE/Complete GEN AI FDE Interview System — Core + GenAI/11_HANDS_ON_LABS/`.
It contains the interview walkthroughs and production-architecture references that
belong to this course.

Broader runnable implementations—enterprise RAG, workflow platforms, multi-agent
systems, and the supporting notebooks and tests—remain in the AI Engineering
repository. Every implementation path in this handbook is relative to the pinned
revision in [`COMPANION_COURSE.md`](../../COMPANION_COURSE.md), not to this repository.

## What to bring

- Comfort reading Python, dataclasses, type hints and a `while` loop when following companion references.
- Having called an LLM API at least once is helpful, but not required for the interview-prep sequence.
- For Level 4: a real project of your own — the narrative module is far more useful when you apply the formats to something you actually shipped.

## Checkpoint

- What are the three principles that shaped the handbook, and what would break if each were dropped?
- Which material is included here, and which implementations remain in the pinned companion course?
- Why has the interview framing been kept rather than stripped out?

**Next →** [The Three Roles](02_The_Three_Roles.md)
