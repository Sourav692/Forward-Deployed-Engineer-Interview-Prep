# Scoring rubric (self-score after the mock, or hand to a friend)

Score each row 0-2. Total 40. Public guides describe the real round as scored on a complete working solution first, then code quality, edge cases, tests, communication, and (when AI is allowed) how well you steer and verify the AI. This rubric is my synthesis of those, not OpenAI's.

## A. Delivery (16 points)
| Item | 0 | 1 | 2 |
|---|---|---|---|
| Gate 1 passes | not done | passes late (>20 min) | passes within 20 min |
| Gate 2 passes | not done | partial | all pass |
| Gate 3 passes | not done | partial | all pass |
| Gate 4 passes | not done | partial | all pass |
| Tests green at the end of each gate (no regressions) | broke earlier gates | fixed after | never regressed |
| Extended without a rewrite | rewrote | refactored once | additions were local |
| Edge cases raised before the tests exposed them | none | some | most (empty calls, duplicate ids, non-dict args) |
| Final state clean (names, no dead code, no debug prints) | messy | ok | clean |

## B. AI usage judgment (12 points)
| Item | 0 | 1 | 2 |
|---|---|---|---|
| Planned and stated the design before prompting | no | partly | yes, said aloud |
| Prompts were narrow and specific (one function or one behaviour) | "solve this" | mixed | consistently narrow |
| Read every diff before accepting; caught at least one AI mistake aloud | never | sometimes | always |
| Verified with tests/running after each change | no | sometimes | every change |
| Did not paste the full problem or tests into the model | pasted | partly | never |
| Could explain every line you kept | no | most | all |

## C. Communication and design (12 points)
| Item | 0 | 1 | 2 |
|---|---|---|---|
| Narrated reasoning continuously, not silent for minutes | silent | patchy | continuous |
| Stated assumptions and clarified ambiguous requirements | no | some | yes |
| Named trade-offs (threads vs asyncio, cache scope, retry policy) | no | one | several |
| Complexity / failure-mode discussion at the end | none | shallow | concrete |
| Answered 2 of the verbal questions convincingly | 0 | 1 | 2+ |
| Time management (checked the clock, cut scope on purpose) | no | partly | yes |

## Interpreting your score
- 34-40: interview-ready for this format.
- 26-33: solid; fix the lowest section and rerun with a new scenario.
- under 26: repeat Gates 1-2 until they take under 25 minutes combined, then add 3-4.

## Common failure patterns to watch for
- Pasting the prompt into the AI and accepting a 150-line blob you cannot explain.
- Swallowing exceptions silently instead of returning them to the model.
- Retrying every exception, including programmer errors.
- Caching read-only tool results or caching denials.
- Appending tool messages in completion order instead of call order after going parallel.
- Forgetting that the assistant message with `tool_calls` must be in the history before the tool results.
