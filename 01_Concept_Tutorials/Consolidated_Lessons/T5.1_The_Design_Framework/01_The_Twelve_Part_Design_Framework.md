# The Twelve-Part Design Framework

*Covering every part of a design proves structure, but covering them evenly spends time on boxes that do not matter.*

◷ 7 min

A design round is not a drawing exercise; it is a sequence of questions the interviewer asks silently. Learn the twelve questions in order, then answer the first four before drawing anything, because they decide every later choice.

**Objectives:**

- name the twelve parts of a design answer and the silent question behind each;
- turn a vague prompt into a problem statement, a short functional list and quantified quality targets;
- estimate users, traffic, storage and bandwidth well enough to justify the architecture.

---

## Answer the Silent Questions in Order

An interviewer watching a design answer is checking a fixed list. Each of the twelve parts below is one item on that list. Skip one and the interviewer marks it as missing, even if the rest is strong. A part left unanswered cannot score.

| # | Part | The question the interviewer is silently asking |
|---|---|---|
| 1 | Problem definition | Do you know what you are building, and for whom? |
| 2 | Functional requirements | What must it do? |
| 3 | Non-functional requirements | How well must it do it, in numbers? |
| 4 | Capacity estimation | How big is it, roughly? |
| 5 | High-level architecture | What are the major blocks and the request path? |
| 6 | Data design | Where does each kind of data live, and why there? |
| 7 | Component design | What does each service own? |
| 8 | Data flow | Can you trace one real request end to end? |
| 9 | Scalability strategy | What breaks first, and what removes that bottleneck? |
| 10 | Reliability and availability | What happens when each dependency fails? |
| 11 | Security and governance | How is it protected, and how would you prove it? |
| 12 | Trade-offs and future improvements | What did you give up, and what would you do next? |

The running example throughout this module is an AI travel assistant that searches flights, books hotels and chats with the user. It exercises both a traditional transactional core and every AI-specific component. Parts 5 to 8 are taught in [Architecture, Data, and Request Flow](02_Architecture_Data_and_Request_Flow.md); parts 9 to 12 in [Scale, Reliability, and Security](03_Scale_Reliability_and_Security.md).

## Define the Problem Before the Whiteboard

Five minutes of questions prevents twenty minutes spent designing the wrong system. Ask four things. First, what are we building? Restate it and get confirmation. A wrong assumption about the product costs far more than a wrong database.

Second, who are the users? Consumers, internal staff and partners have very different scale, latency and trust profiles. A million casual readers is a caching problem. A thousand power users writing constantly is a locking problem.

Third, what business problem does it solve: revenue, retention, cost or compliance? That answer later justifies eventual consistency, or rules it out. Fourth, what is out of scope? Park payments, fraud and admin tooling explicitly. "I'll assume payments are handled by an existing service" is a senior move, not a dodge.

## Keep Functional Requirements Short and Ranked

Functional requirements are capabilities a user would recognise. Keep the list short, order it by importance and confirm it. For each one, know why it matters to the architecture, because that is what turns a feature list into design input.

| Capability | Why it is architecturally interesting |
|---|---|
| Authentication | Every downstream call depends on knowing the caller; usually the first service drawn |
| Search flights | Read-heavy, latency-sensitive, fans out to supplier APIs: the home of caching, timeouts and partial results |
| Book hotels | A write path with real money and inventory; needs idempotency keys and transactions. Double-booking is the failure interviewers probe |
| Cancel bookings | The compensating action across systems that cannot share one transaction, where sagas and outbox patterns earn their keep |
| Chat with the assistant | Natural language to structured intent to tool calls; brings streaming, memory and non-deterministic latency |
| Travel history | A user-scoped read, ideal for a replica or denormalised view; feeds personalisation |
| Notifications | Asynchronous by nature; behind a queue so a slow provider never blocks a booking |

## Quantify Every Quality Target

Non-functional requirements say how well the system performs. Every one needs a number. "Highly available" means nothing; "99.99% with a 5-minute RTO" is a design constraint. A target without a number cannot be designed against.

| Requirement | What to state |
|---|---|
| Scalability | Reads, writes or both, because they demand different solutions |
| Reliability | Correct results and no data loss under failure, measured by error rate and RPO, not uptime |
| Availability | Nines, justified against business impact; each extra nine multiplies cost |
| Security | A requirement with acceptance criteria, not a layer bolted on at the end |
| Performance | Latency and throughput as percentiles (p50, p95, p99); averages hide the tail users complain about |
| Maintainability | How cheaply the team can change it, which decides whether the design survives year two |
| Cost efficiency | Unit economics: per request, per user, per GB, per million tokens |
| Fault tolerance | Which features may be shed under stress, and which must never fail |
| Observability | Metrics, logs and traces that answer new questions without a deploy |
| Compliance | GDPR, PCI-DSS, HIPAA and residency dictate storage location, retention and deletion, so surface them early |

For the travel assistant, example targets are 99.99% availability, under 2 seconds response, 10M users and GDPR compliance.

> **Warning: an unquantified target is not a requirement.** "Fast", "scalable" and "secure" let any design pass, so they let no design be judged. Attach a number or an acceptance test to each one before moving on.

## Estimate Capacity Before Choosing Technology

The numbers justify the architecture, so estimate before naming tools. Round aggressively. The reasoning matters, not the arithmetic.

| Quantity | Example | How to derive it |
|---|---|---|
| Users | 5M MAU, 500K DAU, 10K concurrent | MAU sizes storage and cost; DAU sizes steady traffic; concurrency sizes pools and instances. State the ratio out loud |
| Traffic | 50K req/s | DAU × actions per user per day ÷ 86,400, then × a 2–5× peak factor. Split reads from writes: a 100:1 read ratio changes everything |
| Storage | 20 TB/year | Records × size, then ×3 for indexes, replicas and backups. Pair it with a retention policy |
| Bandwidth | 2 Gbps | Requests per second × payload, ingress and egress separately. Egress is the expensive direction and the argument for a CDN |

## Worked Example: Opening the Travel Assistant Round

The prompt is "design an AI travel assistant that helps customers search flights, hotels, and book trips". Start by restating it and asking who the users are. Consumers mean high read volume, which makes caching central.

Next, park payments: "I'll assume payments are an existing service." Rank the functional list with search and booking first, chat third. Then quantify: 99.99% availability, under 2 seconds, 10M users, GDPR. Finally size it: 5M MAU, 500K DAU, a 2–5× peak factor, and a read-heavy split.

Those four parts take under ten minutes. Yet they already justify a cache in front of search, a transactional store for bookings and a queue for notifications. Everything drawn afterwards points back to a number said here.

## Walk the Whole Framework as a Mental Model

Compress the twelve parts into ten moves that fit in memory mid-conversation. Define the problem, gather requirements, estimate scale and draw the high-level architecture. Design storage and services, trace one request end to end, then address scalability. Address reliability, then security and governance, and close on trade-offs and next steps.

Walked mechanically, this is a checklist. Walked well, it guarantees no silent question goes unanswered, and the AI additions are the ones most often left silent. The habit that makes it sound like design rather than recitation is simple: name the cost of every component the moment it appears.

---

## Key Takeaways

- The twelve parts are the interviewer's silent questions; an unanswered part cannot score.
- Problem definition fixes the product, the users, the business goal and what is out of scope.
- Functional requirements are a short, ranked list, each tied to why it shapes the architecture.
- Every quality target needs a number; percentiles beat averages.
- Capacity estimates come before technology choices and justify them.
- The framework sounds like design when every named component comes with its cost.

## Check Yourself

1. **Why is "highly available" not a usable requirement?**
   It has no number, so no design can be judged against it. "99.99% with a 5-minute RTO" is a constraint that rules designs in or out.

2. **How do you derive peak requests per second from daily active users?**
   Multiply DAU by actions per user per day, divide by 86,400, then multiply by a 2–5× peak factor. Then split reads from writes.

3. **Why does the business problem matter in part 1?**
   It is what later justifies consistency choices. Revenue at stake on bookings argues for strong consistency; a recommendation feed can tolerate eventual consistency.

## References

**Sources:** `01_Concept_Tutorials/FDE_Handbook/02_System_Design_Fundamentals/01_The_12_Part_Framework.md`: "Why this matters", "The framework at a glance", §1 Problem Definition, §2 Functional Requirements, §3 Non-Functional Requirements, §4 Capacity Estimation, "A simple mental model" and "Interview lens".
