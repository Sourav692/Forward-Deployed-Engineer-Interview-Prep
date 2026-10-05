# Find Material by Interview Area

*A repository grouped by source is easy to maintain but hard to study from, so map each interview area to one place to study and one to practise.*

◷ 4 min

Folders are grouped by the kind of material they hold, not by where it came from. Use the coverage table below to go from an interview area to a study folder and a practice folder, after choosing a route in [Choose a Reading Path](/learn/orientation/how-the-platform-works/choose-a-reading-path).

**Objectives:**

- say what each numbered folder contributes to interview preparation;
- go from an interview area to the folders where you study and practise it;
- name the known gaps in the repository.

---

## Follow the Folders in Study Order

The repository folders are numbered in study order. Read concepts first. Then study worked designs. Then practise the same scenarios with worksheets and answer keys. After that come behavioural stories and delivery. The coding round and last-day revision close the sequence, with a company pack added before a specific loop.

| Folder | Interview capability | What it holds |
|---|---|---|
| `00_Start_Here/` | Orientation | The coverage guide, the platform blueprint, the companion-course pointer and the case-study index |
| `01_Concept_Tutorials/` | Technical depth and judgement | The FDE Handbook (12 chapters), GenAI engineering modules (11), RAG and agent topic guides, selected agentic system design chapters, system design fundamentals, production judgement, cost and latency |
| `02_System_Design_Case_Studies/` | Pattern recognition | 20 scenario packs, standalone designs, long-form scenario tutorials and classic design walkthroughs |
| `03_Practice_Worksheets_and_Keys/` | Timed practice with model answers | 10 customer-discovery worksheets, 12 system-design worksheets and a problem-decomposition question bank |
| `04_Behavioral_and_Leadership/` | Behavioural and hiring-manager rounds | A story bank, 14 leadership-principle worksheets and 5 hiring-manager worksheets, with answer keys |
| `05_FDE_Delivery_and_Scoping/` | Delivery and scoping | A scoping guide, a delivery framework with a 60-minute script, cross-team delivery and the senior FDE day to day |
| `06_Coding_Round_Prep/` | AI-assisted coding round | A 7-day roadmap, an agent-loop mock and ledger drill with tests, a rubric and a prompt playbook |
| `07_Last_Day_Revision/` | Rapid recall | 18 review modules with memory cards, a rapid revision guide and a trigger-to-concept cheat sheet |
| `08_Company_Specific_Prep/` | Company loops | Company packs |
| `99_Reference_Library/` | Background reading | External PDFs, sketchnotes and references |

## Go From an Area to a Folder

A worry about one round is easier to act on than a folder list. Read the table from the left: find the area, then study and practise in the two places it names.

| Interview area | Where to study | Where to practise |
|---|---|---|
| Problem decomposition and discovery | Last-day reviews 01 to 03; the scoping guide in `05_` | Customer-discovery worksheets; the problem-decomposition bank |
| AI system design | Handbook system design fundamentals; classic design walkthroughs | System-design worksheets; scenario packs |
| RAG and retrieval | RAG and agent topic guides; Handbook enterprise RAG | Scenario packs G01, G06 and G08 |
| Agents and multi-agent systems | Handbook robust agents and multi-agent systems; the agentic system design chapters | Scenario packs G03, G11 and G15 |
| Production, security and cost | Production and platform judgement; cost and latency; Handbook chapters 06 and 08 | Scenario packs G07, G10, G13 and G14 |
| Delivery and stakeholders | `05_FDE_Delivery_and_Scoping/`; Handbook chapter 10 | Standalone designs 60, 61 and 62 |
| Behavioural | Handbook "Telling the Story" | `04_Behavioral_and_Leadership/` |
| Coding | `06_Coding_Round_Prep/` | Agent-loop mock, ledger drill and worked solutions |

## Know the Gaps Before You Rely on the Map

The coverage guide is honest about what is missing. Mock interviews with scorecards, production-incident drills and a final readiness assessment are not in the repository. They were removed on 4 October 2026 and can be recovered from git history. Engineering foundations (Python, SQL and distributed systems), ML fundamentals, and model adaptation and serving are thin or missing.

> **Warning: a thin area needs outside practice.** The map cannot send you to material that does not exist. Where the guide lists a gap, plan practice from elsewhere rather than assuming the repository covers it.

## Worked Example: Preparing for a Production Round

A candidate expects a round on running an agent in production. They find "Production, security and cost" in the area table. They study the production judgement and cost material, plus Handbook chapters 06 and 08. Then they practise scenario packs G07, G10, G13 and G14 under time.

They also check the gaps. Production-incident drills are listed as missing, so they plan one incident walk-through of their own. The map gave them the study and practice folders in a minute, and the gap list told them what it could not give.

---

## Key Takeaways

- Folders are grouped by kind of material and numbered in study order: concepts, designs, practice, behavioural, delivery, coding, revision.
- Read the coverage table from the interview area to one study place and one practice place.
- Mock interviews, incident drills, a readiness assessment and several engineering foundations are thin or missing; plan for them.

## Check Yourself

1. **Where do you practise RAG and retrieval?**
   Scenario packs G01, G06 and G08.

2. **Which folder holds timed practice with model answers, and what is in it?**
   `03_Practice_Worksheets_and_Keys/`: 10 customer-discovery worksheets, 12 system-design worksheets and a problem-decomposition bank.

3. **Name two gaps the coverage guide records.**
   Any two of: mock interviews with scorecards, production-incident drills, a final readiness assessment, engineering foundations, ML fundamentals, and model adaptation and serving.

## References

**Sources:** `00_Start_Here/REPOSITORY_COVERAGE_GUIDE.md`: "How to use this repository", "Folders", "Coverage at a glance" and "Known gaps". The guide's "What the site publishes" section predates the Learn section and is not repeated here.
