# Enterprise Chatbot Platform - Case Study Worksheet

## 1. Interview prompt
As the FDE, you are asked to build an **Enterprise Chatbot Platform** that 40,000 employees will use. The project exists because 6,400 of those staff already paste company data into consumer AI tools.

## 2. Clarify the customer problem
- Should we call a commercial API, host models ourselves, or mix the two by data class?
- Do we launch with plain chat, or with grounding on day one? If grounding, against which systems?
- How long do we keep conversations, and who is allowed to read someone else's history?
- May any employee publish an assistant, or does each one go through review?
- Why can't the company just buy a vendor's enterprise tier?

## 3. Users and workflows
| User | Workflow | Current pain | AI assist opportunity | Human approval needed? |
|---|---|---|---|---|
| Employee |  |  |  |  |
| Security / legal / compliance |  |  |  |  |
| Department admin |  |  |  |  |
| Platform operator |  |  |  |  |

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
- Session and identity:
- Context assembler:
- Retrieval ACLs:
- Policy and DLP:
- Model router:
- Audit:

## 7. Evaluation plan
| Metric | Good threshold | Bad threshold | Test dataset | Owner |
|---|---:|---:|---|---|
| Consumer-AI egress | Down 80% / 2 quarters | Not falling, or climbing | Baseline from proxy logs | Security |
| Weekly active / eligible | >= 50% | Below 25% | Telemetry from the product | Product |
| Permission violations | 0 | Anything above zero | Contract tests plus audit | Governance |
| Audit completeness | 100% | Below 100% | Turns logged against turns served | Compliance |

## 8. Failure modes
- An assistant with too wide a scope hands out access its users lack
- An ACL stays cached after access has been revoked
- An uploaded document carries a prompt injection
- The system prompt gets cut short and nobody notices
- A scripted account runs out of control and drains the budget
- The audit pipeline is down, so turns go unlogged

## 9. Rollout plan
1. Take a baseline of egress from the proxy logs.
2. Launch plain chat behind SSO, with audit on.
3. Ground answers in one corpus.
4. Block progress unless permission violations stay at zero.
5. Allow attachments, each one scanned.
6. Let people publish assistants after review.

## 10. Weak vs strong answer
**Weak:** "I'd stand up a React frontend, hook it to a vector DB, and route model calls through an LLM gateway."

**Strong:** "I'd fix identity when the session starts and check it again on every turn. Nothing reaches the context window unless policy lets it through and the audit log records it. Retrieval checks the live ACL for each chunk. An assistant can only see what both it and the current viewer may see. Every layer fails closed."

## 11. Candidate scorecard
| Area | 1 | 3 | 5 | Score |
|---|---|---|---|---|
| Problem framing | Copies ChatGPT | Mentions governance | Weighs egress risk and adoption together |  |
| Architecture | A UI plus a vector DB | Adds ACL filtering | Assembler, router and audit |  |
| Evaluation | "Users like it" | Tracks usage | Egress, violations and audit |  |
| Production thinking | Opens it to everyone | Pilots first | Tackles one risk class per phase |  |
| Communication | Only technical detail | Mostly clear | Has a story for the board and for on-call |  |
