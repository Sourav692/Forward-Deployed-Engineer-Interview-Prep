# Channel Adapters and Human Escalation

*A separate agent per channel fits each channel perfectly and splits the security model four ways, so keep one core and let only the edge change.*

◷ 5 min

Chat, team messaging, email and a raw API are not the same problem in different clothes, but they do not need different systems. Keep one core pipeline behind a thin adapter, and make "escalate to a human" a concrete workflow rather than a message shown before the user gives up.

**Objectives:**

- say exactly what a channel adapter may change and what it must never change;
- design escalation as five concrete obligations;
- turn escalation outcomes into evaluation data.

---

## Match Latency and Shape to the Channel

| Channel | Latency expectation | Output shape | Design consequence |
|---|---|---|---|
| Live chat | Sub-second first response | Short, conversational, streamed | Needs token streaming; cannot wait for the full answer |
| Team messaging | A few seconds is fine | Slightly more structured | Can afford one extra retrieval pass |
| Email or async | Minutes are fine | Longer, more formal | A separate drafting step earns its keep |
| Raw API | Set by the caller | Structured data, not prose | No drafting step; the grounded answer plus sources, machine-readable |

## Keep One Core Behind a Thin Adapter

Do not build a separate agent per channel. Keep one core pipeline behind a thin channel-adapter layer. The core retrieves, grounds, cites and refuses. The adapter changes exactly two things.

**The latency budget.** It decides how much extra retrieval is affordable: multi-query and HyDE for email, dense-only search for chat.

**The format of the same grounded answer.** A drafting step reshapes it for email; streaming is a channel decision for chat.

The permission and security layer is identical across every channel, on purpose. The channel is a presentation decision. It is never a permissions decision. Inbound, adapters normalise every channel into one canonical event. Outbound, they format one answer per channel. Translate once at the edge. Keep the core channel-blind.

## Make Escalation Do Five Things

"Refuse cleanly and escalate to a human" is the right policy. It says nothing about the mechanism. In support or ticketing, escalation must be concrete. It has to do five things.

**Create or update a real record.** The case lands in the queue that owns this kind of question. A human will see it there. Returning a message and moving on is not escalation.

**Attach the working context.** Include the original question, whatever was found even if insufficient, and why it was judged insufficient or why access was denied. The human should not start from zero, and the user should not have to repeat themselves.

**Route by cause.** A question denied for permission reasons and a question with no available information belong in different queues. Mixing them floods a security queue with content gaps, or buries real access cases among routine ones.

**Keep the record under the same permission scope.** An internal note explaining why something was denied can itself disclose it to the wrong audience. The escalation record follows the same permission rules as the original question.

**Feed the outcome back into evaluation.** Every escalation is a free, labelled example. Either the system should have answered, which is a real content or capability gap, or it correctly refused, which is evidence the safety behaviour works.

```
   grade → insufficient ──▶ refuse ──▶ ESCALATE
                                          │
             create/update a record · attach context · route by cause
                                          │   ├─ permission-denied → security/owner queue
                                          │   └─ no information    → content-owner queue
                                          ▼
                record inherits the original request's permission scope
                                          ▼
                outcome → evaluation set  (gap to fix | correct refusal)
```

The last step closes a gap most systems have: no loop from live usage back into evaluation. Escalation outcomes are that loop, using a mechanism the product already needs.

> **Warning: the ticket can leak what the answer withheld.** A refusal that carefully hides a restricted document is undone by an escalation note, visible to a wider team, that explains which document was denied. Scope the record exactly like the request.

## Worked Example: One Question, Two Channels

A contractor asks about a vendor contract in live chat; an employee asks the same in an email to the support address. Both requests reach the same core pipeline and the same permission checks.

The chat adapter gives the request a tight latency budget, so retrieval is dense-only and the answer streams. The email adapter allows minutes, so retrieval adds multi-query expansion and the answer goes through a drafting step for a formal reply. The contractor is not allowed to see the contract. The core refuses, and escalation creates a ticket in the security-owner queue. The ticket carries the question and the fact that access was denied, but no content from the contract, and only that queue can read it.

The employee's answer is grounded and cited. Later, the ticket is resolved as a correct refusal. It joins the evaluation set as a labelled example. The two channels felt different to users. The security decision was identical.

---

## Key Takeaways

- Keep one core pipeline; a thin adapter changes only the latency budget and the output format.
- Permissions are identical across channels, because the channel is a presentation choice.
- Escalation must create a real record, attach context, route by cause, inherit the request's permission scope and feed evaluation.
- Every escalation is a free labelled example of either a gap to fix or a correct refusal.

## Check Yourself

1. **What are the only two things a channel adapter may change, and what must it never change?**
   The latency budget and the answer's format. It must never change the permission and security layer.

2. **Why do permission-denied and no-information cases need different queues?**
   They are different problems with different owners. Mixing them floods the security queue with content gaps or hides real access cases.

3. **How does an escalation record become a leak, and what prevents it?**
   A note explaining why access was denied can reveal the restricted material to a wider audience. Giving the record the same permission scope as the original request prevents it.

## References

**Sources:** `04_Multi_Channel_And_HITL_Escalation.md` (FDE Handbook, AgentOps and platform): "Multi-channel delivery", "Human-in-the-loop escalation as a real workflow", Interview lens and Checkpoint. `03-cost-latency-cicd-rigor-and-build-vs-buy.md` (Production and Platform Judgement): §2 streaming as a channel-layer decision.
