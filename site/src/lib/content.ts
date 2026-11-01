import 'server-only'

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cache } from 'react'
import { parseDocument, type Block, type ParsedDocument, type Section } from './parse'
import { parseReading, readingText, toPlainText, type ReadingDocument } from './reading'
import { ANSWER_KEY_MAP, CLOSING_SECTION_KEY } from './mapping'
import { expandAcronyms } from './acronyms'
import { GLOSSARY, glossaryAnchor } from './glossary'
import { qualifiedTitle, scenarioHref } from './scenario'
import {
  FAMILY_META,
  RELATED_CASE,
  RELATED_PRACTICE,
  STORY_BANK,
  tabMeta,
  readingMinutes,
  normaliseTitle,
  qualifierFor,
  reviewsFor,
  type EditorialMeta,
  type Review,
} from './editorial'
import type {
  CaseStudy,
  Manifest,
  Scenario,
  ScenarioRef,
  ScenarioSection,
  SearchEntry,
  StoryLink,
  TrackMeta,
} from './scenario'

/**
 * Reads the synced content at build time.
 *
 * `server-only` is imported for its side effect: it turns an accidental client
 * import of this module into a clear error at the import site, instead of a
 * bundler failure about `node:fs` appearing in a browser chunk.
 */

const CONTENT_DIR = join(process.cwd(), 'content')

export const getManifest = cache(async (): Promise<Manifest> => {
  try {
    return JSON.parse(await readFile(join(CONTENT_DIR, 'manifest.json'), 'utf8'))
  } catch {
    throw new Error(
      'content/manifest.json is missing. Run `npm run sync` before building.',
    )
  }
})

export async function getTracks(moduleId: string): Promise<TrackMeta[]> {
  const manifest = await getManifest()
  return manifest.modules.find((m) => m.id === moduleId)?.tracks ?? []
}

/**
 * Flat, ordered list across all tracks — drives prev/next, search and progress.
 *
 * Titles shared by two pages (the same scenario as a worksheet and as a case study)
 * get a content-type qualifier here, from the manifest itself, so a new duplicate is
 * qualified without anyone remembering to list it. A worksheet and case twin get one even
 * when their titles differ, so every twin pair is labelled the same way (audit IA-05).
 */
export const getAllScenarios = cache(async (): Promise<ScenarioRef[]> => {
  const manifest = await getManifest()
  const refs: ScenarioRef[] = manifest.modules.flatMap((module) =>
    module.tracks.flatMap((track) =>
      track.scenarios.map((scenario) => ({
        moduleId: module.id,
        trackId: track.id,
        trackTitle: track.title,
        slug: scenario.slug,
        title: scenario.title,
        order: scenario.order,
        tabs: scenario.tabs,
        minutes: scenario.minutes,
        updated: scenario.updated,
        reading: module.kind === 'reading',
      })),
    ),
  )
  const seen = new Map<string, number>()
  for (const r of refs) seen.set(normaliseTitle(r.title), (seen.get(normaliseTitle(r.title)) ?? 0) + 1)
  const twinned = (r: ScenarioRef) => !!(RELATED_CASE[`${r.trackId}/${r.slug}`] ?? RELATED_PRACTICE[`${r.trackId}/${r.slug}`])
  return refs.map((r) =>
    (seen.get(normaliseTitle(r.title)) ?? 0) > 1 || twinned(r)
      ? { ...r, qualifier: qualifierFor(familyMeta(r.trackId).mode) }
      : r,
  )
})

/** Family metadata for a track. Throws rather than rendering a page with none. */
export function familyMeta(trackId: string): EditorialMeta {
  const meta = FAMILY_META[trackId]
  if (!meta) throw new Error(`Track "${trackId}" has no FAMILY_META entry in src/lib/editorial.ts`)
  return meta
}

export type Related = {
  reviews: Review[]
  /** The same or a closely related scenario in the other format. */
  counterpart: ScenarioRef | null
}

/** Cross-links for a page: the reviews that cite it, and its practice/case counterpart. */
export async function getRelated(ref: ScenarioRef): Promise<Related> {
  const key = `${ref.trackId}/${ref.slug}`
  const other = RELATED_CASE[key] ?? RELATED_PRACTICE[key]
  const all = await getAllScenarios()
  return {
    reviews: reviewsFor(key),
    counterpart: other ? (all.find((s) => `${s.trackId}/${s.slug}` === other) ?? null) : null,
  }
}

export async function pageRef(key: string): Promise<ScenarioRef | null> {
  return (await getAllScenarios()).find((s) => `${s.trackId}/${s.slug}` === key) ?? null
}

/**
 * Behavioural model answers mark the details only the reader can supply as
 * `[FILL: …]`. They are rendered as highlighted slots so they read as gaps to fill,
 * never as a finished answer to recite.
 */
// Punctuation typed inside the backticks (`[FILL: …].`) stays after the slot, so the
// closing </code> is consumed with its opening tag.
const FILL = /(?:<code>)?\[FILL(?:[:\s]\s*([^\]]*?))?\s*\]([.,;:!?]?)(?:<\/code>)?/g

function markFill(html: string): string {
  return html.replace(
    FILL,
    (_, detail: string | undefined, punct: string) =>
      `<mark class="fill-slot"><span class="fill-slot-label">Your detail</span>${detail && detail !== '...' ? ` ${detail}` : ''}</mark>${punct}`,
  )
}

function markFillBlocks(blocks: Block[]): Block[] {
  return blocks.map((b) => {
    if (b.kind === 'prose') return { ...b, html: markFill(b.html) }
    if (b.kind === 'list') {
      return { ...b, items: b.items.map((i) => (i.kind === 'text' ? { ...i, html: markFill(i.html) } : i)) }
    }
    if (b.kind === 'table') {
      return { ...b, rows: b.rows.map((row) => row.map((c) => ({ ...c, text: markFill(c.text) }))) }
    }
    return b
  })
}

/**
 * Spells out each acronym at its first use in a document. One `seen` set per document:
 * the worksheet and the model answer are read separately, so each defines its own.
 * Table cells get the definition as hover text only, so narrow columns do not grow.
 */
function glossBlocks(blocks: Block[], seen: Set<string>): Block[] {
  const gloss = (html: string, inline = true) => expandAcronyms(html, seen, GLOSSARY, { inline })
  return blocks.map((b) => {
    if (b.kind === 'prose') return { ...b, html: gloss(b.html) }
    if (b.kind === 'list') {
      return { ...b, items: b.items.map((i) => (i.kind === 'text' ? { ...i, html: gloss(i.html) } : i)) }
    }
    if (b.kind === 'table') {
      return { ...b, rows: b.rows.map((row) => row.map((c) => (c.editable ? c : { ...c, text: gloss(c.text, false) }))) }
    }
    return b
  })
}

function glossDocument(doc: ParsedDocument): ParsedDocument {
  const seen = new Set<string>()
  return {
    ...doc,
    intro: glossBlocks(doc.intro, seen),
    sections: doc.sections.map((s) => ({ ...s, blocks: glossBlocks(s.blocks, seen) })),
  }
}

function glossReading(doc: ReadingDocument): ReadingDocument {
  const seen = new Set<string>()
  return {
    ...doc,
    sections: doc.sections.map((s) => ({
      ...s,
      chunks: s.chunks.map((c) => (c.kind === 'html' ? { ...c, html: expandAcronyms(c.html, seen, GLOSSARY) } : c)),
    })),
  }
}

function markFillDocument(doc: ParsedDocument): ParsedDocument {
  return {
    ...doc,
    intro: markFillBlocks(doc.intro),
    sections: doc.sections.map((s) => ({ ...s, blocks: markFillBlocks(s.blocks) })),
  }
}

export type StoryBank = {
  doc: ReadingDocument
  minutes: number
  updated: string | null
  /** `slug#index` -> the stories that can answer that question (slugs are unique on /practice). */
  byQuestion: Map<string, StoryLink[]>
}

/** The `**Answers:**` paragraph of a story section, as rendered by marked. */
const ANSWERS_LINE = /<p><strong>Answers:<\/strong>([\s\S]*?)<\/p>/
const QUESTION_HREF = /href="\/practice\/([^/"#]+)#section-(\d+)"/g

/**
 * The Story Bank page, plus the reverse map the behavioural worksheets use. Only links on
 * a story's `**Answers:**` line count; the "need a story of your own" list does not.
 */
export const getStoryBank = cache(async (): Promise<StoryBank | null> => {
  const raw = await readFile(join(CONTENT_DIR, 'behavioural', `${STORY_BANK.slug}.md`), 'utf8').catch(
    () => null,
  )
  if (raw === null) return null
  const parsed = parseReading(raw, STORY_BANK.slug)
  const byQuestion = new Map<string, StoryLink[]>()
  for (const section of parsed.sections) {
    if (!section.title) continue
    const html = section.chunks.map((c) => (c.kind === 'html' ? c.html : '')).join('\n')
    const answers = html.match(ANSWERS_LINE)?.[1]
    if (!answers) continue
    const story = { title: toPlainText(section.title), href: `${STORY_BANK.href}#${section.id}` }
    for (const [, slug, index] of answers.matchAll(QUESTION_HREF)) {
      const key = `${slug}#${index}`
      const list = byQuestion.get(key) ?? []
      if (!list.some((l) => l.href === story.href)) list.push(story)
      byQuestion.set(key, list)
    }
  }
  const updated = (await getManifest()).storyBankUpdated ?? null
  return { doc: glossReading(parsed), minutes: readingMinutes(raw), updated, byQuestion }
})

export const getScenario = cache(
  async (
    moduleId: string,
    trackId: string,
    slug: string,
  ): Promise<Scenario | null> => {
    const all = await getAllScenarios()
    const index = all.findIndex(
      (s) => s.moduleId === moduleId && s.trackId === trackId && s.slug === slug,
    )
    if (index === -1 || all[index].reading) return null
    const ref = all[index]

    const base = join(CONTENT_DIR, 'modules', moduleId, trackId)
    const [worksheetRaw, answerKeyRaw] = await Promise.all([
      readFile(join(base, 'worksheets', `${slug}.md`), 'utf8'),
      readFile(join(base, 'answer-keys', `${slug}.md`), 'utf8'),
    ])

    const personal = Boolean(familyMeta(trackId).personalisation)
    const storyBank = personal ? await getStoryBank() : null
    const prepare = (raw: string) => {
      const doc = glossDocument(parseDocument(raw))
      return personal ? markFillDocument(doc) : doc
    }
    const worksheet = prepare(worksheetRaw)
    const answerKey = prepare(answerKeyRaw)
    const keyByKey = new Map(answerKey.sections.map((s) => [s.key, s]))

    const sections: ScenarioSection[] = worksheet.sections.map((section) => ({
      ...section,
      // Falling back to the section's own key pairs a worksheet section with an
      // answer-key section of the same name. Module 01's two documents have
      // deliberately different shapes, so it declares its pairings in ANSWER_KEY_MAP
      // and the fallback only ever resolves to nothing there. Tracks whose two
      // documents share a heading structure — the behavioural ones, where each
      // question is one section in both files — need no entry at all.
      answerKey: (ANSWER_KEY_MAP[section.key] ?? [section.key])
        .map((key) => keyByKey.get(key))
        .filter((s): s is Section => Boolean(s)),
      stories: storyBank?.byQuestion.get(`${slug}#${section.index}`) ?? [],
    }))

    return {
      ref,
      // The manifest title, not the worksheet heading: it carries any editorial
      // override (TITLE_OVERRIDES) and is what search and navigation already show.
      title: ref.title,
      intro: worksheet.intro,
      sections,
      closing: keyByKey.get(CLOSING_SECTION_KEY) ?? null,
      fillSlots: personal ? (answerKeyRaw.match(/\[FILL\b/g) ?? []).length : 0,
      answerKeyDocument: answerKey,
      prev: index > 0 ? all[index - 1] : null,
      next: index < all.length - 1 ? all[index + 1] : null,
    }
  },
)

export const SEARCH_TEXT_CAP = 500

export type ContentSearchEntries = {
  practice: SearchEntry[]
  interview: SearchEntry[]
  design: SearchEntry[]
  company: SearchEntry[]
  reference: SearchEntry[]
}

/**
 * The section that holds a case's references. Searched last tab first, because the
 * Sources and Full Design tab is where grouped cases keep them.
 */
function findSources(docs: { tab: string; label: string; doc: ReadingDocument }[]) {
  for (const { tab, label, doc } of [...docs].reverse()) {
    const section = doc.sections.find(
      (s) => s.title && /^(\d+\.\s*)?(references|sources|further reading|bibliography)\b/i.test(toPlainText(s.title)),
    )
    if (section) return { tab, label, anchor: section.id, title: toPlainText(section.title!) }
  }
  return null
}

/**
 * A reading page: one group's four documents, each parsed for display. prev/next stay
 * inside the module, so the last case study does not lead into a worksheet.
 */
export const getCaseStudy = cache(
  async (moduleId: string, trackId: string, slug: string): Promise<CaseStudy | null> => {
    const siblings = (await getAllScenarios()).filter((s) => s.moduleId === moduleId)
    const index = siblings.findIndex((s) => s.trackId === trackId && s.slug === slug)
    if (index === -1 || !siblings[index].reading) return null
    const ref = siblings[index]

    const base = join(CONTENT_DIR, 'modules', moduleId, trackId, slug)
    const docs = await Promise.all(
      (ref.tabs ?? []).map(async (tab) => {
        const raw = await readFile(join(base, `${tab.id}.md`), 'utf8')
        return {
          tab: tab.id,
          label: tab.label,
          purpose: tabMeta(tab.id)?.purpose ?? '',
          minutes: readingMinutes(raw),
          doc: glossReading(parseReading(raw, tab.id)),
        }
      }),
    )

    return {
      ref,
      title: ref.title,
      docs,
      sources: findSources(docs),
      prev: index > 0 ? siblings[index - 1] : null,
      next: index < siblings.length - 1 ? siblings[index + 1] : null,
    }
  },
)

/**
 * Build-time search entries for the scenario, case-study and review content, grouped by
 * the search area file each one ships in (`/search/{area}.json`). Section-level so
 * results land on a specific heading. The Learn area is built in `search-index.ts`.
 */
export const getContentSearchEntries = cache(async (): Promise<ContentSearchEntries> => {
  const all = await getAllScenarios()
  const practice: SearchEntry[] = []
  const interview: SearchEntry[] = []
  const design: SearchEntry[] = []
  const company: SearchEntry[] = []
  const reference: SearchEntry[] = []

  for (const ref of all) {
    if (ref.reading) {
      const study = await getCaseStudy(ref.moduleId, ref.trackId, ref.slug)
      if (!study) continue
      const href = scenarioHref(ref)
      // Company prep (module 16) ships in its own file; the rest are system design cases.
      const area = ref.moduleId.startsWith('16-') ? company : design
      for (const { label, doc } of study.docs) {
        for (const section of doc.sections) {
          if (!section.title) continue
          area.push({
            title: qualifiedTitle(ref),
            section: toPlainText(section.title),
            kind: label,
            href: `${href}#${section.id}`,
            // Capped: these guides are long, and the area file has a size budget. The
            // opening of a section carries its claim, which is what a search hits.
            // The heading is already in `section`, so the text carries only the body.
            text: readingText(section).slice(0, SEARCH_TEXT_CAP),
          })
        }
      }
      continue
    }
    const scenario = await getScenario(ref.moduleId, ref.trackId, ref.slug)
    if (!scenario) continue
    const href = scenarioHref(ref)

    const title = qualifiedTitle({ title: scenario.title, qualifier: ref.qualifier })
    const personal = Boolean(familyMeta(ref.trackId).personalisation)
    // Behavioural rounds ship in the interview file, technical practice in the practice file.
    const area = personal ? interview : practice
    for (const section of scenario.sections) {
      area.push({
        title,
        section: section.title,
        kind: personal ? 'Behavioural' : 'Practice',
        href: `${href}#section-${section.index}`,
        text: plainText(section),
      })
    }
    for (const section of scenario.answerKeyDocument.sections) {
      area.push({
        title,
        section: section.title,
        kind: 'Model Answer',
        href: `${href}#section-${section.index}`,
        text: plainText(section),
      })
    }
  }

  // The final-week guides and reviews are Learn lessons (ENH-18), indexed in the learn area.
  const storyBank = await getStoryBank()
  for (const section of storyBank?.doc.sections ?? []) {
    if (!section.title) continue
    interview.push({
      title: STORY_BANK.title,
      section: toPlainText(section.title),
      kind: 'Behavioural',
      href: `${STORY_BANK.href}#${section.id}`,
      text: `${toPlainText(section.title)} ${readingText(section)}`.slice(0, SEARCH_TEXT_CAP),
    })
  }
  for (const g of GLOSSARY) {
    reference.push({
      title: 'Glossary',
      section: g.expansion ? `${g.term} — ${g.expansion}` : g.term,
      kind: 'Glossary',
      href: `/glossary#${glossaryAnchor(g.term)}`,
      text: `${g.term} ${g.expansion ?? ''} ${g.plain} ${g.sayIt ?? ''}`,
    })
  }

  return { practice, interview, design, company, reference }
})

function plainText(section: Section): string {
  const parts: string[] = [section.title]
  for (const block of section.blocks) {
    if (block.kind === 'prose') parts.push(stripHtml(block.html))
    if (block.kind === 'subheading') parts.push(block.text)
    if (block.kind === 'list') {
      for (const item of block.items) {
        if (item.kind === 'text') parts.push(stripHtml(item.html))
        if (item.kind === 'field') parts.push(item.label)
      }
    }
    if (block.kind === 'table') {
      parts.push(block.headers.join(' '))
      for (const row of block.rows) {
        for (const cell of row) if (cell.text) parts.push(stripHtml(cell.text))
      }
    }
    if (block.kind === 'scorecard') {
      for (const row of block.rows) {
        parts.push(row.area, ...row.levels.map((l) => l.label))
      }
    }
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ')
}
