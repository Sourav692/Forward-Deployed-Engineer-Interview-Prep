/**
 * Runs the parser over every synced worksheet and answer key and asserts the
 * structural invariants the UI depends on. Run with `npm run check:content`.
 *
 * This exists because the fillable regions are inferred from emptiness rather than
 * declared, so a formatting change in a source file can silently turn an input into
 * static text. That would look fine and be wrong.
 *
 * Tracks are read from the manifest rather than listed here, so a new track is
 * checked from the moment it syncs. What differs per track is the *shape* expected,
 * which `EXPECTATIONS` declares: case-study worksheets are a fixed 11-section
 * scaffold ending in a scorecard, while the behavioural ones are one section per
 * interview question and carry no scorecard at all.
 */

import { readFile, readdir } from 'node:fs/promises'
import { join, relative, resolve, sep } from 'node:path'
import { execFileSync } from 'node:child_process'
import { parseDocument } from '../src/lib/parse.ts'
import type { Block } from '../src/lib/parse.ts'
import { ANSWER_KEY_MAP } from '../src/lib/mapping.ts'
import { parseReading } from '../src/lib/reading.ts'
import {
  FAMILY_META,
  LAST_DAY_GUIDES,
  RELATED_CASE,
  REQUIRED_META_FIELDS,
  REVIEW_DOCS,
  REVIEWS,
  STORY_BANK,
  TABS,
  TRACKS,
  TRIGGER_SHEET,
} from '../src/lib/editorial.ts'
import { existsSync } from 'node:fs'
import { GLOSSARY, NOT_ACRONYMS } from '../src/lib/glossary.ts'
import { SEARCH_AREA_BUDGET_BYTES, SEARCH_AREAS } from '../src/lib/search-areas.ts'
import { LESSONS, MODULES as CURRICULUM_MODULES } from '../src/lib/curriculum.ts'
import { AREA_TRACKS, curriculumHref } from '../src/lib/curriculum-href.ts'
import { CASEBOOK_MODULE, scenarioHref } from '../src/lib/scenario.ts'
import { findUnsafeHtml, headingAnchors, isAllowedSource, lessonDecision, lessonKey, slugGuard } from './learn.mjs'

const CONTENT = resolve(import.meta.dirname, '..', 'content')

type Expectation = {
  /** Exact section count, or a minimum when the shape varies by document. */
  sections: { exact: number } | { min: number }
  scorecards: number
  minFillable: number
  minKeySections: number
  /**
   * Whether every worksheet section must resolve to an answer-key section. True for
   * tracks that pair by identity — a worksheet question with no answer renders as a
   * dead reveal, which is the failure this catches.
   */
  requirePairing: boolean
}

const CASE_STUDY: Expectation = {
  sections: { exact: 11 },
  scorecards: 1,
  minFillable: 20,
  minKeySections: 10,
  requirePairing: false,
}

const BEHAVIOURAL: Expectation = {
  sections: { min: 3 },
  scorecards: 0,
  minFillable: 8,
  minKeySections: 3,
  requirePairing: true,
}

const EXPECTATIONS: Record<string, Expectation> = {
  core: CASE_STUDY,
  'system-design': CASE_STUDY,
  'fde-competencies': BEHAVIOURAL,
}

type Counts = {
  inputs: number
  fields: number
  editableCells: number
  scorecards: number
  growableTables: number
  diagrams: number
  /**
   * Fences that reached the prose path instead of becoming a `diagram` or `code`
   * block. That was a real regression: a mermaid fence rendered as its own source
   * text on the live site, which looks like broken content rather than a bug.
   */
  leakedFences: number
}

function emptyCounts(): Counts {
  return {
    inputs: 0,
    fields: 0,
    editableCells: 0,
    scorecards: 0,
    growableTables: 0,
    diagrams: 0,
    leakedFences: 0,
  }
}

function count(blocks: Block[], counts: Counts): void {
  for (const b of blocks) {
    if (b.kind === 'diagram') counts.diagrams++
    if (b.kind === 'prose' && /language-mermaid|&#96;&#96;&#96;|```/.test(b.html)) {
      counts.leakedFences++
    }
    if (b.kind === 'list') {
      for (const item of b.items) {
        if (item.kind === 'input') counts.inputs++
        if (item.kind === 'field') counts.fields++
      }
    }
    if (b.kind === 'table') {
      for (const row of b.rows) {
        for (const cell of row) if (cell.editable) counts.editableCells++
      }
      if (b.growable) counts.growableTables++
    }
    if (b.kind === 'scorecard') counts.scorecards++
  }
}

const failures: string[] = []
const rows: string[] = []

// PR-10: a later `#` heading becomes a section, so no page renders two H1s.
const twoH1 = parseReading('# Title\n\n# Second\n\nText.', 'self-check')
if (twoH1.title !== 'Title' || twoH1.sections[0]?.title !== 'Second') {
  failures.push('reading.ts: a second # heading did not become a section')
}
let diagramTotal = 0

const manifest = JSON.parse(await readFile(join(CONTENT, 'manifest.json'), 'utf8'))

/**
 * Reading modules (FDE Case Studies) have no blanks to find. What can go wrong there is
 * different: a tab file missing, a mermaid fence printed as source, or a link still
 * pointing into the repo, which is a dead link on the site. The sync step rewrites
 * every repo link, so one surviving here means that rewrite missed a case.
 */
async function checkReading(mod: {
  id: string
  tracks: { id: string; scenarios: { slug: string; tabs?: { id: string }[] }[] }[]
}) {
  for (const track of mod.tracks) {
    for (const { slug, tabs = [] } of track.scenarios) {
      if (tabs.length === 0) failures.push(`${track.id}/${slug}: no tabs in the manifest`)
      let sections = 0
      let diagrams = 0
      for (const tab of tabs) {
        const label = `${track.id}/${slug}/${tab.id}`
        const raw = await readFile(join(CONTENT, 'modules', mod.id, track.id, slug, `${tab.id}.md`), 'utf8').catch(() => null)
        if (raw === null) {
          failures.push(`${label}: missing tab document`)
          continue
        }
        const doc = parseReading(raw, tab.id)
        if (!doc.title) failures.push(`${label}: no # title`)
        const titled = doc.sections.filter((x) => x.title).length
        if (titled === 0) failures.push(`${label}: no ## sections — the tab would have no contents list`)
        sections += titled
        for (const section of doc.sections) {
          for (const chunk of section.chunks) {
            if (chunk.kind === 'diagram') {
              diagrams++
              continue
            }
            if (/language-mermaid/.test(chunk.html)) {
              failures.push(`${label}: a mermaid fence rendered as prose in "${section.title ?? 'intro'}"`)
            }
            for (const [, href] of chunk.html.matchAll(/href="([^"]*)"/g)) {
              if (!/^(https?:|mailto:|#|\/)/.test(href)) {
                failures.push(`${label}: link still points into the repo: ${href}`)
              }
            }
          }
        }
      }
      diagramTotal += diagrams
      rows.push(`  ${`${track.id}/${slug}`.padEnd(52)} ${String(sections).padStart(3)} sec  ${diagrams} diagram(s)  (${tabs.length} tab${tabs.length === 1 ? '' : 's'})`)
    }
  }
}

for (const mod of manifest.modules) {
  if (mod.kind === 'reading') {
    await checkReading(mod)
    continue
  }
  for (const track of mod.tracks) {
    const expect = EXPECTATIONS[track.id]
    if (!expect) {
      failures.push(
        `${track.id}: no expectation declared in check-parse.ts — add one so the ` +
          `track is actually checked rather than silently skipped`,
      )
      continue
    }

    const trackDir = join(CONTENT, 'modules', mod.id, track.id)
    const worksheetDir = join(trackDir, 'worksheets')
    const keyDir = join(trackDir, 'answer-keys')
    const files = (await readdir(worksheetDir)).filter((f) => f.endsWith('.md')).sort()

    for (const file of files) {
      const slug = file.replace(/\.md$/, '')
      const label = `${track.id}/${slug}`
      const doc = parseDocument(await readFile(join(worksheetDir, file), 'utf8'))
      const counts = emptyCounts()
      count(doc.intro, counts)
      for (const section of doc.sections) count(section.blocks, counts)

      if (counts.leakedFences > 0) {
        failures.push(
          `${label}: ${counts.leakedFences} fenced block(s) rendered as prose — ` +
            `a code or mermaid fence is not being parsed as its own block`,
        )
      }

      const total =
        counts.inputs + counts.fields + counts.editableCells + counts.scorecards

      if ('exact' in expect.sections) {
        if (doc.sections.length !== expect.sections.exact) {
          failures.push(
            `${label}: expected ${expect.sections.exact} sections, got ${doc.sections.length}`,
          )
        }
      } else if (doc.sections.length < expect.sections.min) {
        failures.push(
          `${label}: expected at least ${expect.sections.min} sections, got ${doc.sections.length}`,
        )
      }
      if (counts.scorecards !== expect.scorecards) {
        failures.push(
          `${label}: expected ${expect.scorecards} scorecard(s), got ${counts.scorecards}`,
        )
      }
      if (total < expect.minFillable) {
        failures.push(`${label}: only ${total} fillable regions — suspiciously few`)
      }
      if (!doc.title) failures.push(`${label}: no title`)

      // The reveal under each worksheet section is populated by key lookup. A section
      // that resolves to nothing renders an empty reveal, which reads as missing
      // content rather than as a bug.
      if (expect.requirePairing) {
        const keyDoc = parseDocument(
          await readFile(join(keyDir, file), 'utf8').catch(() => ''),
        )
        const keyKeys = new Set(keyDoc.sections.map((s) => s.key))
        for (const section of doc.sections) {
          const targets = ANSWER_KEY_MAP[section.key] ?? [section.key]
          if (!targets.some((k) => keyKeys.has(k))) {
            failures.push(
              `${label}: worksheet section "${section.title}" ` +
                `(key ${section.key}) has no matching answer-key section`,
            )
          }
        }
      }

      rows.push(
        `  ${label.padEnd(52)} ` +
          `${String(doc.sections.length).padStart(2)} sec  ` +
          `${String(counts.editableCells).padStart(3)} cells  ` +
          `${String(counts.inputs).padStart(2)} bullets  ` +
          `${String(counts.fields).padStart(2)} fields  ` +
          `${counts.growableTables} growable`,
      )
    }

    for (const file of (await readdir(keyDir)).filter((f) => f.endsWith('.md'))) {
      const doc = parseDocument(await readFile(join(keyDir, file), 'utf8'))
      const counts = emptyCounts()
      count(doc.intro, counts)
      for (const section of doc.sections) count(section.blocks, counts)
      if (counts.leakedFences > 0) {
        failures.push(
          `${track.id}/answer-keys/${file}: ${counts.leakedFences} fenced block(s) ` +
            `rendered as prose instead of a diagram or code block`,
        )
      }
      if (counts.diagrams > 0) diagramTotal += counts.diagrams
      // Answer keys are reference text. Anything editable in one means the parser is
      // treating authored content as a blank.
      if (counts.inputs + counts.editableCells > 0) {
        failures.push(
          `${track.id}/answer-keys/${file}: ${counts.inputs + counts.editableCells} ` +
            `unexpected editable regions in an answer key`,
        )
      }
      if (doc.sections.length < expect.minKeySections) {
        failures.push(
          `${track.id}/answer-keys/${file}: only ${doc.sections.length} sections`,
        )
      }
    }
  }
}

// ------------------------------------------------------------------ editorial contract
//
// Every published page must be able to say what it is, who it is for, what it assumes
// and teaches, how to use it, and where to go next. Those answers live in
// src/lib/editorial.ts; these checks make a missing one a build failure rather than a
// page that silently renders without it.

const SITE_ROOT = resolve(import.meta.dirname, '..')
const pages = new Set<string>()
const routes = new Set<string>(['/', '/favicon.ico', '/start', '/glossary', '/design', '/fde-last-day-prep'])
for (const g of LAST_DAY_GUIDES) routes.add(`/fde-last-day-prep/${g.id}`)
routes.add(STORY_BANK.href)
const tabsByPage = new Map<string, string[]>()

for (const mod of manifest.modules) {
  if (mod.id !== CASEBOOK_MODULE) routes.add(`/modules/${mod.id}`)
  for (const track of mod.tracks) {
    if (!TRACKS[track.id]) failures.push(`${track.id}: no display name in TRACKS`)
    else if (track.title !== TRACKS[track.id].title) {
      failures.push(`${track.id}: manifest title "${track.title}" has drifted from TRACKS — re-run npm run sync`)
    }
    const meta = FAMILY_META[track.id]
    if (!meta) {
      failures.push(`${track.id}: no FAMILY_META entry, so its pages have no audience, prerequisites or outcomes`)
    } else {
      for (const field of REQUIRED_META_FIELDS) {
        const value = meta[field]
        if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
          failures.push(`${track.id}: required metadata "${field}" is empty`)
        }
      }
    }
    for (const s of track.scenarios) {
      const key = `${track.id}/${s.slug}`
      pages.add(key)
      const href = scenarioHref({ moduleId: mod.id, trackId: track.id, slug: s.slug })
      routes.add(href)
      tabsByPage.set(href, (s.tabs ?? []).map((t: { id: string }) => t.id))
      for (const tab of s.tabs ?? []) {
        if (!TABS[tab.id]) failures.push(`${key}: tab "${tab.id}" has no label or purpose in TABS`)
        else if (tab.label !== TABS[tab.id].label) failures.push(`${key}: tab label "${tab.label}" has drifted from TABS`)
      }
    }
  }
}

// Every cross-link names a page that exists, and every practice or case page is reachable
// from at least one review — a page no review points to is never suggested from the final-week review.
const cited = new Set<string>()
for (const r of REVIEWS) {
  for (const ref of [...r.learnFirst, ...r.goDeeper]) {
    cited.add(ref)
    if (!pages.has(ref)) failures.push(`Review ${r.number}: links to "${ref}", which is not a published page`)
  }
}
for (const [practice, study] of Object.entries(RELATED_CASE)) {
  for (const ref of [practice, study]) {
    if (!pages.has(ref)) failures.push(`RELATED_CASE: "${ref}" is not a published page`)
  }
}
for (const mod of manifest.modules) {
  for (const track of mod.tracks) {
    if (FAMILY_META[track.id]?.personalisation) continue
    for (const s of track.scenarios) {
      const key = `${track.id}/${s.slug}`
      // Company packs are intentionally entered directly from Company Prep; they are
      // not part of the general FDE review sequence or its cross-company review pages.
      if (mod.id !== '16-company-oriented-prep' && !cited.has(key)) {
        failures.push(`${key}: not linked from any review in REVIEWS, so no final-week review points to it`)
      }
    }
  }
}

/** A site-internal href resolves to a route, a tab of a route, or a public file. */
function resolvesInternally(href: string): boolean {
  const [path, hash = ''] = href.split('#')
  if (path.endsWith('.html')) return existsSync(join(SITE_ROOT, 'public', decodeURIComponent(path)))
  const clean = path.replace(/\/$/, '') || '/'
  if (!routes.has(clean)) return false
  const tabs = tabsByPage.get(clean)
  // A hash on a reading page must open one of its tabs (or a section within one).
  if (tabs?.length && hash) return tabs.some((t) => hash === t || hash.startsWith(`${t}-`))
  return true
}

// Case-sensitive on purpose: "the agent's todo list" is prose; "TODO" is an author's note.
const PLACEHOLDER = /\[FILL\b|\bTODO\b|\bTBD\b|\bXXX\b|[Ll]orem ipsum/
let linksChecked = 0

async function checkDocument(label: string, raw: string, allowPlaceholders: boolean) {
  if (!allowPlaceholders && PLACEHOLDER.test(raw)) {
    failures.push(`${label}: unresolved placeholder (${raw.match(PLACEHOLDER)![0]}) on a public page`)
  }
  for (const [, href] of raw.matchAll(/\]\((\/[^)\s]*)\)/g)) {
    linksChecked++
    if (!resolvesInternally(href)) failures.push(`${label}: broken internal link ${href}`)
  }
}

for (const mod of manifest.modules) {
  for (const track of mod.tracks) {
    const personal = Boolean(FAMILY_META[track.id]?.personalisation)
    for (const s of track.scenarios) {
      const base = join(CONTENT, 'modules', mod.id, track.id)
      const files =
        mod.kind === 'reading'
          ? (s.tabs ?? []).map((t: { id: string }) => join(base, s.slug, `${t.id}.md`))
          : [join(base, 'worksheets', `${s.slug}.md`), join(base, 'answer-keys', `${s.slug}.md`)]
      for (const file of files) {
        const raw = await readFile(file, 'utf8').catch(() => null)
        if (raw !== null) await checkDocument(`${track.id}/${s.slug}`, raw, personal)
      }
    }
  }
}
for (const g of LAST_DAY_GUIDES) {
  const raw = await readFile(join(CONTENT, 'last-day', `${g.id}.md`), 'utf8').catch(() => null)
  if (raw === null) failures.push(`last-day/${g.id}.md: missing — run npm run sync`)
  else await checkDocument(`last-day/${g.id}`, raw, false)
}

// The static reviews: every internal link, including the ones sync added, must resolve.
const staticFiles = [
  ...REVIEWS.flatMap((r) => Object.values(REVIEW_DOCS).map((d) => `/fde-last-day-prep/${r.dir}/${d.file}`)),
  `/fde-last-day-prep/${TRIGGER_SHEET.dir}/${TRIGGER_SHEET.file}`,
]
for (const path of staticFiles) {
  const raw = await readFile(join(SITE_ROOT, 'public', path), 'utf8').catch(() => null)
  if (raw === null) {
    failures.push(`${path}: missing from public/`)
    continue
  }
  if (raw.includes('class="source-note"')) failures.push(`${path}: still has the "Generated from" footer`)
  if (/\bModule\s+\d+\b/.test(raw.replace(/<[^>]+>/g, ' ').replace(/id="[^"]*"/g, ''))) {
    failures.push(`${path}: still says "Module N" — the Last-Day sequence is Review 01–18`)
  }
  for (const [, href] of raw.matchAll(/href="(\/[^"]*)"/g)) {
    linksChecked++
    if (!resolvesInternally(href)) failures.push(`${path}: broken internal link ${href}`)
  }
  for (const [, href] of raw.matchAll(/href="((?!https?:|#|\/|mailto:)[^"]+)"/g)) {
    linksChecked++
    const target = join(SITE_ROOT, 'public', path, '..', href.split('#')[0])
    if (!existsSync(target)) failures.push(`${path}: broken relative link ${href}`)
  }
}

// PQ-07: the repository is private, so a link into it 404s for every visitor. The other
// phrases are authoring notes (the case index spreadsheet, how a tutorial was regenerated,
// which viewer draws a diagram) that mean nothing to a visitor.
const PRIVATE_REPO = 'github.com/Sourav692/Forward-Deployed-Engineer-Interview-Prep'
const BUILD_ARTEFACTS = ['CASE_STUDY_INDEX.xlsx', 'Interview-ready v2', 'for a viewer that draws Mermaid']
for (const dir of [CONTENT, join(SITE_ROOT, 'public', 'fde-last-day-prep')]) {
  for (const file of await readdir(dir, { recursive: true })) {
    if (!/\.(md|json|html)$/.test(file)) continue
    const text = await readFile(join(dir, file), 'utf8')
    if (text.includes(PRIVATE_REPO)) failures.push(`${relative(SITE_ROOT, join(dir, file))}: links to the private repository`)
    if (!file.endsWith('.md')) continue
    for (const phrase of BUILD_ARTEFACTS) {
      if (text.includes(phrase)) failures.push(`${relative(SITE_ROOT, join(dir, file))}: contains "${phrase}", a build artefact`)
    }
  }
}

// ------------------------------------------------------------------ Learn lessons
//
// DATA-04 and SEC-01. curriculum.ts decides what may be published; the sync writes it.
// These checks make sure the committed snapshot matches that decision: every
// publishable lesson is there, nothing pending, excluded, on hold or outside the
// folder allow-list is, no link points into the repository, no unsafe HTML survived,
// and no published lesson slug vanished without a RENAMED entry.

type LearnEntry = {
  slug: string
  title: string
  track: string
  module: string
  kind: 'sync' | 'live'
  publish: string
  source: string
  estMinutes: number
  href: string
}

const LEARN = join(CONTENT, 'learn')
const learnFiles: string[] = []
let learnManifest: LearnEntry[] = []
{
  const raw = await readFile(join(LEARN, 'manifest.json'), 'utf8').catch(() => null)
  if (raw === null) failures.push('content/learn/manifest.json: missing — run npm run sync')
  else learnManifest = JSON.parse(raw).lessons
}
const learnByKey = new Map(learnManifest.map((l) => [`${l.module}/${l.slug}`, l]))
for (const l of learnManifest) if (l.kind === 'sync') routes.add(l.href)
// Every track and module page is prerendered (generateStaticParams), so lessons may link to them.
for (const m of CURRICULUM_MODULES) {
  routes.add(curriculumHref(m.track))
  routes.add(curriculumHref(m.track, m.slug))
}

const listMarkdown = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => [])
  const out: string[] = []
  for (const e of entries) {
    const path = join(dir, e.name)
    if (e.isDirectory()) out.push(...(await listMarkdown(path)))
    else if (e.name.endsWith('.md')) out.push(path)
  }
  return out
}
const learnOnDisk = new Set(await listMarkdown(LEARN))
const expectedFiles = new Set<string>()
let learnSynced = 0
let learnLive = 0

for (const lesson of LESSONS) {
  const decision = lessonDecision(lesson)
  const key = lessonKey(lesson)
  const entry = learnByKey.get(key)
  const home = CURRICULUM_MODULES.find((m) => m.slug === lesson.home)
  const file = home ? join(LEARN, home.track, home.slug, `${lesson.slug}.md`) : null
  if (decision !== 'publish') {
    if (entry) failures.push(`learn ${key}: in the manifest but not publishable (${decision})`)
    if (file && learnOnDisk.has(file)) failures.push(`learn ${key}: file exists but the lesson is ${decision}`)
    continue
  }
  if (!entry) {
    failures.push(`learn ${key}: publishable but missing from content/learn/manifest.json — run npm run sync`)
    continue
  }
  if (entry.href === undefined) failures.push(`learn ${key}: no href in the manifest`)
  if (lesson.kind === 'live') {
    learnLive++
    if (!entry.href || !resolvesInternally(entry.href)) failures.push(`learn ${key}: live page ${entry.href} does not resolve`)
    continue
  }
  learnSynced++
  expectedFiles.add(file!)
  if (!learnOnDisk.has(file!)) failures.push(`learn ${key}: missing ${relative(CONTENT, file!)} — run npm run sync`)
}
for (const file of learnOnDisk) {
  if (!expectedFiles.has(file)) failures.push(`content/${relative(CONTENT, file)}: no publishable lesson owns this file`)
}
for (const l of learnManifest) {
  if (!isAllowedSource(l.source)) failures.push(`learn ${l.module}/${l.slug}: source ${l.source} is outside the folder allow-list`)
}

for (const file of [...learnOnDisk].filter((f) => expectedFiles.has(f)).sort()) {
  const label = `learn/${relative(LEARN, file).replace(/\.md$/, '')}`
  const raw = await readFile(file, 'utf8')
  learnFiles.push(file)
  for (const tag of findUnsafeHtml(raw)) failures.push(`${label}: unsafe HTML survived the sanitiser: ${tag.slice(0, 60)}`)
  const doc = parseReading(raw, 'lesson')
  if (!doc.title) failures.push(`${label}: no # title`)
  const h1s = raw.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, '').match(/^# /gm) ?? []
  if (h1s.length !== 1) failures.push(`${label}: ${h1s.length} # headings; a lesson has exactly one`)
  for (const section of doc.sections) {
    for (const chunk of section.chunks) {
      if (chunk.kind === 'diagram') {
        diagramTotal++
        continue
      }
      if (/language-mermaid/.test(chunk.html)) failures.push(`${label}: a mermaid fence rendered as prose`)
      for (const [, href] of chunk.html.matchAll(/(?:href|src)="([^"]*)"/g)) {
        if (!/^(https?:|mailto:|#|\/)/.test(href)) failures.push(`${label}: link still points into the repo: ${href}`)
      }
    }
  }
  await checkDocument(label, raw, false)
}

// Anchors in Learn lessons must land on a heading: an in-page `#anchor` on the
// lesson itself, and a `/learn/...#anchor` link (from a lesson slice to its sibling,
// or a repo link with an anchor) on the target lesson. Anchors are the GitHub ids
// the sources were written with, or the `lesson-...` ids the site gives each section.
{
  const anchorsOf = new Map<string, Set<string>>()
  // content/learn/<track>/<module>/<lesson>.md → the lesson's URL (/learn/... or an area's).
  const hrefOf = (file: string) => {
    const [track, mod, lesson] = relative(LEARN, file).replace(/\.md$/, '').split(sep)
    return curriculumHref(track, mod, lesson)
  }
  for (const file of learnFiles) {
    anchorsOf.set(hrefOf(file), headingAnchors(await readFile(file, 'utf8')))
  }
  const areaBases = Object.values(AREA_TRACKS).map((b) => b.slice(1)).join('|')
  const anchorLink = new RegExp(`\\]\\((\\/(?:learn|${areaBases})\\/[^)#\\s]*)?#([^)\\s]+)\\)`, 'g')
  for (const file of learnFiles) {
    const self = hrefOf(file)
    const raw = await readFile(file, 'utf8')
    const prose = raw.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, '')
    for (const [, path, anchor] of prose.matchAll(anchorLink)) {
      const target = path ?? self
      const anchors = anchorsOf.get(target)
      if (anchors && !anchors.has(decodeURIComponent(anchor))) failures.push(`learn ${self}: anchor link ${path ?? ''}#${anchor} matches no heading`)
    }
  }
}

// Slug guard: compare with the manifest on main (or the last commit), so a lesson
// that disappears in a branch fails before merge unless RENAMED records it.
{
  const show = (ref: string) => {
    try {
      return execFileSync('git', ['show', `${ref}:site/content/learn/manifest.json`], {
        cwd: SITE_ROOT,
        stdio: ['ignore', 'pipe', 'ignore'],
      }).toString()
    } catch {
      return null
    }
  }
  const base = show('origin/main') ?? show('HEAD')
  if (base === null) rows.push('\n  learn slug guard: no committed content/learn manifest to compare with (first sync)')
  else {
    for (const problem of slugGuard(JSON.parse(base).lessons, learnManifest)) failures.push(`learn slug guard: ${problem}`)
  }
}
rows.push(`\n  learn: ${learnSynced} lessons synced, ${learnLive} live lessons resolved, ${learnOnDisk.size} files on disk`)

// Acronyms: anything in capitals that shows up on three or more pages must either be in
// the glossary or be listed as not-an-acronym. A new term then gets a plain definition
// the day it spreads, instead of the reader having to guess.
const defined = new Set(GLOSSARY.map((g) => g.term))
const acronymPages = new Map<string, Set<string>>()
// A capitalised token that also appears as an ordinary lower-case word ("MODEL", "CACHE")
// is emphasis, not an acronym.
const lowerWords = new Set<string>()
const scanFiles: string[] = []
for (const mod of manifest.modules) {
  for (const track of mod.tracks) {
    for (const s of track.scenarios) {
      const base = join(CONTENT, 'modules', mod.id, track.id)
      if (mod.kind === 'reading') for (const t of s.tabs ?? []) scanFiles.push(join(base, s.slug, `${t.id}.md`))
      else scanFiles.push(join(base, 'worksheets', `${s.slug}.md`), join(base, 'answer-keys', `${s.slug}.md`))
    }
  }
}
for (const g of LAST_DAY_GUIDES) scanFiles.push(join(CONTENT, 'last-day', `${g.id}.md`))
scanFiles.push(join(CONTENT, 'behavioural', `${STORY_BANK.slug}.md`))
for (const path of staticFiles) scanFiles.push(join(SITE_ROOT, 'public', path))
scanFiles.push(...learnFiles)
for (const file of scanFiles) {
  const raw = await readFile(file, 'utf8').catch(() => '')
  const text = raw
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
  for (const [word] of text.matchAll(/\b[a-z]{4,}\b/g)) lowerWords.add(word)
  for (const [token] of text.matchAll(/\b[A-Z][A-Z0-9]{1,6}\b/g)) {
    if (defined.has(token) || NOT_ACRONYMS.has(token) || /^(G\d{2}|[A-Z]\d{1,3}|LLM\d{2})$/.test(token)) continue
    if (!acronymPages.has(token)) acronymPages.set(token, new Set())
    acronymPages.get(token)!.add(file)
  }
}
for (const [token, files] of acronymPages) {
  if (files.size >= 3 && !lowerWords.has(token.toLowerCase())) {
    failures.push(`acronym ${token} appears on ${files.size} pages but is not in the glossary (src/lib/glossary.ts) or NOT_ACRONYMS`)
  }
}

// Story Bank (CONTENT-15). Every question link must name a real behavioural question,
// and every behavioural question must appear on the page — under a story's
// `**Answers:**` line or in the "need a story of your own" list — so a question added
// to a worksheet cannot silently go unmapped.
{
  const raw = await readFile(join(CONTENT, 'behavioural', `${STORY_BANK.slug}.md`), 'utf8').catch(() => null)
  if (raw === null) {
    failures.push(`behavioural/${STORY_BANK.slug}.md: missing — run npm run sync`)
  } else {
    await checkDocument('story-bank', raw, false)
    const questions = new Set<string>()
    const mod = manifest.modules.find((m: { id: string }) => m.id === STORY_BANK.moduleId)
    for (const track of mod?.tracks ?? []) {
      for (const s of track.scenarios) {
        const ws = await readFile(join(CONTENT, 'modules', mod.id, track.id, 'worksheets', `${s.slug}.md`), 'utf8')
        for (const [, n] of ws.matchAll(/^## (\d+)\./gm)) questions.add(`${track.id}/${s.slug}#${n}`)
      }
    }
    const link = new RegExp(`\\]\\(/modules/${STORY_BANK.moduleId}/([^/)]+)/([^/)#]+)#section-(\\d+)\\)`, 'g')
    const linked = new Set<string>()
    const withStory = new Set<string>()
    let stories = 0
    let fenced = false
    for (const line of raw.split('\n')) {
      // The blank template at the end is a code block; its field names are not a story.
      if (line.startsWith('```')) fenced = !fenced
      if (fenced) continue
      const answers = line.startsWith('**Answers:**')
      if (answers) stories++
      for (const [, track, slug, n] of line.matchAll(link)) {
        const key = `${track}/${slug}#${n}`
        if (!questions.has(key)) failures.push(`story-bank: links to ${key}, which is not a behavioural question`)
        linked.add(key)
        if (answers) withStory.add(key)
      }
    }
    const missing = [...questions].filter((q) => !linked.has(q))
    if (missing.length) failures.push(`story-bank: ${missing.length} question(s) not on the page: ${missing.join(', ')}`)
    rows.push(
      `\n  story bank: ${stories} stories; ${withStory.size} of ${questions.size} behavioural questions have a story, ` +
        `${[...linked].filter((q) => !withStory.has(q)).length} need your own`,
    )
  }
}

rows.push(`\n  editorial: ${pages.size} pages with metadata, ${cited.size} cited by reviews, ${linksChecked} internal links resolved`)

// ------------------------------------------------------------------ search index budget
//
// The search index ships as one static file per area (PERF-02). The route handler already
// fails the build when a file goes over budget; this re-checks the files from the last
// `next build`, so `check:content` after a build reports sizes and catches a stale budget.
{
  const built = join(SITE_ROOT, '.next', 'server', 'app', 'search')
  if (!existsSync(built)) {
    rows.push('\n  search index: no build output yet (run `npm run build`, then this check, to measure the area files)')
  } else {
    const sizes: string[] = []
    for (const area of SEARCH_AREAS) {
      const file = join(built, `${area}.json.body`)
      if (!existsSync(file)) {
        failures.push(`search index: ${area}.json missing from the last build`)
        continue
      }
      const bytes = (await readFile(file)).byteLength
      sizes.push(`${area} ${Math.round(bytes / 1024)} KB`)
      if (bytes > SEARCH_AREA_BUDGET_BYTES) {
        failures.push(`search index: ${area}.json is ${bytes} bytes, over the ${SEARCH_AREA_BUDGET_BYTES}-byte budget`)
      }
    }
    rows.push(`\n  search index: ${sizes.join(', ')} (budget ${SEARCH_AREA_BUDGET_BYTES / 1024} KB each)`)
  }
}

// ------------------------------------------------------------------ live count baseline (QA-04)
//
// The counts below may only grow. A drop means a page, link, diagram or lesson went
// missing in a sync or refactor, which no other check would notice. When a drop is
// intended, run `npm run check:content -- --update-baseline` and commit baselines.json.
{
  const baselineFile = join(SITE_ROOT, 'scripts', 'baselines.json')
  let modulePages = 0
  for (const mod of manifest.modules) for (const track of mod.tracks) modulePages += track.scenarios.length
  const current: Record<string, number> = {
    modulePages,
    editorialPages: pages.size,
    internalLinks: linksChecked,
    diagrams: diagramTotal,
    learnSynced,
    learnLive,
  }
  if (process.argv.includes('--update-baseline')) {
    const { writeFile } = await import('node:fs/promises')
    await writeFile(baselineFile, `${JSON.stringify(current, null, 2)}\n`)
    rows.push(`\n  baseline: written to scripts/baselines.json`)
  } else if (!existsSync(baselineFile)) {
    failures.push('scripts/baselines.json is missing; run `npm run check:content -- --update-baseline`')
  } else {
    const baseline = JSON.parse(await readFile(baselineFile, 'utf8')) as Record<string, number>
    const grown: string[] = []
    for (const [key, value] of Object.entries(baseline)) {
      const now = current[key]
      if (now === undefined) failures.push(`baseline: unknown count "${key}" in scripts/baselines.json`)
      else if (now < value) {
        failures.push(
          `baseline: ${key} dropped from ${value} to ${now}. If intended, run \`npm run check:content -- --update-baseline\``,
        )
      } else if (now > value) grown.push(`${key} ${value}→${now}`)
    }
    rows.push(
      `\n  baseline: ${Object.entries(current).map(([k, v]) => `${k} ${v}`).join(', ')}` +
        (grown.length ? ` (grown: ${grown.join(', ')}; refresh with --update-baseline)` : ''),
    )
  }
}

console.log(rows.join('\n'))
console.log(`\n  ${diagramTotal} mermaid diagram(s) parsed across answer keys and case studies`)

if (failures.length) {
  console.error(`\n${failures.length} problem(s):`)
  for (const f of failures) console.error(`  ✗ ${f}`)
  process.exit(1)
}
console.log(`\n✓ all worksheets, answer keys and case studies parse cleanly`)
