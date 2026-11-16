# Approved casebook format

The approved reference is the complete Enterprise Knowledge Assistant prototype, created from <https://forwarddeployedprep.com/design/enterprise-knowledge-assistant> on 15 November 2026. It contains 91 original content sections, 35 tables, 14 code blocks, 10 diagrams in both source variants, and 67 glossary definitions. These counts describe that captured reference only.

The packaged reference under `approved-example/` preserves its actual HTML, reader, styles, fonts, diagrams, and source coverage. Inspect it visually when building a new interface or checking a format change. The generic assets in `../assets/reader/` carry the shared frame. Adapt through the renderer and authored Markdown, not through string replacement in the reference HTML.

## Keep the frame

- Bricolage display headings, Inter body text, indigo accent, restrained rules, readable content measure, and the existing spacing tokens.
- Five primary section links in the approved order. Keep the desktop contents rail, mobile topic selector, and separate progress rail.
- Topic-specific internal headings and expandable worked details. The six technical groups and eight walkthrough steps in the reference are examples, not universal limits.
- Stable fragment destinations. A link to content inside a collapsed topic opens every containing disclosure before focusing the destination.
- Explicit reading toggles and separate practice-attempt state. Opening a page does not mean reading it, and reading does not mean mastering it.
- Browser-local notes, export, self-assessment, and a printable Quick review. Clearly identify an unconnected worksheet or illustrative control.
- Native controls, visible keyboard focus, useful announcements, responsive tables and code, legible diagrams, and content available without scripting.

The existing prototype is light-themed. Do not promise a dark interface merely because both source diagram variants are preserved. If the user requests a theme change, implement and test it deliberately.

## Choose the opening details that help

Adapt the Case brief to the subject and intended reader. The opening details below are options to consider, not mandatory subsections or a fixed sequence. Include them when they clarify the case. Combine, shorten, reorder or omit them when they repeat obvious context, do not apply or delay the actual problem. Make these editorial choices without asking for permission.

- **Use case and user.** Explain what someone needs to do and the result they need when the title or scenario alone would leave that unclear. A short, self-explanatory case may need only a few sentences.
- **Terms.** Define unfamiliar domain words and necessary acronyms where they first appear. Skip a separate terminology subsection when there are no unfamiliar terms or inline definitions suffice.
- **Concrete example.** Trace inputs, meaningful checks or decisions, and the user’s output when a reader needs help understanding the workflow. Omit a separate example when the scenario already demonstrates it, or when another presentation explains the case better. Use source examples where available and label added hypothetical details as illustrative.
- **Human responsibility.** Explain review, approval, decision or action boundaries when the workflow contains them. Do not add an approval role to a case that has none.
- **Task, scope and learning guidance.** State what the reader must work through. Add distinct scope, learning-goal, audience, prerequisite or reading-guidance subsections only when they supply useful context. Combine them with the scenario when that reads more naturally.

The revised Document Review opening benefits from a fuller explanation because prior authorisation, payer policies and request packets can be unfamiliar. It traces records and a policy into a cited draft and clinician review. This is one useful treatment, not a template every case must reproduce. A narrow latency incident may benefit from opening directly with the observed symptom and target. A prioritisation case may explain the decision, available evidence and options without an input-to-output system trace.

Place helpful orientation in the visible Case brief. Introduce technical detail once the reader has enough context to follow it. A failure-led opening is appropriate when the failure itself explains the problem clearly. Preserve substantive source examples, constraints and failure mechanisms elsewhere in the casebook when shortening the introduction.

Keep the five primary sections. This flexibility applies to the initial subsections inside Case brief, not the overall navigation or complete source coverage. In faithful mode, any useful added orientation should be clearly labelled local content before the preserved source passages.

## Route source material by its teaching job

| Source material | Destination |
| --- | --- |
| Overview, task, audience, assumptions, running scenario | Case brief |
| Discovery, requirements, sizing, end-to-end reasoning | Design walkthrough |
| Essential evaluation, rollout, ownership, rollback | Design walkthrough |
| Connector contracts, policies, algorithms, state transitions, worked technical alternatives | Technical deep dives |
| Interview script, story, self-checks, follow-ups, pivots, incident drills, level calibration | Practice or the relevant closing walkthrough step |
| Recall sheet and key takeaways | Quick review |
| Sources and evidence | Beside the supported claim, with the complete reference list in Technical deep dives |
| Obsolete old reading instructions in a faithful migration | Labelled disclosure in Case brief |

A source chapter may split across destinations, and several chapters may share a topic. Record all mappings. Do not put substantive content in an unlinked appendix to make the brief appear complete.

## Internal order adapts

For an engineering system, the reference sequence is frame, requirements, sizing, architecture, decisions, failures, evaluation, and rollout. For a prioritisation case, use discovery, success measures, options, evidence, ranking, experiments, and a recommendation when those are the actual reasoning steps. Keep the five-section navigation in both cases.

The brief should get readers to the problem quickly. Deep dives should add mechanisms rather than paraphrase the walkthrough. Practice should test reasoning before revealing answers. Quick review should help recall decisions already taught in full.
