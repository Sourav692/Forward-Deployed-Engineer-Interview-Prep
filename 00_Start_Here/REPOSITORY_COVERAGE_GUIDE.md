# FDE Interview Preparation Coverage Guide

This guide explains what each folder contributes to Forward-Deployed Engineer and Applied AI interview preparation. Folders are grouped by the kind of material they hold and numbered in study order. The plan for turning this material into a structured learning platform is in [`Platform_Blueprint.html`](Platform_Blueprint.html).

## How to use this repository

1. Start with [`01_Concept_Tutorials/FDE_Handbook/00_Orientation`](../01_Concept_Tutorials/FDE_Handbook/00_Orientation/) and work through the Handbook chapters. Use the topic guides in `01_Concept_Tutorials/` for depth on retrieval, agents, production and cost.
2. Study worked designs in `02_System_Design_Case_Studies/`, then practise the same scenarios with the worksheets and answer keys in `03_Practice_Worksheets_and_Keys/`.
3. Build behavioural stories with `04_Behavioral_and_Leadership/`, and learn how FDE delivery works with `05_FDE_Delivery_and_Scoping/`.
4. Rehearse the coding round with `06_Coding_Round_Prep/` and finish with `07_Last_Day_Revision/`. Add the relevant pack from `08_Company_Specific_Prep/` before a specific loop.

## Folders

| Folder | Primary interview capability | What it holds |
|---|---|---|
| `00_Start_Here/` | Orientation | This guide, the platform blueprint, the companion-course pointer, the case-study index |
| `01_Concept_Tutorials/` | Technical depth and judgement | FDE Handbook (12 chapters), GenAI engineering modules (11), RAG and agent topic guides, selected agentic system design book chapters, system design fundamentals, production and platform judgement, cost and latency optimisation |
| `02_System_Design_Case_Studies/` | Pattern recognition across realistic designs | 20 scenario packs (main guide, deep dive, cheat sheet, sourced full pack), standalone designs, long-form scenario tutorials (V1 and V2), classic design walkthroughs with whiteboard scripts |
| `03_Practice_Worksheets_and_Keys/` | Timed practice with model answers | 10 customer-discovery worksheets, 12 system-design worksheets, a vendor-neutral problem-decomposition question bank |
| `04_Behavioral_and_Leadership/` | Behavioural and hiring-manager rounds | Story bank, 14 leadership-principle worksheets, 5 hiring-manager-round worksheets, all with answer keys |
| `05_FDE_Delivery_and_Scoping/` | Delivery and scoping questions | Scoping guide, delivery framework with a 60-minute interview script, cross-team delivery, the senior FDE day to day |
| `06_Coding_Round_Prep/` | AI-assisted coding round | 7-day roadmap, agent-loop mock and ledger drill with tests, rubric, prompt playbook |
| `07_Last_Day_Revision/` | Rapid recall before the interview | 18 review modules with memory cards, the roadmap, a rapid revision guide, a trigger-to-concept cheat sheet |
| `08_Company_Specific_Prep/` | Company loops | Blitzy, OpenAI Applied, and OpenAI / Anthropic packs |
| `09_Study_Plans/` | Study planning (local only) | Rankings of an external purchased library; gitignored |
| `99_Reference_Library/` | Background reading | External PDFs, sketchnotes and references |

## What the site publishes

The course site syncs these folders: the customer-discovery and system-design worksheets, the behavioural worksheets and story bank, the scenario packs and standalone designs, the last-day revision material, and the Blitzy pack. Everything else is source material that the platform blueprint plans to bring onto the site.

## Coverage at a glance

| Interview area | Where to study | Where to practise |
|---|---|---|
| Problem decomposition and discovery | `07_Last_Day_Revision/` reviews 01–03; `05_FDE_Delivery_and_Scoping/Scoping_An_FDE_Project/` | `03_.../Customer_Discovery_Worksheets/`, `03_.../Problem_Decomposition_Bank/` |
| AI system design | `01_.../FDE_Handbook/02_System_Design_Fundamentals/`, `02_.../Classic_Design_Walkthroughs/` | `03_.../System_Design_Worksheets/`, `02_.../Scenario_Packs_G01_G20/` |
| RAG and retrieval | `01_.../RAG_and_Agent_Topic_Guides/`, `01_.../FDE_Handbook/04_Enterprise_RAG/` | Scenario packs G01, G06, G08 |
| Agents and multi-agent systems | `01_.../FDE_Handbook/03_Robust_Agents/`, `07_Multi_Agent_Systems/`, `01_.../Agentic_System_Design_Book/` | Scenario packs G03, G11, G15 |
| Production, security, cost | `01_.../Production_and_Platform_Judgment/`, `01_.../Cost_and_Latency_Optimization/`, Handbook chapters 06 and 08 | Scenario packs G07, G10, G13, G14 |
| Delivery and stakeholders | `05_FDE_Delivery_and_Scoping/`, Handbook chapter 10 | Standalone designs 60, 61, 62 |
| Behavioural | `01_.../FDE_Handbook/11_Telling_The_Story/` | `04_Behavioral_and_Leadership/` |
| Coding | `06_Coding_Round_Prep/` | Agent-loop mock, ledger drill, OpenAI / Anthropic worked solutions |

## Known gaps

Mock interviews with scorecards, production-incident drills and a final readiness assessment are not in the repository. They were removed on 4 October 2026 and are recoverable from git history. Engineering foundations (Python, SQL, distributed systems), ML fundamentals, and model adaptation and serving are thin or missing. See section 3 of the platform blueprint for the measured list.
