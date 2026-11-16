# Casebook teaching rewrites

`casebook.md` and `case.json` are the maintained teaching content and metadata. `source.json` and `source-assets/` preserve captured source provenance and figures. `reader.html` and `snapshot.json` are generated from the validated approved reader, not edited directly.

The authoring checkout uses the `casebook-content` skill to build and validate each source, then `scripts/export_casebook_site.py --site-root PATH` exports reviewed bundles here. Run `npm run sync` from `site/` to create the committed deployment snapshots under `site/content/casebooks/` and assets under `site/public/casebook-assets/`. Sync rejects a reader whose source hash has changed without rebuilding. Vercel can use those snapshots when the repository-root sources are outside its build root.

The native Next.js route retains the site header, navigation, footer, scenario IDs and progress keys. Its five-section reader is progressively enhanced: all content is server-rendered, and reading/practice state stays in the browser. Publication and live verification are recorded separately in the authoring checkout’s casebook tracker.
