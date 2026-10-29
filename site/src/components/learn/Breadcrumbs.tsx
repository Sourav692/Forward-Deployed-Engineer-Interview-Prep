import Link from 'next/link'
import { cx } from '@/components/ui'

export type Crumb = { label: string; href?: string }

/**
 * Breadcrumbs (FE-03, rules in .website_spec/reference/2026-10-05-learn-ux.md): Learn › Track ›
 * Section › Module › Lesson. The last crumb is the current page (`aria-current`).
 *
 * Under 640 px (a 375 px phone) the middle crumbs collapse to "…" and every label
 * truncates with an ellipsis, so the trail stays on one line. The first crumb and
 * the immediate parent always stay visible, so "up one level" is one tap away.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const last = items.length - 1
  // Indexes that hide on small screens: everything between the first crumb and the parent.
  const collapsible = (i: number) => i > 0 && i < last - 1
  const anyCollapsed = items.some((_, i) => collapsible(i))

  return (
    <nav aria-label="Breadcrumb" className="no-print mb-6 text-[0.8125rem] text-subtle">
      <ol className="flex min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap">
        {items.map((item, i) => (
          <li
            key={i}
            className={cx(
              'flex items-center gap-1.5',
              // Ancestors keep their (capped) width; only the current page gives way.
              i === last ? 'min-w-0' : 'shrink-0',
              collapsible(i) && 'hidden sm:flex',
            )}
          >
            {i > 0 && <Separator />}
            {i === last ? (
              <span aria-current="page" className="truncate font-medium text-muted">
                {item.label}
              </span>
            ) : item.href ? (
              <Link href={item.href} className="max-w-[10rem] truncate transition-colors hover:text-text sm:max-w-[14rem]">
                {item.label}
              </Link>
            ) : (
              <span className="max-w-[10rem] truncate sm:max-w-[14rem]">{item.label}</span>
            )}
            {i === 0 && anyCollapsed && (
              <span className="flex items-center gap-1.5 sm:hidden" aria-hidden="true">
                <Separator />…
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

function Separator() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" className="size-3 shrink-0 text-subtle">
      <path d="M6 3.5L10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
