import type { Metadata } from 'next'
import Link from 'next/link'
import { AUTHOR, reportHref } from '@/lib/editorial'
import { getLearnManifest } from '@/lib/learn'
import { pageMetadata } from '@/lib/seo'
import { focusRing } from '@/components/ui'

/**
 * /about (audit check PR-05): who writes the site, how its material is made and
 * credited, and how to report a problem. The counts come from the Learn manifest, so
 * they match what the site publishes.
 */

export const metadata: Metadata = pageMetadata({
  path: '/about',
  title: 'About',
  description: `Who writes Forward Deployed, how its lessons, worked designs and worksheets are made and credited, and how to report a problem.`,
})

const link = `rounded-sm text-accent underline underline-offset-2 hover:text-accent-hover ${focusRing}`

export default function AboutPage() {
  const lessons = getLearnManifest().filter((l) => l.kind === 'sync')
  const credited = lessons.filter((l) => l.publish === 'credited').length

  return (
    <div className="py-8 sm:py-10">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-[-0.02em]">About</h1>
        <p className="mt-3 text-base text-muted">
          Forward Deployed is written and maintained by {AUTHOR}. It brings preparation for Forward Deployed Engineer
          interviews into one place: the concepts, the worked system designs, timed practice and a review for the final
          week.
        </p>
      </header>

      <div className="max-w-3xl space-y-8 text-[0.9375rem] leading-relaxed text-muted">
        <section aria-labelledby="how-made">
          <h2 id="how-made" className="text-lg font-semibold text-text">
            How the Material Is Made
          </h2>
          <p className="mt-2">
            The site has {lessons.length} lessons. {lessons.length - credited} are written for this site. The other{' '}
            {credited} draw on books, guides and courses by other authors, summarised in our own words, and each one
            names its source in a credit line under the title.{' '}
            <Link href="/library/credits" className={link}>
              Credits
            </Link>{' '}
            lists every source and the lessons that use it.
          </p>
          <p className="mt-3">
            The worked designs and practice worksheets are written for the site. Most designs end with the sources
            their product facts and published results were checked against. Every lesson, design and worksheet shows
            when its material last changed.
          </p>
        </section>

        <section aria-labelledby="privacy">
          <h2 id="privacy" className="text-lg font-semibold text-text">
            Your Data
          </h2>
          <p className="mt-2">
            There are no accounts and no analytics. Your answers and progress are stored in this browser only; you can
            export, import or reset them in{' '}
            <Link href="/settings" className={link}>
              Settings
            </Link>
            .
          </p>
        </section>

        <section aria-labelledby="report">
          <h2 id="report" className="text-lg font-semibold text-text">
            Report a Problem
          </h2>
          <p className="mt-2">
            Every lesson, design and worksheet has a Report an issue link under its title, which opens an email that
            names the page. For anything else,{' '}
            <a href={reportHref({ title: 'About', path: '/about' })} className={link}>
              report an issue
            </a>{' '}
            here. Changes to the site are listed in the{' '}
            <Link href="/changelog" className={link}>
              changelog
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
