# Estimating AI Work as a Product

*The first model call takes an afternoon, which makes AI work look cheap, but controlling and proving judgement-based behaviour is most of the project.*

"The model can do it" marks the start of an AI project, not its end. AI adds two jobs ordinary software estimates leave out: keeping unpredictable behaviour within bounds, and proving that behaviour is good enough, on top of the hidden work in [The System Behind the Screens](/learn/forward-deployed/scoping-an-fde-project/the-system-behind-the-screens).

**Objectives:**

- tell predictable logic from judgement-based logic and estimate each accordingly;
- answer the seven questions every AI estimate must cover;
- size the gap between an AI prototype, an MVP and a production service.

---

## Separate Predictable Logic From Judgement

Two kinds of logic sit in an AI product. Predictable logic gives the same output for the same input: when a payment succeeds, mark the booking paid. Judgement-based logic has several reasonable outputs: decide whether an interview answer is strong.

Judgement cannot be tested by checking one expected value. Something has to measure quality across many cases. That measurement is the extra work, and it is why a demo that works on three examples says little about the project.

## Answer the Seven Questions Before Sizing

An AI estimate is incomplete until it can answer seven questions:

1. What exactly should the AI decide or write?
2. What information does it need, and where does it come from?
3. Which actions may it take?
4. Which of those need human approval first?
5. How many mistakes are acceptable?
6. How will quality be measured before and after launch?
7. What happens when the AI is unsure, slow, unavailable or too expensive?

Each answer adds work. Data access, action boundaries, a human fallback, tracing, cost control, failure handling and a way to improve bad answers all surround the model call.

## Size the Three Levels Separately

The guide's mock-interview assistant shows how far apart the levels are.

| Level | What it contains | Rough size |
|---|---|---|
| Prototype | One chat screen, one prompt, a fixed interview flow, a closing feedback message | A few days |
| MVP | Login, saved sessions, several modes, document lookup, a scoring guide, a structured report, history | Several weeks |
| Production | A test set, tracing, versioned prompts, regression tests, cost controls, a fallback, analytics | One to several months |

The jump from days to months is not more prompting. It is the work of controlling and proving behaviour.

## Treat Document Lookup as Data Work

Retrieval quality is bounded by source quality. So plan time for cleaning documents, applying access rules, labelling, splitting into chunks, keeping content fresh, showing sources and testing search. If nobody owns updates, the system drifts out of date without anyone noticing.

## Write the Tests Before the Pilot

Agree sample cases and expected behaviour before real users arrive. Include clean examples, unclear requests, missing information, unsafe requests and cases that should go to a human. After launch, turn each important failure into a new test.

AI quality comes from a loop, not a perfect prompt: build, evaluate, observe, collect failures, improve.

> **Warning: an AI demo with no test set is a project with no definition of good.** It can look excellent on the day and still have no way to show it is improving or regressing.

## Worked Example: Pricing the Mock-Interview Assistant

A team asks how long an AI mock-interview assistant will take. The honest answer starts with a question: which level?

A prototype is a few days, because it needs only a screen, a prompt and a fixed flow. An MVP is several weeks: it adds login, saved sessions, document lookup and a scoring guide, which means document cleaning and a rubric. Production is one to several months: it adds a test set covering clear, unclear and unsafe answers, regression tests, prompt versioning, cost limits and a fallback for when the model is slow.

The model call is the same at all three levels. Everything that changes the estimate is control and proof.

---

## Key Takeaways

- Judgement-based logic needs a way to measure quality; that is the extra AI work.
- Answer seven questions about decisions, data, actions, approvals, error tolerance, measurement and fallbacks before sizing.
- AI prototypes, MVPs and production services differ by days versus months.
- Document lookup is data work, and it decays without an owner.
- Write tests before the pilot and feed every failure back into them.

## Check Yourself

1. **Why does a working AI demo say little about the size of the project?**
   It shows the model call, which is cheap. It does not show data access, action limits, evaluation, fallbacks, cost control or the improvement loop.

2. **What makes judgement-based logic harder to test than predictable logic?**
   Several outputs can be reasonable, so there is no single expected value. Quality must be measured across many cases.

3. **What should a pre-pilot test set include?**
   Clean examples, unclear requests, missing information, unsafe requests and cases that should be handed to a human.

