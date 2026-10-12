# Prior Authorisation Packets Client Simulation

This is a 45-minute client simulation about a document-processing workflow in healthcare: the interviewer plays the customer and answers only what is asked. The customer wants the whole process automated, and the constraints that decide what is safe to build sit with people she has not mentioned yet. With a partner, hand them this page and have them reveal a constraint only when your question earns it; alone, read the opening brief, write your questions down, then open one constraint at a time, and only for a topic you actually asked about.

## The Customer

The customer is the director of patient access at a regional hospital network with several hospitals and outpatient clinics. Her team of prior authorisation coordinators gets insurers' approval before scans and procedures go ahead. The insurer in this process is called the payer.

> "My coordinators spend all day on prior authorisations. I want AI that reads the chart, checks the payer's rules and submits the request, so my team can stop doing it by hand."

She cares about patients waiting for procedures, denials that cost the network revenue, coordinators leaving because the work is relentless, and staying on the right side of patient privacy.

## The Opening Brief

"Thanks for coming. Prior authorisations are killing us. Before we can do a scan or a procedure, the patient's insurer has to approve it, and every insurer has different rules. My coordinators dig through the chart, find the notes and results the insurer wants, fill in the forms and send them off. When something's missing, it's denied, we start again, and the patient waits. I want AI to do this end to end. What do you need from me?"

## Hidden Constraints

<details>
<summary>Reveal when the candidate asks about who signs or approves a request</summary>

"Every request goes out under a clinician's name. Our medical director has been clear: nothing is submitted without a clinician or a trained coordinator reviewing it. That's in our compliance policy, and I can't change it."

**Why it matters:** End-to-end submission is off the table. The product is a complete, checked draft packet that a person reviews and a clinician signs. Learning this in discovery is far cheaper than learning it at the first demo.

</details>

<details>
<summary>Reveal when the candidate asks about access to patient records or privacy</summary>

"Patient records are in our EHR. The privacy office will approve read access through the EHR's FHIR interface, and only for patients on a coordinator's own work queue. Patient data can't leave our approved cloud environment, and no vendor may train on it."

**Why it matters:** Retrieval must be scoped to one patient and one queue, reading only the records the request needs. The privacy rule constrains where models can run, and every chart access needs an audit record of who looked, at what, and why.

</details>

<details>
<summary>Reveal when the candidate asks about where the payer rules come from</summary>

"We deal with [number of payers] payers. Each publishes its own criteria, mostly as PDFs on its portal, and they update them [how often payer criteria change]. Nobody keeps a central copy; each coordinator has their own bookmarks."

**Why it matters:** There is no trusted rules corpus to retrieve from. The first workstream is a curated, dated library of criteria with a named owner. A check against an out-of-date criterion produces exactly the denial the project is meant to prevent.

</details>

<details>
<summary>Reveal when the candidate asks about volume, time per case or why requests are denied</summary>

"We handle about [prior authorisations per week]. Each takes a coordinator roughly [minutes per case]. Our first-time denial rate is [first-pass denial rate], and the most common reason is missing documentation."

**Why it matters:** This is the baseline and the core job. The most valuable thing the system can do is find what is missing before submission. Time per case and missing-documentation denials are the measures the pilot should move.

</details>

<details>
<summary>Reveal when the candidate asks about which procedures or specialties to start with</summary>

"Imaging is most of our volume, then a handful of outpatient procedures. Oncology drugs are the hard ones: long criteria, frequent changes, and calls with the payer's own doctor."

**Why it matters:** The painful case is not the right first case. Imaging for the largest payers has high volume and stable criteria, so it proves value and builds trust. Oncology waits until the approach has earned it.

</details>

<details>
<summary>Reveal when the candidate asks about how requests are submitted today</summary>

"Submission happens on each payer's portal, and a few still want a fax. Some accept electronic submissions through our clearinghouse, but IT say that integration is a [clearinghouse integration lead time] project."

**Why it matters:** Submission is the hardest step to automate and the least valuable. The first slice should end at a reviewed packet that the coordinator submits the way they do today.

</details>

<details>
<summary>Reveal when the candidate asks about what the chart documents look like</summary>

"A lot of what payers want, like outside imaging reports and referral letters, arrives as scanned faxes attached to the chart. Some of them are barely readable."

**Why it matters:** Text extraction from scans will sometimes fail. An unreadable page must show up as a gap the coordinator resolves, never as text the model fills in. A packet built on a misread scan is worse than no packet.

</details>

## How the Round Runs

| Time | Phase | The candidate | The customer |
|---|---|---|---|
| 0–15 min | Discovery | Walks one request end to end, then asks about sign-off, privacy, payer rules, volume, case mix, submission and document quality | Answers only the question asked; assumes "end to end" is possible |
| 15–20 min | Framing back | Plays back the sign-off rule, the missing-documentation problem, scattered rules, scanned evidence and manual submission | Confirms, and admits she had not raised the medical director's rule |
| 20–35 min | Shaping a first slice | Proposes an evidence checklist and draft packet for imaging with the largest payers, human-reviewed, with submission unchanged | Pushes: "Can't it at least submit the simple ones?" |
| 35–45 min | Risks and next steps | Names the top risks with controls, how the pilot will be judged and the next actions with owners | Asks what her coordinators will see in the first month |

## What a Strong Candidate Says

**Discovery**

- "Can you walk me through one imaging request from start to finish? Where does the time go?"
- "Who signs the request, and could anything ever go out without them?"
- "Where do the payer rules live, and how do you know they're current?"
- "What does the evidence look like: structured fields, notes, scanned letters?"
- "Why do requests get denied today?"

**Framing back**

- "So each request takes about [minutes per case], and most denials come from missing documents. A clinician signs every request. Payer rules are scattered and change often. A lot of the evidence is scanned. And submission happens on portals or by fax. Did I get that right?"

**Shaping a first slice**

- "I'd start with imaging for your top [number of pilot payers] payers."
- "For each patient on a coordinator's queue, the assistant checks the chart against the current payer criteria and builds a checklist: each criterion, the evidence it found with a link to the exact note, or 'missing'."
- "It drafts the form. The coordinator reviews, the clinician signs, and submission stays as it is today."
- "If a scan is unreadable, it says so. It never guesses what a document says."

**Risks and next steps**

- "The two big risks are an out-of-date payer rule and a link to the wrong evidence. So we keep a dated rule library with an owner, and we test that every link points to the right line."
- "We'll judge it on time per case and missing-documentation denials, against your current [first-pass denial rate]."
- "Next steps: a privacy office review of read access, a lead coordinator as our day-to-day partner, and [number of historical cases] past cases with their outcomes to test against."

## Score the Round

| Dimension | Strong evidence in this round |
|---|---|
| Discovery questions | Walks a real request end to end, then asks who signs, how chart access is approved, where payer rules live, why requests are denied and what the documents look like |
| Handling constraints | Turns each constraint into a choice: human sign-off, queue-scoped read access inside the approved environment, a dated rules library, unreadable scans shown as gaps, submission left manual |
| Framing back to the customer | Plays back the clinical sign-off rule and the missing-documentation problem in the customer's language, with her figures, and checks before proposing |
| Scoping | Imaging, largest payers, checklist and draft packet only; says why oncology and automated submission wait, and holds that line when pushed on "the simple ones" |
| Next steps | Privacy office review, a lead coordinator as partner, historical cases with outcomes for testing, an owner for the rules library |
| Communication | Calm and plain with a stretched operational leader; never makes a medical judgement or implies the system decides medical necessity |

Score each dimension from 1 to 5 with the scorer below; a 4 or 5 needs a quoted line of evidence, and a pass is no dimension below 2 and a mean of 3 or more.

## Common Mistakes

- Designing portal automation and end-to-end submission first, the step with the most risk and the least value.
- Letting the system judge medical necessity instead of matching evidence to written criteria and flagging gaps.
- Pulling the whole chart into the prompt instead of reading only what the request needs for a patient on the coordinator's queue.
- Assuming payer criteria already exist as a clean, current corpus.
- Ignoring scanned faxes, so unreadable evidence is silently filled in or skipped.
- Starting with oncology because it is the most painful, rather than imaging because it proves value safely.
