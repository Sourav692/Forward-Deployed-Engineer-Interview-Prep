# Model Routing and Prompt Discipline

*The strongest model is the safest default for quality and the most expensive one for everything else, so send each request to the weakest model that reliably handles it.*

The senior question is not "which model is best?" but "which is the weakest model that is reliable for this task, risk level, latency target and budget?" Route requests by that answer, and treat every prompt as a versioned production artefact whose size is a cost.

**Objectives:**

- route requests to models by task complexity and risk, and know what cascades cost;
- quantify what routing saves using a price table, without trusting stale digits;
- trim prompts and roll prompt changes out with a cost-impact check.

---

## Match Model Strength to Task Risk

Different jobs need different models. A cheap model can decide whether the premium one is needed at all. Extraction suits a small model or a constrained parser, validated against a schema. Summaries can use a cheaper model when factual risk is moderate and the source stays available for citation. Reserve strong reasoning models for multi-step judgement, gated by risk. Choose embedding models by domain recall, dimension, latency and storage. Use a reranker to gain precision without sending all context to the generator. Treat multimodal calls as expensive: try OCR or parsing first, and route pages, not whole files.

The playbook's trade-off is plain. Smaller models fit classification, extraction, routing and simple summaries. Avoid them for high-risk legal, financial, medical or security reasoning. Explain the choice to a customer as routing, not a downgrade: the premium model goes where it changes the outcome.

## Route by Complexity Before the Call

The single biggest cost lever is not sending every query to the most expensive model. The production-operations tutorial builds a router in which a cheap classifier labels each query "simple" or "complex" through structured output. A dispatcher then picks the cheap or the strong model.

```python
class QueryComplexity(TypedDict):
    complexity: Annotated[Literal["simple", "complex"], ..., "..."]

classifier = ChatOpenAI(model="gpt-4o-mini").with_structured_output(QueryComplexity)
# "simple" queries go to gpt-4o-mini, "complex" ones go to gpt-4o
```

Structured output binds the schema as a tool call, so the classifier cannot return free text. A `TypedDict` adds no local validation and suits a hot path. A Pydantic model costs a few microseconds and earns them when the output carries a bounded number, such as a confidence score. Set the routing threshold from a labelled sample of real traffic, measuring the cost saved against the error rate of misrouting.

## Know What Cascades Cost

Common patterns chain models: cheap, then medium, then premium; rules before any LLM; a gate on retrieval confidence; a cheap draft with a strong verifier; and a provider fallback with portable prompts and schemas.

Cascades have a hidden price. Provider prompt caches are scoped to one model. A three-model cascade means three cold cache prefixes, so each model pays full price for the shared context. Measure one strong model at lower effort before building the cascade.

## Put Numbers on the Routing Win

The companion notes give Anthropic prices as cached on 24 June 2026, per million tokens. Prices change constantly. State the mechanism in an interview, and say you would check current pricing for the digits.

| Model | Input $/MTok | Output $/MTok | Context |
|---|---|---|---|
| Claude Opus 5 | $5.00 | $25.00 | 1M |
| Claude Sonnet 5 | $2.00 | $10.00 | 1M |
| Claude Haiku 4.5 | $1.00 | $5.00 | 200K |
| Claude Fable 5.1 | $10.00 | $50.00 | 1M |

Two points follow from the table. Output costs about five times input, so output-length discipline outranks prompt trimming on chatty workloads. A router that moves 80% of traffic from Opus 5 to Haiku 4.5 cuts unit cost on that slice by about five times. That is what "model routing" is worth, in numbers.

## Use the Provider's Own Levers

The notes list controls the playbook never names. Each maps to a cost or latency problem.

| Problem | Provider lever |
|---|---|
| Nightly work at full price | A batch API at 50% of standard cost |
| Swapping models just to save tokens | An effort setting that trades thinking depth within one model and keeps one cache |
| Agents that stop abruptly at a hard step cap | An advisory task budget the model can see and pace against |
| History growing every turn | Context editing that clears old tool results, or server-side compaction |
| Tool definitions sitting in every prompt | Tool search with deferred loading |
| Parse-failure retries | Strict, schema-valid structured outputs |
| No exact token counts in CI | A token-counting endpoint |
| One executive demo must be fast | A premium fast mode, buying speed with money on one path |
| No data source for cost attribution | An admin usage and cost API |

## Treat Prompts as Production Artefacts

Prompt bloat is one of the most common hidden causes of rising cost and slow first tokens. Separate static instructions from dynamic content, so the static part can be cached and versioned. Remove instructions repeated across layers, which also removes instruction conflicts. Keep few-shot examples only where they move the evaluation score. Use structured output when a downstream system consumes it, but never so complex that it causes retries. Cap output length and allow expansion on request. Compress retrieved context while keeping source identifiers.

Roll prompt changes out like code. Run a regression evaluation, compare token usage before and after, and measure first-token and total latency, parse failures, retries and user corrections. Version every template, link incidents to versions, and keep a rollback path. Every prompt release should ship with a cost-impact report.

> **Warning: a context window is not a retrieval strategy.** A long window helps when a question truly needs broad evidence. Used as a substitute for good retrieval, it adds cost and distraction. Aim for the minimum sufficient context, not the maximum.

## Worked Example: Routing a Support Assistant

A support assistant sends every message to the strongest model. A cheap classifier now labels each message. Password resets, order status and policy look-ups go to the small model; disputes and multi-step troubleshooting go to the strong one. Measured on a labelled sample, most traffic turns out simple.

Using the price table, moving 80% of traffic from Opus 5 to Haiku 4.5 cuts that slice's unit cost about five times. The team also trims a system prompt that repeated its style rules three times, and caps default answer length. Quality on the evaluation set holds; misrouted complex questions are caught by a confidence threshold that escalates to the strong model.

The model choice became a routing policy with a measured error rate, not a downgrade argument.

---

## Key Takeaways

- Use the weakest model that is reliable for each task's risk, and present that to customers as routing.
- Route by complexity with a cheap structured-output classifier, and set its threshold from labelled traffic.
- Cascades forfeit prompt-cache savings because caches are per model, so test one strong model at lower effort first.
- Output tokens cost about five times input, and routing most traffic to a small model can cut unit cost about five times; check current prices before quoting digits.
- Treat prompts as versioned artefacts: remove duplication, separate static from dynamic parts, and ship each change with a cost-impact check.

## Check Yourself

<details>
<summary>1. Why might a three-model cascade cost more than expected?</summary>

Each model has its own prompt cache, so the shared context is uncached three times over.

</details>

<details>
<summary>2. On a chatty workload, should you trim the prompt or cap the output first?</summary>

Usually cap the output, because output tokens cost about five times as much as input tokens.

</details>

<details>
<summary>3. How do you pick the threshold between "simple" and "complex" for a router?</summary>

From a labelled sample of real traffic, weighing the cost saved against the error rate of misrouting.

</details>

