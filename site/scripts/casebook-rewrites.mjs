import { createHash } from 'node:crypto'
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { TITLE_OVERRIDES, TRACKS, readingMinutes } from '../src/lib/editorial.ts'
import { CASEBOOK_MODULE, scenarioHref } from '../src/lib/scenario.ts'

const hash = value => createHash('sha256').update(value).digest('hex')

/**
 * Module 15 (the casebook at /design) from `02_System_Design_Case_Studies/Casebook_Rewrites/`.
 *
 * Each case's authored Markdown plus its checked reader snapshot become
 * `content/casebooks/<slug>.json`; never edit content/ directly. `casebook-pages.json` fixes
 * each case's track, order and legacy tab ids: saved progress is keyed `trackId/slug`, and the
 * reader counts read state against those tab ids, so they never change. A new case needs an
 * entry there. `sourceUrls` maps each case folder to its page for the Learn live lessons.
 */
export async function syncCasebookRewrites({ repoRoot, siteDir, sourceUrls }) {
  const source = join(repoRoot, '02_System_Design_Case_Studies', 'Casebook_Rewrites')
  const pages = JSON.parse(await readFile(new URL('./casebook-pages.json', import.meta.url), 'utf8'))
  const onDisk = (await readdir(source, { withFileTypes: true })).filter(item => item.isDirectory()).map(item => item.name).sort()
  const listed = pages.flatMap(track => track.scenarios.map(scenario => scenario.slug)).sort()
  if (onDisk.join() !== listed.join()) {
    throw new Error(`Casebook folders and site/scripts/casebook-pages.json differ: on disk ${onDisk.join(', ')}; listed ${listed.join(', ')}`)
  }
  await mkdir(join(siteDir, 'content', 'casebooks'), { recursive: true })
  const tracks = []
  for (const track of pages) {
    if (!TRACKS[track.id]) throw new Error(`Casebook track "${track.id}" has no entry in TRACKS (src/lib/editorial.ts)`)
    const scenarios = []
    for (const { slug, order, tabs } of track.scenarios) {
      const directory = join(source, slug)
      const [markdown, html, raw, proof] = await Promise.all([
        readFile(join(directory, 'casebook.md')),
        readFile(join(directory, 'reader.html')),
        readFile(join(directory, 'case.json'), 'utf8'),
        readFile(join(directory, 'snapshot.json'), 'utf8'),
      ])
      const config = JSON.parse(raw), snapshot = JSON.parse(proof)
      if (config.slug !== slug || hash(markdown) !== snapshot.markdown_sha256 || hash(html) !== snapshot.html_sha256 || hash(raw) !== snapshot.config_sha256) {
        throw new Error(`Stale casebook snapshot: rebuild ${slug} from its canonical Markdown before syncing`)
      }
      if (!snapshot.validated || snapshot.mode !== 'teach') throw new Error(`Unvalidated casebook rewrite: ${slug}`)
      const updated = config.updated_at ?? new Date(`${config.updated.split(', ').at(-1)} UTC`).toISOString().slice(0, 10)
      await writeFile(join(siteDir, 'content', 'casebooks', `${slug}.json`), JSON.stringify({
        html: html.toString(), html_sha256: snapshot.html_sha256, subtitle: config.subtitle, updated,
        config: { slug: config.slug, title: config.title, source_url: config.source_url, aliases: config.aliases },
      }))
      await cp(join(directory, 'source-assets'), join(siteDir, 'public', 'casebook-assets', slug), { recursive: true })
      sourceUrls?.set(directory, scenarioHref({ moduleId: CASEBOOK_MODULE, trackId: track.id, slug }))
      scenarios.push({ slug, order, title: TITLE_OVERRIDES[`${track.id}/${slug}`] ?? config.title, tabs, minutes: readingMinutes(markdown.toString()), updated })
    }
    tracks.push({ id: track.id, title: TRACKS[track.id].title, blurb: TRACKS[track.id].blurb, scenarios })
  }
  console.log(`casebook rewrites: ${listed.length} checked snapshots`)
  return { id: CASEBOOK_MODULE, kind: 'reading', tracks }
}
