/**
 * Syncs the Learn lessons (plan §10, tasks DATA-02 and SEC-01).
 *
 * `src/lib/curriculum.ts` is the single map from module to source file. For every
 * lesson there:
 *
 *  - `kind: 'sync'` lessons that may be published (`publish` is `own` or `credited`)
 *    and whose home module is neither on hold nor coming soon are copied to
 *    `content/learn/<trackSlug>/<moduleSlug>/<lessonSlug>.md`;
 *  - `kind: 'live'` lessons are already published under /modules or
 *    /fde-last-day-prep, so nothing is copied: the manifest records the live page's
 *    URL instead, and the sync fails if that URL cannot be resolved;
 *  - `pending` and `excluded` lessons are never written anywhere.
 *
 * Lesson bodies are not rewritten (grounding rule). The sync only normalises:
 *  - the page gets exactly one `#` heading, the curriculum title (which carries no
 *    emoji or decorative prefix); when a source uses `#` for its sections, every
 *    heading after the title moves down one level;
 *  - repository links become site links: a synced lesson becomes its /learn page, an
 *    already-published page becomes that page's URL, an excluded lesson that has a
 *    RENAMED entry becomes its replacement's /learn page, and a link to anything
 *    else in the repository becomes its plain text (the repository is private, so a
 *    GitHub URL would 404 for visitors);
 *  - the `## References` section loses its repository source lists
 *    (`stripRepoReferences`); the repository copy keeps them;
 *  - raw `<script>`, `<iframe>` and `<style>` elements and `on*=` attributes are
 *    removed outside code (defence in depth: `marked` passes raw HTML through).
 * Mermaid and every other fenced block are copied through untouched.
 *
 * Lesson slices: a lesson with `sections` publishes only some `## ` sections of its
 * source (see CurriculumLesson.sections), so one file can be several lessons. A repo
 * link to such a file goes to the slice holding the link's anchor, else to the main
 * slice; an in-page `#anchor` whose heading lives in a sibling slice becomes that
 * slice's /learn URL. Reading time is counted per slice.
 *
 * Only the folders in `ALLOWED_ROOTS` are ever read (SEC-01): private material in
 * `06_`, `09_` and `99_` cannot leak by accident, whatever `curriculum.ts` says.
 *
 * Snapshot: like the company packs, `content/learn/` is committed. When the root
 * sources are absent (a deploy rooted at `site/`), the committed copy is restored.
 */

import { existsSync, readdirSync, statSync } from 'node:fs'
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { LESSONS, MODULES, RENAMED, TRACKS } from '../src/lib/curriculum.ts'
import { curriculumHref } from '../src/lib/curriculum-href.ts'
import {
  LAST_DAY,
  LAST_DAY_GUIDES,
  REVIEW_DOCS,
  REVIEWS,
  TRIGGER_SHEET,
  WORDS_PER_MINUTE,
} from '../src/lib/editorial.ts'

/**
 * What `rewriteHref` returns for a repository file with no page on the site.
 * `unlinkRepoLinks` then turns `[text](UNLINK)` into `text`.
 */
export const UNLINK = '#unlink-repo-file'

/** `[text](UNLINK)` becomes `text`: the private repository has no public URL. */
export const unlinkRepoLinks = (markdown) => markdown.replace(/\[([^\]]*)\]\(#unlink-repo-file\)/g, '$1')

/** A markdown link. Repository files cited only as paths, with no link, are provenance. */
const LINK = /\]\(/

/**
 * Drops the repository provenance from a page's `## References` section (audit check
 * PQ-07). A `**Sources:**` paragraph keeps only its sentences that hold a link, and
 * any other paragraph, table or bullet with no link goes. Kept links are rewritten
 * later like any other. Subsections such as "Fact-check sources" stay, and the
 * heading goes when nothing is left under it.
 * Third-party books are still named by the lesson's credit line.
 */
export function stripRepoReferences(markdown) {
  return markdown.replace(/^## References[ \t]*\n([\s\S]*?)(?=^## |(?![\s\S]))/m, (_, body) => {
    const sub = body.search(/^### /m)
    const top = sub === -1 ? body : body.slice(0, sub)
    // In subsections, a bullet with no link is repository provenance too.
    const rest = sub === -1 ? '' : body.slice(sub).split('\n').filter((l) => !/^- /.test(l) || LINK.test(l)).join('\n').trim()
    const kept = top
      .split(/\n\s*\n/)
      .map((block) => {
        block = block.trim()
        if (!block.startsWith('**Sources:**')) return block
        const cited = block
          .slice('**Sources:**'.length)
          .split(/(?<=[.!?])\s+(?=[A-Z[`])/)
          .filter((sentence) => LINK.test(sentence))
        return cited.length ? `**Sources:** ${cited.join(' ').trim()}` : ''
      })
      .filter((block) => LINK.test(block))
    const left = [...kept, rest].filter(Boolean).join('\n\n')
    return left ? `## References\n\n${left}\n\n` : ''
  })
}

/**
 * The only root folders the Learn sync may read (SEC-01). An allow-list, not a
 * deny-list: a new private folder stays private until someone adds it here.
 */
export const ALLOWED_ROOTS = [
  '00_Start_Here/',
  '01_Concept_Tutorials/',
  '02_System_Design_Case_Studies/',
  '03_Practice_Worksheets_and_Keys/',
  '04_Behavioral_and_Leadership/',
  '05_FDE_Delivery_and_Scoping/',
  '07_Last_Day_Revision/',
  '08_Company_Specific_Prep/Blitzy/',
]

/** Module statuses whose lessons are not published at all. */
export const UNPUBLISHED_STATUSES = ['on-hold', 'coming-soon']

/** Folders whose presence means the Learn sources are available. */
const PRESENCE_ROOTS = ['01_Concept_Tutorials', '05_FDE_Delivery_and_Scoping']

export const isAllowedSource = (source) =>
  !source.includes('..') && !source.toLowerCase().endsWith('.pdf') && ALLOWED_ROOTS.some((root) => source.startsWith(root))

const moduleBySlug = new Map(MODULES.map((m) => [m.slug, m]))

/**
 * Why a lesson is or is not published, as one word. Shared with check-parse.ts so
 * the sync and the check cannot disagree.
 */
export function lessonDecision(lesson) {
  const mod = moduleBySlug.get(lesson.home)
  if (!mod) return 'no-home'
  if (lesson.publish !== 'own' && lesson.publish !== 'credited') return lesson.publish
  if (UNPUBLISHED_STATUSES.includes(mod.status)) return mod.status
  if (!isAllowedSource(lesson.source)) return 'outside-allow-list'
  return 'publish'
}

export const lessonHref = (lesson) => {
  const mod = moduleBySlug.get(lesson.home)
  return curriculumHref(mod.track, mod.slug, lesson.slug)
}

/** Progress and slug-guard key, matching `fd:v1:learn:lesson:<moduleSlug>/<lessonSlug>`. */
export const lessonKey = (lesson) => `${lesson.home}/${lesson.slug}`

// ------------------------------------------------------------------ source shape

/**
 * A lesson's source can be a folder. Its main markdown is the folder's README, else
 * the first `.md` file in name order. Returns the absolute path, or null.
 */
export function mainFileOf(abs) {
  if (!existsSync(abs)) return null
  if (!statSync(abs).isDirectory()) return abs
  const files = readdirSync(abs).filter((f) => f.toLowerCase().endsWith('.md')).sort()
  const readme = files.find((f) => f.toLowerCase() === 'readme.md')
  const main = files.find((f) => /_Main\.md$/.test(f))
  const pick = readme ?? main ?? files[0]
  return pick ? join(abs, pick) : null
}

/** `.html` and `.ipynb` sources publish only through a `.md` sibling. */
function markdownSource(abs) {
  if (abs.endsWith('.md')) return abs
  const sibling = abs.replace(/\.(html|ipynb)$/i, '.md')
  return sibling !== abs && existsSync(sibling) ? sibling : null
}

// ------------------------------------------------------------------ sanitiser

/**
 * Splits markdown into code (fenced blocks and inline code spans, left alone) and
 * prose (sanitised and link-rewritten). `fn` maps one prose run.
 */
function mapProse(markdown, fn) {
  const out = []
  let fence = null
  let prose = []
  const flush = () => {
    if (prose.length) out.push(mapInline(prose.join('\n'), fn))
    prose = []
  }
  for (const line of markdown.split('\n')) {
    const marker = line.match(/^\s*(`{3,}|~{3,})/)
    if (fence) {
      out.push(line)
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null
      continue
    }
    if (marker) {
      flush()
      fence = marker[1]
      out.push(line)
      continue
    }
    prose.push(line)
  }
  flush()
  return out.join('\n')
}

/** Applies `fn` to text outside inline code spans. */
function mapInline(text, fn) {
  return text
    .split(/(`+[^`\n]*?`+)/g)
    .map((part, i) => (i % 2 === 1 ? part : fn(part)))
    .join('')
}

const UNSAFE_ELEMENT = /<(script|iframe|style)\b[\s\S]*?(<\/\1\s*>|\/>|$)/gi
const UNSAFE_OPEN = /<\/?(script|iframe|style)\b[^>]*>/gi
const EVENT_ATTR = /(<[a-zA-Z][^>]*?)\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/g

export function sanitise(markdown) {
  return mapProse(markdown, (text) => {
    let next = text.replace(UNSAFE_ELEMENT, '').replace(UNSAFE_OPEN, '')
    let previous
    do {
      previous = next
      next = next.replace(EVENT_ATTR, '$1')
    } while (next !== previous)
    return next
  })
}

/** Unsafe HTML left in prose (not in code), for check-parse.ts. */
export function findUnsafeHtml(markdown) {
  const found = []
  mapProse(markdown, (text) => {
    for (const [m] of text.matchAll(UNSAFE_OPEN)) found.push(m)
    for (const [m] of text.matchAll(/<[a-zA-Z][^>]*?\son[a-z]+\s*=[^>]*>/g)) found.push(m)
    return text
  })
  return found
}

// ------------------------------------------------------------------ headings

const EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu

/** Title without emoji or a decorative leading symbol. */
export const cleanTitle = (title) =>
  title.replace(EMOJI, '').replace(/^[\s\-–—:|·•*#]+/, '').replace(/\s{2,}/g, ' ').trim()

/**
 * Gives the page exactly one `#` heading: the curriculum title. A source with one
 * `#` heading has it replaced. A source that uses `#` for its sections has the first
 * one replaced and every later heading moved down one level, so the reading
 * pipeline (title at `#`, sections at `##`) sees the structure the author meant.
 */
function normaliseHeadings(markdown, title) {
  const lines = markdown.split('\n')
  let fence = null
  const h1 = []
  lines.forEach((line, i) => {
    const marker = line.match(/^\s*(`{3,}|~{3,})/)
    if (fence) {
      if (marker && marker[1][0] === fence[0]) fence = null
      return
    }
    if (marker) {
      fence = marker[1]
      return
    }
    if (/^#\s/.test(line)) h1.push(i)
  })
  const demote = h1.length > 1
  fence = null
  let replaced = false
  const out = []
  for (const [i, line] of lines.entries()) {
    const marker = line.match(/^\s*(`{3,}|~{3,})/)
    if (fence) {
      if (marker && marker[1][0] === fence[0]) fence = null
      out.push(line)
      continue
    }
    if (marker) {
      fence = marker[1]
      out.push(line)
      continue
    }
    if (!replaced && i === h1[0]) {
      out.push(`# ${title}`)
      replaced = true
      continue
    }
    const heading = line.match(/^(#{1,6})(\s.*)$/)
    if (heading && demote) {
      out.push(`${'#'.repeat(Math.min(heading[1].length + 1, 6))}${heading[2]}`)
      continue
    }
    out.push(line)
  }
  if (!replaced) out.unshift(`# ${title}`, '')
  return out.join('\n')
}

/** Drops a leading YAML front-matter block, which the reading pipeline would print. */
export const stripFrontMatter = (markdown) => markdown.replace(/^---\n[\s\S]*?\n---\n/, '')

// ------------------------------------------------------------------ lesson slices

/** Calls `fn(line, index)` for every line outside fenced code blocks. */
function eachProseLine(lines, fn) {
  let fence = null
  lines.forEach((line, i) => {
    const marker = line.match(/^\s*(`{3,}|~{3,})/)
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null
      return
    }
    if (marker) {
      fence = marker[1]
      return
    }
    fn(line, i)
  })
}

/**
 * Splits a markdown source at its `## ` headings (code fences respected). Returns
 * the preamble lines before the first H2 and one `{ heading, lines }` per H2
 * section, `heading` being the trimmed heading text.
 */
export function splitH2(markdown) {
  const lines = markdown.split('\n')
  const starts = []
  eachProseLine(lines, (line, i) => {
    const m = line.match(/^##\s+(.*?)\s*#*\s*$/)
    if (m) starts.push({ i, heading: m[1].trim() })
  })
  const preamble = lines.slice(0, starts[0]?.i ?? lines.length)
  const sections = starts.map((s, n) => ({ heading: s.heading, lines: lines.slice(s.i, starts[n + 1]?.i ?? lines.length) }))
  return { preamble, sections }
}

/** The H2 headings a lesson's `sections` rule publishes, in published order. */
export function publishedHeadings(lesson, headings) {
  const { include, exclude = [] } = lesson.sections ?? {}
  if (include) return [...include]
  return headings.filter((h) => !exclude.includes(h))
}

/** Listed headings that the source does not have, for error messages. */
export function unknownHeadings(lesson, headings) {
  const { include = [], exclude = [] } = lesson.sections ?? {}
  return [...include, ...exclude].filter((h) => !headings.includes(h))
}

/**
 * Applies a lesson's `sections` rule to its source (see CurriculumLesson.sections).
 * `include` keeps only the title heading of the preamble, then the listed sections
 * in order; `exclude` keeps everything but the listed sections. Throws when a listed
 * heading is not in the source.
 */
export function sliceMarkdown(markdown, lesson) {
  if (!lesson.sections) return markdown
  const { preamble, sections } = splitH2(markdown)
  const headings = sections.map((s) => s.heading)
  const unknown = unknownHeadings(lesson, headings)
  if (unknown.length) {
    throw new Error(`${lesson.slug}: sections lists heading(s) not found as "## " in ${lesson.source}: ${unknown.map((h) => JSON.stringify(h)).join(', ')}`)
  }
  const byHeading = new Map(sections.map((s) => [s.heading, s.lines]))
  if (lesson.sections.include) {
    const title = []
    eachProseLine(preamble, (line) => {
      if (!title.length && /^#\s/.test(line)) title.push(line, '')
    })
    return [...title, ...lesson.sections.include.flatMap((h) => byHeading.get(h))].join('\n')
  }
  const exclude = lesson.sections.exclude ?? []
  return [...preamble, ...sections.filter((s) => !exclude.includes(s.heading)).flatMap((s) => s.lines)].join('\n')
}

/** GitHub's heading anchor: lower case, punctuation dropped, spaces to hyphens. */
const githubSlug = (text) =>
  text
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .trim()
    .replace(/\s/g, '-')

/** The id the reading pipeline (src/lib/reading.ts) gives a lesson's `## ` section. */
const readingSlug = (text) =>
  text
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

/**
 * Every anchor a link may use to reach a heading of this markdown: the GitHub
 * anchor of any heading (as authored in the repository) and the `lesson-…` id the
 * site gives each `## ` section.
 */
export function headingAnchors(markdown) {
  const anchors = new Set(['lesson-intro'])
  eachProseLine(markdown.split('\n'), (line) => {
    const m = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/)
    if (!m) return
    anchors.add(githubSlug(m[2]))
    if (m[1].length === 2) anchors.add(`lesson-${readingSlug(m[2]) || 'section'}`)
  })
  return anchors
}

// ------------------------------------------------------------------ links

const repoPath = (repoRoot, abs) => relative(repoRoot, abs).split(sep).join('/')

/**
 * Site URLs of every page already published outside Learn, keyed by absolute
 * source path (file or folder). Case studies, worksheets and company packs are
 * passed in by their own sync steps; the Last-Day Review is derived here.
 */
function lastDayUrls(repoRoot) {
  const root = join(repoRoot, '07_Last_Day_Revision')
  const urls = new Map()
  urls.set(root, LAST_DAY.href)
  urls.set(join(root, 'README.md'), LAST_DAY.href)
  for (const g of LAST_DAY_GUIDES) urls.set(join(root, g.source), `${LAST_DAY.href}/${g.id}`)
  for (const r of REVIEWS) {
    const concise = `${LAST_DAY.href}/${r.dir}/${REVIEW_DOCS.concise.file}`
    urls.set(join(root, `${r.dir}.md`), concise)
    urls.set(join(root, 'html', r.dir), concise)
    for (const doc of Object.values(REVIEW_DOCS)) {
      urls.set(join(root, 'html', r.dir, doc.file), `${LAST_DAY.href}/${r.dir}/${doc.file}`)
    }
  }
  const sheet = `${LAST_DAY.href}/${TRIGGER_SHEET.dir}/${TRIGGER_SHEET.file}`
  urls.set(join(root, `${TRIGGER_SHEET.dir}.md`), sheet)
  urls.set(join(root, 'html', TRIGGER_SHEET.dir), sheet)
  urls.set(join(root, 'html', TRIGGER_SHEET.dir, TRIGGER_SHEET.file), sheet)
  return urls
}

/**
 * The lesson a link to a source file should open. A source published as slices has
 * several lessons: a link with an anchor goes to the slice holding that heading,
 * any other link to the slice without `include` (the main part), else the first.
 */
function lessonForSource(slices, anchor) {
  if (slices.length === 1) return slices[0].lesson
  const holder = anchor && slices.find((s) => s.anchors.has(anchor))
  return (holder || slices.find((s) => !s.lesson.sections?.include) || slices[0]).lesson
}

function rewriteHref(href, sourceFile, ctx) {
  // In-page anchor in a sliced lesson whose heading went to a sibling slice.
  if (href.startsWith('#') && ctx.self) {
    const anchor = href.slice(1)
    if (!anchor || ctx.self.anchors.has(anchor)) return null
    const sibling = (ctx.lessonsBySource.get(sourceFile) ?? []).find((s) => s.anchors.has(anchor))
    if (!sibling || sibling.lesson === ctx.self.lesson) return null
    ctx.stats.lesson++
    return `${lessonHref(sibling.lesson)}${href}`
  }
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(href)) return null
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return null
  const [pathPart, anchor = ''] = href.split('#')
  if (!pathPart) return null
  let decoded
  try {
    decoded = decodeURI(pathPart)
  } catch {
    decoded = pathPart
  }
  let abs = resolve(dirname(sourceFile), decoded).replace(/[\\/]$/, '')
  const rel = repoPath(ctx.repoRoot, abs)
  if (rel.startsWith('..')) return null
  const hash = anchor ? `#${anchor}` : ''

  const slices = ctx.lessonsBySource.get(abs)
  if (slices) {
    const lesson = lessonForSource(slices, anchor)
    ctx.stats.lesson++
    return `${lessonHref(lesson)}${hash}`
  }
  const live = ctx.liveUrls.get(abs)
  if (live) {
    ctx.stats.live++
    // A live URL that already names a tab keeps it; a source anchor is meaningless there.
    return live.includes('#') ? live : `${live}${hash}`
  }
  const replacement = ctx.retired?.get(abs)
  if (replacement) {
    // The replacement has different headings, so a source anchor is dropped.
    ctx.stats.lesson++
    return replacement
  }
  if (!existsSync(abs)) ctx.missing.push(`${repoPath(ctx.repoRoot, sourceFile)} -> ${href}`)
  ctx.stats.unlinked++
  return UNLINK
}

function rewriteLinks(markdown, sourceFile, ctx) {
  return mapProse(markdown, (text) =>
    text
      // Inline links and images: `[text](target "title")`, target optionally in <>.
      .replace(/\]\(\s*<?([^)\s>]+)>?(\s+"[^"]*")?\s*\)/g, (whole, href, title = '') => {
        const next = rewriteHref(href, sourceFile, ctx)
        return next === null ? whole : `](${next}${title})`
      })
      // Reference definitions: `[id]: target`.
      .replace(/^(\s{0,3}\[[^\]]+\]:\s*)<?(\S+?)>?(\s+.*)?$/gm, (whole, lead, href, rest = '') => {
        const next = rewriteHref(href, sourceFile, ctx)
        return next === null ? whole : `${lead}${next}${rest}`
      })
      // Raw HTML attributes.
      .replace(/\b(href|src)=("|')([^"']+)\2/g, (whole, attr, quote, href) => {
        const next = rewriteHref(href, sourceFile, ctx)
        return next === null ? whole : `${attr}=${quote}${next}${quote}`
      }),
  )
}

// ------------------------------------------------------------------ entry point

const wordCount = (markdown) => (markdown.replace(/[#>*_`|[\]()-]/g, ' ').match(/\S+/g) ?? []).length
const minutesFor = (markdown) => Math.max(1, Math.round(wordCount(markdown) / WORDS_PER_MINUTE))

/** Fails if a lesson key present in the previous manifest has gone without a RENAMED entry. */
export function slugGuard(previous, current) {
  const now = new Set(current.map((l) => `${l.module}/${l.slug}`))
  const problems = []
  for (const l of previous ?? []) {
    const key = `${l.module}/${l.slug}`
    if (now.has(key)) continue
    if (!(key in RENAMED)) {
      problems.push(`lesson ${key} was published before and is gone; add it to RENAMED in src/lib/curriculum.ts (new key, or null if withdrawn on purpose)`)
    } else if (RENAMED[key] !== null && !now.has(RENAMED[key])) {
      problems.push(`RENAMED maps ${key} to ${RENAMED[key]}, which is not published`)
    }
  }
  return problems
}

/**
 * `liveUrls` maps absolute source paths (files and folders) to the URL of the page
 * that already publishes them, filled in by the earlier sync steps.
 */
export async function syncLearn({ repoRoot, outDir, snapshotDir, liveUrls: given }) {
  const learnDir = join(outDir, 'learn')
  const previous = await readFile(join(snapshotDir, 'manifest.json'), 'utf8')
    .then((raw) => JSON.parse(raw).lessons)
    .catch(() => null)

  if (!PRESENCE_ROOTS.every((r) => existsSync(join(repoRoot, r)))) {
    if (!existsSync(join(snapshotDir, 'manifest.json'))) {
      throw new Error(`Learn sources are not available under ${repoRoot} and no committed content/learn snapshot was found.`)
    }
    await cp(snapshotDir, learnDir, { recursive: true })
    console.log('learn sync: sources not present; kept the committed content/learn snapshot')
    return { lessons: previous?.length ?? 0, snapshot: true }
  }

  const liveUrls = new Map([...given, ...lastDayUrls(repoRoot)])
  const lessonsBySource = new Map()
  /** Source path of a retired (excluded, RENAMED) lesson → URL of the lesson that replaced it. */
  const retired = new Map()
  const notes = []
  const plan = []
  for (const lesson of LESSONS) {
    const decision = lessonDecision(lesson)
    if (decision !== 'publish') {
      if (decision === 'outside-allow-list') notes.push(`${lesson.slug}: source outside the allow-list, not read (${lesson.source})`)
      // A retired lesson whose material moved (RENAMED) keeps its inbound repo links on
      // the site: they go to the lesson that replaced it, not to GitHub.
      const target = decision === 'excluded' ? RENAMED[lessonKey(lesson)] : null
      if (target) {
        const [moduleSlug, lessonSlug] = target.split('/')
        const mod = moduleBySlug.get(moduleSlug)
        if (mod) retired.set(resolve(repoRoot, lesson.source), curriculumHref(mod.track, mod.slug, lessonSlug))
      }
      continue
    }
    const abs = resolve(repoRoot, lesson.source)
    if (lesson.kind === 'live') {
      if (lesson.sections) throw new Error(`${lesson.slug}: a live lesson cannot have sections; only synced lessons can be sliced`)
      plan.push({ lesson, abs })
      continue
    }
    const main = mainFileOf(abs)
    if (!main) throw new Error(`${lesson.slug}: source not found at ${lesson.source}`)
    const md = markdownSource(main)
    if (!md) {
      notes.push(`${lesson.slug}: ${lesson.source} is not markdown and has no .md sibling; skipped`)
      continue
    }
    if (main !== abs) notes.push(`${lesson.slug}: folder source, published ${repoPath(repoRoot, md)}`)
    // A slice (lesson.sections) publishes part of the file; sliceMarkdown throws on unknown headings.
    const source = sliceMarkdown(stripFrontMatter(await readFile(md, 'utf8')), lesson)
    const slice = { lesson, anchors: headingAnchors(source) }
    plan.push({ lesson, abs, md, source, slice })
    for (const key of new Set([abs.replace(/[\\/]$/, ''), md])) {
      lessonsBySource.set(key, [...(lessonsBySource.get(key) ?? []), slice])
    }
  }

  const stats = { lesson: 0, live: 0, unlinked: 0 }
  const ctx = { repoRoot, lessonsBySource, liveUrls, retired, stats, missing: [] }
  const manifest = []
  await rm(learnDir, { recursive: true, force: true })

  for (const { lesson, abs, md, source, slice } of plan) {
    const mod = moduleBySlug.get(lesson.home)
    const entry = {
      slug: lesson.slug,
      title: cleanTitle(lesson.title),
      track: mod.track,
      module: mod.slug,
      kind: lesson.kind,
      publish: lesson.publish,
      ...(lesson.credit && { credit: lesson.credit }),
      source: lesson.source,
    }
    if (lesson.kind === 'live') {
      const href = liveUrls.get(abs.replace(/[\\/]$/, ''))
      if (!href) throw new Error(`${lesson.slug}: live lesson source ${lesson.source} matches no published page`)
      const main = mainFileOf(abs)
      entry.estMinutes = main ? minutesFor(await readFile(main, 'utf8')) : 1
      entry.href = href
      manifest.push(entry)
      continue
    }
    let body = stripRepoReferences(normaliseHeadings(source, entry.title))
    body = unlinkRepoLinks(rewriteLinks(body, md, { ...ctx, self: lesson.sections ? slice : null }))
    body = sanitise(body)
    const out = join(learnDir, mod.track, mod.slug, `${lesson.slug}.md`)
    await mkdir(dirname(out), { recursive: true })
    await writeFile(out, body.endsWith('\n') ? body : `${body}\n`)
    entry.estMinutes = minutesFor(body)
    entry.href = lessonHref(lesson)
    manifest.push(entry)
  }

  const guard = slugGuard(previous, manifest)
  if (guard.length) throw new Error(guard.join('\n'))

  const trackOrder = new Map(TRACKS.map((t, i) => [t.slug, i]))
  await mkdir(learnDir, { recursive: true })
  await writeFile(
    join(learnDir, 'manifest.json'),
    `${JSON.stringify({ lessons: manifest.sort((a, b) => (trackOrder.get(a.track) ?? 0) - (trackOrder.get(b.track) ?? 0)) }, null, 2)}\n`,
  )

  for (const note of notes) console.log(`  learn: ${note}`)
  for (const m of ctx.missing) console.warn(`  warning: learn link to a missing repo file: ${m}`)
  const synced = manifest.filter((l) => l.kind === 'sync').length
  const live = manifest.length - synced
  console.log(
    `learn sync: ${synced} lessons synced, ${live} live hrefs resolved; links rewritten: ` +
      `${stats.lesson} to lessons, ${stats.live} to live pages, ${stats.unlinked} to plain text` +
      (ctx.missing.length ? ` (${ctx.missing.length} to missing files)` : ''),
  )
  return { lessons: manifest.length, synced, live, links: stats, missing: ctx.missing.length }
}

/** Absolute path of the snapshot copy kept across a full content refresh. */
export const learnSnapshotDir = (siteDir) => join(siteDir, '.learn-snapshot')

/**
 * Copies the committed content/learn aside before `content/` is wiped. If an earlier
 * run failed after the wipe, content/learn is gone but its snapshot survives, so the
 * snapshot is kept rather than lost.
 */
export async function snapshotLearn({ outDir, snapshotDir }) {
  if (!existsSync(join(outDir, 'learn'))) return
  await rm(snapshotDir, { recursive: true, force: true })
  await cp(join(outDir, 'learn'), snapshotDir, { recursive: true })
}
