# ADR-013: Regional Authority Quorum, Cell Route Generations and Dual-Run Economics

Status: accepted educational architecture, not production approval. Stages: 11 and 12. Date: 2026-11-02. Amends: [ADR-011](ADR-011-residency-aware-regional-cells.md) (where authority lives and how a lost writer is fenced) and ADR-012, Versioned Regional Platform Contracts (route authority placement and the economics section). Both decisions otherwise remain in force.

## Situation

A review of Stages 11 and 12 found three gaps in the accepted decisions.

- ADR-011 places Tenant A/B runtime and authority in the EU-primary cell, but does not say where policy, membership and writer ownership live once EU-primary is lost, or how the old writer is stopped. Network reachability was the only implied fence.
- ADR-012 adds a shared control plane and a route authority above the cells, but does not say where route records live, how a committed generation reaches a cell, or what a cell does when the control plane is down.
- ADR-012's economics credit the full monthly saving from month 1, although the same stage migrates cohorts with a strangler pattern in which old and new paths run together.

## Decision

**Authority store per tenant region.** Tenant A/B policy, membership, model approval, alias and writer-ownership records live in an EU-only authority store. It is consensus-replicated across EU-primary, EU-secondary and a small EU witness location that holds votes, not content. Losing EU-primary leaves 2 of 3 voters in the EU. Tenant C has the same arrangement in its US-home cell. No authority record leaves its tenant's region. The global control plane holds only opaque placement and is never authority.

**Fencing by lease and epoch.** Writer ownership is a lease granted by that quorum, with an epoch that increases on every grant. The regional database, object store, job workers and the Model Gateway's billable-usage write path reject any write carrying an older epoch. Promotion needs both the new lease and proof that the old epoch is rejected. Reachability or a health check never counts as fencing. If the quorum is lost, the cell fails closed: no promotion, no protected disclosure, and authority is reported unavailable even when the recovery-time objective is missed.

**Route generations in each cell.** Each app's current and previous route generation is a record in its cell's authority store. The global control plane validates manifests and publishes signed, versioned generations under opaque IDs. Cells pull them, verify the signature, reject unsigned or older generations, and switch with a compare-and-set on the current generation, so no request is served under a mix. Each cell keeps the last verified generation as last-known-good, with an illustrative 15-minute staleness bound before it alerts. Platform releases roll out one cell at a time from a canary cell.

**Control-plane outage.** Cells keep serving last-known-good and new cutovers freeze. Emergency rollback stays possible as a local compare-and-set to the recorded previous generation, with actor, reason and audit, and still requires current eligibility.

**Economics with dual-run overlap.** While cohorts migrate, the duplicated app work ($12,000 a month) and the platform ($8,000 a month) both run. At the Stage 12 illustrative inputs and a six-month overlap, up-front cost is $60,000 + 6 × $8,000 = $108,000, break-even is month 33, and the three-year saving is $12,000. Break-even month = 15 + 3 × overlap months, and each overlap month removes $12,000 of three-year saving, so a seven-month overlap erases it. This replaces ADR-012's 15 months and $84,000, which hold only if old paths stop on day one.

## Consequences

- A third EU location is now required for authority votes. It stores no tenant content, but it is another site to operate, secure and keep reachable.
- Every authority write pays quorum latency. Bulk tenant data keeps asynchronous replication; only the small authority class is consensus-replicated.
- Recovery can miss its time objective when the quorum is lost. That outcome is accepted over serving from an unverified authority.
- The platform business case now depends on how fast cohorts migrate. Overlap months are a tracked cost, not a footnote.

## Guarantees and Non-Guarantees

The Stage 11 and Stage 12 labs check epoch-scoped usage evidence, the fail-closed promotion gate, append-only shadow evidence bound to its baseline generation, and rollback history. They do not run a consensus protocol, measure clock drift, deploy a witness, sign real artifacts or integrate with production identity. Lease timings and the staleness bound are illustrative.

## Revisit Trigger

Revisit if a regulator forbids the witness location, if quorum latency breaks a stated budget, if measured overlap exceeds seven months, or if a cell needs route changes during a control-plane outage beyond rollback.
