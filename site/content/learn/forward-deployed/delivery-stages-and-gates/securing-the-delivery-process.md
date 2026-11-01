# Securing the Delivery Process

*Security attention naturally goes to the system being deployed, but the process that deploys it holds live credentials and real customer data first.*

A gate can be structurally real and still prove almost nothing. The right role must sign it, yet a free-text "reviewed" cannot show what was checked, and the delivery process itself handles credentials and data that need the same protection as the product.

**Objectives:**

- explain why a role-gated sign-off can still be a rubber stamp, and how to fix it;
- identify the two windows when the delivery process holds live customer credentials;
- apply residency and tenancy decisions to the delivery process's own artefacts.

---

## Give Gate Evidence a Required Shape

The gates in [Role-Gated Stage Gates](/learn/forward-deployed/delivery-stages-and-gates/role-gated-stage-gates) stop the wrong person from signing. That is a real control. But a gate is only as strong as what counts as enough evidence, and that is a separate design question from whether the gate exists.

"Security review" can mean many things. Only one of them is what the gate should mean.

| What a thorough review might cover | Does a generic "security review passed" prove it? |
|---|---|
| Basic output validation, such as well-formed responses | No; that is a quality check, not a security check |
| Retrieval and tool-selection accuracy | No |
| Task success on real test cases | No; that belongs to the evaluation gate |
| Adversarial testing: prompt-injection attempts and permission-boundary probes | This is what the review should mean, and free text cannot prove it happened |
| Ongoing production monitoring | No; that is continuous, not a one-time gate |

If the evidence is a sentence such as "looks fine", a reviewer could sign after checking a paperwork item and never run one adversarial test against a system about to touch real customer data. The gate cannot tell a thorough review from a rubber stamp, because the evidence has no required shape.

The fix is to make the evidence a checklist, not a sentence. Adversarial testing done, permission boundaries tested and data agreements signed must all be explicitly present before the gate can pass. It is the same discipline as intake refusing to start without a measurable metric, applied to what a signature attests to.

> **Warning: a correct signer with free-text evidence is still a rubber stamp.** Role checks stop the wrong person; only structured evidence stops the right person from signing too early.

## Treat Delivery Credentials as Production Secrets

Early in a fast delivery, the team connects to a customer's real systems, such as a support tool, a CRM or a knowledge base. The delivery tooling therefore holds live credentials during the engagement. This is one layer earlier than the deployed system's credential handling, and easy to miss because attention is on the product.

The exposure is concentrated in two windows: when sources are first connected, and when the system starts running against the customer's real environment. A data-access gate proves a human attested that access is live. It does not prove the credentials were stored in a vault, scoped only to what this engagement needs, and revoked cleanly at handover. Those requirements are the same as for any system holding live customer credentials.

## Apply Residency to What the Process Creates

Per-tenant encryption and data residency are usually read as properties of the deployed system. They apply equally to the artefacts the delivery process produces. The clearest example is the golden set, built with the customer's own SMEs, which often contains real questions and real account details.

Storing that test set the same way for a regulated customer and a low-sensitivity trial is a residency gap in the delivery process itself. The tool that builds golden sets can be shared across engagements. The data it produces for each engagement must follow that customer's sensitivity tier.

## Treat Many Engagements as a Tenancy Decision

A framework that models one engagement will soon model many in parallel. The instinct is to treat that as scheduling and capacity. Underneath is the same multi-tenancy decision every customer-facing system faces, applied to the delivery process's own data.

Two questions decide it. Are two customers' engagement records, gate evidence and test sets separated only by a tag on shared records, the cheap default, or physically separated? And does a query for "all engagements" structurally exclude a competitor's data, or depend on someone remembering to filter? Framing this as the same isolation decision made elsewhere in the stack, rather than a new scaling problem, is the stronger answer.

## Worked Example: Hardening the Northwind Security Gate

On Northwind, the security gate passes when the security reviewer signs. Harden it in three moves.

First, replace the free-text field with a checklist: prompt-injection tests run against the Zendesk ticket input, permission-boundary probes run against Salesforce, and the data agreement signed. The gate cannot pass with any item missing. Second, put the Zendesk, Confluence and Salesforce credentials the team uses on days 3–4 into a vault, scoped to this engagement, with revocation at the day-14 handover written into the runbook. Third, tag the golden set with Northwind's sensitivity tier and store it accordingly, separate from other customers' sets.

The gate's role check was already right. These changes make its signature mean something specific, and they bring the delivery process up to the bar the deployed agent already meets.

---

## Key Takeaways

- A gate with the right signer can still be a rubber stamp; make its evidence a required checklist.
- The delivery process holds live customer credentials when sources connect and when the system first runs; vault, scope and revoke them.
- Residency and encryption apply to delivery artefacts such as golden sets, by each customer's sensitivity tier.
- Running many engagements is a tenancy decision: tag-level or physical separation, and queries that exclude other customers by structure.

## Check Yourself

<details>
<summary>1. The security reviewer signed the gate with "reviewed, looks fine". What is wrong?</summary>

The evidence has no required shape. It cannot show that adversarial testing or permission probes ever happened.

</details>

<details>
<summary>2. When does the delivery process itself hold live customer credentials?</summary>

When data sources are first connected, and when the system starts running against the customer's real environment.

</details>

<details>
<summary>3. Why is "show me all engagements" a security question and not only a reporting one?</summary>

If separation is only a tag, the query depends on remembering to filter. A competitor's records could appear unless isolation is structural.

</details>

