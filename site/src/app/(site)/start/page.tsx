import type { Metadata } from 'next'
import { MODULES } from '@/lib/curriculum'
import { learnHref, moduleTime } from '@/lib/learn'
import { CurrentPathNotice } from '@/components/start/ChoosePath'
import { Diagnostic, type ModuleRef } from '@/components/start/Diagnostic'
import { HowItWorks } from '@/components/start/HowItWorks'
import { PersonaCards } from '@/components/start/PersonaCards'
import { StorageNotice } from '@/components/learn/ProgressIslands'
import Link from 'next/link'
import { EditorialSection } from '@/components/editorial/EditorialSection'
import { PERSONAS } from '@/lib/paths'
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { ExpressLane } from '@/components/start/ExpressLane'

/**
 * /start (FE-10): the one onboarding page (ENH-11). Choose a learning path, by the
 * ten-question diagnostic or by picking a persona, then read how the site works. A
 * static Server Component; the diagnostic and the current-path notice are client
 * islands. Choosing a path is optional: every Learn page works without one. The old
 * /guide and /learning-map pages redirect here.
 */

export const metadata: Metadata = pageMetadata({
  path: '/start',
  title: 'Choose Your Path',
  description:
    'Pick a learning path for your background and interview date: answer ten questions or choose one of seven starting points. Optional, and stored only in this browser.',
})

export default function StartPage() {
  const modules: Record<string, ModuleRef> = Object.fromEntries(
    MODULES.map((m) => [m.slug, { code: m.code, title: m.title, href: learnHref.module(m), minutes: moduleTime(m).total }]),
  )
  const sections = [
    { href: '#diagnostic', label: 'Take the Diagnostic', count: '10 questions' },
    { href: '#personas', label: 'Pick a starting point', count: `${PERSONAS.length} paths` },
    { href: '#how-it-works', label: 'How the site works', count: '4 areas' },
  ]
  // Editorial theme (editorial.css): the name and what a path does, the short ways out,
  // then the diagnostic, the starting points and how the site works, each under a heavy rule.
  return (
    <div className="pb-16">
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Choose Your Path', path: '/start' }])} />
      <header className="cb-hero">
        <div>
          <h1>Choose Your Path</h1>
          <p className="cb-standfirst">
            A path marks each module as required, recommended, optional, or skip for your background, so you know what to
            study first.
          </p>
        </div>
        <div className="cb-hero-side">
          <p>It is optional: every lesson is open without one, and you can change it any time.</p>
          <ExpressLane className="mt-3" />
          <Link href="/learn" className="cb-btn mt-5">
            Skip and browse the curriculum
          </Link>
          <nav aria-label="On this page" className="mt-6">
            <ul className="cb-rows">
              {sections.map((x) => (
                <li key={x.href} className="cb-row">
                  <a href={x.href} className="cb-row-link">
                    <span className="cb-row-title">{x.label}</span>
                    <span className="cb-row-facts">{x.count}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <StorageNotice />
      <CurrentPathNotice />

      <EditorialSection id="diagnostic" title="Take the Diagnostic">
        <div className="max-w-3xl">
          <Diagnostic modules={modules} />
        </div>
      </EditorialSection>

      <EditorialSection id="personas" title="Or Pick Your Starting Point" description="Each row opens the path for that background, with every module flagged.">
        <PersonaCards />
      </EditorialSection>

      <HowItWorks />
    </div>
  )
}
