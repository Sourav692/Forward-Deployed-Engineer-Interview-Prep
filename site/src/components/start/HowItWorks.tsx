import Link from 'next/link'
import { cx, focusRing } from '@/components/ui'

/**
 * "How the site works" on /start (ENH-11): what the old /guide and /learning-map pages
 * said that /start did not, in one place. The four areas, the practice loop and what an
 * interviewer scores. A Server Component with no state.
 */

const AREAS = [
  {
    href: '/learn',
    title: 'Learn',
    body: 'The curriculum, by track and module. Read a lesson, then rate how confident you feel so the revision queue knows what to bring back.',
  },
  {
    href: '/practice',
    title: 'Practice',
    body: 'Worksheets you fill in, then compare with a model answer and score honestly. The behavioural questions are answered with your own stories.',
  },
  {
    href: '/design',
    title: 'Casebook',
    body: 'Complete system designs. Read one after practising the same kind of problem, or when a worksheet stumps you.',
  },
  {
    href: '/interview',
    title: 'Interview',
    body: 'Timed mock rounds with a scorecard, topic hubs, and the final-week review for the days before the loop.',
  },
]

const LOOP = [
  {
    title: 'Read the prompt and resist the urge to design',
    body: 'The prompt is vague on purpose, like a real customer conversation. Ask what breaks before you reach for a vector database.',
  },
  {
    title: 'Fill in the blanks before you reveal anything',
    body: 'Writing a wrong answer and seeing why it is wrong teaches more than reading a right one. Type fast; an empty worksheet teaches nothing.',
  },
  {
    title: 'Reveal one section at a time',
    body: 'Open each model answer only after you have attempted that section. It shows the ground a strong answer covers, not the only correct answer.',
  },
  {
    title: 'Score yourself against the rubric, honestly',
    body: 'Most first attempts score a 3. The row that stays lowest across several scenarios is the one to work on.',
  },
  {
    title: 'Say the closing answer out loud',
    body: 'Every model answer ends with a two-minute spoken summary. Say yours before you reveal it: being right but unable to say it in two minutes reads as not knowing it.',
  },
]

const TESTS = [
  ['Problem framing', 'Do you find the dangerous constraint before you design, or jump to tools?'],
  ['Architecture', 'Are your components specific, bounded and observable, or is it a generic diagram?'],
  ['Evaluation', 'Can you say how you would know it works, with datasets, thresholds and owners?'],
  ['Production thinking', 'Do you plan for failure, rollback, cost and drills, or does the story end at the demo?'],
  ['Communication', 'Can an executive and an engineer both take what they need from the same answer?'],
]

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works-title" id="how-it-works" className="mt-14 max-w-3xl scroll-mt-24">
      <h2 id="how-it-works-title" className="text-xl font-semibold tracking-[-0.01em]">
        How the Site Works
      </h2>
      <p className="mt-1 text-sm text-muted">
        Four areas, each with one job. A path tells you which modules to start with; the areas are where you study them.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {AREAS.map((area) => (
          <li key={area.href} className="rounded-lg border border-border bg-surface p-4">
            <Link href={area.href} className={cx('rounded-sm font-semibold hover:text-accent', focusRing)}>
              {area.title}
            </Link>
            <p className="mt-1 text-sm leading-relaxed text-muted">{area.body}</p>
          </li>
        ))}
      </ul>

      <h3 className="mt-10 text-lg font-semibold">The Practice Loop</h3>
      <ol className="mt-3 space-y-4">
        {LOOP.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span
              aria-hidden
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent"
            >
              {i + 1}
            </span>
            <div>
              <p className="font-semibold">{step.title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <h3 className="mt-10 text-lg font-semibold">What the Interview Tests</h3>
      <p className="mt-1 text-sm text-muted">The same five things are scored in every round. They are the rows of the scorecard.</p>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        {TESTS.map(([term, desc]) => (
          <div key={term} className="rounded-lg border border-border bg-surface p-4">
            <dt className="font-semibold">{term}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted">{desc}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
