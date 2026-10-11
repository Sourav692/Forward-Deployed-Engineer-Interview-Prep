# Gate Releases on Quality

*Every extra quality gate slows a release and costs money, yet a GenAI change can make answers worse without failing a single unit test.*

Passing tests do not prove a GenAI release is safe. Add an evaluation stage to the pipeline, then stack cheaper and broader checks around it so each kind of regression meets the gate that catches it.

**Objectives:**

- lay out a five-stage CI/CD pipeline with a GenAI evaluation stage;
- order the four rungs of the testing ladder from cheapest to most expensive;
- explain why a scheduled evaluation run is needed even when nothing in your code changed;
- run an A/B comparison with enough examples to trust the result.

---

## Add an Evaluation Stage to the Pipeline

A prompt or model change can quietly make answers worse without any unit test failing. So the pipeline needs a quality gate that measures answers, not just code. Build it in five stages:

1. **Unit and integration tests**, with pytest.
2. **An evaluation stage**, the GenAI-specific part. Run the service on a golden evaluation set and fail the pipeline if a metric such as faithfulness drops, for example by more than 5% from baseline.
3. **Build** the Docker image and push it to a registry.
4. **Deploy to staging** and run smoke tests.
5. **Release to production** with manual approval: a canary deployment to about 10% of traffic, canary monitoring, then full rollout.

GitHub Actions and `kubectl` are the tools named for this pipeline. [Roll Out Changes Gradually](/learn/engineering-foundations/cloud-containers-deployment/roll-out-changes-gradually) covers stage 5 in depth.

## Put a Cheap Prompt Test in Front

A full evaluation suite checks that answers are grounded, safe and correct. It is expensive and slow to run on every change. A cheaper layer sits in front of it: for a small set of known inputs, does this prompt produce output that parses correctly, with the right structure and every required field?

This is the type check before the full test suite. It catches a broken template or a missing variable fast and cheaply. The expensive suite would catch the same failure, far more slowly. Run the prompt unit test on every prompt change, before the real evaluation starts. It is a first gate, not a replacement.

## Run the Same Evaluation on a Schedule

A gate that fires only on a team's own changes misses a real risk. The model provider can silently change what a model version points to. Nothing changes in the repository. Accuracy or safety then drifts with zero commits to explain it.

Run the same evaluation suite on a schedule, nightly for example, independent of any code change. Compare each run with the last known-good baseline. The harness already exists; it only needs a second trigger. A diff of `leak_count`, `refusal_accuracy` and `groundedness` against yesterday is also the simplest drift detector available.

## Test Variants in Production With Enough Examples

In a RAG or agent system, an A/B test compares two prompts for the same step, two retrieval strategies, or two models doing the same job. Real users or tenants are split between them. The outcomes are concrete: did the answer resolve the question, did it need escalation, was it rated up or down, and was it accurate against the golden set?

LLM outputs vary. The same question with the same prompt can produce two slightly different answers. So "B scored a bit higher" on a handful of examples may be noise, and the risk is larger than for a click metric. Decide in advance how big an improvement would matter. Test on enough examples to tell an improvement of that size from noise. Do not declare a winner early.

The Handbook's own example makes the point: 22 cases cannot distinguish 0.958 from 1.000. A table built on 22 cases is not evidence that one strategy helps.

> **Warning: a clean pipeline is not a stable product.** A provider can change a model under a pinned name, and a change-triggered gate will never fire. Without a scheduled run, the first sign of drift is a customer complaint.

## Worked Example: One Prompt Change Through the Ladder

An engineer edits the summarisation prompt of a support assistant.

The prompt unit test runs first. It renders the template for five known inputs and checks that each output parses with all required fields. A missing variable would fail here in seconds.

The pipeline then runs unit and integration tests and the golden-set evaluation. Faithfulness falls 3% from baseline, inside the 5% limit, so the image is built, deployed to staging and smoke-tested. After manual approval, a 10% canary runs and is monitored before full rollout.

That night, the scheduled evaluation runs again with no new commits, and every night after. A month later, `groundedness` drops overnight with no change in the repository. The nightly diff points to provider drift, not to the prompt edit.

Each rung caught a different failure: a broken template, a quality regression, and drift nobody committed. That division of labour is the reason to build the whole ladder rather than one big gate.

---

## Key Takeaways

- Add an evaluation stage on a golden set to CI/CD, failing the build when a metric such as faithfulness drops past a set margin.
- Run prompt unit tests on every prompt change as a fast, cheap first gate before the full suite.
- Run the same evaluation on a schedule, because a provider can change a model with zero commits on your side.
- A/B test prompts, retrieval strategies or models on real users, with a sample large enough to tell signal from noise.

## Check Yourself

1. **Give the four rungs of the testing ladder from cheapest to most expensive.**
   Prompt unit tests, golden-set evaluation on change, scheduled evaluation such as nightly, then A/B testing in production.

2. **What can regress with zero commits, and what is the fix?**
   The model behind a provider's version name can change silently. Run the same evaluation suite on a schedule and compare with the last known-good baseline.

3. **Strategy B scores 1.000 and strategy A scores 0.958 on 22 cases. Is B better?**
   You cannot tell. Twenty-two cases are too few to separate those scores from noise; decide the meaningful effect size first and test on enough examples.

