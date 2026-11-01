# When Fine-Tuning Earns Its Cost

*A fine-tuned model can match a much larger prompted one at a fraction of the serving cost, and it freezes the task definition until the next retraining.*

Fine-tuning is proposed far more often than it is the right call. Use it in three specific situations, never to fill a knowledge gap, and compare it against prompting and RAG on real traffic and total cost before committing.

**Objectives:**

- recognise the three situations where changing weights beats cheaper surfaces;
- explain why fine-tuning does not fix missing knowledge;
- weigh hosting and operating a tuned model against a managed API.

---

## Fine-Tune in Three Situations

Changing parameters is the most expensive of the [Four Learning Surfaces](/learn/production-ai/model-adaptation-and-serving/four-learning-surfaces). It still wins clearly in three cases.

| Situation | Why weights win here |
|---|---|
| Strict format or protocol adherence at high volume | A small tuned model matches a much larger prompted one at a fraction of serving cost, and every successful production run is a free labelled example |
| Domain vocabulary the base model lacks | No amount of prompting reliably overrides a strong prior about words that mean something unusual in the domain |
| A hard cost or latency ceiling, after cheaper surfaces are exhausted | Distilling onto a smaller model buys the ceiling back |

## Retrieve Knowledge Instead of Training It

Knowledge gaps are a retrieval problem. Fine-tuning does not fix a model not knowing something. Injecting facts through training is this module's classic mistake: facts change, and permissions differ per user, which weights cannot express.

The cost and latency playbook draws the same line. Fine-tuning suits repeated structured tasks and a stable style. It suits fast-changing knowledge and permission-dependent answers badly. Compare fine-tuning against RAG and prompt compression using production traffic, not intuition.

## Keep a Prompted Fallback

A fine-tuned model freezes the task definition. When the business changes that definition, as it will, the team retrains instead of editing a prompt. Keep a prompted fallback path for exactly that moment.

Fine-tuning also adds operations. Each tuned model is another version to evaluate, release and monitor, and it can tie the team to one provider or leave behaviour stale.

## Count the Cost of Serving It

Owning weights can mean owning serving. The playbook's warning sign is low GPU utilisation and expensive standby capacity. Autoscaling, request batching, quantisation and right-sizing improve it. At low volume, a managed API is often cheaper. Serving the model also brings operational complexity.

The choice between self-hosting and a managed service is one of total cost of ownership, not token or GPU price alone. Self-hosting fits predictable high volume and strict data controls. It fits low or variable traffic and a small team badly.

The repository's sources stop here. Fine-tuning methods and serving internals, such as GPU sizing, are not covered; this module's gap note records that.

> **Warning: a fine-tune will not teach the model your documents.** If the agent gives wrong answers because it lacks facts, fix retrieval. Training on those facts bakes in a snapshot that goes stale and ignores who is allowed to see what.

## Worked Example: Fine-Tune or RAG?

A routing agent must label every incoming ticket in a strict JSON schema, millions of times a month. A second team wants the agent to answer questions about this quarter's pricing.

The routing task fits the first situation: a strict format at high volume. A small tuned model can match the large prompted one at a fraction of serving cost, trained on successful production runs. The team keeps the prompted version as a fallback for when the label set changes. Before committing, they compare it against prompt compression on production traffic.

The pricing questions are a knowledge gap. Pricing changes every quarter, so it belongs in retrieval, not in weights. One request got weights, the other got RAG, and the deciding question was the same: is this a behaviour that repeats, or a fact that changes?

---

## Key Takeaways

- Fine-tune for strict format at high volume, missing domain vocabulary, or a hard cost or latency ceiling once cheaper surfaces are exhausted.
- Knowledge gaps belong in retrieval; fine-tuning on facts is a mistake.
- A tuned model freezes the task definition, so keep a prompted fallback and expect extra release and monitoring work.
- Decide on self-hosting by total cost of ownership; managed APIs usually win at low volume.

## Check Yourself

<details>
<summary>1. Fine-tune or RAG for a model that does not know your product's new features?</summary>

RAG. Fine-tuning does not fix missing knowledge, and features change faster than retraining cycles.

</details>

<details>
<summary>2. Name the three situations where fine-tuning earns its cost.</summary>

Strict format or protocol adherence at high volume, domain vocabulary the base model lacks, and a hard cost or latency ceiling after cheaper fixes are exhausted.

</details>

<details>
<summary>3. Why keep a prompted fallback after fine-tuning?</summary>

The tuned model freezes the task definition. When the business changes it, the prompted path keeps working while the model is retrained.

</details>

