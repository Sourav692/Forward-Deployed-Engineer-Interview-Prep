# Enterprise Chatbot Platform - Answer Key

Use this key after you have tried the worksheet. It walks through the questions, design, measures, security and explanation a strong GenAI FDE candidate brings when a demo has to become a production system.

## Strong discovery questions
- Where do the models come from: a commercial API, our own hosting, or a mix split by data classification? One answer means weeks of orchestration work; the other means quarters spent running a GPU fleet.
- Should the first release be plain chat, or grounded in company systems from day one? If grounded, which three systems go first?
- How long do we keep conversations? Who is allowed to read another employee's history, and through which legal process?
- May any employee publish an assistant, or does each one go through a review before it is published?
- Is corporate SSO the only identity source? Do residency rules or works councils limit the usage telemetry we can collect?
- What exactly stops us licensing the enterprise tier from a vendor? Everything about build versus buy turns on that.
- How much traffic goes to consumer AI tools today, measured? Is that number already sitting in the proxy logs?
- How quickly does the free tool on employees' phones show its first token? That is the speed we compete with.

## Strong functional requirements
- Core workflow: an employee asks a question; the platform grounds it only in systems that person may read and streams back a cited answer, all under policy.
- Set identity when the session starts, then check authorisation again on every turn. Login is not a one-time pass.
- Apply the caller's current permissions to retrieval at query time. A chunk the employee could not open must never be used as evidence.
- Allow departments to publish assistants. What an assistant can reach in practice is its own scope intersected with the permissions of whoever is using it.
- Classify each input before it is dispatched and scan the output as it streams. When something is blocked or redacted, record that decision.
- Write each turn to an audit log that can only be appended to. When an administrator reads an employee's conversation, that read is logged too.

## Strong non-functional requirements
- Latency: time-to-first-token is the SLO that drives adoption. I'd hold p95 below 1.0s and keep p99 below 2.0s. Past about a second, people start to feel the wait. Next to the free tool, a four-second spinner would look broken.
- Availability: the case puts daily volume near 576,000 turns. Squeeze them into a ten-hour working day and you get 40 turns per second; the morning rush runs at 2.5x, with roughly 800 streams open at once.
- Security: each isolation layer fails closed. In this system, failing open is the same thing as leaking.
- Compliance: retention is a named policy class that supports legal hold. The audit must cover 100% of the turns we serve.
- Reliability: the message a user typed must never be lost. When the main model is in trouble, fall back to a smaller model and label it, instead of showing an error page.
- Cost: if every turn resends the whole history, each turn's input grows linearly and the conversation's total grows quadratically. So keep the head pinned, summarise the middle, and design a stable, cacheable prefix from the start.

## Architecture explanation
- Before drawing any boxes, state the coherence rule. Identity is set at the session and checked again on each turn. Nothing reaches the context window unless it has passed policy and been audited.
- At the edge, a gateway validates each SSO token and shapes the traffic. Conversation state belongs to the conversation service, which authorises the caller on every turn.
- At the centre of the design sits the context assembler, where permissions, cost, safety and quality all meet. It builds context from the identity of the human asking, and ignores whatever the client claims.
- Retrieval and the connectors fetch candidates already filtered by the caller's current permissions. If the ACL resolver is down, the chunk is dropped; access never widens.
- Inputs pass through policy and DLP classification before anything is dispatched. They scan the streamed output through a sliding window whose overlap is at least as long as the longest pattern. A known pattern split across a boundary therefore still gets caught.
- The model router picks the provider, deployment and model from the data class, cost and health, and data class always beats cost. Provider adapters hide vendor differences and take care of retries.
- The streaming relay keeps long-lived connections open and deals with aborts mid-stream. When a client disconnects, it cancels the upstream stream, so we stop paying for tokens nobody will read, at least on providers that honour cancellation. Some do not.
- The assistant registry controls definitions and scopes. Usage and quota metering counts tokens. An append-only audit pipeline records each turn, admin reads included.

## Data model / integration assumptions
- Conversation(id, workspace_id, owner_id, assistant_id, retention_class, legal_hold); Message(id, conversation_id, parent_id, role, content_ref, citations, token_count, model_id, status); Assistant(id, author_id, instructions, tool_bindings, data_scopes, visibility, version, review_state); Attachment(id, uploader_id, scan_status, extract_ref); AuditEvent(event_id, actor_id, action, resource_ref, decision, reason).
- Messages form a tree rather than a list. `parent_id` is the field that lets a user regenerate an answer or branch the conversation.
- `status` has four values: complete, blocked, failed and partial. A stream that dies at 80% fits none of the first three.
- `retention_class` holds a named policy, not a raw number. Years later, legal can still say which policy applied.
- `scan_status` decides whether an attachment may enter the context window. If the scan fails, we treat the file as untrusted, not just as missing.

## Red-team risks
- assistants with too much scope laundering access, ACLs left stale after a revocation, prompt injection through documents, the head of the prompt truncated without notice, scripted accounts running away with usage
- The permission laundromat: an employee with wide access publishes an assistant to the whole company. Its data scope must therefore be intersected with each viewer's own permissions.
- A revocation happens, but a cached permission lives on. The employee then sees a document they can no longer open, through a stale ACL.
- A document someone uploads, or one retrieval pulls in, contains an indirect prompt injection. It must have no authority over policy or tool calls.
- On a long conversation, a naive drop-from-front strategy cuts off the system prompt. The assistant's behaviour changes and nobody can see why.
- The audit pipeline fails. The turn must fail with it rather than go ahead unrecorded, because the design allows no backfill.

## Rollout plan
- Week 0-1: take a baseline of consumer-AI egress from the proxy logs. Agree governance and adoption as one shared target with two bars.
- Week 1-2: release plain chat first. SSO, quotas, retention classes and audit are all live before grounding exists.
- Week 2-3: ground answers in the first corpus. A contract test over titles and snippets shows that permissions are filtered at query time.
- Week 3-4: keep the gate shut until there are no permission-boundary violations and citation click-through shows people trust the grounding.
- Week 5: open up file attachments. Each one is scanned for malware and has its text extracted, and only a passing scan status lets it into the context.
- Week 6-8: let reviewed assistants be published, and check scope intersection with the viewer on each turn.
- After pilot: add more corpora only as long as egress keeps falling, weekly active use keeps rising and audit completeness holds at 100%.

## Evaluation plan
I picked these thresholds for this case. They are not industry standards, so be ready to justify them rather than recite them.

| Metric | What it proves | Strong threshold | Dataset / method |
|---|---|---|---|
| Consumer-AI egress volume | The risk that paid for the project is really going down | Roughly 80% lower after two quarters | Network proxy logs compared with the baseline taken before launch |
| Weekly active over eligible | Adoption is how safety shows up, not a vanity figure | 50% or more of eligible employees | Product telemetry, split by department |
| Permission-boundary violations | Isolation holds up under real traffic | Zero; a single case is an incident, not a trend to watch | Contract tests and a review of the production audit |
| Audit completeness | Legal can defend every turn | Every turn served, 100%, has a record | Recorded turns as a share of turns served |
| p95 time-to-first-token | The platform feels as quick as the free tool | Below 1.0 second, with p99 below 2.0 | Streaming telemetry captured at the relay |
| Policy block rate with false-positive rate | Safety controls are not pushing people back to consumer tools | Always read together, never one alone | Block logs plus a sample checked by humans |

## Weak answer
I'd stand up a React frontend over a vector database and an LLM gateway, and staff could then talk to company data. It falls short because it describes a product but not why the product exists. The shadow-AI egress, the reason the budget exists, goes unmentioned. It also never filters retrieval by what the employee asking is allowed to see.

## Average answer
I'd put a commercial model behind SSO with a chat UI on top, retrieve from internal documents through a permission filter, log every conversation and apply retention policies. That is better, but gaps remain. It authorises only when the session starts, not on each turn. Shared assistants get no rule for intersecting scopes. And it treats adoption as optional, when adoption is in fact the safety outcome.

## Strong answer
I'd set the goal as moving AI use off consumer tools nobody governs and onto a platform we do govern, while keeping the usefulness that drew people to those tools. That creates two bars that pull against each other. Data leaves our boundary only under an agreement we control. And time-to-first-token stays near what employees already get for free. My coherence rule: identity is fixed at the session and checked again each turn, and nothing reaches the context window unless policy passed it and audit recorded it. Permissions always come from the human asking. An assistant can reach only the overlap of its own scope and the viewer's. Each layer fails closed, since failing open here means a leak. I'd call it a success when shadow-AI traffic is displaced and weekly active use climbs.

## Interviewer scorecard
| Area | 1 - Weak | 3 - Average | 5 - Strong |
|---|---|---|---|
| Problem framing | "Build a ChatGPT clone" | Mentions governance and internal data | Egress risk is the driver; governance and adoption form one joint target that can be tested |
| Requirements | Lists chat features | Adds SSO and retention | Firm exclusions, TTFT as the SLO for adoption, quotas used as control points |
| Architecture | A UI, a vector DB and an LLM | Retrieval with a permission filter | States the coherence rule first; assembler at the centre; router, relay, audit, registry |
| Data/integration | Mentions chat history | Names conversations and messages | Messages as a tree, named retention class, attachments gated by scan, append-only audit of admin reads |
| Evaluation | "People like it" | Measures usage and latency | Egress displaced, weekly active, no boundary violations, block and false-positive read as a pair |
| Safety/security | "It is behind SSO" | Adds ACL filtering | Seven layers that each fail closed; scope intersection; output scanned with an overlapping window |
| Rollout | Everyone, all 40,000, on day one | Pilots, then expands | Grounding, attachments, then assistants; each phase adds one risk class and passes a measured gate |
| Communication | Purely technical | Clear, but generic | Tells the board, the department and on-call their stories from one set of telemetry |

## Final 2-minute spoken answer
I wouldn't open with the model. On paper, 40,000 employees want "build us our own ChatGPT". The real driver, though, is the egress report: company data is already being pasted into consumer AI tools by 6,400 staff. So the business goal is to bring that usage onto a platform we govern, without losing what made the consumer tools appealing. That sets two bars, and they pull against each other. Data leaves our boundary only under an agreement we control. And the first token has to arrive about as fast as it does on the free app in their pocket. It also hands us a rare thing, a success metric whose baseline we already measure. My proposed target: within two quarters, measured consumer-AI egress falls by 80% and weekly active use reaches 50%. Locking everything down won't get us there, and neither will shipping without governance. For the architecture, I'd state the coherence rule before any diagram. Identity is set at the session and checked again on each turn. Nothing enters the context window unless it has passed policy and been written to the audit. The context assembler sits at the centre, where permissions, cost, safety and quality meet. Permissions always come from the human asking. A published assistant can therefore reach only the overlap of its own scope and the viewer's, and that stops one privileged person laundering their access to everyone. Retrieval resolves ACLs at query time. If the resolver is down, the chunk is dropped. Every layer fails closed, because here failing open means leaking. The order of release is general chat, grounding, attachments and finally assistants, so each phase brings in just one new class of risk.
