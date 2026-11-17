# Practise Scoping and Value Questions


## How to use this practice

Customer-scenario rounds often end with "so what would you build first, and when?" These questions drill that part. For each one, answer aloud in two minutes, then compare with the outline. For the arithmetic questions, write the numbers down as you go, as you would on a whiteboard.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Choosing a first release and the questions that shape it.
> - Estimating and planning under uncertainty.
> - Doing value and payback arithmetic aloud.

## First releases and first questions

Taught in [problem, goal and definition of done](/learn/forward-deployed/scoping-an-fde-project/problem-goal-and-definition-of-done), [shrinking to a first release](/learn/forward-deployed/scoping-an-fde-project/shrinking-to-a-first-release) and [build, buy, configure or no AI](/learn/forward-deployed/scoping-an-fde-project/build-buy-configure-or-no-ai).

<details>
<summary>Practice question 1. The sponsor wants an impressive demo for the board. You think a smaller useful tool is the right first release. How do you decide?</summary>

- **Answer:** Ask what the board needs to decide after the demo. If it is funding for real use, a working tool on real data with a measured result is the stronger demo. Propose the smallest release that changes a real user's day, and demo that. Keep the impressive features on the roadmap with their cost.
- **Trade-off:** A narrow tool looks modest on stage. A polished demo that cannot run in production wastes the funding it wins.
- **Follow-up to expect:** "The board date is fixed." Plan the first release to land before it, and demo it live.

</details>

<details>
<summary>Practice question 2. A department head says, "Our onboarding is too slow, fix it." What are your first five questions?</summary>

- **Answer:** How long does onboarding take now, and how do you know? What does "fixed" look like, in days or another number? Where does a new starter wait, and for whom? Which systems and teams are involved? What have you already tried? The first two give the metric and baseline. The rest point at the bottleneck.
- **Trade-off:** Asking five questions before offering anything can feel slow. It avoids building a portal for a problem that is really slow laptop delivery.
- **Follow-up to expect:** "Nobody measures it." Then measuring the last twenty starters is the first piece of work.

</details>

<details>
<summary>Practice question 3. Tell me about a time you solved a customer problem without AI.</summary>

- **Answer:** Pick a real case where the input or process was the problem. Say what was asked, what you found, what you built instead, such as a form, a rule or an integration, and the measured result. Add whether AI came later for what remained. The point is judgement: you chose the cheapest option that met the outcome.
- **Trade-off:** In an AI-focused loop, a no-AI story can seem off-topic. Frame it as how you decide when AI fits.
- **Follow-up to expect:** "Was the customer disappointed?" Say how you kept AI on the plan for the work it suited.

</details>

## Estimates and plans

Taught in [estimates people can trust](/learn/forward-deployed/scoping-an-fde-project/estimates-people-can-trust) and [from estimate to build plan](/learn/forward-deployed/scoping-an-fde-project/from-estimate-to-build-plan).

<details>
<summary>Practice question 4. How do you set milestones and give estimates when much is unknown?</summary>

- **Answer:** Break the work into deliverables, mark each as known or guessed, and give ranges, not single dates. Make each milestone prove something, such as access working or the first model passing its evaluation set. Name what would move each range, and re-estimate when a fact changes.
- **Trade-off:** Ranges frustrate people who want one date. A single date built on guesses gets missed and costs trust.
- **Follow-up to expect:** "The sponsor needs one date." Give the date you are 80% confident in, and say what it depends on.

</details>

<details>
<summary>Practice question 5. Estimate a ten-day pilot for a document-search assistant. Talk me through it.</summary>

- **Answer:** Day one: access and a sample of documents. Days two and three: ingestion and search on that sample. Days four and five: build a test set of thirty real questions with users. Days six to eight: tune and add citations. Day nine: users try it. Day ten: results against the test set and a go or no-go. Access is the riskiest dependency, so I request it before day one.
- **Trade-off:** Ten days forces a small sample and a narrow scope. That keeps the pilot honest about what it proves.
- **Follow-up to expect:** "Access takes five days." Use a public or synthetic sample for the build days, and swap in real data when access lands.

</details>

<details>
<summary>Practice question 6. Leadership wants a release in four weeks, but data access approval takes three. How do you plan?</summary>

- **Answer:** Submit the access request on day one with everything the approvers need. Build against synthetic or masked data meanwhile, and write the tests. Plan week four for real data, testing and release, and agree a smaller scope if access slips. Tell leadership the dependency and its date now, not in week three.
- **Trade-off:** Synthetic data hides real data problems until week four. The test set catches some of them early.
- **Follow-up to expect:** "Can you get access faster?" Ask the sponsor to escalate the request, with the release date as the reason.

</details>

<details>
<summary>Practice question 7. Plan a six-week pilot, and explain how you would communicate its estimates.</summary>

- **Answer:** Week one: access, baseline and test set. Weeks two and three: build the narrow first slice. Week four: users try it, and we fix what they find. Week five: measure against the baseline. Week six: results, decision and plan. I share the plan with ranges, a weekly one-page status with risks, and re-estimates as soon as a fact changes.
- **Trade-off:** Weekly updates cost an hour each. Without them, a slip becomes a surprise in week five.
- **Follow-up to expect:** "What makes it fail?" Late access and no baseline. Both are week-one work for that reason.

</details>

## Value arithmetic

Taught in [baselines, value and ROI](/learn/forward-deployed/scoping-an-fde-project/baselines-value-and-roi).

<details>
<summary>Practice question 8. A tool saves 2 minutes on each of 15,000 cases a month. Staff cost £30 an hour. Estimate the value.</summary>

- **Answer:** 15,000 × 2 = 30,000 minutes, which is 500 hours a month. At £30, that is £15,000 of staff time. Then ask how much becomes money: if only overtime can be cut, and overtime is 150 hours, the cash saving is £4,500 a month. The rest is capacity, worth stating separately.
- **Trade-off:** Quoting £15,000 sounds better. It falls apart when finance asks which budget line goes down.
- **Follow-up to expect:** "Where do the 2 minutes come from?" From timed samples before and during a trial, not from the vendor.

</details>

<details>
<summary>Practice question 9. A project costs £90,000 to build and £3,000 a month to run. It saves £10,500 a month. What is the payback, and what would you check?</summary>

- **Answer:** Net benefit is £10,500 − £3,000 = £7,500 a month. Payback is £90,000 ÷ £7,500 = 12 months. I would check the saving's assumptions first, especially how much time becomes money, then whether running cost grows with volume, and whether the customer prefers a discounted measure.
- **Trade-off:** Payback is simple to explain. It ignores everything after month twelve and the timing of cash.
- **Follow-up to expect:** "What if the saving is 20% lower?" £8,400 − £3,000 = £5,400 net, so about 17 months.

</details>

<details>
<summary>Practice question 10. A sponsor's business case assumes savings you think are inflated. You have only a few minutes. How do you estimate the real figure?</summary>

- **Answer:** Rebuild it from three numbers: volume per month from the system, minutes saved per case from a quick timed sample, and the share of freed time that becomes money from finance. Multiply them and compare with the claim. Show the gap and which assumption drives it, then propose measuring it properly in the pilot.
- **Trade-off:** A quick estimate has wide error bars. It is still better than an unexamined claim.
- **Follow-up to expect:** "The sponsor is attached to their number." Present yours as a range, and let the pilot settle it.

</details>

## Key takeaways

- Choose the smallest release that changes a real user's day.
- Start every vague request with the metric and the baseline.
- Give ranges, make milestones prove something and re-estimate when facts change.
- Do value arithmetic aloud, and separate staff time from cash.

## Check yourself

<details>
<summary>1. In practice question 8, why is £15,000 not the saving?</summary>

It is the value of staff time freed. Only the hours that leave a budget, such as overtime, become cash.

</details>

<details>
<summary>2. In practice question 6, why tell leadership about the access dependency in week one?</summary>

So they can escalate the request or agree a smaller scope while there is still time. In week three, only the date can move.

</details>
