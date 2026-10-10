# Ask Before You Architect

*Drawing early looks decisive, but every unasked question is a design assumption that can cost weeks, so spend the opening minutes on five areas first.*

◷ 5 min

Interviewers are not testing whether a candidate can design a system; they are testing whether the candidate would spend three months building the wrong one. Question five areas before touching the whiteboard, then read [Let the Answers Change the Design](/learn/orientation/first-ten-minutes/let-the-answers-change-the-design) for how to use what you hear.

**Objectives:**

- name the five question areas and give one question for each from memory;
- say which design decision each area settles;
- identify the question most often forgotten and what forgetting it costs.

---

## Recognise the Failure You Are Preventing

The same failure appears in an interview and in a customer's first scoping call. Someone reaches for the pen and draws the architecture already in their head. On day forty they discover the customer is multi-tenant, or the data changes hourly, or the system can act and nobody discussed what a wrong action costs.

A design cannot fit constraints nobody asked about. The routine below applies unchanged to a RAG platform, an agent platform or a delivery process. That is why it sits in orientation rather than in one technical track.

## Find Out Who the Customer Really Is

Ask whether this serves one enterprise or many tenants. Ask what decision the answer feeds. Ask who the end users are: employees, external customers or both, technical or not.

One answer here decides the whole isolation model. "One customer" and "many tenants" are not two sizes of one system; they are two systems. "Non-technical users configure it" is not a UI detail either. For an agent platform it decides the whole authoring surface.

## Check the Data and System Reality

Ask what shape the data, or the systems to integrate with, are in today. Ask whether it is static or changes, and how fast. Ask who owns data and access quality, and whether it is available before day one.

Most demos assume clean, structured input. Real deployments never have it. A corpus that changes hourly needs incremental sync and freshness tracking. A corpus whose permissions nobody owns cannot be made access-aware, however good the retrieval. That third question is the one people forget, and it is the one that stalls engagements.

## Measure Access and Blast Radius

Ask whether every user or tenant has the same access, or whether visibility varies by group, role or region. Ask whether the system is read-only or takes real actions. Then ask which costs more: a wrong action or an over-cautious refusal.

These answers set how much guarding the design needs. Per-user visibility reshapes the retrieval path. The ability to act brings in every containment mechanism. The wrong-action-versus-refusal question sets the tone of the guardrail policy: a refund bot and a research assistant should not share a default.

## Size the Scale and the SLA

Ask roughly how many tenants, users, items and requests. Ask what latency is acceptable. Then ask whether that means p50, or p95 and p99.

Ten and ten million are different systems. What breaks first at twenty million documents does not matter for a customer with two thousand. The percentile matters because an LLM pipeline's tail latency is set by the slowest of several sequential model calls. A p50 target and a p99 target lead to different architectures.

## Agree the Definition of Done

Ask how the customer will know it is working, and whether quality or accuracy is measured today. Ask whether there is a fallback when it is wrong or down, such as escalation to a human.

Offering to own evaluation is the strongest FDE signal in the room. It signals an intent to be judged on the outcome, not on shipping. It also shows early whether a golden set exists or must be built with the customer's experts. Building one can take a week of a two-week plan.

> **Warning: the forgotten question stalls engagements.** "Who owns data and access quality, and can we get it before day one?" is the one people skip. Without an owner, permissions cannot be made access-aware, however good the retrieval.

## Worked Example: Five Areas on One Prompt

The prompt is "Design an AI assistant for our support team." The candidate asks four questions, not twelve.

"Is this one company's team or a product for many customers?" Many customers: isolation is now the first design decision. "Who owns the ticket data's permissions today?" Nobody clearly: access-aware retrieval is at risk until an owner exists. "Can the assistant issue refunds, or only answer?" It can issue credits: containment and approval gates are in scope. "How do you measure answer quality now?" Not at all: offer to build the golden set with their senior agents.

Four questions moved the design from a generic chatbot to a multi-tenant, access-aware agent with an approval gate and an evaluation plan.

---

## Key Takeaways

- The failure is drawing a prepared architecture before learning the constraints that break it.
- The customer question decides tenancy, isolation and the authoring surface.
- The data question decides ingestion and freshness, and its ownership question is the one most often forgotten.
- The access question decides the permission-aware retrieval path and the guardrail policy.
- The scale question decides the index architecture, and the percentile changes the design.
- The definition-of-done question decides the evaluation plan, and offering to own it is the strongest FDE signal.

## Check Yourself

1. **Name the five areas and one question for each.**
   Customer: one enterprise or many tenants? Data reality: static or changing, and how fast? Access and blast radius: read-only or acting? Scale and SLAs: p50 or p95/p99? Definition of done: is quality measured today?

2. **Why does the latency percentile change the architecture?**
   Tail latency is set by the slowest of several sequential model calls, so a p99 target forces different choices from a p50 target.

3. **Which question is most often forgotten, and what does forgetting it cost?**
   Who owns data and access quality, and whether you can get it before day one. Without it, the corpus cannot be made access-aware and the engagement stalls.

