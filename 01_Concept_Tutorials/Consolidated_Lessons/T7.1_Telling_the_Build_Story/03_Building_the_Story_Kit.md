# Building the Story Kit

*A script written for one room breaks in every other room, but a kit of short prepared pieces can be assembled for any of them.*

◷ 6 min

The unit of preparation is not the speech. It is a small kit of pieces written once per project and reused in every format. Build it after [Proof versus Knowledge](02_Proof_versus_Knowledge.md), because the kit's honesty pieces come from there.

**Objectives:**

- translate each technical term in the breath that introduces it, using four bridge phrases;
- write a cold open and five stand-alone beats, each with a bridge;
- prepare one follow-up map and a closing line for each likely thread.

---

## Translate Each Term in the Same Breath

One rule governs every piece of the kit and every format. Each technical term gets its plain-English meaning in the same sentence that introduces it, not three sentences later. A listener who loses the thread on one term does not recover it later.

Compare two ways of saying the same thing. The weak version names "a two-layer access control system" and explains it afterwards. The strong version says: "a two-layer access control system — think a fast ID check at the door, then a second, more careful check right before you're handed anything sensitive." That is one sentence carrying one idea, not two.

Four bridges make the rule easy to keep mid-sentence, at the moment a term is about to slip out.

| Bridge | What it does |
|---|---|
| "…which, in plain terms, means…" | Translates a term already said |
| "…think of it like [analogy] — technically that's called [term], but the idea is…" | Leads with the picture, then names it |
| "I can go as deep as you'd like on the how — where should I take this?" | Hands the depth dial to the listener, confidently |
| "The business reason I did that is X; the engineering reason is Y." | Gives the same decision in both framings |

## Write the Cold Open First

The cold open is one sentence, said when someone asks "tell me about something you built" with no other context. A strong one names what was hard, not what was built:

> "I built an enterprise AI search system where the hardest part wasn't finding the right answer — it was that the same question needed a different correct answer depending on who was asking, and I wanted to prove that boundary never breaks, not just hope it doesn't."

Write it before anything else. If it will not come, the hard part of the project has not been found yet. How to deliver it, and when to stop talking, is in [The Open-Ended Conversation](05_The_Open_Ended_Conversation.md).

## Prepare Five Beats That Stand Alone

Each beat runs 30 to 60 seconds spoken and makes sense on its own. Each carries a bridge to the next level of depth.

| Beat | Purpose | The bridge out |
|---|---|---|
| A · The business problem | Relatability: the scenario a non-engineer recognises | "That's an access-control problem before it's an AI problem — so that's where I spent most of my design effort." |
| B · The core technical idea, business-first | The one mechanism, as an analogy | "In system terms, that's a pre-filter compiled into the vector search, and a live re-check right before generation." |
| C · The trust story | The bugs your testing caught, told as in [Proof versus Knowledge](02_Proof_versus_Knowledge.md) | It naturally invites "how did you catch that?" |
| D · The platform-reality insight | What you learned that generalises beyond the platform | The bridge to the listener's stack, only if the moment allows; do not force it |
| E · Honest limitations | The limitation, offered before it is asked for | "What it does prove, independent of scale, is…" |

The beats are the reusable unit. A deep-dive is the beats laid out against a clock; a conversation is the beats in whatever order the listener asks for them.

## Map the Follow-Ups by Topic

Prepare one follow-up map: a topic map, not a timeline. The listener steers the order, so a sequence would not survive the first question. Keep five to eight entries, each ready to expand into three bullets.

| If they ask about | Go to |
|---|---|
| Architecture | The pipeline, the policy, the physical isolation |
| Why that retrieval approach | The benchmark and its honest result |
| Testing philosophy | Security decided by hard rules, never by the model; the release gate; the check that docs match code |
| Deployment | The portability lesson |
| What you would do differently | The two or three things you would pull forward |

Every answer on the map leads with the business reason and goes technical only if pushed. Asked "why two layers instead of one good filter?", lead with "because permissions change after the index is built." If pushed, go on: "pre-filter on index-time attributes; post-check on live attributes; staleness becomes a logged event, not a leak."

The map is never read aloud. It exists so that no likely question finds the speaker improvising.

## Prepare a Closing Line per Thread

A conversation can end on any thread, so prepare one closing line per likely final thread: security and trust, platform and deployment, limitations and what comes next. Keep a generic fallback too: "Happy to go deeper on any piece of this — whichever's most useful to you."

For a limitations thread, the closing sentence in [Proof versus Knowledge](02_Proof_versus_Knowledge.md) is the strongest choice.

## Worked Example: One Kit, Built in Order

Start from one project and write the pieces in this order.

Write the cold-open sentence first, because it finds the hard part. Write the five beats, each 30 to 60 seconds spoken, each with a bridge. Write the trust story: three things the project's own testing or review caught. If there are none, the testing was not strong enough to be a story. Write the honest limitation to offer before being asked. Write the follow-up map: five rows, business lead then technical depth.

The kit is now complete, and no format has been chosen yet. [The Timed Deep-Dive](04_The_Timed_Deep_Dive.md) assembles these beats against a timing budget. [The Technical Implementation Flow](06_The_Technical_Implementation_Flow.md) assembles the project's pivots instead. One preparation pass serves every room.

> **Warning: a term explained three sentences later is not explained.** The listener spends those three sentences lost. Put the translation in the breath that introduces the term, inside every beat and every follow-up answer.

---

## Key Takeaways

- Translate every technical term in the sentence that introduces it, and keep four bridges ready.
- Write the cold open first; if it will not come, the hard part has not been found.
- Prepare five self-contained beats of 30 to 60 seconds, each with a bridge to more depth.
- Keep one follow-up map organised by topic, business answer first and technical depth if pushed.
- Prepare a closing line for each likely final thread, plus a generic fallback.

## Check Yourself

1. **State the meta-rule and give an example of a term translated in the same breath.**
   Every technical term is translated as it is introduced. Example: "a two-layer access control system — think a fast ID check at the door, then a more careful check right before anything sensitive is handed over."

2. **You cannot write the cold-open sentence for a project. What does that tell you?**
   That the hard part of the project has not been found yet.

3. **Why are the beats the reusable unit, rather than a script?**
   Each beat stands alone, so the same beats can be laid out against a clock for a deep-dive or deployed in any order in a conversation.

4. **Why is the follow-up map organised by topic rather than by time?**
   Because the listener steers the order. A timeline assumes a sequence the conversation will not follow.

5. **What closing lines should the kit carry?**
   One per likely final thread, such as security and trust, platform and deployment, and limitations and what comes next, plus a generic fallback.

## References

**Sources:** `01_Deep_Dive_And_Conversational_Formats.md` (FDE Handbook, Telling the Story): the meta-rule in "Why this matters", "The two appendices" (the crib sheet), "The cold open", "The beats", "Bridges", "The 'go deeper' menu", "Closing lines", "Building your own" and "Checkpoint". The worked narrative is `stories/Enterprise_RAG_Conversational_Guide.md`.
