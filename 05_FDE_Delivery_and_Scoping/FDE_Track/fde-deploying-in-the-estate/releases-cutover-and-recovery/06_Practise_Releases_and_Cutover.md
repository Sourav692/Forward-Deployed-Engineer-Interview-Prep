---
title: "Practise releases and cutover"
subtitle: "Twelve practice questions on builds, canaries, schema changes, live migrations, cutover plans and recovery in a customer's estate."
track: "Deploying and Operating in the Customer's Estate"
module_group: Release and operate
module_code: T23.4
module_name: Releases, cutover and recovery
lesson: 6
lessons: ["Builds you can reproduce and promote", "Safe rollouts", "Migrating live data", "Cutover and rollback decisions", "Backups, RTO, RPO and restore drills", "Practise releases and cutover"]
level: intermediate
reading_time: "15 min"
source: "Forward Deployed Engineering track"
author: Sourav Banerjee
last_updated: "20 November 2026"
tags: [practice, interview, releases, migrations, recovery, AI system design]
---

## How to use this practice

These questions put you in a customer's estate on release day, mid-migration or after something has broken. Answer aloud as if the customer's change board is listening: name the first thing you would check or decide, and why. Then compare with the outline.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Finding why one artefact behaves differently between environments.
> - Planning canaries and schema changes that keep rollback open.
> - Designing live migrations, shadow traffic and safe parallel runs.
> - Writing cutover checklists and recovery designs, and recovering from a bad backup.

## Builds and environments

Taught in [builds you can reproduce and promote](01_Builds_You_Can_Reproduce_and_Promote.md).

<details>
<summary>Practice question 1. At Thornbury Freight, the same image digest passes every test in staging. In production, bookings sent by one large customer's integration are rejected. Where do you look?</summary>

- **Answer:** The artefact is ruled out, so compare what surrounds it, cheapest first. Diff the effective configuration of both environments, then feature flags. Check the production service account's permissions and any allow-list for that customer. Compare the integration itself: staging probably receives test payloads, while production gets the customer's real messages, perhaps with a field format staging never saw. Check infrastructure versions for drift. Log one rejected request in full, with personal data redacted, and replay it in staging to confirm.
- **Trade-off:** Replaying real traffic in staging finds the cause fastest and needs care with customer data.
- **Follow-up to expect:** "How do you make this quicker next time?" Log the digest and a configuration hash at startup.

</details>

<details>
<summary>Practice question 2. Design Lanark Bank's pipeline so that the artefact its change board approves is the one production runs.</summary>

- **Answer:** Build once per commit from a lockfile, a base image pinned by digest and pinned tools, and record signed provenance. Push the image to Lanark's registry and refer to it only by digest. Deploy that digest to development and staging with their own configuration. The gate shows the board the digest, test results, scan, provenance and infrastructure plan. Production's deploy job accepts only digests with a recorded, unexpired approval. Configuration differences between environments live in reviewed code.
- **Trade-off:** Strict promotion slows emergency fixes. An agreed emergency path with two approvers keeps them possible.
- **Follow-up to expect:** "A base-image security patch lands." Rebuild, giving a new digest, and promote it like any change.

</details>

## Rollouts and schema changes

Taught in [safe rollouts](02_Safe_Rollouts.md).

<details>
<summary>Practice question 3. Lanark's canary of a new document classifier shows flat errors and latency. In the canary, officers send 11 in every 100 documents to manual review, against 6 in control. What do you do?</summary>

- **Answer:** Treat it as a failed canary. The business outcome is worse, even though nothing errors. Halt the rollout and turn the flag off for the canary slice. Check the sample size: if the canary saw a few thousand documents, a 5-point gap is real. Pull the documents sent to review and look for a pattern, such as one document type or one branch's scans. Fix, retest offline on those documents, then restart the canary with manual review rate as a halt criterion.
- **Trade-off:** Halting delays the release. Continuing doubles officers' manual work.
- **Follow-up to expect:** "The model team says accuracy improved overall." Overall accuracy can rise while one heavy workflow gets worse.

</details>

<details>
<summary>Practice question 4. At Thornbury, a release renamed a column and removed the old name. The new code has a bug, and the old code cannot start without the old column. What now?</summary>

- **Answer:** First contain the bug: turn off the feature with a flag if one exists. Then choose. Fixing forward is often quickest: patch the new code and release it. If rollback is needed, re-add the old column, fill it from the new one, deploy the old code, and keep both columns in step with a trigger or dual writes until the next attempt. Never restore a backup over live data to undo a schema change. Afterwards, adopt expand and contract for renames.
- **Trade-off:** Fixing forward under pressure risks a second bug. The rollback route is slower and safer.
- **Follow-up to expect:** "Rows written since the release?" The backfill from the new column covers them.

</details>

<details>
<summary>Practice question 5. Write the canary plan for a change to Thornbury's pricing engine.</summary>

- **Answer:** Deploy behind a flag. Stages: 1% for an hour, 10% for a day, 50% for a day, then 100%. Compare canary with control on errors, 95th-percentile latency, quotes accepted per 100 shown, and average price per tonne within an agreed band. Run at least one full business day at 10% to include the morning peak. Halt automatically if acceptance drops 3 points or prices leave the band. Name who watches each stage and who approves the next one.
- **Trade-off:** Longer stages give clearer signals and delay the benefit.
- **Follow-up to expect:** "Some customers see two prices on one day." Pin each customer to one version for the canary's length.

</details>

<details>
<summary>Practice question 6. Lanark needs a required consent timestamp on every loan application. Older versions of its mobile app cannot send it. How do you add it safely?</summary>

- **Answer:** Expand: add a nullable column. Change the API to accept the field, store it when present and record a missing reason when not. Release app versions that send it, and track the share of traffic from old versions. Backfill existing open applications from the consent records system, listing gaps for the compliance team. When old versions fall below an agreed share, require the field in the API, return a clear upgrade message to old apps, then add the database constraint.
- **Trade-off:** Waiting for old apps delays the rule. Forcing it early blocks customers mid-application.
- **Follow-up to expect:** "Compliance needs it now." Collect it on a follow-up screen for old apps.
- **Go deeper:** [Roll out changes gradually](../../../../01_Concept_Tutorials/Consolidated_Lessons/T1.4_Cloud_Containers_and_Deployment/04_Roll_Out_Changes_Gradually.md).

</details>

## Live data migration

Taught in [migrating live data](03_Migrating_Live_Data.md).

<details>
<summary>Practice question 7. During a parallel run at Lanark, customers receive two text messages for every loan decision, one from each system. Respond, then redesign the run.</summary>

- **Answer:** Stop the new system's sending at once: disable its messaging adapter or flag. Count the affected customers and work with Lanark's customer team on whether a short correction message is needed. Redesign: the old system stays the system of record and the only one that acts. The new system writes intended messages to a log, which you compare with what the old system sent. Add idempotency keys per decision and message type so the gateway rejects repeats.
- **Trade-off:** Compare mode cannot test the real messaging path. Test that separately against a sandbox.
- **Follow-up to expect:** "How did this pass review?" The plan compared data and never listed side effects.

</details>

<details>
<summary>Practice question 8. Design the migration of Thornbury's 1.2 million bookings to the new database with no more than 15 minutes of write freeze.</summary>

- **Answer:** Take a bulk copy at a recorded log position and start change capture from that position. Apply changes idempotently, including deletes, keyed on booking ID with the source log position. Keep lag under a minute and alert on it. Reconcile continuously: counts, then per-day checksums, then open collections per depot. At cutover, freeze writes, wait for lag to reach zero, run the final reconciliation and switch. Rehearse the whole cutover on a full copy to prove 15 minutes.
- **Trade-off:** Change capture needs log access from the database team. A longer freeze with a plain copy avoids it.
- **Follow-up to expect:** "A column is added to the old schema mid-migration." Update the transform before the column carries data.

</details>

<details>
<summary>Practice question 9. Lanark wants evidence that the new document extraction service matches the old one before any officer uses it. Design shadow traffic.</summary>

- **Answer:** Copy each upload request to the new service asynchronously, so users never wait on it. The new service writes to its own store and sends nothing onward. Store both outputs keyed by request. Compare field by field after normalising formats, and report match rates per document type and branch. Sample if the new service cannot take full load. Agree thresholds with Lanark's operations lead, such as 98% field match on payslips, before moving to a canary.
- **Trade-off:** Shadowing doubles processing cost for the trial period.
- **Follow-up to expect:** "The documents contain personal data." Keep shadow outputs inside Lanark's estate with the same retention.

</details>

## Cutover

Taught in [cutover and rollback decisions](04_Cutover_and_Rollback_Decisions.md).

<details>
<summary>Practice question 10. Write Lanark Bank's cutover checklist for moving the loan document service to a new platform over a weekend.</summary>

- **Answer:** Two weeks before: reconciliation thresholds signed, rollback rehearsed, support rota, notices to branches, change freeze. Friday: go or no-go chaired by the decision owner, recorded. Saturday: freeze writes, wait for lag to reach zero, final reconciliation, switch routing, smoke tests. Sunday: officers at two branches test real workflows. Each step has an owner, duration, check and failure action. Triggers and the point of no return are written on page one, with the decision owner's number.
- **Trade-off:** A full rehearsal costs a weekend. Skipping it moves the surprises to go-live.
- **Follow-up to expect:** "What does hypercare look like?" Daily trigger review and reverse sync for two weeks.

</details>

<details>
<summary>Practice question 11. Ninety minutes into Lanark Bank's weekend cutover, one branch's officers cannot open applications submitted since cutover. The trigger is 60 minutes with no workaround, and it is crossed. Your engineers say the fix needs another hour. 300 applications have arrived on the new platform, and the point of no return is Monday at 07:00. What do you do?</summary>

- **Answer:** Brief the decision owner in the agreed shape: which trigger, the impact (one branch, 300 applications on the new platform), the fix and its time, the rollback and its time, and your recommendation. Look for a workaround that keeps critical work running, such as another branch working that branch's queue. With one, allow the fix inside a time box, such as 45 minutes, and decide again when it ends. Without one, recommend rollback while the point of no return is far off. Freeze the new platform, replay the 300 recorded commands into the old service with the new IDs as idempotency keys, reconcile open applications per branch, then reopen on the old service and tell the branch.
- **Trade-off:** Rolling back costs the weekend and a new cutover date. Fixing past the time box risks reaching Monday with neither system trusted.
- **Follow-up to expect:** "The fix lands five minutes after the time box ends. Do you still roll back?" The decision owner decides. The time box forces that call; the owner may extend it once, on evidence the fix works.

</details>

## Recovery

Taught in [backups, RTO, RPO and restore drills](05_Backups_RTO_RPO_and_Restore_Drills.md).

<details>
<summary>Practice question 12. Thornbury's board wants the booking system back within 1 hour of a regional outage, losing at most 5 minutes of bookings. Design it and plan the drill.</summary>

- **Answer:** A restore from backup takes hours, so a 1-hour RTO needs a warm standby in a second region with replication lag under a minute. Keep backups and archived logs too, because the replica copies mistakes. Replicate the secret store, keep infrastructure as code for both regions and make keys usable from the second region. Drill quarterly: fail over to the standby, time it, have depot staff make and print a booking, and record data lost.
- **Trade-off:** The standby costs a second database running all the time.
- **Follow-up to expect:** "Who decides to fail over?" A named owner, against written triggers.

</details>

<details>
<summary>Practice question 13. Ransomware has encrypted Thornbury's booking database and its last three nightly backups. A weekly copy in locked storage is six days old, and archived logs exist for four of those days. Recover.</summary>

- **Answer:** Isolate first: rebuild in a clean account, with fresh credentials, so the attacker cannot reach the restore. Verify the locked weekly copy, restore it, and replay the four days of archived logs. That leaves about two days lost. Rebuild those from other records: haulier confirmations, customer emails, invoices and depot paper sheets. Give the business owner the exact window and list of rebuilt bookings early. Afterwards, add daily locked copies and nightly test restores.
- **Trade-off:** Rebuilding from partners' records is slow and accurate. Asking customers to re-book is faster and damages trust.
- **Follow-up to expect:** "Are the logs safe to replay?" Check for tampering first.

</details>

## References

1. The lessons linked under each heading in this module.

## Key takeaways

- When one digest behaves differently, compare configuration, flags, permissions, data and infrastructure.
- A canary fails on a worse business outcome even with flat errors.
- Keep rollback open with expand and contract, and plan fix-forward for when it closes.
- In parallel runs, one system acts and the other logs intent.
- When a trigger is crossed, the decision owner decides, and any fix attempt runs inside a time box.
- Recovery targets are proved by drills, and backups need locked generations.

## Check yourself

<details>
<summary>1. In practice question 4, why not restore last night's backup to undo the rename?</summary>

It would erase every booking and change made since the backup. Re-adding the column and backfilling keeps live data intact.

</details>

<details>
<summary>2. In practice question 12, why keep backups when a warm standby exists?</summary>

The standby receives every change within seconds, including deletes and corruption. Backups and archived logs let you go back to before the mistake.

</details>

<details>
<summary>3. In practice question 11, why does the fix attempt get a time box?</summary>

Without one, a fix that is nearly ready keeps running past the point of no return, and the choice to roll back is lost.

</details>
