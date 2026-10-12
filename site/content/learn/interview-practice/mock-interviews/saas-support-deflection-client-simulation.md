# SaaS Support Deflection Client Simulation

This is a 45-minute client simulation about a customer-support deflection project: the interviewer plays the customer and answers only what is asked. The customer arrives with a target already promised to the board, and the round tests whether you find out what that target really measures before you commit to it. With a partner, hand them this page and have them reveal a constraint only when your question earns it; alone, read the opening brief, write your questions down, then open one constraint at a time, and only for a topic you actually asked about.

## The Customer

The customer is the head of customer support at a B2B software company that sells workforce scheduling software to businesses of every size. Each customer company is a separate tenant, and its administrators configure the product heavily.

> "Our ticket volume grows faster than my headcount. I want a chatbot in the help centre that deflects [target deflection rate] of our tickets. I've already told the board that number."

She cares about cost per ticket, satisfaction scores, her team's workload, and keeping the largest customers happy at renewal.

## The Opening Brief

"Thanks for coming. Look, we're growing, which is great, but support isn't keeping up. Tickets take longer to answer every month and my team are burning out. Other companies have bots that answer most questions before a ticket is even raised, and I want that. Our helpdesk platform has a slot for a bot widget. I've told the board we'll hit our deflection target by [board deadline]. How fast can we get there?"

## Hidden Constraints

<details>
<summary>Reveal when the candidate asks about how deflection is measured</summary>

"Our helpdesk counts a ticket as deflected if the customer views a help article and doesn't open a ticket within [deflection window]. That's the number the board sees."

**Why it matters:** That measure counts customers who gave up as successes. A bot can raise it while satisfaction and renewals fall. The strong move is to keep reporting the old number but add resolved-without-recontact and satisfaction on bot conversations, and to help the customer reframe the board target before it hardens.

</details>

<details>
<summary>Reveal when the candidate asks about customer data, tenants or contracts</summary>

"Every customer sets the product up differently: shift rules, approval chains, pay rules. Our enterprise contracts say a customer's data is used only to serve that customer, and some require their data to stay in [required data region]."

**Why it matters:** The right answer for one tenant is wrong for another, so useful answers need read access to that tenant's settings. Every retrieval, cache entry and log must be scoped to the tenant, nothing may be shared across tenants, and residency limits where the system can run.

</details>

<details>
<summary>Reveal when the candidate asks about ticket volume and types</summary>

"We get about [tickets per month]. 'How do I' questions are the biggest group, then integration and sync errors with customers' payroll systems, then billing and plan questions. During an outage, volume spikes to [peak tickets per hour during an outage]."

**Why it matters:** How-to questions are high volume and low harm, which makes them the first slice. Sync errors need account data and often engineering. Billing involves money. An outage needs a status message, not a bot inventing explanations.

</details>

<details>
<summary>Reveal when the candidate asks about the help articles and release cadence</summary>

"We release every [release cadence]. The docs team is small and always behind. Some features work differently on the legacy plan, and the articles don't say which plan they cover."

**Why it matters:** A bot grounded on stale or plan-blind articles gives confident wrong answers. Articles need plan and version tags before they are indexed, and every question the bot cannot answer becomes a ranked list of gaps for the docs team.

</details>

<details>
<summary>Reveal when the candidate asks about billing, credits or refunds</summary>

"Support agents can give service credits up to [credit limit without approval]. Anything about invoices or plan changes goes to the billing team. Last year someone promised a refund that finance wouldn't honour, and it turned into an escalation."

**Why it matters:** The bot must never promise money. Billing and credit questions hand off to a human, with the conversation attached so the customer does not repeat themselves.

</details>

<details>
<summary>Reveal when the candidate asks about different customer tiers or escalation</summary>

"Our largest customers have a named support manager and a contracted first response within [top-tier first response time]. They hate bots. If a bot slows them down, it comes up at renewal."

**Why it matters:** Forcing top-tier customers through the bot puts revenue at risk to improve a deflection number. Route them straight to a human, or make the bot optional for them, and measure the time from handoff to first human reply.

</details>

## How the Round Runs

| Time | Phase | The candidate | The customer |
|---|---|---|---|
| 0–15 min | Discovery | Asks how deflection is measured, the ticket mix, tenant and contract rules, docs quality, money questions and customer tiers | Answers only the question asked; keeps returning to the board number |
| 15–20 min | Framing back | Plays back the metric problem, tenant rules, ticket mix and the top-tier risk, then asks what was missed | Confirms, a little defensive about the metric |
| 20–35 min | Shaping a first slice | Proposes a tenant-aware how-to assistant for one product area, with clean handoff, and a better success measure next to the old one | Pushes: "Will this get me to the board number by the deadline?" |
| 35–45 min | Risks and next steps | Names the top risks with controls, the pilot gates and the next actions with owners | Asks how to explain the change of metric to the board |

## What a Strong Candidate Says

**Discovery**

- "How does your helpdesk decide a ticket was deflected?"
- "Which questions make up most of the volume, and which ones cost you the most?"
- "Does the right answer depend on how each customer has set up the product?"
- "What do your contracts say about using one customer's data?"
- "How do your largest customers feel about bots?"

**Framing back**

- "Here's what I heard. The board number counts anyone who reads an article and doesn't raise a ticket, including people who gave up. Answers depend on each customer's setup, and contracts keep their data separate. How-to questions are the biggest group. Billing can't be promised by anyone but billing. And your biggest customers don't want a bot. Have I got that right?"

**Shaping a first slice**

- "I'd start with how-to questions in one product area, for logged-in users, so the bot can read that customer's own settings."
- "It answers only from current articles tagged for the customer's plan, and shows the article it used."
- "Billing, sync errors and top-tier customers go straight to a person, with the whole conversation attached."
- "We keep reporting deflection, but we add resolved-without-recontact and satisfaction on bot chats. That's the number I'd want in front of the board."

**Risks and next steps**

- "The biggest risk is a wrong answer for a customer on the legacy plan. So articles get plan tags before they go in."
- "Before launch, we run [number of past tickets] past how-to tickets through it and have your senior agents grade the answers."
- "Next steps: a ticket export, the docs lead to tag the first articles, legal to confirm the data terms, and a draft of the board update together."

## Score the Round

| Dimension | Strong evidence in this round |
|---|---|
| Discovery questions | Asks how deflection is counted, what the ticket mix is, whether answers depend on tenant setup, what contracts allow, how current the docs are and how top-tier customers are treated |
| Handling constraints | Turns each constraint into a design choice: tenant-scoped retrieval and caching, residency-aware hosting, plan-tagged articles, no money promises, human routing for top tier and billing, outage messaging |
| Framing back to the customer | Names the weakness in the board metric tactfully, in the customer's terms, and checks the playback before proposing anything |
| Scoping | One product area, how-to questions, logged-in users; billing, sync errors and top-tier customers held back with reasons |
| Next steps | Ticket export, article tagging owner, data terms confirmed with legal, an offline grading run, help drafting the board update |
| Communication | Pushes back on the board number without making the customer look foolish, and gives her words she can use upstairs |

Score each dimension from 1 to 5 with the scorer below; a 4 or 5 needs a quoted line of evidence, and a pass is no dimension below 2 and a mean of 3 or more.

## Common Mistakes

- Accepting the deflection target as the success measure without asking how it is counted.
- Building one shared index or cache across tenants, so one customer's setup or data leaks into another's answer.
- Answering from articles with no plan or version tags, which is wrong for legacy-plan customers.
- Letting the bot discuss credits, refunds or invoices.
- Forcing top-tier customers through the bot to protect the deflection number.
- Having no outage mode, so the bot improvises explanations while the status page is still being written.
