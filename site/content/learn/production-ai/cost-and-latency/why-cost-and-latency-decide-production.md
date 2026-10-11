# Why Cost and Latency Decide Production

*A demo can afford to ignore spend and speed, but a production rollout that ignores them gets cancelled even when the answers are good.*

Most GenAI pilots that fail in production do not fail on quality. They fail because the bill and the wait grew faster than anyone planned, so measure the whole workflow and remove its largest bottleneck before touching the model.

**Objectives:**

- explain why a working demo hides the cost and latency of production;
- write cost and latency as sums of components along the request path;
- translate an executive's concern into the engineering control that answers it.

---

## See What the Demo Hides

A demo runs with one user, a warm cache and clean data. That hides four things. It hides the shape of real traffic. It hides the tail: P95 and P99 latency, not the average. It hides usage growth, because real users ask longer questions and upload bigger files, so tokens grow faster than request count. And it hides governance work: security review, audit logging, evaluation, human review and support.

A real user action is also rarely one model call. Routing, query rewriting, retrieval, reranking, generation, evaluation, summarisation, safety checks and tools can all fire for a single click. A demo bill that looked small multiplies once each step runs at production volume.

## Know Why Slow Kills Adoption

Users accept a wait for complex, rare, high-value tasks. They reject it for conversational, repetitive, operational work. A slow pilot also creates political risk. Stakeholders conclude that GenAI is not ready, even when the answers were good.

So latency is not only a UX metric. It decides whether the project survives the pilot.

## Write Both as Sums Along the Path

The cost and latency playbook reduces both problems to two sums. End-to-end latency adds up auth, routing, retrieval, reranking, prompt construction, queue time at the model, inference, tool and API calls, post-processing and the network return. Cost per request adds up input tokens, output tokens, embedding and retrieval, reranking, tool and API fees, infrastructure share, and logging and evaluation overhead.

```
latency = auth + routing + retrieval + rerank + prompt build
        + model queue + inference + tools + post-processing + network

cost    = input tokens + output tokens + embeddings/retrieval + rerank
        + tools/APIs + infrastructure + logging/evaluation
```

Every later lesson in this module expands one term of these sums. A model that cannot run faster than its slowest upstream step is not the bottleneck. So never optimise the model alone: break the workflow into measured parts, then remove the biggest one first.

## Translate Executive Worries Into Controls

Executives rarely ask about tokens. They ask business questions, and each one maps to something an engineer can build.

| What the executive is really asking | What answers it |
|---|---|
| Is the value worth the spend? | Cost per resolved ticket or per document, hours saved, deflection rate |
| Can we budget this safely? | Per-tenant budgets, token limits, quotas, anomaly alerts, routing rules |
| Will people actually use it? | Perceived latency, workflow fit, reliability, explainability |
| Will it leak data or break compliance? | Permission-aware retrieval, audit logs, cache controls, human approval |
| Will it work beyond the pilot? | Load tests on realistic traffic, P95 and P99, cost curves before rollout |

## Hold the Senior Mental Model

The playbook closes with a ten-point stance. Measure before changing anything, using traces, cost attribution, token metrics and percentiles. Break latency into components and cost into drivers. Fix the workflow before the model, through routing, async design, caching and fewer steps. Use the smallest model that meets the bar for the task. Cache only with tenant and permission safety. Give agents step limits, tool budgets and stopping rules. Set budgets per tenant, feature, user and path. Present trade-offs as options with risks. Tie every optimisation to adoption, ROI, reliability or security.

> **Warning: optimising before measuring is the classic mistake.** Swapping in a cheaper model or trimming the prompt without traces often cuts the wrong cost. It can also cut quality where it mattered.

## Worked Example: The Pilot That Was "Too Slow"

A pilot assistant gives good answers but takes too long, and the sponsor is losing interest. The weak response is "use a faster model."

The measured response decomposes the request. Traces show auth, retrieval, reranking, prompt build, first token, generation and tool calls separately. Suppose retrieval and an unconditional reranker take most of the time, and the model is a minor share. A faster model would have saved little; gating the reranker and trimming top-k saves most of it.

The playbook frames the conversation with the sponsor the same way. The pilot showed useful quality but not production-ready latency. That is an engineering optimisation problem, not a failure of the use case.

---

## Key Takeaways

- Demos hide traffic shape, tail latency, usage growth and governance cost, and one user action fans out into many calls.
- Latency decides adoption for frequent work and creates political risk in a pilot.
- Model cost and latency as sums along the request path, and remove the largest measured term first.
- Answer each executive concern with a specific control: unit cost, budgets, perceived latency, permission-aware design or load tests.
- Measure first, fix the workflow before the model, and present trade-offs as options.

## Check Yourself

1. **Why do tokens often grow faster than request count after rollout?**
   Real users ask longer questions and upload larger files, and one action triggers several calls such as rewriting, retrieval, reranking and safety checks.

2. **A sponsor asks "can we budget this safely?" What do you build?**
   Per-tenant budgets, token limits, quotas, anomaly alerts and routing rules, so spend is predictable rather than open-ended.

3. **Why is "never optimise the model in isolation" a rule rather than a preference?**
   Latency and cost are sums over many components. If retrieval or tools dominate, a faster or cheaper model barely moves the total.

