# 50 Coding Problems: AI-assisted coding round practice

Fifty small Python problems set in real GenAI work: webhooks, CRM data, RAG retrieval, rate limits, agents and incidents. They are grouped into five levels. Each level has four notebooks with up to three problems each, and every notebook has a theory file with the ideas behind it.

The pack is built for an AI-assisted coding round. In that round the interviewer watches how you plan, how you steer the AI with narrow prompts, how you read and check its code, and how you explain the result. Typing speed matters less.

## Levels

| Level | Problems | What it trains |
|---|---|---|
| [Level 1: Python fundamentals](Level_1_Python_Fundamentals/README.md) | 1-10 | Cleaning and checking untrusted input: webhooks, CRM records, tool arguments, PII, prompts |
| [Level 2: Enterprise data processing](Level_2_Enterprise_Data_Processing/README.md) | 11-20 | Chunking, permissions, reconciling systems, logs, duplicates, audit trails |
| [Level 3: RAG and retrieval](Level_3_RAG_and_Retrieval/README.md) | 21-30 | Ranking, top-k search, stale embeddings, access control, packing a context window |
| [Level 4: Production GenAI systems](Level_4_Production_GenAI_Systems/README.md) | 31-40 | Rate limits, retries, caches, queues, quotas, timeouts, cost alerts |
| [Level 5: Senior FDE scenarios](Level_5_Senior_FDE_Scenarios/README.md) | 41-50 | Evaluation, agent tool safety, workflow state, fallbacks, approvals, SLAs, incidents |

## How to work through a notebook

1. Read the theory file first. It takes about ten minutes.
2. For each problem, read the situation and say your plan aloud before you write any code.
3. Give your AI assistant the narrow prompt in the notebook, or write your own. Read every line it returns before you run it.
4. Run the checks cell. When a check fails, find the cause and fix it with a small, specific follow-up prompt.
5. Only then open the reference solution. Practise the "Explain it in 30 seconds" answer out loud.

Each starter cell raises `NotImplementedError` until you fill it in. The checks cell prints "Not implemented yet" rather than crashing, so the notebook always runs top to bottom.

## Running the notebooks

The notebooks use only the Python standard library (3.10 or newer). Any Jupyter setup works. With `uv`:

```
uv run --with jupyterlab jupyter lab
```

## Related material

- `../AI_Assisted_Coding_Round/AI_PROMPT_PLAYBOOK.md`: how to steer and verify an AI assistant during the round.
- `../AI_Assisted_Coding_Round/RUBRIC.md`: a self-scoring rubric for a timed attempt.

The problem set follows the order of *50 GenAI FDE Python Problems With Reference Solutions* (Tobias Weissmann). The explanations, prompts and code here are rewritten for practice.
