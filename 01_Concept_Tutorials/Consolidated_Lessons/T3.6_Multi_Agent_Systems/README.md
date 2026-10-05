# T3.6 Multi-Agent Systems: Consolidated Lessons

These eight lessons are the site's teaching copy of module T3.6 "Multi-agent systems: when justified". Each concept is taught once, in the house tutorial format, drawing only on seven repository sources. The site publishes them at `/learn/agentic-systems/multi-agent-systems`.

| # | Lesson | Site slug |
|---|---|---|
| 1 | [When Multi-Agent Is Justified](01_When_Multi_Agent_Is_Justified.md) | `when-multi-agent-is-justified` |
| 2 | [Multi-Agent Coordination Patterns](02_Multi_Agent_Coordination_Patterns.md) | `multi-agent-coordination-patterns` |
| 3 | [Shared State, Routing, and Termination](03_Shared_State_Routing_and_Termination.md) | `shared-state-routing-and-termination` |
| 4 | [Handoffs and Permission Scope](04_Handoffs_and_Permission_Scope.md) | `handoffs-and-permission-scope` |
| 5 | [Failure Isolation and Evaluation](05_Failure_Isolation_and_Evaluation.md) | `failure-isolation-and-evaluation` |
| 6 | [From Supervisor to Deep Agent](06_From_Supervisor_to_Deep_Agent.md) | `from-supervisor-to-deep-agent` |
| 7 | [Anatomy of a Deployed Multi-Agent Platform](07_Anatomy_of_a_Deployed_Multi_Agent_Platform.md) | `anatomy-of-a-deployed-multi-agent-platform` |
| 8 | [Practise Multi-Agent Interview Questions](08_Practise_Multi_Agent_Interview_Questions.md) | `practise-multi-agent-systems` |

## Sources

All seven sources are own material.

- `01_Concept_Tutorials/FDE_Handbook/07_Multi_Agent_Systems/01_When_Multi_Agent_Is_Justified.md`
- `01_Concept_Tutorials/FDE_Handbook/07_Multi_Agent_Systems/02_Reference_Architecture_Handoffs.md`
- `01_Concept_Tutorials/FDE_Handbook/07_Multi_Agent_Systems/03_Failure_Isolation_And_Evaluation.md`
- `01_Concept_Tutorials/FDE_Handbook/07_Multi_Agent_Systems/04_Case_Study_Research_Platform.md`
- `01_Concept_Tutorials/FDE_Handbook/07_Multi_Agent_Systems/05_Case_Study_Supervisor_To_Deep_Agent.md`
- `01_Concept_Tutorials/RAG_and_Agent_Topic_Guides/07_multi_agent_systems_INTERVIEW_TUTORIAL.md` (its web-sourced interview questions are restated in new words; their external links are not reused)
- `01_Concept_Tutorials/RAG_and_Agent_Topic_Guides/multi_agent/multi_agent_coordination_patterns.md`

The source files stay in the repository unchanged. The site no longer publishes them as separate lessons; old URLs redirect to the matching lesson here.

## Source conflicts

The lessons name three places where the sources disagree.

- **What justifies a split.** The FDE Handbook names two triggers: conflicting contexts and an unmanageable tool count. The interview tutorial names three reasons: parallelism, distinct tool permissions per role, and context too large for one agent. Lesson 1 teaches the union.
- **What a specialist sees.** The coordination-patterns guide has the supervisor hand the full shared history to each specialist. The Handbook and the tutorial argue for a defined package or summary. Lessons 2 and 4 treat it as a design choice.
- **Whether a generate-and-critique loop is multi-agent.** The Handbook calls the research platform's four-agent pipeline a pipeline with a loop and a gate, closer to one agent. The coordination-patterns guide treats generator plus evaluator as its own multi-agent pattern. Lesson 7 presents both.

Every claim, number and code idea in these lessons comes from the seven sources. Each lesson ends with a Sources line naming the sections it used. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.
