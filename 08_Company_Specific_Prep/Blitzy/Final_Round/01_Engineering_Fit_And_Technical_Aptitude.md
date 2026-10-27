# Engineering Fit and Technical Aptitude: Final Round

The panel is likely testing whether your technical judgement holds up in a real customer environment. They do not need a catalogue of tools. They need to hear how you make a safe, useful decision when the information is incomplete.

## Existing Material: Essential Reading Path

Use a 20-minute skim, followed by 15 minutes of spoken practice. These sources explain the mechanisms behind the short answers below.

| Source | Read selectively | Apply in this round |
| --- | --- | --- |
| [Brownfield Integration and Testing](https://github.com/Sourav692/Forward-Deployed-Engineer-Interview-Prep/blob/main/08_Company_Specific_Prep/Blitzy/06_Brownfield_Integration_And_Testing.md) | Sections 2–3 and 6–7: discovery, integration choices, rollout gates, and tests | Defend an integration choice and explain how you would validate a change |
| [Incident Triage and Customer Communication](https://github.com/Sourav692/Forward-Deployed-Engineer-Interview-Prep/blob/main/08_Company_Specific_Prep/Blitzy/04_Incident_Triage_And_Customer_Comms.md) | Opening, triage sequence, and customer updates | Explain containment, baseline comparison, diagnosis, and communication |
| [End-to-End FDE Interview Execution](https://github.com/Sourav692/Forward-Deployed-Engineer-Interview-Prep/blob/main/07_Last_Day_Revision/module-18-end-to-end-fde-interview-execution.md) | The discovery-to-operation sequence | Keep a technical answer connected to the customer outcome and operating owner |

For targeted gaps, use [Code Review Bug Drills](https://github.com/Sourav692/Forward-Deployed-Engineer-Interview-Prep/blob/main/08_Company_Specific_Prep/Blitzy/01_Code_Review_Bug_Drills.md) for debugging, [Scaling and Graceful Degradation](https://github.com/Sourav692/Forward-Deployed-Engineer-Interview-Prep/blob/main/08_Company_Specific_Prep/Blitzy/08_Scaling_Spikes_And_Graceful_Degradation.md) for load and failure handling, and [Enterprise SDLC and Cross-Functional Delivery](https://github.com/Sourav692/Forward-Deployed-Engineer-Interview-Prep/blob/main/08_Company_Specific_Prep/Blitzy/07_Enterprise_SDLC_Agile_CrossFunctional.md) for release ownership.

For deeper architecture practice, choose one case: [G09 Enterprise Coding Assistant](https://github.com/Sourav692/Forward-Deployed-Engineer-Interview-Prep/blob/main/02_System_Design_Case_Studies/Scenario_Packs_G01_G20/G09_Enterprise_Coding_Assistant/1_Interview_Guide/G09_Interview_Guide.md), [G13 Evaluation and Release Gating](https://github.com/Sourav692/Forward-Deployed-Engineer-Interview-Prep/blob/main/02_System_Design_Case_Studies/Scenario_Packs_G01_G20/G13_Evaluation_And_Release_Gating/1_Interview_Guide/G13_Interview_Guide.md), or [G14 Observability and Production Diagnosis](https://github.com/Sourav692/Forward-Deployed-Engineer-Interview-Prep/blob/main/02_System_Design_Case_Studies/Scenario_Packs_G01_G20/G14_Observability_And_Production_Diagnosis/1_Interview_Guide/G14_Interview_Guide.md). Explain which assumptions would change in the customer's environment. These are practice designs, not evidence of your own delivery.

## Real Experience: A Five-Minute Walkthrough

Lead with one project you actually built or operated. Spend one minute on the outcome and constraints, two on your design and rejected alternative, one on validation and results, and one on what changed after deployment. Keep the other two projects ready for follow-ups; do not splice their results into the lead story.

| Project to lead with | Five-minute spine | Claim boundary |
| --- | --- | --- |
| **Life insurer multi-agent system** | A business question took days through a BI queue. Discovery with users and compliance exposed different access rules by role, document type, and market. The first design put twenty-plus tools behind one agent; traces showed wrong tool selection as context grew. Explain your move to a LangGraph supervisor with four specialists, a clarification gate for low-confidence intent, governed assets, and per-node traces. Close with the bounded launch and days-to-minutes time-to-insight. | Separate the shipped supervisor from the later Deep Agent evolution. Describe adoption as a signal, not a controlled causal result. Use the anonymised [insurer stories](https://github.com/Sourav692/Forward-Deployed-Engineer-Interview-Prep/blob/main/04_Behavioral_and_Leadership/story_bank.md) to rehearse the decision and your role. |
| **Enterprise RAG platform** | The same question can have different permitted answers for different users. Walk through tenant isolation, a fast permission filter before retrieval, an authoritative check against fresh permissions before generation, and a deny-by-default release gate. Explain why the simpler single-filter design could leak after a grant changes. The small reference build passed its 22-document golden set with zero leaks; testing also exposed a false alarm, an unexercised rule, and a flaky model-judged gate. | This is a reference build, not a customer deployment or evidence of retrieval quality at enterprise scale. Say that the small corpus supports the security test and design exercise, not a large-corpus performance claim. See the [RAG build story](https://github.com/Sourav692/Forward-Deployed-Engineer-Interview-Prep/blob/main/01_Concept_Tutorials/FDE_Handbook/11_Telling_The_Story/stories/STAR_Stories_Technical_Build_Projects.html). |
| **Insurance customer-support agent** | Use this if you can show the real request path: customer intent, policy or case lookup, permission check, proposed answer or action, human handoff, and the failure you found in testing. Name what you personally built, the alternative you rejected, the evidence you collected, and the operating owner. | Add only verified details from your own project notes. Do not borrow the insurer multi-agent outcome or the RAG reference-build test numbers for this agent. |

Be ready for these follow-ups:

- Which component did you personally implement or debug?
- Walk through a request or data flow and identify the first likely failure point.
- What evidence changed your initial hypothesis or design?
- What broke, and how did you isolate the cause?
- Where is access checked, and what happens if a permission changes after indexing?
- Which actions need a human decision, and who owns that handoff?
- Which result was measured, and what remained uncertain?

Use the evidence inventory in section 4 to capture your answers. The hypothetical prompts below practise your reasoning; the project walkthrough demonstrates your experience.

## 1. A 90-second opening

> "I start with the outcome and the constraint, not the technology. I clarify who is affected, what success looks like, what cannot break, and who owns the surrounding systems. Then I make the smallest safe path visible: an interface, a baseline, a validation plan, and a rollback. I communicate the trade-offs early, especially when speed, risk, and customer adoption pull in different directions. Once it is live, I stay with the metric and the handover rather than calling the work done at merge."

Make this yours. Replace generic words with one real example only if you can defend every detail.

## 2. The reasoning sequence

When given a technical problem, talk through it in this order.

| Move | What to say | Why it matters at Blitzy |
| --- | --- | --- |
| Frame the outcome | "What business or engineering result changes if this works?" | Prevents an impressive demo with no useful adoption |
| Establish the baseline | "What is the current failure rate, lead time, review effort, or manual work?" | A pilot needs a before-and-after comparison |
| Discover constraints | "Which repositories, environments, controls, data classes, and change windows matter?" | Customer systems set the real boundary |
| Trace the actual path | "Show one real request from input through tools or retrieval to an answer or action. Where can it fail?" | Traces exposed the insurer's wrong-tool problem; the path also reveals stale permissions and unsafe writes |
| Reduce the first bet | "What is the smallest high-value, reversible scope?" | A bounded module proves the workflow without a big-bang cutover |
| Design evidence | "What would make us trust this output: compile, tests, static analysis, review, a held-out set, or parallel-run comparison?" | Choose gates for the actual failure mode; wrong tool choice and permission leaks need different tests from generated code |
| Plan the rollback | "How do we stop or reverse this without harming customers?" | Reversibility creates room to move quickly |
| Define ownership | "Who signs each gate and who operates it after handover?" | The FDE must build customer ownership, not dependency |

## 3. Questions to rehearse

### "How would you start a customer engagement where the problem is vague?"

Say the outcome first, then the discovery plan.

> "I would not start with a solution. In the first conversations I would identify the business owner, the user affected, the measurable outcome, and the systems and controls around it. I would turn that into a short problem statement and a small set of candidate use cases. Before committing to a pilot, I would confirm data and environment readiness, a named reviewer, and a baseline. If those are missing, my first deliverable is the plan to close the gap, not a demo that cannot reach production."

Follow-up points:

- Ask what was tried before and why it stalled.
- Separate a customer request from the underlying outcome.
- State a kill criterion before build work begins.

### "How would you make AI-generated code safe in an enterprise?"

> "I would risk-tier both the change and the autonomy. Low-risk work such as test backfill or documentation can move faster. Business logic, security-sensitive code, and production configuration need stronger review and evidence. I would pin the source snapshot, make the plan reviewable, run the customer's build and test gates in an isolated environment, use static and security analysis, and ship reviewable PRs rather than one opaque drop. For high-risk migrations, I would add a parallel run or golden-output comparison before cutover. The control is not one tool. It is a chain of evidence with a named owner at each step."

Be ready to explain the trade-off: more validation takes time and reviewer capacity, but it protects the customer from a fast, unreviewable failure.

### "A code-generation pilot is failing in one out of five repositories. What do you do?"

Use a calm incident structure.

1. Scope the failures by repository, branch, environment, stage, and time.
2. Compare with the baseline branch. If the baseline fails too, do not mislabel a customer environment problem as generated-code failure.
3. Look for dependency, secret, runner-image, network, or flaky-test differences.
4. Contain impact by pausing the affected scope, not necessarily the whole pilot.
5. Tell the customer what is known, what is being tested, and when they will hear again.
6. Turn the cause into an onboarding health check, regression test, or explicit readiness gate.

### "How do you balance speed against quality?"

> "I do not frame it as speed versus quality. I frame it as which evidence is essential for this risk tier. I move quickly on reversible, low-blast-radius work, and I slow down where a defect could affect customers, compliance, or trust. The way to recover speed is usually better scoping, stable tests, smaller PRs, and early review capacity, not skipping the evidence that makes a release safe."

## 4. Technical evidence inventory

For each real project you may discuss, write short notes under these headings before the interview.

| Prompt | Your note |
| --- | --- |
| Customer or user problem |  |
| Existing system constraints |  |
| Your technical decision |  |
| Alternatives you rejected and why |  |
| Validation evidence |  |
| Rollback or containment plan |  |
| Result and measurement |  |
| What you would change next time |  |

## 5. A compact system-design drill

**Prompt:** A large customer wants to modernise a legacy service. They want visible progress in 30 days, but their test suite is unreliable and their chief architect is worried about unreviewable generated changes.

Your response should include:

- A discovery week: repository access, dependency map, baseline build/test health, owners, and one measurable pilot outcome.
- A proof scope: a bounded, low-risk component or test-backfill target.
- A validation path: baseline comparison, compile, tests, static checks, security review, and customer PR review.
- A delivery path: small stacked PRs, feature flag or parallel path where relevant, and a tested rollback.
- An executive cadence: weekly working review, a clear risk log, and a decision request when reviewer capacity or test stability blocks progress.

The strongest answer says what you would **not** promise: a production-wide migration date before the evidence from the first bounded scope exists.
