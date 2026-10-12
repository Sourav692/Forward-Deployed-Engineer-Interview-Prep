# Configurable Platform for Customer-Specific Workflows - Case Study Worksheet

## 1. Interview prompt
As the FDE, your job is to shape a **Configurable Platform for Customer-Specific Workflows**. Ten customers share one platform, yet each wants its own fields, approval steps, branding and integrations. The thing to avoid is ending up with ten separate forks.

## 2. Clarify the customer problem
- Which of the differences keep coming back, and which really happen only once?
- Who writes the configuration: our engineers, the customer's admins, or both?
- Does each configuration have to keep working, unchanged, across core releases?
- Where is custom code allowed: in the core, in a sandbox, or only inside adapters?
- How long should it take to configure a new customer?

## 3. Users and workflows
| User | Workflow | Current pain | AI assist opportunity | Human approval needed? |
|---|---|---|---|---|
| Customer administrator |  |  |  |  |
| FDE / delivery team |  |  |  |  |
| Core platform engineer |  |  |  |  |
| Support and release team |  |  |  |  |

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
- Workflow runtime:
- Configuration registry:
- Schema validation:
- Adapter SDK:
- Sandbox and flags:
- Migration and rollback:

## 7. Evaluation plan
| Metric | Good threshold | Bad threshold | Test dataset | Owner |
|---|---:|---:|---|---|
| Fork count | 0 | One fork that cannot be removed | Analysis of the repo | Engineering lead |
| Handled by configuration | High and climbing | Dropping | Tags on change requests | Platform eng |
| Time to launch customer | Getting shorter | Getting longer | Records of each release | Delivery lead |
| Tenant incident rate | Stays inside one tenant | Reaches other tenants | The incident system | Support and SRE |

## 8. Failure modes
- An approval graph contains a cycle and never ends
- An adapter's contract shifts on the downstream side
- An upgrade breaks a field mapping that older configs rely on
- Nobody tested a particular mix of feature flags
- Custom code gets out of its sandbox
- One validation rule eats all the available resources

## 9. Rollout plan
1. Spot the pattern that keeps repeating.
2. Build it into shared primitives.
3. Have the first customer's admin set it up.
4. Run a pilot that goes through the real support desk.
5. Record a baseline for launch speed and defect count.
6. Widen only while the fork count stays at zero.

## 10. Weak vs strong answer
**Weak:** "I'd make a flexible system with forms, approvals and hooks you can configure."

**Strong:** "I'd run every customer on a single engine that ships on a single release train. Each customer's variation would live in a declarative config that is versioned, immutable and validated before it can be published. I'd deny arbitrary code unless it is explicitly allowed, and scope adapters and secrets to a single tenant. I'd count success as variations shipped with no fork."

## 11. Candidate scorecard
| Area | 1 | 3 | 5 | Score |
|---|---|---|---|---|
| Problem framing | "Keep it flexible" | Names a shared core | Sets variation without forks as the goal |  |
| Architecture | An engine with settings | Registry plus validator | Sandbox, flags and migrations |  |
| Evaluation | "The customers are happy" | Tracks incidents | Fork count and share handled by config |  |
| Production thinking | Brings on all ten at once | Pilots with one | Rollback, baselines and gates |  |
| Communication | Lists features | Mostly clear | Opens with the risk of fragmenting |  |
