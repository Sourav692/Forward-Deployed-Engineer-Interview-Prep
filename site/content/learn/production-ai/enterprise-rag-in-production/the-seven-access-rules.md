# The Seven Access Rules

*Roles are easy to explain but cannot express real entitlements, while attributes can express them at the cost of a policy that must be learned rule by rule.*

◷ 8 min

Role-based access control cannot say "EU engineers on the vuln-response team may read restricted advisories, but only after the embargo lifts." Attribute-based access control (ABAC) says it in one rule, so learn the attributes, the seven rules in order, and the obligations that ride on an allow.

**Objectives:**

- list the resource and principal attributes and the rule each one feeds;
- walk the seven checks in order and explain why the first deny wins;
- say what an obligation is and why it is not a filter.

---

## Meet Two Bundles of Attributes at One Engine

Every decision takes two inputs. The **principal** describes who is asking. The **resource** describes the chunk being read. A policy engine compares them. Nothing else takes part: **no LLM is involved in any access decision, ever.**

The engine runs seven rules in order. Deny overrides allow, and the default is deny. It returns a `Decision(allowed, rule, reason)`. The same shape recurs in the guardrails and the delivery gates later in the course. A named rule decides, and the reason is never "because I said so".

## Give Every Resource Field One Job

Each resource field answers one question and feeds one rule.

| Field | Example | The question it answers | Rule it feeds |
|---|---|---|---|
| `doc_id` | `PM-2026-03-14` | Identity and citation target | Citation verification |
| `tenant_id` | `meridian` | Which customer owns this? | **1 · tenant isolation** |
| `sensitivity` | `confidential` | How damaging if it leaks? | **2 · clearance** |
| `sensitivity_level` | `2` | Numeric form, so the index can do `<=` | 2 (pushdown) |
| `region` | `EU` | Where may it be processed? | **3 · data residency** |
| `valid_from` | `2026-09-01` | Is it published yet? | **4 · embargo** |
| `valid_until` | `null` | Has it expired? | 4 · expiry |
| `need_to_know` | `[vuln-response]` | Which compartment? | **5 · need-to-know** |
| `source` | `contract` | What kind of document? | **6 · external restriction** |
| `allowed_groups` | `[engineering, support-tier3, sre]` | Who was granted it? | **7 · group membership** |
| `contains_pii` | `true` | Does it hold personal data? | Obligation: redact |
| `owner` | `ingest-team` | Who to ask for access | Operational |

The sensitivity ladder is ordered: `public (0) < internal (1) < confidential (2) < restricted (3)`. A `confidential` clearance reads everything at or below it.

The pipeline does not invent these fields. They translate each source system's own permission model: Confluence space permissions, Zendesk organisations, SharePoint groups. Getting that translation wrong is the number one cause of enterprise RAG leaks. [Permission-Aware Ingestion](/learn/production-ai/enterprise-rag-in-production/permission-aware-ingestion) shows why ingestion refuses documents it cannot map.

## Resolve the Principal Fresh on Every Request

| Field | Example | Where it comes from |
|---|---|---|
| `user_id` | `u_marco_t3` | SSO or OIDC claim |
| `tenant_id` | `meridian` | Workspace or org binding |
| `groups` | `[support-tier3, engineering]` | Directory groups synced by SCIM |
| `clearance` | `confidential` | HR or entitlement system |
| `region` | `EU` | Employment location |
| `projects` | `[vuln-response]` | Compartment assignment |
| `is_external` | `false` | Contractor flag |
| `can_view_pii` | `true` | Privacy entitlement |

The principal is never cached in a session and never read from anything the user controls. A cached principal cannot see a revocation that happened after it was cached. Resolving it per request makes live revocation work: remove someone from a group and the very next query enforces it, with no reindexing.

## Walk the Seven Checks in Order

```
  1 tenant_isolation ─┐
  2 clearance         │  DENY rules — any hit stops here
  3 data_residency    │
  4 embargo / expiry  │
  5 need_to_know      │
  6 external          ─┘
                       ↓  (nothing denied)
  7 group_membership  ── the ONLY rule that can grant
                       ↓  (no grant matched)
    default_deny
```

The first deny wins and short-circuits. A document may break several rules, but only the first one shows. That is how a rule can sit permanently untested.

1. **Tenant isolation** compares the two `tenant_id` values. A different tenant is denied unconditionally. The negative-control persona, `u_attacker_other_tenant`, holds every group and the highest clearance in tenant `acme`. It reads **0 of 22** documents. No accumulation of privilege crosses a tenant boundary.
2. **Clearance** compares sensitivity levels. `u_lena_t1` has `internal` clearance, so a `confidential` contract is denied. Clearance is necessary but not sufficient, as rule 7 shows.
3. **Data residency** compares regions. `GLOBAL` resources are readable anywhere. `u_marco_t3` and `u_jin_us_t3` share role, clearance and groups, and differ only by `EU` against `US`. Marco reads the EU post-mortem and ticket; Jin reads the US ticket. Both read the `GLOBAL` runbook. The rule comes from the Vertex contract, which bars EU telemetry from being accessed outside the EU: **a contract clause became a policy rule.** On the principal side `GLOBAL` is a value, not a wildcard, so `u_ravi_sec` is denied the EU post-mortem.
4. **Embargo and expiry** compare `valid_from` and `valid_until` with today. Ravi has the right clearance and compartment for advisory `SA-2026-07`, but it publishes on 2026-09-01 and today is 2026-08-22. Only the clock stops him. On 2026-09-01 the decision flips to allow with no data change.
5. **Need-to-know** checks that the document's compartments are among the principal's `projects`. Ravi, assigned to `vuln-response`, reads `SA-2026-05`. `u_erin_secmgr` has the same `restricted` clearance but no compartment and is denied. Clearance is a ladder; compartments are orthogonal to it.
6. **External restriction** stops external principals reading `contract`, `pricing` or `postmortem` sources, whatever their groups or clearance. A contractor's NDA does not care which group someone put them in.
7. **Group membership** is the only rule that grants. A non-empty intersection of `groups` and `allowed_groups` allows. The pseudo-group `public` makes a document readable by everyone in the tenant. If no grant matches, the result is `default_deny`. That accounts for 41 denials in the corpus, the largest single category.

> **Warning: a shadowed rule looks tested but is not.** For the original contractor persona, clearance always denied before the external rule could run, so rule 6 was never exercised. A coverage test found it. The fix was a new persona, `u_dana_ext`, with `confidential` clearance and the `sales` group, where `is_external` is the only thing between her and the contracts. Add a persona for every rule that can only fire when earlier rules pass.

## Attach Obligations to an Allow

An allow is not always unconditional. This is the part of ABAC people forget exists.

| Obligation | Fires when | Effect |
|---|---|---|
| `redact_pii` | `contains_pii` and not `can_view_pii` | Direct identifiers masked before the text reaches the model |
| `audit_access` | Sensitivity is `confidential` or `restricted` | Access recorded with user, document and rule |

A filter answers yes or no; an obligation answers *yes, and transform*. A vector store cannot return "this chunk with emails masked", so obligations run after retrieval.

A real failure is worth knowing. On Databricks the mask is a SQL `regexp_replace`. A `\w` class was eaten by the Python-to-Spark-SQL escaping chain, so the mask looked attached and redacted nothing. Use explicit character ranges and always assert on real data. This bug shipped and was caught only by reading the output.

## Worked Example: One Ticket, Two Readers

`u_tom_contractor` asks about ticket `TK-4488`, a US ticket that contains personal data. He passes every deny rule and his group grants access, so the decision is allow with `obligations=['redact_pii']`.

```
"Reporter dan.okafor@northgateretail.example reports timeouts."
   becomes
"Reporter [REDACTED_EMAIL] reports timeouts."
```

`u_jin_us_t3` reads the same ticket intact, because he has `can_view_pii=true`. `u_lena_t1` holds the right group but is in the EU, so data residency denies her before any obligation matters.

Same document, same query, three outcomes. Each came from a named rule or obligation, and none came from the model.

---

## Key Takeaways

- An ABAC decision compares principal and resource attributes in a policy engine, with deny overriding allow and a default deny; no LLM takes part.
- Every resource field feeds one rule, and the fields translate each source system's permission model.
- The principal is resolved fresh on every request, so a revocation takes effect on the next query.
- Seven rules run in order; the first deny wins, only group membership grants, and a shadowed rule needs its own persona to be tested.
- Obligations attach transformations such as PII redaction and audit to an allow, and they cannot run inside the index.

## Check Yourself

1. **Why does the attacker persona read 0 of 22 documents despite holding every group and top clearance?**
   Tenant isolation is checked first and cannot be overridden. A principal in another tenant is denied before any other rule runs.

2. **Why did the project add `u_dana_ext`?**
   Without a high-clearance contractor, clearance always denied first, so the external-restriction rule never fired and was untested.

3. **What is the difference between clearance, groups and compartments?**
   Clearance is a ladder that says how sensitive a document may be. Groups are the grant that says which documents. Compartments are orthogonal assignments that top clearance cannot bypass. A reader needs all three.

## References

**Sources:** `02_Access_Control_ABAC.md` (FDE Handbook, Enterprise RAG): "Why this matters", "The shape of the decision", "Resource fields", "Principal fields", "The seven checks, in order", "Obligations", "Four documents, every persona" and "Seven things to be able to say".
