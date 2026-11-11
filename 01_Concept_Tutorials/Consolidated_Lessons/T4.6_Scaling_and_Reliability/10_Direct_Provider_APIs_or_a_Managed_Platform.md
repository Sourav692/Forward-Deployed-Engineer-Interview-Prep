# Direct Provider APIs or a Managed Platform

*The same model can be reached two ways: straight from the company that trains it, or through your cloud provider's AI platform. The model is the same. Almost everything around it is not.*

◷ 7 min

Many enterprises can call a model either through its maker's API or through a managed platform in their existing cloud account, such as Amazon Bedrock, Google Cloud Vertex AI or Azure AI Foundry. Customers often have a strong preference before you arrive, and the reasons are rarely about model quality. This lesson compares the two paths on what usually decides it, using Bedrock as the worked example.

**Objectives:**

- compare direct APIs and managed platforms on identity, networking, data handling and operations;
- explain feature lag and how to check for it;
- plan for regions, quotas and version pinning on either path;
- run both paths behind one gateway and choose per workload.

---

## Compare What Changes Around the Model

| Concern | Direct provider API | Managed cloud platform |
|---|---|---|
| Identity | Provider API keys, managed by you | The cloud's own identity and access management, such as IAM roles |
| Networking | Public internet endpoint, sometimes with private options | Private endpoints inside the customer's cloud network are common |
| Data handling | The provider's terms and data controls | The cloud provider's terms, often already approved by the customer's security team |
| Billing | A new vendor relationship | The existing cloud bill and committed spend |
| Logging and audit | Your own logging | The cloud's native audit and invocation logging |
| Model choice | One provider's models | Several providers' models in one place |
| Newest features | Usually first | May arrive later |

For many enterprise customers, the identity, networking and procurement rows settle the question. If their security team has already approved the cloud account, using a model inside it can take weeks off an approval that a new vendor would need months for.

## Check for Feature Lag

A managed platform hosts the provider's model but wraps it in its own API. New features sometimes reach the provider's API first: a new tool-calling mode, a longer context option, a prompt-caching change, a new model version. The gap might be days or months, and some features may differ in shape.

Before committing a design to one path, list the capabilities your tasks require, as in the capability contract from [What a Model Gateway Owns](08_What_a_Model_Gateway_Owns.md). Check each against the platform's current documentation for the exact model and region you will use. Do this again when you plan to adopt a new feature.

## Plan Regions, Quotas and Versions

Both paths have limits that surface only under load:

- **Regions.** A model may be available in some regions and not others. Data residency rules may force a region where the model you want is missing or slower.
- **Quotas.** Throughput limits are set per account, region and model. Raising them can take a support request and time. Some platforms offer reserved or provisioned throughput for steady high volume.
- **Cross-region routing.** Some platforms can spread load across regions automatically. Check that this does not break a residency requirement.
- **Versions.** Pin the exact model version on either path, and track deprecation dates.

Load-test with the quotas you will actually have, not the ones in a demo account.

## Use Bedrock as the Worked Comparison

Amazon Bedrock is AWS's managed service for foundation models from several providers. For a customer already on AWS, it typically means:

- Access is granted with IAM policies, down to which models a role may invoke.
- Traffic can stay on private network paths through VPC endpoints.
- Invocation logging can be sent to the customer's own storage and monitoring.
- Usage appears on the existing AWS bill.

What to check before you commit: whether the specific model version and features you need are available on Bedrock in the customer's region, what the throughput quota is, and how prompt caching and tool calling behave compared with the provider's own API. The same checklist applies to Vertex AI and Azure.

## Run Both Behind One Gateway

You rarely need to pick one path for the whole company. Put both behind the gateway as separate providers:

- Each task's evaluation decides which path qualifies, as in [Route From Evidence and Fall Back With Care](09_Route_From_Evidence_and_Fall_Back_With_Care.md).
- Policy decides which data may use which path, for example customer data only through the private cloud path.
- Each path can be the other's fallback, provided both pass the task's tests.
- Adapters in the gateway absorb the API differences, so applications see one contract.

Keep the split clear: the adapter translates requests and responses, and the product logic stays in the application. If product behaviour starts depending on which path served a request, the adapter is leaking.

## Worked Example: A Bank's Assistant

A bank wants an internal assistant using a model it has evaluated through the provider's direct API.

- **Constraint.** The bank's security team has approved its AWS account. A new vendor would need a six-month review. Data may not leave the EU.
- **Check.** The model is available on Bedrock in an EU region the bank uses. Structured output works the same way. The newest tool-calling option is not yet available on Bedrock, and the design does not need it.
- **Decision.** Production traffic goes through Bedrock over a private endpoint, with IAM roles per application and invocation logs in the bank's account. The direct API stays configured in the gateway for evaluation work on non-customer data only.
- **Quota.** Load testing shows the default quota is half the expected peak. The team requests an increase before launch rather than after the first busy morning.

---

## Key Takeaways

- Direct APIs and managed platforms usually serve the same model. They differ on identity, networking, data terms, billing, logging and feature timing.
- Enterprise approval and networking often decide the path before model quality is discussed.
- Check every required capability for the exact model and region on the chosen platform, and recheck before adopting new features.
- Plan regions, quotas and version pinning on either path, and load-test with real quotas.
- Put both paths behind one gateway, choose per task by evidence and policy, and keep adapters free of product logic.

## Check Yourself

1. **Why might a customer prefer a managed platform even if the model is identical?**
   It uses their existing cloud identity, private networking, approved data terms, logging and billing, which can remove a long vendor-approval process.

2. **What is feature lag, and how do you guard against it?**
   New model features can reach the provider's direct API before a managed platform. List required capabilities and verify each for the exact model and region before committing.

3. **When is it right to run both paths?**
   When different workloads have different constraints, such as customer data that must stay on a private cloud path while evaluation work uses the direct API. A gateway lets each task use the path that qualifies.

## References

**Sources:** written for this site. Public references: the documentation for Amazon Bedrock, Google Cloud Vertex AI and Azure AI Foundry. Check current model availability, regions and quotas there, because they change often. The worked example is illustrative.
