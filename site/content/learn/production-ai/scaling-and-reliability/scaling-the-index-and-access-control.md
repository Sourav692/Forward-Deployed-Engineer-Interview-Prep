# Scaling the Index and Access Control

*Approximate search buys orders of magnitude of speed for a small recall loss, and only filtering inside the index keeps that speed without losing the documents a user is allowed to see.*

◷ 5 min

Going from 22 documents to 20 million does not require re-architecting security. It requires swapping the storage and index layer underneath it, while the mechanisms that made the small system correct carry over.

**Objectives:**

- choose a vector index for tens of millions of vectors and the mechanisms any choice needs;
- explain which access-control costs stay flat as the corpus grows, and which need new work;
- plan index migrations, tenancy and monitoring that hold at scale.

---

## Swap the Index, Keep the Mechanisms

An in-process Chroma collection per tenant is fine up to roughly 10⁵ to 10⁶ vectors. At 80 million it is the wrong tool.

| Option | When it fits |
|---|---|
| Databricks Vector Search | Governed by Unity Catalog, synced from Delta, hundreds of millions of vectors, access control through catalog filters |
| A managed vector database (Pinecone, Weaviate, Milvus, Qdrant, sharded pgvector) | Off Databricks, with native sharding, replica reads and metadata-filtered approximate search |
| Self-hosted sharded approximate search behind a router | Only with full control and the operations team to run it; rarely right for an enterprise |

## Give Any Index the Same Five Mechanisms

**Approximate, not exact, search.** HNSW or IVF trade a small recall hit for orders of magnitude of speed. Past about 1 million vectors this is not optional.

**Shard by tenant.** The small build already keeps each tenant in a separate collection, so sharding is easy. A request always belongs to one tenant and never fans out. The isolation model is proven; the sharding infrastructure is verbal.

**Filter inside the search, not after it.** Filtering after the top-K silently loses recall. The true allowed hit may never have been in the top-K. Production databases support filtered approximate search. Ask the vendor; do not build it.

**Read from replicas.** Query load and index-build load then scale independently.

**Tier hot and cold data.** Keep hot embeddings in the fast index and cold ones cheaper, rehydrated on demand. This is verbal.

## Know Which Security Costs Stay Flat

Access control is where the design is strongest. Be precise about what is free at scale and what is new work.

| Mechanism | Status | Why it holds |
|---|---|---|
| Tenant isolation through separate collections | Proven, free at scale | A query hits one tenant's shard; more tenants means more shards, not more work per query |
| The post-retrieval re-check | Proven, free at scale | It costs O(candidates), not O(corpus), and candidates are bounded by top-K |
| Live permission changes without reindexing | Proven, holds at 20M | Enforcement reads the policy catalogue at query time, so a change applies on the next query |
| Access rules inside the approximate search | Verbal, new work if the vendor cannot help | Without filtered search, over-fetch K times N and filter, which wastes work and can still under-fill; or keep per-attribute indexes, which are fast and costly to maintain |

The mechanisms that make 22 documents correct are the same ones that scale: tenant isolation, a policy catalogue read at query time and a candidate-bounded re-check.

## Keep Tenants Apart Physically

Multi-tenancy is not one big index with a `tenant_id` filter. A shared index creates a noisy-neighbour problem: one huge tenant's rebuild slows everyone. Its filter is also easy to get wrong once, and catastrophic when wrong. Per-tenant shards keep the blast radius to one tenant.

Rate limits for noisy neighbours already exist in the small build, checked before any LLM client is created. A limited request costs $0, rather than failing after the money is spent.

## Migrate Indexes Blue and Green

Re-embedding 20 million documents for a new embedding model or schema takes days and thousands of dollars. Build the new index beside the old one, backfill it, then cut traffic over. This is a blue/green index. Never migrate in place all at once.

## Scale the Observability With the Corpus

Monitoring must grow with corpus size, not only with queries per second. Traces held in memory must move to a queryable store, such as Delta tables or an APM tool. Otherwise "which tenant drives cost?" becomes a log search. A scheduled evaluation run that diffs leak count, refusal accuracy and groundedness catches regressions before a customer does.

Say one more thing explicitly: "scales" is not "scales linearly". Approximate retrieval, the post-retrieval check and per-tenant sharding are sub-linear or flat in corpus size.

> **Warning: post-filtering at scale fails quietly.** Taking the top-K and then removing forbidden chunks returns fewer, worse results with no error. The answer looks thin, not broken. Push the filter into the search.

## Worked Example: A Permission Change at Twenty Million Documents

An engineer is removed from a group at 20 million documents. In the scaled design, the policy catalogue update takes effect on the next query. No index is rebuilt and no cache is flushed. The engineer's next query hits the tenant's shard with a filter compiled from current groups. The post-retrieval check then re-reads only the candidates, so its cost depends on top-K, not on 80 million chunks.

Meanwhile a new embedding model is rolling out. A green index is backfilled beside the blue one, and traffic moves only when it is complete.

The security behaviour is identical to the 22-document build. Only the storage under it changed, which is the line to say in the interview.

---

## Key Takeaways

- Swap the in-process store for a managed or platform index with filtered approximate search, tenant shards, replicas and tiering.
- Filter inside the search; post-filtering silently loses allowed results.
- Tenant isolation, the candidate-bounded re-check and query-time policy reads stay flat as the corpus grows.
- Use per-tenant shards, not one shared index, and migrate indexes blue/green.
- Move traces to a queryable store, run scheduled drift checks, and say which parts are sub-linear.

## Check Yourself

1. **Why is the post-retrieval access check "free at scale"?**
   It re-checks only the candidates, which top-K bounds. Its cost is O(candidates), not O(corpus).

2. **Why not put every tenant in one big index with a `tenant_id` filter?**
   One tenant's rebuild slows everyone, and a filter mistake exposes every tenant. Per-tenant shards limit the blast radius.

3. **How do you move 20 million documents to a new embedding model?**
   Build a new index beside the old one, backfill it, then switch traffic. Never migrate in place all at once.

