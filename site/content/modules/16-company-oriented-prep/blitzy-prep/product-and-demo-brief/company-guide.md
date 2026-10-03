# Blitzy Product, Autonomous Codegen & Demo Brief

Sources: blitzy.com/how_it_works, blitzy.com/security, docs.blitzy.com, the May 2026 BusinessWire funding release. These are Blitzy's own claims, so present them as "Blitzy states…" and not as independent fact.

## 1. Company snapshot

| Item | Fact |
|---|---|
| What it is | An autonomous enterprise software development platform. **Not a copilot**: work happens asynchronously, before anyone opens the IDE |
| HQ / founders | Cambridge, MA · Brian Elliott (CEO, ex-Army Ranger) · Sid Pardeshi (ex-NVIDIA Master Inventor, 27+ patents) |
| Funding | $200M at a $1.4B valuation (May 2026), led by Northzone; also PSG, Battery, Liberty Mutual Strategic Ventures |
| Customers | "Dozens of Global 2000," across 10 industries; focus on regulated sectors (government, financial services, insurance) |
| Headline claims | 5x engineering velocity · "6-month projects → 6 days" · 80%+ of the work done autonomously · SWE-Bench Pro 66.5% · understands 1M–100M+ LOC · up to 3M lines of output |
| Core bet | Frontier models alone won't solve enterprise development. It takes **extended inference-time compute + a deep codebase knowledge graph**; "System 2 thinking" |
| Models | Orchestrates Google, Anthropic and OpenAI models, **100,000+ model calls per run**, with thousands of agents in parallel for days to weeks |

## 2. How the platform works (memorize this flow)

| # | Stage | What happens | Human role |
|---|---|---|---|
| 1 | **Onboard / reverse-engineer** | Connect GitHub, GHES, GitLab, Bitbucket or Azure DevOps. Agents map dependencies, packages and libraries to build a **knowledge graph** ("infinite context stitching") | Provide repo access, private deps, env vars and secrets (encrypted, never shown to agents), and build instructions |
| 2 | **Tech Spec** | Auto-generated technical specification of the codebase that stays in sync as the repo changes (Knowledge Base, by repo and branch) | **Review and edit the Tech Spec**: an accurate spec improves results |
| 3 | **Prompt** | Natural-language requirements in a **WHY / WHAT / HOW** template; covers new products, features, refactors, bug fixes, security fixes, tests and docs | Write the prompt, or use templates |
| 4 | **Agent Action Plan (AAP)** | Blitzy proposes the planned changes | **Approve or rework the plan**: the main control gate |
| 5 | **Generation** | Multi-model, multi-agent build; **compile + runtime validated** in isolated, preconfigured environments wired to the customer's validation pipelines; QA agents cross-review | Nothing (asynchronous; notification when done). Jobs **can't be cancelled** once submitted |
| 6 | **Project Guide + PR** | A pull request plus a statement of work and a **developer guide for the remaining ~20%** (tasks it couldn't finish, called out explicitly: "no hallucinated gap-filling") | **Code review, then merge, close or refine**; the knowledge graph updates after merge |

**Control levers:** **Rules** (org, team or individual: require-test-coverage, preserve-backward-compatibility, catalog-security-vulnerabilities, assess-change-risks, enforce-code-style-patterns, etc.) · `.blitzyignore` · "make as few changes as possible" instruction · Teams/SSO roles.

**Gotcha to know:** by default it applies stack upgrades (e.g. Java 21 → adds virtual threads). The **source code is the source of truth, not the Tech Spec**.

## 3. Security and deployment (CTO / CISO questions)

| Concern | Blitzy answer |
|---|---|
| Training on our code? | Never. Blitzy says it stores embeddings, not raw code |
| Certifications | SOC 2 Type II, ISO 27001 |
| Network | Inbound-only VPC, no public endpoints, never initiates outbound requests; the code-generation plane is "air-gapped" from the UI |
| Secrets | Shared through an encrypted UI and never exposed to agents |
| Who owns final quality? | **The customer.** Blitzy says customers should still run their own QA, QC and security testing before deploying |

## 4. Commercial model (shows you understand the FDE's place)

| Tier | Typical | FDE relevance |
|---|---|---|
| Reverse Engineer | $0, ≤100K LOC | Discovery hook |
| Proof of Concept | $50K / 2 months | Guided POC: **the FDE proves value here** |
| Structured Pilot | $250K / 6 months, 5M onboarded / 1.25M generated | Deployed in the customer's environment |
| Commercial | ~$500K/yr, one team | SAML-SSO, dedicated infrastructure |
| Enterprise | ~$5M/yr, whole org | **2 FDEs** + AI Solutions Consultant |
| Transformation | ~$50M/yr, ~500M LOC | **6 FDEs** + Field CTO + 2 FD Designers |
| Unit pricing | $0.10/line onboarded · $0.20/line generated | |

→ The FDE role sits at the **POC → pilot → expansion** motion. Your job: make the POC succeed, turn it into a pilot and an org-wide rollout, and be the customer's technical trusted advisor.

## 5. Copilot vs. Blitzy (expect "how is this different from Copilot/Cursor/Claude Code?")

| Dimension | IDE copilot / single agent | Blitzy |
|---|---|---|
| Unit of work | Line, function, a single task | Multi-month epic or whole project |
| Mode | Synchronous, a human in the loop at every step | Asynchronous batch; humans at **gates** (spec, plan, PR) |
| Context | Open files + retrieval | Persistent knowledge graph of the whole estate |
| Compute | Seconds per request | Days or weeks of inference, 100K+ model calls |
| Validation | Developer runs it | Compiles + runs in an isolated env + QA agents before the PR |
| Output | Suggestions | PR + statement of work + guide for the remaining 20% |
| Best fit | Daily coding | Modernization, large features, test backfill, doc generation, CVE remediation |

## 6. Autonomy vs. control: your positions (Round 1, Q4)

| Customer scenario | Tension | Your recommendation |
|---|---|---|
| Bank wants a COBOL → Java migration "fully autonomous" | Speed vs. regulatory risk | Autonomy in **generation**, control at the **gates**: approve the Tech Spec + AAP, PR review, rules for backward compatibility and risk. Phase by module (strangler), run a **parallel run / output diff** against the legacy system before cutover |
| Team wants to auto-merge Blitzy PRs to move faster | Velocity vs. blast radius | Risk-tier the merge policy: auto-merge for docs and tests; required review for business logic; security sign-off for auth, payments and PII paths. Gate on CI + coverage threshold + SAST |
| CTO wants minimal changes; Blitzy upgraded the framework too | Modernization vs. predictability | Use the "minimal change" instruction + a backward-compat rule; split the upgrade into its own project and PR so reviews stay tractable |
| Security team won't grant secrets/env access | Validation quality vs. data exposure | A sandboxed env with synthetic data and scoped, short-lived creds; explain that secrets never reach agents; start with onboarding-only (docs) to build trust |
| Engineers distrust a 3M-line PR | Throughput vs. reviewability | Break it into stacked, reviewable PRs by component; lead with the project guide and test evidence; pick reviewers who own each component |
| Generation job is mis-scoped and can't be cancelled | Quota cost vs. iteration | Invest up front: spend time on Tech Spec accuracy and AAP review, and run a small scoped project first. Cheap gates before expensive compute |

**One-line principle:** *"Let the machine own throughput and let humans own intent and acceptance. Where an action is irreversible, put a gate in front of it, and size the review gate by blast radius."*

## 7. Validating generated code (what you'd put in the pipeline)

| Layer | Check |
|---|---|
| Build | Compiles; dependency resolution; no new vulnerable dependencies (SCA) |
| Tests | Existing suite passes; new tests call **real** production code; coverage delta ≥ threshold; mutation testing on critical modules |
| Behaviour | Contract/API compatibility tests; golden-output or parallel-run diff against legacy for migrations; performance benchmark against baseline |
| Security | SAST (Semgrep/CodeQL), secrets scan, authz tests, tenant-isolation tests |
| Human | Component-owner review, gated by risk tier; the project guide's 20% list tracked as tickets |
| Production | Feature flags, canary, rollback plan, error-budget watch |

## 8. Five-minute demo narrative (Round 2)

| Min | Beat | Say |
|---|---|---|
| 0:00 | **Frame the customer pain** | "Your 2M-line Java 8 monolith has an 18-month modernization backlog, and your engineers spend most of their time understanding code, not writing it." |
| 0:45 | **Onboard → Tech Spec** | Show the generated spec and knowledge base. "Before writing a line, Blitzy already understands the estate. That alone replaces weeks of discovery." |
| 1:45 | **Prompt (WHY/WHAT/HOW) → Agent Action Plan** | "This is the control point. Your architects approve *what* changes before any compute is spent." Point out the rules applied (backward compat, test coverage) |
| 2:45 | **Generation + validation** | "Thousands of agents, compiled and run in an isolated environment connected to *your* pipeline. Not a demo sandbox." |
| 3:30 | **PR + project guide** | Show the PR, test results and the remaining-20% guide. "It tells you what it didn't do instead of guessing." |
| 4:15 | **Business outcome + next step** | "Measure it on one bounded module: cycle time, review effort, defect escape rate. Then we expand to a pilot." |

Demo tips: lead with their problem, not features · stop for questions at the AAP gate · keep one number (5x or 80%) and say where it comes from · have a fallback (recorded run) in case live generation is slow.

## 9. Likely questions: crisp answers

| Question | Answer (≤20s) |
|---|---|
| Why would generated code be trustworthy? | It isn't trusted blindly: gated spec and plan, compile + runtime validation, QA agents, then *your* CI and review. Trust is earned by evidence, not claimed |
| What's the hardest part of a Blitzy deployment? | Environment replication: private dependencies, secrets, and build steps that only exist in someone's head. That's FDE work |
| How do you measure POC success? | Agree on it up front: lead time per epic, % of the AAP delivered, review hours per KLOC, defects found post-merge, developer NPS |
| What fails most often? | Vague prompts and stale Tech Specs → wrong scope. Fix: the WHY/WHAT/HOW template, explicit non-goals, a small first project |
| How do you handle a customer whose CI is weak? | Building the validation harness becomes part of the engagement. Generated tests (add-testing use case) come first, then feature work |
| Legacy (COBOL/mainframe) specifics? | Blitzy claims it is language agnostic and validated on COBOL and C#. Pair it with a parallel run, data-format equivalence tests, and a strangler cutover |

## 10. Smart questions to ask them

> Full set, with follow-ups and competitor framing: `03_Questions_To_Ask_Interviewer.md`

| Question | Why it lands |
|---|---|
| "Where do POCs most often stall: environment setup, spec quality, or review capacity?" | Shows you know the FDE bottleneck |
| "How does the knowledge graph stay consistent with a monorepo that has hundreds of merges a day?" | Technical depth |
| "How do FDEs feed customer failures back into Rules, templates, or the core platform?" | Product feedback loop = the senior FDE signal |
| "What does a successful first 90 days look like for an FDE here?" | Ownership |
