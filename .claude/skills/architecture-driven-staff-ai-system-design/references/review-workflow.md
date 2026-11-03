# Review Generated Content and Produce an Improvement Plan

Use this workflow automatically after generating or revising course content, following the author's normal validation, and whenever the user explicitly requests a review. Review only the generated/revised or requested scope; do not automatically audit all stages. A reviewer supplies independent evidence and proposed improvements. Reviewing is not permission to repair content.

## Inputs and Output Boundary

Read the scoped Markdown, HTML, available lab/test sources, stage plan/state/validation, relevant ADRs and predecessor snapshot, and `references/curriculum-map.json`. Load `lesson-quality-contract.md` and `review-rubric.md` for the criteria. Missing artifacts are findings; inspect available files rather than refusing to review. For Stage 0, assess orientation and target-versus-implemented claims without assigning instructional modules. Do not require the full instructional-stage interview, phase-heading or implementation format. Check any promised/provided walkthrough or controls; a static orientation may explain the journey without an interactive lab. Missing essential customer/architecture/stage-map explanations are still findings. For a focused lesson or revision, use its owning stage for context and mark unrelated checks not applicable.

Create one run directory under the **repository root**, independent of the learning workspace:

```text
.system_design_review/<scope>/<UTC-timestamp-and-unique-suffix>/
  inputs.json
  structural-audit.json
  reviewers/
    technical.md
    teaching.md
    html-labs.md
  module-evidence.md
  review.md
  improvement-plan.md
```

Use scopes such as `stage-00`, `stage-05`, or a safe slug for a focused artifact. Use a unique run directory and retain prior runs. Add `/.system_design_review/` to the repository `.gitignore` if not already covered. All reviewer-created reports, evidence tables, captures, test logs and scratch copies stay under this ignored root. Never add these files to stage directories, public content, stage artifact manifests or distribution ZIPs. Do not link published lessons to local ignored reports.

Record reviewed paths and SHA-256 fingerprints in `inputs.json`, along with scope, applicable modules/depths, timestamp, previous report/baseline actually inspected, reviewer identities, checks and artifact provenance. A report for an older fingerprint is historical evidence, not proof of the current files. Keep private content out of the final chat summary.

The review must not edit guides, labs, ADRs, current architecture, coverage, stage-state validation flags, or learner status. The original authoring workflow may have produced its own changes; fingerprint the completed inputs at review entry and verify they are unchanged at exit. In an explicit review, treat all course files as read-only from the start.

## Structural Audit

Run the installed helper from either platform's skill directory:

```sh
python <skill-dir>/scripts/audit_stage.py --workspace <repo>/10_AI_System_Design --stage 5 --report-dir <repo>/.system_design_review/stage-05/<run>
```

It checks available structure and local references, and writes `structural-audit.json` only inside the ignored root. It does not execute code, grade teaching, create an improvement plan, or prove semantic parity, offline behaviour, interactivity, technical correctness or mastery. A missing concept name is a structural finding; a matching name is only a candidate for manual inspection. Do not require existing stages to contain `module-evidence.md` or `stage-review.md`.

For custom content paths outside the mapped stage layout, apply equivalent scoped inspection manually and disclose that the helper was not applicable. Do not silently review the mapped guide instead of the requested artifact.

## Three Independent Reviewers

Use three separate reviewer agents when delegation is available. Give each the same scope, input manifest, relevant source paths, quality contract, rubric and its own output path. Do not give them the author's proposed score, desired conclusion, or other reviewers' findings before they finish. Each agent writes only its assigned report and role-prefixed evidence/log files in the run directory. They may read shared inputs; coordinate actual runtime checks to avoid conflicting processes or shared state.

| Reviewer | Primary responsibility | Rubric dimensions |
| --- | --- | --- |
| Technical correctness | Preserve prior capabilities; verify diagrams against real interfaces, permission/tenant boundaries, durability/retries/unknown outcomes, units and assumptions; distinguish implemented, simulated, proposed and production-verified claims | 1 causal architecture, 4 technical correctness, 9 curriculum continuity |
| Teaching quality | Trace every scoped first-taught module to substantive explanation at mapped depth, system consequence, alternatives/failure and learner task; assess beginner clarity, cognitive load, interview answers and retention | 2 concept teaching, 3 beginner clarity, 7 Staff interview readiness, 8 retention and usability |
| HTML and labs | Check Markdown/HTML teaching equivalence, accessible diagrams/navigation, offline/no-JavaScript reading, keyboard/Reset/branch states, deterministic lab outputs, local links and package integrity | 5 visual learning, 6 hands-on evidence, 10 distribution integrity |

Each reviewer scores only the rubric dimensions assigned to its role in the table. The coordinator owns the combined ten-dimension assessment; reviewers do not guess scores for other roles.

Each report states inspected files/sections, observed strengths, finding IDs (`TECH-01`, `TEACH-01`, `HTML-01`), severity and impact, evidence locations, proposed bounded fix, acceptance check, and executed versus unexecuted checks. Report disagreements and evidence limits. A named component, passing structural audit or generated file is not enough to count as taught or tested.

The HTML/labs reviewer owns runtime verification. Inspect test sources before running; use an isolated scratch copy under the run directory for tests that could create files. Preserve import/layout dependencies and avoid installing packages or invoking external services as an automatic consequence of review. Real provider, credential-dependent, production or destructive runs require the user's separate existing authorisation. If a check is unavailable, record **not run** and give the exact command/prerequisites where useful. Inspection is not execution. Do not score unexecuted lab functionality above 4/5 or grant unconditional approval when an applicable check remains unexecuted.

If delegation is unavailable, perform three explicitly separated role passes, disclose the lack of agent independence, and do not claim independent reviewers ran. Do not stall a useful review because the harness lacks agents. Never recursively trigger this workflow for the review reports themselves.

## Synthesis and Improvement Plan

After the three reports return, reconcile findings against the source evidence. Keep valid dissent visible and explain dismissed false positives. Build the report-local `module-evidence.md` using its template: exact module/depth, explanatory section, architecture connection, failure/trade-off, actual lab/design exercise, exit question, and evidence status. Stage 0 has no assigned modules. Use `templates/stage-review.md` for `review.md` and `templates/improvement-plan.md` for the actionable plan.

Score the ten rubric dimensions with evidence. Mark unavailable evidence **unchecked** and out-of-scope criteria **not applicable**; explain how these affect the overall editorial judgement. Keep structural, editorial, code-inspection, runtime, browser, package and production evidence distinct. Review recommendations are **draft**, **conditional approval**, or **approved as course baseline**, advisory only. No recommendation changes accepted architecture, module coverage, author validation, publication state or learner completion.

Prioritise up to five next actions. Each action cites its originating finding IDs and exact source location, explains the learner/system consequence, proposes a focused change, names dependencies and affected artifacts, and gives an observable acceptance check. Use P0 for unsafe disclosure or materially false guarantees, P1 for incorrect mechanisms or missing mapped-depth teaching, P2 for usability/evidence gaps, and P3 for polish. Severity follows demonstrated impact; do not invent issues to populate every level. Keep additional findings as a deferred backlog. Recommend repairing the owning stage and its matching HTML before introducing a parallel lesson library; explicit user requests for standalone material still take precedence.

Stop after writing findings and the improvement plan. Do not apply fixes, invent passing evidence, run review/fix loops or advance to the next stage. If the user separately asks for repairs, perform them under the normal authoring workflow, then create a fresh review run after validation. Final chat: link the ignored `review.md` and `improvement-plan.md`, summarise the highest-impact findings and unchecked boundaries, and state whether three independent agents or a disclosed fallback ran. This request configures future review behaviour; it does not require retroactively reviewing the whole course.
