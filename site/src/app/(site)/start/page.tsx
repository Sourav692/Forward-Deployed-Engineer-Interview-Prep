import type { Metadata } from 'next'
import { MODULES } from '@/lib/curriculum'
import { learnHref } from '@/lib/learn'
import { CurrentPathNotice } from '@/components/start/ChoosePath'
import { Diagnostic, type ModuleRef } from '@/components/start/Diagnostic'
import { HowItWorks } from '@/components/start/HowItWorks'
import { PersonaCards } from '@/components/start/PersonaCards'
import { StorageNotice } from '@/components/learn/ProgressIslands'
import { LinkButton } from '@/components/ui'
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
    MODULES.map((m) => [m.slug, { code: m.code, title: m.title, href: learnHref.module(m) }]),
  )
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Choose Your Path', path: '/start' }])} />
      <header className="mb-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-subtle">Start</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">Choose Your Path</h1>
        <p className="mt-3 text-base text-muted">
          A path marks each module as required, recommended, optional, or skip for your background, so you know what
          to study first. It is optional: every lesson is open without one, and you can change it any time.
        </p>
        <ExpressLane className="mt-3" />
        <div className="mt-4">
          <LinkButton href="/learn" variant="secondary">
            Skip and browse the curriculum
          </LinkButton>
        </div>
      </header>

      <StorageNotice />
      <CurrentPathNotice />

      <section aria-labelledby="diagnostic" className="max-w-3xl">
        <h2 id="diagnostic" className="text-xl font-semibold tracking-[-0.01em]">
          Take the Diagnostic
        </h2>
        <div className="mt-3">
          <Diagnostic modules={modules} />
        </div>
      </section>

      <section aria-labelledby="personas" className="mt-12">
        <h2 id="personas" className="text-xl font-semibold tracking-[-0.01em]">
          Or Pick Your Starting Point
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted">Each card opens the path for that background, with every module flagged.</p>
        <div className="mt-4">
          <PersonaCards />
        </div>
      </section>

      <HowItWorks />
    </>
  )
}
