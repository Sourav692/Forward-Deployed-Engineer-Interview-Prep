# High-Volume Batch Inference System - Case Study Worksheet

## 1. Interview prompt
You are the FDE designing a **High-Volume Batch Inference Pipeline**. Every night it must label 100 million records and finish before 6:00 a.m., while staying inside rate and cost limits. The hard parts are replay and recovery. The run has to be replayable, and someone must know how to recover when it falls behind.

## 2. Clarify the customer problem
- Who reads the results, and what fails for them if the batch is late?
- Is a partial batch useful, or does it have to land complete or not at all?
- If progress is short at 4 a.m., what do we do?
- How much load can the downstream system really take?
- Is the cost cap firm, and which fallback mode does the business prefer?

## 3. Users and workflows
| User | Workflow | Current pain | AI assist opportunity | Human approval needed? |
|---|---|---|---|---|
| Morning operations team |  |  |  |  |
| On-call platform engineer |  |  |  |  |
| Model owner |  |  |  |  |
| Business sponsor |  |  |  |  |

## 4. Requirements
### Functional
-
-
-

### Non-functional
- Latency target:
- Availability target:
- Cost budget:
- Security/privacy constraints:
- Audit/compliance requirement:

## 5. Data and integration map
| Data source | Format | Owner | Freshness | Permission model | Risk |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## 6. Proposed architecture
Start from a rendered diagram and shape it to fit this case. Cover each part below:
- Snapshot and planning:
- Partitioning:
- Leasing and workers:
- Rate-limit coordination:
- Checkpoint and sink:
- Contingency:

## 7. Evaluation plan
| Metric | Good threshold | Bad threshold | Test dataset | Owner |
|---|---:|---:|---|---|
| Completion forecast | Lands before the deadline | Misses it with no fallback ready | Telemetry on progress | Operations |
| Duplicate logical results | Inside the replay window | Past the window | Compare by logical key | Data engineering |
| Straggler age | Inside the recovery budget | Oldest one is over budget | Histograms per partition | Batch platform |
| Cost per million records | Inside the envelope | Drifting outside it | Billing plus usage logs | Finance/platform |

## 8. Failure modes
- The run is late and nothing can still bring it in on time
- The provider lowers the quota halfway through
- One hot partition leaves slow stragglers behind
- A worker dies just after the model call returns
- The result sink starts throttling writes
- A checkpoint or the snapshot hash turns out corrupted

## 9. Rollout plan
1. Measure performance on a realistic spread of token sizes.
2. Run a load test with 1% of the data.
3. Repeat the load test at 10%.
4. Break things deliberately to rehearse recovery.
5. Settle the fallback modes and who owns each one.
6. Go to full volume with the forecast running.

## 10. Weak vs strong answer
**Weak:** "I'd set up a batch classifier with a scheduler and some workers."

**Strong:** "I'd take a fixed snapshot and cut it into partitions sized by processing cost, not row count. Workers would claim partitions through durable leases. A rate-limit coordinator would own backpressure. Checkpoints would keep any replay small, and writes would upsert on the record key. I'd agree the fallback modes long before the run could be late."

## 11. Candidate scorecard
| Area | 1 | 3 | 5 | Score |
|---|---|---|---|---|
| Problem framing | Talks only about throughput | Mentions the deadline | Frames replay and recovery choices |  |
| Architecture | A queue plus workers | Adds checkpoints | Snapshot, leases and backpressure |  |
| Evaluation | "The job completed" | Tracks throughput | Forecast, duplicates and stragglers |  |
| Production thinking | Tries it in production | A few alerts | Rehearses failures; names fallback owners |  |
| Communication | Cites throughput numbers | Mostly clear | Opens with the 4 a.m. call |  |
