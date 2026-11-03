# Lesson quality contract — existing course review

Apply this contract when reviewing generated content. Write evidence and proposed improvements only under the repository’s `.system_design_review/` directory; do not require new review files inside an authored stage. This is a contract for **teaching evidence**, not for declaring learner mastery. Each stage is self-contained for its assigned modules and continues one shared enterprise platform.

## Required concept coverage record

For each first-taught module, record the module ID, D0–D3 target, section anchor, specific concepts explained, architecture connection, proof of understanding, and evidence status. Do not count a heading, glossary mention, or reference link as teaching.

| Target depth | Minimum evidence inside the owning stage | Stop boundary |
| --- | --- | --- |
| D3 | clear explanation, before/after system impact, alternatives, failure and signal, representative executable/tested slice, exit task | no specialist research tangent |
| D2 | explained mechanism, architecture placement, two credible alternatives, failure/trade-off, small design task | no unnecessary custom implementation |
| D1 | purpose, system boundary, realistic example, one practical limitation/trade-off | no internals |
| D0 | concise awareness plus explicit deferral | no deep dive |

## Five-phase structure

Apply this full instructional structure to Stages 1–12. Stage 0 may use a simpler orientation format; judge whether it explains the customer journey, architecture, limits and learning route rather than demanding full-stage interviews or implementation exercises.

1. Understand the problem: one user outcome, original design, new pressure, what fails.
2. Learn and design: explanation before jargon, credible alternatives, decision and updated diagram.
3. Observe and experiment: step-through request, numerical example, useful lab where causal, failure diagnosis.
4. Think like a Staff engineer: security, scale, reliability, cost, 4–6 spoken model-answer interviews.
5. Validate and carry forward: answer-before-reveal checks, learner exit gates, decisions, updated system state.

## Visual and implementation rules

- Diagrams next to the explanation, with captions and text alternatives. Use Mermaid in Markdown, inline offline SVG/HTML in standalone HTML.
- When a walkthrough is provided or promised, verify its stated contract. A static Stage 0 overview need not add interactive controls or a lab solely for review. Full instructional stages retain the authoring skill’s walkthrough requirements.
- HTML request walkthrough: direct step buttons, Previous, Next, Reset, clear selected step, success and failure branches, keyboard access, static equivalent.
- Interactive lab only for parameters that change a meaningful outcome; give defaults, units, limitations, at least two reproducible cases and a Reset.
- Link all referenced local files. Include labs/tests in the delivery archive, or mark their absence.
- Separate observed results from illustrative math and from proposed production controls.
- Keep both formats semantically complete and consistent. Do not hide essential knowledge behind JavaScript.

## Proof and retention

- At least two spaced predict-first questions, with revealed explanations, plus 3–5 end-of-stage self-tests.
- D3 requires a testable representative implementation or explicitly reported unverified status.
- End with an under-one-minute revision card, exact system changes, accepted ADRs and Stage N+1 inheritance.
- Completion is a learner outcome: explain, draw, defend, diagnose and for D3 build/debug.
- Review around 1, 7, and 21 days; never auto-mark the learner complete after generating content.

## Avoid over-teaching

Short, plain English; one stable scenario; no generic AI introduction. Explain only concepts that materially affect an architecture decision. Flag gaps in the owning stage and propose focused repairs in the improvement plan. Do not create a mandatory parallel topic course or apply repairs during review. Explicit user requests for standalone material remain valid.

Stage 0 is orientation: assess the customer story, target architecture, stage map, and distinction between target and implemented capabilities. It has no first-taught module obligations or D3 implementation requirement. For a focused revision or topic, assess only its requested scope and relevant owning-stage context; mark unrelated rubric dimensions not applicable.
