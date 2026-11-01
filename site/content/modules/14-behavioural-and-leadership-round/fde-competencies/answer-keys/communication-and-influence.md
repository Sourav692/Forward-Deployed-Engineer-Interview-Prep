# Communication and Influence - Answer Key

Spoken answers: 4 grounded, 3 partly grounded, 2 needing your input. Deliver them in your own cadence. Treat the wording as a guide; don't recite it.

## 1. Simplifying a technical message for a broad audience

**CEO-ready answer.**

> "I explained it as two checkpoints, and compliance signed off. At a large insurer, compliance, legal, security and the sponsor had to approve how an AI agent controlled access to documents with health disclosures. None of them are engineers. So I said: a fast check at the door narrows documents to your role and market. Then a careful check right before anything is shown, because permissions change. A case gets reassigned. Access gets revoked. If the second check catches something, it is logged as a security event. Compliance asked the right questions. We agreed the bar before the build: zero leaks, explainability, latency."

**Technical-interviewer answer.**

> "Same design, explained at the mechanism level. Layer one is a metadata pre-filter compiled into the vector search query. Each chunk carries role, document type and market tags. The query returns only chunks the user's attributes allow. That is fast, but it reflects permissions as they were at index time. Layer two is a live re-check against the data catalogue's grants immediately before generation. It catches reassigned cases, revoked grants and closed consent windows. A denial at layer two is logged as a security event, never silently dropped. The trade-off is added latency on every request. Compliance accepted that against the zero-leak bar. The design assumes layer one goes stale. Layer two exists because of that assumption."

**GROUNDED: a large Asian life insurer / Meridian two-layer access control**

*"At the insurer I needed compliance, legal, security, and a business sponsor — none of them engineers — to sign off on how the retrieval agent enforced access over policy and claims documents with health disclosures. The real mechanism is a metadata pre-filter compiled into the vector search query plus a live re-check against the data catalogue's grants right before generation.*

*I didn't say any of that first. I said: there are two checkpoints. A fast one at the door that gets you into the right neighbourhood of documents for your role and market. And a slower, careful one right before you're handed anything, because your permissions might have changed in between: a case reassignment, a revoked grant, a consent window closing. Most systems only build the first one and hope. I assumed it would go stale and built for that.*

*Compliance could reason about it. They asked the right follow-ups, like 'what happens if the second check catches something,' and I could answer: it's logged as a security event, not swallowed. We agreed the success bar (zero leaks, explainability, latency) before the build started. The engineers got the technical version later: the same story with the nouns swapped."*

## 2. Explaining a technical tradeoff to a non-technical executive

**GROUNDED.**

**CEO-ready answer.**

> "I stopped talking about the model and talked about accountability. Leadership wanted the agents to decide on their own. I put one question to them: on the day it's wrong, who answers for it? Then I showed them the tracing on every agent step. Full autonomy meant no defensible audit trail. Supervised autonomy meant every decision could be reconstructed. That turned a technical constraint into a governance choice they already knew how to make. They chose the supervised path. When risk and compliance later reviewed the system, traceability was what they cited."

**Technical-interviewer answer.**

> "The technical position was that autonomy without reconstruction is not auditable. Every agent step was already traced in MLflow: inputs, tool calls, intermediate outputs and the final decision. I showed what full autonomy would remove, which was any reviewable decision point. The supervised design kept a verification agent upstream and a human checkpoint before anything left the system. The cost was throughput, because a reviewer sits on the critical path. In exchange, any decision could be replayed from its trace, and a failure could be pinned to a specific step. When risk and compliance reviewed the system, they audited it from those traces. Traceability was the control they cited."

**Anchor:** multi-agent autonomy debate, insurance client.

- **Situation.** Leadership wanted the agent system to make decisions autonomously. Engineering knew the failure modes.
- **Task.** Get alignment on a constrained rollout without sounding like I was slowing them down.
- **Action.** I reframed from "can the model do this" to "what happens on the day it's wrong, and who answers for it." I walked them through the observability layer (MLflow tracing on every agent step), so the tradeoff became concrete: full autonomy meant no defensible audit trail; supervised autonomy meant every decision was reconstructable.
- **Result.** They chose the supervised path, and traceability became what they cited when [risk / compliance] reviewed the system.

**Why it lands.** You translated a technical constraint into a governance argument, which is language executives already speak.

## 3. Technical buyer versus economic buyer

**GROUNDED.**

**CEO-ready answer.**

> "Both sides wanted the same thing; they just measured it differently. The platform team wanted control. The budget holder wanted consumption and ROI. I didn't pick a side. I made governance the thing that unlocked expansion: the platform team got the controls they needed to say yes, and every yes showed up as usage the budget holder could see. Adoption grew after rollout. I won't claim all of that growth, but both buyers signed off on the next phase."

**Technical-interviewer answer.**

> "The platform team's real objection was blast radius. Expanding access without central controls meant ungoverned copies and unclear lineage. So I made governance the precondition for expansion, not a brake on it. Access policies, lineage and audit lived in one catalog. Each new team onboarded through the same controlled path. That gave the platform team a repeatable yes. Every onboarded team also showed up as measurable usage on the shared platform, which was the budget holder's metric. The trade-off was onboarding speed. No team got access outside the governed path, even when they asked for a shortcut. Adoption grew after rollout. It is a correlated signal, not a controlled experiment, and I say so."

**Anchor:** the insurer. It's the strongest story in this section because it ties the work to a commercial result, which most engineers can't do.

- **Situation.** Platform teams wanted capability and control; the budget holder was measuring demonstrable consumption and ROI.
- **Action.** Found the overlap instead of picking a side. Governance was what the platform team needed to feel safe expanding, and expansion was what the economic buyer was measuring.
- **Result.** Adoption grew after rollout, which showed both sides got what they wanted. I can't attribute the growth cleanly, and I say so.

## 4. Building trust with a skeptical chief architect in 30 days

**GROUNDED.**

**CEO-ready answer.**

> "Three things. First, I concede their expertise on their own estate. They know things about their systems I won't learn in a month. Second, I ship something small and real in the first two weeks. I give before I ask. Third, I name the risk they were privately worried about, and I say what the platform is not good for. At an insurer, I told reviewers the vector index doesn't inherit source permissions, then showed the two-checkpoint fix. Skeptical architects have usually watched a vendor gloss over something. Being the one who doesn't is the fastest trust I know."

**Technical-interviewer answer.**

> "I earn technical trust by naming the platform's limits before they find them. At the insurer, the vector index was a derived copy of the source documents. A revoked grant at the source would not reach it. I raised that myself, then showed the design. A metadata pre-filter compiled into the vector query handles speed. A live re-check against source grants, right before generation, handles correctness. Two checkpoints, each with one job. Beyond that, I ship small, reviewable changes into their codebase in the first two weeks. They judge my code, not my slides. And I defer to their knowledge of their own estate. Architects trust engineers who can say what breaks and how it is contained."

Method question.

- Concede their expertise on their own estate before proposing anything. They know things about their systems you won't learn in a month.
- Ship something small and real in the first two weeks. The 40+ scripts you contributed to global codebases are the right kind of evidence: you gave before you asked.
- Be the person who names the risk they were privately worried about. Architects are usually skeptical because they've watched a vendor gloss over something.
- Don't oversell the platform. Naming what the platform isn't good for buys more credibility than anything you claim it is good for.

## 5. Influencing people without authority

**CEO-ready answer.**

> "People back what they helped decide, so I gave them the decision. At a large insurer, I had no authority over the data team or compliance. I needed both. With the data team, I built the governed metric views inside their catalog, with them. The agents gave priority to the assets they had reviewed. Their governance decisions became what the system obeyed. With compliance, I explained the access model in plain terms. I asked them to define zero leaks for their regulators. That became our release gate. They set the bar, so they defended it. When launch scope was challenged, compliance argued for the narrow start, not me."

**Technical-interviewer answer.**

> "The mechanism was making their decisions executable. With the data team, I built the bronze, silver and gold layers inside their governed catalogue, not in a side store. Assets they had reviewed and endorsed got priority in context index routing. So their governance choices directly shaped what the agents queried. With compliance, I asked them to define zero leaks for their regulators. That definition became the release gate in the evaluation harness. A separate check fails the build if the security documentation drifts from the policy code. Their definition was enforced in the pipeline, not on a slide. Both teams could see their own rules running in production. That is why they defended the system."

**PARTLY GROUNDED: insurer data / BI team and compliance.** `[FILL: names/roles]`

*"At the insurer I had no authority over the customer's data team or their compliance function, and I needed both. The data team owned the tables my agents would query; compliance owned whether the system could touch documents with health disclosures at all.*

*With the data team, influence came from doing the work with them rather than around them: I built the bronze, silver, and gold metric views inside their governed catalogue, and endorsed assets — the ones they'd reviewed — were prioritised in the Context Index routing. Their governance decisions were literally what the agents obeyed, so they had a stake in the system working.*

*With compliance, influence came from giving them the decision instead of asking for permission: 'Here's the two-checkpoint model in plain terms; you tell me what zero leaks means for your regulators; that's our release gate.' They set the bar, so they defended it. `[FILL: outcome / a moment where this paid off].`*

*People back what they helped decide. Authority is a poor substitute for that."*

## 6. Conflict with a colleague or another team

**CEO-ready answer.**

> "I separate the facts from the priorities, and I bring evidence instead of opinion. On a bank deployment, a delivery lead wanted to demo a feature the access controls didn't yet cover. I disagreed, but not in the meeting. I brought the trace showing a user could see data outside their scope. Then I framed it in the customer's terms: whose risk, whose timeline. And I proposed an alternative: demo the governed slice now, the full feature next sprint. He agreed. The demo landed cleanly. He now brings me in before scope is set, not after."

**Technical-interviewer answer.**

> "The disagreement was about an access-control gap, so I treated it as a test failure, not a debate. The feature retrieved documents through the vector index. Its pre-filter covered role, but not every scope rule. I pulled one trace where a query returned a chunk outside the user's entitlement. Reproducible, not hypothetical. I proposed a scoped demo: only the sources where the live permission re-check was already wired in. The rest stayed behind a feature flag until the check covered them. We gave up a broader demo for one sprint. I added that trace to the evaluation set as a leak case, so the gap could not reopen unnoticed. Scope discussions now start from which permission checks exist."

**NEEDS YOUR INPUT.** Suggested spine, using your evidence-first stance:

*"`[FILL: who — a solutions architect, a delivery lead, a product engineer — and what the disagreement was: architecture, scope, timeline, which feature to demo].` I separated the disagreement about facts from the disagreement about priorities. For the facts, I brought `[FILL: the trace, the benchmark, the ticket data]` rather than an opinion. For the priorities, I put it in the customer's terms (whose risk, whose timeline) and proposed a specific alternative instead of only objecting. `[FILL: outcome, and what the relationship looked like afterwards].`"*

*If nothing fits, the honest answer is: "Most of my conflicts have been with my own first designs, but here's how I handle disagreement with a person," then give the spine above as a method.*

## 7. Working across cultures, regions and time zones

**CEO-ready answer.**

> "Most of my engagements have been cross-regional by default. At the insurer, each Asian market had its own regulator. So 'the customer' was never one voice. Two practices matter. First, run discovery per region, not centrally. A rule that's fine in one market is a compliance problem in the next. Second, work async by default, with decisions in writing. A design review that ends with 'here is what we decided and why' survives a time-zone gap. A verbal agreement doesn't. That is how the access matrix got built market by market, and signed off in each."

**Technical-interviewer answer.**

> "Regional difference was a data-model problem before it was a communication problem. Each market had its own regulator, so access could not be one global policy. I modelled the access matrix per market: role, business unit, market, permitted data. Each market's rows were reviewed and signed off separately. The permission checks read the matrix, so a new market meant new rows, not new code. The evaluation set carried test users per market, so a change in one market could not silently break another. Across time zones, every design decision lived in a shared document with the decision, the reason and the owner. The trade-off was slower sign-off per market. No market went live on another market's rules."

**PARTLY GROUNDED: the insurer (headquartered in Asia, multi-market APAC), a large Indian consumer lender, a global tier-1 bank (APAC/EMEA/AMER).** `[FILL: a concrete friction and how you handled it]`

*"Most of my engagements have been cross-regional by nature. The insurer is headquartered in Asia with business units across several Asian markets, each with its own regulator, so 'the customer' was never one voice, and the access matrix had to be built market by market. The lender was a regulated Indian lender with a very different operating rhythm. And `[FILL: the tier-1 bank migration — hundreds of millions of events a day, spanning APAC, EMEA, and AMER teams]`.*

*Two practical things I've learned. First, discovery has to be run per region, not centrally: a rule that's fine in one market is a compliance problem in another, and you only find that by asking the people in that market. Second, work async by default, with explicit decisions in writing. A design review that ends with 'here is what we decided and why' in a shared document survives a time-zone gap; a verbal agreement doesn't. `[FILL: one concrete example].`"*

## 8. Communication that was misunderstood

**CEO-ready answer.**

> "The misunderstanding was my miss, and I fixed the handoff. On an insurer engagement, I handed work to an engineer through a ticket. They built exactly what the ticket said. It was not what the customer asked for. The claims manager needed results scoped to their own cases. The ticket just said search. The intent never made it into my handoff. I owned it. Two changes. I now review designs before code, so a wrong turn costs an hour, not a sprint. And every ticket carries the customer's intent and success bar, not only the task. We corrected it before the customer saw it."

**Technical-interviewer answer.**

> "The defect was in the handoff, not the code. The ticket specified the task: a search over claims documents. It omitted the access constraint that claims managers see only cases assigned to them. The engineer built a correct generic search. It would have failed our access requirements. I made two process fixes. Design review now happens before implementation, so data model and query scope are checked against intent early. And every ticket carries intent plus acceptance criteria. For example: results filtered to the requesting manager's assigned cases. A test case proves an unassigned case never appears. That acceptance test catches the drift. We corrected this one before the customer saw it."

**PARTLY GROUNDED: from the day-to-day doc's "ticket says X, customer meant Y" pattern.** You must supply the specific instance.

*"`[FILL: engagement / engineer].` I handed off work through a ticket that described what to build, and the engineer built exactly what the ticket said, correctly, but not what the customer had asked for in the discovery session. The customer's intent never made it into my handoff. `[FILL: the concrete drift — e.g., built a generic search when the claims manager needed case-scoped results].`*

*I owned that as my miss, not theirs. Two changes: I started reviewing designs before code was written rather than after, so a wrong turn costs an hour instead of a sprint; and I started writing the customer's intent and success bar into the ticket alongside the task, for example 'the claims manager needs to see only cases assigned to them, because X'. `[FILL: outcome].` I learned that a lot of what looks like a technical question from an engineer is an ambiguity I left in the scope."*

## 9. Explain one project to a CFO in three minutes

**NEEDS YOUR INPUT.** No grounded story exists for this drill. The repo gives you the two rules that make it work; the project, the numbers and the result have to be yours.

**Rule 1: translate each term in the same breath.** Every technical term gets its plain-English meaning in the same sentence that introduces it, not three sentences later. A listener who loses the thread on one term does not recover it later. The weak version names "a two-layer access control system" and explains it afterwards. The strong version says: "a two-layer access control system — think a fast ID check at the door, then a second, more careful check right before you're handed anything sensitive." Apply the rule everywhere: in the opening, in the Action, and in the answers to follow-up questions.

**Rule 2: deliver the Action twice.** One script serves both a business-heavy and a technical-heavy listener.

- **Pass 1 is the analogy pass,** with no architecture terms. "Permission-checking happens before the AI ever sees a document. It's built into the shape of the pipeline, so it's structurally impossible to skip. Think of a venue with two checkpoints."
- **Pass 2 is the technical layer:** "In system terms, that's attribute-based access control enforced in two layers." Deliver it only on a sign of engagement, such as a nod, a question, or the listener leaning in. If the room says "got it, what's the result", skip straight to Result.

**When time runs short,** compress the technical detail and Pass 2 first. Never rush the business framing.

**Suggested spine (fill with your own project):**

*"`[FILL: the project, in one plain-English sentence]`. The business problem was `[FILL: the cost, delay or risk it addressed]`. What I did, in plain terms: `[FILL: Pass 1, the analogy, with no architecture terms]`. `[FILL: Pass 2, the technical layer, only if the CFO leans in]`. The result: `[FILL: a number you can prove, in money, time or risk]`."*

**Why it lands:** a CFO hears the business case and the result without ever being asked to learn your vocabulary, and the technical layer is there only if they ask for it.
