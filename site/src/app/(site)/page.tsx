import type { Metadata } from 'next'
import { editorialDisplay } from '@/lib/editorial-fonts'
import Link from 'next/link'
import { siteCounts } from '@/components/areas/data'
import { LinkButton, cx } from '@/components/ui'
import { PracticePreview } from '@/components/landing/PracticePreview'
import { LearningJourney } from '@/components/landing/LearningJourney'
import styles from '@/components/landing/landing.module.css'
import '@/components/landing/tokens.css'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/editorial'
import { getTrack, trackHours } from '@/lib/learn'
import { LEARN_STAGES, groupHref } from '@/lib/learn-stages'
import { pageMetadata, webSiteJsonLd } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { ExpressLane } from '@/components/start/ExpressLane'

/**
 * `/`: the product landing page (FE-13), redesigned with Hallmark's Editorial theme.
 * A Server Component with two interactive leaves: a small practice exercise and a
 * scroll camera study. It says what the site is, who it is for and what each area
 * does, then sends the reader to /start or /learn.
 *
 * The page carries its own type and palette (tokens.css, scoped by `data-theme`, and the
 * faces in `lib/editorial-fonts.ts`), which the casebook shares; other routes are unchanged.
 *
 * Every number on this page is computed from `curriculum.ts` or the synced manifest,
 * so the coverage claim cannot drift from what is actually published.
 */


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

const DIFFERENT = [
  { title: 'A Judgement Layer', body: 'Every design asks why: the constraint, the trade-off, what you tell the customer.' },
  { title: 'A Casebook at Three Depths', body: 'Each case as the spoken answer, the deep dive, or the night-before review.' },
  { title: 'Rubric-Scored Practice', body: 'Write your answer first, then score it against what a strong one covers.' },
  { title: 'Built for Spoken Answers', body: 'Pages lead with the line you could say, then add depth.' },
]

export default async function HomePage() {
  const counts = await siteCounts()
  const liveGroups = LEARN_STAGES.filter((g) => g.tracks.length > 0).length

  /** The four content areas, each with its headline count and how it is organised. */
  const inside: { label: string; count: number; unit: string; purpose: string; rows: [string, string | number][]; href: string; cta: string }[] = [
    {
      label: 'Learn', count: counts.learnLessons, unit: 'lessons', purpose: 'The curriculum, from foundations to production AI, grouped by topic.',
      rows: [['Topic groups live', `${liveGroups} of ${LEARN_STAGES.length}`], ['Tracks', counts.learnTracks], ['Modules', counts.learnModules]],
      href: '/learn', cta: 'Browse the curriculum',
    },
    {
      label: 'Casebook', count: counts.designs, unit: 'worked designs', purpose: 'Complete AI system designs, each read as the spoken answer, the deep dive or the night-before review.',
      rows: [['Scenario packs', counts.designs - counts.standaloneDesigns - counts.judgementCases], ['Additional system designs', counts.standaloneDesigns], ['Judgement and decomposition', counts.judgementCases]],
      href: '/design', cta: 'Open the casebook',
    },
    {
      label: 'Practice', count: counts.worksheets + counts.behavioural, unit: 'worksheets', purpose: 'Timed worksheets. Write your answer first, then score it against a model answer.',
      rows: [['Customer discovery', counts.discoveryWorksheets], ['System design', counts.systemDesignWorksheets], ['Behavioural', counts.behavioural]],
      href: '/practice', cta: 'Start practising',
    },
    {
      label: 'Interview', count: counts.liveRounds, unit: 'rounds', purpose: 'The rounds of a real FDE loop, each with what it tests, what to study and how to practise.',
      rows: [['Mock interviews', counts.mocks], ['Final-week reviews', counts.reviews], ['Rounds coming soon', counts.rounds - counts.liveRounds]],
      href: '/interview', cta: 'Get interview ready',
    },
  ]

  return (
    <div data-theme="editorial" className={cx(editorialDisplay.variable, styles.home)}>
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

      <section id="areas" tabIndex={-1} aria-labelledby="areas-heading" className={cx(styles.band, styles.inside)}>
        <div className={styles.insideHead}>
          <h2 id="areas-heading" className={styles.sectionHead}>What&apos;s Inside</h2>
          <p className={styles.lead}>
            Four areas. Learn teaches the material, the casebook and the worksheets give you real problems to work, and Interview puts it all in the order of a real loop.
          </p>
        </div>
        <ul className={styles.insideAreas}>
          {inside.map((a) => (
            <li key={a.label} className={styles.insideArea}>
              <h3 className={styles.insideLabel}>{a.label}</h3>
              <p className={styles.insideCount}><span>{a.count}</span> {a.unit}</p>
              <p className={styles.insidePurpose}>{a.purpose}</p>
              <table className={cx(styles.table, styles.insideTable)}>
                <tbody>
                  {a.rows.map(([k, v]) => (
                    <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>
                  ))}
                </tbody>
              </table>
              <Link href={a.href} className={styles.insideLink}>{a.cta}</Link>
            </li>
          ))}
        </ul>
        <h3 className={cx(styles.insideLabel, styles.insideTopicsHead)}>Learn by topic</h3>
        <ul className={styles.insideGroups}>
          {LEARN_STAGES.map((g, i) => {
            const tracks = g.tracks.flatMap((slug) => getTrack(slug) ?? [])
            const hours = tracks.reduce((sum, t) => sum + trackHours(t), 0)
            const body = (
              <>
                <span className={styles.insideNum}>{i + 1}</span>
                <h4 className={styles.insideGroupTitle}>{g.title}</h4>
                <p>{tracks.length ? `${tracks.length} ${tracks.length === 1 ? 'track' : 'tracks'}, about ${hours} h` : 'Coming soon'}</p>
              </>
            )
            return (
              <li key={g.slug} className={cx(styles.insideGroup, !tracks.length && styles.insideSoon)}>
                {tracks.length ? <Link href={groupHref(g.slug)}>{body}</Link> : <div>{body}</div>}
              </li>
            )
          })}
        </ul>
        <p className={cx(styles.caption, styles.insideNote)}>
          {counts.learnReady} of {counts.learnModules} Learn modules are ready. Each module page says what is still missing. Your reading and practice progress stays in this browser.
        </p>
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
