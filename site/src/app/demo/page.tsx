import Link from 'next/link'
import * as repo from '@/demo/repo'
import { DemoSignInButton } from '@/demo/components/DemoSignInButton'
import { AREAS } from '@/demo/nav'
import { Card, FlagBadge, H2, SampleContentBadge, Tag, btn, formatMinutes } from '@/demo/components/ui'

/**
 * Landing page. A Server Component: everything here is static demo data, so it
 * renders at build time and ships no JavaScript of its own. The one interactive
 * control (the demo sign-in button) is a client island.
 */
const DIFFERENT = [
  ['The judgement layer', 'Decomposition, trade-offs and delivery, not just tools. Every design answer names the metric it serves.'],
  ['A casebook at three depths', 'Each worked design has a Main view, a Deep Dive and a one-screen Cheat Sheet for the night before.'],
  ['Rubric-scored practice', 'Self-score against one shared four-level rubric, with links straight to the module that fixes the weakest dimension.'],
  ['Spoken answers', 'Answers are written to be said aloud: a structure, a stated trade-off, a number, in under two minutes.'],
]

const OUTCOMES = [
  'Run a 45–60 minute AI system-design round with a stated framework',
  'Decompose a vague customer request into requirements, constraints and an evaluation plan',
  'Defend cost, latency, security and evaluation choices under follow-up',
  'Tell 8–12 grounded stories and ship one portfolio-grade capstone write-up',
]

const AREA_PURPOSE: Record<string, string> = {
  Start: 'Pick a path with a ten-question diagnostic',
  Learn: 'Ten tracks, taught in dependency order',
  Design: 'Worked designs at three depths',
  Practice: 'Worksheets and projects P1–P10',
  Interview: 'Topic hubs, mocks A–E and company packs',
  Progress: 'Dashboard, readiness and revision queue',
}

export default function DemoHome() {
  const featuredTracks = ['t2', 't4', 't5', 't6'].map((id) => repo.getTrack(id)!)
  const featuredProjects = ['p2', 'p4', 'p6'].map((id) => repo.getProject(id)!)
  const t2 = repo.getTrack('t2')!
  const t2Sections = repo.listSections('t2')

  return (
    <div className="space-y-16">
      <section className="grid items-start gap-10 pt-4 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <SampleContentBadge />
          <h1 className="mt-4 text-[2.25rem] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[2.75rem]">Forward Deployed</h1>
          <p className="mt-3 max-w-xl text-[1.125rem] leading-relaxed text-muted">
            Applied AI engineering, from the customer’s problem to production, and the interview that tests both.
          </p>
          <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed">
            For engineers with 3–15 years’ experience moving into applied AI, AI solutions or forward deployed roles, and for candidates preparing for those loops.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/demo/start" className={btn.primary}>
              Start learning
            </Link>
            <Link href="/demo/learn" className={btn.secondary}>
              Explore curriculum
            </Link>
            <DemoSignInButton />
          </div>
          <p className="mt-3 text-[0.8125rem] text-subtle">This is a clickable prototype. Lesson bodies, questions and answers are sample content.</p>
        </div>

        {/* The product's identity is its structure: show it, not a stock hero. */}
        <Card className="text-[0.875rem]">
          <div className="flex items-center justify-between">
            <span className="font-semibold">
              {t2.code} {t2.title}
            </span>
            <FlagBadge flag="required" />
          </div>
          <p className="mt-1 text-muted">{t2.objective}</p>
          <ol className="mt-4 space-y-3">
            {t2Sections.map((s) => (
              <li key={s.id}>
                <div className="text-[0.75rem] font-semibold uppercase tracking-wide text-subtle">Section · {s.title}</div>
                <ul className="mt-1.5 divide-y divide-border rounded-lg border border-border">
                  {s.moduleIds.slice(0, 3).map((id) => {
                    const m = repo.getModule(id)!
                    return (
                      <li key={id} className="flex items-center gap-3 px-3 py-2">
                        <span className="w-9 shrink-0 font-semibold tabular-nums text-subtle">{m.code}</span>
                        <span className="min-w-0 flex-1 truncate">{m.title}</span>
                        <span className="shrink-0 text-[0.75rem] text-subtle">
                          {m.lessonIds.length} lessons · {formatMinutes(m.estMinutes)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[0.75rem] text-subtle">Track → Section → Module → Lessons, Exercise and Checkpoint</p>
        </Card>
      </section>

      <section aria-labelledby="areas">
        <H2 id="areas">Six areas, one loop</H2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((a) => (
            <li key={a.href}>
              <Link href={a.href} className="block h-full rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent">
                <div className="font-semibold">{a.label}</div>
                <div className="mt-0.5 text-[0.875rem] text-muted">{AREA_PURPOSE[a.label]}</div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="who">
        <H2 id="who">Who it’s for</H2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {repo.listPersonas().map((p) => (
            <li key={p.id}>
              <Card className="h-full">
                <div className="font-semibold">{p.title}</div>
                <p className="mt-1 text-[0.8125rem] text-muted">{p.painPoint}</p>
                <Link href={repo.href.path(p.defaultPathId)} className="mt-2 inline-block text-[0.8125rem] font-semibold text-accent hover:underline">
                  {repo.getPath(p.defaultPathId)?.title} path →
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="different">
        <H2 id="different">What makes it different</H2>
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {DIFFERENT.map(([t, d]) => (
            <div key={t} className="border-l-2 border-accent/40 pl-4">
              <dt className="font-semibold">{t}</dt>
              <dd className="mt-1 text-[0.9375rem] text-muted">{d}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="tracks">
        <H2 id="tracks" action={<Link href="/demo/learn" className="text-[0.875rem] font-semibold text-accent hover:underline">All ten tracks →</Link>}>
          Featured tracks
        </H2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {featuredTracks.map((t) => (
            <li key={t.id}>
              <Link href={repo.href.track(t.id)} className="block h-full rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {t.code} {t.title}
                  </span>
                  <span className="ml-auto text-[0.75rem] text-subtle">~{t.estHours} h</span>
                </div>
                <p className="mt-1 text-[0.875rem] text-muted">{t.objective}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="projects" className="grid gap-8 lg:grid-cols-2">
        <div>
          <H2 id="projects" action={<Link href="/demo/practice" className="text-[0.875rem] font-semibold text-accent hover:underline">P1–P10 →</Link>}>
            Featured projects
          </H2>
          <ul className="space-y-2">
            {featuredProjects.map((p) => (
              <li key={p.id}>
                <Link href={repo.href.project(p.id)} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3 hover:border-accent">
                  <span className="w-8 shrink-0 font-semibold text-subtle">{p.code}</span>
                  <span className="min-w-0">
                    <span className="block font-medium">{p.title}</span>
                    <span className="block text-[0.8125rem] text-muted">{p.businessProblem}</span>
                  </span>
                  <span className="ml-auto shrink-0">
                    <Tag>{p.typeLabel}</Tag>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <H2 action={<Link href="/demo/interview" className="text-[0.875rem] font-semibold text-accent hover:underline">Interview area →</Link>}>Interview practice</H2>
          <ul className="space-y-2 text-[0.9375rem]">
            {repo.listHubs().map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2">
                <Link href={repo.href.hub(h.id)} className="font-medium hover:text-accent">
                  {h.title}
                </Link>
                <span className="text-[0.8125rem] text-subtle">{repo.listQuestions({ hubId: h.id }).length} questions</span>
              </li>
            ))}
            <li className="rounded-lg border border-dashed border-border-strong px-3 py-2 text-[0.875rem] text-muted">
              Mocks A–E on one shared rubric, a 150-minute readiness exam, and three fictional company packs.
            </li>
          </ul>
        </div>
      </section>

      <section aria-labelledby="outcomes">
        <H2 id="outcomes">Sample outcomes</H2>
        <ol className="grid gap-3 sm:grid-cols-2">
          {OUTCOMES.map((o, i) => (
            <li key={o} className="flex gap-3 rounded-lg bg-surface-2 p-3 text-[0.9375rem]">
              <span className="font-semibold tabular-nums text-accent">{i + 1}</span>
              {o}
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap gap-2">
          <Link href="/demo/start" className={btn.primary}>
            Start learning
          </Link>
          <Link href="/demo/learn" className={btn.secondary}>
            Explore curriculum
          </Link>
          <DemoSignInButton />
        </div>
      </section>
    </div>
  )
}
