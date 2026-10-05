# Stakeholder Influence - Answer Key

All four drafted. This is the strongest section in the set — nothing here is marked NEEDS INPUT.

## 1. Explaining a technical tradeoff to a non-technical executive

**CEO-ready answer.**

> "I stopped talking about the model and talked about accountability. Leadership wanted the agents to decide on their own. I put one question to them: on the day it's wrong, who answers for it? Then I showed them the tracing on every agent step. Full autonomy meant no defensible audit trail. Supervised autonomy meant every decision could be reconstructed. That turned a technical constraint into a governance choice they already knew how to make. They chose the supervised path. When risk and compliance later reviewed the system, traceability was what they cited."

**Technical-interviewer answer.**

> "The technical position was that autonomy without reconstruction is not auditable. Every agent step was already traced in MLflow: inputs, tool calls, intermediate outputs and the final decision. I showed what full autonomy would remove, which was any reviewable decision point. The supervised design kept a verification agent upstream and a human checkpoint before anything left the system. The cost was throughput, because a reviewer sits on the critical path. In exchange, any decision could be replayed from its trace, and a failure could be pinned to a specific step. When risk and compliance reviewed the system, they audited it from those traces. Traceability was the control they cited."

**Anchor:** multi-agent autonomy debate, insurance client.

- **Situation.** Leadership wanted the agent system to make decisions autonomously. Engineering knew the failure modes.
- **Task.** Get alignment on a constrained rollout without sounding like I was slowing them down.
- **Action.** I reframed from "can the model do this" to "what happens on the day it's wrong, and who answers for it." I walked them through the observability layer — MLflow tracing on every agent step — so the tradeoff became concrete: full autonomy meant no defensible audit trail; supervised autonomy meant every decision was reconstructable.
- **Result.** They chose the supervised path, and traceability became what they cited when [risk / compliance] reviewed the system.

**Why it lands.** You translated a technical constraint into a governance argument — the language executives already speak.

## 2. Disagreeing with a customer executive

**CEO-ready answer.**

> "The sponsor wanted every business unit and every market at launch. I disagreed early, and I framed it as their risk, not my convenience. Access-control mistakes compound at scale. A leak at launch ends an AI programme at an insurer. So I proposed two business units in one market first. I gave ground too: every new request went on a written expansion path. The one precondition was that the zero-leak gate held on the first slice. Compliance backed the narrow start. We shipped in the window, and time-to-insight went from days to minutes. The expansion conversation then ran on a result, not a promise."

**Technical-interviewer answer.**

> "I argued for a narrow first slice because the access model was unproven, not because the build was hard. The insurer needed role-by-document-type-by-market permissions over documents with health disclosures. Every extra business unit and market multiplies that matrix and its test surface. So I proposed two business units in one market, with a governed test set and a release gate that fails on a single leak. I conceded the expansion path in writing. Each new request was logged with one precondition: the zero-leak gate holds on the first slice. The cost was a smaller launch footprint. The benefit was a matrix small enough to test exhaustively. We shipped in the window, and expansion had a tested gate instead of an argument."

**Anchor:** the tier-1 bank migration.

- **Situation.** Multi-region programs almost always contain a sequencing disagreement — [which region first, or big-bang versus phased cutover].
- **Action.** Frame the disagreement as risk, not preference. Argue from the escalation surface: what happens to APAC trading hours if EMEA cutover goes wrong, and who is awake to fix it.
- **Result.** Zero go-live escalations across all three regions — cite this as vindication, briefly, without gloating.

**The trap.** Picking a disagreement you won easily. Choose one where you had to concede something.

## 3. Technical buyer versus economic buyer

**CEO-ready answer.**

> "Both sides wanted the same thing; they just measured it differently. The platform team wanted control. The budget holder wanted consumption and ROI. I didn't pick a side. I made governance the thing that unlocked expansion: the platform team got the controls they needed to say yes, and every yes showed up as usage the budget holder could see. Adoption grew after rollout. I won't claim all of that growth — but both buyers signed off on the next phase."

**Technical-interviewer answer.**

> "The platform team's real objection was blast radius. Expanding access without central controls meant ungoverned copies and unclear lineage. So I made governance the precondition for expansion, not a brake on it. Access policies, lineage and audit lived in one catalog. Each new team onboarded through the same controlled path. That gave the platform team a repeatable yes. Every onboarded team also showed up as measurable usage on the shared platform, which was the budget holder's metric. The trade-off was onboarding speed. No team got access outside the governed path, even when they asked for a shortcut. Adoption grew after rollout. It is a correlated signal, not a controlled experiment, and I say so."

**Anchor:** the insurer. Strongest story in this section — it ties the work to a commercial result, which most engineers can't do.

- **Situation.** Platform teams wanted capability and control; the budget holder was measuring demonstrable consumption and ROI.
- **Action.** Didn't pick a side — found the overlap. Governance was what the platform team needed to feel safe expanding, and expansion was what the economic buyer was measuring.
- **Result.** Adoption grew after rollout — proof both sides got what they wanted. I can't attribute the growth cleanly, and I say so.

## 4. Building trust with a skeptical chief architect in 30 days

**CEO-ready answer.**

> "Three things. First, I concede their expertise on their own estate. They know things about their systems I won't learn in a month. Second, I ship something small and real in the first two weeks. I give before I ask. Third, I name the risk they were privately worried about, and I say what the platform is not good for. At an insurer, I told reviewers the vector index doesn't inherit source permissions, then showed the two-checkpoint fix. Skeptical architects have usually watched a vendor gloss over something. Being the one who doesn't is the fastest trust I know."

**Technical-interviewer answer.**

> "I earn technical trust by naming the platform's limits before they find them. At the insurer, the vector index was a derived copy of the source documents. A revoked grant at the source would not reach it. I raised that myself, then showed the design. A metadata pre-filter compiled into the vector query handles speed. A live re-check against source grants, right before generation, handles correctness. Two checkpoints, each with one job. Beyond that, I ship small, reviewable changes into their codebase in the first two weeks. They judge my code, not my slides. And I defer to their knowledge of their own estate. Architects trust engineers who can say what breaks and how it is contained."

Method question.

- Concede their expertise on their own estate before proposing anything. They know things about their systems you won't learn in a month.
- Ship something small and real in the first two weeks. The 40+ scripts contributed to global codebases is the right kind of evidence — you gave before you asked.
- Be the person who names the risk they were privately worried about. Skeptical architects are usually skeptical because they've watched a vendor gloss over something.
- Don't oversell the platform. Naming what the platform isn't good for buys more credibility than anything you claim it is good for.
