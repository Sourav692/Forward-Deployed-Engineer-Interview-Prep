# Natural-Language-to-SQL Analytics Assistant - Answer Key

Try the worksheet before you read this key. Use it to see how a strong GenAI FDE candidate questions, designs, measures, secures and explains a system as it moves from demo to production.

## Strong discovery questions
- For each metric, who owns the definition, who signs off a change, and how often do changes happen?
- Do we already have a semantic layer or a metrics catalogue? If not, building one becomes part of the job.
- Which warehouses and SQL dialects must we support? Every extra dialect widens both generation and validation.
- How do we weigh latency against cost? Can a query answer inline, or does it have to run async behind a cache?
- Does the warehouse already enforce row-level and column-level security, or would the assistant end up rebuilding it?
- When the assistant is not sure, what should it do: ask a clarifying question, refuse, or hand the question to an analyst?
- Which ten metrics matter most? And does "revenue" mean booked, recognised or collected?
- If someone later asks why a number came out the way it did, what evidence must we be able to show them?

## Strong functional requirements
- Core workflow: accept a question in plain language, map it to a governed metric, write SQL for the right dialect, validate it, run it read-only, and send back the answer with its SQL and lineage.
- Look up the semantic metric registry first. Physical tables come later, so every answer rests on an approved definition.
- Pull in only the tables, joins and freshness details the question needs. The full warehouse schema is never exposed.
- When a question is ambiguous, ask. Never pick one of several plausible metrics without telling the user.
- Turn the candidate SQL into an AST and apply policy to that tree, not to the raw text.
- Hand back the exact SQL, the metric lineage and any caveats, such as a stale snapshot, alongside the result.

## Strong non-functional requirements
- Correctness: nothing is worse than a quick answer that is confidently wrong. Whenever speed and safety conflict, safety wins.
- Latency: the path the user waits on stays synchronous. Work that only helps later answers goes onto background queues.
- Security: run under a read-only identity limited to approved datasets. Reuse the warehouse's own row and column policies instead of writing new ones.
- Compliance: log each run once and never edit it. The entry names who asked, hashes the SQL, notes the policy decision and the bytes scanned, and pins the schema and metric versions used.
- Reliability: if policy evaluation fails, the planner times out or the scan volume looks suspicious, fail closed. If only formatting or the explanation breaks, degrade gracefully.
- Cost: every query gets a scan budget, a row cap, a timeout and a bounded date window. A query with no bounds threatens reliability, not only the invoice.

## Architecture explanation
- A question first hits the query API. It authenticates the caller and works out their entitlements before planning starts.
- The semantic metric registry comes next. "Revenue last week" then resolves to the governed definition, not to whichever table looks closest.
- The schema retriever fetches only the tables, joins and freshness the question needs. A cache with TTLs and version stamps sits behind it, so the system can say exactly what it used.
- Next comes the ambiguity check. If the question fits more than one metric or grain, the flow pauses and asks, because correct SQL on the wrong definition still fails the user.
- The SQL generator writes dialect-specific SQL using that narrowed context alone. It never roams the whole catalogue.
- The policy validator inspects the candidate SQL as an AST. It blocks writes, unbounded cross joins, unauthorised tables and anything over budget.
- Each approved query receives a cost estimate, a timeout and a row limit. A read-only execution gateway with the tightest credentials possible then runs it.
- Entitlements and policy are checked again at execution, not only during planning. The result summariser returns the rows, the exact SQL, the lineage and the caveats.

## Data model / integration assumptions
- Metric(id, name, definition, dimensions, owner, version); SchemaAsset(id, engine, object, columns, sensitivity); QueryRun(id, actor, sql_hash, policy_decision, bytes_scanned, result_ref).
- We keep old Metric versions long enough to explain why last quarter's dashboard showed a different number from today's.
- A QueryRun row is written once and only ever appended to. Incident reviews and adoption analysis both begin with query history.
- Anything that shapes behaviour carries a version: definitions of metrics, snapshots of the schema, generated plans, policy bundles. Without that, the happy path works and the rollout breaks.
- Question submissions and feedback carry idempotency keys. Metric edits use optimistic concurrency, so no team can overwrite another team's definition without noticing.

## Red-team risks
- right SQL for the wrong business question, outdated schema, join fan-out that inflates totals, scans that run away, prose that disagrees with the table
- Semantic substitution: asked for "active customers", the assistant counts logins, although the approved definition needs paid activity.
- Schema drift: a table gets renamed or a join key moves, and a template that used to work now returns output that still looks plausible.
- Join explosions: rows multiply and totals swell, yet the query is valid and clears every SQL check.
- Excessive scans: one heavy query uses up warehouse concurrency, slows other tenants and runs up a surprise bill before anyone spots it.
- Summary drift: the rows are correct but the prose gets the trend wrong. This one is dangerous because executives read the prose, not the rows.

## Rollout plan
- Week 0-1: choose ten governed metrics whose definitions are stable, whose owners are known and whose business impact is visible. Write down the non-goals.
- Week 1-2: write up the metric definitions, review the query templates, and check that the assistant can say which metric it picked and why.
- Week 2-3: assemble golden cases, each pairing a question with approved SQL and the expected result shape. Include ambiguous paraphrases and known traps.
- Week 3-4: each change triggers a full golden-set replay. Score semantic correctness next to execution accuracy, and find the cause of every failure.
- Week 5: run in shadow beside analysts on real questions. For users, the analyst's answer stays the one that counts.
- Week 6-8: open it to executives only when the assistant reliably agrees with analyst-reviewed answers and escalation works.
- After pilot: grow one domain at a time. Each domain gets a named metric owner who approves its definitions and owns its semantic-layer changes.

## Evaluation plan
I'd set these thresholds for this case. They are not industry standards, so be ready to defend them rather than quote them.

| Metric | What it proves | Strong threshold | Dataset / method |
|---|---|---|---|
| Semantic correctness | Answers follow the governed business definition | Agrees with analyst review on scope, consistently | Golden question/SQL/result cases |
| Execution accuracy | The SQL executes and the result has the expected shape | No regression on the golden set that we cannot explain | Golden-set replay on each change |
| Policy violations | Nothing got past the safety boundary | Zero escapes; repeated blocks get investigated | Policy decisions from the query-run audit |
| Bytes scanned per answer | Each governed question has a bounded cost | Never 20% above the 7-day baseline | Warehouse query telemetry |
| User trust score | People act on answers instead of checking them again | Meets the launch target and is not falling | In-product rating and a periodic survey |
| p95 latency and escalation volume | Analysts are better off | Inside target, with escalations falling | Request traces and analyst ticket counts |

## Weak answer
I'd point an LLM at the warehouse schema, let it write SQL, and execute whatever comes back. That is weak, because writing SQL is the easy part. Nobody owns the metric definitions, an unapproved reading of "revenue" slips through, and there is no AST validation, no cost limit and no way to catch an answer that is confidently wrong.

## Average answer
I'd put metric definitions in a semantic layer, generate SQL from it, validate each query before it runs, and execute under a read-only account with row limits. I'd log every query. Better, but it never says what happens with an ambiguous question, what happens when the schema drifts, or what happens when the written summary contradicts the table underneath it.

## Strong answer
I'd frame this as a governed decision-support system that only uses terms the business has already signed off. The metric registry comes before any physical table. An ambiguous question gets a clarifying question back, not a guess. Generated SQL becomes an AST and must pass policy and a scan budget before the read-only gateway sees it, and entitlements get checked again at execution. The proof is ten governed metrics, each with golden cases: a question, its approved SQL, the result we expect. Analysts get shadowed before an executive ever reads an answer. The hard part is making sure valid SQL never answers the wrong business question without anyone noticing.

## Interviewer scorecard
| Area | 1 - Weak | 3 - Average | 5 - Strong |
|---|---|---|---|
| Problem framing | "Have an LLM write the SQL" | Identifies executives and analysts as users | Frames it as governed decision support and calls out semantic failure as the real danger |
| Requirements | "Answer questions correctly" | Lists the pipeline stages | Puts correctness ahead of speed, states non-goals, defines good with ten metrics |
| Architecture | A chat UI on top of the warehouse | Adds a semantic layer and validation | Metric lookup before tables, a gate for ambiguity, policy on the AST, a read-only gateway, entitlements checked twice |
| Data/integration | Mentions a metrics table | Names the main records | Versions on metrics and on schema snapshots, query runs that are only appended, idempotency keys |
| Evaluation | "We'd test the SQL" | A handful of test queries | Semantic correctness on golden cases, plus trust score, bytes scanned and escalation volume |
| Safety/security | "The model will refuse" | Read-only account plus logging | Least privilege, the warehouse's own policies, parsing instead of regex, masked results |
| Rollout | Launch straight to executives | Pilot, then expand | Ten metrics, golden set, shadowing analysts, one domain at a time with named owners |
| Communication | Talks about the model | Clear yet generic | Opens with the wrong-answer risk, names the trade-offs, ends on the first gate |

## Final 2-minute spoken answer
I wouldn't begin with the model. The obvious pitch is to have an LLM write the SQL, and it fails straight away. The hard part is that "revenue" might be booked, recognised or collected. A query that is syntactically perfect but uses the wrong definition is a governance failure that looks like a working feature. So I'd reframe it: we're building decision support that is governed, and it only speaks in terms the business has agreed. From day one that means three things. First, governed metric definitions held in a semantic layer. Second, a read-only, cost-capped boundary that wraps the warehouse. Third, a clear way to say "I'm not sure which definition you mean" rather than guessing. In the architecture, the query API authenticates the caller and resolves entitlements. The metric registry is checked before any physical table. The schema retriever fetches only what the question needs. Ambiguity sends a clarifying question back. Generated SQL becomes an AST, has to clear policy and a scan budget, and only then runs through a read-only gateway with a timeout and a row cap. To prove it, I'd take ten governed metrics and build golden cases of question, approved SQL and expected result. Analysts get shadowed before executives see anything. Then it grows domain by domain, and every domain has a named metric owner. Success is an answer nobody feels they need to check again.
