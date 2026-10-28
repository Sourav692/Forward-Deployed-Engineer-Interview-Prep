# Observability for a Customer-Facing AI Application - Answer Key

Work through the worksheet on your own first, then compare. This key models the questions, design, metrics, security controls and explanation a strong GenAI FDE candidate brings when a demo has to become a production system.

## Strong discovery questions
- When someone says "slow", which latency percentile do they mean, on which path, and in which workflow?
- When someone says "wrong", do they mean a bad answer, no answer, an invented fact, or a tool error shown to the user?
- Which tenants and users feel this most? Start instrumenting where the pain is.
- What may the team capture without asking, and what do contracts or the law put out of bounds?
- Can support diagnose a failure on its own, or does every case end up with engineering?
- How much overhead can telemetry add before it starts to change how production behaves?
- How long do we keep traces, and which roles may read them?
- What evidence would convince the executive sponsor that quality gets better with each release?

## Strong functional requirements
- Core workflow: starting from a user complaint, a support agent finds the exact request family and explains what failed, all without seeing raw sensitive content.
- Give each request a correlation ID that never changes, and carry trace context through every service, integration and queue hop.
- Time each hop, from authentication and tenant resolution through retrieval, the model call and tool use, on to post-processing and delivery.
- Store as structured attributes the retrieval evidence, the model version, the prompt template version, the generation settings and each tool result.
- Keep two kinds of view apart. A global dashboard shows aggregate platform health, and tenant-scoped views serve customer debugging.
- Label each request with what the user saw: success, a partial answer, or escalation. A complaint can then be matched to telemetry.

## Strong non-functional requirements
- Latency: instrumentation must never cause the outage. Set a telemetry overhead budget up front.
- Availability: if telemetry export fails, diagnosis gets worse, but the user's request still goes through.
- Security: by default we never capture full prompts, raw customer documents or secrets. Sensitive fields get classified and hashed before anything is stored.
- Compliance: audit logs say who accessed what. Debugging traces say what failed where. The two stay in separate stores.
- Reliability: no single global sampling rule may cover every error path, because the one rare failure we need would vanish.
- Cost: volume grows with four things: how many requests arrive, how many traces we keep, how long we retain them and what fraction we sample. So design the list of things we will not collect first.

## Architecture explanation
- Tracing comes first. Spans are structured, redaction is selective, and from the edge inwards each request keeps one stable correlation ID.
- The trace collector stamps that ID on every hop's span. By default it emits structured attributes, not raw text.
- Before anything reaches durable storage, a sensitivity classifier tags the content and swaps it for a stable salted hash. Correlation still works, yet no content is kept.
- Exported traces land in a trace store with a fixed retention window. That window limits cost and protects privacy at the same time.
- The store has two separate readers. One is a global dashboard across tenants that shows only aggregates; the other is a set of tenant-scoped views for support triage.
- A support and access gateway applies role-based, tenant-scoped permissions. Looking into one customer's incident can never reveal another customer's data.
- Retention and redaction are applied at export time, by an audit and redaction pipeline. Together with code and the collector, it gives defence in depth.
- Sampling is a deliberate control. Slow traces, error traces and anomalies are kept by preference, and some exemplars are always kept.

## Data model / integration assumptions
- Records: Request holds tenant_id, user_id and prompt. ExportedTrace holds spans, result_status, query_hash, prompt_class, tenant_id and correlation_id. It keeps only bounded structured attributes and never a raw prompt.
- Content gets classified as sensitive or not before it is attached, so it is labelled before it could ever enter a trace.
- We hash with a secret key, using HMAC-SHA256 (a keyed hash), so requests can still be matched and deduplicated while their content is never stored.
- Ingestion validates telemetry attributes against a schema. Any unknown field with high cardinality is either dropped or folded into a bounded bucket.
- Each queue's serialisation contract must name trace context, the idempotency key and tenant scope. Otherwise traces break silently at every async handoff.

## Red-team risks
- Summary: sampling that throws away the only bad trace, tenant IDs with runaway cardinality, raw prompts landing in logs, trace context lost at a queue, and quality metrics that mislead
- Uniform random sampling throws away the one rare failure that mattered. The incident then has no evidence left to rebuild it from.
- A bug in the tenant-ID formatter blows up metric cardinality, and the metrics backend turns into the incident.
- Raw prompts or documents find their way into a log sink. The observability stack is now a fresh place for data to leak.
- Trace context drops at a queue boundary. Spans become orphans, and requests seem to disappear after the async handoff.
- Support tooling skimps on least privilege. One misconfigured view then covers every tenant instead of only the one being investigated.

## Rollout plan
- Week 0-1: set user-facing SLOs before anything else, and have the customer stakeholder sign off on what "good enough" means.
- Week 1-2: make "slow" and "wrong" measurable. Each definition is pinned to one percentile, one path and one outcome tag.
- Week 2-3: take one critical path and instrument all of it. Show trace propagation and redaction working on a typical request.
- Week 3-4: run automated scans to confirm that no exported trace contains a raw prompt, a document or a secret.
- Week 5: build the support workflow linked to traces, so an agent can go from an alert to the request family without help.
- Week 6-8: bring in quality and cost signals, with sampling overrides for each error class and exemplars that are always kept.
- After pilot: extend instrumentation only while trace coverage and telemetry overhead both remain inside budget.

## Evaluation plan
These thresholds are my own choices for this case, not industry standards. Expect to defend them.

| Metric | What it proves | Strong threshold | Dataset / method |
|---|---|---|---|
| Trace coverage | Telemetry contains the bad request | Enough that each complaint can be matched to a trace | Compare complaint intake against sampled traces |
| Mean time to diagnose | Support explains failures without handing them on | Drops once the support workflow ships | Incident timeline, from first report to root cause |
| Redaction pass rate | Observability has not opened a new exposure surface | No raw prompt or secret in any sink, ever | Red-team tests plus automated PII and secret scanners |
| Telemetry overhead | Production is not being skewed by instrumentation | Inside the overhead budget we agreed | Latency and cost measured with export on and off |
| Retrieval and tool success | We can see the probable causes of wrong answers | Steady, with each release's regressions caught | Dependency spans grouped by error class |
| Quality-event rate | Failures users notice are moving in the right direction | No increase after any release or config change | Escalations and bad outputs confirmed by human review |

## Weak answer
I'd add logging to every service and put a dashboard on top. This is weak because more data is not more insight. It never pins down "slow" or "wrong", no correlation ID links a complaint to a request, and the telemetry becomes a fresh privacy and cost problem in its own right.

## Average answer
I'd add distributed tracing with correlation IDs, time every hop, redact the sensitive fields and sample traces to keep cost down. Support would get a dashboard. Better, but uniform sampling may discard the very failure we are chasing. Audit access is not kept apart from debugging traces, and nothing caps the cardinality of attributes.

## Strong answer
I'd push back on the vague complaint and break it into three parts: latency, correctness and diagnosability. Then my first design choice would be what we leave out. Excluded: secrets, raw documents, full prompts and unbounded labels. Included: an outcome tag, tool results, model version and prompt-template version, retrieval evidence, timing for each hop and a stable correlation ID. Classification and salted hashing run before storage, so we keep correlation without keeping content. Sampling favours the traces that matter instead of picking at random, because the failure we were warned about is sampling that drops the one bad trace. Success is an operational test. Starting from an alert, support should land on the request family and account for the failure, with sensitive content never in view.

## Interviewer scorecard
| Area | 1 - Weak | 3 - Average | 5 - Strong |
|---|---|---|---|
| Problem framing | "Add more logs" | Talks about latency and errors | Separates slow, wrong and diagnosable, and makes each one measurable before any design |
| Requirements | "Log everything" | Asks for traces and metrics | States what is captured and what is not; lists non-goals; treats overhead as a limit |
| Architecture | Logs and a dashboard | Tracing plus correlation IDs | Classifier ahead of storage, capped retention, global views split from tenant views, an access gateway |
| Data/integration | Mentions log fields | Lists trace attributes | Bounded structured attributes, salted hashes, cardinality checked by schema, queue contracts |
| Evaluation | "We have dashboards" | Watches latency and errors | Time to diagnose, trace coverage, telemetry overhead, redaction pass rate |
| Safety/security | "We redact PII" | Redaction lives in code | Defence in depth through code, collector and review; audit kept apart from debugging traces |
| Rollout | Instruments everything | Instruments first, dashboards second | SLOs before all else, a single path, a support workflow linked to traces, sampling overrides at the end |
| Communication | Shows the dashboard | Clear but generic | Opens on the dropped-trace failure, says what stays uncollected, ends on the support test |

## Final 2-minute spoken answer
I'd hold off on picking tools. The customer tells us the AI is slow, sometimes wrong, and they can't see why. That one complaint hides three problems. Is the request slow, and at which stage? Is the answer wrong, and is retrieval or generation to blame? And could someone account for a failure without being buried under telemetry or putting customer content at risk? So my first two questions pin down the terms. For slow, I want the percentile and the path. Wrong means a bad answer, an empty one, an invented fact, or a tool error the user saw. Next I'd decide what we won't collect. By default, full prompts, raw customer documents, secrets and open-ended free-form labels are excluded. What we keep: a tag for what the user saw, tool results, model version and prompt-template version, retrieval evidence, how long each hop took, and a stable correlation ID with tenant context. Before anything is stored durably, a sensitivity classifier swaps content for a salted hash, so we keep correlation and drop the content. The trace store has a fixed retention window. It serves two readers that never mix. One is a dashboard of aggregates across all tenants. The other is support views scoped to one tenant, sitting behind a gateway that enforces least privilege. The drill I'd anchor on is sampling that loses the only bad trace. So sampling favours the traces that matter, with overrides per error class and exemplars that are always kept. The test is operational. From an alert, support can reach the precise request family and say why it failed, and nothing sensitive ever crosses their screen.
