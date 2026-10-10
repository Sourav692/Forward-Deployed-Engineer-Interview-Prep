# Let the Answers Change the Design

*More questions look thorough, but the signal is an answer that visibly moves a box on the whiteboard, so ask fewer and adapt out loud.*

◷ 4 min

The question count is not the signal; the adaptation is. Ask three or four of the questions from [Ask Before You Architect](/learn/orientation/first-ten-minutes/ask-before-you-architect), then say out loud how each answer changes the drawing.

**Objectives:**

- adapt the design out loud in response to an answer;
- map each question area to the part of the design it decides;
- place the opening routine inside a 60-minute round.

---

## Ask Three or Four, Not Twelve

Do not fire all twelve questions. Ask three or four, then let the answers change the design where the interviewer can see it.

> "Okay, if it's multi-tenant with per-user visibility, that changes how I'd structure this. Let me start from the access model rather than from the index."

An interviewer who watches a candidate ask a question, then draw the planned design anyway, learns that the questions are ritual. One who watches an answer move a box learns that the candidate listens.

## Map Each Area to the Design It Decides

The five areas line up with sections of the design drawn later. Read the table from the left when a question's purpose is unclear.

| Area | What it decides |
|---|---|
| Customer | Tenancy model, authoring surface, isolation level |
| Data reality | Ingestion design, freshness, connector strategy |
| Access and blast radius | Retrieval path shape, guardrail policy, approval gates |
| Scale and SLAs | Index architecture, caching, what breaks first |
| Definition of done | Evaluation plan, golden set, escalation path |

Twenty minutes in, with a row still unanswered, stop and ask it. A late question is better than an assumption.

## Fit the Opening Into the Round

The routine fills the first eight minutes of a 60-minute round. The rest of the round builds on it.

```
 0–8 min    clarify and scope        ← this routine
 8–12 min   entities and happy path
12–20 min   architecture
20–40 min   deep dive on the hardest part
40–55 min   cross-cutting, failure, scale
55–60 min   close deliberately
```

Eight minutes is a budget, not a minimum. The full method for the remaining fifty-two minutes belongs to the system design track.

> **Warning: architecting before asking is the common mistake.** A design drawn in minute two has already chosen a tenancy model, a retrieval path and an evaluation plan. Each of those is a guess until the matching area has an answer.

## Worked Example: One Answer, One Moved Box

The prompt is a document assistant. The candidate starts sketching a single index. Then they ask: "Does every user see every document, or does visibility vary by role or region?" The answer: it varies by region.

The candidate stops. "Then filtering after retrieval is both a quality and a security failure. I'll make the access model the first box and filter inside retrieval." The interviewer has just watched one answer change the shape of the retrieval path. That is the whole signal of the first ten minutes.

---

## Key Takeaways

- Ask three or four questions and say out loud how each answer changes the design.
- Each area decides a part of the design; if a row is still unanswered twenty minutes in, ask it.
- The opening routine takes the first eight minutes of a 60-minute round.

## Check Yourself

1. **Why is visibly adapting a stronger signal than asking more questions?**
   Questions followed by an unchanged drawing look like ritual. An answer that moves a box shows you listened.

2. **Which area decides the evaluation plan, the golden set and the escalation path?**
   Definition of done.

3. **How long does the opening routine get in a 60-minute round, and what follows it?**
   The first eight minutes. Then entities and the happy path, architecture, a deep dive, cross-cutting concerns and failure, and a deliberate close.

