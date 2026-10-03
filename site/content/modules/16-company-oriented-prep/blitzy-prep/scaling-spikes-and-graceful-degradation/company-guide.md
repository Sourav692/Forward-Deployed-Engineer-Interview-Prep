# Traffic Spikes & Graceful Degradation: One-Pager (Round 1)

Covers: *"A quick question on handling sudden traffic spikes and graceful degradation."*
Built from: `Last_Day_Prep/module-09` (MEASURE → LIMIT → ADMIT → QUEUE → SCALE → BACKPRESSURE → SHED), `module-12` (breakers, capability-specific degradation), `Study_Guides/12` §1.9 + the degradation vs. hard-failure trade-off.

## The 2-minute answer (memorize)

> "First, what kind of spike: a predictable peak, a viral burst, one noisy tenant, or a retry storm we caused ourselves? Each needs a different response.
>
> **Prevent:** per-tenant rate limits and quotas at the gateway, so one customer can't take everyone down. **Absorb:** put spiky, non-interactive work behind a bounded queue, and cache hot reads. **Scale:** autoscale stateless workers on the signal that reflects the bottleneck (queue age, concurrency), not CPU. And remember that scaling workers doesn't help if the real limit is the database, a downstream API or a model quota.
>
> **When demand still exceeds capacity, degrade on purpose.** Admission control rejects or defers low-priority work early with a clear 429 or 'queued' status. Priority tiers keep critical paths alive. Non-critical features (recommendations, analytics) switch off behind flags, and cached or partial results are **labelled as degraded**. Circuit breakers stop us hammering a failing dependency, and retries use backoff with jitter and a shared budget so we don't amplify the spike.
>
> The rule: *degrade gracefully in front of a human, fail loudly in front of a machine*, and never fake success on an action like a payment."

## Spike type → first response

| Spike | Signal | First move |
|---|---|---|
| Predictable peak (month-end, launch) | Calendar, history | Pre-scale; warm caches; freeze risky deploys |
| Organic burst | Request rate ↑ across tenants | Autoscale + queue + admission control |
| Noisy neighbour | One tenant dominates | Per-tenant quota / fair scheduling |
| Retry storm (self-inflicted) | Retry count ↑, error-rate feedback loop | Breakers, retry budget, backoff + jitter |
| Abuse / bot | Odd patterns, a single source | WAF, rate-limit by key or IP |

## The layered toolkit

Think of the toolkit as layers a request passes through, from the outside in. Each layer handles a spike in a different way, and each has a cost.

### Quick glossary (terms used in this section)

- **Tenant:** one customer organisation on a shared platform.
- **Throttle:** deliberately slow down or limit someone's requests.
- **429:** the HTTP status code for "Too Many Requests."
- **`Retry-After`:** a response header telling the client how many seconds to wait before trying again.
- **Idempotent:** doing the same request twice has the same effect as doing it once, so it's safe to repeat or cache.
- **Stateless worker:** a server that keeps no memory between requests, so any copy can handle any request and you can add more copies freely.
- **Downstream:** a service *you* call, such as a database, another API, or a model provider.
- **Bottleneck:** the one component whose limit caps the whole system's throughput.

---

### Layer 1: Edge (the outermost door)
- **One-liner:** stop or slow traffic before it reaches your servers, using a **CDN** (caches static content close to users), a **WAF** (web application firewall that blocks malicious traffic), and **gateway rate limits** (e.g. a *token bucket*: each tenant gets N requests per second, with a small burst allowance).
- **Pros:**
  - Cheapest place to stop excess or abusive traffic.
  - Per-tenant limits stop one customer from hurting everyone else.
- **Cons:**
  - Legitimate bursts, like a real customer's busy hour, may get throttled too.
- **Use when:** always. This is your first line of defence.

### Layer 2: Admission control
- **One-liner:** before accepting work, check whether the system has capacity *right now*. If not, reject immediately with a 429 and a `Retry-After` header instead of accepting work you can't finish.
- **Pros:**
  - Rejection is fast and clear, which is better than accepting everything and timing out for everyone.
  - Protects the work already in progress.
- **Cons:**
  - Some users are turned away, though quickly and with a clear message.
- **Use when:** capacity is limited and slow failures would be worse than fast rejections.

### Layer 3: Buffer (bounded queue + backpressure)
- **One-liner:** put incoming work in a queue with a **maximum size** (bounded). When it's full, **backpressure** tells the sender to slow down or stop.
- **Pros:**
  - Smooths short spikes: workers process at a steady rate while the queue absorbs the burst.
- **Cons:**
  - Requests wait longer, so latency goes up.
  - A queue does **not** fix *sustained* overload. If work arrives faster than you process it for a long time, the queue just grows.
- **Use when:** work doesn't need an instant answer (background jobs, batch processing, code generation).

### Layer 4: Cache
- **One-liner:** keep copies of frequently requested results so repeat requests don't hit the backend. **Stale-while-revalidate** means you serve the slightly old copy immediately while fetching a fresh one in the background.
- **Pros:**
  - Removes a big share of load for read-heavy traffic.
  - Very fast responses.
- **Cons:**
  - Staleness: users may see data that's slightly out of date.
- **Use when:** the same reads repeat often and slightly old data is acceptable.

### Layer 5: Scale out
- **One-liner:** add more copies of your **stateless workers** automatically (autoscaling). Trigger scaling on signals that reflect real pressure, like queue age or number of requests in progress, not just CPU usage.
- **Pros:**
  - Adds real capacity when *your* servers are the bottleneck.
- **Cons:**
  - New capacity takes minutes to come online, so it can't absorb a spike that arrives in seconds.
  - **Useless if the bottleneck is downstream.** More workers in front of a maxed-out database or model quota just make things worse.
- **Use when:** your own compute is the constraint.

### Layer 6: Protect dependencies
- **One-liner:** stop a struggling downstream service from dragging you down. A **circuit breaker** stops calling a failing service for a while and fails fast instead. **Bulkheads** give each dependency its own separate pool of connections or threads, so one slow dependency can't use up resources the others need. (The name comes from a ship's watertight compartments.)
- **Pros:**
  - Contains the damage to the one feature that depends on the failing service.
  - Gives the struggling service room to recover.
- **Cons:**
  - Users of the affected feature get fast failures until it recovers.
- **Use when:** you call external or shared services that can slow down or fail.

### Layer 7: Degrade gracefully
- **One-liner:** deliberately offer a reduced but still useful service: keep high-priority features running (priority tiers), switch off non-essential ones with feature flags, serve cached or partial results, or use a lighter, faster model.
- **Pros:**
  - The core experience survives the spike.
- **Cons:**
  - Lower quality, so it must be **clearly labelled** to the user. Never pretend a degraded result is complete.
- **Use when:** demand still exceeds capacity after the earlier layers.

### Layer 8: Load shedding (last resort)
- **One-liner:** intentionally drop the lowest-priority work so the important work survives.
- **Pros:**
  - Keeps the system alive for critical users and actions.
- **Cons:**
  - Work is lost, so you need a priority policy **agreed in advance** with the business, not invented mid-incident.
- **Use when:** everything else is exhausted and the alternative is a full outage.

---

### How to say it in one breath
> "Limit at the edge, admit only what we can handle, queue what can wait, cache what repeats, scale where the bottleneck really is, isolate failing dependencies, degrade visibly, and shed the lowest-priority work last."

## Degradation ladder (decide before the incident)

| Level | What turns off | Example (Blitzy-like platform) |
|---|---|---|
| 0 Normal | — | All features |
| 1 Brownout | Non-critical extras | Pause codebase chat and analytics dashboards |
| 2 Defer | Async / batch work | Queue new generation jobs with an honest ETA; in-flight jobs continue |
| 3 Protect core | Only critical paths | Serve existing PRs, specs and auth; reject new onboarding with "retry later" |
| 4 Read-only | All writes | Viewing works; no new jobs |

**What must never degrade silently:** payments, auth decisions, data writes, security checks. These fail closed and say so.

## Numbers to reason with (if asked)

| Formula | Use |
|---|---|
| Concurrency ≈ arrival rate × time in system (Little's law) | 200 req/s × 0.5 s = 100 in flight → size pools and workers |
| Headroom target ~30–50% at normal peak | Covers the autoscale lag |
| Queue max wait < user tolerance | If the oldest item is older than the SLA, shed instead of queuing |

## Blitzy angle (one sentence to add)

> "For long-running generation jobs, a spike is really a **fair-scheduling** problem: per-customer concurrency caps, queues with honest ETAs, and model-provider quotas as the real ceiling. I'd protect in-flight jobs first, because they're paid-for, uncancellable work."

## Pitfalls interviewers listen for

| Weak | Strong |
|---|---|
| "Just autoscale" | Find the real bottleneck first; scaling workers in front of a fixed DB or quota does nothing |
| "Add a queue" | A bounded queue + backpressure + max wait; it doesn't fix sustained overload |
| "Retry failed requests" | A retry budget, backoff + jitter, breakers, so retries don't become the spike |
| Serving cached data quietly | A labelled degraded response; no fake success on actions |
| Same treatment for all traffic | Priority tiers and per-tenant fairness |
