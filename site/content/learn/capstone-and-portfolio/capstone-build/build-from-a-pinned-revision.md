# Build From a Pinned Revision

*Tracking the latest code keeps a capstone current, but a moving base makes every link and claim unverifiable, so build from one recorded revision and move it on purpose.*

A link to a branch is a promise that the code behind it will not change; branches break that promise. Build from the verified revision recorded below, and use the legacy revision only to trace where a lesson came from.

**Objectives:**

- name the verified revision and why work starts from it;
- tell the current implementation links from the legacy provenance links;
- update the pinned revision deliberately when the code is revalidated.

---

## Start From the Verified Revision

The companion repository is pinned to one verified revision: [`db71e98600bf98c145b6172968da489e05220352`](https://github.com/Sourav692/ai-engineering-demystified-14-projects/tree/db71e98600bf98c145b6172968da489e05220352), verified on 3 October 2026. Every project path in [Choose a Capstone Project](/learn/capstone-and-portfolio/capstone-build/choose-a-capstone-project) is relative to it.

A claim can only be checked against code that holds still. When a lesson says a function and a test exist, they exist at this revision. Fork or check out the capstone at this revision, then record any later move.

## Separate Current Links From Legacy Provenance

The projects were split out of a former monorepo on 29 September 2026. Links to the old `05_Projects/` and `06_Interview_Prep/` paths on `main` no longer work.

Some lessons were extracted from that monorepo at a frozen revision, [`d3cd0e5ea2c5f3c7609bc6d9b767bdff5bd19071`](https://github.com/Sourav692/AI-ENGINEERING-DEMYSTIFIED/tree/d3cd0e5ea2c5f3c7609bc6d9b767bdff5bd19071), dated 28 September 2026. Those paths are valid only at that revision.

| Use | Revision | Example path |
|---|---|---|
| Building and learner-facing links | `db71e98` in the split repository | `projects/03_enterprise_realtime_capstones/01_enterprise_rag_platform/` |
| Tracing where a lesson came from | `d3cd0e5` in the legacy monorepo | `05_Projects/Enterprise_RAG_Platform/` |

Build only from the first row. Use the second only to verify historical source material.

## Move the Pin Deliberately

The FDE repository must not copy the companion projects into its own tree. When the companion code is revalidated, update the verified revision and the current links together, on purpose. Keep the legacy revision unchanged for traceability.

> **Warning: never build on a legacy path.** The legacy paths are valid only at the frozen revision. A capstone built on them inherits code that is no longer maintained.

## Worked Example: Following an Old Link

A candidate finds a lesson that cites `06_Interview_Prep/Handbook/01_LLM_Systems_Foundations/project/` and opens it on `main`. The link is dead.

They check the provenance table: that legacy path maps to tool-calling foundations and robust agents. The current home is `projects/01_foundational_projects/01_agent_tool_calling_foundations/` at the verified revision. They build from that path and keep the legacy one only as a citation. The pin turned a broken link into a two-step lookup.

---

## Key Takeaways

- Build from the verified revision `db71e98`, verified on 3 October 2026, because claims are only checkable against code that holds still.
- The split happened on 29 September 2026; legacy paths are valid only at `d3cd0e5`, for provenance.
- Do not copy the projects into this repository; move the pin and the links together when the code is revalidated.

## Check Yourself

<details>
<summary>1. Why build from a pinned revision rather than <code>main</code>?</summary>

A claim that a function and test exist is only verifiable against code that does not move.

</details>

<details>
<summary>2. A lesson cites <code>05_Projects/AI_Powered_Customer_Support/</code>. Where do you build from?</summary>

`projects/02_retrieval_agent_projects/05_ai_powered_customer_support/` at the verified revision. The legacy path is for provenance only.

</details>

<details>
<summary>3. What changes when the companion code is revalidated, and what stays?</summary>

The verified revision and the current links are updated together. The legacy provenance revision stays unchanged.

</details>

