# Real-Time Call Assistant for Sales and Service Calls

*A suggestion has to land while the customer is still talking, and a CRM record has to be right long after the call ends.*

A call assistant is a workflow-timing problem before it is a model problem. The same call needs a three-second answer during the conversation and a careful, reviewed record after it. This group has one question-bank prompt and one latency drill and no worked design, so most of this page is built here. It consolidates the group's prompts into one read for the day before.

| Case in the group | What it contributes here |
|---|---|
| #59 OpenAI Q15 AI Assistant for Sales or Customer-Service Calls (anchor) | The eleven-part decomposition and the evaluation follow-up, used in sections 1 to 3, 7 to 9 and 11 |
| #43 Real-time sales assistant, sub-3-second response (playbook drill, Case 6) | The before, during and after split in sections 1, 4 and 5; the whole of section 14 |
| Realtime Voice AI Agent with RAG (reference implementation) | The streaming voice pipeline and its under-2-second figure, in sections 4 and 6 |
| Sales Copilot pack | The account snapshot, the CRM permission mirror and the preview-then-approve write, in sections 5 and 9 |

**Most of this page is own construction.** The prompt gives a component list and an evaluation list. The drill gives the shape and the metrics. The design connecting them, the latency budget and every diagram were built for this page and are marked *(own construction)*.

---

## 1. Split the Call Into Before, During and After Before Drawing Anything

The prompt sounds like one system: "A company wants to transcribe calls, summarise them, extract actions, and update its CRM." It is really three systems with three clocks. A sub-3-second answer cannot wait on work that takes ten seconds. So the first move is to sort every task by when its answer is needed.

The drill's framing settles it: "a sub-3s target is a **workflow design** problem, not only a model choice." Before the call there are hours, so precompute the account context. During the call there are three seconds, so send a small prompt to a fast model and stream the suggestion. After the call there are minutes, so summarise, extract actions and propose the CRM update asynchronously.

Ask the drill's five questions first. They come verbatim from Case 6. The answers are the assumptions this page designs against *(own construction)*.

| Question | Assumed answer | What it decides |
|---|---|---|
| What must complete within 3 seconds? | Only the live suggestion: a short answer or talking point for the rep | Everything else leaves the hot path |
| Can data be precomputed before calls? | Yes; calls are scheduled or matched to an account at dial time | An account snapshot replaces live CRM lookups |
| Is streaming acceptable? | Yes; the rep reads bullets as they arrive | First-bullet latency is the metric |
| Which facts must be current? | Price, stock and open-case status; the rest can be hours old | A tiny allowlist of live lookups, each with a timeout |
| What happens on timeout? | No suggestion; never a late or half-checked one | The failure mode is silence |

Add three questions the prompt implies. Which languages and call types are in scope? Is there consent to record in every jurisdiction? Who reviews a CRM change before it lands?

The weak answer is the drill's own: "large model with a live CRM lookup on each request". It misses the budget on the first question and pays for a large model on every utterance. The strong answer is the drill's line: "precompute account context, keep the prompt small, mid/small model for suggestions, stream quick bullets, run enrichment asynchronously, fall back gracefully." Say that shape in the first two minutes.

> *"This is three systems on three clocks. Hours before the call, I precompute the account context. Inside the three seconds, a small prompt goes to a fast model and streams. After the call, summaries, actions and the CRM update run asynchronously and a human approves the write."*

## 2. State Requirements as Testable Constraints

"Real-time" is a preference. "First suggestion bullet visible within 3 seconds of the customer finishing a question, at p95" is a constraint. Only the constraint decides the architecture. Split the functional list by priority so the launch gate is the smallest set that still keeps the promise *(the split is own construction; the items are #59's)*.

**Must-haves.** Audio ingestion from the telephony or meeting platform. Speaker diarization, so the transcript knows rep from customer. Streaming transcription. PII redaction before anything is stored or sent to a model. Post-call summary and action-item extraction. CRM update proposals with confidence scoring. Human correction before the write.

**Should-haves.** Live suggestions during the call, the #43 capability. Evaluation by call type and language. Retention policy enforced by the platform, not by habit.

**Later.** Coaching analytics across calls. Automatic follow-up email drafts, which reuse the Sales Copilot case’s approved-claims rule.

Ordering live suggestions after the post-call summary is deliberate *(own construction)*. The summary and the CRM proposal deliver value with no latency risk, and they build the evaluation set the live path later needs.

| Constraint | Stated so it can be tested *(own construction unless quoted)* |
|---|---|
| Live latency | First suggestion bullet within 3 s of end-of-utterance at p95; timeout rate reported separately |
| Post-call latency | Summary and CRM proposal ready within a few minutes of hang-up, before the rep's next call |
| Transcript quality | Word error rate and diarization error tracked per language and call type |
| Summary quality | Rubric score, action-item precision and recall, factual consistency, required-field coverage (section 11) |
| CRM correctness | CRM update accuracy measured against the rep's corrections; zero writes without approval |
| Privacy | PII redacted before storage and before any model call; zero unredacted PII in logs |
| Consent and retention | No recording without recorded consent; audio and transcripts deleted on the policy schedule |
| Permissions | A rep's suggestions draw only on accounts and fields that rep may see in the CRM |
| Cost | Cost per call tracked; the large model never runs per utterance |

The latency budget is the constraint most likely to be probed. Say it as arithmetic *(own construction; the allocations are assumptions to measure, not vendor figures)*. The clock starts when the customer stops speaking and stops when the first bullet is readable.

| Stage | Budget | Why it fits |
|---|---|---|
| End-of-utterance detection (voice activity) | ~300 ms | An aggressive silence threshold chosen for this budget (OpenAI's server VAD defaults to 500 ms); longer feels laggy, shorter cuts people off |
| Final transcript segment from streaming ASR | ~300 ms | Streaming ASR has partials already; only the tail is new |
| Trigger check: is this a question worth answering? | ~100 ms | A small classifier or rules, not the main model |
| Context assembly from the precomputed snapshot | ~100 ms | A cache read, no CRM call |
| Playbook retrieval (optional, cached index) | ~150 ms | Pre-filtered to the account's segment |
| Small model to first token | ~400 ms | Short prompt, warm connection |
| First bullet streamed and rendered | ~500 ms | Bullets are short by template |
| Network and UI | ~150 ms | Persistent connection to the rep's client |
| **Total** | **~2.0 s** | Leaves about 1 s of headroom under 3 s |

The headroom is not slack. It covers the one allowlisted live lookup, such as current price, which runs in parallel with the model call and is dropped when it misses its timeout. The Realtime Voice AI Agent reference implementation targets the same class of loop, voice in to voice out, "with <2 second response latency"; it is a stated goal, not a measurement, but it shows 2 seconds is a normal design target. That project also has to speak the answer, which this one does not.

Every must-have then needs an owner in the architecture *(own construction)*.

| Requirement | Primary component(s) |
|---|---|
| Audio ingestion | Telephony connector, media gateway |
| Diarization and transcription | Streaming ASR with diarization; channel separation where the platform gives it |
| PII redaction | Redaction service on the transcript stream, before storage and before the model |
| Live suggestions | Trigger detector, snapshot cache, suggestion model, suggestion stream |
| Summary and action items | Post-call worker, larger model, structured output schema |
| CRM update with confidence | CRM proposer, confidence scorer, review queue, tool gateway |
| Human correction | Review UI; corrections logged as evaluation data |
| Retention | Retention scheduler, deletion jobs, audit log |
| Evaluation by call type and language | Eval store sliced by call type and language |

## 3. Map the Audio, the Account and Who May Hear Them

Every input to this system is someone's personal data. Audio carries voices and spoken card numbers. Transcripts carry names and complaints. The CRM carries deal values the rep's peers may not see. Map each input with its sensitivity and its permission before drawing boxes *(own construction)*.

| Input | When it is read | Sensitivity | Permission it carries |
|---|---|---|---|
| Raw call audio | During the call, streamed | Highest; voices, spoken PII, payment details | Consent to record, per jurisdiction |
| Live transcript | During and after | High until redacted | Same as the call; redacted before storage |
| Account snapshot | Built before, read during | Internal; deal values, history | The rep's CRM visibility: owner, territory, role, field mask |
| Playbook and approved answers | During | Internal, versioned | Organisation-wide; segment-scoped |
| Live facts: price, stock, case status | During, allowlisted | Operational | Read-only, per-field timeout |
| Summary, actions, CRM proposal | After | High; derived from the transcript | The rep and their approver |

Two rules follow. Redact before anything leaves the transcript stream, because a model call and a log line are both copies. And build the snapshot as the rep, with the rep's CRM visibility, exactly as section 5 of the Sales Copilot case does. A suggestion that quotes a deal value from a peer's territory is a leak, however helpful it sounded.
