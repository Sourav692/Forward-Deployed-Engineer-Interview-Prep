# Stage 1 Verification

**Date:** 2 November 2026  
**Scope:** authored lesson, offline HTML, deterministic timing model, and local HTTP/SQLite slice  
**Result:** tested educational artifacts; learner mastery and production readiness remain unassessed

## Content and Architecture Review

Teaching revision 2 uses five learning phases, beginner-first explanations, three answer-before-reveal checkpoints, and a six-step request walkthrough without adding advanced modules. The lesson addresses Stage 1 modules 1.1, 1.2, 2.1, 2.2, 6.1, and 7.1 at their mapped D3/D2 depths. There are no Stage 1 revisits. The curriculum reference remains 12 stages, 18 domains, and 56 modules. Actual coverage records mark six modules `authored_and_checked` and the other 50 `not_started`; modules 1.3, 2.3, and 13.1 are explicitly context only, not counted as full teaching. Their first-teaching stages/depths and the deferred examples match the canonical map. No learner is marked complete.

Before/after diagrams, request sequence, schema, executable, current architecture, and ADR-001 share the same contract: trusted scope, commit processing, generate outside a transaction, commit final state, then acknowledge. Duplicate keys do not cause a second provider call while the durable row exists. Final storage failure can leave processing state and never produces a completed success.

A semantic parity check verifies 407 teaching blocks and confirms that Markdown teaching blocks are present in HTML, excluding Mermaid source replaced by three accessible inline SVG diagrams. Static checks cover local file links, internal anchors, duplicate IDs, runtime resource dependencies, code-fence balance, placeholders, all 56 coverage records, and absence of later-stage output. All checks passed.

## Executed HTTP Tests

Run from the repository root:

```bash
python3 10_AI_System_Design/stages/01-mvp/labs/test_mvp.py
```

Ten tests passed:

1. A completed answer persists when a new application object opens the same database file.
2. An unknown fixture identity returns `401`, without a database row or model call.
3. Tenant B cannot list or fetch Tenant A history; a body tenant claim cannot override trusted identity.
4. Provider timeout saves failed state, returns `504`, and duplicate reuse returns `409` without another model call.
5. Completed duplicate reuse returns `200` with the original answer; a changed prompt conflicts.
6. A trigger-induced failure of the final completed update returns `503`, leaves processing state, and prevents another model call for the same key.
7. Invalid, blank, whitespace-padded oversized prompt values and blank keys are rejected without generation.
8. Malformed and non-object JSON are rejected without storage or generation.
9. An encoded body above 20,000 bytes returns `413` without generation.
10. A POST with the wrong media type returns `415` without generation.

The tests use real loopback HTTP and SQLite commits, public fixture identities, and a deterministic model stub. They do not contact an identity service or hosted provider. Application-object recreation is a persistence check, not a process-kill, power-loss, or backup-restore test.

## Executed Browser Checks

Headless Chrome verified five phase landmarks and all three native checkpoint reveals. It checked all six walkthrough steps for component, input, output/state, and failure text; success ends with `201` after completed commit, provider timeout ends with `504` after failed-state commit, and final-write failure leaves processing state and returns `503`. Direct selection, Previous/Next, Reset, branch selection, disabled end controls, and keyboard step activation passed.

Headless Chrome loaded `guide.html` directly from a local file with network access disabled. Both reading fonts are embedded. No HTTP(S) resource requests or JavaScript errors occurred.

- Default: 2,500 ms provider duration and 4,000 ms deadline produce `201 completed` and 2,620 ms client time.
- Slow dependency: 5,000 ms duration and 4,000 ms deadline produce `504 failed` and 4,120 ms client time.
- Tight budget: 2,500 ms duration and 2,000 ms deadline produce `504 failed` and 2,120 ms client time.
- Explicit equality convention: 4,000 ms duration and deadline produce `201 completed` and 4,120 ms client time.
- Reset restores 2,500/4,000 ms. Keyboard ArrowRight increases provider duration by 100 ms and updates the result.
- Internal anchors resolve, IDs are unique, and three inline SVG diagrams have titles/descriptions.
- A 375-pixel viewport has no document horizontal overflow. Tables restack into labelled cells on phones; the wide sequence diagram scrolls within its figure and retains a prose alternative.
- Print mode hides navigation/interactive controls. With JavaScript disabled, the complete lesson, static lifecycle steps/branches, and timing cases remain readable, and inactive controls are hidden. Native checkpoint reveals remain usable without scripting.

Hallmark static/render lint finished with zero Floor failures, zero unresolved Reflex findings, and zero warnings. Three recorded waivers retain the compact chapter header and long-form reading measure (44c, 77, and 79); full-lesson length remains intentional teaching content. Desktop/mobile screenshots and render outputs live under `.website_spec/qa/stage-01-mvp/` in the owner's clone; they are not runtime dependencies. Full teaching content takes precedence over marketing-page length and hero conventions.

## Complete Package Verification

The package includes guides, executable lab/tests, a standard-library archive verifier, stage plan/state, this report, current architecture, ADR-001, coverage, a local curriculum-map copy, and font licences. It preserves the `10_AI_System_Design/` root and excludes caches, databases, credentials, screenshots, and the archive itself.

Run from the full repository root:

```bash
python3 10_AI_System_Design/stages/01-mvp/labs/verify_package.py 10_AI_System_Design/dist/stage-01-mvp.zip
```

Clean-extraction verification passed: all declared artifacts and local HTML/Markdown links resolved, and all ten HTTP integration tests passed using only Python and SQLite. The verifier resolves declared artifacts, HTML links/anchors, and Markdown links throughout the extracted workspace, then runs all ten HTTP tests using only Python and SQLite. It requires no installed skill, network, model account, or files from the author's checkout.

## Curriculum Validator

Run from the full repository root with the Codex skill installed (this validator is not a runtime dependency of the extracted stage):

```bash
python3 .agents/skills/architecture-driven-staff-ai-system-design/scripts/validate_skill.py --workspace 10_AI_System_Design
```

Expected and observed result: six drafted modules, six validated modules, and consistent 12-stage/18-domain/56-module mapping. This validator trusts declared stage flags; the checks above provide the additional execution evidence. It does not establish teaching quality or learner mastery by itself.

## Unchecked Boundaries

Real identity/signature validation, TLS, DNS, ingress deadlines, hosted-model generation, billing/cancellation, production telemetry, workload/latency percentiles, abrupt failure recovery, backups, restore, and retention deletion were not tested. The provider timeout stub raises immediately; its elapsed time is unrelated to the browser timing model. No screen reader or exhaustive accessibility audit was run.

The Python standard-library server is a loopback teaching fixture. Its public tokens, minimal request parsing, and simulated dependencies are not a production deployment. No site publishing, deployment, hosted-model calls, or later stages were performed. The new directory is outside the site's published source roots, so site sync/build validation does not apply to this standalone artifact change.
