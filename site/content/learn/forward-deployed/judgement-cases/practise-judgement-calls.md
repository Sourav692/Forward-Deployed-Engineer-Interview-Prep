# Practise Judgement Calls


## How to use this practice

The other pages in this module are full cases you design over 45 minutes. This page drills the step those cases end on: a decision written down so that a sponsor can act on it. Interviewers ask for it as "send me your recommendation" or "what would you tell the customer?", and a take-home often ends with the same request.

Pick one case. Give yourself 20 minutes and write the recommendation in the five parts below, on one page. Score it against the rubric before you open the outline. Then try a second case of a different type.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Choosing between use cases with gates first and value second.
> - Deciding what to build when the data is poor, or saying not yet.
> - Naming what breaks when a pilot scales, and what to fix first.
> - Writing a recommendation a sponsor can act on, and scoring it.

## The one-page recommendation

Write it in five parts, in this order. A sponsor who reads only the first line should still know what you advise.

1. **Decision.** One sentence: what to do, for whom, by when.
2. **Why.** Two or three reasons, each with a number from the case.
3. **What it costs and risks.** The main trade-off, and what you are choosing not to do.
4. **What would change my mind.** The evidence that would reverse the decision, and the kill criteria for the pilot.
5. **Next step.** One action with an owner and a date.

## The rubric

Score each row 0, 1 or 2. Ten is a strong answer. Below six, rewrite before you read the outline.

| Criterion | 0 | 1 | 2 |
|---|---|---|---|
| Decision first | No clear decision, or it comes last | A decision, but hedged ("we could consider…") | One sentence a sponsor can approve or reject |
| Evidence | No numbers | Numbers, but not tied to the decision | Each reason carries a number from the case |
| Trade-off | None stated | Named, but no cost | Names what is given up and what it costs |
| Reversibility | No way to stop | A vague "review later" | Kill criteria with a measure and a date |
| Next step | None | An action with no owner or date | One action, one owner, one date |

*Table 1: The rubric. The same five rows score every case on this page.*

The rubric scores judgement, not prose. A plain list that hits every row beats an elegant page with no kill criteria.

## Which use case first

Method: [choosing the first use case](/learn/forward-deployed/customer-discovery/choosing-the-first-use-case) and the full case prioritise AI use cases.

<details>
<summary>Case 1. A housing association has three ideas: a tenant chatbot for repair requests (14,000 a month), an AI that drafts responses to formal complaints (300 a month, each taking an officer 3 hours), and rent-arrears risk scoring. The chief executive wants the chatbot. Which do you recommend first?</summary>

- **Decision:** Start with complaint drafting, reviewed by an officer, live for one team in eight weeks.
- **Why:** 300 complaints × 3 hours is 900 officer hours a month, and a draft that saves even one hour each frees 300. Every draft is reviewed, so a bad one costs minutes, not a tenant. The chatbot meets 14,000 tenants unsupervised on day one. Arrears scoring would drive an adverse decision about a tenant and fails the permissible-decision gate as framed.
- **Trade-off:** The chief executive's visible idea waits a quarter. Say so in the first meeting, not after the pilot.
- **What would change it:** If complaint letters cannot leave the case system for policy reasons, drafting stalls and the chatbot, limited to logging repairs, goes first.
- **Follow-up to expect:** "The CEO insists." Offer the chatbot as wave two, scoped to logging and tracking repairs, with no advice.

</details>

<details>
<summary>Case 2. A logistics firm's operations director lists twelve ideas and asks you to score them all by Friday. Four have no owner and three have no metric anyone can measure today. What do you send on Friday?</summary>

- **Decision:** Score the five ideas that pass the gates, and send the other seven back with the one missing item each needs.
- **Why:** A score on an idea with no owner or metric invites a ranking that nobody can fund or test. Five scored ideas give the director a real choice by Friday.
- **Trade-off:** The director asked for twelve and gets five. The seven are not rejected. Each has a named gap and a person who can close it.
- **What would change it:** If a gated idea gains an owner and a baseline before Friday, score it.
- **Follow-up to expect:** "Can't you estimate the metric yourself?" You can propose one, but the owner must agree it, or the pilot has no judge.

</details>

<details>
<summary>Case 3. Two ideas score the same on value. One reuses the search index the customer already runs. The other needs a new data feed from a vendor that takes 10 weeks to sign. Which goes first?</summary>

- **Decision:** The one on the existing index, starting now, while the vendor contract runs in parallel.
- **Why:** Equal value, but one can show a result in 4 weeks and the other cannot start for 10. An early result also earns the trust that the second idea will need.
- **Trade-off:** If the vendor idea has a deadline (a regulation, a contract renewal), it may need to start first despite the wait.
- **What would change it:** A dated external deadline on the second idea.
- **Follow-up to expect:** "Isn't that picking the easy one?" Yes, when value is equal. Feasibility breaks ties.

</details>

## When the data is poor

Full case: build when the customer's data is poor.

<details>
<summary>Case 4. A manufacturer wants AI to route 2,000 warranty claims a month to the right team. A one-week profile shows 40% of claims have no product code, and the "reason" field is free text in four languages. The sponsor wants a model this quarter.</summary>

- **Decision:** Build the repair step first: extract the product code and reason from the text, sent to human review when unsure, live in five weeks. Decide on routing after that.
- **Why:** Routing on a field missing 40% of the time fails on 800 claims a month. Extraction fixes the field for every downstream use, and the review queue produces the labels a routing model will need.
- **Trade-off:** The sponsor sees "data work" this quarter, not routing. Show the extraction accuracy and the review hours saved as the quarter's result.
- **What would change it:** If extraction cannot reach an agreed accuracy (say 90% on a 200-claim test set) in three weeks, stop and fix the claim form instead.
- **Follow-up to expect:** "Can't the model cope with missing fields?" It can guess. A guess on 800 claims a month is the problem the sponsor wants solved, not a solution.

</details>

<details>
<summary>Case 5. A clinic network wants a summary of each patient's history before appointments. Notes exist, but 30% are scanned handwriting and there is no agreed definition of a good summary. What do you recommend?</summary>

- **Decision:** Not yet for all notes. Pilot summaries on typed notes only, for one clinic, once two clinicians have written 30 reference summaries.
- **Why:** With no definition of good, nobody can say whether the summary helps or harms. Scanned handwriting adds an error layer before the model even starts.
- **Trade-off:** Patients whose history is mostly scanned get no summary in the pilot. Say this plainly, and show the summary as "typed notes only".
- **What would change it:** A handwriting recognition test on 100 scanned pages that meets the clinicians' bar.
- **Follow-up to expect:** "Clinicians are too busy to write 30 summaries." Then the pilot has no judge. Ask for 15 from each of two clinicians, 2 hours each.

</details>

<details>
<summary>Case 6. A retailer's product catalogue has 50,000 items with duplicate and conflicting attributes. The goal is AI product answers on the website. The data team says cleaning takes six months. What do you advise?</summary>

- **Decision:** Clean and launch the top 2,000 products by traffic first, in six weeks. Answers for the rest say "see the product page".
- **Why:** In most catalogues a small share of products carries most of the traffic. Check that share in the retailer's analytics before committing. Cleaning 2,000 items is weeks, not months, and the answers they power can be tested.
- **Trade-off:** Long-tail products get no AI answer at launch.
- **What would change it:** If the top 2,000 carry less than half of product-page traffic, the slice is too thin to matter. Widen it, or reconsider the goal.
- **Follow-up to expect:** "Who keeps the 2,000 clean?" Name the catalogue owner and a weekly check on new conflicts before launch.

</details>

## When the pilot scales

Full case: scale a prototype to production.

<details>
<summary>Case 7. An internal assistant worked for 100 volunteers. The sponsor wants all 9,000 staff on it next month. Nobody owns it after you leave, and there is no evaluation set. What do you recommend?</summary>

- **Decision:** Roll out by cohort, 500 staff first, once a named owner and a 150-question evaluation set exist. Target the first cohort in four weeks.
- **Why:** Volunteers forgive. Nine thousand staff include the ones who do not, and they ask questions the volunteers never did. With no owner, the first incident has nobody to page. With no evaluation set, nobody can tell whether a fix made it worse.
- **Trade-off:** The full launch moves from one month to about three.
- **What would change it:** If the first 500 show error and adoption rates that hold steady for two weeks, widen faster.
- **Follow-up to expect:** "What's the kill criterion?" A wrong-answer rate above the agreed threshold on the evaluation set, or a serious incident, pauses the next cohort.

</details>

<details>
<summary>Case 8. A pilot costs £1,200 a month for 200 users. Finance asks what 6,000 users will cost and whether to approve it.</summary>

- **Decision:** Approve a 1,000-user step with a cost cap, and report the per-user cost before the next step.
- **Why:** Linear scaling gives 30 × £1,200 = £36,000 a month, but pilot users are not average users. Heavy users, longer documents and retries change the figure. A 1,000-user step measures the real cost per user before finance commits to 6,000.
- **Trade-off:** Finance wants one number now. Give the linear figure as a starting point, not a forecast. Say what could raise it (heavier users) and what would lower it (caching, a smaller model for simple questions, shorter prompts).
- **What would change it:** If cost per user rises with the larger group, stop and cut cost before going further.
- **Follow-up to expect:** "What's your number?" About £36,000 a month if usage per person holds, with a measured figure in six weeks.

</details>

<details>
<summary>Case 9. A claims triage model is accurate in the pilot region. The customer wants it in four more regions next quarter. Each region uses different claim forms and two have different regulations.</summary>

- **Decision:** Expand to the one region with the same forms and rules next quarter. Treat the other three as new pilots with their own test sets.
- **Why:** Accuracy measured on one region's forms says little about other forms. Different rules can turn a correct triage into a non-compliant one.
- **Trade-off:** Three regions wait. Each new pilot costs time for test sets and a compliance review.
- **What would change it:** A 200-claim test on each region's forms that matches the pilot's accuracy, plus compliance sign-off.
- **Follow-up to expect:** "Can't you just fine-tune on their data?" Possibly, but first measure how the current model does on it. The test decides whether tuning is needed.

</details>

## Worked example: Case 1 as a one-page recommendation

> **To:** Chief executive, Harbourside Homes. **From:** FDE. **Re:** First AI use case.
>
> **Decision.** Start with complaint-response drafting for the Central team, every draft reviewed by an officer, live by 15 January.
>
> **Why.** Formal complaints take 900 officer hours a month (300 at 3 hours each). A reviewed draft that saves one hour each frees 300 hours a month. Every draft is checked before it is sent, so an error costs an officer minutes. The repair chatbot would answer 14,000 tenants a month with no one checking.
>
> **Cost and risk.** The chatbot waits until wave two. Rent-arrears scoring is off the list as framed: it would drive a decision about a tenant with no human review.
>
> **What would change my mind.** If complaint letters cannot leave the case system, drafting stops and a repair-logging chatbot goes first. Kill criteria: if officers rewrite more than half of each draft by week four, or time saved is under 30 minutes a complaint, we stop.
>
> **Next step.** Head of complaints to name two officers to label 40 past responses, by 5 December.

Scored against Table 1: decision first (2), each reason carries a number (2), trade-off named with its cost (2), kill criteria with a measure and a date (2), one owner and one date (2). Ten.

## References

1. The site's [choosing the first use case](/learn/forward-deployed/customer-discovery/choosing-the-first-use-case) lesson, for ranking use cases and the autonomy ladder.
2. The site's prioritise AI use cases case, for the four gates and weighted scoring.
3. The site's build when the customer's data is poor case, for profiling and the build-or-not-yet decision.
4. The site's scale a prototype to production case, for cohort rollout, ownership and cost sizing.
5. The site's decomposition classics case, for further judgement practice in high-stakes domains.

## Key takeaways

- Put the decision in the first sentence. A sponsor who reads only that line should know what you advise.
- Apply gates before value: an idea with no owner, no metric or an unreviewed adverse decision is not ready to score.
- When data is poor, fix the data for one slice and ship that as the result, or say not yet with the evidence that would change it.
- When a pilot scales, roll out by cohort, with an owner, an evaluation set and a measured cost per user.
- Every recommendation names its kill criteria and one next step with an owner and a date.

## Check yourself

<details>
<summary>1. Why does the rubric score reversibility?</summary>

A pilot without kill criteria has no point at which anyone can stop it. Naming the measure and the date in advance makes stopping a planned outcome, not a failure.

</details>

<details>
<summary>2. In case 2, why send back seven ideas instead of scoring them?</summary>

They have no owner or no metric. A score would rank ideas that nobody can fund or test, and the ranking would mislead the director.

</details>

<details>
<summary>3. In case 4, why build extraction before routing?</summary>

Routing depends on the product code, which is missing from 40% of claims. Extraction fixes that field, and its review queue produces labels for routing later.

</details>

<details>
<summary>4. In case 8, why is £36,000 a month a starting point rather than a forecast?</summary>

It assumes pilot users behave like everyone else and nothing is optimised. Heavier users can raise it, and caching or a smaller model can lower it. Measuring cost per user at 1,000 users replaces the assumption with data.

</details>
