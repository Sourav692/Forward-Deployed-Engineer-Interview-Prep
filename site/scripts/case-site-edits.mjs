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
 */
import { join } from 'node:path'

const SITE_ROOT = join(import.meta.dirname, '..')

export const CASE_SITE_EDITS = {
  'enterprise-knowledge-assistant': {
    intro: join(SITE_ROOT, 'case-pages', 'enterprise-knowledge-assistant', 'introduction.md'),
    cut: /databricks|unity catalog|delta sync/i,
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
