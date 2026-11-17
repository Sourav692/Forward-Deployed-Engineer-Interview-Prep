# Practise the Security Review


## How to use this practice

A security review ends with an evidence pack: the documents and artefacts the customer's reviewer signs off against. These two questions build its two main parts. Answer each aloud as if the reviewer is on the call, then compare with the outline. Sketch on paper as you go, since both answers are easier to give with a diagram in front of you.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Building a threat model for a service that accepts uploaded files.
> - Ranking threats and naming a control and evidence for each.
> - Assembling the evidence checklist for a customer's security review.
> - Saying which gaps you will close, by when, and who owns them.

## The threat model in the pack

Taught in [threat modelling a deployment](/learn/fde-deploying-in-the-estate/security-reviews-and-compliance/threat-modelling-a-deployment). AI-specific threats, such as instructions hidden in documents, are canonical in [threat model each request path](/learn/production-ai/security-tenancy-prompt-injection/threat-model-each-request-path).

<details>
<summary>Practice question 1. Sandling Pay's analysts will upload card dispute evidence (PDFs, photos and zip files of up to 50 MB) to a service you run. A worker parses each file and calls a model to extract fields. Build the threat model you would hand Sandling's reviewer.</summary>

- **Answer:** Start with the data flow: browser, upload endpoint, object store, queue, parser worker, model provider, results store, support console and logs. Mark four boundaries: internet to service, tenant to tenant, service to model provider, staff to data. Then walk the path:
    - **Upload endpoint.** Filenames with path tricks, types that lie, oversized files. Store under a random ID, check file signatures against an allow-list, cap size.
    - **Parser.** Zip bombs and crafted files that exploit parser bugs. Cap expanded size and file count, and run parsing in a sandbox with no network and a time limit.
    - **Model call.** Text in a receipt that tries to steer extraction. Validate output against a schema and never let it trigger actions.
    - **Stores and cache.** Cross-tenant reads. Tenant prefix on every object and key, from the session.
    - **Support console.** Staff browsing. Access by ticket, every read logged.

    Rank by impact. Cross-tenant exposure and parser compromise come first. Give each row an owner and the test that proves it.
- **Trade-off:** Sandboxing the parser adds latency and running cost. Skipping it puts every tenant's files one parser bug away from exposure.
- **Follow-up to expect:** "Do you scan for malware?" Yes, before parsing, as one layer. A scanner does not catch parser exploits it has never seen.

</details>

## The evidence checklist

Taught in [encryption, keys and audit evidence](/learn/fde-deploying-in-the-estate/security-reviews-and-compliance/encryption-keys-and-audit-evidence) and [residency, retention and deletion](/learn/fde-deploying-in-the-estate/security-reviews-and-compliance/residency-retention-and-deletion).

<details>
<summary>Practice question 2. Thirlby Legal's security team will review your document assistant in three weeks. What goes in your evidence checklist, and how do you make it convincing?</summary>

- **Answer:** Organise the pack by question, with a dated artefact for each:
    - **What is it?** Architecture and data flow diagram, threat model with owners, list of third parties and what each receives.
    - **Who can get in?** Single sign-on setup, role list, access review record, support access process.
    - **Is data protected?** TLS scan result, encryption settings, key policy and key use log, rotation history.
    - **Can we see what happened?** Audit log sample for a staff read, log retention and tamper protection settings.
    - **Where does data go, and does it leave?** Copy inventory with regions, retention rules, a sample deletion record.
    - **What if it fails?** Backup and restore test result, incident process, penetration test summary with fixes.

    Offer a live demonstration of a staff read appearing in the audit log. List open gaps with owners and dates instead of hiding them.
- **Trade-off:** A complete pack takes days to assemble. Keep a template per product so each review starts from last time's.
- **Follow-up to expect:** "Can we keep the pack?" Agree what they may store, since it describes your defences.

</details>

## References

1. OWASP, [Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/), accessed 17 November 2026. A checklist of verifiable security requirements that a reviewer may draw on.
2. OWASP, [File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), accessed 17 November 2026. Controls for uploaded files.
3. [Threat modelling a deployment](/learn/fde-deploying-in-the-estate/security-reviews-and-compliance/threat-modelling-a-deployment), [encryption, keys and audit evidence](/learn/fde-deploying-in-the-estate/security-reviews-and-compliance/encryption-keys-and-audit-evidence) and [residency, retention and deletion](/learn/fde-deploying-in-the-estate/security-reviews-and-compliance/residency-retention-and-deletion), the lessons these questions practise.
4. The author's own field experience, the basis for the evidence checklist.

## Key takeaways

- The evidence pack has two halves: a threat model that maps the system, and artefacts that prove each control.
- For uploads, the parser and the tenant boundary are the highest risks.
- Organise evidence by the reviewer's questions, each with a dated artefact.
- Show open gaps with owners and dates. Reviewers trust a pack that admits them.

## Check yourself

<details>
<summary>1. Why does an upload service's threat model rank the parser so high?</summary>

The parser runs code over a file chosen by someone else. One exploitable bug can give an attacker the worker, and with it other tenants' files, unless the parser is sandboxed.

</details>

<details>
<summary>2. Why list open gaps in the evidence pack instead of leaving them out?</summary>

The reviewer will often find them anyway. A gap with an owner and a date shows the risk is managed. A gap the reviewer finds alone makes every other claim suspect.

</details>
