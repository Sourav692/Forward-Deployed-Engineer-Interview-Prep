import 'server-only'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { EXPLORERS } from './registry'
import type { ExplorerData } from './types'
import { getLessonPage, getPublishedLesson } from '@/lib/learn'
import { toPlainText } from '@/lib/reading'
import { marked } from 'marked'

export async function lessonExplorer(lesson: string): Promise<ExplorerData | null> {
  const ref = EXPLORERS.find((e) => e.lessons.some((slug) => slug === lesson))
  if (!ref) return null
  const data: ExplorerData = JSON.parse(await readFile(join(process.cwd(), 'content', 'explorers', `${ref.id}.json`), 'utf8'))
  // Split lessons share one case explorer. Source links still open the exact written section.
  data.readingLinks = {}
  for (const slug of ref.lessons) {
    const published = getPublishedLesson(slug)
    const page = published && getLessonPage(published.track, published.module, slug)
    if (!page) continue
    for (const section of page.doc.sections) {
      if (section.title) data.readingLinks[toPlainText(section.title)] = `${published.href}#${section.id}`
    }
  }
  for (const item of data.systems[0].sourceMap) {
    const title = toPlainText(marked.parseInline(item.section, { async: false }) as string)
    if (data.readingLinks[title]) data.readingLinks[item.section] = data.readingLinks[title]
  }
  return data
}
