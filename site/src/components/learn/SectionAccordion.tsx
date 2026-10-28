'use client'

/**
 * SectionAccordion (FE-06): one collapsible track section.
 *
 * Open by default from 768 px, collapsed below (plan §5, track page). Until the reader
 * toggles it, CSS alone decides (`hidden md:block`), so the prerendered HTML is right
 * at every width with no flash. After a toggle, the reader's choice wins at any width.
 * The header is a real `button` with `aria-expanded` and `aria-controls`.
 */
import { useId, useState, useSyncExternalStore, type ReactNode } from 'react'
import { cx, focusRing } from '@/components/ui'

const QUERY = '(min-width: 768px)'

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

export function SectionAccordion({
  id,
  title,
  meta,
  children,
}: {
  /** Anchor id, so breadcrumbs can link to `#<section slug>`. */
  id: string
  title: string
  /** Short line under the title, e.g. "3 modules, 6 h". */
  meta?: ReactNode
  children: ReactNode
}) {
  const panelId = useId()
  const wide = useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => true)
  const [choice, setChoice] = useState<boolean | null>(null)
  const open = choice ?? wide

  return (
    <section id={id} aria-labelledby={`${panelId}-h`} className="scroll-mt-24 rounded-lg border border-border bg-surface">
      <h2 id={`${panelId}-h`} className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setChoice(!open)}
          className={cx('flex w-full items-start gap-3 rounded-lg px-4 py-3 text-left sm:px-5', focusRing)}
        >
          <svg
            viewBox="0 0 16 16"
            width="16"
            height="16"
            aria-hidden="true"
            className={cx(
              'mt-1 size-4 shrink-0 text-subtle',
              // Before a toggle, CSS sets the angle (no animation on hydration); after, state does.
              choice === null ? 'md:rotate-90' : cx('transition-transform duration-150 motion-reduce:transition-none', open && 'rotate-90'),
            )}
          >
            <path d="M6 3.5L10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-semibold">{title}</span>
            {meta && <span className="mt-0.5 block text-xs font-normal text-muted">{meta}</span>}
          </span>
        </button>
      </h2>
      <div
        id={panelId}
        className={cx('border-t border-border px-4 pb-4 pt-3 sm:px-5', choice === null ? 'hidden md:block' : open ? 'block' : 'hidden')}
      >
        {children}
      </div>
    </section>
  )
}
