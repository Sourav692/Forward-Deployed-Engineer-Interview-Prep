/**
 * Where a curriculum track, module or lesson is served.
 *
 * Most tracks live under `/learn/<track>/<module>/<lesson>`. A few are served by
 * their own area instead, without the track segment: the interview practice track
 * (worksheets, mock interviews, final week) lives under `/interview/<module>/<lesson>`.
 * The track keeps its id, so saved progress (`fd:v1:*`) is unaffected.
 *
 * Imported by the app, the `.mjs` sync scripts and `next.config.ts`, so it has no
 * runtime imports.
 */

/** The interview practice track, served under /interview. */
export const INTERVIEW_TRACK = 'interview-practice'

/** Track slug → base path, for tracks served outside /learn. */
export const AREA_TRACKS: Record<string, string> = {
  [INTERVIEW_TRACK]: '/interview',
}

/** Whether a track is listed and served under /learn. */
export const isLearnTrack = (track: string): boolean => !(track in AREA_TRACKS)

/**
 * Codes show only as small tags on Learn cards, lists and eyebrows (ENH-20): a module's
 * T-code ("T2.4") or a track's ("T2"). Area-served tracks show none; their I codes mean
 * nothing on their own.
 */
export const moduleTag = (m: { track: string; code: string }) => (isLearnTrack(m.track) ? m.code : null)
export const trackTag = (t: { slug: string; code: string }) => (isLearnTrack(t.slug) ? t.code : null)

/** An interview topic hub (FE-18). A static `hubs` segment, because /interview/[moduleSlug] is taken. */
export const hubHref = (slug: string) => `/interview/hubs/${slug}`

/**
 * Modules whose own page moved into an area index (ENH-17): the I1 worksheet lessons are
 * listed on /practice. The module keeps its id and lessons, so progress is unchanged, and
 * its old URL redirects (src/lib/redirects.ts).
 */
export const MODULE_HOMES: Record<string, string> = {
  [`${INTERVIEW_TRACK}/case-study-worksheets`]: '/practice',
}

/** The URL of a track, a module in it, or a lesson in that module. */
export function curriculumHref(track: string, moduleSlug?: string, lessonSlug?: string): string {
  const home = moduleSlug && !lessonSlug ? MODULE_HOMES[`${track}/${moduleSlug}`] : undefined
  if (home) return home
  const base = AREA_TRACKS[track] ?? `/learn/${track}`
  return [base, moduleSlug, lessonSlug].filter(Boolean).join('/')
}
