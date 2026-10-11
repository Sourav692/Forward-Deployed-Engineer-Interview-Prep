import Link from 'next/link'

export type Neighbour = { href: string; title: string }

/**
 * Previous and next in a sequence (ENH-22, PQ-05): worksheets, cases, module pages and
 * the Story Bank. A sequence end shows the one link it has.
 */
export function PrevNext({ prev, next }: { prev?: Neighbour | null; next?: Neighbour | null }) {
  if (!prev && !next) return null
  return (
    <nav aria-label="Previous and next" className="no-print mt-16 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
      {prev ? (
        <Link href={prev.href} rel="prev" className="group rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong">
          <div className="mb-1 text-[0.75rem] text-subtle">← Previous</div>
          <div className="text-[0.9375rem] font-medium group-hover:text-accent">{prev.title}</div>
        </Link>
      ) : (
        <div />
      )}
      {next && (
        <Link
          href={next.href}
          rel="next"
          className="group rounded-lg border border-border bg-surface p-4 text-right transition-colors hover:border-border-strong sm:col-start-2"
        >
          <div className="mb-1 text-[0.75rem] text-subtle">Next →</div>
          <div className="text-[0.9375rem] font-medium group-hover:text-accent">{next.title}</div>
        </Link>
      )}
    </nav>
  )
}
