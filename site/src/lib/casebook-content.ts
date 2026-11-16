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
