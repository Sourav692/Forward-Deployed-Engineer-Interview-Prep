# Blitzy Migration Evaluation: Quick Reference

**Say it like this:** "I would try one bounded migration, compare the new code with the old system on the same cases, and let the customer's tests and reviewers decide if it is safe to ship."

## Set up one pilot

Pick one module, its owner, and a fixed source commit. First record the existing build and test results. Save representative inputs and outputs, including errors, edge cases, and permission checks. Agree on the target behaviour and rollback before Blitzy changes code.

## Run these gates on each proposed change

| Gate | Evidence to collect |
| --- | --- |
| Builds and tests | Run the customer's existing CI suite. Investigate new failures against the baseline. |
| Behaviour | Replay the same inputs through old and new code. Explain every difference on a critical case. |
| API compatibility | Run consumer contract tests with [Pact](https://docs.pact.io/) or compare API specifications. |
| Security | Run [CodeQL](https://docs.github.com/en/code-security/concepts/code-scanning/codeql/codeql-code-scanning), secret scanning, and authorisation tests. |
| Human review | A customer engineer reviews the diff, unresolved risks, and rollback plan. |

For a **Java or framework conversion**, [OpenRewrite](https://docs.openrewrite.org/) is a useful rule-based migration baseline to compare with Blitzy's changes. It performs transformations; it does not prove that the new system behaves correctly.

**Go/no-go:** Ship a small canary only when critical behaviour and contracts match, security checks pass, and the owner signs off. Otherwise fix the gap and rerun the same cases.
