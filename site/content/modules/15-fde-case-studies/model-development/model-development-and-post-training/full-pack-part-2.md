# Model Development and Post-Training, part 2

## 7. Reward Correct Answers, Not Confident Ones

In post-training the model learns to find answers, because it trains on its own attempts rather than on someone else's solutions. The loop is always the same shape. Sample several answers per problem. Score them. Push the model toward the higher-scoring ones.

The scorer drives the design, and math offers three choices.

| Scorer | What it checks | When to use it | Risk |
|---|---|---|---|
| Verifier on the final answer | Does the answer match the reference, checked by program? | Problems with a checkable final answer; the default for math | Rewards a right answer reached by wrong working |
| Reward model on steps | Is each step of the working valid? | Proofs and multi-step problems where the path matters | A learned reward model can be gamed; needs step-labelled data |
| Preference pairs | Which of two answers do graders prefer? | Style, clarity, tutoring tone, anything not checkable by program | Graders prefer confident, long answers unless told otherwise |

- Two update methods sit on top of the scorer. RLHF trains a separate reward model from human comparisons, then optimises the policy against it with a penalty for drifting too far from the starting model.
- DPO, direct preference optimisation, skips the separate reward model. It trains directly on preferred-versus-rejected pairs and gets the same drift control implicitly.
- DPO is simpler to run and usually more stable, though a well-tuned PPO can still beat it.
- RL with a verifier is stronger when a program can check correctness, as it can in math.

The drift penalty is not optional. A policy optimised against any scorer without it will find the scorer's blind spots. A lenient answer-matcher gets answers that format like the reference but are wrong. A length-biased reward model gets padding. Keep the penalty, and audit high-reward samples by hand every round.

> *"For math I would lead with reinforcement learning against a program that checks the final answer, because correctness is verifiable. I would keep a penalty for drifting from the SFT model, add a step-level reward only if working quality is a stated requirement, and use preference data for tone."*

## 8. Evaluate on Problems the Model Has Never Seen

- An eval score is only as honest as the wall between training and test data.
- A worked example shows why. A fine-tune reported 94% on a held-out set against an 81% baseline, then hit only about 78% in production.
- The held-out set was split at random from traces with heavy duplication.
- After dedup, a time-based split and human relabelling, the retrained model's honest score was near 83%, and its later production result landed within two points of that.
- When an offline gain looks surprisingly large, suspect leakage first.

Build the eval suite in five slices.

| Worry | Measure |
|---|---|
| Does it solve problems it has never seen? | Pass@1 on a decontaminated held-out set, split by source and time |
| Is the working right as well as the answer? | Graded sample of solutions; answer-consistent working rate |
| Did it forget everything else? | Fixed general benchmark suite with a maximum allowed drop |
| Does it invent answers to broken problems? | Slice of ill-posed and unanswerable problems; fabrication rate |
| Did it get more harmful or more timid? | Harmful-request set and benign-but-scary set, both reported (section 10) |

Report sampling settings with every number. Pass@1 at temperature zero and majority vote over eight samples are different measurements. Report both if both are used, and never compare one with the other.

- The Foundations evaluation lab shows the simplest version: run the model over a test set, compare with expected answers, then try a public benchmark, ARC.
- Exact-match comparison is where every eval starts.
- The release gate for this pipeline follows the same logic as the Evaluation and Release Gating case’s evaluation and release-gating page: fixed suites, thresholds agreed in advance, and a gate that blocks rather than advises.

## 9. Scale Training Under a Fixed Compute Budget

The compute-budget prompt changes the training stage. "Design a scalable, efficient system for training an LLM given compute and data constraints" is the same pipeline with pretraining back in scope and the budget fixed.

- Start from the budget, not the model. A widely used rule of thumb from compute-optimal scaling work is roughly 20 training tokens per parameter.
- For a 7B model that is 140B tokens. The compute is then 6 × 7e9 × 1.4e11 = 5.88e21 FLOPs.
- At an assumed 3e14 effective FLOP/s per GPU, that is about 5,444 GPU-hours, or about 21 hours on 256 GPUs *(assumptions; arithmetic exact)*.
- If the budget is smaller, shrink the model before shrinking the data.

Distribute the work in the order the memory forces it.

| Constraint | Technique | What it buys |
|---|---|---|
| Model fits on one GPU; want speed | Data parallelism: replicate the model, split the batch | Near-linear throughput until communication dominates |
| Optimiser state does not fit | Sharded data parallelism (ZeRO or FSDP): split weights, gradients and optimiser state across GPUs | Memory per GPU falls with the number of GPUs |
| One layer does not fit | Tensor parallelism: split each matrix across GPUs in a node | Keeps giant layers trainable; needs fast links inside the node |
| The whole model is too deep | Pipeline parallelism: split layers into stages | Spreads depth across nodes; bubbles cost utilisation |
| Activations do not fit | Activation recomputation and mixed precision | Trades extra compute for memory |

The data constraint is a pipeline problem. Stream shards from object storage rather than loading a dataset. Deduplicate and filter quality before training, because a repeated token costs the same as a new one and teaches less. Record the exact shard order, so a resumed run sees the same data in the same order.

- Checkpointing is how the run survives failure. At hundreds of GPUs over days, some hardware will fail.
- Write checkpoints to durable storage on a fixed interval, including optimiser state and data-loader position.
- Resume automatically from the last good one. Watch for loss spikes and roll back to the checkpoint before the spike rather than training through it.
- Track model FLOPs utilisation as the efficiency metric: a GPU-hour spent waiting on communication or input teaches the model nothing.

> *"I size from the budget: tokens per parameter picks the model size, six N D gives the FLOPs, and memory picks the parallelism. Then I make the run survivable: sharded state, streaming data with a recorded order, and checkpoints that include the data position so a failure costs minutes, not days."*

## 10. Trade Harm Against Helpfulness on One Chart

The harm-versus-helpfulness prompt changes the post-training and eval stages. "Design a language model that minimises harmful outputs while staying useful" is a two-sided objective. A model that refuses everything is perfectly harmless and useless. Measure both sides, or the optimisation will quietly collapse to one of them.

- Plot two numbers against each other for every checkpoint. The first is the harmful-compliance rate: on a set of genuinely harmful requests, how often does the model help?
- The second is the over-refusal rate: on a set of benign requests that merely look risky, how often does it refuse?
- "How do I kill a stuck Python process?" belongs in the second set.
- A release moves down on the first number without moving up on the second.

- Post-training carries the policy. Write the policy down first: what is disallowed, what is allowed with care, what is always allowed.
- Collect preference pairs where the preferred answer is the one that follows the policy.
- That includes pairs where the preferred answer helps and the rejected one refuses needlessly.
- Train with RLHF or DPO on those pairs. AI feedback against the written policy, the Constitutional AI idea, scales the labelling when human graders are the bottleneck.
- Humans still audit a sample.

- The enterprise RAG design's output guardrail makes the same point at the application layer.
- Its sufficiency check has three verdicts, not two: sufficient, partial and insufficient.
- The middle one exists because refusing a whole two-part question when only one part is unanswerable is a common over-refusal.
- The model-level version is the same idea. Answer the safe part, decline the unsafe part, and say which is which.

Red-team continuously. Attack prompts change faster than training runs, so keep an adversarial set that grows from real attempts and run it in the eval gate. A layered deployment adds a separate safety classifier on inputs and outputs. That lets the policy tighten between training runs without retraining the model.

## 11. Shrink the Model Without Shrinking Its Manners

The on-device prompt changes the deploy stage. "Design a small LLM that runs on a phone while staying polite" fixes a memory and latency ceiling, and it names politeness as an alignment target.

Size the weights first. Memory for weights is parameters × bytes per parameter.

| Model | 16-bit | 8-bit | 4-bit |
|---|---|---|---|
| 3B parameters | 6 GB | 3 GB | 1.5 GB |
| 1B parameters | 2 GB | 1 GB | 0.5 GB |

- A phone shares its memory with the operating system and other apps.
- Assume a budget of 1 to 2 GB for the model *(assumption)*.
- That points at about a 1B model at 4-bit; a 3B model needs ~1.5 GB for weights alone, so it only fits at the top of that budget.
- The air-gapped chapter's sizing adds that weights are not the whole bill: runtime overhead, the KV cache at the target context length and buffers come on top.
- Cap the context length, because the KV cache grows with it.

- Two techniques make the small model good enough. Distillation trains the small student on a large teacher's outputs.
- Standard system-design references frame it the same way: a smaller model trained on a larger one's outputs for a task-specific workload.
- A hard cost or latency ceiling is one of the three situations where parameter updates earn their cost, and distillation is how you meet it.
- Quantisation then compresses the trained student. Quantisation-aware training, which simulates low precision during training, loses less quality than quantising after the fact.

- Politeness is a preference target, trained like harmlessness. Write a short tone policy.
- Collect preference pairs where the polite answer wins and the obsequious or curt one loses.
- Include the teacher's polite outputs in the distillation data, so tone transfers with capability.
- Evaluate politeness with a rubric grader on a fixed prompt set, including provocative user messages, because politeness is only tested when the user is rude.

Measure everything on the device, not on the server. Report quality of the quantised student against the full-precision student and the teacher. Report time to first token and tokens per second on the slowest supported phone. Report battery drain per session. A quality eval run on the unquantised model does not describe what users get.
