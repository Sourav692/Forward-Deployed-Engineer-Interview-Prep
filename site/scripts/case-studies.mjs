/**
 * Syncs the FDE Case Studies module: the three-layer interview guides under
 * `02_System_Design_Case_Studies/Scenario_Packs_G01_G20/`, one folder per group (G01–G20).
 *
 * Unlike the worksheet modules, these are reading pages. Each group folder holds four
 * documents, one subfolder each, named after the tab they become on the group's page:
 *
 *   1_Interview_Guide/Gxx_Interview_Guide.md         -> main        (opens by default)
 *   2_Technical_Deep_Dive/Gxx_Technical_Deep_Dive.md -> deep-dive
 *   3_Quick_Review/Gxx_Quick_Review.md               -> cheat-sheet
 *   4_Full_Design/Gxx_Full_Design.md                 -> full-pack   (the original sourced pack)
 *
 * A document over the page-length limit is split at its H2s into `<name>_Part_2.md`,
 * `<name>_Part_3.md`, … beside it, and each part is a tab of its own (`withParts`).
 *
 * The standalone cases under `02_System_Design_Case_Studies/Standalone_Designs/` have no fixed shape — one to
 * five documents each — so they are declared in `STANDALONE` with a label per file, and
 * each file becomes a tab. The manifest carries each page's tab list, so the app never
 * assumes four tabs.
 *
 * Cases are shown under themes, and a theme is a track: that keeps the module page,
 * progress and prev/next working through the same manifest shape as every other module.
 *
 * Links are rewritten here, once, so the site never renders a path into the repo:
 * a link to another group's document becomes that group's page on the site (only
 * if the group is published), and every other repo link becomes its plain text (the
 * repository is private). The `## References` provenance tables are dropped too
 * (`stripRepoReferences`); their fact-check sources stay.
 */

import { existsSync, statSync } from 'node:fs'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { TITLE_OVERRIDES, TRACKS, readingMinutes, tabMeta } from '../src/lib/editorial.ts'
import { CASEBOOK_MODULE, scenarioHref } from '../src/lib/scenario.ts'
import { applySiteEdits, assertReplaceRulesUsed, introFor, renumberSections } from './case-site-edits.mjs'
import { UNLINK, gitDates, stripClockLine, stripRepoReferences, unlinkRepoLinks } from './learn.mjs'

export const CASE_STUDY_MODULE_ID = CASEBOOK_MODULE

/**
 * Groups published on the site. Extend this list to publish more; a group missing
 * from it gets no page, and links to it become plain text. `null` publishes every group.
 * Standalone cases are always published.
 */
const PUBLISHED = null

/**
 * A group's tabs. Order is display order; the first tab opens by default.
 *
 * `id` is what URLs (`#deep-dive`) and saved read-state use, so it never changes.
 * The visible label comes from `TABS` in `src/lib/editorial.ts`; renaming a tab there
 * must not — and cannot — touch its id.
 */
export const DOC_TABS = [
  { id: 'main', file: '1_Interview_Guide/Interview_Guide' },
  { id: 'deep-dive', file: '2_Technical_Deep_Dive/Technical_Deep_Dive' },
  { id: 'cheat-sheet', file: '3_Quick_Review/Quick_Review' },
  { id: 'full-pack', file: '4_Full_Design/Full_Design' },
]

/** `1_Interview_Guide/Interview_Guide` in group `G01_…` -> `1_Interview_Guide/G01_Interview_Guide.md` */
const docFile = (folder, tab) => tab.file.replace('/', `/${folder.slice(0, 3)}_`) + '.md'

function labelOf(id, parts = 1) {
  const tab = tabMeta(id, parts)
  if (!tab) throw new Error(`Tab id "${id}" has no entry in TABS (src/lib/editorial.ts)`)
  return tab.label
}

/**
 * A tab too long for one page is split at its H2s into part files (ENH-25): `<name>.md`,
 * then `<name>_Part_2.md`, `<name>_Part_3.md`, … beside it. Part 1 keeps the tab's id, so
 * links and saved read state hold; later parts become tabs `<id>-part-<n>`.
 */
const partFile = (file, n) => file.replace(/\.md$/, `_Part_${n}.md`)
function withParts(tab) {
  const parts = [tab]
  while (existsSync(partFile(tab.src, parts.length + 1))) {
    const src = partFile(tab.src, parts.length + 1)
    parts.push({ id: `${tab.id}-part-${parts.length + 1}`, file: partFile(tab.file, parts.length + 1), src })
  }
  return parts.map((p) => ({ ...p, label: labelOf(p.id, parts.length) }))
}

/**
 * Themes, in display order. Track ids must stay unique across the whole site —
 * saved progress is keyed `trackId/slug`. Titles and descriptions live in `TRACKS`
 * (src/lib/editorial.ts); this list only says which groups each theme holds.
 */
const THEME_GROUPS = [
  ['knowledge-retrieval', ['G01', 'G06', 'G08', 'G11']],
  ['agents-that-act', ['G02', 'G03', 'G04', 'G05', 'G09', 'G16', 'G17']],
  ['platforms-and-scale', ['G07', 'G10', 'G15', 'G18', 'G20']],
  ['delivery-evaluation-operations', ['G12', 'G13', 'G14']],
  ['model-development', ['G19']],
  ['standalone-designs', []],
  ['judgement-and-decomposition', []],
]

const THEMES = THEME_GROUPS.map(([id, groups]) => {
  if (!TRACKS[id]) throw new Error(`Theme "${id}" has no entry in TRACKS (src/lib/editorial.ts)`)
  return { id, ...TRACKS[id], groups }
})

/**
 * Standalone cases, keyed by folder under `02_System_Design_Case_Studies/Standalone_Designs/`. `number`
 * orders them and is the case number from CASE_STUDY_INDEX.xlsx.
 * Each case folder holds one subfolder per tab, named after the tab's label and
 * numbered by its position (`1_Interview_Casebook/04_Interview_Casebook.md`), with any
 * `_Part_N.md` files beside part 1. `files` are `[file, tabId]`, published as tabs, with
 * `file` relative to the case folder; `archived` are `[file, label]`, superseded
 * versions that stay in the repo only: not published, not linked, not searched. Every
 * `.md` in the folder (subfolders included) must be in one list or the other, so a new
 * file cannot silently go unpublished. A file given as a repo-relative path (it starts
 * with a root folder such as `03_…/`) is read from its canonical location instead of
 * the case folder, so a case reuses a worksheet or tutorial without keeping a copy.
 * A case's interactive worksheet twin is listed in RELATED_CASE (src/lib/editorial.ts).
 */
const SYSTEM_DESIGN_WORKSHEETS = '03_Practice_Worksheets_and_Keys/System_Design_Worksheets'
const LONG_FORM_V1 = '02_System_Design_Case_Studies/Scenario_Tutorials_Long_Form/Version_1'
/** Worksheet and key come from the System Design worksheets; only the V2 tutorial is local. */
const worksheetSet = (slug, num) => [
  [`${SYSTEM_DESIGN_WORKSHEETS}/${slug}.md`, 'worksheet'],
  [`${SYSTEM_DESIGN_WORKSHEETS}/answer_keys/${slug}_answer_key.md`, 'answer-key'],
  [`3_Tutorial/${num}_Tutorial.md`, 'tutorial-v2'],
]
const v1Archive = (chapter) => [[`${LONG_FORM_V1}/${chapter}.md`, 'Tutorial V1 (superseded)']]
/** Repo roots are `00_` to `99_`; a case's own tab folders start with one digit (`1_…`). */
const isRepoPath = (file) => /^\d{2}_[^/]+\//.test(file)
/** A case that is one document: the Interview Guide tab, in `1_Interview_Guide/`. */
const guide = (prefix) => [[`1_Interview_Guide/${prefix}_Interview_Guide.md`, 'guide']]

const STANDALONE = [
  { folder: '04_Recruiting_Platform', theme: 'standalone-designs', number: 4, title: 'AI-Powered Recruiting Platform',
    files: [['1_Interview_Casebook/04_Interview_Casebook.md', 'casebook'], ['2_Reference_Design/04_Reference_Design.md', 'full-design']] },
  { folder: '14_Travel_Agent_Worked_Example', theme: 'standalone-designs', number: 14, title: 'Travel Agent: the 12-Part Framework Worked Through',
    files: [['1_Worked_Example/14_Worked_Example.md', 'worked-example'], ['2_12_Part_Framework/14_12_Part_Framework.md', 'framework-overview']] },
  { folder: '19_Air_Gapped_AI_System', theme: 'standalone-designs', number: 19, title: 'AI System for an Air-Gapped Environment',
    files: worksheetSet('07_ai_system_for_an_air_gapped_environment', 19),
    archived: v1Archive('chapter-7-ai-system-for-an-air-gapped-environment-tutorial') },
  { folder: '23_Reliable_Workflow_Orchestration', theme: 'standalone-designs', number: 23, title: 'Reliable Workflow Orchestration System',
    files: worksheetSet('13_reliable_workflow_orchestration_system', 23),
    archived: v1Archive('chapter-13-reliable-workflow-orchestration-system-tutorial') },
  { folder: '25_Configurable_Platform_Customer_Workflows', theme: 'standalone-designs', number: 25, title: 'Configurable Platform for Customer-Specific Workflows',
    files: worksheetSet('17_configurable_platform_customer_specific_workflows', 25),
    archived: v1Archive('chapter-17-configurable-platform-customer-specific-workflows-tutorial') },
  { folder: '26_Enterprise_Chatbot_Platform', theme: 'standalone-designs', number: 26, title: 'Enterprise Chatbot Platform',
    files: worksheetSet('21_enterprise_chatbot_platform', 26),
    archived: [
      ...v1Archive('chapter-21-enterprise-chatbot-platform-tutorial-condensed'),
      [`${LONG_FORM_V1}/chapter-21-enterprise-chatbot-platform-tutorial.md`, 'Original uncondensed tutorial'],
    ] },
  { folder: '80_Self_Adapting_Agent', theme: 'standalone-designs', number: 80, title: 'Agent That Adapts to New Tasks',
    files: [['1_Interview_Guide/80_Interview_Guide.md', 'guide'], ['2_Answer_Template/80_Answer_Template.md', 'interview-template']] },
  { folder: '98_Personal_Assistant_With_Memory', theme: 'standalone-designs', number: 98, title: 'Personal Assistant That Remembers You', files: guide('98') },
  { folder: '100_Production_LLM_Gateway', theme: 'standalone-designs', number: 100, title: 'Production LLM Gateway', files: guide('100') },
  { folder: '60_Prioritize_AI_Use_Cases', theme: 'judgement-and-decomposition', number: 60, title: 'Prioritise AI Use Cases for a Large Enterprise', files: guide('60') },
  { folder: '61_Scale_Prototype_To_Production', theme: 'judgement-and-decomposition', number: 61, title: 'Scale a Prototype from 100 to 100,000 Users', files: guide('61') },
  { folder: '62_Build_When_Customer_Data_Is_Poor', theme: 'judgement-and-decomposition', number: 62, title: 'Build When the Customer\u2019s Data Is Poor', files: guide('62') },
  { folder: 'Decomposition_Classics_67_68_69', theme: 'judgement-and-decomposition', number: 67, title: 'Decomposition Classics: 911, Bank Fraud, Medication Errors',
    files: guide('Decomposition_Classics_67_68_69') },
]

const isPublished = (group) => PUBLISHED === null || PUBLISHED.includes(group)

/** `G01_Enterprise_Knowledge_Assistant` -> `enterprise-knowledge-assistant` */
const slugOf = (folder) => folder.replace(/^G\d+_/, '').replace(/_/g, '-').toLowerCase()

/** Name from the Main guide's heading: `# G01 — Enterprise Knowledge Assistant: Interview Guide`. */
function nameFrom(mainMarkdown, folder) {
  const line = mainMarkdown.split('\n').find((l) => l.startsWith('# ')) ?? ''
  const match = line.match(/^#\s+G\d+(?:\s*[—–-])?\s+(.+?)\s*:\s*(Main\s+)?Interview Guide\s*$/i)
  return match ? match[1] : folder.replace(/^G\d+_/, '').replace(/_/g, ' ')
}

/**
 * Case headings drop the internal codes authors work with (audit check PQ-08): the pack
 * code in `# G01 — Enterprise Knowledge Assistant: Interview Guide` and a trailing problem
 * number like `(#73)`. The sources keep them. Lines inside code fences are left alone.
 */
function stripHeadingCodes(markdown) {
  let fenced = false
  return markdown
    .split('\n')
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) fenced = !fenced
      if (fenced || !/^#{1,6} /.test(line)) return line
      return line.replace(/^(#{1,6} )G\d{2}(?: [—–-])? /, '$1').replace(/ \(#\d+\)\s*$/, '')
    })
    .join('\n')
}

async function listGroups(root) {
  const entries = await readdir(root, { withFileTypes: true })
  const groups = new Map()
  for (const e of entries) {
    const m = e.isDirectory() && e.name.match(/^(G\d{2})_/)
    if (m) groups.set(m[1], e.name)
  }
  return groups
}

/**
 * Resolves one markdown link target found in `sourceFile`.
 * Returns the rewritten href, or null to leave the link untouched.
 */
function rewriteHref(href, sourceFile, ctx) {
  if (/^(https?:|mailto:|#|\/)/i.test(href)) return null
  const [pathPart] = href.split('#')
  if (!pathPart) return null

  let abs = resolve(dirname(sourceFile), decodeURI(pathPart))

  const isDir = existsSync(abs) && statSync(abs).isDirectory()
  if (isDir && ctx.pages.has(abs)) return ctx.pages.get(abs)
  // A file in a published folder that is not one of its tabs — an archived tutorial —
  // has no place on the site, so it becomes plain text like any other repo file.
  if (!isDir && ctx.tabs.has(abs)) return ctx.tabs.get(abs)

  if (relative(ctx.repoRoot, abs).startsWith('..')) return null
  return UNLINK
}

function rewriteLinks(markdown, sourceFile, ctx) {
  // Inline links only: `[text](target)`. Image links share the syntax and are
  // rewritten the same way, which is what a repo image would need too.
  return markdown.replace(/\]\(([^)\s]+)(\s+"[^"]*")?\)/g, (whole, href, title = '') => {
    const next = rewriteHref(href, sourceFile, ctx)
    return next === null ? whole : `](${next}${title})`
  })
}

/** Every page to publish, whatever its source shape, as one list. */
async function collectCases(root, standaloneRoot, repoRoot) {
  const groups = await listGroups(root)
  const listed = THEMES.flatMap((t) => t.groups)
  const unlisted = [...groups.keys()].filter((g) => !listed.includes(g))
  if (unlisted.length) {
    throw new Error(`Case study groups with no theme: ${unlisted.join(', ')} — add them to THEMES`)
  }

  const cases = []
  for (const theme of THEMES) {
    for (const g of theme.groups) {
      if (!groups.has(g) || !isPublished(g)) continue
      const folder = groups.get(g)
      const dir = join(root, folder)
      const tabs = DOC_TABS.flatMap((t) => withParts({ id: t.id, file: docFile(folder, t), src: join(dir, docFile(folder, t)) }))
      const intro = introFor(slugOf(folder))
      if (intro) tabs.unshift({ id: 'intro', file: basename(intro), src: intro, label: labelOf('intro') })
      const main = await readFile(tabs.find((t) => t.id === 'main').src, 'utf8')
      cases.push({ theme: theme.id, dir, slug: slugOf(folder), code: g, order: Number(g.slice(1)), title: nameFrom(main, folder), tabs })
    }
  }

  const onDisk = (await readdir(standaloneRoot, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name)
  const declared = STANDALONE.map((c) => c.folder)
  const undeclared = onDisk.filter((f) => !declared.includes(f))
  if (undeclared.length) throw new Error(`Standalone folders not declared in STANDALONE: ${undeclared.join(', ')}`)

  for (const c of STANDALONE) {
    if (!THEMES.some((t) => t.id === c.theme)) throw new Error(`${c.folder}: unknown theme ${c.theme}`)
    const dir = join(standaloneRoot, c.folder)
    const files = (await readdir(dir, { recursive: true })).filter((f) => f.endsWith('.md')).map((f) => f.split('\\').join('/'))
    const declared = [...c.files, ...(c.archived ?? [])].map(([f]) => f)
    const declaredFiles = declared.filter((f) => !isRepoPath(f))
    const missing = [
      ...declaredFiles.filter((f) => !files.includes(f)),
      ...declared.filter((f) => isRepoPath(f) && !existsSync(join(repoRoot, f))),
    ]
    const isPart = (f) => declaredFiles.some((d) => /^_Part_\d+\.md$/.test(f.slice(d.length - 3)) && f.startsWith(d.slice(0, -3)))
    const extra = files.filter((f) => !declaredFiles.includes(f) && !isPart(f))
    if (missing.length || extra.length) {
      throw new Error(`${c.folder}: declared files do not match disk (missing: ${missing.join(', ') || '—'}; undeclared: ${extra.join(', ') || '—'})`)
    }
    cases.push({
      theme: c.theme,
      dir,
      slug: c.folder.replace(/^\d+_/, '').replace(/_/g, '-').toLowerCase(),
      order: c.number,
      title: c.title,
      tabs: c.files.flatMap(([file, id]) =>
        withParts({ id, file: basename(file), src: isRepoPath(file) ? join(repoRoot, file) : join(dir, file) }),
      ),
    })
  }
  return cases
}

const caseUrl = (c) => scenarioHref({ moduleId: CASE_STUDY_MODULE_ID, trackId: c.theme, slug: c.slug })

/**
 * `sourceUrls`, when given, is filled with the site URL of every published case:
 * absolute folder path -> page URL, absolute tab file -> page URL with its tab. The
 * Learn sync uses it to link lessons to these pages instead of the repository. A
 * file another module already publishes (a reused worksheet) keeps that mapping.
 */
export async function syncCaseStudies({ repoRoot, outDir, sourceUrls }) {
  const caseStudiesDir = join(repoRoot, '02_System_Design_Case_Studies')
  const root = join(caseStudiesDir, 'Scenario_Packs_G01_G20')
  const cases = await collectCases(root, join(caseStudiesDir, 'Standalone_Designs'), repoRoot)

  // Page URL per published folder and per tab file, so cross-links point at the site
  // instead of the repo.
  const pages = new Map()
  const tabs = new Map()
  for (const c of cases) {
    pages.set(c.dir, caseUrl(c))
    for (const t of c.tabs) {
      const file = t.src ?? join(c.dir, t.file)
      // A file shared from another module (a reused worksheet) stays out, as before.
      if (file.startsWith(`${c.dir}/`)) tabs.set(file, `${caseUrl(c)}#${t.id}`)
    }
  }
  const ctx = { root, repoRoot, pages, tabs }
  if (sourceUrls) {
    for (const c of cases) {
      const url = caseUrl(c)
      sourceUrls.set(c.dir, url)
      for (const tab of c.tabs) {
        const file = tab.src ?? join(c.dir, tab.file)
        if (!sourceUrls.has(file)) sourceUrls.set(file, `${url}#${tab.id}`)
      }
    }
  }

  const updatedOf = gitDates(repoRoot)
  // Case codes the packs use for each other ("as in G01"), mapped to the titles the site shows.
  const codes = new Map(cases.filter((c) => c.code).map((c) => [c.code, TITLE_OVERRIDES[`${c.theme}/${c.slug}`] ?? c.title]))
  const tracks = []
  for (const theme of THEMES) {
    const scenarios = []
    const inTheme = cases.filter((c) => c.theme === theme.id).sort((a, b) => a.order - b.order)
    for (const c of inTheme) {
      const outBase = join(outDir, 'modules', CASE_STUDY_MODULE_ID, theme.id, c.slug)
      await mkdir(outBase, { recursive: true })
      let minutes = 0
      const sources = new Map()
      const cut = new Set()
      for (const tab of c.tabs) {
        const file = tab.src ?? join(c.dir, tab.file)
        if (!existsSync(file)) throw new Error(`Missing ${tab.label} document: ${file}`)
        const raw = stripRepoReferences(stripClockLine(await readFile(file, 'utf8')))
        const edited = applySiteEdits(c.slug, raw, file, { codes, own: c.code })
        sources.set(tab.id, edited.markdown)
        if (edited.cutSection) cut.add(tab.id.replace(/-part-\d+$/, ''))
      }
      assertReplaceRulesUsed(c.slug)
      // A document that lost a section is renumbered; its parts share one numbering.
      const byDocument = Map.groupBy(c.tabs, (tab) => tab.id.replace(/-part-\d+$/, ''))
      for (const [doc, tabs] of byDocument) {
        if (!cut.has(doc)) continue
        const parts = renumberSections(tabs.map((tab) => sources.get(tab.id)), `${c.slug}/${doc}`)
        tabs.forEach((tab, i) => sources.set(tab.id, parts[i]))
      }
      for (const tab of c.tabs) {
        const file = tab.src ?? join(c.dir, tab.file)
        const markdown = stripHeadingCodes(unlinkRepoLinks(rewriteLinks(sources.get(tab.id), file, ctx)))
        await writeFile(join(outBase, `${tab.id}.md`), markdown)
        // The Introduction is the case's landing page; the page leaves it out of the reading time, so the listing does too.
        if (tab.id !== 'intro') minutes += readingMinutes(markdown)
      }
      scenarios.push({
        slug: c.slug,
        order: c.order,
        title: TITLE_OVERRIDES[`${theme.id}/${c.slug}`] ?? c.title,
        tabs: c.tabs.map(({ id, label }) => ({ id, label })),
        minutes,
        updated: updatedOf(...c.tabs.map((tab) => tab.src ?? join(c.dir, tab.file))),
      })
    }
    if (scenarios.length) {
      tracks.push({ id: theme.id, title: theme.title, blurb: theme.blurb, scenarios })
    }
  }

  if (tracks.length === 0) throw new Error('FDE Case Studies produced no published pages')
  return { id: CASE_STUDY_MODULE_ID, kind: 'reading', tracks }
}
