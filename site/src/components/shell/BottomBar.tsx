'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV, UTILITY_NAV } from '@/lib/editorial'
import { cx } from '@/components/ui/cx'
import { Icon } from './Icon'
import { isActive, OPEN_SEARCH_EVENT } from './nav'

/** Areas in the bottom bar, in order, then Progress (FE-16). */
const BOTTOM_IDS = ['learn', 'practice', 'interview'] as const
const BOTTOM = [
  ...BOTTOM_IDS.map((id) => NAV.find((item) => item.id === id)!),
  UTILITY_NAV.find((item) => item.id === 'progress')!,
]

const ITEM =
  'flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[0.6875rem] transition-colors'

/**
 * Fixed bar of quick links for screens below 768 px. The layout pads `<body>` by the
 * bar's height at the same breakpoint, so the bar never covers page content.
 */
export function BottomBar() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Quick links"
      className="shell-chrome no-print fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      {BOTTOM.map((item) => {
        const current = isActive(pathname, item.match)
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={current ? 'page' : undefined}
            className={cx(ITEM, current ? 'font-semibold text-accent' : 'text-muted hover:text-text')}
          >
            <Icon name={item.id} />
            {item.label}
          </Link>
        )
      })}
      <button
        type="button"
        aria-keyshortcuts="Meta+K Control+K"
        onClick={() => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT))}
        className={cx(ITEM, 'text-muted hover:text-text')}
      >
        <Icon name="search" />
        Search
      </button>
    </nav>
  )
}
