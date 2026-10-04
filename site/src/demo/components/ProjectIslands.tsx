'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Difficulty, ProjectStatus, ProjectState, ProjectType } from '../types'
import * as repo from '../repo'
import { update, useDemo } from '../store/useDemo'
import { Select } from './CurriculumOverview'
import { toast } from './feedback'
import { EmptyState, ErrorState, StatusBadge, Tag, btn, cx } from './ui'

const STATUSES: ProjectStatus[] = ['not-started', 'in-progress', 'ready-for-review', 'completed']
const STATUS_LABEL: Record<ProjectStatus, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  'ready-for-review': 'Ready for review',
  completed: 'Completed',
}
const TYPES: ProjectType[] = ['implementation', 'debugging', 'architecture', 'customer-simulation', 'productionisation', 'timed', 'capstone']
const label = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')
const empty = (): ProjectState => ({ status: 'not-started', repoUrl: '', portfolioUrl: '', checklist: {}, updatedAt: new Date().toISOString() })

export function ProjectCatalog() {
  const { state } = useDemo()
  const [type, setType] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [skill, setSkill] = useState('')
  const [status, setStatus] = useState('')
  const projects = repo
    .listProjects({ type: (type || undefined) as ProjectType | undefined, difficulty: (difficulty || undefined) as Difficulty | undefined, skillId: skill || undefined })
    .filter((p) => !status || (state?.projects[p.id]?.status ?? 'not-started') === status)
  const clear = () => (setType(''), setDifficulty(''), setSkill(''), setStatus(''))

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4" role="group" aria-label="Filter projects">
        <Select id="p-type" label="Type" value={type} onChange={setType} options={[['', 'All types'], ...TYPES.map((t): [string, string] => [t, label(t)])]} />
        <Select id="p-diff" label="Difficulty" value={difficulty} onChange={setDifficulty} options={[['', 'Any'], ['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']]} />
        <Select id="p-skill" label="Skill" value={skill} onChange={setSkill} options={[['', 'Any skill'], ...repo.listSkills().map((s): [string, string] => [s.id, s.title])]} />
        <Select id="p-status" label="Status" value={status} onChange={setStatus} options={[['', 'Any status'], ...STATUSES.map((s): [string, string] => [s, STATUS_LABEL[s]])]} />
      </div>
      <p className="mb-3 text-[0.8125rem] text-subtle" aria-live="polite">
        Showing {projects.length} of 10 projects
      </p>
      {projects.length === 0 ? (
        <EmptyState title="No projects match" body="Loosen a filter, or clear them all to see P1–P10." action={<button type="button" onClick={clear} className="text-[0.875rem] font-semibold text-accent underline">Clear filters</button>} />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {projects.map((p) => {
            const s = state?.projects[p.id]?.status ?? 'not-started'
            return (
              <li key={p.id}>
                <Link href={repo.href.project(p.id)} className="flex h-full flex-col rounded-xl border border-border bg-surface p-4 hover:border-accent">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[0.8125rem] font-semibold text-subtle">{p.code}</span>
                    <span className="font-semibold">{p.title}</span>
                    <span className="ml-auto">{state && <StatusBadge status={s} size="xs" />}</span>
                  </div>
                  <p className="mt-1 flex-1 text-[0.875rem] text-muted">{p.businessProblem}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Tag tone="accent">{p.typeLabel}</Tag>
                    <Tag>{label(p.difficulty)}</Tag>
                    <Tag>~{p.estHours} h</Tag>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/** Status control, repository and portfolio placeholders, deliverables checklist, rubric. */
export function ProjectTracker({ projectId }: { projectId: string }) {
  const { state } = useDemo()
  const p = repo.getProject(projectId)!
  const ps = state?.projects[projectId] ?? empty()
  const [repoUrl, setRepoUrl] = useState<string | null>(null)
  const [portfolioUrl, setPortfolioUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  if (!state)
    return (
      <div className="rounded-xl border border-dashed border-border-strong p-4 text-[0.875rem]">
        <Link href={`/demo/sign-in?next=${encodeURIComponent(repo.href.project(projectId))}`} className="font-semibold text-accent underline">
          Sign in
        </Link>{' '}
        to track status, add a repository and tick deliverables.
      </div>
    )

  const save = (patch: Partial<ProjectState>, label?: string) =>
    update(
      (s) => void (s.projects[projectId] = { ...(s.projects[projectId] ?? empty()), ...patch, updatedAt: new Date().toISOString() }),
      label ? { kind: 'project-updated', itemId: projectId, label, href: repo.href.project(projectId) } : undefined,
    )

  const valid = (u: string) => u === '' || /^https?:\/\/\S+\.\S+/.test(u)
  const saveLinks = () => {
    const r = repoUrl ?? ps.repoUrl
    const pf = portfolioUrl ?? ps.portfolioUrl
    if (!valid(r) || !valid(pf)) return setError('Links must start with http:// or https://.')
    setError('')
    save({ repoUrl: r, portfolioUrl: pf }, `Updated links on ${p.code}`)
    setRepoUrl(null)
    setPortfolioUrl(null)
    toast('Links saved.')
  }
  const done = p.checklist.filter((_, i) => ps.checklist[i]).length

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="text-[0.8125rem] font-semibold">Status</legend>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={ps.status === s}
              onClick={() => {
                if (s === 'completed' && (ps.rubricScore ?? 0) < 3) {
                  setError('Completed needs a self-scored rubric of 3 or more (blueprint: “Completed when the rubric is ≥ 3”).')
                  return
                }
                setError('')
                save({ status: s }, `Set ${p.code} to ${STATUS_LABEL[s]}`)
                toast(`${p.code}: ${STATUS_LABEL[s]}.`)
              }}
              className={cx('rounded-full border px-3 py-1 text-[0.8125rem] font-semibold', ps.status === s ? 'border-accent bg-accent text-white dark:text-bg' : 'border-border-strong hover:bg-surface-2')}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-[0.8125rem] font-semibold">Rubric self-score (1–4)</legend>
        <p className="text-[0.75rem] text-subtle">{p.completionRubric}</p>
        <div className="mt-1.5 flex gap-1.5">
          {[1, 2, 3, 4].map((v) => (
            <button key={v} type="button" aria-pressed={ps.rubricScore === v} onClick={() => save({ rubricScore: v })} className={cx('h-8 w-8 rounded-md border text-[0.8125rem] font-semibold', ps.rubricScore === v ? 'border-accent bg-accent-soft text-accent' : 'border-border-strong')}>
              {v}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="space-y-3">
        <div>
          <label htmlFor="repo" className="text-[0.8125rem] font-semibold">
            GitHub repository (placeholder)
          </label>
          <input id="repo" value={repoUrl ?? ps.repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/you/project" className="mt-1 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-[0.875rem] outline-none focus:border-accent" />
        </div>
        <div>
          <label htmlFor="portfolio" className="text-[0.8125rem] font-semibold">
            Portfolio link (placeholder)
          </label>
          <input id="portfolio" value={portfolioUrl ?? ps.portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://your-site.example/project" className="mt-1 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-[0.875rem] outline-none focus:border-accent" />
        </div>
        <button type="button" className={cx(btn.secondary, 'px-3 py-1.5 text-[0.8125rem]')} onClick={saveLinks} disabled={repoUrl === null && portfolioUrl === null}>
          Save links
        </button>
      </div>
      {error && <ErrorState title="Not saved" body={error} />}

      <fieldset>
        <legend className="text-[0.8125rem] font-semibold">
          Completion checklist · {done}/{p.checklist.length}
        </legend>
        <ul className="mt-2 space-y-1.5">
          {p.checklist.map((item, i) => (
            <li key={item}>
              <label className="flex cursor-pointer items-start gap-2 text-[0.875rem]">
                <input type="checkbox" checked={Boolean(ps.checklist[i])} onChange={(e) => save({ checklist: { ...ps.checklist, [i]: e.target.checked } })} className="mt-0.5 accent-[var(--accent)]" />
                <span className={cx(ps.checklist[i] && 'text-muted line-through')}>{item}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
    </div>
  )
}
