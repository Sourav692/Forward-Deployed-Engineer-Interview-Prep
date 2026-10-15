import type { Metadata } from 'next'
import { LinkButton } from '@/components/ui'
import { LinkList } from '@/components/areas/Area'

/**
 * 404 for the site (FE-14). It sits next to the root layout, so Next prerenders it at
 * build time as `/_not-found` inside the site shell and serves that HTML, with a 404
 * status, for every unmatched URL and every unknown param (each dynamic route sets
 * `dynamicParams = false`). The served HTML therefore holds the heading and links
 * before any JavaScript runs (audit check PR-21).
 *
 * A `notFound()` thrown while a page renders on demand would instead send Next's
 * client-rendered error document (`<html id="__next_error__">`): React error
 * boundaries do not run during server rendering. No route renders on demand today.
 */

export const metadata: Metadata = {
  title: 'Page Not Found',
}

const AREAS = [
  { href: '/learn', title: 'Learn', note: 'The curriculum, by track and module.' },
  { href: '/design', title: 'Casebook', note: 'The casebook of worked system designs.' },
  { href: '/practice', title: 'Practice', note: 'Worksheets, behavioural questions and mocks.' },
  { href: '/interview', title: 'Interview', note: 'Final-week review and company prep.' },
]

export default function NotFound() {
  return (
    <div className="py-16 sm:py-24">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-subtle">Error 404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">Page Not Found</h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          That address does not match a page. It may have been mistyped, or the page may have moved. Search the whole
          site with{' '}
          <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[0.8125rem] text-text">
            ⌘K
          </kbd>{' '}
          (Ctrl K on Windows and Linux), or use the search button in the header.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <LinkButton href="/learn">Browse the curriculum</LinkButton>
          <LinkButton href="/start" variant="secondary">
            Pick a path
          </LinkButton>
          <LinkButton href="/" variant="ghost">
            Home
          </LinkButton>
        </div>
      </div>
      <h2 className="mt-12 text-base font-semibold">Or go to an area</h2>
      <div className="mt-3 -mx-2 max-w-3xl">
        <LinkList items={AREAS} />
      </div>
    </div>
  )
}
