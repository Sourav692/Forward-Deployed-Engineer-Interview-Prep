# Threat Model Each Request Path

*A list of AI threats tells you what could go wrong somewhere. A threat model tells you what goes wrong on this path, through this door, with this much authority.*

◷ 7 min

Generic threat lists ("prompt injection, data leakage, jailbreaks") are a starting vocabulary, not a design. A useful threat model follows one request from the moment it enters the system to the moment something changes in the world, and asks the same four questions at every hop. This lesson gives you those questions and a way to write the answers down so that each threat ends in a named control.

**Objectives:**

- trace a request path and mark every point where untrusted content enters;
- describe a threat by attacker, asset, entry point and authority boundary;
- turn each threat into a control that lives outside the model;
- run the exercise in an interview without drifting into a generic checklist.

---

## Start From the Path, Not the Threat List

Draw the path first. For an agent that answers support tickets and can issue refunds, the path is: the ticket arrives, the agent retrieves policy documents and the customer's order history, the model plans, it calls the refund tool, and the payment system moves money. Five hops, three data sources, one action that cannot be undone.

Now mark every point where content the system did not write enters the model's context. Here there are three: the ticket text, the retrieved documents and the tool results. Each is an **entry point**. Treat everything that arrives through one as data that may contain instructions. This is the same rule [Prompt Injection and Egress Control](03_Prompt_Injection_and_Egress_Control.md) applies to a single agent, extended to the whole path.

Then mark where authority changes. The ticket author has none. The agent has whatever its tools allow. The payment system trusts the refund tool completely. Each change is an **authority boundary**, and boundaries are where attacks pay off.

## Describe Each Threat in Four Parts

Write every threat as one row with four parts.

| Part | Question | Refund agent example |
|---|---|---|
| Attacker | Who wants this, and what can they already touch? | A customer who can write ticket text |
| Asset | What do they want: data, money, an action, availability? | Refunds paid to an account they control |
| Entry point | Where does their content reach the model or a tool? | The ticket body, read into the planning prompt |
| Authority boundary | Which step turns their text into someone else's power? | The agent calling `issue_refund` with its own service credentials |

A threat written this way is specific enough to test. "Prompt injection" is not. "A customer writes text into a ticket that makes the agent refund a different order to a new account, using the agent's payment authority" is.

## Ask Which Authority the Attack Borrows

Most serious agent attacks borrow authority rather than steal it. The attacker has little power of their own. The agent has a lot. The attack succeeds when the agent spends its authority on the attacker's behalf.

So for each row, ask: whose authority executes the final step? If the answer is "the agent's service account" and that account can act for any customer, the attack is a [confused deputy](../T3.2_Tool_Design_MCP_and_A2A/05_The_Model_Context_Protocol.md). The fix is to shrink what the agent can do for this request, which the next lesson, [Delegated Authority and Zero Ambient Authority](08_Delegated_Authority_and_Zero_Ambient_Authority.md), covers in full.

## Turn Each Threat Into a Control Outside the Model

Every row needs a control, and the control must hold even if the model is fully persuaded by the attacker. Assume the model will do whatever the injected text asks, then ask what still stops the harm.

| Threat row | Control | Where it lives |
|---|---|---|
| Ticket text redirects a refund | Refund amount and order id come from the order record, never from free text | Tool argument binding |
| Ticket text sends data to an outside address | Destination allow-list per tenant | Egress check at call time |
| Retrieved document carries instructions | Retrieved text goes in a data channel and cannot select tools | Context assembly |
| A large refund slips through | Human approval above a threshold | Workflow gate |

A control that says "the system prompt tells the model to ignore instructions in tickets" is not on this list. It may reduce how often the attack works. It does not bound what happens when it does.

## Rank by Impact and Reversibility

You will find more rows than you can fix in one release. Rank them by two things: how bad the outcome is, and whether it can be undone. A wrong answer in a chat can be corrected. A refund to the wrong account, a deleted record or a message sent to a customer cannot. Irreversible actions with external effect go to the top, whatever their likelihood.

Write down the rows you accept for now, who accepted them and when they will be reviewed. An unranked list of fifty threats is as useless as no list. A ranked list with three owned exceptions is a release decision.

## Worked Example: A Research Agent That Writes Back

A research agent reads public web pages, summarises them and writes the summaries into the company's internal knowledge base, which other agents later retrieve from.

The path has two entry points worth a row each. Web pages enter during research. The knowledge base enters later, when a different agent retrieves what this one wrote.

- **Row 1.** Attacker: anyone who can publish a web page. Asset: the internal knowledge base. Entry point: page text. Authority boundary: the agent's write permission on the knowledge base. Control: summaries are written to a review queue with the source URL attached, and only reviewed entries become retrievable.
- **Row 2.** Attacker: the same. Asset: the behaviour of every agent that retrieves later. Entry point: a stored summary that carries instructions. Authority boundary: the later agent's tools. Control: retrieved knowledge-base text is treated as data in every consuming agent, the same as web text.

Row 2 is the one teams miss. The write-back turned a one-off injection into a stored one that fires in a different system, days later. The lesson on [Tool Poisoning, Memory Poisoning and the Supply Chain](09_Tool_Poisoning_Memory_Poisoning_and_the_Supply_Chain.md) covers this class of attack.

---

## Key Takeaways

- Start from one request path and mark where untrusted content enters and where authority changes.
- Write each threat as attacker, asset, entry point and authority boundary, specific enough to test.
- Most agent attacks borrow the agent's authority, so ask whose authority executes the final step.
- Every threat needs a control that holds even when the model is fully persuaded.
- Rank by impact and reversibility, and record the threats you accept with an owner and a review date.

## Check Yourself

1. **Why is "prompt injection" not a threat-model row?**
   It names a technique, not a threat. A row needs the attacker, the asset, the entry point and the boundary, so that you can test it and attach a control.

2. **What is an authority boundary, and why does it matter more than the entry point?**
   It is the step where content from one party turns into another party's power, such as the agent calling a tool with its own credentials. The entry point is where the attack starts. The boundary is where it pays off, and the control must sit there.

3. **An agent writes to a store that other agents read. What extra row does that create?**
   A stored-injection row: text written today becomes an entry point for every consuming agent later. Each consumer must treat that store's content as untrusted data.

## References

**Sources:** written for this site. The four-part threat row adapts the classic threat-modelling questions (what are we building, what can go wrong, what will we do about it) to agent request paths. Related public references: the OWASP Top 10 for LLM Applications (2025), in particular LLM01 Prompt Injection and LLM06 Excessive Agency, and Microsoft's STRIDE model for the general practice of threat modelling.
