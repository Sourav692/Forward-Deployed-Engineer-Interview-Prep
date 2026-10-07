# Technical Aptitude: Mock Questions and Spoken Answers

Five questions for the Engineering and Technical Aptitude round. Each answer is written to be said out loud in about two minutes. Replace every `[bracket]` with your real number before the interview, and do not quote a number you cannot defend.

Use one spine for every answer: the problem, my role, what I did, the key decision, the evidence, the outcome, and what I would change.

## 1. Walk me through the most complex system you built

**Question:** Walk me through the most technically complex system you have built or owned end to end. What was the problem, what architecture did you choose, which decisions were yours, and what would you do differently today?

**Scored on:** problem framing with numbers, technical depth, reasoning and trade-offs, measured outcome, clear delivery.

**Spoken answer:**

"I built a multi-agent ticket triage system for one of India's largest NBFCs. Simple tickets took one to one and a half days to close. Complex ones took four to five days. I was the senior FDE for the full three months, from discovery to production.

Here is how a ticket flows. A supervisor agent reads it and decides where it goes. Knowledge questions go to a RAG agent over their SOPs and past tickets. Data issues go to a data agent with read-only database access. Code issues go to a coding agent I built, which searches their repo and finds the likely cause.

Two decisions were mine. First, the customer asked for full automation, and I said no. Some fixes write to their master customer database, and at an NBFC a wrong write is a compliance problem. So the agents diagnose and propose, and a human approves any write.

Second, I started with one agent holding every tool. On our test set it only reached `[X]%` accuracy, because it had too much context and mixed things up. I split it into focused agents, and accuracy rose to `[Y]%`.

The result: triage time dropped about 90% for simple tickets and 80 to 85% for complex ones.

If I did it again, I would ask about risk and write access in week one, so the right design comes first. I would also give the coding agent a code graph, so it stops re-reading the whole repo on every call."

## 2. Production agent is getting worse and slower

**Question:** An agent you deployed has been live for three weeks. The ops lead says accuracy feels worse this week, and some tickets take 40 seconds instead of 8. There are no errors in the logs. How do you investigate?

**Scored on:** first response and communication, investigation method, separating the two symptoms, fix and prevention, clear delivery.

**Spoken answer:**

"First, I reply to the ops lead and promise an update in 30 minutes. I ask for three or four example tickets, because 'feels worse' is not data yet. If wrong answers are hurting customers, I send more tickets to the human queue as a safe stopgap.

Then I ask one question: what changed this week? Our prompts, the model, our code, their database, or new kinds of tickets.

For the slowness, I open the traces of slow tickets and see which step takes the time. Usually the agent is looping. A tool returns empty results, so the agent keeps retrying. That never shows up as an error.

For accuracy, I rerun our fixed test set. If it still scores well, the system is fine and the incoming tickets have changed. If it scores badly, something in our stack changed, and I check recent changes one by one.

Often it is one cause. For example, they changed a table, so the data agent gets nothing back. It retries, which is the slowness. Then it guesses, which is the accuracy drop.

After the fix, I add those tickets to the test set and set alerts on empty tool results and steps per ticket. Then I send the ops lead a short note on what happened and what is now guarded."

## 3. Two weeks to plan modernizing a legacy monolith

**Question:** A customer gives you a 15-year-old Java monolith, about 2 million lines, with little documentation and the original authors gone. The VP wants a plan in two weeks to modernize one business domain with Blitzy. How do you spend the two weeks?

**Scored on:** ramp-up method, risk and dependency mapping, prioritization, safety of AI-generated code, clear delivery.

**Spoken answer:**

"First, I agree with the VP on what the plan must contain: what we modernize first, the risks, how we prove it works, and a timeline. Week one is for learning the system. Week two is for deciding.

I don't read 2 million lines. I learn from three places. 

The code: Blitzy's ingestion and static analysis give me a map of modules and dependencies. 

Production: logs show which code actually runs every day.

People: the support engineers and business users know the scary parts, like the night job nobody touches.

Then I map what the domain depends on. The biggest trap is shared database tables, because two parts that share a table can't be separated cleanly.

For the first piece, I pick something useful but low risk and not too tangled. Not payments. The first piece is about earning trust.

For the generated code, I first write tests that capture what the old system does today, even its bugs. The new code must pass them. Then I run old and new side by side on real traffic and compare. We switch over behind a feature flag, so rollback takes seconds.

On day ten, the VP gets the map, the first piece and why, the risks, the test plan, the timeline, and what I need from their team. I am also honest about what we still don't know."

## 4. A technical decision you got wrong

**Question:** Tell me about a technical decision you got wrong, or a time you picked a simpler approach over the right one. What happened and what did you learn?

**Scored on:** a real decision that was yours, reasoning at the time, impact, recovery and learning, honest delivery.

If you already told the single-agent story in question 1, use a different example here, such as the coding agent re-reading the whole repo on every call.

**Spoken answer:**

"On my NBFC triage project, I chose to start with one agent that had every tool: knowledge search, database access and code search.

At the time, it made sense. One agent is faster to build and easier to demo, and we had only three months.

It was the wrong call. On our test set of `[N]` old tickets, accuracy was only `[X]%`. When I read the failures, the cause was clear. The agent had too much in one prompt, so it made up field names and sent tickets to the wrong place. It was a design problem, not a model problem.

So I split it into smaller agents, each with one job and a fixed output format. Accuracy went up to `[Y]%`. It cost about `[N]` weeks, and I told the customer openly with the data. They accepted it because I showed evidence.

What I learned: I now ask early how many kinds of knowledge the agent needs and how costly a wrong answer is. And I build the test set before the agent, so I find mistakes in week one, not week four."

## 5. The customer does not trust AI-generated code

**Question:** Blitzy generates thousands of lines of code for a customer in one run. Their head of engineering says, "I don't trust AI code in our production repo." How do you make it safe to merge, and how do you win their trust?

**Scored on:** acknowledging the concern, layered validation, risk-based review, a plan to build trust, clear delivery.

**Spoken answer:**

"First, I tell them the concern is fair. I wouldn't trust any code without checks, from a person or from AI. So the code has to prove itself.

I use four layers.

One, automatic checks: it must build, pass their linters and security scans, and add no unapproved libraries.

Two, tests: it must pass their existing tests, plus new tests that capture current behaviour. I also break the code on purpose to make sure the tests catch it.

Three, human review based on risk: boilerplate gets a light look, while login, payments and data writes get a careful review by their senior engineers. I keep the pull requests small and clearly described.

Four, safe rollout: behind a feature flag, first to a test environment, then a small share of traffic, with quick rollback.

To win trust, I start with one small, low-risk piece and run it through every layer with their team watching. I show the numbers: what each layer caught and how much time it saved. Then we take on bigger work.

And their engineers stay the owners. They approve every merge. The AI does most of the typing, but their team makes the final call."
