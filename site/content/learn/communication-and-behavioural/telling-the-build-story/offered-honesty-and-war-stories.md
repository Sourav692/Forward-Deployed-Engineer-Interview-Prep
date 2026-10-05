# Offered Honesty and War Stories

*Admitting a limit feels like losing ground, yet offered honesty reads as confidence while extracted honesty reads as getting caught.*

◷ 5 min

A limitation is not a weakness to hide until someone finds it. Said first and without apology, it raises the weight of every other claim. This lesson covers when to offer it and why the bugs a project's testing caught are the best proof it has. The written habits behind it are in [Proof versus Knowledge](/learn/communication-and-behavioural/telling-the-build-story/proof-versus-knowledge).

**Objectives:**

- explain why offered honesty strengthens every other claim;
- tell a war story with what changed and its lesson in one sentence;
- deliver the closing sentence that carries the discipline.

---

## Offer the Limitation Before It Is Asked For

Offered honesty reads as confidence; extracted honesty reads as getting caught. The difference is who said it first. The handbook's narratives all deploy the limitation before anyone asks, and their delivery notes say never to apologise for it. State it like a fact worth being proud of.

In the timed deep-dive this is segment 6, 45 seconds before the close. In the conversation it is beat E, deployed proactively.

## Expect Three Things to Happen

Offering the limit changes the rest of the interview in three ways.

1. **Every other claim gains weight.** If the 22-document caveat was volunteered, the listener believes the zero-leak gate without checking.
2. **The follow-up questions get better.** Instead of probing for the edge, the listener asks what you would do at scale, which is the conversation you wanted.
3. **You demonstrate the job.** An FDE tells a customer exactly where a guarantee holds and where it has to be verified on their stack. One narrative closes with: "I'd rather tell you exactly where the edges of what I've proven are than let you find them later." That line is the job description.

## Treat War Stories as Proof

The bugs a project caught are not confessions. They are the evidence that the testing works.

Each of the handbook's three platform projects carries its own. The first, an enterprise RAG build, has the false security alarm, the shadowed rule and the flaky gate. The second has the unscoped reset, the stale content hash and the schema migration. The third has the spend cap checking $0.00, the idempotent replay that still accumulated cost, and an accelerator `kind` field colliding with an event `kind` field.

Each is told with what broke, how it was found, what changed, and the lesson in one sentence. As the handbook puts it:

> "How you respond to your own testing catching you is more informative than a system that never had a wrinkle."

A project with no war stories has either not been tested hard enough or is not being described honestly.

## Worked Example: Turning a Bug Title Into a Story

Start from a title in a bug list: "the spend cap checking $0.00". A title is not yet a story. It needs four parts, and each comes from the project's own record.

What broke: a spend cap that was checking a value of $0.00. How it was found: name the test, review or run that surfaced it. What changed: name the fix. The lesson: one sentence a listener could apply to their own system.

Told in under a minute, those four parts show testing that catches real faults, a fix, and a transferable lesson. The story also invites "how did you catch that?", which hands the next minute back to the speaker.

Collect one war story like this from each project. Then put the limitation into the script before the close and rehearse it without apology.

> **Warning: never apologise for the limitation.** An apology turns an offered fact back into a confession. Say it in the same tone as the results.

## Close With the Sentence That Carries It

When the room is ready to close, one sentence carries the whole discipline:

> "Here's what I can show you running, here's what I know how to do but couldn't demonstrate at this scale, and here's where the demo ends — and I'd rather tell you that than have you find it."

---

## Key Takeaways

- Offer the limitation before it is asked for, without apology, in the same tone as the results.
- Offering it adds weight to every other claim, improves the follow-ups, and demonstrates the FDE job itself.
- War stories are proof that testing works; tell each with what broke, how it was found, what changed and a one-sentence lesson.
- One closing sentence separates what runs, what is known, and where the demo ends.

## Check Yourself

1. **Why does offered honesty strengthen every other claim?**
   The listener sees the speaker volunteer a caveat they could have hidden, so they trust the claims that were not caveated, such as the zero-leak gate, without checking.

2. **What four parts does a well-told war story have?**
   What broke, how it was found, what changed, and the lesson in one sentence.

3. **A project has no war stories. What does that suggest?**
   Either it has not been tested hard enough, or it is not being described honestly.

## References

**Sources:** `02_Proof_vs_Cheat_Sheet_Honesty.md` (FDE Handbook, Telling the Story): "Why it works in the room", "The war stories are the proof", "Applying it to your own work" and "Checkpoint". `01_Deep_Dive_And_Conversational_Formats.md`: the honest-limitations segment, beat E and the trust story. The source names its war stories by title only, so the worked example shows the four-part shape without inventing their details.
