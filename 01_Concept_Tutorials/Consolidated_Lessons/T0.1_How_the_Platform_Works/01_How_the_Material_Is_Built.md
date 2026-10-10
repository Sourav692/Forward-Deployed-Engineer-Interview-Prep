# How the Material Is Built

*A reading list is easy to start and hard to finish, so this material is built as a sequence where each lesson assumes the one before.*

◷ 4 min

A handbook is not a reading list. Learn the three principles and the four levels first. Then [choose your path](/start): it marks which modules matter for your background and interview date.

**Objectives:**

- name the three principles behind the material and what breaks if each is dropped;
- place a topic on one of the four levels;
- use the fixed shape of a lesson to find what you need quickly.

---

## Start From Three Principles

The material is written for a reader with Python and a little experience of an LLM API. It aims to take that reader from "what is RAG?" to designing, building, securing and narrating an enterprise agentic system. Three principles shape it.

**Grounded in implementations.** Concepts point to working code in a companion course, pinned to one fixed revision. When a lesson says a check re-runs on every candidate, a function and a test exist to inspect. The Capstone build module explains how that companion revision is recorded.

**Problem before solution.** Every lesson opens with the failure the concept prevents. A reader who understands the failure can rebuild the solution under pressure. A reader who memorised the solution cannot.

**Honest about what is proven.** The source projects were built with a *coverage map*: for each claim, is it shown in code, or is it cheat-sheet knowledge? That discipline runs through every later track.

## Climb Four Levels, Not One Long List

The material is grouped into four levels. Each level is a plateau, so a reader can stop at any one and still hold a usable skill set.

| Level | What it adds | The question it answers |
|---|---|---|
| 1 · Foundations | Orientation, LLM systems, system design | Understand the two boxes: retrieve, and act |
| 2 · Building production systems | Robust agents, enterprise RAG, agent platforms | Make it correct, safe and evaluable for one customer |
| 3 · Scale, security, operations | Cross-cutting concerns, multi-agent systems, AgentOps | Make it survive many tenants, many documents and many months |
| 4 · Design mastery and the FDE role | Casebook, delivery, telling the story | Run the whole interview and the whole engagement |

Finishing Level 1 means explaining RAG and agents from first principles and holding a structured design conversation. Level 2 means building something an enterprise would run. Level 3 makes it survive scale and time. Level 4 makes the reader the person who leads the engagement and tells the story afterwards.

## Read Every Lesson the Same Way

Every source document follows one shape, so a reader always knows where they are. It opens with why the topic matters, then teaches the concept with diagrams, tables and code pointers. It closes with an interview lens, a pointer into the companion code, and a checkpoint.

Two of those closing parts deserve a word. The **interview lens** is kept on purpose. An interview is a compressed version of the real job: explain a design, defend its trade-offs, say what changes at ten times the scale. The sentences that carry an interview also carry a design review with a customer's security team.

The **checkpoint** is not a comprehension quiz. It holds the questions an interviewer or a senior colleague would ask. A question that cannot be answered from memory means reread; the next lesson assumes the answer.

> **Warning: memorising answers defeats the format.** The material opens with failures because a memorised solution does not survive a follow-up question. Read the "why this matters" part before the answer, every time.

## Worked Example: Reading One Lesson Under Time Pressure

Take a reader with an hour before a design round who opens a lesson on access control. They read the opening failure first: a permission check that fails silently. Then they skim the concept sections and stop at the interview lens, which gives the one line that carries the topic in a room. Finally they try the checkpoint questions without looking.

They fail one question. That is the signal to reread one section, not the whole lesson. The fixed shape turned an hour of reading into ten minutes of targeted review.

---

## Key Takeaways

- Three principles shape the material: grounded in code, problem before solution, and honest about what is proven.
- Four levels run from foundations to leading the engagement, and each one is a usable plateau.
- Every lesson has the same shape; the interview lens and the checkpoint are the parts to use under time pressure.

## Check Yourself

1. **What are the three principles, and what breaks if "problem before solution" is dropped?**
   Grounded in implementations, problem before solution, and honest about what is proven. Without the problem first, you memorise a solution you cannot rebuild when a follow-up changes the problem.

2. **A reader can explain RAG and agents from first principles and hold a structured design conversation. Which level have they finished?**
   Level 1, Foundations.

3. **Why is the interview framing kept rather than stripped out?**
   An interview is a compressed version of the job. The sentences that carry an interview also carry a design review with a customer's security team.

## References

**Sources:** `01_Concept_Tutorials/FDE_Handbook/00_Orientation/01_How_To_Use_This_Handbook.md`: "What this is", "The four levels", "Anatomy of a document" and "Checkpoint". `01_Concept_Tutorials/FDE_Handbook/00_Orientation/README.md`: the module checkpoint.
