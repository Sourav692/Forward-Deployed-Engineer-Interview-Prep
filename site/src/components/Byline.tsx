import { AUTHOR, formatDate, reportHref } from '@/lib/editorial'

/**
 * The line under a page's H1: who wrote it, when its sources last changed (audit check
 * PQ-15) and a link to report a problem with it (PR-15). The date comes from git at
 * sync time.
 */
export function Byline({
  updated,
  report,
}: {
  updated?: string | null
  /** The page the report is about: its title and path go in the email subject. */
  report: { title: string; path: string }
}) {
  return (
    <p className="mt-2 text-sm text-muted">
      {/* One string, so the served HTML reads "By … · Last updated …" in a single text node. */}
      {[`By ${AUTHOR}`, updated && `Last updated ${formatDate(updated)}`].filter(Boolean).join(' · ')}
      {' · '}
      <a href={reportHref(report)} className="text-accent underline underline-offset-2 hover:text-accent-hover">
        Report an issue
      </a>
    </p>
  )
}
