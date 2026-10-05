/**
 * Integrity check and canonical-home report for `src/lib/curriculum.ts`
 * (Phase 0 tasks DATA-03 and UX-01). Runs under plain `node` via native
 * TypeScript type stripping, like check-parse.ts:
 *   npm run check:curriculum            checks only
 *   npm run check:curriculum -- --homes also prints every multi-use lesson
 *
 * Fails on: duplicate or malformed slugs, track slugs that collide with the live
 * site's track ids, dangling references, a lesson without exactly one home,
 * prerequisite cycles, and module statuses that contradict their lessons.
 */
import { LESSONS, MODULES, TRACKS } from '../src/lib/curriculum.ts'
import { TRACKS as LIVE_TRACKS } from '../src/lib/editorial.ts'
import type { CurriculumModule } from '../src/lib/curriculum-types.ts'

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
  if (!listedInSections.has(m.slug)) fail(`module ${m.code} is in no section`)
  for (const p of m.prerequisites) if (!moduleBySlug.has(p)) fail(`module ${m.code}: unknown prerequisite "${p}"`)
  for (const l of [...m.lessons, ...m.seeAlso]) if (!lessonBySlug.has(l)) fail(`module ${m.code}: unknown lesson "${l}"`)
}

// One canonical home per lesson (DATA-03)
const homes = new Map<string, string[]>()
for (const m of MODULES) for (const l of m.lessons) homes.set(l, [...(homes.get(l) ?? []), m.slug])
for (const l of LESSONS) {
  const listed = homes.get(l.slug) ?? []
  if (!moduleBySlug.has(l.home)) fail(`lesson ${l.slug}: unknown home "${l.home}"`)
  if (listed.length !== 1 || listed[0] !== l.home) fail(`lesson ${l.slug}: home is ${l.home} but listed as a home lesson in [${listed.join(', ')}]`)
  if (l.publish === 'credited' && !l.credit) fail(`lesson ${l.slug}: credited without a credit line`)
}

// Status agrees with content
for (const m of MODULES) {
  const count = m.lessons.length + m.seeAlso.length
  if ((m.status === 'ready' || m.status === 'partly') && count === 0) fail(`module ${m.code} is ${m.status} but has no lessons`)
  if (m.status === 'coming-soon' && count > 0) fail(`module ${m.code} is coming-soon but lists lessons`)
  if (m.status === 'partly' && !m.gapNote) fail(`module ${m.code} is partly ready without a gapNote`)
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
