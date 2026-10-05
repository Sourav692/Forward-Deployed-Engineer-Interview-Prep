# OPS-03: Confirm Vercel project link: `site/.vercel/project.json` points at `forward-deployed`; fix or delete the stale link

| Phase | Size | Depends on | Unblocks | Plan source |
|---|---|---|---|---|
| 0: Decisions and foundations | S | - | - | §13 Testing, deployment and operations |

Status: in progress.

## Why
A local Vercel link to a deleted project would send `vercel` CLI deploys or env pulls to the wrong place. The plan flags it as risk Q10 and assumption A6.

## Context from the plan
- A6 (§1): the Vercel project that deploys `main` is `forward-deployed`, even though `site/.vercel/project.json` names `site`.
- Q10 (§15): the link names project `site`, which CLAUDE.md says was deleted. Mitigation: OPS-03.
- Release and rollback (§13): merge to `main` deploys; rollback with Vercel "Promote previous deployment".

## Scope
In:
- Check the link in the owner's checkout and any other clone in use.
- Re-link with `vercel link` (project `forward-deployed`) where stale.
- Record the result: A6 confirmed, Q10 closed.
Out:
- Vercel project settings, domains, env vars.
- The rollback note in CLAUDE.md (§13 acceptance, no task owns it yet).

## Files likely touched
- `site/.vercel/project.json` (exists locally only; gitignored by `site/.gitignore` line 37, so nothing to commit)
- `CLAUDE.md` (exists; optional note that `.vercel/` is per clone)

## Implementation notes
1. Review finding: the owner's main checkout already has `"projectName": "forward-deployed"`. The plan's evidence was stale.
2. Because `.vercel/` is gitignored, worktrees and fresh clones have no link at all; run `vercel link` there before using the CLI.
3. Confirm with `vercel project ls` or the dashboard that `forward-deployed` is the project serving https://forward-deployed-sigma.vercel.app/.

## Acceptance criteria
- [ ] `site/.vercel/project.json` in the owner's checkout names `forward-deployed`.
- [ ] No committed file references the deleted `site` project.
- [ ] A6 and Q10 marked resolved (in the task PR description or a §15 follow-up).

## Test plan
Manual: `cat site/.vercel/project.json`; `vercel project ls`.

## Definition of done
- [ ] Acceptance criteria all checked
- [ ] Tests added or updated, CI green
- [ ] Lint and typecheck pass
- [ ] Plan or docs updated if a decision changed

## Open questions
- None.
