# Working across the casebook catalog

The catalog at <https://forwarddeployedprep.com/design> listed 33 cases when this package was created. Refresh it for a live batch rather than assuming the saved list is current. Some cases have several reading depths; others have one long design. Capture each actual source instead of assuming the Enterprise RAG DOM or counts apply everywhere.

Use the catalog command to record the current list and worksheets:

```sh
uv run --no-project --with beautifulsoup4 --with markdown-it-py python SKILL_DIR/scripts/casebook.py catalog --out work/catalog.json --expect 33
```

`--expect 33` verifies a user-requested batch size. If the catalog changes, report the difference and preserve the requested scope. Do not select extra pages or omit one to force the expected count. The bundled `references/catalog-2026-11-15.json` records the initial URLs and is a provenance reference, not a claim that they are permanently current.

For each case, maintain a record with its source URL, slug, source retrieval time, output directory, content mode, coverage status, editorial status, browser status, and any unresolved gap. Use `pending`, `draft`, `validated`, `complete`, or `blocked`. A complete case has passed source comparison, editorial review, and the checks actually available in the environment. A blocked fetch does not count as a completed case.

Process source capture, mapping, prose, rendering, and review for each case. Reuse the maintained shell, not another case's content. Check an engineering case and a product-judgement case before propagating a template change across the whole batch. If a common renderer bug is found, fix it once and rebuild affected cases rather than patching their generated HTML.

Keep progress durable so another turn can resume unfinished cases. Record explicit failures per case and continue independent authorised cases when useful. Do not overwrite unrelated work or publish anything as part of a local batch. At delivery, report completed, draft, and blocked counts and link the batch record. Do not claim that a refreshed catalog means 33 casebooks have been authored.

When the project has a rewrite tracker, follow [Project tracker](tracker.md) after each case. Keep the catalog's build status separate from the tracker’s prose-rewrite completion. Use the tracker script to record section progress, source/editorial review, validation evidence, artifacts, and remaining work.

Once the individual cases have been authored at `work/SLUG/case.json`, batch rendering and checkpointing are available:

```sh
uv run --no-project --with beautifulsoup4 --with markdown-it-py python SKILL_DIR/scripts/casebook.py batch-build --catalog work/catalog.json --cases work --out exports --browser
```

This command builds authored cases, checks them, and updates the supplied catalog after each case. Missing authoring stays `pending`; a structural failure stays `draft`. A content check alone reaches `validated`. A `complete` record also requires passing browser checks and a recorded `visual_review.status: reviewed` in that case's metadata. Record the actual diagram and interface inspection before setting it. The command does not author missing prose or substitute for editorial judgment.
