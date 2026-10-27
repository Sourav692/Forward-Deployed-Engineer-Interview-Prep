import type { Metadata } from 'next'
import Link from 'next/link'
import { Bricolage_Grotesque, Source_Serif_4 } from 'next/font/google'
import { siteCounts } from '@/components/areas/data'
import { LinkButton, cx } from '@/components/ui'
import { PracticePreview } from '@/components/landing/PracticePreview'
import { LearningJourney } from '@/components/landing/LearningJourney'
import styles from '@/components/landing/landing.module.css'
import '@/components/landing/tokens.css'
import { NAV, SITE_NAME, SITE_TAGLINE } from '@/lib/editorial'
import { pageMetadata, webSiteJsonLd } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { ExpressLane } from '@/components/start/ExpressLane'

/**
 * `/`: the product landing page (FE-13), redesigned with Hallmark's Editorial theme.
 * A Server Component with two interactive leaves: a small practice exercise and a
 * scroll camera study. It says what the site is, who it is for and what each area
 * does, then sends the reader to /start or /learn.
 *
 * The page carries its own type and palette (tokens.css, scoped by `data-theme`),
 * loaded here so the fonts ship on this route only. The rest of the site is unchanged.
 *
 * Every number on this page is computed from `curriculum.ts` or the synced manifest,
 * so the coverage claim cannot drift from what is actually published.
 */

// Variable fonts: `wdth` gives Bricolage its condensed magazine proportion, `opsz` its label cut.
const display = Bricolage_Grotesque({ subsets: ['latin'], axes: ['wdth', 'opsz'], variable: '--font-bricolage', display: 'swap' })
const serif = Source_Serif_4({ subsets: ['latin'], axes: ['opsz'], style: ['normal', 'italic'], variable: '--font-source-serif', display: 'swap' })

const TAGLINE = 'Learn the foundations, work through real designs, and practise the decisions interviewers test.'
const LEDE = 'Learn the foundations, work through real designs, practise what interviewers test.'

export const metadata: Metadata = pageMetadata({ path: '/', description: TAGLINE, ogTitle: `${SITE_NAME} — ${SITE_TAGLINE}` })

const PERSONAS = [
  { who: 'Beginner', line: 'Start from the foundations and follow one path.' },
  { who: 'Experienced software engineer moving into AI', line: 'Skip what you know: retrieval, agents, evaluation, production AI.' },
  { who: 'Data engineer', line: 'Build on the pipelines and governance you run.' },
  { who: 'ML engineer going to production', line: 'From a working model to a system a customer can trust.' },
  { who: 'Architect or consultant', line: 'Which use case to fund, what to build first, how to scope it.' },
  { who: 'FDE candidate', line: 'Discovery, design, behavioural stories, final-week review.' },
  { who: 'Revision-only candidate', line: 'Condensed reviews, worked designs, timed practice.' },
]

/** One line per area, keyed by the stable NAV ids. Labels and hrefs come from NAV. */
const AREA_COPY: Record<(typeof NAV)[number]['id'], { purpose: string; cta: string }> = {
  start: { purpose: 'A few questions, then a study path that fits you.', cta: 'Pick a path' },
  learn: { purpose: 'The curriculum: tracks, modules and lessons.', cta: 'Browse the curriculum' },
  design: { purpose: 'Complete system designs, read as interview answers or deep dives.', cta: 'Open the casebook' },
  practice: { purpose: 'Worksheets and behavioural questions, scored against a model answer.', cta: 'Start practising' },
  interview: { purpose: 'Mock rounds and the final-week review for the days before the loop.', cta: 'Get interview ready' },
}

const DIFFERENT = [
  { title: 'A Judgement Layer', body: 'Every design asks why: the constraint, the trade-off, what you tell the customer.' },
  { title: 'A Casebook at Three Depths', body: 'Each case as the spoken answer, the deep dive, or the night-before review.' },
  { title: 'Rubric-Scored Practice', body: 'Write your answer first, then score it against what a strong one covers.' },
  { title: 'Built for Spoken Answers', body: 'Pages lead with the line you could say, then add depth.' },
]

export default async function HomePage() {
  const counts = await siteCounts()

  const status: { label: string; value: number }[] = [
    { label: 'Ready', value: counts.byStatus.ready },
    { label: 'Partly ready', value: counts.byStatus.partly },
    { label: 'Coming soon', value: counts.byStatus['coming-soon'] },
    { label: 'On hold', value: counts.byStatus['on-hold'] },
  ]
  const material: { label: string; value: number }[] = [
    { label: 'Technical worksheets', value: counts.worksheets },
    { label: 'Behavioural worksheets', value: counts.behavioural },
    { label: 'Worked system designs', value: counts.designs },
    { label: 'Final-week reviews', value: counts.reviews },
  ]

  return (
    <div data-theme="editorial" className={cx(display.variable, serif.variable, styles.home)}>
      <JsonLd data={webSiteJsonLd()} />
      <section aria-labelledby="hero-heading" className={styles.hero}>
        <div>
          <h1 id="hero-heading" className={styles.heroHead}>
            Build AI systems.<br />Explain them with confidence.
          </h1>
          <p className={cx(styles.lead, styles.heroLead)}>{LEDE}</p>
          <div className={styles.actions}>
            <LinkButton href="/start" className={styles.btn}>Choose your path</LinkButton>
            <LinkButton href="/learn" variant="secondary" className={cx(styles.btn, styles.btnSecondary)}>Explore curriculum</LinkButton>
          </div>
          <ExpressLane className={styles.express} />
        </div>
        <PracticePreview />
      </section>

      <LearningJourney />

      <section id="coverage" tabIndex={-1} aria-labelledby="coverage-heading" className={cx(styles.band, styles.beside)}>
        <div>
          <h2 id="coverage-heading" className={styles.sectionHead}>What Is Ready Today</h2>
          <p className={cx(styles.lead, 'mt-6')}>
            {counts.modules} modules across {counts.learnTracks} Learn tracks and the Interview area. Not all have material yet, and each module page says so.
          </p>
        </div>
        <div className={styles.tables}>
          <table className={styles.table}>
            <caption>Modules</caption>
            <tbody>
              {status.map((s) => (
                <tr key={s.label}><th scope="row">{s.label}</th><td>{s.value}</td></tr>
              ))}
            </tbody>
          </table>
          <table className={styles.table}>
            <caption>Live today</caption>
            <tbody>
              {material.map((m) => (
                <tr key={m.label}><th scope="row">{m.label}</th><td>{m.value}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="areas" tabIndex={-1} aria-labelledby="areas-heading" className={cx(styles.section, styles.opens)}>
        <h2 id="areas-heading" className={styles.sectionHead}>Find Your Next Step</h2>
        <ul className={styles.rows}>
          {NAV.map((area) => (
            <li key={area.id} className={styles.row}>
              <h3 className={styles.rowTitle}>{area.label}</h3>
              <p>{AREA_COPY[area.id].purpose}</p>
              <Link href={area.href} className={styles.rowLink}>{AREA_COPY[area.id].cta}</Link>
            </li>
          ))}
        </ul>
        <p className={styles.caption}>Your reading and practice progress stays in this browser as you go.</p>
      </section>

      <section id="different" tabIndex={-1} aria-labelledby="different-heading" className={cx(styles.section, styles.beside)}>
        <h2 id="different-heading" className={styles.sectionHead}>What Makes It Different</h2>
        <ul className={styles.pairs}>
          {DIFFERENT.map((d) => (
            <li key={d.title} className={styles.pair}>
              <h3 className={styles.pairTitle}>{d.title}</h3>
              <p>{d.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="who" tabIndex={-1} aria-labelledby="who-heading" className={cx(styles.section, styles.opens)}>
        <h2 id="who-heading" className={styles.sectionHead}>Who It Is For</h2>
        <dl className={styles.index}>
          {PERSONAS.map((p) => (
            <div key={p.who} className={styles.indexRow}>
              <dt>{p.who}</dt>
              <dd>{p.line}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="cta-heading" className={cx(styles.sectionTight, styles.close)}>
        <div>
          <h2 id="cta-heading" className={styles.sectionHead}>Know What to Study Next</h2>
          <p className={cx(styles.lead, 'mt-4')}>Pick a path if you want a sequence. Open the curriculum if you would rather choose for yourself.</p>
        </div>
        <div className={styles.actions}>
          <LinkButton href="/start" className={styles.btn}>Start learning</LinkButton>
          <LinkButton href="/learn" variant="secondary" className={cx(styles.btn, styles.btnSecondary)}>Explore curriculum</LinkButton>
        </div>
      </section>
    </div>
  )
}
