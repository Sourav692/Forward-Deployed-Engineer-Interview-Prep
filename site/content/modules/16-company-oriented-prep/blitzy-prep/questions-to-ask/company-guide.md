# Questions to Ask the Blitzy Interviewer

Style: direct, specific, trade-off framed. Each question **opens with something you learned** ("I noticed…", "From the docs…") so it shows you've done your homework, then asks about the trade-off behind it.

## How to use

| Rule | Why |
|---|---|
| Ask 2–3 per round, not 10 | Depth beats volume |
| Round 1 (technical): pick from A, B | Engineers like mechanism questions |
| Round 2 (enterprise / leadership): pick from C, D, E | Leaders like market, customer and role questions |
| Listen, then ask **one follow-up** | The follow-up is what shows real interest, not the first question |
| Never claim a competitor is worse | Ask how they see the trade-off, so you come across as curious, not partisan |

## ⭐ If you only ask five

| # | Question |
|---|---|
| 1 | "The Agent Action Plan seems to be the real control point, since jobs can't be cancelled once generation starts. Do customers treat AAP review as a rubber stamp or as real architecture review? And what does Blitzy do when a reviewer approves a plan that turns out to be wrong?" |
| 2 | "Blitzy runs 100K+ model calls per run across three model providers. As frontier labs ship their own long-horizon agents, where does the moat sit: the knowledge graph, the orchestration, or the validation environments?" |
| 3 | "In POCs, what's the most common failure point: environment replication (private deps, build steps), Tech Spec quality, or the customer's review capacity for large PRs?" |
| 4 | "For a COBOL-to-Java migration, how do you prove behavioural equivalence to a risk committee? Is it parallel runs, golden-output diffs, or something built into the platform?" |
| 5 | "How do FDE learnings flow back into the product? If I see the same failure at three customers, does it become a Rule template, a platform change, or does it stay as tribal knowledge?" |

---

## A. Product mechanics (deep dive)

| Question | What it signals | Follow-up if they answer… |
|---|---|---|
| "The docs say agents use **source code as the source of truth, not the Tech Spec**. So if the spec drifts from the code, what breaks first: plan quality or generation quality?" | You read the FAQ closely | "…plan quality" → "Is there a drift detector, or does the FDE own spec hygiene?" |
| "How does the knowledge graph stay current on a monorepo with hundreds of merges a day? Is it re-ingested incrementally per commit, or rebuilt in batches?" | Scaling instinct | "What's the staleness window, and can a run be pinned to a snapshot?" |
| "Validation runs in isolated environments wired to the customer's pipelines. When a customer's build only works on a developer's laptop, who fixes that: Blitzy, the FDE, or the customer?" | You know where the real friction is | "How long does environment setup take in a typical POC?" |
| "When the platform decides something belongs in the remaining 20%, how is that decided? Is it confidence-based, missing information, or failing validation?" | You care how the boundary is drawn, not just the 80% headline | "Do customers ever push back that the 20% was the hard part?" |
| "With 3M+ lines of output, how do you keep PRs reviewable? Stacked PRs by component, or one PR plus the project guide?" | Reviewability trade-off | "Have you seen customers reject good code because the PR was too big to review?" |
| "By default it applies modern idioms, like virtual threads on a Java 21 upgrade. How often does that surprise customers, and should 'minimal change' be the default for regulated customers?" | Modernization vs. predictability | — |
| "QA agents review each other's output. How do you avoid correlated errors when the reviewer and the author share the same model family?" | Deep AI-eval thinking | "Is reviewing with a different model provider part of the design?" |

## B. Trade-offs in autonomy vs. control

| Question | What it signals |
|---|---|
| "Where do you see customers drawing the auto-merge line? Tests and docs only, or does anyone let business-logic PRs through on CI alone?" | Risk-tiering mindset |
| "Rules like *preserve-backward-compatibility* constrain generation. Is there a measurable quality or throughput cost as customers stack more rules?" | Constraint vs. capability trade-off |
| "Jobs aren't cancellable and consume quota. Is that a deliberate design choice for long-horizon consistency, or a current limitation? How do FDEs de-risk the first expensive run?" | Turns a product limitation into an engineering question |
| "Secrets never reach the agents, but runtime validation needs them. How is that boundary enforced at execution time?" | Security depth (CISO conversations) |
| "Does the platform store embeddings only, as the security page says? What does that mean for reproducibility if a customer asks why the agent made a particular change six months later?" | Auditability vs. data minimization |

## C. Competition and Blitzy's edge

| Competitor framing | Question to ask |
|---|---|
| **Devin / Factory** (autonomous agents, ticket- or CI-driven) | "Devin and Factory go after continuous, ticket-level autonomy, while Blitzy goes after batch, epic-level work. Do you see customers using both, Blitzy for the big modernization and an agent for the daily backlog, or does Blitzy aim to own the backlog too?" |
| **Cursor / Claude Code / Codex / Copilot coding agent** (developer-driven agents) | "Most enterprises already have one of these. When a CTO says 'we already pay for Copilot,' what's the one-sentence answer that works? Is it context scale, asynchronous throughput, or validation?" |
| **Amazon Q Transform / IBM** (vendor modernization tools) | "Cloud and mainframe vendors bundle modernization tools with their platforms. Does being vendor-neutral win deals, or does the bundled discount usually win?" |
| **Moderne / OpenRewrite** (deterministic refactoring recipes) | "For mechanical migrations like framework upgrades, deterministic recipes are provably correct. Does Blitzy ever combine with recipe-based tools, or replace them? Where is the LLM approach clearly better?" |
| **Frontier labs** (also Blitzy's model suppliers) | "You orchestrate Anthropic, OpenAI and Google models. How do you think about depending on suppliers who are also building competing agents?" |
| **SIs** (Accenture, TCS, Infosys) | "Are large SIs partners or competitors? If Blitzy does 80% of a modernization, does the SI become the delivery partner for the remaining 20%?" |
| **Benchmarks** | "SWE-Bench Pro is task-level. What internal metric do you trust more for enterprise-scale work: merged-PR rate, post-merge defect rate, or human hours saved per project?" |

## D. The FDE role at Blitzy

| Question | What it signals |
|---|---|
| "The pricing tiers attach FDEs from Enterprise upwards. Is the FDE mainly there to land the POC, or embedded long term to drive org-wide adoption?" | You read the commercial model |
| "What separates an FDE who's great here from one who's great at a copilot or data company? Is it legacy-systems depth, change management, or prompt and spec craftsmanship?" | Self-awareness about fit |
| "How is FDE success measured: POC conversion, expansion revenue, lines generated, or customer engineering velocity?" | Outcome orientation |
| "What does a strong first 90 days look like? Shadowing a live engagement, or owning a POC early?" | Ownership |

## E. Closing questions (show genuine interest)

| Question | Why it lands |
|---|---|
| "What's an engagement where Blitzy *didn't* work well, and what changed in the product afterwards?" | Shows you want the real story, not the pitch |
| "What problem is the research team most excited about this year: longer horizons, better validation, or cheaper inference?" | Interest in where the product is going |
| "If I joined and could fix one recurring customer pain in the first quarter, which one would you hand me?" | Signals you'd act early |
| "What made *you* choose Blitzy over other agentic-coding companies?" | Personal, builds rapport; you learn the real culture |

---

## Lines to weave in (prove you've used or read the material)

| Mention naturally | Shows you know |
|---|---|
| "WHY / WHAT / HOW prompt template" | The prompting model |
| "Tech Spec → Agent Action Plan → PR → merge, close or refine" | The lifecycle and its review gates |
| "`.blitzyignore`" and "Rules at org, team or individual level" | Control surfaces |
| "Reverse-engineer-only engagements as a documentation entry point" | The commercial land motion |
| "$0.10 per line onboarded / $0.20 per line generated" | Unit economics. Use carefully, only if it's relevant |

> Caveat: product details come from Blitzy's public site and docs. If an interviewer corrects one, take it well: "Good to know, the docs suggested X." Being corrected gracefully also shows genuine interest.
