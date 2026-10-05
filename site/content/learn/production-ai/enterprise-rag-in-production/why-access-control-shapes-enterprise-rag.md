# Why Access Control Shapes Enterprise RAG

*Filtering after retrieval is the cheapest change to a demo, and it costs both answer quality and secrecy.*

◷ 7 min

Enterprise RAG is not ordinary RAG with a permissions check bolted on. Decide where the permission check runs relative to retrieval first, because that one choice fixes the shape of everything after it.

**Objectives:**

- state the access requirement as a table of who asks and what each person should get;
- name the two failures of filtering after retrieval;
- explain why the design partitions by tenant, pre-filters inside the partition, and still re-checks after retrieval.

---

## Draw the Requirement as a Table

The running example is **Meridian Assist**, built for Meridian Cloud, a B2B SaaS observability company. Support engineers, account managers and security staff all ask questions of one knowledge base. It holds help-centre docs, engineering runbooks, support tickets, incident post-mortems, customer contracts, pricing policy and security advisories. The demo corpus has twenty-two documents, six source types and four sensitivity levels.

The same question must produce different correct answers. Take this one: *"Why did Vertex Financial lose data in March, and do they get service credits?"*

| Who asks | What they should get |
|---|---|
| Tier-1 support agent | The platform-side backlog; credits are an account-manager conversation |
| Tier-3 engineer | The engineering root cause; the account is credit-eligible |
| Account manager | The contractual credit tiers, but not the engineering root cause |
| External contractor | Nothing: blocked by data residency and the external-source rule |
| Anyone in another tenant | Nothing at all, whatever their groups or clearance |

Getting this right **provably**, not by asking the model nicely, is the whole project. Draw the table early in any design conversation. It is the requirement, and every later decision is justified by it.

## Reject Filtering After Retrieval

Every enterprise RAG design answers one question: where does the permission check happen relative to retrieval? There are three answers, and the first is the tempting one.

**Post-filter** means retrieving everything, then dropping what the user cannot see. It fails twice.

```
  top 6 retrieved:   [contract] [postmortem] [contract] [helpdoc] [postmortem] [helpdoc]
  after filtering:                                      [helpdoc]              [helpdoc]
                     ^^^^ the user's top-6 became a top-2, and the good stuff was crowded out
```

The first failure is **quality**. The vector store returned six chunks, but four were forbidden. They took rank slots and then vanished. The best *allowed* answers sat below them and never reached the model. Recall collapses for exactly the users with the most restricted views.

The second failure is **security: the existence oracle**. Dropping the text does not hide the shape of the result. "0 results" against "2 results", or a slower query, hints that matching classified documents exist. An attacker can probe a secret topic and count the hits. The filter hid the text and revealed the existence.

## Partition by Tenant, Not by Group

The second answer is **partitioned indexes**: one index per tenant or per group, such as `index_meridian`, `index_acme` or `index_engineering`. A query goes only to the indexes the user belongs to.

Isolation here is the strongest available. A bug in a `where` clause cannot leak another tenant, because those vectors are not in the index being searched. The blast radius of a mis-filter or a stolen key is one partition.

The price is operational. Each partition is a collection to build, warm, back up and monitor. Small tenants waste capacity, and cross-tenant features need extra plumbing.

Groups make partitioning awkward. A document allowed to *engineering* and *support-tier3* has no single home. Duplicating it into both indexes creates embeddings that drift on update. A union index brings back filtering inside a mixed set. Fanning the query out across every group index forces a merge of result lists with inconsistent scores. Tenants almost never overlap, but groups overlap constantly. So **partition by tenant, not by group.**

## Push the Check Into the Search

The third answer is the **pre-filter**: the permission check runs inside the search itself.

```
   search(query_vector, where = { tenant = X AND sensitivity <= Y AND groups overlap Z })
```

Unauthorised chunks are never scored, ranked or returned. The user's top six is the best six *of what they may see*. A forbidden document that was never a candidate cannot crowd anything out or reveal its existence.

## Combine Partition, Pre-Filter, and Post-Check

The project uses all three layers together.

1. **Partition:** one Chroma collection per tenant, the blast-radius wall.
2. **Pre-filter:** the decidable part of the policy compiled into every vector search. Cheap and approximate.
3. **Post-check:** the *full* policy re-evaluated on every candidate before the model sees any text. Correct, including everything the store's filter language cannot express.

The post-check looks like the rejected post-filter, but it is not. This distinction is the most important idea in the module.

| | Post-filter as the only access check | The project's post-check (`enforce`) |
|---|---|---|
| When | After an **unfiltered** top-k | After a **pre-filtered** top-k |
| Job | Drop secrets that already took rank slots | Re-run the full policy: embargo, need-to-know, live identity state |
| Quality | Crowds out allowed documents: 2 of 6 left | The pool was already allowed; a drop is rare |
| Trust | The *only* gate; skip it and you leak | The **authoritative** gate; the pre-filter is an optimisation |

This is defence in depth. If the filter is wrong, the tenant partition still holds. If the index is stale, the post-check still denies and logs the disagreement as a security signal. [Pushing Policy Into the Index](/learn/production-ai/enterprise-rag-in-production/pushing-policy-into-the-index) shows exactly which rules go where.

> **Warning: "groups overlap" means two different things.** For **access**, it means the user and the document share at least one group, so the user may read it: `user.groups ∩ document.allowed_groups ≠ ∅`. For **partitioning**, it means one document carries several groups, so no single group index can hold it. Mixing the two meanings confuses the argument for partitioning by tenant.

## Worked Example: One Rule, Three Users

A document lists `allowed_groups: security, engineering`. The access rule passes when the intersection with the user's groups is non-empty: any shared group, not all of them.

| User groups | Intersection | Result |
|---|---|---|
| `{engineering}` | `engineering` | pass |
| `{security, sre}` | `security` | pass |
| `{support-tier1}` | empty | fail |

The vector store cannot filter on a list. So each group becomes its own boolean column, such as `grp__engineering: true`, and the pre-filter is an `$or` over those columns. Mentioning that bridge in an interview signals hands-on experience rather than reading.

That small table is the whole system in miniature: a rule decided by attributes, compiled into the search where possible, and never left to the model.

---

## Key Takeaways

- The access requirement is a table of personas and correct answers; draw it first, because it justifies every later decision.
- Filtering after retrieval crowds out allowed documents and leaks existence through the shape of the result.
- Partition by tenant, because tenants rarely overlap; do not partition by group, because groups overlap constantly.
- A pre-filter keeps forbidden chunks out of the candidate set, so the top-k is the best of what the user may see.
- The project combines a tenant partition, a pre-filter and an authoritative post-check, which is defence in depth rather than post-filtering.

## Check Yourself

1. **Name the two failures in the "top 6 became top 2" diagram.**
   Quality: forbidden chunks took rank slots, so the best allowed answers never reached the model. Security: the count or speed of results acts as an existence oracle.

2. **Why partition by tenant but not by group?**
   Tenants almost never overlap, so a tenant partition is a clean wall. Groups overlap constantly, so a document has no single group index, and every workaround duplicates, mixes or fans out.

3. **How does the project's post-check differ from post-filtering as the only access check?**
   It runs on an already pre-filtered pool, so drops are rare and nothing allowed is crowded out. It re-runs the full policy, including rules the store cannot express, and it is the authoritative gate rather than the only one.

## References

**Sources:** `01_Why_Enterprise_Changes_The_Problem.md` (FDE Handbook, Enterprise RAG): "The case study: Meridian Assist", "Three patterns for access control, and why two of them are wrong", "What the project actually does", "\"Groups overlap\" — two meanings" and "Interview lens".
