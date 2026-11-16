import 'server-only'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cache } from 'react'
import type { CasebookPayload } from '@/components/CasebookReader'

/** Read only sync-produced snapshots. Canonical Markdown lives outside site/content. */
export const getCasebookRewrite = cache(async (slug: string): Promise<CasebookPayload | null> => {
  if (!/^[a-z0-9-]+$/.test(slug)) return null
  try {
    return JSON.parse(await readFile(join(process.cwd(), 'content', 'casebooks', `${slug}.json`), 'utf8'))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
})

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
const plain = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) =>
      code[0] !== '#' ? (ENTITIES[code] ?? whole)
        : String.fromCodePoint(code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1))),
    )
    .replace(/\s+/g, ' ')
    .trim()

/**
 * The reader's searchable sections: each `<section class="reading-section" id>` with its
 * `<h3>` title, its panel's name and its plain body text, in reading order.
 */
export function casebookSections(html: string) {
  const sections: { panel: string; id: string; title: string; text: string }[] = []
  for (const panel of html.split('<section class="panel"').slice(1)) {
    const name = panel.match(/^[^>]*data-title="([^"]*)"/)?.[1] ?? ''
    for (const part of panel.split('<section class="reading-section"').slice(1)) {
      const head = part.match(/^[^>]*id="([^"]+)"[^>]*>\s*<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*)$/)
      if (head) sections.push({ panel: plain(name), id: head[1], title: plain(head[2]), text: plain(head[3]) })
    }
  }
  return sections
}
