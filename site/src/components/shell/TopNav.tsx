'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV, UTILITY_NAV } from '@/lib/editorial'
import { cx } from '@/components/ui/cx'
import { Icon } from './Icon'
import { isActive } from './nav'

/**
 * Desktop navigation (1024 px and up): the areas, then the utility links. To keep the
 * bar inside 1024 px, the utility links are icons until 1280 px (`aria-label` and a
 * tooltip name them), and Settings is left out: /progress links to it and the mobile
 * menu lists it. A Client
 * Component only because `usePathname` (which marks the current area) runs in the
 * browser; it still renders to HTML on the server for the first load.
 */
export function TopNav() {
  const pathname = usePathname()
  return (
    <>
      <nav aria-label="Primary" className="ml-2 hidden items-center gap-0.5 lg:flex">
        {NAV.map((item) => {
          const current = isActive(pathname, item.match)
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={current ? 'page' : undefined}
              className={cx(
                'whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm transition-colors',
                current
                  ? 'bg-accent-soft font-semibold text-accent'
                  : 'text-muted hover:bg-surface-2 hover:text-text',
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
      <nav aria-label="Utility" className="ml-auto hidden items-center gap-0.5 lg:flex">
        {UTILITY_NAV.filter((item) => item.id !== 'settings').map((item) => {
          const current = isActive(pathname, item.match)
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              aria-current={current ? 'page' : undefined}
              className={cx(
                'rounded-md px-2 py-1.5 text-[0.8125rem] transition-colors hover:bg-surface-2 hover:text-text',
                current ? 'font-semibold text-text' : 'text-muted',
              )}
            >
              <Icon name={item.id} className="xl:hidden" />
              <span className="hidden xl:inline">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
