# Architecture-Driven Staff AI System Design — Skill Package v2

This upgraded skill replaces the earlier standalone-topic approach with **one evolving Enterprise AI Platform** taught in 12 linked architecture stages. It retains the reference map of 18 domains and 56 modules. The main outputs are equivalent **Markdown** and **standalone offline HTML** lessons, diagrams and genuinely useful interactive labs.

## What is inside?

- `SKILL.md`: the instructions the coding assistant follows.
- `references/curriculum-map.json`: structured source-of-truth mapping for every module.
- `references/coverage-matrix.csv` / `.md`: human- and machine-readable stage coverage.
- `references/stage-contracts.md`: problem, architectural starting point and target result for all 12 stages.
- `templates/`: lesson, ADR, stage-state, repository tree and offline HTML starter.
- `examples/example-prompts.md`: copy-ready prompts.
- `scripts/validate_skill.py`: checks integrity of the reference map and optionally validates actual stage files.

## Install in Claude Code

1. Extract the ZIP.
2. Copy the **entire directory**, not just `SKILL.md`, into your project's `.claude/skills/architecture-driven-staff-ai-system-design/` (or your personal Claude skills directory, if supported by your version).
3. Open Claude Code inside your learning project and ask it to use the skill. If auto-discovery fails, reference the `SKILL.md` path explicitly.
4. Ask it to create **Stage 1**; review the diagrams and system decisions before Stage 2.

## Install in Codex CLI

1. Extract the ZIP.
2. Copy the **entire directory** into `.agents/skills/architecture-driven-staff-ai-system-design/` in your repository (or the current user-level Codex skills directory for your installation).
3. Start Codex in the repository. Ask it to use the skill by name or explicitly point to its `SKILL.md`.
4. Generate one stage at a time so the assistant can inspect the previous stage artifacts.

Skills paths and discovery behavior can vary with product version, so if a skill is not picked up automatically, explicitly point your assistant to the local file.

## Generic usage (any assistant with file access)

Tell it: `Read <path>/SKILL.md and the referenced curriculum map. Follow them to create Stage 1 in my current working directory.` No special skill installation is required if the assistant can read these files.

## Best first prompt

> Use the architecture-driven-staff-ai-system-design skill. Create Stage 1 (AI MVP) for the Enterprise AI Platform. Generate matching complete Markdown and self-contained HTML guides, diagrams, a small useful lab if needed, the architecture change, an ADR and the stage-state file. Use simple English, a single realistic customer scenario and D3 production-level depth. Verify the outputs, then stop. Do not create Stage 2 yet.

## The ongoing workflow

1. Generate **one** stage.
2. Read the `.md` lesson and interact with the `.html` lesson offline.
3. Perform the exit test and interview drill; write any corrections.
4. Keep the latest architecture in `architecture/current-system.md` and significant decisions in `architecture/decisions/`.
5. Move to the next stage using the current system as the starting point.
6. Review earlier concepts around day 1, 7 and 21, preferably through short retrieval exercises.

For a particular topic, ask for a **focused lesson linked to its stage**, not an unrelated new system.

## Depth guide

- **D3:** must design, defend, debug and implement a representative slice.
- **D2:** must explain, compare, diagram and diagnose common failures.
- **D1:** understand purpose and boundaries, without implementation internals.
- **D0:** skip deep coverage in the main course.

## Validate

Run `python scripts/validate_skill.py` to check the built-in mapping. Run `python scripts/validate_skill.py --workspace <learning-project>` to also inspect generated stage artifacts and count verified coverage. The validator does not replace browser tests for interactive labs.

## Important distinction

A module assigned to a stage does **not** mean that its guide has been created or that the learner has mastered it. The validator and `progress/coverage-status.csv` distinguish curriculum planning from actual work.


## Dual-platform ZIP layout

This package also provides install-ready copies for each client under `install/claude-code` and `install/codex`. A `skill-source` copy exists for inspecting/updating the canonical files.

The example simulator (`examples/stage-05-traffic-simulation.html`) is self-contained and can be opened directly in a browser. Its fixed throughput assumptions are a teaching model, not actual performance measurements.

After copying a skill, run `python .claude/skills/architecture-driven-staff-ai-system-design/scripts/test_package.py` (Claude) or `python .agents/skills/architecture-driven-staff-ai-system-design/scripts/test_package.py` (Codex).


## V2 course-first policy

The integrated 12-stage course is the primary and sufficient teaching source. Do not bulk-generate standalone topic guides. If a learner struggles with a concept, improve the owning stage or request a short gap-repair supplement. Revision cards are retrieval aids, not a second curriculum. Use `references/lesson-quality-contract.md` and `references/review-rubric.md` to judge whether the generated chapter genuinely teaches its mapped modules. The new `scripts/audit_stage.py` checks structural evidence; it cannot certify factual accuracy or learner mastery.

**V2 invocation:** `Use the architecture-driven-staff-ai-system-design-v2 skill to review Stage 1 against the lesson-quality contract. Do not modify the original skill or generate additional stages.`
