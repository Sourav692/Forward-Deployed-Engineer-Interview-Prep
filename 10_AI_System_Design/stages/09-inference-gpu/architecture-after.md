# Stage 9 Architecture Snapshot

Version: `v0.9-stage-09`. Previous: `v0.8-stage-08`. Decision: [ADR-009](../../architecture/decisions/ADR-009-approved-inference-boundaries.md). Acceptance: tested local Gateway composition and memory arithmetic, not a GPU/provider deployment.

Retain verified current identity/resource policy, mandatory audit, approved egress, versioned retrieval/cache safety, scoped durable history and stable operation keys, worker/recovery/unknown rules, fair admission/provider budgets and version-bound release gates. Extend Model Gateway with trusted profile/approved route/readiness/private-path checks, model context/output envelope, original-bundle replay and explicit transport/result uncertainty. Introduce self-host engine/GPU replica/shard/placement roles only as a proposed serving alternative.

The actual local slice composes Stage 5 Gate, Stage 6 Security and Stage 8 Releases plus a durable inference-operation table and injected transport. Fresh grants dispatch once in the fixture; duplicate/incomplete/unknown operations do not automatically invoke another model. Current checks apply to every original source used in a saved replay. Final write failure never acknowledges completed success, and can strand a reservation for reconciliation.

A single-device worksheet estimates raw weights, FP16 KV and an assumed runtime reserve. It is not hardware profiling, tokenisation, a quality test, actual private routing, multi-GPU execution, GPU isolation, a container/device-plugin deployment, load/SLO measurement or current pricing evidence. Depth stays D3 Gateway, D2 execution/serving/orchestration and D1 GPU/optimisation boundaries.

Stage 9 is the latest authored stage. Stage 10 has not been created; future customisation must preserve approved data, release, serving and external-outcome contracts.
