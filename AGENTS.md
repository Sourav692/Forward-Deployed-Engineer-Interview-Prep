# Repository instructions for Codex

## Working style

- Use the Caveman skill for the entire session when it is available. Otherwise use its fallback: answer first, no ceremony, one idea per sentence, and preserve paths, code, and errors verbatim.
- Read targeted ranges only. Search before reading. Do not dump generated content, especially `site/content/` or manifests, into context.
- Keep normal prose in repository files. Caveman applies to chat, not content, commits, or documentation.

## Repository layout

- Root directories `00_` through `09_` and `99_Reference_Library/` contain prep material. Put new material in the directory matching its kind.
- `site/` is the only JavaScript project. It uses Next.js 16, React 19, Tailwind v4, and npm. Run npm commands from `site/` only.
- Before changing Next.js code, read the relevant local Next documentation in `site/node_modules/next/dist/docs/`. Also follow [site/AGENTS.md](site/AGENTS.md).
- The platform brief is `00_Start_Here/Platform_Blueprint.html`; its local source prompt is `.website_plan/website_prompt.md`.

## Content and publishing safety

- `site/content/` and `site/public/fde-last-day-prep/` are generated but committed deployment snapshots. Never edit them directly. Edit their root source, then run `npm run sync` from `site/`.
- Sync rewrites `site/content/manifest.json` and its `generatedAt` value. That change alone is expected generated noise.
- Only these roots feed the site: Customer Discovery and System Design worksheets, `04_Behavioral_and_Leadership/`, Scenario Packs and Standalone Designs under `02_System_Design_Case_Studies/`, `07_Last_Day_Revision/`, and `08_Company_Specific_Prep/Blitzy/`.
- If one of those source paths changes, update the corresponding `site/scripts/*.mjs` path in the same change.
- Do not publish or wire in `09_Study_Plans/`, `99_Reference_Library/`, or content that references its purchased library index. Remove references to `LIBRARY_MAP.md`, `ROADMAP_7_DAY.md`, and the condensed-plan spreadsheet before public use.
- Keep `site/src/lib/editorial.ts` and `site/src/lib/glossary.ts` free of runtime imports because sync scripts import them.
- Preserve track, tab, and scenario IDs. They back URLs and `fd:v1:*` localStorage keys. Labels may change.
- Run the `add-module` skill for new modules, tracks, or scenarios.

## Validation

Run from `site/`, in this order after content, sync, editorial, glossary, or site changes:

1. `npm run sync`
2. `npm run check:content`
3. `npm run lint`
4. `npx tsc --noEmit`
5. `npm run build`

`check:content` is the primary test suite. It validates worksheet structure, editorial metadata, links, glossary coverage, and placeholders.

## Blitzy content

- `08_Company_Specific_Prep/Blitzy/` is canonical. Its committed generated snapshot under `site/content/modules/16-company-oriented-prep/` is what deploys.
- If the root Blitzy source is absent, sync preserves the committed snapshot. Do not create a substitute source directory.
- Use `01_Code_Review_Bug_Drills.md`, not the derived notebook, as the source of truth for that guide.

## Git and deployment

- Vercel project: `forward-deployed`. Production: `https://forward-deployed-sigma.vercel.app/`.
- Never push directly to `main`. Use a new branch per task, open a PR, then merge.
- Start a task on an up-to-date `main`. If already on the branch for the same task, keep using it.
- Branch names use `<type>/<short-kebab-description>`; include the task ID for task-board work, such as `feat/FE-04-search-index`.
- Use `feat:`, `content:`, `fix:`, `docs:`, `refactor:`, or `chore:` conventional commit prefixes.
- Keep unrelated existing changes out of task commits. Stage only files belonging to the task.
- Follow `site/specs/2026-09-27-content-architecture-and-editorial-style.md` for content writing.
