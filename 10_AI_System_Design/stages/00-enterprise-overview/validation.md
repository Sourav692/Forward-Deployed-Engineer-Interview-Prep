# Stage 0 Validation

Stage 0 is an orientation, with no newly assigned modules, new backend implementation, or change to the accepted architecture. It synthesises the existing supplier workflow and previews the target system; all stage-specific workload and objective figures remain illustrative.

## Executed Content and Architecture Checks

The authoring check at `.website_spec/qa/stage-00/check_static.py` compares 287 teaching blocks from Markdown against the offline HTML. It checks local links and cross-file HTML anchors, unique IDs, five learning phases, two answer reveals, three inline SVGs, four complete architecture lanes, seven input/output/owner/failure steps across three branches, and all twelve stage entries. It verifies that accepted architecture, module map and coverage records remain byte-identical to the task baseline. Stage 1 has matching overview links in Markdown and HTML.

The overview preserves the difference between supplied-text drafting, authorised grounded answers, and background preparation. The regional drawing has sibling EU and US cells with no EU-to-US data-copy edge. The target Mermaid graph places enterprise sources and hosted processing outside the regional service cell. Training and self-hosted serving remain conditional proposed paths. The model lifecycle map follows optional training, registry, evaluation/approval, then release; existing models need no new training job.

The source map validator still reports 12 instructional stages, 18 domains, and 56 modules. Stage 0 is a context-only orientation outside those primary teaching assignments. Learner mastery remains unassessed.

## Offline HTML and Visual Checks

The browser check at `.website_spec/qa/stage-00/check_browser.cjs` exercises each of twelve stage-focus selections and their highlighted roles/guide links, map Reset, all 21 request walkthrough steps and every field, Previous/Next/direct selection, walkthrough Reset, keyboard Tab/Enter controls, two answer reveals, 375-pixel layout, print, and no-JavaScript reading. It rejects HTTP(S) requests and browser exceptions. Static source tables and all architecture roles remain readable with scripting disabled. The regional SVG scrolls within its own labelled region on narrow screens so text need not shrink below readable size.

Initial browser checks passed. A later confirmation launch timed out while the production build was running; final confirmation passed after that build. An initial native-select keyboard assertion assumed a platform-specific dropdown sequence; the final check uses native focus traversal and button activation alongside explicit option-change checks.

Hallmark render lint initially found seven long stage links wrapping inside the twelve-stage table. Short stage-number links now precede the full visible titles. The confirming render sweep reports zero failures, reflex findings, or warnings, with two inherited reading-document layout exceptions. The technical orientation deliberately preserves the full teaching text. An in-thread visual review checked the desktop header, mobile architecture map, role hierarchy, and static/interactive distinction. No independent accessibility or screen-reader assessment is claimed.

## Repository and Distribution Checks

Repository checks passed from `site/` in order: `npm run sync`, `npm run check:content`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`. The production build completed successfully after automatically retrying several static routes that exceeded their first 60-second attempt. This overview introduces no Next.js route or public-content sync root. The generated manifest timestamp is unrelated to the orientation and is excluded from the task changes.

The complete ZIP preserves `10_AI_System_Design/` paths for the overview, referenced Stage 1–12 guides/labs, stage records, applicable ADRs, accepted architecture, curriculum/coverage, authoring renderer, and font licences. All twelve guides are reachable from the overview’s stage map. The package excludes historical ZIPs, caches, databases, credentials, hidden metadata, and render captures. Clean extraction resolves local Markdown/HTML links and anchors, checks all declared artifacts, and runs the included Python suites. Extracted Node worksheet checks verify that inherited runnable lessons retain their expected cases. A SHA-256 checksum accompanies the package.

Validation flags and the final recorded results below are set only after the checks complete. The HTML needs no network or build step to read. Re-rendering uses `uv run --with markdown python 10_AI_System_Design/tools/render_overview.py` from the repository root; reading it needs no Python dependency.

## Unchecked Boundaries

No enterprise identity provider, cloud service, document connector, provider/model call, GPU, real training/checkpoint restore, distributed writer fencing, actual regional recovery, load/service-objective measurement, invoice reconciliation, or production rollout is exercised by Stage 0. Inherited local tests do not establish those integrations. The next learning action is Stage 1’s saved-draft path, followed by the existing stage sequence and its depth-specific exit gates.

## Final Recorded Result

All 287 teaching blocks and local links/anchors passed. All twelve stage-focus selections, 21 walkthrough steps, field values, Reset, keyboard, mobile, print and offline/no-JavaScript checks passed with no HTTP(S) requests or browser exceptions. Render lint has zero failures, reflex findings, or warnings. Repository sync, content, lint, TypeScript and production build passed. Clean extraction passed declared artifacts, links/anchors and all twelve inherited Python suites. The final package also checks its extracted inherited JavaScript worksheets and checksum. Architecture and all module assignments/coverage remain unchanged.
