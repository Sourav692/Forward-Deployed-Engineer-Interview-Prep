# Consolidation Playbook

Date: 5 October 2026. Owner decision: every module whose lessons are reading material is rewritten the way T3.4 Memory and state was (PR #31). Each concept is taught once, in a natural order, in the house lesson shape, drawn only from the module's repository sources.

## Scope

- **Rewrite** every module with at least one `kind: 'sync'` lesson whose status is `ready` or `partly`. T3.4 is done.
- **Do not rewrite** `kind: 'live'` lessons: worksheets, scenario packs and standalone designs, the story bank, leadership principles, the hiring-manager round and the final-week reviews stay interactive practice pages. Only clean their display titles (see Naming).
- **Skip** `coming-soon` and `on-hold` modules.
- A Partly ready module keeps its `gapNote`; the rewrite covers only what the sources contain.

## Method

1. Read every source the module's lessons point to, in full, including lessons it lists under `seeAlso` that are homed in the same track.
2. List the concepts across all sources and group them into natural lessons: one idea per lesson, ordered from foundation to production, then an interview-practice lesson when the sources carry interview questions. Typical size: 3 to 7 lessons.
3. Write each lesson with the `tutorial-prose-style` skill: title, one-sentence trade-off tagline, objectives, imperative section headings, one worked example, a warning callout, key takeaways, three "Check yourself" questions, and a closing "Sources" line naming the source files and sections used.
4. Grounding: every claim, number, example and code idea comes from the sources. Nothing from outside knowledge. Where sources disagree, say so in the lesson.
5. Third-party material (credited lessons): summarise the ideas in new words, never copy sentences, lists or cheat sheets, and set `publish: 'credited'` with a credit line on every new lesson that draws on it.
6. Material that belongs to another module: when it is in the same track, place it in that module's rewrite. When it is in another track, leave it out and record it under "Handoffs" in the track's consolidation note; the integrator places it later.

## Naming

- Lesson titles name the concept: "Types of Memory", "Long-Term Memory: Write, Retrieve, Forget". Never "Module 9", "Chapter 7", "Topic 3", "Part 2", "Interview Tutorial", "Beginner Guide" or a source series name.
- Title case with the serial comma, British English, no emoji.
- Lesson slugs: kebab case of the title (`types-of-memory`).
- Files: `01_Concept_Tutorials/Consolidated_Lessons/<Code>_<Module_Title>/NN_<Title_With_Underscores>.md`, plus a short `README.md` listing the sources. Example: `Consolidated_Lessons/T3.4_Memory_and_State/02_Types_of_Memory.md`.
- Live lesson display titles drop series prefixes the same way ("Module 12 — Reliability & Failure Handling" becomes "Reliability and Failure Handling"). Case ids such as "G01" may stay where they identify a scenario.

## Wiring

- New lessons: `kind: 'sync'`, home = the module; add them to `LESSONS` next to the module's existing entries (not at the end of the array) and set the module's `lessons` in order.
- Retired lessons: set `publish: 'excluded'`, remove them from every module's `lessons` and `seeAlso` (replace a `seeAlso` with the new lesson that covers it), and add `'<module>/<old-slug>': '<module>/<new-slug>'` to the track's file in `site/src/lib/consolidation/tN.ts`. Redirects are derived from these entries automatically.
- Source files stay in the repository unchanged.
- Do not regenerate the table in `2026-10-05-canonical-homes.md`; the integrator does it once at the end. Update `site/scripts/baselines.json` with `npm run check:content -- --update-baseline` only when a count change is intended, and say why in the PR.
- Write a short note per track in `site/specs/consolidation/<Track>.md`: old-to-new lesson mapping per module, source conflicts found, and handoffs.
