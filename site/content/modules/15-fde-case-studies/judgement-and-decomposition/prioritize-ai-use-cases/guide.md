# Prioritise AI Use Cases for a Large Enterprise

*The use case that impresses the executive is rarely the one that survives contact with the data, the regulator and the users.*

This is a portfolio question, not a design question. Nothing gets drawn until the list has been cut. The answer is a repeatable way to turn thirty enthusiastic one-liners into a funded sequence with kill criteria, and the architecture only appears as the shared platform that makes later items cheaper. The page is the standalone pack for this case.

| Case | Where it comes from | What the source gives |
|---|---|---|
| #60 Prioritise AI Use Cases for a Large Enterprise | FDE Problem Decomposition Question Bank, Question 16 | The prompt, ten prioritisation criteria, six selection properties, one follow-up and its answer, all quoted in section 1 |

The source is talking points, not a worked answer. Everything marked *(own construction)* was built for this page from the arguments in this site's delivery, cost and decomposition material. The insurer, its thirty use cases and every number attached to them are assumptions, not data.

---

## 1. Refuse to Pick the Most Impressive Demo

The prompt, verbatim from Question 16:

> "An executive gives you a list of 30 potential AI use cases. How do you decide what to build first?"

The source's answer names ten criteria: business value, user pain, feasibility, data availability, integration complexity, risk, time to value, adoption likelihood, reusability and evaluation difficulty. It then states the one instruction that matters most: *"You should explicitly avoid selecting the most impressive demo."*

It closes with the property list of a good first pick, verbatim:

- A measurable outcome
- A realistic path to adoption
- Manageable risk
- Available data
- A practical integration path
- A credible evaluation strategy

The trap is real because demos and production reward different things. A demo hides traffic shape, tail latency, usage expansion and governance cost, in the words of the cost cram sheet. So the most impressive demo is often the use case whose production cost is least visible. Say that in the first two minutes, then make the method the answer:

> *"I won't pick a winner from the list. I'll gate out the ones that can't be measured or can't be allowed, score the rest on value and on what makes value real, then check the ranking against dependencies and portfolio balance. The first build is the one with a measurable outcome, available data and a credible eval — and it should also lay platform that makes the next three cheaper."*

## 2. Ask What "Prioritise" Decides

A ranking is only useful if it changes a decision. So the first question is which decision this one feeds. Each of the questions below changes the method, not just the answer *(own construction)*.

| QUESTION | WHAT CHANGES WITH THE ANSWER |
|---|---|
| Who is the sponsor, and who owns each use case's outcome? | Whether a use case with no business owner is scored at all; the source's rule is to refuse work with no measurable metric and no SME |
| What budget and horizon: one team for a quarter, or a programme for two years? | How many items fit in wave 1, and whether platform enablers can be funded ahead of their first user |
| Does "prioritise" mean pick one pilot, or fund a portfolio? | One pilot optimises for learning and credibility; a portfolio also optimises for reuse and balance |
| What is the risk appetite, and which regulator watches? | Where the risk gate sits; insurance regulators expect governance and human oversight of models that make decisions about customers, and in the EU a customer can contest a solely automated decision and ask for a human |
| What has already been tried, and why did it stall? | Whether the real blocker is data access, adoption or trust, which moves the weights |
| Build, buy or both? | Commodity use cases, such as a coding assistant, leave the build list entirely |

When the interviewer declines to answer, state the assumptions aloud. For this page: a mid-size property and casualty insurer, a two-year programme, one platform team of about eight engineers, and a sponsor who wants visible value inside two quarters.

## 3. Turn Thirty One-Liners Into Comparable Cards

Thirty ideas arrive as thirty sentences of different shapes. "Use AI for fraud" and "summarise call notes" cannot be compared until each becomes the same object. The card is that object. A use case that cannot fill it is not ready to be scored, which is itself a finding.

| CARD FIELD | WHAT IT FORCES INTO THE OPEN |
|---|---|
| User and workflow step | Who does what differently on Monday; "the business" is not a user |
| Outcome metric and today's baseline | The number that must move, and its value today; no baseline means no measurable outcome |
| Volume and frequency | How many times a year the step happens; value scales with this, enthusiasm does not |
| Decision type | Inform, recommend, draft for approval, or act; each step up raises the risk tier |
| Data sources, owner and access status | Whether the data exists, who can grant it, and whether anyone has asked |
| Integration points | Which systems it reads and writes; writes cost more than reads |
| Evaluation plan in one line | How correctness is judged, and by whom; "users will tell us" is not a plan |
| Risk and regulatory notes | Customer impact of a wrong answer, and the rule that applies |
| Platform dependencies | Ingestion, retrieval, gateway, eval harness; what it shares with other cards |
| Business owner and SME | The person who signs the outcome, and the expert who labels the test set |
| Kill criteria | The result that would stop it, written before the build |

The card template is *(own construction)*. Its fields are the source's ten criteria and six properties, plus the delivery framework's intake rules. Filling thirty cards is a week of interviews, not a month. The delivery framework's rule applies here too: a stage is not done because time passed, it is done because a checkable thing is true.

## 4. Apply Gates Before Scoring Anything

A weighted sum lets a high score on one dimension buy back a fatal score on another. So some properties are gates, checked first, and an item that fails one never reaches the scoring table. This is the same move as the delivery framework's intake refusal. *"A two-week clock against an unmeasurable goal is worse than no clock"*, and a score against an unmeasurable goal is worse than no score.

| GATE | FAILS WHEN | WHAT HAPPENS TO THE ITEM |
|---|---|---|
| Measurable outcome | No metric, or no baseline anyone can produce | Back to the sponsor to define one; not scored |
| Named owner and SME | Nobody will sign the outcome or label a test set | Not scored; three of the delivery framework's six gates need an SME |
| Permissible decision | The model would take an adverse action on a customer with no human review | Reshaped into decision support, or rejected |
| Right tool | A deterministic rule, an existing statistical model or a purchase would do it better | Routed to rules, the existing model team, or procurement |

The gates and their wording are *(own construction)*, built from Handbook Module 10's intake refusal and its "no SME is a contractual prerequisite" rule. In my experience, the fourth gate is the one candidates forget. The cost cram sheet lists "low-value workflows" as a cause of runaway bills. Not every item on an AI list needs a language model.

## 5. Score Seven Dimensions With Stated Weights

The source's ten criteria collapse into seven scored dimensions without losing any. Adoption likelihood becomes a multiplier on value, because unused value is not value. Integration complexity folds into feasibility. User pain is evidence for value, not a separate score. Each dimension is scored 1 to 5, where 5 is always the good end, so risk is inverted *(own construction)*.

| DIMENSION | WEIGHT | WHAT A 5 LOOKS LIKE | WHAT A 1 LOOKS LIKE |
|---|---|---|---|
| Value, adoption-adjusted (V) | 25% | Over $3M a year, with users who asked for it | Under $100k a year, or nobody's workflow changes |
| Feasibility and integration (F) | 15% | Read-only, one system, a proven pattern | Writes into several core systems, novel technique |
| Data readiness (D) | 15% | Data exists, is accessible and is labelled | Data is missing, locked or unlabelled |
| Evaluability (E) | 10% | Ground truth exists, and correctness is cheap to check | No agreed answer; only experts can judge |
| Risk, inverted (R) | 15% | A wrong answer is caught by a human before it matters | A wrong answer reaches a customer or regulator |
| Time to value (T) | 10% | Measurable result inside one quarter | Over a year before anyone sees an effect |
| Platform reuse (P) | 10% | Builds a component four other cards need | A dead end that shares nothing |

The weights are a stated opinion, not a truth. Say them aloud so the interviewer can argue with them. Value gets the largest share because the sponsor funds outcomes. Data and risk tie for second because, in my judgement, they are the two dimensions that most often stop a project that scored well. Evaluability earns its own line because the decomposition prep page names it as a winning habit: tie every design choice back to how it would be evaluated.

## 6. Estimate Value From Volume, Not From Enthusiasm

Executive value estimates are usually a revenue number with no mechanism behind it. Rebuild each one from four factors: how often the step happens, how much it saves each time, what that time or loss is worth, and what share of users will actually change behaviour. The formula is *(own construction)*.

> Annual value ≈ volume × saving per occurrence × unit cost × adoption rate

Here is one worked estimate, with every input an assumption. Contact-centre wrap-up notes (#7 on the insurer's list): 1.2M calls a year, 3 minutes of wrap-up saved per call, $0.75 per agent-minute fully loaded, and 70% adoption. That comes to about $1.9M a year. The sponsor's slide said "$5M in productivity". The gap is the adoption factor and the difference between minutes saved and minutes that turn into lower cost.

Three honesty rules keep this from becoming theatre. Separate hard savings, such as fewer contractor hours, from soft savings, such as minutes that go back into the same shift. Discount by adoption, using the pilot's measured rate once it exists. Subtract the run cost, because the cost cram sheet's executive question is "does the value justify the spend?", not "is there value?". Convert the result into the 1-to-5 band from section 5, and keep the dollar figure on the card, so the band can be challenged.

## 7. Stress-Test the Weighted Sum Where It Breaks

A single ranked column looks rigorous and hides five known failures. Name them before the interviewer does *(own construction)*.

**Compensation.** A 5 on value can buy back a 1 on risk. The gates in section 4 handle the fatal cases. A floor handles the rest: no item enters "do now" with any dimension below 3.

**Dependencies.** Platform components score badly on value by themselves, because nobody uses an ingestion service directly. Yet the top items cannot ship without them. Ranking enablers alongside use cases tends to starve them, so they get their own bucket and are funded with the use cases that need them.

**Double counting.** Feasibility, data readiness and time to value are correlated. An item that is hard to build is usually also slow. Summing all three quietly triples the weight of difficulty. Keep them, but check whether the ranking changes when one is dropped.

**False precision.** A 3.85 and a 3.75 are the same number given how the inputs were produced. Rerun the ranking under two or three plausible weightings. Treat only items that stay near the top under all of them as decided.

**Portfolio balance.** The top five by score are often five variants of the same pattern, such as five summarisation tools. That is efficient but teaches the organisation nothing new, and it concentrates risk in one platform component. Keep a deliberate slot for one strategic item whose job is learning.
