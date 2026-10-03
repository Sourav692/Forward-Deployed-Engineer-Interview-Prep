# Forward-Deployed Engineer Interview Prep

A private, self-contained course for preparing engineers to scope, design, deliver,
and defend production AI systems in Forward-Deployed Engineer interviews.

This repository is intentionally separate from the hands-on AI Engineering course.
It teaches the judgment layer: customer discovery, problem decomposition, system
design, delivery planning, production trade-offs, leadership, and interview execution.

## What is included

Folders are grouped by the kind of material they hold, numbered in study order.

| Folder | What it holds |
|---|---|
| `00_Start_Here/` | Repository coverage guide, companion-course pointer, case-study index |
| `01_Concept_Tutorials/` | Explanatory tutorials: the FDE Handbook, GenAI engineering modules, RAG and agent topic guides, the agentic system design book, system design fundamentals, production judgment, cost and latency |
| `02_System_Design_Case_Studies/` | Solved designs, one system per folder: G01–G20 scenario packs, standalone designs, long-form scenario tutorials, classic design walkthroughs |
| `03_Practice_Worksheets_and_Keys/` | Fill-in worksheets with answer keys: customer discovery, system design, problem decomposition |
| `04_Behavioral_and_Leadership/` | Hiring-manager and leadership-principle worksheets, answer keys, story bank |
| `05_FDE_Delivery_and_Scoping/` | How the job runs: scoping a project, delivery framework, cross-team delivery, day-to-day |
| `06_Coding_Round_Prep/` | Coding-round drills (local only, gitignored) |
| `07_Last_Day_Revision/` | Eighteen rapid-review modules, memory cards and the final interview execution framework |
| `08_Company_Specific_Prep/` | Company loops: OpenAI Applied (committed); Blitzy and OpenAI/Anthropic packs (local only) |
| `09_Study_Plans/` | Study-plan spreadsheets and coverage maps (local only, gitignored) |
| `99_Reference_Library/` | Third-party PDFs, sketchnotes and external references |
| `site/` | The deployable interactive course experience |

## Scope boundary

This repository contains theory, functional architecture, worksheets, answer keys,
case studies, and the delivery website. It does not duplicate notebooks,
application source trees, or project implementations from the AI Engineering course.

Hands-on implementations remain in the companion AI Engineering course and are
referenced at an immutable source revision in [`COMPANION_COURSE.md`](00_Start_Here/COMPANION_COURSE.md).

## Run the course site

```bash
cd site
npm install
npm run check:content
npm run dev
```

The site syncs its source material from `02_System_Design_Case_Studies/`,
`03_Practice_Worksheets_and_Keys/`, `04_Behavioral_and_Leadership/`,
`07_Last_Day_Revision/` and, when present locally, `08_Company_Specific_Prep/Blitzy/`. Generated content under `site/content/` is committed because the
Vercel project is rooted at `site/`.

## Versioning

The course follows semantic versioning. While extraction and curriculum cleanup are
in progress, releases start at `v0.x`. A `v1.0.0` release means the module sequence,
assessment model, and delivery site are ready for paid learners.

## Privacy

This is a private course repository. Raw client stories, unredacted source material,
local credentials, and ignored purchased binaries are not committed automatically.
Private visibility does not replace deliberate data minimization.
