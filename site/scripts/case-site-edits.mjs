/**
 * Site-only edits to a case page. The root markdown stays the canonical study source;
 * these change only what the website shows for one case, at sync time.
 *
 * - `intro`: a page written for the site (under `site/case-pages/`), shown first as the
 *   case's Introduction tab.
 * - `cut`: content the site leaves out. Every `## ` section whose heading matches is
 *   dropped, then every remaining line that matches (a table row, a bullet, a one-line
 *   paragraph). `replace` runs first, for lines where only a clause needs to go.
 *   Sync fails if `cut` still matches afterwards, so nothing slips through mid-paragraph.
 * - `renumber`: after cuts, number each document's `## N.` sections again without gaps,
 *   across its parts, and update its "Section N" references to match. ("§N" is left
 *   alone: in these packs it cites the source library's sections.)
 */
import { join } from 'node:path'

const SITE_ROOT = join(import.meta.dirname, '..')

export const CASE_SITE_EDITS = {
  'enterprise-knowledge-assistant': {
    intro: join(SITE_ROOT, 'case-pages', 'enterprise-knowledge-assistant', 'introduction.md'),
    cut: /databricks|unity catalog|delta sync/i,
    renumber: true,
    replace: [
      ['The platform beat is the Databricks finding, generalised. ', 'The platform beat holds on any stack. '],
      ['checks that Unity Catalog governance does not silently drop', 'checks that source governance does not silently drop'],
    ],
  },
}

/** Applies a case's site-only cuts to one document's markdown. */
export function applySiteEdits(slug, markdown, file) {
  const edits = CASE_SITE_EDITS[slug]
  if (!edits?.cut) return markdown
  let text = markdown
  for (const [from, to] of edits.replace ?? []) text = text.split(from).join(to)

  const out = []
  let dropping = false
  let fence = false
  for (const line of text.split('\n')) {
    if (/^(```|~~~)/.test(line)) fence = !fence
    if (!fence && /^## /.test(line)) dropping = edits.cut.test(line)
    if (dropping || (!fence && edits.cut.test(line))) continue
    out.push(line)
  }
  const result = out.join('\n')
  const left = result.match(edits.cut)
  if (left) throw new Error(`Site edits for ${slug} left "${left[0]}" in ${file}; add a replace rule`)
  return result
}

/**
 * Renumbers one document's `## N. Title` sections in order, keeping its first number (a
 * guide may start at 0), and rewrites its "Section N" references to the new numbers.
 * `parts` is the document's markdown, part by part; the numbering runs across them.
 */
export function renumberSections(parts, file) {
  const old = parts.flatMap((md) => [...md.matchAll(/^## (\d+)\. /gm)].map((m) => Number(m[1])))
  if (old.length === 0) return parts
  if (new Set(old).size !== old.length) throw new Error(`Duplicate section numbers in ${file}; cannot renumber`)
  const map = new Map(old.map((n, i) => [n, old[0] + i]))
  const num = (n) => String(map.get(Number(n)) ?? n)
  return parts.map((md) =>
    md
      .replace(/^## (\d+)\. /gm, (_, n) => `## ${num(n)}. `)
      .replace(/\b(sections?\s+)(\d+(?:\s*(?:to|and|–|,)\s*\d+)*)/gi, (_, word, list) => word + list.replace(/\d+/g, num)),
  )
}
