# Bank Policy Assistant Client Simulation

This is a 45-minute client simulation, the conversation at the heart of most FDE loops: the interviewer plays the customer and answers only what is asked, so a constraint you never ask about stays hidden and still costs you marks. With a partner, hand them this page and have them reveal a constraint only when your question earns it. Alone, read the opening brief, write your questions down, then open one constraint at a time, and only for a topic you actually asked about.

## The Customer

The customer is the head of retail operations at a regional bank with a branch network and a contact centre. She owns service standards for front-line staff, but not the policies themselves: those belong to product, legal and compliance owners.

> "My staff ring the policy team all day with the same questions. Can this customer open a joint account under a power of attorney? Can we waive this fee? I want a chatbot that knows all our policies, so they get the answer instantly."

She cares about three things: customers waiting at the counter or on hold while staff hunt for an answer, branches giving different answers to the same question, and anything that would put the bank in front of its regulator.

## The Opening Brief

"Thanks for coming in. The short version is that our front-line staff can't find policy answers quickly. Everything is on the intranet, but nobody can search it properly, so people ring the policy team or ask whoever is sitting next to them, and the answers vary. I've seen these AI assistants in demos and I want one for my staff. Ideally it's live before the end of the quarter. Where would you start?"

## Hidden Constraints

<details>
<summary>Reveal when the candidate asks about where the policies live and how current they are</summary>

"We have about [number of policy documents] policies and procedures on the intranet. Each has an owner and an effective date, but old versions aren't always taken down, and some branch teams keep their own crib sheets that nobody has checked."

**Why it matters:** "All our policies" is not a trusted corpus. The assistant must index only current, owner-approved versions, show the effective date on every answer, and leave crib sheets out. Without this question, the candidate builds a fast way to give the old answer.

</details>

<details>
<summary>Reveal when the candidate asks about the cost of a wrong answer</summary>

"If a member of staff tells a customer something wrong about eligibility, fees or their right to complain, that's a conduct issue, and we may have to report it. Compliance has already told me the tool must never phrase anything as advice to a customer."

**Why it matters:** This sets the risk boundary. The assistant answers staff, never customers. It quotes policy rather than paraphrasing it, and when a question needs a judgement about a specific customer it says so and routes the question to the policy team.

</details>

<details>
<summary>Reveal when the candidate asks about who may see which policies</summary>

"Fraud and financial-crime procedures are restricted to the specialist teams. If branch staff could read how we spot fraud, so could anyone who leans on them."

**Why it matters:** Permissions must be enforced in retrieval, at the document level, not by an instruction in the prompt. The safe first slice leaves restricted procedures out of the index entirely until their access rules are mapped and tested.

</details>

<details>
<summary>Reveal when the candidate asks about audit or record-keeping</summary>

"Compliance must be able to show what guidance a member of staff was given on a given day, and we keep that kind of record for [record retention period]."

**Why it matters:** Every answer needs a log entry with the question, the policy versions retrieved, the answer shown and the model version. The log is a launch requirement, not a later improvement, and its retention period shapes storage and cost.

</details>

<details>
<summary>Reveal when the candidate asks about what staff will type into it</summary>

"Staff will paste customer details into anything with a text box. Our data protection officer won't approve a tool that stores customer names or account numbers outside our core systems."

**Why it matters:** Policy questions do not need customer data, so the design should detect and strip names and account numbers at input, and keep them out of logs. Asking this early turns a likely blocker into a design choice.

</details>

<details>
<summary>Reveal when the candidate asks about volume, the questions asked most, or how success is measured</summary>

"The policy team takes around [calls to the policy team per day]. A branch query takes about [average time to answer a policy query] to resolve, and the customer waits all that time. Most questions are about account opening, third-party authority and fees."

**Why it matters:** This gives the baseline and the first slice. A small number of question families carries most of the volume, and the measures are time to answer, the rate of escalation to the policy team, and accuracy against the policy owners' own answers.

</details>

<details>
<summary>Reveal when the candidate asks about who approves the launch</summary>

"Each policy owner has to approve how their policy is used before anything goes live, and compliance wants to review a sample of answers before any branch sees it."

**Why it matters:** The launch gates belong to the policy owners and compliance, not to the operations team. The pilot can only cover policies whose owners have signed up, and the evaluation set should be built with them.

</details>

## How the Round Runs

| Time | Phase | The candidate | The customer |
|---|---|---|---|
| 0–15 min | Discovery | Asks about a real query, the cost of a wrong answer, sources, permissions, audit and success before naming any technology | Answers plainly and reveals a constraint only when a question targets it |
| 15–20 min | Framing back | Plays back the problem, users, risk boundary and success measures in under a minute, then asks what was missed | Corrects one detail if the playback is wrong |
| 20–35 min | Shaping a first slice | Proposes a narrow, staff-only, read-only pilot and says what is left out and why | Pushes for "all policies, all staff, by quarter end" |
| 35–45 min | Risks and next steps | Names the top risks with a control for each, the launch gates and the next actions with owners | Asks, "So what happens on Monday?" |

## What a Strong Candidate Says

**Discovery**

- "Can you walk me through the last time a branch rang the policy team? What was the question, and what was the customer doing while they waited?"
- "If a member of staff gets an answer wrong, what's the worst that happens?"
- "Who owns each policy, and how does anyone know which version is current?"
- "Are there procedures some staff shouldn't see?"
- "If something goes wrong, what would compliance need to prove later?"

**Framing back**

- "Let me play that back. Staff wait [average time to answer a policy query] for answers, and a wrong answer can become a conduct issue. Policies have owners and dates, but old versions linger. Some procedures are restricted, and compliance needs a record of every answer. Have I missed anything?"

**Shaping a first slice**

- "I'd start with the questions you get most: account opening and third-party authority. Only current, owner-approved policies go in."
- "It answers staff, never customers. Every answer quotes the clause and its effective date. If the question needs a judgement about a customer, it says so and sends it to the policy team."
- "End of quarter is realistic for a pilot with [number of pilot branches] branches and one contact-centre team. It isn't realistic for every policy, and I'd rather tell you that now."

**Risks and next steps**

- "The biggest risk is a confident answer from an old version. We block that by indexing current versions only and showing the date every time."
- "Before any branch sees it, compliance reviews [number of test questions] real questions answered by the policy owners."
- "Next steps: an export of the policy team's question log, a named owner for each pilot policy, and time with your data protection officer this week."

## Score the Round

| Dimension | Strong evidence in this round |
|---|---|
| Discovery questions | Asks about a real query, the cost of a wrong answer, policy versions, restricted content and audit before naming a model, and uncovers at least five of the seven constraints |
| Handling constraints | Turns each revealed constraint into a design choice: current versions only, staff-facing only, restricted procedures excluded, customer details stripped at input, every answer logged with policy versions |
| Framing back to the customer | Plays back the pain, the users, the risk boundary and the success measures in the customer's own words, using her figures, and asks what was missed |
| Scoping | Picks one or two question families and a named pilot group, and says out loud why "all policies by quarter end" is not the first release |
| Next steps | Leaves with concrete actions and owners: question log export, policy-owner sign-up, data protection review, compliance test set |
| Communication | Plain language a branch manager would follow, no unexplained jargon, and calm, direct pushback on the deadline |

Score each dimension from 1 to 5 with the scorer below; a 4 or 5 needs a quoted line of evidence, and a pass is no dimension below 2 and a mean of 3 or more.

## Common Mistakes

- Loading every document on the intranet, crib sheets and expired versions included, because "more context is better".
- Treating the assistant as if it advises customers, which turns every answer into a regulated statement.
- Writing "do not reveal fraud procedures" into the prompt instead of keeping those documents out of retrieval.
- Never asking about audit, then learning in the next meeting that every answer must be reconstructable.
- Measuring success by whether staff like it, rather than time to answer, escalation rate and accuracy against policy owners' answers.
- Agreeing to "everything by quarter end" without a gated pilot and named launch approvers.
