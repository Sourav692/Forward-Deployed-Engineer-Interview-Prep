# Prompt Versioning, Rollout, and Rollback

*Editing a prompt in place is the fastest way to change behaviour and the slowest way to recover from a bad change, so ship prompts like code with gates and a pointer to flip back.*

◷ 5 min

A prompt change is not a config tweak; it changes the behaviour of a system that may move money or answer contractual questions. Version every prompt, gate it on the same bar as a full release, stage it through shadow and canary, and keep rollback a pointer flip.

**Objectives:**

- treat prompts and their configuration as immutable, versioned artefacts;
- gate a new version on safety and quality against a named baseline;
- stage a rollout through shadow and canary, and roll back instantly.

---

## Version Prompts as Deployable Artefacts

Every prompt, and the configuration around it such as tool definitions and safety rules, is a versioned, deployable artefact. It is never a mutable string silently overwritten in source. Each version has an immutable identity, a history and a live pointer that says which version is serving.

The smallest version of this is a prompt version stamped on every trace. When answer quality shifts, the first question is whether the prompt changed. Versioned artefacts answer it. Without them, the answer is an archaeology project.

## Gate Every Version on the Release Bar

A new prompt version passes the same evaluation a full release would. Two gates apply.

**A safety gate that must hit zero.** No acceptable rate of leaked information and no acceptable rate of unsafe output. It is a hard block, not a review comment, for the same reason a security incident is never averaged into a quality score.

**A quality gate.** Accuracy and groundedness must not regress past a threshold against the version currently live, on the same fixed test set.

A version that fails either gate never reaches even a small slice of real traffic. The comparison is against a named baseline, the version serving now. "Did this regress?" then becomes a tracked comparison, not two numbers eyeballed.

## Stage the Rollout by Risk

| Stage | What happens | Risk to a real user |
|---|---|---|
| Shadow | The new version runs beside the live one on real traffic; both outputs are logged and compared offline | None; nobody sees the new output |
| Canary | A small percentage of traffic, or a few low-risk customers, see the new version; the same metrics are watched live | Bounded to the slice |
| Promote or roll back | Decided from the live metrics | None beyond the slice |

The canary metrics are watched live, not only checked at the initial gate.

## Make Rollback a Pointer Flip

Rollback must be instant and cheap. Switch which version handles new requests; do not redeploy. The version that was live five minutes ago is still there, ready to take traffic.

If rollback needs a build, it is not a rollback. It is a hot fix under pressure.

## Split A/B Tests per User, Safety Held at Zero

An A/B test serves two versions at once. Split by something stable per user, not randomly per request, so one person's experience does not flicker between versions mid-conversation. Compare on real outcomes: did the answer resolve the issue, did it need escalation, was it rated up. An internal quality score alone is not enough.

The safety gate is identical across both arms: zero. The test never compares leak rates. Both arms must already be at zero to be in the test at all. The safety bar does not get softer because the change is framed as an experiment.

## See the Whole Loop

```
  edit prompt
      │
  new version (immutable, hashed)
      │
  prompt unit tests ──fail──▶ fix
      │ pass
  golden-set eval vs named baseline
      │  security gate = 0?  quality no-regression?
      │──fail──▶ never reaches traffic
      │ pass
  SHADOW  (log both, compare offline)
      │
  CANARY  (small slice, watch live)
      ├──regress──▶ ROLLBACK = repoint the live pointer (instant)
      │
  PROMOTE  (repoint the live pointer)
      │
  nightly eval keeps running against the live version  ← catches provider drift
```

The nightly evaluation catches the change nobody on the team made: a provider altering what a model version points to.

> **Warning: a staged rollout is not an emergency brake.** Shadow, canary and promotion are deliberate, gated changes. When an incident needs everything stopped now, including work in flight, that is a kill switch with its own fast path; see [Scaling and Reliability](/learn/production-ai/scaling-and-reliability).

## Worked Example: Rolling Out a New Citation Prompt

A team rewrites the answer prompt to cite sources more strictly. The new text becomes version 14, immutable and hashed. Prompt unit tests confirm it still produces the required fields. The golden-set evaluation compares version 14 with the live version 13: zero leaks, and groundedness up with no accuracy regression.

In shadow, version 14 answers real questions in parallel; nobody sees its output, and the logs are compared offline. In canary, 5% of users, split by user ID, see version 14 while resolution and escalation rates are watched live. Escalations climb in the slice. The live pointer moves back to version 13 in seconds, with no build. The team investigates, and version 15 goes through the same loop.

The bad change reached 5% of users for a short time and cost nothing to undo. That outcome is the whole point of the discipline.

---

## Key Takeaways

- Treat every prompt and its configuration as an immutable, versioned artefact with a live pointer.
- Gate each version on a zero-tolerance safety check and a no-regression quality check against the named live baseline.
- Stage rollout through shadow, then a live-watched canary, then promotion.
- Rollback is an instant pointer flip to a version that never went away; anything needing a build is a hot fix.
- Split A/B tests per user, measure real outcomes and hold the safety gate at zero in both arms.

## Check Yourself

1. **Why is a prompt change a deployment rather than a config tweak?**
   It changes the behaviour of a system that may move money or answer contractual questions, so it needs versioning, gates, staging and rollback.

2. **Distinguish shadow from canary by the risk each exposes a real user to.**
   Shadow exposes nobody, because its outputs are only logged. Canary exposes a bounded slice of real users to the new version.

3. **Why split an A/B test per user rather than per request?**
   So one person's experience does not flicker between versions mid-conversation, which would confuse users and muddy the outcome metrics.

## References

**Sources:** `01_Prompt_Versioning_Rollout_Rollback.md` (FDE Handbook, AgentOps and platform): all sections, including "The whole loop", Interview lens and Checkpoint. `02_Observability_Standards_Failure_Patterns.md` (FDE Handbook): §7 kill switch versus staged rollout.
