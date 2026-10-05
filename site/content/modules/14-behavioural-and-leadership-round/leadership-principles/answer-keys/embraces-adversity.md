# Embraces Adversity - Answer Key

Spoken answers - 3 grounded, 1 needing your input. Deliver them in your own cadence; the wording is a script, not a recitation.

## 1. The hardest professional challenge you've faced

**CEO-ready answer.**

> "My first architecture failed weeks into a two-month engagement at a large Asian life insurer. The single agent with twenty-plus tools picked the wrong tool and lost accuracy. The sponsor expected an MVP. The data team was watching whether I knew what I was doing. There was no slack in the calendar. I told the sponsor directly: it doesn't work, here's why, here's the fix and its cost. I re-architected live, kept every tool and asset and added tracing. We shipped on time. After that, the sponsor brought me straight into the next scoping conversation. They had learned they'd hear the truth from me."

**Technical-interviewer answer.**

> "The root cause was structural. One agent carried twenty-plus tool schemas plus conversation history, and tool selection degraded as context grew. I re-architected into a Supervisor with four specialists. Intent classification carried a confidence score, and below 60% the system asked a clarifying question. I changed only the orchestration and kept every tool and data asset, so the pivot could be rolled back. Per-node MLflow tracing showed which node made each decision. A held-out evaluation set told us within days whether the new design worked. We shipped on time. Later the Supervisor approached the same bloat as domains grew. I moved to a Deep Agent with self-contained subagents before it broke. The design rule now: specialize early and keep each context small."

**GROUNDED — insurer live architecture failure.** Alternative if you'd rather: a global tier-1 bank (cross-region migration at hundreds of millions of events a day, a big runtime reduction) — `[FILL: the bottleneck, the hardest call, the go-live friction]`.

*"The hardest was at a large Asian life insurer: weeks into an engagement of about two months, my first architecture broke down in real testing. Not subtly — the single agent with 20-plus tools was picking the wrong tool and losing accuracy under context bloat. I had a sponsor expecting an MVP, a data team watching whether the 'AI person' actually knew what they were doing, and no slack in the calendar.*

*I told the sponsor directly: version one doesn't work, here's the specific mechanism, here's the fix and what it costs. Then I re-architected live into the Supervisor pattern, kept every existing tool and asset so the pivot was reversible, and added tracing so we'd know fast if the second design failed too. Later the same failure mode reappeared one level up, and I pivoted again into the Deep Agent pattern.*

*What it changed: the relationship with the sponsor moved from 'vendor with a plan' to 'engineer who tells us the truth mid-flight.' `[FILL: one concrete sign — e.g., they brought me into the next scoping conversation directly].` And it gave me a pattern I've used on every agentic engagement since: specialize early, and keep each agent's context small."*

## 2. Adversity that strengthened trust

**CEO-ready answer.**

> "Adversity erodes trust when it's discovered. It builds trust when it's disclosed. When my first design at the insurer broke, the easy move was a quiet patch. Instead I put the failure in front of the team and the sponsor. I showed the trace data, named the cause and proposed the fix. Two things changed. Engineers began flagging their own drift in daily review, instead of at demo time. And the compliance and security stakeholders saw something important. When something went wrong with a system over health disclosures, they would hear it from me first. That earned more trust than a clean demo."

**Technical-interviewer answer.**

> "The technical move was to make the failure inspectable, not just admitted. I showed the team and the sponsor the per-node traces. They showed which tool the agent chose, which it should have chosen and how accuracy fell as context grew. I named the mechanism: context bloat degrading tool selection. Then I proposed a bounded fix, new orchestration over the same tools and data. Tracing stayed in place, so the second design would be judged on the same evidence. That set the standard for daily review. Engineers flagged drift with traces and evaluation results, not impressions. For compliance and security, it proved a working disclosure path on a system over health disclosures."

**GROUNDED — the transparent pivot**

*"The same insurer failure is the example. The moment the first architecture broke, the easy move was to quietly patch it and keep the demo narrative intact. I did the opposite: I put the failure in front of the team and the sponsor with the trace data, named the mechanism, and proposed the pivot.*

*Two things happened. The team stopped hedging their own findings — once the senior person on the engagement had said 'my design was wrong, here's the evidence,' `[FILL: e.g., engineers started flagging their own drift in daily review instead of at demo time]`. And the customer's compliance and security stakeholders, who had every reason to be skeptical of an AI system over health disclosures, saw that when something went wrong they'd hear about it from me first.*

*Adversity erodes trust when it's discovered. It strengthens trust when it's disclosed."*

## 3. Push through or change course

**CEO-ready answer.**

> "One question decides it: is this a tuning problem or a structural problem? At the insurer, my single-agent design was failing mid-engagement. Pushing through meant more prompt tuning. Changing course meant re-architecting with a shrinking window. Tracing showed the flaw was structural. Too many tools in one context degrade tool choice, and no prompt fixes that. So I changed course, but kept it small: same tools, same data, new orchestration on top. When the same pattern reappeared later, I changed course earlier, before it broke. Push through when the structure is sound. Change course when the structure is the problem."

**Technical-interviewer answer.**

> "The tracing answered it. Prompt changes moved individual cases but did not fix the pattern. The errors were wrong tool selections, and they grew with context size. That is a structural signature. Twenty-plus tool schemas in one context degrade selection regardless of prompt wording. So I made the smallest structural change available. Tools and data stayed, and only the orchestration changed, to a Supervisor routing across specialists. A held-out evaluation set confirmed the change. Prompts lived in a governed table with a five-minute cache, so tuning inside the new structure needed no redeploy. Later, as domains grew, the Supervisor's context started to bloat. I recognised the signature and moved to a Deep Agent before accuracy dropped."

**GROUNDED — insurer pivot logic**

*"At the insurer, when the single agent broke mid-engagement, 'push through' meant prompt-tuning a design with a structural flaw; 'change course' meant re-architecting with a shrinking window. The deciding question was: is the failure a tuning problem or a mechanism problem? Tracing showed it was mechanism — tool selection degrades with twenty-plus schemas in context — and no amount of prompt work fixes that. So I changed course, but bounded it: same tools, same data, new orchestration on top.*

*The second time — when the Supervisor itself started re-approaching the same bloat — I changed course earlier, before it broke, because I recognised the mechanism.*

*The rule: push through when the problem is tuning and the structure is sound; change course when the structure is the problem — and make the change as small as the mechanism allows."*

## 4. Receiving harsh or unexpected criticism

**CEO-ready answer.**

> "I check whether it's true before deciding how I feel about it. After an insurer readout, their compliance lead told me bluntly I had brought them in too late. They were reacting to my design instead of shaping it. I looked at the record. Several access rules I'd derived from user interviews had to be reworked after their review. That cost a cycle. They were right, and I said so. I changed my practice permanently. Governance stakeholders now join the first round of discovery, alongside users. I'd rather be corrected early than be confidently wrong in front of a customer."

**Technical-interviewer answer.**

> "The criticism was about sequencing, and the evidence confirmed it. I had derived access rules from user interviews first. The compliance review came afterwards. The access matrix is role by document type by market. Several of its rules had to change after compliance reviewed them. Each change rippled into the policy layer and the leak-test cases built on it. That was a full rework cycle. The fix was to move governance input upstream. Compliance, legal and security now join the first discovery round. The success bar is agreed with them before the build. The access matrix is now a signed-off input to the design, not something I derive and defend later."

**NEEDS YOUR INPUT.** Suggested spine, with your existing stance (evidence over ego, the retrieval benchmark, the false alarm):

*"`[FILL: who, what they said, context].` My first move was to check whether it was true before deciding how I felt about it — `[FILL: what you looked at]`. `[It was right / partly right / wrong]`, and `[FILL: what you changed or how you responded]`. I'd rather be corrected early than be confidently wrong in front of a customer — it's the same reason I benchmark my own preferences and report my own false alarms."*
