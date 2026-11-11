# T16.1 Tool Design, MCP and A2A: Consolidated Lessons

These seven lessons are the site's teaching copy of module T16.1 "Tool design, the agent-computer interface, MCP and A2A". Each concept is taught once, in the house tutorial format, drawing only on three repository sources. The site publishes them at `/learn/agentic-systems/tool-design-mcp-a2a`.

| # | Lesson | Site slug |
|---|---|---|
| 1 | [The Agent-Computer Interface](01_The_Agent_Computer_Interface.md) | `the-agent-computer-interface` |
| 2 | [Tool Schema Design](02_Tool_Schema_Design.md) | `tool-schema-design` |
| 3 | [Typed Tool Results and Teachable Errors](03_Typed_Tool_Results_and_Teachable_Errors.md) | `typed-tool-results-and-teachable-errors` |
| 4 | [The Tool Gateway and Code Sandboxing](04_The_Tool_Gateway_and_Code_Sandboxing.md) | `the-tool-gateway-and-code-sandboxing` |
| 5 | [The Model Context Protocol](05_The_Model_Context_Protocol.md) | `the-model-context-protocol` |
| 6 | [Tool Selection at Scale](06_Tool_Selection_at_Scale.md) | `tool-selection-at-scale` |
| 7 | [Practise Tool Design Interview Questions](07_Practise_Tool_Design_Interview_Questions.md) | `practise-tool-design-interview-questions` |

## Sources

- `01_Concept_Tutorials/Agentic_System_Design_Book/ch05_tool_use_agent_computer_interface.md`, Chapter 5 of *Cracking Agentic AI System Design Interviews* (third-party; its ideas are summarised in our own words, and the lessons that use it carry a credit line).
- `01_Concept_Tutorials/FDE_Handbook/01_LLM_Systems_Foundations/03_What_An_Agent_Actually_Is.md` (own material: the `Tool` contract, registry and error types).
- `01_Concept_Tutorials/RAG_and_Agent_Topic_Guides/agent_fundamentals_and_advanced_agentic_systems_INTERVIEW_TUTORIAL.md` (own material: §1.2, the §2 gotchas on tool errors, structured output and SQL injection, and §7; its externally sourced §4 answers are rewritten in our own words).

The source files stay in the repository unchanged. The site no longer publishes the Chapter 5 lesson separately; its old URL redirects here.

**Known gap.** None of the sources covers the A2A (agent-to-agent) protocol, so these lessons do not teach it. The module page keeps its gap note.

Every claim, number and code idea in these lessons comes from the three sources. Each lesson ends with a Sources line naming the sections it used. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.

The section "Version the Contract Between Components" in Typed Tool Results and Teachable Errors was added in November 2026, written for this site to close a gap found against an outside course outline. It does not come from the sources above.
