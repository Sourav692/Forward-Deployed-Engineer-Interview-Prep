# Stage {{NN}} — {{TITLE}}

Target: Staff FDE / Applied AI. Depth: {{mapped depth}}. Estimated time: {{budget}}. Previous stage: {{actual prior state or none}}.

## 1. Understand the Problem

### Customer, Current System, and Failure
Use one concrete customer scenario. State requirements and illustrative constraints. Explain what currently exists and what breaks. Include a before Mermaid diagram, caption, and text alternative. Do not invent prior completion.

### Learning Contract and Coverage
List no more than five outcomes and prerequisites. Account for all assigned modules at their mapped depths. Classify taught at mapped depth, context only, revisited, and deferred. For neighbouring contextual/deferred modules, give their actual first-teaching stage and depth. Separate verified artifacts from learner mastery. State the stopping boundary.

### Intuition Before Terminology
Explain the user-visible consequence in this scenario before the formal term. Cover the guarantees and limits needed by the stage; defer advanced specialisations.

## 2. Learn and Design

### Alternatives and Decision
Compare at least two credible designs under the workload. Explain cost, failure, and rejection rationale. Show the after architecture and trust boundaries using Mermaid, a caption, and a text alternative. Define API validation, identity scope, statuses, idempotency, retries, and success guarantees where relevant.

### Checkpoint: Predict the Failure
Ask a short decision question before the learner sees its answer.

<details>
<summary>Reveal the explanation after answering</summary>

Explain the specific observable consequence and responsible boundary.

</details>

## 3. Observe and Experiment

### Follow One Request
Provide a sequence diagram and a static step table: step, responsible component, input, output/state, possible failure. Link to the HTML step-through walkthrough. Include success and relevant failure branches. HTML adds direct step selection, Previous/Next, Reset, a selected-step label, and accessible live updates; the teaching remains readable without JavaScript.

### Calculate, Implement, and Break It
Show unit-correct workload and latency calculations with labelled assumptions. Give deterministic lab cases and expected results, execution instructions, failure injection, detection, and mitigation. Link to [offline interactive lab](guide.html#lab). Include another answer-before-reveal checkpoint after the experiment's key decision.

## 4. Think Like a Staff Engineer

### Operations and Changed Constraints
Explain production boundaries, security, reliability, cost, signals, remediation, and unimplemented controls. Include four to six interview prompts, each with a 30–60 second spoken answer, trade-off, and changed-constraint follow-up.

## 5. Validate and Carry Forward

### Recall and Exit Gates
Include three to five self-test questions with answers, a 60-second revision card, and the five explain/draw/defend/diagnose/build gates for D3. Mark learner gates unassessed unless actually assessed. Suggest reviews after about one, seven, and 21 days.

### Decisions, Coverage, and Distribution
Link current architecture, ADRs, actual coverage, stage state, and validation evidence. State the next stage's inherited architecture without authoring it. Package guides with referenced labs/tests, state, validation, architecture, coverage, and local resources. Preserve relative paths, exclude generated caches/databases, and test links and labs after clean extraction.

### References
Link only grounded sources used. Distinguish facts, authored assumptions, executed checks, and unchecked boundaries.
