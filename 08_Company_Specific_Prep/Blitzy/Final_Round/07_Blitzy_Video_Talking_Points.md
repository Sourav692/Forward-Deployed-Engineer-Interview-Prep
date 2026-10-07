# Blitzy Video: Talking Points

Source: [Blitzy: Autonomous Software Development](https://www.youtube.com/watch?v=58xA1LR7Zos), official Blitzy channel, 25:48. The video names Claude 3.7 and o3-mini, which dates it to roughly early 2025. Treat every number below as Blitzy's own claim at that time, not a current or independently verified fact.

## 1. The core idea: infinite code context

- AI coding tools fit roughly 20,000 to 100,000 lines of code. They summarise the rest of the codebase and then make mistakes.
- Blitzy ingests repositories of 20 to 100 million lines and builds a graph of every relationship in the code. That graph is long-term memory that every agent can search and share.
- It is not a giant context window. It works on the principle of relevance: each agent gets only the context it needs, just in time, the way a developer works on a few files at a time.
- More context is not better. Relevant context plus noise gives poor results, so precision at the line level is the goal.
- Bigger context windows will not solve this on their own. The video cites a leaderboard where Claude's recall drops to about 32% beyond 100,000 tokens.

## 2. How it breaks

Useful when a customer asks about limits.

- A single file of around 100,000 lines. An IDE would struggle with it too.
- A completely flat repository with everything in the root folder.
- As a fallback, Blitzy retries a file with progressively larger models, up to about 2 million tokens, before giving up.

## 3. The workflow

1. **Onboard.** A 20-million-line repository took about 48 hours to ingest and another day to produce documentation.
2. **Technical specification.** Around 300 pages with a high-level summary, then a document per folder. Humans review it and add context the code cannot show, such as a React migration that was attempted and failed.
3. **Build.** Humans edit the specification and start a build. An architect agent plans the work and recruits specialist agents. Each agent gets only its slice: the database agent sees the schema, not the UI.
4. **Coordinate.** Agents communicate in real time, wait on each other's work and check back, like a human team compressed into minutes or hours.
5. **Validate.** Different models check the output at every step. Because results are not shown live, there is time to validate repeatedly.
6. **Hand off.** Blitzy lists what is left for the human team, such as dependencies it was never given access to.

## 4. Claims and admissions

- Blitzy aims to deliver 80% or more of a project.
- Expect about half a day of compile fixes and a few days of runtime fixes, so roughly one week to get a build running.
- Builds from 30,000 lines to 1 million lines all ran within seven days.
- Example: a 20-year-old MATLAB codebase refactored to Python, about 150,000 lines, with 248 tests passing and the GUI working within a week. The alternative estimate was six months.
- They say openly that it is not perfect.

## 5. Positioning

- Blitzy is built around the human development process. Engineers work with documents, not prompts, and senior engineers review the specifications.
- It augments developers rather than replacing them. Blitzy batch-builds overnight; Copilot or Cursor finishes the last stretch.
- Copilot-style tools help junior developers but struggle on large codebases, where senior engineers spend their time. Blitzy targets that gap.
- If a codebase has no unit tests, have Blitzy write them first, then build and refactor against them.

## How to use these in the final round

- **Technical aptitude.** Blitzy's "relevance over volume" is the same lesson as the single-agent to multi-agent pivot: narrow context per agent reduced hallucination. Make that link explicitly.
- **Legacy monolith question.** Onboarding, specification review and characterization tests match Blitzy's real workflow. Mention the step where humans add context the code cannot show.
- **Trust in AI-generated code.** Blitzy admits to about a week of compile and runtime fixes. Being equally honest about the last 20% builds credibility.
- **A question to ask the panel.** "How do FDEs handle the human-gap list and the context that never made it into the code, such as failed migrations or missing dependencies?"
