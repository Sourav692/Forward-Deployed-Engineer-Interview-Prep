'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { NAV, UTILITY_NAV } from '@/lib/editorial'
import { SITE } from '@/lib/registry'
import { cx } from '@/components/ui/cx'
import { Icon } from './Icon'
import { isActive, type IconName } from './nav'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Menu button plus slide-over panel for screens below 1024 px.
 *
 * The panel is a native `<dialog>` opened with `showModal()`: the browser makes the
 * rest of the page inert and turns Escape into a `close`. On top of that the panel
 * keeps Tab inside itself, locks page scroll while open, and hands focus back to the
 * menu button when it closes.
 */
export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Close on navigation. Adjusting state during render (not in an effect) is React's
  // recommended way to reset state when a value it depends on changes.
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
    if (!open) return

    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'

    function trapTab(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !dialog) return
      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    dialog.addEventListener('keydown', trapTab)
    return () => {
      dialog.removeEventListener('keydown', trapTab)
      root.style.overflow = previous
    }
  }, [open])

  function handleClose() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen(true)}
        className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-text lg:hidden"
      >
        <Icon name="menu" />
      </button>

      <dialog
        ref={dialogRef}
        id="site-menu"
        aria-label="Menu"
        onClose={handleClose}
        // A click on the dialog element itself (not its contents) is a click on the backdrop.
        onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
        className="shell-chrome shell-drawer fixed inset-y-0 left-0 m-0 h-full max-h-none w-[min(20rem,85vw)] max-w-none overflow-y-auto border-r border-border bg-surface p-0 text-text"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="font-semibold">{SITE.name}</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => dialogRef.current?.close()}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            <Icon name="close" />
          </button>
        </div>
        <nav aria-label="Primary" className="flex flex-col gap-0.5 p-2">
          {NAV.map((item) => (
            <MenuLink key={item.id} href={item.href} icon={item.id} current={isActive(pathname, item.match)} onPick={() => dialogRef.current?.close()}>
              {item.label}
            </MenuLink>
          ))}
        </nav>
        <hr className="mx-4 border-border" />
        <nav aria-label="Utility" className="flex flex-col gap-0.5 p-2">
          {UTILITY_NAV.map((item) => (
            <MenuLink key={item.id} href={item.href} icon={item.id} current={isActive(pathname, item.match)} onPick={() => dialogRef.current?.close()}>
              {item.label}
            </MenuLink>
          ))}
        </nav>
      </dialog>
    </>
  )
}

function MenuLink({
  href,
  icon,
  current,
  onPick,
  children,
}: {
  href: string
  icon: IconName
  current: boolean
  onPick: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={current ? 'page' : undefined}
      // Same-page links do not change the pathname, so close explicitly.
      onClick={onPick}
      className={cx(
        'flex min-h-11 items-center gap-3 rounded-md px-3 text-[0.9375rem] transition-colors',
        current ? 'bg-accent-soft font-semibold text-accent' : 'text-text hover:bg-surface-2',
      )}
    >
      <Icon name={icon} className={current ? undefined : 'text-muted'} />
      {children}
    </Link>
  )
}
