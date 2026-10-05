import Link from 'next/link'
import type { ReactNode } from 'react'
import { cx, focusRing } from '@/components/ui/cx'

/**
 * Building blocks for the area index pages (`/design`, `/practice`, `/interview`,
 * `/library`) and the landing page (FE-11, FE-13). Server Components with no hooks:
 * the indexes are static and only link into existing pages, so nothing here reads
 * the browser.
 */

/** Page heading for an area index: eyebrow, title and a short lead paragraph. */
export function AreaHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <header className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-subtle">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{title}</h1>
      <div className="mt-3 text-base leading-relaxed text-muted">{children}</div>
    </header>
  )
}

/** One titled block of an area index. `id` makes it linkable (`/practice#mocks`). */
export function AreaSection({
  id,
  title,
  description,
  action,
  children,
}: {
  id: string
  title: string
  description?: ReactNode
  action?: { label: string; href: string }
  children?: ReactNode
}) {
  const headingId = `${id}-heading`
  return (
    <section id={id} aria-labelledby={headingId} className="mt-12 scroll-mt-20">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border pb-3">
        <h2 id={headingId} className="text-xl font-semibold tracking-[-0.014em]">
          {title}
        </h2>
        {action && <TextLink href={action.href}>{action.label}</TextLink>}
      </div>
      {description && <p className="mt-3 max-w-3xl text-[0.9375rem] leading-relaxed text-muted">{description}</p>}
      {children && <div className="mt-5">{children}</div>}
    </section>
  )
}

/** Accent text link with an arrow, for "open the whole thing" actions. */
export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cx('rounded-sm text-sm font-semibold text-accent transition-colors hover:text-accent-hover', focusRing)}
    >
      {children} <span aria-hidden>→</span>
    </Link>
  )
}

export type LinkItem = {
  href: string
  title: string
  /** Short code shown before the title, such as a scenario tag (`G01`). */
  tag?: string
  /** One line under the title. */
  note?: string
}

/**
 * A compact list of links, one line per item. Used for case studies, worksheets and
 * guides, where the list is long and the page behind each link does the explaining.
 */
export function LinkList({ items, columns = 2 }: { items: LinkItem[]; columns?: 1 | 2 }) {
  return (
    <ul className={cx('grid gap-x-6 gap-y-1', columns === 2 && 'sm:grid-cols-2')}>
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className={cx(
              'group flex min-h-11 items-baseline gap-3 rounded-md px-2 py-2 transition-colors hover:bg-surface-2',
              focusRing,
            )}
          >
            {item.tag && (
              <span className="min-w-12 shrink-0 whitespace-nowrap text-xs font-semibold tabular-nums text-subtle">{item.tag}</span>
            )}
            <span className="min-w-0">
              <span className="text-[0.9375rem] font-medium group-hover:text-accent">{item.title}</span>
              {item.note && <span className="mt-0.5 block text-[0.8125rem] leading-snug text-muted">{item.note}</span>}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** A titled sub-group inside an AreaSection, such as one casebook track. */
export function AreaGroup({
  id,
  title,
  blurb,
  action,
  children,
}: {
  id?: string
  title: string
  blurb?: string
  action?: { label: string; href: string }
  children: ReactNode
}) {
  return (
    <div id={id} className="scroll-mt-20 rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="text-base font-semibold">{title}</h3>
        {action && <TextLink href={action.href}>{action.label}</TextLink>}
      </div>
      {blurb && <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted">{blurb}</p>}
      <div className="mt-3 -mx-2">{children}</div>
    </div>
  )
}

/**
 * Items that are planned but have no page yet. Rendered as plain text with a
 * Coming soon pill, never as links, so nothing on an index points at a 404.
 */
export function PlannedList({ items }: { items: { title: string; summary: string }[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.title} className="rounded-lg border border-dashed border-border-strong px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[0.9375rem] font-medium">{item.title}</span>
            <ComingSoonPill />
          </div>
          <p className="mt-1 text-[0.8125rem] leading-snug text-muted">{item.summary}</p>
        </li>
      ))}
    </ul>
  )
}

/** Static Coming soon label. Same look as StatusBadge's gap pill, without the client island. */
export function ComingSoonPill() {
  return (
    <span className="inline-flex items-center rounded-full border border-border-strong px-2 py-0.5 text-xs font-medium text-muted">
      Coming soon
    </span>
  )
}
