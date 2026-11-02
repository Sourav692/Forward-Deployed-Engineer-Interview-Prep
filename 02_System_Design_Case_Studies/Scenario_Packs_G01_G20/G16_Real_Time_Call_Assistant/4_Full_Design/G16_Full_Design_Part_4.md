# Real-Time Call Assistant for Sales and Service Calls, part 4

## 14. Answer the Sub-3-Second Pivot in Ten Minutes

This group's pivot is the sub-3-second sales drill. The prompt: "sales team wants real-time answer suggestions during calls, sub-3s target." It is the live lane of this design, asked on its own.

| | |
|---|---|
| Ask | What must complete within 3 seconds? Can data be precomputed before calls? Is streaming acceptable? Which facts must be current? What happens on timeout? |
| Dominant driver | Synchronous live CRM lookup plus a large model inside the 3-second window |
| Cheapest lever first | Precompute account context before the call; small prompt with a fast model streamed during; enrichment and CRM update async after |
| Metric that proves it | First-token latency; total latency; precompute hit rate; user accept rate; timeout rate |
| Do not | Large model with a live CRM lookup per request |
| 60-second line | Sub-3 seconds is a workflow design problem, not a model choice. Split before, during and after the call. |

The source's architecture line: "before call → precompute context. During call → small prompt → fast model → streamed suggestion. After call → async summary + CRM update." Its recommendation: "separate real-time suggestions from slower enrichment."

<!-- spelling: source -->
Two latency drivers have no cost analogue, and the cram sheet names this case as their home. Both are the actual cause behind the "executive demo is too slow" scenario and the "sub-3-second sales assistant" case. Cold starts make the first request after idle slow. The fix is minimum replicas, warmers and keep-alive, and the price is idle capacity. Sequential workflow design makes each step wait for the previous one for no reason. The fix is to parallelise independent calls, prefetch and push non-critical work async. The source sets one limit: "Do **not** parallelize unsafe side effects". In this design, the live lookup runs beside the model call, and the CRM write never runs in the live lane.

One addition from beyond the playbook fits here. "Streaming works but users abandon mid-answer" is answered by measuring abandonment against first-token time and by cancelling the stream on abandon. In a call, the rep "abandons" by answering. So cancel the suggestion stream when the rep starts speaking; with providers that stop generating on cancel, that stops paying for tokens nobody will read *(own construction, applying the additions file's rule)*.

Every strong cost answer comes from four verbs in order. Measure: trace latency by stage first. Route: send the live lane to a small model and the post-call lane to a larger one. Bound: timeouts on every live lookup, a cap on bullet length, triggers that suppress small talk. Cache safely: the snapshot keyed on account and permission signature, invalidated on a role change.

---

## Level calibration

Every level can put a bullet on the rep's panel; the level shows in how cleanly the three clocks are split and who owns consent, redaction and the CRM record.

| Level | Sounds like | Missing |
|---|---|---|
| Senior | Three lanes on three clocks: a snapshot built as the rep before the call, a small prompt to a fast model streaming bullets inside the ~2.0 s budget, and a larger model after hang-up. Silence on timeout, and the rep approves every CRM write. | Consent per region, where redaction sits, retention, and how to score a summary with no single right answer. |
| Staff | Adds the boundaries and the evidence: consent before recording, redaction on the stream before storage or any model, deletion that alerts on failure, and summaries scored by action-item precision and recall per call type and language. Launches post-call first so rep corrections build the golden set. | Who sets per-region consent and retention policy, and when a field earns auto-apply. |
| Principal | Treats the snapshot, the permission mirror and preview-then-approve as patterns shared with the G05 sales copilot, not one-off parts. Plans the path from review-only proposals to narrow auto-apply on fields with proven accuracy, and the order in which languages and call types join. | Real stage latencies under real accents, networks and model load; the budget is a planning assumption that only the customer's own calls can confirm. |

## Key Takeaways

- The call is three systems on three clocks: hours before, three seconds during, minutes after.
- Requirements are stated so a test can fail them, with the 3-second budget decomposed by stage and about a second of headroom.
- Every input is personal data, so each carries a sensitivity and a permission, and the snapshot is built as the rep.
- One diagram shows three lanes that share the snapshot and transcript store and nothing else, with privacy and action boundaries marked.
- Precomputing the account snapshot removes the CRM from the three-second lane.
- The live lane streams transcription, triggers only on answerable questions, and sends a small prompt to a small model.
- Diarization keeps speakers straight, redaction runs on the stream before storage, and a scheduler enforces retention.
- The post-call lane uses a larger model and a fixed schema in which every item cites its transcript span.
- The assistant proposes CRM changes with confidence scores, and a person approves every write.
- Consent, redaction and the CRM write fail closed; everything else degrades, and the live lane degrades to silence.
- Summaries are evaluated by purpose, with action-item precision and recall the sharpest measure, sliced by call type and language.
- Rollout starts post-call, where there is no latency risk, and adds live suggestions once the evaluation set exists.
- The hour goes to the three clocks, the budget, redaction and the evaluation question.
- The sub-3-second pivot is answered by the split: precompute before, small and streamed during, async after.

## Check Yourself

1. **Why is the live CRM lookup the first thing to remove from the three-second lane?** Its latency is outside the design's control and its tail is worse than its median; a precomputed snapshot replaces it with a cache read.
2. **Say the latency budget.** About 300 ms end-of-utterance, 300 ms final transcript, 100 ms trigger, 100 ms snapshot, 150 ms retrieval, 400 ms to first token, 500 ms first bullet, 150 ms network and UI: about 2 s, with about 1 s of headroom.
3. **What does the headroom pay for?** One allowlisted live lookup, such as current price, run in parallel with the model under a timeout.
4. **Why show nothing on timeout?** A suggestion after the rep has answered is noise at best and a contradiction in front of the customer at worst.
5. **Where does redaction sit, and why there?** On the transcript stream before storage and before any model call, because a stored transcript and a model call are both copies.
6. **How do you evaluate a summary with no single correct answer?** Score what it is for: action-item precision and recall, factual consistency, field coverage, CRM accuracy, edit distance and downstream completion, sliced by call type and language.
7. **Why is an invented action item worse than a missed one?** It turns into a promise nobody made, recorded in the CRM.
8. **Why launch post-call summaries before live suggestions?** They carry no latency risk, and the rep's corrections build the golden set the live lane needs.
9. **What is the sixty-second answer to the sub-3-second drill?** Sub-3 seconds is a workflow design problem, not a model choice. Split before, during and after the call.

## References

All paths are relative to the repository root unless they start with `05_Projects/`.

| Section | Source |
|---|---|
| 1, 2, 3, 7, 8, 9, 11 | Problem decomposition question bank (this repo), the sales or customer-service calls prompt: the decomposition list and the evaluation follow-up |
| 1, 4, 5, 11, 14 | `01_Concept_Tutorials/Cost_and_Latency_Optimization/CRAM_SHEET_S15_S16.md`, §16 Case 6 and the §4 pattern table |
| 14 | `CASE_STUDY_INDEX.xlsx`, Drill Add-ons tab, the sub-3-second drill |
| 6, 13, 14 | `01_Concept_Tutorials/Cost_and_Latency_Optimization/CRAM_SHEET_FULL_PLAYBOOK.md`, §10 Streaming and UX, and the decision table |
| 14 | `01_Concept_Tutorials/Cost_and_Latency_Optimization/CORE_8_DRIVERS_MEMORIZE.md`, the two latency-only add-ons |
| 14 | `01_Concept_Tutorials/Cost_and_Latency_Optimization/ADDITIONS_BEYOND_PLAYBOOK.md`, "Streaming works but users abandon mid-answer" |
| 2, 4, 6 | `05_Projects/Realtime_Voice_AI_Agent_with_RAG/Docs/PROJECT_REPORT.md`: the voice pipeline, "<2 second response latency" (a stated aim), Silero VAD, Deepgram (the report says Nova-2; the code runs Pipecat's default, Nova-3) |
| 3, 5, 9 | `02_System_Design_Case_Studies/Scenario_Packs_G01_G20/G05_Sales_Copilot/4_Full_Design/G05_Full_Design.md`, sections 5, 6 and 8: the snapshot, the CRM permission mirror, preview-then-approve |
| 2 (budget), 4 (diagrams, component table), 10, 12, 13, and every item marked own construction | Built for this page from the sources' arguments; not source material |

### Fact-check sources (checked 27 Sep 2026)

- [OpenAI API: Voice activity detection](https://developers.openai.com/api/docs/guides/realtime-vad): server VAD silence threshold and the cost of short values
- [OpenAI API reference: Realtime client events](https://developers.openai.com/api/reference/resources/realtime/client-events): silence_duration_ms defaults to 500 ms
- [AssemblyAI: Introducing Universal-Streaming](https://www.assemblyai.com/blog/introducing-universal-streaming): ~300 ms streaming transcripts (vendor-reported)
- [Artificial Analysis LLM leaderboard](https://artificialanalysis.ai/leaderboards/models): ~0.4 s time to first token is at the fast end of hosted APIs
- [Realtime Voice AI Agent project report (reference implementation)](https://github.com/Sourav692/ai-engineering-demystified-14-projects/blob/db71e98600bf98c145b6172968da489e05220352/projects/03_enterprise_realtime_capstones/05_realtime_voice_ai_agent_with_rag/Docs/PROJECT_REPORT.md): "<2 second response latency" is a stated aim, not a measurement
- [18 U.S.C. 2511(2)(d)](https://www.law.cornell.edu/uscode/text/18/2511): US federal one-party consent to record
- [California Penal Code 632](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PEN&sectionNum=632): all-party consent in some states
- [Deepgram docs: Models overview](https://developers.deepgram.com/docs/models-languages-overview): Nova-3, Nova-2 and Flux (recommended for voice agents)
- [pipecat-ai 0.0.100 on PyPI](https://pypi.org/project/pipecat-ai/0.0.100/): DeepgramSTTService defaults to nova-3-general
- [Twilio docs: Recordings resource](https://www.twilio.com/docs/voice/api/recording): dual-channel recording puts each party on its own channel
- [PCI SSC FAQ 1210: Are audio/voice recordings permitted to contain SAD?](https://www.pcisecuritystandards.org/faq/articles/Frequently_Asked_Question/are-audio-voice-recordings-permitted-to-contain-sensitive-authentication-data/): card security codes cannot stay in recordings after authorisation, even encrypted
- [PCI SSC: Protecting Telephone-based Payment Card Data](https://listings.pcisecuritystandards.org/documents/protecting_telephone-based_payment_card_data.pdf): pausing or masking recording while card details are read out
- [OWASP GenAI LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/): spoken or written input can still steer the model
- [OWASP GenAI LLM06:2025 Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/): human approval before writes is the real control
- [Ng & Abrecht 2015, Better Summarization Evaluation with Word Embeddings for ROUGE (arXiv 1508.06034)](https://arxiv.org/abs/1508.06034): word-overlap scores penalise paraphrase
- [Kryscinski et al. 2019, Neural Text Summarization: A Critical Evaluation (arXiv 1908.08960)](https://arxiv.org/abs/1908.08960): ROUGE correlates weakly with human judgement
- [OpenRouter help: Which providers stop billing when a stream is cancelled](https://openrouter.zendesk.com/hc/en-us/articles/51691588409883-How-do-I-cancel-a-streaming-request-and-which-providers-stop-billing-when-I-do): cancelling a stream stops billing only on some providers
