#!/usr/bin/env node
/**
 * Copies the FDE prep markdown into `site/content/`.
 * The source folders under `FDE/` stay the only place anyone
 * edits; `content/` is generated, but it is committed rather than ignored, because a
 * deploy rooted at `site/` cannot see the sources (see `sourcesPresent` below).
 *
 * Also writes `content/manifest.json`: the sync step is the single place that knows
 * how worksheets pair with answer keys and what order scenarios appear in, so the
 * app never has to re-derive it from filenames.
 *
 * Exits non-zero if a track produces no scenarios. Shipping an empty site is the
 * failure worth being loud about, since the sources live outside the app directory
 * and a path change here would otherwise fail silently at build time.
 */

import { execFileSync } from 'node:child_process'
import { copyFile, cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { syncCaseStudies } from './case-studies.mjs'
import { siteText } from './site-text-edits.mjs'
import { renderDiagrams } from './render-diagrams.mjs'
import { explorerSources, writeExplorers } from './explorers.mjs'
import {
  COMPANY_PREP_DOCUMENTS,
  COMPANY_PREP_MODULE_ID,
  COMPANY_PREP_TRACK_ID,
  syncCompanyPrep,
} from './company-prep.mjs'
import { gitDates, learnSnapshotDir, snapshotLearn, syncLearn } from './learn.mjs'
import { STORY_BANK, TITLE_OVERRIDES, TRACKS, readingMinutes } from '../src/lib/editorial.ts'
import { scenarioHref } from '../src/lib/scenario.ts'

const SITE_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const REPO_ROOT = resolve(SITE_DIR, '..')
// Worksheet sources; also the presence check for building from the committed snapshot.
const SOURCE_ROOT = join(REPO_ROOT, '03_Practice_Worksheets_and_Keys')
const OUT_DIR = join(SITE_DIR, 'content')
const COMPANY_PREP_SNAPSHOT_DIR = join(SITE_DIR, '.company-prep-snapshot')
// Company-oriented prep (module 16) is unpublished while its packs are reworked for the
// Company Prep area (/company-prep). To publish it again, set this to true and the
// module's `status` in src/lib/registry.ts back to 'live'.
const COMPANY_PREP_PUBLISHED = false
const LEARN_SNAPSHOT_DIR = learnSnapshotDir(SITE_DIR)

const BEHAVIOURAL_ROOT = join(REPO_ROOT, '04_Behavioral_and_Leadership')

/**
 * Every live module and the tracks inside it. Track ids must be unique across all
 * modules, not just within one: saved progress is keyed `trackId/slug`, so two
 * modules sharing a track id would share a reader's answers too.
 */
const MODULES = [
  {
    id: '01-customer-discovery-and-decomposition',
    tracks: [
      {
        id: 'core',
        worksheetDir: join(SOURCE_ROOT, 'Customer_Discovery_Worksheets'),
        answerKeyDir: join(SOURCE_ROOT, 'Customer_Discovery_Worksheets', 'answer_keys'),
      },
      {
        id: 'system-design',
        worksheetDir: join(SOURCE_ROOT, 'System_Design_Worksheets'),
        answerKeyDir: join(SOURCE_ROOT, 'System_Design_Worksheets', 'answer_keys'),
      },
    ],
  },
  {
    id: '14-behavioural-and-leadership-round',
    tracks: [
      {
        id: 'fde-competencies',
        worksheetDir: join(BEHAVIOURAL_ROOT, 'fde_competencies'),
        answerKeyDir: join(BEHAVIOURAL_ROOT, 'fde_competencies', 'answer_keys'),
      },
    ],
  },
]

/** `01_internal_knowledge_assistant.md` -> `internal-knowledge-assistant` */
function toSlug(filename) {
  return filename
    .replace(/\.md$/, '')
    .replace(/^\d+[_-]/, '')
    .replace(/_/g, '-')
    .toLowerCase()
}

/** Sort key from the numeric filename prefix, so disk order drives scenario order. */
function sourceNumber(filename) {
  const match = filename.match(/^(\d+)/)
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER
}

/**
 * Title comes from the document's own `# ` heading rather than the filename, so it
 * keeps the author's capitalisation and wording. The trailing document-type suffix
 * is dropped because the site already shows which view you are looking at.
 */
function extractTitle(markdown, fallback) {
  const line = markdown.split('\n').find((l) => l.startsWith('# '))
  if (!line) return fallback
  return line
    .replace(/^#\s+/, '')
    .replace(
      /\s*[-–—]\s*(Case Study Worksheet|Practice Worksheet|Answer Key)\s*$/i,
      '',
    )
    .trim()
}

async function readMarkdownFiles(dir) {
  let entries
  try {
    entries = await readdir(dir)
  } catch (error) {
    throw new Error(`Cannot read source directory:\n  ${dir}\n  ${error.message}`)
  }
  return entries
    .filter((name) => name.endsWith('.md') && name.toLowerCase() !== 'readme.md')
    .sort((a, b) => sourceNumber(a) - sourceNumber(b) || a.localeCompare(b))
}

async function syncTrack(moduleId, track, sourceUrls, updatedOf) {
  const worksheetFiles = await readMarkdownFiles(track.worksheetDir)
  const answerKeyFiles = new Set(await readMarkdownFiles(track.answerKeyDir))

  const scenarios = []
  const warnings = []

  for (const [index, file] of worksheetFiles.entries()) {
    const slug = toSlug(file)
    const keyFile = file.replace(/\.md$/, '_answer_key.md')

    if (!answerKeyFiles.has(keyFile)) {
      warnings.push(`no answer key for ${track.id}/${file} (looked for ${keyFile})`)
      continue
    }

    const repoPath = (path) => relative(REPO_ROOT, path).split(sep).join('/')
    const worksheet = siteText(repoPath(join(track.worksheetDir, file)), await readFile(join(track.worksheetDir, file), 'utf8'))
    const answerKey = siteText(repoPath(join(track.answerKeyDir, keyFile)), await readFile(join(track.answerKeyDir, keyFile), 'utf8'))

    const outBase = join(OUT_DIR, 'modules', moduleId, track.id)
    await mkdir(join(outBase, 'worksheets'), { recursive: true })
    await mkdir(join(outBase, 'answer-keys'), { recursive: true })
    await writeFile(join(outBase, 'worksheets', `${slug}.md`), worksheet)
    await writeFile(join(outBase, 'answer-keys', `${slug}.md`), answerKey)
    const href = scenarioHref({ moduleId, trackId: track.id, slug })
    sourceUrls.set(join(track.worksheetDir, file), href)
    sourceUrls.set(join(track.answerKeyDir, keyFile), href)

    scenarios.push({
      slug,
      // Sequential display position. The System Design track's source files carry the
      // book's chapter numbers, which have gaps (1,2,3,4,7,9,...); renumbering here
      // keeps the site's list free of holes that would read as missing content.
      order: index + 1,
      title: TITLE_OVERRIDES[`${track.id}/${slug}`] ?? extractTitle(worksheet, slug),
      minutes: readingMinutes(worksheet),
      updated: updatedOf(join(track.worksheetDir, file), join(track.answerKeyDir, keyFile)),
    })
  }

  if (scenarios.length === 0) {
    throw new Error(
      `Track "${track.id}" produced no scenarios.\n` +
        `  worksheets: ${track.worksheetDir}\n` +
        `  answer keys: ${track.answerKeyDir}\n` +
        `  Found ${worksheetFiles.length} worksheet file(s) and ` +
        `${answerKeyFiles.size} answer key file(s).`,
    )
  }

  const names = TRACKS[track.id]
  if (!names) throw new Error(`Track "${track.id}" has no entry in TRACKS (src/lib/editorial.ts)`)
  return {
    manifest: { id: track.id, ...names, scenarios },
    warnings,
  }
}

/**
 * The sources live outside `site/`, so a deploy whose root directory is `site/`
 * never sees them. `content/` is therefore committed, and when the sources are
 * absent we build from that committed copy instead of failing.
 *
 * This only applies when the sources are missing wholesale. If they are present
 * but produce nothing, that is a broken path and still fails the build.
 */
async function sourcesPresent() {
  try {
    await readdir(SOURCE_ROOT)
    return true
  } catch {
    return false
  }
}

/**
 * A shallow clone (Vercel's build checkout, CI's e2e job) has too little history for
 * the dates the sync writes (`gitDates` in learn.mjs): every page would get the date
 * of the clone's oldest commit. Those builds use the committed snapshot instead, which
 * CI's full-history sync has already checked.
 */
function shallowClone() {
  try {
    return execFileSync('git', ['rev-parse', '--is-shallow-repository'], { cwd: REPO_ROOT, encoding: 'utf8' }).trim() === 'true'
  } catch {
    return false
  }
}

async function contentPresent() {
  try {
    const manifest = JSON.parse(
      await readFile(join(OUT_DIR, 'manifest.json'), 'utf8'),
    )
    return manifest.modules?.[0]?.tracks?.length > 0
  } catch {
    return false
  }
}

async function main() {
  const shallow = shallowClone()
  if (shallow || !(await sourcesPresent())) {
    if (await contentPresent()) {
      console.log(
        (shallow ? 'content sync: shallow git clone, so page dates would be wrong;' : `content sync: sources not present at ${SOURCE_ROOT};`) +
          '\n  building from the committed content/ snapshot instead.',
      )
      return
    }
    throw new Error(
      `Sources not found at:\n  ${SOURCE_ROOT}\n` +
        'and content/ holds no usable snapshot, so there is nothing to build from.',
    )
  }

  // Company packs can deliberately remain outside Git, while their generated site
  // content is committed. Keep that snapshot through a full content refresh so a
  // Vercel build does not need the private source folder.
  await rm(COMPANY_PREP_SNAPSHOT_DIR, { recursive: true, force: true })
  if (COMPANY_PREP_PUBLISHED) {
    try {
      await cp(
        join(OUT_DIR, 'modules', COMPANY_PREP_MODULE_ID),
        COMPANY_PREP_SNAPSHOT_DIR,
        { recursive: true },
      )
    } catch {
      // A new pack has no committed snapshot yet; syncCompanyPrep will report a
      // useful error if its private source is also unavailable.
    }
  }

  // Learn lessons: the same snapshot pattern, for clones without the lesson sources.
  // The previous manifest in the snapshot also drives the lesson slug guard.
  await snapshotLearn({ outDir: OUT_DIR, snapshotDir: LEARN_SNAPSHOT_DIR })
  const explorers = await explorerSources(REPO_ROOT, OUT_DIR, SITE_DIR)

  await rm(OUT_DIR, { recursive: true, force: true })
  await mkdir(OUT_DIR, { recursive: true })
  await writeExplorers(explorers, OUT_DIR, SITE_DIR)

  const modules = []
  const warnings = []
  // Absolute source path -> URL of the page that publishes it, for the Learn sync.
  const sourceUrls = new Map()
  const updatedOf = gitDates(REPO_ROOT)

  for (const mod of MODULES) {
    const tracks = []
    for (const track of mod.tracks) {
      const result = await syncTrack(mod.id, track, sourceUrls, updatedOf)
      tracks.push(result.manifest)
      warnings.push(...result.warnings)
    }
    modules.push({ id: mod.id, tracks })
  }

  // Story Bank: one markdown page beside the behavioural tracks, rendered by the
  // reading pipeline. Copied as-is; content.ts derives the question map from it.
  await mkdir(join(OUT_DIR, 'behavioural'), { recursive: true })
  await copyFile(
    join(BEHAVIOURAL_ROOT, STORY_BANK.source),
    join(OUT_DIR, 'behavioural', `${STORY_BANK.slug}.md`),
  )
  sourceUrls.set(join(BEHAVIOURAL_ROOT, STORY_BANK.source), STORY_BANK.href)

  // Reading module: the G01–G20 interview guides, one page per group with tabs.
  modules.push(await syncCaseStudies({ repoRoot: REPO_ROOT, outDir: OUT_DIR, sourceUrls }))

  // Company-oriented material: packs tailored to a specific interview loop.
  if (COMPANY_PREP_PUBLISHED) {
    modules.push(
      await syncCompanyPrep({
        repoRoot: REPO_ROOT,
        outDir: OUT_DIR,
        snapshotDir: COMPANY_PREP_SNAPSHOT_DIR,
      }),
    )
    await rm(COMPANY_PREP_SNAPSHOT_DIR, { recursive: true, force: true })
    const companyDir = join(REPO_ROOT, '08_Company_Specific_Prep', 'Blitzy')
    for (const document of COMPANY_PREP_DOCUMENTS) {
      sourceUrls.set(
        join(companyDir, document.file),
        `/modules/${COMPANY_PREP_MODULE_ID}/${COMPANY_PREP_TRACK_ID}/${document.slug}`,
      )
    }
  }

  // Learn lessons last: their links point at every page published above.
  try {
    await syncLearn({
      repoRoot: REPO_ROOT,
      outDir: OUT_DIR,
      snapshotDir: LEARN_SNAPSHOT_DIR,
      liveUrls: sourceUrls,
      // A live lesson's listing shows its page's reading time (ENH-22).
      liveMinutes: new Map(
        modules.flatMap((m) =>
          m.tracks.flatMap((t) => t.scenarios.map((s) => [scenarioHref({ moduleId: m.id, trackId: t.id, slug: s.slug }), s.minutes])),
        ),
      ),
    })
  } finally {
    await rm(LEARN_SNAPSHOT_DIR, { recursive: true, force: true })
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    modules,
    storyBankUpdated: updatedOf(join(BEHAVIOURAL_ROOT, STORY_BANK.source)),
  }
  await writeFile(join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2))

  // Diagrams last, once every page's markdown is written: each ```mermaid fence becomes
  // public/diagrams/<key>-light|dark.svg, drawn only when new (ENH-24b).
  const diagrams = await renderDiagrams({ siteDir: SITE_DIR })
  console.log(`diagrams: ${diagrams.ready} of ${diagrams.total} ready as SVG${diagrams.drawn ? `, ${diagrams.drawn} drawn now` : ''}`)

  const allTracks = modules.flatMap((m) => m.tracks)
  const total = allTracks.reduce((sum, t) => sum + t.scenarios.length, 0)
  for (const warning of warnings) console.warn(`  warning: ${warning}`)
  console.log(
    `content sync: ${total} scenarios across ${allTracks.length} tracks ` +
      `in ${modules.length} modules ` +
      `(${allTracks.map((t) => `${t.id}=${t.scenarios.length}`).join(', ')})`,
  )
}

main().catch((error) => {
  console.error(`\ncontent sync failed:\n${error.message}\n`)
  process.exit(1)
})
