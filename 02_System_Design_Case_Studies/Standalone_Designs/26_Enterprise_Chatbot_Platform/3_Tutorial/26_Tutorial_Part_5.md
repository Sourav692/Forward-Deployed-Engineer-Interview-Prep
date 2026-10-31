# Enterprise Chatbot Platform: "Our Own ChatGPT", part 5

## Coverage Notes

We scored this design once against our decomposition rubric of 20 items in 4 phases. Below is that review in short form. The only verdict we revised is Item 19.

**Phase 1: Problem Framing & Discovery**
- **Item 1 (Reframe the feature as a business outcome):** Covered in full. Section 1 separates the feature from the result: remove the hidden egress risk and raise productivity.
- **Item 2 (Map stakeholders and personas):** Covered in full. Section 1 has a table of five stakeholders, each with the job they need done.
- **Item 3 (Ask questions that move the architecture):** Covered in full. See the six discovery questions in Section 1 and the deep-dive table in Section 2.
- **Item 4 (Split and rank requirements):** Covered in full. Section 2 sorts the functional requirements into must, should and could.
- **Item 5 (Fence the scope with non-goals):** Covered in full. Section 2 lists five things the MVP leaves out.

**Phase 2: Estimation & Architecture**
- **Item 6 (Rough scale and capacity sums):** Covered in full. Section 3 sets out the load shape, shows where 800 concurrent streams comes from, and works capacity back from it.
- **Item 7 (Unit cost and what drives it):** Covered in full. Section 3 gives the $C_{user}$ equation and shows how resending history makes cost grow quadratically.
- **Item 8 (Architecture and data flow, end to end):** Covered in full. Section 4 orders the build by dependency and draws both the architecture and the sequence.
- **Item 9 (Records and endpoint contracts):** Covered in full. Section 5 defines five records and four endpoints.
- **Item 10 (Build or buy; choosing a vendor and a model):** Covered in full. Discovery question 6 in Section 1 raises it, a deep-dive row in Section 2 develops it, and trade-off #1 in Section 8 settles it. This scenario is our main worked example of build-versus-buy.

**Phase 3: Trade-offs, Security & Reliability**
- **Item 11 (Named trade-offs with a fair verdict):** Covered in full. Section 8 weighs five pairs.
- **Item 12 (Threat model and security controls):** Covered in full. Section 6 has the isolation-layers table and explains why the threat model here is unusual.
- **Item 13 (Drills for failure and reliability):** Covered in full. Section 6 walks through four named cases: the permission laundromat, hidden instructions, stale revocation and a provider outage.
- **Item 14 (How we test it):** Covered in full. Sections 5 and 6 describe a contract test for the permission filter, failure injection in the middle of a stream, and three tests that prove the boundaries hold.

**Phase 4: Delivery, Governance & Communication**
- **Item 15 (Metrics and observability in layers):** Covered in full. Section 7 has the metrics table and frames them for three audiences.
- **Item 16 (Phased rollout, risks and rollback gates):** Covered in full. Section 7 sets out a rollout in four phases and a risk register.
- **Item 17 (Depth on regulation and governance):** Partly covered. eDiscovery, legal hold, retention and consulting the works council all sit at the centre of the design. What we do not work through is how specific frameworks apply: the GDPR lawful basis for monitoring staff, FINRA supervision rules, or what a DPA clause must say.
- **Item 18 (Responsible AI and risks past the obvious failure):** Partly covered. We go deep on injection and safety filtering. Bias in an assistant that employees use is only hinted at in the eval-set discussion; one example is career advice that differs in quality from group to group. Two more risks sit under the same heading and are not addressed: weaker service for a global staff who do not all work in one language, and poor screen-reader behaviour while a response streams.
- **Item 19 (Change management and adoption story):** Covered in full. The phased rollout and the three-audiences framing in Section 7 speak to change management directly. So does the argument in Section 1 that adoption is itself a safety outcome.
- **Item 20 (Communication plan and a rubric to score yourself):** Covered in full. Section 8 gives a pacing plan for 50 minutes and a scoring rubric.

**Two gaps remain:** regulation and governance depth (Item 17), and Responsible AI covering bias, language and accessibility (Item 18). Our view on closing each follows.

### My Perspective on the Gaps

- **Item 17: How deep to go on regulation and governance.**
  - Almost all the regulation that bites here concerns *watching employees*. Most of our other designs face customer-data rules instead. Expect three kinds of rule to come up. First, GDPR or the local equivalent on monitoring staff. Second, the duty to consult a works council, which the risk register already lists as the row most candidates leave out. Third, sector rules such as FINRA or SEC supervision, where some staff are regulated and their messages must be kept and open to review.
  - Add no new layer. Map each concern to a part of the design that already exists. Monitoring chats needs a lawful basis. The evidence for it lives in two fields on `Conversation`, `retention_class` and `legal_hold`, plus the audit entry written whenever an admin opens a chat. That is the proof a regulator or works council wants: whose eyes can reach a staff member's chat, and does each look leave a trace? Data residency is handled by the model router, which already routes restricted data classes by classification and region.
  - One thing is missing: a written map of the model provider's own sub-processors. A commercial API vendor may pass data on to sub-processors of its own. The platform therefore needs a data-flow diagram naming every party that could see prompt text, even under a zero-retention agreement. When GC asks in Section 1 for proof that prompts never end up training an outside party's model, this diagram is the answer.
  - In the interview, claim no framework depth you lack. Name the works-council consultation out loud, since it is the row in our risk register that stands out most. Then tie GDPR-style monitoring worries to the audit on every admin read that the design already has. Regulation then reads as part of the design, not a bolt-on.

- **Item 18: Bias, language coverage and accessibility.**
  - Here the sharper Responsible AI risk is bias in a tool that hands out internal advice at scale, more than general fairness. Picture "Ask Finance", or an assistant for career guidance, giving answers of steadily different quality or tone by department or seniority. It could also differ by demographic signal picked up from names or writing style in the prompt. That is a governance problem particular to an internal tool with 40,000 users, who may trust it more readily than they would trust a search engine.
  - Extend what exists. Section 6 uses an eval set and canaries to catch injection; reuse it to check demographic parity, slicing the sampled groundedness and thumbs-down rate. In practice, break the existing quality metrics down by department and by a rough language or locale signal. No separate fairness pipeline is needed.
  - Next, language and accessibility. The permission-filtered retrieval and the output scanning were designed for English text, and Section 6's tests prove them only on English. A global rollout must re-run those contract tests on content in other languages. Scanners for DLP or classification that learned on English text may catch too much elsewhere, or miss things. Accessibility is in better shape. The streaming relay already sends typed events (token/citation/route_change/blocked/done), so assistive technology has a clean signal to announce each change of state. The gap here is in testing and QA, not in the architecture.
  - In the interview, link this to the adoption case the platform was built on. If the governed tool serves staff who work in other languages, or who rely on assistive technology, less well than everyone else, those people drift back to unapproved tools. That recreates the shadow-IT risk the whole project was funded to remove, only for a smaller group.

## Key Takeaways

- The result owed is AI use moved off consumer tools (a ChatGPT clone is only the feature), so hold two bars at once: nothing leaves without an agreement we control, and time to first token near what the free tools give.
- Measure success with consumer-AI egress already in the proxy logs, aiming for an 80% cut within two quarters while weekly active use reaches 50%.
- Raise build vs. buy before you are asked; the honest answer is a hybrid that buys the model and builds orchestration, connectors and governance.
- Size on open streams, not request rate: 40 turns a second held for 20 seconds is 800 concurrent connections, and that figure sets the relay tier and the load balancer limits.
- At about 5.8M tokens a minute at peak, the provider's TPM quota binds first, and that limit lives in a contract, not a cluster.
- Resending full history makes input grow quadratically, so keep a sliding window with a pinned head and put stable content in a cacheable prefix from day one.
- Re-authorise the conversation on every turn, because people share and revoke access between turns.
- Derive retrieval permissions from the person asking: an assistant's effective scope is its scope intersected with the viewer's live permissions, so a scope caps access and never grants it.
- Treat index ACLs as a cheap pre-filter only; the check that decides runs against live permissions and drops any chunk it cannot resolve.
- Scan streamed output in sliding windows of 256 with an overlap of 64, so a secret split across a boundary cannot slip through and the answer still streams.
- A stream that opens with `200` and stops at token 300 has failed, so the SLI counts `done` events and every path, complete, blocked or failed, finalises the turn, records usage and writes audit.
- If the audit write fails the turn fails too, because this platform exists to be defensible.
- Assume injection sometimes succeeds and make it worthless: untrusted content has no authority, the MVP has no write tools, and permission filtering caps the prize.
- When the provider fails, trip a breaker and move to a secondary or smaller model with a label, because an error page sends staff back to the consumer tool.
- Roll out in four phases that each add one class of risk, gated on measurements such as zero permission-boundary violations, and read the DLP block rate together with its false-positive rate.

## Level calibration

For an internal "own ChatGPT" serving 40,000 employees, the levels separate on whether permissions and adoption are the design or features bolted onto chat.

| Level | Sounds like | Missing |
|---|---|---|
| Senior | "SSO, streaming chat, permission-filtered retrieval with citations, and a model router behind provider adapters. I size on concurrent streams, 40 turns a second times a 20-second stream is 800 connections, and compact history with a pinned head." | Per-turn re-authorisation, the assistant-scope intersection, and what happens when an ACL lookup or an audit write fails. |
| Staff | "Identity is set at the session and re-checked every turn, an assistant's effective scope is its scope intersected with the viewer's live permissions, and every layer fails closed. Rollout adds one risk class per phase, gated on zero boundary violations, and the DLP false-positive rate has an owner." | Whether to build at all, which data classes need self-hosting, and the legal and works-council commitments. |
| Principal | "First ask what rules out buying a vendor's enterprise tier; the likely answer is hybrid: buy the model, build orchestration, connectors and governance, and self-host only the data classes that require it. Success is consumer-AI egress down with weekly active use up, and the works council is consulted before the beta, not after." | Whether building beats a vendor seat on cost needs measured cost per active user from the beta, not the estimate. |

## Sources (checked 27 Sep 2026)

- [Microsoft 365 Copilot enterprise pricing](https://www.microsoft.com/en-us/microsoft-365-copilot/pricing/enterprise): $30/user/month list price, paid yearly, on top of a Microsoft 365 licence
- [Works Constitution Act (BetrVG), English translation](https://www.gesetze-im-internet.de/englisch_betrvg/englisch_betrvg.html): section 87(1) no. 6: works-council co-determination over technical devices that monitor employee behaviour or performance
- [Works Councils Act (WOR), article 27](https://wetten.overheid.nl/BWBR0002747/): Dutch works-council consent right over systems that can monitor staff attendance, behaviour or performance
- [Dutch Data Protection Authority: works council and privacy booklet](https://www.autoriteitpersoonsgegevens.nl/uploads/imported/ap_or_privacy-boekje.pdf): the regulator's guide to that consent right
- [AWS: Application Load Balancer attributes](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/edit-load-balancer-attributes.html): default connection idle timeout is 60 seconds
- [nginx: ngx_http_proxy_module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html): `proxy_read_timeout` defaults to 60 s, measured between reads
- [The Idempotency-Key HTTP Header Field (IETF draft -07)](https://www.ietf.org/archive/id/draft-ietf-httpapi-idempotency-key-header-07.html): `409` for a request still in flight, `422` for a reused key with a different body
- [Claude prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching): caching works on a stable prompt prefix
- [Azure OpenAI quotas and limits](https://learn.microsoft.com/en-us/azure/foundry/openai/quotas-limits): provider capacity is set as tokens-per-minute and requests-per-minute quotas
- [FINRA Rule 3110](https://www.finra.org/rules-guidance/rulebooks/finra-rules/3110): supervision and review of correspondence and internal communications
- [SEC Rule 17a-4](https://www.law.cornell.edu/cfr/text/17/240.17a-4): broker-dealers must keep business communications for three years
