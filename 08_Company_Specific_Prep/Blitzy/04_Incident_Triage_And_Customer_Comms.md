# Intermittent Failure Triage + Customer Comms (Round 1, P1)

Covers: *"A service is failing intermittently. How would you triage it, what would you check first, and how would you keep the customer informed?"*

Built from: `07_Last_Day_Revision/module-12` (reliability patterns), `module-15` (observability), `02_System_Design_Case_Studies/Scenario_Packs_G01_G20/G14` (diagnosis order), `05_PRODUCTION_DEBUGGING.../03_latency_spike.md` (compounded-change incident). What's new here is the **generic, non-LLM triage order** and the **customer comms layer**, which the repo didn't cover.

## 1. The 30-second opening (say this first)

> "First I'd stabilise and scope. Who's affected, since when, and what changed. I'd mitigate before I root-cause: if a recent change lines up, roll it back. In parallel, I'd send the customer an acknowledgement within 15 minutes and then updates on a fixed cadence, even when there's nothing new. Once it's stable, we find the root cause and turn it into a regression test or alert."

**Principle:** *Mitigate first, diagnose second, learn third. Communicate throughout.*

## 2. Triage order: what to check first

| # | Question | How to check | What the answer tells you |
|---|---|---|---|
| 1 | **What exactly is failing, and how is it measured?** | Error rate, which status codes (5xx vs 4xx vs timeouts), p95/p99, which endpoint | Turns "intermittent" into a number. 2% of requests ≠ 2% of users |
| 2 | **What changed?** | Deploys, config/flag changes, dependency versions, infra changes, cert/secret rotation, traffic shape | Most incidents follow a change. If one lines up, **roll back first** and ask questions later |
| 3 | **Who is affected: everyone, or a slice?** | Split by tenant, region, host/pod, AZ, version, client, request size | One host → bad node or config drift. One tenant → their data, config or quota. One version → bad deploy. One region → infra or provider |
| 4 | **Is there a time pattern?** | Overlay with traffic peaks, cron/batch jobs, GC, autoscaling events, cert expiry | Peak-only → capacity or pool exhaustion. Periodic → cron or batch contention. Increasing → leak |
| 5 | **Is it us or a dependency?** | Trace spans: compare per-stage latency and errors to baseline | Points at the DB, a downstream API, DNS, LB, or the model provider |
| 6 | **Is a resource running out?** | Connection pools, threads, file descriptors, memory, disk, queue depth, rate-limit headers (429) | Explains the classic "works most of the time" failure |
| 7 | **Is the system amplifying it?** | Retry counts per layer, breaker state, queue backlog growth | Retry storms turn a blip into an outage |

## 3. Intermittent-failure pattern library

| Symptom | Likely cause | Confirm by | Mitigation |
|---|---|---|---|
| Errors only at peak | Connection/thread pool exhaustion, DB connection limit | Pool wait time, active vs max connections | Raise the pool (within the DB limit), shed load, add a queue |
| Errors on ~1 in N requests | One bad host or pod behind the LB | Errors grouped by instance | Drain or cordon the node; fix the health check so it catches this |
| Timeouts that grow over hours | Memory/FD leak, GC pauses | Memory or FD trend since the last deploy, GC logs | Rolling restart (buys time), then fix the leak |
| Random 502/504 | LB idle timeout shorter than keep-alive, upstream timeout mismatch | LB vs app timeout config | Align the timeouts |
| Failures after a fixed time window | Token, cert or credential expiry; DNS TTL/caching | Expiry timestamps, DNS resolution logs | Rotate; automate renewal and add an alert |
| Only large requests fail | Payload limits, context or token limits, slow queries on big tenants | Error rate split by request size | Cap/stream/paginate; per-tenant limits |
| 429s from a dependency | Upstream rate limit, noisy neighbour | Rate-limit headers, per-tenant volume | Backoff + jitter, per-tenant quotas, cache |
| Failure after a "small" change that passed canary | Compounded changes; canary missed peak load (repo incident #3: p95 22s) | Per-stage span comparison against baseline | Roll back the newest change; add a load-test gate |
| Duplicate side effects after the incident | Retries without idempotency | Duplicate action IDs | Idempotency keys + reconciliation (`module-12`) |

## 4. Mitigation ladder (fastest and safest first)

| Rung | Action | Trade-off |
|---|---|---|
| 1 | Roll back the recent change / turn off the feature flag | Fast and reversible; loses the new feature |
| 2 | Drain bad nodes, shift traffic to a healthy region | Less capacity |
| 3 | Shed load / rate-limit non-critical traffic | Some users degraded on purpose |
| 4 | Graceful degradation: serve cached or partial results, disable non-critical features | Must be **honest** in the UI; never claim success you don't have |
| 5 | Scale out | Doesn't fix leaks or downstream limits, and can make a struggling DB worse |
| 6 | Hotfix forward | Only if rollback is impossible; it's riskier |

## 5. Severity matrix (agree with the customer before the first incident)

| Sev | Definition | Ack | Update cadence | Who's involved |
|---|---|---|---|---|
| SEV1 | Production down or data/security exposure; no workaround | 15 min | Every 30 min | Incident commander, eng lead, customer exec sponsor, our leadership |
| SEV2 | Major function degraded; workaround exists | 30 min | Every 1–2 h | IC, eng owner, customer tech lead |
| SEV3 | Minor or intermittent impact, small user set | 4 h | Daily | Eng owner, customer point of contact |
| SEV4 | Cosmetic or a question | 1 business day | On resolution | Support |

Upgrade the severity early and downgrade later. Underestimating it costs more trust than overreacting.

## 6. Customer communication: cadence and templates

### Roles during an incident

| Role | Owns |
|---|---|
| Incident commander (IC) | Decisions, coordination; doesn't debug |
| Tech lead | Diagnosis and mitigation |
| **Comms lead (often the FDE)** | Every customer-facing message; a single voice |
| Scribe | Timeline, for the RCA |

### Message templates

**Initial ack (≤15 min, SEV1):**
> **[SEV1] Intermittent failures on <service> — investigating.**
> Impact: ~X% of <requests/jobs> failing since <time UTC>; <who> affected.
> What we know: <one fact>. What we're doing: <action>.
> Workaround: <if any>. Next update: <time>, even if there's no change.

**Update:**
> **Status: Mitigating.** Since the last update: <what changed>. Current impact: <X% → Y%>.
> Hypothesis: <cause>, confidence <low/med/high>. Next step: <action>. Next update: <time>.

**Resolved:**
> **Resolved at <time>.** Impact window: <start–end>, <N> requests/users affected.
> Mitigation: <rollback/fix>. Root cause: <preliminary>. Full RCA by <date, ≤5 business days>.
> Any data impact: <none / details + remediation>.

### RCA (blameless) structure

| Section | Content |
|---|---|
| Summary | 3 lines: what, impact, duration |
| Timeline | Detection → ack → mitigation → resolution (UTC) |
| Root cause + contributing factors | Technical cause + why the safeguards didn't catch it |
| What went well / badly | Including detection time and comms |
| Action items | Each with an **owner and a date**: regression test, alert, gate, runbook update |

### Comms rules

| Do | Don't |
|---|---|
| Lead with impact on *their* users | Lead with internal component names |
| Give a next-update time and keep to it | Go silent while debugging |
| Say "we don't know yet" with a time for the next update | Guess a root cause, then retract it |
| Give confidence levels on hypotheses | Promise an ETA you can't control |
| Tell the exec sponsor proactively for SEV1 | Let the CTO hear about it from their own engineers first |
| Own it ("we") even if a third party caused it | Blame the vendor or model provider publicly |

## 7. Blitzy-flavoured worked example

**Scenario:** *"A customer reports that Blitzy code-generation jobs fail intermittently in their environment. About 1 in 5 runs fail validation, and their pilot review with the CTO is on Friday."*

| Step | What you do |
|---|---|
| Scope | Which repos or branches fail, which stage (onboarding, spec, AAP, generation, validation), and since when. Is it 1 in 5 *runs* or 1 in 5 *repos*? |
| What changed | Customer side: new private package version, rotated secrets, CI runner image change, new branch protection. Blitzy side: platform release, Rule changes |
| Slice | Do failures cluster on one repo, one build step, one environment config, or one time window (their CI busy at peak)? |
| Likely culprits | Expired or rotated credentials for private registries; flaky tests in *their* suite (which fail on the baseline too); env drift between Blitzy's isolated env and their CI; network allow-list changes; resource limits in the validation env |
| Key check | **Run the same validation on the baseline branch without Blitzy's changes.** If the baseline also fails 1 in 5, the problem is flaky tests or env, not generated code. This one experiment separates "our bug" from "their environment" |
| Mitigate | Quarantine flaky tests (with their approval), pin dependency versions, re-sync secrets, rerun the affected jobs |
| Comms | Same-day note to their tech lead with the impact, the baseline experiment and its result, and the plan. Tell the CTO **before Friday**: "Here's what happened, what we found, and what we changed so it won't recur." Arriving with the RCA builds more trust than a flawless demo would |
| Prevent | Environment health check before each job (deps resolve, secrets valid, baseline tests green); flaky-test detection as part of onboarding |

**Trade-off to name out loud:** quarantining flaky tests unblocks the pilot but reduces validation coverage. Do it only with the customer's explicit sign-off, keep a list of what was quarantined, and set a date to restore those tests.

## 8. Ninety-second model answer

> "I'd start by making 'intermittent' measurable: what percentage, which endpoints, which error types. Then two questions in parallel: what changed, and who's affected. If a deploy or config change lines up, I roll back first. Then I slice the failures by host, tenant, region and version, because intermittent almost always means *some* path is failing consistently. From there I check resource exhaustion (pools, FDs, memory, rate limits) and whether retries are amplifying the problem.
>
> Customer side: an ack within 15 minutes with impact and a next-update time, then updates on that cadence even when nothing's changed, one voice from our side, and a proactive call to the exec sponsor for a SEV1. Afterwards, a blameless RCA within five days, where every action item has an owner and a date. Usually that's a regression test, a new alert, or a gate that would have caught the issue."
