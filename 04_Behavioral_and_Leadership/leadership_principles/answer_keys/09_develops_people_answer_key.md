# Develops People - Answer Key

Spoken answers - 2 partly grounded, 2 needing your input. Deliver them in your own cadence; the wording is a script, not a recitation.

## 1. Diagnosing a report's development area

**CEO-ready answer.**

> "The real gap was not technical. An engineer on my engagement team at an insurer kept bringing me design questions. Should this filter sit at retrieval or at generation? I answered several before I saw the pattern. Most were scope questions the customer hadn't settled. So I stopped answering the instance. I asked, 'What would the claims manager say?' and sent them to find out. Within weeks they were running their own clarification calls. Their designs stopped drifting from customer intent. They later owned a workstream with direct customer time. An engineer who separates 'I don't know how' from 'nobody has decided' can face a customer."

**Technical-interviewer answer.**

> "The signal was in the design questions themselves. Should a filter apply at retrieval or at generation? Technically, both work. The real fork is a policy choice. At retrieval, the model never sees the document. At generation, it sees it and must withhold it. Which one is acceptable depends on what the customer treats as sensitive. Only the customer could decide that. So I stopped resolving those forks myself. I asked the engineer to name the customer decision behind each question and take it to the claims manager. Their design docs then listed open customer decisions with owners. Within weeks they ran their own clarification calls, and their designs stopped drifting from customer intent."

**PARTLY GROUNDED — the "ambiguity vs. technical" coaching pattern from the day-to-day doc.** You must supply the person and the outcome. If you've never had a formal direct report, say "an engineer on my engagement team."

*"`[FILL: engineer, engagement].` They kept bringing me what looked like technical questions — 'should this filter apply at the retrieval layer or the generation layer?' — and I'd answer them. After a few of these I noticed the pattern: most weren't technical questions at all. They were ambiguous scope the customer hadn't resolved, showing up as a design fork.*

*So I stopped answering the instance and started coaching the underlying skill. When they brought the next one, I asked: 'What would the claims manager say if you asked them?' — and sent them to find out. `[FILL: what changed — e.g., they started running their own discovery calls, their designs stopped drifting from customer intent].` `[FILL: outcome — role change, ownership of a workstream, customer-facing time].`*

*The diagnosis mattered more than the fix: an engineer who can tell the difference between 'I don't know how' and 'nobody has decided what' is one you can put in front of a customer."*

## 2. Someone whose career grew under you

**CEO-ready answer.**

> "An engineer joined my engagement as a strong builder with no customer exposure. They left it able to own a workstream in front of the customer. Three moves made the difference. First, I gave them work with real consequences: the governed data foundation the agents depended on. I reviewed their design before code, not their code after. Second, I put them in customer discovery sessions and debriefed every one. Third, I had them present their own work at the sponsor readout. On the next engagement they led a workstream themselves. Growth comes from real stakes plus early review, not from shielding people."

**Technical-interviewer answer.**

> "I grew them through design review on high-blast-radius work. The governed data foundation was the piece every agent depended on. A wrong metric definition there would flow into every answer. So the review happened on the design, before code. We covered layer boundaries from bronze to silver to gold, which views were endorsed and how access rules attached to them. I asked them to defend each choice against the customer's success bar, not my preference. In discovery sessions, I had them listen for definitions the customer still disputed. Those became open items, not assumptions buried in code. At the sponsor readout they presented their own design and took the technical questions. On the next engagement, they led a workstream."

**NEEDS YOUR INPUT.** Suggested spine, anchored in your stated leadership stance (design review before code; give people the highest-blast-radius work once they've earned it; put them in front of the customer):

*"`[FILL: who, starting point].` Three specific things: `[FILL: 1 — handed them a piece with real blast radius, e.g., the governed data foundation or a specialist agent, with a design review before code rather than a code review after]`; `[FILL: 2 — put them in a customer discovery or readout and debriefed after]`; `[FILL: 3 — sponsored them for X]`. Where they are now: `[FILL]`."*

## 3. Bringing a new engineer up to speed

**CEO-ready answer.**

> "Three things, in order. First, the customer's actual intent. In week one they sit in a discovery session or readout. Hearing the claims manager describe the problem changes what they build. Second, the success bar and the gates: zero leaks, tracing on every path. They know what done means before writing code. Third, design review before code, while change is still cheap. Then I watch for one signal. Are their technical questions really unresolved scope? When they are, I send them to the customer, not to me. That habit turns an engineer into someone I can put in front of a client."

**Technical-interviewer answer.**

> "The onboarding follows the engagement's technical contract. First, the customer's intent, heard directly in a discovery session or readout. Second, the gates. Zero leaks is enforced by the evaluation harness, and a single leak fails the release, whoever wrote the code. Tracing on every path is required, so any answer can be followed step by step. A new engineer learns to read those traces in week one. Third, design review before code on their first piece of work. That is where I catch a wrong boundary, such as an access filter placed after generation instead of before it. Then I watch their questions. If a technical question is really unresolved scope, I send them to the customer."

**PARTLY GROUNDED — from the day-to-day doc.** `[FILL: an actual example]`

*"Three things, in order. First, the customer's actual intent, not the ticket — I have them sit in a discovery or readout in their first week, because an engineer who has heard the claims manager describe the problem builds something different from one who read a spec. Second, the success bar and the gates — the zero-leak rule, the tracing requirement — so they know what 'done' means here before they write code. Third, design review before code, not code review after: their first piece of work gets a design conversation with me while it's still cheap to change.*

*Then I watch for one specific thing: are they bringing me technical questions that are really unresolved scope? When that happens, I send them to the customer to resolve it rather than answering it myself. `[FILL: who, and what changed].` That's the skill that turns an engineer into someone I can put in front of a customer."*

## 4. Giving difficult feedback to a peer or senior

**CEO-ready answer.**

> "I give it the way I report a failed architecture: mechanism and evidence, not a verdict on the person. A senior engineer on an engagement wanted to give an agent broad write access to a production system. It would have saved a week. I brought the ticket data showing which operations the work actually needed. I framed it as the customer's risk, not my preference. And I proposed an alternative: a few narrow, named operations, with an engineer confirming each action. They pushed back once, then agreed. The design shipped on schedule, and the relationship held. Evidence keeps hard feedback from becoming personal."

**Technical-interviewer answer.**

> "The disagreement was about the agent's permission model. Broad write access to a production system was faster to build and would have saved a week. I brought the ticket data instead of an opinion. It showed the small set of operations the work actually needed. Broad write access meant any model error could touch tables no ticket ever required. That is blast radius with no matching benefit. My proposal was a few narrow, named tools, each mapped to one operation. Every action landed as a finding for an engineer to confirm. The cost was that extra week of build inside the plan. They pushed back once, then agreed. The design shipped on schedule."

**NEEDS YOUR INPUT.** Suggested spine, anchored in your existing stance (mechanism, not judgment; evidence, not opinion):

*"The same way I report a failed architecture: the mechanism and the evidence, not a verdict on the person. `[FILL: situation — a senior engineer's design, a delivery lead's timeline, a PM's feature push].` I brought `[FILL: the trace, the benchmark, the ticket data]` rather than an opinion, framed it as the customer's risk, and proposed a specific alternative. `[FILL: outcome].`"*
