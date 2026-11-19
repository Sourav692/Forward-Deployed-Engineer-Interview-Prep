# Source coverage audit

Run for REWRITE and EXPAND. Compare the original baseline with the final content, not merely the first draft with its edited version. For a narrow expansion, inventory the affected material and inspect the rest for regressions. Label the report's scope so targeted results never imply a complete course audit.

## Inventory and map

Assign stable IDs such as `SRC-001` to meaningful teaching units: definitions, concepts, mechanisms, architectural decisions, algorithms, examples, code, tables, diagrams, numerical observations, caveats, failure cases, production considerations, exercises, answers, labs, and references. Retain existing inventory IDs when a calling skill already supplies them. Split multi-concept sections into substantive units.

Classify importance before drafting: critical for essential understanding or functionality, supporting for explanatory or implementation detail, optional for supplementary material. Do not downgrade importance after discovering a gap.

Record each item in the report:

| Source ID | Source location and teaching item | Importance | Final file and anchor | Status | Review evidence |
| --- | --- | --- | --- | --- | --- |

Use these statuses in the report; map them to existing manifest statuses only where their schema permits:

- **Preserved:** essential meaning and details remain.
- **Expanded:** retained with useful additional teaching.
- **Merged:** combined without losing any distinct teaching content.
- **Corrected:** a verified error is replaced by an accurate explanation, with the original claim, correction, and supporting source disclosed.
- **Omitted:** intentionally removed with explicit user authorisation recorded.
- **Missing:** absent, degraded, or represented only by a superficial mention.

Read the mapped passages. An anchor, matching heading, or keyword alone is insufficient evidence. A worked example requires its reasoning and result. Preserve quantities, uncertainty, negative findings, and source provenance. Keep each alternative's explanatory diagram when required; a switcher or table does not replace it. Preserve protected figure bytes and inspect their rendered meaning under the companion rules. Record any authorised redraw and its semantic mapping.

## Calculate coverage without hiding omissions

Count Preserved, Expanded, Merged, and Corrected as covered only after substantive comparison. For a merged item, verify each distinct source unit independently.

- Critical coverage = covered critical units / all inventoried critical units × 100.
- Overall coverage = covered units / all inventoried units × 100.

Report raw counts with percentages. Keep authorised omissions in the denominator and list them separately. If a denominator is zero, report `N/A (0 units)` rather than 100%. Do not extrapolate from sampled or inaccessible sections. State partial source access explicitly, even if every accessible unit is covered.

## Verify both directions

Source to output: confirm every source unit, protected asset, exercise, answer, lab destination, and necessary qualification survives. Missing critical content, unauthorised omissions, broken labs, unsupported meaning changes, or undisclosed substantive corrections fail the gate. Require 100% critical coverage and review all other omissions individually.

Output to source: identify added claims and mechanisms. Classify them as source-grounded, externally verified additions, labelled illustrative examples, or unverified claims. Source-grounded does not mean technically verified. Record authoritative evidence for substantive corrections and current technical behavior. Hypothetical numbers are not benchmarks.

Repair missing or weakened units, verify again, and update the final anchors. The report must include the inventory and mapping, counts, percentages, omissions and authorisation, technical corrections, additions, source limitations, functionality checks, and unresolved issues. Keep exact asset checks separate from semantic review evidence.
