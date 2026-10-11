/**
 * Syncs the FDE Case Studies module: the three-layer interview guides under
 * `02_System_Design_Case_Studies/Scenario_Packs_G01_G20/`, one folder per group (G01–G20).
 *
 * Unlike the worksheet modules, these are reading pages. Each group folder holds four
 * documents, and each becomes a tab on the group's page:
 *
 *   Gxx_Name_Main.md        -> main        (the interview guide; opens by default)
 *   Gxx_Name_Deep_Dive.md   -> deep-dive
 *   Gxx_Name_Cheat_Sheet.md -> cheat-sheet
 *   Gxx_Name.md             -> full-pack   (the original consolidated, sourced pack)
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
import { TABS, TITLE_OVERRIDES, TRACKS } from '../src/lib/editorial.ts'
import { CASEBOOK_MODULE, scenarioHref } from '../src/lib/scenario.ts'
import { UNLINK, gitDates, stripRepoReferences, unlinkRepoLinks } from './learn.mjs'

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
  { id: 'main', suffix: '_Main' },
  { id: 'deep-dive', suffix: '_Deep_Dive' },
  { id: 'cheat-sheet', suffix: '_Cheat_Sheet' },
  { id: 'full-pack', suffix: '' },
]

function labelOf(id) {
  const tab = TABS[id]
  if (!tab) throw new Error(`Tab id "${id}" has no entry in TABS (src/lib/editorial.ts)`)
  return tab.label
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
 * orders them and is the case number from CASE_STUDY_INDEX.xlsx; `tag` is the badge.
 * `files` are `[file, tabId]`, published as tabs; `archived` are `[file, label]`,
 * superseded versions that stay in the repo only: not published, not linked, not
 * searched. Every `.md` in the
 * folder must be in one list or the other, so a new file cannot silently go unpublished.
 * A file given as a repo-relative path (it contains `/`) is read from its canonical
 * location instead of the case folder, so a case reuses a worksheet or tutorial
 * without keeping a copy.
 * `practice` names the same case's interactive worksheet in Module 01 (`track/slug`),
 * which the page links to — the Worksheet tab here is read-only.
 */
const SYSTEM_DESIGN_WORKSHEETS = '03_Practice_Worksheets_and_Keys/System_Design_Worksheets'
const LONG_FORM_V1 = '02_System_Design_Case_Studies/Scenario_Tutorials_Long_Form/Version_1'
/** Worksheet and key come from the System Design worksheets; only the V2 tutorial is local. */
const worksheetSet = (slug) => [
  [`${SYSTEM_DESIGN_WORKSHEETS}/${slug}.md`, 'worksheet'],
  [`${SYSTEM_DESIGN_WORKSHEETS}/answer_keys/${slug}_answer_key.md`, 'answer-key'],
  ['3_Tutorial_V2.md', 'tutorial-v2'],
]
const v1Archive = (chapter) => [[`${LONG_FORM_V1}/${chapter}.md`, 'Tutorial V1 (superseded)']]
const isRepoPath = (file) => file.includes('/')
const guide = (file) => [[file, 'guide']]

const STANDALONE = [
  { folder: '04_Recruiting_Platform', theme: 'standalone-designs', number: 4, title: 'AI-Powered Recruiting Platform',
    files: [['1_Handbook_Casebook_Recruiting_Platform.md', 'casebook'], ['2_FDE_Recruiting_Platform_Design_long.md', 'full-design']] },
  { folder: '14_Travel_Agent_Worked_Example', theme: 'standalone-designs', number: 14, title: 'Travel Agent: the 12-Part Framework Worked Through',
    files: [['1_Handbook_Worked_Example_Travel_Agent.md', 'worked-example'], ['2_FDE_System_Design_Overview_source.md', 'framework-overview']] },
  { folder: '19_Air_Gapped_AI_System', theme: 'standalone-designs', number: 19, title: 'AI System for an Air-Gapped Environment',
    files: worksheetSet('07_ai_system_for_an_air_gapped_environment'),
    archived: v1Archive('chapter-7-ai-system-for-an-air-gapped-environment-tutorial'), practice: 'system-design/ai-system-for-an-air-gapped-environment' },
  { folder: '23_Reliable_Workflow_Orchestration', theme: 'standalone-designs', number: 23, title: 'Reliable Workflow Orchestration System',
    files: worksheetSet('13_reliable_workflow_orchestration_system'),
    archived: v1Archive('chapter-13-reliable-workflow-orchestration-system-tutorial'), practice: 'system-design/reliable-workflow-orchestration-system' },
  { folder: '25_Configurable_Platform_Customer_Workflows', theme: 'standalone-designs', number: 25, title: 'Configurable Platform for Customer-Specific Workflows',
    files: worksheetSet('17_configurable_platform_customer_specific_workflows'),
    archived: v1Archive('chapter-17-configurable-platform-customer-specific-workflows-tutorial'), practice: 'system-design/configurable-platform-customer-specific-workflows' },
  { folder: '26_Enterprise_Chatbot_Platform', theme: 'standalone-designs', number: 26, title: 'Enterprise Chatbot Platform',
    files: worksheetSet('21_enterprise_chatbot_platform'),
    archived: [
      ...v1Archive('chapter-21-enterprise-chatbot-platform-tutorial-condensed'),
      [`${LONG_FORM_V1}/chapter-21-enterprise-chatbot-platform-tutorial.md`, 'Original uncondensed tutorial'],
    ],
    practice: 'system-design/enterprise-chatbot-platform' },
  { folder: '80_Self_Adapting_Agent', theme: 'standalone-designs', number: 80, title: 'Agent That Adapts to New Tasks',
    files: [['80_Self_Adapting_Agent.md', 'guide'], ['self_adapting_agent_fde_interview_template.md', 'interview-template']] },
  { folder: '98_Personal_Assistant_With_Memory', theme: 'standalone-designs', number: 98, title: 'Personal Assistant That Remembers You', files: guide('98_Personal_Assistant_With_Memory.md') },
  { folder: '100_Production_LLM_Gateway', theme: 'standalone-designs', number: 100, title: 'Production LLM Gateway', files: guide('100_Production_LLM_Gateway.md') },
  { folder: '60_Prioritize_AI_Use_Cases', theme: 'judgement-and-decomposition', number: 60, title: 'Prioritise AI Use Cases for a Large Enterprise', files: guide('60_Prioritize_AI_Use_Cases.md') },
  { folder: '61_Scale_Prototype_To_Production', theme: 'judgement-and-decomposition', number: 61, title: 'Scale a Prototype from 100 to 100,000 Users', files: guide('61_Scale_Prototype_To_Production.md') },
  { folder: '62_Build_When_Customer_Data_Is_Poor', theme: 'judgement-and-decomposition', number: 62, title: 'Build When the Customer\u2019s Data Is Poor', files: guide('62_Build_When_Customer_Data_Is_Poor.md') },
  { folder: 'Decomposition_Classics_67_68_69', theme: 'judgement-and-decomposition', number: 67, tag: '#67\u201369', title: 'Decomposition Classics: 911, Bank Fraud, Medication Errors',
    files: guide('Decomposition_Classics_67_68_69.md') },
]

const isPublished = (group) => PUBLISHED === null || PUBLISHED.includes(group)

/** `G01_Enterprise_Knowledge_Assistant` -> `enterprise-knowledge-assistant` */
const slugOf = (folder) => folder.replace(/^G\d+_/, '').replace(/_/g, '-').toLowerCase()

/** Name from the Main guide's heading: `# G01 — Enterprise Knowledge Assistant: Interview Guide`. */
function nameFrom(mainMarkdown, folder) {
  const line = mainMarkdown.split('\n').find((l) => l.startsWith('# ')) ?? ''
  const match = line.match(/^#\s+G\d+\s*[—–-]\s*(.+?)\s*:\s*(Main\s+)?Interview Guide\s*$/i)
  return match ? match[1] : folder.replace(/^G\d+_/, '').replace(/_/g, ' ')
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

  // Packs written before the three-layer folders existed link to `Gxx_Name.md` at the
  // top of the packs folder. That file now lives inside its own folder.
  if (!existsSync(abs)) {
    const moved = join(dirname(abs), basename(abs, '.md'), basename(abs))
    if (existsSync(moved)) abs = moved
  }

  const isDir = existsSync(abs) && statSync(abs).isDirectory()
  // A file in a published folder that is not one of its tabs — an archived tutorial —
  // has no place on the site, so it becomes plain text like any other repo file.
  const page = ctx.pages.get(isDir ? abs : dirname(abs))
  if (page && (isDir || page.tabsByFile.has(basename(abs)))) {
    const tab = isDir ? null : page.tabsByFile.get(basename(abs))
    return `${page.url}${tab ? `#${tab}` : ''}`
  }

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
      const tabs = DOC_TABS.map((t) => ({ id: t.id, label: labelOf(t.id), file: `${folder}${t.suffix}.md` }))
      const main = await readFile(join(dir, tabs[0].file), 'utf8')
      cases.push({ theme: theme.id, dir, slug: slugOf(folder), tag: g, order: Number(g.slice(1)), title: nameFrom(main, folder), tabs })
    }
  }

  const onDisk = (await readdir(standaloneRoot, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name)
  const declared = STANDALONE.map((c) => c.folder)
  const undeclared = onDisk.filter((f) => !declared.includes(f))
  if (undeclared.length) throw new Error(`Standalone folders not declared in STANDALONE: ${undeclared.join(', ')}`)

  for (const c of STANDALONE) {
    if (!THEMES.some((t) => t.id === c.theme)) throw new Error(`${c.folder}: unknown theme ${c.theme}`)
    const dir = join(standaloneRoot, c.folder)
    const files = (await readdir(dir)).filter((f) => f.endsWith('.md'))
    const declared = [...c.files, ...(c.archived ?? [])].map(([f]) => f)
    const declaredFiles = declared.filter((f) => !isRepoPath(f))
    const missing = [
      ...declaredFiles.filter((f) => !files.includes(f)),
      ...declared.filter((f) => isRepoPath(f) && !existsSync(join(repoRoot, f))),
    ]
    const extra = files.filter((f) => !declaredFiles.includes(f))
    if (missing.length || extra.length) {
      throw new Error(`${c.folder}: declared files do not match disk (missing: ${missing.join(', ') || '—'}; undeclared: ${extra.join(', ') || '—'})`)
    }
    cases.push({
      theme: c.theme,
      dir,
      slug: c.folder.replace(/^\d+_/, '').replace(/_/g, '-').toLowerCase(),
      tag: c.tag ?? `#${c.number}`,
      order: c.number,
      title: c.title,
      tabs: c.files.map(([file, id]) => ({
        id,
        label: labelOf(id),
        file: basename(file),
        src: isRepoPath(file) ? join(repoRoot, file) : join(dir, file),
      })),
      practice: c.practice,
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

  // Page URL and file -> tab for every published folder, so cross-links point at the
  // site instead of the repo.
  const pages = new Map()
  for (const c of cases) {
    pages.set(c.dir, {
      url: caseUrl(c),
      tabsByFile: new Map(c.tabs.map((t) => [t.file, t.id])),
    })
  }
  const ctx = { root, repoRoot, pages }
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
  const tracks = []
  for (const theme of THEMES) {
    const scenarios = []
    const inTheme = cases.filter((c) => c.theme === theme.id).sort((a, b) => a.order - b.order)
    for (const c of inTheme) {
      const outBase = join(outDir, 'modules', CASE_STUDY_MODULE_ID, theme.id, c.slug)
      await mkdir(outBase, { recursive: true })
      for (const tab of c.tabs) {
        const file = tab.src ?? join(c.dir, tab.file)
        if (!existsSync(file)) throw new Error(`Missing ${tab.label} document: ${file}`)
        const markdown = stripRepoReferences(await readFile(file, 'utf8'))
        await writeFile(join(outBase, `${tab.id}.md`), unlinkRepoLinks(rewriteLinks(markdown, file, ctx)))
      }
      scenarios.push({
        slug: c.slug,
        order: c.order,
        title: TITLE_OVERRIDES[`${theme.id}/${c.slug}`] ?? c.title,
        tag: c.tag,
        tabs: c.tabs.map(({ id, label }) => ({ id, label })),
        ...(c.practice && { practice: c.practice }),
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
