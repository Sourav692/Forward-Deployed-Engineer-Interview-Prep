# T9.1 What an Agent Is: Consolidated Lessons

These four lessons are the site's teaching copy of module T9.1 "What an agent is: the tool-calling loop". Each concept is taught once, in the house tutorial format, drawing only on three repository sources. The site publishes them at `/learn/agentic-systems/the-tool-calling-loop`.

| # | Lesson | Site slug |
|---|---|---|
| 1 | [What an Agent Is](01_What_an_Agent_Is.md) | `what-an-agent-is` |
| 2 | [The Tool-Calling Loop From Scratch](02_The_Tool_Calling_Loop_From_Scratch.md) | `the-tool-calling-loop-from-scratch` |
| 3 | [Loop Guards and Termination](03_Loop_Guards_and_Termination.md) | `loop-guards-and-termination` |
| 4 | [Practise Agent Loop Interview Questions](04_Practise_Agent_Loop_Interview_Questions.md) | `practise-agent-loop-interview-questions` |

## Sources

- `01_Concept_Tutorials/FDE_Handbook/01_LLM_Systems_Foundations/03_What_An_Agent_Actually_Is.md` (own material).
- `01_Concept_Tutorials/FDE_Handbook/01_LLM_Systems_Foundations/04_Tool_Calling_Loop_From_Scratch.md` (own material).
- `01_Concept_Tutorials/RAG_and_Agent_Topic_Guides/agent_fundamentals_and_advanced_agentic_systems_INTERVIEW_TUTORIAL.md` (own material; its quoted external interview answers are rewritten in our own words, not reused). Only its sections on ReAct, workflow patterns, loop guards and termination are taught here. Its tool design sections are taught in T16.1, its planning and orchestration sections in T16.2, and its memory sections in T11.2.

The source files stay in the repository unchanged. The site no longer publishes any of the three as separate lessons; old URLs redirect to the matching lesson here.

Every claim, number and code idea in these lessons comes from the three sources. Each lesson ends with a Sources line naming the sections it used. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.
