# AI Customer-Support Automation - Case Study Worksheet

## 1. Interview prompt
As the FDE, design a GenAI system for **AI Customer-Support Automation**. Routine requests should be handled end to end. Risky ones go to a human, who receives the full context. The two harms to prevent are an action nobody authorised and a wrong answer given with confidence.

## 2. Clarify the customer problem
- Which channels are in scope, and what are the normal and peak volumes?
- How do we confirm who the customer is before any account tool runs?
- What may the system do on its own, and what needs sign-off?
- At handoff, what must the human agent see, and within what time?
- How many languages do we support, and what if we cannot tell the language?

## 3. Users and workflows
| User | Workflow | Current pain | AI assist opportunity | Human approval needed? |
|---|---|---|---|---|
| Customer |  |  |  |  |
| Support agent |  |  |  |  |
| Support operations lead |  |  |  |  |
| Security / legal reviewer |  |  |  |  |

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
- Identity verification:
- Intent and risk routing:
- Grounded retrieval:
- Tool policy gateway:
- Escalation:
- Monitoring:

## 7. Evaluation plan
| Metric | Good threshold | Bad threshold | Test dataset | Owner |
|---|---:|---:|---|---|
| Safe automation rate | Holds steady for each intent | Drops for any intent | Labels from QA review | Support operations |
| Incorrect resolutions | At or under baseline | Over baseline | Tickets that get reopened | Support QA |
| Repeat-contact rate | Level or falling | Climbs after a change | Contacts linked in the CRM | Support analytics |
| Cost per resolved case | Goes down | Rework cancels the saving | Finance reports | Finance operations |

## 8. Failure modes
- A policy answer is wrong but sounds certain
- Customer text carries a prompt injection
- An action runs before identity is checked
- A refund goes through but the reply times out
- Out-of-date account data leads to a promise
- The handoff drops context, so the agent starts over

## 9. Rollout plan
1. Assist agents only; a human sends every reply.
2. Automate intents that are low-risk and easy to reverse.
3. Introduce tool classes one at a time.
4. Review a sample of automated cases.
5. Keep a kill switch for each intent.
6. Roll back one intent, not the whole system.

## 10. Weak vs strong answer
**Weak:** "I'd pass every message to the model and let it close the ticket."

**Strong:** "I'd treat this as a decision pipeline with routing, not a chatbot. Identity is checked before any account tool. Each request gets an intent and a risk tag. Drafts rest on approved policy. Then a deterministic policy gateway, not the model, chooses between auto-resolve, approval and escalation."

## 11. Candidate scorecard
| Area | 1 | 3 | 5 | Score |
|---|---|---|---|---|
| Problem framing | Builds a chatbot | Adds some routing | Sees a routed decision pipeline |  |
| Architecture | Model writes the replies | Retrieval plus escalation | Identity gate and policy gateway |  |
| Evaluation | "Accuracy" with no detail | Tracks deflection and CSAT | Safe automation and repeat contact |  |
| Production thinking | Stops at the demo | Some monitoring | Kill switch and rollback per intent |  |
| Communication | Dumps technical detail | Mostly clear | Opens with the harm case |  |
