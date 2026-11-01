# T15.3 Robust Agents: Consolidated Lessons

These six lessons are the site's teaching copy of module T15.3 "Robust agents: retries, fallbacks and guards". Each concept is taught once, in the house tutorial format, drawing only on five repository sources. The site publishes them at `/learn/agentic-systems/robust-agents`.

| # | Lesson | Site slug |
|---|---|---|
| 1 | [The Confirmation Gate and Memoization](01_The_Confirmation_Gate_and_Memoization.md) | `the-confirmation-gate-and-memoization` |
| 2 | [Retries and Fallbacks](02_Retries_and_Fallbacks.md) | `retries-and-fallbacks` |
| 3 | [Parallel and Sequential Tool Calls](03_Parallel_and_Sequential_Tool_Calls.md) | `parallel-and-sequential-tool-calls` |
| 4 | [Observability for Tool Calls](04_Observability_for_Tool_Calls.md) | `observability-for-tool-calls` |
| 5 | [The Eight Guard Checks](05_The_Eight_Guard_Checks.md) | `the-eight-guard-checks` |
| 6 | [Practise Robust Agent Interview Questions](06_Practise_Robust_Agent_Interview_Questions.md) | `practise-robust-agents` |

## Sources

- `01_Concept_Tutorials/FDE_Handbook/03_Robust_Agents/01_Retry_Fallback_Memo_Confirm.md` (own material).
- `01_Concept_Tutorials/FDE_Handbook/03_Robust_Agents/03_Parallel_vs_Sequential.md` (own material).
- `01_Concept_Tutorials/FDE_Handbook/03_Robust_Agents/04_Observability_For_Tool_Calls.md` (own material).
- `01_Concept_Tutorials/FDE_Handbook/03_Robust_Agents/05_The_Eight_Guard_Checks.md` (own material).
- `01_Concept_Tutorials/Production_and_Platform_Judgment/05-guarding-tool-calls.md` (own material).

The source files stay in the repository unchanged. The site no longer publishes the first, second and fifth as separate lessons; their old URLs redirect to the matching lesson here. Lessons 4 and 5 keep the slugs of the lessons they replace, so their URLs and saved progress are unchanged. `02_State_Memory_Sessions.md` from the same Handbook folder is taught under T11.2 Memory and state.

Every claim, number and code idea in these lessons comes from the five sources. Each lesson ends with a Sources line naming the sections it used. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.
