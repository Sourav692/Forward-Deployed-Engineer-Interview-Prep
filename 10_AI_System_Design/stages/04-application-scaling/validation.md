# Stage 4 Verification

Scope: educational capacity/caching lesson and local invariants, not deployed scale-out. First-taught coverage is 6.2 at D2 and 12.1 at D3. Revisits apply the changed scale constraint to 1.1, 1.2, 2.2, 7.1, and 8.2 without repeating their full earlier tutorials. Five phases, two intermediate reveals, complete diagrams/static walkthrough, and learner exit gates remain explicit.

Run `python3 10_AI_System_Design/stages/04-application-scaling/labs/test_scaling.py`. Eight Python tests use the actual Stage 1 App and Stage 3 Knowledge code to check shared history/key replay, policy on warm hits, revocation, version changes, deletion, tenant key separation, TTL/LRU/cache bypass, and budget arithmetic. Shared local SQLite objects test correctness, not network replicas or PostgreSQL performance.

Four JavaScript cases model application, database, cache improvement, and provider ceilings. The fixed CPU/query-budget assumptions and unit conversions are documented. Static parity, full branch/step/case browser checks, Reset, keyboard selection, reveals, mobile width, print, and offline/no-JavaScript reading run before acceptance. Authoring tooling is optional for consuming the offline output.

`tools/verify_archive.py` extracts a complete package, resolves HTML/Markdown links and state artifacts, and executes all included Python suites sequentially. Previous-stage snapshots/ADRs and relative links remain available. Caches, databases, render evidence, and archives are excluded from the package.

Unverified: managed DB migration, network load balancing, real replica/process replacement, readiness/connection draining, actual cache stampede controls, autoscaler dynamics, provider/token quotas, deployment/load/p95, identity/TLS, backups, screen-reader usability, and learner mastery. No modelled query budget is labelled a benchmark.

Executed result: eight Python tests and four JavaScript cases passed; 207 teaching blocks matched Markdown/HTML. All walkthrough/case outputs, Reset, keyboard, reveal, mobile, print and offline/no-JavaScript browser checks passed. Render lint finished with zero failures/warnings and three documented long-document exceptions. The clean archive verified supporting links/artifacts and ran the included prior/current Python suites sequentially.
