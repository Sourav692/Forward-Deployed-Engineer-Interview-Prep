import Link from 'next/link'

/**
 * "How the site works" on /start (ENH-11): what the old /guide and /learning-map pages
 * said that /start did not, in one place. The four areas, the practice loop and what an
 * interviewer scores. A Server Component with no state, set as contents rows and a
 * numbered loop in the Editorial theme (editorial.css).
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
    <section aria-labelledby="how-it-works-title" id="how-it-works" className="mt-24 scroll-mt-24">
      <div className="cb-opens mb-8 lg:grid lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-10">
        <h2 id="how-it-works-title" className="cb-section-head">
          How the Site Works
        </h2>
        <p className="mt-4 max-w-[60ch] text-base lg:mt-1">
          Four areas, each with one job. A path tells you which modules to start with; the areas are where you study them.
        </p>
      </div>
      <ul className="cb-rows">
        {AREAS.map((area) => (
          <li key={area.href} className="cb-row">
            <Link href={area.href} className="cb-row-link">
              <span className="cb-row-title">{area.title}</span>
              <span className="cb-row-note">{area.body}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="cb-group mt-16">
        <div>
          <h3>The Practice Loop</h3>
          <p className="cb-group-blurb">Five steps for every worksheet, from the prompt to the spoken summary.</p>
        </div>
        <ol className="cb-steps">
          {LOOP.map((step) => (
            <li key={step.title}>
              <p className="cb-step-title">{step.title}</p>
              <p className="cb-step-body">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="cb-group mt-16">
        <div>
          <h3>What the Interview Tests</h3>
          <p className="cb-group-blurb">The same five things are scored in every round. They are the rows of the scorecard.</p>
        </div>
        <dl className="cb-rows">
          {TESTS.map(([term, desc]) => (
            <div key={term} className="cb-row py-3.5">
              <dt className="cb-row-title">{term}</dt>
              <dd className="mt-1 text-base text-[var(--color-ink-2)]">{desc}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
