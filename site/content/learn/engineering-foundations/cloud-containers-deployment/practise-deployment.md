# Practise Deployment Interview Questions

*A deployment answer that lists every tool still fails if it never says how a bad release is caught and undone.*

◷ 7 min

Interviewers rarely ask "what is Kubernetes?"; they ask how the system just designed would ship and run. Answer each prompt below out loud first, then compare with the outline and reread the lesson it points to.

**Objectives:**

- answer the common deployment and operations prompts in under a minute each;
- lead every answer with how a failure is detected and reversed;
- walk through a full deployment plan against a scoring rubric.

---

## Lead With the Safety Net, Then the Tools

Most deployment questions share one skeleton. Say how the service is packaged and configured. Say how a change is tested before users see it. Say how a bad change is detected in production and how fast it is reversed. Name the tools only after that.

An answer without detection and rollback cannot be trusted. "We'd deploy it on Kubernetes" says where the service runs, not what happens when the next release gives worse answers. The outlines below follow the skeleton.

## Practise the Packaging and Runtime Questions

**1. "How would you deploy this?"**
Package it with a multi-stage Docker build on a slim image, running as non-root with a health check. Inject secrets at runtime, never in the image. Gate releases with an evaluation stage on a golden set, roll out by canary behind a feature flag, and keep rollback as a flag change under 2 minutes. Monitor P99, cost and faithfulness. → [Package the Service and Keep Secrets Out](/learn/engineering-foundations/cloud-containers-deployment/package-the-service-and-keep-secrets-out), [Roll Out Changes Gradually](/learn/engineering-foundations/cloud-containers-deployment/roll-out-changes-gradually)

**2. "Where do the API keys live?"**
Not in code, Dockerfiles or images; the image should be safe to push to a public registry. Read them through a typed settings class from environment variables. In production use Kubernetes Secrets or a secrets manager, not ConfigMaps, with separate secrets per environment. → [Package the Service and Keep Secrets Out](/learn/engineering-foundations/cloud-containers-deployment/package-the-service-and-keep-secrets-out)

**3. "Serverless or containers?"**
Serverless for spiky, short, stateless calls and no server management. Containers for GPUs, jobs over Lambda's 15 minutes, models that must stay warm, and strict P99 targets. Mention Cloud Run with 1 to 2 minimum instances as the middle ground. → [Choose a Runtime and Scale It](/learn/engineering-foundations/cloud-containers-deployment/choose-a-runtime-and-scale-it)

**4. "How do you scale the GPU inference tier?"**
Land pods on GPU nodes with `nodeSelector` and `nvidia.com/gpu`. Scale on queue depth with KEDA, because CPU does not measure waiting work. Scale down slowly, since GPU nodes are expensive and take minutes to start. → [Choose a Runtime and Scale It](/learn/engineering-foundations/cloud-containers-deployment/choose-a-runtime-and-scale-it)

**5. "Should the vector database run next to the API?"**
Co-location is fast but stops independent scaling. Run it as a separate or managed service in the same region. Size memory at about 6 GB per million 1536-dimension vectors plus HNSW overhead. Persist it on a PersistentVolumeClaim and snapshot it. → [Choose a Runtime and Scale It](/learn/engineering-foundations/cloud-containers-deployment/choose-a-runtime-and-scale-it)

## Practise the Release Questions

**6. "Design a CI/CD pipeline for a GenAI app."**
Tests, then an evaluation stage that fails the build if faithfulness drops more than 5% from baseline, then build, staging with smoke tests, then a canary with approval. Add prompt unit tests in front and a nightly scheduled evaluation behind. → [Gate Releases on Quality](/learn/engineering-foundations/cloud-containers-deployment/gate-releases-on-quality)

**7. "Your quality dropped and nobody committed anything. What happened?"**
The provider may have changed what a model version points to. A change-triggered gate never fires for that. Run the evaluation suite on a schedule against the last known-good baseline, and pin dated model versions. → [Gate Releases on Quality](/learn/engineering-foundations/cloud-containers-deployment/gate-releases-on-quality)

**8. "How do you upgrade the model without disrupting users?"**
Pin the exact version. Evaluate, review in staging, canary 5% of users for 24 to 48 hours while watching faithfulness, feedback and errors, then ramp through 25%, 50% and 100%. Rollback is a flag change under 2 minutes. → [Roll Out Changes Gradually](/learn/engineering-foundations/cloud-containers-deployment/roll-out-changes-gradually)

**9. "Blue-green or canary?"**
Blue-green switches all traffic at once and switches back instantly. A canary compares real users on both versions, chosen by hashed user id, which suits GenAI because regressions show as worse answers. Automate promotion with margins such as quality at least 95% of baseline. → [Roll Out Changes Gradually](/learn/engineering-foundations/cloud-containers-deployment/roll-out-changes-gradually)

## Practise the Operations Questions

**10. "How do you log prompts without leaking data?"**
Log structure: trace id, user id, SHA-256 hashes, tokens, model, latency, cost. Redact personal data first. Keep consented full content in an encrypted, audited store, with short retention for raw text. → [Observe the Running Service](/learn/engineering-foundations/cloud-containers-deployment/observe-the-running-service)

**11. "Design health checks for an AI service."**
Liveness at `/health/live` checks only that the process is alive. Readiness at `/health/ready` checks the database, vector store, LLM API and Redis, and returns 503 if one is down. Give readiness a longer initial delay for model loading. → [Observe the Running Service](/learn/engineering-foundations/cloud-containers-deployment/observe-the-running-service)

**12. "The LLM provider is down. What does the user see?"**
A circuit breaker stops calls to the failing provider and switches to a fallback LLM. If more fails, step down from full RAG to an LLM-only answer with a disclaimer, then to a static message. Tell the user the answer is limited. → [Degrade Gracefully and Load Test](/learn/engineering-foundations/cloud-containers-deployment/degrade-gracefully-and-load-test)

**13. "How would you load test it?"**
Locust with realistic prompts and think time, 429s treated as expected. Run baseline, spike, soak and rate-limit scenarios, and measure percentiles, errors, throughput, cost per request and the load that breaks the SLA. Use a mock LLM to test your own infrastructure. → [Degrade Gracefully and Load Test](/learn/engineering-foundations/cloud-containers-deployment/degrade-gracefully-and-load-test)

> **Warning: do not stop at "we'd use Kubernetes".** Naming a platform answers where the service runs. The interviewer is listening for how a bad release is caught and reversed.

## Worked Example: A Full Answer to "How Would You Deploy This?"

Take a document assistant with a self-hosted model, just designed on the whiteboard. A strong answer runs about two minutes.

"I'd package the API with a multi-stage build on a slim image, running as non-root. Secrets come from a secrets manager at runtime, separate per environment. The API runs as a Kubernetes Deployment under an HPA on CPU. The model runs on GPU nodes, scaled on queue depth with KEDA and scaled down slowly. The vector database runs as a separate service in the same region, on a persistent volume with snapshots.

"Every change goes through tests, a golden-set evaluation that fails on a 5% faithfulness drop, staging, then a 5% canary. Promotion is automatic if quality stays at 95% of baseline. Rollback is a flag flip under 2 minutes. A nightly evaluation catches provider drift. In production I'd alert on P99, error rate, faithfulness and hourly cost, with a circuit breaker and tiered fallbacks behind it."

Score it against this rubric:

| Question the interviewer is asking | Heard in the answer? |
|---|---|
| Is the artefact safe to ship? | Slim image, non-root, no secrets in the image |
| Does each workload run on a runtime that suits it? | CPU and GPU tiers scaled on different signals |
| Is a bad release caught before most users see it? | Evaluation gate, canary, automated margins |
| Can it be undone fast? | Flag rollback under 2 minutes |
| Will drift and outages be noticed? | Nightly evaluation, percentile and quality alerts, fallbacks |

An answer that fills every row shows a deployment designed around failure, which is what the question is really testing.

---

## Key Takeaways

- Structure every deployment answer as package, test, detect, reverse, then name tools.
- Packaging and runtime answers turn on secrets at runtime and on matching each workload to its runtime and scaling signal.
- Release answers turn on an evaluation gate, a scheduled run for drift, pinned versions and a canary with fast rollback.
- Operations answers turn on structural logging, readiness checks, percentile alerts, tiered fallbacks and load tests.

## Check Yourself

1. **What four parts should every deployment answer cover before naming tools?**
   How it is packaged and configured, how a change is tested, how a bad change is detected in production, and how fast it is reversed.

2. **An interviewer asks how you'd catch a regression that no code change caused. What do you say?**
   Pin dated model versions and run the evaluation suite on a schedule, comparing against the last known-good baseline.

3. **Give a one-sentence answer to "Where do the API keys live?"**
   Never in the code or image: they are injected at runtime from Kubernetes Secrets or a secrets manager, read through a typed settings class, with separate secrets per environment.

