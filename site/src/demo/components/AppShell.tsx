'use client'

/**
 * The prototype's app shell: top bar with the six areas and utility links, a
 * slide-over menu and bottom bar on small screens, the profile menu, and the
 * storage-blocked notice. It is a client component because it reads the pathname (for
 * the active area) and the mock session; the pages inside stay Server Components.
 */
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { THEME_KEY } from '../store/persist'
import { signOutDemo, useDemo } from '../store/useDemo'
import { hasUnsavedNotes } from '../store/unsaved'
import { SearchDialog } from './SearchDialog'
import { ConfirmDialog, Toaster, toast } from './feedback'
import { btn, cx } from './ui'
import { AREAS } from '../nav'



const UTILITY = [
  { href: '/demo/glossary', label: 'Glossary' },
  { href: '/demo/library', label: 'Library' },
]

const BOTTOM = ['/demo/learn', '/demo/practice', '/demo/interview', '/demo/progress']

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cx('h-5 w-5', className)} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const { ready, storageOk } = useDemo()

  // Close the slide-over whenever navigation happens.
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setMenuOpen(false)
  }

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-[3.75rem] max-w-7xl items-center gap-3 px-4 sm:px-6">
          <button type="button" className={cx(btn.ghost, 'px-2 md:hidden')} aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
            <Icon d="M4 7h16M4 12h16M4 17h16" />
          </button>
          <Link href="/demo" className="flex items-center gap-2 font-semibold tracking-[-0.011em]" aria-label="Forward Deployed prototype home">
            <Logo />
            <span className="hidden sm:inline md:hidden xl:inline">Forward Deployed</span>
            <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-subtle">Prototype</span>
          </Link>
          <nav aria-label="Areas" className="ml-1 hidden items-center gap-0.5 md:flex lg:ml-3">
            {AREAS.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                aria-current={isActive(pathname, a.href) ? 'page' : undefined}
                className={cx(
                  'rounded-md px-2.5 py-1.5 text-[0.875rem] transition-colors',
                  isActive(pathname, a.href) ? 'bg-accent-soft font-semibold text-accent' : 'text-muted hover:bg-surface-2 hover:text-text',
                )}
              >
                {a.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <nav aria-label="Utility" className="hidden items-center lg:flex">
              {UTILITY.map((u) => (
                <Link key={u.href} href={u.href} className={cx(btn.ghost, 'text-[0.8125rem]', isActive(pathname, u.href) && 'text-text')}>
                  {u.label}
                </Link>
              ))}
            </nav>
            <SearchDialog />
            <ThemeToggle storageKey={THEME_KEY} />
            <ProfileMenu />
          </div>
        </div>
        {ready && !storageOk && (
          <div role="status" className="border-t border-warning/50 bg-warning-soft px-4 py-1.5 text-center text-[0.8125rem]">
            Progress won’t be saved in this browser: storage is blocked. Everything still works until you close the tab.
          </div>
        )}
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} pathname={pathname} />

      <main id="main" className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 md:pb-16 md:pt-8">
        {children}
      </main>

      <footer className="hidden border-t border-border md:block">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-x-4 gap-y-1 px-6 py-6 text-[0.8125rem] text-subtle">
          <span>Forward Deployed prototype. All content is sample content.</span>
          <span>Demo progress is stored in this browser under its own keys.</span>
          <Link href="/" className="ml-auto underline underline-offset-2 hover:text-text">
            Back to the live site
          </Link>
        </div>
      </footer>

      <nav aria-label="Quick areas" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        {AREAS.filter((a) => BOTTOM.includes(a.href)).map((a) => (
          <Link
            key={a.href}
            href={a.href}
            aria-current={isActive(pathname, a.href) ? 'page' : undefined}
            className={cx('flex flex-col items-center gap-0.5 py-2 text-[0.6875rem]', isActive(pathname, a.href) ? 'font-semibold text-accent' : 'text-muted')}
          >
            <Icon d={a.icon} />
            {a.label}
          </Link>
        ))}
        <button type="button" onClick={() => setMenuOpen(true)} className="flex flex-col items-center gap-0.5 py-2 text-[0.6875rem] text-muted">
          <Icon d="M5 12h.01M12 12h.01M19 12h.01" />
          More
        </button>
      </nav>
      <Toaster />
    </>
  )
}

function MobileMenu({ open, onClose, pathname }: { open: boolean; onClose: () => void; pathname: string }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label="Menu"
      className="fixed inset-y-0 left-0 m-0 h-full max-h-none w-[min(20rem,85vw)] border-r border-border bg-surface p-0 text-text backdrop:bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="font-semibold">Forward Deployed</span>
        <button type="button" className={btn.ghost} onClick={onClose} aria-label="Close menu">
          <Icon d="M6 6l12 12M18 6L6 18" />
        </button>
      </div>
      <nav aria-label="Areas" className="flex flex-col p-2">
        {AREAS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            aria-current={isActive(pathname, a.href) ? 'page' : undefined}
            className={cx('flex items-center gap-3 rounded-md px-3 py-2.5 text-[0.9375rem]', isActive(pathname, a.href) ? 'bg-accent-soft font-semibold text-accent' : 'hover:bg-surface-2')}
          >
            <Icon d={a.icon} />
            {a.label}
          </Link>
        ))}
        <hr className="my-2 border-border" />
        {UTILITY.map((u) => (
          <Link key={u.href} href={u.href} className="rounded-md px-3 py-2 text-[0.9375rem] text-muted hover:bg-surface-2">
            {u.label}
          </Link>
        ))}
        <Link href="/" className="rounded-md px-3 py-2 text-[0.9375rem] text-muted hover:bg-surface-2">
          Back to the live site
        </Link>
      </nav>
    </dialog>
  )
}

function ProfileMenu() {
  const { ready, signedIn, state } = useDemo()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!ready) return <span className="h-8 w-8 animate-pulse rounded-full bg-surface-2" aria-hidden />
  if (!signedIn || !state)
    return (
      <Link href="/demo/sign-in" className={cx(btn.secondary, 'px-3 py-1.5 text-[0.8125rem]')}>
        Sign in
      </Link>
    )

  const doSignOut = () => {
    setConfirm(false)
    setOpen(false)
    signOutDemo()
    toast('Signed out of the demo.', 'info')
    router.push('/demo')
  }
  const initials = state.user.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${state.user.name}`}
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[0.75rem] font-semibold text-white dark:text-bg"
      >
        {initials}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-10 z-40 w-56 rounded-lg border border-border bg-surface p-1 shadow-[var(--shadow-lg)]">
          <div className="border-b border-border px-3 py-2">
            <div className="truncate text-[0.875rem] font-semibold">{state.user.name}</div>
            <div className="truncate text-[0.75rem] text-subtle">{state.user.isDemo ? 'Demo account' : state.user.email}</div>
          </div>
          {[
            ['/demo/progress', 'Dashboard'],
            ['/demo/profile', 'Profile'],
            ['/demo/settings', 'Settings'],
          ].map(([href, label]) => (
            <Link key={href} role="menuitem" href={href} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-[0.875rem] hover:bg-surface-2">
              {label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={() => (hasUnsavedNotes() ? setConfirm(true) : doSignOut())}
            className="block w-full rounded-md px-3 py-2 text-left text-[0.875rem] text-danger hover:bg-surface-2"
          >
            Sign out
          </button>
        </div>
      )}
      <ConfirmDialog
        open={confirm}
        title="Sign out with unsaved notes?"
        body="You have a note that has not been saved. Signing out now discards it."
        confirmLabel="Sign out anyway"
        danger
        onConfirm={doSignOut}
        onCancel={() => setConfirm(false)}
      />
    </div>
  )
}

function Logo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-[1.375rem] w-[1.375rem] text-accent">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="currentColor" opacity="0.12" />
      <path d="M7 15.5L11 8l4 7.5M8.6 13h4.8" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="17" cy="8" r="1.6" fill="currentColor" />
    </svg>
  )
}
