# Customer Obsession - Answer Key

Spoken answers - 4 grounded, 1 partly grounded. Deliver them in your own cadence; the wording is a script, not a recitation.

## 1. Easy for your team versus best for the customer

**CEO-ready answer.**

> "I chose the slower path because the customer carried the risk, not me. At a large consumer lender, I built an agent to investigate failures in their lead-routing pipeline. The impressive version would fix config tables on its own and close tickets. I didn't build it. A wrong write on a live lending pipeline misroutes real loan leads at a regulated lender. So every tool did one narrow operation. Every action landed as a finding for an engineer to confirm. Resolution was slower. The demo was less flashy. I told them that trade openly, and I'd make it again."

**Technical-interviewer answer.**

> "The core decision was the write path, not the model. At the lender, the agent investigates across logs, control flags and config. I gave it read access where it needed it and write access nowhere. Each tool did one named operation with a typed input schema. There was no generic query or update tool for the model to misuse. Every proposed fix was emitted as a structured finding into their ticketing system. An engineer reviewed it and applied it. The trade-off was time to resolution, because a human sits on every write. What I gained was a bounded blast radius. A bad model call produces a wrong ticket comment, never a misrouted loan lead. That permission model is the guardrail, and it does not depend on prompt quality."

**GROUNDED — a large Indian consumer lender**

*"At a large Indian consumer lender, their lead-routing pipeline is the existing system that routes loan leads into their CRM and their dialer — I didn't touch that. What I built was an agent for the IT-support desk behind it: when that pipeline misbehaves and an engineer raises a ticket — a lead silently excluded, a feed that stopped, a config table out of sync — the agent runs the investigation an engineer would otherwise do by hand across logs, control flags, and config, and writes up the root cause. The easy version — and honestly the more impressive demo — was to let that agent close the loop itself: ticket comes in, agent diagnoses it, agent applies the fix to the config table, ticket closes. Fast time-to-resolution, great headline number.*

*I didn't build that. More than half of their couple of hundred historical tickets were config-table refresh and sync requests, and a wrong call to a config-update tool on a live lending pipeline misroutes real loan leads at a regulated lender. So I scoped every tool to one narrow, named operation, and every agent action lands in their ticketing system as a finding for an engineer to confirm — never a silent production change. The cost was real: slower resolution than a full auto-fix, and a less flashy demo. But the customer's actual interest was 'never let an LLM make an unreviewed change to lead-routing config,' not 'close tickets fastest.'*

*I told them that trade-off explicitly rather than hiding it — the slower path was a deliberate choice, and I'd make it again."*

**Why it lands:** you chose the customer's blast radius over your own headline metric, and you named the cost.

## 2. Customer feedback that changed project direction

**CEO-ready answer.**

> "Listening to users changed the core of the design. At a large life insurer, the brief was natural-language answers over governed data. Before designing anything, I met the users and compliance separately. Users told me the same question needed a different answer by role and market. Compliance told me which documents carried health disclosures. That moved access control from a checkbox to the center of the system. We agreed a zero-leak release gate before the build. I also narrowed the first release to two business units in one market. Access mistakes compound if you scale first. The brief named the pain. The users showed me the shape."

**Technical-interviewer answer.**

> "Discovery changed the architecture from retrieval-first to policy-first. The users gave me the axes: role, document type, market. Compliance told me which document types carried health disclosures. I turned that into a role-by-document-type-by-market matrix, and the matrix became the policy engine's rules. Enforcement ran in two layers. A metadata pre-filter compiled into the vector search query. Then a live re-check against catalog grants right before generation. The release criterion was zero leaks on a governed test set, agreed before any code. I cut scope to two business units in one market to keep the matrix small enough to verify. At the lender, ticket data did the same job. It split one agent into three investigation routes."

**GROUNDED — a large Asian life insurer (discovery) with the lender as a second example**

*"At the insurer, the engagement was framed as 'give business users natural-language answers over governed data.' If I'd built to that brief, I'd have built a retrieval and text-to-SQL system and called it done.*

*Before designing anything, I sat with the actual users — actuaries, claims managers, analysts — and separately with compliance, legal, and security. Those two conversations surfaced different things. The users told me the same question needed a different correct answer depending on who was asking: a claims manager handling a case needs something an actuary must never see, and each market had its own regulator and residency rules. Compliance told me which document types carried health disclosures.*

*That feedback moved access control from a checkbox to the core of the design — a role-by-document-type-by-market matrix that became the policy engine's rules, a two-layer enforcement path, and a zero-leak release gate agreed with compliance before the build started. It also changed the scope: I deliberately narrowed the first build to two business units in one market, because access-control mistakes compound if you scale before you've proven the model.*

*The same thing happened at the lender: I assumed one problem shape, and a couple of hundred real tickets showed three — which is why the system has three investigation routes instead of one agent."*

## 3. Disagreeing with a customer

**CEO-ready answer.**

> "I told the sponsor to launch smaller, and I said it early. At a large insurer, the instinct was to go wide: every business unit, every market, open-ended search. I argued from their risk, not my convenience. The system would answer over claims documents with health disclosures, under different regulators. One leak at launch can end an AI programme at an insurer. I proposed two business units in one market, a zero-leak gate agreed with compliance, and a written expansion path. Compliance backed the narrow start. The sponsor agreed to prove it first. The MVP shipped on that slice. Expansion was then argued from a result, not a promise."

**Technical-interviewer answer.**

> "My technical case was to verify the access model before multiplying it. Every new business unit and market adds rows to the role-by-document-type-by-market matrix. Every market brings its own regulator and residency rules. The zero-leak gate needs governed test cases for each of those combinations. Going wide would have grown the matrix faster than I could build test coverage for it. So I proposed one market, two business units, and full coverage of that slice. Expansion had an explicit precondition: the zero-leak gate holds on the first slice. After that, each new market is a known increment. New rules, new test cases, the same enforcement path. I gave up breadth at launch. I got an access model proven before it scaled."

**PARTLY GROUNDED — insurer scope.** `[FILL: who on the insurer side wanted the wider scope]`

*"At the insurer, the sponsor's instinct was to launch wide — every business unit, every market, open-ended enterprise search on top of the BI use case. I disagreed, and I said so early rather than quietly under-delivering.*

*My argument wasn't 'that's too hard.' It was about their risk: the retrieval agent would be answering over policy and claims documents with health disclosures, across markets with different regulators. Access-control mistakes compound if you scale before you've proven the model — and a leak at launch is the kind of failure that ends an AI programme at an insurer. So I proposed proving it on two business units in one market first, with a zero-leak gate agreed with compliance, and expanding from a validated base.*

*How I handled it mattered as much as the argument: I framed it as their exposure, not my convenience, offered a concrete expansion path so 'narrow' didn't sound like 'less,' and let compliance be in the room — they were the strongest voice for the narrow start. `[FILL: how the sponsor responded].` The MVP shipped on that slice, and the expansion conversation happened on the back of a result rather than a promise."*

## 4. Delivering bad news to a customer

**CEO-ready answer.**

> "I told the sponsor the same day, with the cause and the fix. At a large insurer, my first design was one agent with twenty-plus tools. It worked in demos and broke in real testing, weeks into a two-month window. I gave them three things. What broke: the agent picked the wrong tool. Why: too many tool definitions in one prompt degrade selection. What next: a supervisor with specialist agents, reusing every existing tool and data asset, traced so we would know within days. The pivot worked. We shipped on time. What the sponsor remembered was hearing it from me first, with a plan."

**Technical-interviewer answer.**

> "The root cause was context load on tool selection. Version one was a single agent with twenty-plus tools. Twenty tool schemas plus conversation history in one prompt degraded selection. Tracing showed it was structural, not a prompt-tuning problem. So I moved to a supervisor with four specialist agents, each with a narrow toolset. A confidence gate asks a clarifying question below 60%. I kept every existing tool and data asset, so the change was to routing, not a rewrite. Per-node tracing and a held-out evaluation set told me within days whether the pivot worked. It did, and we shipped inside the window. The sponsor got the mechanism and the fix on the same day."

**GROUNDED — insurer v1 failure**

*"Mid-engagement at the insurer, my first architecture — one agent with twenty-plus tools — broke down in real testing. I was weeks into a window of about two months and the sponsor was expecting a working MVP.*

*I told them the same day, in three parts: what's broken — the agent is picking the wrong tool and degrading under context bloat; why, specifically — stuffing twenty tool schemas plus history into one prompt measurably hurts tool selection, it's not vague 'confusion'; and what I'm doing about it — a Supervisor pattern with specialist agents, keeping every existing tool and data asset so the change is bounded, with tracing so we'll know within days if it works.*

*Two rules I follow for bad news: never deliver a problem without the mechanism, because 'it doesn't work' invites panic and 'here's exactly why' invites trust; and never deliver it without the next step and its cost. The pivot worked and we shipped on time — but the thing the sponsor remembered was that they heard it from me first, with a plan."*

## 5. What they need versus what they ask for

**CEO-ready answer.**

> "Two habits. First, I talk to the users and the approvers separately before I trust the brief. At a large insurer, the brief said natural-language answers over data. Users told me answers had to differ by role and market. Compliance told me which documents carried health disclosures. Neither was in the brief. Both became the core of the design. Second, I read the customer's own data. At a large lender, the ask was to automate support tickets. A couple of hundred real tickets showed three different problems, not one. So we built three investigation routes, not one bot. The brief is usually right about the pain and wrong about the shape."

**Technical-interviewer answer.**

> "I treat the brief as a hypothesis and the customer's data as the test. At the lender, I went through a couple of hundred historical tickets before designing anything. More than half were config-table refresh and sync requests. A real slice were log-exclusion investigations. A small share were bugs in the rules-engine code. That distribution set the architecture. A triage layer narrows the toolset before the agent runs. Three investigation routes use retrieval over past tickets instead of a hand-coded rules tree. A separate code-lookup agent does a deterministic one-file lookup and hands the model only that file. The same review showed about a third of tickets were clarification round-trips. My design didn't handle those, and I logged it as the next gap."

**GROUNDED — insurer two-track discovery + lender ticket review**

*"Two habits. First, I don't start from the brief; I start from the people who'll use the thing and the people who'll have to sign off on it, and I talk to them separately — because they surface different requirements. At the insurer the brief said 'natural-language answers over data.' The actuaries, claims managers, and analysts told me the same question needed different correct answers per role and market. Compliance told me which documents carried health disclosures. Neither was in the brief, and together they became the core of the design.*

*Second, I look at the customer's own data before I believe the framing. At the lender the ask was 'automate IT-support tickets.' I went through a couple of hundred real tickets and found it wasn't one problem — more than half were config-table maintenance, a real slice were log-exclusion investigations, and a small share were bugs in the rules-engine code. That's three investigation routes and a separate code-lookup agent, not one bot.*

*The framing is usually right about the pain and wrong about the shape. Discovery is how you find the shape."*
