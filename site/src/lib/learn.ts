import 'server-only'

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cache } from 'react'
import { marked } from 'marked'
import { LESSONS, MODULES, TRACKS } from './curriculum'
import type {
  CurriculumLesson,
  CurriculumModule,
  CurriculumSection,
  CurriculumTrack,
  LessonKind,
  PublishDecision,
} from './curriculum-types'
import { parseReading, type ReadingDocument } from './reading'
import type { ModuleInput } from '@/components/learn/progress-model'

/**
 * Server-only loaders for the Learn area (plan §8, task FE-04).
 *
 * The curriculum (`curriculum.ts`) says which tracks, sections, modules and lessons
 * exist. The Learn sync (`scripts/learn.mjs`) says which lessons were actually
 * published: it writes `content/learn/manifest.json` and one markdown file per
 * synced lesson. This module joins the two, so a page never links to a lesson that
 * was not published.
 *
 * `server-only` turns an accidental import from a client component into a clear
 * build error, because this file reads the disk.
 */

const LEARN_DIR = join(process.cwd(), 'content', 'learn')

/** One entry of `content/learn/manifest.json`, as written by `scripts/learn.mjs`. */
export type LearnLesson = {
  slug: string
  title: string
  /** Track slug of the home module. */
  track: string
  /** Home module slug. */
  module: string
  kind: LessonKind
  publish: Exclude<PublishDecision, 'pending' | 'excluded'>
  source: string
  credit?: string
  estMinutes?: number
  /** `/learn/...` for synced lessons, the live page for `live` ones. */
  href: string
}

export const getLearnManifest = cache((): LearnLesson[] => {
  const file = join(LEARN_DIR, 'manifest.json')
  if (!existsSync(file)) {
    throw new Error('content/learn/manifest.json is missing. Run `npm run sync` before building.')
  }
  return (JSON.parse(readFileSync(file, 'utf8')) as { lessons: LearnLesson[] }).lessons
})

const publishedBySlug = cache(() => new Map(getLearnManifest().map((l) => [l.slug, l])))

export const learnHref = {
  index: () => '/learn',
  track: (track: string) => `/learn/${track}`,
  module: (m: Pick<CurriculumModule, 'track' | 'slug'>) => `/learn/${m.track}/${m.slug}`,
}

// ── Lookups ────────────────────────────────────────────────────────────────

export const getTracks = (): CurriculumTrack[] => TRACKS

export const getTrack = (slug: string): CurriculumTrack | undefined => TRACKS.find((t) => t.slug === slug)

export const getModuleBySlug = (slug: string): CurriculumModule | undefined => MODULES.find((m) => m.slug === slug)

/** The module, only when it belongs to that track (so `/learn/t2/<t3 module>` 404s). */
export function getModule(trackSlug: string, moduleSlug: string): CurriculumModule | undefined {
  const mod = getModuleBySlug(moduleSlug)
  return mod && mod.track === trackSlug ? mod : undefined
}

export function getSection(mod: CurriculumModule): CurriculumSection | undefined {
  return getTrack(mod.track)?.sections.find((s) => s.slug === mod.section)
}

export const trackModules = (track: CurriculumTrack): CurriculumModule[] =>
  track.sections.flatMap((s) => s.modules.map((slug) => getModuleBySlug(slug)).filter((m): m is CurriculumModule => !!m))

export const getCurriculumLesson = (slug: string): CurriculumLesson | undefined => LESSONS.find((l) => l.slug === slug)

/** The published (manifest) entry for a lesson slug, or undefined when it was not published. */
export const getPublishedLesson = (slug: string): LearnLesson | undefined => publishedBySlug().get(slug)

// ── Reading lists ──────────────────────────────────────────────────────────

export type ReadingList = {
  /** Published lessons whose home is this module, in teaching order. */
  home: LearnLesson[]
  /** Published lessons homed elsewhere that this module also uses. */
  seeAlso: LearnLesson[]
  /**
   * The list that counts for this module's progress and completion: the home
   * lessons, or the see-also lessons when the module owns none (T1.4, T1.5; see
   * specs/2026-10-05-canonical-homes.md).
   */
  main: LearnLesson[]
  /** True when `main` is the see-also list. */
  seeAlsoIsMain: boolean
}

const published = (slugs: string[]) =>
  slugs.map((s) => getPublishedLesson(s)).filter((l): l is LearnLesson => !!l)

export function readingList(mod: CurriculumModule): ReadingList {
  // Gap modules publish nothing; never list their lessons, even if a stale manifest has them.
  if (mod.status === 'coming-soon' || mod.status === 'on-hold') {
    return { home: [], seeAlso: [], main: [], seeAlsoIsMain: false }
  }
  const home = published(mod.lessons)
  const seeAlso = published(mod.seeAlso)
  const seeAlsoIsMain = home.length === 0 && seeAlso.length > 0
  return { home, seeAlso, main: seeAlsoIsMain ? seeAlso : home, seeAlsoIsMain }
}

/** Lesson slug → minutes, for the progress islands (the curriculum carries no estimates). */
export function minutesFor(lessons: LearnLesson[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const l of lessons) if (l.estMinutes && l.estMinutes > 0) out[l.slug] = l.estMinutes
  return out
}

/** Minutes for every published lesson. Small enough to hand to the /learn overview island. */
export const allMinutes = cache(() => minutesFor(getLearnManifest()))

export const totalMinutes = (lessons: LearnLesson[]) => lessons.reduce((s, l) => s + (l.estMinutes ?? 0), 0)

// ── Static params ──────────────────────────────────────────────────────────

export const trackParams = () => TRACKS.map((t) => ({ trackSlug: t.slug }))

export const moduleParams = () => MODULES.map((m) => ({ trackSlug: m.track, moduleSlug: m.slug }))

/**
 * One route per synced, published lesson. `live` lessons have no Learn page: they
 * link to their existing `/modules/...` or `/fde-last-day-prep` page instead.
 *
 * A manifest entry whose markdown file is missing fails the build here, instead of
 * shipping an empty lesson page (plan §8, "Data fetching and errors").
 */
export function lessonParams() {
  return getLearnManifest()
    .filter((l) => l.kind === 'sync')
    .map((l) => {
      if (!existsSync(lessonFile(l))) {
        throw new Error(`Lesson file missing for ${l.href}: ${lessonFile(l)}. Run \`npm run sync\`.`)
      }
      return { trackSlug: l.track, moduleSlug: l.module, lessonSlug: l.slug }
    })
}

const lessonFile = (l: LearnLesson) => join(LEARN_DIR, l.track, l.module, `${l.slug}.md`)

// ── Lesson pages ───────────────────────────────────────────────────────────

export type LessonPage = {
  lesson: LearnLesson
  track: CurriculumTrack
  section: CurriculumSection | undefined
  module: CurriculumModule
  doc: ReadingDocument
  /** "From the FDE Handbook". Names the collection, never the repository path. */
  sourceNote: string
  /** Credit line as inline HTML (it may carry italics), when `publish` is `credited`. */
  creditHtml: string | null
  /** Siblings in the module's home list. */
  prev: LearnLesson | null
  next: LearnLesson | null
  index: number
  count: number
  /** Minutes per lesson in the module, for the progress island. */
  minutes: Record<string, number>
}

export const getLessonPage = cache((trackSlug: string, moduleSlug: string, lessonSlug: string): LessonPage | null => {
  const lesson = getPublishedLesson(lessonSlug)
  const mod = getModule(trackSlug, moduleSlug)
  const track = getTrack(trackSlug)
  if (!lesson || !mod || !track || lesson.kind !== 'sync' || lesson.module !== mod.slug) return null

  const file = lessonFile(lesson)
  if (!existsSync(file)) throw new Error(`Lesson file missing: ${file}. Run \`npm run sync\`.`)
  const doc = parseReading(readFileSync(file, 'utf8'), 'lesson')

  const siblings = readingList(mod).home
  const index = siblings.findIndex((l) => l.slug === lesson.slug)
  return {
    lesson,
    track,
    section: getSection(mod),
    module: mod,
    doc,
    sourceNote: sourceNote(lesson.source),
    creditHtml:
      lesson.publish === 'credited' && lesson.credit
        ? (marked.parseInline(lesson.credit, { async: false }) as string)
        : null,
    prev: index > 0 ? siblings[index - 1] : null,
    next: index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null,
    index,
    count: siblings.length,
    minutes: minutesFor(siblings),
  }
})

/** Collection names for the source note. Longest prefix wins; the path itself is never shown. */
const SOURCE_NOTES: [prefix: string, note: string][] = [
  ['01_Concept_Tutorials/FDE_Handbook/', 'From the FDE Handbook'],
  ['01_Concept_Tutorials/RAG_and_Agent_Topic_Guides/', 'From the RAG and Agent Topic Guides'],
  ['01_Concept_Tutorials/Agentic_System_Design_Book/', 'From the Agentic System Design Book'],
  ['01_Concept_Tutorials/Production_and_Platform_Judgment/', 'From the Production and Platform Judgement Guides'],
  ['01_Concept_Tutorials/GenAI_Engineering_Modules/', 'From the GenAI Engineering Modules'],
  ['01_Concept_Tutorials/Cost_and_Latency_Optimization/', 'From the Cost and Latency Optimisation Playbook'],
  ['01_Concept_Tutorials/', 'From the Concept Tutorials'],
  ['02_System_Design_Case_Studies/Classic_Design_Walkthroughs/', 'From the Classic Design Walkthroughs'],
  ['02_System_Design_Case_Studies/', 'From the System Design Case Studies'],
  ['03_Practice_Worksheets_and_Keys/Mock_Interviews/', 'From the Mock Interviews'],
  ['03_Practice_Worksheets_and_Keys/Problem_Decomposition_Bank/', 'From the Problem Decomposition Bank'],
  ['03_Practice_Worksheets_and_Keys/', 'From the Practice Worksheets'],
  ['05_FDE_Delivery_and_Scoping/Delivery_Framework/', 'From the FDE Delivery Framework'],
  ['05_FDE_Delivery_and_Scoping/', 'From the FDE Delivery and Scoping Guides'],
  ['00_Start_Here/', 'From the Start Here Guides'],
]

export function sourceNote(source: string): string {
  const match = SOURCE_NOTES.filter(([p]) => source.startsWith(p)).sort((a, b) => b[0].length - a[0].length)[0]
  return match ? match[1] : 'From the Forward Deployed library'
}

// ── Formatting ─────────────────────────────────────────────────────────────

export const REQUIREMENT_LABEL: Record<CurriculumTrack['required'], string> = {
  yes: 'Required',
  no: 'Optional',
  'fde-path': 'Required on the FDE path',
  candidates: 'Required for candidates',
}

/** Whether a track counts as required for the /learn filter. */
export const isRequired = (t: CurriculumTrack) => t.required !== 'no'

/** "1 h 30 min", "45 min", "3 h". */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${Math.max(1, Math.round(minutes))} min`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m ? `${h} h ${m} min` : `${h} h`
}

/** Inline markdown (backticks, emphasis) in a curriculum field, as HTML. */
export const inlineHtml = (s: string) => marked.parseInline(capitalise(s), { async: false }) as string

/** Sentence-case first letter, for curriculum fields written in lower case. */
export const capitalise = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s)

/**
 * Related modules. The curriculum has no explicit "related" field, so this derives
 * them, closest first: modules that share a lesson with this one (in either
 * direction), then the other modules in its section. Gap modules are left out, since
 * the point is to send the reader somewhere with material.
 */
export function relatedModules(mod: CurriculumModule, limit = 4): CurriculumModule[] {
  const out: CurriculumModule[] = []
  const add = (m: CurriculumModule | undefined) => {
    if (!m || m.slug === mod.slug || m.status === 'coming-soon' || m.status === 'on-hold') return
    if (!out.some((x) => x.slug === m.slug)) out.push(m)
  }
  for (const slug of mod.seeAlso) add(getModuleBySlug(getCurriculumLesson(slug)?.home ?? ''))
  for (const m of MODULES) if (m.seeAlso.some((s) => mod.lessons.includes(s))) add(m)
  for (const slug of getSection(mod)?.modules ?? []) add(getModuleBySlug(slug))
  return out.slice(0, limit)
}

// ── Island inputs ──────────────────────────────────────────────────────────

/** Everything a progress island needs about one module (see components/learn/progress-model.ts). */
export function moduleInput(mod: CurriculumModule): ModuleInput {
  const list = readingList(mod)
  return {
    slug: mod.slug,
    status: mod.status,
    reading: list.main.map((l) => l.slug),
    minutes: minutesFor(list.main),
    prereqs: mod.prerequisites
      .map((slug) => getModuleBySlug(slug))
      .filter((m): m is CurriculumModule => !!m)
      .map((m) => ({ slug: m.slug, reading: readingList(m).main.map((l) => l.slug) }))
      // A prerequisite with nothing to read (Coming soon, On hold) cannot be completed,
      // so it must not block anything.
      .filter((p) => p.reading.length > 0),
  }
}
