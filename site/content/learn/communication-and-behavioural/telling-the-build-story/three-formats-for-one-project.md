# Three Formats for One Project

*The same project has to land with a director who has fifteen minutes and a peer who wants every design decision, and one script cannot serve both.*

◷ 4 min

A project story is not one speech. Pick the shape from the room, then translate every technical term in the breath that introduces it.

**Objectives:**

- state the meta-rule that governs every format, with an example;
- name the three formats and what each one is for;
- choose a format from the interview situation.

---

## Translate Each Term in the Same Breath

One rule governs all three formats. Every technical term gets its plain-English meaning in the same sentence that introduces it, not three sentences later. A listener who loses the thread on one term does not recover it later.

Compare two ways of saying the same thing. The weak version names "a two-layer access control system" and explains it afterwards. The strong version says: "a two-layer access control system — think a fast ID check at the door, then a second, more careful check right before you're handed anything sensitive." That is one sentence carrying one idea, not two.

Apply the rule everywhere: in the hook, in the Action beat, and in the answers to follow-up questions.

## Match the Format to the Room

The same substance has to land in three very different shapes.

| Format | What it is | Where it is taught |
|---|---|---|
| Timed deep-dive | A speakable script you move through top to bottom, with timing per segment | [The Timed Deep-Dive](/learn/communication-and-behavioural/telling-the-build-story/the-timed-deep-dive) |
| Open-ended conversation | A toolkit of short story beats deployed in whatever order the listener steers | [The Open-Ended Conversation](/learn/communication-and-behavioural/telling-the-build-story/the-open-ended-conversation) |
| Technical implementation flow | The architecture's evolution, the pivots and the reasoning behind each tool | [The Technical Implementation Flow](/learn/communication-and-behavioural/telling-the-build-story/the-technical-implementation-flow) |

The formats differ on one axis: who controls the order. In the deep-dive the speaker does. In the conversation the listener does. In the implementation flow the history of the build does.

## Choose From the Situation, Not From Habit

Read the format off the interview setting.

| Situation in the room | Format to use |
|---|---|
| A fixed slot, a senior audience, a mixed business and technical panel | Timed deep-dive |
| An open agenda, one-on-one, "tell me about something you built" | Open-ended conversation |
| A technical peer or hiring manager who wants the architecture story | Implementation flow |
| Behavioural framing: "tell me about a time" | STAR inside any of the above |

STAR stands for Situation, Task, Action and Result. It is not a fourth format. The deep-dive's second segment *is* a STAR narrative, so behavioural framing fits inside whichever shape the room calls for.

## Worked Example: One Enterprise Search Project, Three Rooms

Take one project: an enterprise AI search system where the same question needs a different correct answer depending on who is asking.

A director books a fifteen-minute slot with a mixed panel. Use the deep-dive: hook, STAR, then governance weighted heaviest, limitations before the close.

A hiring manager opens with "tell me about something you built". Use the conversation: one cold-open sentence, then stop, and let their next question pick the beat.

A staff engineer asks why the design ended up the way it did. Use the implementation flow: the first design, why it failed in testing, the pivot, and why each tool won.

The substance is identical in all three. Only the order and the depth change, and the room decides both.

> **Warning: a memorised script sounds memorised.** Whatever the format, rehearse aloud a few times, then deliver from segment headers and cues. The aim is fluency in the material, not recitation of one version of it.

---

## Key Takeaways

- Translate every technical term in the sentence that introduces it; this rule holds in every format.
- The three formats differ in who controls the order: the speaker, the listener, or the history of the build.
- Choose the format from the situation; STAR fits inside any of them.

## Check Yourself

1. **State the meta-rule and give an example of a term translated in the same breath.**
   Every technical term is translated as it is introduced. Example: "a two-layer access control system — think a fast ID check at the door, then a more careful check right before anything sensitive is handed over."

2. **A one-on-one interviewer says, "Tell me about something you built." Which format, and why?**
   The open-ended conversation, because the agenda is open and the listener will steer.

3. **Where does STAR fit among the three formats?**
   Inside any of them. The deep-dive's second segment is a STAR narrative.

## References

**Sources:** `01_Deep_Dive_And_Conversational_Formats.md` (FDE Handbook, Telling the Story): "Why this matters", the meta-rule, and "Choosing the format". The handbook's worked narratives in `11_Telling_The_Story/stories/` show each format fully dressed.
