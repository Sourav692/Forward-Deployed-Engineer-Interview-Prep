# Source, explanation, and interface checks

Three different checks are required. None substitutes for the others.

## Source coverage

Capture all source chapters, including content hidden behind old tabs or parts, diagrams, tables, code, glossary definitions, examples, measurements, qualifications, and questions. Preserve both source diagram variants when provided. Inspect which DOM regions contain reading content; exclude navigation and old read toggles deliberately. If the page has no reliable article boundary, require an explicit content selector or inspect the source locally rather than guessing from every page heading.

Run the bundled validator against `case.json` and the built bundle. It checks the five sections, coverage destinations, IDs, fragments, local assets, original diagram hashes, practice elements, and source text when faithful preservation is requested. In teach mode, it requires reviewed coverage with evidence, but that is a record of an editorial decision, not machine proof of fidelity.

Check written explanations against every source teaching item. Correct an unsupported addition or a missing caveat before marking the case complete. Retain precise numbers and limitations. Figure and table counts alone cannot establish equivalence.

## Case brief clarity

Read the opening for the actual case and intended audience. Check whether it supplies enough context to follow the task without adding unnecessary sections. Apply these questions where relevant:

- Is the user, problem or decision clear?
- Are unfamiliar terms explained before the reader needs them?
- Would a concrete example clarify the case, or does the scenario already do that work?
- Are applicable human review or action boundaries clear?
- Is the task and any necessary scope understandable?

Omitting an unhelpful introductory subsection is allowed and is not a validation failure. Do not require an example, glossary, approval role or learning-goal section solely to satisfy a checklist. If content is combined or moved, confirm that essential meaning and source coverage remain. Label any added hypothetical example as illustrative. Record material opening decisions in the editorial-review evidence; avoid reader-facing explanations of why an optional subsection was omitted.

## Browser and visual checks

Run `scripts/check_browser.cjs` against the built `index.html`, setting `PUPPETEER_MODULE` to an installed puppeteer-core module and `CHROME_PATH` when needed. It checks all five sections at 320, 390, 834, 1280, 1440, and 1920 pixels, expanded disclosures, image decoding, fragment targets, progress, notes, rubric, print, no-script reading, and unavailable storage. The supplied assets run locally without external fonts or scripts.

Inspect desktop and mobile screenshots. Inspect every diagram at a readable scale, and test any custom case interaction separately. Do not claim dark-mode or screen-reader testing if it did not run. A print check must preserve the complete Quick review rather than clipping a long table or code block.

If Hallmark is available, sweep the built bundle with app scope and rendered checks. Keep the approved reading frame. A faithfully retained source passage may use the skill's documented verbatim-copy handling; do not rewrite requested verbatim content to satisfy a copy linter. Diagnose real layout or accessibility findings and fix them in maintained assets.

## Skill transfer

The Enterprise reference is a template regression. A separate non-RAG pilot tests whether the instructions transfer to another subject. For a substantial package change, use an independent agent when authorised by this skill's delivery gate. Give it only the skill and raw source, use an isolated output directory, and inspect its decisions and prose. A scoped pilot is not a completed catalog case. Record actual findings and fixes in the package's validation report.
