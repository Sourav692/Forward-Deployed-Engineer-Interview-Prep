# Observability for a Customer-Facing AI Application - Case Study Worksheet

## 1. Interview prompt
As the FDE, you plan and build **Observability of a Customer-Facing AI Application**. According to the customer, the AI is slow, it is sometimes wrong, and no one can say why. Before choosing what to capture, settle what you will refuse to capture.

## 2. Clarify the customer problem
- When people say slow, which percentile do they mean, and on which path?
- When they say wrong, is it an incorrect answer, an empty one, a hallucination, or a failed tool?
- Which tenants and which workflows feel it most?
- What may we record by default, without extra sign-off?
- Who has to find the cause of a failure without handing it up the chain?

## 3. Users and workflows
| User | Workflow | Current pain | AI assist opportunity | Human approval needed? |
|---|---|---|---|---|
| Support agent |  |  |  |  |
| Engineer on call |  |  |  |  |
| Security reviewer |  |  |  |  |
| Executive sponsor |  |  |  |  |

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
- Correlation and spans:
- Sensitivity classifier:
- Trace store:
- Sampling policy:
- Support access:
- Dashboards:

## 7. Evaluation plan
| Metric | Good threshold | Bad threshold | Test dataset | Owner |
|---|---:|---:|---|---|
| Redaction pass rate | 0 raw prompts | A single leak | Scanners for PII and secrets | Security |
| Trace coverage | Every complaint has a trace | Failures with no trace | Complaint count against trace count | Platform |
| Mean time to diagnose | Going down | Going up | Timelines of past incidents | Support eng |
| Telemetry overhead | Inside its budget | Skews production behaviour | Latency measured with and without export | Observability owner |

## 8. Failure modes
- The sampler throws away the one trace that shows the bug
- Tagging metrics with tenant ID blows up cardinality
- A raw prompt ends up in the logs
- Trace context is lost when a request passes through a queue
- The quality score climbs while fewer people use the product
- Exporting telemetry is what causes the outage

## 9. Rollout plan
1. Write down the SLOs users feel before anything else.
2. Turn "slow" and "wrong" into things you can measure.
3. Add instrumentation to one critical path.
4. Check every export for raw content.
5. Give support a workflow that links straight to the trace.
6. Then sample for quality and cost.

## 10. Weak vs strong answer
**Weak:** "I'd turn up the logging and put a dashboard on top."

**Strong:** "My first call is what we will not collect. Each request gets a stable correlation ID. Sensitive fields are classified, then salted and hashed, before they are stored. Sampling leans towards errors and slow outliers. I'd judge success by one test: can support explain a failure on their own?"

## 11. Candidate scorecard
| Area | 1 | 3 | 5 | Score |
|---|---|---|---|---|
| Problem framing | "Log more" | Mentions latency | Separates slow, wrong and diagnosable |  |
| Architecture | Logs plus a dashboard | Adds tracing | Classifies data before it is stored |  |
| Evaluation | "Dashboards exist" | Tracks latency | Coverage, MTTD and redaction |  |
| Production thinking | Instruments everything | Samples a little | Budgets overhead; keeps every error |  |
| Communication | Walks through the dashboard | Mostly clear | Opens with the lost-trace failure |  |
