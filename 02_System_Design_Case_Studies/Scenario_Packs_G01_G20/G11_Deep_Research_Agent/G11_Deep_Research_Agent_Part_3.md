# Deep Research Agent at Consumer Scale, part 3

## 14. Answer the Cost-per-Report Pivot in Ten Minutes

The interviewer's pivot after a good design is "each report costs too much." Cost here is search fan-out times synthesis context. The answer is the self-drill card.

| | |
|---|---|
| Dominant driver | Agent steps as search rounds, and long-context synthesis over every source found |
| Cheapest lever first | Cap search rounds; dedupe sources before reading; compress evidence before synthesis; cache finished reports by topic (the deployed research platform already does this) |
| Metric that proves it | Searches per report; cost per report; cache hit rate; tokens into synthesis |
| Do not | Let the agent search until it is satisfied |
| 60-second line | Cost here is search fan-out times synthesis context. Bound the rounds, dedupe, compress, and never research the same topic twice. |

Each lever maps to a part of the design already drawn. The round cap is the hop cap and budget dict from section 8. Deduplication is the evidence ledger from section 4. Compression before synthesis is sub-agent isolation from section 5. The topic cache is the deployed platform's smart lookup from section 11, with its 0.85 and 0.88 thresholds.

The multi-agent mock adds the accounting step that must come first. Split cost per run by agent and by hop, so it is clear whether routing calls, agent calls or retries dominate. Collapse agents whose only job is passing messages along. Route only hard steps to the expensive model. Ship every cut with an eval number showing quality held.

Every strong cost answer follows four verbs in order. Measure, by tracing tokens and dollars by branch first. Route, with the small model for extraction and the reasoning tier for plan and verification. Bound, with caps on rounds, hops and the per-run budget. Cache safely, never serving a private-document answer across users.

---

## Level calibration

The levelling rubric describes what to say, not who the candidate is.

| Level | Sounds like | Missing |
|---|---|---|
| Mid | Correct components, names a framework, describes a working happy path | Numbers, failure design, trade-offs stated as choices |
| Senior | Requirements as numbers, names the control pattern *and the rejected alternative*, walks a degradation ladder, does cost arithmetic | Organisational consequences, migration path, second-order effects |
| Staff | All of the above, plus: what to build first and why, what to deliberately *not* build, how the design changes at 10x, the measurement that would falsify it | Little — at this level differences are about scope of influence |
| Principal | All of the above, framed as a multi-year bet for the organisation: one gateway with a second provider behind an adapter, so a provider outage or price change is a config change; per-user isolation and a deterministic release gate as shared platform rules, the two things the deployed platform lacks. If the grade distribution stays poor, they move investment to the corpus, not the architecture. | The real arrival bursts, service-time distribution and the citation standard a reviewer would accept, which only the customer's own data can settle |

## Key Takeaways

- The first eight minutes set the eight numbers, the oracle and the scope cut, and end with "is that the system?".
- Requirements are testable: ~40K runs/day, p95 under 90s, first signal under 3s, $0.20/run, read-only, per-user isolation.
- State carries a concatenating evidence list and a budget summed across branches, so no parallel result is lost.
- The architecture separates an untrusted web zone from a user-scoped zone, joined only by typed findings.
- Sub-agent isolation is the largest cost lever and also the security boundary.
- The arithmetic is 100 runs/min at peak, ~120 in flight by Little's Law, around 170 provisioned.
- The rendered answer is an exfiltration channel, so an egress firewall on rendering is mandatory.
- Termination uses a done flag, a hop cap, a no-progress check and a per-run budget, each returning partial results.
- Every failed branch degrades to a gap note, and empty is typed apart from unavailable.
- The grade distribution is the falsifying metric, and trajectory evaluation matters more than outcome alone.
- The deployed platform proves the boxes are real, and lacks per-user access control and a release gate.
- The supervisor–worker build fans out N independent queries, with the honest caveat that predictable decomposition should be hardcoded.
- The 45-minute script, the follow-up bank and the rubric decide the level more than the diagram does.
- The cost pivot is answered by capping rounds, deduplicating, compressing and caching by topic.

## Check Yourself

1. **What are the eight numbers, and which one makes an approval subsystem unnecessary here?** Throughput, latency, horizon, accuracy, cost, autonomy, data class, recovery. Autonomy: the agent is read-only.
2. **Why must the evidence list use a concatenating merge?** Parallel branches writing one key under last-write-wins lose all results but one. LangGraph raises `InvalidUpdateError` when the key has no reducer; a hand-rolled merge loses them silently.
3. **Derive the concurrency number.** 40K/day peaked 3x ≈ 100 runs/min; at ~70 s mean time in system, Little's Law gives ~120 in flight; at a 70% utilisation target, provision around 170.
4. **What is the single largest cost lever, and what does it give up?** Sub-agent isolation; it gives up auditability across the boundary unless sub-agent traces are stored and linked.
5. **The agent has no email or webhook tool. Why is the trifecta still live?** The rendered answer is a channel: a Markdown image URL can carry private text out when the client fetches it. Filter rendering.
6. **A hop cap is in place. Why add a no-progress check?** A cap only bounds the burn; the signature check catches an identical rejected retry on hop two instead of hop eight.
7. **What is the strong answer to "what breaks first?"** Search returns empty during an outage, empty is treated as valid, an uncited answer ships; watch citation-free answer rate; type empty apart from unavailable.
8. **Which metric would prove the design wrong?** The grade distribution: if most runs grade poorly even after correction, the corpus is the constraint.
9. **Name two properties the deployed Research Platform lacks.** Per-user access control, and a deterministic release gate.
10. **When is the supervisor's planning call pure overhead?** When the query decomposition is predictable; hardcode it instead.
11. **What is the sixty-second cost answer?** Cost is search fan-out times synthesis context: bound the rounds, dedupe, compress, and never research the same topic twice.

## References

All paths are relative to the repository root.

| Section | Source |
|---|---|
| 1, 2, 3, 4, 6, 7, 9, 10, 13 | `01_Concept_Tutorials/Agentic_System_Design_Book/ch28_system_design_interview.md`, "The Forty-Five Minute Script", "Worked Design One", the follow-up bank, the rubric and recovery moves (the anchor, #10) |
| 5 | `01_Concept_Tutorials/Agentic_System_Design_Book/ch06_orchestration_context_engineering.md`, "Context Rot and Sub-Agent Isolation" |
| 7 | `01_Concept_Tutorials/Agentic_System_Design_Book/ch23_system_design_patterns.md` (Trifecta Guard, Provenance Tagging) and `ch05_tool_use_agent_computer_interface.md` (cross-server data flow) |
| 8, 11, 14 | `01_Concept_Tutorials/FDE_Handbook/07_Multi_Agent_Systems/04_Case_Study_Research_Platform.md` (#12); deployed code under `05_Projects/Enterprise_Multi_Agent_AI_Research_Platform/CODE/` |
| 3, 8, 9, 10, 12, 14 | `01_Concept_Tutorials/RAG_and_Agent_Topic_Guides/07_multi_agent_systems_INTERVIEW_TUTORIAL.md`, sections 1.6, 2, 3 and question 7 (#103) |
| 14 | `CASE_STUDY_INDEX.xlsx`, Drill Add-ons tab, self-drill row for #10 |
| 2 (MoSCoW split), 4 (trust-zone diagrams, component table), 9 (ladder), 10 (metric table), 13 (spoken answer, lines), and every item marked own construction | Built for this page from the sources' arguments; not source material |
| Not included | Chapter 28's "Worked Design Two", the incident response agent, belongs to group G04 and is covered in `G04_SRE_Incident_Response_Agent/G04_SRE_Incident_Response_Agent.md` |

### Fact-check sources (checked 27 Sep 2026)

- [LangGraph docs: INVALID_CONCURRENT_GRAPH_UPDATE](https://docs.langchain.com/oss/python/langgraph/errors/INVALID_CONCURRENT_GRAPH_UPDATE) — parallel writes to a key with no reducer raise an error; silent loss needs a hand-rolled merge
- [Liu et al. 2023, Lost in the Middle](https://arxiv.org/abs/2307.03172) — information in the middle of a long context is used less reliably
- [Chroma Research 2025, Context Rot](https://www.trychroma.com/research/context-rot) — accuracy degrades as input length grows
- [Anthropic Engineering: How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) — multi-agent runs use many more total tokens; isolation does not cut the bill by itself
- [Little 1961, A Proof for the Queuing Formula L = λW](https://pubsonline.informs.org/doi/10.1287/opre.9.3.383) — Little's Law uses mean time in system
- [Claude docs: Models overview](https://platform.claude.com/docs/en/about-claude/models/overview) — current model tiers
- [Claude docs: Pricing](https://platform.claude.com/docs/en/about-claude/pricing) — per-token prices behind the $0.20 run budget
- [Claude docs: Rate limits](https://platform.claude.com/docs/en/api/rate-limits) — provider quotas that can bind at 10x
- [Simon Willison: The lethal trifecta for AI agents (16 June 2025)](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/) — private data plus untrusted content plus an outbound channel
- [MSRC: How Microsoft defends against indirect prompt injection attacks (Jul 2025)](https://www.microsoft.com/en-us/msrc/blog/2025/07/how-microsoft-defends-against-indirect-prompt-injection-attacks) — Markdown image exfiltration; prompt defences reduce rates but are not boundaries
- [OWASP GenAI LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) — prompt injection has no complete prompt-level fix
- [Cemri et al., Why Do Multi-Agent LLM Systems Fail? (arXiv 2503.13657)](https://arxiv.org/abs/2503.13657) — failures spread across design, coordination and verification, not routing alone
- [AWS Bedrock User Guide: Use the ApplyGuardrail API](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-use-independent-api.html) — guardrails can screen input before any model call
- [tensorzero/tensorzero on GitHub](https://github.com/tensorzero/tensorzero) — repository archived on 12 June 2026
- [GroqDocs: Model deprecations](https://console.groq.com/docs/deprecations) — `llama-3.1-8b-instant` retired for free and developer tiers in Aug 2026
- [OpenAI API docs: Deprecations](https://developers.openai.com/api/docs/deprecations) — GPT-4o still offered
- [OpenAI API docs: GPT-4o model page](https://developers.openai.com/api/docs/models/gpt-4o) — GPT-4o still listed
- [microsoft/PyRIT](https://github.com/microsoft/PyRIT) — Crescendo, Skeleton Key and XPIA attacks
- [Reference build: `app/auth.py`](https://github.com/Sourav692/ai-engineering-demystified-14-projects/blob/db71e98600bf98c145b6172968da489e05220352/projects/03_enterprise_realtime_capstones/03_enterprise_multi_agent_research_platform/CODE/app/auth.py) and [`app/cache.py`](https://github.com/Sourav692/ai-engineering-demystified-14-projects/blob/db71e98600bf98c145b6172968da489e05220352/projects/03_enterprise_realtime_capstones/03_enterprise_multi_agent_research_platform/CODE/app/cache.py) — one API key, no tenant model, shared report cache
