# Infrastructure as Code and the Release Pipeline

*Clicking through a console is fast once and impossible to repeat, so define the environment as code and let the pipeline, not a person, decide whether a change ships.*

Everything the earlier lessons describe runs somewhere, and every new version has to get there. Make the environment a reviewable text file, make every change flow through automatic gates, and make every stop and rollback automatic.

**Objectives:**

- explain what infrastructure as code and a CI/CD pipeline buy an AI system;
- set up an environment in the right dependency order, with secrets read at startup;
- assemble the AI-specific release pipeline from code change to weekly red team.

---

## Define the Environment as Code

Provisioning a network, a cluster, a database and IAM roles by hand in a cloud console is slow and cannot be reproduced reliably. Infrastructure as code makes the whole environment a versioned, reviewable text file. A CI/CD pipeline turns every code change into a running container without manual steps, which also makes every deploy auditable and reversible.

The handbook's multi-agent research platform on AWS is the concrete example.

| Component | Role | The detail that matters |
|---|---|---|
| Terraform | The single source of truth for VPC, subnets, ECS, load balancer, RDS, ElastiCache, ECR, Bedrock access, Secrets Manager, IAM, the EventBridge schedule and the state backend | The whole environment can be torn down and rebuilt from code; the S3 and DynamoDB state backend is bootstrapped separately, because Terraform cannot create the place it stores its own state |
| GitHub Actions | On every push, builds three Docker images (app, PyRIT, TensorZero), pushes them to ECR and triggers an ECS deployment | If the new deployment fails health checks, it rolls back automatically; no human decides |
| ECR | Stores the built images | |
| ECS Fargate | Runs the containers with auto-scaling | No servers to manage; the app is stateless, so it scales horizontally |
| Secrets Manager | Holds every API key and config value | Loaded once at container startup, never baked into the image and never committed |
| CloudWatch | Container logs | Retention is 7 days, a stated decision |

Developers do not need Docker locally; the pipeline builds and pushes. Teardown is one command, which is how to know the environment really is code.

## Set Up in Dependency Order

The platform's README fixes a strict order. Configure cloud credentials. Bootstrap the Terraform backend. Create the repository and add its secrets. Deploy all infrastructure. Obtain API keys. Fill Secrets Manager. Let the pipeline deploy.

The order encodes dependencies. The backend must exist before Terraform runs. Infrastructure comes before secrets, because the vault has to exist. Secrets come before the first deploy, because containers read them at startup. Getting this order wrong is the most common first-day failure, so writing it down is part of the deliverable.

## Assemble the AI Release Pipeline

Put together, a change to an AI system moves through this pipeline.

```
  code / prompt / policy change
          │
  unit tests · prompt parse tests
          │
  golden-set evaluation vs named baseline
     security gate = 0 · quality no-regression
          │
  build artefacts · register version
          │
  deploy to staging · shadow on real traffic
          │
  canary slice · watch live · auto-rollback on failure
          │
  promote (pointer flip)
          │
  nightly evaluation · production monitoring · weekly red team
```

Every arrow is a place a bad change can be stopped, and every stop is automatic.

> **Warning: a secret baked into an image is a secret in every copy of it.** Images are pushed to registries, cached and shared. Read secrets from the vault at startup, or at request time for user tokens, and never commit them.

## Worked Example: A Policy Change Ships Itself

A security engineer tightens the PII mask in the row-filter SQL and opens a pull request. The change lives in the bundle beside the pipelines and the endpoint, so it is reviewed like code.

On merge, the pipeline runs unit and prompt parse tests. It runs the golden-set evaluation against the named baseline: `no_leak` stays at 1.0 and quality does not regress. It runs the SQL permission assertions as each persona. The bundle deploys to staging, then a canary takes a small slice of traffic. Had health checks failed, rollback would have been automatic. The change is promoted by a pointer flip. That night the scheduled evaluation runs against the live version, and on Monday the red team attacks it.

Nobody clicked anything in a console, and every gate that could have stopped the change was automatic.

---

## Key Takeaways

- Infrastructure as code makes the environment reviewable and rebuildable, and teardown in one command proves it.
- Every push builds and deploys automatically, and a failed health check rolls back without a human.
- Set up in dependency order, and read secrets from a vault at startup instead of baking them in.
- The AI release pipeline stacks tests, a zero-leak evaluation gate, shadow, canary, pointer-flip promotion and scheduled verification.

## Check Yourself

<details>
<summary>1. Why is the Terraform state backend bootstrapped separately?</summary>

Terraform cannot create the storage it uses to hold its own state, so the backend must exist first.

</details>

<details>
<summary>2. What triggers an automatic rollback in the AWS pipeline?</summary>

A new ECS deployment failing health checks. No human decides.

</details>

<details>
<summary>3. Why must the secrets be in the vault before the first deploy?</summary>

Containers read them once at startup, so a container started before the secrets exist cannot run.

</details>

