# Delegated Authority and Zero Ambient Authority

*An agent that can do anything any user could do will, sooner or later, do it for the wrong user.*

Identity tells you who sent the request. Authority decides what the system may do while serving it. In most agent platforms the two drift apart: the user is verified carefully, then the agent acts with a broad service account that ignores who the user is. This lesson shows how to carry the user's authority through every hop, so that the agent can never do more than the person it is working for.

**Objectives:**

- distinguish authentication, authorisation and delegation in an agent request;
- explain ambient authority and why it turns injection into damage;
- scope an agent's credentials to one user, one tenant and one task;
- handle agent-to-agent delegation without passing on the caller's full rights.

---

## Separate Three Questions

Three questions sound alike and need different answers.

1. **Authentication: who is this?** Answered by verifying the token, as in [Identity Verification with SSO and OIDC](/learn/production-ai/security-tenancy-prompt-injection/identity-verification-with-sso-and-oidc).
2. **Authorisation: may this principal do this action on this resource?** Answered by the access rules, as in [The Seven Access Rules](/learn/production-ai/enterprise-rag-in-production/the-seven-access-rules).
3. **Delegation: on whose behalf is this component acting, and with how much of their power?** This is the question agent systems most often skip.

A support agent that reads a customer's orders and issues refunds is acting on behalf of two parties at once: the customer who asked, and the company that set the refund policy. Its authority should be the overlap of the two, not the sum.

## Remove Ambient Authority

**Ambient authority** is power a component holds simply by existing, without anyone granting it for the task at hand. A service account that can read every tenant's orders has ambient authority. So does a tool server holding an admin API key, or an agent process with write access to a shared drive.

Ambient authority is what turns a prompt injection into an incident. If injected text persuades the agent to "look up order 4471", the damage depends entirely on what the agent's credentials can reach. With ambient authority, it reaches every order in every tenant. With scoped authority, it reaches the requesting user's own orders, and the injection achieves nothing new.

Aim for **zero ambient authority**: every credential the agent uses is granted for this request, bound to this user, this tenant and this task, and expires when the task ends.

## Carry the User's Authority Through Every Hop

The pattern has three parts.

- **Exchange, don't reuse.** At the edge, exchange the user's verified token for a short-lived, narrower token that names the agent as the actor and the user as the subject. OAuth 2.0 Token Exchange (RFC 8693) standardises this. The downstream service then sees both who asked and who is acting.
- **Bind credentials to the request.** Tool calls carry the exchanged token, never a long-lived service key. The tool server checks the end user's permissions on every call, the defence against the confused deputy described in [The Model Context Protocol](/learn/agent-protocols-mcp-and-a2a/mcp-foundations/from-a-tool-calling-chatbot-to-mcp).
- **Scope by task.** Grant only the scopes this workflow needs. A ticket-answering run gets `orders:read` for one customer and `refunds:create` up to a limit, not `orders:*`.

Least privilege is the principle. Zero ambient authority is the test that you applied it: list every credential the agent process holds when it is idle. The right length for that list is zero.

## Delegate Between Agents Without Inheriting Everything

Multi-agent systems add another hop. A supervisor agent hands a sub-task to a worker agent. The easy design passes the supervisor's token along, and the worker now holds every right the supervisor had.

Instead, the supervisor requests a new, narrower token for the worker, scoped to the sub-task. The worker's identity is recorded as the actor, the original user stays the subject, and the chain of actors is kept for audit. If the worker is compromised by a poisoned tool result, the blast radius is the sub-task, not the whole run.

Check two things when a receiving agent gets work:

1. **Who is the receiving agent?** It authenticates as itself, not as the caller.
2. **What may it do?** Only what the new token allows, which is never more than the caller held.

## Keep Secrets Out of the Model's Reach

Credentials belong to the runtime, never to the context. The model sees a tool called `issue_refund(order_id, amount)`. It never sees the payment API key, and it never chooses which credential to use. Secrets come from a vault at call time, as in [Secrets and Per-Tenant Encryption Keys](/learn/production-ai/security-tenancy-prompt-injection/secrets-and-per-tenant-encryption-keys). A model that can read a key can be persuaded to repeat it.

## Worked Example: One Refund, Three Hops

A customer of tenant Acme asks the support agent to refund order 4471.

1. **Edge.** The gateway verifies the customer's token, then exchanges it for a five-minute token: subject `customer-981`, actor `support-agent`, tenant `acme`, scopes `orders:read:self` and `refunds:create:max=200`.
2. **Agent to refund worker.** The support agent delegates the refund to a payments worker. It requests a second token: same subject, actor `payments-worker`, scope `refunds:create:order=4471:max=200`.
3. **Payment service.** It checks the token: the subject owns order 4471, the amount is under 200, the tenant matches. It records the actor chain `support-agent → payments-worker` in the audit log.

Now suppose the ticket contained injected text asking for a refund on order 5520, which belongs to another customer. The model may well propose it. The payment service rejects it, because the token's subject does not own order 5520 and its scope names only order 4471. No prompt wording made that decision.

---

## Key Takeaways

- Authentication, authorisation and delegation are three separate questions, and agents most often skip delegation.
- Ambient authority is power held without being granted for the task. It decides how much damage an injection can do.
- Exchange the user's token for a short-lived, scoped one that names both the acting agent and the user.
- Agent-to-agent delegation issues a new, narrower token per sub-task, never the caller's own.
- Credentials live in the runtime and the vault, never in the model's context.

## Check Yourself

<details>
<summary>1. What is ambient authority, in one sentence?</summary>

Power a component holds by default rather than being granted for the current task, such as a service account that can read every tenant's data.

</details>

<details>
<summary>2. Why does token exchange beat passing the user's original token downstream?</summary>

The exchanged token is shorter-lived, narrower in scope and records the acting component as well as the user, so each downstream service can check both and the audit log shows the full chain.

</details>

<details>
<summary>3. A supervisor agent passes its own token to a worker. What is the risk?</summary>

The worker inherits every right the supervisor had. If a poisoned tool result compromises the worker, the attacker gets the supervisor's full authority instead of one sub-task's.

</details>

## References

**Sources:** It builds on the identity, secrets and access-rule lessons in this track and on the confused-deputy section of [The Model Context Protocol](/learn/agent-protocols-mcp-and-a2a/mcp-foundations/from-a-tool-calling-chatbot-to-mcp).

