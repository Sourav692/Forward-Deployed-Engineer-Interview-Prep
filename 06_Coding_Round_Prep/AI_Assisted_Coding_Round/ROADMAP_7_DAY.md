# 7-day roadmap: OpenAI Applied AI Engineer, AI-assisted coding round (agentic app building)

Assumptions: about 3.5 to 4 hours a day (Day 7 is about 2 hours). Your round date is not known; if it lands before Day 7, use the "If you run out of time" cut at the bottom. Each day ends with one measurable checkpoint. Do not skip the checkpoints.

Library doc numbers (#158 etc.) refer to the row numbers in your Gumroad audit. The problem IDs (092, 148...) are from the Google 150-problem bank (#854), and PC-xx are from the Palantir bank (#869).

## Principles for all 7 days
- Time-box every drill (35 to 45 minutes). Stop at the timer, then review.
- Attempt first, read the reference answer second.
- Use your AI assistant on most drills, but in narrow prompts and reading every diff. Do 1 in 3 drills with no AI so your fundamentals stay sharp.
- Narrate aloud every time. Record the two full mocks.
- After every drill, write one line in a log: what broke, what you would do differently.

## Day 1: Baseline and the agent loop
| Time | Activity | Material |
|---|---|---|
| 60 min | Cold run of the agentic mock, Gates 1 and 2 only, with your AI tool | `agentic/` + `MOCK_PROBLEM_AGENTIC.md` |
| 20 min | Score yourself on `RUBRIC.md`, note gaps, then read the reference solution for Gates 1 and 2 | `agentic/solution/agent.py` |
| 90 min | 3 drills: retry with backoff, validate JSON tool-call arguments, agent tool execution safety | #158 (L1 and L4/L5 problems), #160 for answers |
| 30 min | Read the lab agent code: `workflow.py`, `guardrails.py`, `tools.py` | Core + GenAI kit, `11_HANDS_ON_LABS/.../backend/agents` |

Checkpoint: Gates 1 and 2 pass in under 30 minutes combined, or you know exactly why not.

## Day 2: Guardrails, idempotency, state
| Time | Activity | Material |
|---|---|---|
| 45 min | PC-28 Idempotent Command Processor, extend it in stages (add TTL on keys, then concurrency) | #869 |
| 45 min | PC-27 Circuit Breaker State Machine | #869 |
| 45 min | Model fallback logic, then HITL approval | #158 |
| 45 min | Multi-step workflow state | #158 |
| 45 min | Redo agentic Gate 3 from scratch with NO AI | `agentic/` |

Checkpoint: you can explain, without notes, why a denial must not be cached and why only successful side effects are cached.

## Day 3: Production GenAI route and real SDK
| Time | Activity | Material |
|---|---|---|
| 40 min each (x4) | Problems 092 Tool-Call Argument Validator, 148 Agent Loop Detector, 150 Deterministic Model Fallback Router, 147 Malformed Model Output Repair. Take the prompts from the 150 bank. | #415 route, prompts in #854 |
| 30 min | 105 Agent Trace Reconstruction | #854 |
| 30 min | Build a tiny real tool-calling agent against the current OpenAI API docs (one tool, a loop, a stop condition). Read the docs first; do not rely on memory of the API shape. | OpenAI API docs |

Checkpoint: a working script with a real or mocked model that calls one tool and returns a final answer.

## Day 4: Full mock 1
| Time | Activity |
|---|---|
| 60 min | Full agentic mock, all 4 gates, timed, screen-recorded, narrating, AI allowed |
| 30 min | Self-score with `RUBRIC.md` (target 30 or more) |
| 60 min | Review the recording: find silent stretches, unread diffs, missing tests. Fix the three worst habits. |
| 45 min | Study the reference solution for what you missed |

Checkpoint: written list of your 3 weakest rubric rows.

## Day 5: Staged building and refactoring
| Time | Activity | Material |
|---|---|---|
| 60 min | Credit-ledger drill, all 4 gates | `ledger_drill/` + `LEDGER_PROBLEM.md` |
| 45 min | Refactor drill: ask your AI to write a messy, nested 100 to 120 line version of your ledger solution with passing tests. Refactor it and add a feature (for example, per-customer grant caps) keeping tests green. | your own solution |
| 40 min | PC-29 Dependency-Aware Parallel Waves | #869 |
| 40 min | PC-14 TTL Cache with Explicit Clock, PC-13 Retry with Backoff | #869 |

Checkpoint: ledger gates pass, and the refactor leaves every original test green.

## Day 6: Debugging, integration, mock 2
| Time | Activity | Material |
|---|---|---|
| 60 min | Debugging drills with reproduce-first: 133 Non-Terminating Poll Loop, 128 Duplicate Retry Enqueue, 141 Race-Prone Counter | #414 index, prompts in #854 |
| 40 min | Exercise 2 (idempotent sync) and Exercise 9 (permission-aware RAG filter) | #270 |
| 75 min | Mock 2: ask Claude for a second scenario with different tools (for example a research agent or RAG agent), run it timed, AI allowed | new scenario |
| 30 min | Rehearse the verbal questions aloud | `VERBAL_QA.md` |

Checkpoint: score 34 or more on mock 2, or repeat the weakest gate tomorrow.

## Day 7: Consolidate and rest (about 2 hours)
| Time | Activity |
|---|---|
| 45 min | Re-run agentic Gates 1 and 2 timed without looking at anything |
| 30 min | Skim the 12 failure modes (#254) and evaluation cases 7 to 9 (#666) |
| 20 min | Verbal Q&A out loud, once |
| 25 min | Logistics checklist below |

Do not start new material. Sleep.

## Logistics checklist
- Confirm with the recruiter: which AI tool or environment, whether it is CoderPad, your own IDE or a multi-file repo, and whether you can use your own machine.
- Test screen sharing, mic and the exact editor you will use.
- Have your AI assistant configured and logged in, with a short system prompt that tells it to give small diffs and explain them.
- Have pytest ready. In CoderPad, use "Run Test Case" if "Run Main" shows no output (reported by one candidate guide).
- Keep a blank notes file open for stated assumptions.

## If you run out of time (priority cut)
1. Agentic mock Gates 1 to 4 once (Day 1 and 4).
2. #158 agent tool safety, tool-call validation, retry/backoff, fallback, HITL.
3. #415 route: 092, 148, 150.
4. #869 PC-28 and PC-27.
5. VERBAL_QA rehearsal.
Drop the ledger drill, 414 debugging drills and #270 first.
