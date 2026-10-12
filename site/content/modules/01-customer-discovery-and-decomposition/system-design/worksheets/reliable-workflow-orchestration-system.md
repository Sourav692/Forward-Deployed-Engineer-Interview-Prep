# Reliable Workflow Orchestration System - Case Study Worksheet

## 1. Interview prompt
Design a GenAI FDE solution for a **Reliable Workflow Orchestration System**. One business process spans a document approval, a payment, an email and three internal systems, and any step can fail or sit waiting for days. Here, "exactly once" refers to the business outcome, not to individual messages.

## 2. Clarify the customer problem
- Which event tells us a workflow has truly finished?
- When a step fails, do we undo it or run a compensating action?
- How long can each step wait: minutes, hours or days?
- Who has authority to resume, rerun or override a single case?
- Will the payment provider accept an idempotency key?

## 3. Users and workflows
| User | Workflow | Current pain | AI assist opportunity | Human approval needed? |
|---|---|---|---|---|
| Workflow participant |  |  |  |  |
| Operations team |  |  |  |  |
| Application developer |  |  |  |  |
| Auditor |  |  |  |  |

## 4. Requirements
### Functional
-
-
-

### Non-functional
- Latency target:
- Availability target:
- Cost budget:
- Security/privacy constraints:
- Audit/compliance requirement:

## 5. Data and integration map
| Data source | Format | Owner | Freshness | Permission model | Risk |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## 6. Proposed architecture
Start from one of the rendered diagrams and adapt it to this case:
- Durable state and history:
- Scheduling:
- Timers and signals:
- Activity workers:
- Compensation:
- Operator repair:

## 7. Evaluation plan
| Metric | Good threshold | Bad threshold | Test dataset | Owner |
|---|---:|---:|---|---|
| Duplicate business effects | 0 | Even one repeat | Idempotency key logs | Reliability team |
| Replay determinism | Same decisions on every replay | One divergent decision | Replay jobs over stored history | Runtime engineering |
| Age of stuck workflows | Inside the expected wait | Past the agreed limit | Queue and state inspection | Operations |
| Manual repairs | Inside agreed tolerance | Over tolerance | Operator ticket records | Support operations |

## 8. Failure modes
- A worker dies just after the payment goes through
- The email sends but the CRM write fails
- An approval sits untouched for seven days
- A new definition ships while old instances still run
- An external API never returns
- Two workers try to move the same instance forward

## 9. Rollout plan
1. Start with a single workflow; skip the platform.
2. Make crash recovery the first gate.
3. Show that no side effect happens twice.
4. Give operators visibility early.
5. Practise resume and compensation drills.
6. Publish new versions; never edit live ones.

## 10. Weak vs strong answer
**Weak:** "I'd write an orchestrator that calls each API one after another and retries when something fails."

**Strong:** "I'd guarantee exactly once for the business effect. An append-only history writes the intent before each step runs. Receipts are stored by idempotency key. Waiting is a proper timer state. Every step has its own compensation. Each instance stays pinned to the definition version it started on."

## 11. Candidate scorecard
| Area | 1 | 3 | 5 | Score |
|---|---|---|---|---|
| Problem framing | "We need an orchestrator" | Lists the steps | Exactly once for the business outcome |  |
| Architecture | Calls APIs in a chain | Keeps durable state | Timers, signals, per-step compensation |  |
| Evaluation | "It finished" | Counts failures | Duplicates and replay determinism |  |
| Production thinking | Builds a platform first | Pilots one process | Crash-recovery gate, operator repair |  |
| Communication | Walks through the engine | Mostly clear | Opens with the double-charge case |  |
