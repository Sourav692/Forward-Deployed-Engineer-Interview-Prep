# Stage 7 Verification

Scope: five-phase reliability/consistency lesson, local result/outbox/projection fault model and logical circuit breaker. Six D3 modules and mapped revisits are addressed; production failover and learner mastery remain unassessed.

Run `python3 10_AI_System_Design/stages/07-reliability-consistency/labs/test_reliability.py`. Twelve tests cover local atomic rollback, committed replay after a lost response, conflict/tenant scope, lag fallback, duplicate and out-of-order projection, authority/fallback unavailability, durable recreation, circuit cooldown/recovery, failed probes and a locked concurrent single probe. Computed answers are provided fixtures; no test proves exactly-once model generation.

Five independent JavaScript cases select caught-up/lagged history, current authority with/without lag and exhausted budget. Static checks verify full Markdown/HTML teaching parity, assigned first/revisit modules, five phases, two reveals, three SVGs, links and complete request-step fields. Browser checks every branch/step/case output, Reset/keyboard, answer reveals, mobile width, print and offline/no-JavaScript reading without HTTP(S) dependencies.

The cumulative ZIP preserves prerequisite guides/labs, decisions, snapshots, curriculum/coverage and licences. Clean extraction resolves declared artifacts and HTML/Markdown links and executes included Python suites sequentially. Authoring render/browser tooling is not needed to read the offline output or run the Python lab.

Unverified: network replication/partitions, leader election/consensus, real failover/promotion/restore, physical database durability, production circuit behaviour with arbitrary late result generations, hosted provider reconciliation, actual collectors/paging, measured SLOs/tails, screen-reader usability and learner mastery. Replica history is only a data leg and never bypasses current identity/policy/audit. Contiguous watermark assumptions exclude pruning/seed protocols, which are not implemented.

Executed result: twelve Python tests, five JavaScript cases and 245 teaching-block parity checks passed. All branch/step/case, Reset/keyboard, reveal, mobile, print and offline/no-JavaScript browser checks passed. Render lint reported zero failures/unresolved warnings, three documented layout exceptions, and a dismissed numeric warning for the explicitly hypothetical SLO arithmetic. Clean extraction passed declared-artifact/link checks and sequential prerequisite/current Python suites.
