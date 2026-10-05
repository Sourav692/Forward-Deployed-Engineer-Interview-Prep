# AgentOps Mapped to Databricks

*Leading with product names sounds like name-dropping and leading only with architecture sounds untested, so design generically first and then name the primitive that implements each step.*

◷ 6 min

"Have you actually done this?" is a different question from "how would you design it?" Answer the design in generic terms, as in [Prompt Versioning, Rollout, and Rollback](/learn/production-ai/agentops/prompt-versioning-rollout-and-rollback), then map each step to the Databricks mechanism that implements it.

**Objectives:**

- map versioning, gating, canary, rollback, tracing, drift, cost and audit to Databricks primitives;
- explain aliases and why application code references them;
- avoid the half-done rollback that leaves the alias and the endpoint out of step.

---

## Answer in Two Passes

Design cold in platform-neutral terms first. When asked whether you have built it, switch to the platform's vocabulary. Leading with vendor names reads as name-dropping. Leading with the architecture and then grounding it in a real deployment reads as someone who has shipped it.

## Version Through Registry Aliases

A registered model in the Unity Catalog Model Registry is exactly the immutable, versioned artefact the generic design asks for. Every prompt or agent version becomes a new registered version under one model name. It is addressed by an alias such as `@champion`, `@challenger`, `@prod` or `@staging`, not by a raw number. Application code references the alias, never a hard-coded version. Promotion is re-pointing the alias; the calling code is untouched.

Databricks also offers `optimize_prompts()`, an automated prompt-optimisation loop (GEPA). It takes a registered prompt, a dataset and a scorer, and produces a new candidate version. It is the closest real equivalent to "generate the next version to evaluate" automatically.

## Gate With Evaluation Runs and Calibrated Judges

`mlflow.genai.evaluate()` runs a candidate against a dataset with a set of scorers, built-in or custom judges, and produces the release-gate report. Two refinements matter.

**MemAlign judge alignment** calibrates a custom judge against real examples labelled by subject-matter experts. The judge scoring the gate has then been checked against human judgement, not trusted as an off-the-shelf grading prompt. This is the concrete answer to "how do you calibrate an LLM judge?", the step most teams skip.

**Named runs** let a candidate's evaluation be compared with a named baseline run. "Did this regress against production?" becomes a tracked comparison, not two numbers recomputed by eye.

## Canary and Shadow Through Serving Traffic

A Model Serving endpoint can hold several served entities, each a model version, with a traffic configuration that routes a percentage of requests to each. That is the literal canary: 95% to the current version and 5% to the candidate, watched live before shifting further. It is the A/B pattern expressed as endpoint config instead of application code.

Shadow mode logs the candidate's predictions without routing real traffic to it. Alternatively, route a small share while keeping any destructive action behind a separate application-level approval. The guardrail stays separate from the model's output.

## Roll Back Both Halves Together

Rollback is two steps done together: re-point the alias to the previous registered version, and update the endpoint's served-entity configuration to match. Re-pointing the alias alone does not move the endpoint. Updating the endpoint alone leaves the alias on the old version. That half-done rollback is a real and easy bug.

Because the previous version is still registered rather than deleted, it is available at once. There is no redeploy and no rebuild, only a configuration update.

## Trace Into Governed Tables

MLflow Tracing captures the per-request trace: prompt version, retrieved context, tool calls, tokens, latency and cost. It can write directly into a Unity Catalog table. Traces become queryable with SQL, joinable with other governed data and covered by the same access model as everything else. That closes the gap of a bespoke trace format that nothing else can query or govern.

Production monitoring is the same pipeline. The scorers used for the pre-promotion gate run continuously against live traces. "Did it regress after promotion?" is the same measurement as "did it pass before?", run on a schedule.

## Read Drift, Cost, and Audit From System Tables

| Question | Where the answer lives |
|---|---|
| Who was granted, revoked or accessed what? | `system.access.audit`, queryable with SQL |
| Which workspace or workload is spending? | `system.billing.usage`, by workspace and SKU |
| Has the underlying data's distribution shifted? | Unity Catalog data profiling over a table's history |

The audit trail every AI system needs is already built in. Cost attribution is a roll-up of billing usage, a report rather than a missing signal. Data profiling is drift alerting applied to the data rather than to model behaviour.

| Generic AgentOps concept | Databricks mechanism |
|---|---|
| Versioned prompt or config artefact | Unity Catalog Model Registry, addressed by alias |
| Automated prompt improvement | `optimize_prompts()` (GEPA) |
| Pre-promotion quality and safety gate | `mlflow.genai.evaluate()` with scorers and judges |
| Judge calibration against human labels | MemAlign with SME labelling |
| Baseline comparison | Named evaluation runs |
| Canary or percentage rollout | Model Serving traffic config across served entities |
| Shadow mode | Candidate logged without live traffic, or gated behind approval |
| Rollback | Alias re-point plus endpoint config update, together |
| Tracing | MLflow Tracing into Unity Catalog tables |
| Production monitoring | The same scorers, continuously, on live traces |
| Audit, cost and data drift | `system.access.audit`, `system.billing.usage`, data profiling |

> **Warning: re-pointing the alias is only half a rollback.** The serving endpoint keeps routing to whatever its served-entity config names. Update both together, or the rollback silently does nothing for live traffic.

## Worked Example: "Have You Done This for Real?"

The interviewer has heard a generic design and asks whether the candidate has built it. The answer maps step by step.

"Prompt and agent versions were registered models in Unity Catalog, addressed by alias, so promotion meant re-pointing the alias, never redeploying calling code. Promotion was gated on `mlflow.genai.evaluate()`, with the judge calibrated against SME labels. The canary was a Model Serving traffic split. Rollback re-pointed the alias and updated the endpoint config together. Traces landed in Unity Catalog tables. Audit, cost and drift came from the platform's system tables rather than anything we built."

Every sentence names a generic concept the interviewer already heard, then the primitive behind it. That order is what makes it credible.

---

## Key Takeaways

- Design generically first, then name the platform primitive for each step.
- Version prompts and agents as registered models addressed by alias, and promote by re-pointing the alias.
- Gate with `mlflow.genai.evaluate()`, calibrated judges and named baseline runs.
- Canary through serving traffic splits, and shadow by logging the candidate or gating destructive actions.
- Roll back by re-pointing the alias and updating the endpoint together.
- Trace into governed tables, monitor with the gate's own scorers, and read audit, cost and drift from system tables.

## Check Yourself

1. **What is an alias, and why does application code reference it?**
   A movable name such as `@champion` that points to a registered version. Code that references the alias needs no change when a version is promoted or rolled back.

2. **What does MemAlign do?**
   It calibrates a custom LLM judge against examples labelled by subject-matter experts, so the gate's judge has been checked against human judgement.

3. **Describe the rollback bug that happens when only half the procedure is done.**
   Re-pointing the alias without updating the endpoint config leaves live traffic on the bad version; updating only the endpoint leaves the alias pointing at the old version.

## References

**Sources:** `02_AgentOps_On_Databricks.md` (FDE Handbook, AgentOps and platform): §1 to §6, the mapping table, Interview lens and Checkpoint. `04-agentops-on-databricks.md` (Production and Platform Judgment): §1 to §6, quick mapping table and "What to say" (the duplicate source, merged).
