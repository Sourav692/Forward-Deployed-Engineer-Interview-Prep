# Reliability and Safety Patterns

*An agent that degrades and refuses honestly gives up some capability, but it never trades correctness or security for an answer.*

In a multi-step agent run, partial failure is the normal operating condition, and prompt-level instructions cannot stop injection or exfiltration. Turn compounding failure into bounded, recoverable steps with reliability patterns, and enforce security with architecture rather than by asking the model to behave.

**Objectives:**

- design a degradation ladder and a circuit breaker that trips on the right signal;
- make retries, long runs and irreversible actions recoverable;
- enforce safety with privilege separation, provenance, the trifecta guard, egress control, approval gates and grounded refusal.

---

## Degrade Down a Ladder, and Say So

Each step of a multi-step run can fail, so the chance that something fails compounds with length. Partial degradation of dependencies is therefore normal, not an edge case.

A degradation ladder is an ordered set of rungs, from full capability down to an honest refusal. A pure function of a health snapshot picks the rung. The chosen rung is disclosed to the user and recorded as a span attribute. The common finding when teams first instrument this is that a meaningful share of traffic has been running below full capability, unnoticed, for some time. Watch the distribution of traffic across rungs.

## Trip Circuit Breakers on a Windowed Rate

A circuit breaker keeps a failing dependency from being retried into the ground. Each dependency gets a closed, open and half-open state machine. The trigger matters. Trip on a failure rate over a time window with a minimum sample size, never on a run of consecutive failures. Agent traffic is bursty, so a consecutive-failure trigger either trips constantly or never trips at all.

When open, return a typed "unavailable" status immediately, so the degradation ladder can select a lower rung. When half-open, let only a few probes through. Otherwise recovery looks the same as a second outage. Measure how long breakers stay open and how often half-open probes succeed.

> **Warning: a consecutive-failure trigger is the wrong trip for agents.** Bursty traffic makes runs of failures appear and vanish at random. The breaker then flaps or never fires. Use a windowed rate with a minimum sample instead.

## Make Retries, Long Runs, and Irreversible Steps Recoverable

Some failures are worth retrying and some are not. A typed, bounded retry retries only the retryable kinds, never denials or invalid arguments. Track retry success by status.

Long runs meet deploys and pre-emption. Checkpoint and resume lets a run survive the death of its process. Watch the resume rate and the duplicate-effect rate.

Irreversible actions need a decision. A human interrupt pauses the run for that decision without holding a process open while it waits. Watch the age of the approval queue and how often approvals expire. Some effects cannot be undone, only offset. A compensating action gives them a recovery path, judged by how often compensation succeeds.

## Enforce Safety With Architecture, Not Prompts

Asking a model to behave cannot stop injection or exfiltration. A model cannot reliably refuse instructions hidden inside the data it was asked to read. Safety has to be a boundary in the architecture.

Privilege separation keeps untrusted content away from any component that holds capability, so injected text has nothing to act with. Measure the residual attack success rate. Provenance tagging records where each piece of content came from, so policy can refer to it. That is what makes the next pattern enforceable, and the share of untrusted content per run is its measure.

The trifecta guard covers three capabilities that are dangerous together. It refuses the combination outright rather than trying to filter it, and its trigger rate is the signal. An egress firewall covers both ways data can leave: through tool arguments and through rendered output. It blocks exfiltration on both paths. Count egress denials by principal.

An approval gate puts a person in front of irreversible actions, bounding catastrophic risk. Watch decision time and how often approved actions are later reversed. Grounded refusal treats an uncited claim in grounded mode as not a fact. Confident errors become refusals, measured by the rate of answers with no citation.

| Worry | Pattern | Signal |
|---|---|---|
| Is the run quietly below full capability? | Degradation ladder | Distribution across rungs |
| Is a dead dependency being hammered? | Circuit breaker | Open duration; half-open success |
| Are we retrying things that will never succeed? | Typed bounded retry | Retry success by status |
| Does a deploy kill long runs? | Checkpoint and resume | Resume rate; duplicate effects |
| Does an irreversible step have an owner? | Human interrupt, approval gate | Queue age, expiry; decision time, reversals |
| Can a done thing be offset? | Compensating action | Compensation success rate |
| Can injected text reach a capability? | Privilege separation, provenance tagging | Residual attack success; untrusted share |
| Are three dangerous capabilities combined? | Trifecta guard | Guard trigger rate |
| Can data leave through arguments or output? | Egress firewall | Egress denials by principal |
| Is an uncited claim presented as fact? | Grounded refusal | Citation-free answer rate |

## Worked Example: A Search Dependency Goes Down

An agent depends on a search service that starts failing in bursts. A breaker set to trip on a run of consecutive failures never trips, because successes interleave with the failures. Over a windowed rate with a minimum sample, the failure rate crosses the threshold and the breaker opens.

Now calls return a typed "unavailable" at once. The ladder selects a lower rung and tells the user the answer is limited. The span records the rung. Later, a handful of half-open probes succeed and the breaker closes.

The user got a smaller, honest answer instead of an exception or a confident guess. The rung distribution shows how much traffic ran degraded, so the outage is visible after the fact.

---

## Key Takeaways

- A degradation ladder steps down to honest refusal, discloses the rung and records it.
- Circuit breakers trip on a windowed failure rate with a minimum sample, return a typed "unavailable" and admit few probes.
- Typed retries, checkpoints, human interrupts and compensating actions make failures recoverable.
- Safety comes from architectural boundaries: separation, provenance, the trifecta guard, egress control, approval gates and grounded refusal.

## Check Yourself

1. **Why must an agent's circuit breaker not trip on consecutive failures?**
   Agent traffic is bursty, so a consecutive-failure trigger either trips constantly or never trips. A windowed rate with a minimum sample is stable.

2. **What makes the trifecta guard enforceable?**
   Provenance tagging. Policy can only refuse a dangerous combination if it knows where each piece of content came from.

3. **What does a degradation ladder disclose, and why?**
   The rung selected, to the user and as a span attribute. That makes degraded traffic visible instead of silent.

