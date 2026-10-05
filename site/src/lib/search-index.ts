import 'server-only'

import { cache } from 'react'
import { getContentSearchEntries, SEARCH_TEXT_CAP } from './content'
import { getLearnManifest, getLessonPage, getModule, getTrack, getTracks, learnHref, trackModules } from './learn'
import { readingText, toPlainText } from './reading'
import type { SearchEntry } from './scenario'
import type { SearchArea } from './search-areas'

/** Characters of lesson opening text kept as the excerpt. */
const EXCERPT_CAP = 240

/**
 * Learn search entries: one per track, module and synced lesson. Lessons are indexed as
 * a whole (title, module and track context, an excerpt and their headings) rather than
 * section by section, which keeps the area file small.
 */
const getLearnSearchEntries = cache((): SearchEntry[] => {
  const entries: SearchEntry[] = []

  for (const track of getTracks()) {
    entries.push({
      title: `${track.code} · Learn`,
      section: track.title,
      kind: 'Track',
      href: learnHref.track(track.slug),
      text: `${track.code} ${track.title} ${track.objective} ${track.forWhom} ${track.exitCompetencies.join(' ')}`,
    })
    for (const mod of trackModules(track)) {
      entries.push({
        title: `${track.code} ${track.title}`,
        section: `${mod.code} ${mod.title}`,
        kind: 'Module',
        href: learnHref.module(mod),
        text: `${mod.code} ${mod.title} ${mod.objective} ${mod.deliverable}`,
      })
    }
  }

  for (const lesson of getLearnManifest()) {
    if (lesson.kind !== 'sync') continue
    const track = getTrack(lesson.track)
    const mod = getModule(lesson.track, lesson.module)
    const page = getLessonPage(lesson.track, lesson.module, lesson.slug)
    if (!track || !mod || !page) continue
    const sections = page.doc.sections
    const lead = sections.map((s) => readingText(s)).find((t) => t.trim() !== '') ?? ''
    const headings = sections.flatMap((s) => (s.title ? [toPlainText(s.title)] : []))
    entries.push({
      title: `${mod.code} ${mod.title} · ${track.title}`,
      section: lesson.title,
      kind: 'Lesson',
      href: lesson.href,
      text: `${lesson.title} ${lead.slice(0, EXCERPT_CAP)} ${headings.join(' ')}`.slice(0, SEARCH_TEXT_CAP * 2),
    })
  }

  return entries
})

/**
 * The case studies are too large for one file, so they are dealt into two: whole case
 * studies alternate between `design-1` and `design-2`, keeping each page's sections together.
 */
function splitDesign(entries: SearchEntry[]): [SearchEntry[], SearchEntry[]] {
  const halves: [SearchEntry[], SearchEntry[]] = [[], []]
  const caseIndex = new Map<string, number>()
  for (const entry of entries) {
    const page = entry.href.split('#')[0]
    if (!caseIndex.has(page)) caseIndex.set(page, caseIndex.size)
    halves[caseIndex.get(page)! % 2].push(entry)
  }
  return halves
}

/** The entries for one `/search/{area}.json` file. */
export async function getSearchArea(area: SearchArea): Promise<SearchEntry[]> {
  if (area === 'learn') return getLearnSearchEntries()
  const content = await getContentSearchEntries()
  if (area === 'design-1') return splitDesign(content.design)[0]
  if (area === 'design-2') return splitDesign(content.design)[1]
  return content[area]
}
