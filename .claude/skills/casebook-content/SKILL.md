---
name: casebook-content
description: >-
  Create, rewrite, or migrate Forward Deployed casebooks into the approved five-section format: Case brief, Design walkthrough, Technical deep dives, Practice, and Quick review. Preserve complete source teaching content and diagrams, explain mechanisms in the course-content style, and validate single cases or a batch of the 33 casebooks. Use for casebook pages and worked interview designs, rather than course lessons or modules.
---

# Casebook content

Build a complete casebook in the format approved for Enterprise Knowledge Assistant. The source supplies the subject and evidence. The approved prototype supplies the reading shell and five-section structure. The teaching guidance supplies the explanation style. Keep those responsibilities separate.

## Read for the current task

- [Format and mapping](references/format.md) before organising a case. Inspect the bundled approved example when implementing or changing the interface.
- [Teaching style](references/teaching-style.md) before writing or rewriting prose. It carries the relevant course-content explanation rules without importing its lesson template, word limit, or repository workflow.
- [Authoring and tools](references/authoring.md) to capture a source, author Markdown and coverage, build, and validate.
- [Batch work](references/batch.md) when the user requests several cases or all 33.
- [Validation](references/validation.md) before delivery.
- [Project tracker](references/tracker.md) when creating or updating project casebooks. Update the rewrite tracker after each rewrite or review, including partial work, before delivery.

Use Hallmark and No AI Slop when available. Preserve the approved casebook shell; do not deal a new theme. If course-content is installed, its current editorial-explainer and voice references may clarify the shared teaching style. This package includes the relevant guidance and works without that installation. Do not invoke its whole lesson workflow.

## Establish scope and mode

A case URL or source path authorises reading and adapting that case. An explicit all-case request authorises the batch. Creating or updating this skill does not itself authorise rewriting all 33, publishing, deploying, committing, or changing a live source repository.

- **Teach**, the default: explain the complete case in the course-content style. Reorganise and rewrite with full conceptual and evidential fidelity. Preserve diagrams, numerical observations, distinctions, examples, failures, qualifications, and questions. Review rewritten coverage substantively; a source-text hash cannot prove semantic equivalence.
- **Faithful migration**, when the user asks for verbatim preservation or a structural move without rewriting: retain original passages, tables, code, glossary definitions, and diagrams. Compare exact source text and assets. Label obsolete reading instructions as notes about the original navigation. Do not present them as instructions for the new format.
- **Review or partial scope**: obey the named scope and record what remains. Do not label a partial draft a complete casebook.

An instruction to retain all content never permits a thin summary. In teach mode, consolidate repeated explanations only when every distinct teaching item remains mapped. In faithful mode, retain repeated passages as well. There is no inherited 2,500-word limit. Cut filler and repetition before source substance, and resolve an explicit length conflict without silently dropping material.

A faithful HTML import with a new opening and a few bridging paragraphs is not, by itself, a completed teach-mode rewrite. Review and edit every substantive explanation for the requested voice, definitions, reasoning, and worked examples. Retain an original paragraph when it already earns its place in that style; preserve tables, figures, and attributed quotations without treating all captured prose as finished teaching copy.

## Organise the complete case

Keep exactly these five primary sections:

1. **Case brief**: give readers enough context to understand the case. Select useful opening details from the user/problem explanation, unfamiliar terms, concrete example, inputs/checks/output, human responsibility, task/scope and learning guidance. Combine, shorten, reorder or omit initial subsections when they add no value for that case. Follow the [case-specific opening guidance](references/format.md#choose-the-opening-details-that-help).
2. **Design walkthrough**: a complete interview answer in a useful reasoning order, from discovery through decisions, validation, and delivery. The reference uses eight steps; vary internal headings and count when the case needs it.
3. **Technical deep dives**: mechanisms, independently taught alternatives, worked calculations, operational details, and references that support the walkthrough.
4. **Practice**: a blank-page attempt, source questions and drills, follow-ups, changed constraints, worked answers behind explicit reveals, and a self-assessment rubric. Distinguish source exercises from newly authored additions. A linked worksheet is not imported unless actually read and included in scope.
5. **Quick review**: compact recall of architecture or decision framework, constraints, decisions, failure responses, and a closing answer. It must not become the only place a mechanism is explained.

Distribute Full Design material into the relevant steps, topics, or exercises. Keep no sixth Full Design reading track. Preserve all meaningful source material without reproducing the old navigation as another competing route.

Treat enterprise RAG as the reference case, not the universal subject. Do not transplant permission demos, six RAG topic groups, personas, corpus numbers, code commands, or model choices into unrelated cases. Product-judgement cases can walk through choices and evidence rather than an invented architecture.

## Capture, author, build

Read the actual source and all relevant supplied adaptations. Capture an item inventory before drafting. The bundled capture command inventories source sections and assets; split those into finer teaching items when a section contains several mechanisms or caveats. Do not infer completeness from headings or counts alone.

Record each source item, its meaning, output anchors, preservation status, and review evidence in `case.json`. Keep unavailable sources and gaps explicit. Preserve stable source fragments or provide aliases, including links into nested disclosures. Keep original diagrams with their explanations, hash their bytes, and inspect their rendered content. A diagram switcher or prose description does not replace a source figure.

Author `casebook.md` and `case.json` using [Authoring and tools](references/authoring.md). Build with the generic renderer; do not search-and-replace Enterprise Knowledge Assistant in generated HTML. The generic reader must receive the current case's metadata, note fields, rubric, and storage key. Keep reading progress separate from practice attempts.

When the live site repository is supplied, update its maintained content and shared template pipeline within the authorised scope. Preserve routing, importer contracts, real navigation, and protected assets. The standalone renderer supplies a reviewable offline bundle, not permission to replace the site's framework.

## Delivery gate

Review the opening before delivery for clarity and relevance. Apply only the opening criteria that help explain this case; missing optional subsections are not validation failures. Check the [opening criteria](references/validation.md#case-brief-clarity).

Run source and structural validation, then browser checks and visual inspection. Test all five sections, expanded disclosures, old fragments, images, notes, export, reversible progress, answer reveals, print, no-script reading, and unavailable browser storage. Report checks that did not run. Machine checks supplement a source-to-output editorial comparison; they cannot certify explanatory quality.

Deliver Markdown, the offline HTML bundle, coverage and actual validation results. For a batch, report each case's status and unresolved gap. Never report all 33 complete because a shell or catalog exists.

For a substantial skill revision, independently adapt a different case in an isolated workspace using only this package and the raw source. Use a non-RAG case when testing transfer. Review coverage and explanation, not only whether the reference rebuild passes. This package's independent pilot can be partial only when clearly labelled as a pilot and never counted as a completed catalog case.
