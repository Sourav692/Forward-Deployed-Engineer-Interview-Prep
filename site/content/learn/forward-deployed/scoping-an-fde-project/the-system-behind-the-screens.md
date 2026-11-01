# The System Behind the Screens

*Counting screens gives a quick estimate, but effort lives in the states, integrations and failure paths underneath them and in the work no demo shows.*

A page count is a poor proxy for effort; a small booking flow can be harder than a large content site. Once the goal and level of done are set, as in [Problem, Goal, and Definition of Done](/learn/forward-deployed/scoping-an-fde-project/problem-goal-and-definition-of-done), dig below the screens to find the real system.

**Objectives:**

- work down from surfaces to entities, states and workflows;
- spot the properties that make a project hard regardless of its size;
- list the hidden work a demo never shows before committing to a date.

---

## Dig From Surfaces Down to Workflows

Work through four layers, top to bottom.

**Surfaces** are what people touch: web pages and dashboards, mobile apps with their notifications and permissions, admin tools for settings and refunds, and operational views for reports, alerts and moderation.

**Entities** are the business nouns. A class-booking product has users, instructors, classes, sessions, studios, rooms, memberships, bookings and payments.

**States** are how those nouns change. A booking is never just "booked". It may be available, reserved, paid, confirmed, attended, waitlisted, promoted from the waitlist or refunded. Each transition carries rules: who may trigger it, what must already be true, what gets recorded, and what happens on failure. One "Book" button can hide a dozen of these.

**Workflows** are the journeys, traced in plain words before any architecture. A booking runs: pick a class, check space, check membership, take payment, hold the seat, confirm, notify, update the admin view. Then break it on purpose. Two people grab the last seat at once. Payment succeeds but saving the booking fails. The instructor cancels an hour before class. These are not edge cases; they are part of the product.

## Judge Complexity by Interaction, Not Size

A project is hard when many rules, systems and failure paths interact. The guide compares a content platform with a booking platform to show it.

| Question | Content platform | Booking platform |
|---|---|---|
| What changes state? | Viewed, completed, subscribed | Available, reserved, paid, cancelled, refunded, waitlisted |
| Must it be real-time? | Rarely | Yes, when seats are scarce |
| What does it integrate with? | Login, billing, content | Payments, calendar, notifications, door access, maps |
| What does a failure cost? | Lost progress | A double charge, an overbooking, a locked door |
| What does operating it involve? | Managing content | Scheduling, refunds, waitlists, no-shows, support |

Several properties quietly inflate an estimate. Many users editing the same thing at once. Money, which brings refunds, reconciliation and audit trails. Role-based permissions. Software that must match something physical, such as a room, a shipment or a person's calendar. Dependence on systems outside the team's control. And actions that cannot be undone. The guide's heading promises five of these but lists six; all six are worth checking.

## Count the Work the Demo Hides

A demo shows the happy path. The production project also contains everything that keeps the service safe and runnable, and that hidden work often decides whether the system can be trusted.

Before committing to a date, check: login and account recovery, roles and permissions, admin and support tooling, migration of existing data, analytics, logging and alerting, safe retries that never repeat an action, abuse and usage limits, a security and privacy review, testing with a staging environment, a rollout and rollback plan, and support with incident response.

> **Warning: a feature support staff cannot operate is not finished.** If customers can book a class but support cannot cancel it, refund it, change capacity or see why a confirmation failed, the service does not work in practice, however good the customer screen looks.

## Worked Example: The Resume-Feedback Page

A manager asks for a page where people upload a resume and receive AI feedback. It looks like one screen and one model call.

List what the screen hides. The file must be validated and scanned for viruses, then parsed. It must be stored and later deleted, with personal data protected. Users need login. The AI call needs failure handling, content-safety checks, and usage and cost limits. Feedback history needs saving. The team needs analytics, support tools, monitoring and tests.

That is more than a dozen tasks behind a single upload button. The estimate must be built from this list, not from the screen.

---

## Key Takeaways

- Work down from surfaces to entities, states and workflows, then break the workflows on purpose.
- Complexity comes from interacting states, systems and failure paths, not from page count.
- Concurrency, money, permissions, physical-world state, outside systems and irreversible actions all inflate estimates.
- Hidden operational work decides whether a system is trustworthy; count it before giving a date.

## Check Yourself

<details>
<summary>1. Why can a small booking flow be harder than a large content site?</summary>

It has many states, real-time constraints, several external integrations and costly failures such as double charges. The content site has few of these.

</details>

<details>
<summary>2. Name three ways to deliberately break a booking workflow while scoping it.</summary>

Two users take the last seat at once; payment succeeds but the booking save fails; the instructor cancels shortly before class.

</details>

<details>
<summary>3. Name six items of hidden work to check before committing to a date.</summary>

Any six of: login and recovery, permissions, admin tools, data migration, analytics, logging and alerts, safe retries, abuse limits, security review, testing and staging, rollout and rollback, support and incident response.

</details>

