# A Senior FDE's Day

*Deep technical time and availability to customers and the team pull against each other, so order the day by who is blocked, not by what is fun to build.*

A senior FDE's day does not start with their own tickets. Walk through the five parts of one day below, each tied to a lens from [The Three Lenses of FDE Work](/learn/orientation/the-fde-role/the-three-lenses-of-fde-work).

**Objectives:**

- describe what happens in each part of the day and which lens leads it;
- explain why unblocking comes before personal work;
- say why reviewing designs before code is cheaper than after.

---

## Start by Finding Who Is Blocked

The morning is leadership-heavy. A five- to fifteen-minute sync, sometimes async, surfaces the one decision that costs someone their whole day if it waits an hour. Usually that is an ambiguous requirement, a platform access or permissions issue, or a design question that is really a scoping question.

A blocked engineer is the highest-leverage problem of the morning. Many "technical" questions from junior engineers are unclear scope in disguise. Coach them to spot that difference themselves, rather than only answering the instance.

## Keep Mid-Morning for the Highest-Risk Decision

Mid-morning is for work only the senior FDE should do: the architecture decision with real trade-offs, the genuinely hard piece of the pipeline, or a design review before code is written. On the source's engagement with a large Asian life insurer, this meant a two-layer access-control pattern. A fast metadata pre-filter ran at the vector-search layer, and a live re-check against the governed catalogue ran just before generation.

The reason was risk, not novelty. Getting that boundary wrong does not fail loudly; it fails silently. Reviewing designs before implementation catches a wrong turn while it is still cheap.

## Give Midday to Whatever the Account Needs

Midday is discovery, a demo, or an escalation, never a fixed slot. Early in an engagement, run discovery as two separate conversations. One is with the people who will use the system, such as claims managers, analysts and actuaries. The other is with compliance and security. They surface different requirements, and both are needed before the first access rule.

Later, midday becomes readouts and hard scope conversations: what fits this sprint versus the next. Own those conversations directly. Narrow the first build on purpose, for example two business units and one market, to prove the model before expanding.

## Review Afternoon Work Against the Customer's Intent

Afternoons mix the FDE's own build time with reviewing what the team produced. Review for correctness, and also for whether the work matches what the customer asked for. That is not always what the ticket says. If a design has drifted from the customer's intent, have that conversation today rather than after it ships.

## Close the Day by Asking How It Fails

Before calling anything done, find out how it fails, not only that it works. On the source author's reference build, the evaluation harness caught three real issues before any customer would have. It also flagged a leak that turned out to be a false alarm: the test data was stale.

Report that openly, false alarm included. Transparency builds more trust than a spotless record. Validate against the customer's success bar, such as a zero-leak gate agreed with compliance beforehand, not only an internal definition of done.

> **Warning: hiding a false alarm costs more than reporting it.** A clean narrative that later proves incomplete damages trust with both the team and the customer. Model transparent reporting as the team standard.

## Worked Example: A Tuesday on the Insurer Engagement

This composite day assembles the source's own details. At 9:00 an engineer is stuck on a permissions question. It looks technical, but it is a scoping question, so the FDE decides it within the hour. Mid-morning goes to the two-layer access-control design, because a silent leak is the costliest failure.

At midday the FDE meets compliance and agrees the zero-leak gate. In the afternoon a teammate's design has drifted from what the customer meant; the FDE raises it that day, before it ships. By evening the harness runs, flags one leak, and the FDE traces it to stale test data and says so. Every part of the day served one of the three lenses, in the order the engagement needed.

---

## Key Takeaways

- Start the morning by finding who is blocked; unclear scope often hides inside technical questions.
- Keep mid-morning for the highest-risk decision, and review designs before code is written.
- Give midday to discovery, demos or escalations, running users and governance as separate conversations.
- Review afternoon work for the customer's intent, not only correctness.
- Close the day by testing how it fails and reporting failures, false alarms included.

## Check Yourself

1. **Why does a senior FDE unblock the team before working on their own tickets?**
   A blocked engineer can lose a whole day to one undecided question, so removing that friction has the highest leverage.

2. **Why run discovery with users and with compliance as separate conversations?**
   They surface completely different requirements, and both are needed before writing any access rule.

3. **The harness flags a leak that turns out to be stale test data. What do you do?**
   Trace it, then report it openly, false alarm included. Transparency builds more trust than a clean track record.

