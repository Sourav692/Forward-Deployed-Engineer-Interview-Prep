# Tool-Using AI Agent with Safety Controls - Case Study Worksheet

## 1. Interview prompt
As the FDE on this engagement, your job is to design and ship a **Tool-Using Agent with Safety Controls**. The agent reads email, looks things up in internal systems, edits CRM records and pays out refunds. None of that power may go unchecked. The model suggests an action; something else makes the call.

## 2. Clarify the customer problem
- Which actions can be undone, and at what amount does money need a stricter path?
- Whose identity does the agent use: the user's, a service account's, or delegated rights?
- What has to be true before an action can run with no approval?
- If the agent gets one wrong, how is it reversed, and by whom?
- What record must we keep so audits and disputes can be settled?

## 3. Users and workflows
| User | Workflow | Current pain | AI assist opportunity | Human approval needed? |
|---|---|---|---|---|
| Business user |  |  |  |  |
| Approver |  |  |  |  |
| Security owner |  |  |  |  |
| Tool / data owner |  |  |  |  |

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
- Planner and proposals:
- Tool registry:
- Policy decision point:
- Credential broker:
- Approval service:
- Idempotent execution:

## 7. Evaluation plan
| Metric | Good threshold | Bad threshold | Test dataset | Owner |
|---|---:|---:|---|---|
| Unsafe action count | 0 | Anything above zero | Review of the audit trail | Trust and safety |
| Duplicate effects | 0 | Even a single case | Logs from the idempotency layer | Reliability |
| Policy denial rate | Holds near its baseline | Jumps suddenly | Logs from the policy engine | Platform |
| Human override rate | Low and dropping | Climbing | Edits made in the review UI | Operations |

## 8. Failure modes
- An injected prompt asks for a tool the agent is not authorised to use
- The tool call works, but its response never comes back
- An approval goes out of date before the action runs
- The agent keeps retrying one action in a loop
- The credential broker is down
- A proposed refund goes over the limit set for the task

## 9. Rollout plan
1. Begin with read-only triage and draft replies.
2. Show that a few narrow writes can be undone.
3. Turn on writes only where rollback is proven.
4. Leave every money movement with a person.
5. Attack the prompt with a red team.
6. Release to a canary, then grant more autonomy.

## 10. Weak vs strong answer
**Weak:** "I'd hook the agent up to email and the CRM and let it pay refunds."

**Strong:** "The model may only suggest one bounded action at a time. A typed schema checks it. A deterministic policy engine then permits or rejects it. If permitted, a broker issues a scoped credential that expires quickly, and an idempotent gateway makes sure the effect happens exactly once. Anything a tool returns is untrusted data, never instructions."

## 11. Candidate scorecard
| Area | 1 | 3 | 5 | Score |
|---|---|---|---|---|
| Problem framing | Lists features | Mentions some approvals | Model suggests; policy decides |  |
| Architecture | Model calls tools directly | Adds a permission check | Broker, gateway and kill switch |  |
| Evaluation | "It works" | Measures success rate | Counts unsafe actions and duplicate effects |  |
| Production thinking | Switches on every tool | Runs a pilot first | Starts read-only; caps spend |  |
| Communication | Explains what the agent does | Mostly clear | Opens with the hostile case |  |
