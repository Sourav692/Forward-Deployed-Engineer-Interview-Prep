import { AUTHOR, formatDate } from '@/lib/editorial'

/**
 * The line under a page's H1 that says who wrote it and when its sources last changed
 * (audit check PQ-15). The date comes from git at sync time; with no date, the line
 * names the author alone. Final-week pages show the date only (`author={false}`).
 */
export function Byline({ updated, author = true, className }: { updated?: string | null; author?: boolean; className?: string }) {
  const parts = [author && `By ${AUTHOR}`, updated && `Last updated ${formatDate(updated)}`].filter(Boolean)
  if (parts.length === 0) return null
  return <p className={className ?? 'mt-2 text-sm text-muted'}>{parts.join(' · ')}</p>
}
