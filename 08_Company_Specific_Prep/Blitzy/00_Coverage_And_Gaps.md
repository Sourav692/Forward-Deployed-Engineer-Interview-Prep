# Blitzy FDE Prep — Repo Coverage vs. Gaps

Legend: ✅ Strong · 🟡 Partial · ❌ Gap

## Round 1 — Technical (Code Review)

| # | Interview topic | Coverage | Where it lives in the repo | Gap to close |
|---|---|---|---|---|
| 1 | Code review: spot the bug, fix it, test it | ❌ | None. Hits for "code review" are only about CI gates in G07 | Practice reading short Python/JS functions and finding bugs: off-by-one, mutable defaults, None handling, race conditions, resource leaks, N+1 queries. Use one script: bug → root cause → fix → unit test plus edge cases |
| 2 | Production debugging (intermittent failure triage) | 🟡 | `FDE/Complete GEN AI.../05_PRODUCTION_DEBUGGING.../04_PRODUCTION_INCIDENT_LOGS`, `Case_Study_Groups/G14_Observability_And_Production_Diagnosis`, `Last_Day_Prep/module-12`, `module-15` | Content is LLM-specific (stale index, prompt injection). Missing: a generic triage order for intermittent failures (scope → recent change → one host or all → dependency → resources), plus timeouts, connection pools and DNS |
| 3 | Keeping the customer informed during an incident | ❌ | Nothing beyond a single passing mention | Prepare an incident-comms cadence: first ack within 15 min, regular status updates, ETA honesty, a single owner, RCA within 48 h |
| 4 | System design: integrate a new service into an existing stack | 🟡 | `Handbook/02` (12-part framework), `Handbook/06/05_Structured_Data_Routers_Connectors`, `Handbook/08/06_Infra_And_CICD` | Material is greenfield AI design. Missing: a brownfield playbook covering API contracts and versioning, auth/SSO, network/VPC, data access via read replica or CDC, strangler pattern, contract tests, shadow traffic, staged validation |
| 5 | Autonomy vs. control trade-off | ✅ | `Last_Day_Prep/module-08`, `Handbook/03/05_The_Eight_Guard_Checks`, `Handbook/05/05_Approvals_Spend_Caps`, FDE 20-Scenarios ch-11 (tool agent safety), `G03`, `Supplementary_Guides/.../05-guarding-tool-calls.md` | Not framed for **autonomous code generation**. Prepare the Blitzy angle: agent writes code → PR → human review gate, test-coverage thresholds, blast radius per repo, risk-tiered autonomy |
| 6 | Scaling: traffic spikes and graceful degradation | ✅ | `Last_Day_Prep/module-09` (load shedding, backpressure), `Study_Guides/12_production_and_operations` (circuit breakers, degradation), `G10`, `G18`, `G20` | Minor: rehearse a 2-minute non-LLM answer covering autoscaling, queues, rate limits, cache, a degraded mode and priority tiers |
| 7 | Testing strategy (unit, integration, regression) | 🟡 | Scattered across the 20 Scenarios V2 chapters; `Last_Day_Prep/module-13` (AI eval) | Mostly AI eval. Missing: a classic test pyramid, plus how to test AI-generated code |

## Round 2 — Enterprise Readiness and Platform Demo

| # | Interview topic | Coverage | Where it lives in the repo | Gap to close |
|---|---|---|---|---|
| 8 | Enterprise SDLC end to end (requirements → deploy → support) | 🟡 | `Handbook/10/02_End_To_End_AI_Delivery_Six_Stages`, `Last_Day_Prep/module-14` (release/change mgmt), `FDE/System_Design and Delivery/9. Proj Delivery` | No "SDLC" framing. Missing: environments (dev→QA→UAT→prod), change advisory boards, release trains, SOX/change control, hypercare and support handoff (L1/L2/L3) |
| 9 | Cross-functional work (Product, Eng, QA, DevOps, Security) | 🟡 | `Handbook/10/05_Cross_Team_Collaboration`, `FDE/System_Design and Delivery/10. Cross Team Collaboration` | Add a RACI per function and the friction points with each: security review, QA sign-off, DevOps change windows |
| 10 | Agile/Scrum operation | ❌ | Only passing mentions of "sprint" | Prepare ceremonies, how an FDE fits customer sprints, backlog grooming with the customer PO, and handling mid-sprint escalations |
| 11 | Managing releases and production issues | ✅ | `Last_Day_Prep/module-14`, `Handbook/08/01_Prompt_Versioning_Rollout_Rollback`, canary/feature-flag content (100+ files) | Add one personal STAR story about a release that went wrong |
| 12 | CTO trust / trusted advisor | 🟡 | `FDE/Behavioral_and_Leadership/hiring_manager_round/02_stakeholder_influence`, `04_pushback_and_saying_no`, `story_bank.md` | No CTO or executive-presence content. Prepare 2–3 stories about influencing a technical decision, disagreeing with a senior leader and earning credibility fast. Practise talking in risk, cost and time-to-value |
| 13 | Exec vision → engineering roadmap | 🟡 | `Case_Study_Groups/Standalone/60_Prioritize_AI_Use_Cases`, `61_Scale_Prototype_To_Production`, `Handbook/10/03_Scoping_To_Production_In_Two_Weeks`, `Question_Banks/` (decomposition) | Missing: a vision → outcomes → epics → milestones → 30/60/90 template, prioritisation frameworks (RICE, WSJF, MoSCoW), and dependency/risk mapping |
| 14 | Platform demo (Blitzy) | ❌ | Nothing | Learn the Blitzy product: autonomous batch code generation, codebase ingestion/knowledge graph, technical spec → code, legacy modernisation, PR-based output. Prepare a 5-minute demo narrative: problem → spec → generated code → validation → human review |
| 15 | Blitzy domain: AI for large codebases / legacy modernisation | 🟡 | `Case_Study_Groups/G09_Enterprise_Coding_Assistant`, `Handbook/09/03_Coding_Assistant`, `FDE/System_Design and Delivery/7. AI Powered Coding Assistant` | Coding-assistant designs are copilot-style (interactive). Missing: batch/autonomous codegen, repo-scale context (code graph, dependency analysis), validating generated code (compile, test, static analysis) and migration patterns (COBOL/Java → modern) |

## Prep Files Built

| Priority | File | Gaps closed |
|---|---|---|
| P0 | `01_Code_Review_Bug_Drills.ipynb` | #1 |
| P0 | `02_Blitzy_Product_And_Demo_Brief.md`, `03_Questions_To_Ask_Interviewer.md` | #5 (Blitzy angle), #14, #15 |
| P1 | `04_Incident_Triage_And_Customer_Comms.md` | #2, #3 |
| P1 | `05_CTO_Trust_And_Vision_To_Roadmap.md` | #12, #13 |
| P2 | `06_Brownfield_Integration_And_Testing.md` | #4, #7 |
| P2 | `07_Enterprise_SDLC_Agile_CrossFunctional.md` | #8, #9, #10, #11 (story template) |
| P2 | `08_Scaling_Spikes_And_Graceful_Degradation.md` | #6 |

## Priority Order for Filling Gaps

| Priority | Gap | Why |
|---|---|---|
| P0 | #1 Code-review bug drills | Guaranteed opening exercise and nothing in the repo covers it |
| P0 | #14 / #15 Blitzy product and autonomous codegen | The demo and the trade-off questions both depend on it |
| P1 | #3 Incident customer comms and #2 generic triage | Asked explicitly in Round 1 |
| P1 | #12 CTO stories and #13 vision → roadmap template | These are the core of Round 2 |
| P2 | #4 Brownfield integration, #8 / #10 SDLC and Agile | Partly covered; needs reframing |
