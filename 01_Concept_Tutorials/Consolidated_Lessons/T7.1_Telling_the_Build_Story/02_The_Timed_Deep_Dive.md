# The Timed Deep-Dive

*A fixed slot rewards a tight script, but a senior listener remembers the governance and the honesty, not the architecture detail rushed in to fill the slot.*

◷ 5 min

A deep-dive is not a lecture with questions at the end. It is a speakable script with a timing budget, two passes at the hard part, and prepared material that is never read aloud. Read [Three Formats for One Project](01_Three_Formats_for_One_Project.md) first for when to choose it.

**Objectives:**

- give the timing budget and say which segment is weighted heaviest, and why;
- deliver the Action beat in two passes and decide when to give the second;
- prepare the two appendices that sit behind the script.

---

## Budget Fifteen Minutes, Then Stop

Plan roughly fifteen minutes of talking with room to be interrupted. The last three to five minutes are questions, not more script. A script that fills the whole slot leaves no room for the listener to steer.

| Segment | Time | What it does |
|---|---|---|
| 1 · The hook | 0:30 | One sentence, zero jargon, that the listener remembers if they remember nothing else. Say it, then pause |
| 2 · STAR narrative | 3:30–4:00 | Situation in plain English; Task, meaning what the speaker personally owned and their bar for "done"; Action in two passes; Result, business framing first and numbers second |
| 3 · Technical development | 2:30–3:30 | The "if they want more" branch. Business framing for each sub-point, then depth only as far as the conversation wants |
| 4 · Governance and security | 3:00–3:30 | Weighted heaviest for a senior or enterprise audience |
| 5 · Deployment and platform reality | 1:30–2:00 | What the platform taught that generalises, and the bridge to the listener's world, said out loud |
| 6 · Honest limitations | 0:45 | Before they ask |
| 7 · Close and the role | 0:45 | Why this project, for this role, in one breath |
| Q&A buffer | 5:00 | |

Governance carries the most weight for a senior audience because it is where "I built a cool system" becomes "I understand what enterprise trust requires". Spend the time there.

For an FDE audience, add a segment between the hook and STAR: requirements gathering and scoping. These are the discovery conversations before a line of code. That is the part of the job an FDE interviewer is actually hiring for.

## Deliver the Action Twice

The Action beat is told in two passes, so one script serves both a business-heavy and a technical-heavy listener.

**Pass 1 is the analogy pass,** with no architecture terms. "Permission-checking happens before the AI ever sees a document — built into the shape of the pipeline so it's structurally impossible to skip. Think of a venue with two checkpoints."

**Pass 2 is the technical layer:** "In system terms, that's attribute-based access control enforced in two layers." Deliver it only on a sign of engagement, such as a nod, a question, or the listener leaning in. If the room says "got it, what's the result", skip straight to Result.

## Tell the Trust Story

The strongest segment in a deep-dive is not the architecture. It is the mistakes the project's own testing caught, told as evidence that the testing works.

Open it plainly, with the line the handbook uses:

> "I want to tell you about three mistakes, because how you respond to your own testing catching you is more informative than a system that never had a wrinkle."

Then give each one with what changed. In the handbook's enterprise RAG narrative, the three are a false alarm, a shadowed rule and a flaky gate.

This beat invites follow-up questions. The conversation then does part of the work. [Offered Honesty and War Stories](06_Offered_Honesty_and_War_Stories.md) explains why these stories carry so much weight.

## Prepare Two Appendices You Never Read Aloud

Every deep-dive carries two appendices.

**A follow-up crib sheet.** Five to eight rows in the shape *if asked X, lead with the business answer, then go technical if pushed*.

| If asked | Lead with (business) | Then, if pushed (technical) |
|---|---|---|
| "Why two layers instead of one good filter?" | "Because permissions change after the index is built." | "Pre-filter on index-time attributes; post-check on live attributes; staleness becomes a logged event, not a leak." |

**Delivery notes.** Pause after the hook. Watch for the "go deeper" signal before launching Pass 2 or segment 3. Never apologise for the limitations segment; state it like a fact worth being proud of. If time runs short, compress technical development and Pass 2 first. The business framing and the governance segment are what a senior listener remembers, and they must never be rushed.

## Worked Example: Building a Deep-Dive From Scratch

Start from one project and build in this order.

Write the cold-open sentence first. If it will not come, the hard part of the project has not been found yet. Write five short beats, each 30 to 60 seconds spoken, each with a bridge to more depth. Write the trust story: three things the project's own testing or review caught. Write the honest limitation to offer before being asked. Write the five-row crib sheet.

Then assemble the deep-dive from those beats using the timing budget. Rehearse aloud with a timer. Finally close the script and deliver from the segment headers alone.

The beats are the reusable unit. The same pieces also feed [The Open-Ended Conversation](03_The_Open_Ended_Conversation.md), so one preparation pass serves two formats.

> **Warning: running out of time is a cutting decision, not a speed-up.** Do not talk faster through governance. Cut technical development and Pass 2, which a senior listener will ask for if they want them.

---

## Key Takeaways

- Script about fifteen minutes and keep the last few for questions; weight governance heaviest for a senior audience, and add scoping for an FDE audience.
- Give the Action twice: an analogy pass always, the technical pass only on a sign of engagement.
- The trust story, the mistakes your testing caught, is the strongest segment.
- Prepare a follow-up crib sheet and delivery notes, and cut technical depth first when time runs short.
- Build the script from reusable beats, rehearse with a timer, then deliver from headers alone.

## Check Yourself

1. **Which segment is weighted heaviest for a senior or enterprise audience, and why?**
   Governance and security, three to three and a half minutes. It shows an understanding of what enterprise trust requires, not just a working system.

2. **What decides whether to deliver the second pass of the Action beat?**
   A sign of engagement: a nod, a question, leaning in. If the listener asks for the result, skip it.

3. **Time is running short. What do you compress first, and what must never be rushed?**
   Compress technical development and Pass 2. Never rush the business framing or the governance segment.

## References

**Sources:** `01_Deep_Dive_And_Conversational_Formats.md` (FDE Handbook, Telling the Story): "Format 1 — The 15–20 minute deep-dive" (timing budget, two-pass Action, trust story, the two appendices), "Building your own" and "Checkpoint". The worked example is `stories/Enterprise_RAG_DeepDive_15-20min.md`.
