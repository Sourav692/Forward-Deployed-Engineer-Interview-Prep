# Package the Service and Keep Secrets Out

*A container image should carry everything the service needs to run and nothing an attacker could use, so configuration and secrets arrive at runtime, never at build time.*

A working service on a laptop is not a deployable artefact. Package it as a small, safe image first, then read [Choose a Runtime and Scale It](/learn/engineering-foundations/cloud-containers-deployment/choose-a-runtime-and-scale-it) for where that image runs.

**Objectives:**

- describe a multi-stage Docker build for a FastAPI GenAI service and why each choice is there;
- explain why no secret belongs in an image, and where secrets come from instead;
- set up typed settings that differ per environment while the code stays identical.

---

## Build in Two Stages

A FastAPI GenAI service needs build tools to install its Python packages, but it does not need them to run. A **multi-stage build** separates the two jobs. Stage one installs the build tools and the packages. Stage two copies only what the service needs into a small runtime image, for example `python:3.11-slim`.

The small image is cheaper to ship and has less inside it to attack. Three more choices finish the image. Run the process as a **non-root user**, so a compromised process holds fewer rights. Add a `HEALTHCHECK`, so the platform can tell a running container from a working one. Start the app with **Gunicorn** managing **Uvicorn workers**, so one container serves requests on several worker processes.

For local development, **docker-compose** runs the API, PostgreSQL and Redis together. One command then gives every developer the same three services.

## Treat the Image as Public

An image that holds a secret leaks it to everyone who can pull the image. So never put API keys or database passwords in the code, the Dockerfile or the image. The test is simple: the image should be safe to push to a public registry.

Secrets arrive at runtime instead, through **environment variables** or a **secrets manager**. The image then describes how to run the service, and the environment decides which credentials it runs with.

## Load Settings Into One Typed Class

Read every setting through one typed settings class, such as a `BaseSettings` class from **pydantic-settings**. The class reads environment variables, checks their types, and fails at start-up when one is missing. A `.env` file is fine for development only.

In production, store secrets in **Kubernetes Secrets** or a real secrets manager: AWS Secrets Manager or Parameter Store, or GCP Secret Manager. Do not use **ConfigMaps** for secrets. ConfigMaps are not encrypted by default, so they are the wrong place for a credential.

## Give Each Environment Its Own Secrets

Keep separate secrets for dev, staging and production. The code is identical in all three; only the values differ. A staging key that leaks then cannot touch production, and promoting a build never means editing it.

> **Warning: a ConfigMap is not a secret store.** It looks like the natural home for settings, but it is not encrypted by default. Keep every credential in Kubernetes Secrets or a secrets manager.

## Worked Example: Containerising an Inference API

Take a FastAPI service that calls an external LLM and stores sessions in Redis.

The Dockerfile has two stages. The first installs packages; the second starts from `python:3.11-slim`, copies the installed packages and the app code, and switches to a non-root user. It declares a `HEALTHCHECK` and starts Gunicorn with Uvicorn workers.

The code reads `llm_api_key`, `redis_url` and `database_url` from a pydantic-settings class. On a laptop, a `.env` file supplies them and docker-compose starts the API with PostgreSQL and Redis. In production, the same image starts with values from Kubernetes Secrets, and staging uses a different set.

The image never changes between environments. Only the injected values do, which is exactly what makes the image safe to push anywhere.

---

## Key Takeaways

- A multi-stage build keeps build tools out of a slim runtime image; run as non-root, add a health check, and start Gunicorn with Uvicorn workers.
- Treat every image as public: no API keys or passwords in code, Dockerfiles or images.
- Read configuration through one typed settings class; `.env` is for development, and ConfigMaps are not for secrets.
- Separate secrets per environment, so the same code runs everywhere with different values.

## Check Yourself

1. **What does a multi-stage build buy you?**
   The build tools and intermediate files stay in the first stage. The runtime image holds only what the service needs, so it is smaller and has less to attack.

2. **A teammate stores the LLM API key in a Kubernetes ConfigMap. What do you say?**
   ConfigMaps are not encrypted by default. Move the key to Kubernetes Secrets or a secrets manager such as AWS Secrets Manager or GCP Secret Manager.

3. **How do dev, staging and production differ in this setup?**
   Only in the injected values. The code and the image are identical; each environment has its own secrets.

