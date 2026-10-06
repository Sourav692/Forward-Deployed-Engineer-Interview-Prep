# Integrating a New Service into an Existing Stack + Testing Strategy (Round 1, P2)

Covers: *"Integrating a new service into an existing stack, covering deployment, data access, and validation."* Also covers the testing-strategy gap (#7).

Built from: `01_Concept_Tutorials/FDE_Handbook/08/06_Infra_And_CICD` (Terraform, GitHub Actions, health-check rollback, Secrets Manager), `01_Concept_Tutorials/FDE_Handbook/06/05` (connector registry, backfill vs. incremental, connector health), `07_Last_Day_Revision/module-14` (shadow, canary, flags, rollback, kill switch). What's new here is the **brownfield framing**: you're joining a system that already exists, has owners and can't go down.

## 1. The 30-second opening

> "In brownfield work the existing system sets the rules. Before designing anything I'd learn the contracts, owners and constraints: how services authenticate, how data is accessed, how deploys and change approvals work. Then I'd integrate the least invasive way possible: consume through existing interfaces, deploy through *their* pipeline, and validate in stages (contract tests, shadow traffic, canary) with a tested rollback before any user depends on it."

## 2. Discovery questions (ask before drawing)

| Area | Ask | Why it matters |
|---|---|---|
| Purpose | What does the new service do, and who calls it (sync user path or async)? | Sets latency, availability and coupling needs |
| Contracts | Which existing APIs, events or tables does it read or write? Who owns them? | Ownership = who approves changes |
| Identity | SSO/OIDC? Service-to-service auth (mTLS, workload identity, API keys)? | Need to plug into their IAM, not invent ours |
| Data | Source of truth? Can we read directly, or only via API? PII and residency? | Decides direct DB vs. API vs. CDC vs. replica |
| Network | VPC, private endpoints, egress allow-lists, firewall change lead time? | Often the longest lead-time item |
| Deploy | Their CI/CD, environments (dev/QA/UAT/prod), change-advisory process, freeze windows | We fit their release process |
| Ops | Observability stack, on-call, SLOs, runbook format | Who gets paged at 3 AM |
| Non-negotiables | What must not change or break? | Hard constraints for the design |

## 3. Integration pattern choices (and their trade-offs)

When a new service joins an existing system, it has to do one or more of four things: **call** existing logic, **read** existing data, **replace** part of the old system, or **protect** itself from the old system's messy design. Each need has a few options below.

### Quick glossary (terms used in this section)

- **Coupling:** how much one system depends on another's internals. High coupling means a change on their side breaks yours.
- **Latency:** how long a request takes to get a response.
- **Synchronous (sync):** the caller waits for the answer before continuing, like a phone call.
- **Asynchronous (async):** the caller sends a message and moves on; the answer or effect comes later, like an email.
- **Eventual consistency:** data in different places will match, but not instantly. There's a short window where they differ.
- **Schema:** the structure of a database: its tables, columns and types.
- **Primary database:** the main database that handles the live system's writes. Overloading it hurts everyone.
- **Domain model:** how the code represents business concepts (customer, loan, order) in clean, meaningful terms.
- **Fan-out:** one event triggers many downstream actions.

---

### Need 1: Call existing logic

#### Option A: Synchronous — Call and Wait

**What happens:** Your service asks another service a question and waits for its answer.

For example: "Is this customer eligible for a loan?" You need the answer before showing the next screen.

The call uses REST or gRPC. An API gateway checks who can call, sends the request to the right service, and limits traffic.

**Advantages:**

- Easy to follow: ask a question, get an answer.
- You can use the answer in the current user request.

**Disadvantages:**

- If the other service is slow, your user waits longer.
- If it is unavailable, this operation may fail unless you have a fallback.

**Choose this when:** The user needs the result before they can continue.

#### Option B: Asynchronous — Send and Continue

**What happens:** Your service sends a message and continues. Another service processes the message separately.

For example: "The loan was approved." Other services can then send an email or update the CRM.

A queue or event stream holds the message until it can be processed.

**Advantages:**

- Your service can continue without waiting for the other work.
- If a consumer is temporarily down, a durable queue can hold the message.
- During a traffic spike, messages can wait instead of overwhelming the consumer.

**Disadvantages:**

- The work may finish later, so you cannot assume the result is ready immediately.
- Problems are harder to trace because several services process the work at different times.

**Choose this when:** The work can happen after the current request, or several services need to react to the same event.

**Quick way to remember:**

- **Synchronous:** "I need your answer before I continue."
- **Asynchronous:** "Here's the work. I'll continue while you handle it."

---

### Need 2: Read existing data

#### Option A: Use the owning team's API (the default)
- **One-liner:** ask for data through the API the data owner already provides, instead of touching their database.
- **Pros:**
  - Respects ownership: their business rules, validation and access control still apply.
  - They can change their database freely without breaking you.
- **Cons:**
  - Rate limits may cap how much you can read.
  - The API may not expose every field you need, so you may have to request changes.
- **Choose when:** almost always. This is your starting point.

#### Option B: Read replica
- **One-liner:** a read-only copy of their database that stays in sync with the primary, so you can query it without affecting the live system.
- **Pros:**
  - Fast, flexible queries.
  - No extra load on their primary database.
- **Cons:**
  - Schema coupling: you depend on their table structure, so if they rename a column your queries break.
  - Replica lag: the copy can be seconds (sometimes minutes) behind.
- **Choose when:** you have read-heavy work like reporting or analytics, the data owner agrees, and slightly stale data is acceptable.

#### Option C: Change Data Capture (CDC) into your own store
- **One-liner:** a tool (e.g. Debezium) watches their database's change log and streams every insert, update or delete to you, so you keep your own up-to-date copy.
- **Pros:**
  - Decoupled: you query your own copy, shaped for your needs.
  - Near-real-time updates.
- **Cons:**
  - More infrastructure to run (streaming pipeline, connectors, your store).
  - When their schema changes, your pipeline must handle it (schema evolution).
- **Choose when:** you need high-volume reads, a local view of their data, or the data combined with other sources.

#### Option D: Query their primary database directly (avoid)
- **One-liner:** connect straight to their live production database and run your queries.
- **Pros:**
  - Fastest to build, with no API or pipeline needed.
- **Cons:**
  - Tightest coupling: any schema change breaks you.
  - Your queries can slow down or lock the live system for everyone.
  - Bypasses their business rules and access controls.
- **Choose when:** ❌ ideally never. If unavoidable, keep it temporary and read-only, and get the data owner's explicit sign-off.

---

### Need 3: Replace part of a legacy system

#### Strangler fig pattern
- **One-liner:** put a routing layer (API gateway or facade) in front of the old system, then move features one at a time to the new service, routing each path to the new code as it's ready, until the old system can be switched off. It's named after a vine that slowly grows around a tree and replaces it.
- **Pros:**
  - Incremental: migrate piece by piece, not in one risky big-bang cutover.
  - Reversible: if a migrated feature misbehaves, route traffic back to the old system.
- **Cons:**
  - Old and new systems run side by side for a while, so there are two things to operate and keep consistent.
- **Choose when:** modernizing a legacy system. This is the natural fit for Blitzy migrations, such as moving one COBOL or Java 8 module at a time.

---

### Need 4: Protect the new service from the legacy design

#### Anti-corruption layer (ACL)
- **One-liner:** a translation layer between your new service and the legacy system. It converts the old system's confusing formats and codes (e.g. `STAT_CD = 'X7'`) into clean concepts in your code (e.g. `LoanStatus.REJECTED`), so legacy oddities don't "corrupt" your new design.
- **Pros:**
  - Your new service keeps a clean, understandable domain model.
  - If the legacy system changes, you update only the translation layer.
- **Cons:**
  - Extra code to write and maintain.
  - The translation adds a small amount of latency.
- **Choose when:** the legacy schema or business meanings are messy, inconsistent or poorly named. That's common in mainframe and decades-old systems.

---

### Default stance (say this in the interview)

- **API first:** read and call through the owner's interfaces.
- **Events for side effects:** use async messages when you don't need an instant answer.
- **CDC for scale:** keep your own copy when you need heavy reads.
- **Never write to someone else's database:** writes go through their API so their rules stay in force.

## 4. Deployment

| Concern | Approach | Repo pointer |
|---|---|---|
| Infra | IaC (Terraform), reviewed like code; reuse their modules and naming | `01_Concept_Tutorials/FDE_Handbook/08/06` |
| Pipeline | *Their* CI/CD: build → tests → SAST/SCA → image → deploy per environment | `01_Concept_Tutorials/FDE_Handbook/08/06` |
| Secrets | Their secret manager; referenced, never baked into images | `01_Concept_Tutorials/FDE_Handbook/06/01`, `08/06` |
| Environments | dev → QA → UAT (customer sign-off) → prod; config per environment, same artifact | — |
| Release | Feature flag off by default → shadow → canary (one tenant or 5% of traffic) → ramp | `module-14` |
| Rollback | Health-check auto-rollback + flag kill switch; **rollback tested before canary** | `module-14`, `01_Concept_Tutorials/FDE_Handbook/10/04` (`rollback_tested` gate) |
| Change control | Change ticket / CAB slot; deploy outside freeze windows | See `07_Enterprise_SDLC...` |
| Observability | Join their tracing (propagate trace IDs); SLO dashboards and alerts owned by a named team | `module-15` |

## 5. Data access: security checklist

| Check | Rule |
|---|---|
| Least privilege | A service identity scoped to the exact tables, APIs and operations needed |
| Read vs. write | Start read-only; writes need idempotency keys and the owner's approval |
| PII | Mask or tokenize; residency rules decide the region |
| Multi-tenant | Tenant ID in every query and cache key (see Drill 10 in `01_`) |
| Audit | Log who accessed what; keep it separate from app logs |
| Backfill vs. incremental | Initial load is bounded and resumable; then incremental with change tokens (`01_Concept_Tutorials/FDE_Handbook/06/05`) |

## 6. Validation: staged rollout gates

| Stage | What it proves | Exit criteria |
|---|---|---|
| Contract tests (consumer-driven, e.g. Pact) | Our assumptions about their APIs hold, and their changes won't silently break us | Contracts pass in both pipelines |
| Integration tests in QA | Auth, network, data access work end to end | Green across the critical paths |
| Load test | Behaviour at peak, and with their dependency slow | p95 within budget; no pool exhaustion |
| **Shadow traffic** | Real requests, no user-facing effect, writes isolated | Diff vs. existing behaviour below threshold |
| Canary | Real users, small blast radius | Error rate and SLO match control for N days |
| Ramp → 100% | — | No SEV1/2; owner signs off |
| Post-launch | Monitoring + regression cases from incidents | Alerts owned; runbook handed over |

---

## 7. Testing strategy (closes gap #7)

### Test pyramid for a service

| Layer | Volume | Speed | What it catches | Blitzy angle |
|---|---|---|---|---|
| Unit | Many | ms | Logic bugs, edge cases (see `01_` drills) | Rule: *require-test-coverage*, meaning tests that call **real** code, not mocks of mocks |
| Integration | Some | seconds | DB, queue and API wiring; serialization | Run in Blitzy's isolated validation env |
| Contract | Per dependency | seconds | Breaking API changes between teams | *preserve-backward-compatibility* Rule |
| End-to-end | Few | minutes | Critical user journeys | Customer's existing E2E suite = acceptance |
| Non-functional | Targeted | minutes–hours | Performance, security (SAST/DAST), chaos | Perf baseline vs. legacy |

### Testing AI-generated code specifically

AI-generated code can look convincing and still be wrong. I would check it in six ways:

- **Could the logic be wrong?** I would try many valid inputs and edge cases with property-based tests, using a tool such as Hypothesis. For critical code, I would also introduce small deliberate bugs and check that the tests catch them. That is mutation testing.
- **Did the migration change what users get?** I would send the same inputs to the old and new systems, then compare their outputs. Any difference needs an explanation before we switch traffic.
- **Do the tests actually prove anything?** I would check that they call the real production code. Coverage shows what ran; a mutation score shows whether the tests notice broken behaviour. I would look at both.
- **Did we weaken security?** On every pull request, I would scan the code for security issues and leaked secrets. I would also test that users cannot take unauthorised actions or read someone else's or another tenant's data.
- **Are the failures caused by flaky tests?** I would run the tests on the baseline branch first. If a test fails there too, I would quarantine it only with sign-off and track the fix (`04_` §7).
- **Did we break an API that another team uses?** I would run contract tests and compare the old and new API definitions in continuous integration (CI).

**Trade-off to say out loud:** *"More test layers means slower PRs. I put fast unit and contract tests on every PR, and heavier E2E, load and mutation tests on merge or nightly, gated by risk tier. Payments code gets everything, an internal tool gets the basics."*

## 8. Blitzy-flavoured worked example

**Prompt:** *"A bank wants to add a new 'loan eligibility' microservice, generated with Blitzy, alongside its existing Java monolith and an Oracle DB."*

| Decision | Choice | Why |
|---|---|---|
| Integration | Strangler facade at the API gateway; the monolith keeps the old path behind a flag | Reversible, incremental |
| Data | Read customer data via the monolith's API; CDC for high-volume credit history; **no writes** to Oracle in phase 1 | Respects ownership; read-only first |
| Domain | Anti-corruption layer translating legacy codes into a clean domain | Stops legacy semantics leaking in |
| Generation | Blitzy Rules: backward-compat, test coverage, security catalog; `.blitzyignore` on the core ledger | Constrains blast radius |
| Deploy | Bank's pipeline + CAB; UAT sign-off by the credit-risk team | Fits their SDLC |
| Validate | Contract tests → shadow (the new service computes eligibility, the monolith still decides) → diff < 0.1% for 2 weeks → canary for one branch | Proves equivalence before customers depend on it |
| Rollback | Gateway route flip + flag; tested in UAT | Seconds to revert |

## 9. Ninety-second model answer

> "First I learn the existing system's rules: contracts and their owners, identity, data ownership, network constraints, and the deploy and change process. Then I pick the least invasive integration. I consume existing APIs, use events for side effects, and use CDC if I need a high-volume local view. I never write into someone else's database, and I put an anti-corruption layer in front of messy legacy models. For a modernization I'd use a strangler pattern at the gateway.
>
> I deploy through their pipeline with IaC, their secret manager and their change process, behind a flag that's off by default. Validation is staged: contract tests, integration and load tests in QA, shadow traffic with a diff against current behaviour, a canary, then a ramp. Rollback is tested before the canary. Each stage has an exit criterion and an owner who signs it off."
