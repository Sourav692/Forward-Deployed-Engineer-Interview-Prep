# Makes Good Decisions Quickly - Answer Key

Spoken answers - 4 grounded. Deliver them in your own cadence; the wording is a script, not a recitation.

## 1. A fast decision with incomplete information

**CEO-ready answer.**

> "I re-architected mid-engagement, inside days, without a full study. At the insurer, my first design was one agent with twenty-plus tools. In real testing it kept picking the wrong tool. I knew the cause: too much in one context degrades tool choice. I didn't know whether four specialists was the right number. So I bounded the risk three ways. I kept every tool and data asset, so the change was reversible. I added a confidence gate, so a routing miss became a question, not a wrong answer. And I added tracing and an evaluation set to know within days. It worked. We shipped on time."

**Technical-interviewer answer.**

> "The root cause was context bloat. Twenty-plus tool schemas plus history in one context degraded tool selection. That told me specialization addressed the cause, not a symptom. I re-architected into a Supervisor with specialist agents. The change touched orchestration only. Every tool and data asset stayed, so rolling back meant restoring the previous graph. Routing errors were the new risk. I contained them with a confidence gate: below 60%, the Supervisor asks a clarifying question rather than guessing. For verification, I added per-node MLflow tracing and a held-out evaluation set. Tracing showed which node made each routing decision. The evaluation set told me within days whether accuracy improved. It did, and the MVP shipped inside the original window."

**GROUNDED — insurer live pivot from single agent to Supervisor**

*"Mid-engagement at a large Asian life insurer, in real testing, my first architecture — one agent, one prompt, twenty-plus tools — was picking the wrong tool and degrading under context bloat. I was weeks into a window of about two months. I didn't have time to run a controlled study of alternative architectures.*

*The decision was to re-architect live into a Supervisor pattern with specialist agents. What I knew: the failure mechanism was specific — stuffing 20-plus tool schemas plus history into one context measurably degrades tool selection — so specialization would address the cause, not just the symptom. What I didn't know: whether four specialists was the right number, or whether routing would introduce its own errors.*

*I bounded the risk three ways. I kept every existing tool and data asset and changed only the orchestration on top, so the pivot was reversible. I added a confidence gate — below 60%, the Supervisor asks a clarifying question instead of guessing — so a routing mistake becomes a question to the user rather than a wrong answer. And I put per-node MLflow tracing and a held-out eval set in place so I'd know within days whether it worked, not at the end. It did, and we shipped on time."*

## 2. An irreversible, high-stakes decision

**CEO-ready answer.**

> "I slow down at the blast radius, not across the whole project. At a large consumer lender, the question was whether an agent could change production configuration on a live lending pipeline. A bad change misroutes real loan leads at a regulated lender. You can't take that back. So I studied a couple of hundred real tickets before designing anything. I scoped every tool to one narrow, named operation. And every action landed as a finding for an engineer to confirm. Meanwhile the lower-risk triage and retrieval layers shipped fast. Reversible calls get speed. Irreversible ones get guardrails."

**Technical-interviewer answer.**

> "The decision was the agent's write path into production config tables. I designed the permission model from the ticket data, not from the agent's convenience. A couple of hundred historical tickets showed which operations the work needed. Each became one narrow, named tool. There was no general write access. Every action landed in the ticket as a finding for an engineer to confirm. Logic bugs went to a separate code-lookup agent. It does a deterministic one-file lookup and gives the model only that file. The ops agent never reasons over code it wasn't shown. The retrieval-strategy choice was the opposite case. It was reversible in an afternoon, so I benchmarked, shipped and documented when to revisit."

**GROUNDED — lender production writes vs. Meridian retrieval-strategy choice**

*"I treat these two very differently, and I have a clean example of each.*

*Routine, reversible: which retrieval strategy to ship in the RAG platform. I benchmarked six against one golden set, picked the cheapest one that met the bar, and documented when to revisit — at a larger corpus the answer might flip. That's a decision you make with data and can undo in an afternoon.*

*High-stakes, hard to reverse: at a large Indian consumer lender, whether the agent could write to production config tables on a live lending pipeline. A bad call to a config-update tool misroutes real loan leads at a regulated lender — you don't get to un-send those. So the process changed. I went through a couple of hundred historical tickets first to understand the real shape of the problem instead of assuming. I scoped every tool to a single, narrow, named operation rather than open write access. I kept a human in the loop: every action lands in the ticket as a finding for an engineer to confirm. And I built a separate code-lookup agent for logic bugs rather than letting the ops agent reason over source code it wasn't shown.*

*The pattern: for reversible calls, decide fast and measure. For irreversible ones, slow down at the blast radius, not the whole project — the triage and RAG layers still shipped quickly."*

## 3. A decision you got wrong

**CEO-ready answer.**

> "My first architecture at the insurer was wrong. I chose one agent with twenty-plus tools because it was fastest to stand up in a two-month window. In real testing, it picked the wrong tool and degraded as context grew. I caught it in testing, not in front of the customer. I diagnosed the mechanism instead of patching symptoms. Then I rebuilt it as specialists under a coordinator, keeping every tool and data asset. Later the same mechanism appeared one level up. Because I understood it, I moved before it broke. Being wrong is cheap when you've built the thing that tells you."

**Technical-interviewer answer.**

> "Version one was a single agent with one prompt, twenty-plus tools and full history. I chose it for setup speed. Testing showed it picked the wrong tools, and accuracy fell as context grew. The mechanism was context bloat degrading tool selection. Prompt tuning could not fix that. I moved to a Supervisor with four specialists and kept every tool and data asset, which bounded the change. Per-node tracing went in so the next failure would show up fast. As domains grew, the Supervisor's own context started to bloat. I moved to a Deep Agent: an orchestrator handing work to self-contained subagents, each with its own prompt, tools and context window. The guardrail is now a design rule: keep each agent's context small."

**GROUNDED — insurer single-agent v1 (and the retrieval preference)**

*"The single-agent design at the insurer. I chose it because it was fastest to stand up in a window of about two months — one prompt, twenty-plus tools, full history. It was wrong, and I found out the right way: in real testing, not in front of the customer. The agent picked the wrong tool repeatedly and accuracy degraded as context grew.*

*What I did: diagnosed the mechanism rather than patching symptoms — context bloat degrading tool selection — then re-architected into specialists with a Supervisor, keeping all the tools and data so the change was bounded, and added tracing so I'd know quickly if I was wrong again. Later the same mechanism showed up in the Supervisor as domains grew, and because I understood it, I saw it coming and moved to the Deep Agent pattern before it broke.*

*A smaller one: I expected the sophisticated retrieval strategy to win the RAG benchmark. It didn't, at that corpus size, and I shipped the simpler one. Being wrong is cheap when you've built the thing that tells you. It's expensive when the customer tells you."*

## 4. Deciding when to stop analysing and act

**CEO-ready answer.**

> "Two questions decide it. Is the call reversible? And would more analysis change it? At the insurer, my first design broke mid-engagement. The cause was clear, the fix was bounded and tracing would show fast if I was wrong. More analysis would only burn the delivery window. I pivoted within days. At a consumer lender, I spent time reading a couple of hundred historical tickets before writing code. That changed the architecture entirely. And the agent would touch production config on a lending pipeline. If it's reversible and instrumented, act and measure. If not, analyse, but time-box it."

**Technical-interviewer answer.**

> "My stop rule has two checks: reversibility and decision value. At the insurer, the pivot was reversible because only orchestration changed. Tracing and an evaluation set would expose a bad call within days. More analysis had low decision value, so I acted. At the lender, the ticket analysis had high decision value. A couple of hundred tickets showed that more than half were config-table refresh and sync requests. A real slice were log-exclusion investigations. A small share were rules-engine bugs. That turned one bot into a triage layer, three retrieval routes and a code-lookup agent. The agent would also touch production config, where mistakes are hard to undo. So I analysed first, inside a fixed time box."

**GROUNDED — insurer pivot vs lender ticket analysis**

*"It depends on whether the decision is reversible, and on whether more analysis would actually change it.*

*At the insurer, when version one broke mid-engagement, I pivoted within days. More analysis wouldn't have helped — the mechanism was clear, the fix was bounded because I kept every tool and asset, and tracing would tell me fast if it failed. Waiting had a cost measured in a shrinking delivery window.*

*At the lender, before writing any code, I spent time going through a couple of hundred historical tickets. That analysis was worth it because it changed the architecture entirely — from one bot to three routes plus a code-lookup agent — and because the agent would touch production config on a lending pipeline, where being wrong is expensive.*

*The heuristic: if the decision is reversible and instrumented, act and measure. If it's irreversible or the analysis would change the shape of what you build, do the analysis — but time-box it against the delivery window."*
