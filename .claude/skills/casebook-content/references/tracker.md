# Project rewrite tracker

For this project (the forwarddeployedprep.com site repository), each case lives in `02_System_Design_Case_Studies/Casebook_Rewrites/<slug>/`: the maintained `casebook.md` and `case.json`, the captured `source.json` and `source-assets/`, the reviewer's `visual-review.json`, the generated `reader.html` and `snapshot.json`, and the latest production `live-check.json`. The authoritative tracker record is `rewrite-tracker.json` in that folder, with the generated view `TRACKER.md` beside it.

Per case, from the repository root: `scripts/finish_case.py SLUG` builds the offline bundle and check reports in `.casebook-build/SLUG/` (git-ignored); `scripts/publish.py --slug SLUG` writes `reader.html` and `snapshot.json`; `npm run sync` in `site/` copies them into the deployed content. The casebook tracker records prose rewriting, not just a new layout or publication.

Run the skill's `scripts/tracker.py` from the project root. It finds the Git root automatically; `--root PATH` selects another project. Initialise a new project once with `--init catalog.json`. Initialisation refuses to overwrite an existing tracker.

```sh
python3 .claude/skills/casebook-content/scripts/tracker.py --summary
python3 .claude/skills/casebook-content/scripts/tracker.py --set enterprise-knowledge-assistant "In progress" --mode teach --section walkthrough=in_progress --note "Started the walkthrough prose rewrite."
```

Update the tracker after any casebook rewrite or review, including a partial draft or HTML-only review. Record the actual scope, paths, check results, and next action before delivery. Read back the updated row and report its status. A failed update is unresolved work, not a completed tracking step. Creating a tracker does not authorise starting the casebook rewrites.

Stages are `Not started`, `In progress`, `Review draft`, `Complete`, and `Blocked`. The five section keys are `case-brief`, `walkthrough`, `deep-dives`, `practice`, and `quick-review`. Their rewrite states are `pending`, `in_progress`, or `complete`. A faithful format migration can be a Review draft while all five prose rewrite states remain pending.

Checks are `source_coverage`, `editorial_review`, `structural_validation`, `browser_validation`, and `visual_review`. Check states are `pending`, `partial`, `passed`, and `failed`. Set each result with `--check name=state`. A passed result requires `--evidence` describing the actual comparison or naming its report. Evidence applies to the checks changed in that command. Do not infer an editorial pass from a renderer or browser pass.

Use `--artifact name=path` for each actual output. Paths relative to the repository are preferred. `markdown`, `html`, `coverage`, and `validation` artifacts are required for completion. `sample` can link a partial teaching example without implying a complete case draft. `--note` records the work, and `--next` records what remains.

```sh
python3 .claude/skills/casebook-content/scripts/tracker.py --set CASE-SLUG "Review draft" --check source_coverage=passed --evidence "Compared the source inventory with the output anchors; see 02_System_Design_Case_Studies/Casebook_Rewrites/CASE-SLUG/case.json." --artifact coverage=02_System_Design_Case_Studies/Casebook_Rewrites/CASE-SLUG/case.json --note "Source comparison passed; editorial review remains." --next "Finish the voice pass and review the diagrams."
```

The script rejects Complete until content mode is `teach`, all five rewrite sections are complete, all five checks pass with evidence, and the four required artifacts exist. This enforces recorded completion criteria; a human or agent still needs to perform the editorial comparison honestly. Failed completion attempts leave the JSON and Markdown unchanged.

Use `--render` to regenerate the Markdown from JSON. Do not hand-edit the generated tables. Batch-build catalog statuses are pipeline results; update the rewrite tracker separately after the actual editorial and visual review. A complete faithful import never automatically becomes a completed teaching rewrite.

## Deployment and live checking

Keep rewrite completion separate from publication. Each row has a **Live check** column with `pending`, `deployed`, `passed` or `failed`. Use `--live-status`, `--live-url`, `--deployment` and `--live-report` alongside `--set`. A published row needs an HTTPS URL and an identifiable deployment or merge reference.

Mark `passed` only after checking the published case, its five sections, assets, interactions and expected content. Supply `--evidence` and an existing JSON report with `passed: true`, `url` matching the published URL, and `deployment` matching the recorded reference. The script records check time and rejects a pass for an unfinished rewrite, absent report or mismatched evidence. A deployed build alone does not pass live checking. If a later deployment changes the case, set `deployed` while rechecking and replace the old report with results for that deployment.

Deployment requires user authorisation. When authorised, use the live site's maintained source/import pipeline, its branch/PR process and required checks. Preserve existing route and progress identities. Keep a page pending or failed if publication or live verification has not succeeded.
