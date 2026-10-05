# Shrinking to a First Release

*Accepting the whole wish list keeps every stakeholder happy for a week, but the first release should be the smallest thing that delivers value and retires the biggest risk.*

◷ 4 min

A large number attached to a large wish list is not a plan. The lead's job is to find the narrowest release that delivers the core outcome safely, using the sizes from [Estimating AI Work as a Product](03_Estimating_AI_Work_as_a_Product.md) to show what each cut saves.

**Objectives:**

- define an MVP as narrow rather than careless;
- sort every request into must-have, should-have and later;
- choose the first release around the assumption most likely to kill the project.

---

## Make the MVP Narrow, Not Sloppy

An MVP serves a clearly defined group of users, is safe to run, and answers a real question about the product or about how it is being built. Narrow means fewer users, fewer workflows and fewer integrations. It never means skipping safety.

The value of a first release rises with the core value users get and with how fast the team learns. It falls with what it costs to deliver. Compare options on those three terms.

## Sort Every Request Into Three Buckets

Put each request in one of three buckets. Must-have items are needed for the core outcome or for safe operation. Should-have items are useful soon but can be done by hand for now. Later items are valuable once the core workflow has proved itself.

The guide's class-booking product shows the split.

| First release | Held back |
|---|---|
| A responsive website | Native iOS and Android apps |
| Class schedule and booking | A community feed |
| Hosted payment checkout | Movement feedback |
| A simple admin portal | Automatic studio door access |
| Email confirmation | Advanced loyalty and membership rules |

## Keep Manual Steps That Teach Something

Automate the core value, not every task around it. Early on, support staff can approve refunds, an operator can upload a spreadsheet, and a small script can produce the weekly report. Replace each manual step only when volume or error rates justify it. A manual step still needs an owner, a safe procedure and a way to measure its load.

## Retire the Riskiest Assumption First

Build the first release around the assumption most likely to sink the project. If nobody has shown that people want interview feedback, test that before building community features, complex billing or a content platform. A release that proves the wrong thing wastes the time it saved.

> **Warning: owning a project includes saying "not yet".** A lead who cannot move items to "later" has handed scope control to whoever asks loudest. The sequence is scope, prioritise, reduce, deliver.

## Worked Example: A Six-Week Document Assistant

The guide's exercise: six weeks to build an enterprise document assistant. The request lists chat, Slack, email, permissions, analytics, many languages, document editing and automatic actions.

The guide leaves the answer open, so what follows is one defensible sort using its buckets. Permissions are must-have, because an assistant that leaks documents is unsafe at any size. Chat is the core value and is must-have. Basic analytics are needed to prove the outcome. Slack and email are should-have; users can open the chat for six weeks. Many languages, document editing and automatic actions move to later, because each adds evaluation and risk without testing whether people want the assistant at all.

The six-week MVP is permission-aware chat over the documents, with enough analytics to show whether it is used and useful. Everything else waits for that evidence.

---

## Key Takeaways

- An MVP is narrow, safe and answers a real question; narrow never means unsafe.
- Sort requests into must-have, should-have and later, and say "not yet" out loud.
- Keep manual steps where they are cheap and instructive, each with an owner.
- Build the first release around the assumption most likely to kill the project.

## Check Yourself

1. **What makes a release an MVP rather than a rushed product?**
   It serves a defined group, is safe to run, and answers a real question. It is narrow in scope, not careless in quality.

2. **When should a manual step be automated?**
   When volume or error rates justify it. Until then it needs an owner, a safe process and a measure of its workload.

3. **Why build community features after testing whether people want interview feedback?**
   Feedback is the riskiest assumption. If it fails, the community features have no reason to exist.

## References

**Sources:** `05_FDE_Delivery_and_Scoping/Scoping_An_FDE_Project/Scoping-an-FDE-Project-Complete-Guide.md`, Module 3 Topic 3.2 "Cut scope without losing the outcome", summarised in our own words. The guide is itself based on the fdehandbook.com "Scope a Project" course.
