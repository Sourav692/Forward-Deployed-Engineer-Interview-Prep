# Design an AI System for an Air-Gapped Environment, part 8

## Coverage Notes

We scored this design in a single review against our standard rubric, which has 20 items grouped into 4 phases.

**Phase 1: Problem Framing & Discovery**
- **Item 1 (turning a feature into a business outcome):** Covered. Section 1 restates the goal as an outcome and lists the business results behind it.
- **Item 2 (mapping stakeholders and personas):** Covered. The stakeholder table in Section 1 handles it.
- **Item 3 (questions whose answers reshape the design):** Covered. Section 2 poses six discovery questions, then turns them into a decision tree.
- **Item 4 (splitting and ranking requirements):** Covered. Section 2 separates functional from nonfunctional needs and ranks them as must, should and could.
- **Item 5 (stated non-goals and scope limits):** Covered. Section 2 spells out what the MVP will not support.

**Phase 2: Estimation & Architecture**
- **Item 6 (rough scale and capacity arithmetic):** Covered. Section 3 gives the replica formula and works one example through it.
- **Item 7 (unit economics and what drives cost):** Absent. The Cost SLI in Section 3 and the rollout's cost talk stay qualitative about cost drivers and control. We build no unit-economics view, such as cost per document or per analyst-hour, and we invented no figures.
- **Item 8 (how components and data move from end to end):** Covered. Section 4 supplies the component list, the diagrams and the happy-path sequence.
- **Item 9 (records and interface contracts):** Covered. Three records and four API contracts are defined in Section 5.
- **Item 10 (build versus buy, vendors and model choice):** Partial. Section 8 weighs model size, yet it assumes every part is built in-house. It never compares a custom build with an off-the-shelf or vendor air-gapped platform.

**Phase 3: Trade-offs, Security & Reliability**
- **Item 11 (named pairs of trade-offs, each with a fair verdict):** Covered. Section 8 sets out four core trade-offs.
- **Item 12 (threats and the controls that answer them):** Covered. Section 6 threat-models the offline control plane.
- **Item 13 (failure modes and reliability drills):** Covered. Section 6 has a decision table plus a drill for a missing transitive package.
- **Item 14 (how the system gets tested):** Covered. Contract tests and failure-injection tests appear in Sections 5 and 6.

**Phase 4: Delivery, Governance & Communication**
- **Item 15 (metrics in layers, plus observability):** Covered. Section 7 measures three layers: technical health, users and the business.
- **Item 16 (staged rollout, risk register and rollback gates):** Covered. Section 7 pairs a four-phase rollout with a risk register.
- **Item 17 (depth on regulation and governance):** Absent. Internal governance ideas such as accreditation, approval gates and audit trails run all through the design. Yet it never names a regulatory framework, for example FedRAMP, ITAR or NIST 800-53. The design is framework-agnostic on purpose, so we left the item Absent rather than invent one.
- **Item 18 (responsible AI and risks past the obvious failure):** Covered. We handle it through correctness, governance and integrity (audit evidence, signed provenance and a fail-closed policy) rather than through bias or fairness. That material is not counted a second time under item 12.
- **Item 19 (change management and the adoption story):** Covered. Section 7 deals with ownership and gates, framed as an ownership ladder.
- **Item 20 (a structured plan for talking, plus a self-scoring rubric):** Covered. Section 8 provides a 50-minute pacing plan and a 7-item rubric.

We ran no second review, since the first found no other gap this design could close.

### My Perspective on the Gaps

*Our view on closing the gaps: how we would handle each one live in an interview, using only the architecture this design already has.*

**Item 7: Unit economics and cost drivers.**
- I'd avoid inventing new numbers and derive the unit-economics view from the replica formula we already have in Section 3. Cost per document = (GPU-hours on the model server + amortised storage and index + storage for telemetry and audit) / number of documents handled in that window.
- A fixed GPU pool makes this easier to reason about than a cloud setup. Replicas cannot grow on demand, so the whole cost question shrinks to one: how much of the pool is this workload using? The answer comes from the 477-replica example we already worked. I'd present it as "cost per analyst-hour saved" set against "GPU-hours burned". For the scaling argument I'd lean on the sensitivity table, comparing baseline with 10x, rather than on a dollar figure I can't defend.
- Live, I'd be honest. I lack the customer's GPU procurement cost and the fully-loaded cost of an analyst. So I'd sketch only the shape: cost equals amortised fixed hardware plus operations and audit overhead, all over throughput. Then I'd invite the interviewer to give me one real figure as an anchor. I would not make up a cost-per-document figure.

**Item 10: Build versus buy, vendors and model choice.**
- Section 4 already names nine components, so I'd make the buy-or-build call per component instead of once for everything. Some pieces are commodity infrastructure: the offline registry/package mirror, the hook-up to the local identity provider, and the telemetry stack. For those I'd buy or adopt an accredited vendor product, as long as one sits on the approved products list. A bespoke air-gapped package mirror could eat months re-solving a problem the customer's accreditation programme has probably already cleared a vendor for.
- The reverse holds for the parts unique to this programme's mission, which I'd build in-house. That means the document pipeline's logic for redaction and extraction, the schema of the release manifest, and Section 5's verify_bundle integrity gate. No vendor can take responsibility for getting domain-specific redaction right. Nor can one own a manifest schema shaped around this customer's audit policy.
- A rule of thumb to say aloud: buy whatever is a solved, security-commoditised problem whose vendors already hold the right government credentials. Identity brokers, package mirrors and base OS images all qualify. On-prem, that typically means two things: the product appears on NIAP's Product Compliant List under Common Criteria, and DISA has published a STIG for it. FedRAMP is the wrong yardstick, since it covers only cloud services. Build only the boundary logic and the mission-specific pipeline. Those are unique to how this customer works, and the MVP list in Section 2 already marks them as must-have.

**Item 17: Depth on regulation and governance.**
- Although this design is framework-agnostic, I'd still name a likely framework out loud, because silence here sounds inexperienced in a real interview. If the enclave belongs to the US government, my pick would be NIST SP 800-53 Rev 5 and three of its control families: SC for system and communications protection, AU for audit, and CM for configuration management. They map naturally onto controls the design already has. The signed release manifest answers CM-3, configuration change control, and CM-14, signed components. The offline audit event log lines up with AU-2/AU-12. The fail-closed dependency policy lines up with SC-7 boundary protection.
- If the workload handles export-controlled technical data, ITAR/EAR rules could limit which analysts may see some documents at all. The compliance officer would then bring a new constraint into the stakeholder table in Section 1.
- Live, I'd put it like this: "I don't know yet which framework governs this enclave. But what I've already described (append-only audit, signed provenance, fail-closed promotion) maps cleanly onto the CM and AU families in NIST 800-53. So once we learn the exact framework, the architecture stays put. Only the format of the evidence changes."

## Key Takeaways

- The boundary is the design, so hold every choice to one outcome: maintainable AI that runs locally and never crosses the enclave's network, artifact, identity or audit boundaries.
- Defend the no-internet-at-runtime assumption first, because relaxing it later simplifies the design while assuming the reverse breaks the whole architecture.
- Measure success with analyst turnaround time per case, which the customer can check from inside the enclave without trusting a vendor-reported figure.
- Size against the fixed GPU pool: 20 QPS at 2,000 tokens a request, 120 tokens a second per replica and 70% utilisation gives 477 replicas, a sign to challenge the request mix rather than ask for hardware.
- Split the design into a connected build world and an offline runtime, with signing and the transfer staging zone as the only bridge between them.
- Make the offline registry the one system of record for deployable artifacts, and never let a runtime fall back to an older cached copy.
- The first production gate is that no bundle enters the enclave until it has proved, offline, that it is intact, complete and compatible.
- Ship each release as a signed manifest that lists every artifact hash and declares every dependency, so a missing package fails validation before installation, not at runtime.
- A missing transitive package fails closed: promotion stops, the evidence is kept, the running release stays untouched, and a dependency-closure preflight prevents a repeat.
- Sort every failure into a policy: signature and authentication checks fail closed, a stale index degrades with a freshness warning, ingestion queues in a bounded buffer, and trust-root updates need a human.
- Keep every observability path local-first and approved, because a library that silently calls home is a leak.
- Version the model and the retrieval index as a compatible pair, since new weights that change embeddings or tokenisation force a rebuild or a parallel index.
- Roll out in four phases: staging on identical hardware, a rehearsed signed transfer, a one-node canary and a tested rollback bundle with runbooks.
- Pick the smallest model that clears the quality bar on the customer's own documents, because each step up competes for enclave hardware and adds latency and accreditation work.
- Favour fewer releases that you trust more, with urgent security patches on a separate track from new features.

## Level calibration

On this design the levels separate on how far the answer treats the boundary as the system itself, not on how many boxes sit inside the enclave.

| Level | Sounds like | Missing |
|---|---|---|
| Senior | "I'd split the connected build world from the offline runtime: pinned dependencies, a signed bundle, a transfer staging zone, then the offline registry and mirror. A missing transitive package fails closed, blocks promotion and leaves the current release running." | Honest sizing against the fixed GPU pool, where the 477-replica result means challenging the request mix rather than asking for hardware, and a named owner for build, transfer and operate. |
| Staff | "Release engineering signs, security owns trust roots and audit evidence, and operations runs the one-node canary with a tested rollback bundle. Model and index ship as a compatible pair, telemetry stays local-first, and expansion waits on install success, signature failures and saturation." | A release train matched to the customer's accreditation capacity, and which pieces become shared services across enclaves instead of being rebuilt for each site. |
| Principal | "I'd run fewer, higher-confidence releases with urgent security fixes decoupled from features. Buy accredited commodity pieces such as the package mirror and identity, build only the verify-bundle gate and the mission pipeline, and standardise both across enclaves." | The real request mix, GPU cost and analyst cost, which decide unit economics and whether the 20 QPS peak is interactive work. Also which governance framework applies; that changes the evidence format, not the architecture. |

## Sources (checked 27 Sep 2026)

- [NIST SP 800-53 Rev 5 control catalog (OSCAL JSON, usnistgov/oscal-content)](https://github.com/usnistgov/oscal-content/tree/main/nist.gov/SP800-53/rev5): control titles for CM-3, CM-14, AU-2, AU-12 and SC-7
- [FedRAMP](https://www.fedramp.gov/): FedRAMP authorises cloud services, not on-prem products
- [NIAP Product Compliant List](https://www.niap-ccevs.org/product/pcl): Common Criteria listing for commercial IT products used in national security systems
- [DISA Security Technical Implementation Guides](https://www.cyber.mil/stigs/): DoD configuration guides for operating systems and other products
- [SLSA provenance specification v1.0](https://slsa.dev/spec/v1.0/provenance): build provenance attestations
- [Python `hmac.compare_digest`](https://docs.python.org/3/library/hmac.html#hmac.compare_digest): constant-time comparison to reduce timing attacks
