# CTO Trust + Exec Vision → Engineering Roadmap (Round 2, P1)

Built from: `04_Behavioral_and_Leadership/story_bank.md`, `hiring_manager_round/02_stakeholder_influence` (+ answer key), `04_pushback_and_saying_no`, `01_Concept_Tutorials/FDE_Handbook/10_FDE_Delivery_Operating_Model/03` (14-day plan) and `04` (gates and metrics), `02_System_Design_Case_Studies/Standalone_Designs/60_Prioritize_AI_Use_Cases` (scoring model). What's new here is the **CTO framing, the story-to-question map, and a Blitzy-specific roadmap template**.

---

# Part A — CTO Trust

## A1. What a CTO is actually evaluating

| They ask themselves | You prove it by |
|---|---|
| "Does this person understand *my* estate and constraints?" | Restating their constraints before proposing anything |
| "Will they tell me bad news early?" | Volunteering a risk they hadn't raised |
| "Do they know where their product is weak?" | Saying what Blitzy is *not* good for |
| "Can they talk to my board *and* my architects?" | Switching between outcome language and mechanism language |
| "Will they own the outcome, or just the SOW?" | Tracking a business metric, not tasks |

## A2. Advisor vs. executor

| Situation | Executor | Trusted advisor |
|---|---|---|
| CTO asks for full autonomy on payments code | "Sure, we can configure that" | "We can. Here's the blast radius if one merge is wrong, and here's a risk-tiered version that's 80% as fast" |
| Pilot is behind | Reports task status | Reports the business impact, the cause, and a recovery option with its trade-off |
| Customer picks the wrong first use case | Builds it | Shows the scoring and suggests a better wave-1, while still respecting their decision |
| Product gap found | Works around it quietly | Works around it *and* takes it back to Blitzy product |

## A3. Executive language translation

| Engineer says | CTO hears it as |
|---|---|
| "The knowledge graph gets stale on high-churn repos" | "Plans may be wrong on your most active code, so we review those plans more strictly" |
| "Flaky tests make validation non-deterministic" | "We can't certify the output until your test suite is reliable. That's a two-week fix that helps you regardless of Blitzy" |
| "We need a parallel run before cutover" | "We prove the new system gives the same answers as the old one before customers touch it" |
| "Full autonomy has no audit trail" | "On the day it's wrong, can you explain why to your regulator?" (from the answer key) |

**Formula:** *risk, cost, time to value, and who answers for it on the day it fails.*

## A4. Building trust with a skeptical CTO or chief architect in 30 days

From `02_stakeholder_influence_answer_key.md`, adapted for Blitzy:

| Week | Move | Blitzy version |
|---|---|---|
| 1 | Concede their expertise and learn the estate | Run reverse-engineering on a repo they pick, then **review the Tech Spec with their architect** and let them correct it |
| 2 | Ship something small and real | One bounded generation: test backfill or a CVE fix on a non-critical module. Real PR, real CI |
| 3 | Name the risk they're privately worried about | "Your concern is probably reviewing 50K-line PRs. Here's how we'd stack and risk-tier them" |
| 4 | Don't oversell; agree the metric | Admit where it struggled; agree on 2–3 pilot metrics with a baseline |

## A5. Story → question map (from your story bank)

⚠️ Use only stories that are yours, and fill in the PARTLY GROUNDED details before you use them (see `story_bank.md`).

| Likely Round 2 question | Best story | One-line hook |
|---|---|---|
| "Tell me about influencing a senior technical leader's decision" | *Financial services: red-teaming before saying no* | "Instead of arguing from principle, I red-teamed it and brought the failures to the table" |
| "When did you push back on an exec?" | *Insurer: starting narrow when the sponsor wanted wide* | "I framed it as their risk, not my convenience" |
| "How did you earn credibility fast?" | *Lender: read 200 tickets before writing code* | "Found three problems, not one, so I built three routes, not one bot" |
| "A time you delivered bad news" | *Insurer: one agent to a supervisor* | "Told the sponsor the same day, with the mechanism and the fix, and still shipped on time" |
| "Autonomy vs. control with a customer" ⭐ Blitzy | *Lender: no unreviewed writes to production* | "Every action became a finding for an engineer to confirm, and I told them what that cost" |
| "Explaining a technical trade-off to a non-technical exec" | *Insurer: two checkpoints in plain words* | "Explained it to compliance without a word of jargon" |
| "Owning a mistake" | *Meridian: the false-alarm leak* | "Wrote up the whole thing, including my own labelling mistake" |
| "What would you do differently?" | *Lender: the metric I couldn't prove* | "Now the first thing I agree on any engagement is the baseline" (ties to the Blitzy POC metric) |
| "Thinking beyond one customer" | *Beyond one engagement: patterns that travel* | "I taught the pattern, not the solution" (ties to Blitzy Rules and templates) |

## A6. Five CTO-trust behaviours to name explicitly

| Behaviour | Say it like |
|---|---|
| Bad news travels fast | "The CTO should never hear about a problem from their own team first" |
| Credibility through limits | "The fastest way I've found to earn trust is to say what the platform isn't good for" |
| Own the outcome | "I track their metric, not my task list" |
| Disagree, then commit | "I put my view in writing with the risk. If they still choose differently, I make their choice succeed" |
| Concede something | "I pick disagreements where I had to give ground. Winning every argument isn't influence" |

---

# Part B — Exec Vision → Engineering Roadmap

## B1. The pipeline (draw this)

```text
Vision (exec words)
  → Outcomes (measurable, with a baseline)
    → Constraints (budget, risk appetite, regulators, team capacity)
      → Candidate initiatives (cards)
        → Gates (refuse what can't be measured or owned)
          → Scored + bucketed (Now / Next / Later / Enabler / Buy)
            → Waves with milestones + exit criteria
              → Governance (cadence, metrics, re-plan triggers)
```

## B2. Clarifying questions (ask before planning)

From `60_Prioritize_AI_Use_Cases` §2:

| Ask | What changes with the answer |
|---|---|
| What does success look like in 12 months, as a number? | Turns the vision into an outcome |
| Who owns each outcome and who is the SME? | No owner means it isn't scheduled |
| Budget and horizon: one team for a quarter, or a two-year programme? | Size of wave 1; whether enablers get funded |
| Risk appetite, and which regulator? | Where the review gates sit |
| What was tried before, and why did it stall? | Whether the blocker is data, adoption or trust |
| What must *not* change? (systems, APIs, teams) | Hard constraints |

## B3. Gates, then score

| Gate (fail = not scheduled) | Scoring (weights from the repo model) |
|---|---|
| Measurable outcome with a baseline | Value 25% |
| Named owner + SME | Feasibility 15% |
| Permissible decision (no unreviewed adverse action) | Data/code readiness 15% |
| Right tool (rules, deterministic recipe, or buying might beat AI) | Risk (inverted) 15% |
| | Evaluability 10% · Time to value 10% · Platform reuse 10% |

Also mention these frameworks by name (RICE, WSJF, MoSCoW), then say: *"I prefer weighted scoring behind explicit gates, because a gate removes items that look good but can't be owned or measured. A pure score lets them through."*

## B4. Milestone design rules

| Rule | Example |
|---|---|
| Milestones are **outcomes with exit criteria**, not activities | ✗ "Build ingestion" → ✓ "3 repos onboarded; architects sign off the Tech Spec accuracy" |
| Each milestone has a signer (role-based, never seniority-based) | From the Handbook gates: `wrong_role` and `no_evidence` deny rules |
| First value inside 30 days | Time-to-first-value is the strongest trust metric |
| Kill criteria written before the build | "If merged-PR rate is < 50% after 2 projects, stop and re-scope" |
| Re-plan triggers defined up front | Scope change, missed exit criteria, a new regulator ask |

## B5. Business needs vs. technical constraints

| Tension | Resolution pattern |
|---|---|
| Exec wants a big-bang date; engineering needs incremental cutover | Fix the date and make scope variable; phase by module (strangler) |
| Exec wants every BU at once | Prove it in 1–2 units first and frame narrow as *their* risk reduction (story bank) |
| Velocity target vs. review capacity | Review capacity is the real bottleneck. Plan reviewer hours as a resource, not an afterthought |
| Modernize everything vs. keep the lights on | Separate change budget from run budget; freeze windows around critical business periods |
| AI-everything mandate vs. use cases with no owner | Gates: no owner or metric means it isn't scheduled, no matter who asked |

## B6. Blitzy worked example

**CTO vision:** *"Using AI, get off our 15M-line Java 8 + COBOL estate and onto a cloud-native stack within 18 months, without a business outage."*

**Outcomes (agree these first):**

| Outcome | Metric | Baseline needed |
|---|---|---|
| Modernization speed | Modules migrated per quarter | The current rate (probably about 0) |
| Engineering velocity | Lead time per epic | The current lead time |
| Safety | Production incidents caused by migrated code; parallel-run diff rate | Current change-failure rate |
| Cost | Mainframe MIPS / run cost retired | Current spend |

**Roadmap:**

| Phase | Months | Scope | Milestone / exit criteria | Signer |
|---|---|---|---|---|
| 0. Discover | 0–1 | Reverse-engineer the estate (Tech Spec for all repos); dependency map; flaky-test audit | Architects confirm Tech Spec accuracy on 3 sampled systems; module-wave map agreed | Chief architect |
| 1. Prove (POC) | 1–3 | One bounded, low-risk module: Java 8 → 21 upgrade + test backfill | Merged PRs pass CI; review hours per KLOC measured; zero prod incidents | Eng director |
| 2. Pilot | 3–6 | 3–5 modules incl. one COBOL batch job; parallel run against legacy | Parallel-run diff < agreed threshold for 2 weeks; rollback tested | Risk/compliance + CTO |
| 3. Scale | 6–15 | Waves by business domain (strangler); Rules standardised org-wide; reviewer rota | Each wave: diff threshold met, cutover with no SEV1, legacy component decommissioned | Domain owners |
| 4. Retire | 15–18 | Final cutovers, mainframe decommission, handover | Run cost retired against target; runbooks and owners handed over | CTO / CFO |

**Enablers to fund in phase 0–1** (no direct value, but everything depends on them): stable CI/test suites, environment replication for validation, parallel-run harness, reviewer capacity plan.

**Top risks:**

| Risk | Mitigation |
|---|---|
| Flaky or missing tests make validation meaningless | Test-backfill first (Blitzy *add-testing*); baseline-branch check |
| Review capacity becomes the bottleneck | Stacked PRs, risk-tiered review, reviewer hours in the plan |
| Hidden business logic in COBOL | Parallel run + golden-output diff before cutover |
| Scope creep ("while we're at it…") | "Minimal change" instruction + change control via the sponsor |
| Org resistance ("AI will replace us") | Position engineers as reviewers and owners; train early adopters as champions |

**Governance:** a weekly working session with the tech leads; a monthly steering review with the CTO (metrics against baseline, risks, decisions needed); re-plan at the end of each phase.

## B7. Ninety-second model answer

> "I'd start by turning the vision into three or four measurable outcomes with baselines, because without a baseline we can't show progress to the board. Then constraints: budget, risk appetite, and what must not change. I break the vision into initiative cards, apply hard gates first (an owner, a metric, a permissible decision, and AI actually being the right tool), then score what survives on value, feasibility, readiness, risk and reuse.
>
> The roadmap is waves, not a big bang: discover, prove one bounded module within 30 days, pilot with a parallel run, then scale by domain. Every milestone is an outcome with exit criteria and a named signer. I fund enablers like test stability and review capacity early, because they're what actually limits speed. Then a monthly steering review against the baseline, with re-plan triggers agreed up front so a change of course is planned, not a failure."
