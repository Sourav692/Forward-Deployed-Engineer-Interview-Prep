# Secrets and Per-Tenant Encryption Keys

*One key and credentials passed around in plain arguments are simple to operate, but a single leak then exposes every customer at once.*

◷ 4 min

"Store secrets in a vault" is the right instinct but not yet an answer. Hold references rather than values, wrap keys in keys, and give every tenant its own data key so a breach stops at one customer.

**Objectives:**

- state the four principles of secrets management;
- explain envelope encryption and the operational problem it solves;
- say what per-tenant encryption keys buy when storage is compromised.

---

## Hold a Reference, Never the Value

Every platform that connects to a customer's CRM, ticketing system or knowledge base needs credentials for those systems. A connector should hold a *pointer* to the secret, such as a vault path or key id, never the credential itself.

The credential is resolved at the moment of use. It is never logged, never written into a trace, and never passed as a plain argument between steps. A secret that was never copied cannot leak from the copy. The connector model in the agent platform would reference exactly this; its coverage map lists the connector layer and vault as unbuilt.

## Wrap Keys With Keys

**Envelope encryption** encrypts each secret with its own small key. A master key, held centrally, encrypts those small keys.

The reason is operational. Rotating the master key then means re-wrapping the small keys. No secret is re-encrypted. "Encrypt everything with one key" does not scale for exactly that reason: every rotation touches all the data.

## Rotate Without Downtime

A credential may be rotated on a schedule, or immediately on suspected compromise. Work in flight must not break. The old version stays valid for a short grace window, while new calls pick up the new one.

## Scope Each Credential to One Connection

Scope a credential to one customer connection. Never scope it to the connector type. Two customers may both use the same *kind* of helpdesk connector. A leaked credential for one customer's connection must never open the other's.

> **Warning: per connector type is the wrong scope.** A credential shared across every customer using the same integration turns one leak into a platform-wide leak. Scope per connection, so the blast radius is one customer's one system.

## Give Every Tenant Its Own Data Key

A tenant-id tag on every row is not the strongest property available. The stronger one is this: **if one tenant's encryption key is compromised, the blast radius is that one tenant, not the platform.**

Every tenant gets its own data-encryption key. A shared or per-tenant master key wraps it, which is the same envelope pattern again. This is the cryptographic version of the per-tenant collection in [Why Access Control Shapes Enterprise RAG](../T4.1_Enterprise_RAG_in_Production/01_Why_Access_Control_Shapes_Enterprise_RAG.md). It is physical or cryptographic separation instead of one shared pile with a filter on top.

## Worked Example: Raw Read Access to Storage

The design-conversation tell is the question: *"What happens if someone gets raw read access to the storage layer?"*

With one platform-wide key, the attacker who also obtains that key can decrypt every customer's data. One breach exposes everyone at once.

With per-tenant keys, the attacker gets ciphertext for many tenants, but each tenant's data decrypts only with that tenant's key. A compromised key exposes one tenant. The answer is short: "They get one tenant's ciphertext, and only that tenant's key would ever decrypt it."

The same envelope pattern that made rotation cheap is what makes per-tenant keys affordable. That is why the two ideas belong together.

---

## Key Takeaways

- A connector holds a vault reference and resolves the credential at use, never logging it, tracing it or passing it between steps.
- Envelope encryption wraps per-secret keys in a master key, so rotating the master re-wraps small keys instead of re-encrypting everything.
- Rotation keeps the old version valid for a short grace window, so work in flight does not break.
- Credentials are scoped per customer connection, never per connector type.
- Per-tenant data keys limit a key compromise to one tenant, the cryptographic form of a per-tenant partition.

## Check Yourself

1. **Explain envelope encryption and the problem it solves.**
   Each secret has its own key, and a central master key encrypts those keys. Rotating the master only re-wraps the small keys, so it does not require re-encrypting every secret.

2. **Why scope a credential per connection rather than per connector type?**
   Two customers can use the same kind of connector. A per-type credential would let one customer's leak open another customer's system.

3. **What changes with per-tenant keys when storage is breached?**
   The attacker gets only ciphertext, and each tenant's data decrypts with that tenant's key alone, so the blast radius is one tenant instead of every customer.

## References

**Sources:** `01_Identity_Secrets_Tenant_Fairness.md` (FDE Handbook, Cross-Cutting Concerns): "2 · Secrets management" and "3 · Per-tenant encryption keys". `01-identity-secrets-and-tenant-fairness.md` (Production and Platform Judgment): §2 "Secrets management" and §3 "Per-tenant encryption keys".
