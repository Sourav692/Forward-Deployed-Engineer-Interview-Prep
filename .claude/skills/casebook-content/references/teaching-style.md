# Explanation and voice

This guide adapts course-content's `editorial-explainer.md` and `voice.md`. It preserves their teaching style while allowing the complete casebook format, source code where material, and interview-answer examples.

Read [the corrected non-RAG teaching example](teaching-example.md) when judging whether a draft explains a mechanism or only imports the source. Its [source comparison](teaching-example-coverage.json) shows the level of specific preservation evidence expected. It is a representative section, not a completed second casebook.

Write like an engineer explaining a design to a colleague. A beginner should understand the terms and sequence. An experienced reader should find the mechanism, alternatives, failure conditions, and production consequences.

## Orient the reader first

Use the [case-specific opening guidance](format.md#choose-the-opening-details-that-help) to decide what orientation helps. Define unfamiliar terms and add an example when needed, but do not force separate user, terminology, example or approval subsections into every case. A concise scenario or a clearly explained incident may already establish the task. Judge the opening by whether readers can follow the case without avoidable confusion or repetition.

## Teach a decision fully

Begin with a concrete need or failure from the case. Define unfamiliar terms before relying on them. Show the system or decision framework in a labelled diagram when the relationship needs one. Follow one input through the components: what each component reads, decides, changes, and passes on. Then explain what the user receives and what happens when a check fails.

Keep one running example where it remains useful. Do not copy the RAG example into another subject. Each abstract claim should receive a concrete example nearby. Use source-reported measurements as evidence with their original limits. Label new hypothetical values and scenarios as illustrative.

Teach genuine alternatives separately before comparing them. Each architectural alternative needs its own explanation and labelled diagram when its topology differs. Trace the same input through each alternative so the reader can see different state or output. Then state the trade-off and the condition under which each option fits. A comparison table or switcher supplements that work.

For failure diagnosis, name the failure, show its consequence, identify where it becomes observable, and connect the response to a guard or recovery path. Explain uncertainty, negative results, and unresolved limits as plainly as successful behaviour.

## Prose

- Use conversational, precise sentences and paragraphs of one to four sentences. Use “we” for shared reasoning and “you” for advice.
- Define a new technical term in plain words on first use and expand an acronym once before relying on it. Preserve source glossary definitions in a faithful migration.
- Keep a consistent name for each component and state. Separate computing a result, persisting it, deciding the next action, and observing it when they are different operations.
- Introduce a table or diagram with what it shows. Give the figure a descriptive caption, and explain its implication after it. Inspect source diagrams as well as their filenames.
- Prefer connected explanation to lists of interview slogans. Use lists for genuine options, steps, requirements, or checks.
- Avoid hype, filler openings, rhetorical setups, binary contrasts, invented superlatives, decorative labels, excessive dashes, and repeated section summaries. Apply No AI Slop without removing technical substance.
- Use at most one useful analogy per major section. Do not make every section follow an identical paragraph template.
- Use descriptive links near claims. The page must remain understandable without following them.

First-person language belongs only in a clearly labelled spoken-answer example or an attributed source quotation. Never imply the reader built a system they did not build. A narrative inherited from the source remains source-reported.

## Casebook-specific differences

The five-section casebook shell replaces the course lesson shell. The reference's numbered walkthrough steps are allowed; course lesson heading restrictions do not govern them. New theory should usually explain mechanisms through prose, traces, field tables, and diagrams, but preserve source code and commands that carry meaning. Identify commands belonging to a separate reference project rather than implying the prototype implements them.

Do not impose course-content's 2,500-word limit on a full case. Preserve complete explanations before adding optional material. In faithful migration, source wording and punctuation remain intact even when they differ from this preferred voice. Explain a source discrepancy or overbroad claim in a separate, sourced note rather than silently changing an explicitly preserved passage.

## Editorial review

For each decision, check that the reader can explain why it exists, follow the input and state through it, compare the actual alternative, identify its failure condition, and state its limits. For each rewritten source item, record the output passage that teaches it. Matching keywords, headings, or hash counts cannot establish that explanation.

Review the body throughout the page, not only its new introduction. A source may contain interview slogans, bullet fragments, broad frequency claims, or rhetorical contrasts that need editing even when its technical content is retained. New traces supplement that editorial work. After moving a numbered reference, rewrite the whole affected sentence for grammar and link its actual destination; do not mechanically replace a section number with a heading phrase.

Coverage evidence should name the actual mechanism, example, or caveat and the output passage that preserves it. Repeating a stock sentence about “fields, numbers, and qualifications” across an inventory does not establish that comparison. Report an unfinished voice pass as remaining editorial work rather than marking the case complete.
