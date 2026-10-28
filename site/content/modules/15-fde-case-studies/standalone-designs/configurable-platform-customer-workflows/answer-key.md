# Configurable Platform for Customer-Specific Workflows - Answer Key

Try the worksheet before you read this key. Use it to see what a strong GenAI FDE candidate asks, designs, measures, secures and explains while taking a demo to production.

## Strong discovery questions
- Across the ten customers, which differences keep coming back and which happen only once? The first kind earns a platform capability; the second goes down an exception path.
- Is the variation limited to fields, approvals, branding and integrations? Or does it reach into business logic and the states a workflow can pass through?
- Who writes the configuration: our engineers, the customer's admins, or both, with the vendor signing off before anything reaches production?
- Which integrations must exist on day one? If an adapter fails, does the transition stop, or does the workflow carry on in a reduced mode?
- What do customers expect from an upgrade? Must their configs keep working, unchanged, through every core release?
- Where does custom code stop? Is it allowed in the trusted core, confined to a sandbox, or limited to integration points we have approved?
- How fast must a new customer be configured? A target of hours means self-service tooling. A target of a week leaves room for manual review.
- What should happen when someone misconfigures a workflow? Do we need a fallback approval path that always works?

## Strong functional requirements
- Core workflow: ten customers each change fields, approvals, branding and integrations, all on one shared platform and one codebase with no forks.
- Keep a single, stable workflow engine. Every customer runs the same core lifecycle, and every customer ships on the same release train.
- Describe variation as data: schemas, rules and UI metadata. Most customisation should then need no code change.
- Offer an adapter interface. External systems plug into it, and the engine itself never needs rewriting.
- Give every configuration a version and validate it. A change can then be reviewed, tested and rolled back.
- Provide migration and rollback tools, so no version change leaves a customer stuck on a config the platform no longer supports.

## Strong non-functional requirements
- Latency: split the budget by action. A save should feel instant, a validation preview may take a moment, and a full deployment can run slower as long as it is reliable.
- Availability: this case assumes about 1,000 configuration versions a day, with peaks at 3x. Validation and deployment therefore need separate paths, not one synchronous chain.
- Security: arbitrary code stays off unless explicitly allowed. Adapters and secrets belong to one tenant each. We also check the validation rules themselves, because a rule can be a denial-of-service risk.
- Compliance: keep a lasting record of who published each change, what it altered, which approval gate it passed and which version went live.
- Reliability: isolate configuration by tenant. A setting or test change from one tenant must never change how another tenant's workflows run.
- Cost: track spend per validated version and per activated template. Include the support load that a very flexible primitive brings with it.

## Architecture explanation
- Configuration truth lives in the control plane, and workflows execute in the data plane. That separation stops the product splitting into ten forks.
- For every tenant, the workflow runtime handles instances, step transitions, timers and retries the same way.
- Published config versions are immutable. The configuration registry stores them with their release metadata and acts as the system of record.
- On every save and publish, the schema and rule validator runs synchronously. Syntax, semantic constraints, permissions and compatibility all get checked there.
- The UI renderer builds each tenant's forms, labels and layouts from the approved config. Apart from a cache, it stores nothing.
- CRM, ERP, ticketing and webhook connectors all sit behind one standard interface, the integration adapter SDK. Each tenant's credentials are held by reference.
- Rollout runs through a feature flag service, by tenant, cohort or percentage. The few extensions we approve run in a sandbox with strict limits.
- The migration service moves older configs onto new schema versions. Before a release ships, the tenant test harness replays each tenant's contract tests as a gate.

## Data model / integration assumptions
- WorkflowTemplate(id, engine_version, schema); TenantConfig(tenant_id, template_id, version, values); AdapterDefinition(name, contract_version, permissions); ConfigDeployment(tenant_id, version, state).
- ConfigDeployment acts as the deployment ledger. It is the source of truth for the draft, validated, deployed, rolled_back and failed states.
- A rollback adds a new deployment state. It never edits the earlier record, so we can always rebuild the full history.
- Each write states the version it expects to replace. Two operators racing on the same config then cannot overwrite each other without noticing.
- We tag every validation, deployment, adapter test and rollback with the tenant, the config version, a request ID and an idempotency key.

## Red-team risks
- approval loops that never end, drift in adapter contracts, upgrades that break old field mappings, flag combinations nobody tested, escape from the sandbox
- An approval graph with a cycle in it keeps looping at runtime. The harm is deterministic, so a retry will not fix it.
- A downstream service renames a field or changes its response shape. That adapter contract drift breaks every tenant on the adapter at the same moment.
- A tenant upgrade breaks old field mappings, and integrations still pointing at the previous version are left stranded.
- Two feature flags are each safe alone, but nobody tested them together, and the combination opens a bad path.
- Customer-defined logic escapes the sandbox. That is why arbitrary code is denied by default instead of only reviewed.

## Rollout plan
- Week 0-1: find out which differences recur, who owns the configuration and where the line for custom code falls.
- Week 1-2: show that one recurring pattern fits into shared primitives, with no one-off fork needed.
- Week 2-3: keep the gate closed until the team agrees that this pattern is stable enough to become a platform capability.
- Week 3-4: have the first customer admin configure their own workflow, then run a pilot through the real support channel.
- Week 5: before going wider, check that the customer accepts both the support model and the rollback procedure.
- Week 6-8: record a baseline for launch speed, defects and validation failures; scope grows only after that.
- After pilot: grow only if configuration is clearly cutting custom work, not hiding rework somewhere else.

## Evaluation plan
I picked these thresholds for this case. They are not industry standards, so be ready to justify them rather than recite them.

| Metric | What it proves | Strong threshold | Dataset / method |
|---|---|---|---|
| Fork count | We still ship one product, not ten | No customer-specific branch that cannot be removed | Repo analysis plus architecture review |
| Percentage handled by configuration | Customer differences end up in config, not in code | High, and climbing with each onboarding | Tags that classify each change request |
| Time to launch a customer | Onboarding works as a platform feature, not a bespoke project | Shorter for each new tenant | Timestamps from release tracking |
| Config validation failure rate | People writing config can use the tools, and the guardrails catch mistakes | Steady; a spike points to a confusing primitive | Logs from the config service |
| Upgrade time per tenant | Backward compatibility holds | Moving a tenant forward needs no bespoke work | Migration and release records |
| Tenant incident rate | A bad config stays contained | Contained to one tenant and counted apart from platform outages | The incident management system |

## Weak answer
I'd build a flexible workflow system where forms, approvals, themes and API hooks are all configurable. It falls short because flexibility with no governance turns into fragmentation. It never says who may write configuration, what an upgrade must preserve, or where custom code has to stop.

## Average answer
I'd keep one shared engine, push customer differences into versioned configuration, validate it before publish and put integrations behind an adapter layer. That is better, but it never decides which differences should become platform primitives. It sets no limit on what a validation rule may cost to run. It has no plan for a tenant left behind on an old schema.

## Strong answer
I'd split the feature they asked for, configuration, from the result they need: customer-specific workflows that don't break the product into ten incompatible forks. We should be able to test it on three counts: safe, versioned and supportable. The number I'd track is the share of new customer variations that launch without a fork, a hotfix or an escalation to support. In the design, that becomes one stable engine on one release train. Declarative schemas carry most of the variation, and an adapter interface handles integrations. Configs are immutable, versioned and validated before publish. A narrow sandbox appears only where declarative config can't reach, and arbitrary code is denied by default. First I'd show that shared primitives can express one pattern that keeps recurring. Then a real customer admin configures and pilots it, and only after that do we expand.

## Interviewer scorecard
| Area | 1 - Weak | 3 - Average | 5 - Strong |
|---|---|---|---|
| Problem framing | "Make it flexible" | Mentions a shared core and config | Separates the feature from the outcome; variation with no forks is the measured result |
| Requirements | Lists the configurable fields | Adds versioning and validation | Recurring versus one-off, who writes config, upgrade promise, where custom code stops |
| Architecture | One engine with some settings | Registry, validator, adapters | Control plane and data plane apart, sandbox, flags, migration service, tenant test harness |
| Data/integration | Mentions a config table | Names templates and configs | Deployment ledger, rollback as a new state, writes with an expected version, tagged telemetry |
| Evaluation | "Customers are happy" | Counts incidents | Counts forks, measures the share done in config, launch time and per-tenant upgrade time |
| Safety/security | "Admins are trusted" | Separates tenants | Code denied by default, secrets per tenant, rules checked for DoS, audit of who published |
| Rollout | Onboard all ten at once | Pilots one customer | One recurring pattern first, a real admin pilot, baselines before wider scope |
| Communication | Lists features | Clear, but generic | Opens with the fragmentation risk, states the non-goals, ends on the go/no-go gate |

## Final 2-minute spoken answer
I wouldn't open with a list of features. People agree on the headline request and disagree on everything beneath it. So my first job is to pull apart what they asked for, configuration, from what the business needs: ten customers served without the product splitting into ten incompatible forks. I'd make that outcome testable with three words. Safe: no change skips authorisation or creates runtime behaviour nobody reviewed. Versioned: each customer knows which definition is live and what changed in it. Supportable: someone can diagnose a problem and roll a bad configuration back. My own scorecard counts the new customer variations that go live and never needed a fork, a hotfix or a call to support. A count of configurable fields would be a vanity number. The first real design choice is which differences recur. A difference in the approval chain that keeps coming back should become a platform capability. A single seasonal override belongs on an exception path. For the architecture, every tenant shares a single stable engine and a single release train. Declarative schemas carry most of the variation, and an adapter interface handles integrations. Configs are immutable and versioned, and we validate them before publish. A narrow sandbox exists only where declarative config can't go. Arbitrary code is off by default. Adapters and secrets belong to one tenant each, and we check validation rules too, in case one exhausts resources. The failure I'd name is an infinite approval loop. That version fails closed instead of carrying on. My first step is to show one recurring pattern working, and then a real customer admin pilots it.
