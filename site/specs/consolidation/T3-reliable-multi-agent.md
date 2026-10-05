# T3 Consolidation: Reliable and Multi-Agent Systems (T3.5–T3.7)

Date: 5 October 2026. Follows `site/specs/2026-10-05-consolidation-playbook.md`. Lessons live in `01_Concept_Tutorials/Consolidated_Lessons/T3.5_Robust_Agents/`, `T3.6_Multi_Agent_Systems/` and `T3.7_Agentic_Workflow_Platforms/`. Retired slugs are in `site/src/lib/consolidation/t3.ts` under the `// T3.5–T3.7` comment.

All sources in these three modules are own material, so every new lesson is `publish: 'own'` with no credit line. No module in scope has `kind: 'live'` lessons, so there were no display titles to clean.

Where a new lesson's title kebab-cases to the slug of the lesson it replaces, the slug is kept and only the `source` changes. That keeps URLs and saved progress unchanged and needs no redirect.

## T3.5 Robust agents: retries, fallbacks and guards

Six lessons, from five sources: Handbook `03_Robust_Agents/01`, `03`, `04`, `05`, and `Production_and_Platform_Judgment/05-guarding-tool-calls.md`. The `seeAlso` to `why-agents-need-state` (T3.4) is kept.

| Old lesson | New lesson |
|---|---|
| `retry-fallback-memo-confirm` | `retries-and-fallbacks` (gate and memo parts in `the-confirmation-gate-and-memoization`) |
| `parallel-vs-sequential` | `parallel-and-sequential-tool-calls` |
| `observability-for-tool-calls` | `observability-for-tool-calls` (slug kept, new source) |
| `the-eight-guard-checks` | `the-eight-guard-checks` (slug kept, new source) |
| `guarding-tool-calls` | `the-eight-guard-checks` |
| — | `the-confirmation-gate-and-memoization` (new) |
| — | `practise-robust-agents` (new; from the sources' interview lenses and checkpoints) |

## T3.6 Multi-agent systems: when justified

Eight lessons, from seven sources: Handbook `07_Multi_Agent_Systems/01`–`05`, `RAG_and_Agent_Topic_Guides/07_multi_agent_systems_INTERVIEW_TUTORIAL.md` and `RAG_and_Agent_Topic_Guides/multi_agent/multi_agent_coordination_patterns.md`.

| Old lesson | New lesson |
|---|---|
| `when-multi-agent-is-justified` | `when-multi-agent-is-justified` (slug kept, new source) |
| `multi-agent-coordination-patterns` | `multi-agent-coordination-patterns` (slug kept, new source) |
| — | `shared-state-routing-and-termination` (new) |
| `reference-architecture-handoffs` | `handoffs-and-permission-scope` |
| `failure-isolation-and-evaluation` | `failure-isolation-and-evaluation` (slug kept, new source) |
| `case-study-supervisor-to-deep-agent` | `from-supervisor-to-deep-agent` |
| `case-study-research-platform` | `anatomy-of-a-deployed-multi-agent-platform` |
| `multi-agent-systems-interview-tutorial` | `practise-multi-agent-systems` |

The interview tutorial's "Top 10 interview questions" section cites web pages. The practise lesson restates those questions in new words, grounded in the tutorial's own concept sections, and does not reuse the external links or answers.

## T3.7 Agentic workflow platforms

Seven lessons, from six sources: Handbook `05_Agentic_Workflow_Platforms/01`–`05`, plus `07_Coverage_Map.md` from the same folder (not previously published; used for gaps and likely follow-ups). `06_Module_Reference.md` is a function reference and is not used.

| Old lesson | New lesson |
|---|---|
| `the-problem-in-plain-english` | `why-workflow-automation-is-a-trust-problem` |
| `canonical-events-and-channels` | `canonical-events-and-routing` |
| `determinism-over-free-text` | `determinism-over-free-text` (slug kept, new source) |
| `durability-and-idempotency` | `durability-and-idempotency` (slug kept, new source) |
| `approvals-spend-caps-staged-rollout` | `approvals-and-spend-caps` (rollout half in `staged-rollout`) |
| — | `staged-rollout` (new) |
| — | `practise-agentic-workflow-platforms` (new) |

## Cross-track `seeAlso` updates

- T1.5 Distributed systems essentials: `retry-fallback-memo-confirm` became `retries-and-fallbacks`. `durability-and-idempotency` keeps its slug, so that entry is unchanged.

## Source conflicts

- **Caching approved destructive calls (T3.5).** The Handbook executor lets an approved destructive call reach the memo, arguing a cached result is right for an idempotent close. The guard-check material says destructive calls skip the cache entirely, and the eight-check pipeline caches only non-destructive results. The lesson gives both and recommends the stricter rule.
- **What justifies a multi-agent split (T3.6).** The Handbook names two triggers: conflicting contexts and an unmanageable tool count. The interview tutorial names three reasons: real parallelism, distinct tool permissions per role, and context too large for one agent. `when-multi-agent-is-justified` teaches them together and names the difference.
- **What a specialist sees (T3.6).** The coordination-patterns document has the supervisor hand off the full shared history. The Handbook and the tutorial pass a defined package or summary. `multi-agent-coordination-patterns` and `handoffs-and-permission-scope` present it as a design choice.
- **Is the research platform's Critic loop multi-agent? (T3.6).** The Handbook calls it a pipeline with a loop and a gate, closer to one agent. The coordination-patterns document's evaluator-optimizer pattern would count it as multi-agent. Both readings are given.
- **Coverage-map gaps (T3.7).** `07_Coverage_Map.md` names two gaps the published Handbook documents do not: nothing calls resume automatically, and custom tools are not sandboxed or reviewed before publishing. They are taught as named gaps, not conflicts.

## Handoffs to other tracks

- None. The workflow-platform half of the guardrail trio is in T3.7, the same track. The research-platform case study touches gateways, red teaming and infrastructure (T4 topics); it is kept as a whole case study under T3.6 rather than split, and the integrator may add T4 `seeAlso` links to it.
