# Tool-Using AI Agent with Safety Controls - Answer Key

Try the worksheet before you read this key. It shows what a strong GenAI FDE candidate asks, designs, measures, secures and explains on the way from a demo to a production system.

## Strong discovery questions
- Which actions can be undone and which cannot? Where precisely does money start to move?
- Whose identity does the agent use: the user's, a service account, or a delegated role with narrow rights?
- Which piece of work do we automate first, and which decisions stay with people?
- Where does the truth live for identity, for customer state and for financial actions?
- What has to be true about an action before it can run without an approval?
- When the agent gets it wrong, how do we roll back, and who does the rollback?
- What do audit, support and dispute handling need us to record?
- How do we measure success: shorter handling time, more cases resolved, fewer errors, or happier customers?

## Strong functional requirements
- Core workflow: read the incoming work, suggest one bounded next step, run it past deterministic policy, and carry out only what policy allows.
- The planner suggests and never acts. The model reads and interprets. Permission to act, and the limits on what changes, come from deterministic systems.
- Each tool is declared in a registry, along with its schema and the class of data it touches. That makes tool use something we can govern.
- Irreversible actions, and financial ones above a threshold, need an explicit approval. That approval is stored as a record in its own right.
- All actions go through an idempotent gateway. However often a call is retried or replayed, the side effect happens once.
- A kill switch, tested in advance, stops every autonomous path without a deploy.

## Strong non-functional requirements
- Latency: keep separate budgets for model planning and for tool calls. For low-risk tasks I'd aim for p95 completion under about 15 seconds.
- Availability: the case gives us 50,000 users and a 20 QPS peak, each task taking 10 actions. Multiply it out and you get about 200 tool actions each second. Reads can fan out in parallel; writes cannot.
- Security: each workflow gets its own short-lived, tightly scoped credentials. The model never holds an API key it could reuse or an admin token.
- Compliance: every action leaves a tamper-evident ledger entry with the intent, the policy decision, the approval and the outcome.
- Reliability: if the credential broker or the policy engine is down, writes fail closed. Degraded service is allowed for the safest reads and nothing else.
- Cost: set hard caps on tool calls per task, spend per task, refund size and permitted destinations. They are guardrails, not dials to tune.

## Architecture explanation
- Two planes split the work: control rules on what is allowed, and data carries it out. The model lives wholly inside the control plane, at the step where actions are proposed.
- The agent planner suggests one bounded next step at a time. It is expressly barred from running anything itself.
- The task state store holds workflow progress and interim results. It is never the source of truth for the business.
- The tool registry lists the permitted tools, their argument schemas and data-class metadata. A tool that is not listed cannot be called at all.
- The policy decision point is deterministic. It answers allow, block or needs-approval, and returns the scopes it grants plus a reason string.
- The credential broker issues short-lived capability tokens. A token covers a single tenant, workflow and action type, and it expires on a fixed clock.
- The approval service records human sign-off for irreversible actions. The idempotent execution gateway makes sure each proposal runs exactly once.
- The audit ledger keeps the intent, the decision, the approval and the outcome. A kill switch stops autonomous paths, and we test it before launch.

## Data model / integration assumptions
- AgentTask(id, actor, goal, state, step_budget); ToolDefinition(name, schema, data_class, scopes); ActionProposal(id, task_id, tool, args_hash, policy_decision); PolicyDecision(proposal_id, verdict, scopes, reason); ActionReceipt(proposal_id, idempotency_key, outcome).
- A proposal is only what the model recommends. A receipt is the sole evidence that a side effect took place, and we never mix the two up.
- Arguments are put into canonical form before hashing. The same logical input then always produces the same idempotency seed.
- When an idempotency key comes in a second time, the gateway hands back the stored receipt and skips the tool call, so a retry is safe.
- Schema validation comes before policy evaluation. Malformed arguments are thrown out before any authorisation code runs.

## Red-team risks
- In short: a prompt injection that asks for an unauthorised tool, tool responses that go missing, stale approvals, action loops, and an outage of the credential broker
- Indirect prompt injection hidden in a CRM record, a ticket thread, a database row or a fetched page. What a tool returns is untrusted data, never an instruction.
- Credentials that grant too much. A long-lived token lets one manipulated plan reach the whole fleet instead of one bounded workflow.
- Proposals nobody validates, such as a confident "refund $5,000" when the task limit is $500. Validation must reject it however sure the model sounds.
- A tool call succeeds but its response is lost. A naive retry then sends a second refund unless the gateway is idempotent.
- Old approvals and runaway loops. An outdated sign-off can authorise a state that has since changed, and an unbounded agent can keep retrying until the bill explodes.

## Rollout plan
- Week 0-1: sort every action by whether it can be undone and how much money it touches, and name who approves each risky class.
- Week 1-2: ship the smallest safe slice: triage and drafting in read-only mode, with every write path switched off.
- Week 2-3: show that a small set of CRM writes can be reversed before opening up any wider write path.
- Week 3-4: enable writes only where rollback has been shown to work, and keep a person in front of every financial action.
- Week 5: attack the prompt with hostile tool observations before the agent gets any more power.
- Week 6-8: send a small, representative share of traffic through a canary. Track how often policy denies, whether any effect is duplicated, how long approvals take and how often people override.
- After pilot: give the agent more autonomy only where the count of unsafe actions stays at zero and no duplicate effect ever shows up.

## Evaluation plan
I chose these thresholds for this case. They are not industry standards, so be ready to defend them rather than recite them.

| Metric | What it proves | Strong threshold | Dataset / method |
|---|---|---|---|
| Unsafe action count | The control boundary did its job | None at all in any sensitive workflow | Audit review, incident tickets and rule checks |
| Duplicate-effect count | No customer is ever charged twice, whatever gets retried or replayed | Zero; a single case triggers an alert at once | Idempotency logs plus reconciliation reports |
| Policy denial rate | Denials come from genuine policy, not a faulty prompt | Steady against the baseline; any spike gets investigated | Logs from the policy engine |
| Approval rate and delay | Human gates protect the flow without holding it up | Delay inside the SLO; rate steady | Logs from the approval service |
| Task completion rate | The automation finishes work without someone stepping in | Stays level or rises after each expansion | Workflow state machine plus closed cases |
| Human override rate | The agent justifies its place in the queue | Low enough that the automation pays for itself | Review UI and edits made after the action |

## Weak answer
I'd build an assistant that hooks into email and the CRM and issues a refund whenever it judges the customer deserves one. This is weak because the model becomes the authority. It gets raw credentials instead of scoped capabilities, nothing deterministic gates its policy, and instructions hidden in a ticket meet no defence.

## Average answer
I'd let the agent plan its tool calls, run a permission check before each one, ask for approval on large refunds and log everything. For reliability I'd add retries. Better, but tool output is not treated as untrusted, loops and spend have no limits, and retries arrive without idempotency, so one refund can silently turn into two.

## Strong answer
The model must never be the authority, so I'd frame the outcome this way: automation that earns its keep, while deterministic rules own identity, access, risk and anything that can't be reversed. The planner suggests one bounded action, and a typed schema checks it. Then policy, which is deterministic, returns allow, block or needs-approval. The broker hands out a token that lives briefly and covers only that action, and the gateway's idempotency means the effect lands exactly once. Whatever a tool returns is untrusted data, not an instruction, so an injection is stopped at the policy gate instead of resting on the model's judgement. Hard caps cover loops, spend, refund size and destinations. I'd begin read-only, show that writes can be reversed before turning them on, keep a person in front of any money movement, and red-team the prompt before handing over more power.

## Interviewer scorecard
| Area | 1 - Weak | 3 - Average | 5 - Strong |
|---|---|---|---|
| Problem framing | "Build an agent that does refunds" | Mentions automation and approvals | Frames the goal as controlled automation; the model proposes and deterministic systems decide |
| Requirements | "It should be safe" | Covers permissions and logging | Classes of reversibility, where money moves, how delegation works, a clear step budget |
| Architecture | The model calls tools itself | Adds a permission check | A proposing planner, a tool registry, a policy decision point, a credential broker, approvals, an idempotent gateway and a kill switch |
| Data/integration | Mentions logs | Names tasks and tool calls | Keeps proposal and receipt apart, hashes canonical args, validates before policy |
| Evaluation | "It works" | Measures success rate | Counts unsafe actions and duplicates; tracks denials, approval delay and overrides |
| Safety/security | "The model will refuse" | Adds scoped tokens | Treats observations as untrusted, short-lived capabilities, checks output, caps loops and spend |
| Rollout | Turn on every tool | Pilot with approvals | Read-only first, reversibility shown, a person in front of money, prompt red-team, canary |
| Communication | Describes the agent | Clear but generic | Opens with the hostile case, says what fails closed, ends on the autonomy gate |

## Final 2-minute spoken answer
I wouldn't begin with the model. Here the customer's agent has four jobs: read email, query internal systems, update CRM records and send refunds. Everyone agrees with that feature list, and then they disagree about everything else. Operations wants speed. Security wants hard gates. Finance is worried about money moving in ways we can't undo. So I'd restate the goal as automation that does real work, with identity, access, risk and irreversible effects all held by deterministic controls. The model therefore holds no authority. It can read the situation and suggest a step. Who acts, what changes and whether it can be undone are settled by deterministic systems. In practice the planner suggests one bounded action. A typed schema checks the arguments before policy even looks at them. Deterministic policy then rules allow, block or needs-approval, and lists the scopes it grants. The broker mints a token that expires quickly and is bound to one workflow and one kind of action. Because the execution gateway is idempotent, retries never produce more than one side effect. Anything a tool returns is untrusted data, not a command. So an injection hidden in a ticket is stopped at the policy gate; we don't rely on the model spotting it. Hard caps apply to loops, per-task spend, refund size and destinations. For rollout I'd go read-only first, show that writes can be reversed before switching any on, keep a person in front of money movement, and red-team the prompt before giving the agent more autonomy. Success means less handling time and zero irreversible changes that nobody authorised or reviewed.
