import type { ReactNode } from 'react'
import { AUTHOR, formatDate, reportHref } from '@/lib/editorial'
import { TwinLinks } from '@/components/PageIntro'
import type { TwinLink } from '@/lib/twins'

export type PageFact = { term: string; value: ReactNode }

/**
 * The head of a casebook, practice or interview page (Hallmark, Editorial theme): the area as the
 * one green tag, the title as a condensed head, an optional standfirst, then the facts
 * as a ruled spec line with the author and last-updated date, never a dot-joined meta
 * string. `children` (Before you start, a note, a status badge) sit under the report link.
 * Styles are in editorial.css (`cb-case-head`, `cb-facts`, `cb-tag`).
 */
export function PageHead({
  tag,
  title,
  standfirst,
  facts,
  updated,
  twins = [],
  report,
  children,
}: {
  tag?: string
  title: string
  standfirst?: ReactNode
  facts: PageFact[]
  updated?: string | null
  twins?: TwinLink[]
  /** The page the report is about: its title and path go in the email subject. Index pages have none. */
  report?: { title: string; path: string }
  children?: ReactNode
}) {
  const all: PageFact[] = [
    ...facts,
    { term: 'By', value: AUTHOR },
    ...(updated ? [{ term: 'Last updated', value: formatDate(updated) }] : []),
  ]
  return (
    <header className="cb-case-head">
      {tag && <span className="cb-tag">{tag}</span>}
      <h1 className={tag ? 'mt-4' : undefined}>{title}</h1>
      {standfirst && <p className="cb-purpose-text mt-4 max-w-[40rem]">{standfirst}</p>}
      <dl className="cb-facts">
        {all.map((f) => (
          <div key={f.term}>
            <dt>{f.term}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
      <TwinLinks links={twins} />
      {report && (
        <p className="cb-label mt-3 text-[0.875rem]">
          <a href={reportHref(report)} className="underline">
            Report an issue
          </a>
        </p>
      )}
      {children}
    </header>
  )
}
