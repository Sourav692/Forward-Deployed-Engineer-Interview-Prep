/**
 * Self-check for `src/lib/paths.ts` (tasks UX-05, FE-10). Runs under plain `node`
 * via native TypeScript type stripping: `npm run check:paths`.
 *
 * Fails when: the module table in paths.ts drifts from curriculum.ts; a path flags an
 * unknown slug or leaves a module unflagged; a module with no lessons yet (coming soon
 * or on hold) is required, recommended or optional instead of `later` or `skip`; a
 * path's `estHours` drifts from its required and recommended modules' study time
 * (lesson reading plus practice, `studyTime`, ENH-22); a start module
 * is not required and published; a variant points at a missing base path; a diagnostic
 * option names an unknown path or module; or scoring fails to return a base path for
 * the all-first, all-last or any single-question answer set.
 */
import { readFileSync } from 'node:fs'
import { MODULES, TRACKS } from '../src/lib/curriculum.ts'
import { studyTime } from '../src/lib/study-time.ts'
import {
  BASE_PATHS,
  DIAGNOSTIC,
  FLAG_ORDER,
  PATHS,
  GAP_MODULES,
  PERSONAS,
  TRACK_MODULES,
  getPathById,
  scoreDiagnostic,
  weeklyPlan,
} from '../src/lib/paths.ts'

/** Lesson slug -> reading minutes, from the Learn sync manifest (`npm run sync` first). */
const lessonMinutes: Record<string, number> = Object.fromEntries(
  (JSON.parse(readFileSync(new URL('../content/learn/manifest.json', import.meta.url), 'utf8')).lessons as { slug: string; estMinutes?: number }[]).map((l) => [l.slug, l.estMinutes ?? 0]),
)

const errors: string[] = []
const fail = (msg: string) => errors.push(msg)

const bySlug = new Map(MODULES.map((m) => [m.slug, m]))
const baseIds = new Set(BASE_PATHS.map((p) => p.id))

// The mirrored module table matches the curriculum, track by track and in order.
for (const t of TRACKS) {
  const expected = t.sections.flatMap((s) => s.modules)
  const actual = TRACK_MODULES[t.slug] ?? []
  if (expected.join() !== actual.join()) fail(`TRACK_MODULES["${t.slug}"] is [${actual}] but curriculum has [${expected}]`)
}
for (const slug of Object.keys(TRACK_MODULES)) if (!TRACKS.some((t) => t.slug === slug)) fail(`TRACK_MODULES has unknown track "${slug}"`)

const gaps = MODULES.filter((m) => m.status === 'coming-soon' || m.status === 'on-hold').map((m) => m.slug)
if ([...gaps].sort().join() !== [...GAP_MODULES].sort().join()) fail(`GAP_MODULES is [${GAP_MODULES}] but coming-soon and on-hold modules are [${gaps}]`)

const ids = new Set<string>()
for (const p of PATHS) {
  if (ids.has(p.id)) fail(`duplicate path id "${p.id}"`)
  ids.add(p.id)
  if (!PERSONAS.some((x) => x.id === p.persona)) fail(`${p.id}: unknown persona "${p.persona}"`)
  if (p.variantOf && !baseIds.has(p.variantOf)) fail(`${p.id}: variantOf "${p.variantOf}" is not a base path`)

  for (const [slug, flag] of Object.entries(p.moduleFlags)) {
    if (!bySlug.has(slug)) fail(`${p.id}: moduleFlags key "${slug}" is not a module slug`)
    if (!FLAG_ORDER.includes(flag)) fail(`${p.id}: "${slug}" has invalid flag "${flag}"`)
  }
  for (const m of MODULES) {
    if (!(m.slug in p.moduleFlags)) fail(`${p.id}: module "${m.slug}" is not flagged`)
    // ON-05: a module with no lessons is never something a path asks for.
    const gap = m.status === 'coming-soon' || m.status === 'on-hold'
    if (gap && !['later', 'skip'].includes(p.moduleFlags[m.slug])) fail(`${p.id}: ${m.status} module "${m.slug}" is "${p.moduleFlags[m.slug]}"; it must be "later" or "skip"`)
    if (!gap && p.moduleFlags[m.slug] === 'later') fail(`${p.id}: "${m.slug}" has lessons, so it cannot be "later"`)
  }

  const minutes = MODULES.filter((m) => p.moduleFlags[m.slug] === 'required' || p.moduleFlags[m.slug] === 'recommended').reduce(
    (s, m) => s + studyTime(m, lessonMinutes).total,
    0,
  )
  const hours = Math.round(minutes / 60)
  if (hours !== p.estHours) fail(`${p.id}: estHours is ${p.estHours} but required and recommended modules add up to ${hours}`)

  const start = bySlug.get(p.startModule)
  if (!start) fail(`${p.id}: startModule "${p.startModule}" is not a module slug`)
  else {
    if (p.moduleFlags[start.slug] !== 'required') fail(`${p.id}: startModule "${start.slug}" must be required on the path`)
    if (start.status !== 'ready' && start.status !== 'partly') fail(`${p.id}: startModule "${start.slug}" has no published lessons`)
  }
  if (p.readinessCriteria.length === 0) fail(`${p.id}: no readiness criteria`)
}
for (const persona of PERSONAS) {
  const path = getPathById(persona.pathId)
  if (!path || path.variantOf) fail(`persona "${persona.id}": pathId "${persona.pathId}" is not a base path`)
}

// Diagnostic data.
if (DIAGNOSTIC.length !== 10) fail(`diagnostic has ${DIAGNOSTIC.length} questions, expected 10`)
for (const q of DIAGNOSTIC) {
  for (const o of q.options) {
    for (const id of Object.keys(o.weights)) if (!baseIds.has(id)) fail(`${q.id} "${o.label}": weight for unknown path "${id}"`)
    for (const slug of o.canSkip ?? []) if (!bySlug.has(slug)) fail(`${q.id} "${o.label}": canSkip "${slug}" is not a module slug`)
  }
}

// Scoring returns a base path for the extremes and for every single answer.
const answerSets: Record<string, number>[] = [
  {},
  Object.fromEntries(DIAGNOSTIC.map((q) => [q.id, 0])),
  Object.fromEntries(DIAGNOSTIC.map((q) => [q.id, q.options.length - 1])),
  ...DIAGNOSTIC.flatMap((q) => q.options.map((_, i) => ({ [q.id]: i }))),
]
for (const answers of answerSets) {
  const r = scoreDiagnostic(answers)
  if (!baseIds.has(r.pathId)) fail(`scoreDiagnostic(${JSON.stringify(answers)}) returned "${r.pathId}"`)
  if (!(r.weeklyHours > 0)) fail(`scoreDiagnostic(${JSON.stringify(answers)}) returned weeklyHours ${r.weeklyHours}`)

  // The diagnostic's weekly plan (ON onboarding): only ready material, no skipped module,
  // every planned minute counted, weeks in order.
  const path = PATHS.find((p) => p.id === r.pathId)!
  const minutesOf = (slug: string) => studyTime(bySlug.get(slug)!, lessonMinutes).total
  const plan = weeklyPlan(path, r.weeklyHours, r.canSkip, minutesOf)
  const planned = plan.weeks.flatMap((w) => w.modules)
  const where = `weeklyPlan(${r.pathId}, ${JSON.stringify(answers)})`
  for (const slug of planned) {
    const m = bySlug.get(slug)!
    if (m.status === 'coming-soon' || m.status === 'on-hold') fail(`${where} plans ${m.status} module "${slug}"`)
    if (r.canSkip.includes(slug)) fail(`${where} plans "${slug}", which the answers say may be skipped`)
  }
  if (planned.reduce((s, slug) => s + minutesOf(slug), 0) !== plan.minutes) fail(`${where} minutes do not add up`)
  if (plan.weeks.some((w, i) => i > 0 && w.week <= plan.weeks[i - 1].week) || (plan.weeks.at(-1)?.week ?? 0) > plan.totalWeeks) fail(`${where} weeks out of order`)
}

const allFirst = scoreDiagnostic(answerSets[1]).pathId
const allLast = scoreDiagnostic(answerSets[2]).pathId

if (errors.length) {
  console.error(`check:paths failed with ${errors.length} error(s):`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}
console.log(`check:paths ok: ${PATHS.length} paths × ${MODULES.length} modules, ${DIAGNOSTIC.length} questions (all-first → ${allFirst}, all-last → ${allLast}).`)
