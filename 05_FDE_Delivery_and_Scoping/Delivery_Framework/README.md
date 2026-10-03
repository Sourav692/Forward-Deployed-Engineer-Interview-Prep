# FDE Delivery Framework: Scoping to Production

A theory and interview-performance guide for taking a customer from an ambiguous
scoping document to a controlled production launch on a compressed timeline.

The central idea is a productized delivery process backed by reusable assets and
explicit decision gates. The framework is designed to prevent hero-driven delivery,
silent scope expansion, weak evidence, and unsafe launches.

## Reading order

1. [`docs/01-theory.md`](docs/01-theory.md) — stages, gates, accelerators, risks, and metrics.
2. [`docs/02-architecture-end-to-end.md`](docs/02-architecture-end-to-end.md) — the complete functional architecture.
3. [`docs/05-security-gate-depth-and-tenant-scale.md`](docs/05-security-gate-depth-and-tenant-scale.md) — evidence quality, credentials, residency, and multi-customer isolation.
4. [`INTERVIEW_SCRIPT.md`](INTERVIEW_SCRIPT.md) — a 60-minute whiteboard delivery script.

## The six decision gates

| Gate | Blocks entry to | Accountable signer |
|---|---|---|
| Security review | Data readiness | Security reviewer |
| Data access | Configuration | Customer SME |
| Golden set | Evaluation | Customer SME |
| Evaluation baseline | Shadow mode | FDE lead |
| Rollback readiness | Limited production | FDE lead |
| Success metrics | Go/no-go | Executive sponsor |

## Scope boundary

This folder deliberately contains no runnable pipeline, notebook, test suite, or
customer environment. It teaches the functional behavior and the decisions an FDE
must defend. Hands-on implementation belongs to the companion AI Engineering course;
see [`../../COMPANION_COURSE.md`](../../00_Start_Here/COMPANION_COURSE.md).
