# Four Learning Surfaces

*Retraining feels like the serious fix, but each step down from context to weights costs about ten times more to change and to undo.*

◷ 5 min

An agent that improves over months is not necessarily being retrained. Improvement can live in four places, so try the cheap ones first and reach for model weights last.

**Objectives:**

- name the four places an agentic system can learn, and compare their cost and reversibility;
- choose examples per request instead of hard-coding them;
- run Reflexion-style retries only when an external signal can judge the attempt.

---

## Work Down the Four Surfaces

The book *Cracking Agentic AI System Design Interviews* follows an operations agent that has been live for months and is slowly getting better. Its question is where that improvement lives. The answer is four surfaces, each roughly ten times slower and costlier to iterate on than the one before.

| Surface | What changes | How fast it can change | How it is undone | What it costs |
|---|---|---|---|---|
| Context | Instructions, examples and retrieved evidence | Minutes | Immediately | Tokens on every request |
| Memory | Stored facts, preferences and corrections | At once | By writing a newer fact over it | Storage and retrieval |
| Procedure | Validated tool sequences and playbooks | Hours | By pinning an earlier version | Evaluation runs |
| Parameters | The model's weights | Days to weeks | Only by redeploying | Training and serving |

Work down this table, not up. Most teams that reach for fine-tuning have not yet fixed their tool schemas, retrieval or example selection. Fine-tuning then bakes those defects into weights that take weeks to change.

Asked "how would you improve an underperforming agent?", walking down these four surfaces in order is the answer. It shows where cost actually lives, not just that fine-tuning exists.

## Pick Examples for This Request

A fixed set of few-shot examples in the system prompt is chosen for the average request, so it suits none in particular. Choosing examples that match the current request measurably improves formatting and tool selection. "Restart service X" and "roll back flag Y" should not see the same three examples.

Dynamic selection has four steps. Find candidate examples by similarity to the input. Rank them by how well each recorded run actually turned out, not just how similar it looks; a similar but mediocre run teaches mediocrity. Enforce diversity with a maximal-marginal-relevance pass, so the set covers different shapes of the problem rather than three near-copies. Where traffic clusters, cache one example set per cluster.

The book scores each candidate as `λ × relevance − (1−λ) × redundancy_to_already_selected + 0.15 × outcome_score`. The redundancy term stops three examples of one shape from crowding out the one that matches this request.

Watch the prompt cache. Examples sit above the user's turn in the context. Swapping them per request invalidates the provider's prefix cache, which is why per-cluster caching matters.

## Reflect Only With an External Judge

Reflexion turns a failure into a written lesson placed in context for the next attempt. Nothing about the model changes. It is a runtime mechanism, not training.

It needs three things. An external failure signal, such as a test result, a schema validator or an API rejection. A specific lesson, such as "ISO 8601 UTC expected, I sent local time", not "be more careful". And a hard cap on attempts, after which the agent escalates instead of reflecting again.

Without an external judge, the model grades its own attempt and tends to write a confidently wrong lesson. That lesson then contaminates every attempt after it.

> **Warning: fine-tuning freezes today's defects.** If retrieval, tool schemas or examples are still wrong, training on the agent's behaviour preserves those errors in weights that take weeks to change. Fix the cheaper surfaces first.

## Worked Example: The Operations Agent That Sends Bad Timestamps

The operations agent keeps failing an API call because it sends local time. A team member proposes fine-tuning. Walking down the surfaces gives a cheaper path.

First, context. The tool description gains the expected format, and dynamic selection now pulls past successful calls to this API as examples. Next, runtime reflection: the API's rejection message is an external signal, so a Reflexion retry writes "ISO 8601 UTC expected, I sent local time" and tries again, up to a fixed cap. The failures stop within minutes of the change, and the change can be reverted instantly.

No weights changed. The fix lived on the cheapest surface that could hold it, which is the discipline the book argues for.

---

## Key Takeaways

- Learning can live in context, memory, procedure or parameters, each roughly ten times costlier to change than the last.
- Exhaust the cheap surfaces before fine-tuning, because training preserves unfixed defects.
- Select few-shot examples per request by similarity, rank them by recorded outcome, enforce diversity and cache per cluster.
- Use Reflexion only with an external failure signal, a specific lesson and a bounded number of attempts.

## Check Yourself

1. **How would you improve an underperforming agent?**
   Walk down the surfaces: fix context first (instructions, examples, retrieval), then memory, then procedures, and change weights only if those are exhausted.

2. **Why rank candidate examples by outcome and not only by similarity?**
   A similar example from a mediocre run teaches the model to be mediocre.

3. **What three things must a production Reflexion loop have?**
   An external failure signal, a lesson specific enough to change behaviour, and a hard cap on attempts before escalation.

