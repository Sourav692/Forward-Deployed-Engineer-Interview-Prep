# Editorial and technical review rubric (0–5 per dimension)

Rate the *actual lesson* only after examining Markdown, HTML, and available labs. Report any checks not executed.

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

**Scores:** 5 = complete and evidenced; 4 = strong with small gaps; 3 = useful but missing important teaching/evidence; 2 = superficial; 1 = largely missing; 0 = absent.

Do not give an unconditional score above 4/5 for lab functionality without executing it. Distinguish code inspection, static HTML validation, browser interaction tests and real application integration tests. A structural validator cannot establish factual accuracy or mastery.

## Review output

- Overall score (editorial judgment) with previous-version comparison when available.
- 3 strengths tied to exact sections.
- At most 5 priority-ranked changes with reason, acceptance test and scope impact.
- Clear pass/fail/unchecked for module-level evidence, source parity, HTML behavior and lab tests.
- Explicit approval status: draft / conditional approval / approved as course baseline.
