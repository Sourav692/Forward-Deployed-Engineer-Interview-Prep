# Standard Tracing and Customer-Facing Dashboards

*A bespoke trace format is quick to build and costs a custom integration for every customer, while a standard span format costs nothing extra in data and plugs into tools that already exist.*

◷ 5 min

A trace that only one project's code can read stops being useful the moment it leaves the laptop. Keep the fields of [The Run Trace](02_The_Run_Trace.md) and change only the wire format, then give each customer a scoped view of the same data.

> **What you'll learn**
>
> - Explain why the format of a trace matters more than its contents once a customer is involved.
> - Describe a trace as a tree of spans with domain fields as attributes.
> - Scope dashboards per tenant and name them as a real, deferrable requirement.

---

## Emit Spans, Not a Custom Schema

Capturing every step, every retrieved item and every tool call is good. If the format is invented for one project, though, it only works inside that project.

The problem appears when a customer wants their own monitoring tool to show the AI system beside their own request traces. Datadog, Honeycomb or whatever they already run cannot read a bespoke format. Every customer then needs a bespoke integration.

The fix is OpenTelemetry-style spans. Every unit of work is a span with an ID, a parent ID and a start and end time. Parent IDs make the spans form a tree. Domain fields such as prompt version, retrieved document IDs and tokens ride along as attributes on the span. The captured data does not change; only the wire format does.

| Span | Parent | Attributes |
|---|---|---|
| One request | None (root) | `run_id`, `tenant`, `principal`, `prompt_version` |
| Authorise | Request | `filter_explanation` |
| Retrieve | Request | `strategy`, `candidate_ids`, `retrieved_by` |
| Enforce | Request | `allowed`, `denied`, `filter_disagreements` |
| Rerank | Request | `model`, `tokens`, `cost_usd` |
| Generate | Request | `cached`, `tokens`, `cost_usd` |
| Tool call | Generate | `tool`, `status`, `ms` |

## Nest Requests Under Conversations

The handbook's demo writes one JSON file per run. Production emits the same structure as spans, one trace per request, nested under one trace per conversation. Put `tenant`, `principal`, `prompt_version` and `run_id` as attributes on every span. Any span can then be filtered by tenant or prompt version without a join.

The same reasoning drives the build-versus-buy default for monitoring. Use an existing, standards-compatible platform. Add a thin custom layer only for domain fields the platform does not yet support, on top of it rather than instead of it.

## Give Each Tenant Their Own View

Traces are usually something a developer reads after something breaks. In a customer-facing deployment the customer needs visibility too. They want recall and accuracy trends, run success rate, escalation rate and cost, scoped to their own data only.

The data already exists in the trace store. A dashboard is a read-only aggregation over it, scoped by tenant the same way everything else is. A standard format makes this a customer-facing surface instead of an internal log.

Be honest about the size of it. A per-tenant dashboard is a real frontend and BI project, and it is reasonable to defer. Name it anyway. A forward-deployed engagement usually needs the customer, not only the vendor's team, to see these numbers.

> **Warning: a dashboard is a data path.** A tenant-scoped dashboard must apply the same tenant scoping as retrieval. An aggregation that forgets the tenant filter leaks one customer's cost or questions to another.

## Return Errors a Partner Can Act On

A dashboard shows a customer what happened. An error response tells a partner's developer what to do next, at the moment it happens. When the error says only "500 Internal Server Error" or "invalid request", the developer opens a ticket, and an engineer on your side reads traces to answer a question the response could have answered.

An **actionable error** carries five things:

| Field | Example | What it saves |
|---|---|---|
| A stable, machine-readable code | `employee_not_found` | The partner's code can branch on it without parsing text |
| A message naming the fix | "Employee 4471 does not exist in this company. Create the employee first." | The developer fixes the call without asking |
| The field at fault | `lines[3].employee_id` | No guessing which of 200 lines failed |
| Whether to retry, and when | Do not retry, or retry after 30 seconds | Stops retry storms on errors that will never succeed |
| The request ID | `req_7f3a…` | When a ticket is needed, it starts from one trace |

The Internet Engineering Task Force's problem-details format, RFC 9457, gives a standard shape for these fields in an HTTP API, so a partner's tooling can read them without custom parsing.

Coldharbour Payroll, a fictional payroll provider, took timesheet uploads from partners' HR systems. Its upload API returned "400 Bad Request" for any validation failure. Partner tickets about rejected uploads took about two hours of engineer time each, mostly finding which line failed and why. After the API returned the code, field and fix for each rejected line, most of those tickets stopped, and the per-tenant dashboard grouped rejections by code so a partner could see "38 lines rejected for unknown employee" without asking.

The trade-off is disclosure. Detail that helps a trusted partner can help an attacker. Never put stack traces, internal host names or query text in an error. To a caller who is not yet authenticated, do not reveal whether an account exists. Give the detail after authentication, scoped to the caller's own data, and keep the internals in the trace behind the request ID.

## Worked Example: The Customer Who Runs Datadog

A customer's platform team asks to see the assistant's activity in Datadog, next to their own services. With the bespoke JSON trace, that is a custom exporter and a mapping project.

With spans, the authorise, retrieve, enforce, rerank and generate steps arrive as a normal trace tree. The prompt version and tenant are attributes the customer can already filter on. Their on-call engineer sees that the rerank span is slow without learning a new tool.

Nothing about what was captured changed. Choosing the standard format turned an integration project into configuration.

---

## Key Takeaways

- Emit traces as standard spans with IDs, parent IDs and timings, carrying domain fields as attributes rather than a new schema.
- Nest request traces under a conversation trace and put tenant, principal, prompt version and run ID on every span.
- Per-tenant dashboards are read-only, tenant-scoped aggregations over the trace store; name them as a requirement even when deferred.
- Return errors a partner can act on: a stable code, a message naming the fix, the field at fault, retry guidance and the request ID.

## Check Yourself

1. **Why does the format of a trace matter more than its contents once a customer is involved?**
   The customer's existing monitoring stack must read it. A bespoke format needs a custom integration per customer; a standard span format carries the same fields and works with existing tools.

2. **Where do domain-specific fields such as prompt version and tokens go in a span-based trace?**
   On the spans as attributes. The span structure stays standard, so no new schema is needed.

3. **A customer asks for a dashboard of their assistant's accuracy and cost. Is that new data collection?**
   No. The data is already in the trace store. The dashboard is a tenant-scoped, read-only aggregation, which is real frontend work but not a missing signal.

## References

**Sources:** `02_Observability_Standards_Failure_Patterns.md` (FDE Handbook, cross-cutting concerns): §1 standard tracing, §2 per-tenant dashboards. `02-observability-standards-and-failure-patterns.md` (Production and Platform Judgement): §1 and §2. `08_Observability.md` (FDE Handbook, enterprise RAG): "From here to production". `03-cost-latency-cicd-rigor-and-build-vs-buy.md` (Production and Platform Judgement): §7 build versus buy, monitoring row. The partner-error section (added 18 November 2026) is the author's own field experience, with a fictional customer, and follows the Internet Engineering Task Force's [RFC 9457: Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc9457), accessed 18 November 2026.
