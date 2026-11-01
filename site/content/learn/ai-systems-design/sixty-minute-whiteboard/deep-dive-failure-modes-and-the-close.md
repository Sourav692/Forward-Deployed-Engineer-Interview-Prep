# Deep Dive, Failure Modes, and the Close

*A design round is won in the deep dive and lost by waiting to be asked, so the last forty minutes need more discipline than the first twenty.*

The deep dive is not a tour of every component; it is twenty minutes on the hardest part, announced in advance. Spend steps 4 to 6 of [the six-step clock](/learn/ai-systems-design/sixty-minute-whiteboard/the-six-step-whiteboard-clock) on one marked insight, unprompted cross-cutting concerns and a deliberate close.

**Objectives:**

- run a deep dive in four moves, ending with an unfakeable detail;
- raise multi-tenancy, security, observability, evaluation, failure and scale without being asked;
- close with a thesis, three trade-offs with what would change your mind, and the forward-deployed close.

---

## Announce Where the Risk Is

Step 4 runs from minute 20 to minute 40. Open it by saying where the risk lies. This reads as senior judgement:

> *"The hardest parts of this system are access control and retrieval quality. I want to spend my time there — the vector database choice is close to irrelevant by comparison."*

Then spend the time there. Each script has a primary deep dive, the thing the framing sentence promised, and a secondary one. They run roughly 12 and 8 minutes.

## Run the Deep Dive in Four Moves

Inside the primary deep dive, the scripts share one shape. First, name the alternatives, then choose. Examples are three access-control patterns, three ways to handle channel diversity, or gates as checklist versus gates as authority.

Second, deliver the strongest single insight and mark it as such. The scripts star it: the two-layer filter and post-check, determinism over free text, gates that block rather than remind. It is one idea, stated crisply enough that the interviewer writes it down.

Third, prove the design was built with one specific bridge. "Chroma can't store a list, so group membership becomes one boolean column per group and an `$or` reproduces list-overlap." A detail like this cannot be faked, which is why it carries weight.

Fourth, state how the primary and secondary deep dives interact. "Reranking runs after ACL enforcement, so a restricted user's top-5 is the best of their pool."

## Raise Cross-Cutting Concerns Unprompted

Step 5 runs from minute 40 to minute 55. Raise all of it without being asked, because being asked costs the signal. Give each topic two to three minutes. The method text calls these five sub-sections but lists six; all six belong.

| Topic | What to say |
|---|---|
| Multi-tenancy | Where the tenant ID travels; that it is enforced at the data layer, never assembled per query in application code; noisy-neighbour limits |
| Security | AuthN through the customer's IdP; retrieved content and tool output as untrusted input; least-privilege credentials in a secrets manager; PII as an obligation; a full audit trail |
| Observability | Every run is a replayable record: "three audiences, one artefact: the engineer, the auditor, finance" |
| Evaluation | The metric families, and the one gate that is not a metric: a retrieval regression is a bug for next sprint, a leak is an incident, so the security suite blocks the release outright. Tell an evaluation war story here if there is one |
| Failure modes | A table of what degrades, not what breaks; say one row slowly: fail closed on authorisation |
| Scale | What breaks first at 10×, named specifically, with the production answer |

> **Warning: a concern raised only when asked earns no credit.** The interviewer is checking whether these come up unprompted. Waiting for the question turns a strength into a gap, so schedule step 5 and start it at minute 40 regardless.

## Close With a Thesis, Not a Recap

Step 6 takes the last five minutes, in three moves. First, summarise in three sentences. Not a recap of the diagram, but the design's thesis.

Second, give the top three trade-offs and what would change your mind, as a table: decision, what was chosen, and what evidence would reopen it. This is the strongest signal of engineering maturity available in five minutes.

Third, give the forward-deployed close. Every script ends the same way, and it is the line that separates an FDE answer from an architect's:

> *"If I were deploying this at a customer, week one is not this whole diagram. It's: connect one source, get the permission translation provably right for three personas, build the golden set with their SMEs, and stand up the leak test. That proves the risky part before anyone argues about embeddings. Everything else is incremental."*

## Prepare Three Artefacts in Advance

Each script carries three appendices worth building for any likely design. The first is a cheat sheet of eight to ten lines that carry the round, each a complete idea: "The filter makes retrieval cheap; the post-check makes it correct." "Fail closed on authorisation; degrade on everything else." They are not read aloud, but having them keeps the thread.

The second is four or five questions to ask the interviewer, specific to the company. Ask how they handle the hard part today, where they draw the platform versus custom line, what the first two weeks of an engagement look like, and how they evaluate quality once the customer owns it. The third is one artefact to show on a laptop: a visibility matrix, a negative-control demo or a gate-failure run. It should take two seconds and prove the risky part is real.

## Worked Example: Minutes 20 to 60 of Enterprise RAG

Minute 20: "The hardest parts are access control and retrieval quality." Minutes 20 to 32: three access-control patterns, then the choice of partitioning plus pre-filtering. The starred insight follows: a cheap pre-filter for speed and an authoritative post-check for correctness. Then the Chroma boolean-column bridge. Minutes 32 to 40: hybrid retrieval and reranking, ending on "rerank after enforcement".

Minutes 40 to 55: tenancy at the data layer, prompt injection treated as untrusted input, a replayable trace for three audiences, and the zero-leak release gate. Then the failure table, slowing down on "fail closed on authorisation", and what breaks first at 10×.

Minutes 55 to 60: the three-sentence thesis, three trade-offs with what would reopen each, and the week-one plan. The round is won by the marked insight and the bridge, and protected by raising step 5 unprompted.

---

## Key Takeaways

- Announce where the risk is, then spend about 12 minutes on the primary deep dive and 8 on the secondary.
- Name alternatives, mark one insight, prove it with one unfakeable detail, and link the two deep dives.
- Raise tenancy, security, observability, evaluation, failure and scale without being asked.
- Close with a three-sentence thesis, three trade-offs with what would change your mind, and the forward-deployed close.
- Prepare a cheat sheet, questions for the interviewer and one laptop artefact before the round.

## Check Yourself

<details>
<summary>1. What are the four moves inside a primary deep dive?</summary>

Name the alternatives and choose; deliver and mark the strongest insight; prove it with one specific bridge; state how the two deep dives interact.

</details>

<details>
<summary>2. Why must step 5 be raised unprompted?</summary>

The interviewer is checking whether these concerns come up on their own. Being asked costs the signal.

</details>

<details>
<summary>3. Where is a design round won and where is it lost?</summary>

Won in step 1, with the framing sentence and scope, and step 4, with the marked insight and unfakeable detail. Lost in step 5 by waiting to be asked, and step 6 by summarising the diagram instead of the thesis.

</details>

