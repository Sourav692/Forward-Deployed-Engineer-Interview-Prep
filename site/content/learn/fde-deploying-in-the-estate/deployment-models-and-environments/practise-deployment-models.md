# Practise Deployment Models


## How to use this practice

These questions ask you to produce something: a comparison, a matrix, a plan, a diagnosis or a calculation. Answer aloud as if at a whiteboard, writing the key items down. Then compare with the outline. Where the work is a file, such as an image definition or a set of manifests, describe its contents line by line instead of writing it out.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Comparing deployment models and writing a responsibility matrix.
> - Isolating tenants component by component.
> - Planning an install and upgrade with no internet.
> - Diagnosing permission and open-file failures, and defining a safe image.
> - Validating configuration, sizing a deployment and choosing Kubernetes objects.

## Deployment choices

Taught in [SaaS, customer cloud or on-premises](/learn/fde-deploying-in-the-estate/deployment-models-and-environments/saas-customer-cloud-or-on-prem).

<details>
<summary>Practice question 1. Alston Telecom wants a call-summary assistant. Present three deployment options with their trade-offs and your recommendation.</summary>

- **Answer:** SaaS: fastest to start and we operate everything, but call transcripts leave Alston's estate. Customer cloud, vendor-operated: transcripts stay in Alston's account, we run it through approved, time-limited access. On-premises: full control for Alston, but their team operates it with our runbooks, and releases slow down. Ask where transcripts may go and who can operate at night. If data must stay in their account and their cloud is approved, recommend customer cloud, vendor-operated.
- **Trade-off:** Each step from SaaS adds control for Alston and slows every fix and release.
- **Follow-up to expect:** "Their regulator forbids public cloud." Then on-premises, with a support contract that has real response times.

</details>

<details>
<summary>Practice question 2. Write the responsibility matrix for that customer-cloud deployment.</summary>

- **Answer:** Rows and owners: cloud account and network, Alston. Operating system patching, vendor. Database backups and quarterly restore tests, vendor. Application upgrades, vendor, in Alston's change windows. Monitoring, vendor, with alerts forwarded from Alston's tooling. Access approvals, Alston, 15-minute target, with a named deputy. Certificates, Alston for the domain, vendor for internal ones. User communications during incidents, Alston, from vendor facts. Then walk one fault, a full disk at night, through it.
- **Trade-off:** A detailed matrix takes a meeting to agree. A vague one surfaces at 02:00.
- **Follow-up to expect:** "Two teams want the same row." Name one owner and one helper.

</details>

## Isolation

Taught in [tenancy and isolation](/learn/fde-deploying-in-the-estate/deployment-models-and-environments/tenancy-and-isolation).

<details>
<summary>Practice question 3. Your shared service hosts 30 tenants. List the isolation boundary you would set in each component.</summary>

- **Answer:** Entry: tenant taken from the verified token, never from a request field. Database: row-level security on the tenant column, so a missed filter returns nothing. Object store: a prefix per tenant with access scoped to it. Cache: tenant ID first in every key. Queue: per-tenant limits and a low-priority lane for bulk jobs. Compute: fair share of workers per tenant. Logs: tenant tag on every record, support access filtered by tenant. Admin tools: tenant-scoped actions, all logged. Keys: per tenant for the tenants who need it.
- **Trade-off:** Each boundary adds work to every feature. The weakest one sets the real level.
- **Follow-up to expect:** "How do you test it?" Run every endpoint as tenant A asking for tenant B's data.

</details>

## Disconnected installs

Taught in [disconnected and hybrid installs](/learn/fde-deploying-in-the-estate/deployment-models-and-environments/disconnected-and-hybrid-installs).

<details>
<summary>Practice question 4. Zennor Energy's control network has no internet. Plan the first install and the upgrade process.</summary>

- **Answer:** Before: list every outside call and remove it. Build a versioned bundle with images, locked packages, model weights, an offline licence, a signed checksum list and image signatures. Test it in an environment with no outbound route. Install: Zennor scans the bundle, verifies signatures offline, loads it into their internal registry, then we install from there in a timed access window with a pre-flight check and reserved rollback time. Upgrades: same path, stated upgrade versions, rehearsed on a staging copy inside. Support: a diagnostics export they review.
- **Trade-off:** Bundled releases are slower. Plan how fast a security patch can cross.
- **Follow-up to expect:** "The window is one hour." Do only load and verify in the first, and upgrade in the next.

</details>

## Linux and containers

Taught in [Linux processes, permissions and limits](/learn/fde-deploying-in-the-estate/deployment-models-and-environments/linux-processes-permissions-and-limits) and [containers and persistent data](/learn/fde-deploying-in-the-estate/deployment-models-and-environments/containers-and-persistent-data).

<details>
<summary>Practice question 5. On Alston's server the service logs "Permission denied" on some writes and "Too many open files" at month-end. Walk through your diagnosis.</summary>

- **Answer:** Find the PID and user with `systemctl status` and `ps`. For the writes, run `namei -l` on the failing path and compare with `id` for the service user: look for a missing x on a parent directory or a missing w on the target. If the bits look right, check SELinux labels, a read-only mount and free space with `df -h` and `df -i`. For open files, read `/proc/<PID>/limits` and count `/proc/<PID>/fd` during the run, then `lsof` to see what holds them. Fix ownership and the systemd limit through Alston's change process, and cap parallelism.
- **Trade-off:** Diagnosing takes ten minutes. Running as root hides both problems and fails the security review.
- **Follow-up to expect:** "Your shell shows a high limit." Shell limits do not apply to the service.

</details>

<details>
<summary>Practice question 6. Describe, instruction by instruction, a container image definition for a Python service that runs as non-root with pinned dependencies.</summary>

- **Answer:** Stage one: base image referenced by digest, copy only the lockfile, install dependencies with hashes required, then copy the code. Stage two: the same pinned slim base, create a user and group with fixed ID 10001, copy the installed packages and code from stage one owned by that user, create the writable directories it needs with that owner, switch to the user, set the start command. No package installs at start, no secrets in any layer.
- **Trade-off:** Digest pins need deliberate updates for security patches. Moving tags change silently.
- **Follow-up to expect:** "The volume is owned by root." Agree the user ID with the platform team, or set group ownership at mount.
- **Go deeper:** [Package the service and keep secrets out](/learn/engineering-foundations/cloud-containers-deployment/package-the-service-and-keep-secrets-out).

</details>

## Config, compute and Kubernetes

Taught in [config, compute and Kubernetes choices](/learn/fde-deploying-in-the-estate/deployment-models-and-environments/config-compute-and-kubernetes-choices).

<details>
<summary>Practice question 7. Design the startup configuration check for a service deployed to test, staging and production.</summary>

- **Answer:** Before accepting traffic: confirm every required setting is present, with no defaults for addresses, buckets or keys. Check shapes: URLs parse, numbers in range, enums valid. Check the environment: production values must not match a deny-list of sandbox and test hosts. Check dependencies: database connects, upstream API answers a cheap call. On any failure, log all problems without secret values and exit non-zero. The readiness probe passes only after this, so the platform keeps the old version serving.
- **Trade-off:** Dependency checks slow startup by seconds. Without them a broken deploy takes traffic.
- **Follow-up to expect:** "A dependency is briefly down at deploy." Retry for a bounded time, then exit.

</details>

<details>
<summary>Practice question 8. Alston's call-summary service peaks at 18 requests a second, each using 250 ms of CPU. Instances peak at 900 MiB. It stores 200,000 transcripts a day at 30 KB each for a year. Each instance holds a pool of 15 database connections, and the database allows 150. Size it.</summary>

- **Answer:** CPU: 18 × 0.25 = 4.5 cores busy. At 60% target, 4.5 ÷ 0.6 = 7.5, so 8 cores, four instances of 2 vCPUs. Memory: limit about 1.2 GiB per instance, a third above 900 MiB. Storage: 200,000 × 30 KB = 6 GB a day, about 2.2 TB a year. Connections: 4 × 15 = 60, up to 120 during a rolling deploy, under 150. At 8 instances a deploy would need 240, so add a pooler first.
- **Trade-off:** 60% target leaves idle capacity. Running hotter fails on bursts.
- **Follow-up to expect:** "Measured CPU per request rises under load." Re-run the load test at peak and resize.
- **Go deeper:** [Choose a runtime and scale it](/learn/engineering-foundations/cloud-containers-deployment/choose-a-runtime-and-scale-it).

</details>

<details>
<summary>Practice question 9. List the minimal Kubernetes manifests for a stateless web service with one secret and a public endpoint, and the key fields in each.</summary>

- **Answer:** Deployment: replicas, the image by digest, container port, resource requests and limits from measurements, readiness and liveness probes, settings from a ConfigMap and the secret as environment or file, a non-root security context. Service: selector matching the Deployment's labels, port mapping. Ingress: host, path, the Service as backend, a TLS certificate. ConfigMap: plain settings. Secret: the one credential, ideally synced from the customer's secret store. No PersistentVolumeClaim, because the service keeps no files.
- **Trade-off:** Five objects to maintain. Each one replaces work you would otherwise script by hand.
- **Follow-up to expect:** "Add autoscaling." A HorizontalPodAutoscaler on CPU or queue depth, with a maximum that respects database connections.
- **Go deeper:** [Choose a runtime and scale it](/learn/engineering-foundations/cloud-containers-deployment/choose-a-runtime-and-scale-it).

</details>

## References

1. The lessons linked under each heading in this module.
2. The site's [package the service and keep secrets out](/learn/engineering-foundations/cloud-containers-deployment/package-the-service-and-keep-secrets-out) and [choose a runtime and scale it](/learn/engineering-foundations/cloud-containers-deployment/choose-a-runtime-and-scale-it) lessons, the deep dives on images and scaling.

## Key takeaways

- Present deployment options with who operates each, then recommend from the data rules.
- A responsibility matrix names one owner per task and is tested with a real fault.
- Isolation is set per component, and the weakest one sets the level.
- Diagnose from the failing process and its path, then request a precise change.
- Size from measurements, and check connections during a rolling deploy.

## Check yourself

<details>
<summary>1. In practice question 8, why add a connection pooler before scaling to eight instances?</summary>

Eight instances with 15 connections each hold 120. During a rolling deploy old and new run together, up to 240, above the database's 150.

</details>

<details>
<summary>2. In practice question 3, why take the tenant from the verified token?</summary>

A tenant field in the request can be changed by the caller. The token is issued and signed by the identity provider, so it cannot be altered without detection.

</details>
