# T16.3 Architecture Patterns and Trade-offs: Consolidated Lessons

These five lessons are the site's teaching copy of module T16.3 "Architecture patterns and trade-offs". The first teaches the monolith and microservices trade-off; the other four teach the six families of agent design patterns, each pattern paired with the measurement that justifies it. The site publishes them at `/learn/ai-systems-design/architecture-patterns`.

| # | Lesson | Site slug |
|---|---|---|
| 1 | [Monoliths, Microservices, and the Evolution Model](01_Monoliths_Microservices_and_the_Evolution_Model.md) | `monoliths-microservices-and-the-evolution-model` |
| 2 | [Orchestration Patterns for Agents](02_Orchestration_Patterns_for_Agents.md) | `orchestration-patterns-for-agents` |
| 3 | [Context, Memory, and Tool Patterns](03_Context_Memory_and_Tool_Patterns.md) | `context-memory-and-tool-patterns` |
| 4 | [Reliability and Safety Patterns](04_Reliability_and_Safety_Patterns.md) | `reliability-and-safety-patterns` |
| 5 | [Cost Patterns and the Pattern Audit](05_Cost_Patterns_and_the_Pattern_Audit.md) | `cost-patterns-and-the-pattern-audit` |

## Sources

- `01_Concept_Tutorials/FDE_Handbook/02_System_Design_Fundamentals/03_Monolith_vs_Microservices.md` (own material), lesson 1.
- `01_Concept_Tutorials/Agentic_System_Design_Book/ch23_system_design_patterns.md`, Chapter 23 of *Cracking Agentic AI System Design Interviews* (third-party), lessons 2 to 5. Its ideas are summarised in our own words; its tables and cheat sheet are not copied, and the lessons that use it carry a credit line.

The source files stay in the repository unchanged. The site no longer publishes them as separate lessons; old URLs redirect to lessons 1 and 2. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.
