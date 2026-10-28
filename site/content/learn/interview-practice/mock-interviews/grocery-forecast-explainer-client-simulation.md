# Grocery Forecast Explainer Client Simulation

This is a 45-minute client simulation built around a data and analytics request: the interviewer plays the customer and answers only what is asked. The request sounds like "chat with our data", but the hidden constraints are about who owns the numbers, how late the data arrives and what happens when an explanation drives an order. With a partner, hand them this page and have them reveal a constraint only when your question earns it; alone, read the opening brief, write your questions down, then open one constraint at a time, and only for a topic you asked about.

## The Customer

The customer is the head of supply chain planning at a regional grocery chain. Her team of planners sets order quantities for the stores, category by category.

> "Every Monday my planners lose the morning in spreadsheets working out why the forecast missed. I want them to ask 'why did yoghurt drop in the north last week?' and get an answer. And then I want it to fix the orders."

She cares about fresh-food waste, empty shelves, her planners' time, and her team's credibility with finance.

## The Opening Brief

"So, we have a forecasting system, and it's pretty good, but when it misses, nobody knows why. Every Monday my planners pull sales, promotions, weather and stock levels into spreadsheets and argue about it. By the time they've worked it out, the week's orders have gone. I want an AI that explains the misses and then corrects the orders. Can you do that?"

## Hidden Constraints

<details>
<summary>Reveal when the candidate asks about how the forecast is produced</summary>

"The forecast comes from a vendor's planning platform. We get a number and a confidence band for each product in each store. We can't see how the model works, and the contract lets us export forecasts and a fixed set of driver fields, nothing more."

**Why it matters:** Nothing can explain why the vendor's model predicted what it did. The assistant can only compare forecast with actual sales and the drivers the team can see. "Sales fell in the week the promotion ended early" is evidence; "the model under-weighted the weather" is invention.

</details>

<details>
<summary>Reveal when the candidate asks about the promotions data</summary>

"Promotions are planned by the commercial team in a shared spreadsheet. It's often updated after the promotion has already started, and store-level changes are agreed by email."

**Why it matters:** The most important driver is the least reliable. Every explanation must show when the promotions data last changed and flag changes made after the forecast ran. Fixing how promotions are recorded may be worth more than any model.

</details>

<details>
<summary>Reveal when the candidate asks about how orders are placed or changed</summary>

"Orders go to suppliers automatically from the replenishment system at [daily order cut-off time]. Planners can override quantities before then. If an override is wrong on a fresh line, we either throw the stock away or the shelf is empty."

**Why it matters:** "Fix the orders" means writing overrides that have a direct, unrecoverable cost on fresh lines. The first slice should explain and, at most, suggest; the planner enters any override. Acceptance of suggestions and their outcomes become the evidence for any later automation.

</details>

<details>
<summary>Reveal when the candidate asks about the planners and their weekly routine</summary>

"I have [number of planners] planners, each owning a set of categories. The senior ones trust their own judgement more than any tool. They work through an exceptions list every Monday before [weekly planning review]."

**Why it matters:** The product should live inside the Monday exceptions list, not in a new chat window. Senior planners will trust only answers whose numbers they can check, so every explanation needs its figures and sources, and one senior planner should be a design partner.

</details>

<details>
<summary>Reveal when the candidate asks about how forecast accuracy is measured</summary>

"Finance and supply chain measure forecast accuracy differently. We use [supply chain accuracy measure]; finance uses another one. Last quarter both numbers ended up side by side in the board pack and nobody could explain the gap."

**Why it matters:** An assistant that answers "how accurate were we?" with an unstated definition will be discredited at the first finance review. Agree one governed definition, or label both, before the pilot, and have every answer state which definition it used.

</details>

<details>
<summary>Reveal when the candidate asks about permissions or sensitive data</summary>

"Supplier funding for promotions and our product margins are confidential. Category managers and the commercial team can see them. Planners can't."

**Why it matters:** An explanation must not draw on fields the reader cannot see. Even a sentence like "this is a high-margin line" leaks restricted data. Permissions have to be checked when the data is queried, for the person asking.

</details>

<details>
<summary>Reveal when the candidate asks about data volume or timing</summary>

"We have [number of stores] stores and [number of product lines] product lines. Sales data lands overnight, so the earliest anyone sees yesterday's sales is [daily data availability time]."

**Why it matters:** Nothing here needs real-time answers. The heavy work, finding the biggest misses and lining up their drivers, can run overnight in a batch, which is cheaper and faster for planners than answering everything live. Interactive follow-up questions then work on that prepared result.

</details>

## How the Round Runs

| Time | Phase | The candidate | The customer |
|---|---|---|---|
| 0–15 min | Discovery | Asks about the Monday routine, the forecast's origin, data trust, order mechanics, accuracy definitions and access | Answers only the question asked; talks up the forecasting system's quality |
| 15–20 min | Framing back | Plays back the black-box forecast, unreliable promotions data, automatic ordering and the definition split | Confirms, and adds that she still wants orders fixed |
| 20–35 min | Shaping a first slice | Proposes overnight explanations for one category on the exceptions list, read-only, with suggested overrides entered by planners | Pushes: "If the AI knows why, why can't it just change the order?" |
| 35–45 min | Risks and next steps | Names the top risks with controls, how the pilot will be judged and the next actions with owners | Asks what she can show at the next planning review |

## What a Strong Candidate Says

**Discovery**

- "Walk me through last Monday. Which misses did your planners look at, and what did they do about them?"
- "Where does the forecast come from, and how much of it can we see?"
- "Which data do planners trust, and which do they argue about?"
- "When a planner changes an order and gets it wrong, what does that cost?"
- "How do you and finance each measure accuracy?"

**Framing back**

- "Let me check I've got this. The forecast comes from your vendor and we can't see inside it. Promotions data is late and partly in email. Orders go out automatically every day, and a bad override on a fresh line means waste or an empty shelf. And finance measures accuracy differently from you. Right?"

**Shaping a first slice**

- "I'd start with one fresh category in one region, on your Monday exceptions list."
- "Overnight, we line up each big miss against sales, promotions, price changes, stock-outs and weather, and write a short explanation with the numbers and the date each source last changed."
- "It will say 'sales fell in the week the promotion ended early', not 'the promotion caused it'. Your planners make the call."
- "It doesn't change orders. If it suggests an override, the planner enters it, and we record what happened next."

**Risks and next steps**

- "The biggest risk is a confident explanation built on stale promotions data. So every answer shows when that data last changed."
- "Before the pilot, we agree an accuracy definition with finance, and test the explanations on [number of past weeks] weeks your planners have already worked through."
- "Next steps: a data export from the vendor, access to the promotions sheet, a senior planner as design partner, and a meeting with finance about the definition."

## Score the Round

| Dimension | Strong evidence in this round |
|---|---|
| Discovery questions | Asks how the forecast is made, which data planners trust, how orders are placed, how accuracy is defined and who may see margins, before talking about chat or models |
| Handling constraints | Turns each constraint into a choice: observable drivers only, data freshness on every answer, planners enter overrides, one stated accuracy definition, permission checks at query time, overnight batch |
| Framing back to the customer | Plays back the black-box forecast, unreliable promotions data and order risk in planning language, using the customer's figures, and asks what was missed |
| Scoping | One fresh category, one region, the Monday exceptions list, read-only; says plainly that automatic order changes are not in the first release and what evidence would justify them |
| Next steps | Vendor export, promotions sheet access, senior planner as design partner, finance meeting on the definition, a backtest on past weeks |
| Communication | Uses careful causal language ("in the same week as", not "because of") and explains to a planning lead, not a data scientist |

Score each dimension from 1 to 5 with the scorer below; a 4 or 5 needs a quoted line of evidence, and a pass is no dimension below 2 and a mean of 3 or more.

## Common Mistakes

- Promising to explain the vendor model's reasoning when only its outputs are visible.
- Presenting correlation as cause, so a planner acts on "the weather caused it" when the promotion data was late.
- Automating order overrides on fresh lines in the first release.
- Ignoring the accuracy definition split, so the first finance review discredits the tool.
- Letting margin or supplier funding data shape explanations shown to planners.
- Building live chat over raw tables when data lands overnight and planners work weekly.
