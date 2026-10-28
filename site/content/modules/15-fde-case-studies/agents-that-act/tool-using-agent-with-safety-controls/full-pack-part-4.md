# Tool-Using Agent with Safety Controls, part 4

## 12. Answer the Cost and Latency Pivot in Ten Minutes

The pivot after a good design is "the agent is slow and expensive". On this system the dominant driver is agent steps and tool calls, plus retries after failed or rejected actions. An agent that acts must be bounded before it is optimised. The bounds already exist in the design. Cap the steps. Make the common paths deterministic. Cache read-only tool results within the request. Let the approval gate stop the loop. Do not give the loop a bigger model and a longer budget. Prove it with steps per request, tool latency, retry count and cost per request.

| | |
|---|---|
| Dominant driver | Agent steps and tool calls, plus retries after failed or rejected actions |
| Cheapest lever first | Bound steps per request; deterministic route for known intents; cache read-only tool results within the request; approval gate as the loop breaker |
| Metric that proves it | Steps per request; tool latency; retry count; cost per request |
| Do not | Give the loop a bigger model and a longer budget |
| 60-second line | An agent that acts must be bounded before it is optimised. Cap the steps, make the common paths deterministic, and let the approval gate stop the loop |

Two production scenarios arrive as the same pivot in different words. "The agent keeps calling tools repeatedly": it repeats a CRM lookup or retrieval and times out. Ask which tool repeats, what observation triggers it and whether state is preserved. The causes are a poor stopping condition, ambiguous tool descriptions, missing memory, a failed parse or no result cache. Inspect the trace, find the loop trigger and the missing state transition. Now: set max steps, cache the tool result, improve the schema, add a deterministic route. Later: agent budget tests and trace-based loop detection. Prevent with unit tests for tool selection and loop prevention. Say: *"I would treat this as a control-loop bug. The fix is step budgets, better tool routing, cached results, and explicit stopping criteria."*

"The tool-calling workflow times out": the response fails because an external workflow exceeds the timeout. Ask which tool is slow, whether it can be async and whether the result is needed immediately. The causes are a slow external API, serial calls, no timeout budget or synchronous side effects. Trace the calls and find the critical-path dependency. Now: set tool timeouts, parallelise read-only calls, return a partial answer or an async job. Later: dependency SLAs and circuit breakers. Prevent with a workflow design review before adding tools. Say: *"A tool timeout is not always an LLM issue. I would redesign slow side effects as async and keep the user informed."*

Every strong cost answer follows four verbs in order. Measure, by tracing and attributing first. Route, matching model and path to risk. Bound, with limits on steps, tokens, timeouts and budgets. Cache safely, with tenant, permission and version in the key. Deliver it in six moves: frame the business impact, decompose the path, name the largest measured driver, fix safely, prove with before and after, prevent recurrence. Where the interviewer wants unit economics, the model-time to tool-time ratio decides the lever. Batch reads into one planning pass when planning is expensive. Cache safe reads and prefetch context when tool calls dominate. Tighten the threshold so only high-value cases reach a person when human time is the cost.

## 13. Debug the Refund Near Miss as Detect, Contain, Root Cause, Prevent

The incident on this design is a near miss, and the trap is to say there was no problem because the gateway blocked it. A retail support assistant may summarise orders, draft replies, check policy and recommend refunds. It may not execute refunds above €250 without manager approval. It may only create a proposed refund ticket. On 2026-07-08 an agent asked it to "handle all delayed VIP shipments from yesterday". The planner selected the refund tool for 18 orders, including several above the threshold. The tool gateway blocked execution, so no money moved.

```text
2026-07-08T16:07:51.119Z level=warn service=agent-planner
  trace_id=trc_tool_9031 request_id=req_retail_22018 tenant_id=shopline
  user_role=support_agent user_intent="handle delayed VIP shipments from yesterday"
  planned_tool_calls=18 selected_tool=refund_customer
  policy_doc_version=refund_policy_v3 planner_model=agent_planner_2026_07

2026-07-08T16:07:51.522Z level=critical service=tool-gateway
  trace_id=trc_tool_9031 tool_call_id=tc_77881 tool=refund_customer
  order_id=ord_884120 customer_tier=vip refund_amount_eur=740.00
  approval_state=missing user_role=support_agent max_allowed_without_approval_eur=250.00
  tool_call_blocked=true block_reason=approval_required policy_decision=deny

2026-07-08T16:07:51.800Z level=warn service=agent-safety-evaluator
  trace_id=trc_tool_9031 event=unsafe_bulk_action_near_miss
  bulk_action=true affected_orders=18 blocked_calls=6 allowed_calls=12
  safer_alternative=create_refund_review_ticket
  planner_policy_compliance_score=0.42
```

Detect from the telemetry: 18 planned calls, 6 blocked and 12 allowed, a €740 refund against a €250 limit with approval state missing, and a planner compliance score of 0.42. The gateway's critical line is enforcement working; the safety evaluator's line is the planner failing. Contain immediately: disable bulk refund planning, force all VIP refund actions into review-ticket mode, and add a user confirmation step for financial actions. Then audit the 12 allowed calls to confirm the smaller refunds were legitimate.

The root cause is a planner prompt, `agent_planner_2026_07`, deployed to make the agent "more action-oriented", whose examples emphasised completing workflows end to end and omitted bulk-action approval boundaries. The planner over-generalised "handle delayed shipments" into direct refund execution, retrieved the refund policy, and failed to apply the threshold during planning. The gateway policy was unchanged and blocked correctly. Separate planner failure from enforcement success: this is a near miss, not a completed unauthorised transaction.

Prevent with defence in depth rather than a prompt edit:

- risk-aware tool schemas that encode the approval threshold
- pre-execution policy simulation
- planner training examples for thresholds
- a separate action-risk classifier before tool calls
- hard enforcement kept in the gateway regardless of planner confidence

The same pattern applies to account deletion, data export and permission changes. A malicious user can phrase any of them as operational cleanup.

> *"This is a near miss. The gateway prevented loss, but the planner attempted unauthorised high-value refunds. I would inspect the planned calls, policy retrieval, and gateway decisions. Then I would disable bulk refund execution, route VIP refunds to review tickets, encode approval thresholds in the tool schema, add policy simulation before execution, and keep the gateway as a non-bypassable enforcement layer."*

The weak answer is "the tool was blocked, so there is no problem, I would tell the agent to be more careful". The scorecard rewards four things. Reading planned, blocked and allowed calls with role, amount and approval state. Separating planner failure from gateway success. Auditing plan, policy context, schema and gateway logs rather than editing the prompt. Naming the fraud and unauthorised-action risk.

---

## Level calibration

On this design the levels separate on how far the control plane reaches past a single request, not on how well the planner picks tools.

| Level | Sounds like | Missing |
|---|---|---|
| Senior | The planner proposes one bounded action, the typed schema rejects over-limit arguments before policy runs, and the policy decision point returns allow, block or needs-approval. A broker mints a token for that one action, the idempotent gateway executes once and stores a receipt, and writes fail closed if policy or the broker is down. | The operating half: who owns each tool's revert path, how the kill switch stops work already in flight, and what evidence lets autonomy expand. |
| Staff | Gives each tool an owner and a documented revert procedure, binds approvals to tenant, record version, amount and expiry, and makes the kill switch cancel queued work, revoke tokens and mark in-flight tasks. Rolls out read-only first, keeps money behind a human, and gates every expansion on zero unsafe actions and zero duplicate effects. | What breaks as workflows and applications multiply: one-off wiring per customer, a registry past 1,500 functions, and planner regressions like the refund near miss that the gateway quietly absorbs. |
| Principal | Makes policy, broker, approval, gateway and ledger one shared control plane, so each new workflow brings only adapters and configuration, the registry loads only task-relevant tools, and identity propagates so no application trusts the LLM. Treats the refund near miss as a shift in the proposal distribution, so policy simulation and a separate action-risk check gate every planner change. | The refund threshold, the autonomy tier per action class and how long the ledger is kept depend on the customer's finance policy and dispute rules, so they wait for discovery. |

## Key Takeaways

- The model proposes and never decides, and the disagreement between operations, security and finance is the design problem to name in the first two minutes.
- Requirements are the six must-haves as a set, the constraints stated so a test can fail them, and a component owner for every one.
- Sizing is workload shape and risk: 20 QPS becomes about 200 tool actions per second, and `Risk = Impact × Likelihood × Irreversibility` sets the autonomy tier.
- One diagram splits the control plane that decides from the data plane that performs, with nine components in dependency order and four trust boundaries.
- One narrated request shows where control moves from the model to deterministic services, and the proposal is never the receipt.
- REST, function calling, MCP and agent frameworks are layers; the registry keeps the prompt small; no application trusts the LLM, only enterprise identity.
- Four security controls are held as one set: untrusted observations, no broad credentials, validated output, bounded dimensions.
- Writes fail closed and only reads degrade, with injection, lost responses, stale approvals, loops and broker outage each rehearsed.
- The release gate is zero unsafe actions and zero duplicate effects, reported across technical health, model quality, adoption and business outcome.
- Rollout is read-only first, reversible writes second, money behind a human, red-team before power, canary before scale.
- The fifty minutes are organised around trust boundaries, with four resolved trade-offs and the four follow-ups rehearsed.
- The cost pivot is answered by bounding before optimising: step caps, deterministic routes, in-request caches, the approval gate as loop breaker.
- The refund near miss is a planner failure and an enforcement success, prevented by encoding thresholds in schemas and keeping the gateway non-bypassable.

## Check Yourself

1. **Why is "the model refuses" not a security control?** Because the model sees information and does not inherit trust; enforcement lives in the policy point, the broker and the gateway, so an injected instruction fails there even if the model is fooled.
2. **What makes a retry safe?** A canonical argument hash as the idempotency seed and a gateway that returns the stored receipt for a repeated key instead of calling the tool again. Without that, do not retry a write.
3. **What does an approval bind to, and why?** A snapshot of tenant, record version, amount and expiry, so a change to the record before execution invalidates it and it is re-requested.
4. **Where does the policy boundary end?** At allow, deny or approve. The execution boundary ends at a scoped, logged side effect in a system of record.
5. **Why does validation run before policy?** So malformed or over-limit arguments, such as a $5,000 refund on a $500 task, are rejected before any authorisation logic executes, whatever the model's confidence.
6. **What happens to writes when the credential broker is down?** They fail closed; only reads with a cached, non-sensitive path that policy explicitly allows degrade, and never to a broad static secret.
7. **At what scale does function calling break, and what replaces it?** Around 1,500 functions across 100 applications, when prompt size and selection accuracy collapse; MCP gives discovery and a tool registry loads only the servers a task needs.
8. **Which two counts gate every autonomy expansion?** Unsafe actions and duplicate effects, both zero.
9. **What is the refund near miss's root cause, and what is its fix?** A planner prompt that omitted bulk-action approval boundaries; risk-aware schemas, policy simulation before execution, a risk classifier, and enforcement kept in the gateway.
10. **What is the first production gate?** That the control plane demonstrably prevents unauthorised actions, duplicate execution and uncontrolled side effects, not that the agent can do everything.

## References

### Fact-check sources (checked 27 Sep 2026)

- [MCP specification 2025-11-25 – Transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports): MCP is JSON-RPC over stdio or Streamable HTTP, not REST
- [Claude docs – Tool search tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool): selection degrades with many tools; load tools on demand
- [OWASP GenAI LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/): indirect injection from any content the model reads

