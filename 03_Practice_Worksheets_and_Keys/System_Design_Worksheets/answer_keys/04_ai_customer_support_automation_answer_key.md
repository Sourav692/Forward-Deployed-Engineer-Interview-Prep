# AI Customer-Support Automation - Answer Key

Try the worksheet before you read this key. Use it to see how a strong GenAI FDE candidate questions, designs, measures, secures and explains a system as it moves from demo to production.

## Strong discovery questions
- Are we covering chat, email, voice, or some mix? How many contacts arrive each month, and how many at once at peak?
- Which actions can run with no person involved, and which must a human approve before they happen?
- How do customers prove who they are? Do PII, payment data or other fields need more protection than the rest?
- How fresh do policy articles, order status and account data have to be before an answer becomes unsafe?
- When a case moves to a human agent, what must they see, and how quickly must the transfer happen?
- How many languages ship on day one? And what do we do if language detection fails or comes back unsure?
- In the first release, which categories must a person still review because a mistake there has legal, financial or safety consequences?
- Above what refund amount is approval required, and who owns that rule?

## Strong functional requirements
- Core workflow: work out the intent and risk, pull grounded policy and account context, draft a reply, run it past the policy gate, and then resolve it automatically, ask for approval or escalate.
- Route each request by intent and risk first. Retrieval and drafting wait until that is done.
- Ground every draft in context fetched beforehand from the CRM, order and policy sources.
- Refunds, address changes and subscription actions run only through a controlled tool layer that checks authorisation.
- Whenever the automation is unsure, pass the case to a person along with the full conversation and every action taken.
- Keep a record of every retrieval, every decision, every tool call and every override by a person. Any outcome can then be traced back to whoever or whatever produced it.

## Strong non-functional requirements
- Latency: set targets by risk tier. Mine would be p95 under 3s for routine cases, under 8s for ambiguous ones, and under 15s to assemble a safe handoff bundle for high-risk cases.
- Availability: the assumed load here is 2M tickets a month, peaking at 100 QPS. Routing, retrieval and escalation each need to keep taking work even if another one stalls.
- Security: customer text is untrusted, so it travels as message content and never as instructions. Each workflow gets its own narrowly scoped tools.
- Compliance: keep a trail nobody can edit. It records the actor, model version, tool called, fields checked, policy version and any human override.
- Reliability: if a dependency times out or the context is incomplete, fall back to a safe handoff. Never push out an answer anyway.
- Cost: deflection rate on its own tells you little. Judge whether automation pays with `NetValue = V_time_saved − C_model − C_wrong_resolution − C_recontact`.

## Architecture explanation
- Think of this as a pipeline that routes decisions, not as a chatbot. Each stage limits what the stage after it may do.
- The omnichannel gateway turns chat, email, web and voice transcripts into a single conversation envelope. It holds no business state.
- Identity verification runs inline whenever a request could reveal account data or set off an action. It assigns an assurance level.
- The intent and risk router gives each issue one of five tags: money-moving, account-sensitive, safety-sensitive, legal-sensitive or informational.
- Knowledge retrieval fetches approved policy articles, account facts and earlier cases. The response generator then drafts a reply or a proposed tool call, and both count only as recommendations.
- Authorisation is enforced hard at the tool policy gateway. Its checks are deterministic: is the assurance level high enough, is this action permitted, is the refund over the threshold?
- Next, the confidence calibrator chooses a path. It resolves the case itself, asks someone to approve, or sends it to the human-agent queue tagged with reason codes.
- The quality evaluation store tracks which cases were solved, reopened or corrected. This layer is never the system of record. That role belongs to the customer's CRM and billing systems.

## Data model / integration assumptions
- Case(id, customer_id, channel, intent, risk, state); ProposedAction(id, case_id, tool, args_hash, decision); Handoff(case_id, summary, evidence_refs, attempted_actions).
- The automation layer owns only workflow state and the evidence behind its decisions. If the CRM marks an account as locked, no cache is allowed to say otherwise.
- `args_hash` spots requests that are logically the same without keeping the raw sensitive arguments. That is the point where idempotency stops being theoretical.
- Each write boundary takes an idempotency key. A message or action that gets retried returns the existing case instead of opening a duplicate.
- `Case.version` provides optimistic concurrency. If automation and a human agent race on a case, one write fails cleanly and nothing gets overwritten.

## Red-team risks
- a policy answer that is wrong but confident, injected instructions in customer text, identity never verified, outdated account state, a refund paid twice, a handoff with too little context
- Prompt injection and social engineering: customer text, pasted ticket history or attachments try to slip in privileged instructions.
- Over-scoped tools: an assistant that only needs to read order status also holds refund, cancellation and payment-history powers.
- Identity spoofing: once a workflow reaches billing, PII or password resets, "the customer sounds genuine" does not count as authentication.
- Duplicate side effects: the refund goes through but the reply times out. A retry must check the ledger first and must never just run again.
- Thin handoffs: the agent receives no intent, no tool outputs, no policy checks or no sign of what was uncertain, and has to repeat what the machine already did.

## Rollout plan
- Week 0-1: draw the scope line. Out of scope: open-ended negotiation, legal handling without a person, and refunds or cancellations nobody supervises.
- Week 1-2: go live in agent-assist mode only. The model drafts and summarises; a person sends every final reply.
- Week 2-3: before automating anything, show on real traffic that retrieval quality, escalation logic and handoff completeness hold up.
- Week 3-4: automate a small set of intents that are low-risk and reversible, such as order status and subscription FAQ.
- Week 5: turn action tools on class by class, and give each class a separate gate. Order lookup and ticket tagging lead the way.
- Week 6-8: humans keep reviewing a sample of automated and assisted cases. Every intent and every tool has its own kill switch.
- After pilot: widen intent by intent, and only where the safe automation rate holds. If one intent drifts, roll back that intent alone, not the whole system.

## Evaluation plan
I'd set these thresholds for this case. They are not industry standards, so be ready to defend them rather than quote them.

| Metric | What it proves | Strong threshold | Dataset / method |
|---|---|---|---|
| Safe automation rate | Cases closed automatically need no correction and cause no harm | Steady for each intent; a fall triggers rollback | Ticketing system and QA review labels |
| Incorrect-resolution rate | The system is not closing cases wrongly with confidence | No higher than the baseline for that intent | QA review plus ticket reopen events |
| Repeat-contact rate | Issues were fixed, not just pushed to a second contact | Does not climb after an automation change | CRM correlation across tickets |
| First-contact resolution | Automation improved outcomes, not just typing speed | Steady or better after each expansion | CRM plus the ticket timeline |
| CSAT | Customers still trust us as handling speeds up | Does not drop as automation grows | Post-contact survey platform |
| Cost per resolved case | The savings are real and not eaten by rework | Falls while repeat contact stays flat | Finance and support volume reporting |

## Weak answer
I'd pass each message to an LLM, let it write a reply, and close the ticket. That is weak. It takes whatever the model says as fact, touches accounts without checking identity, and leaves nothing between a fluent reply and a real refund.

## Average answer
I'd classify the intent, fetch policy and account context, write a grounded reply, and escalate to a person when confidence is low. I'd log every interaction. That is an improvement, but gaps remain. It never names the actions that need approval or covers a refund that succeeds while the reply times out, and it treats confidence alone as permission to act.

## Strong answer
This isn't a chatbot. It's a pipeline that routes decisions, since the product has to judge when acting is right, when to check first and when to halt. Identity gets verified before any account tool runs. The router tags risk, and retrieval grounds the draft. Whether an action may go ahead is decided by a deterministic gateway for tool policy, never by the model. Model output feeds a controlled workflow; it is never treated as fact. Latency targets follow risk, and when a dependency fails the case falls back to a safe handoff with all its context. I'd start in agent-assist mode, then automate reversible low-risk intents, then add tool classes one by one, with a kill switch for each intent. The goal is lower handling cost without more wrong or harmful resolutions.

## Interviewer scorecard
| Area | 1 - Weak | 3 - Average | 5 - Strong |
|---|---|---|---|
| Problem framing | "Build a support chatbot" | Mentions routing and escalation | A pipeline that routes decisions, clear non-goals, hard constraints kept apart from preferences |
| Requirements | "Answer tickets correctly" | Lists what the system must do | SLOs set by risk tier, constraints you can measure, each requirement traced to a component |
| Architecture | Message goes in, LLM reply comes out | Adds retrieval and escalation | Identity gate, risk router, a deterministic gateway for tool policy, calibrator, store for evaluation |
| Data/integration | Mentions a tickets table | Names the main records | Case, ProposedAction and Handoff, with idempotency keys, args_hash and optimistic concurrency |
| Evaluation | "Measure accuracy" | Tracks deflection plus CSAT | Safe automation rate, wrong resolutions, repeat contacts, what each resolved case costs |
| Safety/security | "The model will refuse" | Adds auth plus logging | Four seams: text treated as untrusted, tools with least privilege, identity checked before tools, an audit nobody can edit |
| Rollout | Automate it all on day one | Pilots a few intents | Agent-assist first, then low-risk intents, tool classes one at a time, a kill switch and rollback per intent |
| Communication | Talks about the model | Clear yet generic | Opens with the harm case, states the failure policy, ends on the first gate |

## Final 2-minute spoken answer
I wouldn't begin with the model. The request sounds like "automate routine support", but this isn't a chatbot that answers everything. It's a routed service that has to decide when to act, when to get approval and when to stop. Say a customer writes in: they were charged twice and want it sorted today. A naive design hands that to a model and closes the ticket. A real design starts sooner. It checks who the person is, works out whether money is involved, decides whether acting on the account is safe, and keeps enough context for a human to step in. So the pipeline runs like this. A gateway normalises the channel. Identity verification sets an assurance level. A router tags the intent and the risk. Retrieval ties the draft to approved policy. After that, a deterministic gateway rules on whether any action is allowed. That gateway is the authorisation boundary, not the model; what the model produces only feeds a controlled workflow, and nobody takes it as fact. Latency targets depend on risk. When billing times out or a policy check fails, a person takes over safely and receives the conversation, the reason and every action already attempted. I'd go live in agent-assist mode only. Next come a few reversible intents, automated. Tool classes follow, added singly, and each one has its own gate and kill switch. Success means handling costs less and incorrect or harmful resolutions do not go up.
