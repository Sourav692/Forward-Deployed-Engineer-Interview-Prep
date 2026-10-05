# DS-02: Demo status tokens moved to the core block with comments removed; contrast of every token pair verified in both themes and recorded in the spec

| Phase | Size | Depends on | Unblocks | Plan source |
|---|---|---|---|---|
| 0: Decisions and foundations | S | - | DS-03 | §6 Visual design system |

Status: in progress.

## Why
Production status badges (DS-03) need the danger, review and mastered colours that today are marked as demo-only. Without verified contrast, statuses risk failing AA (R23, R24).

## Context from the plan
- Decision: promote demo tokens (`--danger`, `--review`, `--mastered`, `--warning-soft`, `--warning-text` and soft variants) to the core set (§6). Rejected: keep them demo-only.
- Decision: keep oklch tokens and the `.dark` class switch (§6).
- Colour roles and targets (§6): text on surface ≥ 4.5:1; badges and focus rings ≥ 3:1 against neighbours. Light and dark values for every role.
- Status mapping (§6): Not started `--text-subtle`; In progress `--accent`; Blocked `--warning`; Ready for review `--accent`; Completed `--success`; Needs revision `--review`; Mastered `--mastered`; Skipped `--text-subtle`.

## Scope
In:
- Remove the "Added for the /demo prototype" comment and treat the tokens as core in `:root` and `.dark`.
- Compute contrast for each foreground and background pair in both themes and record the table.
Out:
- The `StatusBadge` component (DS-03).
- Changing hue values, unless a pair fails the target.

## Files likely touched
- `site/src/app/globals.css` (exists; demo comment at line 26, tokens lines 26 to 34 and 57 to 62, `@theme inline` from line 67)
- `site/specs/<design-tokens spec>.md` (guess; see open question)

## Implementation notes
1. List every pair used: each status colour on `--bg`, `--surface`, its own `-soft`; `--warning-text` on `--warning-soft`; `--accent-ring` on `--surface`.
2. Convert oklch to sRGB and compute WCAG contrast with a small script; paste results as a table.
3. If a pair fails, adjust lightness only and note the change.

## Acceptance criteria
- [ ] No demo-only comment remains; all status tokens sit in the core `:root` and `.dark` blocks.
- [ ] Contrast table covers every pair in light and dark and every pair meets its target.
- [ ] Each status remains distinguishable without colour (icon and label come in DS-03).
- [ ] Build passes; live pages look unchanged unless a token was adjusted.

## Test plan
Script output for contrast; manual preview check of pages using warning and success colours in both themes.

## Definition of done
- [ ] Acceptance criteria all checked
- [ ] Tests added or updated, CI green
- [ ] Lint and typecheck pass
- [ ] Reviewed in a preview deployment (UI tasks)
- [ ] Plan or docs updated if a decision changed

## Open questions
- Which spec records the contrast table? The plan says "the spec" without a path. Suggest a new `site/specs/` design-tokens file that DS-04 also extends.
