#!/usr/bin/env node
/**
 * Route audit (QA-03, plan §13). Run against a started build:
 *
 *   npx next start -p 3307 &
 *   BASE_URL=http://localhost:3307 npm run check:routes
 *
 * 1. Fetches `/sitemap.xml` and every URL in it (rewritten onto BASE_URL).
 * 2. Collects every internal link (`href="/..."`) on those pages and fetches each
 *    one it has not already seen. Redirects are not followed: a 3xx counts as
 *    reachable (intentional redirects such as /learn/interview-practice).
 * 3. Fails on any 4xx/5xx or network error, listing the page that linked to it.
 * 4. Fails when a sitemap page lacks exactly one canonical link to itself, an
 *    `og:image`, a favicon or exactly one `<h1>` (audit checks PR-02, PR-03, PR-10),
 *    or when a lesson, case or worksheet lacks its "By … · Last updated …" line (PQ-15),
 *    or one of those content pages lacks a report link (PR-15).
 * 5. Fails when a fixed source in `src/lib/redirects.ts` does not answer with exactly
 *    one 308 (307 when temporary) to its destination, or that destination is not a 200
 *    page (IA-11).
 * 6. Fails when a module marked `ready` or `partly` in `src/lib/curriculum.ts` has
 *    no published or live lesson in `content/learn/manifest.json` (an empty module
 *    would be dressed up as readable), mirroring `readingList()` in `src/lib/learn.ts`.
 *
 * Plain Node 24: the curriculum is imported as TypeScript through type stripping.
 */
import { readFileSync } from 'node:fs'
import { MODULES } from '../src/lib/curriculum.ts'
import { AUTHOR, STORY_BANK } from '../src/lib/editorial.ts'
import { REDIRECTS } from '../src/lib/redirects.ts'
import { scenarioHref } from '../src/lib/scenario.ts'

const BASE = (process.env.BASE_URL ?? 'http://localhost:3307').replace(/\/$/, '')
const CONCURRENCY = 12
const errors = []

// ── 1. Ready modules must have something to read ─────────────────────────────
const manifest = JSON.parse(readFileSync(new URL('../content/learn/manifest.json', import.meta.url), 'utf8'))
const published = new Set(manifest.lessons.map((l) => l.slug))
// Pages that carry the author and date line: synced lessons, cases and worksheets.
const siteManifest = JSON.parse(readFileSync(new URL('../content/manifest.json', import.meta.url), 'utf8'))
const bylined = new Set([
  ...manifest.lessons.filter((l) => l.kind === 'sync').map((l) => l.href),
  ...siteManifest.modules.flatMap((m) => m.tracks.flatMap((t) => t.scenarios.map((sc) => scenarioHref({ moduleId: m.id, trackId: t.id, slug: sc.slug })))),
  STORY_BANK.href,
])
let readable = 0
for (const mod of MODULES) {
  if (mod.status !== 'ready' && mod.status !== 'partly') continue
  readable++
  const count = [...mod.lessons, ...mod.seeAlso].filter((s) => published.has(s)).length
  if (count === 0) errors.push(`module ${mod.slug} is marked ${mod.status} but has no published or live lessons`)
}

// ── 2. Crawl ─────────────────────────────────────────────────────────────────
async function get(path) {
  try {
    const res = await fetch(BASE + path, { redirect: 'manual' })
    const type = res.headers.get('content-type') ?? ''
    const body = res.status < 300 && type.includes('text/html') ? await res.text() : ''
    if (!body) await res.body?.cancel()
    return { status: res.status, body }
  } catch (err) {
    return { status: 0, body: '', error: err.cause?.code ?? err.message }
  }
}

async function pool(items, fn) {
  const queue = [...items]
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length) await fn(queue.shift())
    }),
  )
}

const sitemap = await get('/sitemap.xml')
if (sitemap.status !== 200) {
  console.error(`check-routes: ${BASE}/sitemap.xml returned ${sitemap.status || sitemap.error}. Is \`next start\` running?`)
  process.exit(1)
}
const sitemapXml = await (await fetch(`${BASE}/sitemap.xml`)).text()
const pages = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
if (pages.length === 0) {
  console.error('check-routes: sitemap.xml lists no URLs')
  process.exit(1)
}

const status = new Map() // path → status
const linkedFrom = new Map() // path → first page linking to it

const LINK = /\shref="(\/[^"#?]*)(?:[?#][^"]*)?"/g
const SKIP = /^\/(_next|search)\/|\.(css|js|png|jpe?g|svg|ico|webp|woff2?|json|txt|xml|ipynb|pdf)$/i

function decode(path) {
  try {
    return decodeURI(path.replace(/&amp;/g, '&'))
  } catch {
    return path
  }
}

/** Head tags and headings every public page needs. */
function headProblems(path, html) {
  const problems = []
  const canonical = [...html.matchAll(/<link\b[^>]*\brel="canonical"[^>]*>/g)].map((m) => m[0].match(/\bhref="([^"]*)"/)?.[1] ?? '')
  if (canonical.length !== 1) problems.push(`${canonical.length} canonical links`)
  else if (decode(new URL(canonical[0], BASE).pathname) !== decode(path)) problems.push(`canonical ${canonical[0]} is another page`)
  if (!/<meta\b[^>]*\bproperty="og:image"/.test(html)) problems.push('no og:image')
  if (!/<link\b[^>]*\brel="(?:shortcut )?icon"/.test(html)) problems.push('no favicon')
  const h1 = html.match(/<h1[\s>]/g)?.length ?? 0
  if (h1 !== 1) problems.push(`${h1} <h1> elements`)
  if (bylined.has(path) && !new RegExp(`By ${AUTHOR} · Last updated \\d{1,2} \\w{3} \\d{4}`).test(html)) {
    problems.push('no "By … · Last updated …" line')
  }
  const content = bylined.has(path)
  if (content && !/<a\b[^>]*\bhref="mailto:[^"]*\?subject=[^"]*"[^>]*>Report an issue<\/a>/.test(html)) {
    problems.push('no "Report an issue" link')
  }
  return problems
}

await pool(pages, async (path) => {
  const res = await get(path)
  status.set(path, res.status || res.error)
  if (res.body) for (const p of headProblems(path, res.body)) errors.push(`${path}: ${p}`)
  for (const m of res.body.matchAll(LINK)) {
    const link = decode(m[1])
    if (SKIP.test(link) || link.startsWith('//')) continue
    if (!linkedFrom.has(link)) linkedFrom.set(link, path)
  }
})

const extra = [...linkedFrom.keys()].filter((p) => !status.has(p))
await pool(extra, async (path) => {
  const res = await get(encodeURI(path))
  status.set(path, res.status || res.error)
})

// ── 3. Redirect map (ENH-15, IA-11) ──────────────────────────────────────────
// Every fixed source answers with one redirect (308, or 307 when temporary) straight to
// its destination, and that page answers 200. Pattern sources (`:path*`) have no single
// URL to request; check:curriculum rejects their chains.
const fixed = REDIRECTS.filter((r) => !r.source.includes(':'))
await pool(fixed, async ({ source, destination, permanent }) => {
  const want = permanent ? 308 : 307
  let res
  try {
    res = await fetch(BASE + encodeURI(source), { redirect: 'manual' })
    await res.body?.cancel()
  } catch (err) {
    errors.push(`redirect ${source}: ${err.cause?.code ?? err.message}`)
    return
  }
  const location = res.headers.get('location')
  const url = location ? new URL(location, BASE) : null
  // Pathname plus any hash: the recall cards redirect to their lesson's #recall-card tab.
  const landed = url ? decode(url.pathname) + url.hash : null
  if (res.status !== want || landed !== destination) {
    errors.push(`redirect ${source}: expected ${want} → ${destination}, got ${res.status}${landed ? ` → ${landed}` : ''}`)
    return
  }
  const end = await get(encodeURI(destination))
  if (end.status !== 200) errors.push(`redirect ${source} → ${destination}, which returns ${end.status || end.error}`)
})

let redirects = 0
for (const [path, code] of status) {
  if (typeof code === 'number' && code >= 300 && code < 400) redirects++
  if (typeof code !== 'number' || code >= 400) {
    const from = linkedFrom.get(path)
    errors.push(`${path} → ${code}${from && !pages.includes(path) ? ` (linked from ${from})` : ''}`)
  }
}

console.log(
  `check-routes: ${pages.length} sitemap URLs, ${extra.length} more internal links, ${status.size} fetched (${redirects} redirects), ${fixed.length} mapped redirects, ${readable} ready/partly modules checked`,
)
if (errors.length) {
  console.error(`\n${errors.length} problem(s):`)
  for (const e of errors) console.error(`  ${e}`)
  process.exit(1)
}
console.log('check-routes: OK')
