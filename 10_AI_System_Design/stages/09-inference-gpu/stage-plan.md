# Stage 9 Plan: Inference and GPU Infrastructure

Begin with tested Stage 8 `v0.8-stage-08`, snapshot/state and ADR-008. Retain approved versioned release routes, current security/audit/egress, saved operation identity, recovery/unknown states, source/citation/cache safety and fair provider budgets. Compare hosted versus self-hosted generation for the same supplier workflow under policy, latency and cost constraints.

First-teach 7.2 gateway/provider management D3; 9.1 inference execution D2; 9.2 serving architecture D2; 9.3 inference optimisation D1; 10.1 GPU fundamentals D1; 10.2 distributed GPU execution D1; 10.3 GPU infrastructure/scheduling D1; 16.1 containers/orchestration D2. Apply every mapped revisit through changed inference constraints, not full repeated tutorials. Do not expand D1 topics into kernel or multi-GPU training courses; fine-tuning stays in Stage 10.

Choose an approved logical Model Gateway with typed model/tenant/network policy, token/context/output envelopes, readiness, shared quotas and stable durable operation replay. Demonstrate composition of actual Stage 5 Gate, Stage 6 Security and Stage 8 Releases. Unknown transport results do not auto-fallback. Same-key committed replay uses original source references/current access and keeps its original bundle despite a release change.

The GPU lab is single-device arithmetic only: hypothetical 8B dense parameters, 32 layers, 8 KV heads, head dimension 128, FP16 KV, assumed 4 GiB runtime reserve. Four controls vary context, active sequences, weight bits and VRAM. Explain prefill/decode, TTFT/ITL, KV growth, batching, quantisation, replicas versus sharding, placement/readiness/drain and hosted/self-host economics without invented benchmarks/prices.

Five phases, two checkpoints, six-step gateway walkthrough, memory cases, four interview drills, unassessed depth-specific gates, snapshots/ADR and clean package. Estimate six to eight integrated hours with GPU specialisations explicitly deferred. Stop after Stage 9.
