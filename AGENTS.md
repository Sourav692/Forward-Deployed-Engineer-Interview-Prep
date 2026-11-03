# Repository instructions for Codex

## Working style

- Use the Caveman skill for the entire session when it is available. Otherwise use its fallback: answer first, no ceremony, one idea per sentence, and preserve paths, code, and errors verbatim.
- Read targeted ranges only. Search before reading. Do not dump generated content, especially `site/content/` or manifests, into context.
- Keep normal prose in repository files. Caveman applies to chat, not content, commits, or documentation.

## Repository layout

- Root directories `00_` through `10_` and `99_Reference_Library/` contain prep material. Put new material in the directory matching its kind.
- `site/` is the only JavaScript project. It uses Next.js 16, React 19, Tailwind v4, and npm. Run npm commands from `site/` only.
- Skills: Claude Code gets the Sourav692 skills from the `sourav-skills` plugin, so this repo has no `.claude/skills/`. Codex skills are npx installs in `.agents/skills/` (tracked in `skills-lock.json`). Update them with `.agents/update-skills.sh`, never `npx skills update`: it re-adds `.claude/skills` symlinks. Add one with `npx skills@latest add <owner/repo> -s <name> -a codex -y`.
- Before changing Next.js code, read the relevant local Next documentation in `site/node_modules/next/dist/docs/`. Also follow [site/AGENTS.md](site/AGENTS.md).
- The platform brief is `00_Start_Here/Platform_Blueprint.html`; its local source prompt is `.website_spec/reference/website_prompt.md`.
- Website design docs, specs, audits, plans, task boards and QA reports live in `.website_spec/` (gitignored, owner's clone only). Put new ones there, never in `site/` or another committed folder. The production plan is `.website_spec/status/in-progress/2026-10-05-production-implementation-plan.md`; its board is `.website_spec/tasks/README.md`. Plans sit in `.website_spec/status/<state>/` (index `.website_spec/status/README.md`); reference docs in `.website_spec/reference/`.

## Site structure

- The site is organised on two axes: Learn by topic and Interview by round. Interview rounds are `INTERVIEW_ROUNDS` in `site/src/lib/curriculum.ts`, shown as cards on `/interview` with a page per live round at `/interview/rounds/<round>`; every interview page belongs to one round. See "Site structure (groups)" in [CLAUDE.md](CLAUDE.md) and the plan `.website_spec/status/on-hold/implementation_plan_site-groups-and-structure.md`.
- Learn has eight topic groups in `LEARN_STAGES` (`site/src/lib/learn-stages.ts`): Start here, AI Engineering, Harness Engineering, Inference Engineering, AI System Design, Forward Deployed Engineering, Coding, Career. Groups are navigation only and every Learn track sits in exactly one group. `/learn` shows them as cards; a live group opens `/learn/topics/<group>`, and a group with no tracks is an unlinked Coming soon card with its planned topics.
- Page layout for every page: a 90rem shell, an Inter body (name `var(--font-inter)`, never the empty `var(--font-sans)`), condensed display headings, a reading column up to 60rem, and paragraphs capped at 75ch. See "Page layout (whole site)" in [CLAUDE.md](CLAUDE.md); reuse its classes instead of new widths or fonts.

## Content and publishing safety

- `site/content/` and `site/public/fde-last-day-prep/` are generated but committed deployment snapshots. Never edit them directly. Edit their root source, then run `npm run sync` from `site/`.
- Sync rewrites `site/content/manifest.json` and its `generatedAt` value. That change alone is expected generated noise.
- The Staff AI System Design course (Learn track T17, `staff-ai-system-design`, in the AI System Design group) is edited in `10_AI_System_Design/`: stage guides `stages/NN-<stage>/guide.md`, their `guide.html`, Python labs and ADRs. Its own tooling, index and stage ZIPs stay offline; the site does not use them. From `site/`, `npm run import:sd-course` (`scripts/sd-course-import.mjs`) splits each guide's five `## N.` parts into lessons in `01_Concept_Tutorials/AI_System_Design_Course/` (a part over 2,500 words splits again before its first Interview heading, as Stage 12's does), cuts each `guide.html`'s interactive blocks into `site/public/labs/system-design/`, and adds a "Run the code lab" section (Python only: GitHub links to `labs/*.py` and the repo-root `test_*.py -v` command; no ZIPs, Codespaces or JavaScript). Never edit those generated copies. The track, modules and lessons are `site/src/lib/sd-course.ts`; its titles must match the import's `source.json`. To refresh: commit the course change, run `npm run import:sd-course`, `npm run sync` and `npm run check:content`, and commit the lessons, labs and diagrams in one PR. The import fails on uncommitted course changes, a broken link or anchor, a placeholder or a page over the limit, and a second run gives no diff. `check:content` allows GitHub links into `10_AI_System_Design/` only.
- Only these roots feed the site: Customer Discovery and System Design worksheets, `04_Behavioral_and_Leadership/`, Scenario Packs and Standalone Designs under `02_System_Design_Case_Studies/`, `07_Last_Day_Revision/`, and `08_Company_Specific_Prep/Blitzy/`.
- If one of those source paths changes, update the corresponding `site/scripts/*.mjs` path in the same change.
- Do not publish or wire in `09_Study_Plans/`, `99_Reference_Library/`, or content that references its purchased library index. Remove references to `LIBRARY_MAP.md`, `ROADMAP_7_DAY.md`, and the condensed-plan spreadsheet before public use.
- Keep `site/src/lib/editorial.ts` and `site/src/lib/glossary.ts` free of runtime imports because sync scripts import them.
- Preserve track, tab, and scenario IDs. They back URLs and `fd:v1:*` localStorage keys. Labels may change.
- For new modules, tracks, or scenarios, follow "Adding a module, track or scenario" in `CLAUDE.md`.

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

- Vercel project: `forward-deployed`. Production: `https://forwarddeployedprep.com/`.
- Never push directly to `main`. Use a new branch per task, open a PR, then merge.
- Start a task on an up-to-date `main`. If already on the branch for the same task, keep using it.
- Branch names use `<type>/<short-kebab-description>`; include the task ID for task-board work, such as `feat/FE-04-search-index`.
- Use `feat:`, `content:`, `fix:`, `docs:`, `refactor:`, or `chore:` conventional commit prefixes.
- Keep unrelated existing changes out of task commits. Stage only files belonging to the task.
- Follow `.website_spec/reference/2026-09-27-content-architecture-and-editorial-style.md` for content writing.
