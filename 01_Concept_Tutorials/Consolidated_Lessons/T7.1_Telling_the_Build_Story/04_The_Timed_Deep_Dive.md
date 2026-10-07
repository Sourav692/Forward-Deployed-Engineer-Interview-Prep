# The Timed Deep-Dive

*A fixed slot rewards a tight script, but a senior listener remembers the governance and the honesty, not the architecture detail rushed in to fill the slot.*

◷ 5 min

A deep-dive is not a lecture with questions at the end. It is the [story kit](03_Building_the_Story_Kit.md) laid out against a timing budget, with two passes at the hard part and appendices that are never read aloud. Read [Three Formats for One Project](01_Three_Formats_for_One_Project.md) first for when to choose it.

**Objectives:**

- give the timing budget and say which segment is weighted heaviest, and why;
- deliver the Action beat in two passes and decide when to give the second;
- cut the right segments when time runs short.

---

## Budget Fifteen Minutes, Then Stop

Plan roughly fifteen minutes of talking with room to be interrupted. The last three to five minutes are questions, not more script. A script that fills the whole slot leaves no room for the listener to steer.

| Segment | Time | What it does |
|---|---|---|
| 1 · The hook | 0:30 | One sentence, zero jargon, that the listener remembers if they remember nothing else. Say it, then pause |
| Requirements and scoping (FDE interviews) | Not set | The discovery conversations before a line of code |
| 2 · STAR narrative | 3:30–4:00 | Situation in plain English; Task, meaning what the speaker personally owned and their bar for "done"; Action in two passes; Result, business framing first and numbers second |
| 3 · Technical development | 2:30–3:30 | The "if they want more" branch. Business framing for each sub-point, then depth only as far as the conversation wants |
| 4 · Governance and security | 3:00–3:30 | Weighted heaviest for a senior or enterprise audience |
| 5 · Deployment and platform reality | 1:30–2:00 | What the platform taught that generalises, and the bridge to the listener's world, said out loud |
| 6 · Honest limitations | 0:45 | Before they ask, as in [Proof versus Knowledge](02_Proof_versus_Knowledge.md) |
| 7 · Close and the role | 0:45 | Why this project, for this role, in one breath |
| Q&A buffer | 5:00 | |

Governance carries the most weight for a senior audience because it is where "I built a cool system" becomes "I understand what enterprise trust requires". Spend the time there.

The scoping row belongs in every FDE deep-dive, between the hook and STAR. Discovery before the code is the part of the job an FDE interviewer is actually hiring for. The handbook sets no fixed time for it.

The trust story, the mistakes the project's own testing caught, is the strongest segment of any deep-dive. Prepare it as described in [Proof versus Knowledge](02_Proof_versus_Knowledge.md).

## Deliver the Action Twice

The Action beat is told in two passes, so one script serves both a business-heavy and a technical-heavy listener.

**Pass 1 is the analogy pass,** with no architecture terms. "Permission-checking happens before the AI ever sees a document — built into the shape of the pipeline so it's structurally impossible to skip. Think of a venue with two checkpoints."

**Pass 2 is the technical layer:** "In system terms, that's attribute-based access control enforced in two layers." Deliver it only on a sign of engagement, such as a nod, a question, or the listener leaning in. If the room says "got it, what's the result", skip straight to Result. The full list of signals is in [The Open-Ended Conversation](05_The_Open_Ended_Conversation.md).

## Carry Two Appendices You Never Read Aloud

Every deep-dive carries two appendices.

The first is the follow-up map from the [story kit](03_Building_the_Story_Kit.md): five to eight likely questions, each with a business lead and technical depth if pushed.

The second is a short set of delivery notes. Pause after the hook. Watch for the "go deeper" signal before launching Pass 2 or segment 3. Never apologise for the limitations segment; state it like a fact worth being proud of. If time runs short, compress technical development and Pass 2 first. The business framing and the governance segment are what a senior listener remembers, and they must never be rushed.

## Worked Example: Cutting at the Ten-Minute Mark

Start from a finished kit for an enterprise search project. Lay its beats against the budget: the hook, the scoping conversations, STAR with the venue analogy as Pass 1, then technical development, governance, deployment, the limitation and the close. Rehearse aloud with a timer, then close the script and deliver from the segment headers alone.

In the room, the panel interrupts often during STAR. STAR ends with the clock at ten minutes. The budget had governance starting by about eight minutes at the latest, so at least two minutes are gone.

Cut, do not speed up. Skip technical development and do not offer Pass 2; a listener who wants them will ask. Go straight to governance and give it its full three minutes. Then the limitation and the close. The listener leaves with the two segments a senior audience remembers, delivered at full weight.

> **Warning: running out of time is a cutting decision, not a speed-up.** Do not talk faster through governance. Cut technical development and Pass 2, which a senior listener will ask for if they want them.

---

## Key Takeaways

- Script about fifteen minutes and keep the last few for questions; weight governance heaviest for a senior audience, and give FDE interviews a scoping segment.
- Give the Action twice: an analogy pass always, the technical pass only on a sign of engagement.
- Carry the follow-up map and delivery notes, and never read either aloud.
- When time runs short, cut technical development and Pass 2; never rush governance or the business framing.

## Check Yourself

1. **Which segment is weighted heaviest for a senior or enterprise audience, and why?**
   Governance and security, three to three and a half minutes. It shows an understanding of what enterprise trust requires, not just a working system.

2. **What decides whether to deliver the second pass of the Action beat?**
   A sign of engagement: a nod, a question, leaning in. If the listener asks for the result, skip it.

3. **What do you add to the timing budget for an FDE interview, and where?**
   A requirements and scoping segment between the hook and STAR: the discovery conversations before a line of code.

4. **Time is running short. What do you compress first, and what must never be rushed?**
   Compress technical development and Pass 2. Never rush the business framing or the governance segment.

## References

**Sources:** `01_Deep_Dive_And_Conversational_Formats.md` (FDE Handbook, Telling the Story): "Format 1 — The 15–20 minute deep-dive" (timing budget, two-pass Action, the two appendices), "Building your own" and "Checkpoint". The worked narrative is `stories/Enterprise_RAG_DeepDive_15-20min.md`.
