# Stage 6 Plan: Enterprise Security

Start from actual Stage 5 `v0.5-stage-05`, its tested state and ADR-005. Preserve bounded fair dispatch, trusted live retrieval/cache gates, versioned sources, shared history, stable keys, worker fencing and unknown-outcome handling. Tenant A now requires auditable access and restricted provider egress; Tenant B must remain isolated even when IDs or headers are forged.

First-teach 2.3 Gateway and service communication, 8.3 Enterprise retrieval governance, 13.1 Identity and access control, 13.2 Enterprise AI security, and 13.3 Multi-tenant platform design, all D3. Revisit 2.1 networking at D2 through ingress/service/egress trust boundaries. Keep consistency/failover (3.1, Stage 7 D3) contextual, and global residency architecture (16.2, Stage 11 D2) deferred.

Add verified principal propagation, authoritative membership/policy epoch and freshness, resource-scoped retrieval, constrained worker capability/audience, durable audit-before-disclosure, provider allowlist and secret-reference boundaries. Compare shared predicate/RLS versus schema/database isolation and public versus private network paths. Explicitly distinguish local policy fixtures from production OIDC, mTLS, RLS, KMS or private endpoints.

Use the actual Stage 3 Knowledge store for negative-access integration. Signed fixture envelopes use public demonstration keys and must never be described as a production JWT/OIDC implementation. Tests cover tampering, expiry, audience, rotation, tenant spoofing, document revocation/freshness, audit failure, policy epochs, capability bounds and egress. The two-control simulator combines identity validity and policy age; walkthrough branches show normal access, spoofed tenant and stale policy.

Five phases, beginner intuition, classified coverage, two checkpoints, four interview drills, quantitative policy-lag/audit-cost examples, unassessed gates, snapshot/ADR and clean-extraction ZIP. Estimate seven to nine integrated study hours. Finish all checks before Stage 7.
