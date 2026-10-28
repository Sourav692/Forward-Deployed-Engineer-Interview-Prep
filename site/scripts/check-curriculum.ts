/**
 * Integrity check and canonical-home report for `src/lib/curriculum.ts`
 * (Phase 0 tasks DATA-03 and UX-01). Runs under plain `node` via native
 * TypeScript type stripping, like check-parse.ts:
 *   npm run check:curriculum            checks only
 *   npm run check:curriculum -- --homes also prints every multi-use lesson
 *
 * Fails on: duplicate or malformed slugs, track slugs that collide with the live
 * site's track ids, dangling references, a lesson without exactly one home,
 * prerequisite cycles, module statuses that contradict their lessons, RENAMED
 * redirects that chain, point at an unpublished lesson or retire a live one, chains or
 * repeated sources anywhere in src/lib/redirects.ts, and lesson slices that overlap,
 * drop a heading or name a heading the source lacks.
 */
import { CHECKPOINTS } from '../src/lib/checkpoints.ts'
import { INTERVIEW_HUBS, LESSONS, MODULES, RENAMED, RETIRED_MODULES, TRACKS } from '../src/lib/curriculum.ts'
import { MODULE_HOMES, isLearnTrack } from '../src/lib/curriculum-href.ts'
import { LEARN_STAGES } from '../src/lib/learn-stages.ts'
import { REVIEWS, TRACKS as LIVE_TRACKS } from '../src/lib/editorial.ts'
import { REDIRECTS } from '../src/lib/redirects.ts'
import { MODULE_AREAS, scenarioHref } from '../src/lib/scenario.ts'
import type { CurriculumLesson, CurriculumModule } from '../src/lib/curriculum-types.ts'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { lessonDecision, publishedHeadings, splitH2, stripFrontMatter, unknownHeadings } from './learn.mjs'

const errors: string[] = []
const fail = (msg: string) => errors.push(msg)
const SLUG = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/

function unique(kind: string, slugs: string[]) {
  const seen = new Set<string>()
  for (const s of slugs) {
    if (!SLUG.test(s)) fail(`${kind} slug "${s}" is not kebab-case starting with a letter`)
    if (seen.has(s)) fail(`duplicate ${kind} slug "${s}"`)
    seen.add(s)
  }
}

/**
 * Returns one prerequisite cycle as a list of module slugs (first slug repeated
 * at the end, e.g. ['a', 'b', 'a']), or null when the prerequisite graph is acyclic.
 */
export function findPrerequisiteCycle(modules: CurriculumModule[]): string[] | null {
  // Depth-first search with three states: unvisited, on the current path, done.
  // Reaching a module that is still on the path closes a cycle; the path stack
  // gives the exact loop for the error message.
  const prereqs = new Map(modules.map((m) => [m.slug, m.prerequisites]))
  const state = new Map<string, 'path' | 'done'>()
  const path: string[] = []
  const visit = (slug: string): string[] | null => {
    if (state.get(slug) === 'done') return null
    if (state.get(slug) === 'path') return [...path.slice(path.indexOf(slug)), slug]
    state.set(slug, 'path')
    path.push(slug)
    for (const p of prereqs.get(slug) ?? []) {
      const cycle = visit(p)
      if (cycle) return cycle
    }
    path.pop()
    state.set(slug, 'done')
    return null
  }
  for (const m of modules) {
    const cycle = visit(m.slug)
    if (cycle) return cycle
  }
  return null
}

// Slugs (UX-01)
unique('track', TRACKS.map((t) => t.slug))
unique('learning stage', LEARN_STAGES.map((stage) => stage.slug))
const stagedTracks = LEARN_STAGES.flatMap((stage) => stage.tracks)
unique('staged track', stagedTracks)
for (const track of TRACKS.filter((track) => isLearnTrack(track.slug))) {
  if (!stagedTracks.includes(track.slug)) fail(`Learn track ${track.slug} has no learning stage`)
}
for (const slug of stagedTracks) {
  if (!TRACKS.some((track) => track.slug === slug && isLearnTrack(slug))) fail(`learning stage references unknown Learn track ${slug}`)
}
unique('module', MODULES.map((m) => m.slug))
unique('lesson', LESSONS.map((l) => l.slug))
for (const t of TRACKS) unique(`section (${t.slug})`, t.sections.map((s) => s.slug))
for (const t of TRACKS) {
  if (t.slug in LIVE_TRACKS) fail(`track slug "${t.slug}" collides with a live track id in editorial.ts`)
}

// References
const trackBySlug = new Map(TRACKS.map((t) => [t.slug, t]))
const moduleBySlug = new Map(MODULES.map((m) => [m.slug, m]))
const lessonBySlug = new Map(LESSONS.map((l) => [l.slug, l]))
for (const t of TRACKS) {
  for (const p of t.prerequisites) if (!trackBySlug.has(p)) fail(`track ${t.code}: unknown prerequisite "${p}"`)
  for (const s of t.sections) {
    for (const m of s.modules) {
      const mod = moduleBySlug.get(m)
      if (!mod) fail(`section ${t.slug}/${s.slug}: unknown module "${m}"`)
      else if (mod.track !== t.slug || mod.section !== s.slug) fail(`module ${mod.code} is listed in ${t.slug}/${s.slug} but says ${mod.track}/${mod.section}`)
    }
  }
}
const listedInSections = new Set(TRACKS.flatMap((t) => t.sections.flatMap((s) => s.modules)))
for (const m of MODULES) {
  if (!listedInSections.has(m.slug) && !(`${m.track}/${m.slug}` in MODULE_HOMES)) fail(`module ${m.code} is in no section`)
  for (const p of m.prerequisites) if (!moduleBySlug.has(p)) fail(`module ${m.code}: unknown prerequisite "${p}"`)
  for (const l of [...m.lessons, ...m.seeAlso]) if (!lessonBySlug.has(l)) fail(`module ${m.code}: unknown lesson "${l}"`)
  // A reading plan must list the module's lessons exactly, in order, or a lesson drops off the page.
  if (m.groups && m.groups.flatMap((g) => g.lessons).join() !== m.lessons.join()) fail(`module ${m.code}: groups do not list its lessons exactly, in order`)
}

// One canonical home per lesson (DATA-03)
const homes = new Map<string, string[]>()
for (const m of MODULES) for (const l of m.lessons) homes.set(l, [...(homes.get(l) ?? []), m.slug])
for (const l of LESSONS) {
  const listed = homes.get(l.slug) ?? []
  if (!moduleBySlug.has(l.home)) fail(`lesson ${l.slug}: unknown home "${l.home}"`)
  // An excluded lesson is never published. It may stay out of every module's
  // reading list (a consolidated module replaces it); `home` still names the
  // module it was retired from, which keys its RENAMED entry.
  const retired = l.publish === 'excluded' && listed.length === 0
  if (!retired && (listed.length !== 1 || listed[0] !== l.home)) fail(`lesson ${l.slug}: home is ${l.home} but listed as a home lesson in [${listed.join(', ')}]`)
  if (l.publish === 'credited' && !l.credit) fail(`lesson ${l.slug}: credited without a credit line`)
  // Decision 7 (ENH-28): every credit line records whether we may publish it.
  if (l.credit && !l.rights) fail(`lesson ${l.slug}: credit line without rights ('licensed', 'permitted' or 'rewrite')`)
  if (l.rights && !l.credit) fail(`lesson ${l.slug}: rights without a credit line`)
}
// Lessons that share a credit line share its rights status (one status per line on /library/credits).
{
  const byCredit = new Map<string, Set<string>>()
  for (const l of LESSONS) if (l.credit) byCredit.set(l.credit, (byCredit.get(l.credit) ?? new Set()).add(l.rights ?? '—'))
  for (const [credit, rights] of byCredit) if (rights.size > 1) fail(`credit line "${credit.slice(0, 60)}…" has mixed rights: ${[...rights].join(', ')}`)
}

// Status agrees with content
for (const m of MODULES) {
  const count = m.lessons.length + m.seeAlso.length
  if ((m.status === 'ready' || m.status === 'partly') && count === 0) fail(`module ${m.code} is ${m.status} but has no lessons`)
  if (m.status === 'coming-soon' && count > 0) fail(`module ${m.code} is coming-soon but lists lessons`)
  if (m.status === 'partly' && !m.gapNote) fail(`module ${m.code} is partly ready without a gapNote`)
}

// Lesson slices (CurriculumLesson.sections). Lessons that share a source must split
// it cleanly: no H2 published twice, no H2 silently dropped (it must be published or
// listed in an `exclude`), and at most one "main" part without `include`. Headings
// are validated against the source file; when root sources are absent (a deploy
// rooted at site/) the source-reading part is skipped.
{
  const REPO_ROOT = resolve(import.meta.dirname, '..', '..')
  const bySource = new Map<string, CurriculumLesson[]>()
  for (const l of LESSONS) bySource.set(l.source, [...(bySource.get(l.source) ?? []), l])
  for (const [source, lessons] of bySource) {
    const sliced = lessons.filter((l) => l.sections)
    if (!sliced.length) continue
    const names = lessons.map((l) => l.slug).join(', ')
    for (const l of sliced) {
      const { include, exclude } = l.sections!
      if (include && exclude) fail(`lesson ${l.slug}: sections has both include and exclude; use one`)
      if (!include?.length && !exclude?.length) fail(`lesson ${l.slug}: sections lists no headings`)
      if (l.kind !== 'sync') fail(`lesson ${l.slug}: only synced lessons can have sections`)
    }
    if (lessons.length > 1) {
      if (sliced.length !== lessons.length) fail(`source ${source} is shared by [${names}], so every one of them needs sections`)
      if (lessons.filter((l) => !l.sections?.include).length > 1) fail(`source ${source}: more than one of [${names}] lacks include, so they overlap`)
    }
    const abs = resolve(REPO_ROOT, source)
    if (!existsSync(abs)) continue
    if (statSync(abs).isDirectory() || !abs.endsWith('.md')) {
      fail(`source ${source}: sections need a single .md source file`)
      continue
    }
    const headings = splitH2(stripFrontMatter(readFileSync(abs, 'utf8'))).sections.map((s: { heading: string }) => s.heading)
    const owner = new Map<string, string>()
    for (const l of sliced) {
      for (const h of unknownHeadings(l, headings)) fail(`lesson ${l.slug}: heading "${h}" is not a "## " heading of ${source}`)
      // A heading repeated within one lesson (the roadmap's "## Goal" per topic) is one owner.
      for (const h of new Set(publishedHeadings(l, headings))) {
        if (owner.has(h)) fail(`source ${source}: "## ${h}" is published by both ${owner.get(h)} and ${l.slug}`)
        else owner.set(h, l.slug)
      }
    }
    const excluded = new Set(sliced.flatMap((l) => l.sections!.exclude ?? []))
    for (const h of lessons.length > 1 ? headings : []) {
      if (!owner.has(h) && !excluded.has(h)) fail(`source ${source}: "## ${h}" is published by none of [${names}]; include it in one or exclude it on purpose`)
    }
  }
}

// Retired lesson redirects (RENAMED, one file per track in src/lib/consolidation/).
// Every value must be a lesson published right now, reached in one hop: a value
// that is itself a RENAMED key would make next.config.ts emit a redirect chain.
// A key that is still published would shadow a live page with a redirect.
{
  const published = new Set(
    LESSONS.filter(
      (l) => l.kind === 'sync' && lessonDecision(l) === 'publish' && moduleBySlug.get(l.home)?.lessons.includes(l.slug),
    ).map((l) => `${l.home}/${l.slug}`),
  )
  for (const [from, to] of Object.entries(RENAMED)) {
    const mod = from.split('/')[0]
    if (!moduleBySlug.has(mod) && !(mod in RETIRED_MODULES)) fail(`RENAMED key ${from} names an unknown module`)
    if (published.has(from)) fail(`RENAMED key ${from} is still a published lesson; drop the entry or retire the lesson`)
    if (to === null) continue
    if (to in RENAMED) fail(`RENAMED chain: ${from} → ${to} → ${RENAMED[to]}; point ${from} straight at the final lesson`)
    else if (!published.has(to)) fail(`RENAMED maps ${from} to ${to}, which is not a published lesson`)
  }
}

for (const [from, to] of Object.entries(RETIRED_MODULES)) {
  if (moduleBySlug.has(from)) fail(`RETIRED_MODULES key ${from} is still a module`)
  if (!moduleBySlug.has(to)) fail(`RETIRED_MODULES maps ${from} to ${to}, which is not a module`)
}

// The whole redirect map (ENH-15). A destination that another entry's source matches
// would cost a second hop, and a repeated source never applies. Sources match as Next.js
// matches them (`:p*` zero or more segments, `:p+` one or more, `:p` one); a destination
// that is itself a pattern is left to check:routes.
{
  const matcher = (source: string) =>
    new RegExp(
      `^${source
        .replace(/\./g, '\\.')
        .replace(/\/:\w+\*/g, '(?:/.*)?')
        .replace(/\/:\w+\+/g, '/.+')
        .replace(/:\w+/g, '[^/]+')}$`,
    )
  const sources = REDIRECTS.map((r) => ({ ...r, re: matcher(r.source) }))
  const seen = new Set<string>()
  for (const r of REDIRECTS) {
    if (seen.has(r.source)) fail(`redirect source ${r.source} is listed twice in src/lib/redirects.ts`)
    seen.add(r.source)
    if (r.destination.includes(':')) continue
    // A hash (#recall-card) opens part of the page; the path is what could chain.
    const next = sources.find((s) => s.re.test(r.destination.split('#')[0]))
    if (next) fail(`redirect chain: ${r.source} → ${r.destination} → ${next.destination}; point ${r.source} straight at the final page`)
  }
}

// Area pages drop the track from the URL (/design/<slug>, /practice/<slug>; MODULE_AREAS
// in src/lib/scenario.ts), so a slug may appear once per area. Slugs never change
// (progress keys on them), so a clash means renaming the new page, not the old one.
// /practice/story-bank is a static page beside the worksheets.
{
  const site = JSON.parse(readFileSync(resolve(import.meta.dirname, '../content/manifest.json'), 'utf8'))
  for (const area of new Set(Object.values(MODULE_AREAS))) {
    const mods = site.modules.filter((m: { id: string }) => MODULE_AREAS[m.id] === area)
    if (mods.length === 0) fail(`content/manifest.json has no module served at ${area}`)
    const slugs: string[] = mods.flatMap((m: { tracks: { scenarios: { slug: string }[] }[] }) =>
      m.tracks.flatMap((t) => t.scenarios.map((s) => s.slug)),
    )
    unique(`${area} page`, area === '/practice' ? [...slugs, 'story-bank'] : slugs)
  }

  // One name per thing (ENH-20): a listing shows the same title as the page it opens.
  // A `live` lesson is listed under its curriculum title but opens a case or worksheet,
  // and a review is listed under its REVIEWS title but opens its final-week lesson.
  const pageTitle = new Map<string, string>()
  for (const m of site.modules) {
    for (const t of m.tracks) for (const sc of t.scenarios) pageTitle.set(scenarioHref({ moduleId: m.id, trackId: t.id, slug: sc.slug }), sc.title)
  }
  const learn = JSON.parse(readFileSync(resolve(import.meta.dirname, '../content/learn/manifest.json'), 'utf8')).lessons as { slug: string; kind: string; href: string; title: string }[]
  for (const l of learn) {
    const title = l.kind === 'live' ? pageTitle.get(l.href.split('#')[0]) : undefined
    if (title && title !== l.title) fail(`lesson ${l.slug}: listed as "${l.title}" but its page is titled "${title}"; use the page title in curriculum.ts`)
  }
  // Study time (ENH-22): a module with lessons of its own is timed by their reading plus
  // `practiceMinutes` (studyTime in src/lib/study-time.ts); only a module without any
  // carries a hand estimate, so no hand number can drift from the lessons.
  const synced = new Set(learn.map((l) => l.slug))
  for (const m of MODULES) {
    const own = m.lessons.some((slug) => synced.has(slug))
    if (own && m.estMinutes !== undefined) fail(`module ${m.slug}: its time is its lessons' reading plus practiceMinutes; remove estMinutes`)
    if (!own && m.estMinutes === undefined) fail(`module ${m.slug}: has no lessons of its own, so it needs an estMinutes estimate`)
  }
  for (const r of REVIEWS) {
    const lesson = lessonBySlug.get(r.dir)
    if (!lesson) fail(`review ${r.number}: no lesson "${r.dir}"`)
    else if (lesson.title !== r.title) fail(`review ${r.number}: titled "${r.title}" in editorial.ts but its lesson is "${lesson.title}"`)
  }
}

// Interview hubs (DATA-07). They live at /interview/hubs/<slug>, so an interview-practice
// module called "hubs" would be shadowed by that static segment.
unique('interview hub', INTERVIEW_HUBS.map((h) => h.slug))
for (const m of MODULES) if (m.track === 'interview-practice' && m.slug === 'hubs') fail('module slug "hubs" is taken by /interview/hubs')
for (const h of INTERVIEW_HUBS) {
  if (h.practice.length < 2 || h.modules.length < 1) fail(`hub ${h.slug}: needs at least two practice lessons and one module`)
  for (const s of h.practice) {
    const l = lessonBySlug.get(s)
    if (!l) fail(`hub ${h.slug}: unknown practice lesson "${s}"`)
    else if (lessonDecision(l) !== 'publish') fail(`hub ${h.slug}: practice lesson "${s}" is not published (${lessonDecision(l)})`)
  }
  for (const s of h.modules) {
    const m = moduleBySlug.get(s)
    if (!m) fail(`hub ${h.slug}: unknown module "${s}"`)
    else if (m.status === 'on-hold' || m.status === 'coming-soon') fail(`hub ${h.slug}: module "${s}" is ${m.status}`)
  }
}

// Module checkpoints (DATA-10): one per published T2–T6 module, 6 to 10 well-formed items.
const CHECKPOINT_TRACKS = ['llm-and-retrieval', 'agentic-systems', 'production-ai', 'ai-systems-design', 'forward-deployed']
unique('checkpoint module', CHECKPOINTS.map((c) => c.module))
for (const c of CHECKPOINTS) {
  const m = moduleBySlug.get(c.module)
  if (!m) fail(`checkpoint: unknown module "${c.module}"`)
  else if (!CHECKPOINT_TRACKS.includes(m.track)) fail(`checkpoint ${c.module}: module is in ${m.track}, not a T2–T6 track`)
  else if (m.status !== 'ready' && m.status !== 'partly') fail(`checkpoint ${c.module}: module is ${m.status}`)
  if (c.items.length < 6 || c.items.length > 10) fail(`checkpoint ${c.module}: has ${c.items.length} items; needs 6 to 10`)
  const ids = new Set<string>()
  for (const i of c.items) {
    if (ids.has(i.id)) fail(`checkpoint ${c.module}: duplicate item id "${i.id}"`)
    ids.add(i.id)
    const options = i.options.map((o) => o.id)
    if (options.length < 2 || new Set(options).size !== options.length) fail(`checkpoint ${c.module}/${i.id}: needs two or more options with unique ids`)
    if (!options.includes(i.correctOptionId)) fail(`checkpoint ${c.module}/${i.id}: correct option "${i.correctOptionId}" is not an option`)
    if (!i.prompt.trim() || !i.explanation.trim() || !i.skillId.trim()) fail(`checkpoint ${c.module}/${i.id}: prompt, explanation and skillId are required`)
  }
}

const cycle = findPrerequisiteCycle(MODULES)
if (cycle) fail(`prerequisite cycle: ${cycle.join(' → ')}`)

if (process.argv.includes('--homes')) {
  const usedBy = new Map<string, string[]>()
  for (const m of MODULES) for (const l of m.seeAlso) usedBy.set(l, [...(usedBy.get(l) ?? []), m.code])
  console.log('| Lesson | Home | Also used by | Kind |\n|---|---|---|---|')
  for (const l of LESSONS) {
    const also = usedBy.get(l.slug)
    if (also) console.log(`| \`${l.slug}\` | ${moduleBySlug.get(l.home)?.code} | ${also.join(', ')} | ${l.kind} |`)
  }
  console.log(`\n${usedBy.size} lessons are used by more than one module.\n`)
}

const by = (k: string) => MODULES.filter((m) => m.status === k).length
console.log(
  `${TRACKS.length} tracks, ${TRACKS.reduce((n, t) => n + t.sections.length, 0)} sections, ${MODULES.length} modules ` +
    `(${by('ready')} ready, ${by('partly')} partly, ${by('coming-soon')} coming soon, ${by('on-hold')} on hold), ${LESSONS.length} lessons`,
)
if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`)
  process.exit(1)
}
console.log('✓ curriculum is consistent')
