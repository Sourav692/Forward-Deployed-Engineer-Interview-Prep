# FE-17: `/settings`: path, weekly hours, export, import, reset with ConfirmDialog

| Phase | Size | Depends on | Unblocks | Plan source |
|---|---|---|---|---|
| 2: Practice, Interview and Progress | S | FE-02 (done) | FE-19 | §4, §5, §7, §8, §12 |

## Why
Progress lives only in the learner's browser (§9). Without export and import, a learner who changes browser or clears storage loses everything; without reset there is no clean restart. The store functions exist but no page calls them.

## Context from the plan
- Route (§4): `/settings`, template "Dashboard and lists". Disallowed in `robots.ts` (already done, line 10).
- Rendering (§8): static shell; data read from localStorage in client components behind a skeleton.
- Store (exists, `src/lib/progress/store.ts`): `exportProgress` (line 329), `checkImport` (line 348, SEC-03 guard, 1 MB cap), `importProgress`, `resetProgress` (keeps `fd:v1:theme`), `getPath` / `choosePath` (lines 190-195). `PathChoice { pathId, variant?, weeklyHours, chosenAt }` under `fd:v1:path`.
- Path saving today goes through `src/components/start/path-state.ts` `savePath(path, weeklyHours)`; reuse it.
- Microcopy (§5): import error says what happened and what to do, for example "That file isn't a Forward Deployed export. Choose a .json file exported from Settings." Success shows a toast.
- Components (§7): SettingsView (success, invalid file), ConfirmDialog (exists, `src/components/ui/ConfirmDialog.tsx`), Toast (exists).
- Exit criterion (§14): export → reset → import restores state exactly.

## Scope
In:
- `/settings` page with: current path (link to `/start` to change it), weekly hours (number input saved to `fd:v1:path`), export (downloads `.json`), import (file input, validated, ConfirmDialog before overwrite), reset (ConfirmDialog).
- Port the layout from `src/demo/components/SettingsView.tsx`, typed on production store calls.
- A "Settings" link in the utility area of the shell (wherever Glossary and Library live).
Out:
- Analytics consent toggle (Phase 3, SEO-02).
- Choosing a path from Settings (the diagnostic on `/start` owns that).

## Files likely touched
- `site/src/app/(site)/settings/page.tsx` (new)
- `site/src/components/progress/SettingsView.tsx` (new, ported)
- `site/src/components/shell/*` (exists; add the link)
- `site/e2e/flows.spec.ts` (exists: replace the manual export/import round trip at lines 83-114 with the UI flow)
- `site/e2e/a11y.spec.ts` (exists: add `/settings`)

## Implementation notes
1. The page is a Server Component with metadata; the view is a client island using `useProgress` hooks.
2. Export: `Blob` + object URL, file name `forward-deployed-progress-YYYY-MM-DD.json`.
3. Import: read with `File.text()`, run `checkImport`, show its first problem inline next to the input (not only a toast), then ConfirmDialog, then `importProgress`.
4. Reset: ConfirmDialog with a destructive button label "Reset progress"; focus returns to the trigger.

## Acceptance criteria
- [ ] Export → reset → import restores every `fd:v1:*` key exactly (except theme, which reset keeps).
- [ ] An invalid file (bad JSON, unknown key, over 1 MB) shows a message naming the problem and changes nothing.
- [ ] Weekly hours saved and reflected by `/start/paths/[pathId]` and the dashboard finish-by date.
- [ ] Storage blocked: page renders, controls that need storage are disabled, and the blocked notice shows.
- [ ] Keyboard reachable, visible focus, labelled controls, dialogs trap focus and close on Escape, contrast AA, 320 px and 200 % zoom.
- [ ] Zero serious or critical axe violations on `/settings` in both themes.

## Test plan
- E2E: export, reset, import round trip through the UI; bad-file guard UI.
- A11y: `/settings` added to `e2e/a11y.spec.ts`.
- `npm run check:store` still passes.

## Definition of done
- [ ] Acceptance criteria all checked
- [ ] Tests added or updated, CI green
- [ ] Lint and typecheck pass
- [ ] Reviewed in a preview deployment (UI tasks)
- [ ] Plan or docs updated if a decision changed

## Open questions
- None.
