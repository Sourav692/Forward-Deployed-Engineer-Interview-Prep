# Loop Guards and Termination

*A loop that is too tightly bounded gives up on solvable tasks, and one that is too loosely bounded spends money on unsolvable ones.*

◷ 6 min

"The model will figure out when it is done" is not a stopping rule. Give every run explicit budgets and a named ending for each way it can stop, building on the max-iteration guard from [The Tool-Calling Loop From Scratch](/learn/agentic-systems/the-tool-calling-loop/the-tool-calling-loop-from-scratch).

**Objectives:**

- list the budgets that stop an agent from looping forever;
- draw the agent's run as a state machine with every path to termination;
- diagnose a loop guard that allows one more attempt than intended;
- explain why a vague tool error causes identical retries.

---

## Bound Every Run With More Than One Budget

The max-iteration guard is the minimum. An LLM brain can keep calling a tool because it keeps failing, because the answer is unreachable, or because the prompt is adversarial. Only an external bound stops all three.

One budget is rarely enough, because each measures a different kind of runaway.

| Runaway worry | Budget that catches it |
|---|---|
| Is the agent taking too many steps? | A step or tool-call cap |
| Is one run spending too much? | A cost ceiling per run or per conversation |
| Has the run been going too long? | A wall-clock timeout |
| Is the agent re-planning in circles? | A cap on re-plans, with the failure context attached each time |

The interview tutorial's mock travel-support design uses two of these together: a hard cap of 15 total steps per conversation, after which the supervisor must resolve or hand off to a human, and a per-conversation cost ceiling that is logged and alerted on. A cap is only useful if something sensible happens when it trips. Hand off, report, or stop with a clear message.

## Name Every Way a Run Can End

A run is easier to reason about as a state machine. One useful set of states is planning, executing, waiting for approval, processing a result, and terminated. Draw the transitions, and pay most attention to the arrows into terminated.

The scratch loop already has three exits. A final answer ends the run normally. The guard ends it with "Stopped: hit the max-iteration guard." A refused destructive tool pauses it, with `blocked_on` saying what it wanted to do. A production state machine adds the rest: budget exhausted, fatal error, and human rejection. A run cannot be debugged if nobody knows which ending it reached. So make each one distinct in the result and in the trace.

**Say it like this:** "Every run ends one of five ways: success, budget exhausted, fatal error, human rejection, or paused for approval. Each is a different state, and none of them is silent."

## Check the Boundary Condition

A retry limit meant to stop after three retries can run four planning passes. The interview tutorial found this in a Planner-Executor-Verifier notebook. The check was `if retries > 3` rather than `if retries >= 3`, so retries 0, 1, 2 and 3 all ran before the guard tripped.

The fix is not cleverness. It is a decision, written down. Say whether "maximum N retries" includes the first attempt, and write the comparison to match. An interviewer will probe exactly this on a whiteboard. In a production incident, "the agent loops on 3% of requests", a wrong boundary is a realistic root cause to volunteer.

## Make Each Failure Change the Next Action

A guard stops a loop. It does not stop the loop wasting its budget first. That waste usually has a specific cause: the tool's error tells the model nothing new.

A tool error is part of the prompt. It becomes the next thing the model reads. A bare `"Error"` gives the model no reason to do anything different, so it calls the same tool with the same arguments again. A model cannot correct a mistake that nobody described to it. A specific error, such as "room 105 already booked 2025-04-22 to 2025-04-25", lets it pick a different room on the next step. Design errors so the model's next action differs from its last one. [Typed Tool Results and Teachable Errors](/learn/agentic-systems/tool-design-mcp-a2a/typed-tool-results-and-teachable-errors) turns this into a result contract.

## Worked Example: The Agent That Loops on 3% of Requests

A support agent works on most requests and loops until the guard trips on about 3% of them. Diagnose it in two moves.

First, check the guard. Read the boundary comparison and count how many attempts it actually allows. If a limit of three allows four, the loop is longer than specified, but it still ends. A bound that is off by one makes a loop long, not endless.

Second, read the trace of one looping run. Look for the same tool called with the same arguments several times in a row. If the tool returns a vague error each time, the model has nothing new to act on, so it retries. The fix is a specific error message, plus a rule that a repeated identical failure goes to a re-plan or a human rather than another attempt.

The two moves separate a bound that is wrong from a loop that is stuck. Fixing only the guard would make the stuck runs end sooner without making any of them succeed.

> **Warning: a guard is a backstop, not a strategy.** Raising the step cap until the stuck runs finish hides the bug and multiplies the cost of every unsolvable request. When runs hit the guard often, find out why they are stuck before touching the number.

---

## Key Takeaways

- Bound every run with a step cap, a cost ceiling, a timeout and a re-plan cap, each catching a different runaway.
- Treat the run as a state machine and make every ending distinct: success, budget, fatal error, rejection, pause.
- Decide whether a retry limit includes the first attempt, and write the comparison to match.
- Write tool errors that change the model's next action; vague errors cause identical retries.

## Check Yourself

1. **Name four concrete mechanisms that stop an agent looping forever.**
   A step or tool-call budget, a cost ceiling, a wall-clock timeout, and a cap on re-plans with the failure context attached.

2. **A guard reads `if retries > 3`. How many planning passes run before it trips?**
   Four: retries 0, 1, 2 and 3. Use `>=` if three is meant to be the total.

3. **Why does a vague tool error lead to repeated identical calls?**
   The error is the only signal the model gets. If it says nothing specific, the model has no reason to change its next action.

