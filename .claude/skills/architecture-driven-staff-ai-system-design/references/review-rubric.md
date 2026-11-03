# Editorial and technical review rubric (0–5 per dimension)

Rate the *actual lesson* only after examining Markdown, HTML, and available labs. Report any checks not executed. Store scores, evidence, and the improvement plan only in `.system_design_review/<scope>/<run>/`, following `review-workflow.md`. Reviewer recommendations never mutate the lesson or declare learner mastery.

1. **Causal architecture:** clear requirement → failure → concept → change → outcome; preserves old capabilities.
2. **Concept teaching:** each first-taught module explained at mapped depth, not merely mentioned.
3. **Beginner clarity:** intuition before jargon; succinct examples and defined terms; no filler.
4. **Technical correctness:** explicit guarantees, failure boundaries, correct units/assumptions.
5. **Visual learning:** legible diagrams, accurate labels, walkthrough with explanatory states.
6. **Hands-on evidence:** reproducible test/lab with expected outputs when necessary; no fake claims.
7. **Staff interview readiness:** alternatives, quantified constraints, changed-constraint follow-ups.
8. **Retention and usability:** checkpoints, recall, exit gates, readable navigation and spacing.
9. **Curriculum continuity:** correct coverage and ADR mapping; carried-forward architecture.
10. **Distribution integrity:** parity, offline behavior, links, referenced files and validation evidence.

Use **not applicable** for dimensions outside the requested artifact’s scope, including implementation depth in Stage 0. Use **unchecked** when evidence cannot be inspected; do not convert missing verification into a passing score or invent a baseline comparison.

**Scores:** 5 = complete and evidenced; 4 = strong with small gaps; 3 = useful but missing important teaching/evidence; 2 = superficial; 1 = largely missing; 0 = absent.

Do not give an unconditional score above 4/5 for lab functionality without executing it. Distinguish code inspection, static HTML validation, browser interaction tests and real application integration tests. A structural validator cannot establish factual accuracy or mastery.

## Review output

- Ten dimension scores and an overall editorial judgement; disclose excluded/not-applicable/unchecked dimensions and any comparison baseline actually inspected.
- Up to 3 strengths tied to exact sections; do not fabricate strengths for incomplete material.
- At most 5 priority-ranked next changes in `improvement-plan.md`, with stable finding IDs, source locations, reasons, acceptance tests, dependencies and scope impact. Keep remaining findings in the reviewer reports or a deferred section.
- Clear pass/fail/unchecked for module-level evidence, source parity, HTML behavior and lab tests.
- Advisory recommendation: draft / conditional approval / approved as course baseline. Unexecuted applicable checks prevent unconditional approval; recommendations do not change course state.
