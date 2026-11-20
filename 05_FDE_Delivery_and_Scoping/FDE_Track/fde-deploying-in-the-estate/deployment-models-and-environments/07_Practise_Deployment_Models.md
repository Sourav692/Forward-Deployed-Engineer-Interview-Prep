---
title: "Practise deployment models"
subtitle: "Ten practice questions on choosing a deployment model, isolating tenants, installing without internet, diagnosing Linux and container failures, and sizing a deployment."
track: "Deploying and Operating in the Customer's Estate"
module_group: Deploy and secure
module_code: T23.1
module_name: Deployment models and environments
lesson: 7
lessons: ["SaaS, customer cloud or on-premises", "Tenancy and isolation", "Disconnected and hybrid installs", "Linux processes, permissions and limits", "Containers and persistent data", "Config, compute and Kubernetes choices", "Practise deployment models"]
level: intermediate
reading_time: "15 min"
source: "Forward Deployed Engineering track"
author: Sourav Banerjee
last_updated: "20 November 2026"
tags: [practice, interview, deployment models, isolation, disconnected install, Linux, containers, Kubernetes, sizing]
---

## How to use this practice

These questions ask you to produce something: a comparison, a matrix, a plan, a diagnosis or a calculation. Answer aloud as if at a whiteboard, writing the key items down. Then compare with the outline. Where the work is a file, such as an image definition or a set of manifests, describe its contents line by line instead of writing it out.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Comparing deployment models and writing a responsibility matrix.
> - Isolating tenants component by component.
> - Planning an install and upgrade with no internet.
> - Diagnosing permission, open-file and memory-limit failures, and defining a safe image.
> - Validating configuration, sizing a deployment and choosing Kubernetes objects.

## Deployment choices

Taught in [SaaS, customer cloud or on-premises](01_SaaS_Customer_Cloud_or_On_Prem.md).

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

Taught in [tenancy and isolation](02_Tenancy_and_Isolation.md).

<details>
<summary>Practice question 3. Your shared service hosts 30 tenants. List the isolation boundary you would set in each component.</summary>

- **Answer:** Entry: tenant taken from the verified token, never from a request field. Database: row-level security on the tenant column, so a missed filter returns nothing. Object store: a prefix per tenant with access scoped to it. Cache: tenant ID first in every key. Queue: per-tenant limits and a low-priority lane for bulk jobs. Compute: fair share of workers per tenant. Logs: tenant tag on every record, support access filtered by tenant. Admin tools: tenant-scoped actions, all logged. Keys: per tenant for the tenants who need it.
- **Trade-off:** Each boundary adds work to every feature. The weakest one sets the real level.
- **Follow-up to expect:** "How do you test it?" Run every endpoint as tenant A asking for tenant B's data.

</details>

## Disconnected installs

Taught in [disconnected and hybrid installs](03_Disconnected_and_Hybrid_Installs.md).

<details>
<summary>Practice question 4. Zennor Energy's control network has no internet. Plan the first install and the upgrade process.</summary>

- **Answer:** Before: list every outside call and remove it. Build a versioned bundle with images, locked packages, model weights, an offline licence, a signed checksum list and image signatures. Test it in an environment with no outbound route. Install: Zennor scans the bundle, verifies signatures offline, loads it into their internal registry, then we install from there in a timed access window with a pre-flight check and reserved rollback time. Upgrades: same path, stated upgrade versions, rehearsed on a staging copy inside. Support: a diagnostics export they review.
- **Trade-off:** Bundled releases are slower. Plan how fast a security patch can cross.
- **Follow-up to expect:** "The window is one hour." Do only load and verify in the first, and upgrade in the next.

</details>

## Linux and containers

Taught in [Linux processes, permissions and limits](04_Linux_Processes_Permissions_and_Limits.md) and [containers and persistent data](05_Containers_and_Persistent_Data.md).

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
- **Go deeper:** [Package the service and keep secrets out](../../../../01_Concept_Tutorials/Consolidated_Lessons/T1.4_Cloud_Containers_and_Deployment/01_Package_the_Service_and_Keep_Secrets_Out.md).

</details>

<details>
<summary>Practice question 7. Yarrow's letter service, now two containers behind a load balancer, restarts under load with exit code 137 and no application error. Uploads are still written to `/app/uploads`. Diagnose the restarts and say where the uploads should live.</summary>

- **Answer:** Exit code 137 with an "OOMKilled" last state means the kernel killed the process at its memory limit, so the application had no chance to log. Compare the limit with the measured peak per container under realistic load, find what drives the peak, such as several large scans converted at once, and bound it, then set the limit at the measured peak plus headroom. The uploads cannot stay in `/app/uploads`: each container has its own writable layer, so one container cannot see the other's files, and a restart or deploy deletes them. Store each upload in object storage, keep its key and status in the database, and test by replacing a container and scaling to two.
- **Trade-off:** Raising the limit is quick and costs memory on every copy. Bounding the work needs a code change and keeps the cost flat.
- **Follow-up to expect:** "Mount a volume instead." A volume lives on one host, so it does not serve two containers on different hosts.

</details>

## Config, compute and Kubernetes

Taught in [config, compute and Kubernetes choices](06_Config_Compute_and_Kubernetes_Choices.md).

<details>
<summary>Practice question 8. Design the startup configuration check for a service deployed to test, staging and production.</summary>

- **Answer:** Before accepting traffic: confirm every required setting is present, with no defaults for addresses, buckets or keys. Check shapes: URLs parse, numbers in range, enums valid. Check the environment: production values must not match a deny-list of sandbox and test hosts. Check dependencies: database connects, upstream API answers a cheap call. On any failure, log all problems without secret values and exit non-zero. The readiness probe passes only after this, so the platform keeps the old version serving.
- **Trade-off:** Dependency checks slow startup by seconds. Without them a broken deploy takes traffic.
- **Follow-up to expect:** "A dependency is briefly down at deploy." Retry for a bounded time, then exit.

</details>

<details>
<summary>Practice question 9. Alston's call-summary service peaks at 18 requests a second, each using 250 ms of CPU. Instances peak at 900 MiB. It stores 200,000 transcripts a day at 30 KB each for a year. Each instance holds a pool of 15 database connections, and the database allows 150. Size it.</summary>

- **Answer:** CPU: 18 × 0.25 = 4.5 cores busy. At 60% target, 4.5 ÷ 0.6 = 7.5, so 8 cores, four instances of 2 vCPUs. Memory: limit about 1.2 GiB per instance, a third above 900 MiB. Storage: 200,000 × 30 KB = 6 GB a day, about 2.2 TB a year. Connections: 4 × 15 = 60, up to 120 during a rolling deploy, under 150. At 8 instances a deploy would need 240, so add a pooler first.
- **Trade-off:** 60% target leaves idle capacity. Running hotter fails on bursts.
- **Follow-up to expect:** "Measured CPU per request rises under load." Re-run the load test at peak and resize.
- **Go deeper:** [Choose a runtime and scale it](../../../../01_Concept_Tutorials/Consolidated_Lessons/T1.4_Cloud_Containers_and_Deployment/02_Choose_a_Runtime_and_Scale_It.md).

</details>

<details>
<summary>Practice question 10. List the minimal Kubernetes manifests for a stateless web service with one secret and a public endpoint, and the key fields in each.</summary>

- **Answer:** Deployment: replicas, the image by digest, container port, resource requests and limits from measurements, readiness and liveness probes, settings from a ConfigMap and the secret as environment or file, a non-root security context. Service: selector matching the Deployment's labels, port mapping. Ingress: host, path, the Service as backend, a TLS certificate. ConfigMap: plain settings. Secret: the one credential, ideally synced from the customer's secret store. No PersistentVolumeClaim, because the service keeps no files.
- **Trade-off:** Five objects to maintain. Each one replaces work you would otherwise script by hand.
- **Follow-up to expect:** "Add autoscaling." A HorizontalPodAutoscaler on CPU or queue depth, with a maximum that respects database connections.
- **Go deeper:** [Choose a runtime and scale it](../../../../01_Concept_Tutorials/Consolidated_Lessons/T1.4_Cloud_Containers_and_Deployment/02_Choose_a_Runtime_and_Scale_It.md).

</details>

## References

1. The lessons linked under each heading in this module.
2. The site's [package the service and keep secrets out](../../../../01_Concept_Tutorials/Consolidated_Lessons/T1.4_Cloud_Containers_and_Deployment/01_Package_the_Service_and_Keep_Secrets_Out.md) and [choose a runtime and scale it](../../../../01_Concept_Tutorials/Consolidated_Lessons/T1.4_Cloud_Containers_and_Deployment/02_Choose_a_Runtime_and_Scale_It.md) lessons, the deep dives on images and scaling.

## Key takeaways

- Present deployment options with who operates each, then recommend from the data rules.
- A responsibility matrix names one owner per task and is tested with a real fault.
- Isolation is set per component, and the weakest one sets the level.
- Diagnose from the failing process and its path, then request a precise change.
- Exit code 137 points at the memory limit, and anything that must outlive a container lives outside it.
- Size from measurements, and check connections during a rolling deploy.

## Check yourself

<details>
<summary>1. In practice question 9, why add a connection pooler before scaling to eight instances?</summary>

Eight instances with 15 connections each hold 120. During a rolling deploy old and new run together, up to 240, above the database's 150.

</details>

<details>
<summary>2. In practice question 3, why take the tenant from the verified token?</summary>

A tenant field in the request can be changed by the caller. The token is issued and signed by the identity provider, so it cannot be altered without detection.

</details>

<details>
<summary>3. In practice question 7, why is a volume not enough for the uploads?</summary>

A volume belongs to one host. With two containers on different hosts, each sees only its own volume, so an upload saved on one host is missing whenever a request reaches the other.

</details>
