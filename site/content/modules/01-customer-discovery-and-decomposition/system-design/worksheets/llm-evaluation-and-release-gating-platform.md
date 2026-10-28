# LLM Evaluation and Release-Gating Platform - Case Study Worksheet

## 1. Interview prompt
You are the FDE asked to build an **Evaluation and Release Gating** platform. Thirty AI applications will share it, and each team uses it to judge whether a change is safe to ship. If teams stop trusting the gate, they will go around it.

## 2. Clarify the customer problem
- Which changes count as a release, and what proof does each one need?
- Among quality, safety, latency and cost, where would a failure hurt most?
- When a gate fails, who can overrule it, and where is that decision logged?
- Do the apps share evaluation data, or does each tenant keep its own?
- How much regression will each class of application tolerate?

## 3. Users and workflows
| User | Workflow | Current pain | AI assist opportunity | Human approval needed? |
|---|---|---|---|---|
| AI application engineer |  |  |  |  |
| Domain evaluator |  |  |  |  |
| Safety lead |  |  |  |  |
| Release manager |  |  |  |  |

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
Start from a rendered diagram and shape it to fit this case. Cover each part below:
- Artifact registry:
- Dataset store:
- Scheduling:
- Sandboxed runner:
- Grading and review:
- Policy engine:

## 7. Evaluation plan
| Metric | Good threshold | Bad threshold | Test dataset | Owner |
|---|---:|---:|---|---|
| Regression escape rate | < 5% / 30 days | Even one severe escape | Tickets raised from incidents | Release manager |
| Human-grader agreement | >= 85% | Under the app's floor | Human labels on a sample | Evaluation lead |
| Evaluation coverage | >= 95% | Short of the minimum sample | Manifest of the dataset | Platform ops |
| Flaky case rate | < 2% | > 5% per dimension | The same cases run again | Evaluation infra |

## 8. Failure modes
- The grader scores long answers higher than correct ones
- The test set ages and no longer separates good builds from bad
- A candidate learns the benchmark rather than the task
- Personal data (PII) slips into the online sample
- A sample too small to judge looks like a clean pass
- The gate takes so long that teams find a way round it

## 9. Rollout plan
1. Prove the gate on a single critical application first.
2. Check grader scores against human labels and tune them.
3. Leave the gate advisory until that agreement is stable.
4. Then bring in gates for latency and cost.
5. Grow to other apps, each with its own rubric.
6. Drop any suite that can no longer tell builds apart.

## 10. Weak vs strong answer
**Weak:** "I'd put up a dashboard that shows eval runs and scorecards."

**Strong:** "I'd store each candidate and its baseline as fixed, versioned artifacts. I'd measure the difference against thresholds set per application. Missing evidence fails the gate. A sample too small to call means hold, not approve. Before any of that counts, I'd check the graders agree with humans."

## 11. Candidate scorecard
| Area | 1 | 3 | 5 | Score |
|---|---|---|---|---|
| Problem framing | Jumps to a dashboard | Names a few users and metrics | Treats release as a controlled decision |  |
| Architecture | A queue plus workers | Has a scheduler and a store | Separates control from data; pins artifacts |  |
| Evaluation | "The scores rose" | Tracks pass rate | Escape rate, grader agreement, flakiness |  |
| Production thinking | Stops at the demo | Some monitoring | Fails closed; quotas; grader calibration gate |  |
| Communication | Reads out metrics | Mostly clear | Leads with the decision and its evidence |  |
