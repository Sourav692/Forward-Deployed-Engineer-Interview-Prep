# Design Tokens

Date: 5 October 2026. Phase 0 tasks DS-01 and DS-02 of `2026-10-05-production-implementation-plan.md`. Tokens live in `site/src/app/globals.css`: colour values in `:root` (light) and `.dark`, mapped to Tailwind utilities in `@theme inline`.

## Radius

The scale pins Tailwind v4's own defaults, so the `rounded-*` utilities already used across the site (about 160 uses) and plain CSS share one scale. The plan first proposed md 8 px and lg 12 px; that would have redefined `rounded-md` and `rounded-lg` and changed every live page, so the plan now follows this table.

| Token | Value | Utility | Use for |
|---|---|---|---|
| `--radius-sm` | 4 px | `rounded-sm`, `rounded` | Badges, inputs, focus outlines |
| `--radius-md` | 6 px | `rounded-md` | Buttons |
| `--radius-lg` | 8 px | `rounded-lg` | Cards, callouts, tables |
| `--radius-xl` | 12 px | `rounded-xl` | Dialogs, large panels |
| full | 9999 px | `rounded-full` | Pills, rings |

Hard-coded radii in `globals.css` now use these tokens. Two values moved slightly: the focus outline (3 px to 4 px) and the story card (10 px to 8 px). The inline placeholder highlight keeps `0.3em` because it scales with the text.

## Status colours

The status hues are part of the core palette (they were first added for the `/demo` prototype). Each status pairs one colour with one icon and a text label, so no status relies on colour alone.

| Status | Colour | Icon |
|---|---|---|
| Not started | `--text-subtle` | Hollow circle |
| In progress | `--accent` | Half circle |
| Blocked | `--warning` (text `--warning-text` on `--warning-soft`) | Lock |
| Ready for review | `--accent` | Flag |
| Completed | `--success` | Check |
| Needs revision | `--review` | Rotate arrow |
| Mastered | `--mastered` | Star |
| Skipped | `--text-subtle` | Skip arrow |
| Coming soon (module) | `--text-subtle` outline pill | None |
| On hold (module) | `--warning` outline pill | None |

## Contrast

Computed from the oklch values with the WCAG 2.2 relative-luminance formula. Targets: 4.5:1 for text, 3:1 for large text, icons and UI boundaries.

| Pair | Target | Light | Dark |
|---|---|---|---|
| `--text` on `--bg` | 4.5:1 | 15.99 | 16.04 |
| `--text` on `--surface` | 4.5:1 | 16.45 | 15.03 |
| `--text-muted` on `--bg` | 4.5:1 | 5.83 | 7.71 |
| `--text-muted` on `--surface` | 4.5:1 | 6.00 | 7.22 |
| `--text-subtle` on `--bg` | 3:1 | 3.54 | 4.46 |
| `--text-subtle` on `--surface` | 3:1 | 3.64 | 4.18 |
| `--accent` on `--bg` | 4.5:1 | 5.66 | 7.47 |
| `--accent` on `--surface` | 4.5:1 | 5.82 | 7.00 |
| `--accent` on `--accent-soft` | 3:1 | 5.09 | 5.74 |
| `--success` on `--success-soft` | 3:1 | 3.89 | 6.33 |
| `--success` on `--surface` | 3:1 | 4.37 | 7.66 |
| `--warning-text` on `--warning-soft` | 4.5:1 | 5.97 | 7.74 |
| `--warning` on `--surface` | 3:1 | 3.46 | 8.16 |
| `--danger` on `--danger-soft` | 4.5:1 | 4.69 | 5.21 |
| `--danger` on `--surface` | 4.5:1 | 5.35 | 6.25 |
| `--review` on `--review-soft` | 4.5:1 | 4.83 | 6.45 |
| `--review` on `--surface` | 3:1 | 5.46 | 8.02 |
| `--mastered` on `--mastered-soft` | 4.5:1 | 5.16 | 7.02 |
| `--mastered` on `--surface` | 3:1 | 5.89 | 8.80 |
| `--border-strong` on `--surface` | 3:1 | 1.63 | 1.79 | **below**
| `--accent-ring` on `--bg` | 3:1 | 5.66 | 7.47 |

`--review` in light mode moved from `oklch(52% 0.13 220)` to `oklch(50% 0.13 220)`, because badge text on `--review-soft` measured 4.45:1.

**Open follow-up (A11Y-02, FE-05):** `--border-strong` is 1.6 to 1.8:1 against `--surface`. That is fine for decorative dividers, but the demo's form inputs use it as their only boundary, which fails WCAG 1.4.11 (non-text contrast, 3:1). Fix it when the input primitive moves out of `src/demo/`: either a darker input-border token or a filled input background.
