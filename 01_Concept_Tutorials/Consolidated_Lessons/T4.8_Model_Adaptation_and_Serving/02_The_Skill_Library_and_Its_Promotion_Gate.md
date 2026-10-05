# The Skill Library and Its Promotion Gate

*Saving every successful run as a reusable skill grows the library fast, and fills it with skills that worked exactly once unless a gate stands between success and trust.*

◷ 4 min

A skill is a learned procedure, the third of the [Four Learning Surfaces](01_Four_Learning_Surfaces.md). The whole design problem is the gate between "a run succeeded once" and "this is now a trusted skill", and the gate has to work in both directions.

**Objectives:**

- define a skill precisely enough to evaluate it;
- promote a candidate only after held-out evaluation and a shadow period;
- demote a skill automatically when its live success falls.

---

## Define the Skill Before Trusting It

A skill is a named, parameterised sequence of tool calls with a stated precondition, a stated postcondition and a measured success rate. Without those, there is nothing to evaluate. With them, a skill can be tested like any other change.

## Gate Promotion Twice

Candidates come from successful run traces. Extract the sequence and generalise its arguments. Discard it if it duplicates an existing skill. Otherwise it faces two gates in order.

**Offline, on held-out cases.** Evaluate the candidate only on cases it never produced. Grading it on its own source traces measures memorisation, which is how a library fills with skills that worked once. It must beat the baseline by a stated margin.

**Online, in shadow.** Run it on a small share of live traffic. It is promoted only if its live success matches or beats the baseline.

```
successful traces → extract and generalise → duplicate? ──yes──▶ discard
                                                 │ no
                         offline eval on HELD-OUT cases ≥ baseline + margin?
                                                 │ yes
                         shadow on a small % of live traffic ≥ baseline?
                                                 │ yes
                         production skill library ──live success regresses──▶ auto-demote
```

## Demote Without Waiting for a Human

Promotion is only half the gate. Environments drift, and a skill that encodes last quarter's API shape must leave production before anyone notices it failing. Demotion is automatic when live success falls below a floor.

The book gives reference values. A candidate must beat the baseline by 5 points to be promoted. It needs at least 200 live shadow attempts first. A skill falling 4 points below the baseline is removed automatically. A library that only ever grows becomes a liability within about two quarters; the demotion path keeps it honest.

This mechanism is an evaluation harness applied to a learning surface. Describing the gate precisely, with held-out data, shadow traffic and automatic demotion, is high-leverage in an interview that weighs evaluation infrastructure. "We test skills before using them" is not enough.

> **Warning: grading a skill on its own traces always looks good.** The traces that produced the skill are the ones it is guaranteed to fit. Only held-out cases measure whether it generalises.

## Worked Example: A Service-Restart Skill

The operations agent has restarted a service successfully a dozen times with the same three tool calls: check health, drain traffic, restart. A candidate skill is extracted, with the service name as a parameter, a precondition that the service is unhealthy and a postcondition that health checks pass.

Offline, it runs on held-out restart cases from other services and beats the baseline by more than 5 points. In shadow, it handles a small share of live restarts and reaches 200 attempts with success at or above the baseline, so it is promoted. Months later, a platform change adds a required approval step. Live success falls more than 4 points below baseline and the skill is demoted automatically, before an engineer files a ticket.

The library stayed trustworthy because entry and exit were both measured.

---

## Key Takeaways

- A skill is a parameterised tool sequence with preconditions, postconditions and a measured success rate.
- Evaluate candidates only on held-out cases, never on the traces that produced them.
- Promote through two gates: beat the baseline offline by a margin, then hold up in shadow on live traffic.
- Demote automatically when live success drops; reference values are a 5-point margin, 200 shadow attempts and a 4-point demotion floor.

## Check Yourself

1. **Why must a candidate skill be evaluated on held-out cases?**
   Its own source traces measure memorisation, so it always looks good on them. Held-out cases show whether it generalises.

2. **Why is automatic demotion as important as promotion?**
   Environments drift. Without demotion, skills that encode outdated behaviour stay in production until someone notices, and the library becomes a liability.

3. **Give the book's reference gate numbers.**
   Beat the baseline by 5 points, at least 200 shadow attempts before promotion, and automatic removal at 4 points below baseline.

## References

**Sources:** `ch08_learning_in_agentic_systems.md` (Chapter 8 of *Cracking Agentic AI System Design Interviews*, third-party; summarised in our own words): "The Skill Library and Its Promotion Gate", its gate numbers and interview pointer, Cheat Sheet.
