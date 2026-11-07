import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { EXPLORERS } from '../src/lib/explorers/registry.ts'
import { isDeepStrictEqual } from 'node:util'

async function optional(path) {
  try { return await readFile(path, 'utf8') } catch (error) { if (error.code === 'ENOENT') return null; throw error }
}

/** Read before content/ is refreshed, preserving committed snapshots in site-only builds. */
export async function explorerSources(repoRoot, outDir, siteDir) {
  return Promise.all(EXPLORERS.map(async (ref) => {
    const json = await optional(join(repoRoot, ref.source)) ?? await optional(join(outDir, 'explorers', `${ref.id}.json`))
    const html = await optional(join(repoRoot, ref.html)) ?? await optional(join(siteDir, 'public', 'explorers', `${ref.id}.html`))
    if (!json || !html) throw new Error(`Explorer ${ref.id}: root source and deployment snapshot are missing`)
    const data = JSON.parse(json)
    const embedded = html.match(/<script type="application\/json" id="explorer-data">([\s\S]*?)<\/script>/)
    if (!embedded || !isDeepStrictEqual(JSON.parse(embedded[1]), data)) {
      throw new Error(`Explorer ${ref.id}: standalone HTML is stale; rebuild it from the canonical JSON`)
    }
    const system = data.systems?.find((s) => s.id === ref.id)
    if (!system?.headline || !system.discoverySection || !system.requestLabel || !system.discovery?.length || !system.sourceMap?.length || !system.scenarios?.length) {
      throw new Error(`Explorer ${ref.id}: discovery, source mapping and scenarios are required`)
    }
    const nodes = new Set(system.diagram.nodes.map((n) => n.id))
    for (const scenario of system.scenarios) {
      const active = new Set(scenario.stages.flatMap((s) => s.nodeIds))
      const skipped = new Set(scenario.skipNodes ?? [])
      if ([...nodes].some((id) => !active.has(id) && !skipped.has(id)) || [...active].some((id) => !nodes.has(id) || skipped.has(id))) {
        throw new Error(`Explorer ${ref.id}/${scenario.id}: invalid active/skipped nodes`)
      }
      if ((scenario.edges ?? system.diagram.edges).some((e) => !nodes.has(e.from) || !nodes.has(e.to) || skipped.has(e.from) || skipped.has(e.to))) {
        throw new Error(`Explorer ${ref.id}/${scenario.id}: edge executes a skipped or unknown component`)
      }
    }
    return { ref, json, html }
  }))
}

export async function writeExplorers(sources, outDir, siteDir) {
  await mkdir(join(outDir, 'explorers'), { recursive: true })
  await mkdir(join(siteDir, 'public', 'explorers'), { recursive: true })
  for (const { ref, json, html } of sources) {
    await writeFile(join(outDir, 'explorers', `${ref.id}.json`), json)
    await writeFile(join(siteDir, 'public', 'explorers', `${ref.id}.html`), html)
  }
}

/** A published explorer must match its download and cover a real, unchanged lesson route. */
export async function checkExplorerSnapshots(repoRoot, siteDir) {
  const outDir = join(siteDir, 'content')
  const sources = await explorerSources(repoRoot, outDir, siteDir)
  const { lessons } = JSON.parse(await readFile(join(outDir, 'learn', 'manifest.json'), 'utf8'))
  const covered = new Set()
  let scenarios = 0, stages = 0
  for (const { ref, json, html } of sources) {
    const snapshot = await readFile(join(outDir, 'explorers', `${ref.id}.json`), 'utf8')
    const download = await readFile(join(siteDir, 'public', 'explorers', `${ref.id}.html`), 'utf8')
    if (!isDeepStrictEqual(JSON.parse(snapshot), JSON.parse(json)) || download !== html) {
      throw new Error(`Explorer ${ref.id}: deployment snapshot is stale; run npm run sync`)
    }
    for (const slug of ref.lessons) {
      if (covered.has(slug) || !lessons.some((lesson) => lesson.slug === slug && lesson.module === 'classic-ai-designs')) {
        throw new Error(`Explorer ${ref.id}: duplicate or unknown T17.4 lesson ${slug}`)
      }
      covered.add(slug)
    }
    const system = JSON.parse(json).systems[0]
    scenarios += system.scenarios.length
    stages += system.scenarios.reduce((count, scenario) => count + scenario.stages.length, 0)
  }
  const missing = lessons.filter((lesson) => lesson.module === 'classic-ai-designs' && !covered.has(lesson.slug))
  if (missing.length) throw new Error(`T17.4 lessons missing explorers: ${missing.map((lesson) => lesson.slug).join(', ')}`)
  return `${sources.length} explorers, ${covered.size} lesson pages, ${scenarios} scenarios, ${stages} stages; snapshots and standalone downloads match`
}
