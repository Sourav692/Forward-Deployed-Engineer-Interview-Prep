# Running and Scoring a Mock Interview

*A mock only trains judgement when it is timed and scored against evidence, yet the easiest mock to run is an untimed read of the strong answer.*

◷ 10 min

A mock interview is not a reading exercise. Answer under a timer first, then compare, then score against a rubric with evidence. Five scenario mocks follow this lesson, and each one uses the same arc, answer moves and rubric taught here.

**Objectives:**

- choose between the short round and the full round, and run each under time;
- name the stages of the interviewer's arc and what each one tests;
- reuse the answer moves that hold in every scenario;
- score a round with the six-dimension rubric and debrief it.

---

## Pick the Round: Short Warm-Up or Full Simulation

Each scenario comes in two rounds, and both are 45 minutes.

The **short round** is a warm-up. It asks five questions, lists the signals of a weak candidate, adds five follow-ups and ends with a five-signal scorecard. Use it to rehearse the shape of a strong answer.

The **full round** is a realistic simulation. It adds a customer scenario, an ambiguous request, candidate hesitation and recovery, and interviewer pushback on trade-offs, latency, security, cost, evaluation and rollout. It then shows weak, average and strong versions with scores and a debrief. Use it after reading the scenario's case study, when the aim is to practise a realistic interview.

| Mock | What the customer asked for | What failed in the demo |
|---|---|---|
| [Internal Knowledge Assistant](02_Internal_Knowledge_Assistant_Mock_Interview.md) | One chat box for all company knowledge | Stale pages cited; a restricted contract clause shown to the wrong support tier |
| [Agentic Support Workflow](03_Agentic_Support_Workflow_Mock_Interview.md) | AI that handles support tickets end to end | The wrong order refunded twice; a confident reply from a stale shipping event |
| [Financial Compliance and Red-Team](04_Financial_Compliance_and_Red_Team_Mock_Interview.md) | AI that reviews all advisor messages for risk | Subtle promissory language missed; instructions inside emails obeyed |
| [SRE Triage Agent](05_SRE_Triage_Agent_Mock_Interview.md) | A copilot that finds what is broken and fixes it | A hallucinated root cause in a payments outage; the wrong service restarted |
| [Multi-Tenant SaaS Assistant](06_Multi_Tenant_SaaS_Assistant_Mock_Interview.md) | A per-customer assistant inside the product | Two tenants mixed in one cached response |

## Follow the Interviewer's Arc

Every full round follows the same arc. Each stage tests one thing.

| Stage | What the interviewer is testing |
|---|---|
| Opening and first meeting | Does the candidate start from workflow, users, failure cost and success, not the model? |
| Pushback on discovery | Can the candidate move fast without building blindly? |
| Hesitation and recovery | Can the candidate refine a weak first answer under pressure? |
| Architecture and "make it specific" | Is the design built around controlled context and evidence, and tied to this case? |
| Trade-off | Does the candidate reach for the smallest sufficient evidence set, not the biggest prompt? |
| Latency, security and cost objections | Can each concern be answered with a budget and a control, not a promise? |
| Evaluation | Are launch gates defined before the pilot? |
| Rollout and the 30-second summary | Can the candidate push back respectfully and speak to an executive? |

## Reuse the Answer Moves That Hold in Every Mock

The five scenarios differ in their specifics, but the strong candidate's moves repeat. Learn these once.

**Discovery.** Do not start with the model. Ask which workflow hurts, who decides, what data they trust, which mistakes are unacceptable, and how success will be measured after the pilot. The full rounds add eight concrete questions: which workflow first; the current baseline for time, quality and escalation; which systems are authoritative; who may see which data; what must never be autonomous; who owns review and sign-off; what latency and cost are acceptable; and what evidence an answer must show.

**Speed without blindness.** When the customer refuses discovery, offer a 3- to 5-day discovery and prototype sprint. Choose one workflow, connect only approved sources, build a small evaluation set, and demo on real examples.

**Scope in layers.** Split the request into read-only Q&A, recommendation or drafting, and action execution. Ship read-only or draft-only first. Actions need explicit approval until evaluation and production telemetry justify more. A disclaimer does not fix permission leakage, stale data, wrong citations, unsafe tool calls or over-trust. Constrain what the model can see and do before the answer, rather than apologising after the mistake.

**Architecture.** Authenticate through SSO, the single sign-on the company already uses. Resolve identity, role, tenant and entitlements at the gateway. A policy layer decides allowed sources and tools. Retrieve only from authorised sources, rerank, filter untrusted content, and pass bounded context. Require citations, route risky actions to approval, and log role, sources touched, retrieval scores, model version, latency, cost, safety flags and outcome.

**Trade-offs.** A stronger model and a bigger context raise latency and cost and can add conflicting evidence. Use a retrieval budget and route by risk. If quality drops, inspect the failure first: missed retrieval, weak reranking, a stale document, a prompt failure, or a reasoning error. The fix depends on which one it was.

**Latency.** Set an explicit budget, then break latency into authentication, retrieval, reranking, generation, tool calls and citation verification. Parallelise independent calls, cache embeddings, cut top-k before reranking, stream, use a smaller model for low-risk requests, and drop unnecessary tool calls. Do not remove citation verification by default. Make it asynchronous for low-risk answers if needed.

**Security.** The model receives only context the user may see. Enforce permissions in retrieval and tool execution, not in the prompt. Treat retrieved content as untrusted data, never as instructions, and red-team with malicious text in documents, tickets, emails, logs and tenant data.

**Failure modes.** Name permission leakage, stale or low-quality documents, hallucinated answers, unsafe tool calls, cost spikes, slow responses and users over-trusting the system. Give each one a detection signal and a mitigation.

**Cost.** Argue in cost per successful outcome, not in the abstract. Show request volume, model mix, tokens, tool calls, cache hit rate, and cost per accepted answer or resolved case. Never downgrade the model globally; route by risk and complexity instead. If the assistant costs more than the value it creates, the architecture is wrong.

**Evaluation.** Define launch gates before the pilot. Build a golden dataset with SME-approved answers, red-team for injection and data leakage, and compare model versions before release. Never launch because a few demos look good. Build the eval set from normal, edge, stale-source, permission, adversarial and business-critical cases. Measure task success, citation correctness, groundedness, refusal correctness, latency, cost and human acceptance. A bad eval is ten friendly questions checked by eye.

**Rollout.** Offer a controlled pilot on the requested date, not broad production. Name rollback conditions: leakage, high-risk wrong answers, excessive latency or low user trust.

## Read the Weak and Average Patterns

The weak candidate looks the same in every scenario. They start with "use GPT plus a vector DB" and ask only which documents to upload and which model to use. Permissions go in the prompt. Latency gets "a faster model", and cost is "optimise later". Evaluation is "test a few examples manually". That earns about 2 out of 5: the buzzwords are there, but not FDE-level production judgement.

The average candidate points the right way. They mention permissions, evals and rollout, but do not make them concrete, lack customer-facing trade-off language, and leave out operational detail. That earns about 3 out of 5: safe, likely to pass some screens, and likely to struggle in a high-bar FDE interview.

The strong candidate earns 4.5 out of 5. To reach 5, add concrete numbers from the customer's baseline and propose a dashboard or a mock launch plan.

## Score With the Six-Dimension Rubric

The short round's scorecard has five signals: discovery, architecture, evals, production and communication. The full round adds security as its own dimension and gives anchors for every score.

| Dimension | 1–2 Weak | 3 Average | 4 Strong | 5 Excellent |
|---|---|---|---|---|
| Discovery | Starts with tools or the model | Some workflow questions | Clear user, workflow and risk questions | Quantifies business value, failure cost, owners and adoption path |
| Architecture | Generic GPT plus vector DB | Basic RAG or agent design | Permission-aware, observable, risk-bounded design | Explains data flow, auth, eval gates, rollback and operational ownership |
| Security | Mentions privacy generally | Adds access control | Handles ACLs, prompt injection, audit and approval | Threat-models misuse, tenant isolation, policy enforcement and evidence logs |
| Evaluation | Says "accuracy testing" | Adds a golden set | Measures groundedness, citations, task success and regressions | Includes adversarial tests, human review, launch gates and continuous evals |
| Production | Demo-only thinking | Basic monitoring | SLOs, cost and latency budgets, rollout, fallback | Clear phased launch, incident response, business dashboard, model and version governance |
| Communication | Vague and buzzword-heavy | Understandable but shallow | Clear trade-offs and customer framing | Executive-ready, technically precise, honest about limits |

Score each dimension with one line of evidence quoted from your own answer. A score without evidence is a guess.

## Worked Example: Scoring the Average Answer

Take the average answer from the internal knowledge assistant mock: "I would clarify users, index documents, add permissions, and evaluate answer quality. I would start with support and use citations. For security, I would check that users only see allowed documents."

Discovery is a 3: it mentions users, but no metrics, owners or failure cost. Architecture is a 3: plausible, but with no policy layer, telemetry or rollback. Security is a 3: access control is named but not placed in retrieval, and prompt injection is missing. Evaluation is a 3: "answer quality" with no golden set or launch gate. Production is a 2 or 3: no rollout plan beyond "start with support". Communication is a 3: clear but shallow.

The round lands at about 3 out of 5, the same as the source's score. More important than the number, every point lost has a named missing element, and that list is the practice plan for the next round.

> **Warning: do not read the strong version first.** Reading the answer before attempting the round trains recognition, not recall. Attempt every prompt under the timer, then compare. Practise the hard stages, the objections and rollout pushback, not only the opening.

## Debrief and Plan the Next Round

The source debrief gives two practice targets for every candidate. First, give concrete numbers: the p95 latency target, the acceptable false-positive rate, the minimum citation accuracy, the launch-blocking security threshold and the expected business ROI. Second, practise drawing the architecture in 90 seconds while explaining where policy enforcement, evaluation and observability sit.

**A note on the sources.** The five short-round scripts are identical except for the scenario name, and their narrowing question always quotes "all company knowledge in chat". The scenario lessons keep the five questions and reword that one for each case. The full rounds also share most of their transcript text, so the case-specific content in each scenario lesson is what to study most closely.

---

## Key Takeaways

- Run the short round as a warm-up and the full round as a timed simulation; both are 45 minutes.
- The interviewer's arc moves from discovery through objections to rollout, and each stage tests one judgement.
- The strong answer moves repeat across scenarios: scope in layers, enforce permissions outside the prompt, budget latency and cost, and gate the launch.
- Weak answers start from tools and score about 2; average answers lack specifics and score about 3; strong answers score 4.5.
- Score six dimensions with evidence from your own answer, and turn every lost point into the next practice target.
- Debrief by adding concrete numbers and drawing the architecture in 90 seconds.

## Check Yourself

1. **What does the full round add to the short round?**
   A customer scenario, an ambiguous request, hesitation and recovery, pushback on trade-offs, latency, security, cost, evaluation and rollout, weak, average and strong versions, and a scored debrief.

2. **The customer says they want to launch to everyone next Monday. What does a strong candidate say?**
   Push back respectfully: offer a controlled pilot on Monday, not broad production unless launch gates are met, and name rollback conditions such as leakage, high-risk wrong answers, excessive latency or low user trust.

3. **What separates a 4 from a 5 on discovery?**
   A 4 asks clear user, workflow and risk questions. A 5 also quantifies business value, failure cost, owners and the adoption path.

4. **Why not remove citation verification to cut latency?**
   Where citations carry trust and compliance, verification is a safety feature. Optimise it, or make it asynchronous for low-risk answers, but keep it for high-risk outputs.

## References

**Sources:** `03_Practice_Worksheets_and_Keys/Mock_Interviews/Full_Mock_Interviews/README.md` (what each full round contains, and where the short rounds live). The shared sections of the five full mocks in that folder: "Format", "Upgrade note", "Original short-practice purpose", the Part 1 transcript, "Why this is weak", "Why this is average", the likely scores, "Final debrief for the learner" and "Final scoring rubric". The five files in `03_Practice_Worksheets_and_Keys/Mock_Interviews/Short_Practice_Mocks/`: "Format", "Strong candidate answer outline", "Transcript", "Weak candidate signals", "Interviewer follow-ups" and "Scorecard".
