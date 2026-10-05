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
 *    reachable (intentional redirects such as /interview/final-week).
 * 3. Fails on any 4xx/5xx or network error, listing the page that linked to it.
 * 4. Fails when a module marked `ready` or `partly` in `src/lib/curriculum.ts` has
 *    no published or live lesson in `content/learn/manifest.json` (an empty module
 *    would be dressed up as readable), mirroring `readingList()` in `src/lib/learn.ts`.
 *
 * Plain Node 24: the curriculum is imported as TypeScript through type stripping.
 */
import { readFileSync } from 'node:fs'
import { MODULES } from '../src/lib/curriculum.ts'

const BASE = (process.env.BASE_URL ?? 'http://localhost:3307').replace(/\/$/, '')
const CONCURRENCY = 12
const errors = []

// ── 1. Ready modules must have something to read ─────────────────────────────
const manifest = JSON.parse(readFileSync(new URL('../content/learn/manifest.json', import.meta.url), 'utf8'))
const published = new Set(manifest.lessons.map((l) => l.slug))
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

await pool(pages, async (path) => {
  const res = await get(path)
  status.set(path, res.status || res.error)
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

let redirects = 0
for (const [path, code] of status) {
  if (typeof code === 'number' && code >= 300 && code < 400) redirects++
  if (typeof code !== 'number' || code >= 400) {
    const from = linkedFrom.get(path)
    errors.push(`${path} → ${code}${from && !pages.includes(path) ? ` (linked from ${from})` : ''}`)
  }
}

console.log(
  `check-routes: ${pages.length} sitemap URLs, ${extra.length} more internal links, ${status.size} fetched (${redirects} redirects), ${readable} ready/partly modules checked`,
)
if (errors.length) {
  console.error(`\n${errors.length} problem(s):`)
  for (const e of errors) console.error(`  ${e}`)
  process.exit(1)
}
console.log('check-routes: OK')
