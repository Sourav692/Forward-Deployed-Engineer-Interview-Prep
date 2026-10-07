#!/usr/bin/env node
/**
 * Bundle budget check (PERF-01, OPS-02; plan §8 "Client bundle budget").
 *
 * Run after `next build`. Next 16 no longer prints first-load JS per route, so this
 * measures it from the build output directly:
 *
 * 1. `.next/prerender-manifest.json` lists every prerendered URL and the route
 *    pattern it came from (`srcRoute`).
 * 2. Each URL's prerendered HTML in `.next/server/app/` names every `<script src>`
 *    the browser loads on first visit. That set is the route's first-load JS.
 * 3. `.next/build-manifest.json` `rootMainFiles` is the shared framework baseline
 *    every App Router page loads. `polyfillFiles` are `nomodule` and never run in a
 *    modern browser, so they are left out.
 * 4. Every chunk is gzipped with node:zlib (level 9, close to what Vercel serves).
 *
 * For each route pattern the largest instance is reported. Budgets apply to JS
 * beyond the baseline. Lazy chunks (Mermaid, the search index) are not first-load
 * and are not counted, which is the point of loading them on demand.
 *
 * Usage: node scripts/check-bundle.mjs [--json]
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const NEXT = '.next'
const KB = 1024

/** Budgets in KB of gzipped first-load JS beyond the framework baseline. */
const BUDGETS = [
  // The 3D world loads near the journey, never as part of the initial landing visit.
  { label: 'landing', match: (r) => r === '/', kb: 45 },
  { label: 'lesson', match: (r) => r === '/learn/[trackSlug]/[moduleSlug]/[lessonSlug]', kb: 90 },
  { label: 'module', match: (r) => r === '/learn/[trackSlug]/[moduleSlug]', kb: 90 },
  // Client-heavy learner pages (Phase 2 dashboard). None exist in Phase 1.
  { label: 'client-heavy', match: (r) => r === '/progress' || r.startsWith('/progress/') || r === '/settings', kb: 140 },
]

if (!existsSync(join(NEXT, 'prerender-manifest.json'))) {
  console.error('check-bundle: no .next build output. Run `npm run build` first.')
  process.exit(1)
}

const buildManifest = JSON.parse(readFileSync(join(NEXT, 'build-manifest.json'), 'utf8'))
const prerender = JSON.parse(readFileSync(join(NEXT, 'prerender-manifest.json'), 'utf8'))
const polyfills = new Set(buildManifest.polyfillFiles ?? [])
const baseline = new Set(buildManifest.rootMainFiles ?? [])

const gzCache = new Map()
function gz(file) {
  if (!gzCache.has(file)) {
    const path = join(NEXT, file)
    gzCache.set(file, existsSync(path) ? gzipSync(readFileSync(path), { level: 9 }).length : 0)
  }
  return gzCache.get(file)
}

const baselineBytes = [...baseline].reduce((n, f) => n + gz(f), 0)

function htmlPath(url) {
  return join(NEXT, 'server', 'app', url === '/' ? 'index.html' : `${url}.html`)
}

function scriptsIn(html) {
  const files = new Set()
  for (const m of html.matchAll(/<script[^>]*\ssrc="\/_next\/(static\/[^"?]+)"/g)) {
    if (!polyfills.has(m[1])) files.add(m[1])
  }
  return files
}

/** route pattern → { url, bytes } for its heaviest instance */
const routes = new Map()
for (const [url, info] of Object.entries(prerender.routes)) {
  if (url.startsWith('/demo') || url.startsWith('/_')) continue
  const file = htmlPath(url)
  if (!existsSync(file)) continue
  const scripts = scriptsIn(readFileSync(file, 'utf8'))
  if (scripts.size === 0) continue
  const extra = [...scripts].filter((f) => !baseline.has(f)).reduce((n, f) => n + gz(f), 0)
  const route = info.srcRoute ?? url
  const prev = routes.get(route)
  if (!prev || extra > prev.bytes) routes.set(route, { url, bytes: extra })
}

if (routes.size === 0) {
  console.error('check-bundle: found no prerendered pages with scripts. Is this a Next 16 build?')
  process.exit(1)
}

const rows = [...routes.entries()]
  .map(([route, { url, bytes }]) => {
    const budget = BUDGETS.find((b) => b.match(route))
    return { route, url, kb: bytes / KB, budget: budget?.kb, over: budget ? bytes / KB > budget.kb : false }
  })
  .sort((a, b) => a.route.localeCompare(b.route))

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ baselineKb: baselineBytes / KB, rows }, null, 2))
} else {
  const w = Math.max(...rows.map((r) => r.route.length), 5)
  console.log(`Framework baseline (rootMainFiles): ${(baselineBytes / KB).toFixed(1)} KB gzipped\n`)
  console.log(`${'Route'.padEnd(w)}  ${'Route JS'.padStart(9)}  ${'Budget'.padStart(7)}  Status`)
  console.log(`${'-'.repeat(w)}  ${'-'.repeat(9)}  ${'-'.repeat(7)}  ------`)
  for (const r of rows) {
    const status = r.budget === undefined ? 'report' : r.over ? 'OVER' : 'ok'
    console.log(
      `${r.route.padEnd(w)}  ${`${r.kb.toFixed(1)} KB`.padStart(9)}  ${(r.budget ? `${r.budget} KB` : '-').padStart(7)}  ${status}`,
    )
  }
}

const budgeted = rows.filter((r) => r.budget !== undefined)
for (const b of BUDGETS.filter((b) => b.label !== 'client-heavy')) {
  if (!rows.some((r) => b.match(r.route))) {
    console.error(`\ncheck-bundle: no ${b.label} route found in the build; the budget check would be vacuous.`)
    process.exit(1)
  }
}
const over = budgeted.filter((r) => r.over)
if (over.length) {
  console.error(`\ncheck-bundle: ${over.length} route(s) over budget:`)
  for (const r of over) console.error(`  ${r.route} (${r.url}): ${r.kb.toFixed(1)} KB > ${r.budget} KB`)
  process.exit(1)
}
console.log(`\ncheck-bundle: ${budgeted.length} budgeted route(s) within budget, ${rows.length} route(s) reported.`)
