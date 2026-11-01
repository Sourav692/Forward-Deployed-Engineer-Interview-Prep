# Stage 1: Build the MVP

## Starting State and Customer Pressure

No platform, deployed service, or prior stage exists in this workspace. Tenant A is a hypothetical procurement team. Its first Enterprise User, Alice, needs to draft a supplier email from text she supplies, then reopen the saved draft. The model cannot send the email or retrieve internal documents. The scenario and workload figures are illustrative requirements, not customer evidence or benchmarks.

## Scope and Learning Contract

| Module | Required depth | Evidence in this stage |
| --- | --- | --- |
| 1.1 Requirements and architecture methodology | D3 | Requirements, alternatives, architecture, ADR, failure experiment |
| 1.2 Estimation and capacity planning | D3 | RPS/concurrency/token/storage calculations and adjustable latency lab |
| 2.1 Networking fundamentals | D2 | DNS, TCP, TLS, HTTP path and timeout diagnosis |
| 2.2 APIs and streaming protocols | D3 | JSON contract, synchronous/SSE/WebSocket choice, runnable HTTP slice |
| 6.1 Database architecture | D2 | Schema, access paths, transactions, consistency boundary |
| 7.1 End-to-end AI application design | D3 | Authenticated request through model adapter to persisted answer |

No revisits apply. The curriculum map assigns all six modules their first teaching in Stage 1. Prerequisites: basic Python, JSON, SQL, HTTP, and command-line use. Estimated integrated study budget: 7–9 hours across reading, calculation, implementation, and failure debugging; this is an author estimate, not evidence of learner completion.

## Illustrative Requirements

- One active pilot user in Tenant A; 200 requests per eight-hour workday and a brief 0.5 requests/second peak. Tenant B exists only as a negative access-control fixture.
- Expected 1,200 input and 300 output tokens per request. Provider credentials remain server-side. Only approved, non-sensitive text may cross the provider boundary.
- Target healthy-path response latency: p95 below five seconds, to be measured in a real pilot. Provider deadline four seconds, application budget 4.5 seconds, ingress 5.5 seconds, client six seconds.
- Completed answers must commit before the API returns success. History reads use the same database. Requests are visible only to their tenant and user.
- Retain history for 30 days in the proposed pilot policy. Scheduled deletion, backups, restore, real identity integration, and real provider validation are pre-pilot work, not implemented guarantees of the lab.

## Architecture Change

Add Client request/history views, API Gateway role inside the single AI App Service ingress, Identity/Policy Service role as an in-process trusted identity adapter, SQLite Metadata DB, an in-process hosted-model adapter, and metadata-only Telemetry. These are logical roles, not separately deployed services. The executable substitutes fixture identities and a deterministic model for the external integrations. No components are retained, removed, or replaced from an earlier stage.

## Measurable Outcomes

1. Trace authentication, request insert, model call, answer commit, and history read without moving a trust boundary into model text.
2. Reproduce the 2,620 ms healthy example and 4,120 ms timeout example, and explain why neither proves p95.
3. Run the HTTP tests for persistence, tenant scope, duplicate suppression, provider timeout, and final-commit failure.
4. Defend the synchronous application and relational store against streaming, background execution, and an unstructured history store under this workload.
5. Diagnose a durable failed request and an ambiguous processing row using the documented status/metric path.

## Decision and Experiment

The revised lesson follows five phases: Understand the problem; Learn and design; Observe and experiment; Think like a Staff engineer; Validate and carry forward. It retains the existing MVP technical scope and study budget. Before formal terminology, introduce the user-visible intuition for identity/access, saved success, repeated submissions, waiting targets, and local transactions.

Add three answer-before-reveal checkpoints and a six-step request walkthrough showing input, output/state, owner, and failure. Test success, provider timeout, and final-write failure branches, navigation, Reset, and keyboard controls. Classify all six assigned modules as taught at mapped depth; mark modules 1.3, 2.3, and 13.1 as context only with their mapped first-teaching stages. Package all referenced artifacts and execute links/labs checks after clean extraction. Learner mastery remains unassessed.

Accept ADR-001 for the educational baseline: synchronous JSON completion with short SQLite transactions and an explicit model adapter. Inject provider timeout, then a database failure after generation. Neither experiment may return a completed success without a committed answer. The lab uses no network provider and performs no automatic model retries.

## Boundaries and Stop Condition

Do not implement queues, workers, retrieval, caches, autoscaling, advanced fairness, distributed transactions, GPU serving, or later lessons. Simple tenant scoping is required now; enterprise identity and isolation expansion remain later work. Stage 1 ends with the required artifacts, executed local checks, and recorded limitations. Learner exit gates remain self-assessments. Stage 2 may later inherit this architecture when long-running work motivates durable jobs.
