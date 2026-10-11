import 'server-only'

import { getAllScenarios, getTracks } from '@/lib/content'
import { MODULES as CURRICULUM_MODULES, TRACKS as CURRICULUM_TRACKS } from '@/lib/curriculum'
import type { CurriculumModule, ModuleStatus } from '@/lib/curriculum-types'
import { qualifiedTitle, scenarioHref, type ScenarioRef } from '@/lib/scenario'
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
export const trackAnchor = (moduleId: string, trackId: string) =>
  moduleId === LIVE.casebook ? `/design#${trackId}` : `/modules/${moduleId}#${trackId}`

export type TrackGroup = {
  id: string
  title: string
  blurb: string
  href: string
  items: LinkItem[]
}

/** Every page of a live module, grouped by its tracks in manifest order. */
export async function moduleGroups(moduleId: string): Promise<{ groups: TrackGroup[]; scenarios: ScenarioRef[] }> {
  const [tracks, all] = await Promise.all([getTracks(moduleId), getAllScenarios()])
  const scenarios = all.filter((s) => s.moduleId === moduleId)
  const groups = tracks.map((track) => ({
    id: track.id,
    title: track.title,
    blurb: track.blurb,
    href: trackAnchor(moduleId, track.id),
    items: scenarios
      .filter((s) => s.trackId === track.id)
      .map((s) => ({ href: scenarioHref(s), title: qualifiedTitle(s), tag: s.tag })),
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

/** Honest coverage numbers for the landing page, computed from the curriculum. */
export function coverage(): { tracks: number; modules: number; byStatus: Record<ModuleStatus, number> } {
  const byStatus: Record<ModuleStatus, number> = { ready: 0, partly: 0, 'coming-soon': 0, 'on-hold': 0 }
  for (const m of CURRICULUM_MODULES) byStatus[m.status] += 1
  return { tracks: CURRICULUM_TRACKS.length, modules: CURRICULUM_MODULES.length, byStatus }
}
