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

/**
 * Area-track modules whose pages live in another area: the technical worksheets are
 * listed under /practice, so the interview sidebar and its previous/next links skip
 * them. The module, its id and its progress keys are unchanged.
 */
export const LISTED_ELSEWHERE = new Set(['case-study-worksheets'])

/** Whether a track is listed and served under /learn. */
export const isLearnTrack = (track: string): boolean => !(track in AREA_TRACKS)

/**
 * Codes show only as small tags on Learn cards, lists and eyebrows (ENH-20): a module's
 * T-code ("T2.4") or a track's ("T2"). Area-served tracks show none; their I codes mean
 * nothing on their own.
 */
export const moduleTag = (m: { track: string; code: string }) => (isLearnTrack(m.track) ? m.code : null)
export const trackTag = (t: { slug: string; code: string }) => (isLearnTrack(t.slug) ? t.code : null)

/** An interview round (plan Part 4). A static `rounds` segment, because /interview/[moduleSlug] is taken. */
export const roundHref = (slug: string) => `/interview/rounds/${slug}`

/**
 * Modules whose own page moved into an area index: worksheets are listed on /practice,
 * and the scenario library lives in Casebook. These modules keep their ids and lesson
 * references for saved progress, and their old URLs redirect (src/lib/redirects.ts).
 */
export const MODULE_HOMES: Record<string, string> = {
  [`${INTERVIEW_TRACK}/case-study-worksheets`]: '/practice',
  'ai-systems-design/scenario-library': '/design',
}

/** The URL of a track, a module in it, or a lesson in that module. */
export function curriculumHref(track: string, moduleSlug?: string, lessonSlug?: string): string {
  const home = moduleSlug && !lessonSlug ? MODULE_HOMES[`${track}/${moduleSlug}`] : undefined
  if (home) return home
  const base = AREA_TRACKS[track] ?? `/learn/${track}`
  return [base, moduleSlug, lessonSlug].filter(Boolean).join('/')
}
