import type { NextConfig } from 'next'
import { REDIRECTS } from './src/lib/redirects.ts'

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

const CSP =
  [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

/**
 * The RAG course labs (Phase 2, SEC-01) are static pages under /labs that lessons frame. They
 * may be framed by this origin only and make no requests (the theory import fails on any), and
 * lessons frame them with `sandbox="allow-scripts"`, so they cannot reach this origin's storage.
 * Lessons need no change: `default-src 'self'` already lets them frame same-origin pages.
 */
const LAB_CSP = CSP.replace("frame-ancestors 'none'", "frame-ancestors 'self'").replace("connect-src 'self'", "connect-src 'none'")

const nextConfig: NextConfig = {
  async redirects() {
    return REDIRECTS
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: CSP },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // Later rules win for the same header key, so these override the CSP above for labs.
      {
        source: '/labs/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: LAB_CSP },
          { key: 'X-Robots-Tag', value: 'noindex' },
        ],
      },
      { source: '/learn-assets/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex' }] },
    ]
  },
}

export default nextConfig
