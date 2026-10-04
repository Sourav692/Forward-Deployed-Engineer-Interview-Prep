'use client'

import Link from 'next/link'
import * as repo from '../repo'
import { attemptsFor } from '../store/rules'
import { skillProficiency } from '../store/selectors'
import type { LearnerState } from '../types'
import type { Progress } from '../store/selectors'
import { useLearner } from './islands'
import { ReadinessGauge, remedyFor } from './ProgressViews'
import { Tabs } from './Tabs'
import { Card, EmptyState, StatusBadge, Tag, btn, cx } from './ui'

interface Badge {
  id: string
  label: string
  earned: boolean
  rule: string
}

function badges(state: LearnerState, progress: Progress): Badge[] {
  const passedCps = new Set(state.attempts.filter((a) => a.kind === 'checkpoint' && a.passed).map((a) => a.assessmentId)).size
  const doneTracks = Object.entries(progress.tracks).filter(([, t]) => t.status === 'completed').map(([id]) => repo.getTrack(id)!.code)
  const mocks = repo.listMocks().filter((m) => attemptsFor(state, m.id).some((a) => a.passed))
  return [
    { id: 'streak', label: 'Checkpoint streak', earned: passedCps >= 3, rule: 'Pass three checkpoints' },
    ...repo.listMocks().map((m) => ({ id: m.id, label: `Mock ${m.letter} passed`, earned: mocks.includes(m), rule: `Pass Mock ${m.letter}` })),
    { id: 'track', label: doneTracks.length ? `Track complete: ${doneTracks.join(', ')}` : 'Track complete', earned: doneTracks.length > 0, rule: 'Complete every module in a track' },
    { id: 'project', label: 'First project submitted', earned: Object.values(state.projects).some((p) => p.status === 'ready-for-review' || p.status === 'completed'), rule: 'Submit a project for review' },
  ]
}

function SkillList({ state }: { state: LearnerState }) {
  return (
    <div className="space-y-6">
      {repo.listCompetencies().map((c) => (
        <section key={c.id}>
          <h3 className="text-[0.8125rem] font-semibold uppercase tracking-wide text-subtle">{c.title}</h3>
          <ul className="mt-2 space-y-2">
            {c.skillIds.map((id) => {
              const s = repo.getSkill(id)!
              const { level, evidence } = skillProficiency(state, id)
              return (
                <li key={id} className="rounded-lg border border-border bg-surface px-3 py-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="min-w-0 flex-1 font-medium">{s.title}</span>
                    <span className="flex gap-0.5" role="img" aria-label={`Proficiency ${level} of 4`}>
                      {[1, 2, 3, 4].map((n) => (
                        <span key={n} className={cx('h-2 w-5 rounded-sm', n <= level ? 'bg-accent' : 'bg-surface-2')} />
                      ))}
                    </span>
                    <span className="w-8 text-right text-[0.8125rem] tabular-nums text-subtle">{level}/4</span>
                  </div>
                  {evidence.length > 0 ? (
                    <p className="mt-1 text-[0.75rem] text-muted">
                      Evidence:{' '}
                      {evidence.map((e, i) => (
                        <span key={e.label}>
                          {i > 0 && ', '}
                          <Link href={e.href} className="text-accent hover:underline">
                            {e.label}
                          </Link>
                        </span>
                      ))}
                    </p>
                  ) : (
                    <p className="mt-1 text-[0.75rem] text-subtle">No evidence yet: pass a checkpoint or submit an exercise.</p>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

function Portfolio({ state, publicView }: { state: LearnerState; publicView?: boolean }) {
  const projects = Object.entries(state.projects).filter(([, p]) => p.status !== 'not-started')
  return (
    <div className="space-y-6">
      {projects.length ? (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {projects.map(([id, ps]) => {
            const p = repo.getProject(id)!
            return (
              <li key={id}>
                <Card className="h-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={repo.href.project(id)} className="font-semibold hover:text-accent">
                      {p.code} {p.title}
                    </Link>
                    <StatusBadge status={ps.status} size="xs" />
                  </div>
                  <p className="mt-1 text-[0.8125rem] text-muted">{p.businessProblem}</p>
                  <p className="mt-2 truncate text-[0.8125rem]">{ps.repoUrl || <span className="text-subtle">No repository yet</span>}</p>
                </Card>
              </li>
            )
          })}
        </ul>
      ) : (
        <EmptyState title="No projects yet" body="Projects you start appear here as portfolio evidence." action={!publicView && <Link href="/demo/practice" className={btn.secondary}>Browse projects</Link>} />
      )}
      <section>
        <h3 className="font-semibold">Portfolio artifacts</h3>
        {state.portfolio.artifacts.length ? (
          <ul className="mt-2 space-y-1.5 text-[0.9375rem]">
            {state.portfolio.artifacts.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-2">
                <Tag>{a.kind.replace('-', ' ')}</Tag>
                <span>{a.title}</span>
                <span className="truncate text-[0.8125rem] text-subtle">{a.url}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-[0.875rem] text-subtle">Design docs, eval reports and demo write-ups appear here once you link them to a project.</p>
        )}
      </section>
    </div>
  )
}

export function ProfileView({ publicView }: { publicView?: boolean }) {
  const data = useLearner()
  if (!data) return null
  const { state, progress } = data
  const u = state.user
  const path = repo.getPath(state.pathId)!
  const doneTracks = repo.listTracks().filter((t) => progress.tracks[t.id].status === 'completed')
  const earned = badges(state, progress)

  const header = (
    <Card className="flex flex-wrap items-center gap-4">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-[1.25rem] font-bold text-white dark:text-bg">
        {u.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('')}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[1.25rem] font-bold">{u.name}</p>
        <p className="text-[0.875rem] text-muted">
          {u.currentRole || 'Role not set'} → {u.targetRole || 'Target role not set'}
        </p>
        <p className="mt-1 flex flex-wrap gap-x-4 text-[0.8125rem] text-subtle">
          <span>GitHub: {u.github || 'not linked'}</span>
          <span>LinkedIn: {u.linkedin || 'not linked'}</span>
        </p>
      </div>
      <div className="text-[0.8125rem]">
        <p>
          Path: <Link href={repo.href.path(path.id)} className="font-semibold hover:text-accent">{path.title}</Link>
        </p>
        {!publicView && (
          <div className="mt-2 flex gap-2">
            <Link href="/demo/profile/public" className={cx(btn.secondary, 'px-3 py-1.5 text-[0.8125rem]')}>
              Public preview
            </Link>
            <Link href="/demo/settings" className={cx(btn.ghost, 'text-[0.8125rem]')}>
              Edit
            </Link>
          </div>
        )}
      </div>
    </Card>
  )

  const overview = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <ReadinessGauge title="Interview readiness" readiness={progress.interview} target={75} remedyHref={publicView ? undefined : remedyFor(progress.interview.weakest.id)} />
        </Card>
        <Card>
          <ReadinessGauge title="Portfolio readiness" readiness={progress.portfolio} target={70} remedyHref={publicView ? undefined : remedyFor(progress.portfolio.weakest.id)} />
        </Card>
      </div>
      <section>
        <h3 className="font-semibold">Completed tracks</h3>
        {doneTracks.length ? (
          <ul className="mt-2 flex flex-wrap gap-2">
            {doneTracks.map((t) => (
              <li key={t.id}>
                <Tag tone="success">
                  {t.code} {t.title}
                </Tag>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-[0.875rem] text-subtle">None yet.</p>
        )}
      </section>
      <section>
        <h3 className="font-semibold">
          Badges <span className="ml-1 rounded bg-warning-soft px-1.5 py-0.5 text-[0.6875rem] font-semibold uppercase text-warning-text">Demo</span>
        </h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {earned.filter((b) => b.earned || !publicView).map((b) => (
            <li key={b.id} title={b.rule} className={cx('rounded-full border px-3 py-1 text-[0.8125rem]', b.earned ? 'border-accent bg-accent-soft font-semibold text-accent' : 'border-dashed border-border-strong text-subtle')}>
              {b.earned ? '✓ ' : ''}
              {b.label}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )

  return (
    <div className="space-y-6">
      {publicView && (
        <p role="note" className="rounded-md border border-warning/50 bg-warning-soft px-3 py-2 text-[0.8125rem]">
          Preview of what a public profile would show. Nothing is published: the prototype has no backend.
        </p>
      )}
      {header}
      <Tabs
        tabs={[
          { id: 'overview', label: 'Overview', content: overview },
          { id: 'skills', label: 'Skills', content: <SkillList state={state} /> },
          { id: 'portfolio', label: 'Portfolio', content: <Portfolio state={state} publicView={publicView} /> },
        ]}
      />
    </div>
  )
}
