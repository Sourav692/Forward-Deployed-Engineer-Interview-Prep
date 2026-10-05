# Testing Prompt Changes

*A full evaluation suite catches every kind of regression slowly, while cheap unit checks catch the common ones in seconds, so run the cheap layer first and the expensive one on a schedule too.*

◷ 6 min

Evaluation is not one gate run once. Layer fast deterministic tests in front of the expensive suite, compare live versions with enough samples to trust the result, and rerun the suite nightly because the model can change without a commit.

**Objectives:**

- test prompts and LLM-calling code with fast, deterministic checks;
- run A/B tests on prompts, retrieval and models with statistical discipline;
- schedule regression runs and token-budget checks that catch changes nobody committed.

---

## Check That the Prompt Even Parses

A full evaluation asks whether the answer sounds right, is grounded and is safe. It is expensive and slow to run on every change. A cheaper layer sits in front: does this prompt, alone, produce output that parses for a small set of known inputs? It checks the right structure, every required field present and nothing malformed.

This is the type check before the test suite. It is fast and cheap, and it catches broken templates and missing variables that the full suite would also catch, much later. It runs on every prompt change, before the real evaluation starts. It is a first gate, not a replacement.

## Unit-Test the Code Around the Model

LLM-calling code still needs fast, deterministic unit tests. Keep the real API out of them. The production-operations tutorial injects the LLM as a constructor argument, so a test can pass a mock with a fixed return value.

```python
mock_llm = Mock()
mock_llm.invoke.return_value = AIMessage(content="Paris")
chain = QAChain(llm=mock_llm)
assert chain.ask("What is the capital of France?") == "Paris"
mock_llm.invoke.assert_called_once()
```

The test exercises the chain's own logic, prompt formatting and response handling, with zero network calls. Dependency injection is what makes this possible. Without an `llm=` argument, there is no way to substitute a mock. Every test then either hits the real API or does not exist.

## Compare Prompts, Retrieval, and Models in A/B Tests

In a normal product, an A/B test compares two buttons by clicks. In a RAG or agent system the two versions are things like two prompts for the same step, two retrieval strategies such as plain search against search plus reranking, or two models for the final answer.

Real users or tenants are split between the versions, and outcomes are compared. Did the answer resolve the question? Did it escalate to a human? Did the user rate it up or down? Was it accurate against the test set? The mechanics are those of any A/B test; only the things compared differ.

## Decide the Sample Size Before the Test

LLM output varies. The same question with the same prompt can give two slightly different answers. Testing two prompt versions on a handful of examples means "version B scored a bit higher" may be noise. The risk is larger than for a click metric, because LLM answers vary more.

The fix is ordinary statistics. Before the test, decide how big an improvement would actually matter. Then test on enough examples to tell an improvement of that size from noise. Do not declare a winner before reaching that number. The rule is easy to state and easy to skip in a hurry, which is why a rehearsed answer helps.

## Rerun the Suite on a Schedule

A gate that runs only when the team changes a prompt misses a real risk. A model provider can silently change what a model version points to, with no change on the team's side. Accuracy or safety can drift with zero commits to explain it.

Run the same evaluation suite nightly, independent of code changes, against the last known-good baseline. The suite does not need rebuilding. It needs a second trigger: a schedule as well as a code-change hook, because the thing that can regress is not only the team's own work.

## Gate Prompts on Tokens, Not Just Quality

Prompt changes are production changes for cost too. A prompt release can raise input tokens and first-token latency with no change in quality. Add token-budget checks to CI. A token-counting endpoint gives exact counts, so a regression test can fail when a template grows past its budget. Ship each prompt rollout with a cost-impact report.

> **Warning: a high pass rate on a small sample proves little.** With LLM variance, a few examples cannot separate a real improvement from noise. Fix the effect size and sample size first, and do not stop early.

## Worked Example: Two Answer Prompts for a Support Bot

A team has two answer prompts, A and B. Both pass the parse tests on known inputs, and the unit tests with a mocked model confirm the formatting code handles each output shape. CI counts tokens: B is longer but within budget.

Before the A/B test, the team agrees how large a gain in resolution rate would matter. They work out how many conversations are needed to detect it, and split users stably between A and B. After a week, B is ahead, but the sample is not yet reached, so nobody calls it. At the target sample size the gain holds, and B is promoted through the normal gates.

Two weeks later, the nightly run shows groundedness slipping with no commits. The provider has updated the model behind the version name. The team's own tests would never have caught it; the schedule did.

---

## Key Takeaways

- Run prompt parse tests on every change as a cheap first gate before the full evaluation.
- Inject the LLM so unit tests can use a mock and run with no network calls.
- A/B test prompts, retrieval strategies and models on real outcomes such as resolution and escalation.
- Fix the meaningful effect size and the sample size before an A/B test, and never stop early.
- Rerun the evaluation suite nightly to catch provider-side changes, and gate prompt changes on token budgets in CI.

## Check Yourself

1. **What does a prompt parse test catch, and what does it not replace?**
   It catches broken templates, missing variables and malformed output quickly. It does not replace the full evaluation of quality, grounding and safety.

2. **Why is statistical rigour more important for LLM A/B tests than for button tests?**
   LLM outputs vary even for identical inputs, so small samples confuse noise with improvement more easily.

3. **Why does an evaluation suite need a nightly trigger as well as a code-change hook?**
   The provider can change what a model version points to with no commit on the team's side, so quality can drift without any change to trigger the gate.

## References

**Sources:** `03-cost-latency-cicd-rigor-and-build-vs-buy.md` (Production and Platform Judgment): §3 nightly regression runs, §4 A/B testing for a RAG or agent system, §5 statistical rigour, §6 unit-level testing for prompts. `12_production_and_operations_INTERVIEW_TUTORIAL.md` (RAG and Agent Topic Guides): §1.20 unit testing with mocks. `CRAM_SHEET_S15_S16.md` (notes on the third-party *GenAI FDE Cost and Latency Optimization Playbook*): incident 10. `ADDITIONS_BEYOND_PLAYBOOK.md`: §A3 token-counting endpoint for CI checks. Playbook content is summarised in new words.
