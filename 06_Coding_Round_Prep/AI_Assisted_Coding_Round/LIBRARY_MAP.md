# Gumroad library map for the agentic coding round

Row numbers (#) come from the Gumroad audit (`all.json`). Problem IDs come from the 150-problem bank (#854). PC-xx IDs come from the Palantir bank (#869).

Corrections to my earlier list:
- #854 is the Google 150-problem bank (prompts only, no solutions). The GenAI Python problems are #158 (prompts) and #160 (solutions).
- #414 and #415 are indexes of IDs. The prompts are in #854.
- #158 is mostly single-function problems; extend them into stages yourself.

| Priority | Doc | Use for | Specific items |
|---|---|---|---|
| 1 | #158 / #160 (50 GenAI FDE Python problems) | Agent-adjacent drills | Agent Tool Execution Safety, Validate JSON Tool-Call Arguments, Multi-Step Workflow State, Model Fallback Logic, HITL approval, Retry with Backoff, Dead-Letter Queue, Rate-Limit Model Calls per Tenant; L4 (31-40) and L5 (41-50) first |
| 2 | #415 Production Coding Map, prompts in #854 | GenAI production route | 090, 105, 116, 132, 147, 148, 150 and 092, 091, 131 |
| 3 | #869 Palantir 40 exercises | Staged production problems with tests | PC-27, PC-28, PC-29, PC-13, PC-14, PC-25, PC-30 |
| 4 | #270 FDE 10 Coding Exercises | Integration tasks with starter stubs | Exercises 2, 4, 5, 9 |
| 5 | #414 Debugging Map, prompts in #854 | Reproduce-first debugging | 133, 128, 141, 127, 145 |
| 6 | #269 DSA and RRK workbook | Easy-algorithm fallback | Only if time allows |

Reference code and concepts:
- Hands-on lab, `backend/agents` (Core + GenAI kit, `11_HANDS_ON_LABS`): deterministic workflow with guardrails, audit and fallback responses. Good for structure; it is not an LLM tool loop.
- #301 LangGraph ReAct Agents Production Playbook: router-worker, plan-execute-verify, tool catalog with approval, trajectory evaluation.
- #254 Agentic Workflow Design Canvas: 12 production failure modes.
- #299 AI Engineer Interview Kit, Parts 4 and 5: agent system design and 30 production debugging scenarios.
- #666 GenAI Evaluation Casebook: cases 7 to 9 for agent and tool evaluation.

Confidence: the audit read these docs with sub-agents, and some were sampled (large PDFs). I re-read the Production Coding Map (#415) and the lab agent code directly.
