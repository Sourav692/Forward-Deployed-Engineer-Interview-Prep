# Ownership - Answer Key

Spoken answers - 4 grounded, 2 partly grounded. Deliver them in your own cadence; the wording is a script, not a recitation.

## 1. Company's interests over your own career

**CEO-ready answer.**

> "I chose the customer's production risk over a better story for my own profile. At a large insurer, the platform's new managed multi-agent feature was the obvious thing to showcase. It wasn't an option for this customer at the time. So I hand-built the supervisor on standard platform pieces. That meant more code to own and less visible product adoption on my record. But the company wins on durable production usage, not on a demo. Adoption grew after rollout. When I report that, I say it is correlated, not proven. The uncaveated version would look better for me. It would also be less true."

**Technical-interviewer answer.**

> "The technical decision was build versus wait. The managed multi-agent feature wasn't available to this customer, so I built the supervisor as an 8-node LangGraph state machine. It classifies intent with a confidence score and asks a clarifying question below 60%. It resolves governed assets once through a central context index. Then it routes to one of four specialists and composes the answer. I used managed services where they were good enough. Text-to-SQL went to a managed service, because its SQL is read-only and the analysts could curate it. Every node was traced in MLflow. The cost is code we own, test and maintain. Adoption grew after rollout. I report that as correlated, because there was no controlled comparison."

**PARTLY GROUNDED — a large Asian life insurer (hand-built supervisor + honest attribution).**

*"At the insurer, the platform's own managed multi-agent feature was the natural thing to showcase — it's the managed version of exactly the pattern I needed, and demoing the newest product feature to a big insurer is good for an FDE's profile. But the managed multi-agent feature wasn't an option for this customer at the time, so I hand-built the supervisor.*

*I built it in LangGraph on standard platform pieces — Agent Framework, Model Serving, Genie, Vector Search, Metric Views, MLflow tracing. That's more code to own, less visible product adoption on my part, and a less flattering story internally than 'customer adopted the new feature.' But the company's real interest is a production system that doesn't depend on a timeline nobody controls — and durable usage. Adoption grew after rollout.*

*And when I report that growth, I say plainly it's a correlated signal, not a controlled experiment — even though the uncaveated version would look better on my record."*

## 2. A task outside your job description

**CEO-ready answer.**

> "I took on the data foundation because the outcome depended on it. At a large insurer, I was scoped to build the agent layer. The data the agents would query was, on paper, someone else's job. But you cannot govern agents on ungoverned data. So I built the governed foundation myself: cleaned tables for policies, claims and customers, and a small set of reviewed metric views on top. The agents query those views, never raw tables. Every answer traces back to a governed source. It wasn't glamorous. Nobody else could deliver it in two months. I'd rather own the dependency than ship on sand."

**Technical-interviewer answer.**

> "The agents were only as governed as the data under them. So I built the foundation in their Unity Catalog. Bronze tables for products, agents, customers, policies, claims and policy documents. Silver enrichment joins into claims, policy and customer tables. A small set of reviewed metric views on top. The agents query metric views only, never raw tables. That buys three properties. Every number has one definition. Access rules apply at the view. Any answer traces back to a governed source. Assets the data team had reviewed got priority in context index routing. The cost was build time inside a two-month window. The alternative was text-to-SQL over raw tables, which nobody could audit."

**GROUNDED — insurer (data foundation)**

*"The insurer engagement was scoped as a short build engagement on the agent layer. The data foundation the agents would query was, on paper, someone else's problem.*

*It quickly became clear the agents couldn't be governed if the data wasn't. So I built the Unity Catalog foundation myself: bronze tables for products, agents, customers, policies, claims and policy documents; silver enrichment joins into claims, policy and customer tables; and a handful of reviewed, governed metric views on top. The agents query those metric views instead of touching raw tables, which is what makes every answer traceable to a governed source.*

*It wasn't the glamorous part of an AI engagement, and it wasn't in my lane. But 'every number traces back to governed data' was the property the customer actually needed, and nobody else was going to deliver it inside about two months. I'd rather own the unglamorous dependency than ship an agent layer sitting on sand."*

## 3. Short-term deliverable versus long-term goal

**CEO-ready answer.**

> "I shipped the deadline and protected the long-term path. At a large insurer, I had about two months for a working MVP. The supervisor design worked. But as domains grew, it would hit the same overload that broke my first design. Re-architecting then would have risked the date. So I shipped on time, and the customer's time to an answer went from days to minutes. Two choices kept the future open. Prompts lived in a governed table, tunable without a redeploy. Specialists were loosely coupled. When growth made the limit real, I evolved the design. Refactor when the pressure is real, not speculative."

**Technical-interviewer answer.**

> "I shipped a known ceiling and kept the exit open. The supervisor worked: four specialists, confidence-gated routing. But its own tool list grew with each domain. That would recreate the context bloat that broke version one, one level up the stack. I didn't re-architect before the deadline. I made two cheap design choices instead. Prompts lived in a governed Delta table with a five-minute cache, so behavior was tunable without a redeploy. The context index was resolved centrally, so specialists were already loosely coupled. When domain growth made the ceiling concrete, I moved to a deep agent pattern. Self-contained subagents, plus a memory-manager subagent. Loose coupling made that a refactor, not a rewrite."

**GROUNDED — insurer (Supervisor now, Deep Agent later)**

*"At the insurer I had about two months to deliver a working MVP, and partway through, the Supervisor architecture was working — four specialist agents, confidence-gated routing, all fine. But I could see the long-term problem: as domains grew, the Supervisor's own tool list was going to re-approach the exact context-bloat failure that killed my first single-agent design, one level up the stack.*

*The tension was: re-architect now into a Deep Agent pattern and risk the deadline, or ship the Supervisor and accept a known ceiling. I did neither purely. I shipped the Supervisor on time — the customer got days-to-minutes time-to-insight — but I made two choices that kept the long-term path open: prompts lived in a governed Delta table with a five-minute cache so behavior could be tuned without a redeploy, and the Context Index was resolved centrally so specialists were already loosely coupled. Then, once domain growth made the ceiling concrete rather than theoretical, I evolved it into the Deep Agent pattern with self-contained subagents and a memory-manager subagent.*

*The principle: ship the deliverable, but don't let it foreclose the strategic direction — and refactor when the pressure is real, not speculative."*

## 4. A project that failed or missed expectations

**CEO-ready answer.**

> "Two failures, and I own both. First, my opening design at a large insurer: one agent doing everything. It passed demos and failed real testing. The lesson was the mechanism. Too much responsibility in one context degrades tool selection. That let me prevent the same failure later at a lender. Second, at that lender I shipped a working system but cannot prove its impact. I didn't measure resolution time by ticket type from day one. My estimate is that roughly half the volume fit automation well. I can't prove it. Now I agree the success metric and instrument it before the first line of code."

**Technical-interviewer answer.**

> "Two failures, two different root causes. At the insurer, version one put twenty-plus tools in one agent's context. Tool selection degraded under that load. The lesson was the mechanism, not the pattern. Undifferentiated responsibility in one context window degrades selection. At the lender I applied it up front. A triage layer narrows the toolset before the agent ever runs. The second failure was measurement. I shipped a working triage-to-root-cause system without resolution-time instrumentation per ticket type. No baseline means no defensible before-and-after comparison. My estimate is that roughly half of ticket volume was a strong automation fit. I don't quote it as a result. Now the success metric and its instrumentation are defined before the first commit."

**GROUNDED — insurer v1 + lender metrics honesty**

*"Two, at different scales. The clean failure was version one at the insurer — the single do-everything agent. It worked in demos and failed in real testing. What I learned wasn't 'use a Supervisor'; it was the mechanism — undifferentiated responsibility in one context window degrades a model's tool selection — and that mechanism let me predict the same failure one level up the stack later, and pre-empt it at a large Indian consumer lender with a triage layer before the agent ever runs.*

*The quieter shortfall was the lender itself. I shipped a working triage-to-RCA system, but I don't have a client-confirmed before/after resolution-time number, because I didn't instrument per-ticket-type resolution time from day one. I can defend an estimate — roughly half of ticket volume was a strong automation fit — but I can't prove it, and I say that plainly. The lesson I've carried since: agree the success metric and instrument it before the first line of code, not as a retrofit. That's now the first thing I do on any engagement."*

## 5. Feeding field learning back into product

**CEO-ready answer.**

> "The field sees customer constraints before the product does, so I carry them back. At a large insurer, the managed multi-agent feature wasn't available to them, so I hand-built a supervisor. That build became a working spec of what a regulated customer needs: clarification when confidence is low, a shared asset index, prompts tunable without a redeploy. I wrote it up for the product team. Second, a governance gap. A search index is a derived copy and does not inherit row-level access rules. Every customer putting AI on governed data hits that. I documented the two-layer enforcement pattern for the field. Learning that stays in one engagement wastes half its value."

**Technical-interviewer answer.**

> "Two technical findings went back from the field. First, the hand-built supervisor is a working specification for the managed feature. It shows what a regulated customer needed: confidence-gated clarification, a central asset index shared across workers, prompts tunable without a redeploy. Second, a governance gap. A vector search index is a derived copy. It does not inherit Unity Catalog row filters. So access has to be enforced twice. A metadata pre-filter in the retrieval query. Then a live re-check against grants before generation, with denials logged as security events. That pattern applies to any customer putting retrieval on governed data. I documented it so the next team starts from the pattern, not from the gap."

**PARTLY GROUNDED — the insurer story is tagged "Field → Product feedback loop" in your STAR deck.** `[FILL: who you fed it to and what happened]`

*"Two things from the insurer engagement went back to the product side. First, the supervisor gap: the managed multi-agent feature wasn't an option for this customer at the time, so I hand-built the supervisor — and that hand-built version is a concrete, working spec of what a regulated APAC customer needed from the managed feature: confidence-gated clarification, a central asset index shared across workers, prompts tunable without redeploy. `[FILL: who you shared it with — product/PM, and any outcome].`*

*Second, the governance gap: a Vector Search index — it's called AI Search now — is a derived copy and doesn't inherit Unity Catalog's row filters. That's not an insurer-specific finding — every customer putting AI on governed data hits it. I documented the two-layer enforcement pattern and `[FILL: where it went — internal solution pattern, field enablement, product feedback].`*

*The principle: an FDE is the earliest signal the product gets about what a real customer's constraints look like. If that signal stays in the engagement, half the value is wasted."*

## 6. Handling scope creep on an engagement

**CEO-ready answer.**

> "I stop scope creep by agreeing what done means before the build. At a large insurer, the sponsor and I fixed the bar up front. Governed self-serve answers would replace a days-long reporting queue, with zero leaks, explainability and acceptable latency, on two business units in one market. When new requests came in, I didn't refuse them. I asked whether they moved that bar inside the window. Most didn't. They went on a written expansion path with a precondition, so the customer heard next, not no. I did absorb the data foundation, because the bar was unreachable without it. I have that conversation with the sponsor myself."

**Technical-interviewer answer.**

> "Scope control needs a measurable definition of done. Ours had four criteria, fixed before the build. Self-serve governed answers replacing a days-long BI queue. Zero leaks on the governed test set. Explainability, meaning every answer traces to a governed source. Acceptable latency. The slice was two business units in one market. Every new request got one test: does it move one of those criteria inside the window? Open-ended enterprise search, more markets and more document types all failed it. Each went on the expansion path with a technical precondition: the zero-leak gate holds on the first slice. The data foundation passed the test. Without governed metric views, explainability and zero leaks were unreachable."

**GROUNDED — insurer**

*"By deciding what 'done' means with the sponsor before the build, so scope creep has something to be measured against. At the insurer the success bar was agreed up front — self-serve, governed answers replacing a BI queue that took days, with zero leaks, explainability, and acceptable latency, on two business units in one market.*

*When requests came in — open-ended enterprise search, more markets, more document types — I didn't refuse them; I asked whether they moved that bar within the roughly two-month window. Most didn't. They went on a written expansion path with a stated precondition — 'once the zero-leak gate holds on the first slice' — so the customer heard 'next,' not 'no.'*

*Where I did absorb extra scope was the data foundation, because without governed metric views the agreed bar was unreachable. That's the test: scope that serves the agreed outcome, I take on; scope that adds surface without moving the outcome, I sequence. And I have that conversation myself, directly with the sponsor, rather than routing it through a delivery lead."*
