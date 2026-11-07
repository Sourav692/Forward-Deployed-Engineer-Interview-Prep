# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Context management

- Every agent session in this repository (Claude Code, Codex, OpenCode, or any other harness) must load and follow the Caveman skill from the first turn. It stays on for the whole session.
- Purpose: the repo has very large markdown sources and generated content. Caveman keeps replies, status lines and tool-run narration terse so context lasts.
- Claude Code: invoke `caveman:caveman` via the Skill tool. Codex / OpenCode: load the installed `caveman` skill or its rule file.
- If the skill is unavailable in a harness, follow its rules anyway: answer first, no ceremony, one idea per sentence, code/paths/errors verbatim.
- Pair it with context-saving habits: read only the file range you need, grep before reading, delegate broad searches to subagents, and never dump whole generated files (`site/content/`, `manifest.json`) into context.
- Caveman applies to chat only. Files, commits, PR bodies and content written to the repo stay in normal prose and follow the style guide.

## Layout

- Root dirs are markdown prep content grouped by kind, numbered `00_`–`10_` plus `99_Reference_Library/` (see the README table). Put new material in the folder matching its kind, not its source.
- These feed the site: `03_Practice_Worksheets_and_Keys/Customer_Discovery_Worksheets/` and `System_Design_Worksheets/` (module 01), `04_Behavioral_and_Leadership/` (module 14), `02_System_Design_Case_Studies/Scenario_Packs_G01_G20/` and `Standalone_Designs/` (module 15), `07_Last_Day_Revision/`, `08_Company_Specific_Prep/Blitzy/` (module 16, currently unpublished). `/learn` lessons come from the files `site/src/lib/curriculum.ts` lists, synced by `site/scripts/learn.mjs`: mostly `01_Concept_Tutorials/` and `05_FDE_Delivery_and_Scoping/`, plus a few files in `00_Start_Here/`, `02_.../Classic_Design_Walkthroughs/`, `03_.../Problem_Decomposition_Bank/` and `03_.../Mock_Interviews/`. Renaming any of them needs the matching path change in `site/scripts/*.mjs` or `curriculum.ts`.
- `site/` is the only JS project: Next.js 16 App Router, React 19, Tailwind v4, npm. Run all npm commands from `site/`. No root package.json.
- Skills: Claude Code gets the Sourav692 skills from the `sourav-skills` plugin, so this repo has no `.claude/skills/`. Codex skills are npx installs in `.agents/skills/` (tracked in `skills-lock.json`). Update them with `.agents/update-skills.sh`, never `npx skills update`: it re-adds `.claude/skills` symlinks. Add one with `npx skills@latest add <owner/repo> -s <name> -a codex -y`.
- Next 16 APIs may differ from training data. Read `site/node_modules/next/dist/docs/` before using Next APIs (see `site/AGENTS.md`).
- `09_Study_Plans/` is gitignored: it indexes a purchased third-party library. `06_` and `08_` packs are committed (only Blitzy is synced); some files (`LIBRARY_MAP.md`, `ROADMAP_7_DAY.md`, the condensed plan xlsx) reference that library, so strip those references before wiring them into the public site.
- Platform plan: `00_Start_Here/Platform_Blueprint.html` (source brief `.website_spec/reference/website_prompt.md`, local only).

## Website docs (`.website_spec/`)

- Whole-site topic and module reference: [Site Topics and Module Catalogue](.website_spec/reference/2026-10-27-site-topics-and-modules.md). Keep this Markdown file current in the same task whenever a site change affects topics, tracks, modules, lessons, cases, worksheets, revision material, learning paths, glossary coverage, routes, or publication status. Update the affected entries, links, counts, availability labels, and inventory date against the curriculum and published manifests after syncing content. Keep its [HTML companion](.website_spec/reference/2026-10-27-site-topics-and-modules.html) aligned. These files are local, gitignored website documentation; if absent in another clone, report that limitation rather than claiming they were updated.

- Every website-related design doc, spec, audit, plan, task board and QA report lives in `.website_spec/` at the repository root. Put new ones there, never in `site/` or another committed folder.
- `.website_spec/` is gitignored: it exists only in the owner's clone, is never committed or pushed, and does not reach CI, Vercel or PRs. Nothing the build or checks need may live there.
- Layout: `status/` holds the plans by state (see Plan status), `tasks/` the task boards and cards (`phase-N/`, `backlog/`, one folder per plan), `reference/` the docs whose rules still apply and the finished inputs: the style guide, design tokens, Learn UX (wireframes, copy deck, dashboard rules), canonical homes, consolidation playbook (notes in `consolidation/`), the site catalogue, the Phase 1 QA report and the original briefs (`website_prompt.md`, `prototype_prompt.md`, `curriculum_plan.md`, `module_source_audit.md`). Put a new reference doc in `reference/`, a new plan in `status/todo/`. The production plan is `.website_spec/status/in-progress/2026-10-05-production-implementation-plan.md`; its board is `.website_spec/tasks/README.md`.
- Plan status: [`.website_spec/status/README.md`](.website_spec/status/README.md) lists every website plan as Done, In progress, To do or On hold, with its board, PRs and what is left. Each plan file (with its audit, review or QA files) sits in the folder for its state: `.website_spec/status/done/`, `in-progress/`, `todo/` or `on-hold/`. Read the page before starting plan work. When a plan changes state (work starts, its last task merges, it stalls or goes on hold), move its files to the new folder, fix the links to them (task boards, this file, `AGENTS.md`) and move its row on the page, in the same task. Reference docs stay in `.website_spec/reference/`.
- Code comments may point at these files by their `.website_spec/` path. Files moved out of `site/specs/` on 10 October 2026; git history before that commit still has them.

## Commands (from `site/`)

- `npm run sync`: regenerate `site/content/` from root sources. Runs automatically before `dev` and `build`.
- `npm run check:content`: the de facto test suite (no test runner exists). Validates worksheet structure, editorial metadata, internal links, glossary acronyms, placeholders. Run after any content, `editorial.ts`, `glossary.ts` or sync-script change.
- `npm run lint`, `npx tsc --noEmit` (no typecheck script; `tsconfig.json` excludes `scripts/`).
- Other checks: `check:curriculum` (curriculum model, groups, rounds, redirects, track and module codes, a stale curriculum index), `check:paths` (learning-path hours), `check:bundle` (per-route client JS budgets, after `npm run build`), `check:routes` (`BASE_URL=http://localhost:3307` against `next start -p 3307`), `check:rules`, `check:store` (progress) and `check:rag-import`.
- The `.ts` scripts run as plain `node` via native TS type-stripping: they need Node 24 (`engines` in `package.json`).
- CI (`.github/workflows/ci.yml`) runs on every pull request to `main` and by hand (`gh workflow run ci.yml`), not on pushes; the repo is public, so Actions has no billing limit. The uptime check (`uptime.yml`) runs hourly. A local, untracked `.git/hooks/pre-push` re-runs sync on each pushed commit in a temporary worktree and blocks the push when the committed snapshot is stale or `check:content` fails. "generated content is out of date" means: run `npm run sync`, commit the snapshot, push again.

## Content pipeline

- `site/content/` and `site/public/fde-last-day-prep/` are generated by `site/scripts/*.mjs` but committed. Builds in a shallow git clone (Vercel, CI's e2e job) use the committed snapshot, because the sync dates each page from git history (`shallowClone()` in `sync-content.mjs`); CI's "Verify site" job syncs with full history and fails if the snapshot is stale. Never hand-edit them: edit the root source, then `npm run sync`.
- Sync does `rm -rf content/` and rewrites `generatedAt` in `manifest.json`, so every dev/build run dirties `manifest.json`.
- `learn.mjs` writes `site/content/learn/<track>/<module>/<lesson>.md` and `manifest.json` for every `kind: 'sync'` lesson with `publish` `own` or `credited` whose module is not `on-hold` or `coming-soon`; `kind: 'live'` lessons get only a manifest `href` to their existing page. It reads only its root-folder allow-list (`ALLOWED_ROOTS`; never `06_`, `09_`, `99_`), rewrites repo links (lesson → `/learn/...`, live page → its URL, anything else → GitHub) and strips `<script>`, `<iframe>`, `<style>` and `on*=` attributes. A published lesson whose `<module>/<lesson>` disappears fails sync and `check:content` unless `RENAMED` in `curriculum.ts` maps it.
- Consolidated lessons live in `01_Concept_Tutorials/Consolidated_Lessons/<Code>_<Title>/` (method: `.website_spec/reference/2026-10-05-consolidation-playbook.md`). The retired source files stay in the repo as references (`publish: 'excluded'`). `RENAMED` is assembled from one file per track in `site/src/lib/consolidation/tN.ts`; `next.config.ts` turns each entry into a 308 redirect, and `check:curriculum` fails on chains, on values that are not published lessons and on keys that are still published.
- The AI Engineering topic is the RAG & Agents Engineering course (github.com/Sourav692/rag-agents-engineering), which stays the place to edit it. Its theory pages are vendored in `01_Concept_Tutorials/RAG_Agents_Engineering/` (`source.json` names the course commit) with their labs in `site/public/labs/rag/` and figures in `site/public/learn-assets/rag/`; its tracks, modules and lessons are `site/src/lib/rag-tracks.ts`. Never edit any of these here. To refresh: in the course repo, commit, then run `uv run python scripts/export_site_curriculum.py --out <this repo>/site/src/lib/rag-tracks.ts`; here, from `site/`, run `npm run import:rag-theory -- --from <course repo>`, then `npm run sync`, `npm run check:content` and `npm run check:rag-import`. Both steps are deterministic, so an unchanged course gives no diff. Lesson slugs come from the course's `docs/fde-site-slugs.yaml` and never change.
- The Staff AI System Design course (Learn track T18, `staff-ai-system-design`, in the AI System Design group) is edited in `10_AI_System_Design/`: stage guides `stages/NN-<stage>/guide.md`, their `guide.html`, Python labs and ADRs. Its own tooling, index and stage ZIPs stay offline; the site does not use them. From `site/`, `npm run import:sd-course` (`scripts/sd-course-import.mjs`) splits each guide's five `## N.` parts into lessons in `01_Concept_Tutorials/AI_System_Design_Course/` (a part over 2,500 words splits again before its first Interview heading, as Stage 12's does), cuts each `guide.html`'s interactive blocks into `site/public/labs/system-design/`, and adds a "Run the code lab" section (Python only: GitHub links to `labs/*.py` and the repo-root `test_*.py -v` command; no ZIPs, Codespaces or JavaScript). Each ADR in `architecture/decisions/` becomes a lesson of the track's last module, Architecture decision records (T18.14), and links to an ADR point there. The import also maps the course's own numbering to site codes ("Stage N" becomes T18.(N+1), topic codes and D0 to D3 depth tags become words), cuts links to the course's bookkeeping files (stage plan, state, validation, progress maps) and appends each lesson's Key Takeaways from `site/sd-course-pages/key-takeaways.md`, a site-side file edited here; the import fails on a lesson without an entry. Never edit those generated copies. The track, modules and lessons are `site/src/lib/sd-course.ts`; the import fails unless every generated file is a lesson there under the same title. To refresh: commit the course change, run `npm run import:sd-course`, `npm run sync` and `npm run check:content`, and commit the lessons, labs and diagrams in one PR. The import fails on uncommitted course changes, a broken link or anchor, a placeholder or a page over the limit, and a second run gives no diff. `check:content` allows GitHub links into `10_AI_System_Design/` only.
- Not synced to the site: `01_Concept_Tutorials/System_Design_Fundamentals/`, `05_FDE_Delivery_and_Scoping/Delivery_and_Collaboration/`, any other `01_`/`05_` file `curriculum.ts` does not list, `02_.../Scenario_Tutorials_Long_Form/` (only linked as archived tutorials), `08_.../OpenAI_Applied/` and `OpenAI_Anthropic_Pack/` (outside the allow-list; their module is on hold) and `99_Reference_Library/`.
- Worksheets have no frontmatter. Fillable regions are inferred from emptiness (empty table cell, bare `-` bullet, `Label:` with nothing after). Metadata lives in `site/src/lib/editorial.ts`.
- `site/src/lib/editorial.ts` and `glossary.ts` are imported by the `.mjs` sync scripts: keep them free of runtime imports.
- Track, tab and slug ids must never change (URLs and localStorage progress `fd:v1:*` key on them); labels may change. Track ids must be unique site-wide.
- Track and module codes are labels, not ids: grouped tracks run `T0`, `T1`… in `LEARN_STAGES` order and each track's modules run `.1`, `.2`… in section order. Adding or moving a track renumbers the codes after it; `check:curriculum` fails on a code out of order. Course codes come from the course's slugs file via `rag-tracks.ts`, and the import rewrites the course's own numbering ("M13", "Lesson 13.2") into site codes.
- Browser code imports `site/src/lib/curriculum-index.ts`, never `curriculum.ts`: a client module that imports the full curriculum ships all of it on every page and breaks the bundle budgets. The index is generated: after editing `curriculum.ts`, run `node scripts/curriculum-index.ts` and commit the result (`prebuild` regenerates it; `check:curriculum` fails when it is stale).
- Mermaid diagrams are drawn to static SVG at sync (`site/public/diagrams/<key>-light|dark.svg` plus `index.json`, cached by content, rendered with Playwright Chromium). A new or changed ```mermaid fence needs a local `npm run sync` and the new SVGs committed, or `check:content` fails. Course diagrams the course marks as animated arrive as ```animated fences (inline SVG, `AnimatedDiagram`) and have no static SVG.
- An all-caps token on 3+ pages must be added to `GLOSSARY` or `NOT_ACRONYMS` in `glossary.ts`, or `check:content` fails.
- Adding a module/track/scenario touches many files: follow "Adding a module, track or scenario" below.

## Site structure (groups)

The site is meant to be the single place for AI Engineering and Forward Deployed Engineering preparation. It is organised on two axes, decided on 30 October 2026. Plan: `.website_spec/status/on-hold/implementation_plan_site-groups-and-structure.md`. Research: `.website_spec/reference/2026-10-30-platform-review-and-site-groups.html`.

- **Learn by topic.** Learn tracks sit in eight topic groups, in this order:
  1. Start here
  2. AI Engineering
  3. Harness Engineering
  4. Inference Engineering
  5. AI System Design
  6. Forward Deployed Engineering
  7. Coding
  8. Career
- **Groups are navigation only.** They are defined in `LEARN_STAGES` (`site/src/lib/learn-stages.ts`), and track ids, URLs and progress never depend on them. Every Learn track sits in exactly one group (`check:curriculum` enforces it).
- **Group cards and pages.**
  - `/learn` shows the eight groups as square, bordered cards (`components/learn/GroupCard.tsx`, `cb-group-card` in `editorial.css`). A card shows the group's number, title, summary, track count, hours and progress. It does not list track names.
  - A live group's card is one link to its page at `/learn/topics/<group>`, which lists its tracks with the requirement and progress filters.
  - A group with no tracks yet is a Coming soon card (dashed border, second paper). It shows its `planned` topics, has no link and no page (its URL is a 404), and stays out of the sitemap. Never promise a date.
  - Breadcrumbs on Learn track, module and lesson pages run Learn, group, track (`groupTrail` and `trackTrail` in `site/src/lib/learn.ts`).
  - No track may use the slug `topics`.
- **Interview by round.** The interview area follows the rounds of a real loop: recruiter screen, coding, AI-assisted coding, AI system design, decomposition or case study, customer scenario, behavioural, demo or take-home.
  - The rounds are `INTERVIEW_ROUNDS` in `site/src/lib/curriculum.ts`. Each lists, by slug, what it tests, the Learn modules to study, practice lessons in titled groups and its mock interviews; the page copies no content.
  - `/interview` shows the rounds as `cb-group-card` cards, the same piece as the Learn groups, then the final week. A live round opens `/interview/rounds/<round>` (helpers in `site/src/lib/interview-rounds.ts`). A round with no content sets `planned`: a Coming soon card with no link and no page.
  - A new interview page belongs to one round: add its slug there. `check:curriculum` fails on an unknown or unpublished slug and on a mock interview that is in no round.
  - The five old topic hubs became rounds. `/interview/hubs/<hub>` 308s to its round (`site/src/lib/redirects.ts`). No interview module may use the slug `rounds` or `hubs`.
- **Placing new content.** A new track goes in the group for its discipline. Behavioural, portfolio, resume and negotiation material goes in Career, not Forward Deployed Engineering. AI System Design stays in Learn.
- **Overlaps.** Before adding a Harness Engineering lesson, check the `agentic-systems` modules "Context and memory" and "Reliable workflows and coordination". Before adding an Inference Engineering lesson, check the `production-ai` module "Operations and performance". Give each topic one canonical home and cross-link from the other, so no topic is taught twice.
- **Out of scope:** ML research, classical data science, computer vision and diffusion, and classic MLOps.

## Page layout (whole site)

Every page follows one layout, decided on 30 October 2026 after the casebook trial: a wide page with an Inter body, like a course site. Keep new pages and areas on it. Do not add per-area widths or fonts.

- **Shell.** The header, `<main id="main">` and footer cap at 90rem (`max-w-[90rem]` in `site/src/app/layout.tsx`) and centre, so the gutters grow on wider screens.
- **Fonts.**
  - Body text is Inter everywhere. The body rule in `site/src/app/globals.css` and `--font-body` in `site/src/components/landing/tokens.css` both name `var(--font-inter)`.
  - Never use `var(--font-sans)` for this: Tailwind inlines it, so it is empty at runtime and the text falls back to the system font.
  - Headings and labels keep the condensed display face (Bricolage Grotesque, `--font-display`).
  - No serif body text.
- **Reading column.**
  - Lessons (Learn and Interview), case pages, worksheets and the Last-Day guides read in a column up to 60rem wide, centred beside any sidebar.
  - The classes are `.lesson-reading` and the lesson page's content column, `.case-main`, and `.editorial-page .reading`.
  - Reading text is 16px on a 24px line.
- **Line length.** Paragraphs, lists and blockquotes inside `.reading` or `.prose` cap at 75ch, about 75 characters per line. Tables, code blocks and diagrams use the full column.
- **New pages.** Reuse these classes instead of setting a new `max-width` or `font-family`. Check the page at 1440px and 390px: there must be no horizontal scroll on a phone.

## Case pages on the site (casebook)

The scenario-pack cases (`/design/<slug>`, module 15) share one layout and one set of editorial rules, first built on the Enterprise Knowledge Assistant. Keep every new or edited case to them.

- **Where an edit goes.** Prose and content fixes go in the root markdown, which the repo and the site share. Changes the site needs and the repo does not (the Databricks cut, case codes, symbols, introduction pages) live in `site/case-pages/` and `site/scripts/case-site-edits.mjs`, which run at sync time. Never hand-edit `site/content/`.
- **Prose.** Case text follows the `no-ai-slop` rules: em dashes at most twice per file, no banned words (leverage, utilize, robust, crucial…), no "not just X but Y", colon reveals, metadiscourse or recap endings. Keep bullets, bold row labels and the "Interview Pointer" callouts: they are the cram format.
- **Editing a case's source.** Keep heading text, fenced blocks (diagrams are cached by content), table shape, numbers and citation tokens unchanged, and never move text between `_Part_N` files. Leave lines that a `replace` rule targets alone, or update the rule: sync fails when a rule matches nothing (`assertReplaceRulesUsed`), because the line it rescued would otherwise be cut silently.
- **Introduction page.** Each case has `site/case-pages/<slug>/introduction.md`. Sync adds it as the first tab (`intro`) for scenario packs and standalone designs alike, and a case with one gets the chapters layout (`hasChapters` in `src/lib/scenario.ts`). Every casebook case has one since 2 November 2026, so a new case needs one too. Follow `site/case-pages/enterprise-knowledge-assistant/introduction.md`. Headings, in order:
  - `# <Case title>: Introduction`
  - `## Overview`: two or three short paragraphs covering the problem, the hard constraint and the design.
  - `## The core idea`: one sentence and one small `mermaid` `flowchart LR` of the request path.
  - `## Who it is for`
  - `## Objectives`: "After this case you can:" and two bullets.
  - `## What it assumes`
  - `## How to use it`: numbered steps.
  - `## The sections`: a table with the columns Section, What it is for and Interview prep.
  - `## Practise it`: only when the case has a twin worksheet (`RELATED_CASE` in `editorial.ts`); link it at `/practice/<worksheet-slug>`. A worksheet-set case says its own worksheet copy is read-only and the interactive worksheet saves answers.
  - Link each section by its tab id (`#main`, `#deep-dive`, `#cheat-sheet`, `#full-pack`) and give its part count. Never hardcode reading minutes.
- **Mandatory and optional.** Interview Guide, Technical Deep Dive and Quick Review are mandatory for interview preparation. Full Design (`full-pack`) is optional reference material, and so are the recruiting case's Reference Design (`full-design`) and the travel agent's 12-Part Framework (`framework-overview`), listed in `OPTIONAL_TABS` in `scenario.ts`. Everything else is mandatory, including the worksheet sets' answer keys and the Answer Template. Worksheet-set cases read Tutorial, Practice Worksheet, then Model Answer (`worksheetSet()` in `site/scripts/case-studies.mjs`).
- **Look.** Choose Your Path, Learn, the casebook, practice and the interview area all use the landing page's Editorial theme (Hallmark). The `start`, `learn`, `design`, `practice` and `interview` layouts in `src/app/(site)/` render `components/editorial/EditorialScope.tsx` (the fonts in `src/lib/editorial-fonts.ts`, the tokens in `components/landing/tokens.css`); `components/editorial/editorial.css` re-points the site's tokens under `.editorial-page` and holds the `cb-*` classes. Index pages list pages with `ContentsGroup` (contents rows) under an `EditorialSection` (heavy rule, condensed head); page heads use `PageHead` (green tag, condensed title, ruled spec line). Learn and /interview share the module and lesson pages; their heads are `PageHead` (the lesson's tag names the area, Learn or Interview). Keep new UI in these areas on those pieces: square corners, condensed heads, no middle-dot meta, no arrows glued to labels (keep a tested accessible name as an `aria-label`).
- **Chapters layout** (`src/components/CaseStudyView.tsx`):
  - **Sidebar:** a left sidebar lists Introduction, then each document with its parts (`<tab>-part-<n>`, from the ENH-25 split) nested under it.
    - An optional document's parts stay folded until it is open.
    - The open page's `## ` sections show under its entry, in place of a separate "On this page" column.
    - Minutes show per document and per part.
    - On a phone the sidebar is a sticky "Contents" menu.
  - **Reading a part:** one part shows at a time.
    - The purpose line appears on a document's first part only, and there is no all-caps document title.
    - Each part has previous and next buttons, and the left and right arrow keys do the same.
    - A part is marked read when the reader scrolls to its end; the button undoes it.
  - **Introduction:** it offers to resume the last part opened (`fd:v1:last:<case>`).
  - **Quick Review:** it has a "Print or save as PDF" button.
  - **Tables:** left-aligned, with a sticky first column on phones (`.case-chapters` in `globals.css`).
  - **Header:** it drops "Before you start", because the Introduction covers it. The Introduction never counts towards progress or reading time.
  - Part and tab ids stay in the hash and in saved progress, so never rename them.
- **Editorial rules, enforced at sync** by `case-site-edits.mjs`. Sync fails, quoting the text, if one is broken:
  - **No Databricks or its products** (Unity Catalog, Genie, Lakebase, Lakeview, Agent Bricks, Delta Sync, Unity Gateway).
    - A `## ` section whose heading names one is dropped, and so is a line that names one.
    - A mention inside a sentence the case still needs gets a `replace` rule in `CASE_SITE_EDITS` with vendor-neutral wording, for example "a managed text-to-SQL service".
  - **No case codes** (`G01` to `G20`) in page text. A code becomes the case's name, for example "section 6 of the Enterprise Knowledge Assistant case". On its own page it becomes "this case".
  - **No `§`, emoji, or tick and cross marks.** Arrows, box drawing and diagram shapes stay.
    - "[source case, §1]" becomes "[Full Design, section 1]", and "§§5–8" becomes "sections 5–8".
    - Source-library citations ("§15 scenarios") drop the sign.
    - "🎯 **Interview Pointer:**" becomes "**Interview pointer:**".
    - ✅ 🟡 ❌ in coverage tables become Built, Partial and Not built.
    - A ✓ or ✗ in a diagram becomes words through a `replace` rule.
  - **No "own construction" markers.** The repo's provenance tags stay in the source. On the site, `siteProvenance()` drops the tag, the sentence that explains it, and the provenance row of a sources table. A tag with an assumption caveat keeps the caveat. A sentence the cut would leave broken gets a `replace` rule.
  - **Renumbering:** when a cut drops a section, that document's `## N.` sections are renumbered across its parts, and its "Section N" references follow.
- **Adding or editing a case:**
  1. Write its `introduction.md`.
  2. Run `npm run sync` and fix each error with a `replace` rule, never by editing the root source.
  3. Run `npm run check:content`.
  4. Run the case e2e tests in `e2e/flows.spec.ts`.

## Adding a module, track or scenario

Adding content to the site touches several files. Work through every step; `npm run check:content` (from `site/`) fails if one is missed.

1. **Source.** Add the markdown under the right root dir. Worksheets: `NN_snake_name.md`, answer key `NN_snake_name_answer_key.md`, sections `## N. Title`, no frontmatter. Fillable regions are inferred from emptiness (empty table cell, bare `-`, `Label:` with nothing after).
2. **Sync script.** Wire the source in `site/scripts/`: add to the `MODULES` array in `sync-content.mjs` (worksheet tracks) or add a sync function (like `case-studies.mjs`, `company-prep.mjs`) and call it from `main()` in `sync-content.mjs`. If the source dir may be absent in some clones, guard it (see `sourcesPresent()`), or sync breaks.
3. **`site/src/lib/registry.ts`.** Add a `MODULES` entry with `status: 'live'` (plus `kind: 'reading'` for tabbed reading modules). Only `live` modules get static params.
4. **`site/src/lib/editorial.ts`** (no runtime imports allowed: the `.mjs` scripts import it):
   - `TRACKS[id]`: sync throws without it.
   - `FAMILY_META[id]` with every `REQUIRED_META_FIELDS` field filled.
   - New tab ids in `TABS` with matching labels; a `NAV` entry and `ContentMode` if needed.
   - Cite every new page in some `REVIEWS[].learnFirst/goDeeper`, or add an explicit exemption in `check-parse.ts`.
5. **`site/scripts/check-parse.ts`.** Worksheet tracks need an `EXPECTATIONS[trackId]` entry, otherwise the check fails.
6. **`site/src/lib/glossary.ts`.** Any all-caps token used on 3+ pages goes in `GLOSSARY` or `NOT_ACRONYMS`.
7. **Hardcoded ids in pages.** Check `src/app/(site)/page.tsx`, `src/app/(site)/modules/[module]/page.tsx`, `src/app/(site)/modules/[module]/[track]/[scenario]/page.tsx` (live routes sit in the `(site)` route group; `/demo` has its own root layout) for module-specific labels/branches that need the new module.
8. **Ids.** Track ids must be unique site-wide; never rename an existing track/tab/slug id (URLs and saved progress depend on them).

Then from `site/`: `npm run sync && npm run check:content && npm run lint`, and run `npm run dev` to eyeball the new pages.

Never hand-edit `site/content/` or `site/public/fde-last-day-prep/`; they are regenerated by sync.

If the content is company-specific, references the purchased library in `09_Study_Plans/`, or derives from third-party material, stop and confirm with the user before wiring it in: synced output is committed and deployed publicly.

## Interview and Company Prep areas

- The interview practice track (`interview-practice`: worksheets, mock interviews, final week) is not listed under `/learn`. Its pages live at `/interview/<module>/<lesson>`; `site/src/lib/curriculum-href.ts` (`AREA_TRACKS`) decides the URL and `next.config.ts` 308s the old `/learn/interview-practice/*` URLs. Track id and progress keys are unchanged.
- Company Prep lives at `/company-prep`, currently an empty "coming soon" page. It is left out of the nav, the homepage and the sitemap until it has packs; the route stays so old module 16 URLs keep redirecting to it.

## Blitzy / module 16

- Module 16 (Blitzy) is unpublished: `COMPANY_PREP_PUBLISHED = false` in `site/scripts/sync-content.mjs` and `status: 'planned'` in `site/src/lib/registry.ts`. `/modules/16-company-oriented-prep/*` 307s to `/company-prep`.
- `08_Company_Specific_Prep/Blitzy/` stays committed as the canonical source. To republish, flip both switches back, run `npm run sync`, and list the packs on `/company-prep`.
- `company-prep.mjs` reads `08_Company_Specific_Prep/Blitzy/` when available. With publishing on, clones without it keep the committed company-prep snapshot so Vercel builds still succeed.
- `08_Company_Specific_Prep/Blitzy/01_Code_Review_Bug_Drills.md` is the source of truth; the `.ipynb` is a derived practice copy. Sync reads only the `.md`.

## Planning workflow

- When asked to plan something, write the plan to `.plan/implementation_plan_<slug>.md` (`<slug>` is short kebab-case, e.g. `implementation_plan_search-page.md`). Create `.plan/` if missing. It is gitignored: plans and task cards stay local.
- Exception: a plan for the website (`site/`) goes to `.website_spec/status/todo/implementation_plan_<slug>.md` (moved to `in-progress/` when work starts, `done/` when its last task merges; list it on the status page), with its cards in `.website_spec/tasks/<slug>/`. Production-plan phases keep using `.website_spec/tasks/` and its board.
- The plan file holds ordered, step-by-step implementation steps only. No task cards, task IDs or task tables in it.
- When work on the plan starts, run the `site-plan-to-tasks` skill on that plan file first. Its cards go to `.plan/tasks/` (next to the plan), or `.website_spec/tasks/<slug>/` for a website plan. Its `check_plan.py` expects task tables, so for a step-only plan skip the script and review the steps by judgment.
- Then build each task on its own branch, cut from an up-to-date `main` and named with the task ID (see Git and deploy). One task per branch.

## Git and deploy

- The active Vercel project is `forward-deployed`; production is https://forwarddeployedprep.com/ (`www.forwarddeployedprep.com`, https://fdeprep.vercel.app/ and https://forward-deployed-sigma.vercel.app/ redirect to it). The former `site` project and `site-sourav-dbx.vercel.app` deployment were deleted.
- Vercel deploys `main` to production on push; other branches get preview URLs. Never push to `main` directly: work on a branch, open a PR, merge.
- Commit messages use conventional prefixes: `feat:`, `content:`, `fix:`, `chore:`.
- Branch per task. Whenever the user asks to fix something, work on a plan, or work on a specific task, first create a new branch from an up-to-date `main` and do all of that work there. One task per branch: do not mix unrelated changes, and do not reuse a branch from an earlier task. If you are already on a branch created for this same task, keep using it.
- Branch names are `<type>/<short-kebab-description>`. The type matches the kind of change and the commit prefix it will use:
  - `feat/`: new site feature or behaviour (`feat/search-page`)
  - `fix/`: bug fix (`fix/mobile-nav-overflow`)
  - `content/`: prep material or synced content (`content/restore-mock-interviews`)
  - `docs/`: README, CLAUDE.md, specs, plans (`docs/site-implementation-plan`)
  - `refactor/`: restructuring with no behaviour change (`refactor/registry-types`)
  - `chore/`: tooling, dependencies, config, skills (`chore/plan-to-tasks-skill`)
- For a task from a plan or task board, put its task ID in the branch name: `feat/FE-04-search-index`. The type still follows the kind of change.
- Uncommitted changes from other work stay out of the task's commits: stage only the task's files.
- Style guide for content: `.website_spec/reference/2026-09-27-content-architecture-and-editorial-style.md` (local only; see Website docs).
