import type { NextConfig } from 'next'
import { MODULES, RENAMED, RETIRED_MODULES } from './src/lib/curriculum.ts'
import { AREA_TRACKS, curriculumHref } from './src/lib/curriculum-href.ts'

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
  const resolveKey = (key: string) => {
    const [mod, lesson] = key.split('/')
    const track = trackOf.get(mod)
    if (!track) throw new Error(`RENAMED key "${key}" names an unknown module`)
    return { track, mod, lesson }
  }
  const out: [string, string][] = []
  for (const [from, to] of Object.entries(RENAMED)) {
    // A retired module's lessons go with it; retiredModuleRedirects sends the module on.
    if (from.split('/')[0] in RETIRED_MODULES) continue
    const src = resolveKey(from)
    const dst = resolveKey(to ?? from.split('/')[0])
    const destination = curriculumHref(dst.track, dst.mod, dst.lesson)
    out.push([curriculumHref(src.track, src.mod, src.lesson), destination])
    // A track that moved out of /learn keeps its old /learn URL, sent straight to the
    // final page so the redirect never chains through the area rule below.
    if (src.track in AREA_TRACKS) {
      out.push([[`/learn/${src.track}`, src.mod, src.lesson].filter(Boolean).join('/'), destination])
    }
  }
  return out
}

/**
 * Tracks served by their own area (src/lib/curriculum-href.ts) used to live under
 * /learn/<track>. Their old URLs redirect to the area, keeping the module and lesson.
 * The bare track URL gets its own rule: `:path*` matching nothing would leave a
 * trailing slash (`/interview/`) and cost a second redirect.
 */
const areaRedirects = () =>
  Object.entries(AREA_TRACKS).flatMap(([track, base]) => [
    { source: `/learn/${track}`, destination: base, permanent: true },
    { source: `/learn/${track}/:path+`, destination: `${base}/:path+`, permanent: true },
  ])

/**
 * Company-oriented prep (module 16) is unpublished while its packs move to the Company
 * Prep area. Temporary (307), because the module URLs may come back.
 */
const companyPrepRedirects = [
  { source: '/modules/16-company-oriented-prep', destination: '/company-prep', permanent: false },
  { source: '/modules/16-company-oriented-prep/:path*', destination: '/company-prep', permanent: false },
]

/** Removed modules (RETIRED_MODULES in curriculum.ts) redirect to the module that took them over. */
const retiredModuleRedirects = () => {
  const trackOf = new Map(MODULES.map((m) => [m.slug, m.track]))
  return Object.entries(RETIRED_MODULES).map(([from, to]) => ({
    source: curriculumHref(trackOf.get(to)!, from),
    destination: curriculumHref(trackOf.get(to)!, to),
    permanent: true,
  }))
}

/**
 * The leadership-principle and hiring-manager worksheets were merged into the FDE
 * competency worksheets (T7.2, The behavioural round). Each old worksheet goes to the new
 * one that holds most of its questions.
 */
const BEHAVIOURAL_MODULE = '/modules/14-behavioural-and-leadership-round'
const RETIRED_BEHAVIOURAL_WORKSHEETS: Record<string, string> = {
  'hiring-manager/ambiguity-and-discovery': 'customer-focus-and-discovery',
  'hiring-manager/delivery-under-pressure': 'delivery-under-pressure',
  'hiring-manager/pushback-and-saying-no': 'pushback-and-saying-no',
  'hiring-manager/scale-beyond-self': 'scale-beyond-yourself',
  'hiring-manager/stakeholder-influence': 'communication-and-influence',
  'leadership-principles/attracts-and-retains-talent': 'leading-people',
  'leadership-principles/communicates-with-clarity': 'communication-and-influence',
  'leadership-principles/creates-a-culture-of-accountability': 'leading-people',
  'leadership-principles/customer-obsession': 'customer-focus-and-discovery',
  'leadership-principles/develops-people': 'leading-people',
  'leadership-principles/embraces-adversity': 'ownership-standards-and-failure',
  'leadership-principles/engenders-trust': 'communication-and-influence',
  'leadership-principles/focuses-on-outcomes': 'ownership-standards-and-failure',
  'leadership-principles/makes-good-decisions-quickly': 'delivery-under-pressure',
  'leadership-principles/never-stops-learning-and-growing': 'ownership-standards-and-failure',
  'leadership-principles/ownership': 'ownership-standards-and-failure',
  'leadership-principles/resourceful': 'scale-beyond-yourself',
  'leadership-principles/sets-high-standards': 'ownership-standards-and-failure',
  'leadership-principles/staff-level-and-cross-cutting': 'scale-beyond-yourself',
}

const behaviouralRedirects = Object.entries(RETIRED_BEHAVIOURAL_WORKSHEETS).map(([from, to]) => ({
  source: `${BEHAVIOURAL_MODULE}/${from}`,
  destination: `${BEHAVIOURAL_MODULE}/fde-competencies/${to}`,
  permanent: true,
}))

const nextConfig: NextConfig = {
  async redirects() {
    return [
      ...lessonRedirects().map(([source, destination]) => ({ source, destination, permanent: true })),
      ...areaRedirects(),
      ...companyPrepRedirects,
      ...retiredModuleRedirects(),
      ...behaviouralRedirects,
      // Hubs have no index page of their own: /interview lists them (FE-18).
      { source: '/interview/hubs', destination: '/interview', permanent: false },
    ]
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
