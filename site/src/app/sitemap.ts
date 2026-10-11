import type { MetadataRoute } from 'next'
import { getAllScenarios } from '@/lib/content'
import { STORY_BANK } from '@/lib/editorial'
import { INTERVIEW_HUBS } from '@/lib/curriculum'
import { hubHref } from '@/lib/curriculum-href'
import { getLearnManifest, getTracks, learnHref, trackModules } from '@/lib/learn'
import { PATHS } from '@/lib/paths'
import { MODULES } from '@/lib/registry'
import { MODULE_AREAS, scenarioHref } from '@/lib/scenario'
import { absoluteUrl } from '@/lib/seo'

/**
 * `/sitemap.xml` (plan §11, SEO-01): every public, static page. Learner-only pages
 * (`/progress`, `/settings`) are left out; `robots.ts` disallows them too. So are
 * `/company-prep` and planned modules, which have no content yet. Built once at build
 * time like any other static route.
 */

/** Top-level pages. Some are built by parallel Phase 1 workstreams. */
const STATIC_PAGES = [
  '/',
  '/start',
  '/learn',
  '/design',
  '/practice',
  '/interview',
  '/library',
  '/library/credits',
  '/about',
  '/changelog',
  '/glossary',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = new Set<string>(STATIC_PAGES)

  for (const path of PATHS) paths.add(`/start/paths/${path.id}`)
  for (const hub of INTERVIEW_HUBS) paths.add(hubHref(hub.slug))
  for (const track of getTracks()) {
    paths.add(learnHref.track(track.slug))
    for (const mod of trackModules(track)) {
      // Planned modules have no lessons yet, so they stay out of search (FV-03).
      if (mod.status !== 'coming-soon' && mod.status !== 'on-hold') paths.add(learnHref.module(mod))
    }
  }
  for (const lesson of getLearnManifest()) {
    if (lesson.kind === 'sync') paths.add(lesson.href)
  }

  for (const mod of MODULES) {
    if (mod.status === 'live' && !(mod.id in MODULE_AREAS)) paths.add(`/modules/${mod.id}`)
  }
  for (const ref of await getAllScenarios()) paths.add(scenarioHref(ref))
  paths.add(STORY_BANK.href)


  return [...paths].map((path) => ({ url: absoluteUrl(path) }))
}
