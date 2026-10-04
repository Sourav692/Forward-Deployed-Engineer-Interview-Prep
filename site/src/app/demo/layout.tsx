import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AppShell } from '@/demo/components/AppShell'
import '../globals.css'

/**
 * Root layout for the /demo prototype.
 *
 * Next 16: the live site's layout now lives in the `(site)` route group, so this file
 * is a second *root* layout with its own <html> and <body>. That keeps the live header
 * and footer off the prototype without touching them. Moving between the two trees
 * does a full page load, which is fine for a separate prototype.
 */
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'Forward Deployed prototype', template: '%s · Forward Deployed prototype' },
  description: 'Clickable prototype of the Forward Deployed learning platform, with sample content.',
  robots: { index: false, follow: false },
}

/** Applies the demo's stored theme before first paint; same approach as the live site. */
const THEME_SCRIPT = `
try {
  var stored = localStorage.getItem('fd:demo:v1:theme');
  var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (dark) document.documentElement.classList.add('dark');
} catch (e) {}
`

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className={`${inter.variable} min-h-screen overflow-x-hidden`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
