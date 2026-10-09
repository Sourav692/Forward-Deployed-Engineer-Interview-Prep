# Level 4: Production GenAI Systems

Problems 31 to 40: the small pieces that keep a shared GenAI platform fair, cheap, fast, and honest under failure.

| Notebook | Problems | Theory file | What it trains |
| --- | --- | --- | --- |
| [01_tenant_limits_and_cost.ipynb](01_tenant_limits_and_cost.ipynb) | 31 Rate-Limit Model Calls per Tenant; 35 API Quota Enforcement; 39 Cost Anomaly Detection | [01_tenant_limits_and_cost_THEORY.md](01_tenant_limits_and_cost_THEORY.md) | Keeping each tenant's capacity and spend separate, and failing closed when data is missing. |
| [02_retries_and_failures.ipynb](02_retries_and_failures.ipynb) | 32 Retry Failed API Calls with Exponential Backoff; 36 Dead-Letter Queue Handling; 38 Model Response Timeout Handling | [02_retries_and_failures_THEORY.md](02_retries_and_failures_THEORY.md) | Retrying only what is worth retrying, stopping in time, and labelling slow calls for a fallback. |
| [03_safe_caching.ipynb](03_safe_caching.ipynb) | 33 Build a Simple LRU Cache for Prompts; 37 Tenant-Aware Caching | [03_safe_caching_THEORY.md](03_safe_caching_THEORY.md) | Building a size-limited cache and keys that can never leak one tenant's answer to another. |
| [04_queues_and_batch_reports.ipynb](04_queues_and_batch_reports.ipynb) | 34 Build Queue Priority for Urgent Tickets; 40 Batch Processing Failure Summary | [04_queues_and_batch_reports_THEORY.md](04_queues_and_batch_reports_THEORY.md) | Ordering background work fairly and turning batch results into a report the team can act on. |
