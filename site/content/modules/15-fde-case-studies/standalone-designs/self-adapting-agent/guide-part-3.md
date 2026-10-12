# Self-Adapting Agent, part 3

## 14. Deliver It in Sixty Minutes

Spend the hour on the ladder and the gate. The repo's question bank flags evaluation as what sets strong candidates apart in the OpenAI round it covers, and I'm assuming the same here. The question bank's framework has six steps: clarify the mission, stakeholders and metrics, map inputs, decompose and sequence by risk, walking-skeleton MVP, then adapt live. The plan below follows it *(own construction)*.

| Minutes | Move | What to say |
|---|---|---|
| 0–5 | Clarify | What counts as new, what signals success, which actions are irreversible, who owns capabilities |
| 5–10 | Stakeholders and metrics | Capability owners and the platform team; time to competence, no-regression floor, cost share |
| 10–15 | Inputs | Traces, outcomes, tool schemas, owner reviews; which of them are trustworthy |
| 15–25 | Ladder | Five rungs, cheapest first; this design lives mostly on rungs 1 to 3 |
| 25–35 | Draw | Runtime loop, learning loop, one gate, registry with versions |
| 35–45 | Gate | Held-out, paired, per stratum; safety absolute; shadow; auto-demotion; sample-size arithmetic |
| 45–52 | Bounds | What the agent may change and what only a human may |
| 52–60 | Adapt live | Re-derive the part the new constraint touches |

The walking skeleton is rungs 1 and 2 plus the trace store. Ship the router, the fallback, dynamic examples, the memory write policy and traces. Add the skill library and its gate in the second increment, once a month of traces exists to evaluate against. Prompt optimisation comes third. Training comes last, if ever.

Expect a constraint change mid-round. "There is no reliable success signal" removes Reflexion and skill promotion. Adaptation falls back to human-reviewed memories and examples. "Tasks change daily" pushes everything down to rung 1 and rules out training. "Regulators require every behaviour change to be approved" keeps the whole design but makes owner review mandatory at every promotion.

These are the relevant Tier 2 probes from the question bank, answered for this design.

| Probe | Strong answer |
|---|---|
| How do you version and roll back agent behaviour, and A/B test it? | Every learned artefact is a registry version with status; rollback is a status change; shadow first, then canary with per-stratum guardrails |
| How do you keep long-term memory from getting polluted? | Four-gate write policy, typed facts, supersession with pointers, decay per predicate, and a contradiction test in the release gate |
| Working, episodic, semantic memory: when to retrieve vs ignore? | Retrieve under a token budget, scoped by tenant, with superseded facts dropped; ignore anything unattributable |
| Design an eval harness for a 99% task-success target | Per-stratum golden sets sized by the arithmetic; at p = 0.99, even small drops need large samples, so lean on paired evaluation and production monitoring |
| How do you detect goal drift or misalignment? | Trajectory-shape monitors per task type, a second independent outcome signal, and sampled human review |
| What logic belongs in the orchestrator versus the model? | Budgets, permissions, promotion and demotion live in code; the model chooses actions and proposes candidates |
| How do you detect and stop infinite planning loops? | Four bounds on the loop: steps, tokens, time, spend; the fallback mode gets tighter bounds than known skills |
| How do you control cost explosions? | Per-run and per-day budgets at runtime; a learning budget that blocks new candidates |
| When do you route to a human? | Irreversible actions, low-confidence novel requests, attempt caps reached, and any permission change |
| Metrics beyond task success? | Time to competence for new types, per-stratum regression, escalation rate, demotions per week, learning cost share |

## 15. Answer the Cost Pivot in Ten Minutes

The interviewer's pivot after a good design is "the learning loop costs more than serving". The repo has no playbook drill for this prompt, so the card below is *(own construction)*.

| | |
|---|---|
| Dominant driver | Evaluating too many near-duplicate candidates, each through a full paired suite; dynamic examples breaking the prefix cache on every request |
| Cheapest lever first | Dedupe candidates against the library before evaluation; pre-screen on a small smoke suite and send only survivors to the full suite; evaluate only the strata a candidate can touch plus a regression sample; cache one example set per traffic cluster |
| Metric that proves it | Learning spend as a share of serving spend; candidates evaluated per promotion; cache hit rate; cost per successful run |
| Do not | Cut the held-out or per-stratum checks to save money, or climb to fine-tuning because evaluation feels expensive |
| 60-second line | Learning cost is candidate volume times suite size. Dedupe and smoke-test candidates before the full gate, scope suites to the strata a change touches, and keep the prefix cache warm. The metric is learning spend per promotion. |

The four verbs from the cost playbook generate the same answer. Measure, by attributing spend to runtime versus learning and to each candidate. Route, by sending cheap changes through cheap checks and full suites only to survivors. Bound, with a learning budget that blocks new candidates when breached. Cache safely, by reusing baseline results across candidates evaluated against the same baseline version.

---

## Key Takeaways

- "Adapt" means five rungs, from context to weights, each about ten times costlier and harder to undo; design from the cheap end.
- Requirements become testable as time to competence, a per-stratum regression floor, a promotion margin, automatic demotion and a learning cost cap.
- Sizing shows rare task types cannot be promoted quickly and candidate volume, not training, drives learning cost.
- The architecture is a runtime loop and a learning loop that meet at one evaluation gate, with every artefact versioned in a registry.
- Detect novelty before handling it, and run unknown tasks in a fallback mode with tighter bounds and earlier escalation.
- Runtime adaptation uses outcome-ranked examples and Reflexion, and Reflexion needs an external oracle, a specific lesson and a cap.
- Memory is a write problem: four gates, typed facts and supersession keep it from polluting future runs.
- A skill earns production through held-out evaluation, a 5-point margin and 200 shadow attempts, and leaves automatically at 4 points below.
- Prompt optimisation is a search that overfits unless it has a hidden test set, per-stratum reporting and the same gate as everything else.
- Weights change last and only for format at volume, missing vocabulary or a latency ceiling, never for missing knowledge.
- Every self-modification passes the same gate as a human pull request: safety absolute, quality per stratum, cost visible.
- The agent may learn how to do things but never grant itself more permission, budget or irreversible reach.
- Name the failure modes, from forced fit to permission creep, each with its guard.
- The hour goes to the ladder and the gate, with a walking skeleton of rungs 1 and 2 plus traces.
- The cost pivot is answered by deduplicating and smoke-testing candidates, scoping suites and tracking learning spend per promotion.

## Check Yourself

1. **What are the five rungs of adaptation, cheapest first?** Context, memory, procedure, prompt optimisation, parameters.
2. **Which requirement stops a new skill from damaging an old task?** The per-stratum regression floor: no task type may drop more than 3 points.
3. **Why can a new task type seeing 30 requests a day not be promoted in two days?** The 200-attempt shadow minimum alone takes about a week at that traffic.
4. **Where do the runtime loop and the learning loop meet?** Only at the evaluation gate; the runtime reads live registry versions only.
5. **What should happen to a request the router cannot match confidently?** It goes to a general fallback with tighter bounds, approval on writes and earlier escalation.
6. **What three conditions does Reflexion need?** An external failure signal, a specific lesson and a hard cap on attempts.
7. **Why did the assistant keep proposing the old vendor?** Contradicting statements were stored as separate episodes rather than typed facts, so the older phrasing kept winning retrieval.
8. **What are the book's gate numbers for skills?** Beat baseline by 5 points offline, survive 200 live shadow attempts, auto-demote at 4 points below baseline.
9. **What keeps prompt optimisation from overfitting?** A test set the optimiser never sees, per-stratum reporting and the standard gate.
10. **Why not fine-tune the agent on each new task?** A new task is new knowledge and procedure, which belong to retrieval and skills; fine-tuning fixes missing knowledge slowly and unreliably.
11. **Aggregate accuracy rose from 79% to 81%. Why block the release?** One stratum fell from 82% to 67% inside the average; the gate checks every stratum.
12. **What may the agent never do on its own?** Grant a skill a new tool, approve an irreversible procedure, raise its own budgets or re-promote a demoted skill.
13. **How do you notice metric gaming?** A second, independent outcome signal and trajectory-shape monitors per task type.
14. **What is the walking skeleton?** Router, fallback, dynamic examples, memory write policy and the trace store.
15. **What is the sixty-second cost answer?** Learning cost is candidate volume times suite size; dedupe and smoke-test candidates, scope suites and track learning spend per promotion.

## References

### Fact-check sources (checked 27 Sep 2026)

- [Prompt caching — Claude API docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) — the cache is a prefix; a change invalidates that level and everything after it
- [Prompt caching — OpenAI API docs](https://developers.openai.com/api/docs/guides/prompt-caching) — reuse needs an exact prefix match; put variable content last
- [Reflexion: Language Agents with Verbal Reinforcement Learning (Shinn et al., 2023)](https://arxiv.org/abs/2303.11366) — lessons kept as text in an episodic buffer, no weight updates
- [Large Language Models Cannot Self-Correct Reasoning Yet (Huang et al., 2023)](https://arxiv.org/abs/2310.01798) — self-correction without external feedback often fails or makes answers worse
- [Voyager: An Open-Ended Embodied Agent with Large Language Models (Wang et al., 2023)](https://arxiv.org/abs/2305.16291) — skill library of executable code, refined with execution feedback and self-verification
- [Agent Workflow Memory (Wang et al., 2024)](https://arxiv.org/abs/2409.07429) — reusable workflows induced from agent trajectories
- [MIPROv2 — DSPy docs](https://dspy.ai/api/optimizers/MIPROv2/) — optimisers that search instructions and few-shot examples against a metric
- [Fine-Tuning or Retrieval? Comparing Knowledge Injection in LLMs (Ovadia et al., 2023)](https://arxiv.org/abs/2312.05934) — retrieval beats unsupervised fine-tuning for new knowledge
- [Does Fine-Tuning LLMs on New Knowledge Encourage Hallucinations? (Gekhman et al., 2024)](https://arxiv.org/abs/2405.05904) — new facts are learned slowly through fine-tuning and raise hallucination

