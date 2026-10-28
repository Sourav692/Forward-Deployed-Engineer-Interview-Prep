# AI System for an Air-Gapped Environment - Answer Key

Try the worksheet before you read this key. It shows what a strong GenAI FDE candidate asks, designs, measures, secures and explains on the way from a demo to a production system.

## Strong discovery questions
- How is the data classified? Which rules say whether we may store text, keep prompts or cache outputs?
- Which GPUs and servers sit inside the network? That hardware decides between a bigger model, a smaller one or a workflow that leans on retrieval.
- Is this an assist tool, a batch job for analysts or a near-interactive copilot? Each one sets a different quality bar and latency target.
- What is the path for bringing an artifact in: import, approval, scanning, signing, rollout? Its speed sets how quickly we can patch a vulnerability.
- Which local identity system can we plug into? Which directory or storage services are already there for us?
- Inside the network, what limits apply to logging, retention, backups and disaster recovery?
- What result can the customer measure on their own side, without taking a vendor's figure on trust?
- When the build team has gone home and it is 2 a.m., who runs this? What do they need to fix without help?

## Strong functional requirements
- Core workflow: inside the enclave, an analyst uploads a document and gets back a classification, an extraction or a redaction. Nothing at runtime touches the internet.
- Ship the model and the service as one offline bundle. The whole runtime installs from it and never calls out.
- Give every artifact a version and a signature. Any model, container or dependency can then be traced back to an approved release.
- Host a registry and a dependency mirror locally. Installs and redeploys stay inside the enclave.
- Hook into the local identity provider. Access then follows the accounts and groups the customer has already approved.
- Make updates and rollbacks a formal, audited ceremony. Anyone can review a promotion, and anyone with authority can reverse it.

## Strong non-functional requirements
- Latency: set one budget that spans upload, preprocessing, retrieval, inference, validation and rendering. When inference eats most of it, cut the model size or the context.
- Availability: you cannot scale out on demand, or only a little, so get capacity right before launch. Plan for the 20 QPS peak in this case, not for the average.
- Security: pin every dependency and attest it. Check signatures against trust roots held offline. Keep privileged administration apart from everyday user work.
- Compliance: keep an append-only audit log that records the actor, the action, the artifact hash and the time. Retain it for as long as local policy demands.
- Reliability: if a bundle is incomplete or damaged, refuse it and leave the current release in service. No improvising.
- Cost: `Replicas = ⌈(QPS × Tokens_request) / (TokensPerSecond_replica × UtilizationTarget)⌉`. If the result is bigger than the fixed pool, reshape the workload instead of asking for more hardware.

## Architecture explanation
- Picture two worlds with a single controlled path between them. The trust boundary separates the connected build side from everything else.
- On the connected side, the build environment packs source code, pinned dependencies and model artifacts into a bundle anyone can rebuild, then exports it.
- A signing service attaches signatures and verifiable attestations to anything that will cross the boundary.
- The bundle then waits in a transfer staging zone. It sits in quarantine while we confirm its integrity, its chain of custody and its conformance to policy. Only then may it enter.
- Once inside, signatures are checked against the offline trust roots. Approved content goes into a local registry and package mirror, which become the offline source of truth.
- A local orchestrator runs the services and applies deployment policy. It also handles canary rollout, sending only a small share of traffic to a new release.
- The model server and the document pipeline do the work: ingesting documents, OCR and parsing, splitting into chunks, retrieving, scoring, redacting and building the result.
- A local identity provider and a local telemetry stack round out the enclave. No data leaves, and no cache is ever trusted over the registry.

## Data model / integration assumptions
- ReleaseManifest(version, artifact_hashes, signatures, dependencies); ModelDeployment(model_id, version, hardware, status); OfflineAuditEvent(actor, action, artifact_hash, time).
- Each team owns a clear slice. Signed release material belongs to the build team until handoff. The offline runtime then owns deployment state, and security owns the audit trail.
- We keep deployment history long enough to answer one question: which release was live when this document was analysed?
- Nobody edits an OfflineAuditEvent after it is written. Without a vendor console, that log is the only way to rebuild what happened in an incident.
- Promotions carry a revision token and use optimistic concurrency. Two operators therefore cannot promote clashing releases at the same moment.

## Red-team risks
- a transitive package left out of the bundle, a damaged artifact after transfer, telemetry that secretly calls home, a local certificate past its expiry, an index that no longer matches the model
- A transitive dependency is missing, and someone is tempted to fetch it from outside. The system should refuse instead and block the promotion.
- An artifact gets damaged on the way between hops. Check hashes and signatures after each move, as well as where the bundle was built.
- A library expects to send telemetry out. Crash reports or cloud diagnostics look like monitoring but break the boundary without anyone noticing.
- Privileged administration gets handled as routine work. Rotating keys, changing trust roots, rebuilding indexes and promoting a rollback each need an approval that lands in the audit log.
- A stopgap meant to be temporary quietly becomes permanent. The security officer fears this above all, and an accreditation review will spot it.

## Rollout plan
- Week 0-1: agree the scope and write down the non-goals: no live internet calls, no fetching dependencies on the fly, no agents that update themselves, no cloud observability.
- Week 1-2: build a staging environment identical to production: same GPU profile, node class, OS image, trust roots and storage layout.
- Week 2-3: practise the full transfer and import drill. Verify signatures offline and install without any outside access.
- Week 3-4: write the handoff down so anyone can repeat it and audit it. "Someone will carry it over by hand" does not count as a process.
- Week 5: put a canary on one node with real traffic. It must stay within the agreed health thresholds for a set observation window.
- Week 6-8: build the rollback bundle as a proper artifact and test it. It holds the last known-good release, its signatures, an operator checklist and the escalation path.
- After pilot: add nodes only while install success, signature checks and capacity saturation stay healthy. Keep watching how old the live release is.

## Evaluation plan
These are thresholds I'd pick for this case. They are not industry standards, so be ready to defend them rather than recite them.

| Metric | What it proves | Strong threshold | Dataset / method |
|---|---|---|---|
| Offline install success rate | Bundles install cleanly without any outside access | Clean every time on representative staging | Repeated installs on nodes that match production |
| Signature verification failures | Nothing unverified got into the enclave | None admitted; each failure goes to quarantine | Verification logs from every transfer hop |
| Model throughput and latency | The fixed GPU pool serves the workflow | Inside the interactive or batch SLO | Peak load test at 20 QPS |
| Capacity saturation | There is still headroom for a big document or a burst | Under the admission threshold | Telemetry from GPUs and queues |
| Release age and MTTR | Patching and repair still work inside the enclave | Meets the agreed windows for patching and recovery | Release ledger plus incident records |
| Analyst time saved per case | The workflow got better in ways the customer can check | A local, measurable drop against the baseline | Case turnaround measured on site |

## Weak answer
My plan: run the model at the customer's own site, fenced off by a firewall, and process documents there. This is weak because it sees the air gap as a network setting, when it is the constraint that shapes everything. It never explains how artifacts get in legally, how dependencies are attested or how an update is rolled back.

## Average answer
I would containerise the model and the service, sign the image, move it across the boundary and run it with local identity and a package mirror. Logs would stay on-premises. That is better, but it never says what fails closed, how a bad release gets reverted while approvals are slow, or how capacity fits a fixed GPU pool.

## Strong answer
For me the boundary is the system design. One sentence anchors it: deliver AI capability that runs and can be maintained locally, without breaking the network, artifact, identity or audit boundaries. That turns the offline release pipeline into a high-trust control plane. I'd pin and attest every dependency, check signatures against offline trust roots, keep telemetry local first, and split privileged administration from normal use. The worst failure is a bundle that is incomplete or corrupted. So the system fails closed, keeps the evidence and leaves the current release untouched. I'd size honestly for the fixed GPU pool and reshape the workload, rather than request hardware that will never arrive. My first gate: a bundle that cannot prove offline that it is intact, complete and compatible stays out.

## Interviewer scorecard
| Area | 1 - Weak | 3 - Average | 5 - Strong |
|---|---|---|---|
| Problem framing | Sees the air gap as a firewall rule | Mentions offline deployment and local identity | Makes the boundary the design and states an outcome the customer can check locally |
| Requirements | "Host it on-premises" | Covers offline packaging and signing | Gives a must-have list and explicit exclusions, and keeps constraints apart from preferences |
| Architecture | A single container on one server | Registry, orchestrator and model server | All nine components in dependency order, split across build and offline sides, with trust boundaries marked |
| Data/integration | Refers to versions | Names the manifest and the deployment record | ReleaseManifest, ModelDeployment, an append-only audit log, clear ownership, optimistic concurrency |
| Evaluation | "It runs offline" | Checks install and latency | Tracks signature failures, install success, release age, saturation and analyst time saved |
| Safety/security | "It's air-gapped, so it's safe" | Adds signing and local logs | Pinned, attested dependencies, no assumed egress, and privileged admin handled as a high-risk interface |
| Rollout | Install it and walk away | Staging first, then deploy | Staging that matches production, a rehearsed transfer drill, a one-node canary and a tested rollback bundle |
| Communication | Talks from the vendor's side | Clear but generic | Opens with the failure, names the fail-closed rule and ends on the admission gate |

## Final 2-minute spoken answer
I'd begin somewhere other than the model. In an air-gapped site, the boundary is the system design, not an extra limit bolted onto a normal AI system, so I argue every decision against it. I'd restate the goal as AI capability that runs and stays maintainable locally, without breaking the network, artifact, identity or audit boundaries. Every later choice gets tested against that line. The architecture is two worlds with one controlled path between them. On the connected side, a build environment collects model artifacts and pinned dependencies. Anything due to cross gets attested by a signing service. The bundle then sits in a transfer staging zone, quarantined and inspected. Inside the enclave, we check signatures against offline trust roots. Approved content goes into a local registry and package mirror, which is the source of truth. An orchestrator deploys a canary and the acceptance tests run. Only after that do we promote or roll back. Identity and telemetry stay inside, and nothing calls home. My named drill is a transitive package that is missing from the bundle. The system fails closed and blocks promotion. The current release keeps running, and the bundle goes to quarantine instead of anyone reaching outside to patch it. On capacity I'd be straight with them. A fixed GPU pool means the sizing formula soon gives an awkward replica count. The right move is to question the request profile and shift work out of the live path, not to request hardware that can never get in. My first production gate: a bundle proves offline that it is intact, complete and compatible, or it stays out.
