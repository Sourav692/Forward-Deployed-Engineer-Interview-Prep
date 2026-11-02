# Model Development and Post-Training, part 3

## 12. Decide When Parameter Updates Earn Their Cost

Training is the most expensive way to change a model's behaviour, so defend it before proposing it. Improvement can live in four places, in this order: context, memory, procedure and parameters. Each is slower and costlier to change than the one before; the rule of thumb is roughly ten times per step, an order of magnitude rather than a measurement. Work down that list, not up.

The book names three situations where parameter updates win. Strict format or protocol adherence at high volume, where a small tuned model can often match a larger prompted one at a fraction of serving cost. Domain vocabulary the base model lacks. A hard cost or latency ceiling after cheaper surfaces are exhausted, where distillation buys the ceiling back. It is as blunt about where they lose: knowledge gaps are mainly a retrieval problem, and fine-tuning is a weak, unreliable way to teach a model new facts.

Map the four prompts onto that rule *(own construction)*. The math model wins on reasoning behaviour that prompting cannot install. The training system is parameter updates by definition. The harm-versus-help model wins because refusal behaviour lives in the weights, with classifiers as a faster outer layer. The phone model is the latency-ceiling case. Say the rule aloud before the pipeline, so the interviewer hears that you justified training instead of assuming it.

A tuned model freezes its task definition, which is the cost the book asks to name. When the business definition changes, a tuned model needs retraining where a prompt needs an edit. Keep a prompted fallback path for that reason.

## 13. Deliver It in Sixty Minutes

Spend the hour on the scorer and the eval, because that is where these prompts separate candidates *(own construction)*.

| Minutes | Move | What to say |
|---|---|---|
| 0–5 | Clarify | Level of math, answer versus working, tools, users, base model |
| 5–10 | Requirements | Held-out pass@1, no general regression, no fabrication, reproducible runs, a compute budget |
| 10–15 | Size | 6 N D for training, 2 N per generated token, 16 bytes per parameter for a full fine-tune |
| 15–25 | Draw | The loop: data, SFT, post-training, eval gate, deploy, flywheel back into data |
| 25–35 | Data and SFT | Verified answers, dedup, decontamination, time splits; SFT short and mixed |
| 35–45 | Post-training | Verifier reward with a drift penalty; DPO for tone; audit high-reward samples |
| 45–55 | Eval | Five slices, sampling settings with every number, leakage suspected first |
| 55–60 | Pivot | Whichever constraint the interviewer adds: compute (section 9), harm (10), device (11) |

The interviewer will change a constraint mid-round; the question bank says so. Map the new constraint to the stage it changes and re-derive only that stage. "You now have a tenth of the compute" changes model size and the SFT-versus-RL split. "It must run offline on a laptop" changes deploy. "Legal says no synthetic data" changes data collection and pushes harder on the verifier.

| Follow-up | Strong answer |
|---|---|
| How do you know the eval is not contaminated? | Overlap check between train and test by n-grams and embeddings; remove any hit; report results only on the clean set |
| Why not SFT on more solutions instead? | SFT teaches the shape of an answer; finding answers to unseen problems comes from training on the model's own attempts against a checker |
| Why keep a drift penalty? | Without it the policy games the scorer's blind spots: formatting tricks, padding, confident wrong answers |
| DPO or RLHF? | DPO for preference data, simpler and usually more stable; RL with a verifier where correctness is checkable by program |
| How do you stop general ability collapsing? | Mix general data into SFT and post-training; regression suite with a maximum allowed drop in the gate |
| What if the offline gain is huge? | Suspect leakage first: check dedup, the split and whether labels came from the system being replaced |

## 14. Answer the Compute Pivot in Ten Minutes

The interviewer's pivot after a good design is "the training bill is out of control." No ready-made drill covers this group, so the card below is *(own construction)*.

| | |
|---|---|
| Dominant driver | Post-training rollouts and full-scale runs launched before small-scale ablations proved the recipe; hours lost to failed runs without recent checkpoints |
| Cheapest lever first | Ablate data mixes and rewards on a small model first; adapters (LoRA) for iteration, full fine-tune only when an adapter plateaus; fewer samples per prompt on easy problems; checkpoint on a fixed interval with data position; stop runs whose eval stops improving per GPU-hour |
| Metric that proves it | Eval score gained per GPU-hour; model FLOPs utilisation; GPU-hours lost to restarts; rollout tokens per accepted training example |
| Do not | Launch the full-scale run to find out whether the recipe works, or tune hyperparameters against the test set |
| 60-second line | Treat training spend as a series of experiments. Prove the recipe small, iterate with adapters, spend rollouts where problems are hard, and checkpoint so a failure costs minutes. The metric is eval gained per GPU-hour. |

The four cost verbs still generate the answer. Measure, by attributing GPU-hours to stage and experiment. Route, by matching method to need: adapters for iteration, full fine-tune for the final run, distillation for serving. Bound, with a budget per stage and a kill rule. Cache safely, by reusing verified synthetic data and scored rollouts across experiments when the policy has not moved far.

---

## Level calibration

Every level can name SFT and RL; the level shows in which stage gets the budget and who decides a checkpoint is ready to move forward.

| Level | Sounds like | Missing |
|---|---|---|
| Senior | Pins the target first, then walks the loop: verified, deduplicated and decontaminated data, short SFT for format, sampled attempts scored by a program verifier with a drift penalty, and a held-out gate. Says `6ND` aloud and sees that post-training and evaluation, not SFT, take the budget. | Who owns labels, the written policy and gate thresholds, and how a new constraint maps to one stage. |
| Staff | Adds the gate as a shared contract: thresholds agreed in advance, five eval slices with sampling settings on every number, harmful compliance plotted against over-refusal, and a leakage check on any large gain. Runs the budget as experiments: ablations, adapters, full-state checkpoints and a kill rule on eval gained per GPU-hour. | Whether weights are the right surface at all, and how a tuned model is kept current as the task definition changes. |
| Principal | Works down context, memory, procedure and parameters before funding a run, and keeps a prompted fallback because a tuned model freezes its task definition. Treats data provenance, datasheets and a gated flywheel from production traces as assets that outlive any one checkpoint. | The customer's pass@1 target, compute budget and device ceiling; every run size here is an assumption until they confirm them. |

## Key Takeaways

- Pin the target first: level of math, answer versus working, tools and users decide the data, reward and eval.
- Requirements become testable as held-out pass@1, a maximum general regression, a fabrication rate and a compute budget.
- Sizing shows SFT is cheap and post-training rollouts are expensive, so the budget belongs to post-training and eval.
- The architecture is a loop: data, SFT, post-training, an eval gate that blocks, deploy, and a gated flywheel back into data.
- Math data should be checkable: verify answers by program, dedupe, decontaminate and split by time and source.
- SFT teaches the shape of an answer; keep it short, mixed with general data, and include legal refusals.
- Post-training finds answers; the scorer is the design, and the drift penalty stops the model gaming it.
- Evaluate only on problems the model never saw, report sampling settings, and suspect leakage when a gain looks large.
- Under a compute budget, tokens per parameter picks the model size, memory picks the parallelism, and checkpoints make the run survivable.
- Harm and helpfulness are two numbers on one chart; a release lowers harmful compliance without raising over-refusal.
- A phone model is sized by bytes per parameter, made good by distillation, compressed by quantisation, and evaluated on the device.
- Parameter updates earn their cost for behaviour, vocabulary or a latency ceiling, never for missing knowledge.
- The hour goes to the scorer and the eval, and a mid-round constraint changes one stage, not the whole design.
- The compute pivot is answered with small ablations, adapters, targeted rollouts, checkpoints and eval gained per GPU-hour.

## Check Yourself

1. **What three questions pin the target for a math model?** Which level of math, whether a final answer is enough or the working must be right, and whether tools are allowed.
2. **Why is post-training more expensive than SFT in the sizing?** It samples many answers per prompt, so generated tokens multiply, and generation runs well below peak throughput.
3. **What does the eval gate block on?** Held-out accuracy, general regression, safety and over-refusal, with a contamination report attached.
4. **Why prefer checkable answers in the data?** Only a checkable answer lets rejection sampling filter synthetic data and lets a verifier score rollouts.
5. **What does SFT teach, and what does it not?** It teaches the format and shape of a good answer, not how to find answers to unseen problems.
6. **Why keep a drift penalty in post-training?** Without it the policy exploits the scorer's blind spots, such as formatting tricks or padding.
7. **The fine-tune scored 94% offline and 78% in production. What went wrong?** A random split over duplicated traces, labels from the old system, and a narrow time window; the honest number was near 83%.
8. **How do you size a 7B pretraining run?** About 20 tokens per parameter gives 140B tokens; 6 N D gives 5.88e21 FLOPs; at the assumed throughput that is about 5,444 GPU-hours.
9. **Which two numbers does the harm-versus-helpfulness prompt plot, and which way must each move?** Harmful-compliance rate must fall; over-refusal rate on benign-but-scary prompts must not rise.
10. **How much memory do 3B parameters need at 4-bit, and what else must fit?** About 1.5 GB for weights, plus runtime overhead, the KV cache and buffers.
11. **When does a parameter update not earn its cost?** When the gap is missing knowledge; that is a retrieval problem.
12. **What is the sixty-second compute answer?** Prove the recipe small, iterate with adapters, spend rollouts on hard problems, checkpoint, and track eval gained per GPU-hour.

## References

### Fact-check sources (checked 27 Sep 2026)

- [Kaplan et al. 2020, Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361): training ≈ 6 × parameters × tokens FLOPs; generation ≈ 2 × parameters per token
- [Rajbhandari et al. 2019, ZeRO](https://arxiv.org/abs/1910.02054): ~16 bytes per parameter for mixed-precision Adam (≈112 GB for 7B)
- [Hoffmann et al. 2022, Training Compute-Optimal LLMs (Chinchilla)](https://arxiv.org/abs/2203.15556): ~20 training tokens per parameter
- [AutoTrain LLM fine-tuning parameters](https://huggingface.co/docs/autotrain/main/en/params/llm_finetuning_params): current flag names `--peft` and `--quantization int4`
- [Singhal et al. 2023, A Long Way to Go: Length Correlations in RLHF](https://arxiv.org/abs/2310.03716): graders favour longer answers
- [Hosking et al. 2023, Human Feedback is not Gold Standard](https://arxiv.org/abs/2309.16349): graders favour assertive, confident answers
- [Rafailov et al. 2023, Direct Preference Optimization](https://arxiv.org/abs/2305.18290): DPO trains on preference pairs with no separate reward model
- [Xu et al. 2024, Is DPO Superior to PPO for LLM Alignment?](https://arxiv.org/abs/2404.10719): well-tuned PPO can match or beat DPO
- [Lambert et al. 2024, Tulu 3 (RLVR)](https://arxiv.org/abs/2411.15124): RL with a programmatic verifier works well where correctness is checkable
- [DeepSeek-AI 2025, DeepSeek-R1](https://arxiv.org/abs/2501.12948): rule-based rewards for math and code
- [PyTorch blog: Quantisation-Aware Training for LLMs](https://pytorch.org/blog/quantisation-aware-training/): QAT loses less quality than post-training quantisation
- [Ovadia et al. 2023, Fine-Tuning or Retrieval?](https://arxiv.org/abs/2312.05934): RAG beats fine-tuning for injecting new facts; fine-tuning does so weakly
- [Zhao et al. 2024, LoRA Land](https://arxiv.org/abs/2405.00732): small LoRA-tuned models often match larger prompted ones on narrow tasks, varying by task

