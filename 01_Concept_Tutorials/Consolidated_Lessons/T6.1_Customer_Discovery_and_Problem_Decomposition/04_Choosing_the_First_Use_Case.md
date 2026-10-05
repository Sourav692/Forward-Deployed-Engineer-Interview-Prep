# Choosing the First Use Case

*The most valuable use case is often the riskiest, and the first build has to earn trust without giving up the value that justified the project.*

◷ 5 min

The first use case is not the most impressive demo on the list. It is the one with a measurable outcome, available data and a risk the customer can live with, chosen after the metrics in [Success Metrics and Evaluation Data](03_Success_Metrics_and_Evaluation_Data.md) are clear.

**Objectives:**

- rank candidate use cases on value, feasibility and risk rather than on demo appeal;
- narrow a risky, high-value use case instead of rejecting it;
- climb an autonomy ladder from read-only help to limited action.

---

## Rank Use Cases on More Than Value

An executive hands over 30 possible AI use cases and asks which to build first. The question bank's answer is a prioritisation matrix with ten columns: business value, user pain, feasibility, data availability, integration complexity, risk, time to value, adoption likelihood, reusability and evaluation difficulty.

Value is one column of ten. A use case with high value but no data, no integration path or no way to evaluate it will stall. So the winner needs six things together: a measurable outcome, a realistic path to adoption, manageable risk, available data, a practical integration path and a credible evaluation strategy. The bank is explicit about the trap. Avoid selecting the most impressive demo.

## Narrow the Risky Use Case Instead of Dropping It

The common follow-up is "the highest-value use case is also the riskiest; what do you recommend?" Dropping it gives up the value. Building it whole risks the customer. The middle path shrinks the exposure while keeping the use case.

The bank lists the levers. Narrow the initial scope. Add human approval. Start with decision support rather than automation. Limit the user population. Run in shadow mode. Define explicit go/no-go gates. Expand only after measured evidence. Each lever reduces the cost of a mistake without changing what the system is for.

The same levers answer the regulated-industry version: "the business wants to skip the governance review for the MVP." Speed and safety are both kept by narrowing the scope, using synthetic or masked data where possible, starting read-only or assistive, defining explicit approval gates, and getting security and legal review before any production exposure.

> **Warning: "we'll add governance after the MVP" is how sensitive data reaches production unreviewed.** Narrow the MVP until the review is cheap enough to do now. Never skip the review to protect the date.

## Climb the Autonomy Ladder One Rung at a Time

Autonomy is earned, not configured. The incident-response case asks whether an agent should restart production services automatically. The bank's safe progression has four rungs:

1. read-only investigation;
2. suggested remediation;
3. human-approved execution;
4. limited autonomous action, only for low-risk, reversible operations.

The same shape appears in the claims case, which starts with extraction, triage, summarisation and missing-information detection before any automated adjudication. It also appears in the support case, where the trade-offs include assistive copilot versus autonomous agent, read-only versus write-capable tools, and automation rate versus customer-impact risk. When a customer asks for 80% autonomous resolution in six months, these rungs are the basis for challenging the target.

## Check Whether the Data Can Support the Outcome

Sometimes the right first step is not a use case at all. When the customer's data is incomplete, inconsistent and poorly documented, the bank's strong answer is: do not begin with model selection; first find out whether the available data can support a measurable workflow improvement.

That investigation has its own checklist. Profile data quality. Find owners. Measure missingness and duplicates. Look for schema inconsistencies, poor labels and stale records. Then consider data contracts, human-in-the-loop correction and a narrower first use case. Keep open the possibility that AI is not the right solution.

## Worked Example: Choosing Between Three Candidates

Suppose three of the executive's 30 ideas survive a first pass: an autonomous refund agent, an account-brief assistant for sales, and an incident-diagnosis assistant for engineers.

Score them on the matrix. The refund agent has high value but high risk, and it writes money. The account-brief assistant reads CRM, email, usage and support data, has clear metrics such as preparation time and brief accuracy, and its errors are caught by a seller before a meeting. The incident assistant has strong value but needs logs, traces and topology joined across many systems.

The account-brief assistant goes first: measurable outcome, available data, manageable risk, a reader in the loop. The refund agent is not dropped. It is narrowed to suggesting refunds for human approval, on one product line, in shadow mode, with a go/no-go gate before it acts. The matrix chose the order, and the narrowing levers kept the high-value idea alive.

---

## Key Takeaways

- Rank use cases on a ten-column matrix; value is one column, and the most impressive demo is a trap.
- Narrow a risky, high-value use case with approval, decision support, limited users, shadow mode and gates.
- Earn autonomy rung by rung, from read-only help to limited reversible action.
- With poor data, test whether the data can support a measurable improvement before choosing any model.

## Check Yourself

1. **What six properties should the first use case have?**
   A measurable outcome, a realistic adoption path, manageable risk, available data, a practical integration path and a credible evaluation strategy.

2. **The business wants to skip the governance review for the MVP. What do you propose?**
   Narrow the scope, use synthetic or masked data, start read-only or assistive, define approval gates, and get security and legal review before production exposure.

3. **Should an operations agent restart production services on its own?**
   Not at first. Move from read-only investigation to suggested remediation to human-approved execution. Allow autonomy only for low-risk, reversible operations, and only after evidence.

## References

**Sources:** `03_Practice_Worksheets_and_Keys/Problem_Decomposition_Bank/FDE_Problem_Decomposition_Question_Bank.md`: cases 2 "Customer-Support Agent" (trade-offs and the 80% follow-up), 3 "Claims-Processing Assistant", 4 "AI-Powered Sales or Account-Research Assistant", 12 "Deploying AI in a Highly Regulated Industry", 14 "AI-Powered Operations or Incident-Response Assistant", 16 "Prioritize AI Use Cases for a Large Enterprise" and 18 "Build an AI System When the Customer's Data Is Poor".
