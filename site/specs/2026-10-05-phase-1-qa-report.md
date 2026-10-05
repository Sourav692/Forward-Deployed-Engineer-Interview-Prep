# Phase 1 QA report

Tasks: QA-02, A11Y-01, PERF-01, OPS-02, QA-03, QA-04, A11Y-02, QA-05 · Plan: [`2026-10-05-production-implementation-plan.md`](2026-10-05-production-implementation-plan.md) §8, §11, §13, §14 · Date: 5 October 2026

All checks below ran against a local production build (`npm run build`, then `npx next start -p 3307`) in headless Chromium. They have not yet run against the Vercel preview. The owner should repeat the Lighthouse runs there before merging (see "Still open").

## What now runs on every PR

| Check | Command | What it proves |
|---|---|---|
| Bundle budgets | `npm run check:bundle` | Lesson and module routes stay at or under 90 KB of gzipped first-load JS beyond the framework baseline |
| Route audit | `npm run check:routes` | Every sitemap URL and every internal link on those pages returns 2xx or 3xx. Every `ready` or `partly` module has at least one published or live lesson |
| Count baseline | `npm run check:content` | Module pages, editorial pages, internal links, diagrams, synced lessons and live lessons never drop below `scripts/baselines.json` |
| Smoke flows | `npm run test:e2e` (`e2e/flows.spec.ts`) | Path pick, learn, soft gating, storage round trip, live worksheet regression, search and theme flows, at 375 px and 1280 px |
| Accessibility | `npm run test:e2e` (`e2e/a11y.spec.ts`) | Zero serious or critical axe violations (WCAG 2.2 AA tags) on 17 templates, in light and dark, at both widths |
| Audit checks | `npm run test:e2e` (`e2e/audit.spec.ts`) | Reflow at 640 px and 320 px, a visible focus ring, and reduced motion honoured |

The new `e2e` CI job builds the site, runs `check:bundle`, starts `next start`, then runs `check:routes` and the Playwright suite. If the suite fails, the job uploads the Playwright traces.

## Accessibility (A11Y-01, A11Y-02)

### axe findings and fixes

The first axe run found the following serious violations. All are fixed. The suite now passes with zero serious or critical violations in both themes.

| Finding | Where | Fix |
|---|---|---|
| `color-contrast`: `--text-subtle` at 3.4 to 4.5:1 on small text | Every page: footer, search hint, `⌘K` key, breadcrumbs, metadata, kicker labels | Token change. Light mode moved from `oklch(62% …)` to `oklch(53% …)` and dark mode from `oklch(58% …)` to `oklch(65% …)`, so the token now passes 4.5:1 on every surface. Recorded in `2026-10-05-design-tokens.md` |
| `color-contrast`: white text on the dark-mode accent (2.56:1) | Worksheet "Show the model answer" button, the module page's "Start" and "Continue" link, the case-study mark-read button, the scenario section number | Added `dark:text-bg`, the same pattern the `Button` primitive already uses (7.47:1) |
| `target-size` (WCAG 2.5.8) | Case-study "On this page" links; credits page links stacked on phones | Links now have vertical padding, giving each a target of 24 px or more |
| `scrollable-region-focusable` | Wide tables and code blocks in lessons and worksheets; Mermaid diagrams | Scroll boxes are now focusable (`tabindex="0"`). Tables are labelled regions and diagrams are labelled figures, so keyboard users can scroll them |
| `link-in-text-block` | Case-study "Sources" and "Reading order" links | Links are underlined |

### Manual-style audit (Playwright)

| Check | Result |
|---|---|
| Keyboard-only primary flow: `/` → Start → 10-question diagnostic → choose path → module | Pass. The whole diagnostic runs on Tab, Space and Enter, and focus moves to each new question (`flows.spec.ts`, path flow) |
| Skip link is the first Tab stop and is visible on focus | Pass |
| Visible focus ring on primary actions | Pass. "Mark read" shows the global `:focus-visible` outline |
| Reflow at 200 % zoom (1280 → 640 CSS px) | Pass. No horizontal page scroll on `/`, `/start`, `/learn`, the track, module, lesson, worksheet and case-study pages |
| Reflow at 400 % zoom (320 CSS px) | Pass on the same eight templates |
| Reduced motion | Pass. With `prefers-reduced-motion: reduce`, transitions are 0.01 ms and scrolling is not smooth |
| Both themes | Covered by the axe suite (all 17 templates in light and dark) |
| Screen reader (VoiceOver on Safari, NVDA on Firefox) | Not run. This needs a person; it is left for the owner's preview review |

## Performance (PERF-01, OPS-02, QA-05)

### Bundle budgets

Next 16 no longer prints first-load JS per route. `scripts/check-bundle.mjs` therefore reads each prerendered page's `<script src>` list and gzips every chunk. The framework baseline (`rootMainFiles`) is 126.8 KB gzipped. For each route pattern, the table shows the JS beyond that baseline for the heaviest page.

| Route | Route JS (gzip) | Budget |
|---|---|---|
| `/learn/[trackSlug]/[moduleSlug]` | 57.4 KB | 90 KB ✓ |
| `/learn/[trackSlug]/[moduleSlug]/[lessonSlug]` | 52.8 KB | 90 KB ✓ |
| `/learn`, `/learn/[trackSlug]` | 56.4 KB, 56.1 KB | reported |
| `/start`, `/start/paths/[pathId]` | 57.0 KB, 55.4 KB | reported |
| `/design`, `/practice`, `/interview` | 55.5 KB | reported |
| `/modules/[module]/[track]/[scenario]` | 34.8 KB | reported |
| `/`, `/library`, `/glossary`, `/fde-last-day-prep` and other server-only pages | 24.8 to 28.5 KB | reported |

No `/progress` or `/settings` routes exist yet. Their 140 KB budget is already in the script and will apply once Phase 2 adds them. Mermaid and the search index load on demand, so they do not count as first-load JS.

### Lighthouse (local `next start`, mobile preset, simulated throttling)

Lighthouse 13.5 ran on 5 October 2026 through `npx lighthouse`.

| Page | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| `/` | 90 | 100 | 100 | 91 | 3.4 s | 80 ms | 0 |
| `/learn` | 96 | 100 | 100 | 92 | 2.8 s | 0 ms | 0 |
| Lesson `/learn/orientation/the-fde-role/the-three-roles` | 90 | 100 | 100 | 92 | 3.6 s | 40 ms | 0 |

- Performance is 90 or above on every page, which meets the §11 target of 90 or more on a lesson page. The dashboard does not exist until Phase 2.
- Simulated LCP is above the 2.5 s field target on all three pages. Most of the time is render delay behind the single render-blocking CSS file and the Inter font swap. Field LCP on Vercel's CDN should be lower, but measure it on the preview before calling the target met.
- SEO loses its points on one heuristic, `link-text`: the primary-nav label "Start" counts as non-descriptive. The label comes from `NAV` in `editorial.ts` and is an owner decision (plan §4), so it was not changed here. Renaming it to "Get started" would clear the warning.

## Route audit and count baseline (QA-03, QA-04)

- `check:routes` checks 321 sitemap URLs plus every internal link on them. All return 2xx and there are no redirect chains. All 47 `ready` or `partly` modules have at least one published or live lesson.
- The audit found a gap: the nine `/start/paths/[pathId]` pages were missing from `sitemap.xml`. They are public, static and indexable, so `sitemap.ts` now lists them.
- `scripts/baselines.json` records 85 module pages, 85 editorial pages, 794 internal links, 273 diagrams, 108 synced lessons and 96 live lessons. When a count drops on purpose, run `npm run check:content -- --update-baseline` and commit the updated file.

## Still open

- **Storage export and import UI.** Phase 1 has no Settings page (FE-17 is in Phase 2). The smoke test round-trips the `exportProgress` JSON shape through `localStorage`. The test for the import guard rejecting a bad file waits for the Phase 2 UI.
- **Screen-reader passes.** VoiceOver and NVDA checks need a person.
- **Lighthouse on the Vercel preview.** The plan targets the preview. The scores above are from a local build.
