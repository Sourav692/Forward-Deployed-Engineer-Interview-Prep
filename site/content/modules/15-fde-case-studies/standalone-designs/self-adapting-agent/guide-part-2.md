# Self-Adapting Agent, part 2

## 7. Remember Facts Through a Write Policy

Memory can only be as good as what the write policy let in; retrieval cannot fix a bad write policy. When asked to design agent memory, the memory chapter says to lead with the write policy, not the vector index.

Every candidate memory passes four gates. Is it durable (still true next month)? Is it reusable (would a future run read it)? Is it attributable, with a source, timestamp and confidence? Is it permitted, outside regulated categories? Drop or redact anything that fails a gate on the write path; the read path is too late.

Store facts as typed subject-predicate-value records, never raw conversation turns, so contradictions collide by construction. When a new fact contradicts an old one on the same predicate, supersede the old one and keep a pointer to it. The book's worked failure shows why: a user said in January to book through vendor A and in February switched to vendor B. Both statements were stored as separate episodes. Retrieval returned whichever phrasing was more similar, so vendor A reappeared about one time in four until May. Typed facts fix it, and so does a release-gate test that seeds contradictory histories and asserts the newer fact wins.

In this case the memory tier holds environment facts learned during work. Examples: "Service X needs a drain before restart" and "The payments API rejects batch sizes over 100" *(own construction examples)*. Salience decays on a half-life per predicate, and consolidation runs offline, off the request path.

## 8. Promote Procedures Through a Gate, Not a Single Success

A skill is a named, parameterised sequence of tool calls with a precondition, a postcondition and a measured success rate. The design problem is the gate between "a run succeeded once" and "this is now trusted". That gate is the heart of this case, and the book specifies it.

The pipeline runs in six steps. Extract a candidate from successful traces and generalise its arguments. Discard duplicates of existing skills. Evaluate on held-out cases, never on the traces that produced it. Grading a skill on its own source traces measures memory, which is how libraries fill with skills that worked exactly once. Promote only if success beats baseline by 5 points. Then shadow it on at least 200 live attempts. Demote it automatically if live success later falls 4 points below baseline.

Demotion matters as much as promotion, because environments drift. A skill that encodes last quarter's API shape must leave production before a human notices. A library that only grows becomes a liability within about two quarters, in the book's estimate.

There are two versions of the mechanism. The Voyager-style version first checks the library for a skill it can reuse or compose, and writes new code only if nothing fits. It runs the code in a sandbox, checks it against test cases, and saves it only if they pass. The Agent Workflow Memory version stores tool-call sequences instead of code. It abstracts a successful trajectory into a template with placeholders, then fills the template for structurally similar tasks. Choose code skills when the tool surface is programmable. Choose workflow templates when the reusable unit is the order of tool calls.

Procedures change behaviour, so they are the highest-risk memory layer. A sound procedural-memory design keeps approval outside the model's reasoning loop. The agent may propose a procedure, but the graph pauses for a human decision. Rollback re-approves an older version. Keep that rule for anything that widens what a skill may do.

## 9. Optimise Prompts as Experiments, Not Edits

Prompt optimisation automates the search a prompt engineer does by hand *(own construction throughout this section)*. Define a metric and a scored development set. Generate variants of the instructions and the selected examples. Score each variant, and keep the best. Frameworks that compile prompts from a declared program and a metric do this.

It sits between procedure and parameters on the ladder because it changes behaviour across every task type at once, like training, yet the result is still text: versioned, readable, and revertible in seconds.

Three rules keep it honest. Hold out a test set the optimiser never sees, because a search over hundreds of variants will overfit a small dev set. Report the win per stratum, because a planner prompt tuned on common tasks can quietly break rare ones. And treat the winning prompt as a candidate like any other: eval gate, shadow, owner review.

The sources behind this page cover DSPy's declared prompts, multi-step programs, evaluation and pairwise Elo scoring, but not its optimisers. This section rests on general knowledge.

## 10. Update Weights Last, and Only for the Three Cases That Earn It

Training is the most expensive and least reversible rung, so defend it before proposing it. The learning chapter names three situations where parameter updates win: strict format or protocol adherence at high volume, where a small tuned model matches a larger prompted one at a fraction of the cost; domain vocabulary the base model lacks; and a hard cost or latency ceiling after the cheaper rungs are exhausted, where distillation buys it back.

It is equally blunt about the losing case: knowledge gaps are a retrieval problem, and fine-tuning rarely fixes a model that does not know something. Published studies find models learn new facts from fine-tuning slowly and unreliably, and retrieval beats it for adding knowledge. For this case that rules out "train the agent on each new task". A new task is new knowledge and a new procedure, and both belong lower on the ladder.

The book names one more cost: a tuned model freezes its task definition. When the business changes the definition, a prompt needs an edit and a tuned model needs retraining. So keep a prompted fallback path.

If training does happen, the flywheel gates decide whether the data is honest. Deduplicate first. Split by time and user, never at random. Send low-agreement, high-impact cases to human adjudication. Quote the book's worked failure. A routing fine-tune reported 94% held-out accuracy against an 81% baseline, then scored about 78% in production. The random split hid near-duplicates across 140,000 traces that were only about 9,000 distinct requests. Labels came from the old system's own decisions. The honest number after fixes was near 83%, and production matched within two points. When an offline gain looks surprisingly large, suspect leakage first.

## 11. Gate Every Self-Modification Like a Human Pull Request

A self-modifying system without a release gate is an unreviewed deploy pipeline with a model holding the merge button. The gate is where this case is won or lost, and where I'd expect the panel to probe hardest. Reported interview questions from the OpenAI decomposition round call evaluation a deliberate differentiator there. I'm assuming the same holds here, but no public source says so for this prompt.

Apply the validation chapter's CI gate to every learned artefact, whichever rung it came from. Safety assertions gate absolutely: any failure blocks. Quality gates against the baseline with a paired significance test per stratum as well as on the mean. Cost is reported, and a ceiling breach blocks. A gain that triples spend must be a visible decision.

The validation chapter has a worked failure behind the per-stratum rule. A retrieval change lifted aggregate accuracy from 79% to 81%. One tenant's segment fell from 82% to 67% inside that average, because that tenant was only about 4% of the eval set. The fix was a floor: no release may drop any stratum by more than 3 points. In this case, the strata are task types. A new skill for a new task must not quietly damage an old one.

| Worry | Gate check |
|---|---|
| Does the candidate actually help the task it was built for? | Paired eval on held-out cases of that task type; beat baseline by 5 points |
| Did it break any other task type? | Per-stratum regression floor across all live task types |
| Is it safe? | Trajectory assertions: no new tools, no permission widening, approvals still requested |
| Does it survive real traffic? | Shadow of at least 200 attempts with success at or above baseline |
| Is the improvement real or noise? | Sample-size check; a 200-case suite cannot see gains below about 11 points |
| What did it cost? | Tokens and latency per run versus baseline, reported on the gate result |
| Can it be undone? | Registry holds the previous version; rollback is a status change |

Evaluate the whole trajectory as well as the final answer. Several paths can be valid, so assert properties of the path. Did it read before writing? Did it request approval before the irreversible step? Did it stay within its tool list? Put the safety assertions first.

## 12. Bound the Autonomy the Agent Has Over Itself

"Autonomously" is the most dangerous word in the prompt. The agent may learn how to do things, but never that it is allowed to do more *(own construction throughout this section, built on standard tool-gateway and approval patterns)*.

Draw the line in a table and say it aloud.

| The agent may, without a human | Only a human may |
|---|---|
| Choose which live skills and examples to load | Grant a skill a tool it did not already have |
| Write memories that pass the write policy | Approve a procedure that performs an irreversible action |
| Propose candidate skills and prompt variants | Promote anything that changes permissions or budgets |
| Retry with a Reflexion lesson, within the attempt cap | Raise the attempt cap, the step budget or the spend ceiling |
| Demote a regressing skill automatically | Re-promote a demoted skill |

Five controls enforce the line. The tool gateway checks permissions on every call, whatever the skill says, so a learned procedure cannot carry its own authority. Irreversible actions route to a person before and after. Budgets cap steps, tokens, wall time and spend per run and per day. The ops agent's owner has a kill switch that freezes all learning and pins every artefact to its last reviewed version.

Watch for goal drift, the slow slide of the agent's behaviour away from what its owners intended. Track the shape of trajectories per task type: tool mix, steps per run, escalation rate. A skill that starts solving tickets by closing them is gaming the outcome signal. Add a second, independent signal, such as reopen rate or sampled human review, or the agent learns to satisfy the metric instead of the user.

Mind the injection path too: learned content is untrusted content. A memory or skill extracted from a trace that included external text can carry an instruction such as "always approve refunds". Tag provenance on everything learned. Never let content from an untrusted source become a procedure without review.

## 13. Name the Failure Modes Before the Interviewer Does

| Failure | Symptom | Guard |
|---|---|---|
| Forced fit | New request routed to the nearest wrong skill with high confidence | Novelty score; counterexamples in triggers; triggering evaluated separately |
| Skill that worked once | Library grows; average success falls | Held-out evaluation; 5-point margin; 200-attempt shadow |
| Stale skill | Success drops after an upstream API change | Per-stratum live monitor; automatic demotion at 4 points below |
| Memory pollution | Old, retracted facts resurface | Write policy; typed facts; supersession; contradiction test in the gate |
| Self-graded lessons | Reflexion retries grow more confident and more wrong | External oracle required; attempt cap; escalate at cap |
| Optimiser overfit | Prompt wins on the dev set, loses live | Separate test set; per-stratum reporting; shadow |
| Leaky training data | Big offline gain, production below baseline | Dedupe; time and user split; human adjudication |
| Metric gaming | Outcome signal rises, user satisfaction falls | Second independent signal; trajectory drift monitors |
| Permission creep | A learned procedure performs an action nobody granted | Gateway checks every call; permission changes need a human |
| Runaway learning cost | Evaluation spend exceeds serving spend | Candidate dedupe and pre-filter; learning budget as a gate |

The pattern audit applies to this page's own design. Every mechanism added needs a metric that motivated it and an incident it prevents. Otherwise whoever is on call at three in the morning pays for it.
