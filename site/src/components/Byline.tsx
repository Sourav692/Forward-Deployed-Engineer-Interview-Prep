import { AUTHOR, formatDate, reportHref } from '@/lib/editorial'

/**
 * The line under a page's H1: who wrote it, when its sources last changed (audit check
 * PQ-15) and a link to report a problem with it (PR-15). The date comes from git at
 * sync time; final-week pages show no author (`author={false}`).
 */
export function Byline({
  updated,
  report,
  author = true,
}: {
  updated?: string | null
  /** The page the report is about: its title and path go in the email subject. */
  report: { title: string; path: string }
  author?: boolean
}) {
  const parts = [author && `By ${AUTHOR}`, updated && `Last updated ${formatDate(updated)}`].filter(Boolean)
  return (
    <p className="mt-2 text-sm text-muted">
      {parts.length > 0 && `${parts.join(' · ')} · `}
      <a href={reportHref(report)} className="text-accent underline underline-offset-2 hover:text-accent-hover">
        Report an issue
      </a>
    </p>
  )
}
