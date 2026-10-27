import type { Block, Section, ParsedDocument } from './parse'
import type { ReadingDocument } from './reading'

/**
 * Types and helpers shared by server and client code.
 *
 * These deliberately live apart from `content.ts`, which reads the filesystem. A
 * client component importing a *value* from that module would pull `node:fs` into
 * the browser bundle and fail the build, so anything both sides need belongs here.
 */

export type ScenarioMeta = {
  slug: string
  order: number
  title: string
  /** Reading pages only: the page's tabs, in display order. */
  tabs?: ReadingTab[]
  /** Reading time (`readingMinutes`): a case's tabs summed, or a worksheet. */
  minutes?: number
  /** `YYYY-MM-DD` the sources last changed, from git at sync time. */
  updated?: string | null
}

export type TrackMeta = {
  id: string
  title: string
  blurb: string
  scenarios: ScenarioMeta[]
}

export type Manifest = {
  generatedAt: string
  /** `kind: 'reading'` marks a module of reading pages rather than worksheets. */
  modules: { id: string; kind?: 'reading'; tracks: TrackMeta[] }[]
  /** `YYYY-MM-DD` the Story Bank source last changed. */
  storyBankUpdated?: string | null
}

export type ScenarioRef = {
  moduleId: string
  trackId: string
  trackTitle: string
  slug: string
  title: string
  order: number
  /** True for reading pages (FDE Case Studies): read-only, tabbed, progress by tab. */
  reading?: boolean
  tabs?: ReadingTab[]
  minutes?: number
  updated?: string | null
  /**
   * 'Practice Worksheet' or 'Case Study' when another page on the site has the same
   * title. Shown beside the title in search, breadcrumbs, browser titles and prev/next.
   */
  qualifier?: string
}

/** A title with its content-type qualifier, where it needs one. */
export function qualifiedTitle(ref: { title: string; qualifier?: string }): string {
  return ref.qualifier ? `${ref.title} · ${ref.qualifier}` : ref.title
}

/** A Story Bank story that can answer a behavioural question. */
export type StoryLink = { title: string; href: string }

export type ScenarioSection = Section & {
  /** Answer-key sections that correspond to this worksheet section, if any. */
  answerKey: Section[]
  /** Behavioural pages: the Story Bank stories that can answer this question. */
  stories?: StoryLink[]
}

export type Scenario = {
  ref: ScenarioRef
  title: string
  /** Worksheet content above the first `## ` heading, shown as a lead-in. Empty for
   *  the case-study worksheets, whose first line is already a numbered section. */
  intro: Block[]
  sections: ScenarioSection[]
  /** The "Final 2-minute spoken answer" section, shown as the closing card. */
  closing: Section | null
  /** Behavioural pages: `[FILL: …]` slots in the model answers the reader must replace. */
  fillSlots: number
  /** Every answer-key section, for readers who want the document whole. */
  answerKeyDocument: ParsedDocument
  prev: ScenarioRef | null
  next: ScenarioRef | null
}

export type SearchEntry = {
  title: string
  section: string
  /** 'worksheet' | 'answer key' for worksheets; the tab label for reading pages. */
  kind: string
  href: string
  text: string
}

/** The casebook module. Its pages live at /design/<slug> (ENH-16). */
export const CASEBOOK_MODULE = '15-fde-case-studies'

/**
 * Modules whose pages are served by an area instead of /modules/<id> (ENH-16, ENH-17):
 * the casebook at /design/<slug>, the technical and behavioural worksheets at
 * /practice/<slug>. The URL drops the track, so slugs are unique within an area
 * (check:curriculum). Progress still keys on `<track>/<slug>`.
 */
export const MODULE_AREAS: Record<string, string> = {
  [CASEBOOK_MODULE]: '/design',
  '01-customer-discovery-and-decomposition': '/practice',
  '14-behavioural-and-leadership-round': '/practice',
}

/**
 * The URL of a worksheet or case page. The sync scripts, the check scripts and the site
 * all build page URLs here, so a page that moves changes in one place (and gets an entry
 * in src/lib/redirects.ts).
 */
export function scenarioHref(ref: {
  moduleId: string
  trackId: string
  slug: string
}): string {
  const area = MODULE_AREAS[ref.moduleId]
  return area ? `${area}/${ref.slug}` : `/modules/${ref.moduleId}/${ref.trackId}/${ref.slug}`
}

/**
 * One tab of a reading page. Tabs vary per page — the grouped case studies have four,
 * a standalone case can have one to five — so the list comes from the manifest, written
 * by `scripts/case-studies.mjs`, which also writes one `<id>.md` per tab.
 */
export type ReadingTab = { id: string; label: string }

export type CaseStudy = {
  ref: ScenarioRef
  title: string
  docs: { tab: string; label: string; purpose: string; minutes: number; doc: ReadingDocument }[]
  /** The section holding the case's references, so every tab can link to it. */
  sources: { tab: string; label: string; anchor: string; title: string } | null
  prev: ScenarioRef | null
  next: ScenarioRef | null
}

/** One document of a case page: a tab, made of one or more parts (ENH-25 splits long ones). */
export type CaseDocument = {
  /** The first part's tab id, which is also the document's id. */
  tab: string
  label: string
  purpose: string
  minutes: number
  /** Not needed for interview preparation: reference material behind the other tabs. */
  optional: boolean
  parts: CaseStudy['docs']
}

/**
 * Cases that show a split document as one tab with its parts as chapters. The rest show
 * one tab per part, as before. A pilot list while the owner reviews the layout on G01.
 */
const CHAPTER_CASES = new Set(['enterprise-knowledge-assistant'])

export const hasChapters = (study: CaseStudy) => CHAPTER_CASES.has(study.ref.slug)

/** Tabs a chapters case marks optional for interview preparation. */
const OPTIONAL_TABS = new Set(['full-pack'])

/**
 * Folds a case's part tabs (`<id>-part-<n>`) into documents. Part ids stay the tab ids
 * the page shows and saves progress under, so links and saved read state hold.
 */
export function documentsOf(study: CaseStudy): CaseDocument[] {
  const chapters = hasChapters(study)
  const documents: CaseDocument[] = []
  for (const doc of study.docs) {
    const id = chapters ? doc.tab.replace(/-part-\d+$/, '') : doc.tab
    const last = documents.at(-1)
    if (last?.tab === id) {
      last.parts.push(doc)
      last.minutes += doc.minutes
    } else {
      // A split document's parts are labelled "<label> <n>"; the document drops the number.
      const label = chapters ? doc.label.replace(/ 1$/, '') : doc.label
      documents.push({ tab: id, label, purpose: doc.purpose, minutes: doc.minutes, optional: chapters && OPTIONAL_TABS.has(id), parts: [doc] })
    }
  }
  return documents
}
