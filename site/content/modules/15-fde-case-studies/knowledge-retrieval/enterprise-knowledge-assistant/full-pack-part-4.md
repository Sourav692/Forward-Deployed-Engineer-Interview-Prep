# Enterprise Knowledge Assistant with Permission-Aware RAG, part 4

## 13. Tell It as Something Built

For "tell me about something you built", tell the same system as a story. Each beat stands alone, so you can play them in whatever order the conversation goes. Lead with one sentence and then stop talking; the next question chooses the next beat.

> *"I built an enterprise AI search system where the hardest part wasn't finding the right answer. It was that the same question needed a different correct answer depending on who was asking, and I wanted to prove that boundary never breaks, not just hope it doesn't."*

The business-problem beat is the persona table in plain words. A support platform where a Tier-1 agent, an account manager, an engineer and an outside contractor use one assistant, and each may see a different slice of the same customer's data. The account manager gets the contract terms without the root cause. The engineer gets the root cause without the contract terms. The contractor gets nothing. One wrong answer is a data leak. Bridge to the technical part: it is an access-control problem before it is an AI problem, so that is where the design effort went.

The two-checkpoint beat explains the layers without jargon. A fast checkpoint at the door gets a request into the right neighbourhood of documents. A slower, careful one runs right before anything is handed over, because permissions may have changed in the gap. Most systems build the first and hope nothing changes. This one assumed it would.

The trust beat tells three mistakes, because that is more informative than a story where nothing went wrong. The system once accused itself of leaking a document to someone who was allowed to see it, because the test data was mislabelled. One security rule had no test exercising it, because a stricter rule kept masking it. And one check passed or failed almost at random, because the AI's own judgement had been allowed to decide something security-critical. The fix made that security decision a hard rule, never a model's mood.

The platform beat holds on any stack. A search index built from governed data does not inherit the data's governance, because it is a copy. A revocation in the source does not reach the index downstream, so the check has to happen again, live, at query time. That is true of any architecture where a vector index sits next to but separate from operational data.

Offer the limitations beat before you are asked. The test set in that build is 22 documents. At that size almost every retrieval strategy scores well, so the differences between the six strategies benchmarked are mostly noise. Dense retrieval would be the right production choice for a corpus this small. The small size does not weaken the zero-leak guarantee or the testing discipline behind it. For a real customer the corpus would be larger and tiered. The storage-isolation strategy would be designed for tenant growth up front, and the scale caveat instrumented from day one.

Close on whichever thread the conversation ended on. On trust: an FDE's job is turning a technical guarantee into something a customer's security team can sign off on. On platforms: never assume a guarantee travels between systems until it has been verified on their specific platform. On limitations: say exactly where the proven edges are before someone else finds them.
