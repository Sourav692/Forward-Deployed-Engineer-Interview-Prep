# Design a Reliable Workflow Orchestration System, part 9

## Coverage Notes

We scored this tutorial twice against our fixed 20-item decomposition rubric. On the second review the weak spots got smaller but did not disappear. Two still fall short: how much each workflow costs (the cost SLI and cost-per-workflow wording) and how widely the design deals with regulation and compliance. The list below marks both as Partial.

**Phase 1 — Problem Framing & Discovery**
- **Item 1 (turning a feature request into a business outcome):** Full. Section 1 opens by stating the outcome first.
- **Item 2 (who the stakeholders and personas are):** Full. Section 1 maps each stakeholder to the job they need done.
- **Item 3 (questions whose answers reshape the architecture):** Full. Section 2 lays them out as a question tree.
- **Item 4 (splitting and ranking requirements):** Full. Section 2 sorts them into must, should and could, and separates functional from nonfunctional.
- **Item 5 (a clear fence around scope):** Full. Section 2 lists the non-goals under "What the MVP Will Not Support."

**Phase 2 — Estimation & Architecture**
- **Item 6 (rough sizing of scale and capacity):** Full. Section 3 estimates workflows, activities, storage and throughput.
- **Item 7 (what drives unit cost):** Partial. Section 3 counts cost among its six SLIs, yet never works out an infrastructure figure per workflow.
- **Item 8 (the architecture and data flow from start to finish):** Full. Section 4 gives the component map, the trust boundaries and the sequence diagrams.
- **Item 9 (records and API contracts):** Full. Section 5 defines four core records and four API endpoints.
- **Item 10 (build or buy, vendor and model choice):** Absent. Section 8's follow-up drills touch on it once and move on.

**Phase 3 — Trade-offs, Security & Reliability**
- **Item 11 (named trade-offs, each with a fair verdict):** Full. Section 8 weighs four pairs.
- **Item 12 (threats and the controls against them):** Full. Section 6 sets out four security controls.
- **Item 13 (drills for failure and reliability):** Full. Section 6 runs five named drills, each with detect, contain, recover and prevent steps.
- **Item 14 (how we test it):** Full. Section 5 has a contract test for idempotency, and Section 6 injects a crash and checks the replay.

**Phase 4 — Delivery, Governance & Communication**
- **Item 15 (metrics in layers, plus observability):** Full. Section 7 builds a scorecard with six layers.
- **Item 16 (staged rollout, risks and rollback gates):** Full. Section 7 plans four phases, each with an owner, exit criteria and a rollback trigger, and adds a risk register.
- **Item 17 (depth on regulation and governance):** Partial. We handle audit evidence, retention, residency and data minimisation, but we never name an outside framework such as SOX or GDPR.
- **Item 18 (responsible AI and risks past the obvious failure):** Partial. Section 5 mentions policy checks on LLM steps in passing and leaves it there.
- **Item 19 (adoption and managing change):** Full. Section 7 covers operator training, adoption metrics and versioned migration.
- **Item 20 (a planned talk track and a way to score yourself):** Full. Section 8 gives the 50-minute plan, a scoring rubric, a 90-second summary and a practice loop.

**Overall**: Of the 20 items, 16 are full, 3 are partial (unit economics, depth on regulation and governance, responsible-AI framing) and 1 is absent (build or buy and vendor choice). The gaps follow where this design puts its weight. It goes deep on durable execution, idempotency and recovery after a crash. Cost modelling and compliance frameworks are not its subject, so we do not invent detail the design does not back up.

### My Perspective on the Gaps

*What follows is my own view, separate from the design above. It shows one way to close each gap live in an interview, using only the architecture this tutorial has already built.*

**Item 7: what each workflow costs (Partial).**
- I'd get a rough cost per workflow from parts we already have. Section 3 puts raw history at ~400GB in the base case, held as `HistoryEvent` rows (Section 5). Priced at what AWS lists for US East (checked Sep 2026), it makes a small monthly bill before replication. S3 Standard comes to about $9; gp3 block storage comes to about $32. That is small next to the "manual repair count" line the scorecard in Section 7 already shows.
- My bet is that people, not machines, drive the cost here. The formula: `cost per workflow ≈ infra marginal cost + (manual repair rate × loaded operator cost per incident)`.
- Both inputs come from SLIs we already track: compensation rate and manual repair count. So I'd say, "We already have the inputs. We just haven't multiplied them yet." No new metric is needed.

**Item 10: building, buying and picking vendors or models (Absent).**
- I'd state it plainly. The state machine, the history store and the replay engine form the durable-execution core. Managed durable-execution products already do that job well. For most teams the sensible default is to buy the execution runtime and build the workflow definitions and activities.
- Spend build effort only where we differ from everyone else. That means three things: the compensation policy for each business action (the fail-closed, degrade, queue and human-intervention table in Section 6), where each idempotency key's boundary sits (Section 5), and the saga logic for our domain, which is the `order_workflow` function itself.
- A rule worth saying out loud: buy the commodity execution layer, and let the vendor answer for keeping it durable and up. Build only the business state machine and the policy layer, because no vendor can get those right for you.

**Item 17: going deeper on regulation and governance (Partial).**
- I'd name the frameworks an interviewer is probably fishing for and pin each one to a part we already built. First, PCI-DSS. If the orchestrator would ever handle card data, push that data to the payment gateway and hold only opaque references. This matches the "keep secrets out of history" control in Section 6 and shrinks PCI scope.
- Second, SOX-style controls, if an approval counts as a financial authorisation. The `ActivityReceipt` record and the audit-log fields in Section 5 already give a SOX auditor the evidence trail they would request.
- Third, GDPR and data minimisation, if an internal system handles customer PII. We would enforce it through the retention policy that Section 5 sets on `HistoryEvent`. My framing: governance is just rules on records we already keep, not a new stream of work.

**Item 18: responsible AI, past the failure everyone expects (Partial).**
- Our design touches AI in just one place: before an LLM-driven step changes state, it must pass "typed validation and policy checks" (Section 5). I'd take that further with a concrete case. Suppose an LLM misreads or misroutes an approval. It could quietly approve something a human should have seen. That is an irreversible business effect, the same kind the failure-policy table in Section 6 already tells us to fail closed on.
- So responsible AI needs no new framework. It plugs into the decision table we already have. Treat any model output that could start a payment, finish an approval or trigger a repair as untrusted input. Route it through the same human-review lane we already keep for irreversible or ambiguous compensation.

## Key Takeaways

- State the goal as one outcome: apply each business effect of a long-running process exactly once, keep its state visible, and compensate when a step fails.
- Treat payment as the riskiest step because it cannot be reversed, so whatever else degrades, the design must still block a second payment.
- Size from 10 million active workflows and 100 million activities a day, about 1,157 activities a second on average, then plan for peaks of 3x to 10x with at least double the observed peak as headroom.
- Keep workflow state small and park documents and payloads in object storage, so 40 events of 1 KB across 10 million workflows stay near 400 GB of raw history.
- At 10x growth, 1 billion activities a day or about 11.6k a second, expect replay latency, queue hot spots, storage fan-out or cost to break before application-server CPU does.
- Split the control plane (registry, scheduler, timers, signal gateway, compensation engine, operations UI) from the data plane (queues and workers), so decisions scale apart from side effects.
- Only the durable history store owns workflow progress: queues handle delivery, workers suggest effects, and the scheduler rebuilds its view from history each time.
- When the worker dies after payment succeeds, the durable history and the completion receipt decide whether to redeliver or compensate; worker memory never does.
- Give each side-effecting action its own idempotency key (`pay:`, `crm:`, `mail:`, `refund:`) rather than one key for the whole workflow.
- Keep retry and compensation apart, because capped exponential backoff with jitter only spaces out attempts and only an explicit step such as a refund reverses a charge that already landed.
- Model the seven-day approval as a durable timer state rather than a sleep loop or a polling worker, then remind, escalate or expire it by policy.
- Fail closed on approval completion, payment authorisation and repairs, let email degrade and CRM sync queue, and partition retry and dead-letter lanes by tenant and dependency so a stuck CRM connector cannot block other tenants.
- Pin each running instance to the definition version it started with, and ship changes as a new version instead of editing executions in flight.
- Make deterministic replay and crash recovery the first rollout gate, ahead of operator visibility and migration by version.
- Prefer an orchestrated saga over choreography, because choreography lowers coupling but then nobody can point to where a run stands.

## Level calibration

On this design the levels separate on how well the answer protects one business effect stretched across days, then across teams, then across years of workflow changes.

| Level | Sounds like | Missing |
|---|---|---|
| Senior | "Append-only history records intent before execution and completion after acknowledgement, each side effect gets its own idempotency key, and the seven-day approval is a timer state. If the worker crashes after payment succeeds, replay sees the charge and moves on; it never charges again." | Retry kept separate from compensation for each step, a pinned definition version per instance, and who is authorised to repair a stuck case. |
| Staff | "Starts, signals and repairs are authorised at different strengths, and repairs go through a narrow audited API. Retry and dead-letter lanes are scoped by tenant and dependency, so a stuck CRM connector cannot block other tenants. Replay determinism and crash recovery are the first gate, then operator visibility and runbooks." | What the core engine owns versus adapters and configuration once a second workflow arrives, and whether partitions survive 10x growth without a rewrite. |
| Principal | "Buy the durable-execution runtime and build the workflow definitions, compensation policy and idempotency boundaries. Core owns state, replay and versioning; payment, email and the three internal systems sit behind adapters. I'd size partitions for the 10x case of 100 million active workflows and about 11.6k activities a second." | The customer's real share of week-long waits and the loaded operator cost per repair, which decide whether history retention or manual repair dominates cost per workflow. |

## Sources (checked 27 Sep 2026)

- [IETF draft-ietf-httpapi-idempotency-key-header-07](https://www.ietf.org/archive/id/draft-ietf-httpapi-idempotency-key-header-07.html) — 400 for a missing key, 409 while the first request is in flight, 422 for a reused key with a different payload
- [Datatracker: Idempotency-Key header draft status](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/) — expired Internet-Draft, not an RFC
- [Stripe API: Idempotent requests](https://docs.stripe.com/api/idempotent_requests) — provider-side idempotency keys; keys can be pruned after 24 hours
- [AWS Architecture Blog: Exponential Backoff and Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/) — capped exponential backoff with jitter
- [AWS Price List API: Amazon S3, us-east-1](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonS3/current/us-east-1/index.json) — S3 Standard at $0.023 per GB-month
- [Amazon EBS pricing](https://aws.amazon.com/ebs/pricing/) — gp3 at $0.08 per GB-month in US East
- [PCI SSC: PCI DSS Tokenization Guidelines](https://listings.pcisecuritystandards.org/documents/Tokenization_Guidelines_Info_Supplement.pdf) — tokenisation can reduce PCI DSS scope; tokens that can start a transaction may stay in scope
- [GDPR Article 5 (EUR-Lex)](https://eur-lex.europa.eu/eli/reg/2016/679/oj) — data minimisation and storage limitation principles
