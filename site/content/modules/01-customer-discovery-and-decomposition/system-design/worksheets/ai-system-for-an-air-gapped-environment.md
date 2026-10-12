# AI System for an Air-Gapped Environment - Case Study Worksheet

## 1. Interview prompt
You are the FDE asked to bring GenAI capability into an **Air-Gapped Environment**, a network with no route to the internet. Treat that boundary as the heart of the design, not as an obstacle to work around.

## 2. Clarify the customer problem
- Which classification level covers the data, and which handling rules come with it?
- Is the local hardware fixed, and what exactly sits in the pool?
- What is the path for bringing artifacts in, from scanning and approval to signing and roll-in?
- Which identity, storage and directory services already run inside the boundary?
- What limits apply to logging, retention and recovery?

## 3. Users and workflows
| User | Workflow | Current pain | AI assist opportunity | Human approval needed? |
|---|---|---|---|---|
| Analyst (end user) |  |  |  |  |
| Operations / IT admin |  |  |  |  |
| Security / compliance officer |  |  |  |  |
| Programme sponsor |  |  |  |  |

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
Fill in each part of your architecture for this case:
- Build and signing:
- Transfer inspection:
- Offline registry:
- Orchestration:
- Document pipeline:
- Local telemetry:

## 7. Evaluation plan
| Metric | Good threshold | Bad threshold | Test dataset | Owner |
|---|---:|---:|---|---|
| Signature check results | No failed artifact admitted | One failed artifact admitted | Logs from each transfer hop | Security |
| Offline install success | Clean on every staging run | Install needs outside access | Installs on matched staging nodes | Platform engineering |
| GPU and queue saturation | Stays under admission limit | Held above the limit | Local GPU and queue metrics | Operations |
| Time per analyst case | Lower than baseline | No change or slower | Case timings taken inside | Sponsor |

## 8. Failure modes
- Install halts on a missing transitive dependency
- A bundle arrives damaged after a transfer hop
- The model does not fit in local GPU memory
- An internal certificate reaches its expiry date
- A new release cannot read the existing index
- A library tries to send telemetry out

## 9. Rollout plan
1. Build a staging copy that matches production.
2. Run the full transfer and import drill.
3. Write the handoff down so anyone can repeat it.
4. Put one canary node on live traffic.
5. Build the rollback bundle and test it.
6. Add nodes only while every gate passes.

## 10. Weak vs strong answer
**Weak:** "Put the model on a local server and lock down the firewall."

**Strong:** "The release path into the enclave is the most trusted part of the system. Every dependency is pinned and attested, and signatures are checked against trust roots held offline. Telemetry never leaves. An incomplete bundle is refused, and rollback is a bundle we have already tested."

## 11. Candidate scorecard
| Area | 1 | 3 | 5 | Score |
|---|---|---|---|---|
| Problem framing | Treats the gap as a firewall rule | Sees offline deployment | Designs around the boundary |  |
| Architecture | A single container | Adds registry and mirror | Separate build and offline sides, canary node |  |
| Evaluation | "Runs without internet" | Checks installs | Signature checks, saturation, analyst time |  |
| Production thinking | Installs, then walks away | Adds some monitoring | Refuses bad bundles, rollback already tested |  |
| Communication | Talks about the vendor | Mostly clear | Opens with the failure and the gate |  |
