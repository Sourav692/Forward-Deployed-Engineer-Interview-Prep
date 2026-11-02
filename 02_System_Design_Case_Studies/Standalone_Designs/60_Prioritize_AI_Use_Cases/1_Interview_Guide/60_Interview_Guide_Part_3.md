# Prioritise AI Use Cases for a Large Enterprise, part 3

## 14. Deliver It in Forty-Five Minutes

The source's reusable opening fits almost unchanged. Clarify the business outcome, the user, the current workflow, the constraints and how success is measured, and state assumptions where information is missing.

| MINUTES | WHAT TO DO | WHAT TO SAY OR DRAW |
|---|---|---|
| 0–5 | Clarify | Section 2's questions; state the insurer assumptions if unanswered |
| 5–10 | Frame | "Not the most impressive demo"; the card, the gates, then scores |
| 10–18 | Method | Gates, seven dimensions and weights, the value formula |
| 18–28 | Worked example | A slice of the table: the five Now items, one No, one gated reshape, one high-value Later |
| 28–34 | Where the sum breaks | Floor, enablers, sensitivity, balance |
| 34–40 | Plan | Platform sketch, waves, kill criteria |
| 40–45 | Follow-up | The pet-project path; close with the metrics that will prove the choice |

**The two-minute spoken answer** *(own construction)*:

> *"I wouldn't pick from the list directly. The most impressive demo is usually the one with the most hidden production cost. First, I'd turn each of the thirty ideas into the same card: user, workflow step, outcome metric with a baseline, volume, data and owner, how we'd evaluate it, risk, and kill criteria. Anything that can't fill the card isn't ready. Second, gates before scores: no measurable outcome, no owner, an unreviewed adverse decision on a customer, or a problem that rules or a purchase solve better. Those leave the list. Third, score what's left on value adjusted for adoption, feasibility, data readiness, evaluability, risk, time to value and platform reuse, with weights I'd state and let you argue with. I'd estimate value from volume times saving times unit cost times adoption, not from the slide. Fourth, I'd distrust the sum: floor any dimension below three, fund shared enablers separately because they usually lose on value alone, and rerun the ranking under different weights to see what's actually decided. For an insurer, that gives a first wave like call wrap-up summaries and claims intake summaries: high volume, low risk, clean eval, and they build the gateway, eval harness and ingestion that make the next ten items cheap. Every item gets kill criteria before the pilot, and the register is re-scored quarterly with real data."*

**Likely follow-ups** *(own construction, except the first, which comes from the prompt)*:

| FOLLOW-UP | ANSWER IN ONE BREATH |
|---|---|
| "The highest-value use case is also the riskiest. What do you recommend?" | Make it the destination, not the first stop: decision support, human approval, narrow segment, shadow mode, explicit go/no-go gates, expansion on measured evidence (section 12) |
| "The CEO wants the chatbot first." | Put it through the same card and gates in front of the sponsor. If it fails on risk, show the route to it; if it passes, it ships with kill criteria like anything else |
| "How do you know the value estimates are right?" | They aren't; they are ranges. Rank on bands, keep the dollar figure visible, and replace estimates with pilot data at the quarterly re-score |
| "Two items tie. How do you break it?" | Platform reuse, then evaluability. The one that makes later items cheaper, or can be proven faster, goes first |
| "What if a business unit builds its own anyway?" | Offer the gateway and eval harness as the cheaper path. Shadow AI is a symptom of a slow front door, not a policy problem |
| "What if leadership changes the priorities mid-programme?" | The register absorbs it. Re-score with new weights in public, and show what moves and what it costs to switch |
| "How do you prioritise with no data at all?" | Score data readiness honestly, fund discovery for the top value items, and let wave 0 produce the data. [The Build When Customer Data Is Poor case](../../62_Build_When_Customer_Data_Is_Poor/) covers the playbook |

## 15. Answer the Cost Pivot in Ten Minutes

The pivot is "how much will the programme cost, and how do you stop the cost per use case staying flat?" There is no playbook drill for this case, so the card is a self-drill *(own construction)*.

| | |
|---|---|
| Dominant driver | Engineering and SME time per use case, then pilots that never close; I'd expect model tokens to be a minor line at this stage |
| Cheapest lever first | Shared enablers funded once; a cap on pilots in flight; kill criteria that release people on schedule |
| Metric that proves it | Cost per use case to production, falling wave on wave; accelerator reuse rate; cost per successful outcome per live use case |
| Do not | Fund thirty pilots in parallel, or let every team build its own ingestion, prompts and eval |
| 60-second line | The expensive thing in an AI portfolio is people rebuilding the same plumbing. Build it once under the first high-volume use case, cap what is in flight, and kill on schedule. Then the tenth use case costs a fraction of the first, and that ratio is the number to report. |

The four verbs from the cost playbook still apply, one level up. Measure cost per use case and per successful outcome. Route commodity capabilities to purchase and deterministic problems to rules. Bound work in progress with a pilot cap. Cache safely by reusing platform components rather than rebuilding them. The cost cram sheet's customer-complaint drill ends the same way: *"show cost by workflow and propose concrete reductions that preserve value."*

---

## Level calibration

On the use-case portfolio, the levels split on whether the candidate ranks thirty ideas once or builds a register the organisation can keep re-ranking.

| Level | Sounds like | Missing |
|---|---|---|
| Senior | "I won't pick the most impressive demo. Each idea becomes a card, the four gates run first, and the rest are scored on seven dimensions with stated weights. Value is volume × saving × unit cost × adoption. #7 call wrap-up goes first: high volume, low risk, cheap to evaluate." | Where the weighted sum breaks: compensation, starved enablers, false precision and a top five that is all summarisation. |
| Staff | "I'd distrust the sum. Every dimension needs at least 3 to make Now, the gateway, eval harness and ingestion get their own enabler bucket, and a rerun under value-, risk- and speed-heavy weightings shows #7, #1 and #6 are decided. Each card gets kill criteria and named signers, and pilots in flight are capped." | How the register survives a new sponsor or shifting priorities, and the route that turns the executive's pet project into a destination. |
| Principal | "A portfolio office re-scores the register quarterly with pilot data and reports cost per use case to production falling wave on wave. Autonomous settlement (#29) becomes the two-year destination, reached through decision support, shadow mode and go/no-go gates. The gateway is the cheaper front door, so business units don't build shadow AI." | Whether the value bands hold. That needs the insurer's real volumes, baselines and adoption rates from wave 1. |

## Key Takeaways

- Refuse to pick the most impressive demo; lead with a method, because the demo hides production cost.
- Ask which decision the ranking feeds before building it: one pilot and a funded portfolio need different answers.
- Turn every idea into the same card; an idea that cannot fill the card is not ready to be scored.
- Apply gates for measurable outcome, owner, permissible decision and right tool before any score, so a high value cannot buy back a fatal flaw.
- Score seven dimensions with weights stated aloud, and treat evaluability as a dimension in its own right.
- Estimate value as volume × saving × unit cost × adoption, and keep the dollar figure visible next to the band.
- Stress-test the sum for compensation, dependencies, double counting, false precision and monoculture; only items that survive reweighting are decided.
- In the insurer example, #7, #1 and #6 stay in the top five under every weighting, while the highest-value items all land in Later.
- Fund the shared platform with wave 1, because enablers usually lose when ranked on value alone.
- Sequence waves by what each one proves, starting with a high-volume, low-risk use case that builds the platform.
- Write kill criteria on the card before the pilot, and re-score the register quarterly with real data.
- Turn the executive's pet project into the roadmap's destination, reached through decision support, shadow mode and measured gates.
- Watch for demo-driven picks, too many pilots, starved enablers, score theatre and zombie pilots.
- Deliver the answer as clarify, frame, method, example, stress test, plan and follow-up inside forty-five minutes.
- Report cost per use case to production falling wave on wave; that ratio is the portfolio's real cost metric.

## Check Yourself

1. Why is "the most impressive demo" a trap, according to the cost cram sheet?
   *It hides traffic shape, tail latency, usage expansion and governance cost, so its production cost is the least visible.*
2. What two answers to "what does prioritise decide?" change the method?
   *Picking one pilot optimises for learning and credibility; funding a portfolio also optimises for reuse and balance.*
3. Name the four gates, and say why they come before scoring.
   *Measurable outcome, named owner and SME, permissible decision, right tool. Gates stop a high score on one dimension from buying back a fatal flaw.*
4. Why is adoption a multiplier on value rather than its own score?
   *Unused value is not value; a use case nobody adopts delivers nothing, however large its theoretical saving.*
5. Estimate the value of a use case with 1.2M calls a year, 3 minutes saved, $0.75 a minute and 70% adoption.
   *About $1.9M a year, before run cost.*
6. Why do platform enablers need their own bucket?
   *Nobody uses them directly, so they score low on value, yet the top items cannot ship without them.*
7. How can you tell a decided ranking from a fragile one?
   *Rerun it under two or three plausible weightings; only items that stay near the top under all of them are decided.*
8. Why did the HR policy assistant tie the Now items but land in Next?
   *Its value was 2, below the floor of 3 required for Now.*
9. Why is auto-sent denial letters a "No", and what is its reshaped version?
   *It is an unreviewed adverse decision on a customer; the reshape is a draft letter for the adjuster to approve.*
10. What should wave 1 prove, and why is it not the highest-value item?
    *One measurable win that builds the platform; a high-risk first item that fails costs the programme its credibility.*
11. When are kill criteria written, and why then?
    *On the card, before the build, so the decision is made before anyone is invested in the pilot.*
12. Give the four-step route from pet project to autonomous settlement.
    *Summaries and extraction for adjusters; a shadow recommendation; one-click approval under a cap in one region; straight-through for the narrowest segment with sampled audit.*
13. What is the portfolio's dominant cost driver, and what metric shows it is under control?
    *People time rebuilding plumbing and pilots that never close; cost per use case to production falling wave on wave.*

## References

All paths are relative to the repository root.

| Section | Source |
|---|---|
| 1, 12, 14 | Problem-decomposition interview prompts: this case's prompt and its follow-up, verbatim; the reusable answer template; the biggest mistakes to avoid |
| 5 | Problem-decomposition interview prompts: section 4, the six-step framework and "tie every design choice back to how you'd evaluate it" |
| 1, 6, 12, 15 | `01_Concept_Tutorials/Cost_and_Latency_Optimization/CRAM_SHEET_FULL_PLAYBOOK.md`: why demos die in production, the executive-concern table (ROI), the customer narrative |
| 4, 15 | `01_Concept_Tutorials/Cost_and_Latency_Optimization/CRAM_SHEET_S15_S16.md`: drill 7, "Customer complains the AI is too expensive" |
| 3, 4, 11 | Delivery operating model notes on gates, risks and metrics: the six gates, deny rules, intake refusal, SME prerequisite, week-4 retention, accelerator reuse rate |
| 9, 10 | `05_FDE_Delivery_and_Scoping/Delivery_Framework/docs/01-theory.md`: the governing question, "pulled from a library, or built from scratch" |
| 10 | Delivery operating model notes on cross-team collaboration: two-phase delivery and narrowing the first build |
| 2, 3 | Delivery operating model notes on the six stages of end-to-end AI delivery: anchor on business value and quantified impact |

Related packs, for cross-reference rather than repetition: [G12 Scoping to Deployed Agent](../../../Scenario_Packs_G01_G20/G12_Scoping_To_Deployed_Agent/4_Full_Design/G12_Full_Design.md) for gate mechanics; [G13 Evaluation and Release Gating](../../../Scenario_Packs_G01_G20/G13_Evaluation_And_Release_Gating/4_Full_Design/G13_Full_Design.md) for the eval harness; [Scale a Prototype to Production](../../61_Scale_Prototype_To_Production/) for what happens after a Now item's pilot succeeds; [Build When Customer Data Is Poor](../../62_Build_When_Customer_Data_Is_Poor/) for items blocked on data readiness; [Decomposition Classics](../../Decomposition_Classics_67_68_69/) for decomposing a single chosen use case; [Production LLM Gateway](../../100_Production_LLM_Gateway/) for the gateway enabler.

Sections 2, 3 (the card), 4 (the gates table), 5 to 13, 14 (script, spoken answer and follow-ups apart from the first) and 15 are own construction. They were built for this page from the sources' arguments and are not source material. The repo has no worked portfolio-prioritisation case.

### Fact-check sources (checked 27 Sep 2026)

- [NAIC Model Bulletin: Use of Artificial Intelligence Systems by Insurers (Dec 2023)](https://content.naic.org/sites/default/files/inline-files/2023-12-4%20Model%20Bulletin_Adopted_0.pdf): insurers need a written AI programme with governance and controls that reflect how far humans are involved in decisions
- [GDPR Article 22](https://gdpr-info.eu/art-22-gdpr/): the right not to be subject to a solely automated decision, and the right to human intervention and to contest it
- [EU AI Act, Annex III](https://artificialintelligenceact.eu/annex/3/): AI for risk assessment and pricing in life and health insurance is high-risk
- [NAIC chart: rate filing methods for property and casualty insurance](https://content.naic.org/sites/default/files/model-law-chart-pa-10-rate-filing-methods-for-property-casualty-insurance-workers-comp-title.pdf): states use prior approval, file-and-use, use-and-file or no-file regimes, so rate review varies by state
