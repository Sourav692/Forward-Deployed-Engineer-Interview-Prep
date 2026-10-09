# Agent action guardrails: the ideas behind problems 43, 47, 48

An AI agent does more than write text. It calls tools that create tickets, update a CRM, send emails or move money. Once a model can act, the hard question is no longer "is the answer good?" but "is this action allowed, and will it happen exactly once?" These three problems are small rules that sit between the model and the customer's systems.

## The model proposes, the platform decides

The model's output is a suggestion, not a permission. Our own code decides whether a tool call runs, using data the model cannot change, like the user's roles and a server-side list of tools.

Why it matters: a prompt injection hidden in a retrieved document can make the model ask for `delete_tenant`. If the model's request is the only check, the attacker wins. If the platform checks roles first, the request is just a denied log line.

> Say it like this: "The agent can propose an action, but the platform decides whether it is allowed."

## Fail closed

Failing closed means that when something is missing, unknown or broken, the system picks the safe outcome: deny, or ask a human. Failing open would mean letting the action through.

Why it matters: a new tool gets added with no risk label. If missing risk defaults to "read", every user can run it on day one. If missing risk means "deny", the worst case is a support ticket asking for the label to be added.

> Say it like this: "If I cannot tell how risky something is, I treat it as the riskiest case."

## Least privilege and risk tiers

Least privilege means each user and each tool gets only the access it needs. Tools are sorted into tiers, such as read, write and admin, and each tier lists the roles that may use it.

Why it matters: a viewer asking an agent to "clean up old records" should not be able to trigger a bulk delete just because the agent is capable of it. A small table from tier to roles makes the rule easy to read, test and explain to a customer's security team.

> Say it like this: "I keep one table from risk tier to allowed roles, so the policy is visible in one place."

## Human in the loop

Human in the loop means a person must approve some actions before they run. An approval only counts if it is recent, comes from the right person (not the requester), and matches the action being run.

Why it matters: in finance or healthcare, the customer often cares less about the approval button and more about the evidence: who approved what, when, and based on what context. An approval from last week, or one the requester gave themselves, is not real oversight.

> Say it like this: "The key feature is not just approval, it is proof of what was approved, by whom, and when."

## Idempotency

An operation is idempotent when doing it twice has the same effect as doing it once. In practice, each write carries an idempotency key, a unique id for one intended action, and the system refuses to run the same key twice.

Why it matters: agents retry after network errors. The first call may have worked even though the reply was lost. Without a key, the retry creates a second ticket or sends a second email. Keys must be scoped by tenant, or one customer's key can block another's.

> Say it like this: "Retries are normal, so every write needs an idempotency key that makes a repeat harmless."

## Time as an input

Rules that depend on time, like approval expiry or a key's time window, should take the current time as a parameter instead of reading the clock inside the function.

Why it matters: a check that calls the real clock is hard to test and can give different answers on different runs. Passing `now` in lets you test "just inside the window" and "just expired" in one second, with no sleeps.

> Say it like this: "I pass the time in, so I can test expiry rules without waiting."

## How the problems use these ideas

- **Problem 43, Agent Tool Execution Safety:** the platform decides, using a risk-tier table. Missing or unknown risk fails closed. Roles come from our system, not the model.
- **Problem 47, Human-in-the-Loop Approval Queue:** only a short list of low risks run alone, so mislabeled actions fail closed into the queue. An approval counts only if it is recent and not self-given. Time is passed in.
- **Problem 48, Tool-Call Retry Prevention:** idempotency keys scoped by tenant, with a time window. The `seen` store and `now` are passed in, so the behaviour is easy to replay in tests.

## Using an AI assistant on these problems

- Spell out the fail-closed rule in your prompt ("a missing risk returns False"). Assistants often pick a friendly default like "read".
- Tell the assistant not to call `time.time()` and to use the `now` argument. Then check that it did.
- For idempotency, ask for the tuple key `(tenant_id, idempotency_key)` by name. Read the code to confirm the tenant is really part of the key.
- After the AI answers, add one test for the "unknown" case yourself: unknown risk, missing approver, a different tenant. That is where these functions usually break.
- Ask a follow-up out loud: "what happens with two servers?" The in-memory answer is fine for the interview, but you should name the atomic store you would use.

## Words to know

| Term | Plain meaning |
| --- | --- |
| Fail closed | When unsure, pick the safe outcome: deny or ask a human. |
| Least privilege | Give each user or tool only the access it needs. |
| Risk tier | A label like read, write or admin that says how dangerous a tool is. |
| Human in the loop | A person must approve before the action runs. |
| Idempotency key | A unique id for one intended action, so a repeat can be spotted. |
| TTL | Time to live: how long something stays valid before it expires. |
| Prompt injection | Hidden text that tries to trick the model into doing something it should not. |
| Audit log | A record of who did what and when, kept for later review. |
