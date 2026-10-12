# Natural-Language-to-SQL Analytics Assistant - Case Study Worksheet

## 1. Interview prompt
Your GenAI FDE task is a **Natural-Language-to-SQL Analytics Assistant**. Every week, executives repeat the same questions, and analysts turn each one into a query by hand. The worst outcome is not broken SQL. It is SQL that runs cleanly but answers a different business question from the one asked.

## 2. Clarify the customer problem
- Who defines each metric, and how often does a definition change?
- Is there a semantic layer already, or do we have to build one?
- Does the warehouse enforce row and column security today?
- Which warehouses and SQL dialects must we support?
- If a question is ambiguous, should the assistant ask back, decline or hand it to an analyst?

## 3. Users and workflows
| User | Workflow | Current pain | AI assist opportunity | Human approval needed? |
|---|---|---|---|---|
| Executive |  |  |  |  |
| Analyst |  |  |  |  |
| Data / platform engineer |  |  |  |  |
| Metric owner |  |  |  |  |

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
Pick a rendered diagram as your starting point and adapt it to this case. Cover each part below:
- Metric registry:
- Schema retrieval:
- Ambiguity check:
- AST and policy validation:
- Read-only execution:
- Monitoring:

## 7. Evaluation plan
| Metric | Good threshold | Bad threshold | Test dataset | Owner |
|---|---:|---:|---|---|
| Semantic correctness | Agrees with the analyst | Even one unflagged mismatch | Golden cases of question plus SQL | Analytics lead |
| Policy violations | None get through | Any that get through | Audit of query runs | Security team |
| Bytes scanned per answer | At or under baseline | More than 20% over | Telemetry from the warehouse | Data platform team |
| User trust score | At or above the launch target | Falls two periods running | Feedback captured in the product | Product team |

## 8. Failure modes
- The SQL runs but answers the wrong business question
- A schema change quietly breaks a saved template
- A join multiplies rows and inflates totals
- A query reads far more data than it needs
- The written summary disagrees with the result table
- Policy blocks leave users frustrated

## 9. Rollout plan
1. Start with ten governed metrics, each with a named owner.
2. Build golden cases: question, SQL and expected result.
3. Re-run the golden set on every change.
4. Shadow the analysts; their answer stays the source of truth.
5. Open to executives once the answers match.
6. Grow one domain at a time.

## 10. Weak vs strong answer
**Weak:** "I'd give the model the schema, let it write SQL and run whatever comes back."

**Strong:** "Before touching any table, I'd map the question to a governed metric. If the question is ambiguous, I'd ask rather than guess. I'd parse the SQL into an AST, check it against policy and a scan budget, run it read-only, and prove the whole thing on ten metrics with golden cases."

## 11. Candidate scorecard
| Area | 1 | 3 | 5 | Score |
|---|---|---|---|---|
| Problem framing | Leaps straight to text-to-SQL | Names some users and metrics | Frames it as governed decision support |  |
| Architecture | Model wired to the warehouse | Adds a semantic layer | Metric registry first; AST policy gate |  |
| Evaluation | "Accuracy" with no detail | A handful of test queries | Golden cases; checks semantic correctness |  |
| Production thinking | Stops at the demo | Some monitoring | Scan budgets, rollback, named owners |  |
| Communication | Dumps technical detail | Mostly clear | Opens with the wrong-answer risk |  |
