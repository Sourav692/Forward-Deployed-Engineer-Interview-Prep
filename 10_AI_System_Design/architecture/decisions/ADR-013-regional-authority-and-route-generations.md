# ADR-013: Regional Authority Quorum, Cell Route Generations and Dual-Run Economics

Status: accepted educational architecture, not production approval. Stages: 11 and 12. Date: 2026-11-02. Amends: [ADR-011](ADR-011-residency-aware-regional-cells.md) (where authority lives and how a lost writer is fenced) and ADR-012, Versioned Regional Platform Contracts (route authority placement and the economics section). Both decisions otherwise remain in force.

## Situation

A review of Stages 11 and 12 found three gaps in the accepted decisions.

- ADR-011 places Tenant A/B runtime and authority in the EU-primary cell, but does not say where policy, membership and writer ownership live once EU-primary is lost, or how the old writer is stopped. Network reachability was the only implied fence.
- ADR-012 adds a shared control plane and a route authority above the cells, but does not say where route records live, how a committed generation reaches a cell, or what a cell does when the control plane is down.
- ADR-012's economics credit the full monthly saving from month 1, although the same stage migrates cohorts with a strangler pattern in which old and new paths run together.

## Decision

**Residency enforced at the endpoint.** Each residency has its own hostname. The EU host resolves only to EU ingress, and its TLS certificate and key exist only in EU ingress. After sign-in, the trusted placement directory binds a tenant to its host, so a Tenant A or B user reaches EU ingress wherever they are. An ingress that receives a tenant not placed there rejects the request before reading its body. DNS chooses only among ingress points inside one residency, for example EU-primary and EU-secondary. Client location never decides where an A/B request body is decrypted.

**Authority store per tenant region.** Tenant A/B policy, membership, model approval, alias, deletion tombstone, source-version and writer-ownership records live in an EU-only authority store. It is consensus-replicated across EU-primary, EU-secondary and a small EU witness location that holds votes, not content. Losing EU-primary leaves 2 of 3 voters in the EU. Tenant C has the same arrangement in its US-home cell. No authority record leaves its tenant's region. Bulk tenant data, indexes and caches keep asynchronous replication and are rebuilt from authority, never the reverse. The global control plane holds opaque placement and signed route generations that refer to opaque tenant, app and profile IDs. It holds no customer content, policy or membership, and it is never authority.

**Fencing by lease and epoch.** Writer ownership is a lease granted by that quorum, with an epoch that increases on every grant. Promotion runs in this order:

1. Wait until the old lease has expired plus a clock-drift margin. A correct old writer stops acknowledging writes at its own lease expiry.
2. The quorum grants the new lease, epoch 8.
3. The new writer installs epoch 8 as the minimum accepted epoch in every store it will use (the surviving region's database, object store, job workers and the Model Gateway's billable-usage write path), then confirms that each one refuses a probe write carrying epoch 7.
4. The isolated region's own stores are not probed, because they cannot be reached. They are quarantined: nothing they accept after isolation becomes authority, and failback rebuilds them from the new authority.

Reachability or a health check never counts as fencing. If the quorum is lost, the cell fails closed: no promotion, no protected disclosure, and authority is reported unavailable even when the recovery-time objective is missed.

**Loss bound for a live, partitioned writer.** The old writer may keep acknowledging writes until its lease expires. The bound on lost acknowledged writes is therefore last renewal + lease duration − replication watermark, not one renewal interval. With a renewal at 10:00:40, a 20 s lease and a watermark of 10:00:25, the bound is 35 s, inside the 60 s recovery-point objective.

**Route generations in each cell.** Each app's current and previous route generation is a record in its cell's authority store. The global control plane validates manifests and publishes signed, versioned generations. Before applying one, a cell verifies the signature, rejects unsigned or older generations, and checks current eligibility (approval, residency and policy) in its own authority store. It then switches with a compare-and-set on the current generation, so no request is served under a mix. Each cell keeps the last verified generation as last-known-good, with an illustrative 15-minute staleness bound before it alerts. Platform releases roll out one cell at a time from a canary cell.

**Control-plane outage and rollback reconciliation.** Cells keep serving last-known-good and new cutovers freeze. Emergency rollback stays possible: it writes a new local generation, N+2, carrying generation N's route, with actor, reason and audit, and still requires current eligibility. Because a cell never applies a generation lower than its current one, the failed N+1 cannot be re-applied on reconnect. On reconnect the cell reports N+2, the control plane marks N+1 as rolled back for that cell, and its next publication must carry a generation above every reported cell generation.

**Economics with dual-run overlap.** While cohorts migrate, the duplicated app work ($12,000 a month) and the platform ($8,000 a month) both run. At the Stage 12 illustrative inputs and a six-month overlap, up-front cost is $60,000 + 6 × $8,000 = $108,000, break-even is month 33, and the three-year saving is $12,000. Break-even month = 15 + 3 × overlap months, and each overlap month removes $12,000 of three-year saving, so a seven-month overlap erases it. This replaces ADR-012's 15 months and $84,000, which hold only if old paths stop on day one.

## Consequences

- A third EU location is now required for authority votes. It stores no tenant content, but it is another site to operate, secure and keep reachable.
- Every authority write, including each deletion tombstone, pays quorum latency. Bulk tenant data keeps asynchronous replication; only the small authority class is consensus-replicated.
- Users must reach their residency hostname. A misconfigured client sent to the wrong host gets a rejection, not service.
- Recovery can miss its time objective when the quorum is lost. That outcome is accepted over serving from an unverified authority.
- The platform business case now depends on how fast cohorts migrate. Overlap months are a tracked cost, not a footnote.

## Guarantees and Non-Guarantees

The Stage 11 lab checks attempt-scoped usage evidence and a promotion gate that blocks on supplied facts: quorum, lease, epoch rejection, residency, capacity and recovery time. The Stage 12 lab checks append-only shadow evidence bound to its baseline generation, generation-checked cutover and rollback, and rollback history. Neither lab runs a consensus protocol, installs or probes real epochs, measures clock drift, deploys a witness, signs artifacts, resolves DNS or integrates with production identity. Lease timings and the staleness bound are illustrative.

## Revisit Trigger

Revisit if a regulator forbids the witness location, if quorum latency breaks a stated budget, if measured overlap exceeds seven months, or if a cell needs route changes during a control-plane outage beyond rollback.
