/**
 * Retired lesson keys for T0 (orientation), merged into `RENAMED` in curriculum.ts.
 * Key: `<moduleSlug>/<lessonSlug>` of a lesson that was published and is now retired.
 * Value: the `<moduleSlug>/<lessonSlug>` that now teaches it, or `null` when withdrawn.
 * next.config.ts turns every entry into a permanent redirect. One file per track keeps
 * parallel consolidation PRs from editing the same lines.
 */
export const RENAMED_T0: Record<string, string | null> = {
  // T0.1 consolidated into three lessons (.website_spec/consolidation/T0-T1-T9.md).
  'how-the-platform-works/how-to-use-this-handbook': 'how-the-platform-works/how-the-material-is-built',
  'how-the-platform-works/repository-coverage-guide': 'how-the-platform-works/find-material-by-interview-area',
  // T0.2 consolidated into four lessons.
  'the-fde-role/the-three-roles': 'the-fde-role/three-roles-three-questions',
  'the-fde-role/senior-fde-day-to-day': 'the-fde-role/a-senior-fdes-day',
  // T0.3 consolidated into two lessons.
  'first-ten-minutes/the-first-ten-minutes': 'first-ten-minutes/ask-before-you-architect',
}
