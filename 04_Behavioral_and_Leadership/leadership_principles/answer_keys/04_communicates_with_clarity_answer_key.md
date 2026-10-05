# Communicates with Clarity - Answer Key

Spoken answers - 2 grounded, 2 partly grounded. Deliver them in your own cadence; the wording is a script, not a recitation.

## 1. Simplifying a technical message for a broad audience

**CEO-ready answer.**

> "I explained it as two checkpoints, and compliance signed off. At a large insurer, compliance, legal, security and the sponsor had to approve how an AI agent controlled access to documents with health disclosures. None of them are engineers. So I said: a fast check at the door narrows documents to your role and market. Then a careful check right before anything is shown, because permissions change. A case gets reassigned. Access gets revoked. If the second check catches something, it is logged as a security event. Compliance asked the right questions. We agreed the bar before the build: zero leaks, explainability, latency."

**Technical-interviewer answer.**

> "Same design, explained at the mechanism level. Layer one is a metadata pre-filter compiled into the vector search query. Each chunk carries role, document type and market tags. The query returns only chunks the user's attributes allow. That is fast, but it reflects permissions as they were at index time. Layer two is a live re-check against Unity Catalog grants immediately before generation. It catches reassigned cases, revoked grants and closed consent windows. A denial at layer two is logged as a security event, never silently dropped. The trade-off is added latency on every request. Compliance accepted that against the zero-leak bar. The design assumes layer one goes stale. Layer two exists because of that assumption."

**GROUNDED — a large Asian life insurer / Meridian two-layer access control**

*"At the insurer I needed compliance, legal, security, and a business sponsor — none of them engineers — to sign off on how the retrieval agent enforced access over policy and claims documents with health disclosures. The real mechanism is a metadata pre-filter compiled into the Vector Search query plus a live re-check against Unity Catalog grants right before generation.*

*I didn't say any of that first. I said: there are two checkpoints. A fast one at the door that gets you into the right neighborhood of documents for your role and market. And a slower, careful one right before you're handed anything — because your permissions might have changed in between: a case reassignment, a revoked grant, a consent window closing. Most systems only build the first one and hope. I assumed it would go stale and built for that.*

*The outcome was that compliance could reason about it — they asked the right follow-ups, like 'what happens if the second check catches something,' and I could answer: that's logged as a security event, not swallowed. We agreed the success bar — zero leaks, explainability, latency — before the build started. The technical version came later, for the engineers, and it was the same story with the nouns swapped."*

## 2. Communication that was misunderstood

**CEO-ready answer.**

> "The misunderstanding was my miss, and I fixed the handoff. On an insurer engagement, I handed work to an engineer through a ticket. They built exactly what the ticket said. It was not what the customer asked for. The claims manager needed results scoped to their own cases. The ticket just said search. The intent never made it into my handoff. I owned it. Two changes. I now review designs before code, so a wrong turn costs an hour, not a sprint. And every ticket carries the customer's intent and success bar, not only the task. We corrected it before the customer saw it."

**Technical-interviewer answer.**

> "The defect was in the handoff, not the code. The ticket specified the task: a search over claims documents. It omitted the access constraint that claims managers see only cases assigned to them. The engineer built a correct generic search. It would have failed our access requirements. I made two process fixes. Design review now happens before implementation, so data model and query scope are checked against intent early. And every ticket carries intent plus acceptance criteria. For example: results filtered to the requesting manager's assigned cases. A test case proves an unassigned case never appears. That acceptance test is what catches the drift. We corrected this one before the customer saw it."

**PARTLY GROUNDED — from the day-to-day doc's "ticket says X, customer meant Y" pattern.** You must supply the specific instance.

*"`[FILL: engagement / engineer].` I handed off work through a ticket that described what to build, and the engineer built exactly what the ticket said — correctly — but not what the customer had actually asked for in the discovery session, because the customer's intent never made it into my handoff. `[FILL: the concrete drift — e.g., built a generic search when the claims manager needed case-scoped results].`*

*I owned that as my miss, not theirs. Two changes: I started reviewing designs before code was written rather than after, so a wrong turn costs an hour instead of a sprint; and I started writing the customer's intent and success bar into the ticket alongside the task — 'the claims manager needs to see only cases assigned to them, because X' — not just the task. `[FILL: outcome].` The general lesson I took: a lot of what looks like a technical question from an engineer is actually an ambiguity I left in the scope."*

## 3. Communicating technical risk to an executive

**CEO-ready answer.**

> "I translate technical risk into cost, control and a decision. At a large insurer, the managed multi-agent feature wasn't available to them, so I hand-built the supervisor. I told the sponsor: your launch would depend on a feature whose timing neither of us controls. If it slips, you slip. I'd rather own more code. At a large lender, the question was letting the agent change production config on its own. I said: a wrong write misroutes real loan leads, and you cannot take those back. The trade is slower resolution for zero unreviewed changes. They chose it in one conversation. Name the failure, the owner, the trade, then recommend."

**Technical-interviewer answer.**

> "For a technical audience, I lead with the dependency and the failure mode. At the insurer, waiting for the managed multi-agent feature put an external dependency on the critical path. Its availability was outside our control. Building ourselves meant an 8-node LangGraph supervisor we had to own, test and trace. I took that cost to remove the dependency. At the lender, the risk was an irreversible write. A wrong config-table update misroutes live loan leads, and there is no rollback once they are sent. So the agent had no write tools at all. It proposes findings into the ticketing system, and an engineer applies them. The trade is slower resolution. The guarantee is zero unreviewed production changes."

**GROUNDED — insurer managed-feature gap + lender blast radius**

*"I translate the risk into what it costs them and who controls it — never into the technology.*

*At the insurer, the managed multi-agent feature wasn't an option for this customer at the time, so I hand-built the supervisor. I didn't explain that in product terms. I said: 'The core of your production system would depend on a feature whose timing neither you nor I control. If it slips, your launch slips. I'd rather own more code than hand your timeline to a roadmap.' The sponsor could weigh that.*

*At a large Indian consumer lender, the question was whether the agent could change production config tables on its own. I put it as: 'A wrong write here misroutes real loan leads at a regulated lender, and you can't un-send those. The trade is slower ticket resolution for zero unreviewed changes. I recommend the slower path.' They chose it in one conversation.*

*The pattern: name the failure in their terms, name who controls it, name the trade, make a recommendation. Executives don't need the mechanism — they need to know what they're deciding."*

## 4. Influencing people without authority

**CEO-ready answer.**

> "People back what they helped decide, so I gave them the decision. At a large insurer, I had no authority over the data team or compliance. I needed both. With the data team, I built the governed metric views inside their catalog, with them. The agents gave priority to the assets they had reviewed. Their governance decisions became what the system obeyed. With compliance, I explained the access model in plain terms. I asked them to define zero leaks for their regulators. That became our release gate. They set the bar, so they defended it. When launch scope was challenged, compliance argued for the narrow start, not me."

**Technical-interviewer answer.**

> "The mechanism was making their decisions executable. With the data team, I built the bronze, silver and gold layers inside their Unity Catalog, not in a side store. Assets they had reviewed and endorsed got priority in context index routing. So their governance choices directly shaped what the agents queried. With compliance, I asked them to define zero leaks for their regulators. That definition became the release gate in the evaluation harness. A separate check fails the build if the security documentation drifts from the policy code. Their definition was enforced in the pipeline, not on a slide. Both teams could see their own rules running in production. That is why they defended the system."

**PARTLY GROUNDED — insurer data / BI team and compliance.** `[FILL: names/roles]`

*"At the insurer I had no authority over the customer's data team or their compliance function — and I needed both. The data team owned the tables my agents would query; compliance owned whether the system could touch documents with health disclosures at all.*

*With the data team, influence came from doing the work with them rather than around them: I built the bronze, silver, and gold metric views inside their Unity Catalog, and endorsed assets — the ones they'd reviewed — were prioritised in the Context Index routing. Their governance decisions were literally what the agents obeyed, so they had a stake in the system working.*

*With compliance, influence came from giving them the decision instead of asking for permission: 'Here's the two-checkpoint model in plain terms; you tell me what zero leaks means for your regulators; that's our release gate.' They set the bar, so they defended it. `[FILL: outcome / a moment where this paid off].`*

*The general rule: people back what they helped decide. Authority is a poor substitute for that."*
