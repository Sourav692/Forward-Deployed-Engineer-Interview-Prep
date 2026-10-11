import 'server-only'

import { getAllScenarios, pageRef } from './content'
import { CLASSIC_DESIGN_CASE, RELATED_CASE, RELATED_PRACTICE, TWIN_LABEL } from './editorial'
import { getLearnManifest } from './learn'
import { scenarioHref, type ScenarioRef } from './scenario'

/** A link to a page's twin, named by TWIN_LABEL (ENH-21). */
export type TwinLink = { label: string; href: string; title: string }

/**
 * A case's or worksheet's twins: its worksheet or design (RELATED_CASE), and for a case
 * that a Learn classic design summarises, that lesson (CLASSIC_DESIGN_CASE).
 */
export async function pageTwins(ref: ScenarioRef): Promise<TwinLink[]> {
  const key = `${ref.trackId}/${ref.slug}`
  const links: TwinLink[] = []
  const other = RELATED_CASE[key] ?? RELATED_PRACTICE[key]
  const twin = other ? (await getAllScenarios()).find((s) => `${s.trackId}/${s.slug}` === other) : undefined
  if (twin) links.push({ label: twin.reading ? TWIN_LABEL.design : TWIN_LABEL.worksheet, href: scenarioHref(twin), title: twin.title })
  const classic = Object.keys(CLASSIC_DESIGN_CASE).find((slug) => CLASSIC_DESIGN_CASE[slug] === key)
  const lesson = classic ? getLearnManifest().find((l) => l.slug === classic) : undefined
  if (lesson) links.push({ label: TWIN_LABEL.classic, href: lesson.href, title: lesson.title })
  return links
}

/** A Learn classic design's casebook case, worked in full. */
export async function lessonTwins(lessonSlug: string): Promise<TwinLink[]> {
  const key = CLASSIC_DESIGN_CASE[lessonSlug]
  const ref = key ? await pageRef(key) : null
  return ref ? [{ label: TWIN_LABEL.design, href: scenarioHref(ref), title: ref.title }] : []
}
