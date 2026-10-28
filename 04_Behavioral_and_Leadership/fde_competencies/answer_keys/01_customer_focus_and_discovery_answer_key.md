# Customer Focus and Discovery - Answer Key

Spoken answers: 4 grounded, 1 needing your input. Deliver them in your own cadence. Treat the wording as a guide; don't recite it.

## 1. What they need versus what they ask for

**CEO-ready answer.**

> "Two habits. First, I talk to the users and the approvers separately before I trust the brief. At a large insurer, the brief said natural-language answers over data. Users told me answers had to differ by role and market. Compliance told me which documents carried health disclosures. Neither was in the brief. Both became the core of the design. Second, I read the customer's own data. At a large lender, the ask was to automate support tickets. A couple of hundred real tickets showed three different problems, not one. So we built three investigation routes, not one bot. The brief is usually right about the pain and wrong about the shape."

**Technical-interviewer answer.**

> "I treat the brief as a hypothesis and the customer's data as the test. At the lender, I went through a couple of hundred historical tickets before designing anything. More than half were config-table refresh and sync requests. A real slice were log-exclusion investigations. A small share were bugs in the rules-engine code. That distribution set the architecture. A triage layer narrows the toolset before the agent runs. Three investigation routes use retrieval over past tickets instead of a hand-coded rules tree. A separate code-lookup agent does a deterministic one-file lookup and hands the model only that file. The same review showed about a third of tickets were clarification round-trips. My design didn't handle those, and I logged it as the next gap."

**GROUNDED: insurer two-track discovery + lender ticket review**

*"Two habits. First, I don't start from the brief; I start from the people who'll use the thing and the people who'll have to sign off on it, and I talk to them separately, because they surface different requirements. At the insurer the brief said 'natural-language answers over data.' The actuaries, claims managers, and analysts told me the same question needed different correct answers per role and market. Compliance told me which documents carried health disclosures. Neither was in the brief, and together they became the core of the design.*

*Second, I look at the customer's own data before I believe the framing. At the lender the ask was 'automate IT-support tickets.' I went through a couple of hundred real tickets and found three problems, not one. More than half were config-table maintenance, a real slice were log-exclusion investigations, and a small share were bugs in the rules-engine code. That's three investigation routes and a separate code-lookup agent, not one bot.*

*The framing is usually right about the pain and wrong about the shape. Discovery is how you find the shape."*

## 2. Running discovery with a client who can't articulate the ask

**GROUNDED.**

**CEO-ready answer.**

> "Four moves. First, I start from today's pain, not their wish list. Pain is concrete; aspiration isn't. Second, I get current-state numbers early: runtimes, failure rates, manual hours. That is the baseline we will be judged against. Third, I talk to the people doing the work, not only the sponsor. The sponsor describes the intended workflow. The operator describes the real one. Fourth, I put a rough design in front of them fast. People who can't state requirements can always react to a proposal. At a lender, that process turned "automate our tickets" into three distinct problems with three different fixes."

**Technical-interviewer answer.**

> "My discovery output is a baseline and a hypothesis I can test. First, I pull the evidence the system already holds: ticket history, job run logs, failure rates, manual hours. I agree the success metric and instrument it before writing code. Second, I shadow the operators and map their real workflow against the sponsor's version. The differences become the requirements. Third, I put a strawman architecture in front of them within days, with explicit assumptions they can knock down. At the lender that meant labelling a couple of hundred tickets. A repeating manual investigation loop came out of it, and that loop justified the root-cause tooling. I learned to instrument first the hard way there. No clean baseline meant no provable delta."

It's a method question. Give the process, then one illustration.

- Start from what's painful today, not what they want to build. Pain is concrete; aspiration isn't.
- Get current-state numbers early: runtimes, failure rates, manual hours. They anchor everything downstream and give a baseline to claim credit against later.
- Talk to the people doing the work, not only the people sponsoring it. The sponsor describes the intended workflow; the operator describes the real one.
- Put a strawman architecture in front of them fast. Clients who can't articulate requirements can almost always react to a proposal.

**Illustration.** The multi-agent RCA engine. The ask was vague; discovery surfaced a repeating manual investigation loop, and that loop justified building the tooling.

## 3. Week one with unclear requirements

**GROUNDED.**

**CEO-ready answer.**

> "In week one I don't design. I reduce uncertainty. At an insurer the brief was "we need governance", which can mean anything. So I spent the first week on inventory: what data existed, who touched it, and where sensitive personal data actually lived versus where they believed it lived. The gap between those two was the real finding. That inventory became the scoping document. It let us roll out with zero downtime instead of a risky big-bang cutover. Adoption grew after rollout. I won't claim all of it, but the plan came from facts, not opinions."

**Technical-interviewer answer.**

> "I treat week one as building ground truth before any design. For the governance rollout, I inventoried every catalog, schema and table, who queried it, and which columns held personal data. Then I compared that against what the teams believed: their documented ownership and classification. The diff was the design input. Mis-tagged sensitive columns and undocumented consumers told me where access policies had to land first. Because I knew every consumer, I could migrate permissions in stages. Old and new grants ran in parallel, then each domain cut over on its own. That is what made it zero downtime. The cost was a slower start, with no architecture document in week one. The inventory became the scoping document and the rollout checklist."

**Anchor:** the insurer's Unity Catalog governance rollout.

- **Situation.** "We need governance" is one of the vaguest asks in enterprise data.
- **Action.** Week one was inventory, not design: mapping what data existed, who was touching it, and where PII actually lived versus where they believed it lived. The gap between those two was the real finding.
- **Result.** That inventory became the scoping document. It enabled a zero-downtime rollout rather than a big-bang cutover, and adoption grew after rollout, though I can't attribute it cleanly.

**Say out loud.** I spent week one reducing uncertainty, not producing artifacts.

## 4. Easy for your team versus best for the customer

**CEO-ready answer.**

> "I chose the slower path because the customer carried the risk, not me. At a large consumer lender, I built an agent to investigate failures in their lead-routing pipeline. The impressive version would fix config tables on its own and close tickets. I didn't build it. A wrong write on a live lending pipeline misroutes real loan leads at a regulated lender. So every tool did one narrow operation. Every action landed as a finding for an engineer to confirm. Resolution was slower. The demo was less flashy. I told them that trade openly, and I'd make it again."

**Technical-interviewer answer.**

> "The core decision was the write path, not the model. At the lender, the agent investigates across logs, control flags and config. I gave it read access where it needed it and write access nowhere. Each tool did one named operation with a typed input schema. There was no generic query or update tool for the model to misuse. Every proposed fix was emitted as a structured finding into their ticketing system. An engineer reviewed it and applied it. The trade-off was time to resolution, because a human sits on every write. What I gained was a bounded blast radius. A bad model call produces a wrong ticket comment, never a misrouted loan lead. That permission model is the guardrail, and it does not depend on prompt quality."

**GROUNDED: a large Indian consumer lender**

*"At a large Indian consumer lender, their lead-routing pipeline is the existing system that routes loan leads into their CRM and their dialer. I didn't touch that. I built an agent for the IT-support desk behind it. When that pipeline misbehaves, an engineer raises a ticket: a lead silently excluded, a feed that stopped, a config table out of sync. The agent runs the investigation the engineer would otherwise do by hand across logs, control flags, and config, and writes up the root cause. The easy version, and honestly the more impressive demo, was to let the agent close the loop itself: ticket comes in, agent diagnoses it, agent applies the fix to the config table, ticket closes. Fast time-to-resolution, great headline number.*

*I didn't build that. More than half of their couple of hundred historical tickets were config-table refresh and sync requests, and a wrong call to a config-update tool on a live lending pipeline misroutes real loan leads at a regulated lender. So I scoped every tool to one narrow, named operation, and every agent action lands in their ticketing system as a finding for an engineer to confirm, never as a silent production change. The cost was real: slower resolution than a full auto-fix, and a less flashy demo. But the customer's actual interest was 'never let an LLM make an unreviewed change to lead-routing config,' not 'close tickets fastest.'*

*I told them that trade-off openly. The slower path was a deliberate choice, and I'd make it again."*

**Why it lands:** you chose the customer's blast radius over your own headline metric, and you named the cost.

## 5. A project you scoped incorrectly

**CEO-ready answer.**

> "I underestimated a multi-region migration at a tier-1 bank, and the miss was mine. I committed to a timeline based on the workloads we could see. I didn't ask who consumed their outputs downstream. Profiling the second region surfaced reporting jobs nobody had listed, plus data-residency rules that changed the cutover order. I caught it mid-flight, not at the deadline. That week I went to the sponsor with a re-baselined plan and two options: phase the region, or move the date. They chose phasing. We delivered later than first promised, with zero go-live escalations. Now every discovery includes one question: who reads this data after us?"

**Technical-interviewer answer.**

> "The estimate was wrong because I scoped from the workload inventory, not the dependency graph. I sized the migration from the jobs we could see. I never traced lineage to find who read their outputs. Profiling the second region exposed downstream reporting jobs nobody had listed. Data-residency rules also forced some datasets to cut over in a fixed order. I rebuilt the plan from lineage. I mapped consumers per table, turned residency constraints into hard ordering rules, and sequenced cutover waves around both. The sponsor got two costed options: phase the region or move the date. We phased it. Delivery came later than first promised, with zero go-live escalations. Discovery now includes a lineage pass before I commit to any date."

**NEEDS INPUT: this one is yours to write.**

**What's being tested:** whether your estimates are calibrated, and whether you notice mid-flight or only at the deadline.

**Likely anchor:** the tier-1 bank migration across APAC/EMEA/AMER. Estimates usually break on multi-region scope.

To draft this, supply:

1. Which engagement and roughly when.
2. The commitment you made in specific terms: timeline, workload count, or performance target.
3. What you didn't account for. Common honest candidates: source-system complexity found only after profiling, an undisclosed downstream consumer, regional data-residency constraints, or a client team less available than staffed.
4. How early you caught it and how you re-baselined with the client.
5. What actual delivery looked like versus the original commitment.
6. What you now ask for in discovery that you didn't ask for then.

**The trap.** Blaming poor discovery when discovery was your job. Say "I didn't ask X," not "they didn't tell me X."
