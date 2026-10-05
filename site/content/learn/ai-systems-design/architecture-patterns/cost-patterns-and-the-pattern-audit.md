# Cost Patterns and the Pattern Audit

*Each pattern can cut cost or catch a regression, but a pattern nobody can justify is cost paid by whoever is on call.*

◷ 5 min

Agent workloads compound token use over long trajectories, so cost needs governing patterns of its own, and quality needs checking in production, not only offline. Learn the cost and evaluation patterns, then audit every pattern in a system against the metric that motivated it and the incident it prevented.

**Objectives:**

- choose cost patterns that cut input tokens, route by difficulty and bound the worst case;
- choose evaluation patterns that assert properties and catch regressions offline testing misses;
- compose patterns into a system and remove the ones with no metric and no prevented incident.

---

## Cut the Tokens That Dominate the Bill

Long agent trajectories compound token use, so unchecked runs produce billing surprises. Four patterns govern cost.

A prefix cache boundary keeps the start of the prompt byte-for-byte stable. Input tokens usually dominate spend, so a stable prefix that the provider can cache gives a large input-cost reduction. The book calls it usually the single largest cost lever. Watch the cache hit rate.

A tier router sends traffic by difficulty. On easy traffic the quality difference between models is small, so spend can follow difficulty. Shadow disagreement shows whether the router is choosing well. A semantic answer cache removes whole runs when traffic repeats. Its key must include corpus versions, so a changed corpus does not serve old answers. Track the hit rate and the stale-answer rate.

## Stop Early and Cap the Worst Case

Early termination stops the loop once there is enough evidence. The steps it removes are the most expensive ones, at the end of a long trajectory. Count steps saved per run.

A cost governor bounds the worst case, not only the average. It degrades in graduated steps as spend climbs, so there is no surprise invoice. Watch how often the ceiling is hit.

## Evaluate Properties, Shadows, and Canaries

Three patterns keep quality visible. A trajectory assertion fits work where several paths are valid. Instead of asserting one exact path, it asserts properties that every safe path must have. Unsafe paths fail and valid ones pass. Measure assertion coverage.

Shadow evaluation runs a candidate router or model beside production. Small quality differences need production volume to show up, and the shadow makes them observable through its disagreement rate.

A canary with guardrails rolls a change out to a slice of traffic with automatic limits. Offline evaluation cannot detect small regressions, so the rollout itself becomes the detector. Watch the rollback rate and how much warning a breach gives.

| Worry | Pattern | Signal |
|---|---|---|
| Are we paying full price for the same prompt prefix? | Prefix cache boundary | Cache hit rate |
| Are easy requests hitting the expensive model? | Tier router | Shadow disagreement |
| Are we rerunning identical work? | Semantic answer cache | Hit rate; stale answers |
| Does the loop run past enough evidence? | Early termination | Steps saved per run |
| Could one run blow the budget? | Cost governor | Ceiling trigger rate |
| Do tests reject valid alternative paths? | Trajectory assertion | Assertion coverage |
| Is a new router or model quietly worse? | Shadow evaluation | Disagreement rate |
| Will a small regression reach everyone? | Canary with guardrails | Rollback rate; breach lead time |

> **Warning: a semantic cache keyed only on the question serves stale answers.** When the underlying documents change, the same question deserves a new answer. Include corpus versions in the key, and watch the stale-answer rate.

## Compose Patterns, Then Audit Every One

Patterns compose, and real production systems layer several from each family. A representative system starts with an event-driven or router entry point. Inside sits a bounded loop or a supervisor, wrapped by a tool gateway with typed results. A circuit breaker and degradation ladder wrap that. A cost governor and trajectory assertions cut across the whole thing.

Every added pattern is also cost. So audit each one with two questions: what metric motivated it, and what incident has it actually prevented? A pattern with no answer to either is a strong candidate for removal. In the book's words, patterns are answers to questions. A system holding answers to questions nobody asked carries cost with no benefit, and whoever is on call at three in the morning pays it.

## Worked Example: The System With Nine Unjustified Patterns

The book describes a real production system that had grown five layers of indirection between a request and a model call. It had three caches with different invalidation rules. It had two overlapping retry mechanisms that sometimes interacted to produce duplicate effects. It had an 11-rung degradation ladder, and four of those rungs had never once been seen in production.

The team ran an inventory. For each pattern, they produced the metric that motivated it and the incidents it had prevented. Nine patterns had neither, and they were removed. The two retries were merged into one typed bounded retry. The ladder shrank to 5 rungs that matched observed failure modes. Mean time to resolution fell substantially, and no capability was lost.

In an interview, this is the closing move when asked to justify complexity. Restraint, backed by an audit, reads as more senior than breadth.

---

## Key Takeaways

- A stable prefix, a tier router and a versioned semantic cache cut the tokens that dominate cost.
- Early termination removes the most expensive steps and a cost governor bounds the worst case.
- Trajectory assertions, shadow evaluation and guarded canaries catch what exact-path tests and offline evaluation miss.
- Compose patterns freely, then remove any with no motivating metric and no prevented incident.

## Check Yourself

1. **Which cost pattern is usually the single largest lever, and why?**
   The prefix cache boundary. Input tokens usually dominate spend, and a byte-stable prefix lets them be cached.

2. **Why assert properties of a trajectory rather than one exact path?**
   Several paths can be valid. Asserting properties fails the unsafe paths and passes all the valid ones.

3. **What two questions audit a pattern?**
   What metric motivated it, and what incident has it prevented? A pattern with neither answer should probably go.

## References

**Sources:** `01_Concept_Tutorials/Agentic_System_Design_Book/ch23_system_design_patterns.md` (Chapter 23 of *Cracking Agentic AI System Design Interviews*, summarised in our own words): "Family Six: Cost and Evaluation Patterns", "Composition Rules and the Pattern Audit" (including the deep dive on the system with nine patterns nobody could justify) and the cheat sheet.
