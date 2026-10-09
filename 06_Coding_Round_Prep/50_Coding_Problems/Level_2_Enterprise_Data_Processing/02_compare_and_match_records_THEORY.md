# Compare and Match Records: the ideas behind problems 13, 18, 15

Enterprise data rarely lives in one place. The same customer sits in a CRM and a warehouse, the same document arrives from two sync runs, and the same complaint arrives as ten tickets. A GenAI assistant that reads this data will repeat its contradictions with full confidence. These problems are about spotting where records disagree or repeat, so the problem is found before a model turns it into an answer.

## Source of truth

**What it is.** The source of truth is the system whose value wins when two systems disagree. It can differ per field.

**Why it matters.** If the CRM says "active" and the warehouse says "churned", the assistant has no way to know which is right. Maybe billing status should come from the warehouse while the account owner comes from the CRM. Until someone decides, the honest move is to detect and report the conflict, not to pick a winner in code.

> Say it like this: "Before I fix anything I'd ask which system wins for this field, because detection and repair are different jobs."

## Keys and normalisation

**What it is.** A key is the value you use to decide that two records are about the same thing. Normalisation means cleaning values (case, spaces, punctuation) so equal things look equal.

**Why it matters.** `"Active "` and `"active"` mean the same status, and `"Login not working!"` and `"login not working"` are the same ticket. Without cleaning, you report false mismatches or miss real duplicates. But cleaning too hard can merge things that differ, so the cleaning rule is a choice to say out loud.

> Say it like this: "I clean values just enough that the same thing compares equal, and I keep the tenant in the key so customers never mix."

## Union versus intersection

**What it is.** The union of two sets is everything in either one. The intersection is only what is in both.

**Why it matters.** This small choice decides what the report means. Reconciling customers uses the union, because a customer missing from one system is itself a problem worth reporting. Detecting version conflicts uses the intersection, because a document in only one source is a different kind of problem (missing or deleted) and deserves its own report.

> Say it like this: "I pick union or intersection on purpose: union when a missing record is a finding, intersection when only shared records can conflict."

## Detect first, repair later

**What it is.** Detection finds and lists the problems. Repair changes data to fix them. Keeping them apart means a person or an approved rule decides the fix.

**Why it matters.** Merging two tickets or overwriting a CRM field is hard to undo. If a duplicate detector auto-merges two different customers' tickets, you have a privacy incident. A detector that only returns pairs or IDs is safe to run often, and the risky step can have a human check.

> Say it like this: "My function only reports; changing customer data happens in a separate step with a clear rule or a human approval."

## Stable output

**What it is.** Stable output means the same input always gives the same result in the same order.

**Why it matters.** Python sets have no guaranteed order. A report built straight from a set can list IDs in a different order each run, which breaks tests and makes two reports hard to compare. Sorting the result costs one word and makes the output easy to diff and audit.

> Say it like this: "I sort the result so the report is the same every run and easy to compare."

## How the problems use these ideas

- **Problem 13, Reconcile CRM and Data Warehouse Records.** Uses the union of customer IDs, light normalisation of strings, and sorted output. It raises the source of truth question without answering it in code.
- **Problem 18, Data Connector Sync Conflict Detection.** Uses the intersection of document IDs, because only shared documents can have conflicting versions. One-sided documents belong in a separate report.
- **Problem 15, Duplicate Support Ticket Detection.** Builds a key from tenant ID plus a cleaned title, remembers the first ticket per key, and returns pairs for review instead of merging.

## Using an AI assistant on these problems

- Say union or intersection in the prompt. Assistants often loop over one input only, which silently drops records that exist only in the other.
- Ask for sorted output explicitly. Code built from sets usually returns in random order.
- Check that the AI does not call `.lower()` on values that might be numbers or None.
- For duplicates, check the key includes the tenant ID, and check later copies pair with the first ticket, not the previous one.
- Ask the AI what its cleaning rule would wrongly merge. Its answer gives you an edge case to mention.

## Words to know

| Term | Plain meaning |
| --- | --- |
| CRM | The sales system that tracks customers and deals. |
| Data warehouse | A central database of cleaned business data used for reports. |
| Reconciliation | Comparing two systems to find where they disagree. |
| Source of truth | The system whose value wins when systems disagree. |
| Normalise | Clean values (case, spaces, punctuation) so equal things compare equal. |
| Union / intersection | Everything in either set / only what is in both. |
| Connector | A job that copies data from a customer system into yours. |
| Tombstone | A record that says "this item was deleted", so a delete is not mistaken for a gap. |
