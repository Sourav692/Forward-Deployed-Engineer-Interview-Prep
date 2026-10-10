# Problem, Goal, and Definition of Done

*Starting to build on day one feels productive, but a team that never agreed what the work is will argue about whether it is finished.*

◷ 5 min

Scoping is not predicting the future; it is writing down what is in, what is assumed and what is still open, so everyone shares one picture. The first three things to pin down are the real problem, a goal with a number in it, and which kind of "done" is being bought.

**Objectives:**

- explain why projects usually fail in their first week rather than their last;
- turn a solution-shaped request into a problem with a measurable goal;
- separate a prototype, an MVP and a production service before any date is discussed.

---

## Draw the Map Before Writing Code

A developer asks how to build a feature. A project lead asks a wider set of questions: what to build, how long it will take, what could break, and how anyone will know it worked. The lead's job is to answer those so the team does not have to guess.

Without that map, a familiar sequence plays out. The team codes the happy path at once. Midway through, a rule surfaces that nobody mentioned. An integration turns out harder than expected. The date slips, and people disagree about whether the project is finished. No one was careless; they simply never agreed what the work was.

A useful map shows four things: what is included now, the assumptions behind the estimate, the questions still open, and the signals that would change direction. It will be wrong in places. Its job is to be shared and to be updated as facts arrive.

## Start From the Problem, Not the Requested Solution

"We want an AI support agent" is a solution, not a problem. The scoping guide models delivery as a chain: problem, requirements, scope, risks, estimate, plan, build, ship, measure. The chain starts with the problem because every later link depends on it.

Three questions find the problem. Who feels the pain: the customer, the support agent, an operator or a manager? What is slow, costly, risky or frustrating today? Which result would make the project worth its cost?

## Put a Number in the Goal

A goal without a number cannot be checked. "Build an AI assistant for support" gives the team nothing to aim at. "Cut average ticket handling time from 12 minutes to under 5, with no rise in escalations or complaints" does.

Once the goal has a number, the technical questions gain a purpose. Which ticket types count? May the system only read data, or also change accounts? How many mistakes are acceptable? Where must a human approve? Each question now has an answer that either helps or hurts the number.

## Agree Which "Done" Is Being Built

A demo, a small pilot and a production service are three different projects with three different price tags.

| Level | Its purpose | What it typically contains |
|---|---|---|
| Prototype | Show the idea could work | Manual setup, a small data sample, the smooth path only |
| MVP | Deliver real value to a small group of real users | Login, the core workflow, basic error handling, simple operations |
| Production | Serve real customers reliably | Security, monitoring, support, rollback, scale, recovery, compliance |

Ask one question before any date is mentioned: "When you say done, do you mean a demo, a pilot for about 20 users, or a full release?"

> **Warning: a date given before "done" is defined is a date for the wrong project.** The customer may be pricing a production service while the team is pricing a demo. Settle the level first.

## Worked Example: Reframing "We Want an AI Support Agent"

A customer opens with the request for an AI support agent. Work back to the problem. The pain sits with support agents, who spend 12 minutes on an average ticket. The cost is handling time. The result that would justify the project is handling time under 5 minutes, with escalations and complaints no worse than today.

Now ask about done. The customer means a pilot for about 20 agents, not a full release. The map can now list what is in (draft replies for the pilot group), what is assumed (read-only access to account data), and what is open (which ticket types count). One sentence of request became a measurable goal and a defined level of done, before any architecture.

---

## Key Takeaways

- Most projects fail early, because the team never agreed what the work was; a shared, updatable map prevents that.
- Begin from who feels the pain and what it costs, not from the requested solution.
- A goal with a number turns open technical questions into decisions with a purpose.
- Prototype, MVP and production are different projects; agree which one before any date.

## Check Yourself

1. **What four things should a scoping map show?**
   What is included now, the assumptions behind the estimate, the open questions, and the signals that would change direction.

2. **Rewrite "build an AI assistant for support" as a measurable goal.**
   For example: cut average ticket handling time from 12 minutes to under 5, with no increase in escalations or complaints.

3. **Why ask about the definition of done before giving a date?**
   A prototype, an MVP and a production service differ hugely in effort. A date given before the level is agreed may be a date for a different project.

