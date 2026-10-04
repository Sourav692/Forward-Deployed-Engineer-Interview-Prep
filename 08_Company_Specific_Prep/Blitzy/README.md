# Blitzy Prep: Suggested Reading Order

Total ≈ 6–7 hours of focused prep. Follow the order: each file builds on the one before it.

## Phase 1: Know the product (≈ 1.5 h)

Everything else is framed around Blitzy, so start here.

| # | File | Time | Goal | Done when you can… |
|---|---|---|---|---|
| 1 | `02_Blitzy_Product_And_Demo_Brief.md` | 45 min | Know the platform lifecycle, terminology and security answers | Draw the 6-stage flow (Onboard → Tech Spec → Prompt → AAP → Generate → PR + guide) from memory |
| 2 | `03_Questions_To_Ask_Interviewer.md` | 30 min | Pick your questions for each round | Say your "top 5" questions naturally, each with one follow-up |
| 3 | `00_Coverage_And_Gaps.md` | 10 min | See what each round tests and where you're weakest | Name the 3 topics you're least confident in |

## Phase 2: Round 1, Technical (≈ 2.5 h)

| # | File | Time | Goal | Done when you can… |
|---|---|---|---|---|
| 4 | `01_Code_Review_Bug_Drills.ipynb` | 75 min | Bug spotting, fix and test | For each drill: spot the bug **before** running the buggy cell, say the 4-step script out loud, then run the fix and tests. Finish with Run All: the summary must say "ALL 12 DRILLS VERIFIED" |
| 5 | Same notebook, second pass | 15 min | Recall without looking | Rewrite 2 fixes from memory in a scratch cell |
| 6 | `04_Incident_Triage_And_Customer_Comms.md` | 40 min | Triage order + customer comms | Give the 90-second answer and recite the 7-step triage order |
| 7 | `06_Brownfield_Integration_And_Testing.md` | 40 min | Integrating into an existing stack + testing strategy | Whiteboard the bank loan-eligibility example in 5 minutes |
| 8 | `08_Scaling_Spikes_And_Graceful_Degradation.md` (depth: repo `Last_Day_Prep/module-09`) | 15 min | Traffic spikes + graceful degradation | Say the 2-minute answer and the 5-level degradation ladder from memory |
| 9 | Re-read `02` §6 (autonomy vs. control) | 10 min | The Blitzy trade-off question | State the one-line principle and argue 2 of the 6 scenarios |

## Phase 3: Round 2, Enterprise Readiness + Demo (≈ 2 h)

| # | File | Time | Goal | Done when you can… |
|---|---|---|---|---|
| 10 | `07_Enterprise_SDLC_Agile_CrossFunctional.md` | 40 min | SDLC gates, Scrum, cross-functional work | Walk the 9 SDLC stages and explain the "agentic SDLC moves the bottleneck to review" point |
| 11 | `05_CTO_Trust_And_Vision_To_Roadmap.md` | 45 min | CTO trust + vision → roadmap | Present the 5-phase modernization roadmap with exit criteria and signers |
| 12 | Repo: `FDE/Behavioral_and_Leadership/story_bank.md` | 30 min | Make your stories interview-ready | Tell 4 stories from the `05` §A5 map in 2 minutes each. **Fill in the PARTLY GROUNDED details first** |
| 13 | Re-read `02` §8 (demo narrative) | 10 min | 5-minute demo | Run the demo script out loud once, timed |

## Phase 4: Fill in your own material (≈ 30 min, don't skip)

| Item | Where |
|---|---|
| A release-that-went-wrong STAR story | `07` §6 template |
| Your POC success metrics for the demo | `02` §9 + `05` §B6 |
| The 2–3 questions you'll actually ask in each round | `03`: write them on a card |

## Final 30 minutes before each round

| Round 1 | Round 2 |
|---|---|
| `01` notebook: scan checklist cell | `05` §A3 executive language table |
| `04` §1 opening + §5 severity matrix | `05` §B1 vision → roadmap pipeline |
| `06` §1 opening + §3 integration patterns | `07` §1 opening + §7 agentic SDLC table |
| `08` 2-minute answer + pitfalls table | |
| `02` §6 one-line autonomy principle | `02` §8 demo beats + `03` top-5 questions |

## Optional depth (only if time allows)

| Topic | Repo source |
|---|---|
| Reliability patterns (retries, breakers, idempotency) | `Last_Day_Prep/module-12-reliability-and-failure-handling.md` |
| Release mechanics (shadow, canary, kill switch) | `Last_Day_Prep/module-14-release-and-change-management.md` |
| Incident drill with real telemetry | `FDE/Complete GEN AI FDE Interview System — Core + GenAI/05_.../04_PRODUCTION_INCIDENT_LOGS/03_latency_spike.md` |
| AI coding-assistant system design | `Case_Study_Groups/G09_Enterprise_Coding_Assistant/` |
| Use-case prioritization scoring | `Case_Study_Groups/Standalone/60_Prioritize_AI_Use_Cases/` |
| Stakeholder influence answer key | `FDE/Behavioral_and_Leadership/hiring_manager_round/answer_keys/02_stakeholder_influence_answer_key.md` |
