# Three Roles, Three Questions

*The same knowledge serves three jobs, but each job asks a different question of it, so preparing for the wrong one means answering the wrong question well.*

A senior FDE is not "a better AI engineer"; the three roles are judged on different questions. Learn the unit of work and the question for each role here, then read [The Three Lenses of FDE Work](/learn/orientation/the-fde-role/the-three-lenses-of-fde-work) for how the FDE role splits its time.

**Objectives:**

- name the unit of work and the deciding question for each of the three roles;
- explain why each outer role contains the inner one;
- ask the three roles' questions about one system.

---

## Judge the AI Engineer on Proof

The AI engineer takes a capability the business wants and turns it into a system with measurable quality. Answering questions over documents, triaging tickets and drafting reports are typical asks. The unit of work is a **pipeline**: ingestion, retrieval, generation and evaluation. The deciding question is *does it work, and is there proof?*

Proof means numbers, not "it answered my question". Recall@k on a golden set, groundedness on every run, and a leak rate of exactly zero are the source's examples. The role also needs the failure modes of each component. Dense retrieval misses exact identifiers. Fixed-size chunking destroys a contract's meaning. A post-filter after top-k retrieval is both a quality failure and a security failure.

The last test is knowing what a framework does and does not do. An AI engineer should be able to write the ReAct loop as a `while` loop before writing it in LangGraph.

## Judge the Agentic Systems Designer on Containment

The agentic systems designer builds systems that act: refund a customer, close a ticket, send an email, run a workflow. The unit of work is a **control boundary**, the line between what the model may decide and what the system will permit. The deciding question is *is it safe when it is wrong?*

The model chooses which value goes in an argument; it never improvises the control flow. Containment then answers specific incidents. Step budgets and spend caps stop the runaway loop. Idempotency keys stop the double refund. Confirmation gates, staged rollout and kill switches stop the workflow that skipped a human check.

The designer also knows when not to add agents. Default to one agent with good tools. Add a second only when the handoff has a defined contract and a story for isolating failure.

## Judge the FDE on the Outcome

The FDE sits with the customer. They turn a scoping document into a running system in weeks, in the customer's environment, with the customer's data and their security team's sign-off. The unit of work is an **engagement**. The deciding question is *did the customer get the outcome, and could the team have done it without the FDE?*

Two signals matter most. The FDE asks before architecting. And the FDE offers to own the definition of done, "how will we know this works?", which the source calls the strongest FDE signal in a room.

## Nest the Roles Inside Each Other

The roles are not tiers, but they build on each other. Each outer role contains the inner one.

```
FDE: engagement           scoping → gates → delivery → narrative
 └ Agentic designer: control   what may the model decide? what will the system permit?
    └ AI engineer: pipeline    ingest → retrieve → generate → evaluate
```

A designer who cannot build the pipeline puts guardrails around a system they do not understand. An FDE who cannot reason about control boundaries cannot tell a security team why the design is safe. That is why the material is ordered inner to outer.

> **Warning: "consultant who codes" undersells the role.** It drops the control boundary and the pipeline underneath. An FDE answer that cannot go one level down into either loses credibility with the team and the customer's security reviewers.

## Worked Example: One Question, Three Roles

A support agent asks the assistant why a customer lost data in March, and whether the customer gets service credits. Each role asks a different, correct question.

| Role | The question |
|---|---|
| AI engineer | Did retrieval find the ticket, the post-mortem and the contract? Did the answer cite them, and is it grounded? |
| Agentic systems designer | The Tier-1 agent may not read the post-mortem or the contract. Was that enforced before the model saw anything, or did we ask it politely not to mention them? If the assistant can issue the credit, who approved that? |
| FDE | Which of the customer's four personas asked, what should each see, and did compliance sign off on that matrix before the first access rule? How do we prove afterwards that nobody saw what they should not have? |

None of the three questions replaces the others. Together they describe one system seen from the pipeline, the boundary and the engagement.

---

## Key Takeaways

- The AI engineer's unit is a pipeline, judged on demonstrable quality and known failure modes.
- The agentic systems designer's unit is a control boundary, judged on containment when the model is wrong.
- The FDE's unit is an engagement, judged on the customer outcome and on owning the definition of done.
- Each outer role contains the inner one, so the material is ordered inner to outer.
- One scenario yields three correct questions, one per role.

## Check Yourself

<details>
<summary>1. What is the unit of work for each role?</summary>

AI engineer: a pipeline. Agentic systems designer: a control boundary. FDE: an engagement.

</details>

<details>
<summary>2. Why is the material ordered inner to outer rather than teaching FDE skills first?</summary>

Each outer role relies on the inner one. A designer must understand the pipeline it guards, and an FDE must defend the control boundaries to a security team.

</details>

<details>
<summary>3. Name two containment mechanisms and the incident each answers.</summary>

For example: idempotency keys answer the double refund; step budgets answer the runaway loop; confirmation gates answer the workflow that skipped a human check.

</details>

