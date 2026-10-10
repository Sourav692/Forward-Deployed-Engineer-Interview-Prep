# FE-18: Interview hubs `/interview/hubs/[hubSlug]` indexing existing question sources by link, not copy

| Phase | Size | Depends on | Unblocks | Plan source |
|---|---|---|---|---|
| 2: Practice, Interview and Progress | M | DATA-07 | FE-19 | §4, §7, §8 |

## Why
A learner preparing for a loop wants practice grouped by what the interviewer tests, not by where the file lives. The hubs turn `/interview`'s Coming soon list into five entry points onto material that already exists.

## Context from the plan
- Route decision (10 Oct 2026, §4): `/interview/hubs/[hubSlug]`. Rejected: `/interview/[hubSlug]`, because `/interview/[moduleSlug]` (with `dynamicParams = false`) already serves the interview-practice modules and Next.js cannot have two dynamic segments at one level.
- Template (§4): Hub. Static generation with `generateStaticParams` and `dynamicParams = false` (§8).
- Data: `INTERVIEW_HUBS` from DATA-07.
- SEO (§11): `generateMetadata` with title and description from the hub; canonical URL; breadcrumbs Interview › Hubs › Hub.
- Demo reference: `site/src/app/demo/interview/[hubId]/page.tsx` (layout only; its questions are sample content and must not be copied).

## Scope
In:
- `/interview/hubs/[hubSlug]` page: header (title, summary), source list grouped by kind, related modules as ModuleCards with status.
- `/interview` page: replace the Coming soon hub list with links to the five hubs; remove the "arrive with FE-18" comment.
- Add the hub URLs to `sitemap.ts` and to the search index if hubs are searchable.
Out:
- An `/interview/hubs` index page (the `/interview` page is the index; add a redirect from `/interview/hubs` to `/interview`).
- Question-level confidence tracking (not in Phase 2 scope).

## Files likely touched
- `site/src/app/(site)/interview/hubs/[hubSlug]/page.tsx` (new)
- `site/src/app/(site)/interview/page.tsx` (exists)
- `site/src/app/sitemap.ts` (exists)
- `site/next.config.ts` (exists; `/interview/hubs` redirect)
- `site/e2e/a11y.spec.ts` (exists)

## Acceptance criteria
- [ ] Five hub pages build as static routes; an unknown hub slug returns 404.
- [ ] Every source link on a hub resolves (`npm run check:routes` crawls them from the sitemap).
- [ ] No hub page contains copied lesson or question text.
- [ ] `/interview` links to all five hubs; no Coming soon hub list remains.
- [ ] Keyboard reachable, visible focus, one H1, contrast AA, 320 px and 200 % zoom.
- [ ] Zero serious or critical axe violations on one hub page in both themes.

## Test plan
- `npm run build` route list; `npm run check:routes`.
- A11y: one hub added to `e2e/a11y.spec.ts`.

## Definition of done
- [ ] Acceptance criteria all checked
- [ ] Tests added or updated, CI green
- [ ] Lint and typecheck pass
- [ ] Reviewed in a preview deployment (UI tasks)
- [ ] Plan or docs updated if a decision changed

## Open questions
- None beyond DATA-07's source confirmation.
