import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { SITE } from '@/lib/registry'
import { SearchDialog } from '@/components/SearchDialog'
import { ThemeToggle } from '@/components/ThemeToggle'
import { BottomBar } from '@/components/shell/BottomBar'
import { Logo } from '@/components/shell/Logo'
import { MobileNav } from '@/components/shell/MobileNav'
import { TopNav } from '@/components/shell/TopNav'
import '../globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    type: 'website',
  },
}

/**
 * Applies the stored theme before first paint. Inline and synchronous on purpose:
 * anything async here means a flash of the wrong theme on every load.
 */
const THEME_SCRIPT = `
try {
  var stored = localStorage.getItem('fd:v1:theme');
  var dark = stored ? stored === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (dark) document.documentElement.classList.add('dark');
} catch (e) {}
`

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      {/* Below 768 px the bottom bar is fixed over the viewport; this padding keeps the
          end of every page clear of it. */}
      <body
        className={`${inter.variable} min-h-screen pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0`}
      >
        <a
          href="#main"
          className="shell-chrome no-print sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-surface"
        >
          Skip to content
        </a>

        {/* The layout stays a Server Component. Only TopNav, MobileNav, BottomBar,
            SearchDialog and ThemeToggle are Client Components ('use client'). */}
        <header className="shell-chrome no-print sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur-md">
          <div className="mx-auto flex h-[3.75rem] max-w-5xl items-center gap-2 px-4 sm:px-6 lg:gap-4">
            <MobileNav />
            <Logo />
            <TopNav />
            <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
              <SearchDialog />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main id="main" className="mx-auto max-w-5xl px-4 sm:px-6">
          {children}
        </main>

        <footer className="shell-chrome no-print mt-24 border-t border-border">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-[0.8125rem] text-subtle sm:flex-row sm:items-center sm:px-6">
            <p>
              {SITE.name} — {SITE.tagline}
            </p>
            <p className="sm:ml-auto">
              Your answers are stored in this browser only.{' '}
              <Link href="/guide" className="text-muted underline underline-offset-2 hover:text-text">
                How this works
              </Link>
              {' · '}
              <Link href="/glossary" className="text-muted underline underline-offset-2 hover:text-text">
                Glossary
              </Link>
            </p>
          </div>
        </footer>

        <BottomBar />
      </body>
    </html>
  )
}
