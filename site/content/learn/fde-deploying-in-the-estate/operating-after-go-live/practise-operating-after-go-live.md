# Practise Operating After Go-live


## How to use this practice

These questions put you in charge of a system that is already live in a customer's estate. Some ask what you would do when something has gone wrong. Others ask you to design or write something the customer's team will use. Answer aloud as if the customer's operations lead is listening, then compare with the outline.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Repairing broken traces and containing sensitive data in logs.
> - Spotting dashboards that look current over stale data.
> - Designing telemetry and dashboards for a workflow with many hops.
> - Rehearsing incidents, updating customers and writing postmortems.
- Treating a restart as a way to buy time, not as the fix.
> - Monitoring a customer's data feed for freshness and schema drift.

## Telemetry in the field

Taught in [telemetry the customer can use](/learn/fde-deploying-in-the-estate/operating-after-go-live/telemetry-the-customer-can-use).

<details>
<summary>Practice question 1. At Pennick Logistics, every order's trace stops at the orders queue. The allocation worker's spans show up as separate traces with no link to the API call. Why, and how do you fix it?</summary>

- **Answer:** The trace context is not crossing the queue. HTTP carries it in a header, but the producer is not writing it into the message, or the consumer is not reading it. Check one message's headers on the queue. Fix the producer to inject the trace context and the order ID into message headers, and the consumer to extract it and start its span as a child or link. Then send one tagged order and confirm one trace from API to warehouse.
- **Trade-off:** A child span reads as one tree. A link suits batch consumers, where one span serves many messages.
- **Follow-up to expect:** "The queue product strips unknown headers." Put the context in the message body's envelope.

</details>

<details>
<summary>Practice question 2. Pennick's security team finds the carrier API key and customers' home addresses in the adapter's debug logs, searchable by 200 staff for the past 30 days. What do you do?</summary>

- **Answer:** Revoke and replace the carrier key first, with an overlap if it can be done within the hour. Check the carrier's access logs for unknown use. Turn off the debug logging, or release a fix that logs an allow-list of fields. Restrict access to the affected indexes now. Find every copy, including forwarders, archives and exports, then purge what the platform allows and record what remains. Hand the address exposure to Pennick's privacy team, who decide on notification.
- **Trade-off:** Purging quickly removes evidence the investigation may need. Restrict access first, and agree with security what to keep.
- **Follow-up to expect:** "How do you stop it recurring?" Redaction at the logger, an allow-list and a scan for secret patterns.

</details>

<details>
<summary>Practice question 3. Ravensworth's claims dashboard says "refreshed 09:02" every morning. A handler notices the counts have not changed in two days. What happened, and what do you change?</summary>

- **Answer:** The page refreshes but its data does not. Likely causes: the nightly extract re-sent the same file, the load job failed quietly, or it loaded into the wrong partition. Check the newest event time in the table each panel reads, and the load job's row counts for the last three nights. Fix the load, then backfill. Change the dashboard to show "data as of" from the newest record, alert when that age passes its limit, and grey out stale panels.
- **Trade-off:** Freshness alerts on every panel can be noisy. Alert on the source tables and let panels inherit.
- **Follow-up to expect:** "The extract arrives late on Mondays." Set the threshold from the real schedule.

</details>

<details>
<summary>Practice question 4. Design telemetry for Ravensworth's claim flow: portal, document vendor, triage service, model vendor and handler queues.</summary>

- **Answer:** Start a trace and keep the claim ID at the portal. Carry trace context in HTTP headers and message headers at every hop. Record a span for each vendor call with the vendor's request ID, latency and status. Log structured events with the claim ID at every stage, with no claim text or personal data. Count claims at each stage, and track the oldest untriaged claim. Send everything into Ravensworth's own platform through OpenTelemetry. Define SLIs on claims triaged within the target time.
- **Trade-off:** Full tracing at every hop costs storage. Sample routine successes and keep every failure and slow trace.
- **Follow-up to expect:** "The document vendor gives no request ID." Log your own call ID and the timestamps.

</details>

<details>
<summary>Practice question 5. Design the operational dashboard Pennick's operations lead and on-call engineer will use.</summary>

- **Answer:** Top row, the business view: orders accepted, allocated, sent and confirmed in the last hour, the oldest unconfirmed order against the 30-minute target, and error budget remaining. Second row, dependencies: carrier and warehouse success rates and latency. Third row, infrastructure: queue age, worker count, CPU and memory, for diagnosis. Every panel shows "data as of". Link each alert to its panel and runbook. Keep it to one screen.
- **Trade-off:** One shared dashboard keeps both on the same facts. A separate deep-dive view keeps the main one readable.
- **Follow-up to expect:** "The operations lead wants it on a wall screen." Show only the top row and the budget there.

</details>

## Incidents and communication

Taught in [incidents with a customer watching](/learn/fde-deploying-in-the-estate/operating-after-go-live/incidents-with-a-customer-watching).

<details>
<summary>Practice question 6. Plan a tabletop exercise with Ravensworth before go-live.</summary>

- **Answer:** One hour, with Ravensworth's claims operations lead, IT on-call, your engineer and a facilitator. Scenario: the model vendor starts timing out at 09:00 on a Monday. Add a new fact every ten minutes: the backlog reaches 500, the vendor says it is not them, a broker phones the claims director. Ask at each point who leads, what you do and what you send. Test real contact numbers and the manual triage fallback. End with actions, owners and dates.
- **Trade-off:** A realistic scenario finds real gaps. Too many twists turn it into a quiz and people stop engaging.
- **Follow-up to expect:** "How do you know it worked?" The actions it produces, and how fast people find the runbook.

</details>

<details>
<summary>Practice question 7. During Pennick's label-service outage, write the 01:25 update to its operations lead, and say when the next one goes.</summary>

- **Answer:** "Impact: since 01:10, no orders can be dispatched because the carrier's label service rejects every request. About 75 orders are waiting, and about 300 more arrive each hour. Workaround: none yet. We are asking the carrier about manual labels. Known: no change was released by us, and the carrier's service returns errors to our requests. Not known yet: when the carrier will recover. Doing: priority ticket with the carrier, testing their backup endpoint. Next update: 01:55." Then every 30 minutes until resolved.
- **Trade-off:** Sending at night wakes the customer. Agree in advance which severity justifies it.
- **Follow-up to expect:** "Should the update blame the carrier?" State the facts. Leave blame for the postmortem.

</details>

<details>
<summary>Practice question 8. Outline the postmortem for Pennick's green dashboard incident, where 3,300 orders were accepted and none reached a warehouse.</summary>

- **Answer:** Summary: impact in Pennick's terms, 80 minutes, about 3,300 orders delayed. Timeline: credential expiry at 10:40, errors swallowed, dashboard stale since 09:00, warehouse phone call at 12:00, recovery and re-drive. Contributing causes: no credential expiry alert, errors logged at debug and messages marked done, no business alert, dashboard showing page refresh not data age. What went well: idempotent re-drive. Actions with owners and dates: expiry alerts, fail-closed worker, business SLO alert, "data as of" panels. Blameless throughout.
- **Trade-off:** A full write-up takes days. A short summary to the customer within 48 hours, then the full one, keeps trust.
- **Follow-up to expect:** "Who reads it?" Both teams. Review the actions monthly.

</details>

<details>
<summary>Practice question 9. Caister Water's meter-reading service hangs every four or five days. Each time, on-call restarts it, readings flow again and the ticket is closed. Caister's operations lead asks whether the problem is fixed. What do you tell her, and what do you do?</summary>

- **Answer:** Tell her no. The restart restores service, but the cause is still there, which is why it keeps coming back. Next time, capture evidence before restarting: thread dumps, memory and connection-pool figures, recent logs and the time of the last good reading. Restart within an agreed limit if readings are backing up. Then track down the cause, perhaps a leaked connection or a stuck lock, fix it and confirm the hangs stop. Give her the plan, and keep one ticket open until the fix is proven.
- **Trade-off:** Capturing evidence delays service by a few minutes. Agree a time limit, so on-call never holds an outage open to gather data.
- **Follow-up to expect:** "Can we schedule a nightly restart?" Only as a stated stopgap with an end date, while the fix is found.

</details>

## Data drift

Taught in [maintenance and drift](/learn/fde-deploying-in-the-estate/operating-after-go-live/maintenance-and-drift).

<details>
<summary>Practice question 10. Ravensworth sends a nightly policy feed that the triage system uses to check cover. Design its freshness and schema-drift monitoring.</summary>

- **Answer:** Freshness: alert if the newest policy record is older than 26 hours, allowing for a late feed. Completeness: compare the feed's row count with the source system's count and with the last seven nights, and alert on a gap above 2%. Reconcile policy IDs weekly. Schema: check required fields, types and allowed values, such as cover codes, on every load. Ignore added fields. Quarantine rows that fail a required field, alert the feed's owner, and show triage users the feed's age.
- **Trade-off:** Strict checks block a load for one bad row. Quarantining rows keeps the rest flowing.
- **Follow-up to expect:** "A new cover code appears." Quarantine those rows and ask the owner to map it.

</details>

## Key takeaways

- Carry trace context in every message, and test the chain with one tagged item.
- On sensitive data in logs, revoke credentials first, restrict access, then remove every copy.
- Show the age of the data, not the page, and alert on it.
- Rehearse incidents with the customer, send updates on the clock and close every postmortem action.
- A restart buys time. Capture evidence first, then find and fix the cause.
- Monitor each source for freshness, completeness and schema, and quarantine what fails.

## Check yourself

<details>
<summary>1. In practice question 1, why is a link sometimes better than a child span?</summary>

A batch consumer handles many messages in one span. A span can have only one parent, so linking it to each message's producer keeps every connection.

</details>

<details>
<summary>2. In practice question 10, why compare the row count with the last seven nights as well as the source?</summary>

The source count may be unavailable or wrong on the same night. The recent pattern catches a sudden drop even when no source figure exists.

</details>
