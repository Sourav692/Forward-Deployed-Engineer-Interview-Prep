# Enterprise Coding Assistant Under 300 Milliseconds, part 3

## 12. Gate the Release on Acceptance and Safety, Not Fluency

The product metric is the acceptance rate, because a completion the developer deletes cost latency and money and taught the model nothing. Measure accepted, partially accepted and rejected suggestions per task, per language and per repository, and treat a drop as a regression even when offline benchmarks improve *(table is own construction; the metrics are drawn from the sources)*.

| Metric | Good threshold | Bad threshold | Dataset / method | Owner |
|---|---:|---:|---|---|
| Acceptance rate | At or above baseline per task and language | Sustained drop | Production telemetry, segmented | Product |
| p95 inline latency | Under 300 ms; first token under 100 ms | Breach at peak | Load test plus telemetry by stage | Platform |
| Hallucinated-API rate | Below agreed bar; every case caught by validation | Reaches the editor | Symbol-index check on sampled suggestions | ML / eval |
| Secret or licence leak | 0 | Any case | Scan every suggestion; red-team with planted secrets | Security |
| Cross-repository leak | 0 | Any case | Same completion as developers with different repo access | Security |
| Cache hit rate | Rising with traffic; never across scopes | Falls after a change | Telemetry; cache-key audit | Platform |
| Cost per thousand completions | Within budget | Rises with flat traffic | Tokens in and out by model | Finance |
| Developer productivity | Time-to-merge and rework rate improve for adopters vs a matched control | No difference | Controlled rollout, statistical power decided in advance | Product |

The OpenAI-style practice prompt's follow-up asks how to evaluate whether the assistant improves developer productivity. Acceptance rate alone is not enough. Compare adopters against a matched control on time-to-merge, review rework and defect rate, decide in advance how large an improvement would matter, and test on enough developers to tell that improvement from noise. LLM outputs vary, so a handful of examples cannot declare a winner.

Run the evaluation ladder cheapest first. Prompt unit tests on every template change, so a broken template or a missing variable fails before the expensive suite. Golden-set evaluation on every build change. A scheduled nightly run against yesterday's baseline, because a moving alias like `gpt-4o` can be repointed to a new snapshot with no commit on the customer's side, unless you pin a dated snapshot. A/B tests in production on prompts, retrieval strategies and models.

## 13. Roll Out One Repository at a Time

Week one at a customer is not the whole diagram *(section is own construction, following the sibling pages' rollout shape)*. It is one repository indexed under its real permissions, three developers with different access levels, and the leak test standing: the same completion requested by each of the three, asserting nothing crosses.

| Stage | Gate |
|---|---|
| Week 0-1 | Name the workflow, the latency budget, the success metric (acceptance rate), the repositories in scope and the non-goals; confirm the training-consent position in writing |
| Week 1-2 | Index one repository on push with the permission mirror; validate chunking by symbol; completion from cache and local context only |
| Week 2-3 | Enable retrieval; build the cross-repository leak suite and the planted-secret suite; any exposure blocks release |
| Week 3-4 | Silent mode: generate suggestions for a pilot team without showing them; measure hallucinated-API rate and latency by stage |
| Week 5 | Inline completion live for one team; explain and tests on the slow path; telemetry without source |
| Week 6-8 | Add repositories one at a time, each with its own ACL check and re-index trigger; enable refactor and bug fix behind the larger model |
| After | Widen only while leaks stay at zero, p95 holds under 300 ms and acceptance rate holds; run the nightly regression from day one |

## 14. Deliver It in Sixty Minutes

Spend the hour on the funnel, the cache, the budget and the security story, because those are what the prompt names. The vector database choice is a sentence.

| Minutes | Phase |
|---|---|
| 0–8 | Clarify: the five questions, the 300 ms budget, the private-repo constraint (section 1) |
| 8–15 | The diagram and the eight-step keystroke walk (sections 4 and 5) |
| 15–35 | Deep dive: funnel, cache, routing, validation (sections 5 to 8) |
| 35–45 | The latency arithmetic and scaling (section 9) |
| 45–55 | Security, failure modes, evaluation (sections 10 to 12) |
| 55–60 | Close: three sentences, trade-offs, week one (section 13) |

The three-sentence close, from the source's summary:

> *"A retrieval-augmented, context-engineered system, not one call to a big model. Gather and prioritise context instead of sending repositories, retrieve semantically, route across models to balance latency, cost and quality, and validate every output. Scale from stateless servers, sharded vector databases, autoscaling inference, streaming and multi-region; secure it with tenant isolation, repository-level access control, secret masking and private deployment for regulated industries."*

The two-minute spoken answer *(own construction from the source's summary and checkpoint)*:

> *I would start with the two constraints, not the model. Suggestions have to arrive in under 300 milliseconds, and the assistant has to understand a private repository without leaking any of it. Those two decide the shape. Context engineering is a funnel: the whole workspace narrows to the current file, imports, open tabs, cursor and recent edits, then semantic search over a symbol-indexed repository ranks the snippets that matter, and only that ranked context becomes the prompt. A scoped completion cache sits in front of the expensive path, so a completion the assistant has effectively seen before skips embedding, retrieval and the large model. The router sends inline completion to a small fast model and explanation, tests, bug fixes and refactors to a larger reasoning model, because those are things a developer waits for. Every output is validated before it reaches the editor: syntax, hallucinated APIs checked against the symbol index, secrets, licence, unsafe patterns. The budget decomposes as ten milliseconds for the cache check, forty for context assembly, two hundred for streamed inference and fifty for validation. Security shapes it from the first question: retrieval respects repository permissions mirrored from the code host, secrets are masked before context leaves the IDE, nothing trains on private code without consent, and regulated customers get private deployment. I would prove it with acceptance rate per task, p95 by stage, a zero on cross-repository and secret leaks, and a controlled productivity comparison, rolling out one repository at a time.*

The lines that carry the round *(own construction from the source's arguments)*:

1. *"A coding assistant is a context-engineering problem before it is a model problem."*
2. *"Cache first, retrieve on a miss, route by task."*
3. *"The funnel narrows the repository to signals, signals to ranked context, ranked context to the prompt. Never send the repository."*
4. *"Ten, forty, two hundred, fifty. Say the budget before anyone asks."*
5. *"Streaming changes when the developer sees the first token, not how long generation takes."*
6. *"Detect hallucinated APIs against the symbol index. Correct-looking is not correct."*
7. *"Retrieval respects the code host's permissions. The assistant never shows code the developer could not open."*
8. *"Acceptance rate is the product metric. A deleted completion cost money and taught nothing."*

The follow-ups arrive in a predictable order, and each has a prepared answer.

| Follow-up | Answer |
|---|---|
| How do you avoid leaking customer code? | Isolate by tenant; never use private repos for training without permission; retrieve only what the user is authorised to access; mask sensitive information before prompts; offer private or on-prem deployment; strict access control and audit |
| How do you get below 300 ms? | A lightweight model for inline completion; stream tokens; persistent connections from the IDE; cache embeddings and frequent completions; semantic indexing in the background; inference close to users; limit retrieved context; speculative decoding where supported |
| How do you personalise? | Learn coding style; prioritise project-specific APIs; incorporate accepted vs rejected suggestions; respect repository standards and lint rules; tailor prompts to developer and team preferences while keeping raw source protected; refine retrieval on feedback |
| How would you evaluate whether the assistant actually improves developer productivity? | Acceptance rate first, then a controlled comparison of adopters against a matched group on time-to-merge, review rework and defect rate, with the effect size and sample decided in advance so noise cannot declare a winner |
| Why is the completion cache placed where it is, and what does a hit skip? | In front of the expensive path; a valid hit skips embedding, retrieval and the model, and goes to output validation. A cache after the fan-out saves nothing |
| Draw the funnel and name what each stage removes | Repository to signals removes unrelated files; signals to ranked context removes distant history; ranked context to prompt fits the window |
| What does output validation check, and why hallucinated APIs? | Syntax, formatting, security filters, hallucinated APIs, unsafe patterns. A call to a method that does not exist looks right until it compiles |
| How does the access-control problem from enterprise RAG reappear here? | Retrieval over code is retrieval over documents with owners; mirror repository permissions into the index and check them at retrieval, two layers, exactly as in the Enterprise Knowledge Assistant case |
| How do you prevent insecure code generation? | Security filters and unsafe-pattern removal in validation; static analysis and test execution on the slow path; secret scanning on output; a planted-vulnerability red-team suite |

Repair the common weak answers on the spot. "Use the best model for everything" becomes route by task and keep the hot path small. "Send the whole file, or the whole repo" becomes the funnel. "We'll cache the responses" becomes cache in front of the expensive path and never across scopes. "Fine-tune on the customer's code" becomes retrieval under their permissions, with training only by explicit consent. "It's fast enough" becomes ten, forty, two hundred, fifty. "We measure suggestions served" becomes acceptance rate.
