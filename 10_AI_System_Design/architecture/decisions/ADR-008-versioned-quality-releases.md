# ADR-008: Versioned Quality Evidence and Controlled Release Pointers

Status: accepted educational architecture. Stage: 8. Date: 2026-11-02. Supersedes: none; preserve ADR-001–007 safety/recovery/runtime contracts.

## Situation and Alternatives

A healthy request path can return a wrong supplier rule or an unauthorised answer after a prompt/retrieval/model change. Compare global immediate replacement, offline evaluation, constrained shadows, eligible sticky canaries and human approval. Choose immutable bundle/dataset/evaluator/gate identities, slice-aware offline checks, and a trusted staged release pointer. A fixture pass is not production approval.

## Decision

Bind report to prompt, retriever, index, model, policy, dataset digest, evaluator and gate version. Reject missing/duplicate outputs, invalid metrics and mismatched versions. Keep zero known safety violations independent of aggregate quality and synthetic latency/cost gates. The approved teaching gate cannot be weakened by submitting a differently configured report for the same bundle.

Use stable eligible tenant/user cohorts. Shadows may compare behaviour only under authorised data/egress/budgets and no business side effects. Generation-checked pointer updates prevent stale promotions. Withdrawing a canary retains current stable; reverting a completed promotion uses prior approved stable. Saved answers, source tombstones, current permissions and unknown effects are never rewritten by routing rollback.

## Evidence and Limits

Eight JSON cases and precomputed outputs exercise deterministic scoring, not model inference or measured cost/latency. Fourteen tests cover slices, known safety, invalid coverage/metrics, version/gate binding, release CAS, cohorts, rollback with actual Stage 7 result persistence, shadow policy and redaction. The controller assumes trusted evaluation/control-plane callers; artifact attestation, calibrated judges/human approval, real rollout, collectors and representative statistical evidence remain unimplemented.

## Operations and Revisit

Observe bounded bundle/cohort outcomes with protected trace/log IDs, not raw source or arbitrary high-cardinality labels. Diagnose source/evaluator/population changes before attributing regression to a model. Stage 9 must route only approved policy-compatible inference configurations and preserve budgets, current authority and remote-outcome uncertainty.
