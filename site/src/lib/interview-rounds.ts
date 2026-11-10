import { INTERVIEW_ROUNDS } from './curriculum'
import type { InterviewRound } from './curriculum-types'
import { FAMILY_META } from './editorial'
import { scenarioHref, type ScenarioRef } from './scenario'
import { formatMinutes, getModuleBySlug, getPublishedLesson, learnHref, moduleTime, readingList } from './learn'
import { SHOW_STUDY_TIME } from './study-time'

/** Rounds with content. A planned round has no page and stays out of the sitemap. */
export const liveRounds = () => INTERVIEW_ROUNDS.filter((r) => !r.planned)

export const practiseCount = (round: InterviewRound) => round.practise.reduce((n, g) => n + g.lessons.length, 0)

/** A contents row on /interview and the round pages: a title, then facts at the edge. */
export type Row = { href: string; title: string; facts: string[] }

/** A worksheet's set name and practice time, keyed by its page URL, as /practice shows them. */
export type WorksheetFacts = Map<string, { set: string; minutes?: number }>

export const worksheetFacts = (scenarios: ScenarioRef[]): WorksheetFacts =>
  new Map(
    scenarios
      .filter((s) => !s.reading)
      .map((s) => [scenarioHref(s), { set: s.trackTitle, minutes: FAMILY_META[s.trackId]?.practiceMinutes ?? s.minutes }]),
  )

/**
 * A published lesson as a row. `check:curriculum` guarantees the slug; a miss means a stale
 * snapshot. A worksheet shows its set and the time to work it, not to read it.
 */
export function lessonRow(slug: string, worksheets?: WorksheetFacts): Row {
  const lesson = getPublishedLesson(slug)
  const mod = lesson && getModuleBySlug(lesson.module)
  if (!lesson || !mod) throw new Error(`Interview round: lesson "${slug}" is not in the learn manifest. Run npm run sync.`)
  const sheet = worksheets?.get(lesson.href)
  const minutes = sheet ? sheet.minutes : lesson.estMinutes
  return { href: lesson.href, title: lesson.title, facts: [sheet?.set ?? mod.title, ...(SHOW_STUDY_TIME && minutes ? [formatMinutes(minutes)] : [])] }
}

/** A Learn module as a row: its reading time and lesson count. */
export function moduleRow(slug: string): Row {
  const mod = getModuleBySlug(slug)
  if (!mod) throw new Error(`Interview round: no module "${slug}".`)
  const lessons = readingList(mod).main.length
  return {
    href: learnHref.module(mod),
    title: mod.title,
    facts: [...(SHOW_STUDY_TIME ? [formatMinutes(moduleTime(mod).total)] : []), ...(lessons ? [`${lessons} ${lessons === 1 ? 'lesson' : 'lessons'}`] : [])],
  }
}
