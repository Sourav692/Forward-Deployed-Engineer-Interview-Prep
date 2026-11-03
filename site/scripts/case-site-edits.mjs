/**
 * Site-only edits to the case pages. The root markdown stays the canonical study source;
 * these change only what the website shows, at sync time. The rules are in CLAUDE.md
 * ("Case pages on the site").
 *
 * Every case page:
 * - `CUT`: Databricks and its products. Every `## ` section whose heading matches is
 *   dropped, then every remaining line that matches (a table row, a bullet, a one-line
 *   paragraph). A mention the line rule cannot take gets a `replace` rule in
 *   `CASE_SITE_EDITS`, worded vendor-neutrally.
 * - Case codes (`G01`) become the case's name; on its own page, "this case".
 * - Section signs, emoji and tick or cross marks become words.
 * - A document that lost a section is renumbered across its parts (`renumberSections`).
 * Sync fails if a cut term, a case code or a forbidden character survives, so nothing
 * slips through mid-paragraph.
 *
 * Per case, `CASE_SITE_EDITS[slug].replace` holds exact rewrites, run first.
 * A case's Introduction page lives at `site/case-pages/<slug>/introduction.md`.
 */
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const SITE_ROOT = join(import.meta.dirname, '..')

/** The case's Introduction page, if it has one; it becomes the first tab. */
export function introFor(slug) {
  const file = join(SITE_ROOT, 'case-pages', slug, 'introduction.md')
  return existsSync(file) ? file : null
}

export const CUT = /databricks|unity catalog|delta sync|genie|lakebase|lakeview|unity gateway|agent bricks|\bDBUs?\b/i
// Emoji are forbidden; arrows, box drawing, diagram shapes and ©, ® and ™ are
// typography and stay.
const FORBID = /\bG\d{2}\b|§|[✓✗✔✘✕]|(?![\u{A9}\u{AE}\u{2122}\u{2190}-\u{21FF}\u{2500}-\u{25FF}\u{2934}\u{2935}\u{2B05}-\u{2B07}])\p{Extended_Pictographic}/u

export const CASE_SITE_EDITS = {
  'enterprise-knowledge-assistant': {
    replace: [
      ['The platform beat is the Databricks finding, generalised. ', 'The platform beat holds on any stack. '],
      ['checks that Unity Catalog governance does not silently drop', 'checks that source governance does not silently drop'],
      ['\n                         G01\n', '\n'],
      ['and four §15 scenarios', 'and four latency and scale scenarios'],
    ],
  },
  'enterprise-coding-assistant': {
    replace: [
      ['the enterprise knowledge assistant in G01', 'the Enterprise Knowledge Assistant case'],
    ],
  },
  'agent-platform-for-non-technical-users': {
    replace: [['the G01 or G12 design', 'the Enterprise Knowledge Assistant or Scoping to Deployed Agent design']],
  },
  'nl-over-governed-data': {
    // The built-project story ran on Databricks; the site tells it vendor-neutrally.
    replace: [
      ['a managed Genie (now Genie One) text-to-SQL specialist', 'a managed text-to-SQL specialist'],
      ['and a Lakeview visualisation worker', 'and a dashboard visualisation worker'],
      ['conversation state in a custom Delta-backed checkpointer with **short retention** (Databricks now documents a Lakebase checkpointer)', 'conversation state in a custom table-backed checkpointer with **short retention**'],
      ['an AI Gateway (now Unity Gateway) for rate limits', 'a model gateway for rate limits'],
      ["The managed multi-agent feature (now Agent Bricks Supervisor Agent, GA in 2026) wasn't an option", "A managed multi-agent feature wasn't an option"],
      ['DBU or credit time on Databricks and Snowflake', 'credit time on Snowflake and similar warehouses'],
      // DBU is Databricks' billing unit; the site's glossary would spell the name out.
      ['bytes scanned or DBU/credit time', 'bytes scanned or credit time'],
      ['bytes scanned or DBU time', 'bytes scanned or compute time'],
      ['"Genie Agent<br/>(Text-to-SQL)"', '"Text-to-SQL Agent<br/>(managed service)"'],
      ['"Visualization Agent<br/>(Lakeview API)"', '"Visualization Agent<br/>(dashboard API)"'],
      ['a 16-asset Context Index of Genie Spaces (now Genie Agents; Genie itself is now Genie One), metric views', 'a 16-asset Context Index of curated text-to-SQL spaces, metric views'],
      ['| **Genie** | BI specialist | Genie Conversation API (managed text-to-SQL; Genie Spaces renamed Genie Agents in 2026) |', '| **Text-to-SQL** | BI specialist | Managed text-to-SQL conversation API |'],
      ["runs under each user's Unity Catalog permissions", "runs under each user's catalog permissions"],
      ['LLM-generated SQL + Databricks AI Search (formerly Vector Search) RAG over policy docs', 'LLM-generated SQL + vector search RAG over policy docs'],
      ["outside Genie's curated scope", "outside the text-to-SQL service's curated scope"],
      ['| Lakeview REST API |', '| Dashboard REST API |'],
      ['short-term memory in a Delta table keyed by thread', 'short-term memory in a table keyed by thread'],
      ["Multi-turn conversations backed by Delta checkpoints, a governance requirement; every conversation state must be auditable. In this build I wrote a custom checkpointer over a Delta table; Databricks' documented path today is a Lakebase (Postgres) checkpointer", 'Multi-turn conversations backed by table checkpoints, a governance requirement; every conversation state must be auditable. In this build I wrote a custom checkpointer over a table'],
      ['context window and Genie Space (now a Genie Agent).', 'context window and curated text-to-SQL space.'],
      ['the Genie-versus-Multi-Tool split', 'the text-to-SQL-versus-Multi-Tool split'],
      ['Supervisor routes to Genie (now Genie One), a narrow', 'Supervisor routes to a managed text-to-SQL service, a narrow'],
      ['It routes among Genie, a restricted', 'It routes among a managed text-to-SQL service, a restricted'],
      ['curated Genie-like views', 'curated text-to-SQL views'],
    ],
  },
}

/** Section signs, emoji and tick or cross marks, said in words. */
function wordSymbols(text) {
  return (
    text
      // "[source case, §1]" and "[source architecture, §5]" name the Full Design's sections.
      .replace(/\[source §(\d+)\]/g, '[Full Design, section $1]')
      .replace(/\[source §(\d+) ([^\]]+)\]/g, '[Full Design $2, section $1]')
      .replace(/\[source case, §(\d+)\]/g, '[Full Design, section $1]')
      .replace(/\[source ([^\],]+), §(\d+)\]/g, '[Full Design $1, section $2]')
      .replace(/§§(\d+)[–-](\d+)/g, 'sections $1–$2')
      .replace(/§(\d+) for /g, 'section $1 for ')
      // "§15 scenarios", "§15 #6" and "§16 Case 6" cite the source library, which the site
      // never shows: the citation keeps its scenario or case and loses the sign.
      .replace(/\| §\d+: /g, '| ')
      .replace(/§\d+ (?=scenario|#|Case)/g, '')
      // Coverage tables: built, partly built, not built.
      .replace(/🟡 \/ ❌/g, 'Partial / not built')
      .replace(/\| ✅ \|/g, '| Built |')
      .replace(/\| 🟡 \|/g, '| Partial |')
      .replace(/\| ❌ \|/g, '| Not built |')
      .replace(/\| ✅ /g, '| Built: ')
      .replace(/\| 🟡 /g, '| Partial: ')
      .replace(/\| ❌ /g, '| Not built: ')
      // A colour key for a diagram names the colour.
      .replace(/^- 🟢 /gm, '- Green: ')
      .replace(/^- 🟣 /gm, '- Purple: ')
      .replace(/^- 🟠 /gm, '- Orange: ')
      // An emoji in front of a label or a callout carries nothing the words do not.
      .replace(/^> 🎯 \*\*Interview Pointer:\*\*/gm, '> **Interview pointer:**')
      .replace(/(\*\*|^> )(?:\p{Extended_Pictographic}\u{FE0F}?\u{200D}?)+\s*/gmu, '$1')
  )
}

/**
 * A case code becomes the case's name. `codes` maps `G01` to its title; `own` is the
 * page's own code, which becomes "this case".
 */
function nameCodes(text, codes, own) {
  const title = (code) => codes.get(code) ?? code
  const sentenceStart = (str, at) => at === 0 || /(^|[.!?]\s+|\n\s*|\|\s*)(\*\*)?$/.test(str.slice(Math.max(0, at - 6), at))
  const cap = (s, str, at) => (sentenceStart(str, at) ? s[0].toUpperCase() + s.slice(1) : s)
  return (
    text
      .replace(/^(#{1,6}) G\d{2}(?: [—–-])? /gm, '$1 ')
      .replace(/\[G\d{2} ([^\]]+)\]/g, '[$1]')
      .replace(/\bG\d{2}[–-]G\d{2}\b/g, 'the scenario-pack cases')
      // Its own page: "this case".
      .replace(new RegExp(`\\b${own} section (\\d+)`, 'g'), (m, n, at, str) => cap(`section ${n}`, str, at))
      .replace(new RegExp(`global ${own} requirements`, 'g'), 'global requirements of this case')
      .replace(new RegExp(`\\b${own}['’]s\\b`, 'g'), (m, at, str) => cap('this case’s', str, at))
      .replace(new RegExp(`\\b${own}\\b`, 'g'), (m, at, str) => cap('this case', str, at))
      // Another case: drop the code where the case's name follows it already.
      .replace(/\b(G\d{2}) (\w+)/g, (m, code, word) =>
        codes.has(code) && title(code).split(' ')[0].toLowerCase() === word.toLowerCase() ? word : m,
      )
      .replace(/\b(G\d{2}) section (\d+)/g, (m, code, n, at, str) => cap(`section ${n} of the ${title(code)} case`, str, at))
      .replace(/\b(G\d{2})['’]s\b/g, (m, code, at, str) => cap(`the ${title(code)} case’s`, str, at))
      .replace(/\b(G\d{2})-style\b/g, (m, code) => `${title(code)}-style`)
      // After an article, a bracket or a slash the name reads alone ("a separate G13
      // system"); anywhere else it reads as "the … case".
      .replace(/(\b(?:a|an|the|separate|distinct|global)\s+|[(/]\s*)(G\d{2})\b/gi, (m, before, code) => before + title(code))
      .replace(/\bG\d{2}\b/g, (code, at, str) => cap(`the ${title(code)} case`, str, at))
  )
}

const matched = new Set()

/**
 * Throws if one of a case's `replace` rules matched none of its documents. A stale rule
 * is not harmless: the line it rewrote may now be dropped by the cut instead, silently.
 * Call it once the case's documents have all been through `applySiteEdits`.
 */
export function assertReplaceRulesUsed(slug) {
  const stale = (CASE_SITE_EDITS[slug]?.replace ?? []).filter(([from]) => !matched.has(from))
  if (stale.length) {
    throw new Error(`Site edits for ${slug}: replace rules match nothing (the source changed?): ${stale.map(([f]) => JSON.stringify(f)).join(', ')}`)
  }
}

/**
 * Applies the site-only edits to one document's markdown. `ctx.codes` maps each case
 * code to its title and `ctx.own` is the page's own code (null for a standalone case).
 * Returns the markdown and whether a whole section was cut, so its document can be
 * renumbered.
 */
export function applySiteEdits(slug, markdown, file, ctx) {
  let text = markdown
  for (const [from, to] of CASE_SITE_EDITS[slug]?.replace ?? []) {
    if (text.includes(from)) matched.add(from)
    text = text.split(from).join(to)
  }
  text = nameCodes(wordSymbols(text), ctx.codes, ctx.own ?? 'G00')

  const out = []
  let dropping = false
  let fence = false
  let cutSection = false
  for (const line of text.split('\n')) {
    if (/^(```|~~~)/.test(line)) fence = !fence
    if (!fence && /^## /.test(line)) {
      dropping = CUT.test(line)
      cutSection ||= dropping
    }
    if (dropping || (!fence && CUT.test(line))) continue
    out.push(line)
  }
  const result = out.join('\n')
  const left = result.match(CUT) ?? result.match(FORBID)
  if (left) {
    const near = result.slice(Math.max(0, left.index - 80), left.index + 60).replace(/\n/g, ' ')
    throw new Error(`Site edits for ${slug} left "${left[0]}" in ${file}: …${near}…; add a replace rule in CASE_SITE_EDITS`)
  }
  return { markdown: result, cutSection }
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
