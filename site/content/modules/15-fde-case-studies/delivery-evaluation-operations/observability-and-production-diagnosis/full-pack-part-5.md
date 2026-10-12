# Observability and Production Diagnosis for a Customer-Facing AI Application, part 5

## Key Takeaways

- "Slow and sometimes wrong" is three problems, latency, correctness and diagnosability, and each is made measurable before any design.
- The first design decision is the no-capture list: full prompts, raw documents, secrets and unbounded labels stay out by default.
- Requirements are stated so a test can fail them, with the support workflow as the functional core and overhead as a budget.
- Telemetry cost is set by collection policy; the worked sizing shows storage is small and the classifier is the real constraint.
- The architecture is tracing-first, with the observability path unable to block the request path and nothing raw crossing the trust boundary.
- Classification and keyed hashing happen before storage, and three tests pin idempotency, privacy and failure visibility.
- Sampling is tail-biased with error overrides and exemplars, because uniform sampling drops the only bad trace.
- Every layer has a named failure policy, and audit evidence fails closed where user answers can degrade.
- The dashboard is built top down from the complaint, and wrong answers are triaged by comparing evidence with output.
- Incident #87 was compounded latency from several small changes, found only by comparing each span with its baseline.
- Incident #88 was prompt growth, a routing threshold and a broken cache key multiplying, and it hid a permission leak.
- Prompts #53, #54 and #74 are the same traces read at different depths: the stage decomposition, the seven RAG failure classes, and the inference stack.
- Rollout runs in four phases with named owners, an eight-metric scorecard, explicit go/no-go gates and a risk register.
- The fifty minutes go to the no-capture list, the dropped-trace drill and the support test.
- Every cost and latency pivot is answered with a card built from measure, route, bound and cache safely.

## Check Yourself

1. **What are the three problems inside "slow and sometimes wrong"?** Latency (where in the pipeline), correctness (retrieval or generation), and diagnosability (can support explain it without exposing content or drowning in telemetry).
2. **Name the four things never captured by default.** Full prompts, raw customer documents, secrets, and high-cardinality free-form labels.
3. **Why must the sensitivity classifier run before storage?** Once a raw value is written, every system that reads the store has it; classification after storage protects nothing.
4. **Why a keyed hash (HMAC) rather than a plain hash?** It keeps correlation and deduplication while resisting brute-force reversal of common prompts, as long as the secret key stays secret; a missing key must raise an error.
5. **Walk the "sampling drops the only bad trace" drill.** Detect by comparing complaints with sampled trace volume; contain by raising fidelity for the affected slice; recover from neighbouring evidence and mark the gap; prevent with error-class overrides, exemplars and escalation hooks.
6. **When does a failure fail closed rather than degrade?** When integrity, privacy or authorisation would be compromised: a missing auth token, an unavailable audit sink, a lookup outside tenant scope.
7. **How do you tell a retrieval fault from a model fault?** Compare retrieved evidence with the answer. Empty, stale or off-topic evidence points upstream; good evidence contradicted by the answer points at the model or prompt; a one-tenant failure points at configuration, access or integration state.
8. **In #87, which spans stacked up, and what was the process failure?** Retrieval 4200 ms, reranker 3100 ms, gateway queue 2800 ms and provider 9360 ms; the canary never tested peak GPU queue depth.
9. **In #88, why was the cost spike also a security incident?** The v5 cache key dropped `role_scope`, so one role's summary could be served to another.
10. **For #74, why do input and output tokens hurt in different places?** Prefill processes the prompt in parallel and sets time to first token; decode generates one token at a time and sets total time.
11. **What does the go/no-go gate check?** Trace coverage above the minimum for the top failure path, and telemetry overhead not moving latency.
12. **Give the four verbs and the line for #44.** Measure, route, bound, cache safely. Contain, attribute, then diagnose, keeping low-cost safe paths online; budget guardrails must exist before launch.

## References

### Fact-check sources (checked 27 Sep 2026)

- [Grafana Tempo docs: Manage trace ingestion](https://grafana.com/docs/tempo/latest/operations/manage-trace-ingestion/) — typical span size (~500 bytes) behind the storage sizing
- [RFC 2104: HMAC, section 3 Keys](https://www.rfc-editor.org/rfc/rfc2104) — HMAC security rests on a secret key, not a salt
- [OpenAI API docs: Deprecations](https://developers.openai.com/api/docs/deprecations) — GPT-4-class list prices used to check the $2.74 figure
- [Ovadia et al. 2023, Fine-Tuning or Retrieval? (arXiv 2312.05934)](https://arxiv.org/abs/2312.05934) — fine-tuning is a weak way to add knowledge compared with retrieval
- [Kwon et al. 2023, Efficient Memory Management for LLM Serving with PagedAttention](https://arxiv.org/abs/2309.06180) — continuous batching and KV-cache limits
- [vLLM docs: Optimization and Tuning](https://docs.vllm.ai/en/latest/configuration/optimization.html) — batch size, preemption and chunked prefill trade-offs
- [GDPR (Regulation 2016/679), Recital 26](https://eur-lex.europa.eu/eli/reg/2016/679/oj) — pseudonymised data is still personal data
- [EDPB Guidelines 01/2025 on Pseudonymisation](https://www.edpb.europa.eu/system/files/2025-01/edpb_guidelines_202501_pseudonymisation_en.pdf) — keyed hashes as pseudonymisation, not anonymisation
- [GDPR Article 17: Right to erasure](https://gdpr-info.eu/art-17-gdpr/) — deletion requests reach linked fingerprints
- [Claude docs: Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) — exact prefix match; timestamps, unsorted JSON, tool changes and model swaps break the cache
- [OpenAI API docs: Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching) — exact prefix match and minimum cacheable length
- [OpenRouter help: Which providers stop billing when a stream is cancelled](https://openrouter.zendesk.com/hc/en-us/articles/51691588409883-How-do-I-cancel-a-streaming-request-and-which-providers-stop-billing-when-I-do) — cancelling a stream stops billing only on some providers
- [vLLM docs: OpenAI-compatible server](https://docs.vllm.ai/en/stable/serving/openai_compatible_server/) — self-hosted engines abort generation on client disconnect

