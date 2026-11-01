# ADR-006: Verified Enterprise Identity and Audited Disclosure

Status: accepted educational architecture. Stage: 6. Date: 2026-11-02. Supersedes: none; preserve ADR-001–005 execution, retrieval and overload contracts.

## Situation and Choices

Tenant A requires auditable current access, organisational isolation and constrained provider egress. Baseline fixtures and trusted tenant predicates are necessary but do not implement corporate identity or network control. Compare pooled predicates plus production row-level defence, schema/database isolation and dedicated planes. Retain the pooled teaching baseline while making stronger isolation an explicit tenant/deployment decision rather than an assumed label.

## Decision

Deployment must verify identity with bounded issuer/audience/key/type/expiry rules; bind trusted tenant/subject to live membership, policy epoch/freshness and resource access. Strip caller identity headers and propagate a narrowly scoped service capability through authenticated service channels. Treat document/model text as untrusted data, never as authorisation or tool policy.

Before protected retrieval disclosure, resolve current permitted source text and durably record the decision/protected source references. Audit failure blocks this route. Approved provider destinations and tenant-scoped secret references are runtime policy, separate from identity and networking. Private routing/mTLS does not remove resource checks.

## Evidence and Limits

The actual Stage 3 Knowledge store is combined with signed public fixture envelopes, membership/audit tables and egress predicates. Ten tests cover tampering, audience/issuer/time, rotation, spoofed scope, cross-tenant/citation access, revocation/freshness/epoch, worker capability, audit failure/redaction and secret/provider scope. The envelope is deliberately not JWT/OIDC; no production identity, mTLS, RLS, KMS or private endpoint is deployed. Rechecks are observation points, not globally atomic revocation barriers. Audit metadata does not prove remote execution.

## Operations and Revisit

Observe policy/source lag, key/audience failures, stale denials, audit durability, denied egress and privileged tenant operations. Preserve disclosure semantics during authority/audit outages. Stage 7 must explicitly choose consistency/failover per data class without turning stale cache or a failover replica into immediate authorisation authority.
