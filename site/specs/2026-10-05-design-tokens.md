# Design Tokens

Date: 5 October 2026. Phase 0 tasks DS-01 and DS-02, extended by Phase 1 tasks DS-03, DS-04 and FE-05, of `2026-10-05-production-implementation-plan.md`. Tokens live in `site/src/app/globals.css`: colour values in `:root` (light) and `.dark`, mapped to Tailwind utilities in `@theme inline`.

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

| Status | Colour | Icon | Pill |
|---|---|---|---|
| Not started | `--text-subtle` icon, `--text-muted` label | Hollow circle | `--border-strong` outline on `--surface` |
| In progress | `--accent` | Half circle | `--accent-soft` fill |
| Blocked | `--warning` (icon and label `--warning-text` on `--warning-soft`) | Lock | `--warning-soft` fill |
| Ready for review | `--accent` | Flag | `--accent` outline on `--surface` |
| Completed | `--success` icon, `--text` label | Check | `--success-soft` fill |
| Needs revision | `--review` | Rotate arrow | `--review-soft` fill |
| Mastered | `--mastered` | Star | `--mastered-soft` fill |
| Skipped | `--text-subtle` icon, `--text-muted` label | Skip arrow | Dashed `--border-strong` outline |
| Coming soon (module) | `--text-subtle` icon, `--text-muted` label | Clock | `--border-strong` outline pill |
| On hold (module) | `--warning` (icon and label `--warning-text`) | Pause | `--warning` outline pill |

The component is `StatusBadge` in `site/src/components/ui/StatusBadge.tsx` (DS-03). Icons are inline 16 px SVGs drawn in `currentColor` and marked `aria-hidden`; the text label is always visible. Where the status colour itself is below 4.5:1 for 12 px text (`--text-subtle` everywhere, `--success` on `--success-soft` in light mode at 3.89:1), the icon keeps the status colour (it only needs 3:1) and the label uses `--text-muted` or `--text`. The optional rule tooltip shows on hover and on keyboard focus, hides on Escape, and is linked to the badge with `aria-describedby`, so it is never hover-only.

## Contrast

Computed from the oklch values with the WCAG 2.2 relative-luminance formula. Targets: 4.5:1 for text, 3:1 for large text, icons and UI boundaries.

| Pair | Target | Light | Dark |
|---|---|---|---|
| `--text` on `--bg` | 4.5:1 | 15.99 | 16.04 |
| `--text` on `--surface` | 4.5:1 | 16.45 | 15.03 |
| `--text-muted` on `--bg` | 4.5:1 | 5.83 | 7.71 |
| `--text-muted` on `--surface` | 4.5:1 | 6.00 | 7.22 |
| `--text-subtle` on `--bg` | 4.5:1 | 5.13 | 5.91 |
| `--text-subtle` on `--surface` | 4.5:1 | 5.28 | 5.54 |
| `--text-subtle` on `--surface-2` | 4.5:1 | 4.87 | 5.09 |
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
| `--border-strong` on `--surface` | decorative only | 1.63 | 1.79 |
| `--input-border` on `--surface` | 3:1 | 3.64 | 3.54 |
| `--input-border` on `--bg` | 3:1 | 3.54 | 3.78 |
| `--input-border` on `--surface-2` | 3:1 | 3.36 | 3.25 |
| `--accent-ring` on `--bg` | 3:1 | 5.66 | 7.47 |

`--text-subtle` was raised to AA in Phase 1 (A11Y-01). The axe suite found it on small body text (footers, metadata, kicker labels, breadcrumbs, the search hint), not only icons, at 3.4 to 4.5:1. It moved from `oklch(62% 0.01 260)` to `oklch(53% 0.01 260)` in light mode and from `oklch(58% 0.014 265)` to `oklch(65% 0.014 265)` in dark mode, so it passes 4.5:1 on every surface and still reads lighter than `--text-muted`.

`--review` in light mode moved from `oklch(52% 0.13 220)` to `oklch(50% 0.13 220)`, because badge text on `--review-soft` measured 4.45:1.

**Input borders (closed, FE-05).** `--border-strong` is 1.6 to 1.8:1 against `--surface`. That is fine for decorative dividers, but it failed WCAG 1.4.11 (non-text contrast, 3:1) as the only boundary of a form control. A new token, `--input-border`, carries form-control edges: `oklch(62% 0.01 260)` in light mode and `oklch(54% 0.016 265)` in dark mode, mapped to the `border-input-border` utility. The `Input`, `Textarea` and `Select` primitives in `site/src/components/ui/Field.tsx` use it, and the demo forms now use those primitives. `--border-strong` keeps its value, so live pages do not change.

The ratios above were computed from the oklch values: oklch to OKLab, OKLab to linear sRGB with the OKLab matrices (Björn Ottosson's reference), clamped to the sRGB gamut, then WCAG 2.2 relative luminance `0.2126 R + 0.7152 G + 0.0722 B` and `(L1 + 0.05) / (L2 + 0.05)`.

## Type scale

Phase 1 task DS-04. The scale is Tailwind v4's default `text-*` steps, so the utilities already set size and line height together; no new tokens are needed. Weights are 400 (body), 500 (UI labels) and 600 (headings, badges).

| Step | Size / line height | Utility | Use for |
|---|---|---|---|
| Caption | 12 / 16 px | `text-xs` | Badges, captions, figure labels, eyebrow labels |
| Small | 14 / 20 px | `text-sm` | UI controls, buttons, source notes, credit lines |
| Body | 16 / 24 px | `text-base` | Lesson body text, lists |
| Lead | 18 / 28 px | `text-lg` | Lesson tagline, minor headings (h4) |
| Heading 3 | 20 / 28 px | `text-xl` | Lesson h3 |
| Heading 2 | 24 / 32 px | `text-2xl` | Lesson h2 |
| Heading 1 | 30 / 36 px | `text-3xl` | Lesson title |
| Display | 36 / 40 px | `text-4xl` | Landing and hub titles only |

**Lesson reading column.** `.lesson-reading` in `globals.css` applies the scale to a lesson: 16/24 body, a 68ch maximum measure, h1 30/36, h2 24/32, h3 20/28, h4 18/28, `.lead` 18/28, `small` 14/20 and `figcaption` / `.caption` 12/16. It sits in `@layer components` and styles descendants through `:where()`, so any Tailwind utility on an element still wins. Only pages that opt in change: the `/demo` lesson page uses it today; the live `/modules` pages keep `.prose` and `.reading` unchanged.
