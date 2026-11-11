# Practise AgentOps Interview Questions

*Describing a release process sounds easy until the follow-up asks what stops a bad change, so rehearse answers that name the gate at every step.*

AgentOps questions test whether a candidate has shipped changes to a live AI system, not just built one. Answer each question aloud first, then compare; every answer uses only concepts from the earlier lessons in this module.

**Objectives:**

- walk a prompt change from edit to monitoring and name every gate;
- answer the channel, escalation, red-teaming and infrastructure follow-ups.

---

## Ship a Prompt Change

**"How do you roll out a new prompt?"**
Treat it as a deployment. The new version is immutable and hashed. It passes prompt parse tests, then a golden-set evaluation against the live version: the safety gate must be zero and quality must not regress. Then shadow, then a canary watched live, then promote by moving the live pointer. Rollback is a pointer flip to a version that never went away. A nightly evaluation keeps running against the live version. See [Prompt Versioning, Rollout, and Rollback](/learn/production-ai/agentops/prompt-versioning-rollout-and-rollback).

**"What two gates must a version pass, and against what baseline?"**
A safety gate at zero and a quality no-regression gate, both against the named version currently live, on the same fixed test set.

**"What property must rollback have, and what disqualifies a mechanism from being called rollback?"**
It must be instant and cheap, switching which version serves new requests. If it needs a build or redeploy, it is a hot fix under pressure.

**"Why must the A/B arms hold the safety gate at zero?"**
The test compares outcomes, never leak rates. Both arms must already pass the zero-leak bar to be in the test at all.

**"Your quality gate only runs on your own changes. What does it miss?"**
A provider silently changing what a model version points to. A scheduled nightly run against a known-good baseline catches it. See [Testing Prompt Changes](/learn/production-ai/agentops/testing-prompt-changes).

**"How many examples do you need to call an A/B result?"**
Enough to separate the improvement that matters from noise, decided before the test. LLM output varies, so small samples mislead, and stopping early is not allowed.

## Serve Channels and Escalate

**"What may a channel adapter change?"**
Only the latency budget and the format of the answer. Never the permission layer: the channel is a presentation choice. See [Channel Adapters and Human Escalation](/learn/production-ai/agentops/channel-adapters-and-human-escalation).

**"Why does email get a drafting step and the raw API none?"**
Email has minutes and expects formal prose; the API wants structured, machine-readable data with sources.

**"List what escalation must do."**
Create or update a real record, attach the working context, route by cause, keep the record under the request's permission scope, and feed the outcome into evaluation.

## Red-Team and Ship Safely

**"How would you red-team your own RAG system before a customer does?"**
Attack the access model as each persona: another tenant with every privilege, an embargoed document, a revoked group, an injection asking for a contract. Run jailbreak, cross-prompt injection, crescendo and Skeleton Key weekly through the real path. Write custom vulnerabilities for the system prompt's own carve-outs. A successful attack is a leak that blocks the release and becomes a permanent test. See [Red Teaming and Layered Guardrails](/learn/production-ai/agentops/red-teaming-and-layered-guardrails).

**"Your red-team report shows a high pass rate. Why is that not enough to ship?"**
The attacks that succeeded still matter, and one leak blocks release. Read the per-attack results, not the aggregate.

**"Your regex prompt-injection filter keeps being bypassed by rephrasing. What do you change?"**
Keep the regex as a free first pass and add an LLM guard behind it that judges intent. No layer reaches zero; this is risk reduction.

**"Why are secrets read at container startup rather than baked into the image?"**
Images are pushed, cached and shared, so a baked secret spreads to every copy. Reading from the vault at startup keeps it in one place. See [Infrastructure as Code and the Release Pipeline](/learn/production-ai/agentops/infrastructure-as-code-and-the-release-pipeline).

> **Warning: "we test it before release" is not an answer.** Name the gate, what it compares against, what number blocks the release, and what happens after promotion.

## Govern Systems and Their Data

**"You have forty AI features. How do you govern them without slowing everything down?"**
Keep one inventory with owners, data, models, actions, tier and the disable path. Tier each system by whether it acts, who is affected and whether harm can be undone, and attach controls per tier, so low-risk tools ship fast and agents that move money carry full controls. → [Govern AI Systems by Risk Tier](/learn/production-ai/agentops/govern-ai-systems-by-risk-tier)

**"A customer asks you to delete their data. What happens?"**
A tested deletion workflow finds every copy by tenant and user ID: conversation, summaries, memory, documents and their embeddings, traces and evaluation copies. It deletes or redacts each, keeps only what law requires with personal fields removed, records what the model provider still holds, and confirms. → [The Data Lifecycle Across Every Store](/learn/production-ai/agentops/the-data-lifecycle-across-every-store)

## Worked Example: The Full Pipeline in One Answer

Question: "Walk me through how a change reaches production."

Answer: "Code, prompt and policy changes go through the same pipeline. Unit tests and prompt parse tests run first. Then the golden-set evaluation runs against the named baseline, with the security gate at zero and no quality regression. Only then are artefacts built and the version registered. It deploys to staging and runs in shadow on real traffic. A canary slice comes next, watched live, with automatic rollback on failure. Promotion is a pointer flip. After that, nightly evaluation, production monitoring and a weekly red team keep checking the live version. Every arrow is a place a bad change can stop, and every stop is automatic."

The answer never says "we are careful". It names a gate at each step, which is what the question is testing.

---

## Key Takeaways

- A prompt change is a deployment with two gates, shadow, canary, pointer-flip rollback and nightly checks.
- Channels change latency and format only; escalation has five obligations.
- Red teaming runs weekly on the real path, as every persona, and a successful attack blocks the release.
- Infrastructure is code, secrets come from a vault, and every stop in the pipeline is automatic.

## Check Yourself

<details>
<summary>1. Name the gate at each step of the release pipeline, in order.</summary>

Unit and prompt tests; golden-set evaluation with safety at zero and no quality regression; shadow; canary with auto-rollback; pointer-flip promotion; nightly evaluation, monitoring and weekly red team.

</details>

<details>
<summary>2. Why does the high-clearance contractor persona matter for red teaming?</summary>

It exercises rules that an anonymous or low-privilege attacker would never reach, such as the external-user block.

</details>

<details>
<summary>3. Why answer a release question generically before naming any vendor's tools?</summary>

Leading with vendor names reads as name-dropping; leading with the architecture and then grounding it reads as someone who shipped it.

</details>

