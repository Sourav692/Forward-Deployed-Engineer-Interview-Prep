# Content review — {{scope}}

Write this as `review.md` inside the current `.system_design_review/<scope>/<run>/` directory. This is a review recommendation, not a change to the course baseline.

## Scope and status
- Stage or artifact scope: {{scope}}
- Reviewed input fingerprints: {{paths and SHA-256 hashes}}
- Reviewer execution: {{three independent agents, or disclosed fallback}}
- Material reviewed: {{paths}}
- Intended depth: {{module depth list}}
- Learner mastery: unassessed

## Module teaching evidence
Use [module-evidence.md](module-evidence.md) in this report directory and the source curriculum map. List any concept that only appears by name. Stage 0 has no assigned modules; use an explicit not-applicable statement.

## Architecture and technical review
- Previous capabilities preserved:
- Before/after/sequence diagram consistency:
- System guarantees and uncertainty:
- Illustrative vs implemented vs verified:
- Security and privacy boundaries:
- Calculations and units:

## Output verification
| Check | Passed / Failed / Not run | Evidence |
|---|---|---|
| Markdown content and links | | |
| HTML parity and internal anchors | | |
| Offline rendering | | |
| Interactive walkthrough controls | | |
| Visual lab output / reset | | |
| Executable tests | | |
| Clean-extraction package links/tests | | |

## Scores, findings, and recommendation

Use the ten-dimension rubric with evidence and passed/failed/not-run/not-applicable checks. Link the independent reviewer reports. List strengths supported by inspected sections, consolidate findings without hiding disagreements, and link [improvement-plan.md](improvement-plan.md). Review recommendation: draft / conditional approval / approved as course baseline. Approval is advisory only; it does not update architecture, coverage, validation flags, or learner status.

## Remaining issues and next stage
List accepted limitations, specific fixes and carry-forward decisions. Do not claim production readiness from a fixture implementation.
