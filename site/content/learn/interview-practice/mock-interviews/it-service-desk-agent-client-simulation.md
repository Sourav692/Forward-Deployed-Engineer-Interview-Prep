# IT Service Desk Agent Client Simulation

This is a 45-minute client simulation in which the interviewer plays a customer who wants an agent that takes actions, and answers only what is asked. Every action the customer names hides an approval, an audit trail or a data problem that surfaces only if you ask about it. With a partner, hand them this page and have them reveal a constraint only when your question earns it; alone, read the opening brief, write your questions down, then open one constraint at a time, and only for a topic you asked about.

## The Customer

The customer is the head of IT operations at a mid-sized manufacturer with several plants and a central office. He runs the service desk, which is partly in-house and partly outsourced.

> "Our service desk is drowning. I want an AI agent that reads every ticket, fixes what it can, like password resets, access requests and software installs, and closes the ticket. People should only see what the agent can't do."

He cares about the backlog and response times, about plant downtime, and about getting through the next audit without findings.

## The Opening Brief

"Right, thanks for making the time. The backlog is the problem. Tickets sit for days, the plants complain, and my team spend their time on password resets instead of real problems. Our ITSM platform has an AI add-on, but it only suggests articles and nobody reads them. I want something that actually does the work. I've got budget this year. What would you build?"

## Hidden Constraints

<details>
<summary>Reveal when the candidate asks about ticket volume and types</summary>

"We log about [tickets per day]. Password resets and account unlocks are the biggest single group, roughly [share of reset and unlock tickets]. Then access requests, software requests, and 'it's broken' tickets from the plants. Average time to resolve is [current mean time to resolve]."

**Why it matters:** The volume is concentrated in a few ticket types, and each type carries a different risk. This is the baseline for the business case and the starting point for choosing a first slice.

</details>

<details>
<summary>Reveal when the candidate asks about self-service tools that already exist</summary>

"We already have a self-service password reset portal, and office staff use it. Plant workers mostly log in on shared terminals and never enrolled a second sign-in factor, so the portal can't verify them, and they call the desk instead."

**Why it matters:** The blocker on resets is identity verification, not ticket handling. An agent that resets a password for someone it cannot verify is an account-takeover path. Part of the right answer may be an enrolment drive rather than AI, and saying so builds trust.

</details>

<details>
<summary>Reveal when the candidate asks about approvals or audit for access changes</summary>

"Any access to finance or production-planning systems needs the requester's manager to approve it in the ITSM platform. Our auditors sample those approvals every [audit sampling period]. An access grant without that trail is an audit finding."

**Why it matters:** Access requests cannot be automated end to end. The agent can pre-fill the request and route it, but the manager's approval in the existing workflow stays, and every agent step must leave a record the auditors can follow.

</details>

<details>
<summary>Reveal when the candidate asks about which tickets are most costly to get wrong</summary>

"If a terminal, scanner or label printer on the line goes down, the line can stop. Those tickets must reach plant support within [response target for line-down tickets]. A misrouted one costs us [cost of an hour of line downtime]."

**Why it matters:** A wrong priority costs more than a wrong fix. Line-down detection needs high recall, any doubt should escalate rather than wait, and these tickets should never sit behind an automated resolution attempt.

</details>

<details>
<summary>Reveal when the candidate asks about the knowledge base or asset data</summary>

"The knowledge base has [number of KB articles] articles, and I'd guess [share of out-of-date articles] of them are out of date. The CMDB is worse: plant assets were last reconciled [time since last CMDB reconciliation]."

**Why it matters:** An agent grounded on stale articles gives confident wrong fixes, and routing by CMDB owner sends tickets to the wrong team. The first slice should use a small set of articles the desk trusts, show each article's review date, and not depend on the CMDB for routing.

</details>

<details>
<summary>Reveal when the candidate asks about integration or write access to the ITSM platform</summary>

"The platform has an API, but any integration account with write access needs change board approval, and the board meets [change board cadence]. We also have a change freeze during [annual change freeze period]."

**Why it matters:** A first slice that needs write access waits for the change board. A read-and-suggest slice can start now, while the change request for later write access goes in on day one.

</details>

<details>
<summary>Reveal when the candidate asks about the service desk team</summary>

"The outsourced part of the desk is paid partly on tickets closed within target. They're worried an agent takes the easy tickets and leaves them the hard ones. My own team worry they'll be blamed when it closes something wrongly."

**Why it matters:** The people who must use the agent see it as a threat to their numbers. Success measures need reopen rate and requester confirmation, not tickets closed, and the desk lead and the outsourcing manager belong in the next meeting.

</details>

## How the Round Runs

| Time | Phase | The candidate | The customer |
|---|---|---|---|
| 0–15 min | Discovery | Asks about volume, existing self-service, approvals, costly errors, data quality, integration and the desk team | Answers only the question asked; volunteers nothing about audit or the change board |
| 15–20 min | Framing back | Plays back the ticket mix, the identity problem, the approval rules and the line-down risk, then asks what was missed | Confirms, and repeats that he wants tickets closed |
| 20–35 min | Shaping a first slice | Proposes triage and drafting for the desk first, with actions staged behind verification and approval | Pushes: "But I want it to close tickets, not suggest things" |
| 35–45 min | Risks and next steps | Names the top risks with controls, the evidence needed before any action is automated, and next steps with owners | Asks what he can tell his director this week |

## What a Strong Candidate Says

**Discovery**

- "Which ticket types make up most of the volume, and how long does each take today?"
- "Why aren't people using the reset portal?"
- "Which actions need an approval today, and who checks those approvals later?"
- "What's the most expensive ticket to get wrong?"
- "What can an integration do in your platform, and who has to sign that off?"

**Framing back**

- "So most of the volume is resets and unlocks, but plant staff can't verify themselves. Access changes need a manager's approval, and auditors check that. A misrouted line-down ticket can stop production. And write access needs the change board. Is that fair?"

**Shaping a first slice**

- "I'd start by helping your desk, not replacing it. The agent reads every new ticket, sets category and priority, sends anything that looks line-down straight to plant support, and drafts a reply from an article your desk trusts. Your agents accept or edit."
- "That needs no write access, so we don't wait for the change board."
- "On resets, the real fix may be getting plant staff enrolled. No agent should reset a password for someone it can't verify."
- "Closing tickets comes later, for reversible ticket types, once the numbers show it's safe."

**Risks and next steps**

- "The worst failure is a line-down ticket marked low. So we test on [number of historical tickets] past tickets first, and anything uncertain goes up, not down."
- "Access stays in your approval workflow. Later the agent can pre-fill the request, but a manager still approves."
- "Next steps: an export of last quarter's tickets, the articles your desk trusts, a change request for read access, and a session with your desk lead and the outsourcing manager."

## Score the Round

| Dimension | Strong evidence in this round |
|---|---|
| Discovery questions | Asks why self-service fails, which actions need approval and audit, which errors cost most, and how current the knowledge base and CMDB are, before proposing any agent |
| Handling constraints | Turns identity, approval, line-down risk, stale data and change control into design choices: verify before acting, approvals stay human, line-down always escalates, curated articles only, read access first |
| Framing back to the customer | Plays back the ticket mix, the identity gap, the audit rule and the line-down risk with the customer's own figures, and asks what was missed |
| Scoping | Starts with triage and drafting for the desk, stages reversible actions next, and says plainly that access grants and unverified resets are not in the first release |
| Next steps | Leaves with owners and actions: ticket export, trusted article list, change request for read access, meeting with the desk lead and outsourcing manager |
| Communication | Takes the "just close tickets" pushback without caving or lecturing, and explains the plan in operational terms the customer can repeat to his director |

Score each dimension from 1 to 5 with the scorer below; a 4 or 5 needs a quoted line of evidence, and a pass is no dimension below 2 and a mean of 3 or more.

## Common Mistakes

- Designing automatic password resets without asking how the requester proves who they are.
- Treating an access request as a single tool call, when the approval and the audit trail are the real product.
- Routing tickets by CMDB owner without asking how current the CMDB is.
- Measuring the agent on tickets closed, which rewards wrong closures, instead of reopen rate and requester confirmation.
- Forgetting the desk team and their contract, so the people who must use the agent work against it.
- Letting the agent attempt fixes on line-down tickets instead of escalating them at once.
