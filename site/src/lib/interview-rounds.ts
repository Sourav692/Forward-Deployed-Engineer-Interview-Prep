import { INTERVIEW_ROUNDS } from './curriculum'
import type { InterviewRound } from './curriculum-types'
import { formatMinutes, getModuleBySlug, getPublishedLesson, learnHref, moduleTime, readingList } from './learn'

/** Rounds with content. A planned round has no page and stays out of the sitemap. */
export const liveRounds = () => INTERVIEW_ROUNDS.filter((r) => !r.planned)

export const practiseCount = (round: InterviewRound) => round.practise.reduce((n, g) => n + g.lessons.length, 0)

/** A contents row on /interview and the round pages: a title, then facts at the edge. */
export type Row = { href: string; title: string; facts: string[] }

/** A published lesson as a row. `check:curriculum` guarantees the slug; a miss means a stale snapshot. */
export function lessonRow(slug: string): Row {
  const lesson = getPublishedLesson(slug)
  const mod = lesson && getModuleBySlug(lesson.module)
  if (!lesson || !mod) throw new Error(`Interview round: lesson "${slug}" is not in the learn manifest. Run npm run sync.`)
  return { href: lesson.href, title: lesson.title, facts: [mod.title, ...(lesson.estMinutes ? [formatMinutes(lesson.estMinutes)] : [])] }
}

/** A Learn module as a row: its reading time and lesson count. */
export function moduleRow(slug: string): Row {
  const mod = getModuleBySlug(slug)
  if (!mod) throw new Error(`Interview round: no module "${slug}".`)
  const lessons = readingList(mod).main.length
  return {
    href: learnHref.module(mod),
    title: mod.title,
    facts: [formatMinutes(moduleTime(mod).total), ...(lessons ? [`${lessons} ${lessons === 1 ? 'lesson' : 'lessons'}`] : [])],
  }
}
