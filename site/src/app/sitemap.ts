import type { MetadataRoute } from 'next'
import { getAllScenarios, getStoryBank } from '@/lib/content'
import { CHANGELOG } from '@/lib/changelog'
import { STORY_BANK } from '@/lib/editorial'
import type { CurriculumModule } from '@/lib/curriculum-types'
import { roundHref } from '@/lib/curriculum-href'
import { liveRounds } from '@/lib/interview-rounds'
import { getLearnManifest, getTracks, learnHref, learnTracks, trackModules } from '@/lib/learn'
import { groupHref, liveGroups } from '@/lib/learn-stages'
import { PATHS } from '@/lib/paths'
import { MODULE_AREAS, scenarioHref } from '@/lib/scenario'
import { absoluteUrl } from '@/lib/seo'

/**
 * `/sitemap.xml` (plan §11, SEO-01; ENH-19): every public page at its canonical URL,
 * never a redirected one (`check:routes` fails on a sitemap URL that redirects).
 * Learner-only pages (`/progress`, `/settings`) are left out; `robots.ts` disallows them
 * too. So are `/company-prep` and planned modules, which have no content yet.
 *
 * Every entry has `lastModified`: a page's own source date from the sync (`updated`),
 * the newest date among its items for an index (module, track, path, round, area), and the
 * newest changelog date for a page with no source of its own.
 */

const newest = (dates: (string | null | undefined)[]): string | undefined =>
  dates.filter((d): d is string => !!d).sort().at(-1)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dated = new Map<string, string | undefined>()
  // A path can be added twice (the I1 module's page is /practice); keep the newer date.
  const add = (path: string, date?: string | null) => dated.set(path, newest([dated.get(path), date]))

  // Pages with a source: cases and worksheets, the Story Bank, synced lessons.
  const scenarios = await getAllScenarios()
  for (const ref of scenarios) add(scenarioHref(ref), ref.updated)
  add(STORY_BANK.href, (await getStoryBank())?.updated)
  const lessons = getLearnManifest()
  for (const lesson of lessons) if (lesson.kind === 'sync') add(lesson.href, lesson.updated)
  // A `live` lesson is a case or worksheet page; it changes when that page does.
  const lessonDate = new Map(lessons.map((l) => [l.slug, l.updated ?? dated.get(l.href)]))

  // Indexes: the newest date among their items.
  const moduleDate = new Map<string, string | undefined>()
  const dateOf = (m: CurriculumModule) => newest([...m.lessons, ...m.seeAlso].map((s) => lessonDate.get(s)))
  for (const track of getTracks()) {
    const mods = trackModules(track)
    for (const mod of mods) {
      moduleDate.set(mod.slug, dateOf(mod))
      // Planned modules have no lessons yet, so they stay out of search (FV-03).
      if (mod.status !== 'coming-soon' && mod.status !== 'on-hold') add(learnHref.module(mod), moduleDate.get(mod.slug))
    }
    add(learnHref.track(track.slug), newest(mods.map((m) => moduleDate.get(m.slug))))
  }
  // Coming soon groups have no page, so only live groups are listed.
  for (const g of liveGroups()) add(groupHref(g.slug), newest(g.tracks.map((t) => dated.get(learnHref.track(t)))))
  add('/learn', newest(learnTracks().map((t) => dated.get(learnHref.track(t.slug)))))
  // Planned rounds have no page, so only live rounds are listed.
  for (const r of liveRounds()) {
    const lessons = [...r.practise.flatMap((g) => g.lessons), ...r.mocks]
    add(roundHref(r.slug), newest([...lessons.map((s) => lessonDate.get(s)), ...r.study.map((s) => moduleDate.get(s))]))
  }
  for (const path of PATHS) add(`/start/paths/${path.id}`, newest(Object.keys(path.moduleFlags).map((s) => moduleDate.get(s))))
  add('/start', newest([...moduleDate.values()]))
  for (const area of new Set(Object.values(MODULE_AREAS))) {
    add(area, newest(scenarios.filter((s) => MODULE_AREAS[s.moduleId] === area).map((s) => s.updated)))
  }
  add('/practice', dated.get(STORY_BANK.href))

  // Pages with no source of their own change with a release.
  const release = newest(CHANGELOG.map((e) => e.date))
  for (const path of ['/library', '/library/credits', '/about', '/changelog', '/glossary']) add(path, release)
  add('/', newest([...dated.values()]))

  return [...dated].map(([path, date]) => ({ url: absoluteUrl(path), lastModified: date ?? release }))
}
