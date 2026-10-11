# Proof versus Knowledge

*Most of what anyone can say about a system is knowledge rather than proof, and both are legitimate until one is presented as the other.*

Honesty about a project is not modesty. It is a set of written habits. They separate what has been shown running from what is merely known, and they put the limits first. Build them before scripting anything, so every format in [Three Formats for One Project](/learn/communication-and-behavioural/telling-the-build-story/three-formats-for-one-project) carries claims that survive one hard question.

**Objectives:**

- state the distinction between proof and knowledge, and the failure;
- prepare a coverage map, an honest numbers paragraph and a "does not do" list;
- offer the limitation first, and tell a war story in four parts.

---

## Separate What You Showed From What You Know

Every claim a design makes sits in one of two legitimate positions.

| | "I built this — let me show you" | "I know how this is done" |
|---|---|---|
| Evidence | A running demo, a test that fails if it is wrong, a number from a real execution | Architecture knowledge, a reference design, a vendor's documentation |
| Legitimacy | Full | Full: most of any real system is knowledge, not code you personally wrote |
| The failure | — | Presenting the second as the first |

Confusing them is the failure. Suppose a candidate says "my system handles 10 million chunks" when the corpus is 22 documents. The architecture might well scale, so they have not lied about the design. They have lied about the evidence. An experienced listener finds that out with one question, and after that nothing else they say is trusted.

## Keep a Coverage Map

Before any conversation about a system, list every claim the design makes. Mark each one: ✅ built and runnable, 🟡 partial, or ❌ not built.

For every 🟡 or ❌, write two more things. First, what it would take to close: code, and roughly how much; data only; or infeasible locally. Second, where closing is infeasible, what to say instead, worded ready to speak.

The "what to say" column is the point. It turns a gap from an embarrassment into a prepared answer. It shows understanding of the production version even when it could not be built on a laptop. One example from the handbook: "The lock and idempotency mechanisms are correct in shape but wrong in storage — a real deployment needs a distributed lock and a durable key store; the mechanism doesn't change, only where it's persisted." That sentence is stronger than a claim to have built it.

## Read Your Own Numbers Honestly

For every number worth citing, state the number, state what it does not prove, and state what it does prove. Do it before anyone asks. Three examples from the handbook's projects show the pattern.

> "The corpus is 22 documents. Retrieval is easy at that size, so every strategy scores near-perfectly and the differences are noise. Do not read this table as proof that HyDE or multi-query earn their keep. The value is that the harness exists and gates the release. The number that matters here is the zero-leak column."

> "This is one engagement, run once. `time_to_first_value_days = 1` and `eval_score = 0.83` are demo-scripted values, not measurements. The point being proven is that the pipeline enforces its own gates, not that these numbers are typical."

> "Adoption grew after rollout — a correlational signal, not a controlled experiment, and worth saying exactly that if pressed."

HyDE and multi-query in the first quote are two query-rewriting retrieval strategies; a tiny corpus cannot tell them apart. The habit is the spoken form of statistical rigour in evaluation.

## Name What the System Deliberately Does Not Do

End each project with a list headed with the reason it exists: "named because an architect should know where the demo ends". Give each item its production answer.

The handbook's lists include BM25 keyword search rebuilt on every request, identity held in a JSON file, no real authoring surface, an evaluation harness referenced but not run, and rollback that is an attestation rather than a mechanism. An architect who can name where their own system ends is one whose claims about where it works can be trusted.

## Offer the Limitation Before It Is Asked For

Offered honesty reads as confidence; extracted honesty reads as getting caught. The difference is who said it first. The handbook's narratives all deploy the limitation before anyone asks, and their delivery notes say never to apologise for it. State it like a fact worth being proud of.

Offering the limit changes the rest of the interview in three ways.

1. **Every other claim gains weight.** If the 22-document caveat was volunteered, the listener believes the zero-leak gate without checking.
2. **The follow-up questions get better.** Instead of probing for the edge, the listener asks what you would do at scale, which is the conversation you wanted.
3. **You demonstrate the job.** An FDE tells a customer exactly where a guarantee holds and where it has to be verified on their stack. One narrative closes with: "I'd rather tell you exactly where the edges of what I've proven are than let you find them later." That line is the job description.

Every format has a slot for it: segment 6 of [The Timed Deep-Dive](/learn/communication-and-behavioural/telling-the-build-story/the-timed-deep-dive) and beat E of the [story kit](/learn/communication-and-behavioural/telling-the-build-story/building-the-story-kit).

## Treat War Stories as Proof

The bugs a project caught are not confessions. They are the evidence that the testing works. This trust story is the strongest segment in any deep-dive. It beats the architecture. Open it plainly:

> "I want to tell you about three mistakes, because how you respond to your own testing catching you is more informative than a system that never had a wrinkle."

The handbook's three platform projects each carry their own. The enterprise RAG build has the false security alarm, the shadowed rule and the flaky gate. The others have the unscoped reset, the stale content hash and the schema migration, then the spend cap checking $0.00, the idempotent replay that still accumulated cost, and an accelerator `kind` field colliding with an event `kind` field.

A bug title is not yet a story. Tell each one in four parts: what broke, how it was found, what changed, and the lesson in one sentence. Told in under a minute, those parts show testing that catches real faults and a lesson the listener can carry to their own system. The story also invites "how did you catch that?", which hands the next minute back to the speaker.

A project with no war stories has either not been tested hard enough or is not being described honestly.

## Worked Example: Preparing One Project

Take an enterprise RAG project with access control and a 22-document corpus, like the handbook's.

Write the coverage map first. The zero-leak test and the release gate are ✅, because the harness runs and gates the release. Scale to 10 million chunks is ❌, and its "what to say" entry is that the design does not change but the evidence comes from 22 documents.

Then write the numbers paragraph, the "does not do" list with production answers, and the three war stories in four parts. Put the limitation into the script before the close and rehearse it without apology.

The project now has a prepared answer for every gap, so a question about scale or evidence cannot catch the speaker out.

> **Warning: a confident wrong claim costs more than every honest gap.** One overstated number, found with one question, discounts everything else said in the interview. An apology does the same damage in a smaller way: it turns an offered fact back into a confession. Say the limit in the same tone as the results.

## Close With the Sentence That Carries It

When the room is ready to close, one sentence carries the whole discipline:

> "Here's what I can show you running, here's what I know how to do but couldn't demonstrate at this scale, and here's where the demo ends — and I'd rather tell you that than have you find it."

---

## Key Takeaways

- Showing and knowing are both legitimate; presenting knowledge as proof is the failure.
- For every project, prepare a coverage map with "to close" and "what to say" for each gap, an honest paragraph for each number, and a "does not do" list with production answers.
- Offer the limitation first and without apology; it adds weight to every other claim.
- Tell each war story as what broke, how it was found, what changed and a one-sentence lesson.

## Check Yourself

1. **State the distinction and the failure in one sentence each.**
   "I built this, let me show you" and "I know how this is done" are both legitimate positions. The failure is presenting the second as the first.

2. **Your retrieval benchmark scores near-perfectly on 22 documents. How do you present it?**
   Say the corpus is tiny, so the differences between strategies are noise and prove nothing about them. Then say what it does prove: the harness exists and gates the release, and the zero-leak column is the number that matters.

3. **Why does offered honesty strengthen every other claim?**
   The listener sees the speaker volunteer a caveat they could have hidden, so they trust the claims that were not caveated, such as the zero-leak gate, without checking.

4. **A project has no war stories. What does that suggest?**
   Either it has not been tested hard enough, or it is not being described honestly.

