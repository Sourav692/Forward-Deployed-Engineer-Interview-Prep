# Executive Communication and Scope: Final Round

Executive communication is not making technical work sound simple. It is making the decision, trade-off, and consequence understandable enough that the right person can act.

## Existing Material: Essential Reading Path

Spend 15 minutes refreshing these sections and 20 minutes rehearsing one real scope negotiation and one bad-news update.

| Source | Read selectively | Practise afterwards |
| --- | --- | --- |
| [CTO Trust and Vision to Roadmap](https://github.com/Sourav692/Forward-Deployed-Engineer-Interview-Prep/blob/main/08_Company_Specific_Prep/Blitzy/05_CTO_Trust_And_Vision_To_Roadmap.md) | A3–A4: executive language and trust; B3–B5: gates, milestones, and constraints | Explain a constraint as a business consequence and offer a decision with options |
| [Communication and Influence](https://github.com/Sourav692/Forward-Deployed-Engineer-Interview-Prep/blob/main/04_Behavioral_and_Leadership/fde_competencies/02_communication_and_influence.md) | Technical trade-off, executive disagreement, and technical versus economic buyer | Explain how you understood competing priorities and earned agreement |
| [FDE Delivery Interview Script](https://github.com/Sourav692/Forward-Deployed-Engineer-Interview-Prep/blob/main/05_FDE_Delivery_and_Scoping/Delivery_Framework/INTERVIEW_SCRIPT.md) | Clarify and scope; final summary and trade-offs | Name the deliverable, evidence gate, accountable owner, and next decision |

If you need more scoping practice, use the [Complete Scoping Guide](https://github.com/Sourav692/Forward-Deployed-Engineer-Interview-Prep/blob/main/05_FDE_Delivery_and_Scoping/Scoping_An_FDE_Project/Scoping-an-FDE-Project-Complete-Guide.md). For ownership across engineering, security, and business teams, revisit [Enterprise SDLC and Cross-Functional Delivery](https://github.com/Sourav692/Forward-Deployed-Engineer-Interview-Prep/blob/main/08_Company_Specific_Prep/Blitzy/07_Enterprise_SDLC_Agile_CrossFunctional.md).

## Your Real Stakeholder Evidence

Use your pushback story from the ownership workbook. Capture what actually happened before practising the hypothetical CTO scenario.

| Prompt | Your evidence |
| --- | --- |
| What outcome did the senior leader want, and why? |  |
| What did the technical team need to protect? |  |
| Who could approve scope, budget, date, or risk? |  |
| Which options did you present, with what consequences? |  |
| What did you recommend, and what evidence supported it? |  |
| How did the stakeholder respond, and what did you negotiate? |  |
| What was agreed, recorded, and communicated? |  |
| What happened afterwards, and how did you maintain the relationship? |  |

Tell the story in two minutes, then give the decision update in 45 seconds. Keep facts from your experience separate from what you would do in a future Blitzy engagement.

## 1. The executive answer format

Use this in under a minute.

> **Outcome:** what we are trying to achieve.
>
> **Current fact:** what the evidence says now.
>
> **Decision:** the choice or recommendation.
>
> **Trade-off:** what we gain and give up.
>
> **Ask:** the decision, owner, or resource you need.

Example:

> "The outcome is a safe first proof that the customer can modernise this service faster. The current fact is that their baseline tests fail intermittently, so generated-code results would not yet be trustworthy. I recommend a two-week test-stability and bounded-module phase before a broader pilot. It delays the bigger demo, but prevents us from claiming validation we do not have. I need the engineering lead to name an owner for the test suite and reserve reviewer time for the first PRs."

## 2. Translate technical detail into executive consequences

| Technical detail | Executive meaning |
| --- | --- |
| Tests are flaky | We cannot certify change safely until we know whether a failure is new or already present |
| The repository context is stale | Plans may be wrong on the most active code, so we need a pinned snapshot or a refresh step |
| A PR is too large to review | Review capacity, not generation speed, is the bottleneck |
| Parallel run is needed | We prove the new system behaves like the old one before users depend on it |
| A secret or dependency is unavailable in validation | We cannot verify the change in the environment that matters yet |
| A feature flag is required | We can limit impact and reverse a bad outcome quickly |

Do not remove the mechanism if the interviewer asks for it. Start with the consequence, then go one layer deeper.

## 3. Negotiating scope without losing trust

When scope expands, do not say only "no". Show the choice.

| Step | Say it like this |
| --- | --- |
| Reconfirm the outcome | "The outcome we agreed is <outcome>. Does the new request replace it or add to it?" |
| Make impact visible | "Adding this means more interfaces, reviewers, and validation. The date, scope, or risk level has to move." |
| Offer options | "We can ship the original scope by <date>, include the new request and move the date, or run a small discovery spike first." |
| Recommend | "I recommend the bounded option because it gives us evidence before we commit the broader change." |
| Record the decision | "I will write down the chosen scope, owner, risk, and next review point." |

Scope negotiation is successful when the customer understands the cost of the decision and still feels ownership of it.

## 4. A Blitzy-style customer scenario

**Situation:** A CTO wants a broad legacy-modernisation pilot across several teams before the end of the quarter. The engineering leads say the validation environment and test suite are not ready.

**A strong response:**

> "I would agree with the ambition and separate it from the first commitment. I would propose a 30-day proof on one bounded module, with a baseline build, customer-owned validation, and reviewable PRs. In parallel, I would map the blockers for the wider estate: environment access, test health, dependency complexity, reviewer capacity, and change windows. At the end of the proof, we would have evidence for a scale decision instead of a broad promise. The CTO gets visible progress this quarter, and the engineering leads get a path that does not turn a production programme into an experiment."

**Decision request:** confirm the pilot module, name the technical owner, reserve reviewer capacity, and agree the success and stop criteria.

## 5. Stakeholder relationship habits

| Habit | What it sounds like |
| --- | --- |
| Bring bad news early | "This will miss the current path unless we make one of these changes." |
| Separate fact from recommendation | "The data shows X. My recommendation is Y because ..." |
| Make the owner visible | "Who has the authority to accept this risk?" |
| Protect the customer's credibility | "I will give you a concise update before your steering meeting, including what we do not know yet." |
| Close the loop | "We agreed this action, this owner, and this date. I will report back with the evidence." |

## 6. Executive communication drill

Set a two-minute timer. Explain each prompt as though the listener is a CTO who has little time.

1. A pilot is technically on track, but no business owner is using it.
2. Generated PRs pass tests, but reviewers reject them because they are too large.
3. A customer asks to auto-merge a high-risk change to meet a deadline.
4. A product limitation blocks one customer but is likely to recur elsewhere.

For each answer, include an outcome, a fact, your recommendation, the trade-off, and a decision request. Then repeat it in 45 seconds.

## 7. Questions that show executive judgement

Use the existing `03_Questions_To_Ask_Interviewer.md` for product questions. Add one closing question only if the conversation makes it natural:

> "When an FDE sees that a customer goal is sound but the proposed scope is unsafe or unmeasurable, how much room do they have to reshape the plan, and what support do they get from leadership?"

It signals that you want accountability and partnership, not just permission to execute.
