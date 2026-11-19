# Curriculum completeness audit

Run for CREATE and EXPAND. Review fresh drafts against learning objectives and expected scope rather than inventing a source lesson for comparison. EXPAND also needs the source coverage audit.

Before drafting, identify the audience, topic boundaries, prerequisites, implementation goals, production depth, and engineering decisions the learner should be able to make. Give measurable objectives stable IDs such as `LO-001`. Distinguish mandatory objectives from optional enrichment. Carry forward the caller's objectives when already established.

Map concept dependencies and order the explanation accordingly. A prerequisite may be explained locally or linked to an appropriate existing lesson with a clear prerequisite notice. Inspect neighbouring lessons when available to avoid unnecessary duplication. Do not add unrelated topics to inflate completeness.

## Review the final evidence

| Objective ID | Mandatory or optional | Required concept or skill | Final file and anchor | Evidence | Status |
| --- | --- | --- | --- | --- | --- |

Use Covered, Partially Covered, Missing, or Not Applicable. Mark Covered only when the actual explanation or exercise demonstrates the objective. Mark Not Applicable only with a scope-based justification; do not reclassify a mandatory objective to hide missing content.

Require every mandatory objective to be Covered. Check prerequisite availability, mechanism accuracy, a meaningful worked example when appropriate, relevant implementation detail, failure modes, limitations, and production decisions. Implementation may use a trace, field table, linked notebook, or code according to the owner format. A theory-only lesson must not gain prohibited code fences to pass this review.

Align conceptual checks, practice, and Senior/Staff interview questions with the objectives. Provide worked answers or expected outcomes. Master Prompt v3 suggests roughly three exercises and three to five interview questions, but choose the count for the topic and existing format. Put takeaways, practice, interview answers, and production decision synthesis in the owner format's appropriate sections, without duplicating its ending or adding a sixth casebook section. A partial addition should not grow into a full new tutorial unless needed for its scope.

## Research and repair

Verify relevant mechanisms, API behavior, and version-sensitive details against official documentation, original research, specifications, or maintainer sources. Distinguish evidence from illustrative scenarios and engineering recommendations. Record versions when compatibility matters. Never invent citations or execution results. If sources cannot be accessed, disclose uncertainty and leave affected verification incomplete.

Repair missing objectives, abrupt transitions, unexplained assumptions, superficial examples, inconsistent state, unsupported claims, and absent limitations. Recheck affected objectives after revisions. Deliver the objective matrix, prerequisite decisions, evidence sources, corrections, actual code or build checks, and unresolved gaps. Do not claim curriculum completeness while mandatory objectives remain partial or missing.
