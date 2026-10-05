# Ambiguity and Discovery - Answer Key

Drafted from documented engagements. Three of the four are ready to deliver; the fourth is marked NEEDS INPUT because it is failure-shaped and cannot be written for you.

## 1. Customer asked for something they didn't need

**CEO-ready answer.**

> "The ask was a bot to automate IT-support tickets. What they needed was three different fixes. Before writing any code, I read a couple of hundred real tickets. More than half were config refresh requests. A real slice were log investigations. A small share were genuine code bugs. One bot would have handled the easy half and failed on the rest. So I built a triage layer and three routes, each shaped to its problem. The system matched their data, not my assumption. I also flagged what I hadn't solved: about a third of tickets were clarification round-trips. Read the work before you build for it."

**Technical-interviewer answer.**

> "The root cause was a classification problem, not a generation problem. I sampled a couple of hundred historical tickets and labelled them by resolution type. Three clusters fell out: config-table refresh and sync, log-exclusion investigations, and rules-engine code bugs. So I put a triage layer in front of the agent that narrows the toolset before it runs. Each class got its own route, using retrieval over past tickets rather than a hand-coded rules tree. Code bugs go to a lookup agent. It does a deterministic one-file lookup and hands the model only that file, with four fixed questions. The cost was more routing logic to maintain. The pattern-based classifier is brittle to phrasing drift, and clarification round-trips are unhandled. Both are logged as the next gaps."

**Anchor:** multi-agent work for the insurance client.

- **Situation.** The client came in asking for a chatbot over their [claims / policy] knowledge base. The stated ask was a RAG assistant.
- **Task.** Before building, run discovery with the [operations and risk] teams to understand what the assistant was meant to replace.
- **Action.** What surfaced was that a single-turn RAG lookup couldn't cover the actual workflow — the work required retrieval, cross-referencing, and a verification step nobody wanted a model doing unsupervised. I proposed a Supervisor–Worker multi-agent design instead: specialised workers for search, summarisation, and drafting, with a verification agent and a human checkpoint before anything left the system.
- **Result.** We shipped an architecture matching the real workflow rather than the requested one. [Add outcome metric — adoption, cycle-time reduction, or workflows onboarded.]

**Why it lands.** It shows you challenged the framing before writing code, which is the entire FDE job.

**Still open.** The result metric is a placeholder. The answer is structurally sound but lands softer without a number.

## 2. Week one with unclear requirements

**CEO-ready answer.**

> "In week one I don't design. I reduce uncertainty. At an insurer the brief was "we need governance", which can mean anything. So the first week was inventory. What data existed. Who touched it. Where sensitive personal data actually lived, versus where they believed it lived. The gap between those two was the real finding. That inventory became the scoping document. It let us roll out with zero downtime instead of a risky big-bang cutover. Adoption grew after rollout. I won't claim all of it, but the plan came from facts, not opinions."

**Technical-interviewer answer.**

> "I treat week one as building ground truth before any design. For the governance rollout, I inventoried every catalog, schema and table, who queried it, and which columns held personal data. Then I compared that against what the teams believed: their documented ownership and classification. The diff was the design input. Mis-tagged sensitive columns and undocumented consumers told me where access policies had to land first. Because I knew every consumer, I could migrate permissions in stages. Old and new grants ran in parallel, then each domain cut over on its own. That is what made it zero downtime. The cost was a slower start, with no architecture document in week one. The inventory became the scoping document and the rollout checklist."

**Anchor:** the insurer's Unity Catalog governance rollout.

- **Situation.** "We need governance" is one of the vaguest asks in enterprise data.
- **Action.** Week one wasn't design, it was inventory — mapping what data existed, who was touching it, and where PII actually lived versus where they believed it lived. The gap between those two was the real finding.
- **Result.** That inventory became the scoping document. It enabled a zero-downtime rollout rather than a big-bang cutover, and adoption grew after rollout, though I can't attribute it cleanly.

**Say out loud.** Week one was spent reducing uncertainty, not producing artifacts.

## 3. Running discovery with a client who can't articulate the ask

**CEO-ready answer.**

> "Four moves. First, I start from today's pain, not their wish list. Pain is concrete; aspiration isn't. Second, I get current-state numbers early: runtimes, failure rates, manual hours. That is the baseline we will be judged against. Third, I talk to the people doing the work, not only the sponsor. The sponsor describes the intended workflow. The operator describes the real one. Fourth, I put a rough design in front of them fast. People who can't state requirements can always react to a proposal. At a lender, that process turned "automate our tickets" into three distinct problems with three different fixes."

**Technical-interviewer answer.**

> "My discovery output is a baseline and a hypothesis I can test. First, I pull the evidence the system already holds: ticket history, job run logs, failure rates, manual hours. I agree the success metric and instrument it before writing code. Second, I shadow the operators and map their real workflow against the sponsor's version. The differences become the requirements. Third, I put a strawman architecture in front of them within days, with explicit assumptions they can knock down. At the lender that meant labelling a couple of hundred tickets. A repeating manual investigation loop came out of it, and that loop justified the root-cause tooling. I learned to instrument first the hard way there. No clean baseline meant no provable delta."

Method question, not a story question. Give the process, then one illustration.

- Start from what's painful today rather than what they want to build — pain is concrete, aspiration isn't.
- Get current-state numbers early: runtimes, failure rates, manual hours. They anchor everything downstream and give a baseline to claim credit against later.
- Talk to the people doing the work, not only the people sponsoring it. The sponsor describes the intended workflow; the operator describes the real one.
- Put a strawman architecture in front of them fast. Clients who can't articulate requirements can almost always react to a proposal.

**Illustration.** The multi-agent RCA engine — vague ask, discovery surfaced a repeating manual investigation loop, and that pattern justified building the tooling.

## 4. A project you scoped incorrectly

**CEO-ready answer.**

> "I underestimated a multi-region migration at a tier-1 bank, and the miss was mine. I committed to a timeline based on the workloads we could see. I didn't ask who consumed their outputs downstream. Profiling the second region surfaced reporting jobs nobody had listed, plus data-residency rules that changed the cutover order. I caught it mid-flight, not at the deadline. That week I went to the sponsor with a re-baselined plan and two options: phase the region, or move the date. They chose phasing. We delivered later than first promised, with zero go-live escalations. Now every discovery includes one question: who reads this data after us?"

**Technical-interviewer answer.**

> "The estimate was wrong because I scoped from the workload inventory, not the dependency graph. I sized the migration from the jobs we could see. I never traced lineage to find who read their outputs. Profiling the second region exposed downstream reporting jobs nobody had listed. Data-residency rules also forced some datasets to cut over in a fixed order. I rebuilt the plan from lineage. Consumers were mapped per table, residency constraints became hard ordering rules, and cutover waves were sequenced around both. The sponsor got two costed options: phase the region or move the date. We phased it. Delivery came later than first promised, with zero go-live escalations. Discovery now includes a lineage pass before I commit to any date."

**NEEDS INPUT — this one is yours to write.**

**What's being tested:** whether your estimates are calibrated, and whether you notice mid-flight or only at the deadline.

**Likely anchor:** the tier-1 bank migration across APAC/EMEA/AMER — multi-region scope is where estimates usually break.

To draft this, supply:

1. Which engagement and roughly when.
2. The commitment you made in specific terms — timeline, workload count, or performance target.
3. What you didn't account for. Common honest candidates: source-system complexity found only after profiling, an undisclosed downstream consumer, regional data-residency constraints, or a client team less available than staffed.
4. How early you caught it and how you re-baselined with the client.
5. What actual delivery looked like versus the original commitment.
6. What you now ask for in discovery that you didn't ask for then.

**The trap.** Blaming discovery quality without owning that discovery was your job. Say "I didn't ask X," not "they didn't tell me X."
