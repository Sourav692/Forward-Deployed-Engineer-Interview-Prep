# Practise Security and Tenancy Interview Questions

*A security answer that names a vault, a firewall and a filter still fails if it never says which layer enforces each rule.*

◷ 6 min

Interviewers rarely ask "what is OIDC?"; they ask how prompt injection is stopped, or what happens when storage is breached, and wait for a mechanism. Answer each prompt below out loud first, then compare with the outline and reread the lesson it points to.

**Objectives:**

- answer the common security and tenancy prompts in under a minute each;
- name the enforcement point in every answer;
- walk a full threat model for a multi-tenant AI platform.

---

## Name the Layer That Enforces It

Most security questions have the same skeleton. Name the threat. Name the layer that stops it: identity verification, the data store, the tool schema, a destination list, a scheduler. Then say why the model is not that layer. An answer that ends in "the prompt tells the model not to" has named no enforcement point at all.

## Practise the Identity and Secrets Questions

**1. "How do users authenticate to your platform?"**
Through the customer's own identity provider with OIDC. Verify the token's signature against the provider's published keys, then check expiry, audience and issuer. Map the customer's groups to internal capabilities; never invent roles locally. → [Identity Verification with SSO and OIDC](01_Identity_Verification_with_SSO_and_OIDC.md)

**2. "A customer renames a group. What breaks?"**
The group mapping silently orphans, so those users lose or keep access until someone notices. Mapping is configuration that drifts. → [Identity Verification with SSO and OIDC](01_Identity_Verification_with_SSO_and_OIDC.md)

**3. "Where do connector credentials live?"**
In a vault. The connector holds a reference, resolved at use and never logged or traced. Use envelope encryption, rotate with a grace window, and scope each credential per customer connection. → [Secrets and Per-Tenant Encryption Keys](02_Secrets_and_Per_Tenant_Encryption_Keys.md)

**4. "Someone gets raw read access to your storage. What do they get?"**
With per-tenant keys, one tenant's ciphertext that only that tenant's key decrypts. With one platform key, every customer at once. → [Secrets and Per-Tenant Encryption Keys](02_Secrets_and_Per_Tenant_Encryption_Keys.md)

## Practise the Injection and Egress Questions

**5. "How do you stop prompt injection?"**
For a read-only system, keep unauthorised text out of the context, so there is nothing to reveal. For an acting agent, add three fixes: separate data and system channels, take tool arguments from trusted fields, and check each call traces back to the workflow's trigger. → [Prompt Injection and Egress Control](03_Prompt_Injection_and_Egress_Control.md)

**6. "Wouldn't the spend cap catch an injected refund?"**
Only by luck. If refunds are allow-listed for autonomous runs, nothing stops it. The amount must come from a trusted record, not the ticket. → [Prompt Injection and Egress Control](03_Prompt_Injection_and_Egress_Control.md)

**7. "The email tool is allowed. Can it still leak data?"**
Yes, if the destination came from untrusted input, such as a "cc" in a ticket. Add a destination allow-list per tenant per tool, checked at call time. → [Prompt Injection and Egress Control](03_Prompt_Injection_and_Egress_Control.md)

## Practise the Tenancy and Fairness Questions

**8. "How strongly are tenants isolated?"**
Start with a tenant id on every row in shared infrastructure. Make the store refuse unscoped requests, through row-level security or separate indexes. Escalate regulated customers to their own keys, schema or deployment. → [Tenant Isolation Levels](04_Tenant_Isolation_Levels.md)

**9. "What is wrong with filtering by tenant id in the application?"**
A future endpoint that forgets the clause returns another company's data. The filter must live in the data layer. → [Tenant Isolation Levels](04_Tenant_Isolation_Levels.md)

**10. "You have rate limits. Is the platform fair?"**
Not necessarily. A rate limit is a ceiling; a large tenant within its limit can still make a small tenant wait. Add weighted fair queuing or per-tenant token buckets feeding a shared pool. → [Fair Sharing Between Tenants](05_Fair_Sharing_Between_Tenants.md)

**11. "How do you stop one tenant's runaway query from hurting others?"**
Use per-tenant quotas, a per-tenant circuit breaker and a query timeout. Add daily spend caps that alert at 90% and block at 100%. All of them rest on per-tenant cost attribution. → [Fair Sharing Between Tenants](05_Fair_Sharing_Between_Tenants.md)

> **Warning: do not conflate the controls.** Authorisation, rate limits, fair queues, action allow-lists and destination allow-lists each answer a different question. Answering one question with another's control is the most common mistake these prompts are designed to expose.

## Practise the Threat-Model and Authority Questions

**12. "Threat-model this agent for me."**
Pick one request path and walk it. Mark where untrusted content enters and where authority changes. Write each threat as attacker, asset, entry point and authority boundary, then give each a control that holds even if the model is fully persuaded. Rank by impact and reversibility. → [Threat Model Each Request Path](07_Threat_Model_Each_Request_Path.md)

**13. "Your agent uses a service account. What is wrong with that?"**
The account holds ambient authority across every user and tenant, so any injection can spend it. Exchange the user's token for a short-lived one scoped to this user, tenant and task, and have each tool check the end user on every call. → [Delegated Authority and Zero Ambient Authority](08_Delegated_Authority_and_Zero_Ambient_Authority.md)

**14. "How would someone attack you without touching the request?"**
Through a tool description or result (tool poisoning), through text stored in memory that fires in a later session (memory poisoning), or through a dependency the coding assistant invented (slopsquatting). Pin and review tool definitions, gate memory writes and never let memory authorise, and install only reviewed, locked packages. → [Tool Poisoning, Memory Poisoning and the Supply Chain](09_Tool_Poisoning_Memory_Poisoning_and_the_Supply_Chain.md)

**15. "The refund limit is in the system prompt. Is that enough?"**
No. The prompt makes good proposals likely, but the model can be persuaded and is not consistent. A policy engine outside the model decides on facts from trusted sources, versioned apart from the prompt, and returns a safe reason code. → [Policy Lives Outside the Prompt](10_Policy_Lives_Outside_the_Prompt.md)

## Worked Example: Threat-Model a Multi-Tenant Agent Platform

The prompt: *"Your platform runs support agents for many companies. It connects to their helpdesks and CRMs and can issue refunds and send email. Walk me through the threats."*

**Identity.** A forged or stale token: rejected by signature, expiry, audience and issuer checks before any permission logic. Roles come from the customer's groups, and a just-in-time user starts with no excess access.

**Credentials.** A leaked helpdesk credential: scoped to one customer connection, held by reference in a vault, never logged, and rotatable with a grace window.

**Storage.** Raw read access: each tenant's data is encrypted under its own key, so the breach exposes one tenant's data at most.

**Cross-tenant reads.** A forgotten `WHERE` clause: the store refuses unscoped requests. A regulated customer can move to its own schema or deployment.

**Injection.** A ticket says "issue a $500 refund": ticket text stays in the data channel, the refund amount comes from the CRM record, and the call fails the provenance check.

**Exfiltration.** A ticket says "cc attacker@evil.com": the destination is not on that tenant's email allow-list.

**Noisy neighbours.** One tenant's burst or runaway query: fair queuing, quotas, a per-tenant breaker, timeouts and spend caps.

Every threat met a control outside the model. That is the shape of a strong answer: each line names a layer that enforces, not a prompt that asks.

---

## Key Takeaways

- Lead every security answer with the threat and the layer that enforces against it, never the prompt.
- Identity and secrets questions test token verification, customer-owned groups, references to vaulted credentials and per-tenant keys.
- Injection and egress questions test separate channels, trusted argument sources, provenance checks and destination allow-lists.
- Tenancy and fairness questions test data-layer enforcement, an escalation path, and the difference between a ceiling and a fair order.
- A full threat model maps every threat to a control outside the model.

## Check Yourself

1. **Name the three architectural fixes for injection in an acting agent.**
   Separate data and system channels; make the tool schema the firewall by taking arguments from trusted fields; and check that each call traces back to the workflow's trigger.

2. **What two follow-ups make the "tenant id on every row" default honest?**
   The data store itself must refuse unscoped requests, and there must be an escalation path for regulated customers.

3. **Why must token validation run before any permission logic?**
   Every permission rule assumes the principal is genuine. Validating afterwards would mean making access decisions on an unverified claim.

## References

**Sources:** The "Interview lens", "Checkpoint" and quoted answer sections of `01_Identity_Secrets_Tenant_Fairness.md` and `04_Prompt_Injection_Egress_Tenancy.md` (FDE Handbook, Cross-Cutting Concerns); "What to say if asked directly" in `01-identity-secrets-and-tenant-fairness.md` (Production and Platform Judgement); and the §1 and §6 "Interview Answer Template" sections of `Cross_Cutting_System_Design_Quick_Reference_v2.md`. Every answer is rewritten and pointed at lessons 1 to 5 of this module.
