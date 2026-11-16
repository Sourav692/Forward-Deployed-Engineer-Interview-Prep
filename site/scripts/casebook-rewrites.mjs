import { createHash } from 'node:crypto'
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const hash = value => createHash('sha256').update(value).digest('hex')

/** Canonical authored Markdown plus a checked reader snapshot; never edit content/ directly. */
export async function syncCasebookRewrites({ repoRoot, siteDir }) {
  const source = join(repoRoot, '02_System_Design_Case_Studies', 'Casebook_Rewrites')
  let entries
  try { entries = await readdir(source, { withFileTypes: true }) }
  catch (error) { if (error.code === 'ENOENT') return; throw error }
  await mkdir(join(siteDir, 'content', 'casebooks'), { recursive: true })
  for (const entry of entries.filter(item => item.isDirectory())) {
    const directory = join(source, entry.name)
    const [markdown, html, raw, proof] = await Promise.all([
      readFile(join(directory, 'casebook.md')),
      readFile(join(directory, 'reader.html')),
      readFile(join(directory, 'case.json'), 'utf8'),
      readFile(join(directory, 'snapshot.json'), 'utf8'),
    ])
    const config = JSON.parse(raw), snapshot = JSON.parse(proof)
    if (config.slug !== entry.name || hash(markdown) !== snapshot.markdown_sha256 || hash(html) !== snapshot.html_sha256 || hash(raw) !== snapshot.config_sha256) {
      throw new Error(`Stale casebook snapshot: rebuild ${entry.name} from its canonical Markdown before syncing`)
    }
    if (!snapshot.validated || snapshot.mode !== 'teach') throw new Error(`Unvalidated casebook rewrite: ${entry.name}`)
    await writeFile(join(siteDir, 'content', 'casebooks', `${entry.name}.json`), JSON.stringify({
      html: html.toString(), html_sha256: snapshot.html_sha256, subtitle: config.subtitle, updated: config.updated_at ?? new Date(`${config.updated.split(', ').at(-1)} UTC`).toISOString().slice(0, 10),
      config: { slug: config.slug, title: config.title, source_url: config.source_url, aliases: config.aliases },
    }))
    await cp(join(directory, 'source-assets'), join(siteDir, 'public', 'casebook-assets', entry.name), { recursive: true })
  }
  console.log(`casebook rewrites: ${entries.filter(item => item.isDirectory()).length} checked snapshots`)
}
