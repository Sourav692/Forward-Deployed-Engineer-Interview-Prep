# Answer quality and model fallback: the ideas behind problems 42, 45, 46

A GenAI product has to answer two questions all day: "is this answer good enough to show?" and "what do we do when the model fails?" These problems give simple, explainable answers to both, and they show where simple rules stop being enough.

## Baseline evaluation

A baseline is the simplest score you can compute the same way every time, such as "what share of the expected facts does the answer mention?" It is not the final measure. It is a floor that tells you when something obviously broke.

Why it matters: when a team changes a prompt on Friday, a keyword baseline run over 200 saved questions can show on Monday that answers stopped mentioning the refund window. It is cheap, fast and easy to explain to a customer.

> Say it like this: "This baseline is useful because it is explainable, but it cannot catch contradictions or made-up claims."

## Known blind spots

Every simple score has cases it gets wrong, and you should name them before the interviewer does. Keyword matching cannot see negation ("no refunds" still matches "refund"), synonyms ("one month" versus "30 days") or partial words.

Why it matters: a team that treats a 0.9 keyword score as "90 percent correct" will ship answers that say the opposite of the policy. Naming the blind spots shows you know when to add human review or a model-graded judge.

> Say it like this: "A score is only useful if I know which mistakes it cannot see."

## Grounding and hallucination

A grounded answer is one supported by the documents the system retrieved. A hallucination is a claim the sources do not support. Citations help only if they point to documents we actually retrieved and those documents back up the claim.

Why it matters: a model can produce a neat citation like "[policy_7]" that was never in the context. If the system counts any citation as support, the fake one lowers the risk score. Checking citations against the retrieved ids catches that cheaply.

> Say it like this: "Citations reduce risk only if I verify they point to context the model was actually given."

## Thresholds and boundaries

A threshold turns a number into a decision, such as "retrieval score under 0.6 means medium risk". The exact boundary (is 0.6 medium or low?) must be decided on purpose and tested.

Why it matters: off-by-one mistakes at a boundary change real outcomes. In a regulated domain like insurance, the customer may want stricter thresholds than in an internal FAQ bot, so the numbers should be easy to find and change.

> Say it like this: "I test the exact boundary value, because that is where these rules usually break."

## Fallback without bypassing safety

Fallback means trying a backup model when the main one fails. It is good for temporary errors like timeouts. It is wrong for a safety refusal, because asking another model until one says yes just routes around the safety rule.

Why it matters: an attacker who knows the fallback order can send a harmful request, get blocked by the first model, and receive an answer from a weaker backup. Stopping at the first safety block closes that hole.

> Say it like this: "Fallback improves uptime, but it must never become a way to bypass safety."

## Watch the fallback rate

The fallback rate is the share of requests answered by a backup model instead of the main one. It should be tracked and alerted on, not hidden.

Why it matters: a backup model may be cheaper, slower or weaker. If the main model quietly fails for a week, users still get answers, but quality drops and nobody notices until a customer complains. A rising fallback rate is an early warning.

> Say it like this: "Fallback keeps the lights on, but I track how often it happens, because a hidden fallback is a hidden quality drop."

## How the problems use these ideas

- **Problem 42, Simple Evaluator Scoring:** a baseline score with clean, repeatable rules. An empty keyword list returns `None` so a broken eval set never looks like a pass. The "No refunds" test case shows a known blind spot on purpose.
- **Problem 45, Model Fallback Logic:** fall back on ordinary failures, stop on a safety block. Blank text is not an answer. In production, the fallback rate is the number to watch.
- **Problem 46, Hallucination Risk Scoring:** grounding checked by matching citations to retrieved ids, then thresholds on the retrieval score, with the boundary tested.

## Using an AI assistant on these problems

- Ask for the empty or nothing-to-score case explicitly. Assistants often return `1.0` for an empty keyword list, which hides broken data.
- For fallback, put "stop and return None on safety_block" in the prompt, then read the loop to be sure it returns instead of continuing.
- For risk scoring, ask the assistant to list the boundary values it tested. Add `0.6` yourself if it did not.
- Ask the assistant to name two cases its function gets wrong. A good answer (negation, synonyms, real citation with wrong claim) is also a good thing to say in the interview.

## Words to know

| Term | Plain meaning |
| --- | --- |
| Baseline | The simplest repeatable score, used as a floor. |
| Eval set | A saved list of questions with known good answers, used to test changes. |
| Grounded | Supported by the documents the system retrieved. |
| Hallucination | A claim the model makes that its sources do not support. |
| Retrieval score | How closely the best retrieved document matches the question. |
| Threshold | A cut-off number that turns a score into a decision. |
| Fallback | Trying a backup model when the main one fails. |
| Safety block | The model refused because the request broke a safety rule. |
