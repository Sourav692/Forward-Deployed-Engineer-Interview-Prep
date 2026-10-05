import type { NextConfig } from 'next'
import { MODULES, RENAMED } from './src/lib/curriculum.ts'

/**
 * Security headers (plan §12, SEC-02).
 *
 * Content Security Policy trade-off: every statically rendered App Router page carries
 * dozens of inline `self.__next_f.push(...)` scripts (the React Server Components payload),
 * and their content differs page by page. A hash list cannot cover them, and nonces need
 * a per-request render, which would turn every static page dynamic (Next.js CSP guide,
 * "Static vs Dynamic Rendering with CSP"). So `script-src` keeps `'unsafe-inline'`, which
 * also covers the inline theme scripts in the root layouts. Adding their hashes would make
 * browsers ignore `'unsafe-inline'` and block the RSC payload, so none are listed.
 *
 * Everything else is locked down: no third-party origins, no plugins, no framing, no
 * `<base>` hijacking, forms and fetches to this origin only. Mermaid renders without
 * `'unsafe-eval'`; it does inject `<style>` into its SVGs, hence `style-src 'unsafe-inline'`.
 * Development adds `'unsafe-eval'` for React's dev tooling only.
 */
const isDev = process.env.NODE_ENV === 'development'

const csp = (extra: { style?: string; font?: string } = {}) =>
  [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'unsafe-inline'${extra.style ? ` ${extra.style}` : ''}`,
    "img-src 'self' data:",
    `font-src 'self'${extra.font ? ` ${extra.font}` : ''}`,
    "connect-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

/**
 * Lesson URLs retired by a consolidation, derived from RENAMED in src/lib/curriculum.ts
 * (one file per track in src/lib/consolidation/). A retired lesson redirects to the
 * lesson that now teaches it, or to its module page when it was withdrawn (`null`).
 */
function lessonRedirects(): [string, string][] {
  const trackOf = new Map(MODULES.map((m) => [m.slug, m.track]))
  const href = (key: string) => {
    const [mod, lesson] = key.split('/')
    const track = trackOf.get(mod)
    if (!track) throw new Error(`RENAMED key "${key}" names an unknown module`)
    return lesson ? `/learn/${track}/${mod}/${lesson}` : `/learn/${track}/${mod}`
  }
  return Object.entries(RENAMED).map(([from, to]) => [href(from), href(to ?? from.split('/')[0])])
}

const nextConfig: NextConfig = {
  async redirects() {
    return lessonRedirects().map(([source, destination]) => ({ source, destination, permanent: true }))
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp() },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // The static Last-Day Review pages under public/ load their typefaces from Google
        // Fonts. Later rules override earlier ones for the same header key.
        source: '/fde-last-day-prep/:dir/:file(.*\\.html)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp({ style: 'https://fonts.googleapis.com', font: 'https://fonts.gstatic.com' }),
          },
        ],
      },
    ]
  },
}

export default nextConfig
