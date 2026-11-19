---
title: "Practise building for operators"
subtitle: "Six practice questions on designing a review app, keeping a slow action honest, planning tests, building messy fixtures, injecting failures and running acceptance with the customer."
track: Building Inside the Customer's Estate
module_group: Software and data
module_code: T21.3
module_name: Building for the people who do the work
lesson: 6
lessons: ["Screens built around decisions", "Honest async interfaces", "Human review and approval", "Testing what the customer will break", "Acceptance with the customer", "Practise building for operators"]
level: intermediate
reading_time: "10 min"
source: "Forward Deployed Engineering track"
author: Sourav Banerjee
last_updated: "20 November 2026"
tags: [practice, interview, operator UI, review queue, testing, acceptance]
---

## How to use this practice

These questions ask you to produce something: a screen design, a test plan, a list of fixtures, an experiment or a release plan. Answer aloud as if at a whiteboard, writing the key items down. Then compare with the outline.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Designing a review app around the decisions its users make.
> - Making a slow action safe to press twice.
> - Planning tests and fixtures for a customer integration.
> - Planning failure injection and user acceptance for a go-live.

## Screens and review

Taught in [screens built around decisions](01_Screens_Built_Around_Decisions.md) and [human review and approval](03_Human_Review_and_Approval.md).

<details>
<summary>Practice question 1. Pelham Insurance wants a small app where handlers review claims a model has read: a dashboard, a queue table, a correction form and an approval step. Design it.</summary>

- **Answer:** Start from the decisions. The team lead's dashboard shows claims waiting, claims near their 5-day deadline and correction rate by field, each number linking to its list. The handler's queue table is sorted by deadline then value, with "take next" assigning a 15-minute lease. The claim form shows each extracted field beside its source document, highlights failed checks and asks for a reason code on every change. Approval states the version approved, enforces the handler's authority limit and blocks approving your own correction. Every action writes an audit event, and roles are checked on the server.
- **Trade-off:** Showing source documents beside fields makes the form slower to build. Without them, handlers trust or distrust the model blindly.
- **Follow-up to expect:** "How do you know it works?" Time per claim, correction rate and overturned approvals, before and after.

</details>

## Honest async interfaces

Taught in [honest async interfaces](02_Honest_Async_Interfaces.md).

<details>
<summary>Practice question 2. Pelham's handlers press "Pay" on an approved claim. The payment system sometimes takes 90 seconds to answer, and a proxy cuts requests at 30. Design what the screen and the service do.</summary>

- **Answer:** Run the payment as a job. The screen generates an idempotency key for "pay claim C-1043, version 7" and sends it with the request. The service records the key and the job in one transaction and replies 202 with the job ID within a second. The screen says "Payment sent. Waiting for confirmation, usually under 2 minutes. You can leave this page." If the connection drops, the screen says the payment is still in progress, not that it failed, and a second press returns the existing job. When the job ends, the screen shows "Paid £2,400, reference P-88213" or "Payment rejected: bank details invalid. Nothing was paid." The claim list marks payments in progress, so nobody pays again from another tab.
- **Trade-off:** A job adds a job store and a status endpoint to an action that usually takes seconds. Without them, every slow answer invites a second payment.
- **Follow-up to expect:** "The handler changes the amount and presses again." Different inputs are a new intent with a new key, so the service also refuses a second payment for a claim while one is still running.

</details>

## Testing

Taught in [testing what the customer will break](04_Testing_What_the_Customer_Will_Break.md).

<details>
<summary>Practice question 3. Quorn Logistics imports proof-of-delivery records from its van handsets and updates customer orders in its order system. Write the test plan.</summary>

- **Answer:** Unit tests for parsing a delivery record and the rules: a delivery with no signature or photo is "left safe" only where the customer allowed it. Integration tests with a real database: each record updates one order once, even when sent twice. Contract tests for the handset feed and the order system's API, run daily against their test environments. Two end-to-end tests: a delivery reaches the customer's tracking page, and a failed delivery creates a redelivery. Fixtures from real handset exports, and an injected order-system outage.
- **Trade-off:** Contract tests against two other teams' systems need their cooperation. Without them, changes surface in production.
- **Follow-up to expect:** "What runs on every commit?" Unit and integration tests. Contract tests run daily and before release.

</details>

<details>
<summary>Practice question 4. Orwell Housing will send a CSV export of 14,000 tenancies for import. List the fixtures you build and what each test checks.</summary>

- **Answer:** Duplicate tenancy IDs from transfers between homes: keep the latest by start date and report the rest. Names with apostrophes, accents and Welsh letters, and a file in the wrong encoding with a byte-order mark: names survive intact and search finds them. Invalid dates such as 31/02/2025 and a tenancy ending before it starts: quarantined with a reason. Empty postcodes, extra columns and a blank last line: valid rows load, bad rows are counted. A file where 40% of rows fail: the import stops and alerts.
- **Trade-off:** Fixtures from a real sample need anonymising first. Invented fixtures miss the mess you have not imagined.
- **Follow-up to expect:** "Where do new fixtures come from?" Every production data incident adds one.

</details>

<details>
<summary>Practice question 5. Quorn's route planner calls an external mapping service for travel times. Plan a failure-injection exercise for it.</summary>

- **Answer:** Pick three failures from the design: the mapping service times out, returns errors for ten minutes, and answers in 20 seconds instead of 300 milliseconds. For each, state the expected behaviour: plans fall back to cached travel times marked as estimates, the circuit breaker opens after 5 failures, the planner screen says "using estimated times", and no plan is written twice. Inject each through a proxy in the test environment during a planning run. Compare, fix gaps, then repeat on a schedule before peak season.
- **Trade-off:** Exercises take a day of team time. A first outage on the busiest evening costs far more.
- **Follow-up to expect:** "Would you run it in production?" Only with the customer's written agreement, at a quiet time, with a stop button.

</details>

## Acceptance

Taught in [acceptance with the customer](05_Acceptance_with_the_Customer.md).

<details>
<summary>Practice question 6. Pelham's claims review app goes live in three weeks. Plan the user acceptance testing and write the release checklist.</summary>

- **Answer:** UAT over five days with three handlers and a team lead, on an anonymised copy of last month's 2,000 claims. Ten scenarios: a clean claim, a corrected payout, two handlers on one claim, an over-limit escalation, a failed model extraction and a document that will not open. Daily triage with blocker, major, minor and cosmetic severity, and exit criteria agreed on day one. Checklist with evidence and owners: test run for the release build, signed acceptance naming the build, accessibility check, load test at Monday volume, roles reviewed by security, audit history checked, rollback tested, handlers trained, alerts live.
- **Trade-off:** Taking handlers off live claims for UAT slows the queue for a week. Skipping it moves their discoveries to go-live.
- **Follow-up to expect:** "UAT finds a blocker two days before go-live." Move the date, or go live with the workaround the accepter signs.

</details>

## References

1. The site's [honest async interfaces](02_Honest_Async_Interfaces.md) lesson, for idempotency keys and jobs.
2. The site's [human review and approval](03_Human_Review_and_Approval.md) lesson, for leases, version checks and audit history.
3. The site's [testing what the customer will break](04_Testing_What_the_Customer_Will_Break.md) lesson, for test types, fixtures and failure injection.
4. The site's [acceptance with the customer](05_Acceptance_with_the_Customer.md) lesson, for UAT and release evidence.

## Key takeaways

- Design each screen in a review app from the decision its user makes.
- A slow action runs as a job with an idempotency key, so a second press is safe.
- A test plan places each failure in the cheapest test that catches it.
- Fixtures come from the customer's real, anonymised data.
- Failure injection starts with a stated expectation for each failure.
- UAT uses real users and data, and the checklist points to evidence.

## Check yourself

<details>
<summary>1. In practice question 1, what stops a handler approving their own correction?</summary>

Separation of duties enforced on the server: the approval check refuses a request from the person who made the change.

</details>

<details>
<summary>2. Why does Orwell's import stop when 40% of rows fail?</summary>

A failure rate that high usually means the file format changed, so loading the rest risks loading misread data.

</details>
