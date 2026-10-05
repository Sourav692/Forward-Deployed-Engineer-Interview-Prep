# Practise Tool Design Interview Questions

*An answer that names a framework sounds fluent, but only an answer that names the mechanism shows you have debugged a tool layer.*

◷ 6 min

Interviewers ask about tools to see whether a candidate blames the model or the interface. Answer each prompt below out loud first, then compare with the outline and reread the lesson it points to.

**Objectives:**

- answer the common tool-design prompts in under a minute each;
- lead every answer with a mechanism, not a product name;
- connect each answer to the failure it prevents.

---

## Lead With the Mechanism, Then the Failure

Tool questions share a skeleton. Name the mechanism: the result state, the gateway check, the schema rule, the sandbox control. Then name the failure it prevents. A strong answer sounds like "the gateway authorises before it validates, so a denied caller cannot learn the schema". A weak one sounds like "we add guardrails".

A mechanism can be checked; a promise cannot. The outlines below follow that skeleton.

## Practise the Interface Questions

**1. "Refund calls fail a third of the time. Do you upgrade the model?"**
Not first. Walk the five causes: wrong tool, bad arguments, valid-looking but wrong call, unusable result, model error. Four are interface bugs. Below about 90% success, fix the interface. → [The Agent-Computer Interface](01_The_Agent_Computer_Interface.md)

**2. "Why is `destructive` a field on the tool, not a check the model makes?"**
It is set once at registration. A model that is wrong cannot be trusted to notice it is about to do damage, so the loop enforces the flag. → [The Agent-Computer Interface](01_The_Agent_Computer_Interface.md)

**3. "Rewrite this tool schema."**
Use the eight rules: a verb name, when not to use it, constrained fields, units in names, flat arguments up to six, small results, teachable errors and idempotent writes. Each constraint is a mistake the model can no longer make. → [Tool Schema Design](02_Tool_Schema_Design.md)

## Practise the Result and Error Questions

**4. "How would you design your tool's result types?"**
Five states: `SUCCESS`, `EMPTY`, `UNAVAILABLE`, `DENIED`, `INVALID`. Then give the failure for each confused pair: outage read as empty causes retry storms; denial read as bad input teaches workarounds. Add the refund-splitting story: a denial that explains a $500 limit gets two $300 refunds. → [Typed Tool Results and Teachable Errors](03_Typed_Tool_Results_and_Teachable_Errors.md)

**5. "Why does a tool's error message matter to agent design?"**
It is the only signal the model gets to change its next action. A vague error produces identical retries; a specific one lets the model correct itself. → [Typed Tool Results and Teachable Errors](03_Typed_Tool_Results_and_Teachable_Errors.md)

**6. "What is the difference between a transient error and a not-found error?"**
Transient is temporary and safe to retry. Not-found is permanent: do not retry, fall back. → [Typed Tool Results and Teachable Errors](03_Typed_Tool_Results_and_Teachable_Errors.md)

## Practise the Gateway and Safety Questions

**7. "How do you stop an agent from doing something it shouldn't?"**
Name the gateway order: authorise, validate, call with an idempotency key, trim, log. Explain why authorisation comes first. → [The Tool Gateway and Code Sandboxing](04_The_Tool_Gateway_and_Code_Sandboxing.md)

**8. "How do you validate tool calls before running them, especially ones with side effects?"**
Check argument types and ranges, not just that the payload parses. Keep an allowlist of tools per agent role. Put a confirmation step, human or a second check, in front of destructive or costly calls, separate from the tool's own error handling. → [The Tool Gateway and Code Sandboxing](04_The_Tool_Gateway_and_Code_Sandboxing.md)

**9. "Design guardrails for an agent that can spend money or change data."**
Put them in the tool layer: parameterised queries, allowlists, rate limits. A prompt-level check is defence in depth, never the main control. Without tool-layer guardrails an agent can loop through API credits, leak data, or act on invented facts. → [The Tool Gateway and Code Sandboxing](04_The_Tool_Gateway_and_Code_Sandboxing.md)

**10. "Someone tricked your code-interpreter agent into running `rm -rf /`. How, and how do you stop it?"**
The model will not refuse every time, and validation cannot predict what code does. Isolate it: a container with a read-only root, no network, resource caps, no credentials, single use, truncated output. → [The Tool Gateway and Code Sandboxing](04_The_Tool_Gateway_and_Code_Sandboxing.md)

## Practise the Protocol and Scale Questions

**11. "Explain MCP's primitives."**
By who controls them: tools by the model, resources by the host app, prompts by the user. Then the cost of mixing them up, and the confused-deputy risk. → [The Model Context Protocol](05_The_Model_Context_Protocol.md)

**12. "Your agent has 200 tools. How do you keep it accurate?"**
Collapse first: scope-based façades bring it to 20 to 40. Filter by caller. Add retrieval only past about 40. Pin `clarify` and `escalate`. Check permissions server-side. → [Tool Selection at Scale](06_Tool_Selection_at_Scale.md)

> **Warning: do not open with the technology.** "Embed the tool descriptions" and "use MCP" are both true and both weak openings. Interviewers are listening for the design decision that comes before the technology.

## Worked Example: A Full Answer to Question 7

The prompt: stop the support agent refunding the wrong amount, or refunding twice.

Start with the mechanism. Every call goes through one gateway. Policy checks the caller may refund at all, before validation, so a denied caller learns nothing about the schema. The validator checks the amount is a positive integer in cents within the order total. The call carries an idempotency key hashed from the run, the tool name and the arguments, so a retry after a timeout returns the first result instead of refunding again. The response is trimmed to the declared fields, and the call is logged.

Then the failures it prevents: an unauthorised refund, a bad amount, a double refund and a bloated context. The answer names four checks and four failures, and never says "guardrails". That pairing is what the question tests.

---

## Key Takeaways

- Lead every tool answer with a mechanism and the failure it prevents.
- Interface questions test whether you fix the interface before blaming the model.
- Result questions test the five states, opaque denials and teachable errors.
- Safety questions test the gateway order, tool-layer controls and sandboxing.
- Protocol and scale questions test control-based MCP primitives and collapsing the tool surface before retrieval.

## Check Yourself

1. **What should come first in an answer to "how do you stop the agent doing harm?"**
   The gateway mechanism in order, starting with authorisation before validation, not a general promise of guardrails.

2. **Why is "use embeddings" a weak first answer to the 200-tools question?**
   It patches a large surface instead of shrinking it. Façades and caller filtering come first.

3. **Which result-state confusion causes retry storms?**
   Treating `UNAVAILABLE` as `EMPTY`, so the agent keeps rewording its query during an outage.

## References

**Sources:** `ch05_tool_use_agent_computer_interface.md` (*Cracking Agentic AI System Design Interviews*, Ch. 5: the interview pointers and design drills in each section, summarised in our own words). `03_What_An_Agent_Actually_Is.md` (FDE Handbook, LLM Systems Foundations): "Checkpoint". `agent_fundamentals_and_advanced_agentic_systems_INTERVIEW_TUTORIAL.md`: §4 questions 4 and 9, with answers rewritten in our own words, and §7 self-check question 11.
