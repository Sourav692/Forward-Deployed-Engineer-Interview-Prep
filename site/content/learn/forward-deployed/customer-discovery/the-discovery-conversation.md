# The Discovery Conversation

*Asking questions first feels slow in a 45-minute round, but an architecture drawn before the user and outcome are known solves a problem nobody confirmed.*

A vague prompt is not an invitation to draw a RAG diagram. It is a test of whether the candidate can turn an ambiguous ask into a user, an outcome and a set of constraints before proposing anything.

**Objectives:**

- open any decomposition case with a short, reusable framing statement;
- ask the five families of questions that change the design: business, constraint, evaluation, architecture and rollout;
- name the signals an interviewer listens for and the mistakes that lose the round.

---

## Start From the Prompt as Given

A typical decomposition prompt is deliberately thin: "A large enterprise wants to use AI to improve customer support. How would you approach it?" Nothing in that sentence says who the user is, what is slow today, or how anyone would know the project worked.

A design cannot be judged against an outcome nobody stated. So the round is scored on the order of work as much as the answer. The question bank recommends seven steps:

1. Clarify the business objective and the user.
2. Define the current workflow and its pain points.
3. Choose and prioritise the use case.
4. Define success metrics and evaluation data.
5. Decompose the solution into components.
6. Discuss risks, trade-offs and failure modes.
7. Explain the MVP and the production rollout plan.

The solution does not appear until step five. Four steps of framing come first, and they are what make the later steps checkable.

## Open With One Framing Sentence

Say what will happen before doing it. The bank's reusable opening fits almost every case: clarify the business outcome, the primary user, the current workflow, the constraints and how success will be measured; make assumptions explicit where information is missing; then decompose into use-case selection, data and integrations, the AI workflow, evaluation, production architecture and rollout.

That sentence buys time without looking evasive. It also tells the interviewer the shape of the next 40 minutes, so they can steer early instead of interrupting late.

## Ask the Questions That Change the Design

A clarifying question is only worth asking if its answer changes something. The bank groups them into five families, and each family settles a different part of the design.

| What is still unknown | Questions to ask |
|---|---|
| Who benefits, and from what? (business) | Who is the user? What decision or task should improve? What is the current process? What does the problem cost today? Is the aim automation, assistance, speed, quality or revenue? |
| What limits the design? (constraints) | What latency is acceptable? What volume and concurrency are expected? What data is available, and how fresh must it be? What privacy, security and regulatory rules apply? What may the system do on its own? |
| How will anyone know it works? (evaluation) | What counts as a correct answer or a successful task? Are there historical examples or labels? What is the human baseline? Which errors are tolerable, and which must escalate? |
| What has to be built? (architecture) | What are the inputs? What processing is needed? Where do retrieval, models, tools and business rules fit? What state must persist? How is the system monitored and rolled back? |
| How does it reach users safely? (rollout) | What is the lowest-risk MVP? Which users or workflows get the pilot? What gates must pass before expansion? How will adoption and business impact be measured? |

Five questions are usually enough to start. Pick the ones whose answers would move the design most, and state an assumption for the rest.

> **Warning: "I would use RAG and agents" is the most common losing opening.** It names a technology before naming a user or an outcome. Every later choice then has nothing to be measured against, and the interviewer marks the answer as solution-first.

## Listen for What the Interviewer Is Scoring

The bank lists the signals that public decomposition-interview guidance emphasises. They are worth reading as a checklist of behaviours, not topics:

- clarifying before solving;
- finding the real user and the business outcome;
- splitting the problem into clean workstreams;
- making assumptions explicit;
- defining measurable success;
- naming risks and failure modes;
- discussing trade-offs instead of asserting one best design;
- moving from prototype to production;
- communicating clearly while the problem changes.

Only one of the nine is about the architecture itself. The rest are about judgement and communication.

## Avoid the Ten Common Mistakes

The bank's list of mistakes mirrors the signals. Starting with "RAG and agents", never asking who the user is, and treating automation as the goal all skip the framing steps. Ignoring permissions and data governance, discussing accuracy with no evaluation defined, and designing only the happy path skip the risk steps. Forgetting human escalation, ignoring latency and cost, and treating a prototype as a production system skip the rollout steps. The last mistake sums up the rest: an impressive technical answer that never connects to business impact.

## Worked Example: Opening the Customer-Support Prompt

Take the vague prompt above. A strong first two minutes runs like this.

"Before proposing anything, I'd like to pin down the outcome and the user. Who handles these tickets today, and which ticket types take the most time? Is the goal to deflect tickets, speed up agents, or improve quality? What data can a system read: a knowledge base, past tickets, account records? Can it act on accounts, or only draft replies? And how would we know in three months that it worked: handling time, resolution rate, satisfaction?"

Then state assumptions for anything unanswered: "I'll assume agents stay in the loop and the system starts read-only." Only now does decomposition begin. The opening has fixed the user, the success measure and the action boundary, and each later component can be judged against them.

---

## Key Takeaways

- Decomposition rounds score the order of work: four framing steps come before any component.
- One framing sentence tells the interviewer the plan and buys time to think.
- Ask business, constraint, evaluation, architecture and rollout questions, and only the ones whose answers change the design.
- Most interviewer signals are about judgement and communication, not architecture.
- The common mistakes each skip a framing, risk or rollout step.

## Check Yourself

<details>
<summary>1. Why is "I would use RAG and agents" a weak opening even when RAG is the right answer?</summary>

It names a technology before a user or an outcome exists. Nothing later can be judged against a goal, so the answer reads as solution-first.

</details>

<details>
<summary>2. Name one question from each of the five families.</summary>

Business: who is the user? Constraint: what may the system do on its own? Evaluation: what is the human baseline? Architecture: what state must persist? Rollout: which users get the pilot?

</details>

<details>
<summary>3. What should happen to a clarifying question the interviewer declines to answer?</summary>

Replace it with a stated assumption, such as "I'll assume the system starts read-only", and carry on.

</details>

