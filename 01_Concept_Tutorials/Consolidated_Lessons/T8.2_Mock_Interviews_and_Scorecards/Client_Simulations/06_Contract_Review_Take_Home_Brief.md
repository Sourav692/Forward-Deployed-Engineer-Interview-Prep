# Contract Review Take-Home Brief

Many FDE loops include a take-home, either in place of a live design round or before it. You receive a customer brief with deliberate gaps and a time box, here three to four hours, and you send back a short written submission. The panel reads it before the follow-up interview, where you walk through it and then defend it while one interviewer plays the customer.

The submission is judged on judgement, not length. A tight first slice, honest assumptions and a clear risk list beat a long architecture document. Stop when the time box ends, and say what you would do with more time.

## The Brief

The customer is the legal team at a mid-sized logistics company that runs warehouses and freight forwarding. The team has [number of lawyers] lawyers and [number of contract managers] contract managers. They review supplier, customer and carrier contracts, many of them on the other side's template. Sales and operations complain that contracts sit with legal for [current review turnaround], and deals slip.

The head of legal put the ask like this:

> "We get more contracts than we can read properly. I want a tool that reads every incoming contract, marks it up against our playbook and sends the redline back to the counterparty, so my lawyers only see the unusual ones."

Your task is to design the first version you would deliver in an engagement of [engagement length], and to explain how you would move from there towards the head of legal's vision, or why parts of it should not happen.

## Constraints and Data

You have the notes from a first discovery call. Treat anything not listed here as unknown, and state your assumptions.

| Area | What the notes say |
|---|---|
| Volume | [contracts per month] across supplier, customer and carrier agreements; [share on counterparty paper] arrive on the counterparty's template |
| Formats | Word files, native PDFs and scanned signed PDFs; rate tables and liability schedules often sit in tables |
| Playbook | Preferred and fallback positions for [number of playbook clause types] clause types, including liability caps, indemnities, payment terms, termination, governing law and data protection; last updated [playbook last updated]. Senior counsel says "a lot of what we actually accept isn't written down." |
| Systems | A CLM (contract lifecycle management) system holding executed contracts and their metadata; negotiation by email; an e-signature platform. Read access to the CLM is possible; write access needs IT approval. |
| Jurisdictions | Contracts governed by [governing laws in scope] |
| Confidentiality | Some contracts carry confidentiality obligations, and privileged advice notes are stored next to some contracts. No contract text may be used to train a vendor's model, and data must stay in [approved hosting region]. |
| Roles | Only qualified lawyers may give legal advice to the business. Contract managers may agree terms within the playbook's preferred and fallback positions. |
| Baseline | Turnaround of [current review turnaround]; [current lawyer escalation rate] of contracts reach a lawyer today |
| History | [number of historical contracts] executed contracts, each with the first draft received and the final signed version |

## What to Submit

Keep the whole submission to five pages or fewer, plus one optional diagram.

1. **Design note (up to two pages).** The problem as you understand it, the users, the first slice, an architecture sketch in words or one diagram, and how you would evaluate it.
2. **First slice (half a page).** What is in, what is out and why, and the success measures, with [bracket] placeholders for any number only the customer can give.
3. **Risk list (up to one page).** The top risks, each with its impact, a control and an owner.
4. **Demo plan or prototype outline (up to one page).** What you would show the head of legal at the first demo, on which documents, and what she should be able to judge from it.
5. **Open questions (half a page).** The questions you would still ask, ranked by how much each answer would change the design.

Code is optional. A clear prototype outline earns the same marks as a working prototype. A working prototype with no scope or risk thinking earns fewer.

## Example Submission

**Example only.** What follows is an abridged strong submission in the candidate's voice. It shows the shape and the judgement expected, not the only right answer.

### Framing

The pain is not reading contracts. It is that every contract waits in one queue for scarce lawyer time, whether it is routine or unusual. The first release should get routine contracts through faster without a lawyer, and send unusual ones to a lawyer with the issues already found.

Sending redlines to counterparties without a person is out of scope. It would be the company stating a legal position to a third party, and only lawyers, or contract managers within the playbook, may do that.

### Users

Contract managers are the primary users. Lawyers review escalations. The head of legal owns the playbook and the outcome. Sales and operations request reviews and see status only.

### First Slice

- **In:** supplier agreements under one governing law, in Word or native PDF, on our template or the counterparty's.
- **What it does:** extracts the playbook clauses, compares each with the preferred and fallback positions, and produces a review sheet. For each clause the sheet shows its status (matches preferred, within fallback, outside the playbook, or missing), quotes the exact text, and suggests fallback wording taken from the playbook.
- **Who decides:** a contract manager accepts or edits each item. Anything outside the playbook goes to a lawyer with the review sheet attached.
- **Out, for now:** scanned PDFs (routed to manual review until extraction is tested on them), customer and carrier agreements, automatic sending, and write-back to the CLM.
- **Success measures:** time from receipt to first response, against [current review turnaround]; the share of contracts closed by contract managers without a lawyer; lawyer agreement with the clause statuses on a held-out set; and no contract sent externally without a named person.

### Architecture in Brief

A contract arrives through the CLM or a shared inbox. Text and table extraction runs first, with a coverage check that blocks the contract if pages or tables are missing. Clauses are segmented and classified. For each clause, the matching playbook rule is retrieved; rules are versioned and each has an owner. The LLM compares clause and rule and drafts any suggested wording, quoting the exact clause text. A separate check confirms every quoted span exists in the document. The review sheet lands in the contract manager's queue, and every decision is logged.

Everything runs inside [approved hosting region]. Contract text is never used for training. Privileged advice notes are excluded from the index. Text inside a counterparty's document is treated as data, never as instructions, and the tool's only output is an internal review sheet.

### Evaluation

Before the pilot, I would run the historical contracts through the tool: first drafts in, then compare what it flags with what actually changed in the final signed version, and have a lawyer grade a sample. The launch gates, agreed with the head of legal, would be: no missed out-of-playbook clause in the high-risk types (liability and indemnity), quoted text always correct, and lawyer agreement above a threshold she sets.

### Risks (Abridged)

| Risk | Impact | Control | Owner |
|---|---|---|---|
| An out-of-playbook clause is marked acceptable | The company accepts a term it would have rejected, such as uncapped liability | Recall-first settings on high-risk clause types; anything uncertain goes to a lawyer; held-out test before launch | Head of legal |
| The playbook is incomplete | The tool flags positions the team routinely accepts, and contract managers stop trusting it | Sessions with senior counsel to write down accepted positions, starting with the pilot clauses; a log of mismatches feeds updates | Senior counsel |
| A table or page is lost in extraction | A liability schedule is never reviewed | Coverage check blocks the contract; scanned PDFs stay manual in the first slice | FDE team |
| Hidden instructions in counterparty text | The tool's output is steered by the other side | Document text treated as data; output is an internal review sheet, not an action | FDE team |
| Privileged notes surface in a review sheet | Privilege could be lost if the sheet is shared | Notes excluded from the index; review sheets internal only | Legal operations |

### Demo Plan

At the first demo, I would run real past supplier agreements chosen by the head of legal, including one she knows was difficult. I would show each review sheet next to the final signed version, so she can see what the tool would have caught and what it missed, and I would show the missed items first.

### Open Questions

1. Which clause types have caused real losses or disputes? This sets the high-risk list and the gates.
2. Can senior counsel spend time writing down the positions the team accepts but has never recorded?
3. How common are scanned contracts among supplier agreements?
4. What may a contract manager send to a counterparty today without a lawyer?

### Path Towards the Vision

If the pilot holds its gates for [pilot review period], the next steps are more contract types, then a pre-drafted redline that a contract manager reviews and sends from their own email. I would not recommend fully automatic sending to counterparties: the time saved over a one-click send is small, and the risk sits with the company.

## Scoring Guide

| Criterion | What earns full marks | Common gaps |
|---|---|---|
| Problem framing and assumptions (15 points) | Restates the real problem as lawyer time spent on routine contracts, names the users and decision owners, and lists assumptions openly | Repeats the ask as given; hides assumptions inside the design |
| Scope of the first slice (25 points) | One contract type and one governing law, a review sheet with a human decision, a clear in and out list with reasons, and a reasoned pushback on automatic sending | Builds the whole vision; cuts scope without saying why; no success measures |
| Architecture and controls (20 points) | Extraction coverage gate, versioned playbook rules, exact quoted text with a separate check, residency and no-training terms, privilege exclusion, decision log | Generic "RAG over contracts"; privilege and confidentiality never mentioned; citations never checked |
| Evaluation plan (15 points) | A backtest on first-draft and final-version pairs, a lawyer-graded sample, and recall-first gates on high-risk clauses agreed with the customer | "Test on some contracts"; accuracy with no definition; invented thresholds presented as facts |
| Risks and mitigations (15 points) | Top risks ranked by impact, each with a control and an owner, including the incomplete playbook and scanned documents | Generic risks such as "hallucination" or "cost" with no control or owner |
| Communication (10 points) | Within the page limits, in plain language a head of legal can read, with placeholders wherever a customer number is needed | Over length, heavy jargon, or made-up figures |

## How It Is Discussed in the Follow-up

The follow-up usually runs 45 to 60 minutes and follows a familiar shape.

1. **Walk-through.** You present the submission in about ten minutes. Lead with the first slice and the one decision you most need the customer to agree with, not with the architecture.
2. **Customer challenge.** An interviewer plays the head of legal and pushes on what you cut: "My lawyers are still the bottleneck. Why can't it just send the redlines?" Hold your position with reasons, and offer the path that gets her closest to her goal safely.
3. **A changed constraint.** The panel changes one fact. IT refuses read access to the CLM, most supplier contracts turn out to be scanned, or senior counsel leaves and takes the unwritten playbook with her. Show what changes in your scope and what stays the same.
4. **The weakest part.** The panel will find the thinnest section of your submission. Name it before they do if you can, and say what you would do with more time.
5. **The executive close.** Give the 30-second version: the problem, the first slice, how you will know it worked, and what you need from the customer.

The panel is checking three things. Does your spoken answer match what you wrote? Do you update when given a new fact, rather than defending the original plan? And do you know your own placeholders: which numbers you need from the customer, and how each one would change the design?

Before the call, reread your submission, prepare a one-line answer for each risk, and bring your open questions. The follow-up is often the right moment to ask them.
