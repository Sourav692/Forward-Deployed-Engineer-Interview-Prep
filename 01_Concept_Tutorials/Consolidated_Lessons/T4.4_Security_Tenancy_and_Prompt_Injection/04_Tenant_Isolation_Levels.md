# Tenant Isolation Levels

*Stronger isolation means fewer shared resources and lower leak risk, and it also means more deployments to build, run and pay for.*

◷ 4 min

Every multi-tenant platform is asked how strongly tenants are isolated, and "we filter by tenant id" is not an answer. Pick a level, make the data layer enforce it, and know how a regulated customer moves up.

**Objectives:**

- state the three isolation levels and the default to defend;
- explain why the data layer, not application code, must enforce the tenant;
- describe the escalation path for a regulated customer.

---

## Choose One of Three Levels

| Level | What it means | When |
|---|---|---|
| **Shared infrastructure, tenant id on every row** | One database and one set of tables; every row tagged, every read and write includes the tag | The default: cheapest and fastest to ship |
| **Separate schema or namespace per tenant** | Same cluster, but Acme's tables are not Meridian's tables | Stronger isolation without an extra deployment |
| **Dedicated deployment per tenant** | Separate cluster, region and encryption keys | Banks, healthcare, anyone who cannot share a box |

Start at level 1. Nobody spins up a dedicated cluster for the first ten customers. Put a tenant id on every workflow, run, credential and trace, and always query inside one tenant.

## Make the Store Enforce the Tenant

The default is only honest if the data layer enforces it. Suppose isolation means "every engineer remembered to add `WHERE tenant_id = …`". A future API that forgets the clause returns another company's data. That is the standard multi-tenant leak. An application cannot enforce a rule that one of its endpoints forgot to apply.

The real rule: *the store itself will not return a row unless the request is already scoped to one tenant.* Two forms meet it. One is row-level security bound to the session. On Databricks, Unity Catalog row-level security and dynamic views using `is_account_group_member` let tenant A see only its own data. The other is physically separate indexes or schemas, so there is no shared pile of rows to leak across. The per-tenant Chroma collection in [Why Access Control Shapes Enterprise RAG](../T4.1_Enterprise_RAG_in_Production/01_Why_Access_Control_Shapes_Enterprise_RAG.md) is that second form.

> **Warning: an application-level filter is a convenience, not the wall.** If every query depends on a developer adding a `WHERE` clause, the isolation guarantee is only as good as the least careful endpoint. Put the tenant check where no endpoint can skip it.

## Plan the Escalation for Regulated Customers

A platform holds connector credentials and run traces. For a regulated tenant, "same table, different tag" may be legally insufficient. They may need their own keys, region or deployment.

Do not build that on day one. Be able to say *how* a customer moves from a tagged row to "their data lives somewhere else". Per-tenant encryption keys, from [Secrets and Per-Tenant Encryption Keys](02_Secrets_and_Per_Tenant_Encryption_Keys.md), are the first rung of that ladder. A separate schema is the next, and a dedicated region and deployment the last.

## Worked Example: Answering the Isolation Question

The interviewer asks: "How are tenants isolated in your agent platform?"

Answer with the default first: shared infrastructure, with a tenant id on every workflow, run, credential and trace. Then the follow-up that makes it honest: the store refuses any row unless the request is tenant-scoped, through row-level security or a per-tenant index. Then the escalation: a regulated customer moves up to a separate schema, or a dedicated region and keys, not just a different tag in the same table.

Three sentences cover the level, the enforcement point and the ladder. Missing any one of them leaves an obvious follow-up unanswered.

---

## Key Takeaways

- Three levels run from a tenant id on every row, through a schema per tenant, to a dedicated deployment, and level 1 is the default.
- The data layer must refuse unscoped requests, through row-level security or separate indexes, because an application `WHERE` clause can be forgotten.
- Regulated customers need a known path up the ladder, starting with per-tenant keys.
- A complete answer names the level, the enforcement point and the escalation path.

## Check Yourself

1. **State the three levels and the default.**
   A tenant id on every row in shared infrastructure, which is the default; a separate schema or namespace per tenant; a dedicated deployment with its own cluster, region and keys.

2. **What is wrong with "every query includes `WHERE tenant_id = …`"?**
   It relies on every developer remembering the clause. One endpoint that forgets it returns another company's data. The store must refuse unscoped requests itself.

3. **What is the first rung of the regulated escalation path?**
   Per-tenant encryption keys, before a separate schema or a dedicated region and deployment.

## References

**Sources:** `04_Prompt_Injection_Egress_Tenancy.md` (FDE Handbook, Cross-Cutting Concerns): "3 · Multi-tenancy — pick a level and justify it" and "Checkpoint". `Cross_Cutting_System_Design_Quick_Reference_v2.md`: §6 "Databricks Implementation" (Unity Catalog row-level security and dynamic views).
