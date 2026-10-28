# Enterprise Knowledge Assistant with RAG - Case Study Worksheet

## 1. Interview prompt
You are the FDE on a GenAI build: an **Enterprise Knowledge Assistant with RAG**. Staff want answers drawn from Drive, SharePoint, Slack, wikis and tickets. Retrieval quality matters, but permissions can sink the project. Nobody may see content they could not open in the source.

## 2. Clarify the customer problem
- When two sources disagree, which one wins, and who decides?
- Do permission checks have to be live against each source, or will a scheduled sync do?
- How quickly must new content show up, and how quickly must deleted content disappear?
- If an answer is wrong, who investigates it? Who carries the risk if content leaks?
- With thin evidence, should the assistant decline, answer with a warning, or pass to a person?

## 3. Users and workflows
| User | Workflow | Current pain | AI assist opportunity | Human approval needed? |
|---|---|---|---|---|
| End user (employee) |  |  |  |  |
| Operator / support |  |  |  |  |
| Security owner |  |  |  |  |
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
Pick a rendered diagram as your starting point and adapt it to this case. Cover each part below:
- Ingestion and ACL:
- Permission-filtered retrieval:
- Reranking and budget:
- Citations:
- Evaluation:
- Monitoring:

## 7. Evaluation plan
| Metric | Good threshold | Bad threshold | Test dataset | Owner |
|---|---:|---:|---|---|
| Permission leakage | Zero cases | One or more | Red-team prompts across ACL roles | Security team |
| Grounded answer rate | At or above baseline | Over 5 points under baseline | Labelled questions from silent mode | ML and evaluation |
| Citation precision | Meets the agreed bar | Falls by more than 5 points | Sample checked by an SME | Evaluation team |
| Freshness lag | Inside the SLO | Outside the SLO | Source event times against index times | Ingestion owner |

## 8. Failure modes
- A deletion is missed, so removed content can still be retrieved
- A cached ACL lets a user whose access was revoked keep reading
- Retrieval returns passages that look close but do not answer the question
- The answer cites a source that does not back it up
- A ticket or wiki page hides instructions aimed at the model
- The model provider goes down, or cost spikes at peak load

## 9. Rollout plan
1. Start with a single low-risk corpus; nothing writes back to sources.
2. Run the access-leakage suite; any exposure stops the release.
3. Evaluate silently against real employee questions.
4. Pilot in read-only mode, with citations on show.
5. Add the remaining sources one at a time.
6. Keep monitoring and reconciling; widen only when each gate passes.

## 10. Weak vs strong answer
**Weak:** "I'd load all the documents into a vector store and have the model answer from the top hits."

**Strong:** "Permissions are the constraint that matters most, so I'd say that first. I'd map every source's ACLs into one model at ingestion, filter candidates by the user's effective access before the model sees anything, check each citation, decline when evidence is thin, and hold rollout until a leakage suite passes."

## 11. Candidate scorecard
| Area | 1 | 3 | 5 | Score |
|---|---|---|---|---|
| Problem framing | Starts with tools | Names some users and metrics | Spots the permission risk first |  |
| Architecture | Plain RAG pipeline | Sensible components | Filters by permission; easy to observe |  |
| Evaluation | "Accuracy" with no detail | A few basic metrics | Leakage suite plus groundedness |  |
| Production thinking | Stops at the demo | Some monitoring | Fails closed; rollback and drills |  |
| Communication | Dumps technical detail | Mostly clear | Opens with outcome and risk |  |
