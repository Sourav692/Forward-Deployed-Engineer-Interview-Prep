'use client'

import Link from 'next/link'
import * as repo from '../repo'
import { attemptsFor, isDone } from '../store/rules'
import { update } from '../store/useDemo'
import { useLearner } from './islands'
import { ActivityTimeline, ReadinessGauge, RevisionQueueList, StatusLegend, remedyFor } from './ProgressViews'
import { Card, EmptyState, H2, ProgressBar, StatCard, StatusBadge, btn, formatDate, formatMinutes } from './ui'

/** Learner dashboard (blueprint §17). Rendered inside an AuthGate. */
export function Dashboard() {
  const data = useLearner()
  if (!data) return null
  const { state, progress } = data
  const path = repo.getPath(state.pathId)!
  const next = progress.nextUp
  const active = Object.entries(state.projects).find(([, p]) => p.status === 'in-progress' || p.status === 'ready-for-review')
  const activeProject = active ? repo.getProject(active[0]) : undefined
  const unread = state.notifications.filter((n) => !n.read)

  // Upcoming assessments: checkpoints for modules in flight, then required mocks not yet passed.
  const upcoming = [
    ...repo
      .listModules()
      .filter((m) => ['in-progress', 'ready-for-review', 'needs-revision'].includes(progress.modules[m.id].status) && progress.modules[m.id].flag !== 'optional')
      .slice(0, 4)
      .map((m) => ({ id: m.id, label: `${m.code} checkpoint`, sub: progress.modules[m.id].lastScore !== undefined ? `Last ${progress.modules[m.id].lastScore}%` : 'Not taken', href: repo.href.checkpoint(m) })),
    ...path.requiredMockIds
      .filter((id) => !attemptsFor(state, id).some((a) => a.passed))
      .slice(0, 3)
      .map((id) => ({ id, label: `Mock ${repo.getMock(id)!.letter}: ${repo.getMock(id)!.title}`, sub: 'Required by your path', href: repo.href.mock(id) })),
  ]

  const tracks = repo.listTracks().filter((t) => !repo.trackSkippedForPath(path.id, t.id))
  const saved = state.bookmarks.slice(0, 4)

  return (
    <div className="space-y-2">
      {unread.length > 0 && (
        <ul className="mb-6 space-y-2" aria-label="Notifications">
          {unread.map((n) => (
            <li key={n.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-accent/30 bg-accent-soft px-3 py-2 text-[0.875rem]">
              <span className="font-semibold">{n.title}</span>
              <span className="w-full text-muted sm:w-auto sm:min-w-0 sm:flex-1">{n.body}</span>
              {n.href && (
                <Link href={n.href} className="font-semibold text-accent hover:underline">
                  Open
                </Link>
              )}
              <button type="button" className="text-[0.8125rem] text-subtle underline" onClick={() => update((s) => void (s.notifications = s.notifications.map((x) => (x.id === n.id ? { ...x, read: true } : x))))}>
                Dismiss
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-accent/40 lg:col-span-2">
          <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-accent">Next up</p>
          {next ? (
            <>
              <p className="mt-1 text-[1.25rem] font-bold">
                {next.module.code} {next.module.title}
              </p>
              <p className="mt-1 text-[0.9375rem] text-muted">{next.reason}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link href={repo.href.module(next.module)} className={btn.primary}>
                  Start the next activity
                </Link>
                <StatusBadge status={progress.modules[next.module.id].status} />
              </div>
            </>
          ) : (
            <p className="mt-1">Every required module on your path is done. Book a mock.</p>
          )}
        </Card>
        <Card>
          <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-subtle">Path</p>
          <Link href={repo.href.path(path.id)} className="mt-1 block font-semibold hover:text-accent">
            {path.title}
          </Link>
          <div className="mt-2">
            <ProgressBar value={progress.path.fraction} label="Path progress" />
          </div>
          <p className="mt-1 text-[0.8125rem] tabular-nums text-subtle">{Math.round(progress.path.fraction * 100)}% · {formatMinutes(progress.path.remainingMinutes)} left</p>
          <p className="mt-2 text-[0.875rem]">
            Finish by <strong>{formatDate(progress.path.finishBy.date)}</strong> at {state.weeklyHours} h a week ({progress.path.finishBy.days} days).{' '}
            <Link href="/demo/settings" className="text-accent hover:underline">
              Change
            </Link>
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
        <Card>
          <ReadinessGauge title="Interview readiness" readiness={progress.interview} target={75} remedyHref={remedyFor(progress.interview.weakest.id)} />
        </Card>
        <Card>
          <ReadinessGauge title="Portfolio readiness" readiness={progress.portfolio} target={70} remedyHref={remedyFor(progress.portfolio.weakest.id)} />
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 md:grid-cols-4">
        <StatCard label="Modules done" value={Object.values(progress.modules).filter((m) => isDone(m.status)).length} hint={`of ${repo.listModules().length}`} />
        <StatCard label="Revision queue" value={progress.revision.length} hint={<Link href="/demo/progress/revision" className="text-accent hover:underline">Clear it</Link>} />
        <StatCard label="Checkpoints passed" value={new Set(state.attempts.filter((a) => a.kind === 'checkpoint' && a.passed).map((a) => a.assessmentId)).size} />
        <StatCard label="Mocks passed" value={new Set(state.attempts.filter((a) => a.kind === 'mock' && a.passed).map((a) => a.assessmentId)).size} hint={`${path.requiredMockIds.length} required`} />
      </div>

      <H2 action={<Link href="/demo/progress/revision" className="text-[0.875rem] font-semibold text-accent hover:underline">All →</Link>}>Revision queue</H2>
      <RevisionQueueList items={progress.revision} limit={5} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <H2>Track progress</H2>
          <ul className="space-y-2.5">
            {tracks.map((t) => (
              <li key={t.id}>
                <Link href={repo.href.track(t.id)} className="flex items-center justify-between gap-2 text-[0.875rem] hover:text-accent">
                  <span>
                    {t.code} {t.title}
                  </span>
                  <span className="tabular-nums text-subtle">{Math.round(progress.tracks[t.id].fraction * 100)}%</span>
                </Link>
                <ProgressBar value={progress.tracks[t.id].fraction} label={`${t.code} progress`} tone={progress.tracks[t.id].status === 'completed' ? 'success' : 'accent'} />
              </li>
            ))}
          </ul>
        </section>
        <section>
          <H2>Upcoming assessments</H2>
          {upcoming.length ? (
            <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
              {upcoming.map((u) => (
                <li key={u.id}>
                  <Link href={u.href} className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-surface-2">
                    <span className="font-medium">{u.label}</span>
                    <span className="text-[0.75rem] text-subtle">{u.sub}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="Nothing scheduled" body="Start a module and its checkpoint appears here." />
          )}
          <H2>Active project</H2>
          {activeProject && active ? (
            <Card>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={repo.href.project(activeProject.id)} className="font-semibold hover:text-accent">
                  {activeProject.code} {activeProject.title}
                </Link>
                <StatusBadge status={active[1].status} size="xs" />
              </div>
              {active[1].repoUrl && <p className="mt-1 truncate text-[0.8125rem] text-muted">{active[1].repoUrl}</p>}
              <div className="mt-2">
                <ProgressBar value={activeProject.checklist.filter((_, i) => active[1].checklist[i]).length / activeProject.checklist.length} label="Deliverables" />
              </div>
            </Card>
          ) : (
            <EmptyState title="No active project" body="Set a project to In progress from its brief to track it here." action={<Link href="/demo/practice" className={btn.secondary}>Browse projects</Link>} />
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <H2 action={<Link href="/demo/progress/history" className="text-[0.875rem] font-semibold text-accent hover:underline">History →</Link>}>Recent activity</H2>
          <ActivityTimeline events={state.activity} limit={6} now={progress.now} />
        </section>
        <section>
          <H2 action={<Link href="/demo/progress/bookmarks" className="text-[0.875rem] font-semibold text-accent hover:underline">All →</Link>}>Saved items</H2>
          {saved.length ? (
            <ul className="space-y-1.5 text-[0.9375rem]">
              {saved.map((b) => (
                <li key={b.id}>
                  <BookmarkLink kind={b.kind} itemId={b.itemId} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No bookmarks yet" body="Bookmark lessons, questions, projects and cases with the Bookmark button." />
          )}
          <H2>Every status, at a glance</H2>
          <StatusLegend counts={progress.statusCounts} />
        </section>
      </div>
    </div>
  )
}

export function BookmarkLink({ kind, itemId }: { kind: string; itemId: string }) {
  if (kind === 'lesson') {
    const l = repo.getLesson(itemId)
    return l ? <Link href={repo.href.lesson(l)} className="hover:text-accent">{l.title}</Link> : null
  }
  if (kind === 'question') {
    const q = repo.getQuestion(itemId)
    return q ? <Link href={repo.href.question(q)} className="hover:text-accent">{q.prompt}</Link> : null
  }
  if (kind === 'project') {
    const p = repo.getProject(itemId)
    return p ? <Link href={repo.href.project(p.id)} className="hover:text-accent">{p.code} {p.title}</Link> : null
  }
  const c = repo.getCase(itemId)
  return c ? <Link href={repo.href.case(c.id)} className="hover:text-accent">{c.code} {c.title}</Link> : null
}
