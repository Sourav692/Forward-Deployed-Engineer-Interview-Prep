# The Six-Step Whiteboard Clock

*Covering every part of a design evenly feels thorough, but a timed round rewards spending most of the clock on the one part that matters.*

◷ 7 min

The twelve-part framework is complete but not timed, and a 60-minute round punishes completeness without priority. Write a six-step budget on the board before speaking, then use the first twenty minutes to frame, anchor and draw, as this lesson shows, so that [the deep dive and the close](02_Deep_Dive_Failure_Modes_and_the_Close.md) get the time they need.

**Objectives:**

- write the six steps and their minute ranges from memory;
- open a round with one framing sentence, explicit scope and a concrete anchor case;
- narrate the happy path before drawing, and draw two labelled flows in eight minutes.

---

## Budget the Hour Before Saying Anything

Candidates who cover all twelve framework parts evenly spend eight minutes on the one thing that mattered and run out of time before the failure modes. The fix is a clock. The casebook's four full whiteboard scripts were all written to the same six steps, and the method below extracts them so they apply to an unseen prompt. Write it in the corner of the board first.

| Minutes | Step | What it produces |
|---|---|---|
| 0–8 | 1. Clarify and scope | The questions that change the design; explicit scope and assumptions; a concrete anchor case |
| 8–12 | 2. Entities and the happy path | The nouns; one request narrated end to end in words |
| 12–20 | 3. Architecture | Two flows drawn, offline and online, every arrow labelled |
| 20–40 | 4. Deep dive | The hardest part, announced as such, with the strongest single insight |
| 40–55 | 5. Cross-cutting, failure, scale | Multi-tenancy, security, observability, evaluation, what degrades, what breaks first at 10×, all raised unprompted |
| 55–60 | 6. Close deliberately | A three-sentence summary; top three trade-offs and what would change your mind; the forward-deployed close |

The asymmetry is the point. The deep dive gets twenty minutes; entities get four. Still drawing boxes at minute 25 means the deep dive's time went on the architecture.

The sources disagree slightly on the exact minutes. The method above gives architecture 12–20 and the deep dive 20–40. The scripts' own budgets fold entities into the architecture at 8–15, run the deep dive 15–35, and split cross-cutting concerns (35–45) from failure and scale (45–55). The shape is the same in both: a short opening, a long deep dive, cross-cutting concerns raised unprompted, and a five-minute close.

## Frame the Round in One Sentence

Do not draw anything in step 1. Ask the clarifying questions out loud and write the answers where they stay visible. Then say one sentence, in the first two minutes, that names the real difficulty and sets up every later decision. For enterprise RAG it reads like this:

> *"Anyone can build multi-source RAG. The thing that makes this hard is that a Tier-1 agent, a Tier-3 engineer and an account manager must get different correct answers to the same question — so access control isn't a feature I add at the end, it decides the shape of the retrieval path."*

Each script has its own. For the agent platform the sentence is about trust rather than mechanics. For the delivery framework it is that two weeks is only possible if the work existed before the customer arrived. Find the sentence for the prompt before touching the board. A prompt whose difficulty cannot be named in one sentence has not yet been understood.

## Scope Out Loud and Anchor on One Case

Scope explicitly and state the assumptions. For example: "I'm designing for read-only Q&A over six sources with attribute-based access, multi-tenant, sub-3-second latency. I'm explicitly descoping write actions and streaming ingestion — happy to return to those." Interviewers score this as scope control, not ignorance.

Then anchor on a concrete case. Every script names a fictional customer, a small set of sources and one question that drives the whole design. Each also draws a table early showing how the answer differs by persona. That table becomes the requirement everything else is justified against.

> **Warning: drawing before framing spends the clock on the wrong system.** A diagram started in minute two is built without the question that shapes it. Hold the pen until the framing sentence, the scope and the anchor table are on the board.

## Narrate the Happy Path Before Drawing

Step 2 takes four minutes. Write the nouns before the boxes:

```
Tenant · Principal · Group · Document · Chunk · ACL · Query · Run · Trace · Citation
```

Then narrate one request end to end in words, still before drawing:

> *"A Tier-3 engineer asks about the March incident. We resolve their identity from the IdP. We compile that into a filter. We search only the slice they're allowed to see. We re-check the policy on what came back. We rerank to the best six. We check it's sufficient. We generate with citations. We verify every citation. Then we answer."*

The narration exposes every component about to be drawn. It also lets the interviewer redirect the answer before ten minutes go on the wrong box.

## Draw Two Labelled Flows in Eight Minutes

Step 3 draws two flows: usually an offline one, such as ingestion or a pipeline's setup phase, and an online one per request. Label every arrow. Then say the one or two sentences per flow that show judgement.

For the RAG scripts those sentences are "the connector's real job is translating each source's permission model into ours" and "authorize is first, enforce runs before the model sees anything — I encode that ordering in the graph's edges, not in a code convention someone can forget." Eight minutes is enough for two flows if they are not decorated. Save the detail for the deep dive.

## Worked Example: The First Twenty Minutes of Enterprise RAG

Minute 0: the clock goes in the corner. Minutes 1 to 2: the framing sentence about different correct answers for different personas. Minutes 2 to 6: questions about users, sources, sensitivity, regulation, scale, latency, actions and the cost of a wrong answer. Minutes 6 to 8: the scope statement and the persona table for one question about one customer's incident.

Minutes 8 to 12: the nouns, then the narrated request from identity to verified citation. Minutes 12 to 20: an ingestion flow and a query flow with every arrow labelled, plus the sentence about connectors and the one about ordering in the graph.

At minute 20 the interviewer has heard the difficulty, the scope, the requirement table and both flows. Nothing has been decorated. All twenty deep-dive minutes are still available for access control, the part the framing sentence promised.

---

## Key Takeaways

- Write a six-step clock first; the deep dive gets twenty minutes and entities four.
- One framing sentence in the first two minutes names the real difficulty; without it the prompt is not yet understood.
- State scope and assumptions, then anchor on one customer, one question and a persona table.
- Write the nouns and narrate one request in words before drawing anything.
- Draw two flows with every arrow labelled and one or two judgement sentences each.

## Check Yourself

1. **What are the six steps and their minute ranges?**
   Clarify and scope 0–8; entities and the happy path 8–12; architecture 12–20; deep dive 20–40; cross-cutting, failure and scale 40–55; close 55–60.

2. **What does the framing sentence do?**
   It names the real difficulty in the first two minutes and sets up every later decision, such as access control deciding the shape of the retrieval path.

3. **Why narrate the request before drawing it?**
   It exposes every component to be drawn and lets the interviewer redirect before ten minutes are spent on the wrong box.

## References

**Sources:** `01_Concept_Tutorials/FDE_Handbook/02_System_Design_Fundamentals/05_The_60_Minute_Whiteboard_Method.md`: "Why this matters", "The six steps and the clock", "Step 1 — Clarify and scope", "Step 2 — Entities and the happy path" and "Step 3 — Architecture". `02_System_Design_Case_Studies/Classic_Design_Walkthroughs/Handbook_Casebook/whiteboard_scripts/01_Enterprise_RAG_With_Access_Control.md`: "Before you start" (time budget) and Step 1 questions, used for the worked example.
