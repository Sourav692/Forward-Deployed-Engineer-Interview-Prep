/**
 * Search seam for the prototype: entry type and ranking. The index itself is built by
 * `search-index.ts` and served as a static JSON route (`/demo/search-index.json`), so
 * no data is bundled into the client. Swap either file for a search API later.
 */
export type SearchKind = 'Track' | 'Module' | 'Lesson' | 'Project' | 'Question' | 'Case' | 'Glossary'

export interface DemoSearchEntry {
  kind: SearchKind
  title: string
  subtitle: string
  href: string
  text: string
}

const MAX_RESULTS = 30

/** Every term must match; title hits outrank subtitle hits, which outrank body hits. */
export function searchEntries(entries: DemoSearchEntry[], query: string): DemoSearchEntry[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return []
  const scored: { e: DemoSearchEntry; score: number }[] = []
  for (const e of entries) {
    const title = e.title.toLowerCase()
    const sub = e.subtitle.toLowerCase()
    const text = e.text.toLowerCase()
    let score = 0
    let all = true
    for (const t of terms) {
      if (title.includes(t)) score += 10
      else if (sub.includes(t)) score += 4
      else if (text.includes(t)) score += 1
      else {
        all = false
        break
      }
    }
    if (all) scored.push({ e, score })
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, MAX_RESULTS).map((s) => s.e)
}
