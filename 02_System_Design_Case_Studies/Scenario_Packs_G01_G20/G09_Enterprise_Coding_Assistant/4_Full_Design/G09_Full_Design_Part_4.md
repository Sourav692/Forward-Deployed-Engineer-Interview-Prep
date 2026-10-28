# Enterprise Coding Assistant Under 300 Milliseconds, part 4

## 15. Answer the Latency Pivot in Ten Minutes

The interviewer's pivot after a good design is "the completions are slow and the bill is rising." The dominant drivers are input tokens and output tokens inside a hard latency budget, and the answer is the self-drill card.

| | |
|---|---|
| Dominant driver | Output tokens and context size inside a hard latency budget |
| Cheapest lever first | Context funnel so only nearest files enter the prompt; prompt-prefix caching; small fast model for completions, strong model only for explicit refactors; cap completion length |
| Metric that proves it | First-token latency; tokens per completion; acceptance rate; cache hit rate |
| Do not | One big model for completions and chat alike |
| 60-second line | Completions are a latency product. Funnel the context, cache the prefix, keep completions short and fast, and reserve the strong model for the tasks a user waits for. |

Two drivers explain almost every cost surprise on this system. Input tokens grow when the funnel loosens: teams count the developer's cursor line and ignore the system prompt, the retrieved snippets and the history, so the bill rises with flat traffic and quality drops from distraction. The fix is to trim, compress, deduplicate and cache the static prompt parts, and to monitor first-token latency separately. Output tokens grow when completions run long: teams measure requests, not generated tokens. The fix is a max-token cap, concise templates and short defaults with expansion on demand, accepting that a cap set too low produces incomplete suggestions.

Every strong cost answer follows four verbs in order. Measure, by tracing latency and tokens by stage first. Route, matching model to task. Bound, with caps on context, completion length and timeouts. Cache safely, with the permission scope and the prompt version in the key.

---

## Level calibration

On this design the levels separate on what the answer owns beyond the 300 ms hot path, not on how fast the small model is.

| Level | Sounds like | Missing |
|---|---|---|
| Senior | Decomposes the 300 ms p95 as 10, 40, 200 and 50, then trims a stage for headroom. Puts a permission-scoped exact cache in front of retrieval, sends completion to the small model and explain or refactor to the larger one, and suppresses anything late or unvalidated. | Keeping the index honest: re-indexing on push with the permission mirror, refusing chunks with a stale ACL version, and what shows zero cross-repository leaks before release. |
| Staff | Adds the two-layer check, ACL metadata at indexing and a recheck at retrieval, and treats a cross-scope cache hit as an incident. Makes the leak and planted-secret suites a Security-owned release gate, runs silent mode first, then adds repositories one at a time while p95, acceptance and zero leaks hold. | What changes at 10×, where the index binds first, plus cost per thousand completions, a repointed model alias and whether acceptance proves productivity. |
| Principal | Treats every control-plane change as a release: versioned prompts, cache thresholds and validation rules, plus dated model snapshots with a nightly regression for a repointed alias. Makes training consent and private deployment contract terms, proves productivity against a matched control, and keeps any run-tests or open-PR chat mode a separate acting-agent surface off the completion lane. | The effect size worth paying for, the slow-path p95 and the semantic cache's false-hit budget depend on the customer's repositories and risk appetite, so they wait for discovery. |

## Key Takeaways

- The 300 ms budget and the private repository are the two constraints, and both are set before the first box is drawn.
- Requirements are stated so a test can fail them, with the budget decomposed by stage and leaks pinned at zero.
- Every context signal carries a cost and a permission, and retrieved code enters the prompt only under the code host's ACL.
- One diagram shows cache first, retrieve on a miss, route by task, with a hot path and a slow path that share the index and nothing else.
- Context engineering is a funnel from repository to signals to ranked context to prompt, and the repository is never sent.
- The semantic cache sits in front of the expensive path and never matches across permission scopes.
- The router sends completion to a small model and everything a developer waits for to a larger one.
- Validation checks syntax, hallucinated APIs against the symbol index, secrets, licence and unsafe patterns before anything reaches the editor.
- Ten, forty, two hundred, fifty is the budget said aloud, and streaming changes perceived latency only.
- Source code crosses the network once as the funnelled prompt and never lands in telemetry or training.
- Availability failures degrade to silence; permission failures fail closed.
- Acceptance rate is the product metric; a controlled comparison, with power decided in advance, proves productivity.
- Rollout starts with one repository, three developers and the leak test standing.
- The hour goes to the funnel, the cache, the budget and the security story.
- The latency pivot is answered with the funnel, the prefix cache, the small model and a completion cap.

## Check Yourself

1. **Why is the semantic cache placed in front of the embedding service rather than after retrieval?** A cache after the fan-out saves nothing; in front, a hit skips embedding, retrieval and often the large model.
2. **What does each stage of the funnel remove?** Repository to signals removes unrelated files; signals to ranked context removes distant history; ranked context to prompt fits the model's window.
3. **Decompose the 300 ms budget.** About 10 ms cache check, 40 ms context assembly, 200 ms streamed inference, 50 ms validation. That sums to the full 300 ms, so trim one stage to leave headroom.
4. **Why is "detect hallucinated APIs" on the validation list?** A completion that calls a method that does not exist looks correct until it compiles; the symbol index built at indexing time is what the check runs against.
5. **What correctness risk does a semantic cache carry that an exact-match cache does not, and what is the safest constraint?** Two requests close in wording can expect different answers, so a naive threshold serves a wrong answer confidently; never match across permission scopes or tenants.
6. **How does the enterprise RAG access-control problem reappear here?** Retrieved code is a document with an owner; mirror repository permissions into the index and re-check at retrieval, two layers.
7. **Which stage breaks first at 10×, and what is the fix?** In this design, I expect the index; shard vector databases across regions and repositories and re-index on push in the background.
8. **How is developer productivity proven, beyond acceptance rate?** A matched comparison of adopters and non-adopters on time-to-merge, rework and defects, with effect size and sample size decided in advance.
9. **What is the sixty-second latency answer?** Completions are a latency product: funnel the context, cache the prefix, keep completions short and fast, and reserve the strong model for the tasks a developer waits for.

## References

All paths are relative to the repository root.

| Section | Source |
|---|---|
| 1, 4, 5, 7, 8, 9, 10, 14 | `02_System_Design_Case_Studies/Classic_Design_Walkthroughs/Handbook_Casebook/03_Coding_Assistant.md` (the anchor, #3) |
| 2, 4 (fourteen components), 14 (follow-up bullets) | `02_System_Design_Case_Studies/Classic_Design_Walkthroughs/System_Design_Course/7. AI Powered Coding Assistant Design.md` (older source of the anchor) |
| 3, 8, 10, 12, 14 | `03_Practice_Worksheets_and_Keys/Problem_Decomposition_Bank/FDE_Problem_Decomposition_Question_Bank.md`, question 7 (#51) |
| 6, 9, 12 | `01_Concept_Tutorials/FDE_Handbook/06_Cross_Cutting_Concerns/03_Caching_Streaming_CICD_BuildVsBuy.md` |
| 8, 10 | `01_Concept_Tutorials/FDE_Handbook/06_Cross_Cutting_Concerns/04_Prompt_Injection_Egress_Tenancy.md` |
| 15 | `CASE_STUDY_INDEX.xlsx`, Drill Add-ons tab, self-drill row for #3; `01_Concept_Tutorials/Cost_and_Latency_Optimization/CORE_8_DRIVERS_MEMORIZE.md`, drivers 1 and 2 |
| 3 (permission mirror), 11, 13, and every item marked own construction | Built for this page from the sources' arguments; not source material |
| Not included | `04_AI_Coding_Tools/` is a planned phase about using coding tools, not designing one, and contributes nothing here |

### Fact-check sources (checked 27 Sep 2026)

- [ZenML LLMOps DB: GitHub's low-latency global code completion service (copilot-proxy talk, 2024)](https://www.zenml.io/llmops-database/building-a-low-latency-global-code-completion-service): GitHub talked about a sub-200 ms mean service target, not 300 ms; the 300 ms here is the case's own target
- [Shi et al. 2023, Large Language Models Can Be Easily Distracted by Irrelevant Context](https://arxiv.org/abs/2302.00093): irrelevant context can lower answer quality
- [Liu et al. 2023, Lost in the Middle](https://arxiv.org/abs/2307.03172): models use long contexts unevenly
- [Huang et al., Neural Code Completion Tools Can Memorize Hard-Coded Credentials](https://arxiv.org/abs/2309.07639): code models can emit memorised secrets, so output scanning lowers the risk but cannot promise "never"
- [GitHub Docs: GitHub Copilot code referencing](https://docs.github.com/en/copilot/concepts/completions/code-referencing): licence checks on verbatim public-code matches
- [OWASP GenAI LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/): injected text can steer output even when the model has no tools
- [OpenAI API docs: GPT-4o model page (snapshots)](https://developers.openai.com/api/docs/models/gpt-4o): a moving alias can be repointed; dated snapshots stay fixed
- [Claude docs: Models overview](https://platform.claude.com/docs/en/about-claude/models/overview): model IDs are pinned snapshots
