# Proof versus Knowledge

*Most of what anyone can say about a system is knowledge rather than proof, and both are legitimate until one is presented as the other.*

◷ 6 min

Honesty about a project is not modesty. It is a set of written habits that separate what has been shown running from what is merely known. Build them before the interview, so the formats in [Three Formats for One Project](/learn/communication-and-behavioural/telling-the-build-story/three-formats-for-one-project) carry claims that survive one hard question.

**Objectives:**

- state the distinction between proof and knowledge, and the failure, in one sentence each;
- keep a coverage map with "to close" and "what to say" columns;
- write a "read these numbers honestly" paragraph and a "does not do" list.

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

The "what to say" column turns a gap from an embarrassment into a prepared answer. It shows understanding of the production version even when it could not be built on a laptop. One example from the handbook: "The lock and idempotency mechanisms are correct in shape but wrong in storage — a real deployment needs a distributed lock and a durable key store; the mechanism doesn't change, only where it's persisted." That sentence is stronger than a claim to have built it.

## Read Your Own Numbers Honestly

For every number worth citing, state the number, state what it does not prove, and state what it does prove. Do it before anyone asks. Three examples from the handbook's projects show the pattern.

> "The corpus is 22 documents. Retrieval is easy at that size, so every strategy scores near-perfectly and the differences are noise. Do not read this table as proof that HyDE or multi-query earn their keep. The value is that the harness exists and gates the release. The number that matters here is the zero-leak column."

> "This is one engagement, run once. `time_to_first_value_days = 1` and `eval_score = 0.83` are demo-scripted values, not measurements. The point being proven is that the pipeline enforces its own gates, not that these numbers are typical."

> "Adoption grew after rollout — a correlational signal, not a controlled experiment, and worth saying exactly that if pressed."

HyDE and multi-query in the first quote are two query-rewriting retrieval strategies; the point is that a tiny corpus cannot tell them apart. The technical basis for this habit is statistical rigour in evaluation. This is the communication habit built on top of it.

## Name What the System Deliberately Does Not Do

End each project with a list headed with the reason it exists: "named because an architect should know where the demo ends". Give each item its production answer.

The handbook's lists include BM25 keyword search rebuilt on every request, identity held in a JSON file, no real authoring surface, an evaluation harness referenced but not run, and rollback that is an attestation rather than a mechanism. An architect who can name where their own system ends is one whose claims about where it works can be trusted.

## Worked Example: Preparing One Project

Take an enterprise RAG project with access control and a 22-document corpus, like the handbook's.

Write the coverage map first. The zero-leak test and the release gate are ✅, because the harness runs and gates the release. Scale to 10 million chunks is ❌. Its "what to say" entry: the design does not change, but the evidence comes from 22 documents.

Write the numbers paragraph next. Every retrieval strategy scores near-perfectly, and at this corpus size the differences are noise. The zero-leak column is the number that matters.

Then write the "does not do" list with production answers, such as the BM25 index rebuilt per request and identity held in a JSON file. Put the limitation into the script before the close, and rehearse it without apology.

The project now has a prepared answer for every gap. A question about scale or evidence cannot catch the speaker out.

> **Warning: a confident wrong claim costs more than every honest gap.** One overstated number, found with one question, discounts everything else said in the interview. An unoffered gap costs nothing until it is found; an offered one earns credit.

---

## Key Takeaways

- Showing and knowing are both legitimate; presenting knowledge as proof is the failure.
- Keep a coverage map with ✅, 🟡 and ❌, plus "to close" and "what to say" for every gap.
- For every number, say what it does not prove and what it does, before anyone asks.
- List what the system deliberately does not do, each with its production answer.
- Prepare all four for every project, and script the limitation before the close.

## Check Yourself

1. **State the distinction and the failure in one sentence each.**
   "I built this, let me show you" and "I know how this is done" are both legitimate positions. The failure is presenting the second as the first.

2. **What two extra columns does a coverage map carry for every partial or missing item?**
   What it would take to close the gap, and, where closing is infeasible, what to say instead, worded ready to speak.

3. **Your retrieval benchmark scores near-perfectly on 22 documents. How do you present it?**
   Say the corpus is tiny, so the differences between strategies are noise and prove nothing about them. Then say what it does prove: the harness exists and gates the release, and the zero-leak column is the number that matters.

## References

**Sources:** `02_Proof_vs_Cheat_Sheet_Honesty.md` (FDE Handbook, Telling the Story): "Why this matters", "The distinction", "The three habits" and "Applying it to your own work". The handbook's three project coverage maps and "Verified results" sections are the original templates.
