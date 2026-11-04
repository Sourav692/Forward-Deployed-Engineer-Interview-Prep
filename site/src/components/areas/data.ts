import 'server-only'

import { cache } from 'react'
import { getAllScenarios, getTracks } from '@/lib/content'
import { INTERVIEW_ROUNDS, MODULES as CURRICULUM_MODULES, TRACKS as CURRICULUM_TRACKS } from '@/lib/curriculum'
import type { CurriculumModule } from '@/lib/curriculum-types'
import { FAMILY_META, LEVELS, RELATED_CASE, RELATED_PRACTICE, REVIEWS, TWIN_LABEL, type Level } from '@/lib/editorial'
import { getLearnManifest, learnTracks, trackHours } from '@/lib/learn'
import { isLearnTrack } from '@/lib/curriculum-href'
import { liveRounds } from '@/lib/interview-rounds'
import { MODULE_AREAS, qualifiedTitle, scenarioHref, type ScenarioRef } from '@/lib/scenario'
import type { LinkItem } from './Area'

/**
 * Data for the area index pages. Everything is read from the synced manifest and
 * `curriculum.ts` at build time, so the indexes list exactly the pages that exist
 * and never copy their content (plan §4: link, do not duplicate).
 */

/** Live module ids (registry) that the area indexes link into. */
export const LIVE = {
  worksheets: '01-customer-discovery-and-decomposition',
  behavioural: '14-behavioural-and-leadership-round',
  casebook: '15-fde-case-studies',
  companyPrep: '16-company-oriented-prep',
} as const

export const moduleHref = (moduleId: string) => `/modules/${moduleId}`
export const trackAnchor = (moduleId: string, trackId: string) => `${MODULE_AREAS[moduleId] ?? moduleHref(moduleId)}#${trackId}`

/** A list row with what the /design and /practice filters read (ENH-23). */
export type GroupItem = LinkItem & { level: Level; minutes?: number }

export type TrackGroup = {
  id: string
  title: string
  blurb: string
  href: string
  items: GroupItem[]
}

/** Every page of a live module, grouped by its tracks in manifest order. */
export async function moduleGroups(moduleId: string): Promise<{ groups: TrackGroup[]; scenarios: ScenarioRef[] }> {
  const [tracks, all] = await Promise.all([getTracks(moduleId), getAllScenarios()])
  const scenarios = all.filter((s) => s.moduleId === moduleId)
  // A design or worksheet with a twin names it under the same label as its page (ENH-21).
  const twinOf = (s: ScenarioRef): LinkItem['twin'] => {
    const other = RELATED_CASE[`${s.trackId}/${s.slug}`] ?? RELATED_PRACTICE[`${s.trackId}/${s.slug}`]
    const twin = other && all.find((t) => `${t.trackId}/${t.slug}` === other)
    return twin ? { href: scenarioHref(twin), label: twin.reading ? TWIN_LABEL.design : TWIN_LABEL.worksheet } : undefined
  }
  const groups = tracks.map((track) => ({
    id: track.id,
    title: track.title,
    blurb: track.blurb,
    href: trackAnchor(moduleId, track.id),
    items: scenarios
      .filter((s) => s.trackId === track.id)
      .map((s) => ({
        href: scenarioHref(s),
        title: qualifiedTitle(s),
        twin: twinOf(s),
        level: LEVELS[`${s.trackId}/${s.slug}`] ?? 'core',
        // A worksheet's card shows the time to work it, not to read it.
        minutes: FAMILY_META[s.trackId]?.practiceMinutes ?? s.minutes,
      })),
  }))
  return { groups, scenarios }
}

/** Curriculum modules of one track, in teaching order. */
export function curriculumModules(trackSlug: string): CurriculumModule[] {
  const track = CURRICULUM_TRACKS.find((t) => t.slug === trackSlug)
  if (!track) throw new Error(`Unknown curriculum track "${trackSlug}"`)
  const order = track.sections.flatMap((s) => s.modules)
  return order.map((slug) => {
    const mod = CURRICULUM_MODULES.find((m) => m.slug === slug)
    if (!mod) throw new Error(`Track "${trackSlug}" lists unknown module "${slug}"`)
    return mod
  })
}

export const curriculumTrack = (slug: string) => CURRICULUM_TRACKS.find((t) => t.slug === slug)

export type SiteCounts = {
  /** Tracks listed under /learn, and how many study hours they add up to. */
  learnTracks: number
  learnHours: number
  /** Modules listed in Learn tracks, how many are ready, and the lesson pages they hold (links to other areas not counted). */
  learnModules: number
  learnReady: number
  learnLessons: number
  worksheets: number
  /** Worksheets by set: customer discovery and system design. */
  discoveryWorksheets: number
  systemDesignWorksheets: number
  behavioural: number
  designs: number
  /** Casebook designs outside the scenario packs. */
  standaloneDesigns: number
  judgementCases: number
  /** Designs that read at three depths (they have a Technical Deep Dive tab). */
  layeredDesigns: number
  reviews: number
  /** Interview rounds with a page, all rounds, and the mock interviews. */
  liveRounds: number
  rounds: number
  mocks: number
}

/**
 * Every count on the home page, /learn and the area hubs, from one place (ENH-22, FV-04),
 * read from the curriculum and the synced manifest so the numbers agree everywhere.
 */
export const siteCounts = cache(async (): Promise<SiteCounts> => {
  const scenarios = await getAllScenarios()
  const count = (moduleId: string) => scenarios.filter((s) => s.moduleId === moduleId).length
  const listed = new Set(CURRICULUM_TRACKS.flatMap((t) => t.sections.flatMap((s) => s.modules)))
  const learnModules = CURRICULUM_MODULES.filter((m) => listed.has(m.slug) && isLearnTrack(m.track))
  const learn = learnTracks()
  const inTrack = (moduleId: string, trackId: string) => scenarios.filter((s) => s.moduleId === moduleId && s.trackId === trackId).length
  return {
    learnTracks: learn.length,
    learnHours: learn.reduce((sum, t) => sum + trackHours(t), 0),
    learnModules: learnModules.length,
    learnReady: learnModules.filter((m) => m.status === 'ready').length,
    learnLessons: getLearnManifest().filter((l) => l.kind === 'sync' && isLearnTrack(l.track)).length,
    worksheets: count(LIVE.worksheets),
    discoveryWorksheets: inTrack(LIVE.worksheets, 'core'),
    systemDesignWorksheets: inTrack(LIVE.worksheets, 'system-design'),
    behavioural: count(LIVE.behavioural),
    designs: count(LIVE.casebook),
    standaloneDesigns: inTrack(LIVE.casebook, 'standalone-designs'),
    judgementCases: inTrack(LIVE.casebook, 'judgement-and-decomposition'),
    layeredDesigns: scenarios.filter((s) => s.moduleId === LIVE.casebook && s.tabs?.some((t) => t.id === 'deep-dive')).length,
    reviews: REVIEWS.length,
    liveRounds: liveRounds().length,
    rounds: INTERVIEW_ROUNDS.length,
    // The module opens with the scoring guide, which is not itself a mock.
    mocks: CURRICULUM_MODULES.find((m) => m.slug === 'mock-interviews')?.lessons.filter((l) => l !== 'running-and-scoring-a-mock-interview').length ?? 0,
  }
})
