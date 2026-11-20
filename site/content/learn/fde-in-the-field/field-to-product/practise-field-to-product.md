# Practise From One Customer to Many


## How to use this practice

These questions are asked the way a behavioural or customer round asks them: "tell me about a time". Each one names the lesson that teaches its idea. Work through them in order:

1. Read the question and set a two-minute timer.
2. Answer aloud from your own experience, in four parts: the situation, what you did, the result, and what you would change.
3. Open the outline and compare. Each outline is one worked answer in that shape, not the only good one.

Tilford Software is the FDE's employer, and Wenlow Water and Craven Council are its customers. All three are composites, not real companies, and every figure below is illustrative.

> **What you'll practise**
>
> - Turning recurring complaints into a product requirement proposal.
> - Answering a fork request and building a connector others can reuse.
> - Ranking competing demands and planning across teams you do not manage.

## Product requirements from the field

Taught in [reusable need or one-off](/learn/fde-in-the-field/field-to-product/reusable-need-or-one-off).

<details>
<summary>Practice question 1. Tell me about a time you turned recurring customer complaints into a product requirement.</summary>

- **Answer:** At Tilford, support had nine tickets from four customers in a quarter about audit exports failing above 10,000 records. Craven's auditors were one. I grouped them under one need: auditors need every change for a period in one file. I counted customers, quoted two, and measured the workaround: an FDE splitting exports by week, about three hours per audit. I wrote a one-page proposal with the problem, evidence, the outcome wanted (a year of changes, about 120,000 records, in one request), what was out of scope and the ask. Product shipped an asynchronous export the next quarter. I would attach a sample dataset from the start.
- **Trade-off:** A day spent on evidence delays the ticket. Without it, the request competes as an anecdote.
- **Follow-up to expect:** "How did you know it was not one customer's problem?" Four unrelated customers, and the limit sat in our export code.

</details>

## Connectors, templates and forks

Taught in [configure, template or custom](/learn/fde-in-the-field/field-to-product/configure-template-or-custom).

<details>
<summary>Practice question 2. A customer expanding to many more sites asks for its own fork of your product so it can move faster. Tell me how you handled a request like that.</summary>

- **Answer:** Wenlow Water was growing from two regions to six and asked for its own branch to add regional dispatch rules. I asked what each region needed. The rules were mostly values, so we built a rules table per region in configuration, plus one extension point for a custom priority calculation. We pinned Wenlow to one release during the rollout so nothing moved under them. All six regions went live on the main product, and the next upgrade took a day. I would now write "new regions use configuration" into the statement of work at the start.
- **Trade-off:** Configuration took two weeks longer than a fork. A fork would have cost a manual merge every quarter after.
- **Follow-up to expect:** "What if a region needed real code?" The extension point, owned and tested against a stable interface.

</details>

<details>
<summary>Practice question 3. Tell me about a time you turned a one-off integration into a connector and deployment template other customers could use.</summary>

- **Answer:** After a copied connector failed silently at Craven, I rebuilt it as a shared core for paging, retries and errors, a mapping file per customer for fields, version and authentication, and adapters for two product versions. Each customer got a contract test run on every release with a sample of their data. For deployment, I wrote a versioned template with network, sizes, single sign-on and region as parameters. The next customer connected in four days instead of three weeks. I would write the contract tests first next time.
- **Trade-off:** The rebuild took a month of FDE time. Every later customer and upgrade got cheaper.
- **Follow-up to expect:** "Who owns the template now?" The platform team, with FDEs contributing changes through review.

</details>

## Capacity and coordination

Taught in [capacity and cross-team delivery](/learn/fde-in-the-field/field-to-product/capacity-and-cross-team-delivery).

<details>
<summary>Practice question 4. Tell me about a time you were the only specialist two customers needed in the same week.</summary>

- **Answer:** In one week, Wenlow had a cutover in its monthly change window and Craven needed me to walk its security team through our connector. I listed what each needed and which dates were fixed. Wenlow's window could not move. Craven's session could move a week, and a colleague could cover the first part with my notes. I took that to my manager with a recommendation, then told both customers the plan. Both went well, and Craven accepted the one-week move. What I would change: never be the only specialist. I now pair someone on each engagement.
- **Trade-off:** Moving Craven cost a week of its review. Splitting myself across both risked the cutover.
- **Follow-up to expect:** "What if both dates were fixed?" My manager decides, using what delay costs each customer.

</details>

<details>
<summary>Practice question 5. One Thursday afternoon you have a data error at one customer, a pilot milestone at another next Tuesday, a platform fix to review before Friday's release and a sales call tomorrow. Walk me through how you handled it.</summary>

- **Answer:** Craven's sync had written wrong figures into reports for councillors. That came first: I paused the sync, told Craven's lead, and corrected the data that evening. The platform review was 30 minutes and blocked a release for every customer, so I did it Friday morning. Wenlow's pilot got Friday afternoon and Monday, protected in my calendar. I offered sales a slot next week or a colleague, and they took the colleague. I messaged each requester with where they stood. I would hold more of my week in reserve.
- **Trade-off:** Sales did not get me. The pilot and the data fix stayed safe.
- **Follow-up to expect:** "Sales escalates to your manager." Good: the manager decides with my reasons in front of them.

</details>

<details>
<summary>Practice question 6. Tell me about a plan you built to coordinate sales, product, security and customer IT for a go-live.</summary>

- **Answer:** Wenlow's go-live was tied to its renewal. It needed a product flag released, a Tilford security sign-off, and single sign-on set up by Wenlow's IT, whose change board met monthly. I drew one plan with each dependency, owner and date, agreed with each lead, and booked the change board first because it was slowest. We met for 30 minutes weekly on the next two weeks only and kept a decision log. The sign-on change slipped, but we saw it three weeks early and still went live before the renewal. I would invite customer IT to the kickoff, not week three.
- **Trade-off:** The weekly meeting cost each team half an hour. It found the slip while there was time to recover.
- **Follow-up to expect:** "A team ignored the plan." I raised it through the sponsor, with the date it put at risk.

</details>

## References

1. Atlassian, [What is a product requirements document (PRD)?](https://www.atlassian.com/agile/product-management/requirements), accessed 17 November 2026. The document product writes once it commits.
2. ProductPlan, [Cost of Delay](https://www.productplan.com/glossary/cost-of-delay/), accessed 17 November 2026. Ranking work by the value lost while it waits.
3. The site's lessons [reusable need or one-off](/learn/fde-in-the-field/field-to-product/reusable-need-or-one-off), [configure, template or custom](/learn/fde-in-the-field/field-to-product/configure-template-or-custom) and [capacity and cross-team delivery](/learn/fde-in-the-field/field-to-product/capacity-and-cross-team-delivery).

## Key takeaways

- Answer behavioural questions in four parts: situation, action, result, what you would change.
- Bring numbers: customers counted, hours saved, days gained.
- Show the decision you made and who you told, not only the work you did.
- End with one honest change you would make next time.

## Check yourself

<details>
<summary>1. In practice question 2, why pin Wenlow to one release during its rollout?</summary>

It gave Wenlow the control it wanted from a fork, without the cost of a separate branch.

</details>

<details>
<summary>2. In practice question 5, why did the 30-minute platform review come before the pilot work?</summary>

It was short and blocked a release for every customer. The pilot was days away and could still have its time protected.

</details>

<details>
<summary>3. Why end each answer with what you would change?</summary>

It shows you learn from the work, and it gives the interviewer a natural follow-up.

</details>
