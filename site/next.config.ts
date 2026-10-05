import type { NextConfig } from 'next'

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
 * Lesson URLs retired by a consolidation. Each maps to the lesson that now teaches
 * the same material, mirroring the RENAMED entries in src/lib/curriculum.ts.
 */
const MEMORY = '/learn/agentic-systems/memory-and-state'
const LESSON_REDIRECTS: [string, string][] = [
  [`${MEMORY}/state-memory-sessions`, `${MEMORY}/why-agents-need-state`],
  [`${MEMORY}/memory-and-state-interview-tutorial`, `${MEMORY}/short-term-memory-and-the-context-window`],
  [`${MEMORY}/ch07-knowledge-memory-retrieval`, `${MEMORY}/long-term-memory-write-retrieve-forget`],
  [
    `${MEMORY}/module-09-memory-databases-caching-for-genai-systems`,
    '/learn/llm-and-retrieval/chunking-and-indexing/module-09-memory-databases-caching-for-genai-systems',
  ],
]

const nextConfig: NextConfig = {
  async redirects() {
    return LESSON_REDIRECTS.map(([source, destination]) => ({ source, destination, permanent: true }))
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
