# How the Material Is Built

*A reading list is easy to start and hard to finish, so this material is built as a sequence where each lesson assumes the one before.*

◷ 5 min

If you have not picked a path yet, start at [Choose your path](/start); this lesson explains what you will find once you do. It covers the three principles behind the material, the nine topic groups that hold the Learn tracks, and the fixed shape every lesson follows. The path marks which modules are required, recommended or optional for your background and interview date.

**Objectives:**

- name the three principles behind the material and what breaks if each is dropped;
- place a topic in one of the nine topic groups, and know where to practise it;
- use the fixed shape of a lesson to find what you need quickly.

---

## Start From Three Principles

The material is written for a reader with Python and a little experience of an LLM API. It aims to take that reader from "what is RAG?" to designing, building, securing and explaining an enterprise agentic system. Three principles shape it.

**Grounded in implementations.** Concepts point to working code. The retrieval and agent tracks come from the RAG & Agents Engineering course, and each lesson links to its notebooks on GitHub. The capstone builds from one fixed revision of that code, and the [Build From a Pinned Revision](../T9.1_Capstone_Build/02_Build_From_a_Pinned_Revision.md) lesson explains how that revision is recorded.

**Problem before solution.** Every lesson opens with the failure the concept prevents. A reader who understands the failure can rebuild the solution under pressure. A reader who memorised the solution cannot.

**Honest about what is proven.** The projects behind the material were built with a *coverage map*: for each claim, is it shown in code, or is it cheat-sheet knowledge? That discipline runs through every later track.

## Find a Topic in Nine Groups

The Learn page sorts every track into nine topic groups, one per discipline. Track codes run T0, T1, T2 and onwards in the same order, so a lower code usually comes earlier in a path.

| Group | What it covers |
|---|---|
| Start here | The FDE role, then programming, APIs, data and deployment |
| AI Engineering | LLM applications, retrieval pipelines and agents, from the first prompt to multi-agent systems |
| Production AI Engineering | Proving an AI system works, keeping it safe and running it in production |
| Harness Engineering | The runtime around an agent: the loop, its tools and the checks that keep it on task |
| Inference Engineering | Serving models quickly and cheaply on real hardware |
| AI System Design | Turning a vague brief into an architecture you can defend in an interview |
| Forward Deployed Engineering | Scoping the work with a customer, delivering it and getting it adopted |
| Coding | The coding rounds, including the AI-assisted format |
| Career | Your stories, your portfolio and the offer |

A group with no tracks yet shows as Coming soon, with the topics it will cover. Each group page lists its tracks with filters for your path's requirements and your progress. A group is only a way to find tracks: your progress belongs to the track, so it stays put if a track moves group.

Learn teaches. Three other areas are for practice:

- **Interview** follows the rounds of a real loop, from the recruiter screen to the demo or take-home. Each round lists what it tests, the Learn modules to study first and its mock interviews.
- **Practice** holds write-first worksheets: you draft your own answer before you open the key.
- **Casebook** holds the full system designs, each with an interview guide, a technical deep dive and a quick review.

## Read Every Lesson the Same Way

Every lesson follows one shape, so a reader always knows where they are. It opens with the failure the topic prevents. The middle teaches the concept with diagrams, tables and code. It closes with Key Takeaways and Check Yourself. Retrieval and agent lessons add a line linking their notebooks, and each of their modules ends with an interview-questions lesson.

Two of those parts deserve a word. **Key Takeaways** holds the three or four sentences that carry the topic in a room. An interview is a compressed version of the real job: explain a design, defend its trade-offs, say what changes at ten times the scale. The sentences that carry an interview also carry a design review with a customer's security team.

**Check Yourself** holds the questions an interviewer or a senior colleague would ask, and each answer stays hidden until you open it. A question you cannot answer from memory means reread; the next lesson assumes the answer.

> **Warning: memorising answers defeats the format.** The material opens with failures because a memorised solution does not survive a follow-up question. Read the opening failure before the answer, every time.

## Worked Example: Reading One Lesson Under Time Pressure

Take a reader with an hour before a design round who opens a lesson on access control. They read the opening failure first: a permission check that fails silently. Then they skim the concept sections and stop at Key Takeaways, which give the lines that carry the topic in a room. Finally they try the Check Yourself questions before opening the answers.

They fail one question. That is the signal to reread one section, not the whole lesson. The fixed shape turned an hour of reading into ten minutes of targeted review. With the time left, they open the matching interview round and try one of its worksheets.

---

## Key Takeaways

- Three principles shape the material: grounded in code, problem before solution, and honest about what is proven.
- Learn sorts its tracks into nine topic groups; Interview, Practice and the Casebook are where you rehearse what Learn teaches.
- Every lesson has the same shape; Key Takeaways and Check Yourself are the parts to use under time pressure.

## Check Yourself

1. **What are the three principles, and what breaks if "problem before solution" is dropped?**
   Grounded in implementations, problem before solution, and honest about what is proven. Without the problem first, you memorise a solution you cannot rebuild when a follow-up changes the problem.

2. **You want to learn how to evaluate a retrieval pipeline, then rehearse explaining the design. Where do you go?**
   The Production AI Engineering group in Learn for the evaluation lessons (the AI Engineering group teaches the pipeline itself), then the AI system design round in Interview, or a case in the Casebook, to rehearse.

3. **Why is the interview framing kept rather than stripped out?**
   An interview is a compressed version of the job. The sentences that carry an interview also carry a design review with a customer's security team.

## References

**Sources:** `01_Concept_Tutorials/FDE_Handbook/00_Orientation/01_How_To_Use_This_Handbook.md`: "What this is", "Anatomy of a document" and "Checkpoint". `01_Concept_Tutorials/FDE_Handbook/00_Orientation/README.md`: the module checkpoint. The topic groups and areas follow the site's Learn, Interview, Practice and Casebook pages.
