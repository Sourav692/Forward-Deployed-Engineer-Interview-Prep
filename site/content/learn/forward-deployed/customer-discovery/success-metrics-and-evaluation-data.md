# Success Metrics and Evaluation Data

*A model benchmark is easy to quote, but the customer judges the whole workflow, so success has to be defined on the application before anything is built.*

◷ 5 min

Accuracy is not a success metric until someone has said accurate at what, on which data, compared with whom. Define the metrics and the evaluation set during discovery, straight after [The Discovery Conversation](/learn/forward-deployed/customer-discovery/the-discovery-conversation), because they decide what the decomposition must produce.

**Objectives:**

- choose success metrics that measure a business outcome, not only model output;
- build an evaluation strategy when the customer has no way to measure quality;
- explain why an offline improvement can still feel like a regression to the customer.

---

## Measure the Application, Not the Model

The question bank puts the core distinction in one line: model quality is not the same as application quality. A model can answer well while the application fails because retrieval missed the document, a tool call broke, a business rule was ignored, or the answer arrived too slowly to be useful.

So evaluate the complete workflow. Cover retrieval, tools, business rules, user interaction, operational performance and business outcomes. A metric that stops at the model's output cannot see five of those six.

## Pick Metrics the Customer Would Recognise

A useful success metric is one the customer already cares about. The sales account-research case lists six candidates: preparation-time reduction, brief accuracy, citation coverage, seller adoption, conversion improvement and meeting-quality improvement. Only two of them, accuracy and citation coverage, are about the AI's output. The other four are about whether people used it and whether the business moved.

The bank's practice drill asks for three measurable metrics per case. A balanced three covers quality, adoption and outcome. Brief accuracy, seller adoption and preparation time saved is one such set.

## Build the Evaluation Set Before the Pilot

A customer that "has no reliable way to measure quality" needs an evaluation strategy before it needs a model. The bank's list is long, and it falls into four groups:

| What is needed | What it consists of |
|---|---|
| Data that looks like production | A representative production dataset, golden examples, ground-truth labels |
| A way to grade it | Task-specific rubrics, automated graders, human evaluation, a calibrated LLM-as-judge |
| Coverage of the risky cases | Safety and refusal tests, regression tests, slice-based analysis |
| Signal after launch | Online metrics, user feedback, statistical confidence, continuous evaluation in CI/CD |

When there is no labelled data, build it rather than skip it. Sample production traffic, have experts label it, use weak supervision, add synthetic examples carefully, measure how often graders agree, and send the difficult cases to human review.

Some outputs have no single right answer. For call summaries, the bank suggests a rubric-based human assessment, action-item precision and recall, factual consistency, coverage of required fields, CRM update accuracy, user-edit distance and downstream task completion. Each turns "is this a good summary?" into something countable.

> **Warning: an uncalibrated LLM-as-judge is a second untested model.** Measure its agreement with human graders before trusting its scores, or a regression can hide behind a judge that agrees with itself.

## Read a Regression by Segment

Evaluation also settles disputes after launch. In the bank's model-upgrade case, the customer says quality fell after switching to a newer model. The diagnostic plan is to collect before-and-after production examples and replay a fixed evaluation set. Then segment by task, language, customer and input size. Compare structured-output compliance, prompt compatibility, retrieval changes, latency and token usage. Run human evaluation, calibrate any LLM judge, roll back or pin the model version, and A/B test future upgrades.

The follow-up is harder: "the offline benchmark improved, but the customer still says quality declined." Several explanations fit. The benchmark may not represent production traffic. One customer segment may have regressed while the average rose. Retrieval may have changed. The experience may have become slower. Structured output may be less reliable. Important edge cases may have worsened. Or users may be judging task completion rather than answer quality. An average hides every one of these, which is why slice-based analysis belongs in the strategy from the start.

## Worked Example: Proving a Claims Assistant Is Safe Enough

An insurer wants to automate claims processing from documents, emails and historical claims. The bank's follow-up is "How would you prove that the system is safe enough for production?"

Start by narrowing what is being proved. The bank advises against promising full automation. Begin with extraction, triage, summarisation and missing-information detection. Then define the evidence. Evaluate against past human decisions on real claims. Report results by claim type, because a model that is safe for simple claims may not be safe for complex ones. Set human review thresholds on confidence. Keep explainability and an audit trail, because regulators will ask why a claim was routed. Roll out gradually by claim type.

"Safe enough" became a set of measured comparisons against the human baseline, per segment, with a threshold below which a person decides. Automated adjudication comes later, only after that evidence and governance exist.

---

## Key Takeaways

- Model quality is not application quality; evaluate retrieval, tools, rules, interaction, operations and outcomes.
- Choose success metrics the customer already cares about, balancing quality, adoption and business outcome.
- Build the evaluation set before the pilot, and create labels when none exist.
- Read regressions by segment, because an improved average can hide a worse slice.

## Check Yourself

1. **A team reports high answer accuracy on a benchmark. Why is that not yet a success metric?**
   It measures the model's output only. It says nothing about retrieval, tools, business rules, speed, adoption or whether the business outcome moved.

2. **The customer has no labelled data. Name three ways to build an evaluation set.**
   Sample production traffic and have experts label it; use weak supervision; add synthetic examples carefully. Measure grader agreement and send hard cases to human review.

3. **The offline benchmark improved after a model upgrade, yet users say it got worse. Give two explanations.**
   The benchmark does not represent production traffic, or one segment regressed while the average rose. Slower responses or less reliable structured output are other candidates.

