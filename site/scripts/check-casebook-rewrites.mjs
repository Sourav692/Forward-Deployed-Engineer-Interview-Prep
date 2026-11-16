import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { CUT } from './site-text-edits.mjs'

const digest = value => createHash('sha256').update(value).digest('hex')
const panels = ['case-brief', 'walkthrough', 'deep-dives', 'practice', 'quick-review']
const readJson = async path => JSON.parse(await readFile(path, 'utf8'))
const requireThat = (condition, message) => { if (!condition) throw new Error(message) }

/** Check the new reader contract as well as the retained legacy importer contract. */
export async function checkCasebookRewrites(repoRoot, siteDir, { expected = 33 } = {}) {
  const manifest = await readJson(join(siteDir, 'content', 'manifest.json'))
  const routes = manifest.modules.find(module => module.id === '15-fde-case-studies').tracks.flatMap(track => track.scenarios)
  const files = (await readdir(join(siteDir, 'content', 'casebooks'))).filter(file => file.endsWith('.json'))
  requireThat(files.length === expected && routes.length >= expected, `Expected ${expected} casebook rewrites and routes; got ${files.length}/${routes.length}`)
  let aliases = 0, assets = 0
  for (const route of routes.filter(route => files.includes(`${route.slug}.json`))) {
    const slug = route.slug
    const payload = await readJson(join(siteDir, 'content', 'casebooks', `${slug}.json`))
    const html = payload.html
    requireThat(payload.config.slug === slug, `${slug}: wrong storage/route identity`)
    requireThat(digest(html) === payload.html_sha256, `${slug}: reader payload hash mismatch`)
    requireThat(/^\d{4}-\d{2}-\d{2}$/.test(payload.updated) && Number.isFinite(Date.parse(payload.updated)), `${slug}: invalid update date`)
    requireThat(!/<(?:script|iframe|object|embed)\b|\son[a-z]+\s*=|(?:href|src)\s*=\s*["']\s*javascript:/i.test(html), `${slug}: executable HTML in reading content`)
    requireThat(!/LIBRARY_MAP\.md|ROADMAP_7_DAY\.md|99_Reference_Library|09_Study_Plans|_private/i.test(html), `${slug}: private source reference`)
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1])
    requireThat(ids.length === new Set(ids).size, `${slug}: duplicate reader IDs`)
    for (const panel of panels) requireThat(ids.includes(panel), `${slug}: missing ${panel}`)
    requireThat((html.match(/class="panel\b/g) ?? []).length === 5, `${slug}: expected exactly five reading panels`)
    requireThat(!/<main\b/i.test(html), `${slug}: nested main landmark`)
    // The site names no vendor platform (CUT), and case codes like G01 stay internal.
    const text = html.replace(/<[^>]+>/g, ' ')
    requireThat(!CUT.test(text) && !/\bG\d{2}\b/.test(text), `${slug}: vendor name or internal case code in reader text: ${text.match(CUT)?.[0] ?? text.match(/\bG\d{2}\b/)?.[0]}`)
    for (const [from, to] of Object.entries(payload.config.aliases)) {
      requireThat(ids.includes(to), `${slug}#${from}: alias target ${to} missing`)
      aliases++
    }
    for (const tab of route.tabs) requireThat(payload.config.aliases[tab.id], `${slug}: missing legacy tab alias ${tab.id}`)
    const links = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)].map(match => match[1])
    for (const link of links) {
      if (link.startsWith('#')) requireThat(ids.includes(link.slice(1)) || payload.config.aliases[link.slice(1)], `${slug}: broken fragment ${link}`)
      if (!link.startsWith('/casebook-assets/')) continue
      requireThat(link.startsWith(`/casebook-assets/${slug}/`) && !link.includes('..'), `${slug}: asset escapes its case`)
      await readFile(join(siteDir, 'public', link.slice(1)))
    }
    // In a Vercel site-only build, the committed snapshots above remain the contract.
    const source = join(repoRoot, '02_System_Design_Case_Studies', 'Casebook_Rewrites', slug)
    let snapshot
    try { snapshot = await readJson(join(source, 'snapshot.json')) }
    catch (error) { if (error.code === 'ENOENT') continue; throw error }
    requireThat(snapshot.validated === true && snapshot.mode === 'teach', `${slug}: unvalidated source`)
    const [markdown, config, reader, inventory] = await Promise.all([
      readFile(join(source, 'casebook.md')), readFile(join(source, 'case.json')),
      readFile(join(source, 'reader.html')), readJson(join(source, 'source.json')),
    ])
    requireThat(digest(markdown) === snapshot.markdown_sha256 && digest(config) === snapshot.config_sha256 && digest(reader) === payload.html_sha256, `${slug}: stale canonical snapshot; rebuild and sync`)
    for (const asset of inventory.assets) {
      const name = asset.path.replace(/^source-assets\//, '')
      const original = await readFile(join(source, 'source-assets', name))
      const published = await readFile(join(siteDir, 'public', 'casebook-assets', slug, name))
      requireThat(digest(original) === asset.sha256 && digest(published) === asset.sha256, `${slug}: changed source figure ${name}`)
      assets++
    }
  }
  return `${files.length} complete teaching readers, ${aliases} legacy aliases and ${assets} original figure assets checked`
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const siteDir = resolve(import.meta.dirname, '..')
  console.log(await checkCasebookRewrites(resolve(siteDir, '..'), siteDir))
}
