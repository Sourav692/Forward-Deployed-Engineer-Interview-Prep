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

/** The URL of a track, a module in it, or a lesson in that module. */
export function curriculumHref(track: string, moduleSlug?: string, lessonSlug?: string): string {
  const base = AREA_TRACKS[track] ?? `/learn/${track}`
  return [base, moduleSlug, lessonSlug].filter(Boolean).join('/')
}
