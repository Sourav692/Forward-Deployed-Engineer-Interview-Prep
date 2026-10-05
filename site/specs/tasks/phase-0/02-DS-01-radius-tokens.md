# DS-01: Radius tokens added to `@theme`; hard-coded radii replaced across `src/components/` and `src/demo/components/`

| Phase | Size | Depends on | Unblocks | Plan source |
|---|---|---|---|---|
| 0: Decisions and foundations | S | - | FE-03, FE-05 | §6 Visual design system |

Status: in progress.

## Why
Five hard-coded radii cause visual drift between live pages and the demo components that production will reuse (§2, §6). FE-03 and FE-05 move those components and need one radius scale first.

## Context from the plan
- Decision: add radius tokens (§6). Rejected: leave ad hoc.
- Values (§6): `--radius-sm` 4 px (badges, inputs), `--radius-md` 8 px (buttons, cards), `--radius-lg` 12 px (dialogs, panels), full for pills.
- Tokens live as CSS variables in `site/src/app/globals.css`, mapped through `@theme inline` so utilities such as `rounded-md` use them (§6).
- Section acceptance: no raw hex, rgb or px radius values in new components (grep check).

## Scope
In:
- Radius tokens in `globals.css` and their `@theme` mapping.
- Replace hard-coded `border-radius` values in `globals.css` with the tokens.
- Align `rounded-*` utilities in `src/components/` and `src/demo/components/` with the scale.
Out:
- Spacing tokens, type scale (DS-04), status colours (DS-02).

## Files likely touched
- `site/src/app/globals.css` (exists; hard-coded radii at lines 120, 161, 211, 221, 234, 251, 269, 285, 330, 364)
- `site/src/components/*.tsx`, `site/src/demo/components/*.tsx` (exist; use `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded`)

## Implementation notes
1. Components already use Tailwind utilities, not px values. Overriding `--radius-md` changes Tailwind's default `rounded-md` (6 px) to 8 px on every page, including live `/modules` pages.
2. `rounded-xl` (53 uses) has no token in the §6 scale. Pick a mapping (for example `xl` = `--radius-lg`) and record it in the PR.
3. Check live templates in both themes on the preview (risk Q9).

## Acceptance criteria
- [ ] `--radius-sm`, `--radius-md`, `--radius-lg` defined and mapped in `@theme`.
- [ ] `grep -rn "border-radius: [0-9]" site/src` finds no px literals outside the token definitions.
- [ ] Live `/modules`, `/fde-last-day-prep`, `/glossary` pages reviewed at 375 and 1280 px in light and dark; any visible change noted in the PR.
- [ ] Lint, typecheck and build pass.

## Test plan
Grep check; manual visual comparison on the Vercel preview against production.

## Definition of done
- [ ] Acceptance criteria all checked
- [ ] Tests added or updated, CI green
- [ ] Lint and typecheck pass
- [ ] Reviewed in a preview deployment (UI tasks)
- [ ] Plan or docs updated if a decision changed

## Open questions
- Is the move from 6 px to 8 px on existing `rounded-md` elements acceptable on live pages? (PLAN_REVIEW should-fix item.)
- How does `rounded-xl` map onto the three-step scale?
