# Example prompts

## Start the course
Use the `architecture-driven-staff-ai-system-design` skill. Initialize the learning workspace and create **Stage 1: MVP** in Markdown and offline HTML. Treat all new requirements as illustrative. Show the before/after architecture, request flow, one working example, architecture decision record, Staff interview questions and exit test. Stop at D3 production-relevant depth; do not add unnecessary tools.

## Continue without losing the architecture
Use the skill to create **Stage 2: Distributed Execution**. Read Stage 1 `stage-state.json`, `architecture/current-system.md`, and ADRs. Carry forward the current system. Explain what fails when document processing is synchronous, add durable background jobs, show failure recovery and tests, and generate matching Markdown/HTML. Update the architecture and actual coverage status only after validating the lesson.

## Stage 5 overload and fairness
Use the skill to generate **Stage 5: Handle Overload and Fair Scheduling**, targeting Staff FDE. Begin with the architecture already built. Show 1,000 RPS incoming vs 600 RPS sustained downstream capacity (illustrative), three tenants, and a bounded queue. Explain admission, backpressure, Round Robin, WRR and starvation avoidance. Include an accessible offline interactive lab and model interview answers. Do not derive WFQ mathematically.

## Targeted module without breaking the course
Use the skill to teach **Module 3.1: consistency models** within Stage 7. Reference its first-teaching stage and earlier system decisions; explain which state may be stale and which access-control decisions need an authoritative path. Generate `guide.md` and `guide.html` for this focused lesson and make no claims about completed stages not present on disk.

## Audit progress
Use the skill in report-only review mode to compare authored, validated stage files against `references/curriculum-map.json`. Record missing modules, missing artifacts and actual teaching evidence in the ignored review run’s `module-evidence.md`, with prioritised actions in `improvement-plan.md`. Do not modify `progress/coverage-status.csv`, stage state or architecture, and do not infer learner completion from the reference map.

## Produce a revision-only card
Use the skill to create a one-page Staff FDE revision card for Domain 5 from already-authored lessons. One diagram, one decision table, five key failure symptoms, six interview recall cues, and links back to canonical lessons. No new long-form theory.

## Review Existing Generated Content

Use `architecture-driven-staff-ai-system-design` in content review mode for Stage 1. Read the actual Markdown, HTML, available labs, prior architecture and curriculum map. Use independent technical, teaching, and HTML/lab reviewers. Write input fingerprints, findings, module evidence and a prioritised improvement plan inside a new gitignored `.system_design_review/stage-01/` run. Do not change the lesson, architecture, coverage, stage state or learner completion.

## Review the Orientation

Use the same skill to review Stage 0’s customer story, target architecture, stage map and implemented-versus-proposed claims. Assess offline HTML and walkthrough evidence where available. Stage 0 has no first-taught modules or D3 implementation requirement. Save the three reviewers’ findings and improvement plan under `.system_design_review/stage-00/`; do not edit course files.

## Review After a Requested Repair

After completing and validating the requested Stage 5 repair under the normal authoring workflow, run the scoped three-reviewer review. Keep the review phase report-only. Record the revised input fingerprints and produce a new improvement plan; do not treat an earlier report as verification of the changed artifacts.
