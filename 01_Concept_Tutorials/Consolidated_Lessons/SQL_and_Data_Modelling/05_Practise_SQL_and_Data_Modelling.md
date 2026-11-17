---
title: "Practise SQL and data modelling"
subtitle: "Five practice questions: a ranking query, an approval schema with history, an index for a search screen, a transfer in one transaction and a pool that runs dry."
track: Engineering Foundations for AI
module_group: Data and systems
module_code: T1.4
module_name: SQL and data modelling for AI apps
lesson: 5
lessons: ["SQL for business questions", "Modelling entities, keys and constraints", "Indexes and query plans", "Transactions, locking and isolation", "Practise SQL and data modelling"]
level: intermediate
reading_time: "10 min"
source: "Forward Deployed Engineering track"
author: Sourav Banerjee
last_updated: "17 November 2026"
tags: [practice, interview, SQL, data modelling, indexes, transactions]
---

## How to use this practice

These questions ask you to produce something: a query, a schema, an index or a diagnosis. Answer aloud as if at a whiteboard, describing each step of the query or each table before you compare with the outline. In an interview you would write the SQL. Here the outlines describe it in steps, which is what an interviewer listens for while you write.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Writing a ranking query with a common table expression and a window function.
> - Designing an approval schema with an audit history.
> - Choosing an index for a search screen.
> - Moving value between records in one transaction, and diagnosing a pool that runs dry.

## Queries

Taught in [SQL for business questions](01_SQL_for_Business_Questions.md).

<details>
<summary>Practice question 1. Vane Travel wants each region's top three customers by booking revenue this year, with each customer's share of their region's revenue. Describe the query.</summary>

- **Answer:** Step 1, a CTE: sum booking revenue per customer for this year, joined to customers for the region. One row per customer. Step 2, add two window columns: `rank() over (partition by region order by revenue desc)` and the region total, `sum(revenue) over (partition by region)`. Step 3, keep rows with rank 3 or better, and compute share as revenue divided by the region total. Order by region, then rank. Check that the region totals add up to this year's total revenue.
- **Trade-off:** `rank` returns more than three rows when customers tie. `row_number` returns exactly three but picks among ties arbitrarily, unless a tie-breaker column is added to the ordering.
- **Follow-up to expect:** "Why compute the region total with a window, not a join?" It keeps one row per customer and avoids a second aggregate and join.

</details>

## Modelling

Taught in [modelling entities, keys and constraints](02_Modelling_Entities_Keys_and_Constraints.md).

<details>
<summary>Practice question 2. Vane Travel refunds over £1,000 need a team lead's approval, then finance's. Design the tables, including a full audit history.</summary>

- **Answer:** `refunds`: identifier, booking, requester, amount with a check above zero, reason, created time. `approval_stages`: amount band, stage number and approving role, so policy is data. `refund_decisions`: refund, stage, decision, decided by, decided at and comment, with a unique constraint on refund and stage and foreign keys to both. A rule in the service, inside the insert's transaction, stops the requester approving and one person deciding two stages. `audit_events`: entity, field, old value, new value, actor, time and reason, insert-only for the application. Status is derived from decisions, or stored and updated in the same transaction.
- **Trade-off:** Deriving status needs a query each time. Storing it is fast but must never drift from the decisions.
- **Follow-up to expect:** "The amount changes after stage 1." Record the change in the audit table and reset the refund to stage 1.

</details>

## Indexes

Taught in [indexes and query plans](03_Indexes_and_Query_Plans.md).

<details>
<summary>Practice question 3. Vane Travel's agents search their bookings: one agent, status confirmed or ticketed, earliest departure first, 20 per page. Which index do you propose?</summary>

- **Answer:** The agent is an equality and the departure date is the sort, so the index leads with `agent_id`. With a two-value status list, `(agent_id, status, departure_date)` gives two sorted runs that the database must merge or sort. `(agent_id, departure_date)` returns rows already in order and filters status as it reads, stopping at 20 once enough match. If most of an agent's bookings are confirmed or ticketed, `(agent_id, departure_date)` wins. If those statuses are rare, the status-second index reads fewer rows. Check with the plan on the busiest agent, and compare rows read with rows returned.
- **Trade-off:** Adding `status` as a third column, `(agent_id, departure_date, status)`, lets the filter run on index entries alone, at the cost of a wider index.
- **Follow-up to expect:** "Agents also search by customer surname." That is a different access path and needs its own index.

</details>

## Transactions and pools

Taught in [transactions, locking and isolation](04_Transactions_Locking_and_Isolation.md).

<details>
<summary>Practice question 4. Move £250 of travel credit from one customer account to another at Vane Travel. Describe the transaction and what can go wrong.</summary>

- **Answer:** Begin. Lock both account rows in a fixed order, lower identifier first, to avoid deadlocks with a transfer going the other way. Decrease the source by 250 where its balance is at least 250. If zero rows changed, roll back and report insufficient credit. Increase the destination by 250. Insert a ledger row for each side with a shared transfer identifier, which has a unique constraint. Commit. A crash before commit leaves no change. A retried request fails on the transfer identifier instead of moving the money twice.
- **Trade-off:** Row locks serialise transfers on one busy account. A ledger-only design, where balance is a sum of entries, avoids the hot row but makes reads costlier.
- **Follow-up to expect:** "The accounts live in two databases." Then one transaction cannot cover both. Use a saga with a pending state and a compensating step.

</details>

<details>
<summary>Practice question 5. At 09:00 Thorne Clinics' API logs "timed out waiting for a connection". Database CPU is at 15%, and every query takes under 10 milliseconds. Diagnose it.</summary>

- **Answer:** Fast queries with an empty-looking database point at connections held while not querying. Check for sessions idle in a transaction, and trace which handler holds them. A common cause is a transaction opened, then a slow network call, such as a call to a model or a third-party API, before commit. Use Little's law: at 200 requests a second, a two-second hold needs 400 connections. Also check for leaked connections never returned, and total pool size across instances against the database limit. Fix: commit before network calls, set idle-in-transaction and acquire timeouts, and add a pooler if instances multiply.
- **Trade-off:** Raising the pool size hides the symptom briefly and can overload the database. Shortening transactions fixes the cause but changes code.
- **Follow-up to expect:** "It only happens at 09:00." That is the peak, when rate times hold time first exceeds the pool.

</details>

## References

1. The lessons linked under each heading in this module.

## Key takeaways

- Describe a query as named steps with a clear grain, and check its totals.
- Model approvals as policy rows and one decision row per stage, with insert-only history.
- Choose index column order from the query: equality, then sort, then optional filters.
- Transfers lock in a fixed order, update conditionally and carry an identifier.
- Pool exhaustion with fast queries means connections held between queries.

## Check yourself

<details>
<summary>1. In practice question 3, why might an index without status in second place serve the search better?</summary>

It returns the agent's bookings already in departure order, so the database can filter status while reading and stop at 20. With status second, two sorted runs must be merged or sorted.

</details>

<details>
<summary>2. In practice question 5, how many connections does a two-second hold need at 200 requests a second?</summary>

200 × 2 = 400 connections, far more than a typical pool holds.

</details>
