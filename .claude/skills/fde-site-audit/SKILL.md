---
name: fde-site-audit
description: Re-audit the Forward Deployed FDE interview-prep website (fdeprep.vercel.app; formerly forward-deployed-sigma.vercel.app) for information architecture, onboarding, first-visit experience, page quality, production readiness and content coverage; score it on the 10-dimension rubric against Hello Interview, Aced/Exponent, ByteByteGo and other prep sites; and track every check and score against previous audits in a history file. Use this whenever the user asks to audit, re-audit, review, score, benchmark or check production readiness of the Forward Deployed / FDE prep site, asks how the site scores now, what is still open or fixed since the last audit, whether it is ready to launch, or how it compares with competitors — even if they don't say "audit".
---

# Forward Deployed site audit

A repeatable audit of the Forward Deployed interview-prep site. Each run leaves a dated folder of evidence and one new line in a history file, so progress is measured against the first audit (2026-10-09: content 6.0, structure 4.4, overall 5.2 out of 10, last of seven sites on structure).

Audits are only comparable if the same 73 checks (permanent IDs), the same rubric and evidence for every failure are used each time. Everything below serves that.

`<skill>` means this skill's directory (the base directory shown when the skill loads). Use `python3`.

| File | Use it in |
| --- | --- |
| `references/baseline-2026-10-09.md` — first audit's verdict, the target structure and 12-week plan the owner agreed | Step 1, for context |
| `scripts/crawl_inventory.py` — sitemap crawl and automated scan | Step 2 |
| `references/agent-prompts.md` — three reading tracks, verifier, competitor prompt | Steps 3, 5, 6 |
| `references/browser-checks.md` — browser steps B1–B9 with JS snippets | Step 4 |
| `references/checks.md` (from `data/checks.json`) — all 73 checks with baseline results | Step 5 |
| `references/competitors.md` — competitor URLs, scores, re-benchmark rules | Step 6 |
| `references/rubric.md` — dimension anchors, check→dimension map, `scores.json` format | Step 7 |
| `scripts/score.py` — validation, averages, diffs, history | Steps 1, 7 |
| `references/report-template.md` — report sections and delivery | Step 8 |

## Workflow

Create a task list from these steps; a full audit takes a while and the owner may step away.

### 1. Set up

1. **Site URL**: what the user gives; else the `site` of the latest history entry; else `https://fdeprep.vercel.app`.
2. **Folders**: `.website_spec/site-audits/<YYYY-MM-DD>/` at the root of the current project; history at `.website_spec/site-audits/history.jsonl`.
3. **History**: `python3 <skill>/scripts/score.py seed --history .website_spec/site-audits/history.jsonl` (adds the baseline if missing; safe to repeat).
4. **Start this audit's record**:
   `python3 <skill>/scripts/score.py new --history .website_spec/site-audits/history.jsonl --date <DATE> --out .website_spec/site-audits/<DATE>/scores.json` (add `--site <URL>` if the site moved).
   It carries scores, targets and competitor dates forward and resets every check to `not_checked`, so the file only ever holds what you see today; last time's results stay in the history for comparison.
5. **Context**: read `references/baseline-2026-10-09.md` if this conversation lacks it, and `score.py trend --history .website_spec/site-audits/history.jsonl` to see where things stood.
6. **One question, only if it changes the work**: has the restructure shipped, and with which URLs? (It decides how to read IA-11 and where the casebook lives.) If the user isn't there, assume nothing changed and say so in the report.

### 2. Crawl and scan

```bash
python3 <skill>/scripts/crawl_inventory.py --base <URL> --out .website_spec/site-audits/<DATE> \
  --legacy <skill>/data/legacy-urls-2026-10-09.txt
```

Writes `inventory.json`, `scan-checks.json` (suggested status and evidence for about 36 checks), `scan-summary.md` and `redirects.json`. A recorded audit needs the full crawl; `--limit` is for a quick look only.

- Exit 3: the site isn't reachable or returns 401/403/5xx (deployment protection, firewall, no internet in this shell). Use WebFetch for `/sitemap.xml`, the hubs and a sample of pages instead, and record scan-only checks you couldn't do as `not_checked`.
- Exit 4: most pages failed; read `inventory.json` for the statuses before going on.
- If the casebook moved to URLs other than `/casebook/<slug>`, update `CASEBOOK_ITEM` in the script before trusting CT-01 and CT-08.

The scan suggests; it doesn't decide. Regex can't tell a lesson about `.md` files from a leaked file path, and anything drawn by JavaScript is invisible to it.

### 3. Read pages with parallel subagents

Launch Tracks A, B and C from `references/agent-prompts.md` in one message. Build each track's URL list from this audit's `inventory.json` (the structure may have changed), starting from the baseline lists in the prompts. Each track returns a result line per check ID.

### 4. Browser checks

Run B1–B9 in `references/browser-checks.md` with Claude in Chrome. They decide checks served HTML can't (FV-01, FV-06, ON-08, PQ-13, PQ-14, PR-04, PR-07, PR-11, PR-12, PR-17 and more). Never clear the site's localStorage: it holds the owner's saved answers. No browser available: mark those checks `not_checked`.

### 5. Verify, then record all 73 checks

Confirm a fail before recording it when it is surprising, decides a score, or contradicts the last audit — in the browser, or with the verifier prompt. The first audit had two false positives from page-text reading (the 404 page and diagrams) that only the browser caught. When sources disagree: browser over reading, reading over scan.

Record every check in `scores.json` → `checks` as `pass`, `partial`, `fail`, `na` or `not_checked`, with evidence (URL plus a quote or count) for anything not passing and a short reason for `na` or `not_checked`. Two checks need the owner: PR-14 (content rights) and PR-19 (monitoring). Record what they've told you, otherwise `not_checked`, and list both under "Owner to confirm" in the report.

A problem no check covers: add a check to `data/checks.json` with the next free ID in its lens, run `python3 <skill>/scripts/render_checks.py`, then record it. IDs are never renumbered, reused or deleted.

### 6. Competitors

Carry competitor scores and their `scores_as_of` dates forward unless the last benchmark is over 90 days old or the user asks. To re-benchmark, follow `references/competitors.md`.

### 7. Score

Update the Forward Deployed dimension scores using `references/rubric.md`: start from the previous score, move it only when checks mapped to that dimension moved (or new evidence appeared), and give the reason with check IDs in `rationale`. Then:

```bash
python3 <skill>/scripts/score.py report --scores .website_spec/site-audits/<DATE>/scores.json \
  --history .website_spec/site-audits/history.jsonl --out .website_spec/site-audits/<DATE>/score-summary.md
```

It refuses incomplete files (missing dimensions or checks, invalid statuses, fails without evidence). Fix the file rather than forcing it. Use the like-for-like pass rate (checks assessed in both audits) when describing progress, since the plain pass rate also moves when fewer checks were assessed.

### 8. Report, then record

1. Write `.website_spec/site-audits/<DATE>/report.md` from `references/report-template.md`, using the numbers in `score-summary.md`. Say whether the site is ahead of or behind the 12-week plan.
2. If the Claude Docs connector is available, publish the report as a doc and put its link in `scores.json` → `docs`.
3. Add the audit to the history: re-run the step 7 command with `--append`. It refuses a date already in the history; use `--replace` only to redo today's audit on purpose.
4. In chat: the verdict, overall score and its change, the top three next fixes, and the report link.

## Two rules that matter most

- **Evidence or it didn't happen.** Every `fail` and `partial` carries a URL and a quote or count, so the next audit can re-check it in minutes.
- **Protect the core.** CT-08 (the 33-design casebook) and CT-09 (the write-first worksheet loop) are what the site does better than every competitor. Any regression there is the report's first finding.

## Example

"I merged the casebook hubs and added an About page — re-audit the site?" → Seed and copy the record; the crawl shows 12 old case URLs returning 404 (IA-11 fail, newly assessed); Track B confirms one casebook hub (IA-02 pass); browser checks pass PR-05. Navigation 3 → 5, credibility 3 → 5, overall 5.2 → 5.6. Report lead: "The casebook merge worked, but 12 old case URLs now 404 — add redirects before sharing the site."
