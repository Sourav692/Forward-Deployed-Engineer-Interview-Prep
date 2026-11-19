# Teaching and technical review

Use in every mode. Preserve the owner's format while improving what the reader can understand, implement, debug, and defend in an engineering interview.

## Teach a connected explanation

Prefer a natural progression from a concrete problem to intuition, mechanism, worked example, implementation, failure cases, trade-offs, and production decisions. Adapt the sequence to the topic. Use descriptive concept headings instead of forced Beginner, Intermediate, Advanced, or Deep Dive tiers, except where the owner format requires a heading such as Technical deep dives.

Write paragraph-first explanations. Each paragraph develops an idea with enough reasoning to connect it to the next. Use lists for procedures and parallel items, and tables for actual comparisons. Remove generic introductions, repetitive definitions, dramatic transitions, unexplained jargon, and one-line fragments that substitute for teaching. Apply No AI Slop when available. Preserve precise technical terms and the intended voice.

For each important concept, explain the need, mechanism, example, and limitations in connected prose. Prefer one running example with consistent entities, inputs, business rules, state, and outputs. Extend it as mechanisms are introduced. Use another example when it resolves a distinct teaching need, rather than forcing every topic into a refund agent or RAG scenario.

Teach architectural alternatives separately before comparing them. Explain what each optimises, the resulting trade-offs, likely failures, and when to choose it. Introduce relevant production concerns after the mechanism: latency, throughput, cost, reliability, retries, idempotency, concurrency, state, security, observability, evaluation, or deployment. Select the concerns that affect this topic's decisions.

## Explain figures and implementations

Introduce each important diagram, walk through its components or state transitions, and explain its engineering implication. Prefer static diagrams for structures and flows. Use interaction only when changing inputs or following execution teaches something meaningful. Preserve existing diagrams and working interactions under the owner rules, including mobile, accessibility, no-script, and offline requirements.

Explain the purpose before an implementation and its execution sequence, important parameters, state changes, errors, expected behavior, and limits afterwards. Avoid narrating trivial lines. Respect the project's dependencies and permitted code format. Preserve working editors, exercises, solutions, validation logic, and notebook destinations. Do not claim execution unless it occurred.

## Verify technical meaning

Check mechanisms, calculations, assumptions, boundaries, code, and diagrams against each other. Consult topic-specific primary sources for uncertain or version-sensitive claims, including corrections to the original. Record source links and relevant versions alongside claim evidence in the audit. Separate established behavior, design recommendations, source-reported measurements, and illustrative numbers. Do not promote a source example into a universal guarantee.

If an authoritative source contradicts protected source prose or a diagram, disclose the discrepancy and follow the owner's preservation rules. Add a qualified correction or supplementary figure where permitted rather than silently replacing protected evidence.

## Inspect the implemented result

Use the owner skill's existing build and validation tools. Rebuild after final repairs and inspect affected figures and interactions. Preserve approved typography, component patterns, routes, anchors, metadata, and genuine navigation. Use Hallmark when implementing or changing website design, respecting the approved house style. A content review is not permission to redesign the page.

Report checks as passed, failed, or not run with reasons. Separate automated structural results, visual inspection, semantic coverage, technical verification, and code execution. Keep unverified claims and unavailable sources visible even when the renderer passes.
