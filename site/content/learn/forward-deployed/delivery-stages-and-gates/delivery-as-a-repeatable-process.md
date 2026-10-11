# Delivery as a Repeatable Process

*Working faster can rescue one engagement, but two weeks is only repeatable when most of each stage already exists before the customer arrives.*

"Take a customer from scoping doc to deployed AI agent in under two weeks" is not a scheduling question. It asks for the assembly line that produces the agent, and speed must come out of reuse and hard gates, not out of corners cut under deadline.

**Objectives:**

- restate the two-week delivery problem as an operating-model design question;
- lay out the seven stages, their day ranges and the fact that must be true to leave each;
- explain why intake refuses rather than warns, and how the accelerator library makes two weeks achievable.

---

## Design the Assembly Line, Not the Agent

The prompt comes from the DevRev interview preparation guide: design a delivery framework that takes a customer from a scoping doc to a deployed AI agent in under two weeks. In plain terms, a new customer arrives on day 0 with a rough page of what they want. By day 14 a real agent must be live in production for them. And it must get there the same reliable way every time, not through a fresh round of heroics per customer.

This is a process and operating-model problem, not a software architecture problem. The instinct "there is nothing to build, it is a process diagram" is wrong. The prep guide asks for an answer as a system with inputs, stages, artefacts, gates and metrics. A system with stages and gates is a state machine, and a state machine is code. The repository's delivery framework treats it with the same discipline as the RAG and agent-platform designs.

## Make Speed a Side Effect of Reuse

"Work faster" is the trap. So is "hire more people". Two weeks is possible only if most of the work existed before the customer showed up. If every engagement writes connectors, prompt templates and guardrail policies from a blank page, two weeks is a wish, not a schedule.

So the real test is whether speed can be a side effect of reuse and hard gates. Every good answer stacks two questions. First, how is two weeks achievable for a different customer each time? Through a library of reusable assets, such as connectors, prompt templates, tool definitions and guardrail policies, that most of each stage is assembled from. Second, how is each stage known to be safe to leave, not merely finished on time? Through gates: named, checkable conditions signed off by the right role, never by the person closest to the work approving their own progress.

A weak answer draws seven boxes, scoping to data to build to test to launch, and stops. That is a checklist, and checklists get skipped under deadline pressure. A strong answer spends its time on what is reused versus bespoke at each stage, and on the checkable fact that must hold before the next stage may start.

## Walk the Fourteen Days

| Days | Stage | What must be true to leave it |
|---|---|---|
| 1–2 | Scoping and qualification | Success metrics are written down and measurable; a named customer SME is assigned; the security review has started. Without a measurable metric or an SME, the engagement does not start |
| 3–4 | Data readiness | Sources are connected; access is live and verified, not merely requested |
| 5–7 | Configure, do not code | The agent is assembled from the accelerator library and configured for this customer; reuse versus bespoke is decided here |
| 8–9 | Evaluate and iterate | A golden set exists, the customer's SME has signed off that it is representative, and the measured baseline clears the bar |
| 10–11 | Shadow mode | The agent sees real traffic and decides what it would do, but takes no action; humans compare its answers with their own |
| 12–13 | Limited production | The agent acts for real with a human approving each action, and a rollback path has been tested, not just documented |
| 14 | Go/no-go and handover | The metric written on day 1 was met; only then are a runbook, dashboards and a named owner handed over |

The order is not optional. Each stage feeds the next. Configuration cannot use data that is not connected. Evaluation cannot use a golden set nobody signed off. Limited production cannot start without a tested way to undo it.

Shadow mode and limited production form a two-step trust ladder. Shadow mode watches and decides without acting; limited production acts with a human approving. Both exist for one reason: a system's first real action should never also be the first time nobody is watching.

## Refuse at Intake Rather Than Start a Bad Clock

Intake checks three things: measurable success metrics, an assigned SME and named data sources. If any check fails, intake refuses outright. No engagement record is created and no clock starts.

```mermaid
flowchart TB
    REQ(["Scoping request: customer, success metrics, data sources, SME"])
    INTAKE{"Intake validation: measurable metrics? SME assigned? Data sources named?"}
    REFUSE(["Refused: no engagement created, no clock started"])
    ENG[("Engagement: stage, day, gates, artefacts, pulls, escalations, events")]
    PIPE["Seven-stage pipeline, each transition checked against its gates"]
    METRICS["Metrics: time-to-value, eval score, override rate, reuse rate"]
    TRACE["Event log: every gate decision and stage move, replayable"]
    DEPLOY(["Deployed: runbook, dashboards and owner handed over"])
    REQ --> INTAKE
    INTAKE -- fails --> REFUSE
    INTAKE -- passes --> ENG
    ENG --> PIPE --> DEPLOY
    PIPE -.every transition.-> TRACE
    ENG -.queried any time.-> METRICS
```

A two-week clock started against a goal nobody can measure is worse than no clock at all. It is the delivery equivalent of refusing to index a document that has no usable access-control list. The engagement record is the single piece of state threaded through every stage. Metrics are computed from its history on demand, and the event log records every gate attempt, stage move, escalation and asset pull, allowed or denied.

> **Warning: a warning at intake becomes a two-week argument at go/no-go.** If the success metric cannot be measured on day 1, it cannot be judged met on day 14. Refuse, and say which input is missing.

## Pull From the Library Before Building

Every stage's real work is "get this asset", not "invent it". When a stage needs a connector, prompt template, evaluation harness, guardrail or dashboard, it checks the accelerator library first.

```mermaid
flowchart LR
    STAGE["A stage needs an asset: connector, prompt template, eval harness, guardrail, dashboard"]
    LIB{"In the accelerator library?"}
    REUSE["Pull it: reused"]
    BUILD["Build it custom: not reused, logged"]
    RATE["Reuse rate: productised or bespoke?"]
    STAGE --> LIB
    LIB -- yes --> REUSE --> RATE
    LIB -- no --> BUILD --> RATE
```

Pulling is the normal case. It costs nothing extra. Building custom is the exception, and each one is logged, because a rising count of custom builds is the early signal that two weeks is about to slip. The reuse rate, reused pulls over total pulls, turns "we mostly reuse the library" from a claim into a number.

## Worked Example: The Northwind Logistics Engagement

Northwind Logistics wants a tier-1 support triage agent over Zendesk, Confluence and Salesforce. At intake, two success metrics are agreed in writing. The first is first-response time under 5 minutes on the top three ticket categories. The second is zero-edit sends on 60% of eligible tickets by week 4. Both can be measured from ticket timestamps and edit history, so intake accepts.

Days 1–2 assign the SME and start the security review. Days 3–4 connect the three systems. Days 5–7 pull five of the six needed assets from the library; one guardrail policy is built custom, giving a reuse rate of 83%. Days 8–9 build and sign off the golden set and measure the baseline. Days 10–11 run in shadow. Days 12–13 act with approval and a tested rollback. Day 14 checks the two metrics against the numbers written on day 1.

The schedule held because almost everything was assembled. Every stage boundary was a fact. None was a date.

---

## Key Takeaways

- The two-week prompt is an operating-model question: design the assembly line, not the agent.
- Speed is a side effect of a reusable accelerator library and hard, role-gated checkpoints.
- Seven stages in a fixed order, each left only when a checkable fact holds; shadow mode and limited production form a trust ladder.
- Intake refuses unmeasurable, SME-less or source-less requests before any clock starts.
- Track the reuse rate; a rising custom-build count is the early sign the date will slip.

## Check Yourself

1. **Why is "work faster" the trap in the two-week prompt?**
   Two weeks is repeatable only if most of each stage already exists in a reusable library. Working faster depends on heroics and fails on the next customer.

2. **What is the difference between shadow mode and limited production?**
   Shadow mode sees real traffic and decides without acting, while humans compare. Limited production acts for real, with a human approving and a tested rollback.

3. **Why does intake refuse rather than warn?**
   A clock started against an unmeasurable goal cannot reach a meaningful go/no-go. Refusing on day 0 is cheaper than discovering it on day 14.

