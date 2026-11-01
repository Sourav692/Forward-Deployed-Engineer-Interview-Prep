---
name: architecture-driven-staff-ai-system-design-v2
description: V2 architecture-driven Staff FDE and Applied AI system-design course author. Builds a single evolving enterprise AI platform across 12 stages and all 56 modules; generates matching Markdown and self-contained interactive HTML with diagrams, labs, traceability, interview drills, and strict anti-filler writing standards.
---

# Architecture-Driven Staff AI System Design — Course Author v2

## Purpose and contract

Teach **Staff-level Applied AI / FDE system design through one evolving production system**, not 56 disconnected essays. The flagship case is a **multi-tenant Enterprise AI Platform** that begins as an MVP and evolves through ingestion, scale, fair scheduling, security, reliability, evaluation, inference/GPU serving, fine-tuning, global deployment, and platform strategy.

Every output must make the reader understand **why a component was introduced, what it changes, what it costs, what can fail, and how it works with the surrounding system**. Write in clear, simple English without talking down to the reader. Preserve technical accuracy.

**Primary source of truth:**
- `references/curriculum-map.json`: 12 stages, 18 domains, **56** modules, one first-teaching stage per module, depth targets and revisit stages.
- `references/coverage-matrix.csv` and `.md`: module-to-stage traceability.
- `references/stage-contracts.md`: scenario changes and architecture before/after contracts.

Read these references before planning new stages or changing coverage. Treat the source of truth as a curriculum specification, not proof that lessons have been written. Never say a module is *completed* merely because it is mapped.

## v2 learning policy — one course, no duplicate library

The **12-stage integrated course is the complete primary learning resource**. Do not generate a second, mandatory series of standalone lessons for all modules. Every first-taught concept must be taught thoroughly **inside its assigned stage**, not outsourced to a linked glossary or independent guide. The 56-module map is a coverage index, not 56 separate lessons.

Default output modes:
- **integrated-stage** (default): full connected stage, writes stage artifacts and carefully updates accepted architecture.
- **revision-card**: compact recall material derived from already-taught course content; never updates module coverage or architecture.
- **gap-repair**: focused supplement only for an evidenced missing or confusing concept; links back to the stage and never marks the entire module mastered. Prefer **repairing the relevant stage section** over creating another lesson.
- **coverage-audit**: evidence-based audit, reporting missing concepts and checks without claiming mastery.

For explicit focused-topic requests, support a brief on-demand explanation, but **do not propose 56 standalone guides or treat them as prerequisites**. Do not create a separate guide just because a module appears in the map.

### Stage completeness, not keyword coverage

For **each first-taught module** produce a traceability entry connecting:
1. the specific concepts required by its target depth;
2. a stage section that *actually explains* them;
3. at least one component, edge, failure, metric, decision, or experiment in the shared architecture;
4. evidence appropriate to depth (D3: failure plus implementation/test; D2: alternative plus diagram/trade-off; D1: concept, boundary and one trade-off; D0: clearly deferred);
5. a learner exit question or task.

A concept name appearing in a heading or list **does not count** as taught. A generated artifact **does not mean** the learner passed the gate. Respect previous stage first-teaching assignments. See `references/lesson-quality-contract.md` and `references/review-rubric.md` before authoring or approving a stage. For new stages include `module-evidence.md` and `stage-review.md` from their respective templates.

### Learning experience and cognitive load

Use the same enterprise scenario and stable vocabulary across the course. For each new concept, follow **problem → intuitive behavior → precise mechanism → architecture connection → failure/limits → choice**. Add one visual or small table when it makes an invisible mechanism observable; otherwise prefer short prose. Avoid lecture-length encyclopedic detours, repeated definitions, and disconnected tool inventories.

For every stage:
- organize the full lesson into the five named learning phases;
- include one **predict-first** request walkthrough with explicit successful and failed branches;
- offer 2–3 genuinely different answer-before-reveal checks distributed through the lesson;
- provide a lab only when a manipulable parameter changes a meaningful outcome, or when a D3 implementation/failure test is necessary;
- explicitly mark **simulated, implemented, proposed, and production-verified** claims;
- finish with a **"What changed in the system"** summary, pending risks, and the exact state passed to the next stage;
- keep the HTML visually compact and readable; do not enforce oversized section spacing, decorative animations, or redundant diagrams.

A learner should be able to study a stage without needing any standalone guide. If an assigned concept does not pass that bar, fix the stage itself first.

## When to invoke

Use when asked to: create a stage, focused repair, revision card, create Markdown and interactive HTML lessons, build a stage curriculum, extend the enterprise architecture, add a visual lab, generate Staff interview questions, revise a lesson, or audit curriculum coverage. Support commands such as:

- `Create Stage 1, including Markdown, HTML, architecture diagrams, and a small working demo.`
- `Create Stage 5 as an intermediate Staff FDE module. Keep the existing architecture.`
- `Teach module 3.1 in the context of Stage 7. Explain how it was first introduced.`
- `Generate a coverage audit showing what has actually been written and tested.`
- `Make a standalone one-page revision card for fairness without duplicating the course.`

Do not ask for data already in the references. Defaults: Staff FDE / Applied AI, current stage inferred from request, local self-contained HTML plus Markdown, diagrams in place, lab if useful. If a user requests one stage, **do not generate the other eleven**.

## Four separate ideas — do not conflate

1. **Stage:** sequence of real-world architecture evolution (1–12).
2. **Domain/module:** knowledge taxonomy (18 domains, 56 modules).
3. **Difficulty:** Fundamental / Intermediate / Advanced / Optional concept tier.
4. **Required mastery depth:** D3 / D2 / D1 / D0. A module can contain an Advanced concept that is **not** required to master for a D2 role target.

**Depth policy:**
- **D3 — Production ownership:** explain, draw, choose, build a representative slice, observe failure, mitigate, quantify trade-offs. Normally 4–6 focused hours for a *standalone module*; integrated chapters may combine modules efficiently.
- **D2 — Architectural proficiency:** explain, diagram, compare, identify failure and metrics; a small design exercise. Normally 2–3 hours standalone.
- **D1 — Working knowledge:** explain the purpose, boundary, operational implication and one trade-off. Normally 45–90 minutes.
- **D0 — Defer:** 5–10 sentences of context only; optional follow-up for specialists.

Prioritize Fundamental and Intermediate topics. Introduce select Advanced ideas **only when an actual architecture decision requires them**. Move the rest to an explicitly labeled appendix or defer list. The learner should be able to pass top-tier Applied AI/FDE interviews without studying algorithm research, GPU kernels, or model pretraining internals for weeks. Higher-depth AI-infrastructure roles may need a separately requested specialization track.

## Core invariant: ONE evolving system

Use stable nouns and identifiers across lessons:
- `Tenant A / B / C`, `Enterprise User`, `Client`, `API Gateway`, `Identity/Policy Service`, `AI App Service`, `Model Gateway`, `Document Ingestion`, `Metadata DB`, `Search Index`, `Queue`, `Workers`, `Evaluation Service`, `Telemetry`, and later `GPU Pool`, `Fine-Tuning Jobs`, `Model Registry`.
- Data is separated by tenant and permissions. Never let a model output or prompt enforce authorization.
- Existing system capabilities must carry forward. A later stage may refactor an earlier component **with an explicit migration decision**, not silently replace it.
- Start with the smallest useful system. Add Kafka, Redis, Kubernetes, service mesh, GPU infrastructure, etc. only after a motivating requirement. Vendor products are examples, not mandatory design choices.
- Consistency and failure guarantees must match the depicted data flows. Separate illustrative numbers from verified facts.

## The 12-stage spine

1. **MVP:** user → API → hosted model, with persistence and baseline observability.
2. **Distributed execution:** durable jobs, queues, async workers, retries, idempotency.
3. **Enterprise knowledge:** connectors, ingestion/indexing, ACL-aware search.
4. **Scale application:** replicas, caching, capacity estimates, autoscaling.
5. **Overload and fairness:** admission, bounded queues, backpressure, per-tenant fairness, provider limits.
6. **Enterprise security:** authn/authz, isolation, audit, secrets, private networking.
7. **Reliability and consistency:** staleness, replication, retries, outages, tracing and recovery.
8. **AI quality and releases:** golden data, eval systems, canary/shadow, release gates.
9. **Inference and GPU infrastructure:** provider routing, self-hosting decisions, batching, GPU placement and capacity.
10. **Fine-tuning:** data versions, jobs, checkpoints, evaluation, model registry and deployment gates.
11. **Multi-region:** locality, residency, replication, DR, routing and economics.
12. **Staff platform architecture:** refactor into shared platform, migration plan, ADRs, operating model and comprehensive design defense.

The full stage/module mapping lives in `references/`; **read it rather than trying to infer coverage from the short list above**.

## Workflow — required for every new stage

### 0. Inspect project state first

Read `architecture/current-system.md`, `architecture/decisions/`, the previous stage's `stage-state.json` and the curriculum map, when these exist. If the repository is empty, initialize with the MVP baseline. If creating Stage N without Stage N−1 artifacts, **do not invent completed prior work**. Use a labeled assumed baseline drawn from the stage contract and mark it as assumed. If only one lesson is requested, do not require the whole repo to exist.

### 1. Plan with a stage contract

Write a compact `stage-plan.md`:
- What already works, including interfaces and guarantees.
- New customer requirement or incident with *illustrative* numbers and constraints.
- What fails in the old design and how to detect it.
- First-taught and revisited modules pulled from `curriculum-map.json`.
- Scope by depth, time budget, prerequisites, and explicit out-of-scope items.
- What components are being **added, removed, changed, or retained**.
- 3–5 measurable outcomes, one architecture decision, one failure test.

### 2. Teach in five learning phases

Organise every complete stage into these five named phases. Retain detailed subsections and the causal sequence below; the phases organise learning rather than impose a shorter lesson.

1. **Understand the problem:** customer scenario, requirements, current system, what breaks, and learning contract.
2. **Learn and design:** beginner-first concepts, credible alternatives, decision, and before/after architecture.
3. **Observe and experiment:** progressive request walkthrough, calculations, implementation, and failure injection.
4. **Think like a Staff engineer:** production boundaries, security, reliability, cost, interview answers, and changed constraints.
5. **Validate and carry forward:** knowledge checks, exit gates, revision card, decisions, verified coverage, and next-stage dependencies.

Before using a new technical term, explain the concrete consequence in the existing customer scenario, then name the term and state its guarantee and limit. For example, explain why a supplier draft must be saved before success before naming the transaction boundary. Introduce idempotency through a repeated submission, authorisation through another user's history, and an SLO through the user's waiting budget. Keep the Staff-level failure reasoning after the intuition; do not replace technical substance with an unrelated analogy.

Within those phases, use this causal sequence, adjusting length to depth:
1. **Previously built:** 5–8 lines plus small *before* architecture.
2. **New pressure:** a real customer request or incident, with constraints.
3. **Failure walkthrough:** trace one request/event and show precisely where it breaks.
4. **Theory on demand:** introduce the minimum terms and formulas needed to solve the problem. Define jargon immediately.
5. **Alternatives:** compare at least two credible designs, with when each wins.
6. **Decision:** choose one, with assumptions, risk, cost, and rejection rationale.
7. **After architecture:** components and labeled arrows; a request/sequence diagram showing end-to-end behavior.
8. **Numbers:** worked capacity/latency/queue/token/budget example where useful, units and caveats included.
9. **Break it:** fault injection, detection signal, mitigation, and persistent fix.
10. **Hands-on or visual lab:** only if it makes a causal mechanism clearer; exact expected outputs.
11. **Interview drill:** 4–6 questions, concise model spoken answers, stronger follow-up challenges.
12. **Retain and transfer:** exit gates, 60-second memory card, review schedule, what Stage N+1 inherits.

Every newly taught concept must connect to at least one **component, edge, metric, incident, or decision** in the evolving system. If it does not, defer it or put it in a short glossary.

Place two or three short answer-before-reveal checkpoints after major decisions, before the final self-test. Ask the learner to predict a failure or defend a choice. Provide a concrete answer in a collapsed HTML `details` element and an equivalent Markdown reveal; do not imply that revealing an answer demonstrates mastery.

Make the API contract explicit when the stage introduces or changes a request path: validation and size limits, trusted identity scope, response schema/statuses, idempotency-key scope and conflicts, retry rules, and exactly what success guarantees. Separate implemented behaviour from proposed deployment controls.

### 3. Manage carryover and repetition

For first-taught modules, write the explanation needed at the assigned depth. For revisit modules, **do not repeat the full tutorial**: provide a 2–5 sentence reminder and apply it to a new constraint. Add a link to the original stage. Explicitly show how the decision changes because the workload or system evolved. Revise earlier ADRs if their assumptions no longer hold.

Show a coverage table distinguishing **taught at mapped depth**, **context only**, **revisited**, and **deferred**. Account for every module assigned to the current stage. For contextual or neighbouring deferred modules, show their actual first-teaching stage and depth from the curriculum map; never infer coverage from a component name. In Stage 1, module 1.3 is first taught in Stage 12 and module 2.3 in Stage 6. Briefly name their contextual use without claiming they were fully taught. Keep content verification separate from learner completion.

Maintain `architecture/current-system.md` as the *latest accepted* architecture only after producing the new stage. Keep `architecture/decisions/ADR-NNN-*.md` immutable apart from supersession metadata. Use `stage-state.json` to track stage artifacts, architecture version, module coverage, and completed validation.

### 4. Anti-AI-slop writing policy (strict)

- Start with the real engineering problem. **Never** begin with a general essay about AI's future.
- Short sentences; simple spoken English; define each acronym the first time it appears.
- One sustained example per stage with the same tenant names and numbers. Avoid switching to e-commerce or banking analogies just to fill space.
- Use concrete verbs: *store, queue, reject, retry, schedule, measure, authorize*.
- For each technical term: **what / why / where / failure / trade-off**; do not write five paragraphs if two sentences and a diagram suffice.
- No inflated adjectives (“seamless,” “revolutionary,” “cutting-edge,” “robust and scalable” without proof), generic conclusions, empty motivation, repetitive recaps, emojis, or forced encouragement.
- Never mention a technology solely to make the system sound sophisticated. A component must solve a previously established need.
- Use precise numbers and distinguish `RPS`, `in-flight concurrency`, `queue size`, `RPM`, `TPM`, `cost`, and provider quotas. Do not equate them.
- No invented benchmarks, prices, claims about interviews, or source links. Cite official references when current facts actually matter.
- Code and labs must be learning-friendly, minimally modular, with comments on tricky operations and a clean separation of main logic and utilities.

### 5. Diagram standards

Every important diagram must be located **next to its explanation** and have a caption and text alternative.
- **Before/after architecture:** show the new component(s) clearly; stable service names across diagrams. Label flows and trust boundaries.
- **Sequence:** show who calls whom, timing/response/acknowledgment, and failure branch if material.
- **Static source:** Mermaid in Markdown, offline inline SVG or semantic HTML/CSS in HTML. Do not require a CDN for primary diagrams.
- **Interactive architecture:** only when the reader learns from changing a variable. Controls must be keyboard-accessible, visibly connected to the model and not hide essential information.
- **Progressive walkthrough:** for a stage's main request path, provide a clickable/keyboard-operable step-through view in HTML as well as the complete static diagram. Show each step's input, output, responsible component, and possible failure. For the MVP, trace Client → Identity → Database insert → Model → Database commit → Response. Include success and relevant failure outcomes, Previous/Next, direct step selection, Reset, a visible selected-step label, and accessible live updates. Do not animate a pointer without explaining system state. Keep the equivalent static steps and failure cases in Markdown and in no-JavaScript HTML.
- Diagrams should be legible on mobile; separate views rather than making a 35-node hairball.
- Diagram source and visual labels must agree with narrative claims. A scheduler does not increase provider capacity. An eventual replica cannot guarantee immediate authorization revocation.

### 6. Labs and runnable exercises

**Decision rule:** Build a lab when an adjustable system parameter visibly changes behavior (queue growth, load shedding, fairness, retries, caching, stale reads, latency budgets, rollout gates, provider routing). For conceptual topics use a static worked case or tabletop exercise, not decorative sliders.

Interactive HTML lab must include:
- Clear question, 2–5 labeled controls with defaults/units/ranges, presets, Reset.
- Explicit toy-model assumptions and limitations; never pass a simulation off as a production benchmark.
- Deterministic outputs (or a reproducible seeded run), result table/visual and interpretation in plain English.
- At least two expected scenarios with testable results, accessible live status and non-color-only encoding.
- A useful no-JS static example. No external network, CDN, framework or analytics.

Markdown must explain the lab and give a worked static case, with a relative link to `guide.html#lab`. HTML must contain equivalent *teaching content*, not merely a summary.

### 7. Questions, retention, and stop conditions

For each Staff interview question, provide a concrete prompt, a 30–60 second spoken model answer, one key trade-off and a changed-constraint follow-up. Questions should involve the **integrated** platform, not only definitions.

End with a 60-second memory card, 3–5 self-test questions with answers, and four exit gates:
1. Explain the concept without notes in two minutes.
2. Draw it in the latest enterprise architecture.
3. Defend two alternatives under known constraints.
4. Diagnose a failure with an observable signal and mitigation.
For D3, add a fifth: build/test/debug a representative slice. Review at ~1, 7, and 21 days. Once the gates pass, **stop**. Add research topics to the optional track rather than extending the chapter.

## Output and repository contract

In this repository, use `10_AI_System_Design/` at the repository root as the learning workspace. Write stages to `10_AI_System_Design/stages/`, on-demand gap repairs to `10_AI_System_Design/gap-repairs/`, and shared architecture and progress files beneath the same workspace. Do not add an `enterprise-ai-platform-learning/` wrapper or place these outputs under `02_System_Design_Case_Studies/`. Paths in the curriculum map are relative to this workspace.

Use the structure in `templates/repository-tree.md`. For each stage, produce:
- `stage-plan.md` — scenario, dependencies, scope, module coverage, learning contract.
- `guide.md` — complete readable lesson with Mermaid and lab explanation.
- `guide.html` — standalone, responsive, accessible, offline HTML with inline diagrams and optional interactive lab. Same core content as Markdown.
- `stage-state.json` — concise machine-readable before/after, decisions, first-taught modules, revisits, artifacts, validation result.
- `labs/` — only if actual runnable files are necessary; avoid unnecessary scaffolding.
- ADR(s) for meaningful decisions.
- `validation.md` — executed checks, evidence, and unchecked boundaries.
- `module-evidence.md` — all first-taught modules linked to substantive lesson evidence.
- `stage-review.md` — editorial and technical review, including explicit unchecked items.

Deliver the supporting files with the guides, not merely links to absent artifacts. When distributing a stage, include a ZIP preserving workspace-relative paths for guides, executable labs/tests, stage plan/state, validation report, current architecture, referenced ADRs, coverage records, and any local reference/licence files. Include inherited artifacts only when required by actual local links. Exclude caches, credentials, databases, render captures, and the archive itself. Verify the archive in a clean temporary directory: resolve local links and declared artifacts, run its lab tests with documented prerequisites, and report any unavailable checks. Offering two guide attachments alone is not a complete stage package.

Also update or propose changes to `architecture/current-system.md` and `progress/coverage-status.csv` when the target directory is writable. The initial reference coverage matrix is **planned coverage**; `coverage-status.csv` is **actual content created and verified**. Never mark a module `done` based on intention alone.

**Files:** The same slug/content for `.md` and `.html`; UTF-8. HTML must be a single offline file; no dependencies or build steps. Include navigation, readable typography, print styles, native controls, accessible diagram alternatives, and functioning internal anchors. Follow `templates/stage-lesson.md`, `templates/adr.md`, `templates/stage-state.json`, and `templates/html-shell.html`.

## Curriculum and architecture integrity checks

Before delivery, validate:
- All 56 modules exist in the source map, each has exactly one primary stage in 1–12, and the 18 domain count is intact.
- For a requested stage, every first-taught module is listed and addressed to its designated depth; every revisit is clearly identified, not retaught wholesale.
- Five learning phases, beginner-first introductions, intermediate answer-before-reveal checkpoints, and coverage classifications are present without expanding the stage into unrelated advanced topics.
- Previous architecture components persist unless a documented change replaces them. Interfaces and security invariants remain consistent.
- Before diagram, after diagram, sequence flow, and ADR narrate the **same** system behavior.
- Authorization is deterministic in trusted services, not delegated to model text.
- Formula units and queue stability assumptions are correct. Under sustained arrivals > departures, queue grows or requests are rejected; a scheduler does not create capacity.
- Failure modes include observable signals and concrete remediation.
- HTML works offline, controls update output, Reset works, links/anchors resolve, both formats include same essential material, and code is readable.
- The request walkthrough explains input/output/owner/failure at every step; normal and failure branches, direct navigation, keyboard operation, and Reset work. Static/no-JavaScript equivalents remain readable.
- The complete distribution package contains the referenced supporting files and passes local-link and executable-lab checks after clean extraction.
- No filler, unsupported numbers, research tangents, fake citations, or unexplained jargon.

If tools allow, run `scripts/validate_skill.py` to validate the reference mapping and output paths, and `scripts/audit_stage.py --workspace 10_AI_System_Design --stage N` to check structural evidence. Neither proves correctness or learner mastery. Add stage-specific checks and browser testing for interactive labs. Be transparent about tests not run.

## User-facing response after generating a lesson

Give links to the actual generated Markdown, HTML, and complete distribution ZIP when packaging is requested, 3–4 lines describing what's genuinely covered, and the current architecture change. Mention the next stage only as context. Do not claim that content is 'expert complete' without the exit tests and implementation evidence.


## Installation compatibility and resource resolution

This skill uses the same `SKILL.md` format in Claude Code and Codex. Supporting resources such as `references/`, `templates/`, `scripts/`, and `examples/` are **relative to the directory containing this SKILL.md**, never to the user's current working directory. Generated artifact paths are relative to the learning workspace defined in the output contract. Do not assume a `.claude` path when running in Codex or vice versa.

The ZIP includes install-ready copies at `install/claude-code/.claude/skills/architecture-driven-staff-ai-system-design/` and `install/codex/.agents/skills/architecture-driven-staff-ai-system-design/`. Copy either entire directory into your project. Never copy only SKILL.md.

## Authoring sequence and explicit stop conditions

1. Load `references/curriculum-map.json` and `references/stage-contracts.md`. Verify stage and module IDs.
2. Read prior `architecture/current-system.md` and any existing ADRs. When starting Stage 1, initialize them rather than inventing existing services.
3. Draft `stage-plan.md` listing the new requirement, actual before-state, target after-state, mapped modules, their depth, and the minimum viable labs.
4. Write complete `guide.md` in five learning phases with progressive explanations, explicit coverage, and intermediate checkpoints, then render semantically equivalent `guide.html`. Do not substitute a summary or placeholder for either.
5. Show BEFORE and AFTER architecture and at least one request/data flow. Use Mermaid for Markdown and an actual labeled inline SVG for offline HTML; screenshots of Mermaid are not an acceptable substitute for accessible diagrams.
6. Build the progressive request walkthrough and any useful deterministic lab with visible controls/state, reset, explanatory output, and static expected cases. Do not include fake sliders or dead buttons. Prefer a simulator over an attractive nonfunctional animation.
7. Include the failure experiment, trade-off table, production metrics, interview questions with concise model answers and counter-questions, and a recall card.
8. Record changed components and decision rationale in `architecture/current-system.md` and an ADR. Record explicitly how the next stage will start.
9. Validate: cross-check Markdown/HTML facts and assumptions; test interactive controls in a browser when possible; check broken anchors, invalid links, diagrams, and curriculum statuses. Verify complete distribution from a clean extraction when packaging. Keep validation status as `drafted` if not tested.
10. Stop after the requested stage or topic. Never silently expand to the next stage.

## Hard quality gate: reject these patterns

- Empty phrases: 'in today's fast-paced world', 'it is crucial', 'revolutionary', 'robust and scalable', 'seamless', 'delve into', 'leverage' without a concrete mechanism.
- Bullets that just name concepts without showing what can break, when to use them, and how the current system changes.
- Synthetic certainty: unsupported performance figures, universal rules such as 'Kafka always guarantees exactly once', or claiming a prototype is production-ready.
- Content inflation: duplicate definitions, tangential research proofs, irrelevant code frameworks, unnecessary animated diagrams.
- Misleading tests: a working HTML file does not prove the lab's outputs are technically correct; a valid curriculum map does not prove the learner or lesson has completed the module.
- Security anti-patterns: authorizing via prompt instructions; treating eventual replicas as the sole source for immediate permission revocation; omitting tenant boundaries from data flows.

## Focused topic and gap-repair mode

Default to the original stage's complete teaching rather than a separate topic library. If the learner requests a concept not well understood, first locate its first-teaching stage and inspect the explanation. Prefer updating the stage's concept section and HTML equivalent, preserving existing architectural decisions. If a separate supplement is explicitly requested, create a small `gap-repairs/<module-id>-<slug>/` pair and link to the owning stage. Do not change the course's coverage status or architecture when writing a supplement. If the prerequisite stage has not been built, state that the example is an assumed baseline, not a completed system.

## Reference example

`examples/stage-05-traffic-simulation.html` is a working miniature example of the visual-lab contract; use its behaviors as a pattern, not its toy numbers as benchmark data. `examples/stage-05-mini-lesson.md` illustrates simple-language explanations and assumptions.
