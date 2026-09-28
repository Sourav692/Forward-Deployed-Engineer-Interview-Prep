# Forward-Deployed Engineer Interview Prep

A private, self-contained course for preparing engineers to scope, design, deliver,
and defend production AI systems in Forward-Deployed Engineer interviews.

This repository is intentionally separate from the hands-on AI Engineering course.
It teaches the judgment layer: customer discovery, problem decomposition, system
design, delivery planning, production trade-offs, leadership, and interview execution.

## What is included

| Area | Purpose |
|---|---|
| `Handbook/` | Ordered FDE curriculum from AI-system foundations through delivery and storytelling |
| `FDE/` | System-design scenarios, behavioral preparation, mock interviews, and role guidance |
| `FDE/Complete GEN AI FDE Interview System — Core + GenAI/11_HANDS_ON_LABS/` | Curated FDE interview labs and production-architecture references |
| `Case_Study_Groups/` | Three-layer case-study packs: main guide, deep dive, cheat sheet, and sourced full pack |
| `Last_Day_Prep/` | Eighteen rapid-review modules and the final interview execution framework |
| `Study_Guides/` | Recall-oriented technical and production study guides |
| `Question_Banks/` | Vendor-neutral FDE problem-decomposition practice |
| `Supplementary_Guides/` | Production judgment, platform examples, and delivery-framework theory |
| `site/` | The deployable interactive course experience |

## Scope boundary

This repository contains theory, functional architecture, worksheets, answer keys,
case studies, the dedicated FDE interview-labs module, and the delivery website.
Outside that explicitly included labs module, it does not duplicate notebooks,
application source trees, or project implementations from the AI Engineering course.

Hands-on implementations remain in the companion AI Engineering course and are
referenced at an immutable source revision in [`COMPANION_COURSE.md`](COMPANION_COURSE.md).

## Run the course site

```bash
cd site
npm install
npm run check:content
npm run dev
```

The site syncs its source material from `FDE/`, `Case_Study_Groups/`, and
`Last_Day_Prep/`. Generated content under `site/content/` is committed because the
Vercel project is rooted at `site/`.

## Versioning

The course follows semantic versioning. While extraction and curriculum cleanup are
in progress, releases start at `v0.x`. A `v1.0.0` release means the module sequence,
assessment model, and delivery site are ready for paid learners.

## Privacy

This is a private course repository. Raw client stories, unredacted source material,
local credentials, and ignored purchased binaries are not committed automatically.
Private visibility does not replace deliberate data minimization.
